const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const target = 'onClick={() => setIsNewModalOpen(true)}';
const replacement = `onClick={() => {
  const maxNum = rubros.reduce((max, r) => {
    const match = r.codigo?.match(/\\d+$/);
    return match && parseInt(match[0], 10) > max ? parseInt(match[0], 10) : max;
  }, 0);
  setNewRubroData({ ...newRubroData, codigo: \`RUB-\${(maxNum + 1).toString().padStart(4, '0')}\`, nombre: '', unidad: 'm3', subfamilia_id: '' });
  setIsNewModalOpen(true);
}}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
  console.log('Patched successfully');
} else {
  console.log('Target not found');
}
