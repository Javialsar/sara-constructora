import Hero from "@/components/sections/Hero"
import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import EditorialTransition from "@/components/sections/EditorialTransition"
import InmobiliariaAirbnbShowcase from "@/components/sections/InmobiliariaAirbnbShowcase"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import FAQ from "@/components/sections/FAQ"
import ModulosSARA from "@/components/sections/ModulosSARA"

export default function Home() {
  return (
    <>
      {/* Banner Principal con carrusel dinámico: 1. Constructora, 2. Airbnb, 3. Inmobiliaria */}
      <Hero />
      <ModulosSARA />


      {/* Luego todos los proyectos como están */}
      <ProyectosMarquesina />
      <Trayectoria />
      <EditorialTransition />
      <InmobiliariaAirbnbShowcase />
      <ProcesoTimeline />
      <FAQ />
    </>
  )
}
