-- =============================================
-- SARA CONSTRUCTORA - Esquema de Base de Datos Seguro
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Habilitar extensión pgcrypto para UUID si no está
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABLA: Clientes (perfil extendido de auth.users)
CREATE TABLE IF NOT EXISTS clientes (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  email text UNIQUE NOT NULL,
  es_admin boolean DEFAULT false,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activo', 'inactivo')),
  imagen_url text,
  created_at timestamptz DEFAULT now()
);

-- Asegurarse de que las nuevas columnas existan si la tabla ya había sido creada
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS es_admin boolean DEFAULT false;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estado text DEFAULT 'pendiente';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS imagen_url text;

-- Eliminar columnas inseguras de versiones anteriores (opcional, pero recomendado)
ALTER TABLE clientes DROP COLUMN IF EXISTS password_hash;
ALTER TABLE clientes DROP COLUMN IF EXISTS usuario;

-- 2. TABLA: Proyectos (obras de la constructora)
CREATE TABLE IF NOT EXISTS proyectos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  ubicacion text NOT NULL,
  estado text DEFAULT 'en_diseno' CHECK (estado IN ('en_diseno', 'en_construccion', 'finalizado')),
  avance integer DEFAULT 0 CHECK (avance >= 0 AND avance <= 100),
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
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

-- 6. TABLA: Testimonios (Comentarios y Calificaciones de los Clientes)
CREATE TABLE IF NOT EXISTS testimonios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  proyecto_id uuid REFERENCES proyectos(id) ON DELETE CASCADE,
  comentario text NOT NULL,
  calificacion integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avances ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;

-- Funciones Auxiliares para Políticas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE id = auth.uid() AND es_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Políticas Clientes
DROP POLICY IF EXISTS "Admins pueden ver todo (clientes)" ON clientes;
CREATE POLICY "Admins pueden ver todo (clientes)" ON clientes FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins pueden actualizar (clientes)" ON clientes;
CREATE POLICY "Admins pueden actualizar (clientes)" ON clientes FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "Admins pueden insertar (clientes)" ON clientes;
CREATE POLICY "Admins pueden insertar (clientes)" ON clientes FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admins pueden borrar (clientes)" ON clientes;
CREATE POLICY "Admins pueden borrar (clientes)" ON clientes FOR DELETE USING (is_admin());
DROP POLICY IF EXISTS "Clientes ven su propio perfil" ON clientes;
CREATE POLICY "Clientes ven su propio perfil" ON clientes FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Clientes pueden actualizar su perfil" ON clientes;
CREATE POLICY "Clientes pueden actualizar su perfil" ON clientes FOR UPDATE USING (auth.uid() = id);

-- 2. Políticas Proyectos
DROP POLICY IF EXISTS "Admins gestionan proyectos" ON proyectos;
CREATE POLICY "Admins gestionan proyectos" ON proyectos USING (is_admin());
DROP POLICY IF EXISTS "Clientes ven sus proyectos" ON proyectos;
CREATE POLICY "Clientes ven sus proyectos" ON proyectos FOR SELECT USING (auth.uid() = cliente_id);

-- 3. Políticas Avances
DROP POLICY IF EXISTS "Admins gestionan avances" ON avances;
CREATE POLICY "Admins gestionan avances" ON avances USING (is_admin());
DROP POLICY IF EXISTS "Clientes ven avances de sus proyectos" ON avances;
CREATE POLICY "Clientes ven avances de sus proyectos" ON avances FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM proyectos WHERE proyectos.id = avances.proyecto_id AND proyectos.cliente_id = auth.uid()
  )
);

-- 4. Políticas Formularios Públicos (Cualquiera inserta, solo admin ve)
DROP POLICY IF EXISTS "Publico puede insertar solicitudes" ON solicitudes_servicio;
CREATE POLICY "Publico puede insertar solicitudes" ON solicitudes_servicio FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins gestionan solicitudes" ON solicitudes_servicio;
CREATE POLICY "Admins gestionan solicitudes" ON solicitudes_servicio USING (is_admin());

DROP POLICY IF EXISTS "Publico puede insertar cotizaciones" ON cotizaciones;
CREATE POLICY "Publico puede insertar cotizaciones" ON cotizaciones FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins gestionan cotizaciones" ON cotizaciones;
CREATE POLICY "Admins gestionan cotizaciones" ON cotizaciones USING (is_admin());

-- 5. Políticas Testimonios
DROP POLICY IF EXISTS "Publico ve testimonios aprobados" ON testimonios;
CREATE POLICY "Publico ve testimonios aprobados" ON testimonios FOR SELECT USING (estado = 'aprobado');
DROP POLICY IF EXISTS "Clientes insertan sus testimonios" ON testimonios;
CREATE POLICY "Clientes insertan sus testimonios" ON testimonios FOR INSERT WITH CHECK (auth.uid() = cliente_id);
DROP POLICY IF EXISTS "Admins gestionan testimonios" ON testimonios;
CREATE POLICY "Admins gestionan testimonios" ON testimonios USING (is_admin());

-- ==========================================
-- TRIGGERS DE AUTENTICACIÓN
-- ==========================================

-- Trigger para crear perfil de cliente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.clientes (id, email, nombre, apellido, telefono, es_admin)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'), 
    COALESCE(new.raw_user_meta_data->>'apellido', ''), 
    new.raw_user_meta_data->>'telefono',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminamos el trigger si existía y lo recreamos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- IMPORTANTE: Para que un usuario sea admin:
-- UPDATE clientes SET es_admin = true WHERE email = 'tu_correo_admin@ejemplo.com';
