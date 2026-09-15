"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

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
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
}) {
  try {
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
      throw new Error(`Error Auth: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario en Auth.")
    }

    // 2. Crear el registro en la tabla 'clientes' pública
    const { error: dbError } = await supabaseAdmin.from('clientes').insert({
      id: authData.user.id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono,
      usuario: data.email.split('@')[0], // usuario autogenerado
      estado: 'activo'
    })

    if (dbError) {
      // Si falla la tabla pública, idealmente deberíamos borrar el user de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Error BD: ${dbError.message}`)
    }

    // Refrescar la caché de la página de clientes
    revalidatePath('/admin/clientes')

    return { success: true }
  } catch (error: any) {
    console.error("Error al crear cuenta de cliente:", error)
    return { success: false, error: error.message }
  }
}
