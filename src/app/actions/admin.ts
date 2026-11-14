"use server"

import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { requireMasterAdmin } from '@/lib/auth/serverAuthGuard'

export async function toggleClienteEstado(id: string, estadoActual: string) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()
  const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo'

  const { error } = await supabase
    .from('clientes')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) {
    return { error: 'Error al actualizar el estado: ' + error.message }
  }

  return { success: true, nuevoEstado }
}

export async function updateCotizacionEstado(id: string, nuevoEstado: string) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase
    .from('cotizaciones')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) {
    return { error: 'Error al actualizar: ' + error.message }
  }

  return { success: true }
}

export async function updateTestimonioEstado(id: string, nuevoEstado: string) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase
    .from('testimonios')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) {
    return { error: 'Error al actualizar: ' + error.message }
  }

  return { success: true }
}

export async function deleteProyecto(id: string) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Error al eliminar: ' + error.message }
  }

  return { success: true }
}

export async function upsertProyecto(data: {
  id?: string
  nombre: string
  ubicacion: string
  estado: string
  avance: number
  cliente_id?: string
  fecha_inicio?: string
  descripcion?: string
  imagen_url?: string
  latitud?: number
  longitud?: number
}) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()

  if (data.id) {
    const { id, ...updateData } = data
    const { error } = await supabase
      .from('proyectos')
      .update(updateData)
      .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
  } else {
    const { id, ...insertData } = data
    const { error } = await supabase
      .from('proyectos')
      .insert([insertData])

    if (error) return { error: error.message }
    return { success: true }
  }
}

export async function deleteAvance(id: string) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase
    .from('avances')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function upsertAvance(data: {
  id?: string
  proyecto_id: string
  tipo: string
  titulo: string
  descripcion?: string
  url?: string
}) {
  try {
    await requireMasterAdmin()
  } catch (authErr: any) {
    return { error: authErr.message || 'Acceso denegado: Se requieren privilegios de Master Admin' }
  }

  const supabase = await createSupabaseAdminClient()

  if (data.id) {
    const { id, ...updateData } = data
    const { error } = await supabase
      .from('avances')
      .update(updateData)
      .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
  } else {
    const { id, ...insertData } = data
    const { error } = await supabase
      .from('avances')
      .insert([insertData])

    if (error) return { error: error.message }
    return { success: true }
  }
}
