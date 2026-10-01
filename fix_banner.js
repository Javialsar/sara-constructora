const fs = require('fs');
const file = 'src/app/(public)/inmobiliaria/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldSection = `      <section className="container mx-auto px-4 md:px-8 mt-20">
        <div className="bg-gradient-to-r from-[#07130d] via-[#10291d] to-[#07130d] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <HardHat size={14} /> Sinergia Exclusiva SARA
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
              ¿Compraste tu terreno con nosotros? Te construimos tu casa a tu medida.
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              A diferencia de las agencias tradicionales, en SARA no solo te entregamos las escrituras de tu lote: nuestro equipo de ingeniería y arquitectura diseña los planos, calcula el presupuesto exacto sin sobrecostos y construye tu residencia llave en mano.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href="/contacto" 
                className="px-5 py-3 rounded-xl bg-brand-sage text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2"
              >
                Solicitar Cotización de Construcción <ArrowRight size={15} />
              </Link>
              <Link 
                href="/proyectos" 
                className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all border border-white/20"
              >
                Ver Obras Entregadas
              </Link>
            </div>
          </div>
        </div>
      </section>`;

const newSection = `      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-20">
        <div className="bg-gradient-to-r from-[#07130d] via-[#10291d] to-[#07130d] rounded-[2rem] text-white shadow-xl relative overflow-hidden border border-emerald-900/40 flex flex-col lg:flex-row items-stretch justify-between">
          
          {/* Columna Izquierda: Texto */}
          <div className="flex-1 p-8 md:p-12 lg:py-16 lg:pl-16 max-w-3xl relative z-10 flex flex-col justify-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-5">
                <HardHat size={14} /> Sinergia Exclusiva SARA
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-5 leading-tight text-white">
                ¿Compraste tu terreno con nosotros? <span className="text-brand-sage">Te construimos tu casa.</span>
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                A diferencia de agencias tradicionales, en SARA no solo te entregamos las escrituras. Nuestro equipo de ingeniería y arquitectura diseña los planos, calcula el presupuesto exacto sin sobrecostos, y construye tu residencia llave en mano.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  href="/contacto" 
                  className="px-6 py-3.5 rounded-xl bg-brand-sage text-white font-bold text-xs md:text-sm uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2"
                >
                  Cotizar Construcción <ArrowRight size={16} />
                </Link>
                <Link 
                  href="/proyectos" 
                  className="px-6 py-3.5 rounded-xl bg-white/5 text-white font-bold text-xs md:text-sm uppercase tracking-wider hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md"
                >
                  Ver Obras
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Imagen */}
          <div className="hidden lg:block lg:w-5/12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#10291d] via-[#10291d]/80 to-transparent z-10 w-40" />
            <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-t from-[#07130d] to-transparent z-10 h-32 mt-auto" />
            <img 
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
              alt="Arquitectura y Construcción"
              className="w-full h-full object-cover object-center opacity-80"
            />
          </div>
        </div>
      </section>`;

if (content.includes(oldSection)) {
  content = content.replace(oldSection, newSection);
  fs.writeFileSync(file, content);
  console.log('Replaced banner successfully!');
} else {
  console.log('Could not find the exact old banner text.');
}
