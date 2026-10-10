const fs = require('fs');
let c = fs.readFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', 'utf8');
c = c.replace(/alert\((.*?)\);/g, "showToast($1);");
fs.writeFileSync('src/app/modulos/fletes/mi-perfil/page.tsx', c);
