-- ==========================================
-- SARA CONSTRUCTORA - MIGRACIÓN A SAAS (MULTI-TENANT)
-- ==========================================

-- 1. Añadir columnas de propiedad a Insumos
ALTER TABLE insumos 
  ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- 2. Añadir columnas de propiedad a Rubros
ALTER TABLE rubros 
  ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- 3. Añadir propiedad a Recetas (Rubro Insumos)
ALTER TABLE rubro_insumos 
  ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Añadir propiedad a Presupuestos Rubros (Para los presupuestos de los usuarios)
ALTER TABLE presupuesto_rubros
  ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Convertir toda la data actual en DATA GLOBAL (El catálogo maestro)
UPDATE insumos SET is_global = true WHERE user_id IS NULL OR user_id = auth.uid();
UPDATE rubros SET is_global = true WHERE user_id IS NULL OR user_id = auth.uid();

-- Como los globales no deberían tener user_id para no causar conflictos al inicio
UPDATE insumos SET user_id = NULL WHERE is_global = true;
UPDATE rubros SET user_id = NULL WHERE is_global = true;

-- 6. Eliminar las políticas RLS antiguas y las nuevas por si se ejecuta varias veces (Idempotencia)
DROP POLICY IF EXISTS "Acceso total insumos" ON insumos;
DROP POLICY IF EXISTS "Acceso total rubros" ON rubros;
DROP POLICY IF EXISTS "Acceso total rubro_insumos" ON rubro_insumos;
DROP POLICY IF EXISTS "Acceso total presupuesto_rubros" ON presupuesto_rubros;

-- Borramos las políticas nuevas antes de crearlas por si acaso el script ya corrió a medias
DROP POLICY IF EXISTS "Lectura de insumos" ON insumos;
DROP POLICY IF EXISTS "Insertar insumos" ON insumos;
DROP POLICY IF EXISTS "Modificar insumos" ON insumos;
DROP POLICY IF EXISTS "Borrar insumos" ON insumos;

DROP POLICY IF EXISTS "Lectura de rubros" ON rubros;
DROP POLICY IF EXISTS "Insertar rubros" ON rubros;
DROP POLICY IF EXISTS "Modificar rubros" ON rubros;
DROP POLICY IF EXISTS "Borrar rubros" ON rubros;

DROP POLICY IF EXISTS "Lectura de recetas" ON rubro_insumos;
DROP POLICY IF EXISTS "Modificar recetas" ON rubro_insumos;

DROP POLICY IF EXISTS "Acceso a mis presupuestos_rubros" ON presupuesto_rubros;

-- 7. Crear Nuevas Políticas RLS para INSUMOS
CREATE POLICY "Lectura de insumos" ON insumos 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR is_global = true);

CREATE POLICY "Insertar insumos" ON insumos 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND is_global = false);

CREATE POLICY "Modificar insumos" ON insumos 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() AND is_global = false);

CREATE POLICY "Borrar insumos" ON insumos 
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid() AND is_global = false);

-- 8. Crear Nuevas Políticas RLS para RUBROS
CREATE POLICY "Lectura de rubros" ON rubros 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR is_global = true);

CREATE POLICY "Insertar rubros" ON rubros 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND is_global = false);

CREATE POLICY "Modificar rubros" ON rubros 
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid() AND is_global = false);

CREATE POLICY "Borrar rubros" ON rubros 
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid() AND is_global = false);

-- 9. Crear Nuevas Políticas RLS para RUBRO_INSUMOS (Recetas)
CREATE POLICY "Lectura de recetas" ON rubro_insumos 
  FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() OR 
    rubro_id IN (SELECT id FROM rubros WHERE is_global = true)
  );

CREATE POLICY "Modificar recetas" ON rubro_insumos 
  FOR ALL TO authenticated 
  USING (user_id = auth.uid());

-- 10. Políticas para Presupuesto_Rubros
CREATE POLICY "Acceso a mis presupuestos_rubros" ON presupuesto_rubros
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Recargar esquema
NOTIFY pgrst, 'reload schema';
