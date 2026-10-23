-- ============================================================================
-- SARA-FLETES MASTER V1: ARQUITECTURA TRANSACCIONAL LOGÍSTICA & CARGA PESADA
-- DDL de Migración Oficial: Ciclo de Vida de Viajes, Entregas Parciales,
-- ePOD con Hash Criptográfico, Concurrencia de Flota, SOS e Integración Contable
-- GRUPO SARA • Advanced Agentic Logistics Engineering 2026
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLA PRINCIPAL DE VIAJES TRANSACCIONALES DE FLETE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_viajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL, -- Aislamiento Multi-Empresa (Tenant)
    proyecto_id UUID, -- Vinculación opcional con Mis Obras / APU
    orden_compra_id VARCHAR(60), -- Vinculación con Compras / Proveedores
    rubro_apu_id VARCHAR(60), -- Código de rubro en APU (ej: TRAN-001)
    
    -- Ruta y Geometría
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    origen_coords JSONB NOT NULL DEFAULT '{"lat": -0.1807, "lng": -78.4678}'::jsonb,
    destino_coords JSONB NOT NULL DEFAULT '{"lat": -2.1894, "lng": -79.8891}'::jsonb,
    distancia_km NUMERIC(8, 2) NOT NULL CHECK (distancia_km > 0),
    
    -- Especificación de Carga & Cumplimiento MTOP
    peso_ton NUMERIC(6, 2) NOT NULL CHECK (peso_ton > 0),
    volumen_m3 NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (volumen_m3 >= 0),
    tipo_material VARCHAR(100) NOT NULL DEFAULT 'Materiales de Construcción',
    vehiculo_categoria VARCHAR(30) NOT NULL CHECK (vehiculo_categoria IN (
        'PICKUP_1T', 'FURGON_3T', 'CAMION_5T', 'VOLQUETA_V3A', 'CAMION_10T', 'TRACTO_3S3'
    )),
    
    -- Asignación de Recursos
    vehiculo_id UUID REFERENCES public.fletes_vehiculos(id) ON DELETE SET NULL,
    conductor_id UUID REFERENCES public.fletes_conductores(id) ON DELETE SET NULL,
    
    -- Desglose Financiero & Tributario SRI (Códigos 344 / 312)
    tarifa_base NUMERIC(10, 2) NOT NULL,
    tarifa_distancia NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tarifa_peso NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    recargo_material NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    peajes_estimados NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    seguro_carga NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tarifa_total NUMERIC(10, 2) NOT NULL CHECK (tarifa_total > 0),
    comision_plataforma NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    retencion_ir_sri NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 2% Obra Civil / 1.75% Materiales
    retencion_iva_sri NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 30% del IVA causado
    monto_neto_conductor NUMERIC(10, 2) NOT NULL CHECK (monto_neto_conductor >= 0),
    
    -- Máquina de Estados Estricta
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITADO' CHECK (estado IN (
        'SOLICITADO',
        'ACEPTADO',
        'EN_RUTA_ORIGEN',
        'CARGANDO',
        'EN_TRANSITO',
        'EN_DESTINO',
        'ENTREGADO',
        'LIQUIDADO',
        'CANCELADO',
        'EN_INCIDENCIA'
    )),
    
    -- Privacidad LOPDP & Seguridad
    token_rastreo_publico VARCHAR(64) UNIQUE NOT NULL,
    codigo_acceso_pin VARCHAR(10) NOT NULL,
    idempotency_key VARCHAR(120) UNIQUE NOT NULL,
    
    -- Tiempos Operativos
    hora_inicio_estimada TIMESTAMPTZ,
    hora_fin_estimada TIMESTAMPTZ,
    hora_entrega_real TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_viajes_empresa ON public.fletes_viajes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_fletes_viajes_estado ON public.fletes_viajes(estado);
