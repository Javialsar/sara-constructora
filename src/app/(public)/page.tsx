import Hero from "@/components/sections/Hero"
import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import EditorialTransition from "@/components/sections/EditorialTransition"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"
import InmobiliariaAirbnbShowcase from "@/components/sections/InmobiliariaAirbnbShowcase"
import FAQ from "@/components/sections/FAQ"

export default function Home() {
  return (
    <>
      <Hero />
      <ProyectosMarquesina />
      <Trayectoria />
      <EditorialTransition />
      <InmobiliariaAirbnbShowcase />
      <ProcesoTimeline />
      <FAQ />
    </>
  )
}
