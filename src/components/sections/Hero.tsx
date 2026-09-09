import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { MapPin } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-brand-dark">
      {/* Background Image/Render overlay placeholder */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop')" }}
      />
      
      {/* Gradient overlay to ensure text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-transparent" />

      <div className="container relative z-20 mx-auto px-4 md:px-8">
        <div className="max-w-4xl space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-brand-sage font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
              Ingeniería · Arquitectura · Construcción · Consultoría
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight">
              DISEÑAMOS IDEAS.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sage to-white">
                CONSTRUIMOS FUTURO.
              </span>
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed font-medium">
            Transformamos ideas en proyectos funcionales, seguros y de calidad, integrando arquitectura, ingeniería y construcción desde la planificación hasta la ejecución.
          </p>

          <div className="flex items-center gap-2 text-brand-sage font-medium pb-4">
            <MapPin size={18} />
            <span>Cariamanga – Loja – Ecuador</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contacto">Solicitar Cotización</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white hover:text-brand-dark" asChild>
              <Link href="/proyectos">Conocer Proyectos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
