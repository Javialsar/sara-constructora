import HeaderConstructora from "@/components/layout/HeaderConstructora"
import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import HeroConstructora from "@/components/sections/HeroConstructora"
import ContactoSection from "@/components/sections/ContactoSection"
import ConstructoraIntro from "@/components/constructora/ConstructoraIntro"

export const metadata = {
  title: "SARA Constructora | Obras Civiles & Arquitectura en Ecuador",
  description: "Planificación arquitectónica, diseño estructural bajo norma NEC, fiscalización y construcción llave en mano en todo el Ecuador.",
}

export default function ConstructoraLanding() {
  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col">
      {/* Intro Cinematográfico 3D de Primer Ingreso */}
      <ConstructoraIntro />
      
      {/* Cabecera Superior Oficial de SARA Constructora */}
      <HeaderConstructora />

      {/* Hero Interactivo de Constructora con los proyectos rotativos */}
      <div className="pt-16 md:pt-20 bg-brand-dark">
        <HeroConstructora />
      </div>

      {/* Trayectoria y servicios */}
      <div id="servicios">
        <Trayectoria />
      </div>

      {/* Galería y Marquesina de Nuestros Proyectos */}
      <div id="proyectos">
        <ProyectosMarquesina />
      </div>

      {/* Línea de proceso de construcción */}
      <div>
        <ProcesoTimeline />
      </div>
      
      {/* Formulario de Cotización y Contacto: ¿Tienes un proyecto en mente? */}
      <div id="cotizacion">
        <ContactoSection />
      </div>
    </div>
  )
}
