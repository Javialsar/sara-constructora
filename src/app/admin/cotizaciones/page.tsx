"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Calculator, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Ban, 
  AlertCircle,
  TrendingUp,
  Filter,
  Check,
  X
} from "lucide-react"

const FUNNEL_STAGES = [
  { value: 'nuevo', label: 'Nuevo Lead', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'contactado', label: 'Contactado', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { value: 'calificado', label: 'Calificado', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'cotizacion_enviada', label: 'Cotización Enviada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'negociacion', label: 'En Negociación', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'ganado', label: 'Cierre Ganado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'perdido', label: 'Perdido', color: 'bg-rose-100 text-rose-800 border-rose-200' },
] as const

export default function AdminCotizaciones() {
  const supabase = createClient()
  const [cotizaciones, setCotizaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Modal para registrar motivo de pérdida
  const [modalPerdida, setModalPerdida] = useState<{ open: boolean; cotizacionId: string | null; motivo: string }>({
    open: false,
    cotizacionId: null,
    motivo: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const showNotification = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 5000)
  }

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order('created_at', { ascending: false })
      
    if (data) setCotizaciones(data)
    setLoading(false)
  }

  const handleTransicionEstado = async (id: string, nuevoEstado: string, motivoPerdida?: string) => {
    if (nuevoEstado === 'perdido' && !motivoPerdida) {
      setModalPerdida({ open: true, cotizacionId: id, motivo: '' })
      return
    }

    // Optimistic update
    const previous = cotizaciones.find(c => c.id === id)?.estado
    setCotizaciones(prev => prev.map(c => c.id === id ? { 
      ...c, 
      estado: nuevoEstado, 
      motivo_perdida: nuevoEstado === 'perdido' ? motivoPerdida : c.motivo_perdida 
    } : c))

    try {
      const response = await fetch('/api/admin/cotizaciones/transicion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          nuevoEstado,
          motivo_perdida: nuevoEstado === 'perdido' ? (motivoPerdida || 'Sin motivo especificado') : null,
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'No se pudo actualizar el estado.')
      }

      showNotification(`Estado de la cotización actualizado a "${nuevoEstado}".`, 'success')
      if (modalPerdida.open) {
        setModalPerdida({ open: false, cotizacionId: null, motivo: '' })
      }
    } catch (err: any) {
      showNotification(`Error: ${err.message}`, 'error')
      // Revert optimistic update
      setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, estado: previous } : c))
    }
  }

  const getStatusColor = (estado: string) => {
    const stage = FUNNEL_STAGES.find(s => s.value === estado)
    if (stage) return stage.color
    switch (estado) {
      case 'aprobada': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cotizada': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rechazada': return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'pendiente': return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (estado: string) => {
    const stage = FUNNEL_STAGES.find(s => s.value === estado)
    if (stage) return stage.label
    return estado
  }

  return (
    <div className="space-y-6">
      {/* Notificación Toast Inline */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-md animate-in slide-in-from-top-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-rose-600 text-white'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header del Embudo Comercial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-dark" />
            <h2 className="text-2xl font-bold text-gray-800">Embudo de Ventas y CRM de Prospectos</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Gestión del embudo oficial de GRUPO SARA: Nuevo &rarr; Contactado &rarr; Calificado &rarr; Cotización &rarr; Negociación &rarr; Ganado / Perdido
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
          <span>Total Registros: {cotizaciones.length}</span>
        </div>
      </div>

      {/* Tabla del CRM */}
      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
              <thead className="bg-slate-100 text-slate-700 border-b border-gray-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">Cliente / Contacto</th>
                  <th className="px-6 py-4 font-bold">Proyecto Solicitado</th>
                  <th className="px-6 py-4 font-bold">Detalles / Presupuesto</th>
                  <th className="px-6 py-4 font-bold">Etapa Embudo</th>
                  <th className="px-6 py-4 font-bold text-right">Transición de Etapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Calculator size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hay cotizaciones registradas en el embudo comercial.</p>
                    </td>
                  </tr>
                ) : (
                  cotizaciones.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 mb-1">{c.nombre}</p>
                        <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                          <Mail size={12} className="text-brand-sage" />
                          <a href={`mailto:${c.email}`} className="hover:text-brand-dark">{c.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <Phone size={12} className="text-brand-sage" />
                          <a href={`tel:${c.telefono}`} className="hover:text-brand-dark">{c.telefono}</a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold uppercase mb-1">
                          {c.tipo_proyecto}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-2">
                          <Calendar size={10} />
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 italic line-clamp-2 text-xs mb-2">"{c.descripcion}"</p>
                        {c.presupuesto_estimado && (
                          <div className="flex items-center gap-1 text-brand-dark font-bold text-xs">
                            <DollarSign size={12} className="text-brand-sage" />
                            {c.presupuesto_estimado}
                          </div>
                        )}
                        {c.motivo_perdida && (
                          <div className="mt-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            <strong>Motivo Pérdida:</strong> {c.motivo_perdida}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(c.estado)}`}>
                          {getStatusLabel(c.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={c.estado}
                          onChange={(e) => handleTransicionEstado(c.id, e.target.value)}
                          className="bg-white border border-gray-300 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-brand-sage focus:border-brand-sage font-medium cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
                        >
                          {FUNNEL_STAGES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para captura de Motivo de Pérdida */}
      {modalPerdida.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                Registrar Motivo de Pérdida
              </h3>
              <button 
                onClick={() => setModalPerdida({ open: false, cotizacionId: null, motivo: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Para auditoría comercial de GRUPO SARA y calibración del embudo, por favor indica por qué no se concretó la cotización:
            </p>
            <textarea
              rows={3}
              value={modalPerdida.motivo}
              onChange={(e) => setModalPerdida(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Ej: Presupuesto del cliente inferior al costo APU; eligió otro contratista; proyecto cancelado..."
              className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:ring-rose-500 focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalPerdida({ open: false, cotizacionId: null, motivo: '' })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!modalPerdida.motivo.trim()}
                onClick={() => {
                  if (modalPerdida.cotizacionId && modalPerdida.motivo.trim()) {
                    handleTransicionEstado(modalPerdida.cotizacionId, 'perdido', modalPerdida.motivo.trim())
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow"
              >
                Confirmar Pérdida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
