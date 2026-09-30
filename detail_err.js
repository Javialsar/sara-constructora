const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

content = content.replace(
  'alert("Error al guardar el inmueble.")',
  'const errData = await res.json().catch(()=>({})); alert("Error al guardar el inmueble: " + (errData.error || res.statusText)); console.error("Error from API:", errData);'
);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
console.log('Added detailed error to alert');
