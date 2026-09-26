-- ==============================================================================
-- SARA CONSTRUCTORA & HOSPITALITY - MÓDULO AIRBNB
-- Script de Creación y Migración de la Tabla: alojamientos_airbnb
-- Ejecutar en el SQL Editor de tu Dashboard de Supabase
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para generación de UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Crear Tabla de Alojamientos Airbnb con todas las columnas de las 5 viñetas
CREATE TABLE IF NOT EXISTS alojamientos_airbnb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  titulo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('suite', 'departamento', 'penthouse', 'casa', 'villa', 'quinta', 'loft')),
  alcance text NOT NULL DEFAULT 'nacional' CHECK (alcance IN ('nacional', 'internacional')),
  pais text NOT NULL DEFAULT 'Ecuador',
  bandera text NOT NULL DEFAULT '🇪🇨',
  ciudad text NOT NULL,
  sector text NOT NULL,
  
  -- Viñeta 1: Coordenadas GPS de Geolocalización
  lat double precision NOT NULL DEFAULT -2.9001,
  lng double precision NOT NULL DEFAULT -79.0059,
  
  -- Viñeta 5: Tarifas Base
  precio_noche numeric(10,2) NOT NULL DEFAULT 50.00,
  tarifa_limpieza numeric(10,2) NOT NULL DEFAULT 15.00,
  rating numeric(3,2) DEFAULT 5.00,
  is_superhost boolean DEFAULT true,
  
  -- Viñeta 4: Capacidad y Distribución
  max_huespedes integer NOT NULL DEFAULT 2,
  habitaciones integer NOT NULL DEFAULT 1,
  banos numeric(3,1) NOT NULL DEFAULT 1.0,
  camas integer NOT NULL DEFAULT 1,
  
  -- Viñeta 2: Multimedia (Foto de portada, galería completa y video tour)
  imagen_url text NOT NULL, -- Foto de portada principal mostrada en tarjetas
  imagenes text[] DEFAULT ARRAY[]::text[], -- Array con todas las fotos añadidas
  video_url text DEFAULT '', -- Enlace de video tour YouTube, Vimeo o MP4
  
  -- Viñeta 4: Checklist de Amenidades y Textos
  amenidades text[] DEFAULT ARRAY[]::text[],
  descripcion text DEFAULT '',
  reglas text[] DEFAULT ARRAY[]::text[],
  publicado boolean DEFAULT true,
  
  -- Viñeta 3: Datos del Anfitrión & Cuenta Bancaria para Pagos / Anticipos
  anfitrion_nombre text NOT NULL,
  anfitrion_telefono text NOT NULL,
  anfitrion_email text DEFAULT '',
  anfitrion_cedula_ruc text DEFAULT '',
  anfitrion_banco text DEFAULT 'Banco Pichincha',
  anfitrion_tipo_cuenta text DEFAULT 'Ahorros',
  anfitrion_numero_cuenta text DEFAULT '',
  anfitrion_titular text DEFAULT '',
  anfitrion_cuenta_bancaria text DEFAULT '',
  
  -- Viñeta 5: Modelo de Monetización y Comisión SARA
  monetizacion_modelo text DEFAULT 'comision_reserva' CHECK (monetizacion_modelo IN ('comision_reserva', 'gestion_completa', 'membresia_fija')),
  monetizacion_porcentaje_comision numeric(5,2) DEFAULT 15.00,
  monetizacion_cuota_fija_mensual numeric(10,2) DEFAULT 45.00,
  monetizacion_total_comisiones numeric(10,2) DEFAULT 0.00,
  
  -- Metadatos de auditoría
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Índices para acelerar búsquedas y filtros en portal público y panel admin
CREATE INDEX IF NOT EXISTS idx_alojamientos_codigo ON alojamientos_airbnb (codigo);
CREATE INDEX IF NOT EXISTS idx_alojamientos_ciudad ON alojamientos_airbnb (ciudad);
CREATE INDEX IF NOT EXISTS idx_alojamientos_alcance ON alojamientos_airbnb (alcance);
CREATE INDEX IF NOT EXISTS idx_alojamientos_tipo ON alojamientos_airbnb (tipo);
CREATE INDEX IF NOT EXISTS idx_alojamientos_publicado ON alojamientos_airbnb (publicado);

