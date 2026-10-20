import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface VerifiedServerAuth {
  user: User
  isAdmin: boolean
  role: string
}

/**
 * Obtiene el usuario autenticado de la sesión activa en el servidor verificando el JWT contra Supabase Auth.
 */
export async function getVerifiedServerUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  return user
}

/**
 * Exige una sesión activa en el servidor. Lanza error si no está autenticado.
 * Prioriza `app_metadata` sobre `user_metadata` para prevenir escalamiento de privilegios.
 */
export async function requireServerAuth(): Promise<VerifiedServerAuth> {
  const user = await getVerifiedServerUser()
  if (!user) {
    throw new Error('No autenticado: Se requiere una sesión activa válida')
  }

  const role = String(user.app_metadata?.role || user.user_metadata?.role || 'cliente')
  const isAdmin = Boolean(
    user.app_metadata?.es_admin ||
    user.user_metadata?.es_admin ||
    role === 'admin' ||
    role === 'superadmin'
  )

  return { user, isAdmin, role }
}

/**
 * Exige privilegios de Master Admin en el servidor.
 */
export async function requireMasterAdmin(): Promise<VerifiedServerAuth> {
  const auth = await requireServerAuth()
  if (!auth.isAdmin) {
    throw new Error('Acceso denegado: Se requieren privilegios de Master Admin')
  }
  return auth
}
