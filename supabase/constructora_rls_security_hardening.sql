-- ==============================================================================
-- GRUPO SARA • SARA-CONSTRUCTORA: HARDENING DE SEGURIDAD RLS & GOBIERNO ZERO-TRUST
-- Multi-Tenancy, Aislamiento por Organización/Tenant y Políticas Basadas en Roles (RBAC)
-- Tablas Críticas Auditadas:
-- 1. proyectos
-- 2. cotizaciones / compras_cotizaciones
-- 3. requisiciones_compra / compras_requisiciones
-- 4. ordenes_compra / compras_ordenes
-- 5. cuentas_por_cobrar
-- 6. cuentas_por_pagar
-- 7. transacciones_bancarias / tesoreria_movimientos
-- ==============================================================================

-- ==============================================================================
-- 1. TABLA: PROYECTOS (Aislamiento Multi-Tenant y Obras Públicas vs Privadas)
-- ==============================================================================
ALTER TABLE IF EXISTS public.proyectos ADD COLUMN IF NOT EXISTS es_publico BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE IF EXISTS public.proyectos ADD COLUMN IF NOT EXISTS organizacion_id UUID NULL;

ALTER TABLE IF EXISTS public.proyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proyectos_select_public" ON public.proyectos;
DROP POLICY IF EXISTS "proyectos_select_own" ON public.proyectos;
DROP POLICY IF EXISTS "proyectos_insert_authorized" ON public.proyectos;
DROP POLICY IF EXISTS "proyectos_update_authorized" ON public.proyectos;
DROP POLICY IF EXISTS "proyectos_delete_authorized" ON public.proyectos;

-- Lectura pública: Solo obras de vitrina/portafolio marcadas explícitamente como públicas
CREATE POLICY "proyectos_select_public" ON public.proyectos
  FOR SELECT
  USING (es_publico = true);

-- Lectura privada: Clientes asignados, miembros del tenant u operadores autorizados
CREATE POLICY "proyectos_select_own" ON public.proyectos
  FOR SELECT
  TO authenticated
  USING (
    -- Cliente directo asignado
    auth.uid() = cliente_id
    OR EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = proyectos.cliente_id
      AND (c.auth_id = auth.uid() OR c.id = auth.uid())
    )
    -- O pertenece a la misma organización/tenant
    OR (
      organizacion_id IS NOT NULL 
      AND organizacion_id = COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
        (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid,
        (auth.jwt() ->> 'empresa_id')::uuid
      )
    )
    -- O posee rol administrativo o directivo de obra
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'representante_legal', 'ingeniero_residente', 'director_financiero'
    )
  );

-- Mutaciones en Proyectos: Solo personal técnico/directivo del tenant
CREATE POLICY "proyectos_insert_authorized" ON public.proyectos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'profesional_constructora', 'ingeniero_residente')
  );

CREATE POLICY "proyectos_update_authorized" ON public.proyectos
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'profesional_constructora', 'ingeniero_residente')
  );

-- ==============================================================================
-- 2. TABLA: COTIZACIONES / COMPRAS_COTIZACIONES
-- ==============================================================================
ALTER TABLE IF EXISTS public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compras_cotizaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cotizaciones_select_policy" ON public.cotizaciones;
DROP POLICY IF EXISTS "cotizaciones_manage_policy" ON public.cotizaciones;
DROP POLICY IF EXISTS "compras_cotizaciones_select_tenant" ON public.compras_cotizaciones;
DROP POLICY IF EXISTS "compras_cotizaciones_manage_staff" ON public.compras_cotizaciones;

-- Para tabla cotizaciones pública/comercial
CREATE POLICY "cotizaciones_select_policy" ON public.cotizaciones
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'jefe_compras', 'tecnico')
  );

CREATE POLICY "cotizaciones_manage_policy" ON public.cotizaciones
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'jefe_compras', 'profesional_constructora')
  );

