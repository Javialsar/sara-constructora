"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, FileText, Camera, Video, MapPin, LogOut, Calendar, ChevronRight } from "lucide-react"

export default function PortalDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const auth = sessionStorage.getItem("sara_portal_auth")
    if (auth) {
      const parsed = JSON.parse(auth)
      if (parsed.authenticated) {
        setIsAuthenticated(true)
        setUserEmail(parsed.email)
        return
      }
    }
    router.push("/portal")
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("sara_portal_auth")
    router.push("/portal")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-sage/30 border-t-brand-sage rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 text-brand-sage font-bold uppercase tracking-widest text-xs mb-2">
              <Lock size={14} /> Portal de Clientes
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tighter uppercase">
              Panel de Seguimiento
            </h1>
            <p className="text-gray-500 text-sm mt-1">Bienvenido, <span className="font-semibold text-brand-dark">{userEmail}</span></p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors self-start"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Proyecto Activo */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="font-bold text-brand-dark mb-6 uppercase tracking-widest text-xs border-b pb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Proyecto Activo
              </h3>
              <ul className="space-y-5 text-sm">
                <li>
                  <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Nombre del Proyecto</span>
                  <span className="font-semibold text-brand-dark">Residencia Familia Martínez</span>
                </li>
                <li>
                  <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Ubicación</span>
                  <span className="flex items-center gap-1 font-medium"><MapPin size={14} className="text-brand-sage"/> Cariamanga, Loja</span>
                </li>
                <li>
                  <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Fecha de Inicio</span>
                  <span className="flex items-center gap-1 font-medium"><Calendar size={14} className="text-brand-sage"/> 15 de Marzo, 2026</span>
                </li>
                <li>
                  <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Estado</span>
                  <span className="inline-block bg-brand-sage/20 text-brand-dark px-3 py-1.5 font-bold text-xs uppercase tracking-wide">
                    En Construcción
                  </span>
                </li>
              </ul>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-500 uppercase tracking-widest">Avance General</span>
                  <span className="text-brand-sage">65%</span>
                </div>
                <div className="w-full bg-gray-100 h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-brand-sage"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Documentos */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-widest text-xs border-b pb-4">Documentos del Proyecto</h3>
              <ul className="space-y-3">
                {[
                  "Planos Arquitectónicos v2.pdf",
                  "Estudio de Suelos.pdf",
                  "Permisos Municipales.pdf",
                  "Cronograma de Avance.xlsx",
                  "Presupuesto Detallado.xlsx",
                ].map((doc, i) => (
                  <li key={i}>
                    <a href="#" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-sage transition-colors group py-1">
                      <FileText size={16} className="text-gray-400 group-hover:text-brand-sage shrink-0" />
                      <span className="flex-1">{doc}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-sage" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fotografías */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs flex items-center gap-2">
                  <Camera size={16} className="text-brand-sage"/> Registro Fotográfico (Avance Semanal)
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Actualizado hace 2 días</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600",
                  "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=600",
                  "https://images.unsplash.com/photo-1504307651254-35680f356f58?q=80&w=600",
                  "https://images.unsplash.com/photo-1578509378904-71648a04b19c?q=80&w=600",
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600",
                  "https://images.unsplash.com/photo-1600607687989-ce4d31d94f28?q=80&w=600",
                ].map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer">
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Semana {6 - i}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Video */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs flex items-center gap-2">
                  <Video size={16} className="text-brand-sage"/> Recorrido Virtual / Drone
                </h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hace 1 semana</span>
              </div>
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                <div 
                  className="absolute inset-0 opacity-40 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578509378904-71648a04b19c?q=80&w=1200')" }}
                />
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="w-0 h-0 border-t-10 border-t-transparent border-l-[18px] border-l-white border-b-10 border-b-transparent ml-1.5" />
                </div>
              </div>
            </motion.div>

            {/* Timeline de Avance */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs border-b pb-4 mb-6">
                Historial de Avance
              </h3>
              <div className="space-y-6">
                {[
                  { fecha: "05 Sep 2026", titulo: "Instalación de cubierta", estado: "Completado", color: "bg-brand-sage" },
                  { fecha: "28 Ago 2026", titulo: "Mampostería segundo piso", estado: "Completado", color: "bg-brand-sage" },
                  { fecha: "15 Ago 2026", titulo: "Fundición losa segundo piso", estado: "Completado", color: "bg-brand-sage" },
                  { fecha: "01 Ago 2026", titulo: "Estructura columnas y vigas", estado: "Completado", color: "bg-brand-sage" },
                  { fecha: "15 Mar 2026", titulo: "Cimentación y replanteo", estado: "Completado", color: "bg-brand-sage" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} shrink-0 mt-1`} />
                      {i < 4 && <div className="w-px h-8 bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-brand-dark">{item.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.fecha} · {item.estado}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
