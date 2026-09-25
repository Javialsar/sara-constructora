const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const regex = /<td className="px-4 py-2.5">\s*<div className="flex items-center justify-end gap-0">[\s\S]*?<Plus size=\{12\} \/>\s*<\/button>\s*<\/div>\s*<\/td>/;

c = c.replace(regex, `<td className="px-4 py-2.5">\n          <QuantityInput item={item} handleUpdateCantidad={handleUpdateCantidad} />\n        </td>`);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
