-- ============================================================================
-- MIGRACIÓN CRM COMERCIAL Y TELEMETRÍA DE CONVERSIÓN - GRUPO SARA
-- Fase 2: Embudo de Ventas Oficial y Telemetría Ética Zero-PII
-- ============================================================================

-- 1. Actualización de columnas en tabla 'cotizaciones'
ALTER TABLE IF EXISTS cotizaciones 
  ADD COLUMN IF NOT EXISTS tracking_code text,
  ADD COLUMN IF NOT EXISTS motivo_perdida text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Actualización de restricción CHECK en cotizaciones para soportar el embudo oficial
DO $$
BEGIN
  -- Intentar eliminar la restricción anterior si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'cotizaciones' AND constraint_name LIKE '%estado%'
  ) THEN
    ALTER TABLE cotizaciones DROP CONSTRAINT IF EXISTS cotizaciones_estado_check;
  END IF;

  -- Crear nueva restricción con los estados del embudo oficial + compatibilidad
  ALTER TABLE cotizaciones 
    ADD CONSTRAINT cotizaciones_estado_funnel_check 
    CHECK (estado IN (
      'nuevo',
      'contactado',
      'calificado',
      'cotizacion_enviada',
      'negociacion',
      'ganado',
      'perdido',
      'pendiente',
      'cotizada',
      'aprobada',
      'rechazada'
    ));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Aviso en migración de CHECK: %', SQLERRM;
END $$;

-- 3. Crear tabla de eventos de conversión para telemetría comercial segura
CREATE TABLE IF NOT EXISTS eventos_conversion (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  funnel_stage text,
  tracking_code text,
  monto_estimado numeric(15,2),
  moneda text DEFAULT 'USD',
  metadata jsonb DEFAULT '{}'::jsonb,
  utm jsonb DEFAULT '{}'::jsonb,
  referrer text,
  path text,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

-- Índices de consulta rápida para el embudo de ventas
CREATE INDEX IF NOT EXISTS idx_eventos_conversion_type ON eventos_conversion(event_type);
CREATE INDEX IF NOT EXISTS idx_eventos_conversion_stage ON eventos_conversion(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_eventos_conversion_tracking ON eventos_conversion(tracking_code);
CREATE INDEX IF NOT EXISTS idx_eventos_conversion_created ON eventos_conversion(created_at DESC);

-- Habilitar RLS en eventos_conversion
ALTER TABLE eventos_conversion ENABLE ROW LEVEL SECURITY;

-- Política de lectura administrativa
CREATE POLICY "Lectura administrativa de telemetría" 
ON eventos_conversion FOR SELECT 
TO authenticated 
USING (true);

-- Política de inserción por servicio y autenticado
CREATE POLICY "Inserción controlada de telemetría" 
ON eventos_conversion FOR INSERT 
WITH CHECK (true);
