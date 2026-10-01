const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const targetStr = `        propietario: {
          nombre: formInmueble.propietarioNombre,
          telefono: formInmueble.propietarioTelefono,
          email: formInmueble.propietarioEmail
        },`;

const replacementStr = `        propietario: {
          nombre: formInmueble.propietarioNombre,
          telefono: formInmueble.propietarioTelefono,
          email: formInmueble.propietarioEmail
        },
        legalidad: formInmueble.legalidad,
        estado: formInmueble.legalidad.estado === 'aprobado' ? 'aprobado' : formInmueble.legalidad.estado === 'rechazado' ? 'rechazado' : 'en_verificacion',`;

content = content.replace(targetStr, replacementStr);
content = content.replace(targetStr, replacementStr); // In case it's in both editingInmueble and creating new

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
