const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');

// 1. UPDATE STATE
text = text.replace(
    /incArquitectura:\s*true,\s*incEstructura:\s*true,\s*incMep:\s*true,\s*incTopografia:\s*true,/,
    `incArquitectura: true,
    incEstructura: true,
    incGeotecnia: true,
    incElectrico: true,
    incHidrico: true,
    incTopografia: true,`
);

// 2. UPDATE CALCULATIONS
// The original calculations look like this:
// let honorariosArq = cotizacion.incArquitectura ? areaValue * params.tarifa_diseno_arq_m2 : 0
// let honorariosEst = cotizacion.incEstructura ? areaValue * params.tarifa_diseno_est_m2 : 0
// let honorariosMep = cotizacion.incMep ? areaValue * params.tarifa_diseno_mep_m2 : 0
// let honorariosTop = cotizacion.incTopografia ? params.tarifa_topografia_base : 0
// const totalHonorarios = honorariosArq + honorariosEst + honorariosMep + honorariosTop
text = text.replace(
    /let honorariosArq = cotizacion\.incArquitectura[\s\S]*?const totalHonorarios = [^\n]*\n/,
    `let honorariosArq = cotizacion.incArquitectura ? areaValue * (params.tarifa_diseno_arq_m2 || 12) : 0
      let honorariosEst = cotizacion.incEstructura ? areaValue * (params.tarifa_diseno_est_m2 || 8) : 0
      let honorariosGeotecnia = cotizacion.incGeotecnia ? (params.tarifa_geotecnia || 800) : 0
      let honorariosElec = cotizacion.incElectrico ? areaValue * (params.tarifa_diseno_elec_m2 || 3.5) : 0
      let honorariosHidro = cotizacion.incHidrico ? areaValue * (params.tarifa_diseno_hidro_m2 || 3.5) : 0
      let honorariosTop = cotizacion.incTopografia ? (params.tarifa_topografia_base || 350) : 0
  
      const totalHonorarios = honorariosArq + honorariosEst + honorariosGeotecnia + honorariosElec + honorariosHidro + honorariosTop\n`
);

// also in the return statement:
text = text.replace(
    /honorariosArq,\s*honorariosEst,\s*honorariosMep,\s*honorariosTop,/,
    `honorariosArq,
        honorariosEst,
        honorariosGeotecnia,
        honorariosElec,
        honorariosHidro,
        honorariosTop,`
);


// 3. UPDATE CHECKBOXES IN UI
// Use [\s\S]*? carefully within the pt-4 border-t div.
text = text.replace(
    /<div className="pt-4 border-t">[\s\S]*?Alcance de la Consultor[\s\S]*?<\/label>[\s\S]*?<div className="space-y-3">[\s\S]*?<\/div>\s*<\/div>/,
    `<div className="pt-4 border-t">
                <label className="block text-sm font-bold text-gray-700 mb-4">Alcance de la Consultoría (Módulo 1)</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incArquitectura} onChange={e => setCotizacion({...cotizacion, incArquitectura: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Arquitectónico Ejecutivo</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incEstructura} onChange={e => setCotizacion({...cotizacion, incEstructura: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Estructural</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incGeotecnia} onChange={e => setCotizacion({...cotizacion, incGeotecnia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Estudio de Suelos (Geotecnia)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incElectrico} onChange={e => setCotizacion({...cotizacion, incElectrico: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Eléctrico</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incHidrico} onChange={e => setCotizacion({...cotizacion, incHidrico: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Hidrosanitario (Hídrico)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incTopografia} onChange={e => setCotizacion({...cotizacion, incTopografia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Levantamiento Topográfico Base</span>
                  </label>
                </div>
              </div>`
);

// 4. UPDATE DASHBOARD SUMMARY
text = text.replace(
    /\{cotizacion\.incArquitectura && \([\s\S]*?\{cotizacion\.incTopografia && \([\s\S]*?<\/div>\s*\)\}/,
    `{cotizacion.incArquitectura && (
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span>Diseño Arquitectónico Ejecutivo</span>
                        <span>\${resultados?.honorariosArq?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {cotizacion.incEstructura && (
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span>Diseño Estructural</span>
                        <span>\${resultados?.honorariosEst?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {cotizacion.incGeotecnia && (
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span>Estudio de Suelos (Geotecnia)</span>
                        <span>\${resultados?.honorariosGeotecnia?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {cotizacion.incElectrico && (
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span>Diseño Eléctrico</span>
                        <span>\${resultados?.honorariosElec?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {cotizacion.incHidrico && (
                      <div className="flex justify-between border-b border-white/10 pb-1">
                        <span>Diseño Hidrosanitario (Hídrico)</span>
                        <span>\${resultados?.honorariosHidro?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {cotizacion.incTopografia && (
                      <div className="flex justify-between pb-1">
                        <span>Levantamiento Topográfico Base</span>
                        <span>\${resultados?.honorariosTop?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                    )}`
);

// FINALLY, Global Mojibake Fix!
const mojibake_replacements = {
    'DiseÃ±o': 'Diseño',
    'ConsultorÃa': 'Consultoría',
    'ConsultorÃ­a': 'Consultoría',
    'MÃ³dulo': 'Módulo',
    'ArquitectÃ³nico': 'Arquitectónico',
    'ElÃ©ctrica': 'Eléctrica',
    'TopogrÃ¡fico': 'Topográfico',
    'ParÃ¡metros': 'Parámetros',
    'EstÃ¡ndar': 'Estándar',
    'BaÃ±os': 'Baños',
    'ClimatizaciÃ³n': 'Climatización',
    'MetÃ¡lica': 'Metálica',
    'SubterrÃ¡nea': 'Subterránea',
    'Ã“ptimo': 'Óptimo',
    'Ã\x81rea': 'Área',
    'Ãrea': 'Área',
    'CotizaciÃ³n': 'Cotización',
    'IngenierÃas': 'Ingenierías',
    'HormigÃ³n': 'Hormigón',
    'mÃ²': 'm²',
    'EconÃ³mico': 'Económico',
    'TopografÃa': 'Topografía',
    'Ã?rea': 'Área',
    'Cotizaci?n': 'Cotización',
    'Levantamiento Topogrǭfico Base': 'Levantamiento Topográfico Base',
    'Ingenieras MEP (Hidro / ElǸctrica)': 'Ingenierías MEP (Hidro / Eléctrica)',
    'Estruct. Metlica': 'Estruct. Metálica',
    'Hormign Armado': 'Hormigón Armado',
    'm': 'm²', // DO NOT USE THIS BLINDLY. We removed it!
};

for (const [bad, good] of Object.entries(mojibake_replacements)) {
    if (bad === 'm') continue; // NEVER REPLACE 'm' globally!!
    text = text.split(bad).join(good);
}

fs.writeFileSync('src/app/admin/cotizador/page.tsx', text, 'utf8');
