-- ==============================================================================
-- GRUPO SARA - ECOSISTEMA CONSTRUCTORA AVANZADO (POSTGRESQL / SUPABASE DDL)
-- ==============================================================================
-- Módulo Estrella:
-- 1. Bodegas y Kardex Multibodega con Costo Promedio Ponderado (CPP) Automático
-- 2. Facturación Electrónica SRI (Ficha Técnica v2.21), XAdES-BES & Three-Way Match
-- 3. Retenciones Tributarias Oficiales (Códigos 312, 344, 303, IVA 30%/70%/100%)
-- 4. Contabilidad Gubernamental / Financiera con Cuentas Puente y Centros de Costos
-- 5. Nómina y Tareo IESS Sector Construcción (Aporte Patronal 12.15%, Décimos, Fondos)
-- 6. Base de Conocimiento Vectorial Compartida y Cola de Eventos Transaccionales
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLA: BODEGAS (Matriz Central y Sub-bodegas de Obras)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bodegas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('matriz', 'obra_subbodega', 'transito')),
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE NULL,
    provincia VARCHAR(50) NOT NULL DEFAULT 'Pichincha',
    canton VARCHAR(100) NOT NULL DEFAULT 'Quito',
    direccion TEXT,
    responsable_nombre VARCHAR(150),
    responsable_telefono VARCHAR(50),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bodegas_proyecto ON public.bodegas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_bodegas_tipo ON public.bodegas(tipo);

-- ==============================================================================
-- 2. TABLA: KARDEX MULTIBODEGA (Saldos y Costos Promedio por Bodega e Insumo)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kardex_multibodega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bodega_id UUID NOT NULL REFERENCES public.bodegas(id) ON DELETE RESTRICT,
    insumo_id UUID NOT NULL REFERENCES public.insumos(id) ON DELETE RESTRICT,
    saldo_cantidad NUMERIC(12,4) NOT NULL DEFAULT 0.0000 CHECK (saldo_cantidad >= 0),
    costo_promedio_ponderado NUMERIC(12,4) NOT NULL DEFAULT 0.0000 CHECK (costo_promedio_ponderado >= 0),
    costo_total NUMERIC(14,4) NOT NULL DEFAULT 0.0000 CHECK (costo_total >= 0),
    stock_seguridad_dinamico NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    punto_reorden NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    lote_economico_eoq NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    merma_acumulada NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bodega_insumo UNIQUE (bodega_id, insumo_id)
);

CREATE INDEX IF NOT EXISTS idx_kardex_bodega ON public.kardex_multibodega(bodega_id);
CREATE INDEX IF NOT EXISTS idx_kardex_insumo ON public.kardex_multibodega(insumo_id);

