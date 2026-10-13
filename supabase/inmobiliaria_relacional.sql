-- ============================================================================
-- MIGRACIÓN DDL: NORMALIZACIÓN RELACIONAL SARA INMOBILIARIA & BUCKETS STORAGE
-- Archivo: supabase/inmobiliaria_relacional.sql
-- ============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tipos Enumerados de Dominio
DO $$ BEGIN
  CREATE TYPE tipo_inmueble AS ENUM ('casa', 'departamento', 'terreno', 'suite', 'local', 'quinta');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE modalidad_inmueble AS ENUM ('venta', 'arriendo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE estado_inmueble AS ENUM ('borrador', 'en_verificacion', 'aprobado', 'publicado', 'rechazado', 'vendido', 'arrendado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE plan_promocion AS ENUM ('basico', 'destacado', 'premium', 'comision');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE estado_pago_plan AS ENUM ('al_dia', 'por_vencer', 'vencido', 'pendiente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_documento_legal AS ENUM ('escritura_publica', 'certificado_gravamenes', 'pago_impuestos', 'cedula_identidad', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Tabla Principal: Inmuebles
CREATE TABLE IF NOT EXISTS public.inmuebles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(30) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  tipo tipo_inmueble NOT NULL,
  modalidad modalidad_inmueble NOT NULL,
  precio NUMERIC(14, 2) NOT NULL CHECK (precio >= 0),
  alicuota NUMERIC(10, 2) DEFAULT 0.00,
  ciudad VARCHAR(100) NOT NULL,
  sector VARCHAR(120) NOT NULL,
  direccion TEXT,
  area_total_m2 NUMERIC(10, 2) NOT NULL CHECK (area_total_m2 >= 0),
  area_construida_m2 NUMERIC(10, 2) DEFAULT 0.00,
  habitaciones INT NOT NULL DEFAULT 0,
  banos NUMERIC(3, 1) NOT NULL DEFAULT 0,
  parqueaderos INT NOT NULL DEFAULT 0,
  antiguedad VARCHAR(50) DEFAULT 'A estrenar',
  descripcion TEXT,
  amenidades TEXT[] DEFAULT '{}',
  coordenadas JSONB DEFAULT '{"lat": -2.8974, "lng": -79.0045}'::jsonb,
  publicado BOOLEAN NOT NULL DEFAULT false,
  destacado BOOLEAN NOT NULL DEFAULT false,
  estado estado_inmueble NOT NULL DEFAULT 'en_verificacion',
  propietario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  propietario_nombre VARCHAR(150) NOT NULL,
  propietario_telefono VARCHAR(50) NOT NULL,
  propietario_email VARCHAR(150) NOT NULL,
  cuenta_bancaria JSONB DEFAULT '{}'::jsonb,
  plan_promocion plan_promocion NOT NULL DEFAULT 'destacado',
  tarifa_mensual NUMERIC(10, 2) NOT NULL DEFAULT 65.00,
  porcentaje_comision NUMERIC(5, 2) DEFAULT 3.00,
  fecha_inicio_plan DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento_plan DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  estado_pago estado_pago_plan NOT NULL DEFAULT 'pendiente',
  meses_contratados INT DEFAULT 1,
  descuento_porcentaje NUMERIC(5, 2) DEFAULT 0.00,
  total_recaudado NUMERIC(12, 2) DEFAULT 0.00,
  comprobante_pago_url TEXT,
  vistas_conteo INT DEFAULT 0,
  consultas_conteo INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inmuebles_busqueda ON public.inmuebles (publicado, estado, ciudad, tipo, modalidad);
CREATE INDEX IF NOT EXISTS idx_inmuebles_propietario ON public.inmuebles (propietario_id);

-- 4. Tabla Galería Multimedia (Imágenes y Videos)
CREATE TABLE IF NOT EXISTS public.inmueble_galeria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inmueble_id UUID NOT NULL REFERENCES public.inmuebles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  es_portada BOOLEAN NOT NULL DEFAULT false,
  tipo_medio VARCHAR(20) NOT NULL DEFAULT 'imagen',
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_galeria_inmueble ON public.inmueble_galeria (inmueble_id);

-- 5. Tabla Documentos Legales Privados
CREATE TABLE IF NOT EXISTS public.inmueble_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inmueble_id UUID NOT NULL REFERENCES public.inmuebles(id) ON DELETE CASCADE,
  tipo_documento tipo_documento_legal NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  verificado BOOLEAN NOT NULL DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_documentos_inmueble ON public.inmueble_documentos (inmueble_id);

-- 6. Tabla de Solicitudes y Leads
CREATE TABLE IF NOT EXISTS public.solicitudes_inmobiliaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inmueble_id UUID REFERENCES public.inmuebles(id) ON DELETE SET NULL,
  cliente_nombre VARCHAR(150) NOT NULL,
  cliente_telefono VARCHAR(50) NOT NULL,
  cliente_email VARCHAR(150),
  tipo_solicitud VARCHAR(30) NOT NULL DEFAULT 'consulta',
  mensaje TEXT NOT NULL,
  respuesta TEXT,
  respondida BOOLEAN NOT NULL DEFAULT false,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  notas_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_inmueble ON public.solicitudes_inmobiliaria (inmueble_id);

-- 7. Configuración de Planes Desacoplada
CREATE TABLE IF NOT EXISTS public.inmobiliaria_planes_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  planes JSONB NOT NULL,
  comisiones JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.handle_inmuebles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inmuebles_updated_at ON public.inmuebles;
CREATE TRIGGER trg_inmuebles_updated_at
  BEFORE UPDATE ON public.inmuebles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_inmuebles_updated_at();

-- ============================================================================
-- APROVISIONAMIENTO DE SUPABASE STORAGE & POLÍTICAS RLS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('inmuebles-media', 'inmuebles-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/quicktime']),
  ('inmuebles-documentos', 'inmuebles-documentos', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas para 'inmuebles-media' (Público)
DROP POLICY IF EXISTS "Public media access" ON storage.objects;
CREATE POLICY "Public media access" ON storage.objects
  FOR SELECT USING (bucket_id = 'inmuebles-media');

DROP POLICY IF EXISTS "Auth upload media" ON storage.objects;
CREATE POLICY "Auth upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'inmuebles-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owner or Admin delete media" ON storage.objects;
CREATE POLICY "Owner or Admin delete media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'inmuebles-media'
    AND (auth.uid() = owner OR (auth.jwt()->'user_metadata'->>'role') IN ('admin', 'tecnico'))
  );

-- Políticas para 'inmuebles-documentos' (Privado)
DROP POLICY IF EXISTS "Strict private read documents" ON storage.objects;
CREATE POLICY "Strict private read documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'inmuebles-documentos'
    AND (auth.uid() = owner OR (auth.jwt()->'user_metadata'->>'role') IN ('admin', 'tecnico'))
  );

DROP POLICY IF EXISTS "Auth upload documents" ON storage.objects;
CREATE POLICY "Auth upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'inmuebles-documentos' AND auth.role() = 'authenticated');
