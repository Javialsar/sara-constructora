-- Script para crear el sistema centralizado de notificaciones globales

CREATE TABLE IF NOT EXISTS public.notificaciones_globales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destinatario_tipo VARCHAR(50) NOT NULL, -- 'admin', 'inmobiliaria', 'stays', 'apu'
    destinatario_id VARCHAR(255), -- ID del usuario, cliente o perfil de localStorage. Si es null, es para TODOS los de ese tipo
    modulo_origen VARCHAR(50) NOT NULL, -- De donde viene la notificacion
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    link VARCHAR(255),
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies (RLS)
ALTER TABLE public.notificaciones_globales ENABLE ROW LEVEL SECURITY;

-- Los usuarios publicos no pueden ver notificaciones a menos que se use un servicio
-- Pero como leemos esto desde el cliente, necesitamos politicas:

-- Permitir lectura general temporalmente (o mediante funciones)
CREATE POLICY "Lectura abierta temporal para notificaciones" 
ON public.notificaciones_globales FOR SELECT USING (true);

CREATE POLICY "Insercion abierta temporal" 
ON public.notificaciones_globales FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualizacion abierta temporal" 
ON public.notificaciones_globales FOR UPDATE USING (true);
