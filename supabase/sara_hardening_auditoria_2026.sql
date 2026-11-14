-- ==============================================================================
-- GRUPO SARA: MIGRACIÓN DE FORTALECIMIENTO TRANSACCIONAL Y AUDITORÍA 2026
-- Archivo: supabase/sara_hardening_auditoria_2026.sql
-- Propósito: Blindaje RLS en comprobantes SRI, eventos agénticos, e índices de
--            idempotencia transaccional y correlación.
-- 100% AUTOCONTENIDO E IDEMPOTENTE: Ejecutable en cualquier estado de base de datos
-- sin fallos por tablas o funciones faltantes.
-- ==============================================================================

-- 1. Asegurar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Helper Function Inmutable para Comprobar Privilegios Administrativos (Zero-Trust)
CREATE OR REPLACE FUNCTION public.is_admin_or_master()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT (
    coalesce(auth.role(), '') = 'service_role' OR
    coalesce((auth.jwt() -> 'app_metadata' ->> 'es_admin')::boolean, false) = true OR
    coalesce((auth.jwt() -> 'app_metadata' ->> 'sara_master')::boolean, false) = true OR
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'superadmin', 'tecnico')
  );
$$;

COMMENT ON FUNCTION public.is_admin_or_master() IS 'Validación Zero-Trust: Privilegios restringidos estrictamente a app_metadata y service_role de Supabase.';

-- 3. Tabla de Comprobantes Electrónicos SRI (Garantizar existencia antes de RLS)
CREATE TABLE IF NOT EXISTS public.comprobantes_electronicos_sri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave_acceso VARCHAR(49) UNIQUE NOT NULL,
    numero_comprobante VARCHAR(20) NOT NULL,
    ruc_emisor VARCHAR(13) NOT NULL,
    razon_social_emisor TEXT NOT NULL,
    identificacion_comprador VARCHAR(20) NOT NULL,
    razon_social_comprador TEXT,
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT now(),
    total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(50) NOT NULL DEFAULT 'AUTORIZADO',
    ambiente VARCHAR(1) NOT NULL DEFAULT '2',
    xml_autorizado TEXT,
    emitido_por_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asegurar RLS en comprobantes_electronicos_sri
ALTER TABLE public.comprobantes_electronicos_sri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura comprobantes SRI propios o administracion" ON public.comprobantes_electronicos_sri;
CREATE POLICY "Lectura comprobantes SRI propios o administracion"
  ON public.comprobantes_electronicos_sri FOR SELECT
  TO authenticated
  USING (
    emitido_por_user_id = auth.uid() OR
    ruc_emisor = (auth.jwt() -> 'app_metadata' ->> 'ruc') OR
    public.is_admin_or_master()
  );

DROP POLICY IF EXISTS "Insercion comprobantes SRI autorizados" ON public.comprobantes_electronicos_sri;
CREATE POLICY "Insercion comprobantes SRI autorizados"
  ON public.comprobantes_electronicos_sri FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'service_role' OR
    public.is_admin_or_master() OR
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('emisor_facturacion', 'empresa', 'contador')
  );

CREATE INDEX IF NOT EXISTS idx_sri_comprobantes_ruc_clave 
  ON public.comprobantes_electronicos_sri (ruc_emisor, clave_acceso);

-- 4. Tabla de Eventos y Memoria Multiagente (SARA-BRAIN)
CREATE TABLE IF NOT EXISTS public.sara_agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.sara_agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    proyecto_id UUID NULL,
    namespace VARCHAR(50) NOT NULL,
    memory_key VARCHAR(100) NOT NULL,
    memory_value JSONB NOT NULL,
    confidence_score NUMERIC(5,4) DEFAULT 1.0000,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_agent_memory_key UNIQUE (correlation_id, namespace, memory_key)
);

ALTER TABLE public.sara_agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_agent_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura eventos agénticos para administradores y analistas" ON public.sara_agent_events;
CREATE POLICY "Lectura eventos agénticos para administradores y analistas"
  ON public.sara_agent_events FOR SELECT
  TO authenticated
  USING (
    public.is_admin_or_master() OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Insercion eventos solo por backend o administradores" ON public.sara_agent_events;
CREATE POLICY "Insercion eventos solo por backend o administradores"
  ON public.sara_agent_events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'service_role' OR
    public.is_admin_or_master()
  );

DROP POLICY IF EXISTS "Lectura memoria agentica administradores" ON public.sara_agent_memory;
CREATE POLICY "Lectura memoria agentica administradores"
  ON public.sara_agent_memory FOR SELECT
  TO authenticated
  USING (
    public.is_admin_or_master() OR
    auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Modificacion memoria agentica backend" ON public.sara_agent_memory;
CREATE POLICY "Modificacion memoria agentica backend"
  ON public.sara_agent_memory FOR ALL
  TO authenticated
  USING (
    public.is_admin_or_master() OR
    auth.role() = 'service_role'
  );

-- 5. Tablas de Órdenes de Pago y Transacciones
CREATE TABLE IF NOT EXISTS public.ordenes_pago (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    modulo VARCHAR(50) NOT NULL,
    referencia_id VARCHAR(255) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transacciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID REFERENCES public.ordenes_pago(id) ON DELETE CASCADE,
    metodo_pago VARCHAR(50) NOT NULL,
    monto_pagado NUMERIC(12, 2) NOT NULL,
    stripe_session_id VARCHAR(255),
    comprobante_url TEXT,
    estado_aprobacion VARCHAR(50) DEFAULT 'pendiente',
    observaciones_admin TEXT,
    fecha_pago TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Asegurar columna stripe_session_id en transacciones por si la tabla ya existía sin ella
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'transacciones' 
      AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE public.transacciones ADD COLUMN stripe_session_id VARCHAR(255);
  END IF;
END $$;

-- 6. Índices para Alto Rendimiento, Búsqueda de Correlación e Idempotencia
CREATE INDEX IF NOT EXISTS idx_transacciones_stripe_session 
  ON public.transacciones (stripe_session_id) 
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ordenes_pago_user_modulo 
  ON public.ordenes_pago (user_id, modulo, estado);

CREATE INDEX IF NOT EXISTS idx_sara_events_correlation 
  ON public.sara_agent_events (correlation_id, created_at DESC);
