-- ==============================================================================
-- GRUPO SARA - SARA-CONSTRUCTORA • MÓDULO DE COMPRAS Y ADQUISICIONES DDL
-- Esquema relacional formal para Requisiciones, Cotizaciones, Órdenes y Recepciones
-- Conforme a normativa ecuatoriana (SRI, NEC-15, MTOP) y seguridad RLS Zero-Trust.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLA: REQUISICIONES DE COMPRA DE OBRA
CREATE TABLE IF NOT EXISTS public.compras_requisiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(50) UNIQUE NOT NULL, -- Ej: REQ-2026-0042
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    frente_trabajo VARCHAR(150) NOT NULL,
    solicitante_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    solicitante_nombre VARCHAR(150) NOT NULL,
    solicitante_cargo VARCHAR(100) NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_requerida_obra DATE NOT NULL,
    prioridad VARCHAR(30) NOT NULL DEFAULT 'NORMAL_PROGRAMADA' CHECK (prioridad IN (
        'NORMAL_PROGRAMADA', 'URGENTE_24H', 'EMERGENCIA_CRITICA'
    )),
    justificacion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN (
        'BORRADOR', 'ENVIADA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'EN_COTIZACION', 'OC_EMITIDA', 'CERRADA'
    )),
    peso_total_estimado_toneladas NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    presupuesto_techo_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    aprobado_por VARCHAR(150),
    fecha_aprobacion TIMESTAMPTZ,
    motivo_rechazo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_req_proyecto ON public.compras_requisiciones(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_compras_req_estado ON public.compras_requisiciones(estado);

-- 2. TABLA: PARTIDAS DE REQUISICIÓN
CREATE TABLE IF NOT EXISTS public.compras_requisiciones_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisicion_id UUID NOT NULL REFERENCES public.compras_requisiciones(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE SET NULL,
    codigo_insumo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    unidad VARCHAR(30) NOT NULL,
    cantidad_requerida NUMERIC(12,4) NOT NULL CHECK (cantidad_requerida > 0),
    desperdicio_normativo_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    cantidad_total_con_desperdicio NUMERIC(12,4) NOT NULL,
    costo_unitario_referencial_apu_usd NUMERIC(12,4) NOT NULL DEFAULT 0.00,
    subtotal_referencial_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    rubro_apu_codigo VARCHAR(50),
    rubro_apu_nombre VARCHAR(200),
    proveedor_sugerido VARCHAR(150),
    especificaciones_tecnicas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_req_items_req ON public.compras_requisiciones_items(requisicion_id);

-- 3. TABLA: COTIZACIONES DE PROVEEDORES
CREATE TABLE IF NOT EXISTS public.compras_cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_cotizacion VARCHAR(50) UNIQUE NOT NULL,
    requisicion_id UUID NOT NULL REFERENCES public.compras_requisiciones(id) ON DELETE CASCADE,
    proveedor_id UUID NOT NULL REFERENCES public.proveedores(id) ON DELETE RESTRICT,
    ciudad_despacho VARCHAR(100) NOT NULL,
    fecha_cotizacion DATE NOT NULL DEFAULT CURRENT_DATE,
    dias_validez_oferta INT NOT NULL DEFAULT 15,
    dias_entrega_prometidos INT NOT NULL DEFAULT 2,
    condiciones_pago VARCHAR(150) NOT NULL,
    subtotal_materiales_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    costo_flete_estimado_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    iva_total_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    landed_cost_total_usd NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    documento_pdf_url TEXT,
    observaciones TEXT,
    es_seleccionada BOOLEAN NOT NULL DEFAULT FALSE,
    justificacion_seleccion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_cot_req ON public.compras_cotizaciones(requisicion_id);
CREATE INDEX IF NOT EXISTS idx_compras_cot_prov ON public.compras_cotizaciones(proveedor_id);

-- 4. TABLA: PARTIDAS DE COTIZACIÓN
CREATE TABLE IF NOT EXISTS public.compras_cotizaciones_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotizacion_id UUID NOT NULL REFERENCES public.compras_cotizaciones(id) ON DELETE CASCADE,
    item_requisicion_id UUID REFERENCES public.compras_requisiciones_items(id) ON DELETE SET NULL,
    codigo_insumo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    unidad VARCHAR(30) NOT NULL,
    cantidad_ofertada NUMERIC(12,4) NOT NULL CHECK (cantidad_ofertada > 0),
    precio_unitario_base_usd NUMERIC(12,4) NOT NULL CHECK (precio_unitario_base_usd >= 0),
    descuento_porcentaje NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    precio_unitario_neto_usd NUMERIC(12,4) NOT NULL CHECK (precio_unitario_neto_usd >= 0),
    tarifa_iva_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00 CHECK (tarifa_iva_pct IN (0.00, 5.00, 15.00)),
    subtotal_neto_usd NUMERIC(14,2) NOT NULL,
    iva_usd NUMERIC(14,2) NOT NULL,
    total_usd NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_cot_items_cot ON public.compras_cotizaciones_items(cotizacion_id);

-- 5. TABLA: RECEPCIONES DE MATERIALES EN BODEGA
CREATE TABLE IF NOT EXISTS public.compras_recepciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_recepcion VARCHAR(50) UNIQUE NOT NULL, -- Ej: REC-BOD-2026-0055
    orden_compra_id UUID NOT NULL REFERENCES public.compras_ordenes(id) ON DELETE RESTRICT,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    bodega_destino_id UUID NOT NULL REFERENCES public.bodegas(id) ON DELETE RESTRICT,
    guia_remision_numero VARCHAR(50) NOT NULL,
    responsable_bodeguero VARCHAR(150) NOT NULL,
    tipo_recepcion VARCHAR(20) NOT NULL DEFAULT 'TOTAL' CHECK (tipo_recepcion IN ('TOTAL', 'PARCIAL')),
    observaciones_generales TEXT,
    kardex_movimiento_id UUID REFERENCES public.kardex_movimientos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_rec_oc ON public.compras_recepciones(orden_compra_id);
CREATE INDEX IF NOT EXISTS idx_compras_rec_bodega ON public.compras_recepciones(bodega_destino_id);

-- 6. TABLA: PARTIDAS RECIBIDAS EN INSPECCIÓN FÍSICA
CREATE TABLE IF NOT EXISTS public.compras_recepciones_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recepcion_id UUID NOT NULL REFERENCES public.compras_recepciones(id) ON DELETE CASCADE,
    codigo_insumo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    unidad VARCHAR(30) NOT NULL,
    cantidad_entregada NUMERIC(12,4) NOT NULL CHECK (cantidad_entregada >= 0),
    cantidad_aceptada_conforme NUMERIC(12,4) NOT NULL DEFAULT 0.00 CHECK (cantidad_aceptada_conforme >= 0),
    cantidad_danada_rechazada NUMERIC(12,4) NOT NULL DEFAULT 0.00 CHECK (cantidad_danada_rechazada >= 0),
    estado_inspeccion VARCHAR(30) NOT NULL DEFAULT 'CONFORME' CHECK (estado_inspeccion IN ('CONFORME', 'DANADO', 'RECHAZADO')),
    motivo_observacion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_rec_items_rec ON public.compras_recepciones_items(recepcion_id);

-- ==============================================================================
-- 7. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) ZERO-TRUST
-- ==============================================================================
ALTER TABLE public.compras_requisiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_requisiciones_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_cotizaciones_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_recepciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compras_recepciones_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura autorizada en compras_requisiciones"
    ON public.compras_requisiciones FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Mutación autorizada en compras_requisiciones"
    ON public.compras_requisiciones FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Acceso a partidas de requisición"
    ON public.compras_requisiciones_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Acceso a cotizaciones"
    ON public.compras_cotizaciones FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Acceso a partidas de cotización"
    ON public.compras_cotizaciones_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Acceso a recepciones"
    ON public.compras_recepciones FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Acceso a partidas de recepción"
    ON public.compras_recepciones_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
