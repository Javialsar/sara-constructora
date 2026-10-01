const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

// The regex will look for `promocion: { ... }` and append `mesesContratados: formInmueble.mesesContratados, descuentoPorcentaje: formInmueble.descuentoPorcentaje` after it.
const regex1 = /promocion:\s*\{\s*\.\.\.editingInmueble\.promocion,\s*plan:\s*formInmueble\.planPromocion,\s*nombrePlan:\s*nombrePlanMap\[formInmueble\.planPromocion\],\s*tarifaMensual:\s*formInmueble\.tarifaMensual,\s*porcentajeComision:\s*formInmueble\.porcentajeComision\s*\}/g;

const repStr1 = `promocion: {
          ...editingInmueble.promocion,
          plan: formInmueble.planPromocion,
          nombrePlan: nombrePlanMap[formInmueble.planPromocion],
          tarifaMensual: formInmueble.tarifaMensual,
          porcentajeComision: formInmueble.porcentajeComision
        },
        mesesContratados: formInmueble.mesesContratados,
        descuentoPorcentaje: formInmueble.descuentoPorcentaje`;

content = content.replace(regex1, repStr1);

const regex2 = /promocion:\s*\{\s*plan:\s*formInmueble\.planPromocion,\s*nombrePlan:\s*nombrePlanMap\[formInmueble\.planPromocion\],\s*tarifaMensual:\s*formInmueble\.tarifaMensual,\s*porcentajeComision:\s*formInmueble\.porcentajeComision,\s*fechaInicio:\s*new Date\(\)\.toISOString\(\)\.split\(\"T\"\)[^,]*,\s*fechaVencimiento:\s*[^,]*,\s*estadoPago:\s*\"pendiente\",\s*ultimoMontoPagado:\s*0,\s*metodoPago:\s*\"Pendiente\",\s*totalRecaudado:\s*0\s*\}/g;

// I'll just use a simple string replace for the second one (creating new property)
const idx = content.lastIndexOf('totalRecaudado: 0');
if (idx !== -1) {
  const closingBraceIdx = content.indexOf('}', idx);
  content = content.substring(0, closingBraceIdx + 1) + ',\n        mesesContratados: formInmueble.mesesContratados,\n        descuentoPorcentaje: formInmueble.descuentoPorcentaje' + content.substring(closingBraceIdx + 1);
}

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Success mapping admin save!');
