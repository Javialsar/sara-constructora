const fs = require('fs');

let content = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');

// Fix mojibake
content = content.replace(/M\"DULO/g, 'MÓDULO');
content = content.replace(/Catǭlogo/g, 'Catálogo');
content = content.replace(/Automǭtico/g, 'Automático');
content = content.replace(/TǸcnico/g, 'Técnico');
content = content.replace(/Sesin/g, 'Sesión');
content = content.replace(/Configuracin/g, 'Configuración');

// Add the new menu item
const newMenuItem = `        { href: "/admin/parametros", label: "Parámetros Globales", icon: Settings },
        { href: "/admin/apus/insumos",`;

content = content.replace('{ href: "/admin/apus/insumos",', newMenuItem);

fs.writeFileSync('src/app/admin/layout.tsx', content, 'utf8');
console.log("Layout updated");
