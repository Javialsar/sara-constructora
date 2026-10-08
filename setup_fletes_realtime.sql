-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create fletes_planes table
CREATE TABLE fletes_planes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'VIP', 'Estandar', 'Basico'
    comision DECIMAL(5, 2) NOT NULL, -- Percentage of commission
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plans
INSERT INTO fletes_planes (nombre, comision) VALUES
    ('VIP', 5.00),
    ('Estandar', 10.00),
    ('Basico', 15.00);

-- Create fletes_conductores table
CREATE TABLE fletes_conductores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Assuming Supabase Auth
    plan_id INTEGER REFERENCES fletes_planes(id) NOT NULL,
    saldo_billetera DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    estado_activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create fletes_solicitudes table
CREATE TABLE fletes_solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origen VARCHAR(255) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    tarifa DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente' NOT NULL, -- e.g., pendiente, aceptado, completado
    codigo_acceso VARCHAR(50),
    conductor_id UUID REFERENCES fletes_conductores(id),
    cliente_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE fletes_planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fletes_conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fletes_solicitudes ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies

-- fletes_planes: anyone can read
CREATE POLICY "Planes viewable by everyone" ON fletes_planes
    FOR SELECT USING (true);

-- fletes_conductores: Drivers can view and update their own profile
CREATE POLICY "Conductores can view own profile" ON fletes_conductores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Conductores can update own profile" ON fletes_conductores
    FOR UPDATE USING (auth.uid() = user_id);

-- fletes_solicitudes: Clients view their own, Drivers view if assigned or if status is 'pendiente'
CREATE POLICY "Users can view relevant solicitudes" ON fletes_solicitudes
    FOR SELECT USING (
        auth.uid() = cliente_id OR 
        auth.uid() IN (SELECT user_id FROM fletes_conductores WHERE id = fletes_solicitudes.conductor_id) OR
        status = 'pendiente'
    );

CREATE POLICY "Clients can create solicitudes" ON fletes_solicitudes
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Users can update relevant solicitudes" ON fletes_solicitudes
    FOR UPDATE USING (
        auth.uid() = cliente_id OR 
        auth.uid() IN (SELECT user_id FROM fletes_conductores WHERE id = fletes_solicitudes.conductor_id)
    );
