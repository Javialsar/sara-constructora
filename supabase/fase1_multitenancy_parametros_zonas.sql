-- ==============================================================================
-- FASE 1: MULTI-TENANCY, AISLAMIENTO DE CATÁLOGOS Y PARÁMETROS EMPRESARIALES
-- Ecosistema Grupo SARA (iaSoft Constructora S.A.S. - Ecuador)
-- ==============================================================================

-- 1. EXTENDER TABLAS DE INSUMOS Y RUBROS PARA MULTI-TENANCY
ALTER TABLE public.insumos 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS es_maestro BOOLEAN DEFAULT FALSE;

ALTER TABLE public.rubros 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS es_maestro BOOLEAN DEFAULT FALSE;

-- Marcar todos los insumos y rubros preexistentes como catálogo maestro de Grupo SARA
UPDATE public.insumos SET es_maestro = TRUE WHERE user_id IS NULL;
UPDATE public.rubros SET es_maestro = TRUE WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_insumos_tenant ON public.insumos(user_id, es_maestro);
CREATE INDEX IF NOT EXISTS idx_rubros_tenant ON public.rubros(user_id, es_maestro);

-- 2. TABLA DE PARÁMETROS EMPRESARIALES Y POLÍTICAS SRI DEL CLIENTE
CREATE TABLE IF NOT EXISTS public.empresa_parametros_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Políticas de Costos Indirectos (AIU) de la empresa del cliente
    porcentaje_admin_default NUMERIC(5,2) DEFAULT 10.00,
    porcentaje_imprevistos_default NUMERIC(5,2) DEFAULT 5.00,
    porcentaje_utilidad_default NUMERIC(5,2) DEFAULT 10.00,
    herramienta_menor_default NUMERIC(5,2) DEFAULT 5.00,
    
    -- Políticas Fiscales SRI Ecuador (2026)
    regimen_tributario VARCHAR(50) DEFAULT 'general', -- general, rimpe_emprendedor, rimpe_popular, contribuyente_especial
    es_agente_retencion BOOLEAN DEFAULT FALSE,
    retencion_renta_pct NUMERIC(5,2) DEFAULT 1.75,
    retencion_iva_pct NUMERIC(5,2) DEFAULT 30.00,
    tarifa_iva_vigente NUMERIC(5,2) DEFAULT 15.00,
    
    -- Preferencias de Decimales del Sistema
    decimales_calculos INT DEFAULT 4,
    decimales_cantidades INT DEFAULT 2,
    decimales_precios INT DEFAULT 2,
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empresa_param_user ON public.empresa_parametros_cliente(user_id);

-- 3. TABLA DE PRECIOS ZONIFICADOS DEL MARKETPLACE
CREATE TABLE IF NOT EXISTS public.marketplace_precios_zonificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo_id UUID NOT NULL REFERENCES public.insumos(id) ON DELETE CASCADE,
    provincia VARCHAR(50) NOT NULL, -- Loja, Azuay, El Oro, Pichincha, Guayas, etc.
    canton VARCHAR(100),
    precio_puesto_obra NUMERIC(12,4) NOT NULL,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    stock_disponible BOOLEAN DEFAULT TRUE,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unq_insumo_zona UNIQUE(insumo_id, provincia, canton)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_zona ON public.marketplace_precios_zonificados(provincia, canton);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.empresa_parametros_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_precios_zonificados ENABLE ROW LEVEL SECURITY;

-- Políticas para Parámetros del Cliente
DROP POLICY IF EXISTS "Clientes gestionan sus propios parametros de empresa" ON public.empresa_parametros_cliente;
CREATE POLICY "Clientes gestionan sus propios parametros de empresa"
    ON public.empresa_parametros_cliente FOR ALL
    USING (auth.uid() = user_id);

-- Políticas para Marketplace Zonificado
DROP POLICY IF EXISTS "Cualquiera autenticado puede ver precios zonificados" ON public.marketplace_precios_zonificados;
CREATE POLICY "Cualquiera autenticado puede ver precios zonificados"
    ON public.marketplace_precios_zonificados FOR SELECT
    USING (auth.role() = 'authenticated');

-- Políticas para Insumos (Lectura: Maestros + Propios; Escritura: Solo Propios)
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insumos visibles para todos si son maestros o propios" ON public.insumos;
CREATE POLICY "Insumos visibles para todos si son maestros o propios"
    ON public.insumos FOR SELECT
    USING (es_maestro = TRUE OR auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Usuarios insertan sus propios insumos privados" ON public.insumos;
CREATE POLICY "Usuarios insertan sus propios insumos privados"
    ON public.insumos FOR INSERT
    WITH CHECK (auth.uid() = user_id OR es_maestro = TRUE);

DROP POLICY IF EXISTS "Usuarios solo editan sus propios insumos privados" ON public.insumos;
CREATE POLICY "Usuarios solo editan sus propios insumos privados"
    ON public.insumos FOR UPDATE
    USING (es_maestro = FALSE AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios solo eliminan sus propios insumos privados" ON public.insumos;
CREATE POLICY "Usuarios solo eliminan sus propios insumos privados"
    ON public.insumos FOR DELETE
    USING (es_maestro = FALSE AND auth.uid() = user_id);

-- Políticas para Rubros (Lectura: Maestros + Propios; Escritura: Solo Propios)
ALTER TABLE public.rubros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rubros visibles para todos si son maestros o propios" ON public.rubros;
CREATE POLICY "Rubros visibles para todos si son maestros o propios"
    ON public.rubros FOR SELECT
    USING (es_maestro = TRUE OR auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Usuarios solo editan sus propios rubros privados" ON public.rubros;
CREATE POLICY "Usuarios solo editan sus propios rubros privados"
    ON public.rubros FOR UPDATE
    USING (es_maestro = FALSE AND auth.uid() = user_id);
