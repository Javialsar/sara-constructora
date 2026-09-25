const fs = require('fs');
const content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const start = content.indexOf('<form onSubmit={handleCreateRubro}');
const end = content.indexOf('</form>', start) + 7;

const oldForm = content.slice(start, end);

const newForm = `<form onSubmit={handleCreateRubro} className="p-5 space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo</label>
  <select required value={(newRubroData as any).familia_id_temp || ''} onChange={e => {
    const famId = e.target.value;
    let newCode = newRubroData.codigo;
    let targetSubId = '';
    
    if (famId) {
      const f = familias.find(fam => fam.id === famId);
      const sf = subfamilias.find(s => s.familia_id === famId); // The auto-created 'General' subfamilia
      if (sf) targetSubId = sf.id;
      
      if (f) {
        const preF = (f.nombre.match(/[a-zA-Z]+/g) || []).join('').substring(0,3).toUpperCase();
        
        // Count all rubros in this familia
        const sfsOfFam = subfamilias.filter(s => s.familia_id === famId).map(s => s.id);
        const rubrosEnFam = rubros.filter(r => sfsOfFam.includes(r.subfamilia_id));
        
        let maxSeq = 0;
        rubrosEnFam.forEach(r => {
          const m = r.codigo?.match(/\\d+$/);
          if (m) {
            const num = parseInt(m[0], 10);
            if (num > maxSeq) maxSeq = num;
          }
        });
        const seq = (maxSeq + 1).toString().padStart(3, '0');
        newCode = \`\${preF}-\${seq}\`;
      }
    }
    setNewRubroData({...newRubroData, familia_id_temp: famId, subfamilia_id: targetSubId, codigo: newCode} as any);
  }} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-white">
      <option value="">Seleccione...</option>
      {familias.map(f => (
        <option key={f.id} value={f.id}>{f.nombre}</option>
      ))}
  </select></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre del Rubro</label><input type="text" value={newRubroData.nombre} onChange={e => setNewRubroData({...newRubroData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. Hormigón simple f'c=210" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código (Auto)</label><input type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-gray-50" placeholder="Se genera al elegir Grupo" required /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label><input type="text" value={newRubroData.unidad} onChange={e => setNewRubroData({...newRubroData, unidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="m3, m2, ml, glb" required /></div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors">Crear Rubro</button>
              </div>
            </form>`;

const newContent = content.substring(0, start) + newForm + content.substring(end);
fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', newContent);
