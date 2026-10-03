"use client"
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Send, CheckCircle, Building2, Home, Compass, Info, AlertTriangle } from 'lucide-react'

export default function CentroNotificacionesAdmin() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    destinatario_tipo: 'cliente_apu', // Default
    modulo_origen: 'sistema',
    titulo: '',
    mensaje: '',
    link: ''
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase.from('notificaciones_globales').insert([{
        destinatario_tipo: formData.destinatario_tipo,
        destinatario_id: null, // null significa "Enviar a todos los usuarios de este tipo"
        modulo_origen: formData.modulo_origen,
        titulo: formData.titulo,
        mensaje: formData.mensaje,
        link: formData.link || null
      }])

      if (error) throw error
      
      setSuccess(true)
      setFormData(prev => ({ ...prev, titulo: '', mensaje: '', link: '' }))
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error(err)
      alert("Hubo un error al enviar la notificación.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="text-blue-600" /> Centro de Difusión Global
        </h1>
        <p className="text-gray-500 mt-2">Envía notificaciones de promociones, alertas y actualizaciones en tiempo real a todos los clientes de un servicio específico.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg">Nueva Campaña de Notificación</h2>
        </div>
        
        <form onSubmit={handleSend} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Audiencia Objetivo</label>
              <div className="grid grid-cols-1 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.destinatario_tipo === 'cliente_apu' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="destinatario_tipo" value="cliente_apu" checked={formData.destinatario_tipo === 'cliente_apu'} onChange={e => setFormData({...formData, destinatario_tipo: e.target.value})} className="hidden" />
                  <Building2 size={20} className={formData.destinatario_tipo === 'cliente_apu' ? 'text-blue-600' : 'text-gray-400'} />
                  <div>
                    <div className="font-bold text-gray-900">Clientes de SARA APU</div>
                    <div className="text-xs text-gray-500">Usuarios del SaaS Constructora</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.destinatario_tipo === 'cliente_inmo' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="destinatario_tipo" value="cliente_inmo" checked={formData.destinatario_tipo === 'cliente_inmo'} onChange={e => setFormData({...formData, destinatario_tipo: e.target.value})} className="hidden" />
                  <Home size={20} className={formData.destinatario_tipo === 'cliente_inmo' ? 'text-emerald-600' : 'text-gray-400'} />
                  <div>
                    <div className="font-bold text-gray-900">Portal Inmobiliario</div>
                    <div className="text-xs text-gray-500">Compradores y Propietarios</div>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.destinatario_tipo === 'cliente_stays' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="destinatario_tipo" value="cliente_stays" checked={formData.destinatario_tipo === 'cliente_stays'} onChange={e => setFormData({...formData, destinatario_tipo: e.target.value})} className="hidden" />
                  <Compass size={20} className={formData.destinatario_tipo === 'cliente_stays' ? 'text-amber-600' : 'text-gray-400'} />
                  <div>
                    <div className="font-bold text-gray-900">Portal SARA Stays</div>
                    <div className="text-xs text-gray-500">Huéspedes y Anfitriones</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Título de la Notificación</label>
                <input 
                  type="text" 
                  required
                  maxLength={100}
                  placeholder="Ej: ¡Nueva Promoción de Verano!"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-sage focus:border-brand-sage"
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Mensaje</label>
                <textarea 
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Escribe el mensaje que recibirán..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-sage focus:border-brand-sage resize-none"
                  value={formData.mensaje}
                  onChange={e => setFormData({...formData, mensaje: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Enlace (Opcional)</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-sage focus:border-brand-sage"
                  value={formData.link}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                />
                <p className="text-xs text-gray-500">Si incluyes un enlace, los usuarios podrán hacer clic en la notificación para visitarlo.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            {success ? (
              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                <CheckCircle size={20} />
                ¡Notificación enviada con éxito!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm bg-blue-50 px-4 py-2 rounded-lg">
                <Info size={16} />
                La alerta aparecerá instantáneamente en la pantalla de la audiencia seleccionada.
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-sage transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
              Difundir Mensaje
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
