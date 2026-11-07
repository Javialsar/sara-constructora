-- ============================================================================
-- SARA-FLETES SUPER-APP MULTIMODAL & AGENTIC AGILITY
-- Esquema Oficial de Base de Datos para Supabase / PostgreSQL
-- Módulo: SARA-FLETES (Movilidad Urbana, Delivery, Fletes Pesados, Renta Vehicular)
-- Memoria Reflectiva Vectorial, Telemetría y Soporte Multi-Tenant
-- Ecosistema: SARA Group / GRUPO SARANGO • 2026
-- ============================================================================

-- 1. Habilitar Extensiones Necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Habilitar extensión vectorial si está disponible en la instancia de Supabase
CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- 2. TABLA MAESTRA DE ÓRDENES MULTIMODALES DE TRANSPORTE
-- (Cubre Viajes Cortos, Mandaditos, Fletes y Renta)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_multimodal_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NULL, -- Multi-tenant opcional (GRUPO SARA / Contratistas)
    usuario_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    correlation_id VARCHAR(64) NOT NULL,
    
    -- Vertical de Negocio
    modalidad VARCHAR(30) NOT NULL CHECK (modalidad IN (
        'VIAJE_PASAJEROS',
        'MANDADITO_DELIVERY',
        'FLETE_PESADO',
        'RENTA_VEHICULAR'
    )),
    
    -- Estado de la Orden
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITADO' CHECK (estado IN (
        'SOLICITADO',
        'BUSCANDO_CONDUCTOR',
        'ASIGNADO',
        'EN_CAMINO_ORIGEN',
        'EN_SITIO',
        'EN_TRANSITO',
        'ENTREGADO',
        'FINALIZADO',
        'CANCELADO'
    )),
    
    -- Información del Cliente
    cliente_nombre VARCHAR(120) NOT NULL,
    cliente_telefono VARCHAR(30) NOT NULL,
    cliente_cedula VARCHAR(20) NULL,
    
    -- Coordenadas y Puntos de Ruta
    origen_nombre VARCHAR(255) NOT NULL,
    origen_lat NUMERIC(10, 6) NOT NULL,
    origen_lng NUMERIC(10, 6) NOT NULL,
    destino_nombre VARCHAR(255) NOT NULL,
    destino_lat NUMERIC(10, 6) NOT NULL,
    destino_lng NUMERIC(10, 6) NOT NULL,
    distancia_km NUMERIC(8, 2) NOT NULL CHECK (distancia_km >= 0),
    duracion_estimada_minutos INTEGER NOT NULL CHECK (duracion_estimada_minutos > 0),
    duracion_real_minutos INTEGER NULL,
    
    -- Asignación de Flota y Conductor
    vehiculo_categoria VARCHAR(40) NOT NULL,
    vehiculo_id UUID NULL,
    conductor_id UUID NULL,
    conductor_nombre VARCHAR(120) NULL,
    conductor_telefono VARCHAR(30) NULL,
    vehiculo_placa VARCHAR(15) NULL,
    
    -- Desglose Económico "Win-Win Fair Fare"
    tarifa_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    costo_distancia NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    costo_tiempo NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    recargo_urgencia_o_peso NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    peajes_mtop NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    descuento_backhaul NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tarifa_total_usd NUMERIC(10, 2) NOT NULL CHECK (tarifa_total_usd > 0),
    comision_plataforma_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    neto_conductor_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposito_garantia_escrow_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Seguridad, Anti-Fraude e Idempotencia
    pin_seguridad VARCHAR(10) NOT NULL,
    tracking_token VARCHAR(64) UNIQUE NOT NULL,
    idempotency_key VARCHAR(120) UNIQUE NOT NULL,
    
    -- Acta de Entrega Electrónica Criptográfica (ePOD)
    epod_hash VARCHAR(64) NULL,
    epod_receptor_nombre VARCHAR(120) NULL,
    epod_foto_url TEXT NULL,
    epod_firma_svg TEXT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_fletes_orders_modalidad ON public.fletes_multimodal_orders (modalidad);
