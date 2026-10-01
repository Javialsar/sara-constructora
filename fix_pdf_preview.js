const fs = require('fs');
let content = fs.readFileSync('src/app/admin/inmobiliaria/page.tsx', 'utf8');

const regex = /<a href=\{pagoAValidar\.promocion\.comprobanteUrl\} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-8 text-blue-600 hover:text-blue-800">[\s\S]*?<\/a>/;

const replacement = `<iframe 
                        src={pagoAValidar.promocion.comprobanteUrl} 
                        className="w-full h-96 rounded-lg shadow-sm border-0" 
                        title="Comprobante"
                      />`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/app/admin/inmobiliaria/page.tsx', content);
console.log('Fixed PDF preview');
