"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { SaraModule } from "@/lib/auth/moduleGuards"

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

export async function getAuthUsersAction() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    })
    if (error) throw error

    return {
      success: true,
      users: data.users.map(u => {
        const meta = u.user_metadata || {}
        return {
          id: u.id,
          email: u.email || '',
          created_at: u.created_at,
          modulo_origen: (meta.modulo_origen as SaraModule) || null,
          modulos_autorizados: (meta.modulos_autorizados as SaraModule[]) || (meta.modulo_origen ? [meta.modulo_origen as SaraModule] : []),
          role: meta.role || (meta.es_admin ? 'admin' : 'cliente'),
          full_name: meta.full_name || `${meta.nombre || ''} ${meta.apellido || ''}`.trim() || 'Usuario Registrado',
          phone: meta.phone || meta.telefono || ''
        }
      })
    }
  } catch (error: any) {
    console.error("Error al obtener usuarios de auth:", error)
    return { success: false, error: error.message, users: [] }
  }
}

export async function updateUserModulesAction(userId: string, modulos: SaraModule[]) {
  try {
    const { data: user, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (fetchErr) throw fetchErr

    const currentMeta = user.user.user_metadata || {}
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentMeta,
        modulos_autorizados: modulos
      }
    })
    if (error) throw error
    revalidatePath('/admin/accesos')
    return { success: true }
  } catch (error: any) {
    console.error("Error al actualizar módulos autorizados:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserStatusAction(
  id: string, 
  table: 'clientes' | 'trabajadores', 
  nuevoEstado: 'activo' | 'inactivo' | 'bloqueado'
) {
  try {
    if (table === 'clientes') {
      const { error } = await supabaseAdmin
        .from('clientes')
        .update({ estado: nuevoEstado })
        .eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabaseAdmin
        .from('trabajadores')
        .update({ estado: nuevoEstado === 'activo' })
        .eq('id', id)
      if (error) throw error
    }

    revalidatePath('/admin/accesos')
    return { success: true }
  } catch (error: any) {
    console.error("Error al actualizar estado:", error)
    return { success: false, error: error.message || "Error al actualizar estado" }
  }
}

export async function deleteUserAction(id: string, table: 'clientes' | 'trabajadores') {
  try {
    if (table === 'clientes') {
      // 1. Borrar de clientes
      const { error: dbError } = await supabaseAdmin.from('clientes').delete().eq('id', id)
      if (dbError) throw dbError

      // 2. Intentar borrar de auth si existe
      try {
        await supabaseAdmin.auth.admin.deleteUser(id)
      } catch (authErr) {
        console.warn("No se pudo borrar de auth (puede que solo exista en tabla clientes):", authErr)
      }
    } else {
      const { error } = await supabaseAdmin.from('trabajadores').delete().eq('id', id)
      if (error) throw error
    }

    revalidatePath('/admin/accesos')
    return { success: true }
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error)
    return { success: false, error: error.message || "Error al eliminar usuario" }
  }
}

export async function changeUserPasswordAction(userId: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." }
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error al cambiar contraseña:", error)
    return { success: false, error: error.message || "Error al actualizar la contraseña en Supabase Auth" }
  }
}

export async function createUserAccessAction(data: {
  nombre: string
  apellido: string
  email: string
  telefono: string
  cedula?: string
  password: string
  rol: 'Administrador' | 'Técnico' | 'Cliente'
  modulo_origen?: SaraModule
}) {
  try {
    if (!data.nombre || !data.email || !data.password || !data.rol) {
      return { success: false, error: "Todos los campos principales son obligatorios." }
    }

    if (data.password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." }
    }

    const modOrigen = data.modulo_origen || (data.rol === 'Administrador' || data.rol === 'Técnico' ? undefined : 'sara_apu')

    // 1. Crear el usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        nombre: data.nombre,
        apellido: data.apellido || '',
        full_name: `${data.nombre} ${data.apellido || ''}`.trim(),
        role: data.rol === 'Administrador' ? 'admin' : (data.rol === 'Técnico' ? 'tecnico' : 'cliente'),
        ...(modOrigen ? {
          modulo_origen: modOrigen,
          modulos_autorizados: [modOrigen]
        } : {})
      }
    })

    if (authError) {
      let msg = authError.message
      if (msg.includes("already been registered")) {
        msg = "Este correo electrónico ya está registrado en el sistema."
      }
      throw new Error(msg)
    }

    const newUserId = authData?.user?.id

    // 2. Si es Cliente o Administrador, insertar en tabla clientes
    if (data.rol === 'Administrador' || data.rol === 'Cliente') {
      const { error: dbError } = await supabaseAdmin.from('clientes').insert({
        id: newUserId,
        nombre: data.nombre,
        apellido: data.apellido || '',
        email: data.email,
        telefono: data.telefono || '',
        estado: 'activo',
        es_admin: data.rol === 'Administrador'
      })

      if (dbError) {
        if (newUserId) await supabaseAdmin.auth.admin.deleteUser(newUserId)
        throw dbError
      }
    } else if (data.rol === 'Técnico') {
      // Si es Técnico, insertar en trabajadores
      const { error: trabError } = await supabaseAdmin.from('trabajadores').insert({
        nombre_completo: `${data.nombre} ${data.apellido || ''}`.trim(),
        cedula: data.cedula || '',
        telefono: data.telefono || '',
        categoria_ocupacional: 'Técnico de Obra',
        estado: true
      })

      if (trabError) {
        console.error("Error al insertar en trabajadores:", trabError)
      }
    }

    revalidatePath('/admin/accesos')
    return { success: true }
  } catch (error: any) {
    console.error("Error al crear usuario de acceso:", error)
    return { success: false, error: error.message || "Error al crear usuario" }
  }
}
