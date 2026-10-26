import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Configuración incompleta: NEXT_PUBLIC_SUPABASE_URL es requerida.')
  }

  if (!supabaseServiceKey) {
    throw new Error('Violación Zero-Trust: SUPABASE_SERVICE_ROLE_KEY no está configurada. Operación administrativa denegada para prevenir escalamiento.')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

