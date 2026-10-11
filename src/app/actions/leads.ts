"use server"

import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function submitSolicitudInmobiliaria(formData: FormData) {
  const texto = formData.get('texto') as string
  const inmueble_id = formData.get('inmueble_id') as string

  if (!texto || !inmueble_id) {
    return { error: 'El texto de la pregunta y el ID del inmueble son obligatorios.' }
  }

  const supabase = await createSupabaseAdminClient()

  // Guardar en la tabla oficial de Supabase 'solicitudes_servicio'
  const { error } = await supabase.from('solicitudes_servicio').insert([{
    nombre: 'Usuario Interesado',
    email: 'contacto@inmobiliaria.sara',
    telefono: '0990000000',
    tipo_servicio: 'inmobiliaria',
    mensaje: `[Inmueble ID: ${inmueble_id}] ${texto}`,
    estado: 'nueva'
  }])

  // Sincronizar también con parametros_globales.indirectos_default.solicitudes_inmobiliaria
  try {
    const { data: pg } = await supabase.from('parametros_globales').select('id, indirectos_default').limit(1).single()
    if (pg?.id) {
      const indirectos = pg.indirectos_default || {}
      const lista = Array.isArray(indirectos.solicitudes_inmobiliaria) ? indirectos.solicitudes_inmobiliaria : []
      const nueva = {
        id: `sol-${Date.now()}`,
        inmuebleId: inmueble_id,
        inmuebleTitulo: `Propiedad #${inmueble_id}`,
        tipo: 'consulta',
        interesado: {
          nombre: 'Usuario Interesado',
          telefono: '0990000000',
          email: 'contacto@inmobiliaria.sara'
        },
        mensaje: texto,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString()
      }
      await supabase.from('parametros_globales').update({
        indirectos_default: { ...indirectos, solicitudes_inmobiliaria: [nueva, ...lista] },
        updated_at: new Date().toISOString()
      }).eq('id', pg.id)
    }
  } catch (syncErr) {
    console.warn("Sync inmobiliaria warning:", syncErr)
  }

  if (error) {
    console.error("Error al enviar solicitud inmobiliaria:", error)
    return { error: 'Error al enviar la solicitud.' }
  }

  return { success: true }
}
