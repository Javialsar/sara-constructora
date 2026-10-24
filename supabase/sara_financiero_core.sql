-- ==============================================================================
-- SARA CONSTRUCTORA - SISTEMA FINANCIERO INTEGRAL CORE (POSTGRESQL / SUPABASE DDL)
-- Módulo: SARA FINANCIERO / TESORERÍA / CXC / CXP / CONCILIACIÓN
-- ==============================================================================

-- 1. TABLA: CUENTAS DE TESORERÍA (Cajas y Cuentas Bancarias)
CREATE TABLE IF NOT EXISTS public.tesoreria_cuentas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('banco', 'caja_chica', 'caja_matriz', 'fideicomiso_escrow', 'tarjeta_corporativa')),
    institucion_bancaria VARCHAR(100), -- Ej: 'Banco Pichincha', 'Banco de Guayaquil'
    numero_cuenta VARCHAR(50),
    moneda VARCHAR(3) NOT NULL DEFAULT 'USD',
    saldo_inicial NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    saldo_actual NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    saldo_conciliado NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    titular_razon_social VARCHAR(150) DEFAULT 'SARA CONSTRUCTORA CIA. LTDA.',
    ruc_titular VARCHAR(13) DEFAULT '0190458923001',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA: MOVIMIENTOS DE TESORERÍA (Libro Banco / Caja)
