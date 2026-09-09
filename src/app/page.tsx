import Hero from "@/components/sections/Hero"
import Trayectoria from "@/components/sections/Trayectoria"
import EditorialTransition from "@/components/sections/EditorialTransition"
import NosotrosPreview from "@/components/sections/NosotrosPreview"
import ProyectosDestacados from "@/components/sections/ProyectosDestacados"
import ServiciosPreview from "@/components/sections/ServiciosPreview"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"

export default function Home() {
  return (
    <>
      <Hero />
      <Trayectoria />
      <EditorialTransition />
      <ProyectosDestacados />
      <NosotrosPreview />
      <ServiciosPreview />
      <ProcesoTimeline />
    </>
  )
}
