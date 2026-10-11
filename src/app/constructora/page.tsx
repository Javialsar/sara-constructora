import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import HeroConstructora from "@/components/sections/HeroConstructora"
import ContactoSection from "@/components/sections/ContactoSection"

export default function ConstructoraLanding() {
  return (
    <div className="pt-20 pb-0 bg-white">

      {/* Hero Interactivo de Constructora con los proyectos rotativos */}
      <HeroConstructora />

      {/* Las imÃ¡genes de los proyectos y servicios inmediatamente despuÃ©s */}
      <div id="servicios">
        <Trayectoria />
      </div>
      <div id="proyectos">
        <ProyectosMarquesina />
      </div>
      <ProcesoTimeline />
      
      {/* Formulario de CotizaciÃ³n y Contacto integrado */}
      <ContactoSection />
    </div>
  )
}

