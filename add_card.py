import os

f = 'src/app/dashboard/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

c = c.replace('grid-cols-1 md:grid-cols-2 gap-6', 'grid-cols-1 md:grid-cols-3 gap-6')

constructora_card = """          {/* SARA Constructora */}
          <Link href="/" className="relative group overflow-hidden rounded-3xl shadow-lg border border-slate-200 block transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"></div>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Layers size={120} className="text-blue-400" />
            </div>
            <div className="relative p-8 flex flex-col h-full min-h-[220px]">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4 border border-blue-500/30">
                <Layers size={14} /> Diseño y Construcción
              </div>
              <h3 className="text-2xl font-black text-white mb-2">SARA Constructora</h3>
              <p className="text-slate-300 text-sm max-w-sm mb-6 flex-1">
                Servicios de arquitectura, ingeniería y ejecución de obra civil con los más altos estándares de calidad y tecnología.
              </p>
              <div className="flex items-center text-blue-400 font-bold text-sm group-hover:text-blue-300">
                Ver Proyectos y Servicios <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* SARA Inmobiliaria */}"""

c = c.replace('{/* SARA Inmobiliaria */}', constructora_card)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
