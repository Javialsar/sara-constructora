const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const doubleClass = `<input type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm bg-gray-50" placeholder="Se genera al elegir Grupo" required readOnly disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-mono" />`;

const correctInput = `<input type="text" value={newRubroData.codigo} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-mono" placeholder="Se genera al elegir Grupo" />`;

content = content.replace(doubleClass, correctInput);
fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
