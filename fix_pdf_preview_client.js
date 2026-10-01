const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', 'utf8');

const regex = /<img src=\{comprobantePago\} alt="Comprobante" className="w-full h-full object-contain" \/>/;

const replacement = `{comprobantePago.startsWith('data:image') || comprobantePago.match(/\\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={comprobantePago} alt="Comprobante" className="w-full h-full object-contain" />
                        ) : (
                          <iframe src={comprobantePago} className="w-full h-full border-0 object-contain" title="Comprobante" />
                        )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/app/(public)/inmobiliaria/mi-portal/page.tsx', content);
console.log('Fixed PDF preview client portal');
