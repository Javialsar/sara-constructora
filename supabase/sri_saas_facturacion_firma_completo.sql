-- =========================================================================================
-- ECOSISTEMA GRUPO SARA — MÓDULO SAAS DE FACTURACIÓN ELECTRÓNICA, FIRMA DIGITAL & IMPUESTOS
-- Normativa Legal: SRI Ecuador (LRTI, IVA 5%/15%, Retenciones IR/IVA, ISD, XAdES-BES, Módulo 11)
-- Modelos Comerciales: Pases On-Demand (Día, Semana, Mes), Bolsas Prepago y Venta de Firmas ECI
-- SCRIPT 100% IDEMPOTENTE Y AUTO-MIGRATORIO (Safe Run sobre esquemas previos)
-- =========================================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================================
-- 2. TABLAS ESTRUCTURALES DEL SAAS TRIBUTARIO (Con auto-migración de columnas)
-- =========================================================================================

-- 2.1 Tenants / Empresas y Profesionales Emisores
CREATE TABLE IF NOT EXISTS public.sri_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruc VARCHAR(13) NOT NULL UNIQUE,
    razon_social TEXT NOT NULL,
    nombre_comercial TEXT,
    direccion_matriz TEXT NOT NULL,
    contribuyente_especial_num VARCHAR(15),
    obligado_contabilidad BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS regimen_tributario VARCHAR(50) DEFAULT 'GENERAL';
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS agente_retencion_resolucion TEXT;
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS ambiente VARCHAR(1) NOT NULL DEFAULT '1';
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS tipo_emision VARCHAR(1) NOT NULL DEFAULT '1';
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS correo_notificaciones TEXT DEFAULT 'facturacion@gruposara.com';
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(20);
ALTER TABLE public.sri_tenants ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- 2.2 Bóveda de Certificados de Firma Electrónica (.p12 / PKCS#12)
CREATE TABLE IF NOT EXISTS public.sri_certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.sri_tenants(id) ON DELETE CASCADE,
    archivo_p12_cifrado BYTEA NOT NULL,
    clave_p12_cifrada TEXT NOT NULL,
    emisor_cert TEXT,
    sujeto_cert TEXT,
    valido_desde TIMESTAMPTZ NOT NULL,
    valido_hasta TIMESTAMPTZ NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Establecimientos y Puntos de Emisión (Secuenciadores Atómicos)
CREATE TABLE IF NOT EXISTS public.sri_puntos_emision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.sri_tenants(id) ON DELETE CASCADE,
    cod_establecimiento VARCHAR(3) NOT NULL,
    cod_punto_emision VARCHAR(3) NOT NULL,
    direccion_establecimiento TEXT NOT NULL,
    secuencial_factura INT NOT NULL DEFAULT 0,
    secuencial_retencion INT NOT NULL DEFAULT 0,
    secuencial_nota_credito INT NOT NULL DEFAULT 0,
    secuencial_nota_debito INT NOT NULL DEFAULT 0,
    secuencial_guia_remision INT NOT NULL DEFAULT 0,
    secuencial_liquidacion INT NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, cod_establecimiento, cod_punto_emision)
);

-- 2.4 Catálogo Maestro de Planes SaaS (Tiempos, Bolsas y Firmas)
CREATE TABLE IF NOT EXISTS public.sri_planes_saas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    tipo_plan VARCHAR(50) NOT NULL,
    precio_usd NUMERIC(10, 2) NOT NULL,
    duracion_dias INT DEFAULT 0,
    limite_documentos INT DEFAULT 0,
    incluye_firma_electronica BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-inyección de columnas para planes existentes
ALTER TABLE public.sri_planes_saas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE public.sri_planes_saas ADD COLUMN IF NOT EXISTS vigencia_firma_anios INT DEFAULT 0;
ALTER TABLE public.sri_planes_saas ADD COLUMN IF NOT EXISTS beneficios JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.sri_planes_saas ADD COLUMN IF NOT EXISTS tipo_plan VARCHAR(50) DEFAULT 'DOCUMENTOS';

