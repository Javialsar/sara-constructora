"use client"
import { useState, useMemo, useEffect } from "react"
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area
} from "recharts"
import { 
  Download, FileSpreadsheet, Search, Calendar, MapPin, Clock, User, Activity, Globe, Monitor, Filter
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { membreteBase64 } from "@/lib/membreteBase64"

// Tipado para los registros
type AuditLog = {
  id: string
  fecha: string
  hora: string
  usuario: string
  ip: string
  geolocalizacion: string
  actividad: string
  tiempo_activo: string
  dispositivo: string
}

// Datos de prueba (Mocks) para la visualización.
// En producción, esto vendría de Supabase: supabase.from('historial').select('*')
const generateMockData = (): AuditLog[] => {
  const users = ["Carlos Pérez", "Ana Silva", "Administrador SARA", "Luis Torres"]
  const activities = [
    "Inicio de sesión exitoso", 
    "Creó un nuevo rubro", 
    "Aprobó el presupuesto", 
    "Exportó reporte a PDF", 
    "Cerró sesión",
    "Edición de Insumo"
  ]
  const locations = ["Quito, EC", "Guayaquil, EC", "Cuenca, EC", "Machala, EC"]
  const devices = ["Windows - Chrome", "Mac - Safari", "Android - Chrome", "iOS - Safari"]
  
  const data: AuditLog[] = []
  for (let i = 0; i < 50; i++) {
    // Generar fechas aleatorias de los últimos 7 días
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    
    // Hora aleatoria
    const h = Math.floor(Math.random() * 24).toString().padStart(2, '0')
    const m = Math.floor(Math.random() * 60).toString().padStart(2, '0')
    
    data.push({
      id: `LOG-${1000 + i}`,
      fecha: date.toISOString().split('T')[0],
      hora: `${h}:${m}`,
      usuario: users[Math.floor(Math.random() * users.length)],
      ip: `190.152.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      geolocalizacion: locations[Math.floor(Math.random() * locations.length)],
      actividad: activities[Math.floor(Math.random() * activities.length)],
      tiempo_activo: `${Math.floor(Math.random() * 120) + 5} min`,
      dispositivo: devices[Math.floor(Math.random() * devices.length)]
    })
  }
  return data.sort((a, b) => new Date(`${b.fecha}T${b.hora}`).getTime() - new Date(`${a.fecha}T${a.hora}`).getTime())
}

export default function HistorialPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")
  
  useEffect(() => {
    // Simular carga
    setLogs(generateMockData())
  }, [])

  // Filtrado
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = log.actividad.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.ip.includes(searchTerm) || 
                          log.geolocalizacion.toLowerCase().includes(searchTerm.toLowerCase())
      const matchDate = dateFilter ? log.fecha === dateFilter : true
      const matchUser = userFilter ? log.usuario === userFilter : true
      return matchSearch && matchDate && matchUser
    })
  }, [logs, searchTerm, dateFilter, userFilter])

  // Lista única de usuarios para el filtro
  const uniqueUsers = useMemo(() => Array.from(new Set(logs.map(l => l.usuario))), [logs])

  // Datos para la gráfica (Accesos por Día)
  const chartData = useMemo(() => {
    const counts = filteredLogs.reduce((acc, log) => {
      acc[log.fecha] = (acc[log.fecha] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(counts)
      .map(([date, count]) => ({ date, accesos: count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredLogs])

  // Datos para la gráfica de calor por Hora (0-23h)
  const heatmapData = useMemo(() => {
    const hours = Array.from({length: 24}, (_, i) => ({ hora: `${i.toString().padStart(2, '0')}:00`, cantidad: 0 }))
    filteredLogs.forEach(log => {
      const h = parseInt(log.hora.split(':')[0])
      hours[h].cantidad++
    })
    return hours
  }, [filteredLogs])

  // Exportar Excel con Encabezado Institucional
  const exportToExcel = () => {
    const headerRows = [
      ["SARA CONSTRUCTORA S.A."],
      ["SISTEMA INTEGRADO DE AUDITORÍA Y TRAZABILIDAD"],
      ["REPORTE: HISTORIAL DE ACTIVIDADES Y ACCESOS"],
      [`Fecha y Hora de Emisión: ${new Date().toLocaleString()}`],
      [`Total de Registros: ${filteredLogs.length}`],
      [],
      ["Nº", "FECHA", "HORA", "USUARIO", "ACTIVIDAD", "DIRECCIÓN IP", "GEOLOCALIZACIÓN", "DISPOSITIVO", "TIEMPO ACTIVO"]
    ];

    const dataRows = filteredLogs.map((log, idx) => [
      idx + 1,
      log.fecha,
      log.hora,
      log.usuario,
      log.actividad,
      log.ip,
      log.geolocalizacion,
      log.dispositivo,
      log.tiempo_activo
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    XLSX.writeFile(workbook, "Historial_Auditoria_Accesos.xlsx");
  }

  // Exportar PDF con Membrete Institucional
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Membrete Oficial centrado
    doc.addImage(membreteBase64, 'PNG', (pageWidth - 110) / 2, 5, 110, 32);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("HISTORIAL DE AUDITORÍA Y ACCESOS", 14, 45);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha y Hora de Emisión: ${new Date().toLocaleString()} | Sistema SARA Constructora`, 14, 51);
    doc.text(`Total de registros: ${filteredLogs.length}`, 14, 56);
    
    const tableColumn = ["Fecha", "Hora", "Usuario", "Actividad", "IP", "Ubicación", "Dispositivo", "Tiempo"];
    const tableRows = filteredLogs.map(log => [
      log.fecha,
      log.hora,
      log.usuario,
      log.actividad,
      log.ip,
      log.geolocalizacion,
      log.dispositivo,
      log.tiempo_activo
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 61,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 71, 63] } // Brand dark / sage
    });
    
    doc.save("Historial_Auditoria.pdf");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark flex items-center gap-2">
            <Activity className="text-brand-sage" size={28} /> Historial y Auditoría
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitorea la actividad de los usuarios, ubicaciones y sesiones activas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-y-auto">
        
        {/* COLUMNA IZQUIERDA: GRÁFICAS Y FILTROS */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
          
          {/* Tarjeta de Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
              <Filter size={16} className="text-gray-400" /> Filtros de Búsqueda
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Buscar (Actividad, IP, Ubicación)</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-sage" placeholder="Buscar..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha</label>
                  <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Usuario</label>
                  <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-sage">
                    <option value="">Todos</option>
                    {uniqueUsers.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(searchTerm || dateFilter || userFilter) && (
                <button onClick={() => { setSearchTerm(''); setDateFilter(''); setUserFilter(''); }} className="text-xs text-brand-sage font-bold hover:underline w-full text-right mt-1">
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Gráfica de Accesos por Día */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4">Tendencia de Actividad</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis tick={{fontSize: 10}} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="accesos" stroke="#00473F" fill="#00473F" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica de Calor por Hora */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4">Mapa de Calor (Por Hora)</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="hora" tick={{fontSize: 9}} interval={3} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar dataKey="cantidad" radius={[2, 2, 0, 0]}>
                    {heatmapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cantidad > 5 ? '#ef4444' : entry.cantidad > 2 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-[10px] text-gray-500 font-medium">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10b981]"></div> Bajo</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div> Medio</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#ef4444]"></div> Alto</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABLA DE DATOS */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Registro Detallado</h2>
            <span className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full font-bold text-gray-500">
              {filteredLogs.length} registros
            </span>
          </div>
          
          <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b border-gray-200 sticky top-0 z-10 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Fecha y Hora</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                  <th className="px-4 py-3 font-semibold">Conexión</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Tiempo Act.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <Search size={32} className="mx-auto mb-3 opacity-20" />
                      No se encontraron registros para los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-700">{log.fecha}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{log.hora}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-sage/20 text-brand-dark flex items-center justify-center text-xs font-bold shrink-0">
                            {log.usuario.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800 text-xs">{log.usuario}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                        {log.actividad}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500" title="IP Address">
                            <Globe size={12} /> <span className="font-mono">{log.ip}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400" title="Ubicación y Dispositivo">
                            <MapPin size={10} /> {log.geolocalizacion} • <Monitor size={10} className="ml-1" /> {log.dispositivo}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold whitespace-nowrap">
                          <Clock size={12} /> {log.tiempo_activo}
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
