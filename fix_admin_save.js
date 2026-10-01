const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /descuentoPorcentaje: formInmueble\.descuentoPorcentaje\n\s*\}\n\n\s*setInmuebles\(prev => prev\.map\(item => item\.id === editingInmueble\.id \? itemActualizado : item\)\)\n\s*saveInmuebleToDB\(itemActualizado\)/;

const replacement = `descuentoPorcentaje: formInmueble.descuentoPorcentaje
      }

      // Eliminar array antiguo para evitar conflictos en catálogos
      delete (itemActualizado as any).imagenes;

      const payloadSize = JSON.stringify(itemActualizado).length;
      if (payloadSize > 4 * 1024 * 1024) {
        alert("Error: El peso total de las imágenes y documentos excede el límite (4 MB). Sube fotos más ligeras o usa el botón 'O agregar Foto por URL'.");
        return;
      }

      setInmuebles(prev => prev.map(item => item.id === editingInmueble.id ? itemActualizado : item))
      saveInmuebleToDB(itemActualizado).then(success => {
        if (!success) alert("Error al guardar el inmueble en la base de datos.");
      })
`;

content = content.replace(regex, replacement);

const regexNuevo = /galeriaVideos: \[\],\n\s*planPromocion: formInmueble\.planPromocion,\n\s*tarifaMensual: formInmueble\.tarifaMensual\n\s*\}\n\n\s*setInmuebles\(prev => \[nuevo, \.\.\.prev\]\)\n\s*saveInmuebleToDB\(nuevo\)/;

const replacementNuevo = `galeriaVideos: [],
        planPromocion: formInmueble.planPromocion,
        tarifaMensual: formInmueble.tarifaMensual
      }

      const payloadSize = JSON.stringify(nuevo).length;
      if (payloadSize > 4 * 1024 * 1024) {
        alert("Error: El peso total de las imágenes excede el límite (4 MB). Sube fotos más ligeras o usa URLs.");
        return;
      }

      setInmuebles(prev => [nuevo, ...prev])
      saveInmuebleToDB(nuevo).then(success => {
        if (!success) alert("Error al guardar el inmueble en la base de datos.");
      })
`;

content = content.replace(regexNuevo, replacementNuevo);

fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Fixed handleSaveInmueble payload size & sync in Admin');