-- 2.5 Billetera y Suscripciones Activas del Usuario
CREATE TABLE IF NOT EXISTS public.sri_subscripciones_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES public.sri_tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.sri_planes_saas(id),
    tipo_plan VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVO',
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    documentos_totales INT DEFAULT 0,
    documentos_consumidos INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sri_subscripciones_usuario ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.sri_subscripciones_usuario ADD COLUMN IF NOT EXISTS transaccion_pago_id TEXT;
ALTER TABLE public.sri_subscripciones_usuario ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2.6 Registro de Venta y Gestión de Firmas Electrónicas (AR Partner)
CREATE TABLE IF NOT EXISTS public.sri_solicitudes_firmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tipo_persona VARCHAR(20) NOT NULL DEFAULT 'NATURAL',
    identificacion VARCHAR(13) NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT,
    correo TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    vigencia_anios INT NOT NULL DEFAULT 1,
    formato_entrega VARCHAR(20) NOT NULL DEFAULT 'NUBE_Y_ARCHIVO',
    estado_solicitud VARCHAR(50) NOT NULL DEFAULT 'PAGO_PENDIENTE',
    eci_proveedor VARCHAR(50) NOT NULL DEFAULT 'UANATACA',
    eci_transaction_id TEXT,
    documento_cedula_url TEXT,
    video_selfie_url TEXT,
    certificado_id UUID REFERENCES public.sri_certificados(id) ON DELETE SET NULL,
    monto_cobrado_usd NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sri_solicitudes_firmas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.sri_solicitudes_firmas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.sri_tenants(id) ON DELETE SET NULL;
ALTER TABLE public.sri_solicitudes_firmas ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE public.sri_solicitudes_firmas ADD COLUMN IF NOT EXISTS transaccion_pago_ref TEXT;
ALTER TABLE public.sri_solicitudes_firmas ADD COLUMN IF NOT EXISTS observaciones_rechazo TEXT;

-- 2.7 Comprobantes Electrónicos Emitidos (Cabecera General)
CREATE TABLE IF NOT EXISTS public.sri_comprobantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.sri_tenants(id) ON DELETE CASCADE,
    punto_emision_id UUID NOT NULL REFERENCES public.sri_puntos_emision(id),
    modulo_origen VARCHAR(50) NOT NULL,
    transaccion_origen_id TEXT,
    tipo_comprobante VARCHAR(2) NOT NULL,
    establecimiento VARCHAR(3) NOT NULL,
    punto_emision VARCHAR(3) NOT NULL,
    secuencial VARCHAR(9) NOT NULL,
    clave_acceso VARCHAR(49) NOT NULL UNIQUE,
    fecha_emision DATE NOT NULL,
    cliente_identificacion VARCHAR(20) NOT NULL,
    cliente_tipo_id VARCHAR(2) NOT NULL,
    cliente_razon_social TEXT NOT NULL,
    cliente_direccion TEXT,
    cliente_email TEXT NOT NULL,
    subtotal_iva_cero NUMERIC(14, 2) DEFAULT 0.00,
    subtotal_iva_cinco NUMERIC(14, 2) DEFAULT 0.00,
    subtotal_iva_ocho NUMERIC(14, 2) DEFAULT 0.00,
    subtotal_iva_quince NUMERIC(14, 2) DEFAULT 0.00,
    monto_iva NUMERIC(14, 2) DEFAULT 0.00,
    monto_total NUMERIC(14, 2) NOT NULL,
    monto_isd NUMERIC(14, 2) DEFAULT 0.00,
    estado_sri VARCHAR(50) NOT NULL DEFAULT 'CREADO',
    numero_autorizacion VARCHAR(49),
    fecha_autorizacion TIMESTAMPTZ,
    mensajes_error_sri JSONB,
    xml_generado TEXT,
    xml_firmado TEXT,
    xml_autorizado TEXT,
    notificado_email BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, tipo_comprobante, establecimiento, punto_emision, secuencial)
);

ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS cliente_telefono VARCHAR(30);
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS subtotal_sin_impuestos NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS monto_ice NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS total_retencion_ir NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS total_retencion_iva NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS total_retencion_isd NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS ride_pdf_url TEXT;
ALTER TABLE public.sri_comprobantes ADD COLUMN IF NOT EXISTS fecha_notificacion_email TIMESTAMPTZ;

