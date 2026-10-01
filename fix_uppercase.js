const fs = require('fs');

const file = 'src/app/(public)/inmobiliaria/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /titulo: item\.titulo,\n\s*tipo: item\.tipo,\n\s*modalidad: item\.modalidad,/g;
const rep = `titulo: item.titulo,
              tipo: (item.tipo || "").toLowerCase(),
              modalidad: (item.modalidad || "").toLowerCase(),`;

content = content.replace(regex, rep);

fs.writeFileSync(file, content);
console.log('Fixed lowercase mapping!');
