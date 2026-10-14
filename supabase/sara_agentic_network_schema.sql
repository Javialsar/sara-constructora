-- =====================================================================
-- GRUPO SARA - RED DE AGENTES COREOGRAFIADOS (SARA-ECOSYSTEM)
-- CAPA DE IA COLECTIVA ASÍNCRONA, MEMORIA COMPARTIDA Y APRENDIZAJE CONTINUO
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA MAESTRA DE EVENTOS DE AGENTES (Event-Driven Agentic Network)
CREATE TABLE IF NOT EXISTS public.sara_agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL, -- Agrupa todos los eventos de un mismo proyecto/flujo
    proyecto_id UUID NULL,
    event_type VARCHAR(100) NOT NULL,
    origin_agent VARCHAR(50) NOT NULL,
    target_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'emitted' CHECK (status IN ('emitted', 'processing', 'completed', 'failed')),
    execution_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_sara_events_correlation ON public.sara_agent_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_sara_events_type ON public.sara_agent_events (event_type);
CREATE INDEX IF NOT EXISTS idx_sara_events_created ON public.sara_agent_events (created_at DESC);

-- 2. TABLA DE MEMORIA COMPARTIDA DE AGENTES (Shared Memory & Context)
CREATE TABLE IF NOT EXISTS public.sara_agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    proyecto_id UUID NULL,
    namespace VARCHAR(50) NOT NULL, -- 'constructora', 'apu', 'marketplace', 'fletes', etc.
    memory_key VARCHAR(100) NOT NULL,
    memory_value JSONB NOT NULL,
    confidence_score NUMERIC(5,4) DEFAULT 1.0000,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_agent_memory_key UNIQUE (correlation_id, namespace, memory_key)
);

CREATE INDEX IF NOT EXISTS idx_sara_memory_correlation ON public.sara_agent_memory (correlation_id);
CREATE INDEX IF NOT EXISTS idx_sara_memory_namespace ON public.sara_agent_memory (namespace);

-- 3. TABLA DE CONOCIMIENTO EVOLUTIVO (Continuous Learning Knowledge Base)
CREATE TABLE IF NOT EXISTS public.sara_agent_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(50) NOT NULL, -- 'apu_yields', 'freight_delays', 'material_volatility', 'talent_efficiency', 'real_estate_absorption', 'escrow_risk'
    entity_key VARCHAR(100) NOT NULL, -- ej: 'rendimiento_hormigon_azuay', 'ruta_gye_cue_retraso_horas', 'acero_tendencia_q4'
    current_value JSONB NOT NULL,
    sample_count INTEGER NOT NULL DEFAULT 1,
    confidence_level NUMERIC(5,4) NOT NULL DEFAULT 0.8500,
    last_evolved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_knowledge_domain_key UNIQUE (domain, entity_key)
);

CREATE INDEX IF NOT EXISTS idx_sara_knowledge_domain ON public.sara_agent_knowledge_base (domain);

-- 4. TABLA DE SESIONES DE ENTRENAMIENTO ASÍNCRONO Y AUTO-MEJORA (Evolution Logs)
CREATE TABLE IF NOT EXISTS public.sara_agent_evolution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NULL,
    correlation_id UUID NULL,
    agent_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    previous_value JSONB NOT NULL,
    new_value JSONB NOT NULL,
    variance_percentage NUMERIC(8,4) NOT NULL,
    rationale TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SEMILLAS INICIALES DEL KNOWLEDGE BASE EVOLUTIVO DE GRUPO SARA
INSERT INTO public.sara_agent_knowledge_base (domain, entity_key, current_value, sample_count, confidence_level, metadata)
VALUES
    ('apu_yields', 'rendimiento_mano_obra_azuay', '{"factor_rendimiento": 1.05, "clima_ajuste": 1.02, "altitud_m": 2550}'::jsonb, 14, 0.94, '{"provincia": "Azuay", "fuente": "Histórico Obras Cuenca"}'::jsonb),
    ('apu_yields', 'rendimiento_mano_obra_pichincha', '{"factor_rendimiento": 1.02, "clima_ajuste": 1.00, "altitud_m": 2850}'::jsonb, 22, 0.96, '{"provincia": "Pichincha", "fuente": "Obras Valle y Quito"}'::jsonb),
    ('apu_yields', 'rendimiento_mano_obra_guayas', '{"factor_rendimiento": 0.92, "clima_ajuste": 1.15, "altitud_m": 4}'::jsonb, 18, 0.91, '{"provincia": "Guayas", "fuente": "Costa Alta Temperatura"}'::jsonb),
    ('freight_delays', 'ruta_guayaquil_cuenca', '{"duracion_media_horas": 4.5, "retraso_probabilidad": 0.28, "cuello_botella": "Molleturo / Deslaves"}'::jsonb, 35, 0.92, '{"tipo_transporte": "Plataforma/Mula"}'::jsonb),
    ('freight_delays', 'ruta_quito_cuenca', '{"duracion_media_horas": 8.0, "retraso_probabilidad": 0.15, "cuello_botella": "Panamericana Sur"}'::jsonb, 27, 0.89, '{"tipo_transporte": "Cama Baja"}'::jsonb),
    ('material_volatility', 'acero_corrugado_adelca', '{"precio_kg_ref": 1.18, "tendencia_trimestral": "+3.4%", "alerta_compra_anticipada": true}'::jsonb, 40, 0.95, '{"unidad": "kg", "origen": "Planta Lasso"}'::jsonb),
    ('material_volatility', 'cemento_holcim_fuerte', '{"precio_saco_ref": 7.45, "tendencia_trimestral": "+1.1%", "alerta_compra_anticipada": false}'::jsonb, 60, 0.98, '{"unidad": "saco 50kg"}'::jsonb),
    ('real_estate_absorption', 'cuenca_paucarbamba', '{"precio_m2_construccion": 1150, "precio_m2_terreno": 680, "meses_absorcion": 4.2}'::jsonb, 12, 0.90, '{"zona": "Alta Plusvalía Urbana"}'::jsonb),
    ('talent_efficiency', 'pesos_algoritmo_matching', '{"peso_vip": 3.0, "peso_calificacion": 2.5, "peso_cercania": 2.0, "peso_experiencia": 1.5}'::jsonb, 85, 0.97, '{"modulo": "SARA-TALENTOHUMANO"}'::jsonb),
    ('escrow_risk', 'umbrales_liberacion_fondos', '{"margen_seguridad_pct": 10.0, "requiere_acta_fiscalizador": true, "max_anticipo_pct": 30.0}'::jsonb, 19, 0.99, '{"normativa": "Grupo SARA Escrow Protocol"}'::jsonb)
ON CONFLICT (domain, entity_key) DO UPDATE SET
    current_value = EXCLUDED.current_value,
    sample_count = sara_agent_knowledge_base.sample_count + 1,
    last_evolved_at = now();

-- 6. PUBLICAR TABLAS EN REPLICATION REALTIME DE SUPABASE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sara_agent_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sara_agent_events;
    END IF;
END $$;
