const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const patchCode = `        const inmueblesValidados = (data || []).map(inm => ({
          ...inm,
          promocion: inm.promocion || {
            plan: 'basico',
            nombrePlan: 'Plan Básico',
            tarifaMensual: 0,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaVencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            estadoPago: 'vencido',
            ultimoMontoPagado: 0,
            metodoPago: 'Pendiente',
            totalRecaudado: 0
          },
          propietario: inm.propietario || {
            nombre: 'Propietario Temporal',
            email: 'temporal@example.com',
            telefono: '0000000000'
          },
          legalidad: inm.legalidad || {
            estado: 'pendiente'
          }
        }))
        setInmueblesCatalogo(inmueblesValidados)`;

if (content.includes('setInmueblesCatalogo(data || [])')) {
  content = content.replace('setInmueblesCatalogo(data || [])', patchCode);
} else if (content.includes('setInmueblesCatalogo(data)')) {
  content = content.replace('setInmueblesCatalogo(data)', patchCode);
} else {
  // If it sets it differently, let's inject it into the response handling of fetch
  const regex = /const data = await res\.json\(\)\s*if \(data\.success\) \{\s*setInmueblesCatalogo\([^)]+\)/;
  if (regex.test(content)) {
     // manual replace below
  }
}

// Let's just do a string replacement that is robust.
content = content.replace(/setInmueblesCatalogo\(data\.inmuebles \|\| \[\]\)/g, patchCode.replace('data', 'data.inmuebles'));
content = content.replace(/setInmueblesCatalogo\(data \|\| \[\]\)/g, patchCode);

// There is also `mockInmueblesCatalogo` initialization if not using API.
// Let's replace the whole `loadData` function body with a mapped version.

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Injected root protection to state mapping');
