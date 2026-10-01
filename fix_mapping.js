const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/page.tsx', 'utf8');

const regex = /imagenes: item\.galeriaImagenes && item\.galeriaImagenes\.length > 0 \? item\.galeriaImagenes : \[item\.imagenUrl\],/g;
const rep = `imagenes: item.imagenes && item.imagenes.length > 0 ? item.imagenes : (item.galeriaImagenes && item.galeriaImagenes.length > 0 ? item.galeriaImagenes : [item.imagenUrl || 'https://via.placeholder.com/600x400?text=SARA+Inmobiliaria']),`;

content = content.replace(regex, rep);
fs.writeFileSync('src/app/(public)/inmobiliaria/page.tsx', content);
