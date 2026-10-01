-- =======================================================
-- SARA CONSTRUCTORA - MOTOR DE PAGOS CENTRALIZADO
-- Para SaaS APU, Inmobiliaria, Stays y Obras
-- =======================================================

-- 1. Tabla de Órdenes de Pago (La factura proforma o intención de compra)
CREATE TABLE IF NOT EXISTS ordenes_pago (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    modulo VARCHAR(50) NOT NULL CHECK (modulo IN ('saas', 'inmobiliaria', 'stays', 'constructora')),
    referencia_id VARCHAR(255) NOT NULL, -- Ej: 'plan_pro', o ID del departamento/reserva
    concepto VARCHAR(255) NOT NULL, -- Ej: 'Suscripción Mensual SaaS', 'Reserva Depto A1'
    monto NUMERIC(12, 2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'rechazada', 'cancelada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Transacciones (El pago real: Tarjeta o Transferencia)
CREATE TABLE IF NOT EXISTS transacciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID REFERENCES ordenes_pago(id) ON DELETE CASCADE,
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('stripe', 'transferencia', 'efectivo')),
    monto_pagado NUMERIC(12, 2) NOT NULL,
    stripe_session_id VARCHAR(255), -- Lleno si el pago fue automático por Stripe
    comprobante_url TEXT, -- Lleno si el usuario subió una foto del depósito
    estado_aprobacion VARCHAR(50) DEFAULT 'pendiente' CHECK (estado_aprobacion IN ('pendiente', 'aprobada', 'rechazada')),
    observaciones_admin TEXT, -- Por si rechazas la transferencia y le pones "Comprobante borroso"
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Suscripciones SaaS (Control de acceso al módulo APU)
CREATE TABLE IF NOT EXISTS suscripciones_saas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_id VARCHAR(50) DEFAULT 'gratis' CHECK (plan_id IN ('gratis', 'pro', 'empresarial')),
    estado VARCHAR(50) DEFAULT 'activa' CHECK (estado IN ('activa', 'vencida', 'cancelada')),
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    fecha_fin TIMESTAMP WITH TIME ZONE, -- Nulo si es vitalicia, o +30 días si es mensual
    ultima_orden_id UUID REFERENCES ordenes_pago(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ==========================================

ALTER TABLE ordenes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones_saas ENABLE ROW LEVEL SECURITY;

-- 4. RLS para Órdenes de Pago
-- Los clientes pueden ver sus propias órdenes
CREATE POLICY "Usuarios ven sus ordenes" ON ordenes_pago 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Los clientes pueden insertar órdenes (cuando inician un checkout)
CREATE POLICY "Usuarios crean ordenes" ON ordenes_pago 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 5. RLS para Transacciones
-- Los clientes pueden ver las transacciones de sus propias órdenes
CREATE POLICY "Usuarios ven sus transacciones" ON transacciones 
  FOR SELECT TO authenticated USING (
    orden_id IN (SELECT id FROM ordenes_pago WHERE user_id = auth.uid())
  );

-- Los clientes pueden registrar que hicieron una transferencia
CREATE POLICY "Usuarios insertan transacciones" ON transacciones 
  FOR INSERT TO authenticated WITH CHECK (
    orden_id IN (SELECT id FROM ordenes_pago WHERE user_id = auth.uid())
  );

-- 6. RLS para Suscripciones
-- Los clientes solo pueden leer el estado de su suscripción (No pueden alterarla, eso lo hace el webhook o el admin)
CREATE POLICY "Usuarios leen su suscripcion" ON suscripciones_saas 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Triggers útiles para actualizar el "updated_at"
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ordenes_pago_modtime
BEFORE UPDATE ON ordenes_pago
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_suscripciones_saas_modtime
BEFORE UPDATE ON suscripciones_saas
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insertar por defecto a todo usuario en plan "gratis" al registrarse (opcional, pero útil)
-- Esto se puede manejar también desde el frontend.

NOTIFY pgrst, 'reload schema';
