import { createClient } from "@supabase/supabase-js"
import { Shield, Clock, Database, Trash, Edit, PlusCircle, LayoutDashboard, User } from "lucide-react"

// Force dynamic to always fetch the latest logs
export const dynamic = 'force-dynamic'

export default async function AuditoriaPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Fetch logs
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch users for mapping
  const { data: usersData } = await supabase.auth.admin.listUsers()
  const userMap = new Map()
  if (usersData?.users) {
    usersData.users.forEach(u => {
      userMap.set(u.id, {
        email: u.email,
        nombre: u.user_metadata?.nombre || '',
        apellido: u.user_metadata?.apellido || ''
      })
    })
  }

  const getActionIcon = (accion: string) => {
    switch (accion) {
      case 'CREAR': return <PlusCircle size={16} className="text-emerald-500" />
      case 'EDITAR': return <Edit size={16} className="text-amber-500" />
      case 'ELIMINAR': return <Trash size={16} className="text-red-500" />
      default: return <Database size={16} className="text-slate-500" />
    }
  }

  const getActionColor = (accion: string) => {
    switch (accion) {
      case 'CREAR': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'EDITAR': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'ELIMINAR': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Shield className="text-brand-sage" size={32} />
          Auditoría del Sistema (Ojo de Dios)
        </h1>
        <p className="text-slate-500 mt-2">
          Registro inmutable de todas las acciones y modificaciones en el ecosistema SARA.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Módulo / Entidad</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4 w-1/3">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs?.map((log) => {
                const user = userMap.get(log.user_id) || { email: 'Sistema', nombre: 'Acción', apellido: 'Automática' }
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(log.created_at).toLocaleString('es-ES', { 
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {user.nombre.charAt(0)}{user.apellido.charAt(0) || <User size={14} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{user.nombre} {user.apellido}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-700">{log.modulo}</div>
                      <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md mt-1 font-mono">
                        {log.entidad}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionColor(log.accion)}`}>
                        {getActionIcon(log.accion)}
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-h-24 overflow-y-auto bg-slate-900 text-slate-300 p-3 rounded-xl text-xs font-mono">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.detalles, null, 2)}</pre>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Shield className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium">No hay registros de auditoría</p>
                    <p className="text-sm mt-1">Las acciones futuras aparecerán aquí.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
