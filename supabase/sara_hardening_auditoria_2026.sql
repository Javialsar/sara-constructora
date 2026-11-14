-- ==============================================================================
-- GRUPO SARA: MIGRACIÓN DE FORTALECIMIENTO TRANSACCIONAL Y AUDITORÍA 2026
-- Archivo: supabase/sara_hardening_auditoria_2026.sql
-- Propósito: Blindaje RLS en comprobantes SRI, eventos agénticos, e índices de
--            idempotencia transaccional y correlación.
-- 100% IDEMPOTENTE: Ejecutable múltiples veces sin errores.
-- ==============================================================================

-- 1. Asegurar extensión pgcrypto para UUIDs y funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar RLS en comprobantes electrónicos SRI
ALTER TABLE IF EXISTS public.comprobantes_electronicos_sri ENABLE ROW LEVEL SECURITY;

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

-- 3. Asegurar RLS en Eventos y Memoria Multiagente (SARA-BRAIN)
ALTER TABLE IF EXISTS public.sara_agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sara_agent_memory ENABLE ROW LEVEL SECURITY;

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

-- 4. Índices para Alto Rendimiento, Búsqueda de Correlación e Idempotencia
CREATE INDEX IF NOT EXISTS idx_transacciones_stripe_session 
  ON public.transacciones (stripe_session_id) 
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ordenes_pago_user_modulo 
  ON public.ordenes_pago (user_id, modulo, estado);

CREATE INDEX IF NOT EXISTS idx_sara_events_correlation 
  ON public.sara_agent_events (correlation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sri_comprobantes_ruc_clave 
  ON public.comprobantes_electronicos_sri (ruc_emisor, clave_acceso);
