"use server"

import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function submitCotizacion(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const telefono = formData.get('telefono') as string
  const tipo_proyecto = formData.get('tipo_proyecto') as string
  const descripcion = formData.get('descripcion') as string

  if (!nombre || !email || !telefono || !tipo_proyecto) {
    return { error: 'Todos los campos marcados son obligatorios.' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase.from('cotizaciones').insert([{
    nombre,
    email,
    telefono,
    tipo_proyecto,
    descripcion,
    estado: 'pendiente',
  }])

  if (error) {
    return { error: 'Error al enviar la solicitud.' }
  }

  return { success: true }
}

export async function submitSolicitudServicio(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const telefono = formData.get('telefono') as string
  const tipo_servicio = formData.get('tipo_servicio') as string
  const mensaje = formData.get('mensaje') as string

  if (!nombre || !email || !telefono || !tipo_servicio) {
    return { error: 'Todos los campos marcados son obligatorios.' }
  }

  const supabase = await createSupabaseAdminClient()

  const { error } = await supabase.from('solicitudes_servicio').insert([{
    nombre,
    email,
    telefono,
    tipo_servicio,
    mensaje,
    estado: 'nueva',
  }])

  if (error) {
    return { error: 'Error al enviar la solicitud.' }
  }

  return { success: true }
}
