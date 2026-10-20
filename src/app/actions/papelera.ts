"use server"

import { createClient } from "@supabase/supabase-js"
import { requireMasterAdmin } from "@/lib/auth/serverAuthGuard"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function fetchPapelera(tabla: string) {
  await requireMasterAdmin()
  // Solo tablas permitidas
  const allowed = ["clientes", "proveedores", "trabajadores", "proyectos", "presupuestos_reales"]
  if (!allowed.includes(tabla)) return []

  const { data, error } = await supabaseAdmin
    .from(tabla)
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) {
    console.error("Error fetching papelera:", error)
    return []
  }
  return data || []
}

export async function restaurarRegistro(tabla: string, id: string) {
  await requireMasterAdmin()
  const allowed = ["clientes", "proveedores", "trabajadores", "proyectos", "presupuestos_reales"]
  if (!allowed.includes(tabla)) return { success: false }

  const { error } = await supabaseAdmin
    .from(tabla)
    .update({ deleted_at: null })
    .eq('id', id)

  return { success: !error }
}

export async function destruirRegistro(tabla: string, id: string) {
  const allowed = ["clientes", "proveedores", "trabajadores", "proyectos", "presupuestos_reales"]
  if (!allowed.includes(tabla)) return { success: false }

  // Since we have a BEFORE DELETE trigger returning NULL, calling .delete() from SupabaseAdmin will ALSO be intercepted!
  // To truly delete it, we have to use an RPC or disable the trigger temporarily.
  // We'll write an RPC function `force_delete` or just not allow hard deletes yet.
  return { success: false, error: "Hard delete requires RPC" }
}
