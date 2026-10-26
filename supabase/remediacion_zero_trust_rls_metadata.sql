-- ==============================================================================
-- GRUPO SARA: REMEDIACIÓN ZERO-TRUST DE POLÍTICAS RLS (POSTGRESQL / SUPABASE)
-- Archivo: supabase/remediacion_zero_trust_rls_metadata.sql
-- Propósito: Erradica la confianza en `user_metadata` manipulable por el cliente.
--            Establece verificación estricta sobre `app_metadata` y roles en BD.
-- 100% IDEMPOTENTE: Ejecutable múltiples veces sin errores.
-- ==============================================================================

-- 1. Helper Function Inmutable para Comprobar Privilegios Administrativos
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

-- 2. Corregir Políticas en alojamientos_airbnb
ALTER TABLE IF EXISTS public.alojamientos_airbnb ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion administrativa restringida de alojamientos" ON public.alojamientos_airbnb;
DROP POLICY IF EXISTS "Lectura publica de alojamientos publicados" ON public.alojamientos_airbnb;

CREATE POLICY "Lectura publica de alojamientos publicados"
  ON public.alojamientos_airbnb FOR SELECT
  USING (publicado = true OR public.is_admin_or_master() OR auth.role() = 'authenticated');

CREATE POLICY "Gestion administrativa restringida de alojamientos"
  ON public.alojamientos_airbnb FOR ALL
  TO authenticated
  USING (public.is_admin_or_master())
  WITH CHECK (public.is_admin_or_master());

-- 3. Corregir Políticas en stays_reservations
ALTER TABLE IF EXISTS public.stays_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Huesped consulta sus propias reservas" ON public.stays_reservations;
CREATE POLICY "Huesped consulta sus propias reservas"
  ON public.stays_reservations FOR SELECT
  TO authenticated
  USING (
    guest_user_id = auth.uid() OR
    guest_email = (auth.jwt() ->> 'email') OR
    public.is_admin_or_master()
  );

DROP POLICY IF EXISTS "Gestion administrativa de reservas stays" ON public.stays_reservations;
CREATE POLICY "Gestion administrativa de reservas stays"
  ON public.stays_reservations FOR ALL
  TO authenticated
  USING (public.is_admin_or_master())
  WITH CHECK (public.is_admin_or_master());

-- 4. Corregir Políticas en Proyectos y Finanzas
ALTER TABLE IF EXISTS public.proyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso seguro proyectos por empresa o cliente" ON public.proyectos;
CREATE POLICY "Acceso seguro proyectos por empresa o cliente"
  ON public.proyectos FOR SELECT
  TO authenticated
  USING (
    cliente_id = auth.uid() OR
    empresa_id = ((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid) OR
    public.is_admin_or_master()
  );

DROP POLICY IF EXISTS "Modificacion proyectos por administradores o residentes" ON public.proyectos;
CREATE POLICY "Modificacion proyectos por administradores o residentes"
  ON public.proyectos FOR ALL
  TO authenticated
  USING (public.is_admin_or_master())
  WITH CHECK (public.is_admin_or_master());

-- 5. Blindaje de Tablas Financieras y Escrow
ALTER TABLE IF EXISTS public.ordenes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transacciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus propias ordenes de pago" ON public.ordenes_pago;
CREATE POLICY "Usuarios ven sus propias ordenes de pago"
  ON public.ordenes_pago FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_master());

DROP POLICY IF EXISTS "Gestion administrativa de ordenes de pago" ON public.ordenes_pago;
CREATE POLICY "Gestion administrativa de ordenes de pago"
  ON public.ordenes_pago FOR ALL
  TO authenticated
  USING (public.is_admin_or_master())
  WITH CHECK (public.is_admin_or_master());

DROP POLICY IF EXISTS "Usuarios ven sus transacciones" ON public.transacciones;
CREATE POLICY "Usuarios ven sus transacciones"
  ON public.transacciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ordenes_pago op
      WHERE op.id = transacciones.orden_id AND op.user_id = auth.uid()
    ) OR public.is_admin_or_master()
  );

-- Comentario inmutable de auditoría
COMMENT ON FUNCTION public.is_admin_or_master() IS 'Validación Zero-Trust: Privilegios restringidos estrictamente a app_metadata y service_role de Supabase.';
