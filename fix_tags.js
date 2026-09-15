const fs = require('fs');
let code = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');
code = code.replace('< 5%', '&lt; 5%');
code = code.replace('> 20%', '&gt; 20%');
fs.writeFileSync('src/app/admin/cotizador/page.tsx', code, 'utf8');
