const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

const regexPrice = /onChange=\{e => setFormData\(\{\.\.\.formData, precio_sin_iva: e\.target\.value\}\)\}/;
const newPrice = `onChange={e => setFormData({...formData, precio_sin_iva: e.target.value as any})}`;

if (c.match(regexPrice)) {
  c = c.replace(regexPrice, newPrice);
  fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
  console.log('Patched precio_sin_iva for TS type check');
} else {
  console.log('Not found');
}