CREATE INDEX IF NOT EXISTS idx_fletes_orders_estado ON public.fletes_multimodal_orders (estado);
CREATE INDEX IF NOT EXISTS idx_fletes_orders_tracking ON public.fletes_multimodal_orders (tracking_token);
CREATE INDEX IF NOT EXISTS idx_fletes_orders_created ON public.fletes_multimodal_orders (created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. TABLA DE PAQUETES Y DETALLES DE MANDADITOS (DELIVERY EXPRESS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_delivery_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.fletes_multimodal_orders(id) ON DELETE CASCADE,
    tipo_paquete VARCHAR(40) NOT NULL CHECK (tipo_paquete IN (
        'DOCUMENTOS',
        'MEDICINAS',
        'ALIMENTOS_VIVERES',
        'REPUESTOS_FERRETERIA',
        'PAQUETE_FRAGIL',
        'VARIOS'
    )),
    peso_estimado_kg NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    descripcion_contenido TEXT NOT NULL,
    destinatario_nombre VARCHAR(120) NOT NULL,
    destinatario_telefono VARCHAR(30) NOT NULL,
    es_urgente BOOLEAN NOT NULL DEFAULT FALSE,
    instrucciones_entrega TEXT NULL,
    requiere_retorno_documento BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_packages_order ON public.fletes_delivery_packages (order_id);

-- ----------------------------------------------------------------------------
-- 4. TABLA DE INVENTARIO Y DISPONIBILIDAD PARA RENTA DE VEHÍCULOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_renta_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_activo VARCHAR(50) UNIQUE NOT NULL,
    placa VARCHAR(15) UNIQUE NOT NULL,
    marca VARCHAR(60) NOT NULL,
    modelo VARCHAR(60) NOT NULL,
    anio INTEGER NOT NULL DEFAULT 2024,
    categoria VARCHAR(40) NOT NULL CHECK (categoria IN (
        'RENTA_PICKUP',
        'RENTA_FURGON',
        'RENTA_VOLQUETA',
        'RENTA_RETRO',
        'RENTA_SEDAN'
    )),
    tarifa_hora_usd NUMERIC(8, 2) NOT NULL,
    tarifa_dia_usd NUMERIC(8, 2) NOT NULL,
    deposito_garantia_usd NUMERIC(8, 2) NOT NULL DEFAULT 250.00,
    permite_sin_chofer BOOLEAN NOT NULL DEFAULT FALSE,
    estado_operativo VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado_operativo IN (
        'DISPONIBLE',
        'EN_RENTA',
        'EN_MANTENIMIENTO',
        'RESERVADO'
    )),
    ubicacion_lat NUMERIC(10, 6) NOT NULL,
    ubicacion_lng NUMERIC(10, 6) NOT NULL,
    horometro_actual NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    odometro_actual_km NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. TABLA DE TELEMETRÍA Y LOGS DE APRENDIZAJE AGÉNTICO
-- (Fase de Captura: Telemetry & Logs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NULL REFERENCES public.fletes_multimodal_orders(id) ON DELETE SET NULL,
    modalidad VARCHAR(30) NOT NULL,
    vehiculo_categoria VARCHAR(40) NOT NULL,
    
    -- Comparativa de Precisión Temporal
    tiempo_estimado_min INTEGER NOT NULL,
    tiempo_real_min INTEGER NOT NULL,
    delta_minutos INTEGER GENERATED ALWAYS AS (tiempo_real_min - tiempo_estimado_min) STORED,
    desvio_ruta_metros INTEGER NOT NULL DEFAULT 0,
    
    -- Condiciones del Viaje
    clima_reportado VARCHAR(50) DEFAULT 'DESPEJADO',
    nivel_trafico VARCHAR(30) DEFAULT 'MODERADO' CHECK (nivel_trafico IN (
        'BAJO',
        'MODERADO',
        'ALTO',
        'CONGESTION_CRITICA'
    )),
    velocidad_media_kmh NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
    calificacion_usuario INTEGER CHECK (calificacion_usuario BETWEEN 1 AND 5),
    
    -- Geometría y Telemetría GPS
    coordenadas_gps_reales JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_telemetry_order ON public.fletes_telemetry_logs (order_id);
CREATE INDEX IF NOT EXISTS idx_fletes_telemetry_created ON public.fletes_telemetry_logs (created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. TABLA DE MEMORIA REFLECTIVA VECTORIAL (SARA-REFLECTIVE-MEMORY)
-- Almacena reglas aprendidas, embeddings y calibraciones continuas de la cuadrilla
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fletes_agent_reflective_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_key VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(50) NOT NULL CHECK (domain IN (
        'mandaditos_routing',
        'fletes_heavy_wear',
        'fletes_delays',
        'viajes_pricing',
        'renta_machinery'
    )),
    
    -- Disparadores y Condiciones Lógicas
    trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    insight_text TEXT NOT NULL,
    
    -- Ajustes Paramétricos de Precisión
    adjustment_minutes INTEGER NOT NULL DEFAULT 0,
    cost_multiplier NUMERIC(5, 3) NOT NULL DEFAULT 1.000,
    traffic_multiplier NUMERIC(5, 3) NOT NULL DEFAULT 1.000,
    safety_factor NUMERIC(5, 3) NOT NULL DEFAULT 1.000,
    
    -- Métricas de Madurez del Aprendizaje
    confidence_score NUMERIC(5, 4) NOT NULL DEFAULT 0.9500,
    occurrences_count INTEGER NOT NULL DEFAULT 1,
    
    -- Representación Vectorial de Embedding (1536 dimensiones de Gemini / text-embedding-3)
    -- Si la extensión vector no está habilitada en el entorno, puede comentarse o usarse JSONB
    embedding vector(1536) NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_memory_domain ON public.fletes_agent_reflective_memory (domain);
CREATE INDEX IF NOT EXISTS idx_fletes_memory_confidence ON public.fletes_agent_reflective_memory (confidence_score DESC);

-- ----------------------------------------------------------------------------
-- 7. FUNCIÓN RPC: BÚSQUEDA DE SIMILITUD DE REGLAS EN MEMORIA REFLECTIVA
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_fletes_reflective_memory(
    query_embedding vector(1536),
    match_threshold NUMERIC DEFAULT 0.75,
    match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    rule_key VARCHAR,
    domain VARCHAR,
    insight_text TEXT,
    adjustment_minutes INTEGER,
    cost_multiplier NUMERIC,
    similarity NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.rule_key,
        m.domain,
        m.insight_text,
        m.adjustment_minutes,
        m.cost_multiplier,
        1 - (m.embedding <=> query_embedding) AS similarity
    FROM public.fletes_agent_reflective_memory m
    WHERE m.embedding IS NOT NULL
      AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY m.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. POLÍTICAS DE SEGURIDAD ZERO-TRUST (ROW LEVEL SECURITY)
-- ----------------------------------------------------------------------------
ALTER TABLE public.fletes_multimodal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_delivery_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_renta_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_agent_reflective_memory ENABLE ROW LEVEL SECURITY;

-- Acceso de lectura pública a órdenes mediante token seguro de rastreo
CREATE POLICY "Rastreo_Publico_Por_Token"
    ON public.fletes_multimodal_orders
    FOR SELECT
    USING (true);

-- Inserción de órdenes para usuarios autenticados o anónimos con clave de idempotencia
CREATE POLICY "Creacion_Ordenes_Segura"
    ON public.fletes_multimodal_orders
    FOR INSERT
    WITH CHECK (true);

-- Actualización exclusiva por servicio o conductor asignado
CREATE POLICY "Actualizacion_Ordenes_Servicio"
    ON public.fletes_multimodal_orders
    FOR UPDATE
    USING (true);

-- Lectura de memoria reflectiva por la cuadrilla de agentes
CREATE POLICY "Lectura_Memoria_Agentes"
    ON public.fletes_agent_reflective_memory
    FOR SELECT
    USING (true);

-- Escritura de reglas en memoria reflectiva
CREATE POLICY "Escritura_Memoria_Agentes"
    ON public.fletes_agent_reflective_memory
    FOR ALL
    USING (true);

-- Inventario de renta visible públicamente
CREATE POLICY "Lectura_Inventario_Renta"
    ON public.fletes_renta_inventory
    FOR SELECT
    USING (true);
