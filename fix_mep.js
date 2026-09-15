const fs = require('fs');
let text = fs.readFileSync('src/app/admin/cotizador/page.tsx', 'utf8');
text = text.replace(
    /\{cotizacion\.incMep && \([\s\S]*?\{cotizacion\.incTopografia && \(/,
    '{cotizacion.incTopografia && ('
);
fs.writeFileSync('src/app/admin/cotizador/page.tsx', text, 'utf8');
