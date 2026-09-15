const fs = require('fs');
let code = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');

const regex = /\{\/\* Par[á\?a]metros de Terreno y Obra \*\/\}\s*<div className="pt-4 border-t border-gray-100">[\s\S]*?<div className="pt-4 border-t">/g;

const ui_phases = `              {/* FASE 1: CONDICIONANTES DEL SITIO Y ESTRUCTURA */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-brand-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <label className="text-md font-bold text-gray-800">Condicionantes del Sitio y Estructura</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Topografía</label>
                    <select value={cotizacion.pendiente} onChange={e => setCotizacion({...cotizacion, pendiente: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="plana">Plana (< 5%)</option>
                      <option value="media">Media (5% - 20%)</option>
                      <option value="fuerte">Fuerte (> 20%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipo de Suelo</label>
                    <select value={cotizacion.suelo} onChange={e => setCotizacion({...cotizacion, suelo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="normal">Normal (Estándar)</option>
                      <option value="blando">Arcilloso/Blando (+15%)</option>
                      <option value="rocoso">Rocoso/Duro (+5%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Accesibilidad</label>
                    <select value={cotizacion.accesibilidad} onChange={e => setCotizacion({...cotizacion, accesibilidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="urbana">Urbana (Normal)</option>
                      <option value="rural">Rural/Remoto (+8%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Niveles / Pisos</label>
                    <select value={cotizacion.pisos} onChange={e => setCotizacion({...cotizacion, pisos: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="1">1 Planta (+5%)</option>
                      <option value="2">2 Plantas (Óptimo)</option>
                      <option value="3_mas">3 o más Plantas (+2%)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Sistema Estructural</label>
                    <select value={cotizacion.estructura} onChange={e => setCotizacion({...cotizacion, estructura: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="hormigon">Hormigón Armado</option>
                      <option value="metalica">Estruct. Metálica (+15%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FASE 2: ARQUITECTURA Y DISTRIBUCIÓN */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-brand-sage text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <label className="text-md font-bold text-gray-800">Arquitectura y Distribución</label>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gama de Acabados</label>
                  <select value={cotizacion.acabados} onChange={e => setCotizacion({...cotizacion, acabados: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-white border-l-4 border-l-brand-sage">
                    <option value="economico">Económico / Social</option>
                    <option value="estandar">Estándar / Comercial</option>
                    <option value="premium">Premium / Lujo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DORM. MASTER</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosMaster: Math.max(0, cotizacion.cuartosMaster - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.cuartosMaster} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosMaster: cotizacion.cuartosMaster + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DORM. ESTÁNDAR</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosNormales: Math.max(0, cotizacion.cuartosNormales - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.cuartosNormales} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosNormales: cotizacion.cuartosNormales + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">BAÑOS COMPL.</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, banosCompletos: Math.max(0, cotizacion.banosCompletos - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.banosCompletos} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, banosCompletos: cotizacion.banosCompletos + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">MEDIOS BAÑOS</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, mediosBanos: Math.max(0, cotizacion.mediosBanos - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.mediosBanos} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, mediosBanos: cotizacion.mediosBanos + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipo de Cocina</label>
                    <select value={cotizacion.cocina} onChange={e => setCotizacion({...cotizacion, cocina: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="cerrada">Cerrada Tradicional</option>
                      <option value="abierta">Abierta con Isla (+)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-2 w-full border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input type="checkbox" checked={cotizacion.lavanderia} onChange={e => setCotizacion({...cotizacion, lavanderia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                      <span className="font-bold text-sm text-gray-700">Incluir Cuarto Lavandería</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* FASE 3: EXTERIORES Y EQUIPAMIENTO */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <label className="text-md font-bold text-gray-800">Obras Exteriores y Equipamiento</label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cerramiento Perimetral (m)</label>
                    <input type="number" min="0" value={cotizacion.cerramientoMl} onChange={e => setCotizacion({...cotizacion, cerramientoMl: Number(e.target.value)})} placeholder="Ej: 40" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Garaje / Estacionamiento</label>
                    <select value={cotizacion.garaje} onChange={e => setCotizacion({...cotizacion, garaje: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="ninguno">Ninguno / Solo Huellas</option>
                      <option value="descubierto">Piso Descubierto (+)</option>
                      <option value="cubierto">Losa Cubierta (++)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Climatización</label>
                    <select value={cotizacion.climatizacion} onChange={e => setCotizacion({...cotizacion, climatizacion: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="ninguna">Pre-instalación (Ductos)</option>
                      <option value="splits">Equipos Splits (+)</option>
                      <option value="central">Aire Centralizado (++)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 justify-center pt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={cotizacion.cisterna} onChange={e => setCotizacion({...cotizacion, cisterna: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                      <span className="font-bold text-sm text-gray-700">Cisterna Subt. y Bomba</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={cotizacion.piscina} onChange={e => setCotizacion({...cotizacion, piscina: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                      <span className="font-bold text-sm text-gray-700">Construcción Piscina Base</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">`;

code = code.replace(regex, ui_phases);

fs.writeFileSync('src/app/admin/cotizador/page.tsx', code, 'utf8');
