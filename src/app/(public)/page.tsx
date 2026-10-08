import Hero from "@/components/sections/Hero"
import ModulosSARA from "@/components/sections/ModulosSARA"
import ContactoSection from "@/components/sections/ContactoSection"

export default function Home() {
  return (
    <>
      {/* Banner Principal */}
      <Hero />
      {/* Grid del Ecosistema de Módulos SARA */}
      <ModulosSARA />
      {/* Sección Global de Contactos */}
      <ContactoSection />
    </>
  )
}
