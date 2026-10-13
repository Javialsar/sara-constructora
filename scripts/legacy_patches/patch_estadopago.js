const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

content = content.replace(/i\.promocion\.estadoPago === \"al_dia\"/g, '(i.promocion && i.promocion.estadoPago === \"al_dia\")');
content = content.replace(/i\.promocion\.estadoPago === \"por_vencer\"/g, '(i.promocion && i.promocion.estadoPago === \"por_vencer\")');
content = content.replace(/i\.promocion\.estadoPago === \"vencido\"/g, '(i.promocion && i.promocion.estadoPago === \"vencido\")');
content = content.replace(/i\.promocion\.estadoPago \!\=\= \"vencido\"/g, '(i.promocion && i.promocion.estadoPago !== \"vencido\")');

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Fixed remaining estadoPago references');
