const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const tab4Replacement = `              {modalSubTab === 4 && (
                <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <ShieldCheck size={15} className="text-brand-sage" />
                      Verificar Legalidad del Inmueble
                    </h4>
                    
                    <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-xl border border-blue-200 flex items-start gap-2">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p>Revisa la documentación subida por el cliente. Si todo es correcto, aprueba la validación y notifícale para que proceda con el pago.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'escrituraPublica', label: 'Escritura Pública' },
                        { key: 'certificadoGravamenes', label: 'Certificado de Gravámenes' },
                        { key: 'pagoImpuestos', label: 'Pago de Impuestos Prediales' },
                        { key: 'cedulaPropietario', label: 'Cédula del Propietario' }
                      ].map(doc => (
                        <div key={doc.key} className="space-y-3 bg-white p-3 rounded-xl border border-gray-100">
                          <label className="block text-xs font-bold text-gray-700">{doc.label}</label>
                          <div className="flex items-center gap-2">
                            {(formInmueble.legalidad as any)?.[doc.key] ? (
                              <a href={(formInmueble.legalidad as any)[doc.key]} target="_blank" rel="noreferrer" className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-200">
                                <Eye size={14} /> Ver Documento Subido
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No subido por el cliente</span>
                            )}
                          </div>
                          {/* Admin can override/upload if needed */}
                          <div className="mt-2">
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    setFormInmueble(prev => ({ ...prev, legalidad: { ...prev.legalidad, [doc.key]: evt.target?.result as string } }))
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones de Verificación</label>
                      <textarea
                        rows={3}
                        value={formInmueble.legalidad?.observaciones || ''}
                        onChange={(e) => setFormInmueble(prev => ({ ...prev, legalidad: { ...prev.legalidad, observaciones: e.target.value } }))}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs"
                        placeholder="Ej: Falta firma en la página 3, o los linderos no coinciden..."
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex flex-col md:flex-row gap-6 items-start md:items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-700 mb-2">1. Dictamen de Revisión Legal</label>
                        <div className="flex gap-3">
                          {(['pendiente', 'aprobado', 'rechazado'] as const).map(estado => (
                            <button
                              key={estado}
                              type="button"
                              onClick={() => {
                                setFormInmueble(prev => ({ 
                                  ...prev, 
                                  estado: estado === 'aprobado' ? 'aprobado' : prev.estado,
                                  legalidad: { ...prev.legalidad, estado } 
                                }))
                              }}
                              className={\`px-4 py-2 flex-1 text-center rounded-xl text-xs font-bold capitalize border transition-all \${
                                formInmueble.legalidad?.estado === estado
                                  ? estado === 'aprobado' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
                                  : estado === 'rechazado' ? 'bg-red-100 text-red-800 border-red-300 shadow-sm'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
                                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }\`}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-700 mb-2">2. Notificar al Cliente</label>
                        <a
                          href={\`https://wa.me/\${formInmueble.propietario?.telefono?.replace(/[^0-9]/g, '') || ''}?text=\${encodeURIComponent(\`Hola \${formInmueble.propietario?.nombre || 'Propietario'},\\n\\nHemos finalizado la revisión legal de tu inmueble *"\${formInmueble.titulo}"* (Cód: \${formInmueble.codigo}).\\n\\n*Estado:* \${formInmueble.legalidad?.estado === 'aprobado' ? '✅ APROBADO' : formInmueble.legalidad?.estado === 'rechazado' ? '❌ RECHAZADO' : '⏳ PENDIENTE'}\\n\${formInmueble.legalidad?.observaciones ? \`*Observaciones:* \${formInmueble.legalidad.observaciones}\\n\\n\` : ''}\${formInmueble.legalidad?.estado === 'aprobado' ? \`*Siguiente paso:* Ya puedes ingresar a SARA Portal, ir a "Mis Propiedades", presionar el botón amarillo "Pagar Plan" y subir tu comprobante de depósito por el valor de $\${((formInmueble.promocion?.tarifaMensual || 0) * (formInmueble.mesesContratados || 1) * (1 - (formInmueble.descuentoPorcentaje || 0)/100) * 1.15).toFixed(2)} para activar la publicación oficial.\\n\\nIngresa aquí: https://sara-constructora.vercel.app/inmobiliaria/mi-portal\` : 'Por favor revisa las observaciones.'}\\n\\nAtte. Equipo SARA Inmobiliaria\`)}\`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all h-9"
                        >
                          <MessageCircle size={15} />
                          Notificar por WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

const startIndex = content.indexOf('{modalSubTab === 4 && (');
const endIndex = content.indexOf('{modalSubTab === 5 && (');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + tab4Replacement + '\n              {/* =================================================== */}\n              {/* SUB-VIÑETA 5: TIPO DE PLAN & COBRO DE MONETIZACIÓN   */}\n              {/* =================================================== */}\n              ' + content.substring(endIndex);
  fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
  console.log('Replaced Tab 4!');
} else {
  console.log('Could not find Tab 4 or 5 bounds');
}
