-- ============================================================================
-- MIGRACIÓN DDL: ESQUEMA OFICIAL SARA-FLETES Y RENTA TEMPORAL DE VEHÍCULOS
-- Plataforma Integral Multimodal de Carga y Alquiler On-Demand (Tipo Uber, inDrive, DiDi)
-- ============================================================================

-- 1. EXTENSIÓN PARA CÁLCULO GEOESPACIAL (SI ESTÁ DISPONIBLE)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE ZONIFICACIÓN PROVINCIAL / CANTONAL
CREATE TABLE IF NOT EXISTS public.fletes_zonas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_zona VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    provincia VARCHAR(80) NOT NULL,
    canton VARCHAR(80) NOT NULL,
    latitud_centro NUMERIC(10, 6) NOT NULL,
    longitud_centro NUMERIC(10, 6) NOT NULL,
    radio_cobertura_km NUMERIC(6, 2) NOT NULL DEFAULT 15.00,
    tarifa_base_multiplicador NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    factor_demanda NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE FLOTA VEHICULAR MULTIMODAL (FLETE Y RENTA TEMPORAL)
CREATE TABLE IF NOT EXISTS public.fletes_vehiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placa VARCHAR(15) UNIQUE NOT NULL,
    conductor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_chofer VARCHAR(120) NOT NULL,
    telefono_chofer VARCHAR(30) NOT NULL,
    marca VARCHAR(60) NOT NULL,
    modelo VARCHAR(60) NOT NULL,
    anio INTEGER NOT NULL DEFAULT 2022,
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('PICKUP_1T', 'FURGON_3T', 'CAMION_5T', 'VOLQUETA_V3A', 'CAMION_10T', 'TRACTO_3S3')),
    modalidad VARCHAR(30) NOT NULL DEFAULT 'HIBRIDO' CHECK (modalidad IN ('FLETE_CARGA', 'RENTA_TEMPORAL', 'HIBRIDO')),
    permite_sin_chofer BOOLEAN NOT NULL DEFAULT FALSE,
    tarifa_hora NUMERIC(8, 2) NOT NULL DEFAULT 12.00,
    tarifa_dia NUMERIC(8, 2) NOT NULL DEFAULT 65.00,
    deposito_garantia NUMERIC(8, 2) NOT NULL DEFAULT 250.00,
    capacidad_ton NUMERIC(6, 2) NOT NULL,
    volumen_m3 NUMERIC(6, 2) NOT NULL,
    latitud NUMERIC(10, 6) NOT NULL,
    longitud NUMERIC(10, 6) NOT NULL,
    zona_id UUID REFERENCES public.fletes_zonas(id) ON DELETE SET NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'EN_VIAJE', 'EN_RENTA', 'MANTENIMIENTO', 'INACTIVO')),
    calificacion_promedio NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
    viajes_completados INTEGER NOT NULL DEFAULT 0,
    verificado_ant BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE RESERVAS DE RENTA TEMPORAL DE VEHÍCULOS (POR HORAS / DÍAS)
