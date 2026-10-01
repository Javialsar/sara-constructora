const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const targetStr = `      legalidad: {
        escrituraPublica: '',
        certificadoGravamenes: '',
        pagoImpuestos: '',
        cedulaPropietario: '',
        observaciones: '',
        estado: 'pendiente' as 'pendiente' | 'aprobado' | 'rechazado'
      },`;

const repStr = `      legalidad: {
        escrituraPublica: inm.legalidad?.escrituraPublica || '',
        certificadoGravamenes: inm.legalidad?.certificadoGravamenes || '',
        pagoImpuestos: inm.legalidad?.pagoImpuestos || '',
        cedulaPropietario: inm.legalidad?.cedulaPropietario || '',
        observaciones: inm.legalidad?.observaciones || '',
        estado: (inm.legalidad?.estado || 'pendiente') as 'pendiente' | 'aprobado' | 'rechazado'
      },`;

content = content.replace(targetStr, repStr);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
