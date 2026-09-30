const fs = require('fs');
let content = fs.readFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', 'utf8');

content = content.replace(
  '  const handleUploadLegalFile = (key: keyof typeof formInmueble.legalidad, e: React.ChangeEvent<HTMLInputElement>) => {\n    const file = e.target.files?.[0]',
  `  const handleUploadLegalFile = (key: keyof typeof formInmueble.legalidad, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && !file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
      alert("El documento PDF es demasiado grande. Por favor sube un archivo menor a 2MB o usa fotos.");
      return;
    }`
);

fs.writeFileSync('src/components/inmobiliaria/PublicarInmuebleModal.tsx', content);
