-- ==============================================================================
-- SARA CONSTRUCTORA - SISTEMA SARA TALENTO HUMANO CORE (POSTGRESQL / SUPABASE DDL)
-- Módulo: SARA TALENTO HUMANO / SELECCIÓN / EXPEDIENTES / ASIGNACIÓN / EVALUACIÓN
-- Cumplimiento: SECAP, Código del Trabajo (Ecuador), IESS CD 513, NEC-15
-- ==============================================================================

-- 0. FUNCIÓN DE ACTUALIZACIÓN DE TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. TABLA: VACANTES DE TALENTO EN CONSTRUCCIÓN
CREATE TABLE IF NOT EXISTS public.talento_vacantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    rol_oficio VARCHAR(100) NOT NULL, -- Ej: 'Ingeniero Residente', 'Maestro Mayor', 'Fierrero', 'Topógrafo'
    especialidad VARCHAR(150), -- Ej: 'Estructuras Hormigón Armado', 'Instalaciones Hidrosanitarias'
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    certificaciones_requeridas TEXT[] DEFAULT '{}', -- Ej: ARRAY['SECAP_PREVENCION', 'LICENCIA_ALTURAS']
    ubicacion_provincia VARCHAR(80) NOT NULL,
    ubicacion_canton VARCHAR(80) NOT NULL,
    modalidad VARCHAR(30) NOT NULL DEFAULT 'presencial_obra' CHECK (modalidad IN ('presencial_obra', 'mixto')),
    tipo_contrato VARCHAR(40) NOT NULL DEFAULT 'obra_cierta' CHECK (tipo_contrato IN ('obra_cierta', 'servicios_profesionales', 'novedad_temporal', 'indefinido')),
    salario_min NUMERIC(12,2) CHECK (salario_min IS NULL OR salario_min >= 0),
    salario_max NUMERIC(12,2) CHECK (salario_max IS NULL OR salario_max >= salario_min),
    estado VARCHAR(20) NOT NULL DEFAULT 'publicada' CHECK (estado IN ('borrador', 'publicada', 'pausada', 'cerrada', 'cancelada')),
    vacantes_disponibles INTEGER NOT NULL DEFAULT 1 CHECK (vacantes_disponibles > 0),
    vacantes_cubiertas INTEGER NOT NULL DEFAULT 0 CHECK (vacantes_cubiertas >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices optimizados para filtros de búsqueda en bolsa de empleo
CREATE INDEX IF NOT EXISTS idx_vacantes_provincia_canton ON public.talento_vacantes(ubicacion_provincia, ubicacion_canton);
CREATE INDEX IF NOT EXISTS idx_vacantes_rol_oficio ON public.talento_vacantes(rol_oficio);
CREATE INDEX IF NOT EXISTS idx_vacantes_estado ON public.talento_vacantes(estado);
CREATE INDEX IF NOT EXISTS idx_vacantes_empresa ON public.talento_vacantes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vacantes_proyecto ON public.talento_vacantes(proyecto_id);

-- Trigger updated_at para vacantes
DROP TRIGGER IF EXISTS trg_talento_vacantes_updated_at ON public.talento_vacantes;
CREATE TRIGGER trg_talento_vacantes_updated_at
BEFORE UPDATE ON public.talento_vacantes
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 2. TABLA: POSTULACIONES DE TALENTO
CREATE TABLE IF NOT EXISTS public.talento_postulaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacante_id UUID NOT NULL REFERENCES public.talento_vacantes(id) ON DELETE CASCADE,
    talento_id UUID NOT NULL, -- FK a auth.users, talent_profiles o trabajadores
    mensaje_presentacion TEXT,
    tarifa_ofertada NUMERIC(12,2) CHECK (tarifa_ofertada IS NULL OR tarifa_ofertada >= 0),
    estado VARCHAR(30) NOT NULL DEFAULT 'recibida' CHECK (estado IN (
        'recibida', 
        'en_revision', 
        'preseleccionada', 
        'entrevista', 
        'evaluacion_tecnica', 
        'oferta', 
        'aceptada', 
        'rechazada', 
        'retirada'
    )),
    notas_privadas_empresa TEXT,
    fecha_entrevista TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_postulacion_vacante_talento UNIQUE (vacante_id, talento_id)
);

