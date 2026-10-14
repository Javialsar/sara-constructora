-- =====================================================================
-- GRUPO SARA - RED DE AGENTES ASESORES INTERACTIVOS Y CO-PILOTOS
-- TABLA DE PERSISTENCIA: sara_ai_advisory_logs
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.sara_ai_advisory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NULL,
    correlation_id UUID NULL,
    agent_id VARCHAR(50) NOT NULL, -- 'SARA-APU', 'SARA-MARKETPLACE', 'SARA-FLETES', 'SARA-INMOBILIARIA', 'SARA-ALOJAMIENTO', etc.
    tipo_asesoria VARCHAR(100) NOT NULL, -- 'compras_suministros', 'coordinacion_carga', 'rentabilidad_campamentos', 'optimizacion_general'
    mensaje_sugerencia TEXT NOT NULL,
    datos_contexto JSONB NOT NULL DEFAULT '{}'::jsonb,
    decision_tecnico VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (decision_tecnico IN ('pendiente', 'aceptada', 'rechazada')),
    ahorro_estimado_usd NUMERIC(12,2) DEFAULT 0.00,
    documento_generado_tipo VARCHAR(100) NULL CHECK (documento_generado_tipo IN ('cuadro_comparativo_proveedores', 'reporte_consolidado_insumos_logistica', 'otro', NULL)),
    documento_url_o_datos JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at TIMESTAMPTZ NULL
);

-- Índices de consulta rápida y auditoría
CREATE INDEX IF NOT EXISTS idx_sara_advisory_proyecto ON public.sara_ai_advisory_logs (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_sara_advisory_agent ON public.sara_ai_advisory_logs (agent_id);
CREATE INDEX IF NOT EXISTS idx_sara_advisory_decision ON public.sara_ai_advisory_logs (decision_tecnico);
CREATE INDEX IF NOT EXISTS idx_sara_advisory_created ON public.sara_ai_advisory_logs (created_at DESC);

-- Habilitar RLS pero permitir lectura y escritura a usuarios autenticados y servicio
ALTER TABLE public.sara_ai_advisory_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sara_ai_advisory_logs' AND policyname = 'Permitir todo a usuarios autenticados'
    ) THEN
        CREATE POLICY "Permitir todo a usuarios autenticados" 
        ON public.sara_ai_advisory_logs 
        FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sara_ai_advisory_logs' AND policyname = 'Permitir lectura publica a anon'
    ) THEN
        CREATE POLICY "Permitir lectura publica a anon" 
        ON public.sara_ai_advisory_logs 
        FOR SELECT 
        TO anon 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sara_ai_advisory_logs' AND policyname = 'Permitir insercion anonima temporal'
    ) THEN
        CREATE POLICY "Permitir insercion anonima temporal" 
        ON public.sara_ai_advisory_logs 
        FOR INSERT 
        TO anon 
        WITH CHECK (true);
    END IF;
END $$;

-- Habilitar Realtime en Supabase si no está presente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sara_ai_advisory_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sara_ai_advisory_logs;
    END IF;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Semillas de demostración con casos reales de diálogo ecuatoriano
INSERT INTO public.sara_ai_advisory_logs (
    agent_id,
    tipo_asesoria,
    mensaje_sugerencia,
    datos_contexto,
    decision_tecnico,
    ahorro_estimado_usd
)
VALUES
(
    'SARA-APU + SARA-MARKETPLACE',
    'compras_suministros',
    'Estimado Ingeniero, analizando el rubro de acero estructural, le sugiero adquirir la varilla con el "Proveedor Adelca Distribución Directa" en Quito. Aunque su precio base es similar al resto, este proveedor ofrece una línea de crédito de 15 días plazo y el costo del flete ya está considerado dentro del precio final, lo que optimiza su flujo de caja inmediato en un 12%.',
    '{"insumo": "Acero Corrugado Fy=4200 kg/cm2", "cantidad": 4200, "proveedor_recomendado": "Adelca Distribución Directa (Quito)", "dias_credito": 15, "flete_incluido": true, "score_confianza": 0.96}'::jsonb,
    'aceptada',
    528.00
),
(
    'SARA-FLETES',
    'coordinacion_carga',
    'Para los 45 m³ de desalojo de material de esta semana, he coordinado con la Cooperativa Vial Local. Si autoriza el despacho unificado en plataformas rígidas en lugar de volquetas individuales, el costo logístico baja un 18% y el seguro de carga cubre todo el trayecto sin costo adicional.',
    '{"volumen_m3": 45, "modalidad_sugerida": "Plataforma rígida unificada", "cooperativa": "Cooperativa Vial del Austro", "descuento_pct": 18, "seguro_incluido": true, "score_confianza": 0.94}'::jsonb,
    'aceptada',
    240.00
),
(
    'SARA-INMOBILIARIA + SARA-ALOJAMIENTO',
    'rentabilidad_campamentos',
    'Arquitecto, según las especificaciones de acabados de Revit, si destina los tres departamentos del bloque B al módulo SARA-ALOJAMIENTO en lugar de venta tradicional, la tasa de ocupación corporativa proyectada para la zona le generará un flujo mensual estable de $2,400, acelerando el retorno de la inversión total del lote en 1.5 años.',
    '{"unidades_bloque_b": 3, "flujo_mensual_proyectado_usd": 2400, "reduccion_retorno_inversion_anos": 1.5, "modulo": "SARA-ALOJAMIENTO Corporativo", "score_confianza": 0.92}'::jsonb,
    'pendiente',
    28800.00
)
ON CONFLICT DO NOTHING;
