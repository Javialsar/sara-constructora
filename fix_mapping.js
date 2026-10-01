const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const targetStr = `planPromocion: item.planPromocion || item.plan_promocion || "basico",`;
const repStr = `planPromocion: item.planPromocion || item.plan_promocion || "basico",
            promocion: item.promocion,
            mesesContratados: item.mesesContratados,
            descuentoPorcentaje: item.descuentoPorcentaje,`;
content = content.replace(targetStr, repStr);

const targetType = `planPromocion: string`;
const repType = `planPromocion: string
  promocion?: any
  mesesContratados?: number
  descuentoPorcentaje?: number`;
content = content.replace(targetType, repType);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
console.log('Success mapping fields!');