CREATE TABLE IF NOT EXISTS public.fletes_reservas_renta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id UUID NOT NULL REFERENCES public.fletes_vehiculos(id) ON DELETE RESTRICT,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(120) NOT NULL,
    cliente_telefono VARCHAR(30) NOT NULL,
    cliente_cedula VARCHAR(20) NOT NULL,
    modalidad_renta VARCHAR(20) NOT NULL DEFAULT 'CON_CHOFER' CHECK (modalidad_renta IN ('CON_CHOFER', 'SIN_CHOFER')),
    duracion_tipo VARCHAR(10) NOT NULL CHECK (duracion_tipo IN ('HORAS', 'DIAS')),
    duracion_valor INTEGER NOT NULL CHECK (duracion_valor > 0),
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    lugar_entrega VARCHAR(255) NOT NULL,
    latitud_entrega NUMERIC(10, 6),
    longitud_entrega NUMERIC(10, 6),
    tarifa_base NUMERIC(10, 2) NOT NULL,
    suplemento_chofer NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    seguro_cobertura NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    tarifa_total NUMERIC(10, 2) NOT NULL,
    deposito_garantia NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_pago IN ('PENDIENTE', 'PAGADO', 'GARANTIA_RETENIDA', 'REEMBOLSADO')),
    pin_desbloqueo VARCHAR(10) NOT NULL,
    odometro_inicial NUMERIC(10, 2),
    odometro_final NUMERIC(10, 2),
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA' CHECK (estado IN ('SOLICITADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. HISTORIAL DE TELEMETRÍA Y GEOTRACKING EN VIVO
CREATE TABLE IF NOT EXISTS public.fletes_viajes_tracking (
    id BIGSERIAL PRIMARY KEY,
    vehiculo_id UUID REFERENCES public.fletes_vehiculos(id) ON DELETE CASCADE,
    solicitud_id UUID REFERENCES public.fletes_solicitudes(id) ON DELETE CASCADE,
    reserva_id UUID REFERENCES public.fletes_reservas_renta(id) ON DELETE CASCADE,
    latitud NUMERIC(10, 6) NOT NULL,
    longitud NUMERIC(10, 6) NOT NULL,
    velocidad_kmh NUMERIC(5, 2) DEFAULT 0.00,
    rumbo_grados NUMERIC(5, 2),
    timestamp_gps TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ÍNDICES ESPACIALES Y DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_fletes_vehiculos_coords ON public.fletes_vehiculos (latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_fletes_vehiculos_categoria ON public.fletes_vehiculos (categoria, estado);
CREATE INDEX IF NOT EXISTS idx_fletes_vehiculos_modalidad ON public.fletes_vehiculos (modalidad, estado);
CREATE INDEX IF NOT EXISTS idx_fletes_zonas_coords ON public.fletes_zonas (latitud_centro, longitud_centro);

-- 7. FUNCIÓN SQL PARA BÚSQUEDA DE VEHÍCULOS POR RADIO HAVERSINE
CREATE OR REPLACE FUNCTION public.fn_fletes_buscar_vehiculos_cercanos(
    p_lat NUMERIC,
    p_lng NUMERIC,
    p_radio_km NUMERIC DEFAULT 25.00,
    p_modalidad VARCHAR DEFAULT NULL,
    p_categoria VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    placa VARCHAR,
    nombre_chofer VARCHAR,
    telefono_chofer VARCHAR,
    marca VARCHAR,
    modelo VARCHAR,
    anio INTEGER,
    categoria VARCHAR,
    modalidad VARCHAR,
    permite_sin_chofer BOOLEAN,
    tarifa_hora NUMERIC,
    tarifa_dia NUMERIC,
    capacidad_ton NUMERIC,
    volumen_m3 NUMERIC,
    latitud NUMERIC,
    longitud NUMERIC,
    calificacion_promedio NUMERIC,
    distancia_km NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.placa,
        v.nombre_chofer,
        v.telefono_chofer,
        v.marca,
        v.modelo,
        v.anio,
        v.categoria,
        v.modalidad,
        v.permite_sin_chofer,
        v.tarifa_hora,
        v.tarifa_dia,
        v.capacidad_ton,
        v.volumen_m3,
        v.latitud,
        v.longitud,
        v.calificacion_promedio,
        ROUND(
            (6371 * acos(
                cos(radians(p_lat)) * cos(radians(v.latitud)) * 
                cos(radians(v.longitud) - radians(p_lng)) + 
                sin(radians(p_lat)) * sin(radians(v.latitud))
            ))::numeric, 2
        ) AS distancia_km
    FROM public.fletes_vehiculos v
    WHERE v.estado = 'DISPONIBLE'
      AND (p_modalidad IS NULL OR v.modalidad = 'HIBRIDO' OR v.modalidad = p_modalidad)
      AND (p_categoria IS NULL OR v.categoria = p_categoria)
      AND (
          6371 * acos(
              cos(radians(p_lat)) * cos(radians(v.latitud)) * 
              cos(radians(v.longitud) - radians(p_lng)) + 
              sin(radians(p_lat)) * sin(radians(v.latitud))
          )
      ) <= p_radio_km
    ORDER BY distancia_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.fletes_zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_reservas_renta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fletes_viajes_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para mapa de clientes (idempotentes)
DROP POLICY IF EXISTS "Lectura pública de zonas activas" ON public.fletes_zonas;
CREATE POLICY "Lectura pública de zonas activas" ON public.fletes_zonas FOR SELECT USING (activa = true);

DROP POLICY IF EXISTS "Lectura pública de vehículos disponibles" ON public.fletes_vehiculos;
CREATE POLICY "Lectura pública de vehículos disponibles" ON public.fletes_vehiculos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de tracking activo" ON public.fletes_viajes_tracking;
CREATE POLICY "Lectura pública de tracking activo" ON public.fletes_viajes_tracking FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden ver sus reservas" ON public.fletes_reservas_renta;
CREATE POLICY "Usuarios pueden ver sus reservas" ON public.fletes_reservas_renta FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción pública de reservas de renta" ON public.fletes_reservas_renta;
CREATE POLICY "Inserción pública de reservas de renta" ON public.fletes_reservas_renta FOR INSERT WITH CHECK (true);

-- 9. SEMILLA INICIAL DE ZONAS OPERATIVAS (ECUADOR)
INSERT INTO public.fletes_zonas (codigo_zona, nombre, provincia, canton, latitud_centro, longitud_centro, radio_cobertura_km)
VALUES
    ('ZONA-LOJA-CALVAS', 'Cariamanga / Calvas', 'Loja', 'Calvas', -4.328500, -79.556000, 20.00),
    ('ZONA-LOJA-CENTRO', 'Loja Capital', 'Loja', 'Loja', -3.993100, -79.204200, 25.00),
    ('ZONA-AZUAY-CUENCA', 'Cuenca Metrópoli', 'Azuay', 'Cuenca', -2.897400, -79.004400, 30.00),
    ('ZONA-PICHINCHA-QUITO', 'Quito DM & Valles', 'Pichincha', 'Quito', -0.180700, -78.467800, 45.00),
    ('ZONA-GUAYAS-GYE', 'Guayaquil & Samborondón', 'Guayas', 'Guayaquil', -2.185200, -79.924800, 40.00)
ON CONFLICT (codigo_zona) DO NOTHING;

-- 10. FLOTA VEHICULAR: Sin placas ni registros demo en producción.
-- Los vehículos se registran exclusivamente a través del onboarding verificado de conductores Gobee.
