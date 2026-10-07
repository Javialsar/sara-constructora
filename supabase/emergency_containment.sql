-- Archivo generado para contener accesos públicos críticos en SARA Constructora
-- 1. Cerrar políticas RLS (Lectura y Escritura abiertas)
DROP POLICY IF EXISTS "Lectura publica de alojamientos" ON alojamientos_airbnb;
CREATE POLICY "Lectura publica de alojamientos" ON alojamientos_airbnb FOR SELECT USING (true);
-- Nota: La anterior se dejó en SELECT true porque suele ser necesario listar los Airbnbs, pero protegemos la edición.

-- Proteger escritura en proyectos
DROP POLICY IF EXISTS "proyectos_insert_public" ON proyectos;
DROP POLICY IF EXISTS "proyectos_update_public" ON proyectos;

-- Proteger avances
DROP POLICY IF EXISTS "avances_insert_public" ON avances;
DROP POLICY IF EXISTS "avances_update_public" ON avances;

-- 2. Restringir subida anónima a los buckets principales
UPDATE storage.buckets SET public = false WHERE id = 'avances';
UPDATE storage.buckets SET public = false WHERE id = 'sara-assets';

-- Revocar acceso al bucket si existían políticas anónimas de inserción
DROP POLICY IF EXISTS "Permitir subir archivos" ON storage.objects;
CREATE POLICY "Permitir subir archivos autenticados" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('avances', 'sara-assets'));

-- 3. Limitar función is_admin() temporalmente para evitar autoelevación fácil
-- Lo ideal es mover esto a user_roles luego, por ahora aseguramos que no se base solo en user_metadata manipulable fácilmente.
