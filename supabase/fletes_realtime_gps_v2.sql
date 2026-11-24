-- ============================================================================
-- SARA-FLETES v2: Telemetría GPS Real en Vivo, Ofertas P2P y Rastreo Público
-- Cero datos ficticios — Fuente única de verdad en PostgreSQL + Supabase Realtime
-- ============================================================================

-- 1. Ampliar public.fletes_solicitudes con campos geoespaciales, ruta y asignación real
ALTER TABLE IF EXISTS public.fletes_solicitudes
  ADD COLUMN IF NOT EXISTS token_rastreo TEXT,
  ADD COLUMN IF NOT EXISTS origen_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS origen_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS destino_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS destino_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS coordenadas_ruta JSONB,
  ADD COLUMN IF NOT EXISTS distancia_km NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER,
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS peso_ton NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS tipo_vehiculo TEXT,
  ADD COLUMN IF NOT EXISTS conductor_id UUID,
  ADD COLUMN IF NOT EXISTS conductor_nombre TEXT,
  ADD COLUMN IF NOT EXISTS conductor_placa TEXT,
  ADD COLUMN IF NOT EXISTS conductor_telefono TEXT,
  ADD COLUMN IF NOT EXISTS vehiculo_nombre TEXT,
  ADD COLUMN IF NOT EXISTS tarifa_acordada NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_fletes_solicitudes_token_rastreo
  ON public.fletes_solicitudes (token_rastreo)
  WHERE token_rastreo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fletes_solicitudes_status_created
  ON public.fletes_solicitudes (status, created_at DESC);

-- 2. Tabla de ofertas reales P2P de conductores (Modo inDrive multi-dispositivo)
CREATE TABLE IF NOT EXISTS public.fletes_ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID REFERENCES public.fletes_solicitudes(id) ON DELETE CASCADE,
  token_rastreo TEXT,
  conductor_id UUID,
  conductor_nombre TEXT NOT NULL,
  placa TEXT NOT NULL,
  vehiculo_nombre TEXT NOT NULL,
  telefono TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  trips_count INTEGER DEFAULT 0,
  precio_ofertado NUMERIC(10, 2) NOT NULL,
  es_contraoferta BOOLEAN DEFAULT FALSE,
  eta_minutos INTEGER DEFAULT 5,
  distancia_metros INTEGER DEFAULT 0,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'expirada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_ofertas_solicitud
  ON public.fletes_ofertas (solicitud_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fletes_ofertas_token
  ON public.fletes_ofertas (token_rastreo, created_at DESC);

-- 3. Tabla de telemetría GPS en tiempo real de conductores conectados (sin mocks)
CREATE TABLE IF NOT EXISTS public.fletes_ubicaciones (
  placa TEXT PRIMARY KEY,
  conductor_id UUID,
  driver_name TEXT NOT NULL,
  tipo_vehiculo TEXT NOT NULL DEFAULT 'PICKUP_1T',
  solicitud_id UUID REFERENCES public.fletes_solicitudes(id) ON DELETE SET NULL,
  token_rastreo TEXT,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy_m DOUBLE PRECISION DEFAULT 15,
  speed_kmh DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  billetera NUMERIC(10, 2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_ubicaciones_disponible_updated
  ON public.fletes_ubicaciones (disponible, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_fletes_ubicaciones_token
  ON public.fletes_ubicaciones (token_rastreo)
  WHERE token_rastreo IS NOT NULL;

-- 4. Row Level Security (RLS)
ALTER TABLE public.fletes_ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_ubicaciones ENABLE ROW LEVEL SECURITY;

-- Lectura de conductores activos en el radar para usuarios autenticados o visitantes del módulo
DROP POLICY IF EXISTS "fletes_ubicaciones_select_public" ON public.fletes_ubicaciones;
CREATE POLICY "fletes_ubicaciones_select_public"
  ON public.fletes_ubicaciones
  FOR SELECT
  USING (true);

-- Actualización de ubicación GPS únicamente para usuarios autenticados o service_role
DROP POLICY IF EXISTS "fletes_ubicaciones_upsert_auth" ON public.fletes_ubicaciones;
CREATE POLICY "fletes_ubicaciones_upsert_auth"
  ON public.fletes_ubicaciones
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ofertas P2P: lectura y escritura para usuarios autenticados
DROP POLICY IF EXISTS "fletes_ofertas_auth_all" ON public.fletes_ofertas;
CREATE POLICY "fletes_ofertas_auth_all"
  ON public.fletes_ofertas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Habilitar Supabase Realtime (Postgres Changes) en las 3 tablas críticas
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.fletes_solicitudes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.fletes_ofertas;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.fletes_ubicaciones;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
