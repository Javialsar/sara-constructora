const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

// Reverse the mistake in useState (line 599)
const mistakeStr = `legalidad: {
        escrituraPublica: inm.legalidad?.escrituraPublica || '',
        certificadoGravamenes: inm.legalidad?.certificadoGravamenes || '',
        pagoImpuestos: inm.legalidad?.pagoImpuestos || '',
        cedulaPropietario: inm.legalidad?.cedulaPropietario || '',
        observaciones: inm.legalidad?.observaciones || '',
        estado: (inm.legalidad?.estado || 'pendiente') as 'pendiente' | 'aprobado' | 'rechazado'
      },`;

const fixedStr = `legalidad: {
      escrituraPublica: '',
      certificadoGravamenes: '',
      pagoImpuestos: '',
      cedulaPropietario: '',
      observaciones: '',
      estado: 'pendiente' as 'pendiente' | 'aprobado' | 'rechazado'
    },`;

content = content.replace(mistakeStr, fixedStr);

// Now correctly replace it ONLY inside handleOpenEditModal
const handleOpenIdx = content.indexOf('const handleOpenEditModal = (inm: InmuebleAdmin) => {');
if (handleOpenIdx !== -1) {
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
  
  // Find the exact occurrence after handleOpenIdx
  const blockIdx = content.indexOf('legalidad: {', handleOpenIdx);
  if (blockIdx !== -1) {
    const endBlockIdx = content.indexOf('},', blockIdx) + 2;
    const oldBlock = content.substring(blockIdx, endBlockIdx);
    
    // We just replace that specific substring
    content = content.substring(0, blockIdx) + repStr.trim() + ',' + content.substring(endBlockIdx);
  }
}

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
