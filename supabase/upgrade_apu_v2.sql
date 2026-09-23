-- =============================================
-- SARA CONSTRUCTORA - MIGRACIÓN APU V2
-- Soporte para Catálogo Excel, Precios Dinámicos y Ubicaciones
-- =============================================

-- 1. Jerarquía de Categorías (Grupos y Subgrupos)
CREATE TABLE IF NOT EXISTS familias (
    id VARCHAR(20) PRIMARY KEY, -- Ej: 'FAM-001'
    nombre VARCHAR(255) NOT NULL,
    grupo_sugerido VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS subfamilias (
    id VARCHAR(20) PRIMARY KEY, -- Ej: 'SUBF-0001'
    familia_id VARCHAR(20) REFERENCES familias(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ubicaciones para Precios Geográficos (Lugar: Loja, Quito, etc.)
CREATE TABLE IF NOT EXISTS ubicaciones (
    id VARCHAR(20) PRIMARY KEY, -- Ej: 'EC-1101' (Loja)
    pais VARCHAR(100) DEFAULT 'Ecuador',
    provincia VARCHAR(100),
    canton VARCHAR(100),
    parroquia VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Atributos Dinámicos para Materiales (Diámetros, Resistencias, etc.)
CREATE TABLE IF NOT EXISTS insumo_atributos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insumo_id UUID REFERENCES insumos(id) ON DELETE CASCADE,
    atributo VARCHAR(100) NOT NULL, 
    valor_texto VARCHAR(255),
    valor_numerico NUMERIC(12, 4),
    unidad VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Precios Dinámicos (El núcleo del nuevo sistema de costos)
CREATE TABLE IF NOT EXISTS insumo_precios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insumo_id UUID REFERENCES insumos(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    ubicacion_id VARCHAR(20) REFERENCES ubicaciones(id) ON DELETE SET NULL,
    precio NUMERIC(12, 4) NOT NULL,
    fecha_consulta DATE NOT NULL,
    disponibilidad VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Actualización de las tablas existentes
-- Añadir llaves foráneas y campos de trazabilidad
ALTER TABLE insumos 
  ADD COLUMN IF NOT EXISTS subfamilia_id VARCHAR(20) REFERENCES subfamilias(id),
  ADD COLUMN IF NOT EXISTS origen VARCHAR(255); -- Para saber si es del Excel, MIDUVI, etc.

ALTER TABLE rubros
  ADD COLUMN IF NOT EXISTS subfamilia_id VARCHAR(20) REFERENCES subfamilias(id),
  ADD COLUMN IF NOT EXISTS rendimiento NUMERIC(12, 4) DEFAULT 1.0000; -- Rendimiento del rubro ej: 80 u/dia

-- 6. Políticas RLS de las nuevas tablas
ALTER TABLE familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE subfamilias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumo_atributos ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumo_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total familias" ON familias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total subfamilias" ON subfamilias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total ubicaciones" ON ubicaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total insumo_atributos" ON insumo_atributos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total insumo_precios" ON insumo_precios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Recargar Schema
NOTIFY pgrst, 'reload schema';
