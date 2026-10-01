const fs = require('fs');

function fixUpload(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find where handleUploadFotos reads files and add e.target.value = ''
  if (content.includes('reader.readAsDataURL(file)')) {
    content = content.replace(/reader\.readAsDataURL\(file\)\n\s*\}\)\n\s*\}/g, 'reader.readAsDataURL(file)\n      })\n      e.target.value = ""\n    }');
    fs.writeFileSync(file, content);
    console.log('Fixed handleUploadFotos in', file);
  }
}

fixUpload('src/app/admin/inmobiliaria/page.tsx');
fixUpload('src/components/inmobiliaria/PublicarInmuebleModal.tsx');
