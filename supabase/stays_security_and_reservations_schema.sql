-- ==============================================================================
-- SARA STAYS - MIGRACIÓN DDL DE SEGURIDAD, RESERVAS Y PREVENCIÓN DE DOBLE RESERVA
-- Archivo: supabase/stays_security_and_reservations_schema.sql
-- 100% IDEMPOTENTE: Puede ejecutarse múltiples veces en Supabase sin errores
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Corregir y endurecer RLS en la tabla existente: alojamientos_airbnb
-- Habilitar RLS en caso de no estarlo
ALTER TABLE IF EXISTS alojamientos_airbnb ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas antes de recrearlas para evitar error 42710
DROP POLICY IF EXISTS "Gestion administrativa de alojamientos" ON alojamientos_airbnb;
DROP POLICY IF EXISTS "Lectura publica de alojamientos" ON alojamientos_airbnb;
DROP POLICY IF EXISTS "Lectura publica de alojamientos publicados" ON alojamientos_airbnb;
DROP POLICY IF EXISTS "Gestion administrativa restringida de alojamientos" ON alojamientos_airbnb;

-- Permitir lectura pública de alojamientos publicados
CREATE POLICY "Lectura publica de alojamientos publicados"
  ON alojamientos_airbnb FOR SELECT
  USING (publicado = true OR auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Permitir gestión (INSERT, UPDATE, DELETE) únicamente a usuarios autenticados administradores o service_role
CREATE POLICY "Gestion administrativa restringida de alojamientos"
  ON alojamientos_airbnb FOR ALL
  TO authenticated
  USING (
    auth.role() = 'service_role' OR
    (auth.jwt() -> 'app_metadata' ->> 'sara_master')::boolean = true OR
    (auth.jwt() -> 'user_metadata' ->> 'sara_master')::boolean = true
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    (auth.jwt() -> 'app_metadata' ->> 'sara_master')::boolean = true OR
    (auth.jwt() -> 'user_metadata' ->> 'sara_master')::boolean = true
  );

-- 3. Crear Tabla Relacional Dedicada: stays_reservations
CREATE TABLE IF NOT EXISTS stays_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_code text UNIQUE NOT NULL,
  stay_code text NOT NULL,
  stay_id uuid REFERENCES alojamientos_airbnb(id) ON DELETE SET NULL,
  guest_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  guest_identification text DEFAULT '',
  
  -- Fechas de estancia
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights integer NOT NULL CHECK (nights >= 1),
  guests_count integer NOT NULL DEFAULT 1 CHECK (guests_count >= 1),
  
  -- Tarifas monetarias en USD
  night_price numeric(10,2) NOT NULL CHECK (night_price >= 0),
  cleaning_fee numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (cleaning_fee >= 0),
  taxes_vat numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (taxes_vat >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Método y estado de pago
  payment_method text NOT NULL DEFAULT 'transferencia' CHECK (payment_method IN ('transferencia', 'tarjeta', 'anticipo', 'efectivo')),
  payment_status text NOT NULL DEFAULT 'pendiente' CHECK (payment_status IN ('pendiente', 'verificado', 'aprobado', 'rechazado', 'reembolsado')),
  reservation_status text NOT NULL DEFAULT 'confirmada_pendiente_verificacion' CHECK (reservation_status IN ('pendiente_pago', 'confirmada_pendiente_verificacion', 'confirmada', 'completada', 'cancelada')),
  
  -- Cerradura inteligente
  smart_lock_pin text DEFAULT '',
  receipt_url text DEFAULT '',
  notes text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Restricción básica de fechas
  CONSTRAINT check_dates_order CHECK (check_out > check_in)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_stays_res_code ON stays_reservations (reservation_code);
CREATE INDEX IF NOT EXISTS idx_stays_res_stay_code ON stays_reservations (stay_code);
CREATE INDEX IF NOT EXISTS idx_stays_res_guest_email ON stays_reservations (guest_email);
CREATE INDEX IF NOT EXISTS idx_stays_res_dates ON stays_reservations (check_in, check_out);

-- 4. Habilitar RLS en stays_reservations
ALTER TABLE stays_reservations ENABLE ROW LEVEL SECURITY;

-- Política de lectura: El huésped ve sus propias reservas, administradores ven todas
DROP POLICY IF EXISTS "Huesped consulta sus propias reservas" ON stays_reservations;
CREATE POLICY "Huesped consulta sus propias reservas"
  ON stays_reservations FOR SELECT
  TO authenticated
  USING (
    guest_user_id = auth.uid() OR
    guest_email = (auth.jwt() ->> 'email') OR
    (auth.jwt() -> 'app_metadata' ->> 'sara_master')::boolean = true OR
    (auth.jwt() -> 'user_metadata' ->> 'sara_master')::boolean = true
  );

-- Inserción permitida con sesión o service_role
DROP POLICY IF EXISTS "Insercion de reservas autenticadas" ON stays_reservations;
CREATE POLICY "Insercion de reservas autenticadas"
  ON stays_reservations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. Crear Tabla de Bloqueos de Calendario y Mantenimiento: stays_availability_blocks
CREATE TABLE IF NOT EXISTS stays_availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_code text NOT NULL,
  stay_id uuid REFERENCES alojamientos_airbnb(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL DEFAULT 'mantenimiento' CHECK (reason IN ('mantenimiento', 'reserva_externa_ical', 'bloqueo_propietario', 'limpieza')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT check_block_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_stays_blocks_stay ON stays_availability_blocks (stay_code, start_date, end_date);
ALTER TABLE stays_availability_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de bloqueos" ON stays_availability_blocks;
CREATE POLICY "Lectura publica de bloqueos"
  ON stays_availability_blocks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Gestion de bloqueos por administradores" ON stays_availability_blocks;
CREATE POLICY "Gestion de bloqueos por administradores"
  ON stays_availability_blocks FOR ALL
  TO authenticated
  USING (
    auth.role() = 'service_role' OR
    (auth.jwt() -> 'app_metadata' ->> 'sara_master')::boolean = true OR
    (auth.jwt() -> 'user_metadata' ->> 'sara_master')::boolean = true
  )
  WITH CHECK (
    auth.role() = 'service_role' OR
    (auth.jwt() -> 'app_metadata' ->> 'sara_master')::boolean = true OR
    (auth.jwt() -> 'user_metadata' ->> 'sara_master')::boolean = true
  );

-- 6. Crear Tabla Dedicada de Reseñas: stays_reviews
CREATE TABLE IF NOT EXISTS stays_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_code text NOT NULL,
  reservation_code text,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_city text DEFAULT 'Ecuador',
  author_country text DEFAULT 'Ecuador',
  author_flag text DEFAULT '🇪🇨',
  rating numeric(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  comment text NOT NULL,
  is_verified boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stays_reviews_stay ON stays_reviews (stay_code);
ALTER TABLE stays_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de resenas" ON stays_reviews;
CREATE POLICY "Lectura publica de resenas"
  ON stays_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insercion de resenas autenticadas" ON stays_reviews;
CREATE POLICY "Insercion de resenas autenticadas"
  ON stays_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);
