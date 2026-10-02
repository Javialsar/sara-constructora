"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, RotateCcw, Trash2, HardDrive, Filter, Loader2, Info } from "lucide-react"
import { fetchPapelera, restaurarRegistro } from "@/app/actions/papelera"

export default function PapeleraPage() {
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tablaActual, setTablaActual] = useState("clientes")
  
  const tablas = [
    { id: "clientes", nombre: "Clientes" },
    { id: "proveedores", nombre: "Proveedores" },
    { id: "trabajadores", nombre: "Trabajadores" },
    { id: "proyectos", nombre: "Proyectos" },
    { id: "presupuestos_reales", nombre: "Presupuestos" }
  ]

  useEffect(() => {
    cargarDatos()
  }, [tablaActual])

  const cargarDatos = async () => {
    setLoading(true)
    const data = await fetchPapelera(tablaActual)
    setRegistros(data)
    setLoading(false)
  }

  const handleRestaurar = async (id: string) => {
    if (!window.confirm("¿Restaurar este registro a su cuenta original?")) return
    
    setLoading(true)
    const { success } = await restaurarRegistro(tablaActual, id)
    if (success) {
      alert("Registro restaurado con éxito")
      await cargarDatos()
    } else {
      alert("Error al restaurar el registro")
      setLoading(false)
    }
  }

  const renderFila = (reg: any) => {
    let titulo = ""
    let subtitulo = ""
    
    if (tablaActual === "clientes") {
      titulo = `${reg.nombre} ${reg.apellido}`
      subtitulo = reg.email || reg.identificacion || 'Sin correo'
    } else if (tablaActual === "proveedores") {
      titulo = reg.razon_social
      subtitulo = reg.ruc || 'Sin RUC'
    } else if (tablaActual === "trabajadores") {
      titulo = reg.nombre_completo
      subtitulo = reg.identificacion || reg.especialidad || 'Sin especialidad'
    } else if (tablaActual === "proyectos" || tablaActual === "presupuestos_reales") {
      titulo = reg.nombre || reg.titulo || 'Sin nombre'
      subtitulo = `ID: ${reg.id.split('-')[0]}`
    }

    return (
      <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
        <td className="py-4 px-6">
          <div className="font-bold text-slate-800">{titulo}</div>
          <div className="text-xs text-slate-500">{subtitulo}</div>
        </td>
        <td className="py-4 px-6 text-slate-500">
          {new Date(reg.deleted_at).toLocaleString('es-ES', { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </td>
        <td className="py-4 px-6 text-right">
          <button 
            onClick={() => handleRestaurar(reg.id)}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2 inline-flex"
          >
            <RotateCcw size={14} /> Restaurar
          </button>
        </td>
      </tr>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Trash2 className="text-red-500" size={32} />
            Papelera de Reciclaje
          </h1>
          <p className="text-slate-500 mt-2">
            Registros eliminados por los usuarios. Permanecen aquí protegidos gracias a la intercepción de base de datos.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tablas.map(t => (
          <button
            key={t.id}
            onClick={() => setTablaActual(t.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              tablaActual === t.id 
                ? 'bg-slate-800 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-sage hover:text-brand-sage'
            }`}
          >
            <HardDrive size={16} />
            {t.nombre}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center text-brand-sage">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : registros.length === 0 ? (
          <div className="p-20 text-center text-slate-500">
            <ShieldAlert className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-700">La papelera está vacía</p>
            <p className="text-sm mt-2">No hay registros eliminados en la tabla de {tablas.find(t => t.id === tablaActual)?.nombre}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Registro</th>
                  <th className="px-6 py-4">Fecha de Eliminación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registros.map(renderFila)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
