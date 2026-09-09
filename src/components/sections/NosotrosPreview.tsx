import Link from "next/link"
import { Button } from "@/components/ui/Button"

const valores = [
  "Responsabilidad",
  "Calidad",
  "Innovación",
  "Confianza",
  "Profesionalismo",
  "Compromiso",
]

export default function NosotrosPreview() {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black leading-tight">
              CONSTRUIMOS PROYECTOS.<br />
              CREAMOS CONFIANZA.
            </h2>
            
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>
                <strong>SARA CONSTRUCTORA</strong> brinda soluciones integrales en Ingeniería Civil,
                Arquitectura, Construcción y Consultoría.
              </p>
              <p>
                Integramos conocimiento técnico, planificación, diseño e innovación
                para convertir las necesidades de nuestros clientes en proyectos
                funcionales, seguros y eficientes.
              </p>
              <p>
                Nuestro equipo participa en las diferentes etapas del proyecto,
                desde los estudios preliminares y el diseño hasta la planificación,
                ejecución y supervisión de obra.
              </p>
            </div>

            <div>
              <Button asChild variant="outline">
                <Link href="/nosotros">Conocer más sobre nosotros</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Abstract architectural element or image placeholder */}
            <div className="aspect-[4/5] bg-brand-dark relative overflow-hidden flex flex-col justify-end p-8 md:p-12">
              <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop')" }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
              
              <div className="relative z-10 space-y-8">
                <blockquote className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  “Una idea es el inicio.<br/>
                  <span className="text-brand-sage">Nosotros la convertimos en realidad.</span>”
                </blockquote>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-8">
                  {valores.map((valor, i) => (
                    <div key={i} className="flex items-center gap-2 text-white font-medium text-sm uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-brand-sage rounded-full" />
                      {valor}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
