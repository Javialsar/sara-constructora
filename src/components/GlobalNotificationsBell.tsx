"use client"
import React, { useState, useEffect } from "react"
import { Bell, CheckCircle, Info, AlertTriangle, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface GlobalNotificationsBellProps {
  destinatarioTipo: 'admin' | 'cliente_inmo' | 'cliente_stays' | 'cliente_apu'
  destinatarioId?: string // If null, means it's an admin reading all 'admin' notifications
}

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  modulo_origen: string
  leido: boolean
  link?: string
  created_at: string
}

export default function GlobalNotificationsBell({ destinatarioTipo, destinatarioId }: GlobalNotificationsBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    
    // Subscribe to new notifications
    const supabase = createClient()
    const channel = supabase
      .channel('notificaciones_cambios')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones_globales',
          filter: `destinatario_tipo=eq.${destinatarioTipo}`
        },
        (payload) => {
          // If it's for a specific user, check ID. If for admin, usually ID is null
          const isForMe = !payload.new.destinatario_id || payload.new.destinatario_id === destinatarioId
          if (isForMe) {
            setNotificaciones(prev => [payload.new as Notificacion, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [destinatarioTipo, destinatarioId])

  const fetchNotifications = async () => {
    const supabase = createClient()
    let query = supabase
      .from('notificaciones_globales')
      .select('*')
      .eq('destinatario_tipo', destinatarioTipo)
      .order('created_at', { ascending: false })
      .limit(20)

    if (destinatarioId) {
      // User specific + global broadcasts for that type
      query = query.or(`destinatario_id.eq.${destinatarioId},destinatario_id.is.null`)
    }

    const { data, error } = await query
    if (!error && data) {
      setNotificaciones(data)
      setUnreadCount(data.filter(n => !n.leido).length)
    }
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notificaciones_globales').update({ leido: true }).eq('id', id)
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const ids = notificaciones.filter(n => !n.leido).map(n => n.id)
    if (ids.length === 0) return

    await supabase.from('notificaciones_globales').update({ leido: true }).in('id', ids)
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })))
    setUnreadCount(0)
  }

  const getModuleColor = (modulo: string) => {
    switch(modulo) {
      case 'inmobiliaria': return 'bg-emerald-100 text-emerald-600'
      case 'stays': return 'bg-amber-100 text-amber-600'
      case 'apu': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] items-center justify-center text-white font-bold">
              {unreadCount > 9 ? '+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas leídas
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                <p>No tienes notificaciones nuevas.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notificaciones.map(n => (
                  <div key={n.id} className={`p-4 transition-colors hover:bg-gray-50 ${!n.leido ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getModuleColor(n.modulo_origen)}`}>
                        <Info size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-sm ${!n.leido ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {n.titulo}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{n.mensaje}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          {n.link && (
                            <a href={n.link} className="text-xs text-blue-600 font-medium hover:underline">
                              Ver detalles
                            </a>
                          )}
                          {!n.leido && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="text-xs text-gray-400 hover:text-gray-700 ml-auto"
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800"
            >
              Cerrar panel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
