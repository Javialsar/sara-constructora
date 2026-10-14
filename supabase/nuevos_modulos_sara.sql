-- =====================================================================
-- GRUPO SARA - MIGRACIÓN MAESTRA DE INTEGRACIÓN AGÉNTICA (2026)
-- MÓDULOS: SARA-TENDERS, SARA-FISCALIZA, SARA-BIM
-- ARQUITECTURA: MULTI-TENANT, ROW LEVEL SECURITY (RLS), ACID COMPLIANT
-- =====================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. TABLA DE KEEP-ALIVE (Mecanismo Anti-Pausa por Inactividad)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.sara_system_heartbeat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL DEFAULT 'sara_core_keepalive',
    last_ping TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(50) DEFAULT 'healthy',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE OR REPLACE FUNCTION public.fn_sara_keep_alive_ping()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    INSERT INTO public.sara_system_heartbeat (service_name, last_ping, status)
    VALUES ('sara_autonomics_cron', now(), 'active');
    
    -- Limpieza de logs de ping más antiguos a 30 días para no inflar la base
    DELETE FROM public.sara_system_heartbeat 
    WHERE last_ping < now() - INTERVAL '30 days';

    v_result := jsonb_build_object(
        'status', 'ok',
        'timestamp', now(),
        'message', 'Grupo SARA Core DB Ping exitoso'
    );
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 2. MÓDULO A: SARA-TENDERS (Contratación Pública SERCOP)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.sara_tenders_procesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_proceso VARCHAR(100) UNIQUE NOT NULL,
    entidad_contratante VARCHAR(255) NOT NULL,
    objeto_proceso TEXT NOT NULL,
    tipo_contratacion VARCHAR(100) NOT NULL CHECK (
        tipo_contratacion IN (
            'Subasta Inversa Electrónica',
            'Menor Cuantía Obra',
            'Cotización',
            'Licitación',
            'Consultoría',
            'Ínfima Cuantía'
        )
    ),
    provincia VARCHAR(50) NOT NULL CHECK (
        provincia IN ('Loja', 'Azuay', 'El Oro', 'Pichincha', 'Guayas', 'Zamora Chinchipe', 'Otra')
    ),
    canton VARCHAR(100) DEFAULT 'Loja',
    presupuesto_referencial NUMERIC(14,2) NOT NULL CHECK (presupuesto_referencial >= 0),
    fecha_publicacion TIMESTAMPTZ NOT NULL,
    fecha_limite_ofertas TIMESTAMPTZ NOT NULL,
    url_pliego TEXT,
    url_sercop TEXT,
    estado VARCHAR(50) DEFAULT 'vigente' CHECK (
        estado IN ('vigente', 'evaluacion', 'adjudicado', 'desierto', 'cancelado')
    ),
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    match_score_apu NUMERIC(5,2) DEFAULT 0.00,
    rubros_extraidos_total INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sara_tenders_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proceso_id UUID NOT NULL REFERENCES public.sara_tenders_procesos(id) ON DELETE CASCADE,
    orden INT DEFAULT 1,
    codigo_cpc VARCHAR(50),
    descripcion TEXT NOT NULL,
    unidad VARCHAR(50) NOT NULL,
    cantidad NUMERIC(12,4) NOT NULL CHECK (cantidad > 0),
    precio_unitario_referencial NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    subtotal_referencial NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    rubro_apu_id UUID REFERENCES public.rubros(id) ON DELETE SET NULL,
    match_confianza NUMERIC(5,2) DEFAULT 0.00,
    especificaciones_tecnicas TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de Rendimiento para Tenders
CREATE INDEX IF NOT EXISTS idx_tenders_provincia ON public.sara_tenders_procesos(provincia);
CREATE INDEX IF NOT EXISTS idx_tenders_estado ON public.sara_tenders_procesos(estado);
CREATE INDEX IF NOT EXISTS idx_tenders_fecha_limite ON public.sara_tenders_procesos(fecha_limite_ofertas);
CREATE INDEX IF NOT EXISTS idx_tenders_items_proceso ON public.sara_tenders_items(proceso_id);
CREATE INDEX IF NOT EXISTS idx_tenders_items_rubro ON public.sara_tenders_items(rubro_apu_id);

-- =====================================================================
-- 3. MÓDULO B: SARA-FISCALIZA (Control de Obra en Territorio)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.sara_fiscalizacion_diaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    residente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_reporte DATE NOT NULL DEFAULT CURRENT_DATE,
    clima VARCHAR(50) DEFAULT 'soleado' CHECK (
        clima IN ('soleado', 'nublado', 'lluvioso', 'temporal_extremo')
    ),
    temperatura_aprox NUMERIC(4,1),
    horas_trabajadas NUMERIC(4,1) DEFAULT 8.0 CHECK (horas_trabajadas >= 0),
    personal_cuadrilla_count INT DEFAULT 0,
    equipo_activo_descripcion TEXT,
    observaciones TEXT,
    incidentes_sst TEXT,
    porcentaje_avance_dia NUMERIC(6,3) DEFAULT 0.000,
    porcentaje_avance_acumulado NUMERIC(6,3) DEFAULT 0.000,
    monto_ejecutado_dia NUMERIC(14,2) DEFAULT 0.00,
    monto_acumulado_fiscalizado NUMERIC(14,2) DEFAULT 0.00,
    sincronizado_offline BOOLEAN DEFAULT false,
    offline_client_uuid VARCHAR(100),
    validado_por_fiscalizador BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unq_fiscaliza_fecha_proyecto UNIQUE(proyecto_id, fecha_reporte)
);

CREATE TABLE IF NOT EXISTS public.sara_fiscalizacion_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES public.sara_fiscalizacion_diaria(id) ON DELETE CASCADE,
    rubro_id UUID REFERENCES public.rubros(id) ON DELETE SET NULL,
    codigo_rubro VARCHAR(100),
    descripcion_rubro TEXT NOT NULL,
    unidad VARCHAR(50) NOT NULL,
    cantidad_presupuestada NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    cantidad_ejecutada_dia NUMERIC(12,4) NOT NULL CHECK (cantidad_ejecutada_dia >= 0),
    cantidad_acumulada_anterior NUMERIC(12,4) DEFAULT 0.0000,
    precio_unitario NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    monto_ejecutado_dia NUMERIC(14,2) GENERATED ALWAYS AS (cantidad_ejecutada_dia * precio_unitario) STORED,
    ubicacion_especifica VARCHAR(255),
    estado_control VARCHAR(50) DEFAULT 'conforme' CHECK (
        estado_control IN ('conforme', 'observado', 'no_conforme')
    ),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sara_fiscalizacion_evidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES public.sara_fiscalizacion_diaria(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.sara_fiscalizacion_items(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    precision_gps NUMERIC(6,2), -- en metros
    timestamp_captura TIMESTAMPTZ NOT NULL DEFAULT now(),
    tipo_evidencia VARCHAR(50) DEFAULT 'fotografia' CHECK (
        tipo_evidencia IN ('fotografia', 'ensayo_laboratorio', 'video', 'acta_firmada')
    ),
    comentario TEXT,
    hash_sha256 VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de Rendimiento para Fiscalización
CREATE INDEX IF NOT EXISTS idx_fiscaliza_proyecto_fecha ON public.sara_fiscalizacion_diaria(proyecto_id, fecha_reporte DESC);
CREATE INDEX IF NOT EXISTS idx_fiscaliza_items_reporte ON public.sara_fiscalizacion_items(reporte_id);
CREATE INDEX IF NOT EXISTS idx_fiscaliza_evidencias_reporte ON public.sara_fiscalizacion_evidencias(reporte_id);

-- =====================================================================
-- 4. MÓDULO C: SARA-BIM (Modelado de Información & Costeo en Tiempo Real)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.sara_bim_modelos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    nombre_modelo VARCHAR(255) NOT NULL,
    software_origen VARCHAR(50) NOT NULL CHECK (
        software_origen IN ('Autodesk Revit', 'Graphisoft Archicad', 'IFC OpenBIM', 'Bentley OpenBuildings', 'Otro')
    ),
    version_software VARCHAR(50),
    guid_modelo VARCHAR(120),
    volumen_total_m3 NUMERIC(14,2) DEFAULT 0.00,
    area_total_m2 NUMERIC(14,2) DEFAULT 0.00,
    peso_acero_kg NUMERIC(14,2) DEFAULT 0.00,
    total_presupuestado_apu NUMERIC(14,2) DEFAULT 0.00,
    total_cotizado_marketplace NUMERIC(14,2) DEFAULT 0.00,
    ahorro_detectado_marketplace NUMERIC(14,2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sara_bim_takeoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modelo_id UUID NOT NULL REFERENCES public.sara_bim_modelos(id) ON DELETE CASCADE,
    guid_elemento VARCHAR(120) NOT NULL,
    categoria_bim VARCHAR(100) NOT NULL,
    tipo_familia VARCHAR(255),
    material_nombre VARCHAR(255) NOT NULL,
    clasificacion_sara VARCHAR(50) NOT NULL CHECK (
        clasificacion_sara IN ('hormigon', 'acero', 'mamposteria', 'acabado', 'instalaciones', 'otro')
    ),
    volumen_m3 NUMERIC(12,4) DEFAULT 0.0000,
    area_m2 NUMERIC(12,4) DEFAULT 0.0000,
    longitud_ml NUMERIC(12,4) DEFAULT 0.0000,
    peso_kg NUMERIC(12,4) DEFAULT 0.0000,
    apu_rubro_id UUID REFERENCES public.rubros(id) ON DELETE SET NULL,
    precio_unitario_apu NUMERIC(12,4) DEFAULT 0.0000,
    subtotal_apu NUMERIC(14,2) DEFAULT 0.00,
    proveedor_marketplace_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    precio_unitario_marketplace NUMERIC(12,4) DEFAULT 0.0000,
    subtotal_marketplace NUMERIC(14,2) DEFAULT 0.00,
    diferencia_ahorro NUMERIC(14,2) GENERATED ALWAYS AS (subtotal_apu - subtotal_marketplace) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de Rendimiento para BIM
CREATE INDEX IF NOT EXISTS idx_bim_modelos_proyecto ON public.sara_bim_modelos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_bim_takeoffs_modelo ON public.sara_bim_takeoffs(modelo_id);
CREATE INDEX IF NOT EXISTS idx_bim_takeoffs_clasificacion ON public.sara_bim_takeoffs(clasificacion_sara);
CREATE INDEX IF NOT EXISTS idx_bim_takeoffs_rubro ON public.sara_bim_takeoffs(apu_rubro_id);

-- =====================================================================
-- 5. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- =====================================================================

-- Habilitar RLS en todas las tablas maestras nuevas
ALTER TABLE public.sara_tenders_procesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_tenders_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_fiscalizacion_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_fiscalizacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_fiscalizacion_evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_bim_modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_bim_takeoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_system_heartbeat ENABLE ROW LEVEL SECURITY;

-- Políticas para SARA-TENDERS (Lectura general para usuarios autenticados, edición técnica)
DROP POLICY IF EXISTS "Lectura publica tenders autenticados" ON public.sara_tenders_procesos;
CREATE POLICY "Lectura publica tenders autenticados" ON public.sara_tenders_procesos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Gestion tenders administradores" ON public.sara_tenders_procesos;
CREATE POLICY "Gestion tenders administradores" ON public.sara_tenders_procesos
    FOR ALL TO authenticated USING (
        (auth.jwt()->>'role' = 'admin') OR 
        (auth.jwt()->'user_metadata'->>'role' IN ('admin', 'tecnico'))
    );

DROP POLICY IF EXISTS "Lectura items tenders" ON public.sara_tenders_items;
CREATE POLICY "Lectura items tenders" ON public.sara_tenders_items
    FOR SELECT TO authenticated USING (true);

-- Políticas para SARA-FISCALIZA (Aislamiento por proyecto y residente)
DROP POLICY IF EXISTS "Lectura fiscalizacion proyecto" ON public.sara_fiscalizacion_diaria;
CREATE POLICY "Lectura fiscalizacion proyecto" ON public.sara_fiscalizacion_diaria
    FOR SELECT TO authenticated USING (
        residente_id = auth.uid() OR
        (auth.jwt()->'user_metadata'->>'role' IN ('admin', 'fiscalizador', 'tecnico'))
    );

DROP POLICY IF EXISTS "Crear fiscalizacion residente" ON public.sara_fiscalizacion_diaria;
CREATE POLICY "Crear fiscalizacion residente" ON public.sara_fiscalizacion_diaria
    FOR INSERT TO authenticated WITH CHECK (
        residente_id = auth.uid() OR
        (auth.jwt()->'user_metadata'->>'role' IN ('admin', 'fiscalizador', 'tecnico'))
    );

DROP POLICY IF EXISTS "Acceso items fiscalizacion" ON public.sara_fiscalizacion_items;
CREATE POLICY "Acceso items fiscalizacion" ON public.sara_fiscalizacion_items
    FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Acceso evidencias fiscalizacion" ON public.sara_fiscalizacion_evidencias;
CREATE POLICY "Acceso evidencias fiscalizacion" ON public.sara_fiscalizacion_evidencias
    FOR ALL TO authenticated USING (true);

-- Políticas para SARA-BIM
DROP POLICY IF EXISTS "Lectura y gestion bim autenticados" ON public.sara_bim_modelos;
CREATE POLICY "Lectura y gestion bim autenticados" ON public.sara_bim_modelos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura y gestion bim takeoffs" ON public.sara_bim_takeoffs;
CREATE POLICY "Lectura y gestion bim takeoffs" ON public.sara_bim_takeoffs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notificar recarga del esquema a PostgREST
NOTIFY pgrst, 'reload schema';
