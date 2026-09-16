-- 1. Borrar todas las tablas relacionadas en cadena para evitar errores de dependencias (CASCADE)
DROP TABLE IF EXISTS presupuesto_rubros CASCADE;
DROP TABLE IF EXISTS rubro_insumos CASCADE;
DROP TABLE IF EXISTS rubros CASCADE;
DROP TABLE IF EXISTS insumos CASCADE;

-- ==========================================
-- SARA CONSTRUCTORA - RECREACIÓN LIMPIA DE MÓDULO APU
-- ==========================================

-- 2. Crear tabla Insumos
CREATE TABLE insumos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    unidad VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('material', 'equipo', 'mano_de_obra')),
    precio_sin_iva NUMERIC(10, 4) DEFAULT 0.0000,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla Rubros
CREATE TABLE rubros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    unidad VARCHAR(20) NOT NULL,
    herramienta_menor_pct NUMERIC(5, 2) DEFAULT 5.00,
    total_costo_directo NUMERIC(12, 4) DEFAULT 0.0000,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear tabla de Recetas (Rubro Insumos)
CREATE TABLE rubro_insumos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rubro_id UUID REFERENCES rubros(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES insumos(id) ON DELETE RESTRICT,
    cantidad NUMERIC(12, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Crear tabla de Presupuesto Rubros (La que estaba amarrada y daba error)
CREATE TABLE presupuesto_rubros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presupuesto_id UUID REFERENCES presupuestos_reales(id) ON DELETE CASCADE,
    rubro_id UUID REFERENCES rubros(id) ON DELETE RESTRICT,
    codigo_rubro VARCHAR(50),
    nombre_rubro VARCHAR(255),
    unidad VARCHAR(20),
    cantidad_obra NUMERIC(12, 4) DEFAULT 1.0000,
    precio_unitario_snapshot NUMERIC(12, 4) DEFAULT 0.0000,
    subtotal NUMERIC(12, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Habilitar Seguridad (RLS)
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubro_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_rubros ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad
CREATE POLICY "Acceso total insumos" ON insumos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total rubros" ON rubros FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total rubro_insumos" ON rubro_insumos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total presupuesto_rubros" ON presupuesto_rubros FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Recargar Caché de Supabase por si acaso
NOTIFY pgrst, 'reload schema';
