-- =================================================================
-- SARA CONSTRUCTORA - MIGRACIÓN A RECETAS POR PROYECTO (OPCIÓN B)
-- =================================================================

-- 1. Crear la nueva tabla que almacenará la receta específica del presupuesto
CREATE TABLE IF NOT EXISTS presupuesto_rubro_insumos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presupuesto_rubro_id UUID REFERENCES presupuesto_rubros(id) ON DELETE CASCADE,
    insumo_id UUID REFERENCES insumos(id) ON DELETE RESTRICT,
    cantidad NUMERIC(12, 6) NOT NULL,
    precio_sin_iva_snapshot NUMERIC(10, 4) DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE presupuesto_rubro_insumos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso total presupuesto_rubro_insumos" ON presupuesto_rubro_insumos;
CREATE POLICY "Acceso total presupuesto_rubro_insumos" ON presupuesto_rubro_insumos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Recargar el schema en Supabase API
NOTIFY pgrst, 'reload schema';