-- Para tabla compras_cotizaciones (adquisiciones de obra)
CREATE POLICY "compras_cotizaciones_select_tenant" ON public.compras_cotizaciones
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'jefe_compras', 'contador_constructora', 'ingeniero_residente')
    OR EXISTS (
      SELECT 1 FROM public.compras_requisiciones r
      JOIN public.proyectos p ON p.id = r.proyecto_id
      WHERE r.id = compras_cotizaciones.requisicion_id
      AND (
        p.cliente_id = auth.uid()
        OR p.organizacion_id = COALESCE(
          (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
          (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "compras_cotizaciones_manage_staff" ON public.compras_cotizaciones
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'jefe_compras', 'compras')
  );

-- ==============================================================================
-- 3. TABLA: REQUISICIONES_COMPRA / COMPRAS_REQUISICIONES
-- ==============================================================================
ALTER TABLE IF EXISTS public.requisiciones_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compras_requisiciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requisiciones_select_policy" ON public.compras_requisiciones;
DROP POLICY IF EXISTS "requisiciones_insert_policy" ON public.compras_requisiciones;
DROP POLICY IF EXISTS "requisiciones_update_policy" ON public.compras_requisiciones;

CREATE POLICY "requisiciones_select_policy" ON public.compras_requisiciones
  FOR SELECT
  TO authenticated
  USING (
    solicitante_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'jefe_compras', 'contador_constructora', 'ingeniero_residente', 'bodeguero_constructora'
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = compras_requisiciones.proyecto_id
      AND (
        p.cliente_id = auth.uid()
        OR p.organizacion_id = COALESCE(
          (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
          (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "requisiciones_insert_policy" ON public.compras_requisiciones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    solicitante_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'ingeniero_residente', 'profesional_constructora', 'jefe_compras'
    )
  );

CREATE POLICY "requisiciones_update_policy" ON public.compras_requisiciones
  FOR UPDATE
  TO authenticated
  USING (
    (solicitante_id = auth.uid() AND estado = 'BORRADOR')
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'jefe_compras', 'ingeniero_residente')
  );

-- ==============================================================================
-- 4. TABLA: ORDENES_COMPRA / COMPRAS_ORDENES
-- ==============================================================================
ALTER TABLE IF EXISTS public.ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compras_ordenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ordenes_compra_select_policy" ON public.compras_ordenes;
DROP POLICY IF EXISTS "ordenes_compra_manage_policy" ON public.compras_ordenes;

CREATE POLICY "ordenes_compra_select_policy" ON public.compras_ordenes
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'jefe_compras', 'contador_constructora', 'ingeniero_residente', 'bodeguero_constructora', 'director_financiero'
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = compras_ordenes.proyecto_id
      AND (
        p.cliente_id = auth.uid()
        OR p.organizacion_id = COALESCE(
          (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
          (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "ordenes_compra_manage_policy" ON public.compras_ordenes
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'jefe_compras', 'contador_constructora')
  );

-- ==============================================================================
-- 5. TABLA: CUENTAS POR COBRAR (CxC)
-- ==============================================================================
ALTER TABLE IF EXISTS public.cuentas_por_cobrar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cuentas_por_cobrar_abonos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cxc_select_tenant_role" ON public.cuentas_por_cobrar;
DROP POLICY IF EXISTS "cxc_manage_financial_staff" ON public.cuentas_por_cobrar;

CREATE POLICY "cxc_select_tenant_role" ON public.cuentas_por_cobrar
  FOR SELECT
  TO authenticated
  USING (
    cliente_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = cuentas_por_cobrar.proyecto_id
      AND (
        p.cliente_id = auth.uid()
        OR p.organizacion_id = COALESCE(
          (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
          (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "cxc_manage_financial_staff" ON public.cuentas_por_cobrar
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

-- ==============================================================================
-- 6. TABLA: CUENTAS POR PAGAR (CxP)
-- ==============================================================================
ALTER TABLE IF EXISTS public.cuentas_por_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cuentas_por_pagar_pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cxp_select_tenant_role" ON public.cuentas_por_pagar;
DROP POLICY IF EXISTS "cxp_manage_financial_staff" ON public.cuentas_por_pagar;

CREATE POLICY "cxp_select_tenant_role" ON public.cuentas_por_pagar
  FOR SELECT
  TO authenticated
  USING (
    proveedor_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero', 'jefe_compras'
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = cuentas_por_pagar.proyecto_id
      AND p.organizacion_id = COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
        (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      )
    )
  );

CREATE POLICY "cxp_manage_financial_staff" ON public.cuentas_por_pagar
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

-- ==============================================================================
-- 7. TABLA: TRANSACCIONES BANCARIAS / TESORERIA_MOVIMIENTOS / TESORERIA_CUENTAS
-- ==============================================================================
ALTER TABLE IF EXISTS public.transacciones_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tesoreria_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tesoreria_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conciliaciones_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tesoreria_cuentas_select_policy" ON public.tesoreria_cuentas;
DROP POLICY IF EXISTS "tesoreria_cuentas_manage_policy" ON public.tesoreria_cuentas;
DROP POLICY IF EXISTS "tesoreria_movimientos_select_policy" ON public.tesoreria_movimientos;
DROP POLICY IF EXISTS "tesoreria_movimientos_insert_policy" ON public.tesoreria_movimientos;

CREATE POLICY "tesoreria_cuentas_select_policy" ON public.tesoreria_cuentas
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

CREATE POLICY "tesoreria_cuentas_manage_policy" ON public.tesoreria_cuentas
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'director_financiero', 'tesorero')
  );

CREATE POLICY "tesoreria_movimientos_select_policy" ON public.tesoreria_movimientos
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = tesoreria_movimientos.proyecto_id
      AND p.organizacion_id = COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
        (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
      )
    )
  );

CREATE POLICY "tesoreria_movimientos_insert_policy" ON public.tesoreria_movimientos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );
