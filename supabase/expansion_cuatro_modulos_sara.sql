-- ==============================================================================
-- ECOSISTEMA GRUPO SARA - SCRIPT DDL DE EXPANSIÓN MAESTRA (CUATRO NUEVOS MÓDULOS)
-- ==============================================================================
-- Módulo A: SARA-AI-RUBROS (Generador Inteligente de APU con NLP)
-- Módulo B: SARA-DOCS (Generador Automatizado de Contratos Legales & SERCOP)
-- Módulo C: SARA-MAQUINARIA (Uber de Equipo Caminero y Logística de Obra)
-- Módulo D: SARA-DASHBOARD (Control Inteligente de Utilidad Real & Alertas SRI)
-- + Prevención de Inactividad (Supabase Keep-Alive Cron nativo)
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Búsqueda fuzzy para matching de insumos

-- ==============================================================================
-- 2. MÓDULO A: SARA-AI-RUBROS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sara_ai_rubros_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_usuario TEXT NOT NULL,
    rubro_sugerido_nombre TEXT NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'm3',
    rendimiento_estimado NUMERIC(10,4) NOT NULL DEFAULT 1.0,
    estructura_apu JSONB NOT NULL, -- { materiales: [], mano_de_obra: [], equipos: [] }
    costo_directo_estimado NUMERIC(14,4) NOT NULL DEFAULT 0.0,
    tokens_utilizados INTEGER DEFAULT 0,
    modelo_llm VARCHAR(50) DEFAULT 'sara-gemini-2.5',
    estado_aprobacion VARCHAR(30) DEFAULT 'pendiente_revision', -- pendiente_revision, aprobado_e_insertado, descartado
    rubro_maestro_id UUID REFERENCES public.rubros(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_rubros_user ON public.sara_ai_rubros_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_rubros_estado ON public.sara_ai_rubros_logs(estado_aprobacion);

-- ==============================================================================
-- 3. MÓDULO B: SARA-DOCS (Documentos & Contratos Legales Inteligentes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sara_docs_plantillas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_plantilla VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL, -- contrato_obra, promesa_compraventa, pliego_sercop, acta_entrega
    contenido_markdown TEXT NOT NULL,
    variables_requeridas JSONB DEFAULT '[]'::jsonb, -- ['nombre_cliente', 'monto_obra', 'linderos', 'cedula']
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sara_docs_generados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plantilla_id UUID REFERENCES public.sara_docs_plantillas(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    presupuesto_id UUID REFERENCES public.presupuestos_reales(id) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    variables_inyectadas JSONB NOT NULL,
    documento_markdown TEXT NOT NULL,
    pdf_storage_path TEXT,
    estado_firma VARCHAR(30) DEFAULT 'borrador', -- borrador, firmado_electronico, notariado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_user ON public.sara_docs_generados(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_proyecto ON public.sara_docs_generados(proyecto_id);

-- ==============================================================================
-- 4. MÓDULO C: SARA-MAQUINARIA (Uber de Equipo Caminero)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sara_maquinaria_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    propietario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    codigo_maquinaria VARCHAR(50) UNIQUE NOT NULL,
    nombre_equipo VARCHAR(255) NOT NULL, -- Retroexcavadora CAT 420F, Rodillo 10 Ton, Volqueta 14m3
    categoria VARCHAR(50) NOT NULL, -- excavacion, compactacion, transporte_aridos, hormigon
    tarifa_hora NUMERIC(12,2) NOT NULL,
    tarifa_dia NUMERIC(12,2),
    incluye_operador BOOLEAN DEFAULT TRUE,
    incluye_combustible BOOLEAN DEFAULT FALSE,
    disponibilidad VARCHAR(30) DEFAULT 'disponible', -- disponible, en_obra, en_mantenimiento
    provincia VARCHAR(50) NOT NULL, -- Loja, Azuay, El Oro, Pichincha, Guayas...
    canton VARCHAR(100) NOT NULL,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sara_maquinaria_solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maquinaria_id UUID REFERENCES public.sara_maquinaria_inventario(id) ON DELETE CASCADE,
    solicitante_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    reporte_diario_id UUID REFERENCES public.sara_fiscaliza_reportes(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horas_solicitadas NUMERIC(8,2) NOT NULL DEFAULT 8.0,
    monto_total NUMERIC(12,2) NOT NULL,
    monto_custodia_escrow NUMERIC(12,2) NOT NULL,
    estado_reserva VARCHAR(30) DEFAULT 'pendiente_confirmacion', -- pendiente_confirmacion, confirmada, en_transito, ejecutando, finalizada, cancelada
    estado_pago VARCHAR(30) DEFAULT 'custodia_escrow', -- custodia_escrow, liberado_al_operador, reembolsado
    latitud_destino NUMERIC(10,7),
    longitud_destino NUMERIC(10,7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maquinaria_disp ON public.sara_maquinaria_inventario(disponibilidad, provincia);
CREATE INDEX IF NOT EXISTS idx_maquinaria_solic ON public.sara_maquinaria_solicitudes(solicitante_id, estado_reserva);

-- ==============================================================================
-- 5. MÓDULO D: SARA-DASHBOARD (Control de Utilidad Real & Alertas SRI)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sara_dashboard_metricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    costo_presupuestado_apu NUMERIC(14,4) NOT NULL DEFAULT 0.0, -- Valor inicial de SARA-APU
    costo_real_materiales NUMERIC(14,4) NOT NULL DEFAULT 0.0, -- Acumulado de compras y facturas
    costo_real_mano_obra NUMERIC(14,4) NOT NULL DEFAULT 0.0,   -- Acumulado de planillas de fiscalización
    costo_real_maquinaria NUMERIC(14,4) NOT NULL DEFAULT 0.0,  -- Acumulado de alquiler maquinaria
    costo_real_total NUMERIC(14,4) GENERATED ALWAYS AS (costo_real_materiales + costo_real_mano_obra + costo_real_maquinaria) STORED,
    monto_facturado_cliente NUMERIC(14,4) NOT NULL DEFAULT 0.0,
    utilidad_neta_real NUMERIC(14,4) GENERATED ALWAYS AS (monto_facturado_cliente - (costo_real_materiales + costo_real_mano_obra + costo_real_maquinaria)) STORED,
    margen_utilidad_pct NUMERIC(6,2) DEFAULT 0.0,
    
    -- Parámetros Fiscales Ecuador (SRI 2026)
    retencion_iva_estimada NUMERIC(14,4) DEFAULT 0.0, -- Retención IVA del 30% / 70% / 100%
    retencion_renta_estimada NUMERIC(14,4) DEFAULT 0.0, -- Retención Impuesto a la Renta 1.75% / 2.75%
    fondo_reserva_sri_bloqueado NUMERIC(14,4) DEFAULT 0.0, -- Capital preventivo inmovilizado
    alerta_descalce_tributario BOOLEAN DEFAULT FALSE,
    
    fecha_cierre_corte DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metricas_proyecto ON public.sara_dashboard_metricas(proyecto_id);

-- ==============================================================================
-- 6. KEEP-ALIVE CRON JOB PARA SUPABASE (Previene pausa por inactividad)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sara_system_heartbeat (
    id SERIAL PRIMARY KEY,
    ping_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    origen VARCHAR(50) DEFAULT 'sara_auto_keepalive'
);

-- Función que ejecuta un latido en la base de datos
CREATE OR REPLACE FUNCTION public.fn_sara_keep_alive_ping()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.sara_system_heartbeat (ping_timestamp, origen)
    VALUES (NOW(), 'cron_heartbeat_iaSoft');
    
    -- Mantener la tabla ligera: borrar registros de más de 30 días
    DELETE FROM public.sara_system_heartbeat WHERE ping_timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Intentar habilitar pg_cron si está disponible en la instancia
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Ejecuta un ping cada 24 horas a las 03:00 AM UTC
        PERFORM cron.schedule('sara-keepalive-daily', '0 3 * * *', 'SELECT public.fn_sara_keep_alive_ping();');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pg_cron no está disponible en este tier o requiere activación manual en el panel de Supabase.';
END $$;

-- ==============================================================================
-- 7. SEGURIDAD: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.sara_ai_rubros_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_docs_generados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_maquinaria_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_maquinaria_solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sara_dashboard_metricas ENABLE ROW LEVEL SECURITY;

-- Políticas de AI Rubros Logs
DROP POLICY IF EXISTS "Usuarios acceden a sus propios logs de APU IA" ON public.sara_ai_rubros_logs;
CREATE POLICY "Usuarios acceden a sus propios logs de APU IA"
    ON public.sara_ai_rubros_logs FOR ALL
    USING (auth.uid() = user_id);

-- Políticas de Docs Generados
DROP POLICY IF EXISTS "Usuarios acceden a sus propios contratos" ON public.sara_docs_generados;
CREATE POLICY "Usuarios acceden a sus propios contratos"
    ON public.sara_docs_generados FOR ALL
    USING (auth.uid() = user_id);

-- Políticas de Maquinaria
DROP POLICY IF EXISTS "Cualquiera autenticado puede ver maquinaria disponible" ON public.sara_maquinaria_inventario;
CREATE POLICY "Cualquiera autenticado puede ver maquinaria disponible"
    ON public.sara_maquinaria_inventario FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Dueño gestiona su maquinaria" ON public.sara_maquinaria_inventario;
CREATE POLICY "Dueño gestiona su maquinaria"
    ON public.sara_maquinaria_inventario FOR ALL
    USING (auth.uid() = propietario_id);

DROP POLICY IF EXISTS "Usuarios gestionan sus solicitudes de maquinaria" ON public.sara_maquinaria_solicitudes;
CREATE POLICY "Usuarios gestionan sus solicitudes de maquinaria"
    ON public.sara_maquinaria_solicitudes FOR ALL
    USING (auth.uid() = solicitante_id);

-- Políticas de Dashboard de Métricas
DROP POLICY IF EXISTS "Usuarios gestionan métricas de sus proyectos" ON public.sara_dashboard_metricas;
CREATE POLICY "Usuarios gestionan métricas de sus proyectos"
    ON public.sara_dashboard_metricas FOR ALL
    USING (auth.uid() = user_id);
