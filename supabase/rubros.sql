-- ==========================================
-- SARA CONSTRUCTORA - MÓDULO APU (RUBROS Y RECETAS)
-- ==========================================

-- 1. Tabla principal de Rubros
CREATE TABLE IF NOT EXISTS rubros (
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

-- 2. Tabla detalle: La receta del Rubro (Insumos que lo componen)
CREATE TABLE IF NOT EXISTS rubro_insumos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rubro_id UUID REFERENCES rubros(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES insumos(id) ON DELETE RESTRICT,
    cantidad NUMERIC(12, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE rubros ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubro_insumos ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Acceso total a usuarios autenticados en rubros" ON rubros;
CREATE POLICY "Acceso total a usuarios autenticados en rubros" 
    ON rubros FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a usuarios autenticados en rubro_insumos" ON rubro_insumos;
CREATE POLICY "Acceso total a usuarios autenticados en rubro_insumos" 
    ON rubro_insumos FOR ALL TO authenticated USING (true) WITH CHECK (true);
