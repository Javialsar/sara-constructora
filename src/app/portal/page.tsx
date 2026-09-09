"use client"
import { motion } from "framer-motion"
import { Lock, FileText, Camera, Video, MapPin } from "lucide-react"

export default function PortalClientePage() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-12 max-w-3xl">
          <div className="flex items-center gap-3 text-brand-sage font-bold uppercase tracking-widest text-xs mb-4">
            <Lock size={16} /> Portal de Clientes
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Seguimiento de Proyecto
          </h1>
          <p className="text-gray-500 text-lg">
            Bienvenido. Aquí puedes supervisar el avance de tu obra en tiempo real mediante fotografías, videos y reportes técnicos.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-widest text-sm border-b pb-4">Detalles del Proyecto</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <span className="block text-gray-400 font-bold text-xs uppercase mb-1">Nombre</span>
                  <span className="font-medium">Residencia Familia Martínez</span>
                </li>
                <li>
                  <span className="block text-gray-400 font-bold text-xs uppercase mb-1">Ubicación</span>
                  <span className="flex items-center gap-1 font-medium"><MapPin size={14} className="text-brand-sage"/> Cariamanga, Loja</span>
                </li>
                <li>
                  <span className="block text-gray-400 font-bold text-xs uppercase mb-1">Estado</span>
                  <span className="inline-block bg-brand-sage text-brand-dark px-2 py-1 font-bold text-xs uppercase rounded-sm">En Construcción (65%)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-widest text-sm border-b pb-4">Documentos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-sage"><FileText size={16}/> Planos Arquitectónicos v2.pdf</a></li>
                <li><a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-sage"><FileText size={16}/> Permisos Municipales.pdf</a></li>
                <li><a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-sage"><FileText size={16}/> Cronograma de Avance.xlsx</a></li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="font-bold text-brand-dark uppercase tracking-widest text-sm flex items-center gap-2">
                  <Camera size={18} className="text-brand-sage"/> Últimas Fotografías (Avance Semanal)
                </h3>
                <span className="text-xs text-gray-400">Hace 2 días</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-gray-200 rounded relative group overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform" style={{backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800')"}} />
                </div>
                <div className="aspect-video bg-gray-200 rounded relative group overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform" style={{backgroundImage: "url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=800')"}} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h3 className="font-bold text-brand-dark uppercase tracking-widest text-sm flex items-center gap-2">
                  <Video size={18} className="text-brand-sage"/> Recorrido Virtual / Drone
                </h3>
                <span className="text-xs text-gray-400">Hace 1 semana</span>
              </div>
              <div className="aspect-video bg-gray-900 rounded flex items-center justify-center relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 opacity-50 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1578509378904-71648a04b19c?q=80&w=800')"}} />
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
