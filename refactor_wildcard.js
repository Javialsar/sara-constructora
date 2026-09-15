const fs = require('fs');
let code = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');

const dash_regex = /<h3 className="text-sm tracking-widest text-gray-500 uppercase font-bold mb-2">M[\s\S]*?2: Proyecc[\s\S]*? de Obra<\/h3>[\s\S]*?<div className="font-bold text-gray-700 border-b pb-2 mb-2">Desglose de Ensambles y Extras<\/div>/;

const new_dash = `<h3 className="text-sm tracking-widest text-gray-500 uppercase font-bold mb-2">Módulo 2: Proyección Paramétrica de Obra</h3>
                  <p className="text-xs text-gray-400 mb-4">Estimador referencial (Orden de magnitud) previo al Análisis de Precios Unitarios (APUs).</p>
                  
                  <div className="text-3xl font-extrabold text-brand-dark mb-1">
                    \${resultados?.costoObra.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </div>
                  <p className="text-sm font-bold text-brand-sage mb-4 uppercase">Gran Total (Incluye Obra, Extras y Ensambles)</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">Costo Base Referencial:</span>
                      <span className="font-medium">\${params?.costo_base_construccion_m2} / m²</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">Ajuste por Topografía ({cotizacion.pendiente}):</span>
                      <span className="font-medium">x {cotizacion.pendiente === 'plana' ? params?.factor_pendiente_plana : cotizacion.pendiente === 'media' ? params?.factor_pendiente_media : params?.factor_pendiente_fuerte}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ajuste por Calidad de Acabados ({cotizacion.acabados}):</span>
                      <span className="font-medium">x {cotizacion.acabados === 'economico' ? params?.factor_acabados_economico : cotizacion.acabados === 'estandar' ? params?.factor_acabados_estandar : params?.factor_acabados_premium}</span>
                    </div>
                      <div className="flex justify-between border-t border-gray-200 mt-2 pt-2">
                        <span className="text-gray-500">Tipo de Suelo ({cotizacion.suelo}):</span>
                        <span className="font-medium">x {cotizacion.suelo === 'normal' ? (params?.factor_suelo_normal || 1) : cotizacion.suelo === 'blando' ? (params?.factor_suelo_blando || 1.15) : (params?.factor_suelo_rocoso || 1.05)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Logística de Acceso ({cotizacion.accesibilidad}):</span>
                        <span className="font-medium">x {cotizacion.accesibilidad === 'urbana' ? (params?.factor_acceso_urbano || 1) : (params?.factor_acceso_rural || 1.08)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Niveles/Pisos ({cotizacion.pisos} pisos):</span>
                        <span className="font-medium">x {cotizacion.pisos === '1' ? (params?.factor_pisos_1 || 1.05) : cotizacion.pisos === '2' ? (params?.factor_pisos_2 || 1) : (params?.factor_pisos_3 || 1.02)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sistema Estructural ({cotizacion.estructura}):</span>
                        <span className="font-medium">x {cotizacion.estructura === 'hormigon' ? (params?.factor_estructura_hormigon || 1) : (params?.factor_estructura_metalica || 1.15)}</span>
                      </div>
                      
                      <div className="flex justify-between border-t border-gray-300 pt-3 mt-3 font-bold text-gray-800">
                        <span>Subtotal Obra Gris y Acabados Base:</span>
                        <span>\${resultados?.desgloseObra?.base?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                  </div>
                </div>
                
  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 mt-4">
                      <div className="font-bold text-gray-700 border-b pb-2 mb-2">Desglose de Ensambles y Extras</div>`;

code = code.replace(dash_regex, new_dash);
fs.writeFileSync('src/app/admin/cotizador/page.tsx', code, 'utf8');
