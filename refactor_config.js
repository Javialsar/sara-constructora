const fs = require('fs');
let code = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');

const regex_form = /<form onSubmit=\{handleSaveParams\}>[\s\S]*?<\/form>/;

const new_form = `<form onSubmit={handleSaveParams}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Tarifas Diseño */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Consultoría y Diseño</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Arquitectura Ejecutivo ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_arq_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_arq_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Diseño Estructural ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_est_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_est_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Estudio Geotecnia (Costo Fijo)</label>
                    <input type="number" step="1" value={params?.tarifa_geotecnia || 0} onChange={e => setParams({...params, tarifa_geotecnia: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Diseño Eléctrico ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_elec_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_elec_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Diseño Hídrico ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_hidro_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_hidro_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Topografía (Costo Fijo Base)</label>
                    <input type="number" step="1" value={params?.tarifa_topografia_base || 0} onChange={e => setParams({...params, tarifa_topografia_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                </div>
  
                {/* Estimador Obra */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Obra Base e Impuestos</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Costo Construcción Base ($/m²)</label>
                    <input type="number" step="1" value={params?.costo_base_construccion_m2 || 0} onChange={e => setParams({...params, costo_base_construccion_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                    <p className="text-xs text-gray-400 mt-1">Este valor base se multiplica por los factores.</p>
                  </div>
  
                  <div className="pt-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Porcentaje IVA (%)</label>
                    <input type="number" step="0.1" value={params?.porcentaje_iva_base || 15} onChange={e => setParams({...params, porcentaje_iva_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  
                  <h3 className="font-bold border-b pb-2 mt-8 text-brand-dark">Factores Terreno (x)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pendiente Plana</label>
                      <input type="number" step="0.01" value={params?.factor_pendiente_plana || 1} onChange={e => setParams({...params, factor_pendiente_plana: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pend. Media</label>
                      <input type="number" step="0.01" value={params?.factor_pendiente_media || 1.15} onChange={e => setParams({...params, factor_pendiente_media: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pend. Fuerte</label>
                      <input type="number" step="0.01" value={params?.factor_pendiente_fuerte || 1.35} onChange={e => setParams({...params, factor_pendiente_fuerte: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                </div>
  
                {/* Factores Acabados */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Multiplicadores de Arquitectura</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Acab. Económico</label>
                      <input type="number" step="0.01" value={params?.factor_acabados_economico || 0.85} onChange={e => setParams({...params, factor_acabados_economico: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Acab. Estándar</label>
                      <input type="number" step="0.01" value={params?.factor_acabados_estandar || 1.00} onChange={e => setParams({...params, factor_acabados_estandar: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Acab. Premium</label>
                      <input type="number" step="0.01" value={params?.factor_acabados_premium || 1.40} onChange={e => setParams({...params, factor_acabados_premium: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Suelo Normal</label>
                      <input type="number" step="0.01" value={params?.factor_suelo_normal || 1.00} onChange={e => setParams({...params, factor_suelo_normal: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Suelo Blando</label>
                      <input type="number" step="0.01" value={params?.factor_suelo_blando || 1.15} onChange={e => setParams({...params, factor_suelo_blando: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Estr. Hormigón</label>
                      <input type="number" step="0.01" value={params?.factor_estructura_hormigon || 1.00} onChange={e => setParams({...params, factor_estructura_hormigon: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Estr. Metálica</label>
                      <input type="number" step="0.01" value={params?.factor_estructura_metalica || 1.15} onChange={e => setParams({...params, factor_estructura_metalica: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                </div>
                
                {/* Tarifas Ensambles Fijos */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Tarifas de Ensambles Extras ($)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Dorm. Master</label>
                      <input type="number" step="1" value={params?.costo_extra_master || 0} onChange={e => setParams({...params, costo_extra_master: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Baño Completo</label>
                      <input type="number" step="1" value={params?.costo_extra_bano_completo || 0} onChange={e => setParams({...params, costo_extra_bano_completo: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Medio Baño</label>
                      <input type="number" step="1" value={params?.costo_extra_medio_bano || 0} onChange={e => setParams({...params, costo_extra_medio_bano: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Lavandería</label>
                      <input type="number" step="1" value={params?.costo_extra_lavanderia || 0} onChange={e => setParams({...params, costo_extra_lavanderia: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Cisterna Subt.</label>
                      <input type="number" step="1" value={params?.costo_extra_cisterna || 0} onChange={e => setParams({...params, costo_extra_cisterna: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Piscina Base</label>
                      <input type="number" step="1" value={params?.costo_extra_piscina || 0} onChange={e => setParams({...params, costo_extra_piscina: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Garaje (Desc)</label>
                      <input type="number" step="1" value={params?.costo_extra_garaje_descubierto || 0} onChange={e => setParams({...params, costo_extra_garaje_descubierto: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Clima (Splits)</label>
                      <input type="number" step="1" value={params?.costo_extra_clima_splits || 0} onChange={e => setParams({...params, costo_extra_clima_splits: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                </div>

            </div>
            
            <div className="mt-8 pt-6 border-t flex justify-end">
              <button type="submit" disabled={savingParams} className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-2">
                <CheckCircle2 size={18} /> {savingParams ? "Guardando..." : "Guardar Parámetros Globales"}
              </button>
            </div>
          </form>`;

code = code.replace(regex_form, new_form);

fs.writeFileSync('src/app/admin/cotizador/page.tsx', code, 'utf8');
