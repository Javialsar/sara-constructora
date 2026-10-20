"use client"

import { useState } from "react"
import { Check, X, ExternalLink, Clock, DollarSign, Loader2, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function PagosClient({ initialOrdenes }: { initialOrdenes: any[] }) {
  const [ordenes, setOrdenes] = useState(initialOrdenes)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleAprobar = async (ordenId: string, userId: string, planId: string) => {
    setIsProcessing(ordenId)
    const supabase = createClient()
    
    try {
      // 1. Marcar la orden como pagada
      const { error: err1 } = await supabase
        .from("ordenes_pago")
        .update({ estado: "completado" })
        .eq("id", ordenId)
      
      if (err1) throw err1

      // 2. Crear o actualizar la suscripción del usuario
      // Calculamos la fecha de expiración (1 mes desde hoy para simplificar, en un entorno real dependería de frecuencia)
      const hoy = new Date()
      const expiracion = new Date()
      expiracion.setMonth(hoy.getMonth() + 1)

      const { data: existingSub } = await supabase
        .from("suscripciones_saas")
        .select("id")
        .eq("user_id", userId)
        .single()

      if (existingSub) {
        const { error: err2 } = await supabase
          .from("suscripciones_saas")
          .update({
            plan_id: planId,
            estado: "activa",
            fecha_inicio: hoy.toISOString(),
            fecha_fin: expiracion.toISOString()
          })
          .eq("user_id", userId)
        if (err2) throw err2
      } else {
        const { error: err3 } = await supabase
          .from("suscripciones_saas")
          .insert({
            user_id: userId,
            plan_id: planId,
            estado: "activa",
            fecha_inicio: hoy.toISOString(),
            fecha_fin: expiracion.toISOString(),
            stripe_subscription_id: `transferencia_${ordenId}`
          })
        if (err3) throw err3
      }

      // Actualizar UI
      setOrdenes(prev => prev.map(o => o.id === ordenId ? { ...o, estado: "completado" } : o))
      alert("Transferencia aprobada y suscripción activada correctamente.")
      
    } catch (err: any) {
      alert("Error al aprobar: " + err.message)
    } finally {
      setIsProcessing(null)
    }
  }

  const handleRechazar = async (ordenId: string) => {
    if (!confirm("¿Estás seguro de rechazar este pago?")) return
    setIsProcessing(ordenId)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("ordenes_pago")
        .update({ estado: "fallido" }) // o "cancelado"
        .eq("id", ordenId)
      
      if (error) throw error
      setOrdenes(prev => prev.map(o => o.id === ordenId ? { ...o, estado: "fallido" } : o))
    } catch (err: any) {
      alert("Error al rechazar: " + err.message)
    } finally {
      setIsProcessing(null)
    }
  }

  const parseComprobanteUrl = (concepto: string) => {
    // Hack: Si guardamos la URL en el concepto o metadata
    // Aquí implementamos la asunción de que podemos buscar una URL en el string si existe.
    // O si usamos Supabase Storage, tal vez el UUID del usuario ayuda.
    // Como no agregamos la columna `comprobante_url`, busquemos "http" en el concepto o similar.
    return null;
  }

  const filteredOrdenes = ordenes.filter(o => 
    o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><Clock size={12} /> Revisión Pdte</span>
      case 'completado':
      case 'completada':
      case 'aprobada':
      case 'pagado':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><Check size={12} /> Aprobado</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><X size={12} /> Rechazado</span>
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por correo o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">Cliente</th>
              <th className="p-4 font-bold">Plan / Concepto</th>
              <th className="p-4 font-bold">Monto</th>
              <th className="p-4 font-bold">Fecha</th>
              <th className="p-4 font-bold">Estado</th>
              <th className="p-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrdenes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No se encontraron órdenes de pago.</td>
              </tr>
            ) : filteredOrdenes.map(orden => (
              <tr key={orden.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{orden.user_name}</p>
                  <p className="text-xs text-slate-500">{orden.user_email}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-800 text-sm max-w-[200px] truncate" title={orden.concepto}>{orden.concepto}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase">REF: {orden.referencia_id}</p>
                </td>
                <td className="p-4">
                  <span className="font-black text-slate-900">${orden.monto}</span>
                  <span className="text-xs text-slate-400 ml-1">{orden.moneda}</span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(orden.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="p-4">
                  {getStatusBadge(orden.estado)}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Botón de Comprobante si aplica */}
                    <a 
                      href={orden.comprobante_url || `/admin/pagos/ver-comprobante?user=${orden.user_id}`} 
                      className={`p-2 rounded-lg transition-colors ${orden.comprobante_url ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold' : 'bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50'}`}
                      title={orden.comprobante_url ? "Ver Comprobante Real" : "Ver Comprobantes en Storage"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} />
                    </a>

                    {orden.estado === 'pendiente' && (
                      <>
                        <button 
                          onClick={() => handleAprobar(orden.id, orden.user_id, orden.referencia_id)}
                          disabled={isProcessing === orden.id}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                        >
                          {isProcessing === orden.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Aprobar
                        </button>
                        <button 
                          onClick={() => handleRechazar(orden.id)}
                          disabled={isProcessing === orden.id}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-200 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                        >
                          <X size={14} /> Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
