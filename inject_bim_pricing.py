import os

f = 'src/app/dashboard/planes/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

target = """                <ul className="space-y-4 mb-8">
                  {plan.caracteristicas.map((ben: string, i: number) => ("""

replacement = """                <ul className="space-y-4 mb-8">
                  {/* FEATURE ESTRELLA B.I.M. (Solo para planes de pago) */}
                  {plan.precio > 0 && (
                    <li className={`flex items-start gap-3 text-sm font-bold ${isRecommended ? 'text-amber-300' : 'text-amber-600'}`}>
                      <Check className={`shrink-0 ${isRecommended ? 'text-amber-400' : 'text-amber-500'}`} size={16} /> 
                      <span className="flex flex-col">
                        Integración BIM (Revit/AutoCAD)
                        <span className="text-[10px] font-normal uppercase tracking-widest opacity-80">Cuantificación 3D Automatizada</span>
                      </span>
                    </li>
                  )}
                  {plan.caracteristicas.map((ben: string, i: number) => ("""

c = c.replace(target, replacement)
with open(f, 'w', encoding='utf-8') as file: file.write(c)
