const fs = require('fs');

// Files to update
const files = [
    'src/app/admin/apus/insumos/page.tsx',
    'src/app/admin/apus/rubros/page.tsx',
    'src/app/admin/presupuestos_reales/page.tsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Add Hammer and Tag to Lucide imports
    content = content.replace(/import {([^}]+)} from "lucide-react"/g, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        if (!imports.includes('Hammer')) imports.push('Hammer');
        if (!imports.includes('Tag')) imports.push('Tag');
        return import {  } from "lucide-react";
    });

    fs.writeFileSync(f, content);
});
console.log('Imports updated');
