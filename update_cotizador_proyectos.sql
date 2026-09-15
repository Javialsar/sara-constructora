-- Modificar la tabla proyectos para integrar los datos financieros del cotizador
ALTER TABLE public.proyectos 
ADD COLUMN IF NOT EXISTS datos_financieros JSONB DEFAULT '{}'::jsonb;

-- Asegurarnos de que el esquema cotizador_parametros también incluye los nuevos campos
ALTER TABLE public.cotizador_parametros 
ADD COLUMN IF NOT EXISTS factor_tipologia_unifamiliar DECIMAL(4,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS factor_tipologia_multifamiliar DECIMAL(4,2) DEFAULT 1.15,
ADD COLUMN IF NOT EXISTS factor_tipologia_comercial DECIMAL(4,2) DEFAULT 1.25,
ADD COLUMN IF NOT EXISTS factor_tipologia_industrial DECIMAL(4,2) DEFAULT 0.85,
ADD COLUMN IF NOT EXISTS porcentaje_adicional_por_piso DECIMAL(4,2) DEFAULT 0.03,
ADD COLUMN IF NOT EXISTS factor_sotano DECIMAL(4,2) DEFAULT 1.40;
