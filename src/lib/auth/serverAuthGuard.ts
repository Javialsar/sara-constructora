import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { User } from '@supabase/supabase-js'

export interface VerifiedServerAuth {
  user: User
  isAdmin: boolean
  role: string
}

/**
 * Obtiene el usuario autenticado de la sesión activa en el servidor verificando el JWT contra Supabase Auth.
 * Admite tanto sesión por cookies como Bearer token vía header de autorización.
 */
export async function getVerifiedServerUser(request?: Request): Promise<User | null> {
  // 1. Prioridad API Routes con header Authorization: Bearer <token>
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.substring(7).trim()
      if (!token || token === 'null' || token === 'undefined') {
        return null
      }
      try {
        const adminClient = createAdminClient()
        const { data: tokenUser, error: tokenError } = await adminClient.auth.getUser(token)
        if (tokenUser?.user && !tokenError) {
          return tokenUser.user
        }
      } catch {
        return null
      }
      return null
    }
  }

  // 2. Sesión por cookies en Server Components / Server Actions
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user && !error) {
      return user
    }
  } catch {
    // Si se ejecuta fuera del request scope (ej: test runners o scripts aislados) o no hay cookies
  }

  return null
}

/**
 * Exige una sesión activa en el servidor. Lanza error si no está autenticado.
 * SEGURIDAD ZERO-TRUST: Los roles y privilegios provienen EXCLUSIVAMENTE de `app_metadata`.
 * `user_metadata` es editable por el cliente y NUNCA se utiliza para evaluar privilegios administrativos.
 */
export async function requireServerAuth(request?: Request): Promise<VerifiedServerAuth> {
  const user = await getVerifiedServerUser(request)
  if (!user) {
    throw new Error('No autenticado: Se requiere una sesión activa válida')
  }

  // Estricto Zero-Trust: Solo app_metadata (establecido por el servidor) otorga roles y permisos
  const role = String(user.app_metadata?.role || 'cliente')
  const isAdmin = Boolean(
    user.app_metadata?.es_admin === true ||
    user.app_metadata?.sara_master === true ||
    role === 'admin' ||
    role === 'superadmin'
  )

  return { user, isAdmin, role }
}

/**
 * Exige privilegios de Master Admin en el servidor.
 */
export async function requireMasterAdmin(request?: Request): Promise<VerifiedServerAuth> {
  const auth = await requireServerAuth(request)
  if (!auth.isAdmin) {
    throw new Error('Acceso denegado: Se requieren privilegios de Master Admin')
  }
  return auth
}
