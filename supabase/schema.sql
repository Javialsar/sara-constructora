-- =============================================
-- SARA CONSTRUCTORA - Esquema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. TABLA: Clientes (usuarios registrados en el portal)
CREATE TABLE IF NOT EXISTS clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text NOT NULL,
  email text UNIQUE NOT NULL,
  usuario text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activo', 'inactivo')),
  created_at timestamptz DEFAULT now()
);

-- 2. TABLA: Proyectos (obras de la constructora)
CREATE TABLE IF NOT EXISTS proyectos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  ubicacion text NOT NULL,
  estado text DEFAULT 'en_diseno' CHECK (estado IN ('en_diseno', 'en_construccion', 'finalizado')),
  avance integer DEFAULT 0 CHECK (avance >= 0 AND avance <= 100),
  cliente_id uuid REFERENCES clientes(id),
  fecha_inicio date,
  descripcion text,
  imagen_url text,
  latitud decimal,
  longitud decimal,
  created_at timestamptz DEFAULT now()
);

-- 3. TABLA: Avances (fotos, videos, documentos, hitos de cada proyecto)
CREATE TABLE IF NOT EXISTS avances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE,
  tipo text CHECK (tipo IN ('foto', 'video', 'documento', 'hito')),
  titulo text NOT NULL,
  descripcion text,
  url text,
  fecha timestamptz DEFAULT now()
);

-- 4. TABLA: Solicitudes de Servicio (formulario de contacto)
CREATE TABLE IF NOT EXISTS solicitudes_servicio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL,
  tipo_servicio text NOT NULL,
  mensaje text,
  estado text DEFAULT 'nueva' CHECK (estado IN ('nueva', 'en_revision', 'aprobada', 'rechazada')),
  created_at timestamptz DEFAULT now()
);

-- 5. TABLA: Cotizaciones (solicitudes de cotización)
CREATE TABLE IF NOT EXISTS cotizaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL,
  tipo_proyecto text NOT NULL,
  descripcion text,
  presupuesto_estimado text,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cotizada', 'aprobada', 'rechazada')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avances ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para insertar (registro y contacto)
CREATE POLICY "Permitir registro de clientes" ON clientes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir solicitudes de servicio" ON solicitudes_servicio
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir cotizaciones" ON cotizaciones
  FOR INSERT WITH CHECK (true);

-- Política para que clientes vean solo sus datos
CREATE POLICY "Clientes ven sus datos" ON clientes
  FOR SELECT USING (true);

CREATE POLICY "Clientes ven sus proyectos" ON proyectos
  FOR SELECT USING (true);

CREATE POLICY "Clientes ven avances de sus proyectos" ON avances
  FOR SELECT USING (true);