CREATE INDEX IF NOT EXISTS idx_postulaciones_vacante ON public.talento_postulaciones(vacante_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_talento ON public.talento_postulaciones(talento_id);
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON public.talento_postulaciones(estado);

DROP TRIGGER IF EXISTS trg_talento_postulaciones_updated_at ON public.talento_postulaciones;
CREATE TRIGGER trg_talento_postulaciones_updated_at
BEFORE UPDATE ON public.talento_postulaciones
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 3. TABLA: ASIGNACIONES DE TALENTO A OBRA CIVIL
CREATE TABLE IF NOT EXISTS public.talento_asignaciones_obra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postulacion_id UUID REFERENCES public.talento_postulaciones(id) ON DELETE SET NULL,
    talento_id UUID NOT NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    empresa_id UUID NOT NULL,
    rol_asignado VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin_prevista DATE CHECK (fecha_fin_prevista IS NULL OR fecha_fin_prevista >= fecha_inicio),
    estado VARCHAR(30) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'suspendida', 'finalizada')),
    tarifa_acordada_hora NUMERIC(10,2) CHECK (tarifa_acordada_hora IS NULL OR tarifa_acordada_hora > 0),
    fondo_escrow_id UUID, -- Referencia opcional al fideicomiso / custodia financiera
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_asignaciones_proyecto ON public.talento_asignaciones_obra(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_talento ON public.talento_asignaciones_obra(talento_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_empresa ON public.talento_asignaciones_obra(empresa_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_estado ON public.talento_asignaciones_obra(estado);

DROP TRIGGER IF EXISTS trg_talento_asignaciones_updated_at ON public.talento_asignaciones_obra;
CREATE TRIGGER trg_talento_asignaciones_updated_at
BEFORE UPDATE ON public.talento_asignaciones_obra
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 4. TABLA: DOCUMENTOS Y EXPEDIENTE LABORAL TÉCNICO
CREATE TABLE IF NOT EXISTS public.talento_documentos_expediente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talento_id UUID NOT NULL,
    tipo_documento VARCHAR(40) NOT NULL CHECK (tipo_documento IN (
        'CEDULA', 
        'CV', 
        'SECAP_PREVENCION', 
        'SENESCYT_TITULO', 
        'LICENCIA_ALTURAS', 
        'EXAMEN_MEDICO_IESS'
    )),
    archivo_url TEXT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'recibido' CHECK (estado IN ('recibido', 'en_revision', 'validado', 'rechazado', 'vencido')),
    validado_por UUID,
    fecha_vencimiento DATE,
    motivo_rechazo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_documentos_talento ON public.talento_documentos_expediente(talento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo_estado ON public.talento_documentos_expediente(tipo_documento, estado);

DROP TRIGGER IF EXISTS trg_talento_documentos_updated_at ON public.talento_documentos_expediente;
CREATE TRIGGER trg_talento_documentos_updated_at
BEFORE UPDATE ON public.talento_documentos_expediente
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 5. TABLA: EVALUACIONES DE DESEMPEÑO EN OBRA
CREATE TABLE IF NOT EXISTS public.talento_evaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asignacion_id UUID NOT NULL REFERENCES public.talento_asignaciones_obra(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,
    empresa_id UUID NOT NULL,
    talento_id UUID NOT NULL,
    calificacion_calidad INTEGER NOT NULL CHECK (calificacion_calidad BETWEEN 1 AND 5),
    calificacion_cumplimiento_plazo INTEGER NOT NULL CHECK (calificacion_cumplimiento_plazo BETWEEN 1 AND 5),
    calificacion_sst INTEGER NOT NULL CHECK (calificacion_sst BETWEEN 1 AND 5), -- Seguridad y Salud en el Trabajo
    comentarios TEXT,
    acta_fiscalizacion_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_evaluaciones_talento ON public.talento_evaluaciones(talento_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_asignacion ON public.talento_evaluaciones(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_proyecto ON public.talento_evaluaciones(proyecto_id);


-- ==============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.talento_vacantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talento_postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talento_asignaciones_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talento_documentos_expediente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talento_evaluaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de Vacantes:
-- Cualquiera (incluso anónimos) puede ver vacantes publicadas
CREATE POLICY "Lectura pública de vacantes publicadas" 
    ON public.talento_vacantes FOR SELECT 
    USING (estado = 'publicada');

-- Usuarios autenticados pueden ver todas las vacantes de su empresa o gestionarlas
CREATE POLICY "Gestión completa de vacantes para autenticados" 
    ON public.talento_vacantes FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas de Postulaciones:
CREATE POLICY "Acceso a postulaciones para usuarios autenticados" 
    ON public.talento_postulaciones FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas de Asignaciones:
CREATE POLICY "Acceso a asignaciones para usuarios autenticados" 
    ON public.talento_asignaciones_obra FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas de Documentos de Expediente:
CREATE POLICY "Acceso a expediente documental para autenticados" 
    ON public.talento_documentos_expediente FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Políticas de Evaluaciones:
CREATE POLICY "Acceso a evaluaciones para autenticados" 
    ON public.talento_evaluaciones FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- SEMILLAS INICIALES (MOCK DATA ECUATORIANA REALISTA)
-- ==============================================================================
INSERT INTO public.talento_vacantes (
    id, empresa_id, titulo, rol_oficio, especialidad, descripcion, requisitos, 
    certificaciones_requeridas, ubicacion_provincia, ubicacion_canton, modalidad, 
    tipo_contrato, salario_min, salario_max, estado, vacantes_disponibles, vacantes_cubiertas
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Ingeniero Residente de Estructuras',
    'Ingeniero Residente',
    'Hormigón Armado y Losas Postensadas',
    'Supervisión y control de vaciados de hormigón f''c=280 kg/cm2, armado de acero según NEC-SE-DS y libro de obra.',
    'Experiencia mínima 5 años en edificación en altura. Registro profesional SENESCYT vigente.',
    ARRAY['SENESCYT_TITULO', 'SECAP_PREVENCION'],
    'Pichincha',
    'Quito',
    'presencial_obra',
    'obra_cierta',
    1800.00,
    2400.00,
    'publicada',
    2,
    0
),
(
    '00000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Maestro Mayor de Obra Civil',
    'Maestro Mayor',
    'Dirección de Cuadrillas de Albañilería',
    'Coordinación de replanteo, colocación de acero de refuerzo, encofrados metálicos y vaciado de cimentaciones.',
    'Experiencia demostrable de 10+ años en obras de hormigón. Manejo de cuadrillas de hasta 30 operarios.',
    ARRAY['SECAP_PREVENCION', 'LICENCIA_ALTURAS'],
    'Guayas',
    'Guayaquil',
    'presencial_obra',
    'obra_cierta',
    1100.00,
    1450.00,
    'publicada',
    3,
    1
),
(
    '00000000-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    'Topógrafo de Precisión con Estación Total',
    'Topógrafo',
    'Georreferenciación Satelital y Nivelación',
    'Levantamiento topográfico de rasantes, movimiento de tierras y control milimétrico de ejes estructurales.',
    'Licencia de operador, experiencia mínima 4 años en obras viales e inmobiliarias.',
    ARRAY['SECAP_PREVENCION'],
    'Loja',
    'Loja',
    'presencial_obra',
    'servicios_profesionales',
    950.00,
    1300.00,
    'publicada',
    1,
    0
)
ON CONFLICT (id) DO NOTHING;