CREATE TABLE IF NOT EXISTS public.tesoreria_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_id UUID NOT NULL REFERENCES public.tesoreria_cuentas(id) ON DELETE RESTRICT,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('ingreso_operativo', 'egreso_operativo', 'transferencia_salida', 'transferencia_entrada', 'ajuste_conciliacion')),
    monto NUMERIC(14,2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'USD',
    fecha_operacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    concepto VARCHAR(255) NOT NULL,
    referencia_bancaria VARCHAR(100),
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    categoria VARCHAR(80) NOT NULL DEFAULT 'general',
    comprobante_url TEXT,
    cuenta_destino_transferencia_id UUID REFERENCES public.tesoreria_cuentas(id) ON DELETE SET NULL,
    movimiento_relacionado_id UUID REFERENCES public.tesoreria_movimientos(id) ON DELETE SET NULL,
    conciliado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_conciliacion TIMESTAMPTZ,
    responsable_id UUID,
    estado VARCHAR(30) NOT NULL DEFAULT 'confirmado' CHECK (estado IN ('borrador', 'confirmado', 'anulado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tesoreria_mov_cuenta ON public.tesoreria_movimientos(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_tesoreria_mov_fecha ON public.tesoreria_movimientos(fecha_operacion DESC);
CREATE INDEX IF NOT EXISTS idx_tesoreria_mov_proy ON public.tesoreria_movimientos(proyecto_id);

-- 3. TABLA: CUENTAS POR COBRAR (Clientes / Contratos / Hitos)
CREATE TABLE IF NOT EXISTS public.cuentas_por_cobrar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE RESTRICT,
    cliente_nombre VARCHAR(150) NOT NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    proyecto_nombre VARCHAR(150),
    concepto VARCHAR(255) NOT NULL, -- Ej: 'Planilla de Avance N° 2 - Estructura Hormigón'
    numero_documento VARCHAR(50) NOT NULL, -- Ej: 'FAC-001-002-00045' o 'PLN-02'
    tipo_documento VARCHAR(40) NOT NULL DEFAULT 'factura_venta' CHECK (tipo_documento IN ('factura_venta', 'planilla_obra', 'anticipo_contractual', 'cuota_inmobiliaria')),
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    monto_total NUMERIC(14,2) NOT NULL CHECK (monto_total > 0),
    anticipo_aplicado NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    monto_cobrado NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    saldo_pendiente NUMERIC(14,2) NOT NULL CHECK (saldo_pendiente >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'USD',
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'parcial', 'cobrado', 'vencido', 'en_disputa', 'anulado')),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cxc_cliente ON public.cuentas_por_cobrar(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cxc_proyecto ON public.cuentas_por_cobrar(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_cxc_estado ON public.cuentas_por_cobrar(estado);

-- 4. TABLA: ABONOS / COBROS A CUENTAS POR COBRAR
CREATE TABLE IF NOT EXISTS public.cuentas_por_cobrar_abonos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_cobrar_id UUID NOT NULL REFERENCES public.cuentas_por_cobrar(id) ON DELETE CASCADE,
    tesoreria_movimiento_id UUID REFERENCES public.tesoreria_movimientos(id) ON DELETE SET NULL,
    monto_abono NUMERIC(14,2) NOT NULL CHECK (monto_abono > 0),
    fecha_cobro DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'transferencia' CHECK (metodo_pago IN ('transferencia', 'deposito', 'cheque', 'efectivo', 'tarjeta')),
    referencia VARCHAR(100),
    comprobante_url TEXT,
    saldo_anterior NUMERIC(14,2) NOT NULL,
    saldo_posterior NUMERIC(14,2) NOT NULL,
    registrado_por UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: CUENTAS POR PAGAR (Proveedores / Contratistas / SRI)
CREATE TABLE IF NOT EXISTS public.cuentas_por_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE RESTRICT,
    proveedor_nombre VARCHAR(150) NOT NULL,
    proveedor_ruc VARCHAR(13),
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    proyecto_nombre VARCHAR(150),
    orden_compra_id UUID REFERENCES public.compras_ordenes(id) ON DELETE SET NULL,
    factura_sri_id UUID REFERENCES public.facturas_sri(id) ON DELETE SET NULL,
    numero_factura VARCHAR(50) NOT NULL, -- Ej: '001-002-00034567'
    descripcion VARCHAR(255) NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    monto_iva NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    monto_total_bruto NUMERIC(14,2) NOT NULL CHECK (monto_total_bruto > 0),
    retencion_renta_monto NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    retencion_iva_monto NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_retenciones NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    monto_neto_pagar NUMERIC(14,2) NOT NULL CHECK (monto_neto_pagar > 0),
    monto_pagado NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    saldo_pendiente NUMERIC(14,2) NOT NULL CHECK (saldo_pendiente >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'USD',
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('borrador', 'aprobada', 'programada', 'parcial', 'pagada', 'vencida', 'en_disputa', 'anulada')),
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_proveedor_factura UNIQUE (proveedor_id, numero_factura)
);

CREATE INDEX IF NOT EXISTS idx_cxp_proveedor ON public.cuentas_por_pagar(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_cxp_proyecto ON public.cuentas_por_pagar(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_cxp_estado ON public.cuentas_por_pagar(estado);

-- 6. TABLA: PAGOS A CUENTAS POR PAGAR (Abonos a Proveedores)
CREATE TABLE IF NOT EXISTS public.cuentas_por_pagar_pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_pagar_id UUID NOT NULL REFERENCES public.cuentas_por_pagar(id) ON DELETE CASCADE,
    tesoreria_movimiento_id UUID REFERENCES public.tesoreria_movimientos(id) ON DELETE SET NULL,
    monto_pago NUMERIC(14,2) NOT NULL CHECK (monto_pago > 0),
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'transferencia' CHECK (metodo_pago IN ('transferencia', 'cheque', 'debito_bancario', 'efectivo')),
    referencia VARCHAR(100),
    cuenta_bancaria_origen_id UUID REFERENCES public.tesoreria_cuentas(id) ON DELETE RESTRICT,
    saldo_anterior NUMERIC(14,2) NOT NULL,
    saldo_posterior NUMERIC(14,2) NOT NULL,
    aprobado_por UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABLA: CONCILIACIONES BANCARIAS
CREATE TABLE IF NOT EXISTS public.conciliaciones_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_id UUID NOT NULL REFERENCES public.tesoreria_cuentas(id) ON DELETE RESTRICT,
    fecha_corte DATE NOT NULL,
    saldo_segun_banco NUMERIC(14,2) NOT NULL,
    saldo_segun_libros NUMERIC(14,2) NOT NULL,
    diferencia NUMERIC(14,2) GENERATED ALWAYS AS (saldo_segun_banco - saldo_segun_libros) STORED,
    total_partidas_conciliadas INTEGER NOT NULL DEFAULT 0,
    total_partidas_pendientes INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'en_proceso' CHECK (estado IN ('en_proceso', 'conciliada_cuadrada', 'con_diferencias', 'cerrada')),
    archivo_extracto_nombre VARCHAR(255),
    notas TEXT,
    responsable_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABLA: HISTORIAL DE MODIFICACIONES PRESUPUESTARIAS (Presupuesto Vigente vs Original)
CREATE TABLE IF NOT EXISTS public.presupuestos_modificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    presupuesto_id UUID REFERENCES public.presupuestos_reales(id) ON DELETE CASCADE,
    numero_modificacion VARCHAR(50) NOT NULL, -- Ej: 'MOD-001-VOLUMEN-HORMIGON'
    tipo_modificacion VARCHAR(40) NOT NULL CHECK (tipo_modificacion IN ('adicional_obra', 'reajuste_precios_polinomica', 'deductivo', 'imprevisto_aprobado')),
    monto_anterior NUMERIC(14,2) NOT NULL,
    monto_variacion NUMERIC(14,2) NOT NULL,
    monto_nuevo_vigente NUMERIC(14,2) NOT NULL,
    justificacion_tecnica TEXT NOT NULL,
    fiscalizador_aprobador VARCHAR(150),
    fecha_aprobacion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'aprobado' CHECK (estado IN ('propuesto', 'aprobado', 'rechazado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) ZERO-TRUST
-- ==============================================================================
ALTER TABLE public.tesoreria_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tesoreria_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas_por_cobrar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas_por_cobrar_abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas_por_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas_por_pagar_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliaciones_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos_modificaciones ENABLE ROW LEVEL SECURITY;

-- Cuentas de Tesorería: Solo personal financiero y administrativo autenticado
DROP POLICY IF EXISTS "tesoreria_cuentas_select_auth" ON public.tesoreria_cuentas;
CREATE POLICY "tesoreria_cuentas_select_auth" ON public.tesoreria_cuentas
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

DROP POLICY IF EXISTS "tesoreria_cuentas_manage_admin" ON public.tesoreria_cuentas;
CREATE POLICY "tesoreria_cuentas_manage_admin" ON public.tesoreria_cuentas
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'director_financiero', 'tesorero')
  );

-- Movimientos de Tesorería (Transacciones Bancarias): Solo financiero y proyectos del tenant
DROP POLICY IF EXISTS "tesoreria_movimientos_select_auth" ON public.tesoreria_movimientos;
CREATE POLICY "tesoreria_movimientos_select_auth" ON public.tesoreria_movimientos
  FOR SELECT TO authenticated
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

DROP POLICY IF EXISTS "tesoreria_movimientos_insert_auth" ON public.tesoreria_movimientos;
CREATE POLICY "tesoreria_movimientos_insert_auth" ON public.tesoreria_movimientos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

-- Cuentas por Cobrar (CxC): Aislamiento cliente/tenant y control financiero
DROP POLICY IF EXISTS "cxc_select_auth" ON public.cuentas_por_cobrar;
CREATE POLICY "cxc_select_auth" ON public.cuentas_por_cobrar
  FOR SELECT TO authenticated
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

DROP POLICY IF EXISTS "cxc_manage_auth" ON public.cuentas_por_cobrar;
CREATE POLICY "cxc_manage_auth" ON public.cuentas_por_cobrar
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

-- Cuentas por Pagar (CxP): Proveedores autorizados, compras y financiero
DROP POLICY IF EXISTS "cxp_select_auth" ON public.cuentas_por_pagar;
CREATE POLICY "cxp_select_auth" ON public.cuentas_por_pagar
  FOR SELECT TO authenticated
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

DROP POLICY IF EXISTS "cxp_manage_auth" ON public.cuentas_por_pagar;
CREATE POLICY "cxp_manage_auth" ON public.cuentas_por_pagar
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'superadmin', 'contador_constructora', 'director_financiero', 'gerente_financiero', 'tesorero'
    )
  );

-- Conciliaciones Bancarias y Modificaciones Presupuestarias
CREATE POLICY "conciliaciones_manage_auth" ON public.conciliaciones_bancarias
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'director_financiero', 'contador_constructora', 'tesorero')
  );

CREATE POLICY "presupuestos_modificaciones_manage_auth" ON public.presupuestos_modificaciones
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'es_admin')::boolean = true
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'director_financiero', 'ingeniero_residente', 'contador_constructora')
  );
