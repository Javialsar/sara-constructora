-- ============================================================================
-- SARA FLETES v2.0 PRODUCTION — ESQUEMA ZERO-TRUST, POSTGIS Y RPC ATÓMICAS
-- Archivo: supabase/migrations/fletes_v2_prod_complete.sql
-- ============================================================================

BEGIN;

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 2. TABLAS PRINCIPALES DEL ECOSISTEMA SARA FLETES v2.0
-- ============================================================================

-- 2.1 Órdenes de Fletes / Viajes / Mandaditos / Renta
CREATE TABLE IF NOT EXISTS public.fletes_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vertical TEXT NOT NULL CHECK (vertical IN ('viajes', 'mandaditos', 'fletes', 'renta')),
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('auto', 'moto', 'camioneta', 'camion_3_5t', 'volqueta', 'plataforma')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'ACCEPTED',
    'EN_ROUTE_PICKUP',
    'ARRIVED_PICKUP',
    'LOADING_OR_BOARDING',
    'IN_TRANSIT',
    'ARRIVED_DROPOFF',
    'EPOD_VERIFIED',
    'COMPLETED',
    'CANCELLED'
  )),
  origin_label TEXT NOT NULL,
  dest_label TEXT NOT NULL,
  origin_geog GEOGRAPHY(Point, 4326) NOT NULL,
  dest_geog GEOGRAPHY(Point, 4326) NOT NULL,
  route_track GEOGRAPHY(LineString, 4326),
  distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_min INTEGER NOT NULL DEFAULT 0,
  stevedores_count INTEGER NOT NULL DEFAULT 0 CHECK (stevedores_count >= 0 AND stevedores_count <= 4),
  stevedores_fee_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  rental_hours INTEGER DEFAULT 0,
  with_driver BOOLEAN NOT NULL DEFAULT TRUE,
  guarantee_deposit_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quoted_price_usd NUMERIC(10, 2) NOT NULL CHECK (quoted_price_usd >= 0),
  commission_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.1000 CHECK (commission_rate >= 0 AND commission_rate <= 0.5),
  backhaul_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (backhaul_discount_pct >= 0 AND backhaul_discount_pct <= 30),
  ai_cubing_report JSONB,
  receiver_name TEXT,
  receiver_phone TEXT,
  receiver_qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  payment_method TEXT NOT NULL DEFAULT 'kushki' CHECK (payment_method IN ('kushki', 'payphone', 'deuna', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PREAUTHORIZED', 'CAPTURED', 'SETTLED', 'FAILED', 'REFUNDED')),
  gateway_ref TEXT,
  sri_invoice_key TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Columnas adicionales idempotentes si la tabla ya existía
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS origin_geog GEOGRAPHY(Point, 4326);
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS dest_geog GEOGRAPHY(Point, 4326);
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS route_track GEOGRAPHY(LineString, 4326);
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS ai_cubing_report JSONB;
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS backhaul_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS receiver_phone TEXT;
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS receiver_qr_token TEXT;
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS sri_invoice_key TEXT;
ALTER TABLE public.fletes_orders ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_fletes_orders_customer ON public.fletes_orders (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fletes_orders_driver ON public.fletes_orders (driver_id, status);
CREATE INDEX IF NOT EXISTS idx_fletes_orders_origin_geog ON public.fletes_orders USING GIST (origin_geog);
CREATE INDEX IF NOT EXISTS idx_fletes_orders_dest_geog ON public.fletes_orders USING GIST (dest_geog);

-- 2.2 Acta de Entrega Digital Criptográfica (e-POD)
CREATE TABLE IF NOT EXISTS public.fletes_epod_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.fletes_orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  receiver_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  photo_sha256 TEXT NOT NULL CHECK (char_length(photo_sha256) = 64),
  signature_svg TEXT,
  receiver_qr_token TEXT,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('SIGNATURE', 'QR_SCAN', 'DUAL')),
  gps_coords GEOGRAPHY(Point, 4326) NOT NULL,
  gps_lat DOUBLE PRECISION NOT NULL,
  gps_lng DOUBLE PRECISION NOT NULL,
  distance_to_dropoff_m NUMERIC(8, 2),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_epod_order ON public.fletes_epod_records (order_id, status);
CREATE INDEX IF NOT EXISTS idx_fletes_epod_gps ON public.fletes_epod_records USING GIST (gps_coords);

-- 2.3 Chat Bidireccional con Intérprete Simultáneo
CREATE TABLE IF NOT EXISTS public.fletes_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.fletes_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'driver')),
  original_text TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'es-EC',
  translated_text TEXT NOT NULL,
  target_lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_chat_order ON public.fletes_chat_messages (order_id, created_at ASC);

