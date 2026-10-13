const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/inmobiliaria/page.tsx', 'utf8');

const filterCode = `  const preventSensitiveData = (text: string) => {
    let clean = text;
    // Filtrar emails
    clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g, '[CORREO OCULTO]');
    // Filtrar teléfonos (más de 7 dígitos juntos o con espacios/guiones)
    clean = clean.replace(/(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\d{3,}[-.\\s]?){2,}/g, '[TELÉFONO OCULTO]');
    // Filtrar enlaces web
    clean = clean.replace(/(https?:\\/\\/[^\\s]+)|(www\\.[^\\s]+)/g, '[ENLACE OCULTO]');
    return clean;
  };`;

if (!content.includes('preventSensitiveData')) {
  content = content.replace(
    'export default function PaginaInmobiliaria() {',
    'export default function PaginaInmobiliaria() {\n' + filterCode
  );
  
  content = content.replace(
    'onChange={(e) => setNewPregunta(e.target.value)}',
    'onChange={(e) => setNewPregunta(preventSensitiveData(e.target.value))}'
  );
  
  fs.writeFileSync('src/app/(public)/inmobiliaria/page.tsx', content);
  console.log('Added sensitive data filter to public Q&A');
}
