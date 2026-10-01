-- =======================================================
-- SARA CONSTRUCTORA - PLANES DE SUSCRIPCIÓN DINÁMICOS
-- =======================================================

CREATE TABLE IF NOT EXISTS planes_suscripcion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL,
    frecuencia VARCHAR(20) DEFAULT 'mes', -- 'mes', 'año', 'pago_unico'
    beneficios JSONB DEFAULT '[]'::jsonb, -- Array de textos con los beneficios
    stripe_price_id VARCHAR(100), -- Opcional, para cuando vincules productos reales de Stripe
    es_recomendado BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0, -- Para ordenarlos en la pantalla
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;

-- Los usuarios del SaaS pueden LEER los planes activos
CREATE POLICY "Cualquiera puede ver los planes activos" ON planes_suscripcion 
  FOR SELECT USING (activo = true);

-- Solo los Administradores (o con acceso a la app) pueden hacer TODO (Insert, Update, Delete)
-- NOTA: Por ahora lo dejamos abierto a usuarios autenticados para facilidad, 
-- pero en producción deberías limitarlo al rol "admin".
CREATE POLICY "Admins pueden gestionar planes" ON planes_suscripcion 
  FOR ALL TO authenticated USING (true);

-- Insertar los 2 planes por defecto que ya teníamos
INSERT INTO planes_suscripcion (id, nombre, descripcion, precio, beneficios, es_recomendado, orden)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Básico',
    'Perfecto para explorar la plataforma.',
    0.00,
    '["Acceso a la base de insumos global", "1 Proyecto (Cotización Rápida)", "Límite de 15 APUs personalizados"]'::jsonb,
    false,
    1
),
(
    '00000000-0000-0000-0000-000000000002',
    'Profesional',
    'Todo lo que necesitas para presupuestar sin límites.',
    15.00,
    '["Proyectos y Cotizaciones ilimitadas", "APUs y Rubros personalizados infinitos", "Módulo de Presupuestos Reales completo", "Exportación nativa a Excel (.xlsm) y PDF", "Actualización de precios de mercado"]'::jsonb,
    true,
    2
) ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