-- ==============================================================================
-- 3. TABLA: KARDEX MOVIMIENTOS (Libro Mayor de Inventarios y Trazabilidad Inversa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kardex_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_movimiento SERIAL UNIQUE,
    bodega_origen_id UUID REFERENCES public.bodegas(id) ON DELETE RESTRICT NULL,
    bodega_destino_id UUID REFERENCES public.bodegas(id) ON DELETE RESTRICT NULL,
    insumo_id UUID NOT NULL REFERENCES public.insumos(id) ON DELETE RESTRICT,
    tipo_movimiento VARCHAR(40) NOT NULL CHECK (tipo_movimiento IN (
        'ingreso_compra',
        'transferencia_salida',
        'transferencia_ingreso',
        'consumo_obra',
        'merma_tecnica',
        'ajuste_inventario'
    )),
    cantidad NUMERIC(12,4) NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(12,4) NOT NULL CHECK (costo_unitario >= 0),
    costo_total NUMERIC(14,4) NOT NULL CHECK (costo_total >= 0),
    saldo_resultante_cantidad NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    saldo_resultante_cpp NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    referencia_tipo VARCHAR(50) NOT NULL CHECK (referencia_tipo IN (
        'factura_sri',
        'orden_compra',
        'vale_distribucion',
        'acta_merma',
        'ajuste_manual'
    )),
    referencia_id UUID NULL,
    factura_sri_id UUID NULL, -- Clave para Trazabilidad Inversa exacta
    autor_id UUID NULL,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_insumo ON public.kardex_movimientos(insumo_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_factura ON public.kardex_movimientos(factura_sri_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON public.kardex_movimientos(created_at DESC);

-- ==============================================================================
-- 4. TABLA: ORDENES DE COMPRA PROCURADAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.compras_ordenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE RESTRICT,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    bodega_destino_id UUID NOT NULL REFERENCES public.bodegas(id) ON DELETE RESTRICT,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'borrador' CHECK (estado IN (
        'borrador', 'aprobada', 'recibida_parcial', 'recibida_total', 'anulada'
    )),
    subtotal NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    descuento NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    flete NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    iva NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    total NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata_procura JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_proveedor ON public.compras_ordenes(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_proyecto ON public.compras_ordenes(proyecto_id);

-- ==============================================================================
-- 5. TABLA: FACTURAS ELECTRONICAS SRI (Con Hash SHA-256 y Firma XAdES-BES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.facturas_sri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave_acceso VARCHAR(49) UNIQUE NOT NULL CHECK (length(clave_acceso) = 49),
    numero_comprobante VARCHAR(20) NOT NULL, -- Ej: 001-002-000123456
    ruc_emisor VARCHAR(13) NOT NULL CHECK (length(ruc_emisor) = 13),
    razon_social_emisor TEXT NOT NULL,
    nombre_comercial_emisor TEXT,
    tipo_emisor VARCHAR(50) DEFAULT 'REGIMEN_GENERAL' CHECK (tipo_emisor IN (
        'REGIMEN_GENERAL', 'CONTRIBUYENTE_ESPECIAL', 'GRAN_CONTRIBUYENTE', 'RIMPE_EMPRENDEDOR', 'RIMPE_POPULAR'
    )),
    fecha_emision DATE NOT NULL,
    subtotal_15 NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    subtotal_5 NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    subtotal_0 NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    subtotal_no_objeto NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    total_descuento NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    subtotal_sin_impuestos NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    iva_total NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    propina NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    importe_total NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    detalles JSONB NOT NULL DEFAULT '[]'::jsonb,
    xml_raw TEXT NOT NULL,
    xml_hash VARCHAR(64) NOT NULL, -- SHA-256 para integridad criptográfica
    firma_digital_xades_valida BOOLEAN NOT NULL DEFAULT FALSE,
    estado_validacion VARCHAR(30) NOT NULL DEFAULT 'recibida' CHECK (estado_validacion IN (
        'recibida', 'matched', 'discrepancia', 'contabilizada', 'anulada'
    )),
    matching_metadata JSONB DEFAULT '{}'::jsonb,
    orden_compra_id UUID REFERENCES public.compras_ordenes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facturas_clave ON public.facturas_sri(clave_acceso);
CREATE INDEX IF NOT EXISTS idx_facturas_ruc ON public.facturas_sri(ruc_emisor);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON public.facturas_sri(estado_validacion);

-- ==============================================================================
-- 6. TABLA: RETENCIONES SRI EMITIDAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.retenciones_sri_emitidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_sri_id UUID NOT NULL REFERENCES public.facturas_sri(id) ON DELETE RESTRICT,
    clave_acceso VARCHAR(49) UNIQUE NOT NULL,
    numero_retencion VARCHAR(20) NOT NULL,
    codigo_retencion_renta VARCHAR(10) NOT NULL, -- 312 (1.75% materiales), 344 (1.75% contratos constr), 303 (10% honorarios)
    base_imponible_renta NUMERIC(12,4) NOT NULL,
    porcentaje_renta NUMERIC(5,2) NOT NULL,
    valor_retenido_renta NUMERIC(12,4) NOT NULL,
    codigo_retencion_iva VARCHAR(10) NOT NULL, -- 30% bienes, 70% servicios/construcción, 100% profesionales
    base_imponible_iva NUMERIC(12,4) NOT NULL,
    porcentaje_iva NUMERIC(5,2) NOT NULL,
    valor_retenido_iva NUMERIC(12,4) NOT NULL,
    total_retenido NUMERIC(12,4) NOT NULL,
    valor_neto_pagar NUMERIC(12,4) NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'emitida' CHECK (estado IN ('emitida', 'autorizada_sri', 'anulada')),
    xml_retencion_firmado TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retenciones_factura ON public.retenciones_sri_emitidas(factura_sri_id);

-- ==============================================================================
-- 7. TABLAS CONTABLES: PLAN DE CUENTAS, CENTROS DE COSTO Y ASIENTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contabilidad_plan_cuentas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_cuenta VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo_cuenta VARCHAR(30) NOT NULL CHECK (tipo_cuenta IN ('activo', 'pasivo', 'patrimonio', 'ingreso', 'costo', 'gasto')),
    naturaleza VARCHAR(20) NOT NULL CHECK (naturaleza IN ('deudora', 'acreedora')),
    es_cuenta_puente BOOLEAN NOT NULL DEFAULT FALSE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contabilidad_centros_costos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('obra', 'administrativo', 'almacen_central', 'maquinaria')),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contabilidad_asientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_asiento SERIAL UNIQUE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    glosa TEXT NOT NULL,
    origen_tipo VARCHAR(40) NOT NULL CHECK (origen_tipo IN (
        'factura_sri',
        'kardex_distribucion',
        'nomina_iess',
        'ajuste_cierre',
        'pago_proveedor'
    )),
    origen_id UUID NULL,
    centro_costo_id UUID REFERENCES public.contabilidad_centros_costos(id) ON DELETE SET NULL,
    total_debe NUMERIC(14,4) NOT NULL DEFAULT 0.0000,
    total_haber NUMERIC(14,4) NOT NULL DEFAULT 0.0000,
    cuadrado BOOLEAN GENERATED ALWAYS AS (ABS(total_debe - total_haber) < 0.0001) STORED,
    creado_por UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contabilidad_asientos_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asiento_id UUID NOT NULL REFERENCES public.contabilidad_asientos(id) ON DELETE CASCADE,
    cuenta_id UUID NOT NULL REFERENCES public.contabilidad_plan_cuentas(id) ON DELETE RESTRICT,
    debito NUMERIC(14,4) NOT NULL DEFAULT 0.0000 CHECK (debito >= 0),
    credito NUMERIC(14,4) NOT NULL DEFAULT 0.0000 CHECK (credito >= 0),
    centro_costo_id UUID REFERENCES public.contabilidad_centros_costos(id) ON DELETE SET NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_asientos_origen ON public.contabilidad_asientos(origen_tipo, origen_id);
CREATE INDEX IF NOT EXISTS idx_asientos_fecha ON public.contabilidad_asientos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_detalles_asiento ON public.contabilidad_asientos_detalles(asiento_id);

-- ==============================================================================
-- 8. TABLAS: NOMINA Y TAREO IESS SECTOR CONSTRUCCION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.nomina_tareos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    trabajador_id UUID NOT NULL REFERENCES public.trabajadores(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    horas_normales NUMERIC(5,2) NOT NULL DEFAULT 8.00 CHECK (horas_normales >= 0 AND horas_normales <= 24),
    horas_suplementarias NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (horas_suplementarias >= 0),
    horas_extraordinarias NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (horas_extraordinarias >= 0),
    rubro_apu_codigo VARCHAR(50), -- Asignación analítica de mano de obra
    validado_residente BOOLEAN NOT NULL DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tareo_trabajador_dia UNIQUE (proyecto_id, trabajador_id, fecha)
);

CREATE TABLE IF NOT EXISTS public.nomina_liquidaciones_mensuales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trabajador_id UUID NOT NULL REFERENCES public.trabajadores(id) ON DELETE RESTRICT,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio INTEGER NOT NULL CHECK (anio >= 2024),
    sueldo_basico_unificado NUMERIC(10,2) NOT NULL DEFAULT 470.00,
    dias_laborados INTEGER NOT NULL DEFAULT 30 CHECK (dias_laborados >= 0 AND dias_laborados <= 30),
    ingreso_horas_ordinarias NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ingreso_horas_suplementarias NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ingreso_horas_extraordinarias NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_ingresos_gravados NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    aporte_personal_iess NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- 9.45%
    aporte_patronal_iess NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- 11.15% o 12.15% sector construcción
    fondo_reserva_provision NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- 8.33%
    decimo_tercero_provision NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- 1/12
    decimo_cuarto_provision NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- 1 SBU / 12
    vacaciones_provision NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- 1/24
    costo_empresa_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    neto_a_recibir NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'calculado' CHECK (estado IN ('calculado', 'aprobado', 'pagado')),
    asiento_contable_id UUID REFERENCES public.contabilidad_asientos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_liquidacion_periodo UNIQUE (trabajador_id, mes, anio)
);

CREATE INDEX IF NOT EXISTS idx_tareo_fecha ON public.nomina_tareos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_liquidaciones_periodo ON public.nomina_liquidaciones_mensuales(anio, mes);

-- ==============================================================================
-- 9. TABLA: BASE DE CONOCIMIENTO VECTORIAL COMPARTIDA (Collective Learning)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sara_vector_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(50) NOT NULL, -- 'material_prices', 'supplier_tariffs', 'freight_rates', 'productivity_yields'
    item_key VARCHAR(100) NOT NULL UNIQUE, -- Ej: 'cemento_holcim_fuerte_50kg', 'acero_adelca_12mm'
    content_summary TEXT NOT NULL,
    current_price NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    previous_price NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    variance_pct NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    sample_size INTEGER NOT NULL DEFAULT 1,
    confidence_level NUMERIC(4,3) NOT NULL DEFAULT 0.950,
    affected_projects UUID[] DEFAULT ARRAY[]::UUID[],
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vector_domain ON public.sara_vector_knowledge(domain);

-- ==============================================================================
-- 10. TRIGGER PL/PGSQL: ACTUALIZACIÓN AUTOMÁTICA DEL KARDEX Y CPP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_kardex_actualizar_cpp_y_saldo()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo_actual NUMERIC(12,4) := 0.0000;
    v_cpp_actual NUMERIC(12,4) := 0.0000;
    v_nuevo_saldo NUMERIC(12,4) := 0.0000;
    v_nuevo_cpp NUMERIC(12,4) := 0.0000;
    v_bodega_afectada UUID;
BEGIN
    -- 1. Determinar bodega a afectar según el tipo de movimiento
    IF NEW.tipo_movimiento IN ('ingreso_compra', 'transferencia_ingreso') THEN
        v_bodega_afectada := NEW.bodega_destino_id;
        
        -- Obtener saldo anterior
        SELECT saldo_cantidad, costo_promedio_ponderado
        INTO v_saldo_actual, v_cpp_actual
        FROM public.kardex_multibodega
        WHERE bodega_id = v_bodega_afectada AND insumo_id = NEW.insumo_id;
        
        IF NOT FOUND THEN
            v_saldo_actual := 0.0000;
            v_cpp_actual := 0.0000;
        END IF;

        -- Cálculo del Costo Promedio Ponderado:
        -- CPP_nuevo = (Saldo_Anterior * CPP_Anterior + Cantidad_Ingreso * Costo_Unitario) / (Saldo_Anterior + Cantidad_Ingreso)
        v_nuevo_saldo := v_saldo_actual + NEW.cantidad;
        IF v_nuevo_saldo > 0 THEN
            v_nuevo_cpp := ((v_saldo_actual * v_cpp_actual) + (NEW.cantidad * NEW.costo_unitario)) / v_nuevo_saldo;
        ELSE
            v_nuevo_cpp := NEW.costo_unitario;
        END IF;

        -- Actualizar o Insertar en kardex_multibodega
        INSERT INTO public.kardex_multibodega (
            bodega_id, insumo_id, saldo_cantidad, costo_promedio_ponderado, costo_total, updated_at
        ) VALUES (
            v_bodega_afectada, NEW.insumo_id, v_nuevo_saldo, v_nuevo_cpp, (v_nuevo_saldo * v_nuevo_cpp), NOW()
        )
        ON CONFLICT (bodega_id, insumo_id) DO UPDATE SET
            saldo_cantidad = EXCLUDED.saldo_cantidad,
            costo_promedio_ponderado = EXCLUDED.costo_promedio_ponderado,
            costo_total = EXCLUDED.costo_total,
            updated_at = NOW();

        -- Guardar snapshots en el movimiento
        NEW.saldo_resultante_cantidad := v_nuevo_saldo;
        NEW.saldo_resultante_cpp := v_nuevo_cpp;

    ELSIF NEW.tipo_movimiento IN ('transferencia_salida', 'consumo_obra', 'merma_tecnica') THEN
        v_bodega_afectada := NEW.bodega_origen_id;
        
        -- Obtener saldo anterior con bloqueo de fila para consistencia transaccional
        SELECT saldo_cantidad, costo_promedio_ponderado
        INTO v_saldo_actual, v_cpp_actual
        FROM public.kardex_multibodega
        WHERE bodega_id = v_bodega_afectada AND insumo_id = NEW.insumo_id
        FOR UPDATE;

        IF NOT FOUND OR v_saldo_actual < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente en bodega % para el insumo %. Saldo disponible: %, Requerido: %',
                v_bodega_afectada, NEW.insumo_id, COALESCE(v_saldo_actual, 0), NEW.cantidad;
        END IF;

        -- Para salidas, el CPP no muta, solo disminuye el saldo
        v_nuevo_saldo := v_saldo_actual - NEW.cantidad;
        v_nuevo_cpp := v_cpp_actual;

        UPDATE public.kardex_multibodega
        SET saldo_cantidad = v_nuevo_saldo,
            costo_total = (v_nuevo_saldo * v_nuevo_cpp),
            updated_at = NOW()
        WHERE bodega_id = v_bodega_afectada AND insumo_id = NEW.insumo_id;

        NEW.costo_unitario := v_cpp_actual;
        NEW.costo_total := (NEW.cantidad * v_cpp_actual);
        NEW.saldo_resultante_cantidad := v_nuevo_saldo;
        NEW.saldo_resultante_cpp := v_nuevo_cpp;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kardex_actualizar_cpp_y_saldo ON public.kardex_movimientos;
CREATE TRIGGER trg_kardex_actualizar_cpp_y_saldo
BEFORE INSERT ON public.kardex_movimientos
FOR EACH ROW
EXECUTE FUNCTION public.fn_kardex_actualizar_cpp_y_saldo();

-- ==============================================================================
-- 11. FUNCIÓN PL/PGSQL: ASIENTO AUTOMÁTICO DE TRANSFERENCIA / DISTRIBUCIÓN
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_generar_asiento_distribucion_bodega(p_movimiento_id UUID)
RETURNS UUID AS $$
DECLARE
    v_mov RECORD;
    v_bodega_dest RECORD;
    v_asiento_id UUID;
    v_cuenta_inventario_matriz UUID;
    v_cuenta_obras_en_curso UUID;
    v_centro_costo_id UUID;
BEGIN
    -- Obtener movimiento
    SELECT * INTO v_mov FROM public.kardex_movimientos WHERE id = p_movimiento_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Movimiento % no encontrado', p_movimiento_id;
    END IF;

    -- Obtener bodega destino y su proyecto asociado
    SELECT * INTO v_bodega_dest FROM public.bodegas WHERE id = v_mov.bodega_destino_id;

    -- Buscar o asociar centro de costo de la obra
    SELECT id INTO v_centro_costo_id 
    FROM public.contabilidad_centros_costos 
    WHERE proyecto_id = v_bodega_dest.proyecto_id
    LIMIT 1;

    -- Obtener cuentas contables oficiales
    SELECT id INTO v_cuenta_inventario_matriz 
    FROM public.contabilidad_plan_cuentas 
    WHERE codigo_cuenta = '1.1.04.01'; -- Inventario Materiales Bodega Matriz

    SELECT id INTO v_cuenta_obras_en_curso 
    FROM public.contabilidad_plan_cuentas 
    WHERE codigo_cuenta = '1.1.05.01'; -- Obras en Curso - Materiales Directos

    -- Crear cabecera de asiento contable
    INSERT INTO public.contabilidad_asientos (
        fecha, glosa, origen_tipo, origen_id, centro_costo_id, total_debe, total_haber
    ) VALUES (
        CURRENT_DATE,
        FORMAT('Despacho de Bodega Matriz a Obra por Vale %s (Insumo: %s, Cant: %s)', 
               v_mov.referencia_id, v_mov.insumo_id, v_mov.cantidad),
        'kardex_distribucion',
        v_mov.id,
        v_centro_costo_id,
        v_mov.costo_total,
        v_mov.costo_total
    ) RETURNING id INTO v_asiento_id;

    -- Detalle 1: Debe -> Obras en Curso (Centro de Costos del Proyecto)
    INSERT INTO public.contabilidad_asientos_detalles (
        asiento_id, cuenta_id, debito, credito, centro_costo_id, descripcion, orden
    ) VALUES (
        v_asiento_id, v_cuenta_obras_en_curso, v_mov.costo_total, 0, v_centro_costo_id, 
        'Capitalización de insumo en obra en curso', 1
    );

    -- Detalle 2: Haber -> Salida de Bodega Central de Activos
    INSERT INTO public.contabilidad_asientos_detalles (
        asiento_id, cuenta_id, debito, credito, centro_costo_id, descripcion, orden
    ) VALUES (
        v_asiento_id, v_cuenta_inventario_matriz, 0, v_mov.costo_total, NULL, 
        'Descargo de stock en Bodega Matriz', 2
    );

    RETURN v_asiento_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 12. SEMILLAS OFICIALES: PLAN DE CUENTAS ESTÁNDAR SRI / NIIF CONSTRUCTORAS
-- ==============================================================================
INSERT INTO public.contabilidad_plan_cuentas (codigo_cuenta, nombre, tipo_cuenta, naturaleza, es_cuenta_puente)
VALUES
    ('1.1.01.01', 'Caja General y Bancos', 'activo', 'deudora', false),
    ('1.1.04.01', 'Inventario Materiales Bodega Matriz (Activo)', 'activo', 'deudora', false),
    ('1.1.04.02', 'Materiales en Tránsito (Cuenta Puente)', 'activo', 'deudora', true),
    ('1.1.05.01', 'Obras en Curso - Materiales Directos', 'activo', 'deudora', false),
    ('1.1.05.02', 'Obras en Curso - Mano de Obra Directa', 'activo', 'deudora', false),
    ('1.1.05.03', 'Obras en Curso - Equipos y Maquinaria', 'activo', 'deudora', false),
    ('1.1.06.01', 'Crédito Tributario IVA Compras 15%', 'activo', 'deudora', false),
    ('2.1.01.01', 'Cuentas por Pagar Proveedores Comerciales', 'pasivo', 'acreedora', false),
    ('2.1.03.01', 'Retenciones en la Fuente Impuesto a la Renta por Pagar', 'pasivo', 'acreedora', false),
    ('2.1.04.01', 'Retenciones en la Fuente IVA por Pagar', 'pasivo', 'acreedora', false),
    ('2.1.05.01', 'Aportaciones al IESS por Pagar (Personal y Patronal)', 'pasivo', 'acreedora', false),
    ('2.1.05.02', 'Provisiones Laborales por Pagar (13vo, 14vo, Fondos)', 'pasivo', 'acreedora', false),
    ('5.1.01.01', 'Costo de Construcción Obra Civil', 'costo', 'deudora', false)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Crear bodega matriz por defecto si no existe
INSERT INTO public.bodegas (codigo, nombre, tipo, provincia, canton, direccion, responsable_nombre)
VALUES ('BOD-MATRIZ-01', 'Bodega Central Matriz GRUPO SARA', 'matriz', 'Pichincha', 'Quito', 'Av. Simón Bolívar y Ruta Viva', 'Ing. Logística Central')
ON CONFLICT (codigo) DO NOTHING;

-- ==============================================================================
-- 13. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.bodegas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kardex_multibodega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kardex_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_sri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retenciones_sri_emitidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contabilidad_plan_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contabilidad_centros_costos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contabilidad_asientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contabilidad_asientos_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nomina_tareos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nomina_liquidaciones_mensuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_vector_knowledge ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura/escritura seguras
CREATE POLICY "Acceso autenticado completo en bodegas" ON public.bodegas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo en kardex_multibodega" ON public.kardex_multibodega FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo en kardex_movimientos" ON public.kardex_movimientos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo en compras_ordenes" ON public.compras_ordenes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo en facturas_sri" ON public.facturas_sri FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo en retenciones_sri_emitidas" ON public.retenciones_sri_emitidas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado lectura plan cuentas" ON public.contabilidad_plan_cuentas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Acceso autenticado completo centros costos" ON public.contabilidad_centros_costos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo asientos" ON public.contabilidad_asientos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo asientos detalles" ON public.contabilidad_asientos_detalles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo nomina_tareos" ON public.nomina_tareos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo nomina_liquidaciones" ON public.nomina_liquidaciones_mensuales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso autenticado completo sara_vector_knowledge" ON public.sara_vector_knowledge FOR ALL TO authenticated USING (true) WITH CHECK (true);
