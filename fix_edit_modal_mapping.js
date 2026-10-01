const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /planPromocion:\s*\(inm\.promocion\s*\|\|\s*\{\}\)\.plan,[\s\S]*?descuentoPorcentaje:\s*0/;

const replacement = `planPromocion: (inm.promocion || {}).plan || (inm as any).planPromocion || "basico",
      tarifaMensual: (inm.promocion || {}).tarifaMensual !== undefined ? (inm.promocion || {}).tarifaMensual : ((inm as any).tarifaMensual || 0),
      porcentajeComision: (inm.promocion || {}).porcentajeComision || (inm as any).porcentajeComision || 3,
      legalidad: {
        escrituraPublica: inm.legalidad?.escrituraPublica || '',
        certificadoGravamenes: inm.legalidad?.certificadoGravamenes || '',
        pagoImpuestos: inm.legalidad?.pagoImpuestos || '',
        cedulaPropietario: inm.legalidad?.cedulaPropietario || '',
        observaciones: inm.legalidad?.observaciones || '',
        estado: (inm.legalidad?.estado || 'pendiente') as 'pendiente' | 'aprobado' | 'rechazado'
      },
      mesesContratados: (inm as any).mesesContratados || 1,
      descuentoPorcentaje: (inm as any).descuentoPorcentaje || 0`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Success edit modal mapping!');
