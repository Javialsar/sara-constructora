import Hero from "@/components/sections/Hero"
import HomeAirbnbSection from "@/components/sections/HomeAirbnbSection"
import HomeInmobiliariaSection from "@/components/sections/HomeInmobiliariaSection"
import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import EditorialTransition from "@/components/sections/EditorialTransition"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import FAQ from "@/components/sections/FAQ"

export default function Home() {
  return (
    <>
      {/* 1. Imagen 1: Hero Principal SARA Constructora */}
      <Hero />

      {/* 2. Imagen 2: Sección SARA Airbnb */}
      <HomeAirbnbSection />

      {/* 3. Imagen 3: Sección SARA Inmobiliaria */}
      <HomeInmobiliariaSection />

      {/* 4. Luego sí todos los proyectos como están */}
      <ProyectosMarquesina />
      <Trayectoria />
      <EditorialTransition />
      <ProcesoTimeline />
      <FAQ />
    </>
  )
}
