-- ====================================================================================
-- SCHEMA UNIFICADO: GRUPO SARA (MERCADO ECUADOR)
-- ====================================================================================
-- Autor: Agente DBA (Supabase / PostgreSQL)
-- Descripción: Esquema relacional central que integra Marketplace, Talento, Fletes,
--              Compras Predictivas y Sistema Financiero Escrow.
-- ====================================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUMERADOS
CREATE TYPE user_role AS ENUM ('constructor', 'proveedor', 'transportista', 'profesional', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE freight_status AS ENUM ('searching', 'assigned', 'in_transit', 'completed');
CREATE TYPE escrow_status AS ENUM ('locked', 'partially_released', 'released', 'disputed', 'refunded');

-- 3. TABLAS CORE

-- Tabla de Usuarios (Autenticación y Perfil Básico)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    ruc_cedula VARCHAR(13) UNIQUE NOT NULL, -- RUC (13) o Cédula (10) Ecuador
    role user_role NOT NULL,
    phone VARCHAR(20),
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MÓDULO 1: MARKETPLACE DE MATERIALES

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL, -- Precio sin IVA
    stock DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    weight_kg DECIMAL(10, 2),
    volume_m3 DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constructor_id UUID REFERENCES public.users(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    tax_iva NUMERIC(12, 2) NOT NULL, -- IVA (Ecuador: típicamente 12% o 15% según vigencia)
    status order_status DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    delivery_province VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 5. MÓDULO 2: SARA TALENTO

CREATE TABLE public.talent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    profession VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 0,
    hourly_rate NUMERIC(10, 2),
    availability BOOLEAN DEFAULT TRUE,
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id UUID REFERENCES public.talent_profiles(id),
    constructor_id UUID REFERENCES public.users(id),
    project_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    proposed_rate NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MÓDULO 3: RED AGÉNTICA DE FLETES

CREATE TABLE public.freight_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id),
    carrier_id UUID REFERENCES public.users(id),
    origin_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    distance_km DECIMAL(10, 2),
    total_weight_kg DECIMAL(10, 2) NOT NULL,
    total_volume_m3 DECIMAL(10, 2) NOT NULL,
    freight_cost NUMERIC(12, 2) NOT NULL,
    status freight_status DEFAULT 'searching',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MÓDULO 4 & 5: SARA FINTECH & ESCROW

CREATE TABLE public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constructor_id UUID REFERENCES public.users(id),
    project_name VARCHAR(255) NOT NULL,
    total_locked_amount NUMERIC(15, 2) NOT NULL,
    released_amount NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status escrow_status DEFAULT 'locked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID REFERENCES public.escrow_transactions(id),
    issuer_id UUID REFERENCES public.users(id), -- Proveedor, Talento o Transportista
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    retention_amount NUMERIC(12, 2) DEFAULT 0, -- Retenciones en la fuente (Ecuador)
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Los constructores pueden ver sus propias transacciones escrow
CREATE POLICY "Constructors view own escrow" 
ON public.escrow_transactions FOR SELECT 
USING (auth.uid() = constructor_id);

-- Proveedores/transportistas/talento pueden ver las facturas que emitieron
CREATE POLICY "Issuers view own invoices" 
ON public.invoices FOR SELECT 
USING (auth.uid() = issuer_id);

-- Constructores pueden ver facturas asociadas a su escrow
CREATE POLICY "Constructors view invoices for their escrows" 
ON public.invoices FOR SELECT 
USING (
    escrow_id IN (
        SELECT id FROM public.escrow_transactions WHERE constructor_id = auth.uid()
    )
);
