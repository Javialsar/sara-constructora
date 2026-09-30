const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

// Undo the bad import
content = content.replace(
  'import { Percent, CheckCircle2, getInmobiliariaConfig',
  'import { getInmobiliariaConfig'
);

// Do it properly on lucide-react
content = content.replace(
  'import {\n  MapPin',
  'import {\n  Percent,\n  MapPin'
);
content = content.replace(
  'import { MapPin,',
  'import { Percent, CheckCircle2, MapPin,'
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
console.log('Fixed imports again');