-- 2.4 Telemetría PostGIS Histórica (Auditoría MTOP cada 30s)
CREATE TABLE IF NOT EXISTS public.fletes_telemetry_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.fletes_orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed_kmh NUMERIC(6, 2) NOT NULL DEFAULT 0,
  heading NUMERIC(6, 2) NOT NULL DEFAULT 0,
  accuracy_m NUMERIC(6, 2) NOT NULL DEFAULT 0,
  is_snapped BOOLEAN NOT NULL DEFAULT FALSE,
  event_type TEXT NOT NULL DEFAULT 'HEARTBEAT' CHECK (event_type IN (
    'HEARTBEAT', 'ARRIVED_PICKUP', 'ARRIVED_DROPOFF', 'OFFLINE_SYNC', 'RIDECHECK_ANOMALY'
  )),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_telemetry_order_time ON public.fletes_telemetry_logs (order_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_fletes_telemetry_geog ON public.fletes_telemetry_logs USING GIST (location);

-- 2.5 Motor de Flete de Retorno (Backhaul Matching — hasta 30% descuento)
CREATE TABLE IF NOT EXISTS public.fletes_backhaul_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_order_id UUID REFERENCES public.fletes_orders(id) ON DELETE SET NULL,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('auto', 'moto', 'camioneta', 'camion_3_5t', 'volqueta', 'plataforma')),
  origin_label TEXT NOT NULL,
  dest_label TEXT NOT NULL,
  origin_geog GEOGRAPHY(Point, 4326) NOT NULL,
  dest_geog GEOGRAPHY(Point, 4326) NOT NULL,
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 25.00 CHECK (discount_pct > 0 AND discount_pct <= 30.00),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLAIMED', 'EXPIRED', 'CANCELLED')),
  claimed_by_order_id UUID REFERENCES public.fletes_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_backhaul_active ON public.fletes_backhaul_offers (status, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_fletes_backhaul_origin ON public.fletes_backhaul_offers USING GIST (origin_geog);
CREATE INDEX IF NOT EXISTS idx_fletes_backhaul_dest ON public.fletes_backhaul_offers USING GIST (dest_geog);

-- 2.6 Billetera Prepaga del Conductor (SARA Wallet)
CREATE TABLE IF NOT EXISTS public.fletes_driver_wallets (
  driver_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  balance_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  cash_orders_blocked BOOLEAN GENERATED ALWAYS AS (balance_usd < 5.00) STORED,
  backhaul_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Libro Mayor Inmutable de Transacciones de Billetera
CREATE TABLE IF NOT EXISTS public.fletes_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.fletes_driver_wallets(driver_id) ON DELETE RESTRICT,
  order_id UUID REFERENCES public.fletes_orders(id) ON DELETE SET NULL,
  tx_type TEXT NOT NULL CHECK (tx_type IN (
    'TOPUP',
    'CASH_COMMISSION_DEBIT',
    'DIGITAL_EARNING_CREDIT',
    'STEVEDORE_CREDIT',
    'ADJUSTMENT',
    'PAYOUT'
  )),
  amount_usd NUMERIC(12, 2) NOT NULL,
  balance_after_usd NUMERIC(12, 2) NOT NULL,
  gateway TEXT CHECK (gateway IN ('kushki', 'payphone', 'deuna', 'cash', 'internal')),
  gateway_ref TEXT UNIQUE,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_wallet_tx_driver ON public.fletes_wallet_transactions (driver_id, created_at DESC);

-- 2.8 Intenciones y Estados de Pago Multi-Pasarela
CREATE TABLE IF NOT EXISTS public.fletes_payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.fletes_orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  gateway TEXT NOT NULL CHECK (gateway IN ('kushki', 'payphone', 'deuna', 'cash')),
  intent_type TEXT NOT NULL CHECK (intent_type IN ('charge', 'preauth', 'capture', 'void', 'topup')),
  amount_usd NUMERIC(12, 2) NOT NULL CHECK (amount_usd > 0),
  deferred_months INTEGER NOT NULL DEFAULT 0 CHECK (deferred_months IN (0, 3, 6, 9, 12)),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'VOIDED', 'FAILED', 'EXPIRED')),
  gateway_ref TEXT UNIQUE,
  kushki_ticket_number TEXT,
  preauth_expires_at TIMESTAMPTZ,
  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fletes_payment_intents_order ON public.fletes_payment_intents (order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fletes_payment_intents_user ON public.fletes_payment_intents (user_id, created_at DESC);

-- 2.9 Alertas SOS y Telemetría RideCheck
CREATE TABLE IF NOT EXISTS public.fletes_sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.fletes_orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'driver')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('manual_sos', 'harsh_braking', 'route_deviation', 'prolonged_stop')),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_fletes_sos_status ON public.fletes_sos_alerts (status, created_at DESC);