-- 2.8 Detalles / Ítems de la Factura
CREATE TABLE IF NOT EXISTS public.sri_comprobante_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprobante_id UUID NOT NULL REFERENCES public.sri_comprobantes(id) ON DELETE CASCADE,
    codigo_principal VARCHAR(50) NOT NULL,
    codigo_auxiliar VARCHAR(50),
    descripcion TEXT NOT NULL,
    cantidad NUMERIC(14, 4) NOT NULL,
    precio_unitario NUMERIC(14, 4) NOT NULL,
    descuento NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    precio_total_sin_impuesto NUMERIC(14, 2) NOT NULL,
    tarifa_iva_pct NUMERIC(5, 2) NOT NULL,
    monto_iva NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Detalle de Retenciones Aplicadas
CREATE TABLE IF NOT EXISTS public.sri_comprobante_retenciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprobante_id UUID NOT NULL REFERENCES public.sri_comprobantes(id) ON DELETE CASCADE,
    codigo_impuesto VARCHAR(2) NOT NULL,
    codigo_retencion VARCHAR(10) NOT NULL,
    base_imponible NUMERIC(14, 2) NOT NULL,
    porcentaje_retener NUMERIC(6, 2) NOT NULL,
    valor_retenido NUMERIC(14, 2) NOT NULL,
    documento_sustento_tipo VARCHAR(2),
    documento_sustento_num VARCHAR(17),
    documento_sustento_fecha DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 Guía de Remisión (Para Transporte SARA-FLETES)
CREATE TABLE IF NOT EXISTS public.sri_guia_remision_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprobante_id UUID NOT NULL REFERENCES public.sri_comprobantes(id) ON DELETE CASCADE,
    dir_partida TEXT NOT NULL,
    dir_llegada TEXT NOT NULL,
    fecha_inicio_transporte DATE NOT NULL,
    fecha_fin_transporte DATE NOT NULL,
    placa_vehiculo VARCHAR(20) NOT NULL,
    ruc_transportista VARCHAR(13) NOT NULL,
    razon_social_transportista TEXT NOT NULL,
    motivo_traslado TEXT NOT NULL,
    ruta TEXT,
    codigo_establecimiento_destino VARCHAR(3),
    doc_aduanero_unico TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 Bitácora de Transmisión y Auditoría SOAP SRI
CREATE TABLE IF NOT EXISTS public.sri_transmisiones_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprobante_id UUID REFERENCES public.sri_comprobantes(id) ON DELETE CASCADE,
    servicio VARCHAR(50) NOT NULL,
    ambiente VARCHAR(1) NOT NULL DEFAULT '1',
    endpoint_url TEXT NOT NULL,
    payload_enviado TEXT,
    respuesta_recibida TEXT,
    codigo_estado_sri VARCHAR(20),
    mensaje_error TEXT,
    tiempo_respuesta_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================================
-- 3. ÍNDICES DE RENDIMIENTO
-- =========================================================================================
CREATE INDEX IF NOT EXISTS idx_sri_comp_clave ON public.sri_comprobantes(clave_acceso);
CREATE INDEX IF NOT EXISTS idx_sri_comp_tenant_estado ON public.sri_comprobantes(tenant_id, estado_sri);
CREATE INDEX IF NOT EXISTS idx_sri_comp_origen ON public.sri_comprobantes(modulo_origen, transaccion_origen_id);
CREATE INDEX IF NOT EXISTS idx_sri_comp_cliente ON public.sri_comprobantes(cliente_identificacion);
CREATE INDEX IF NOT EXISTS idx_sri_sub_tenant_estado ON public.sri_subscripciones_usuario(tenant_id, estado);
CREATE INDEX IF NOT EXISTS idx_sri_puntos_estab ON public.sri_puntos_emision(tenant_id, cod_establecimiento, cod_punto_emision);

