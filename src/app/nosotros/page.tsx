import { Phone } from "lucide-react"

const equipo = [
  {
    nombre: "ING. JAVIER SARANGO GAONA",
    cargo: "GERENTE GENERAL",
    telefono: "098 180 4023",
    link: "593981804023"
  },
  {
    nombre: "ING. KEVIN JAVIER SARANGO",
    cargo: "INGENIERO CIVIL",
    telefono: "+593 99 186 7021",
    link: "593991867021"
  },
  {
    nombre: "ARQ. DAVID SARANGO",
    cargo: "ARQUITECTO",
    telefono: "+593 96 290 5439",
    link: "593962905439"
  }
]

export default function NosotrosPage() {
  return (
    <div className="pt-28 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Sección: Quiénes Somos */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Nosotros
          </h1>
          <h2 className="text-xl md:text-2xl text-brand-sage font-bold tracking-widest max-w-3xl">
            CONSTRUIMOS PROYECTOS. CREAMOS CONFIANZA.
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="space-y-8 text-gray-600 text-lg leading-relaxed font-light">
            <p>
              <strong className="font-bold text-brand-dark">SARA CONSTRUCTORA</strong> brinda soluciones integrales en Ingeniería Civil,
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
          </div>

          <div className="bg-gray-200 aspect-[4/3] relative flex flex-col items-center justify-center text-center p-8 overflow-hidden group">
             <div 
               className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=1200')" }}
             />
             <div className="absolute inset-0 bg-brand-dark/40" />
             <div className="relative z-10">
               <p className="text-xl text-white font-medium italic mb-2 tracking-wide">"Una idea es el inicio. Nosotros la convertimos en realidad."</p>
               <div className="w-12 h-px bg-brand-sage mx-auto mt-4" />
             </div>
          </div>
        </div>

        {/* Sección: Nuestro Equipo */}
        <div className="pt-16 border-t border-gray-200">
          <header className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
              Nuestro Equipo
            </h2>
            <p className="text-brand-sage font-bold tracking-widest text-sm uppercase">
              Profesionales comprometidos con la excelencia
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {equipo.map((miembro, i) => (
              <div key={i} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                   {/* Fotografía profesional placeholder */}
                   <div 
                     className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                     style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600')" }} // Generic placeholder for professionals
                   />
                   <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-brand-dark text-lg mb-1 tracking-tight">{miembro.nombre}</h3>
                  <p className="text-brand-sage font-bold text-xs tracking-widest uppercase mb-4">{miembro.cargo}</p>
                  <div className="pt-4 border-t border-gray-100 flex justify-center">
                    <a href={`https://wa.me/${miembro.link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-sage font-medium transition-colors">
                      <Phone size={16} />
                      {miembro.telefono}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
