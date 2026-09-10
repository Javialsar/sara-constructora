"use client"
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

// MOCK DATA
const monthlyData = [
  { name: 'Ene', proyectos: 2, clientes: 4 },
  { name: 'Feb', proyectos: 3, clientes: 3 },
  { name: 'Mar', proyectos: 1, clientes: 5 },
  { name: 'Abr', proyectos: 4, clientes: 8 },
  { name: 'May', proyectos: 2, clientes: 6 },
  { name: 'Jun', proyectos: 5, clientes: 10 },
];

const projectStatusData = [
  { name: 'En Diseño', value: 3, color: '#83A881' }, // brand-sage
  { name: 'En Construcción', value: 5, color: '#1F422F' }, // brand-dark
  { name: 'Finalizados', value: 12, color: '#0D0D0D' }, // brand-black
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Proyectos Activos</p>
              <h3 className="text-3xl font-bold text-brand-black">8</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-sage/20 flex items-center justify-center text-brand-dark">
              <Building2 size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} />
            <span>+2 este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Clientes Registrados</p>
              <h3 className="text-3xl font-bold text-brand-black">45</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-dark/10 flex items-center justify-center text-brand-dark">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} />
            <span>+12 este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Cotizaciones Pendientes</p>
              <h3 className="text-3xl font-bold text-brand-black">14</h3>
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
              <h3 className="text-3xl font-bold text-brand-black">3</h3>
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

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Actividad Reciente</h3>
          <button className="text-sm font-medium text-brand-sage hover:text-brand-dark transition-colors">Ver todo</button>
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
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">Juan Pérez</td>
                <td className="px-6 py-4">Dejó un testimonio de 5 estrellas</td>
                <td className="px-6 py-4">Hace 2 horas</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">María Gómez</td>
                <td className="px-6 py-4">Se registró en el portal de clientes</td>
                <td className="px-6 py-4">Hoy, 09:30 AM</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Aprobado</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">Carlos Ruiz</td>
                <td className="px-6 py-4">Solicitó una cotización de "Diseño Arquitectónico"</td>
                <td className="px-6 py-4">Ayer</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Nueva</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
