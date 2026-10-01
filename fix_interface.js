const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /totalRecaudado:\s*number\s*\n\s*\}/g;

const rep = `totalRecaudado: number
  }
  mesesContratados?: number
  descuentoPorcentaje?: number`;

if (regex.test(content)) {
  content = content.replace(regex, rep);
  fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
  console.log('Fixed interface!');
} else {
  console.log('Regex failed');
}
