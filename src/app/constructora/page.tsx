import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import ModulosSARA from "@/components/sections/ModulosSARA" // Optionally keep this or not? The user wants Fintech here.

export default function ConstructoraLanding() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-8 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">SARA Constructora</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Diseño, ingeniería y ejecución de proyectos con los más altos estándares de calidad. 
          Explora nuestros servicios, proyectos recientes y accede a tu panel financiero.
        </p>
      </div>

      <Trayectoria />
      <ProyectosMarquesina />
      <ProcesoTimeline />
      
      {/* Botones de acción rápida que pidió el usuario */}
      <section className="py-16 bg-slate-50 border-t border-slate-100 mt-16">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Accesos Directos</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/portal/dashboard" className="px-6 py-3 bg-brand-sage text-white font-bold rounded-lg hover:bg-brand-sage/90">Portal Clientes</a>
            <a href="/contacto" className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700">Solicitar Cotización</a>
            <a href="/modulos/financiero" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500">Panel Financiero (Escrow)</a>
          </div>
        </div>
      </section>
    </div>
  )
}
