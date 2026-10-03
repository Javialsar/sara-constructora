"use server"

import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function submitSolicitudInmobiliaria(formData: FormData) {
  const texto = formData.get('texto') as string
  const inmueble_id = formData.get('inmueble_id') as string

  if (!texto || !inmueble_id) {
    return { error: 'El texto de la pregunta y el ID del inmueble son obligatorios.' }
  }

  const supabase = await createSupabaseAdminClient()

  // Intentamos insertarlo asumiendo la tabla 'solicitudes_inmobiliarias'
  const { error } = await supabase.from('solicitudes_inmobiliarias').insert([{
    inmueble_id,
    texto,
    estado: 'nueva',
    autor: 'Usuario Interesado',
  }])

  if (error) {
    console.error("Error al enviar solicitud inmobiliaria:", error)
    return { error: 'Error al enviar la solicitud.' }
  }

  return { success: true }
}