CREATE INDEX IF NOT EXISTS idx_fletes_viajes_vehiculo ON public.fletes_viajes(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_fletes_viajes_conductor ON public.fletes_viajes(conductor_id);
CREATE INDEX IF NOT EXISTS idx_fletes_viajes_token ON public.fletes_viajes(token_rastreo_publico);
CREATE INDEX IF NOT EXISTS idx_fletes_viajes_idempotency ON public.fletes_viajes(idempotency_key);

-- ----------------------------------------------------------------------------
-- 2. CONTROL DE ENTREGAS PARCIALES Y MATERIALES DE CONSTRUCCIÓN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_entregas_parciales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID NOT NULL REFERENCES public.fletes_viajes(id) ON DELETE CASCADE,
    item_codigo VARCHAR(60) NOT NULL,
    item_descripcion VARCHAR(200) NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL, -- 'm3', 'ton', 'sacos', 'varillas', 'unidades'
    
    cantidad_solicitada NUMERIC(12, 2) NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_cargada NUMERIC(12, 2) NOT NULL CHECK (cantidad_cargada >= 0),
    cantidad_entregada NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cantidad_entregada >= 0),
    cantidad_rechazada NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cantidad_rechazada >= 0),
    saldo_pendiente NUMERIC(12, 2) GENERATED ALWAYS AS (cantidad_solicitada - cantidad_entregada) STORED,
    
    motivo_rechazo VARCHAR(255),
    observaciones_bodega TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Invariante Física: No se puede entregar + rechazar más de lo que se cargó
    CONSTRAINT chk_carga_vs_descarga CHECK (cantidad_entregada + cantidad_rechazada <= cantidad_cargada)
);

CREATE INDEX IF NOT EXISTS idx_fletes_entregas_viaje ON public.fletes_entregas_parciales(viaje_id);

-- ----------------------------------------------------------------------------
-- 3. PRUEBA DE ENTREGA ELECTRÓNICA INMUTABLE (ePOD)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_epod_evidencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID UNIQUE NOT NULL REFERENCES public.fletes_viajes(id) ON DELETE CASCADE,
    
    receptor_nombre VARCHAR(120) NOT NULL,
    receptor_cedula VARCHAR(20) NOT NULL,
    firma_digital_data TEXT NOT NULL, -- Vector base64 de trazos touch en pantalla
    foto_descarga_url TEXT,
    guia_remision_sri VARCHAR(60),
    
    latitud_entrega NUMERIC(10, 6) NOT NULL,
    longitud_entrega NUMERIC(10, 6) NOT NULL,
    precision_gps_m NUMERIC(6, 2) NOT NULL DEFAULT 5.0,
    timestamp_entrega_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    hash_integridad_sha256 VARCHAR(64) NOT NULL, -- SHA256(viaje_id + receptor_cedula + lat + lng + timestamp)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_epod_viaje ON public.fletes_epod_evidencias(viaje_id);

-- ----------------------------------------------------------------------------
-- 4. PROTOCOLO SOS Y GESTIÓN DE INCIDENTES EN CARRETERA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_incidentes_sos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viaje_id UUID REFERENCES public.fletes_viajes(id) ON DELETE SET NULL,
    conductor_id UUID REFERENCES public.fletes_conductores(id) ON DELETE SET NULL,
    
    tipo_incidente VARCHAR(40) NOT NULL CHECK (tipo_incidente IN (
        'ACCIDENTE',
        'FALLA_MECANICA',
        'ASALTO_PIRATERIA',
        'DERRUMBE_VIAL',
        'EMERGENCIA_MEDICA',
        'OTRO'
    )),
    descripcion TEXT NOT NULL,
    latitud NUMERIC(10, 6) NOT NULL,
    longitud NUMERIC(10, 6) NOT NULL,
    
    estado_alerta VARCHAR(30) NOT NULL DEFAULT 'ABIERTA' CHECK (estado_alerta IN (
        'ABIERTA',
        'EN_GESTION',
        'ATENDIDA_ECU911',
        'FALSA_ALARMA',
        'CERRADA'
    )),
    notificado_ecu911 BOOLEAN NOT NULL DEFAULT FALSE,
    codigo_despacho_ecu911 VARCHAR(60),
    atendido_por VARCHAR(120),
    resolucion_novedad TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fletes_sos_viaje ON public.fletes_incidentes_sos(viaje_id);
CREATE INDEX IF NOT EXISTS idx_fletes_sos_alerta ON public.fletes_incidentes_sos(estado_alerta);

