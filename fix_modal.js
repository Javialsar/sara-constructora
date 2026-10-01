const fs = require('fs');
const file = 'src/components/inmobiliaria/PublicarInmuebleModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/value="VENTA"/g, 'value="venta"')
                 .replace(/value="ARRIENDO"/g, 'value="arriendo"')
                 .replace(/value="ANTICRESIS"/g, 'value="anticresis"')
                 .replace(/value="DEPARTAMENTO"/g, 'value="departamento"')
                 .replace(/value="CASA"/g, 'value="casa"')
                 .replace(/value="TERRENO"/g, 'value="terreno"')
                 .replace(/value="SUITE"/g, 'value="suite"')
                 .replace(/value="LOCAL"/g, 'value="local"')
                 .replace(/value="QUINTA"/g, 'value="quinta"');

fs.writeFileSync(file, content);
