import Hero from "@/components/sections/Hero"
import EditorialTransition from "@/components/sections/EditorialTransition"
import NosotrosPreview from "@/components/sections/NosotrosPreview"
import ServiciosPreview from "@/components/sections/ServiciosPreview"
import ProcesoTimeline from "@/components/sections/ProcesoTimeline"

export default function Home() {
  return (
    <>
      <Hero />
      <EditorialTransition />
      <NosotrosPreview />
      <ServiciosPreview />
      <ProcesoTimeline />
    </>
  )
}