-- =========================================================================================
-- 4. PROCEDIMIENTOS ALMACENADOS Y FUNCIONES ATÓMICAS NATIVAS
-- =========================================================================================

-- 4.1 Algoritmo Módulo 11 (Ponderación 7,6,5,4,3,2) para Clave de Acceso
CREATE OR REPLACE FUNCTION public.fn_sri_calcular_modulo_11(p_base_48 TEXT)
RETURNS INT AS $$
DECLARE
    v_suma INT := 0;
    v_factor INT := 2;
    v_i INT;
    v_digito INT;
    v_residuo INT;
    v_dv INT;
BEGIN
    IF LENGTH(p_base_48) <> 48 THEN
        RAISE EXCEPTION 'La base para el algoritmo Módulo 11 debe tener exactamente 48 dígitos.';
    END IF;

    FOR v_i IN REVERSE 48..1 LOOP
        v_digito := CAST(SUBSTRING(p_base_48 FROM v_i FOR 1) AS INT);
        v_suma := v_suma + (v_digito * v_factor);
        IF v_factor = 7 THEN
            v_factor := 2;
        ELSE
            v_factor := v_factor + 1;
        END IF;
    END LOOP;

    v_residuo := v_suma % 11;
    v_dv := 11 - v_residuo;

    IF v_dv = 11 THEN
        v_dv := 0;
    ELSIF v_dv = 10 THEN
        v_dv := 1;
    END IF;

    RETURN v_dv;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4.2 Generador Oficial de Clave de Acceso de 49 Dígitos
CREATE OR REPLACE FUNCTION public.fn_sri_generar_clave_acceso(
    p_fecha DATE,
    p_tipo_comp VARCHAR(2),
    p_ruc VARCHAR(13),
    p_ambiente VARCHAR(1),
    p_estab VARCHAR(3),
    p_pto VARCHAR(3),
    p_secuencial VARCHAR(9),
    p_codigo_num VARCHAR(8)
) RETURNS VARCHAR(49) AS $$
DECLARE
    v_fecha_str VARCHAR(8);
    v_base_48 VARCHAR(48);
    v_dv INT;
