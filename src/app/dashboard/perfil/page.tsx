"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Shield, Smartphone, Laptop, Globe, LogOut, CheckCircle, AlertTriangle } from "lucide-react"

export default function PerfilPage() {
  const supabase = createClient()
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    cargarSesiones()
  }, [])

  const cargarSesiones = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUserId(user.id)
    
    // Solo traemos las sesiones de las últimas 24 horas del usuario actual
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('registro_sesiones')
      .select('*')
      .eq('user_id', user.id)
      .gte('ultima_actividad', yesterday)
      .order('ultima_actividad', { ascending: false })
      .limit(10)

    if (data) setSesiones(data)
    setLoading(false)
  }

  const handleCerrarOtrasSesiones = async () => {
    if (!window.confirm("¿Estás seguro de que deseas cerrar la sesión en todos los demás dispositivos? (Tendrán que volver a iniciar sesión)")) return
    
    setClosing(true)
    // Supabase auth.signOut con scope 'others' cierra los demás dispositivos
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    
    if (error) {
      alert("Error al cerrar otras sesiones: " + error.message)
    } else {
      alert("¡Sesiones remotas cerradas con éxito! Tu cuenta está segura.")
    }
    setClosing(false)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="text-brand-sage" size={32} />
            Seguridad y Dispositivos
          </h1>
          <p className="text-slate-300 mt-2 max-w-xl">
            Monitorea desde dónde se ha accedido a tu cuenta recientemente. Si no reconoces un dispositivo, puedes cerrar la sesión de forma remota inmediatamente.
          </p>
        </div>
        <button 
          onClick={handleCerrarOtrasSesiones}
          disabled={closing}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <LogOut size={18} />
          {closing ? "Cerrando..." : "Cerrar Otras Sesiones"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Globe className="text-brand-sage" size={20} />
            Actividad Reciente (Últimas 24h)
          </h3>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Cargando dispositivos...</div>
          ) : sesiones.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No hay otras sesiones recientes registradas.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sesiones.map((s, idx) => (
                <div key={s.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {s.dispositivo === 'Móvil' ? <Smartphone size={24} /> : <Laptop size={24} />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        {s.dispositivo} - {s.navegador}
                        {idx === 0 && <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Este dispositivo</span>}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Globe size={14} className="text-slate-400" />
                        {s.ciudad}, {s.pais} <span className="text-slate-300">|</span> IP: {s.ip_address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-700">
                      {new Date(s.ultima_actividad).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-slate-400">Última conexión</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
