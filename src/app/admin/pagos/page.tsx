import { createClient } from "@supabase/supabase-js"
import PagosClient from "./PagosClient"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPagosPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch todas las ordenes
  const { data: ordenes, error } = await supabaseAdmin
    .from("ordenes_pago")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch todos los usuarios para cruzar nombres/correos
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const users = authData?.users || []

  // Cruzar la información
  const ordenesConUsuarios = (ordenes || []).map(orden => {
    const user = users.find(u => u.id === orden.user_id)
    return {
      ...orden,
      user_email: user?.email || "Usuario desconocido",
      user_name: user?.user_metadata?.full_name || user?.user_metadata?.nombre || "Sin nombre"
    }
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Aprobación de Pagos</h1>
        <p className="text-slate-500 mt-2">Gestiona las transferencias bancarias y pagos de suscripciones del SaaS.</p>
      </div>

      <PagosClient initialOrdenes={ordenesConUsuarios} />
    </div>
  )
}
