const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

content = content.replace(
  "estado: estado === 'aprobado' ? 'aprobado' : prev.estado,",
  "// Removed invalid estado property update"
);

content = content.replace(
  /formInmueble\.propietario\?\.telefono/g,
  'formInmueble.propietarioTelefono'
);

content = content.replace(
  /formInmueble\.propietario\?\.nombre/g,
  'formInmueble.propietarioNombre'
);

content = content.replace(
  /formInmueble\.promocion\?\.tarifaMensual/g,
  'formInmueble.tarifaMensual'
);

content = content.replace(
  /formInmueble\.estado/g,
  '(formInmueble as any).estado'
);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Fixed types in formInmueble!');
