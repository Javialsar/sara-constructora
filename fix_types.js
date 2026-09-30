const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

if (!content.includes('Percent,')) {
  content = content.replace('import {\n  MapPin,', 'import {\n  Percent,\n  MapPin,');
}

// Fix types
content = content.replace(
  '{cfgPlan.beneficios.map((ben, bidx) => (',
  '{cfgPlan.beneficios.map((ben: string, bidx: number) => ('
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Fixed types and percent import');