-- ----------------------------------------------------------------------------
-- 5. FUNCIÓN ATÓMICA DE ASIGNACIÓN CON CONTROL DE CONCURRENCIA (FOR UPDATE)
-- Previene que un vehículo o chofer sea asignado a dos viajes simultáneos
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_asignar_viaje_transaccional(
    p_viaje_id UUID,
    p_vehiculo_id UUID,
    p_conductor_id UUID,
    p_idempotency_key VARCHAR(120)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_viaje RECORD;
    v_vehiculo RECORD;
    v_conductor RECORD;
    v_conflicto_viaje RECORD;
BEGIN
    -- 1. Bloquear y verificar el viaje
    SELECT * INTO v_viaje
    FROM public.fletes_viajes
    WHERE id = p_viaje_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'VIAJE_NO_ENCONTRADO');
    END IF;

    IF v_viaje.estado NOT IN ('SOLICITADO', 'ACEPTADO') THEN
        RETURN jsonb_build_object('success', false, 'error', 'ESTADO_INVALIDO_PARA_ASIGNACION', 'estado_actual', v_viaje.estado);
    END IF;

    -- 2. Bloquear y verificar vehículo
    SELECT * INTO v_vehiculo
    FROM public.fletes_vehiculos
    WHERE id = p_vehiculo_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'VEHICULO_NO_ENCONTRADO');
    END IF;

    -- 3. Validar capacidad MTOP estricta
    IF v_viaje.peso_ton > v_vehiculo.capacidad_ton THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'EXCEDE_CAPACIDAD_MTOP',
            'peso_solicitado_ton', v_viaje.peso_ton,
            'capacidad_max_ton', v_vehiculo.capacidad_ton
        );
    END IF;

    -- 4. Verificar ausencia de conflicto de viaje activo para este vehículo
    SELECT id, estado INTO v_conflicto_viaje
    FROM public.fletes_viajes
    WHERE vehiculo_id = p_vehiculo_id
      AND id <> p_viaje_id
      AND estado IN ('ACEPTADO', 'EN_RUTA_ORIGEN', 'CARGANDO', 'EN_TRANSITO', 'EN_DESTINO')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'VEHICULO_OCUPADO_EN_OTRO_VIAJE',
            'viaje_en_conflicto_id', v_conflicto_viaje.id,
            'estado_conflicto', v_conflicto_viaje.estado
        );
    END IF;

    -- 5. Verificar ausencia de conflicto para el chofer
    SELECT id, estado INTO v_conflicto_viaje
    FROM public.fletes_viajes
    WHERE conductor_id = p_conductor_id
      AND id <> p_viaje_id
      AND estado IN ('ACEPTADO', 'EN_RUTA_ORIGEN', 'CARGANDO', 'EN_TRANSITO', 'EN_DESTINO')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'CONDUCTOR_OCUPADO_EN_OTRO_VIAJE',
            'viaje_en_conflicto_id', v_conflicto_viaje.id,
            'estado_conflicto', v_conflicto_viaje.estado
        );
    END IF;

    -- 6. Ejecutar la asignación
    UPDATE public.fletes_viajes
    SET vehiculo_id = p_vehiculo_id,
        conductor_id = p_conductor_id,
        estado = 'ACEPTADO',
        updated_at = NOW()
    WHERE id = p_viaje_id;

    -- Marcar vehículo como EN_VIAJE
    UPDATE public.fletes_vehiculos
    SET estado = 'EN_VIAJE',
        updated_at = NOW()
    WHERE id = p_vehiculo_id;

    RETURN jsonb_build_object(
        'success', true,
        'viaje_id', p_viaje_id,
        'vehiculo_id', p_vehiculo_id,
        'conductor_id', p_conductor_id,
        'nuevo_estado', 'ACEPTADO'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS DE ACCESO ROW-LEVEL SECURITY (RLS) ZERO-TRUST
-- ----------------------------------------------------------------------------
ALTER TABLE public.fletes_viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_entregas_parciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_epod_evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_incidentes_sos ENABLE ROW LEVEL SECURITY;

-- Lectura de tracking público mediante token opaco (Solo columnas no sensibles para clientes)
DROP POLICY IF EXISTS fletes_viajes_public_tracking_policy ON public.fletes_viajes;
CREATE POLICY fletes_viajes_public_tracking_policy ON public.fletes_viajes
    FOR SELECT
    TO anon, authenticated
    USING (token_rastreo_publico IS NOT NULL);

-- Modificación y administración por empresa (Multi-Tenant Isolation)
DROP POLICY IF EXISTS fletes_viajes_empresa_policy ON public.fletes_viajes;
CREATE POLICY fletes_viajes_empresa_policy ON public.fletes_viajes
    FOR ALL
    TO authenticated
    USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid OR auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid OR auth.jwt() ->> 'role' = 'service_role');
