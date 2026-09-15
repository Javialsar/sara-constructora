-- Tabla para almacenar los parámetros globales y tarifas del cotizador
CREATE TABLE IF NOT EXISTS public.cotizador_parametros (
    id INT PRIMARY KEY DEFAULT 1,
    
    -- Tarifas de Diseño (Honorarios por m2)
    tarifa_diseno_arq_m2 DECIMAL(10,2) DEFAULT 12.00,
    tarifa_diseno_est_m2 DECIMAL(10,2) DEFAULT 8.00,
    tarifa_diseno_mep_m2 DECIMAL(10,2) DEFAULT 6.00,
    tarifa_topografia_base DECIMAL(10,2) DEFAULT 350.00,
    
    -- Estimador Paramétrico de Obra
    costo_base_construccion_m2 DECIMAL(10,2) DEFAULT 450.00,
    
    -- Factores Multiplicadores (Topografía)
    factor_pendiente_plana DECIMAL(4,2) DEFAULT 1.00,
    factor_pendiente_media DECIMAL(4,2) DEFAULT 1.15,
    factor_pendiente_fuerte DECIMAL(4,2) DEFAULT 1.35,
    
    -- Factores Multiplicadores (Acabados)
    factor_acabados_economico DECIMAL(4,2) DEFAULT 0.85,
    factor_acabados_estandar DECIMAL(4,2) DEFAULT 1.00,
    factor_acabados_premium DECIMAL(4,2) DEFAULT 1.40,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción para asegurar que siempre haya una sola fila de configuración
    CONSTRAINT single_row CHECK (id = 1)
);

-- Habilitar RLS pero permitir acceso total a los administradores
ALTER TABLE public.cotizador_parametros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de parametros" 
ON public.cotizador_parametros FOR SELECT USING (true);

CREATE POLICY "Permitir actualizacion a administradores" 
ON public.cotizador_parametros FOR UPDATE USING (true);

-- Insertar la fila inicial de configuración si no existe
INSERT INTO public.cotizador_parametros (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
