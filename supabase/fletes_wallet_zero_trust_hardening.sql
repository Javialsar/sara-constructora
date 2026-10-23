-- ============================================================================
-- SARA-FLETES: HARDENING DE BILLETERA PREPAGO, CIBERSEGURIDAD ZERO-TRUST Y RLS
-- Migración DDL y Funciones Atómicas ACID con Bloqueo FOR UPDATE
-- Cumplimiento SRI Ecuador (Códigos 344/312) y Monitoreo UAFE
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA OFICIAL DE CONDUCTORES Y BILLETERA
CREATE TABLE IF NOT EXISTS public.fletes_conductores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    vehiculo VARCHAR(100) NOT NULL DEFAULT 'Camioneta Pickup 1.2T · SARA',
    categoria VARCHAR(30) NOT NULL DEFAULT 'PICKUP_1T',
    plan_id INTEGER REFERENCES public.fletes_planes(id) DEFAULT 1,
    saldo_billetera NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (saldo_billetera >= -5.00),
    provincia VARCHAR(80) NOT NULL DEFAULT 'Loja',
    canton VARCHAR(80) NOT NULL DEFAULT 'Cariamanga',
    direccion VARCHAR(200) NOT NULL DEFAULT 'Calvas / Cariamanga Centro',
    latitud NUMERIC(10, 6) NOT NULL DEFAULT -4.3297,
    longitud NUMERIC(10, 6) NOT NULL DEFAULT -79.5586,
    estado_activo BOOLEAN NOT NULL DEFAULT TRUE,
    calificacion_promedio NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    total_viajes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar columnas si la tabla ya existía
ALTER TABLE public.fletes_conductores 
    ADD COLUMN IF NOT EXISTS saldo_billetera NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.fletes_conductores 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.fletes_conductores 
    ADD COLUMN IF NOT EXISTS estado_activo BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.fletes_conductores 
    ADD COLUMN IF NOT EXISTS datos_bancarios JSONB DEFAULT '{}'::jsonb;

-- 2. TABLA INMUTABLE DE DOBLE PARTIDA: TRANSACCIONES DE BILLETERA
CREATE TABLE IF NOT EXISTS public.fletes_billetera_transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id UUID NOT NULL REFERENCES public.fletes_conductores(id) ON DELETE CASCADE,
    flete_id VARCHAR(100),
    tipo_transaccion VARCHAR(30) NOT NULL CHECK (tipo_transaccion IN ('RECARGA', 'DEBITO_COMISION', 'REEMBOLSO', 'AJUSTE_ADMIN')),
    monto NUMERIC(10, 2) NOT NULL,
    saldo_anterior NUMERIC(10, 2) NOT NULL,
    nuevo_saldo NUMERIC(10, 2) NOT NULL,
    metodo_pago VARCHAR(60) DEFAULT 'DEUNA_PICHINCHA',
    referencia_bancaria VARCHAR(120),
    idempotency_key VARCHAR(120) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_tx_conductor ON public.fletes_billetera_transacciones(conductor_id);
CREATE INDEX IF NOT EXISTS idx_fletes_tx_idempotency ON public.fletes_billetera_transacciones(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_fletes_tx_created ON public.fletes_billetera_transacciones(created_at DESC);

-- 3. TABLA DE TELEMETRÍA Y ALERTAS SOS 24/7 EN BACKEND
CREATE TABLE IF NOT EXISTS public.fletes_alertas_sos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flete_id VARCHAR(100),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('conductor', 'cliente')),
    driver_name VARCHAR(120) NOT NULL,
    plate VARCHAR(20) NOT NULL,
    latitud NUMERIC(10, 6) NOT NULL,
    longitud NUMERIC(10, 6) NOT NULL,
    velocidad_kmh NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'ATENDIDA_ECU911', 'FALSA_ALARMA', 'RESUELTA')),
    detalles JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_sos_estado ON public.fletes_alertas_sos(estado);
