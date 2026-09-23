-- Script para habilitar múltiples proveedores por insumo

-- 1. Crear la tabla puente (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS public.insumo_proveedores (
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (insumo_id, proveedor_id)
);

-- 2. Habilitar RLS (Row Level Security) para que pueda ser leída y escrita por la app
ALTER TABLE public.insumo_proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total a insumo_proveedores" 
ON public.insumo_proveedores 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Nota: Una vez ejecutado este script, el sistema podrá guardar y leer múltiples proveedores para cada insumo.
