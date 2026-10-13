-- ==========================================================
-- SARA CONSTRUCTORA: OPTIMIZACIONES DE INFRAESTRUCTURA Y SEGURIDAD
-- Módulo Constructora (Proyectos, Avances y Cotizaciones)
-- ==========================================================

-- 1. Índices para acelerar consultas frecuentes en Landing & Backoffice
CREATE INDEX IF NOT EXISTS idx_proyectos_destacado_created 
  ON proyectos(destacado, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proyectos_estado 
  ON proyectos(estado);

CREATE INDEX IF NOT EXISTS idx_proyectos_cliente_id 
  ON proyectos(cliente_id);

CREATE INDEX IF NOT EXISTS idx_avances_proyecto_fecha 
  ON avances(proyecto_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at 
  ON cotizaciones(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado 
  ON cotizaciones(estado);

-- 2. Vista segura pública para el escaparate de obras civiles
-- Protege campos internos (datos_financieros, presupuestos, notas privadas)
CREATE OR REPLACE VIEW v_proyectos_publicos AS 
SELECT 
  id, 
  nombre, 
  ubicacion, 
  estado, 
  imagen_url, 
  latitud, 
  longitud, 
  descripcion, 
  avance, 
  created_at
FROM proyectos;

GRANT SELECT ON v_proyectos_publicos TO anon, authenticated;

-- Comentario informativo para administradores
COMMENT ON VIEW v_proyectos_publicos IS 
'Vista pública segura para escaparates y mapas sin exposición de datos financieros internos ni clientes asociados.';
