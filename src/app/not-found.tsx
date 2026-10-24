import React from "react"
import Link from "next/link"
import { Home, Compass, Phone, ArrowLeft, Building2 } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 selection:bg-amber-500 selection:text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-black pointer-events-none" />
      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        
        {/* Error Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase shadow-lg">
          <Building2 className="w-3.5 h-3.5" />
          <span>Error 404 · Ruta No Encontrada</span>
        </div>

        {/* Big 404 */}
        <div className="space-y-3">
          <h1 className="font-display text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-sage to-white tracking-tight">
            404
          </h1>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Página Fuera de Línea de Obra
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            La ubicación o documento que buscas no existe, ha sido reubicada o requiere credenciales de acceso técnico autorizado.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Link
            href="/"
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Inicio SARA</span>
          </Link>

          <Link
            href="/servicios"
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-brand-sage" />
            <span>Servicios</span>
          </Link>

          <Link
            href="/contacto"
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Contacto</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/[0.08] text-xs text-slate-500 font-mono">
          GRUPO SARA · INGENIERÍA & TECNOLOGÍA INTEGRAL
        </div>

      </div>
    </div>
  )
}
