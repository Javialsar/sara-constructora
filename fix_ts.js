const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

// fix imports
content = content.replace('import {', 'import { XCircle,');

// fix types
content = content.replace("estadoPago: 'al_dia',", "estadoPago: 'al_dia' as const,");
content = content.replace("estadoPago: 'vencido',", "estadoPago: 'vencido' as const,");

// add comprobanteUrl to interface
content = content.replace('totalRecaudado: number\r\n    comprobanteUrl?: string\r\n  }', 'totalRecaudado: number\r\n    comprobanteUrl?: string\r\n  }'); // wait, did the previous one fail?

const interfaceRegex = /totalRecaudado:\s*number\s*\n\s*\}/g;
if (interfaceRegex.test(content)) {
  content = content.replace(interfaceRegex, "totalRecaudado: number\n    comprobanteUrl?: string\n  }");
}

// Another fallback just in case
const backupRegex = /totalRecaudado:\s*number\s*\r?\n\s*\}/g;
if (backupRegex.test(content)) {
  content = content.replace(backupRegex, "totalRecaudado: number\n    comprobanteUrl?: string\n  }");
}

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
