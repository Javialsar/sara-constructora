const fs = require('fs');
let content = fs.readFileSync('src/app/modulos/fletes/page.tsx', 'utf8');

const anchor = '<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Carga y Volumen</label>';

if (!content.includes('Tipo de Vehículo') && !content.includes('Mulas')) {
    const newHtml = `<div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Vehículo</label>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-3 outline-none text-sm bg-slate-50">
                    <option>Todas las Volquetas</option>
                    <option>Camiones 5T</option>
                    <option>Mulas 20T</option>
                  </select>
                </div>\n                `;
    
    // Insert newHtml right before the parent div of Carga y Volumen
    // the parent div is: <div className="pt-4 border-t border-slate-100">
    const idx = content.indexOf('<div className="pt-4 border-t border-slate-100">');
    if (idx !== -1) {
        content = content.substring(0, idx) + newHtml + content.substring(idx);
        fs.writeFileSync('src/app/modulos/fletes/page.tsx', content, 'utf8');
        console.log('Inserted vehicle dropdown.');
    }
}
