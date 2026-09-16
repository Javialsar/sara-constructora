const fs = require('fs');

['src/app/admin/apus/rubros/page.tsx', 'src/app/admin/presupuestos_reales/page.tsx'].forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/import \{([^}]+)\} from "lucide-react"/, (match, p1) => {
        let imports = p1.split(',').map(s => s.trim());
        if (!imports.includes('Hammer')) imports.push('Hammer');
        if (!imports.includes('Tag')) imports.push('Tag');
        return import {  } from "lucide-react";
    });
    fs.writeFileSync(f, content);
});
console.log('Imports added!');
