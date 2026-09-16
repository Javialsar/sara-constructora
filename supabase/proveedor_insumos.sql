-- ==========================================
-- SARA CONSTRUCTORA - PROVEEDORES E INSUMOS
-- ==========================================

-- Tabla de relación Muchos a Muchos entre Proveedores e Insumos
CREATE TABLE IF NOT EXISTS proveedor_insumos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES insumos(id) ON DELETE CASCADE,
    precio_cotizado NUMERIC(12, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(proveedor_id, insumo_id)
);

ALTER TABLE proveedor_insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total a usuarios autenticados en proveedor_insumos" 
    ON proveedor_insumos FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
