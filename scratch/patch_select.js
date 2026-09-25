const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const regexSelect = /<select required value=\{\(newRubroData as any\)\.subfamilia_id \|\| ''\} onChange=\{e => \{[\s\S]*?<\/select>/;

const newSelect = `<select required value={(newRubroData as any).familia_id_temp || ''} onChange={e => {
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
  </select>`;

if (content.match(regexSelect)) {
  content = content.replace(regexSelect, newSelect);
  fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
  console.log('Select patched successfully.');
} else {
  console.log('Select not found.');
}
