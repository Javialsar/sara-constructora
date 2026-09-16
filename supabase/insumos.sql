-- ==========================================
-- SARA CONSTRUCTORA - MÓDULO APU (INSUMOS)
-- ==========================================

-- 1. Tabla de Insumos (Materiales, Equipos, Mano de Obra)
CREATE TABLE IF NOT EXISTS insumos (
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

-- 2. Habilitar Seguridad (RLS)
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
-- Eliminamos por si acaso se ejecuta dos veces para evitar el error "policy already exists"
DROP POLICY IF EXISTS "Acceso total a usuarios autenticados en insumos" ON insumos;

CREATE POLICY "Acceso total a usuarios autenticados en insumos" 
    ON insumos FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