-- 4. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE alojamientos_airbnb ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Seguridad (RLS)
-- Permitir lectura pública a cualquier visitante para ver el catálogo y mapa
DROP POLICY IF EXISTS "Lectura publica de alojamientos" ON alojamientos_airbnb;
CREATE POLICY "Lectura publica de alojamientos"
  ON alojamientos_airbnb FOR SELECT
  USING (true);

-- Permitir inserción, actualización y eliminación
DROP POLICY IF EXISTS "Gestion administrativa de alojamientos" ON alojamientos_airbnb;
CREATE POLICY "Gestion administrativa de alojamientos"
  ON alojamientos_airbnb FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Insertar / Actualizar Alojamientos Iniciales de Ejemplo
INSERT INTO alojamientos_airbnb (
  codigo, titulo, tipo, alcance, pais, bandera, ciudad, sector,
  lat, lng, precio_noche, tarifa_limpieza, rating, is_superhost,
  max_huespedes, habitaciones, banos, camas, imagen_url, imagenes, video_url,
  amenidades, descripcion, reglas, publicado,
  anfitrion_nombre, anfitrion_telefono, anfitrion_email, anfitrion_cedula_ruc,
  anfitrion_banco, anfitrion_tipo_cuenta, anfitrion_numero_cuenta, anfitrion_titular, anfitrion_cuenta_bancaria,
  monetizacion_modelo, monetizacion_porcentaje_comision, monetizacion_total_comisiones
)
VALUES
(
  'SARA-EC-01',
  'Master Suite de Diseño Frente al Río Tomebamba',
  'suite',
  'nacional',
  'Ecuador',
  '🇪🇨',
  'Cuenca',
  'Puertas del Sol',
  -2.9001,
  -79.0059,
  48.00,
  15.00,
  4.98,
  true,
  2,
  1,
  1.0,
  1,
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
  ],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ARRAY['Vista al Río', 'WiFi 300 Mbps Fibra', 'Smart Lock (Self Check-in)', 'Smart TV 55" 4K', 'Cafetera Nespresso', 'Parqueadero Subterráneo', 'Cocina Equipada', 'Sala de Estar', 'Comedor'],
  'Disfruta de amaneceres únicos con el sonido del río Tomebamba. Suite contemporánea equipada con cerradura inteligente para llegada autónoma 24/7, cama King con sábanas de 600 hilos, cafetera Nespresso e internet simétrico de alta velocidad.',
  ARRAY['Check-in: 15:00 a 22:00', 'Check-out: 11:00', 'No se permiten fiestas', 'No fumar dentro de la suite'],
  true,
  'Patricio Carrasco',
  '+593 981804023',
  'patricio.carrasco@gmail.com',
  '0103492817',
  'Banco Pichincha',
  'Ahorros',
  '2201984532',
  'Patricio Carrasco',
  'Banco Pichincha Ahorros 2201984532',
  'comision_reserva',
  15.00,
  320.00
),
(
  'SARA-EC-02',
  'Penthouse Exclusivo con Terraza 360° en la Solano',
  'penthouse',
  'nacional',
  'Ecuador',
  '🇪🇨',
  'Cuenca',
  'Av. Solano',
  -2.9095,
  -79.0112,
  95.00,
  25.00,
  5.00,
  true,
  6,
  3,
  2.5,
  3,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  ],
  '',
  ARRAY['Terraza / Balcón', 'Área BBQ / Parrilla', 'WiFi 300 Mbps Fibra', 'Smart Lock (Self Check-in)', 'Smart TV 55" 4K', 'Cocina Equipada', 'Sala de Estar', 'Comedor', 'Parqueadero Subterráneo'],
  'Penthouse exclusivo de dos niveles con vista panorámica a la ciudad y montañas. Terraza privada con pérgola y barbacoa, cocina equipada con isla de cuarzo y sonido envolvente.',
  ARRAY['Check-in: 15:00 a 22:00', 'Check-out: 11:00', 'No se permiten fiestas', 'No fumar dentro'],
  true,
  'Sofía Arteaga',
  '+593 991122334',
  'sofia.arteaga@hotmail.com',
  '0102983741',
  'Banco de Guayaquil',
  'Corriente',
  '0012398412',
  'Sofía Arteaga',
  'Banco de Guayaquil Corriente 0012398412',
  'gestion_completa',
  20.00,
  570.00
),
(
  'SARA-EC-03',
  'Villa Campestre de Lujo con Jacuzzi en Yunguilla',
  'quinta',
  'nacional',
  'Ecuador',
  '🇪🇨',
  'Yunguilla',
  'Santa Isabel',
  -3.2389,
  -79.2889,
  140.00,
  35.00,
  4.96,
  false,
  10,
  4,
  3.0,
  6,
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  ],
  '',
  ARRAY['Piscina', 'Jacuzzi / Hidromasaje', 'Área BBQ / Parrilla', 'Terraza / Balcón', 'Cocina Equipada', 'Sala de Estar', 'Comedor', 'WiFi 300 Mbps Fibra', 'Parqueadero Privado', 'Pet Friendly'],
  'Fabulosa villa en el clima cálido del valle de Yunguilla. Piscina privada con cascada, jacuzzi climatizado, amplios jardines y zona de barbacoa rústica.',
  ARRAY['Check-in: 14:00', 'Check-out: 12:00', 'Música moderada después de las 23:00', 'Mascotas bienvenidas en áreas verdes'],
  true,
  'Dr. Roberto Morales',
  '+593 987654321',
  'roberto.morales@clinica.ec',
  '0101827463',
  'Produbanco - Grupo Promerica',
  'Ahorros',
  '1205098734',
  'Roberto Morales',
  'Produbanco Ahorros 1205098734',
  'comision_reserva',
  15.00,
  420.00
)
ON CONFLICT (codigo) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  tipo = EXCLUDED.tipo,
  alcance = EXCLUDED.alcance,
  ciudad = EXCLUDED.ciudad,
  sector = EXCLUDED.sector,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  precio_noche = EXCLUDED.precio_noche,
  tarifa_limpieza = EXCLUDED.tarifa_limpieza,
  habitaciones = EXCLUDED.habitaciones,
  banos = EXCLUDED.banos,
  camas = EXCLUDED.camas,
  max_huespedes = EXCLUDED.max_huespedes,
  imagen_url = EXCLUDED.imagen_url,
  imagenes = EXCLUDED.imagenes,
  video_url = EXCLUDED.video_url,
  amenidades = EXCLUDED.amenidades,
  descripcion = EXCLUDED.descripcion,
  reglas = EXCLUDED.reglas,
  anfitrion_nombre = EXCLUDED.anfitrion_nombre,
  anfitrion_telefono = EXCLUDED.anfitrion_telefono,
  anfitrion_email = EXCLUDED.anfitrion_email,
  anfitrion_banco = EXCLUDED.anfitrion_banco,
  anfitrion_tipo_cuenta = EXCLUDED.anfitrion_tipo_cuenta,
  anfitrion_numero_cuenta = EXCLUDED.anfitrion_numero_cuenta,
  anfitrion_cuenta_bancaria = EXCLUDED.anfitrion_cuenta_bancaria,
  monetizacion_porcentaje_comision = EXCLUDED.monetizacion_porcentaje_comision,
  updated_at = now();
