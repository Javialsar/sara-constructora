const proceso = [
  { id: "01", title: "CONVERSAMOS", desc: "Entendemos tu idea, necesidades y objetivos." },
  { id: "02", title: "ANALIZAMOS", desc: "Estudiamos las condiciones y requerimientos del proyecto." },
  { id: "03", title: "DISEÑAMOS", desc: "Convertimos las necesidades en una solución arquitectónica y técnica." },
  { id: "04", title: "PLANIFICAMOS", desc: "Definimos recursos, presupuesto, tiempos y procesos." },
  { id: "05", title: "CONSTRUIMOS", desc: "Ejecutamos con seguimiento profesional." },
  { id: "06", title: "ENTREGAMOS", desc: "Verificamos el cumplimiento de lo planificado." },
]

export default function ProcesoTimeline() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-4">Nuestro Proceso</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-brand-dark">CÓMO LO HACEMOS</h3>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:block relative">
          {/* Main Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -translate-y-1/2" />
          
          <div className="grid grid-cols-6 gap-4 relative z-10">
            {proceso.map((step, i) => (
              <div key={step.id} className="relative group">
                <div className="flex flex-col items-center">
                  <div className={`mb-8 w-full px-4 text-center transition-all duration-500 ${i % 2 === 0 ? 'opacity-100' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                    {i % 2 === 0 && (
                      <>
                        <h4 className="font-bold text-brand-dark mb-2 tracking-wide">{step.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                      </>
                    )}
                  </div>

                  {/* Node */}
                  <div className="w-4 h-4 bg-white border-2 border-brand-sage rounded-full z-10 relative group-hover:bg-brand-sage group-hover:scale-150 transition-all duration-300">
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 font-mono text-xl font-light text-brand-sage/50">{step.id}</span>
                  </div>

                  <div className={`mt-8 w-full px-4 text-center transition-all duration-500 ${i % 2 !== 0 ? 'opacity-100' : 'opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                    {i % 2 !== 0 && (
                      <>
                        <h4 className="font-bold text-brand-dark mb-2 tracking-wide">{step.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden max-w-sm mx-auto relative pl-8">
          <div className="absolute top-0 bottom-0 left-3 w-[2px] bg-gray-200" />
          
          <div className="space-y-12 relative z-10">
            {proceso.map((step) => (
              <div key={step.id} className="relative">
                <div className="absolute -left-[37px] top-1 w-4 h-4 bg-white border-2 border-brand-sage rounded-full" />
                <span className="block font-mono text-xl font-light text-brand-sage mb-1">{step.id}</span>
                <h4 className="font-bold text-brand-dark mb-2 tracking-wide text-lg">{step.title}</h4>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  )
}
