import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import HeroConstructora from "@/components/sections/HeroConstructora"
import ContactoSection from "@/components/sections/ContactoSection"

export default function ConstructoraLanding() {
  return (
    <div className="pt-24 pb-0 bg-white">
      {/* Menú Superior Secundario Exclusivo de Constructora */}
      <nav className="max-w-6xl mx-auto px-8 pb-6 flex flex-wrap justify-center items-center gap-8">
        <a href="#servicios" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-sage transition-colors">Servicios</a>
        <a href="#proyectos" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-sage transition-colors">Proyectos</a>
        <a href="/portal/dashboard" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-sage transition-colors">Portal Clientes</a>
        <a href="#cotizacion" className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-sage transition-colors">Solicitar Cotización</a>
        <a href="/modulos/financiero" className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-500 transition-colors">SARA Fintech (Escrow)</a>
      </nav>

      {/* Hero Interactivo de Constructora con los proyectos rotativos */}
      <HeroConstructora />

      {/* Las imágenes de los proyectos y servicios inmediatamente después */}
      <div id="servicios">
        <Trayectoria />
      </div>
      <div id="proyectos">
        <ProyectosMarquesina />
      </div>
      <ProcesoTimeline />
      
      {/* Formulario de Cotización y Contacto integrado */}
      <ContactoSection />
    </div>
  )
}
