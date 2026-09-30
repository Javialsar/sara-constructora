const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

content = content.replace(
  '    await onSave(finalInmueble)',
  `    const payloadSize = JSON.stringify(finalInmueble).length;
    if (payloadSize > 4 * 1024 * 1024) {
      alert("Error: El peso total de las imágenes y documentos (" + (payloadSize / 1024 / 1024).toFixed(1) + " MB) excede el límite permitido (4 MB). Por favor elimina algunos archivos o sube PDFs más ligeros.");
      setIsSubmitting(false);
      return;
    }
    await onSave(finalInmueble)`
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
