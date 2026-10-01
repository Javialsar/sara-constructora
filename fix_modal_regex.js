const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /legalidad:\s*\{\s*escrituraPublica:\s*'',\s*certificadoGravamenes:\s*'',\s*pagoImpuestos:\s*'',\s*cedulaPropietario:\s*'',\s*observaciones:\s*'',\s*estado:\s*'pendiente'\s*as\s*'pendiente'\s*\|\s*'aprobado'\s*\|\s*'rechazado'\s*\}/;

const repStr = `legalidad: {
        escrituraPublica: inm.legalidad?.escrituraPublica || '',
        certificadoGravamenes: inm.legalidad?.certificadoGravamenes || '',
        pagoImpuestos: inm.legalidad?.pagoImpuestos || '',
        cedulaPropietario: inm.legalidad?.cedulaPropietario || '',
        observaciones: inm.legalidad?.observaciones || '',
        estado: (inm.legalidad?.estado || 'pendiente') as 'pendiente' | 'aprobado' | 'rechazado'
      }`;

if (regex.test(content)) {
  content = content.replace(regex, repStr);
  fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
  console.log('Success regex!');
} else {
  console.log('Failed regex');
}
