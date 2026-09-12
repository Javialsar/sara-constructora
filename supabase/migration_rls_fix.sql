-- =============================================
-- SARA CONSTRUCTORA - Corrección de Políticas RLS
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Agregar columna auth_id a clientes para vincular con Supabase Auth
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- =============================================
-- ELIMINAR POLÍTICAS EXISTENTES (PERMISIVAS)
-- =============================================

DROP POLICY IF EXISTS "Permitir registro de clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir solicitudes de servicio" ON solicitudes_servicio;
DROP POLICY IF EXISTS "Permitir cotizaciones" ON cotizaciones;
DROP POLICY IF EXISTS "Clientes ven sus datos" ON clientes;
DROP POLICY IF EXISTS "Clientes ven sus proyectos" ON proyectos;
DROP POLICY IF EXISTS "Clientes ven avances de sus proyectos" ON avances;

-- =============================================
-- NUEVAS POLÍTICAS SEGURAS
-- =============================================

-- CLIENTES: Solo pueden ver sus propios datos
CREATE POLICY "clientes_select_own" ON clientes
  FOR SELECT USING (auth.uid() = auth_id);

-- CLIENTES: Permitir inserción pública (registro)
CREATE POLICY "clientes_insert_public" ON clientes
  FOR INSERT WITH CHECK (true);

-- PROYECTOS: Clientes solo ven sus propios proyectos
CREATE POLICY "proyectos_select_own" ON proyectos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = proyectos.cliente_id
      AND clientes.auth_id = auth.uid()
    )
  );

-- PROYECTOS: Lectura pública para la página de proyectos (todos pueden ver proyectos)
CREATE POLICY "proyectos_select_public" ON proyectos
  FOR SELECT USING (true);

-- AVANCES: Clientes solo ven avances de sus proyectos
CREATE POLICY "avances_select_own" ON avances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proyectos
      JOIN clientes ON clientes.id = proyectos.cliente_id
      WHERE proyectos.id = avances.proyecto_id
      AND clientes.auth_id = auth.uid()
    )
  );

-- SOLICITUDES DE SERVICIO: Inserción pública
CREATE POLICY "solicitudes_insert_public" ON solicitudes_servicio
  FOR INSERT WITH CHECK (true);

-- COTIZACIONES: Inserción pública
CREATE POLICY "cotizaciones_insert_public" ON cotizaciones
  FOR INSERT WITH CHECK (true);

-- TESTIMONIOS: Lectura pública de testimonios aprobados
CREATE POLICY "testimonios_select_aprobados" ON testimonios
  FOR SELECT USING (estado = 'aprobado');

-- TESTIMONIOS: Clientes autenticados pueden insertar testimonios
CREATE POLICY "testimonios_insert_auth" ON testimonios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = testimonios.cliente_id
      AND clientes.auth_id = auth.uid()
    )
  );

-- =============================================
-- NOTA: Las operaciones administrativas (UPDATE, DELETE)
-- se ejecutan con la Service Role Key desde Server Actions,
-- lo cual bypasea RLS automáticamente.
-- =============================================
