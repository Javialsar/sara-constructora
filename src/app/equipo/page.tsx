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

export default function EquipoPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nuestro Equipo
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            PROFESIONALES QUE CONSTRUYEN CONFIANZA.
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {equipo.map((miembro, i) => (
            <div key={i} className="bg-white border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-brand-dark/10 relative overflow-hidden">
                 {/* Fotografía profesional placeholder */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Foto Profesional</span>
                 </div>
                 <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors" />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-brand-dark text-lg mb-1">{miembro.nombre}</h3>
                <p className="text-brand-sage font-bold text-xs tracking-widest uppercase mb-4">{miembro.cargo}</p>
                <div className="pt-4 border-t border-gray-100 flex justify-center">
                  <a href={`https://wa.me/${miembro.link}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-dark font-medium transition-colors">
                    <Phone size={16} className="text-brand-sage" />
                    {miembro.telefono}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
