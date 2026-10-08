import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import ModulosSARA from "@/components/sections/ModulosSARA" // Optionally keep this or not? The user wants Fintech here.
import HeroConstructora from "@/components/sections/HeroConstructora"

export default function ConstructoraLanding() {
  return (
    <div className="pt-24 pb-0 bg-white">
      {/* Menú Superior Secundario Exclusivo de Constructora */}
      <div className="max-w-6xl mx-auto px-8 pb-4 flex flex-wrap justify-center gap-4">
        <a href="/portal/dashboard" className="px-6 py-2.5 bg-brand-sage text-white text-sm font-bold uppercase tracking-wider rounded shadow hover:bg-brand-sage/90 transition-all">Portal Clientes</a>
        <a href="/contacto" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded shadow hover:bg-slate-800 transition-all">Solicitar Cotización</a>
        <a href="/modulos/financiero" className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold uppercase tracking-wider rounded shadow hover:bg-emerald-500 transition-all">SARA Fintech (Escrow)</a>
      </div>

      {/* Hero Interactivo de Constructora con los proyectos rotativos */}
      <HeroConstructora />

      {/* Las imágenes de los proyectos y servicios inmediatamente después */}
      <Trayectoria />
      <ProyectosMarquesina />
      <ProcesoTimeline />
    </div>
  )
}
