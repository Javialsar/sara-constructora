-- ============================================================================
-- GOBEE ("by Grupo Sara") — ENDURECIMIENTO POSTGIS, PRESENCIA Y RPC ATÓMICAS
-- Archivo: supabase/migrations/gobee_postgis_rpc_hardening.sql
-- Cero placas demo, cero estado en memoria, cálculo de tarifas 100% servidor.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Presencia en tiempo real de conductores con PostGIS (reemplaza Map en memoria)
CREATE TABLE IF NOT EXISTS public.gobee_driver_presence (
  driver_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL DEFAULT 'Conductor Gobee',
  plate TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'gobee_go' CHECK (category IN ('gobee_go', 'gobee_xl', 'gobee_express', 'gobee_cargo')),
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  heading NUMERIC(6, 2) NOT NULL DEFAULT 0,
  speed_kmh NUMERIC(6, 2) NOT NULL DEFAULT 0,
  accuracy_m NUMERIC(6, 2) NOT NULL DEFAULT 15,
  active_order_id UUID REFERENCES public.fletes_orders(id) ON DELETE SET NULL,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gobee_driver_presence_geog
  ON public.gobee_driver_presence USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_gobee_driver_presence_online
  ON public.gobee_driver_presence (is_online, category, updated_at DESC);

ALTER TABLE public.gobee_driver_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gobee_presence_select_authenticated" ON public.gobee_driver_presence;
CREATE POLICY "gobee_presence_select_authenticated" ON public.gobee_driver_presence
  FOR SELECT TO authenticated
  USING (is_online = TRUE OR driver_id = auth.uid());

DROP POLICY IF EXISTS "gobee_presence_upsert_self" ON public.gobee_driver_presence;
CREATE POLICY "gobee_presence_upsert_self" ON public.gobee_driver_presence
  FOR ALL TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- 2. RPC Atómica: Cálculo de tarifa Gobee en servidor (Anti-Tampering + PostGIS)
CREATE OR REPLACE FUNCTION public.calculate_gobee_fare(
  p_category TEXT,
  p_origin_lat DOUBLE PRECISION,
  p_origin_lng DOUBLE PRECISION,
  p_dest_lat DOUBLE PRECISION,
  p_dest_lng DOUBLE PRECISION,
  p_distance_km NUMERIC DEFAULT NULL,
  p_weight_ton NUMERIC DEFAULT 0,
  p_backhaul BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_origin GEOGRAPHY(Point, 4326);
  v_dest GEOGRAPHY(Point, 4326);
  v_geodesic_km NUMERIC(10, 3);
  v_effective_km NUMERIC(10, 2);
  v_base_usd NUMERIC(10, 2);
  v_per_km_usd NUMERIC(10, 2);
  v_min_usd NUMERIC(10, 2);
  v_commission_rate NUMERIC(5, 4);
  v_weight_surcharge NUMERIC(10, 2) := 0;
  v_raw_fare NUMERIC(10, 2);
  v_fixed_fare NUMERIC(10, 2);
  v_min_bid NUMERIC(10, 2);
  v_max_bid NUMERIC(10, 2);
  v_duration_min INTEGER;
BEGIN
  IF p_category NOT IN ('gobee_go', 'gobee_xl', 'gobee_express', 'gobee_cargo') THEN
    RAISE EXCEPTION 'Categoría Gobee inválida: %', p_category;
  END IF;

  v_origin := ST_SetSRID(ST_MakePoint(p_origin_lng, p_origin_lat), 4326)::geography;
  v_dest := ST_SetSRID(ST_MakePoint(p_dest_lng, p_dest_lat), 4326)::geography;
  v_geodesic_km := ROUND((ST_Distance(v_origin, v_dest) / 1000.0)::numeric, 3);

  -- Evita subdeclaración de distancia desde el cliente (piso = distancia geodésica PostGIS * 1.15)
  v_effective_km := GREATEST(
    COALESCE(p_distance_km, v_geodesic_km * 1.25),
    ROUND((v_geodesic_km * 1.15)::numeric, 2),
    0.50
  );

  CASE p_category
    WHEN 'gobee_go' THEN
      v_base_usd := 1.50;
      v_per_km_usd := 0.42;
      v_min_usd := 2.00;
      v_commission_rate := 0.1500;
    WHEN 'gobee_xl' THEN
      v_base_usd := 2.25;
      v_per_km_usd := 0.58;
      v_min_usd := 3.00;
      v_commission_rate := 0.1500;
    WHEN 'gobee_express' THEN
      v_base_usd := 1.00;
      v_per_km_usd := 0.30;
      v_min_usd := 1.50;
      v_commission_rate := 0.1200;
    WHEN 'gobee_cargo' THEN
      v_base_usd := 3.50;
      v_per_km_usd := 0.85;
      v_min_usd := 5.00;
      v_commission_rate := 0.1000;
      v_weight_surcharge := ROUND(GREATEST(COALESCE(p_weight_ton, 0), 0) * 1.25, 2);
  END CASE;

  v_raw_fare := v_base_usd + (v_effective_km * v_per_km_usd) + v_weight_surcharge;

  IF p_backhaul THEN
    v_raw_fare := v_raw_fare * 0.80; -- 20% descuento eficiencia Backhaul
  END IF;

  v_fixed_fare := ROUND(GREATEST(v_min_usd, v_raw_fare), 2);
  v_min_bid := ROUND(GREATEST(v_min_usd, v_fixed_fare * 0.85), 2);
  v_max_bid := ROUND(v_fixed_fare * 1.35, 2);
  v_duration_min := GREATEST(4, CEIL(v_effective_km * 2.4)::integer);

  RETURN jsonb_build_object(
    'category', p_category,
    'distance_km', v_effective_km,
    'geodesic_km', v_geodesic_km,
    'duration_min', v_duration_min,
    'fixed_fare_usd', v_fixed_fare,
    'min_bid_usd', v_min_bid,
    'max_bid_usd', v_max_bid,
    'commission_rate', v_commission_rate,
    'driver_net_usd', ROUND(v_fixed_fare * (1 - v_commission_rate), 2),
    'backhaul_applied', p_backhaul
  );
END;
$$;

-- 3. RPC PostGIS: Upsert de ubicación en vivo del conductor
CREATE OR REPLACE FUNCTION public.upsert_gobee_driver_presence(
  p_driver_id UUID,
  p_driver_name TEXT,
  p_plate TEXT,
  p_category TEXT,
  p_is_online BOOLEAN,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_heading NUMERIC DEFAULT 0,
  p_speed_kmh NUMERIC DEFAULT 0,
  p_accuracy_m NUMERIC DEFAULT 15,
  p_active_order_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_point GEOGRAPHY(Point, 4326);
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

  INSERT INTO public.gobee_driver_presence (
    driver_id, driver_name, plate, category, is_online,
    location, lat, lng, heading, speed_kmh, accuracy_m, active_order_id, updated_at
  ) VALUES (
    p_driver_id,
    COALESCE(NULLIF(trim(p_driver_name), ''), 'Conductor Gobee'),
    upper(trim(p_plate)),
    COALESCE(NULLIF(p_category, ''), 'gobee_go'),
    p_is_online,
    v_point,
    p_lat,
    p_lng,
    COALESCE(p_heading, 0),
    COALESCE(p_speed_kmh, 0),
    COALESCE(p_accuracy_m, 15),
    p_active_order_id,
    NOW()
  )
  ON CONFLICT (driver_id) DO UPDATE SET
    driver_name = EXCLUDED.driver_name,
    plate = EXCLUDED.plate,
    category = EXCLUDED.category,
    is_online = EXCLUDED.is_online,
    location = EXCLUDED.location,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    heading = EXCLUDED.heading,
    speed_kmh = EXCLUDED.speed_kmh,
    accuracy_m = EXCLUDED.accuracy_m,
    active_order_id = EXCLUDED.active_order_id,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', TRUE,
    'driver_id', p_driver_id,
    'is_online', p_is_online,
    'updated_at', NOW()
  );
END;
$$;

-- 4. RPC PostGIS: Buscar conductores Gobee cercanos con ST_DWithin
CREATE OR REPLACE FUNCTION public.find_nearby_gobee_drivers(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_m INTEGER DEFAULT 5000,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  driver_id UUID,
  driver_name TEXT,
  plate TEXT,
  category TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  heading NUMERIC,
  speed_kmh NUMERIC,
  rating NUMERIC,
  distance_m NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.driver_id,
    p.driver_name,
    p.plate,
    p.category,
    p.lat,
    p.lng,
    p.heading,
    p.speed_kmh,
    p.rating,
    ROUND(ST_Distance(p.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)::numeric, 1) AS distance_m
  FROM public.gobee_driver_presence p
  WHERE p.is_online = TRUE
    AND p.updated_at >= NOW() - INTERVAL '5 minutes'
    AND (p_category IS NULL OR p.category = p_category)
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      GREATEST(500, LEAST(COALESCE(p_radius_m, 5000), 50000))
    )
  ORDER BY distance_m ASC
  LIMIT 25;
$$;

REVOKE ALL ON FUNCTION public.calculate_gobee_fare(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, NUMERIC, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_gobee_fare(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, NUMERIC, BOOLEAN) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.upsert_gobee_driver_presence(UUID, TEXT, TEXT, TEXT, BOOLEAN, DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, NUMERIC, NUMERIC, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_gobee_driver_presence(UUID, TEXT, TEXT, TEXT, BOOLEAN, DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, NUMERIC, NUMERIC, UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.find_nearby_gobee_drivers(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_nearby_gobee_drivers(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER, TEXT) TO authenticated, service_role;

COMMIT;