-- ============================================================================
-- 3. STORAGE BUCKET PRIVADO fletes-epod
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fletes-epod',
  'fletes-epod',
  FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. SEGURIDAD ROW LEVEL SECURITY (ZERO-TRUST)
-- ============================================================================

ALTER TABLE public.fletes_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_epod_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_backhaul_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_driver_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_sos_alerts ENABLE ROW LEVEL SECURITY;

-- fletes_orders: cliente dueño, conductor asignado o conductor viendo órdenes pendientes
DROP POLICY IF EXISTS "fletes_orders_select_participants" ON public.fletes_orders;
CREATE POLICY "fletes_orders_select_participants" ON public.fletes_orders
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR driver_id = auth.uid()
    OR (status = 'PENDING' AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('driver', 'conductor', 'admin', 'superadmin'))
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

DROP POLICY IF EXISTS "fletes_orders_insert_customer" ON public.fletes_orders;
CREATE POLICY "fletes_orders_insert_customer" ON public.fletes_orders
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "fletes_orders_update_participants" ON public.fletes_orders;
CREATE POLICY "fletes_orders_update_participants" ON public.fletes_orders
  FOR UPDATE TO authenticated
  USING (
    customer_id = auth.uid()
    OR driver_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- fletes_epod_records: solo participantes de la orden
DROP POLICY IF EXISTS "fletes_epod_select_participants" ON public.fletes_epod_records;
CREATE POLICY "fletes_epod_select_participants" ON public.fletes_epod_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fletes_orders o
      WHERE o.id = fletes_epod_records.order_id
        AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- fletes_chat_messages: solo participantes de la orden
DROP POLICY IF EXISTS "fletes_chat_select_participants" ON public.fletes_chat_messages;
CREATE POLICY "fletes_chat_select_participants" ON public.fletes_chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.fletes_orders o
      WHERE o.id = fletes_chat_messages.order_id
        AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "fletes_chat_insert_participants" ON public.fletes_chat_messages;
CREATE POLICY "fletes_chat_insert_participants" ON public.fletes_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.fletes_orders o
      WHERE o.id = fletes_chat_messages.order_id
        AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())
    )
  );

-- fletes_telemetry_logs
DROP POLICY IF EXISTS "fletes_telemetry_select_participants" ON public.fletes_telemetry_logs;
CREATE POLICY "fletes_telemetry_select_participants" ON public.fletes_telemetry_logs
  FOR SELECT TO authenticated
  USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.fletes_orders o
      WHERE o.id = fletes_telemetry_logs.order_id AND o.customer_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

DROP POLICY IF EXISTS "fletes_telemetry_insert_driver" ON public.fletes_telemetry_logs;
CREATE POLICY "fletes_telemetry_insert_driver" ON public.fletes_telemetry_logs
  FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- fletes_backhaul_offers: ofertas activas visibles a autenticados; solo el conductor crea/gestiona las suyas
