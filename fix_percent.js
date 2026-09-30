const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

if (!content.includes('import { Percent }')) {
  content = 'import { Percent } from "lucide-react"\n' + content;
}

content = content.replace(
  'cfg.planes[prev.planPromocion]?.precioMensual',
  'cfg.planes[prev.planPromocion as "basico" | "destacado" | "premium"]?.precioMensual'
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Fixed percent and typings');
