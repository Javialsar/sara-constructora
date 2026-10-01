const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /propietario:\s*\{\s*nombre:\s*formInmueble\.propietarioNombre,\s*telefono:\s*formInmueble\.propietarioTelefono,\s*email:\s*formInmueble\.propietarioEmail,\s*cuentaBancaria:\s*formInmueble\.cuentaBancaria\s*\}/g;

const repStr = `propietario: {
          nombre: formInmueble.propietarioNombre,
          telefono: formInmueble.propietarioTelefono,
          email: formInmueble.propietarioEmail,
          cuentaBancaria: formInmueble.cuentaBancaria
        },
        estado: formInmueble.legalidad?.estado === 'aprobado' ? 'aprobado' : formInmueble.legalidad?.estado === 'rechazado' ? 'rechazado' : 'en_verificacion',
        legalidad: formInmueble.legalidad`;

if (regex.test(content)) {
  content = content.replace(regex, repStr);
  fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
  console.log('Success regex save!');
} else {
  console.log('Failed regex save');
}
