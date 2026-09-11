"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Building2, Users, FileCheck, Star, ArrowUpRight, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    proyectosActivos: 0,
    clientesRegistrados: 0,
    cotizacionesPendientes: 0,
    testimoniosNuevos: 0
  })

  const [projectStatusData, setProjectStatusData] = useState([
    { name: 'En Diseño', value: 0, color: '#83A881' },
    { name: 'En Construcción', value: 0, color: '#1F422F' },
    { name: 'Finalizados', value: 0, color: '#0D0D0D' },
  ])

  const [actividad, setActividad] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Para el gráfico de barras dejaremos datos fijos o semi-fijos por simplicidad,
  // ya que requeriría cruzar fechas, pero lo ideal es mapearlo si se desea.
  const monthlyData = [
    { name: 'Ene', proyectos: 2, clientes: 4 },
    { name: 'Feb', proyectos: 3, clientes: 3 },
    { name: 'Mar', proyectos: 1, clientes: 5 },
    { name: 'Abr', proyectos: 4, clientes: 8 },
    { name: 'May', proyectos: 2, clientes: 6 },
    { name: 'Jun', proyectos: 5, clientes: 10 },
  ]

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Proyectos (Activos y breakdown)
      const { data: proyectos } = await supabase.from('proyectos').select('estado, created_at')
      let enDiseno = 0, enConstruccion = 0, finalizados = 0;
      if (proyectos) {
        proyectos.forEach(p => {
          if (p.estado === 'en_diseno') enDiseno++;
          else if (p.estado === 'en_construccion') enConstruccion++;
          else if (p.estado === 'finalizado') finalizados++;
        })
      }

      // 2. Clientes
      const { count: clientesCount } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
      
      // 3. Cotizaciones Pendientes
      const { count: cotiCount } = await supabase.from('cotizaciones').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')
      
      // 4. Testimonios Pendientes
      const { count: testCount } = await supabase.from('testimonios').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente')

      setStats({
        proyectosActivos: enDiseno + enConstruccion,
        clientesRegistrados: clientesCount || 0,
        cotizacionesPendientes: cotiCount || 0,
        testimoniosNuevos: testCount || 0
      })

      setProjectStatusData([
        { name: 'En Diseño', value: enDiseno, color: '#83A881' },
        { name: 'En Construcción', value: enConstruccion, color: '#1F422F' },
        { name: 'Finalizados', value: finalizados, color: '#0D0D0D' },
      ])

      // 5. Actividad Reciente (Últimas 5 cotizaciones y testimonios)
      const { data: ultimasCoti } = await supabase.from('cotizaciones').select('id, nombre, tipo_proyecto, estado, created_at').order('created_at', { ascending: false }).limit(3)
      const { data: ultimosTest } = await supabase.from('testimonios').select('id, comentario, estado, created_at, clientes(nombre, apellido)').order('created_at', { ascending: false }).limit(3)

      let combinada: any[] = []
      
      if (ultimasCoti) {
        ultimasCoti.forEach(c => combinada.push({
          id: `cot-${c.id}`,
          usuario: c.nombre,
          accion: `Solicitó cotización de ${c.tipo_proyecto}`,
          fecha: new Date(c.created_at),
          estado: c.estado,
          tipo: 'cotizacion'
        }))
      }
      
      if (ultimosTest) {
        ultimosTest.forEach(t => combinada.push({
          id: `test-${t.id}`,
          usuario: `${t.clientes?.nombre} ${t.clientes?.apellido}`,
          accion: `Dejó un testimonio`,
          fecha: new Date(t.created_at),
          estado: t.estado,
          tipo: 'testimonio'
        }))
      }

      combinada.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      setActividad(combinada.slice(0, 5))
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
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
            <span>Actualizado</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
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
            <span>Actualizado</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
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
            <span>Requieren atención</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Testimonios Nuevos</p>
              <h3 className="text-3xl font-bold text-brand-black">{stats.testimoniosNuevos}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Star size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-gray-500 font-medium">
            <span>Pendientes de aprobar</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Crecimiento Mensual</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="clientes" name="Nuevos Clientes" fill="#83A881" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proyectos" name="Nuevos Proyectos" fill="#1F422F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Estado de Proyectos</h3>
          <div className="h-72 flex flex-col items-center">
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

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Actividad Reciente</h3>
          <Activity size={18} className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario / Cliente</th>
                <th className="px-6 py-4 font-medium">Acción</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Cargando actividad...</td>
                </tr>
              ) : actividad.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No hay actividad reciente.</td>
                </tr>
              ) : (
                actividad.map(act => (
                  <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{act.usuario}</td>
                    <td className="px-6 py-4">{act.accion}</td>
                    <td className="px-6 py-4">{act.fecha.toLocaleDateString()} {act.fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        act.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                        act.estado === 'aprobado' || act.estado === 'cotizada' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {act.estado}
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
  )
}
