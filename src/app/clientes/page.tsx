export default function ClientesPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nuestros Clientes
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            LA CONFIANZA DETRÁS DE CADA PROYECTO.
          </h2>
        </header>

        <section className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-video bg-gray-50 border border-gray-100 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                <span className="font-bold text-gray-400 text-sm tracking-widest uppercase">Cliente {item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-dark text-white py-16 -mx-4 md:-mx-8 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
             <header className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase text-brand-sage">
                Testimonios
              </h2>
              <p className="text-gray-300">Lo que nuestros clientes dicen de nosotros.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/5 border border-white/10 p-6 relative">
                  <div className="text-brand-sage text-4xl font-serif absolute top-4 right-4 opacity-50">"</div>
                  <p className="text-gray-300 italic mb-6 relative z-10 text-sm leading-relaxed">
                    "Un trabajo excepcional desde la planificación hasta la entrega. Cumplieron con los tiempos y el presupuesto establecido."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-sage/20 rounded-full" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Nombre del Cliente {item}</h4>
                      <p className="text-xs text-gray-400">Proyecto Residencial</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
