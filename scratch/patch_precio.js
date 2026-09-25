const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

const regexPrice = /onChange=\{e => setFormData\(\{\.\.\.formData, precio_sin_iva: parseFloat\(e\.target\.value\) \|\| 0\}\)\}/;
const newPrice = `onChange={e => setFormData({...formData, precio_sin_iva: e.target.value})}`;

if (c.match(regexPrice)) {
  c = c.replace(regexPrice, newPrice);
  fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
  console.log('Patched precio_sin_iva to allow decimals correctly');
} else {
  console.log('Not found');
}
