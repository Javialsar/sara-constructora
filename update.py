import re

with open('src/app/admin/cotizador/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. UPDATE STATE
state_repl = '''
  const [cotizacion, setCotizacion] = useState({
    nombreCliente: '',
    nombreProyecto: '',
    areaConstruccion: '100',
    // FASE 1: Terreno y Estructura
    pendiente: 'plana', 
    suelo: 'normal',
    accesibilidad: 'urbana',
    pisos: '2',
    estructura: 'hormigon',
    // FASE 2: Arquitectura y Distribucion
    acabados: 'estandar', 
    cuartosMaster: 1,
    cuartosNormales: 2,
    banosCompletos: 2,
    mediosBanos: 1,
    lavanderia: true,
    cocina: 'abierta', // cerrada, abierta
    // FASE 3: Exteriores y Extras
    cerramientoMl: 0,
    piscina: false,
    cisterna: true,
    garaje: 'descubierto', // ninguno, descubierto, cubierto
    climatizacion: 'splits', // ninguna, splits, central
    
    // Módulo 1 (Consultoría)
    incArquitectura: true,
    incEstructura: true,
    incMep: true,
    incTopografia: true,
  })'''

code = re.sub(r"const \[cotizacion, setCotizacion\] = useState\(\{.*?\n  \}\)", state_repl.strip(), code, flags=re.DOTALL)

# 2. UPDATE CALCULATION
calc_repl = '''
    // Factor Estructura
    let fEstructura = params.factor_estructura_hormigon || 1
    if (cotizacion.estructura === 'metalica') fEstructura = params.factor_estructura_metalica || 1.15

    // Costo Base Paramétrico (m2 * factores)
    const costoObraBase = areaValue * (params.costo_base_construccion_m2 || 450) * fPendiente * fAcabados * fSuelo * fAcceso * fPisos * fEstructura

    // Costos Aditivos (Ensambles)
    let costoExtras = 0;
    
    // FASE 2: Arquitectura
    costoExtras += (Number(cotizacion.cuartosMaster) || 0) * (params.costo_extra_master || 800);
    costoExtras += (Number(cotizacion.banosCompletos) || 0) * (params.costo_extra_bano_completo || 1500);
    costoExtras += (Number(cotizacion.mediosBanos) || 0) * (params.costo_extra_medio_bano || 800);
    if (cotizacion.lavanderia) costoExtras += (params.costo_extra_lavanderia || 600);
    if (cotizacion.cocina === 'abierta') costoExtras += (params.costo_extra_cocina_isla || 1500);

    // FASE 3: Exteriores
    costoExtras += (Number(cotizacion.cerramientoMl) || 0) * (params.costo_ml_cerramiento || 120);
    if (cotizacion.piscina) costoExtras += (params.costo_extra_piscina || 12000);
    if (cotizacion.cisterna) costoExtras += (params.costo_extra_cisterna || 2500);
    if (cotizacion.garaje === 'cubierto') costoExtras += (params.costo_extra_garaje_cubierto || 3500);
    if (cotizacion.garaje === 'descubierto') costoExtras += (params.costo_extra_garaje_descubierto || 800);
    if (cotizacion.climatizacion === 'splits') costoExtras += (params.costo_extra_splits || 1200);
    if (cotizacion.climatizacion === 'central') costoExtras += (params.costo_extra_aire_central || 4500);

    const costoObra = costoObraBase + costoExtras;
    const desgloseObra = { base: costoObraBase, extras: costoExtras };
'''

code = re.sub(
    r"// Factor Estructura.*?const costoObra = areaValue \* \(params\.costo_base_construccion_m2 \|\| 450\) \* fPendiente \* fAcabados \* fSuelo \* fAcceso \* fPisos \* fEstructura",
    calc_repl.strip(),
    code,
    flags=re.DOTALL
)

code = re.sub(
    r"return \{\n\s*costoObra,\n\s*honorariosArq",
    "return {\\n      costoObra,\\n      desgloseObra,\\n      honorariosArq",
    code,
    flags=re.DOTALL
)

# 3. UI INPUTS REPLACEMENT
ui_phases = '''              {/* FASE 1: CONDICIONANTES DEL SITIO Y ESTRUCTURA */}
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

              <div className="pt-4 border-t">'''

code = re.sub(
    r"\{\/\* Parámetros de Terreno y Obra \*\/\}.*?<div className=\"pt-4 border-t\">",
    ui_phases.strip(),
    code,
    flags=re.DOTALL
)

# 4. UPDATE DASHBOARD OUTPUT
dash_repl = '''
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 mt-4">
                    <div className="font-bold text-gray-700 border-b pb-2 mb-2">Desglose de Ensambles y Extras</div>
                    {cotizacion.cuartosMaster > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.cuartosMaster} Dormitorios Master</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.cuartosMaster * (params?.costo_extra_master || 800)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.banosCompletos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.banosCompletos} Baños Completos</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.banosCompletos * (params?.costo_extra_bano_completo || 1500)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.mediosBanos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.mediosBanos} Medios Baños</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.mediosBanos * (params?.costo_extra_medio_bano || 800)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.lavanderia && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Área de Lavandería</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_lavanderia || 600).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.cocina === 'abierta' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cocina Abierta con Isla</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_cocina_isla || 1500).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.cerramientoMl > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.cerramientoMl}ml Cerramiento Perimetral</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.cerramientoMl * (params?.costo_ml_cerramiento || 120)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.cisterna && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cisterna Subterránea</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_cisterna || 2500).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.piscina && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Construcción de Piscina</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_piscina || 12000).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.garaje !== 'ninguno' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Garaje ({cotizacion.garaje})</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.garaje === 'cubierto' ? (params?.costo_extra_garaje_cubierto || 3500) : (params?.costo_extra_garaje_descubierto || 800)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.climatizacion !== 'ninguna' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Climatización ({cotizacion.climatizacion})</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.climatizacion === 'central' ? (params?.costo_extra_aire_central || 4500) : (params?.costo_extra_splits || 1200)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold">
                      <span className="text-gray-800">Total Extras:</span>
                      <span className="text-brand-dark">${(resultados?.desgloseObra?.extras || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>'''

code = re.sub(
    r"(<span className=\"font-medium\">x \{cotizacion\.estructura === 'hormigon' \? \(params\?\.factor_estructura_hormigon \|\| 1\) : \(params\?\.factor_estructura_metalica \|\| 1\.15\)\}<\/span>\s*<\/div>\s*<\/div>\s*<\/div>)",
    r"\1\n" + dash_repl.strip(),
    code,
    flags=re.DOTALL
)

with open('src/app/admin/cotizador/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
