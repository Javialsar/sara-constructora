const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Revert Nuevo Rubro button
const autoBtnMatch = content.match(/onClick=\{\(\) => \{\s*const maxNum = rubros\.reduce[\s\S]*?setIsNewModalOpen\(true\);\s*\}\}/);
if (autoBtnMatch) {
  content = content.replace(autoBtnMatch[0], `onClick={() => {
          setNewRubroData({ codigo: '', nombre: '', categoria: '', unidad: 'm3', herramienta_menor_pct: 5.0, subfamilia_id: '' });
          setIsNewModalOpen(true);
        }}`);
}

// 2. Change <select> onChange logic
const selectPattern = /<select required value=\{\(newRubroData as any\)\.subfamilia_id \|\| ''\} onChange=\{e => setNewRubroData\(\{\.\.\.newRubroData, subfamilia_id: e\.target\.value\} as any\)\}/;

const newSelect = `<select required value={(newRubroData as any).subfamilia_id || ''} onChange={e => {
  const subId = e.target.value;
  let newCode = newRubroData.codigo;
  if (subId) {
    const sf = subfamilias.find(s => s.id === subId);
    if (sf) {
      const f = familias.find(fam => fam.id === sf.familia_id);
      if (f) {
        const preF = (f.nombre.match(/[a-zA-Z]+/g) || []).join('').substring(0,3).toUpperCase();
        const preSF = (sf.nombre.match(/[a-zA-Z]+/g) || []).join('').substring(0,3).toUpperCase();
        const rubrosEnSub = rubros.filter(r => r.subfamilia_id === subId);
        let maxSeq = 0;
        rubrosEnSub.forEach(r => {
          const m = r.codigo?.match(/\\d+$/);
          if (m) {
            const num = parseInt(m[0], 10);
            if (num > maxSeq) maxSeq = num;
          }
        });
        const seq = (maxSeq + 1).toString().padStart(3, '0');
        newCode = \`\${preF}-\${preSF}-\${seq}\`;
      }
    }
  }
  setNewRubroData({...newRubroData, subfamilia_id: subId, codigo: newCode} as any);
}}`;

if (content.match(selectPattern)) {
  content = content.replace(selectPattern, newSelect);
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
