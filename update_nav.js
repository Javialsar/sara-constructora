const fs = require('fs');
let text = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');

text = text.replace(
    '    { href: "/admin/cotizaciones", label: "Cotizaciones Recibidas", icon: FileText },',
    `    { href: "/admin/cotizaciones", label: "Cotizaciones Recibidas", icon: FileText },
    { href: "/admin/apus/insumos", label: "Catálogo de Insumos", icon: FileText },
    { href: "/admin/apus/rubros", label: "Recetas y Rubros", icon: Calculator },
    { href: "/admin/presupuestos_reales", label: "Presupuestos Reales", icon: Calculator },`
);

fs.writeFileSync('src/app/admin/layout.tsx', text, 'utf8');
