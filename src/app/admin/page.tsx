"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Building2, 
  Users, 
  FileCheck, 
  Star,
  ArrowUpRight
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    proyectosActivos: 0,
    clientesRegistrados: 0,
    cotizacionesPendientes: 0,
    testimoniosPendientes: 0,
  })
  const [projectStatusData, setProjectStatusData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)

    // 1. Proyectos activos (en_diseno + en_construccion)
    const { data: proyectos } = await supabase.from("proyectos").select("id, estado")
    const totalProyectos = proyectos?.filter(p => p.estado === 'en_diseno' || p.estado === 'en_construccion').length || 0
    const enDiseno = proyectos?.filter(p => p.estado === 'en_diseno').length || 0
    const enConstruccion = proyectos?.filter(p => p.estado === 'en_construccion').length || 0
    const finalizados = proyectos?.filter(p => p.estado === 'finalizado').length || 0

    // 2. Clientes registrados
    const { count: totalClientes } = await supabase.from("clientes").select("id", { count: 'exact', head: true })

    // 3. Cotizaciones pendientes
    const { count: cotPendientes } = await supabase.from("cotizaciones").select("id", { count: 'exact', head: true }).eq("estado", "pendiente")

    // 4. Testimonios pendientes
    const { count: testPendientes } = await supabase.from("testimonios").select("id", { count: 'exact', head: true }).eq("estado", "pendiente")

    setStats({
      proyectosActivos: totalProyectos,
      clientesRegistrados: totalClientes || 0,
      cotizacionesPendientes: cotPendientes || 0,
      testimoniosPendientes: testPendientes || 0,
    })

    setProjectStatusData([
      { name: 'En Diseño', value: enDiseno, color: '#83A881' },
      { name: 'En Construcción', value: enConstruccion, color: '#1F422F' },
      { name: 'Finalizados', value: finalizados, color: '#0D0D0D' },
    ])

    // 5. Actividad reciente: combinar las últimas cotizaciones, testimonios y clientes
    const activities: any[] = []

    const { data: recentCotizaciones } = await supabase
      .from("cotizaciones")
      .select("id, nombre, tipo_proyecto, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(3)

    recentCotizaciones?.forEach(c => {
      activities.push({
        id: `cot-${c.id}`,
        nombre: c.nombre,
        accion: `Solicitó cotización de "${c.tipo_proyecto}"`,
        fecha: c.created_at,
        estado: c.estado,
      })
    })

    const { data: recentTestimonios } = await supabase
      .from("testimonios")
      .select("id, estado, created_at, clientes(nombre, apellido)")
      .order("created_at", { ascending: false })
      .limit(3)

    recentTestimonios?.forEach(t => {
      const clienteNombre = t.clientes ? `${(t.clientes as any).nombre} ${(t.clientes as any).apellido}` : 'Cliente'
      activities.push({
        id: `test-${t.id}`,
        nombre: clienteNombre,
        accion: 'Dejó un testimonio',
        fecha: t.created_at,
        estado: t.estado,
      })
    })

    const { data: recentClientes } = await supabase
      .from("clientes")
      .select("id, nombre, apellido, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(3)

    recentClientes?.forEach(c => {
      activities.push({
        id: `cli-${c.id}`,
        nombre: `${c.nombre} ${c.apellido}`,
        accion: 'Se registró en el portal de clientes',
        fecha: c.created_at,
        estado: c.estado,
      })
    })

    // Ordenar por fecha más reciente
    activities.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    setRecentActivity(activities.slice(0, 6))

    setLoading(false)
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'aprobado': case 'aprobada': case 'activo': return 'bg-green-100 text-green-800'
      case 'rechazado': case 'rechazada': case 'inactivo': return 'bg-red-100 text-red-800'
      case 'cotizada': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const timeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Hace unos segundos'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
    if (diff < 172800) return 'Ayer'
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Proyectos Activos</p>
              <h3 className="text-3xl font-bold text-brand-black">{stats.proyectosActivos}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-sage/20 flex items-center justify-center text-brand-dark">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} />
            <span>En diseño o construcción</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Clientes Registrados</p>
              <h3 className="text-3xl font-bold text-brand-black">{stats.clientesRegistrados}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-dark/10 flex items-center justify-center text-brand-dark">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} />
            <span>Total registrados</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Cotizaciones Pendientes</p>
              <h3 className="text-3xl font-bold text-brand-black">{stats.cotizacionesPendientes}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <FileCheck size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-orange-600 font-medium">
            <span>{stats.cotizacionesPendientes > 0 ? 'Requieren atención' : 'Todo al día'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Testimonios Nuevos</p>
              <h3 className="text-3xl font-bold text-brand-black">{stats.testimoniosPendientes}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Star size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-gray-500 font-medium">
            <span>{stats.testimoniosPendientes > 0 ? 'Pendientes de aprobar' : 'Sin pendientes'}</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart - Estado de Proyectos */}
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Estado de Proyectos</h3>
          <div className="h-72 flex flex-col items-center">
            {projectStatusData.every(d => d.value === 0) ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No hay proyectos registrados aún.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Custom Legend */}
            <div className="flex flex-col gap-2 w-full mt-2">
              {projectStatusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Actividad Reciente</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
              <thead className="bg-slate-100 text-slate-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Usuario / Cliente</th>
                  <th className="px-6 py-4 font-medium">Acción</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No hay actividad reciente registrada.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{a.nombre}</td>
                      <td className="px-6 py-4">{a.accion}</td>
                      <td className="px-6 py-4">{timeAgo(a.fecha)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(a.estado)}`}>
                          {a.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}
