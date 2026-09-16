-- ==========================================
-- SARA CONSTRUCTORA - NUEVOS MÓDULOS
-- ==========================================

-- 1. Tabla Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    ruc VARCHAR(20),
    contacto_vendedor VARCHAR(150),
    telefono VARCHAR(50),
    email VARCHAR(150),
    dias_credito INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla Trabajadores (Mano de Obra)
CREATE TABLE IF NOT EXISTS trabajadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    telefono VARCHAR(50),
    categoria_ocupacional VARCHAR(150) NOT NULL,
    jornal_real NUMERIC(10, 2) DEFAULT 0.00,
    costo_horario NUMERIC(10, 2) DEFAULT 0.00,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Seguridad (RLS)
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS (Permitir acceso a administradores/usuarios logueados)
CREATE POLICY "Acceso total a usuarios autenticados en proveedores" 
    ON proveedores FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Acceso total a usuarios autenticados en trabajadores" 
    ON trabajadores FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