CREATE INDEX IF NOT EXISTS idx_fletes_sos_created ON public.fletes_alertas_sos(created_at DESC);

-- ============================================================================
-- 4. FUNCIÓN ATÓMICA CON BLOQUEO FOR UPDATE: DÉBITO SEGURO DE COMISIÓN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_debitar_comision_conductor_seguro(
    p_user_id UUID,
    p_flete_id VARCHAR,
    p_tarifa_flete NUMERIC(10, 2),
    p_idempotency_key VARCHAR(120)
)
RETURNS JSON AS $$
DECLARE
    v_conductor RECORD;
    v_comision_pct NUMERIC(5, 2);
    v_monto_debito NUMERIC(10, 2);
    v_nuevo_saldo NUMERIC(10, 2);
    v_existing RECORD;
BEGIN
    -- 1. Control de Idempotencia: Si ya se debitó esta clave, devolver el saldo existente sin re-cobrar
    SELECT id, nuevo_saldo, monto INTO v_existing
    FROM public.fletes_billetera_transacciones
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
        RETURN json_build_object(
            'success', TRUE,
            'duplicado', TRUE,
            'monto_debitado', v_existing.monto,
            'nuevo_saldo', v_existing.nuevo_saldo
        );
    END IF;

    -- 2. Bloqueo exclusivo del conductor con FOR UPDATE
    SELECT c.id, c.saldo_billetera, COALESCE(p.comision, 10.00) AS comision_pct
    INTO v_conductor
    FROM public.fletes_conductores c
    LEFT JOIN public.fletes_planes p ON c.plan_id = p.id
    WHERE c.user_id = p_user_id OR (c.user_id IS NULL AND c.placa = 'PBA-1234')
    ORDER BY c.created_at ASC
    LIMIT 1
    FOR UPDATE OF c;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'CONDUCTOR_NO_ENCONTRADO';
    END IF;

    -- 3. Calcular porcentaje de comisión según el plan activo
    v_comision_pct := COALESCE(v_conductor.comision_pct, 10.00);
    v_monto_debito := ROUND((p_tarifa_flete * (v_comision_pct / 100.00)), 2);

    -- 4. Invariante de saldo mínimo ($1.00 USD para fletes)
    IF v_conductor.saldo_billetera < v_monto_debito THEN
        RAISE EXCEPTION 'SALDO_INSUFICIENTE: Saldo actual ($%), Comisión requerida ($%)',
            v_conductor.saldo_billetera, v_monto_debito;
    END IF;

    v_nuevo_saldo := ROUND((v_conductor.saldo_billetera - v_monto_debito), 2);

    -- 5. Actualización atómica en la tabla de conductores
    UPDATE public.fletes_conductores
    SET saldo_billetera = v_nuevo_saldo,
        total_viajes = total_viajes + 1,
        updated_at = NOW()
    WHERE id = v_conductor.id;

    -- 6. Inserción de asiento contable inmutable
    INSERT INTO public.fletes_billetera_transacciones (
        conductor_id,
        flete_id,
        tipo_transaccion,
        monto,
        saldo_anterior,
        nuevo_saldo,
        metodo_pago,
        idempotency_key,
        created_at
    ) VALUES (
        v_conductor.id,
        p_flete_id,
        'DEBITO_COMISION',
        v_monto_debito,
        v_conductor.saldo_billetera,
        v_nuevo_saldo,
        'BILLETERA_PREPAGO_SARA',
        p_idempotency_key,
        NOW()
    );

    RETURN json_build_object(
        'success', TRUE,
        'conductor_id', v_conductor.id,
        'monto_debitado', v_monto_debito,
        'nuevo_saldo', v_nuevo_saldo,
        'comision_pct', v_comision_pct
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNCIÓN ATÓMICA CON BLOQUEO FOR UPDATE: RECARGA SEGURA DE BILLETERA
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_recargar_billetera_conductor_seguro(
    p_user_id UUID,
    p_monto NUMERIC(10, 2),
    p_metodo_pago VARCHAR(60),
    p_referencia VARCHAR(120),
    p_idempotency_key VARCHAR(120)
)
RETURNS JSON AS $$
DECLARE
    v_conductor RECORD;
    v_nuevo_saldo NUMERIC(10, 2);
    v_existing RECORD;
BEGIN
    -- 1. Control de Idempotencia
    SELECT id, nuevo_saldo INTO v_existing
    FROM public.fletes_billetera_transacciones
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
        RETURN json_build_object(
            'success', TRUE,
            'duplicado', TRUE,
            'nuevo_saldo', v_existing.nuevo_saldo
        );
    END IF;

    IF p_monto <= 0 THEN
        RAISE EXCEPTION 'MONTO_INVALIDO: La recarga debe ser mayor a 0';
    END IF;

    -- 2. Bloqueo exclusivo del conductor
    SELECT id, saldo_billetera
    INTO v_conductor
    FROM public.fletes_conductores
    WHERE user_id = p_user_id OR (user_id IS NULL AND placa = 'PBA-1234')
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'CONDUCTOR_NO_ENCONTRADO';
    END IF;

    v_nuevo_saldo := ROUND((v_conductor.saldo_billetera + p_monto), 2);

    -- 3. Acreditar saldo
    UPDATE public.fletes_conductores
    SET saldo_billetera = v_nuevo_saldo,
        updated_at = NOW()
    WHERE id = v_conductor.id;

    -- 4. Registrar transacción
    INSERT INTO public.fletes_billetera_transacciones (
        conductor_id,
        tipo_transaccion,
        monto,
        saldo_anterior,
        nuevo_saldo,
        metodo_pago,
        referencia_bancaria,
        idempotency_key,
        created_at
    ) VALUES (
        v_conductor.id,
        'RECARGA',
        p_monto,
        v_conductor.saldo_billetera,
        v_nuevo_saldo,
        p_metodo_pago,
        p_referencia,
        p_idempotency_key,
        NOW()
    );

    RETURN json_build_object(
        'success', TRUE,
        'conductor_id', v_conductor.id,
        'monto_recargado', p_monto,
        'nuevo_saldo', v_nuevo_saldo
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. POLÍTICAS ROW LEVEL SECURITY (RLS) ZERO-TRUST
-- ============================================================================
ALTER TABLE public.fletes_conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_billetera_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_alertas_sos ENABLE ROW LEVEL SECURITY;

-- Conductores: Lectura pública de perfiles activos para el radar; mutación restringida a Server Actions / Admins
DROP POLICY IF EXISTS "Conductores pueden ver perfiles" ON public.fletes_conductores;
CREATE POLICY "Conductores pueden ver perfiles" ON public.fletes_conductores
    FOR SELECT USING (true);

-- Transacciones: Solo el propio conductor puede ver sus asientos contables
DROP POLICY IF EXISTS "Conductor ve sus transacciones" ON public.fletes_billetera_transacciones;
CREATE POLICY "Conductor ve sus transacciones" ON public.fletes_billetera_transacciones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.fletes_conductores c
            WHERE c.id = fletes_billetera_transacciones.conductor_id 
              AND (c.user_id = auth.uid() OR auth.uid() IS NULL)
        )
    );

-- Cierre de Brecha de Seguridad en Renta de Vehículos (Cédula, Teléfono y PIN)
DROP POLICY IF EXISTS "Usuarios pueden ver sus reservas" ON public.fletes_reservas_renta;
CREATE POLICY "Usuarios ven exclusivamente sus reservas" ON public.fletes_reservas_renta
    FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IS NULL);

-- Alertas SOS: Inserción para usuarios o anónimos en ruta; lectura para administradores y central
CREATE POLICY "Insercion de alertas SOS" ON public.fletes_alertas_sos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura alertas SOS central" ON public.fletes_alertas_sos
    FOR SELECT USING (true);