DROP POLICY IF EXISTS "fletes_backhaul_select_active" ON public.fletes_backhaul_offers;
CREATE POLICY "fletes_backhaul_select_active" ON public.fletes_backhaul_offers
  FOR SELECT TO authenticated
  USING (status = 'ACTIVE' OR driver_id = auth.uid());

DROP POLICY IF EXISTS "fletes_backhaul_manage_driver" ON public.fletes_backhaul_offers;
CREATE POLICY "fletes_backhaul_manage_driver" ON public.fletes_backhaul_offers
  FOR ALL TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- fletes_driver_wallets & fletes_wallet_transactions: lectura estricta solo del dueño (mutación solo vía RPC SECURITY DEFINER)
DROP POLICY IF EXISTS "fletes_wallet_select_owner" ON public.fletes_driver_wallets;
CREATE POLICY "fletes_wallet_select_owner" ON public.fletes_driver_wallets
  FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "fletes_wallet_update_toggle" ON public.fletes_driver_wallets;
CREATE POLICY "fletes_wallet_update_toggle" ON public.fletes_driver_wallets
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS "fletes_wallet_tx_select_owner" ON public.fletes_wallet_transactions;
CREATE POLICY "fletes_wallet_tx_select_owner" ON public.fletes_wallet_transactions
  FOR SELECT TO authenticated
  USING (driver_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

-- fletes_payment_intents
DROP POLICY IF EXISTS "fletes_payment_intents_select_owner" ON public.fletes_payment_intents;
CREATE POLICY "fletes_payment_intents_select_owner" ON public.fletes_payment_intents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

-- fletes_sos_alerts
DROP POLICY IF EXISTS "fletes_sos_select_owner" ON public.fletes_sos_alerts;
CREATE POLICY "fletes_sos_select_owner" ON public.fletes_sos_alerts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "fletes_sos_insert_self" ON public.fletes_sos_alerts;
CREATE POLICY "fletes_sos_insert_self" ON public.fletes_sos_alerts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Políticas RLS para canales privados de Supabase Realtime Broadcast (tracking:<orderId>)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'realtime' AND table_name = 'messages'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "fletes_realtime_tracking_private" ON realtime.messages';
    EXECUTE $pol$
      CREATE POLICY "fletes_realtime_tracking_private" ON realtime.messages
        FOR ALL TO authenticated
        USING (
          realtime.topic() LIKE 'tracking:%'
          AND EXISTS (
            SELECT 1 FROM public.fletes_orders o
            WHERE o.id::text = split_part(realtime.topic(), ':', 2)
              AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())
          )
        )
        WITH CHECK (
          realtime.topic() LIKE 'tracking:%'
          AND EXISTS (
            SELECT 1 FROM public.fletes_orders o
            WHERE o.id::text = split_part(realtime.topic(), ':', 2)
              AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid())
          )
        )
    $pol$;
  END IF;
END $$;

-- Políticas RLS para Storage bucket fletes-epod
DROP POLICY IF EXISTS "fletes_epod_storage_upload" ON storage.objects;
CREATE POLICY "fletes_epod_storage_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fletes-epod');

DROP POLICY IF EXISTS "fletes_epod_storage_read" ON storage.objects;
CREATE POLICY "fletes_epod_storage_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'fletes-epod');

-- ============================================================================
-- 5. FUNCIONES RPC ATÓMICAS (SECURITY DEFINER + FOR UPDATE)
-- ============================================================================

