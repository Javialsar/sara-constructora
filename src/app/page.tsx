import Hero from "@/components/sections/Hero"
import ProyectosMarquesina from "@/components/sections/ProyectosMarquesina"
import Trayectoria from "@/components/sections/Trayectoria"
import EditorialTransition from "@/components/sections/EditorialTransition"
import NosotrosPreview from "@/components/sections/NosotrosPreview"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"

export default function Home() {
  return (
    <>
      <Hero />
      <ProyectosMarquesina />
      <Trayectoria />
      <EditorialTransition />
      <NosotrosPreview />
      <ProcesoTimeline />
    </>
  )
}
