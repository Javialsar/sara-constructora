const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

const mappingBlockStartStr = '{["basico", "destacado", "premium"].map((planStr) => {';
const startIdx = content.indexOf(mappingBlockStartStr);
if (startIdx !== -1) {
  // Find where it ends
  const endIdxStr = '</div>\n                  </div>\n\n                  {/* Detalle de Facturación */}';
  let endIdx = content.indexOf('</div>\n                  </div>\n\n                  {/* Detalle de Facturación */}');
  
  // If exact match fails, let's try a regex
  if (endIdx === -1) {
    const regexEnd = /\{\/\* Detalle de Facturación \*\/\}/;
    const match = content.match(regexEnd);
    if (match) {
      endIdx = match.index;
    }
  }

  if (endIdx !== -1) {
    const replacement = `{["basico", "destacado", "premium"].map((planStr) => {
                      const plan = planStr as "basico" | "destacado" | "premium"
                      const cfgPlan = planesConfig.planes[plan]
                      const isActive = formInmueble.planPromocion === plan
                      const colores = { basico: "bg-gray-50 border-gray-200 hover:border-gray-400", destacado: "bg-emerald-50 border-emerald-300 hover:border-emerald-500", premium: "bg-amber-50 border-amber-300 hover:border-amber-500" }
                      
                      return (
                        <div
                          key={plan}
                          onClick={() => setFormInmueble({ ...formInmueble, planPromocion: plan, tarifaMensual: cfgPlan.precioMensual })}
                          className={\`p-4 rounded-xl border-2 cursor-pointer transition-all relative \${colores[plan]} \${isActive ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''}\`}
                        >
                          {isActive && <div className="absolute top-2 right-2"><CheckCircle2 size={18} className="text-emerald-600" /></div>}
                          <h5 className="font-black text-gray-900 uppercase text-sm mb-1">{cfgPlan.nombre}</h5>
                          <p className="text-xl font-black text-gray-800 mb-2">\${cfgPlan.precioMensual}<span className="text-xs text-gray-500 font-medium">/mes</span></p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {cfgPlan.beneficios.map((ben, bidx) => (
                              <li key={bidx} className="flex items-start gap-1"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5"/> <span className="leading-tight">{ben}</span></li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>

                  {/* Información de Comisiones Dinámica */}
                  <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
                    <h5 className="font-bold mb-2 flex items-center gap-2">
                      <Percent size={16} className="text-indigo-600" />
                      Acuerdo de Corretaje ({formInmueble.modalidad === 'venta' ? 'Venta' : 'Arriendo'})
                    </h5>
                    {formInmueble.modalidad === 'venta' ? (
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Comisión Base:</strong> {planesConfig.comisiones.comisionVentaDefault}%</li>
                        <li><strong>Rango permitido:</strong> {planesConfig.comisiones.comisionVentaMin}% al {planesConfig.comisiones.comisionVentaMax}%</li>
                        <li><strong>Exclusividad:</strong> {planesConfig.comisiones.comisionVentaExclusiva}% (Si aplicara)</li>
                        <li>{planesConfig.comisiones.descripcionVenta}</li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Modalidad de cobro:</strong> {planesConfig.comisiones.tipoComisionArriendo === 'primer_canon' ? 'Primer Canon' : 'Porcentaje'}</li>
                        {planesConfig.comisiones.tipoComisionArriendo === 'primer_canon' ? (
                          <li><strong>Honorarios:</strong> {planesConfig.comisiones.porcentajePrimerMes}% del primer mes de arriendo</li>
                        ) : (
                          <li><strong>Honorarios:</strong> {planesConfig.comisiones.comisionArriendoPorcentaje}%</li>
                        )}
                        <li>{planesConfig.comisiones.descripcionArriendo}</li>
                      </ul>
                    )}
                  </div>\n\n                  `;
    
    // We replace everything between startIdx and endIdx
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
    console.log('Successfully replaced Tab 5 mappings!');
  } else {
    console.log('Could not find end index!');
  }
} else {
  console.log('Could not find start index!');
}
