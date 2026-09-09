import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function NosotrosPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nosotros
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            CONSTRUIMOS PROYECTOS. CREAMOS CONFIANZA.
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
            <p>
              <strong>SARA CONSTRUCTORA</strong> brinda soluciones integrales en Ingeniería Civil,
              Arquitectura, Construcción y Consultoría en la ciudad de Cariamanga, provincia de Loja, y todo el Ecuador.
            </p>
            <p>
              Integramos conocimiento técnico, planificación, diseño e innovación
              para convertir las necesidades de nuestros clientes en proyectos
              funcionales, seguros y eficientes. Nuestro objetivo primordial es asegurar
              la máxima calidad en cada obra.
            </p>
            <p>
              Nuestro equipo participa en las diferentes etapas del proyecto,
              desde los estudios preliminares y el diseño hasta la planificación,
              ejecución y supervisión de obra, asegurando un acompañamiento completo al cliente.
            </p>
            
            <div className="pt-8">
              <Button asChild variant="primary">
                <Link href="/equipo">Conoce a Nuestro Equipo</Link>
              </Button>
            </div>
          </div>

          <div className="bg-gray-100 aspect-square relative flex flex-col items-center justify-center text-center p-8 border border-gray-200">
             <span className="text-gray-400 font-bold mb-4">[ FOTOGRAFÍA CORPORATIVA ]</span>
             <p className="text-sm text-gray-500 italic">"Una idea es el inicio. Nosotros la convertimos en realidad."</p>
          </div>
        </div>
      </div>
    </div>
  )
}