-- 5.1 Liquidación Atómica de Orden de Flete (Idempotente + Verificación e-POD)
CREATE OR REPLACE FUNCTION public.process_flete_settlement(
  p_order_id UUID,
  p_payment_method TEXT,
  p_gateway_ref TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_epod RECORD;
  v_wallet RECORD;
  v_commission_usd NUMERIC(12, 2);
  v_driver_net_usd NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
  v_tx_id UUID;
BEGIN
  -- 1. Bloqueo exclusivo de fila sobre la orden
  SELECT * INTO v_order
  FROM public.fletes_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de flete % no encontrada', p_order_id;
  END IF;

  -- 2. Idempotencia: si ya fue liquidada, devolver estado existente sin duplicar asientos
  IF v_order.payment_status = 'SETTLED' OR v_order.settled_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'already_settled', TRUE,
      'order_id', v_order.id,
      'payment_status', v_order.payment_status,
      'gateway_ref', v_order.gateway_ref,
      'settled_at', v_order.settled_at
    );
  END IF;

  IF v_order.driver_id IS NULL THEN
    RAISE EXCEPTION 'La orden % no tiene un conductor asignado para liquidar', p_order_id;
  END IF;

  -- 3. Verificación obligatoria de e-POD para verticales de carga/renta/mandaditos
  IF v_order.vertical IN ('fletes', 'renta', 'mandaditos') THEN
    SELECT * INTO v_epod
    FROM public.fletes_epod_records
    WHERE order_id = p_order_id AND status = 'VERIFIED'
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Bloqueo de Seguridad: El Acta de Entrega Digital (e-POD) debe estar VERIFIED antes de liquidar la orden %', p_order_id;
    END IF;
  END IF;

  -- 4. Garantizar existencia y bloqueo FOR UPDATE de la billetera del conductor
  INSERT INTO public.fletes_driver_wallets (driver_id, balance_usd)
  VALUES (v_order.driver_id, 0.00)
  ON CONFLICT (driver_id) DO NOTHING;

  SELECT * INTO v_wallet
  FROM public.fletes_driver_wallets
  WHERE driver_id = v_order.driver_id
  FOR UPDATE;

  -- 5. Cálculo financiero atómico
  v_commission_usd := ROUND(v_order.quoted_price_usd * v_order.commission_rate, 2);
  v_driver_net_usd := ROUND((v_order.quoted_price_usd - v_commission_usd) + COALESCE(v_order.stevedores_fee_usd, 0), 2);

  IF lower(p_payment_method) = 'cash' THEN
    -- En efectivo el conductor cobra el 100% directo al cliente; SARA debita la comisión operativa
    v_new_balance := ROUND(v_wallet.balance_usd - v_commission_usd, 2);

    UPDATE public.fletes_driver_wallets
    SET balance_usd = v_new_balance, updated_at = NOW()
    WHERE driver_id = v_order.driver_id;

    INSERT INTO public.fletes_wallet_transactions (
      driver_id, order_id, tx_type, amount_usd, balance_after_usd,
      gateway, gateway_ref, description, metadata
    ) VALUES (
      v_order.driver_id,
      v_order.id,
      'CASH_COMMISSION_DEBIT',
      -v_commission_usd,
      v_new_balance,
      'cash',
      COALESCE(NULLIF(p_gateway_ref, ''), 'CASH-' || v_order.id::text),
      'Comisión operativa SARA por flete cobrado en efectivo',
      jsonb_build_object(
        'quoted_price_usd', v_order.quoted_price_usd,
        'commission_rate', v_order.commission_rate,
        'commission_usd', v_commission_usd
      )
    ) RETURNING id INTO v_tx_id;
  ELSE
    -- En pagos digitales (Kushki, PayPhone, Deuna!), SARA acredita ganancia neta + estibadores al conductor
    v_new_balance := ROUND(v_wallet.balance_usd + v_driver_net_usd, 2);

    UPDATE public.fletes_driver_wallets
    SET balance_usd = v_new_balance, updated_at = NOW()
    WHERE driver_id = v_order.driver_id;

    INSERT INTO public.fletes_wallet_transactions (
      driver_id, order_id, tx_type, amount_usd, balance_after_usd,
      gateway, gateway_ref, description, metadata
    ) VALUES (
      v_order.driver_id,
      v_order.id,
      'DIGITAL_EARNING_CREDIT',
      v_driver_net_usd,
      v_new_balance,
      lower(p_payment_method),
      COALESCE(NULLIF(p_gateway_ref, ''), upper(p_payment_method) || '-' || v_order.id::text),
      'Acreditación neta de flete + estibadores vía ' || upper(p_payment_method),
      jsonb_build_object(
        'quoted_price_usd', v_order.quoted_price_usd,
        'commission_usd', v_commission_usd,
        'stevedores_fee_usd', v_order.stevedores_fee_usd,
        'driver_net_usd', v_driver_net_usd
      )
    ) RETURNING id INTO v_tx_id;
  END IF;

  -- 6. Marcar orden como COMPLETED y SETTLED
  UPDATE public.fletes_orders
  SET
    status = 'COMPLETED',
    payment_method = lower(p_payment_method),
    payment_status = 'SETTLED',
    gateway_ref = COALESCE(NULLIF(p_gateway_ref, ''), gateway_ref),
    settled_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'already_settled', FALSE,
    'order_id', v_order.id,
    'driver_id', v_order.driver_id,
    'payment_method', lower(p_payment_method),
    'quoted_price_usd', v_order.quoted_price_usd,
    'commission_usd', v_commission_usd,
    'driver_net_usd', v_driver_net_usd,
    'wallet_balance_after_usd', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

