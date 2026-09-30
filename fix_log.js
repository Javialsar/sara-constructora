const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

content = content.replace(
  'const errData = await res.json().catch(()=>({})); alert("Error al guardar el inmueble: " + (errData.error || res.statusText));',
  'const text = await res.text(); let errData = {}; try { errData = JSON.parse(text); } catch(e) { errData = { error: text.substring(0, 100) }; } alert("Error HTTP " + res.status + " al guardar el inmueble:\\n" + (errData.error || res.statusText));'
);

fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
