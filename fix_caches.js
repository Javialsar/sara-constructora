const fs = require('fs');

function fixFetchCache(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/fetch\("\/api\/inmobiliaria\/inmuebles"\)/g, 'fetch("/api/inmobiliaria/inmuebles?t=" + Date.now(), { cache: "no-store" })');
  
  // also fix the one with template literal
  const regex = /fetch\(`\/api\/inmobiliaria\/inmuebles\?propietarioEmail=\$\{encodeURIComponent\(session!\.email\)\}`\)/g;
  const rep = 'fetch(`/api/inmobiliaria/inmuebles?propietarioEmail=${encodeURIComponent(session!.email)}&t=${Date.now()}`, { cache: "no-store" })';
  content = content.replace(regex, rep);

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

fixFetchCache('src/app/(public)/inmobiliaria/page.tsx');
fixFetchCache('src/app/(public)/inmobiliaria/mi-portal/page.tsx');