BEGIN
    v_fecha_str := TO_CHAR(p_fecha, 'DDMMYYYY');
    v_base_48 := v_fecha_str || LPAD(p_tipo_comp, 2, '0') || LPAD(p_ruc, 13, '0') || 
                 p_ambiente || LPAD(p_estab, 3, '0') || LPAD(p_pto, 3, '0') || 
                 LPAD(p_secuencial, 9, '0') || LPAD(p_codigo_num, 8, '0') || '1';
    
    v_dv := public.fn_sri_calcular_modulo_11(v_base_48);
    RETURN v_base_48 || CAST(v_dv AS VARCHAR(1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4.3 Asignación Concurrente y Atómica de Secuencial Fiscal (SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION public.fn_sri_asignar_siguiente_secuencial(
    p_tenant_id UUID,
    p_punto_emision_id UUID,
    p_tipo_comp VARCHAR(2)
) RETURNS VARCHAR(9) AS $$
DECLARE
    v_siguiente INT;
BEGIN
    PERFORM 1 FROM public.sri_puntos_emision 
    WHERE id = p_punto_emision_id AND tenant_id = p_tenant_id 
    FOR UPDATE;

    IF p_tipo_comp = '01' THEN
        UPDATE public.sri_puntos_emision 
        SET secuencial_factura = secuencial_factura + 1 
        WHERE id = p_punto_emision_id 
        RETURNING secuencial_factura INTO v_siguiente;
    ELSIF p_tipo_comp = '07' THEN
        UPDATE public.sri_puntos_emision 
        SET secuencial_retencion = secuencial_retencion + 1 
        WHERE id = p_punto_emision_id 
        RETURNING secuencial_retencion INTO v_siguiente;
    ELSIF p_tipo_comp = '04' THEN
        UPDATE public.sri_puntos_emision 
        SET secuencial_nota_credito = secuencial_nota_credito + 1 
        WHERE id = p_punto_emision_id 
        RETURNING secuencial_nota_credito INTO v_siguiente;
    ELSIF p_tipo_comp = '05' THEN
        UPDATE public.sri_puntos_emision 
        SET secuencial_nota_debito = secuencial_nota_debito + 1 
        WHERE id = p_punto_emision_id 
        RETURNING secuencial_nota_debito INTO v_siguiente;
    ELSIF p_tipo_comp = '06' THEN
        UPDATE public.sri_puntos_emision 
        SET secuencial_guia_remision = secuencial_guia_remision + 1 
        WHERE id = p_punto_emision_id 
        RETURNING secuencial_guia_remision INTO v_siguiente;
    ELSIF p_tipo_comp = '03' THEN
        UPDATE public.sri_puntos_emision 
        SET secuencial_liquidacion = secuencial_liquidacion + 1 
        WHERE id = p_punto_emision_id 
        RETURNING secuencial_liquidacion INTO v_siguiente;
    ELSE
        RAISE EXCEPTION 'Tipo de comprobante inválido: %', p_tipo_comp;
    END IF;

    RETURN LPAD(CAST(v_siguiente AS VARCHAR), 9, '0');
END;
$$ LANGUAGE plpgsql;

-- 4.4 Consumo Atómico de Crédito o Validación de Pase Temporal
CREATE OR REPLACE FUNCTION public.fn_sri_consumir_credito_facturacion(
    p_tenant_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_sub_id UUID;
    v_tipo VARCHAR(50);
    v_consumidos INT;
    v_totales INT;
    v_fin TIMESTAMPTZ;
BEGIN
    SELECT id, tipo_plan, fecha_fin
    INTO v_sub_id, v_tipo, v_fin
    FROM public.sri_subscripciones_usuario
    WHERE tenant_id = p_tenant_id 
      AND estado = 'ACTIVO' 
      AND (tipo_plan = 'TIEMPO' OR tipo_plan = 'MIXTO')
      AND (fecha_fin IS NULL OR fecha_fin > NOW())
    ORDER BY fecha_fin DESC 
    LIMIT 1;

    IF FOUND THEN
        RETURN TRUE;
    END IF;

    SELECT id, tipo_plan, documentos_consumidos, documentos_totales
    INTO v_sub_id, v_tipo, v_consumidos, v_totales
    FROM public.sri_subscripciones_usuario
    WHERE tenant_id = p_tenant_id 
      AND estado = 'ACTIVO' 
      AND tipo_plan = 'DOCUMENTOS' 
      AND documentos_consumidos < documentos_totales
    ORDER BY fecha_inicio ASC 
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
        UPDATE public.sri_subscripciones_usuario
        SET documentos_consumidos = documentos_consumidos + 1,
            estado = CASE WHEN documentos_consumidos + 1 >= documentos_totales THEN 'AGOTADO' ELSE 'ACTIVO' END,
            updated_at = NOW()
        WHERE id = v_sub_id;

        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 4.5 Activación Inmediata de Suscripciones o Pases tras Pago Exitoso
CREATE OR REPLACE FUNCTION public.fn_sri_activar_plan(
    p_user_id UUID,
    p_tenant_id UUID,
    p_codigo_plan VARCHAR(50),
    p_transaccion_ref TEXT
) RETURNS UUID AS $$
DECLARE
    v_plan RECORD;
    v_nueva_sub_id UUID;
    v_fecha_fin TIMESTAMPTZ := NULL;
BEGIN
    SELECT * INTO v_plan FROM public.sri_planes_saas WHERE codigo = p_codigo_plan AND activo = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan no encontrado o inactivo: %', p_codigo_plan;
    END IF;

    IF v_plan.duracion_dias > 0 THEN
        v_fecha_fin := NOW() + (v_plan.duracion_dias || ' days')::INTERVAL;
    END IF;

    INSERT INTO public.sri_subscripciones_usuario (
        user_id,
        tenant_id,
        plan_id,
        tipo_plan,
        estado,
        fecha_inicio,
        fecha_fin,
        documentos_totales,
        documentos_consumidos,
        transaccion_pago_id
    ) VALUES (
        p_user_id,
        p_tenant_id,
        v_plan.id,
        v_plan.tipo_plan,
        'ACTIVO',
        NOW(),
        v_fecha_fin,
        v_plan.limite_documentos,
        0,
        p_transaccion_ref
    ) RETURNING id INTO v_nueva_sub_id;

    RETURN v_nueva_sub_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================================
-- 5. SEGURIDAD Y POLÍTICAS ROW LEVEL SECURITY (RLS) ZERO-TRUST
-- =========================================================================================
ALTER TABLE public.sri_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_puntos_emision ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_planes_saas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_subscripciones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_solicitudes_firmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_comprobante_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_comprobante_retenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_guia_remision_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sri_transmisiones_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Planes SaaS visibles para todos" ON public.sri_planes_saas;
DROP POLICY IF EXISTS "Tenant accesibles por su creador" ON public.sri_tenants;
DROP POLICY IF EXISTS "Puntos de emision accesibles por dueno de tenant" ON public.sri_puntos_emision;
DROP POLICY IF EXISTS "Comprobantes visibles por dueno de tenant" ON public.sri_comprobantes;
DROP POLICY IF EXISTS "Suscripciones visibles por usuario dueno" ON public.sri_subscripciones_usuario;
DROP POLICY IF EXISTS "Solicitudes firma visibles por usuario dueno" ON public.sri_solicitudes_firmas;

CREATE POLICY "Planes SaaS visibles para todos" ON public.sri_planes_saas
    FOR SELECT TO authenticated USING (activo = true);

CREATE POLICY "Tenant accesibles por su creador" ON public.sri_tenants
    FOR ALL TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Puntos de emision accesibles por dueno de tenant" ON public.sri_puntos_emision
    FOR ALL TO authenticated 
    USING (tenant_id IN (SELECT id FROM public.sri_tenants WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Comprobantes visibles por dueno de tenant" ON public.sri_comprobantes
    FOR ALL TO authenticated 
    USING (tenant_id IN (SELECT id FROM public.sri_tenants WHERE user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Suscripciones visibles por usuario dueno" ON public.sri_subscripciones_usuario
    FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Solicitudes firma visibles por usuario dueno" ON public.sri_solicitudes_firmas
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- =========================================================================================
-- 6. SEED DATA: CATÁLOGO DE PLANES OFICIALES PARA PROFESIONALES Y EMPRESAS
-- =========================================================================================
INSERT INTO public.sri_planes_saas (codigo, nombre, descripcion, tipo_plan, precio_usd, duracion_dias, limite_documentos, incluye_firma_electronica, vigencia_firma_anios, beneficios)
VALUES
(
    'PLAN_DAY_PASS',
    'Pase Diario (24 Horas)',
    'Emisión ilimitada durante 24 horas continuas. Ideal para liquidar trabajos urgentes, eventos o consultorías de fin de semana.',
    'TIEMPO',
    1.50,
    1,
    0,
    false,
    0,
    '["Emisión ilimitada por 24h", "Facturas y Retenciones", "RIDE PDF con QR oficial", "Envío automático por correo", "Soporte WhatsApp Express"]'::jsonb
),
(
    'PLAN_WEEK_PASS',
    'Pase Semanal (7 Días)',
    'Emisión ilimitada durante 7 días. Diseñado para profesionales, inspectores y fiscalizadores con contratos por hito.',
    'TIEMPO',
    4.50,
    7,
    0,
    false,
    0,
    '["Emisión ilimitada por 7 días", "Facturas, Retenciones y Guías", "Catálogo rápido de clientes", "RIDE PDF descargable", "Envío automático por email"]'::jsonb
),
(
    'PLAN_PREPAGO_15',
    'Bolsa Prepago Micro (15 Documentos)',
    '15 comprobantes electrónicos sin fecha de caducidad. Perfecto para profesionales independientes de baja rotación.',
    'DOCUMENTOS',
    3.99,
    0,
    15,
    false,
    0,
    '["15 Comprobantes sin caducidad", "Facturas, Notas de Crédito, Retenciones", "Portal de consulta para tus clientes", "Cero mensualidades obligatorias"]'::jsonb
),
(
    'PLAN_PREPAGO_60',
    'Bolsa Prepago Estándar (60 Documentos)',
    '60 comprobantes electrónicos sin caducidad. Diseñado para ingenieros, transportistas y técnicos activos.',
    'DOCUMENTOS',
    11.99,
    0,
    60,
    false,
    0,
    '["60 Comprobantes sin caducidad", "Acceso móvil PWA", "Múltiples tarifas de IVA (0%, 5%, 8%, 15%)", "Reportes mensuales para declaración SRI"]'::jsonb
),
(
    'PLAN_MENSUAL_PRO',
    'Plan Mensual Profesional Ilimitado',
    'Facturación ilimitada mensual, proformas, cotizaciones y módulo de cuentas por cobrar.',
    'TIEMPO',
    7.99,
    30,
    0,
    false,
    0,
    '["Facturación ilimitada", "Catálogo ilimitado de clientes y servicios", "Reportes automáticos ATS SRI", "Exportación a Excel", "Soporte técnico prioritario"]'::jsonb
),
(
    'PLAN_ANUAL_FIRMA_FREE',
    'Plan Anual Corporativo + Firma Electrónica Gratis',
    'Suscripción anual ilimitada con emisión de Certificado de Firma Electrónica (.p12 de 1 año) incluida sin costo adicional.',
    'MIXTO',
    59.99,
    365,
    0,
    true,
    1,
    '["Facturación ilimitada por 365 días", "FIRMA ELECTRÓNICA DE 1 AÑO INCLUIDA GRATIS", "Bóveda cifrada AES-256 Cloud", "Integración con los 8 módulos SARA", "Soporte tributario VIP"]'::jsonb
),
(
    'FIRMA_SOLA_1_ANIO',
    'Firma Electrónica Persona Natural / Jurídica (1 Año)',
    'Emisión legal de firma electrónica en archivo .p12 con validez jurídica ante SRI, Quipux y Contratos.',
    'VENTA_FIRMA',
    18.00,
    365,
    0,
    true,
    1,
    '["Válida por 1 año", "Formato .p12 para facturar o firmar PDFs", "Acreditada ante ARCOTEL", "Emisión en menos de 30 minutos con biometría"]'::jsonb
),
(
    'FIRMA_SOLA_2_ANIOS',
    'Firma Electrónica Persona Natural / Jurídica (2 Años)',
    'Emisión de certificado digital de firma electrónica con vigencia de 2 años.',
    'VENTA_FIRMA',
    30.00,
    730,
    0,
    true,
    2,
    '["Válida por 2 años", "Mayor ahorro anual", "Formato .p12 descargable y en nube", "Acreditada ante ARCOTEL"]'::jsonb
)
ON CONFLICT (codigo) DO UPDATE 
SET precio_usd = EXCLUDED.precio_usd,
    descripcion = EXCLUDED.descripcion,
    beneficios = EXCLUDED.beneficios;
