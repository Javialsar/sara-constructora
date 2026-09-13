export default function EditorialTransition() {
  return (
    <section className="py-12 md:py-20 bg-white flex items-center justify-center relative overflow-hidden">
      {/* Decorative architectural grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-brand-black leading-tight tracking-tight mb-6">
          “DE LA PRIMERA LÍNEA <br />
          <span className="text-brand-dark">AL ÚLTIMO DETALLE.”</span>
        </h2>
        <div className="w-16 h-1 bg-brand-sage mx-auto mb-6" />
        <p className="text-lg md:text-2xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
          Integramos arquitectura, ingeniería y construcción para desarrollar
          soluciones coherentes desde el concepto inicial hasta la obra.
        </p>
      </div>
    </section>
  )
}
