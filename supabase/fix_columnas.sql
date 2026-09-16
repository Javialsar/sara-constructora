-- Para forzar la creación de las columnas en caso de que las tablas ya existieran
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS precio_sin_iva NUMERIC(10, 4) DEFAULT 0.0000;
ALTER TABLE rubros ADD COLUMN IF NOT EXISTS herramienta_menor_pct NUMERIC(5, 2) DEFAULT 5.00;
ALTER TABLE rubros ADD COLUMN IF NOT EXISTS total_costo_directo NUMERIC(12, 4) DEFAULT 0.0000;

-- Por precaución, recargar la caché de PostgREST
NOTIFY pgrst, 'reload schema';
