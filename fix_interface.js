const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

// Replace using regex to ignore \r
content = content.replace(/destacado:\s*boolean\s*\/\/\s*Información del Propietario & Bancaria/, `destacado: boolean\n  estado?: 'en_verificacion' | 'aprobado' | 'rechazado' | 'publicado'\n  legalidad?: any\n  // Información del Propietario & Bancaria`);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
