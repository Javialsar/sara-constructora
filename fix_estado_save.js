const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const targetStr = `        propietario: {
          nombre: formInmueble.propietarioNombre,
          telefono: formInmueble.propietarioTelefono,
          email: formInmueble.propietarioEmail,
          cuentaBancaria: formInmueble.cuentaBancaria
        },`;

const repStr = `        propietario: {
          nombre: formInmueble.propietarioNombre,
          telefono: formInmueble.propietarioTelefono,
          email: formInmueble.propietarioEmail,
          cuentaBancaria: formInmueble.cuentaBancaria
        },
        estado: formInmueble.legalidad?.estado === 'aprobado' ? 'aprobado' : formInmueble.legalidad?.estado === 'rechazado' ? 'rechazado' : 'en_verificacion',
        legalidad: formInmueble.legalidad,`;

content = content.replace(targetStr, repStr);
content = content.replace(targetStr, repStr); // twice for new items

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