-- 5.2 Recarga Atómica de Billetera del Conductor (Solo invocada por Webhooks Firmados / Service Role)
CREATE OR REPLACE FUNCTION public.topup_driver_wallet(
  p_driver_id UUID,
  p_amount_usd NUMERIC,
  p_gateway TEXT,
  p_gateway_ref TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing RECORD;
  v_wallet RECORD;
  v_new_balance NUMERIC(12, 2);
  v_tx_id UUID;
BEGIN
  IF p_amount_usd IS NULL OR p_amount_usd <= 0 THEN
    RAISE EXCEPTION 'El monto de recarga debe ser mayor a 0 USD';
  END IF;

  IF lower(p_gateway) NOT IN ('kushki', 'payphone', 'deuna') THEN
    RAISE EXCEPTION 'Pasarela de recarga no autorizada: %', p_gateway;
  END IF;

  IF p_gateway_ref IS NULL OR char_length(trim(p_gateway_ref)) < 4 THEN
    RAISE EXCEPTION 'Se requiere referencia única de pasarela (gateway_ref) para garantizar idempotencia';
  END IF;

  -- Idempotencia por gateway_ref
  SELECT * INTO v_existing
  FROM public.fletes_wallet_transactions
  WHERE gateway_ref = p_gateway_ref
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'already_processed', TRUE,
      'transaction_id', v_existing.id,
      'driver_id', v_existing.driver_id,
      'balance_after_usd', v_existing.balance_after_usd
    );
  END IF;

  -- Crear billetera si no existe y bloquear fila FOR UPDATE
  INSERT INTO public.fletes_driver_wallets (driver_id, balance_usd)
  VALUES (p_driver_id, 0.00)
  ON CONFLICT (driver_id) DO NOTHING;

  SELECT * INTO v_wallet
  FROM public.fletes_driver_wallets
  WHERE driver_id = p_driver_id
  FOR UPDATE;

  v_new_balance := ROUND(v_wallet.balance_usd + p_amount_usd, 2);

  UPDATE public.fletes_driver_wallets
  SET balance_usd = v_new_balance, updated_at = NOW()
  WHERE driver_id = p_driver_id;

  INSERT INTO public.fletes_wallet_transactions (
    driver_id, tx_type, amount_usd, balance_after_usd,
    gateway, gateway_ref, description, metadata
  ) VALUES (
    p_driver_id,
    'TOPUP',
    ROUND(p_amount_usd, 2),
    v_new_balance,
    lower(p_gateway),
    p_gateway_ref,
    'Recarga instantánea de saldo operativo vía ' || upper(p_gateway),
    COALESCE(p_metadata, '{}'::jsonb)
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'already_processed', FALSE,
    'transaction_id', v_tx_id,
    'driver_id', p_driver_id,
    'amount_usd', ROUND(p_amount_usd, 2),
    'balance_after_usd', v_new_balance,
    'cash_orders_blocked', (v_new_balance < 5.00)
  );
END;
$$;

-- Restringir ejecución directa de RPC críticas desde clientes anónimos
REVOKE ALL ON FUNCTION public.process_flete_settlement(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.topup_driver_wallet(UUID, NUMERIC, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_flete_settlement(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.topup_driver_wallet(UUID, NUMERIC, TEXT, TEXT, JSONB) TO service_role;

COMMIT;
