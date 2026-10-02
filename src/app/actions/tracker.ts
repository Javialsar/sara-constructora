"use server"

import { headers } from "next/headers"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function pingSession() {
  try {
    const supabaseUser = await createClient()
    const { data: authData } = await supabaseUser.auth.getUser()
    
    // Only track authenticated users
    if (!authData.user) return { success: false }

    const hdrs = await headers()
    const ip = hdrs.get('x-forwarded-for')?.split(',')[0] || hdrs.get('x-real-ip') || 'Desconocida'
    const country = hdrs.get('x-vercel-ip-country') || 'Desconocido'
    const city = hdrs.get('x-vercel-ip-city') || 'Desconocido'
    const ua = hdrs.get('user-agent') || 'Desconocido'
    
    let navegador = 'Desconocido'
    let dispositivo = 'Escritorio'
    
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) dispositivo = 'Móvil'
    else if (ua.includes('Tablet') || ua.includes('iPad')) dispositivo = 'Tablet'

    if (ua.includes('Chrome')) navegador = 'Chrome'
    else if (ua.includes('Firefox')) navegador = 'Firefox'
    else if (ua.includes('Safari')) navegador = 'Safari'
    else if (ua.includes('Edge')) navegador = 'Edge'

    const supabaseAdmin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if an active session exists for this user in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: existingSession } = await supabaseAdmin
      .from('registro_sesiones')
      .select('id')
      .eq('user_id', authData.user.id)
      .eq('ip_address', ip)
      .gte('ultima_actividad', oneHourAgo)
      .order('ultima_actividad', { ascending: false })
      .limit(1)
      .single()

    if (existingSession) {
      // Update last activity
      await supabaseAdmin.from('registro_sesiones').update({
        ultima_actividad: new Date().toISOString()
      }).eq('id', existingSession.id)
    } else {
      // Create new session
      await supabaseAdmin.from('registro_sesiones').insert({
        user_id: authData.user.id,
        email: authData.user.email,
        ip_address: ip,
        pais: country,
        ciudad: city,
        dispositivo,
        navegador,
        inicio_sesion: new Date().toISOString(),
        ultima_actividad: new Date().toISOString()
      })
    }
    return { success: true }
  } catch (err) {
    console.error("Session Tracker Error:", err)
    return { success: false }
  }
}
