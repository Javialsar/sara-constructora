"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { requireServerAuth } from "@/lib/auth/serverAuthGuard"

// Inicializar un cliente Supabase con el Service Role Key (Admin API)
// Esto es importante para crear usuarios sin cerrar la sesión actual del administrador
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createClientAccount(data: {
  userId: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
}) {
  try {
    const { user, isAdmin } = await requireServerAuth()
    if (!isAdmin && data.userId !== user.id) {
      throw new Error("Acceso denegado: No puede crear cuentas de cliente en nombre de otro usuario.")
    }
    const effectiveUserId = isAdmin ? (data.userId || user.id) : user.id

    // 1. Crear el usuario en Auth (Supabase)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        nombre: data.nombre,
        apellido: data.apellido
      }
    })

    if (authError) {
      // Traducir mensajes comunes de Supabase Auth
      let errorMessage = authError.message;
      if (errorMessage.includes("already been registered")) {
        errorMessage = "Este correo electrónico ya está registrado en el sistema.";
      } else if (errorMessage.includes("least 6 characters")) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      } else if (errorMessage.includes("Invalid email")) {
        errorMessage = "El formato del correo electrónico es inválido.";
      }
      
      throw new Error(errorMessage)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario.")
    }

    // 2. Crear el registro en la tabla 'clientes' pública
    const { error: dbError } = await supabaseAdmin.from('clientes').insert({
      id: authData.user.id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono,
      estado: 'activo',
      user_id: effectiveUserId
    })

    if (dbError) {
      // Si falla la tabla pública, idealmente deberíamos borrar el user de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Error BD: ${dbError.message}`)
    }

    // Refrescar la caché de la página de clientes
    revalidatePath('/dashboard/directorio/clientes')

    return { success: true }
  } catch (error: any) {
    console.error("Error al crear cuenta de cliente:", error)
    return { success: false, error: error.message }
  }
}
