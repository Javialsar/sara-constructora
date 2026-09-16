const fs = require('fs');
const b64 = fs.readFileSync('public/membrete.png').toString('base64');
const content = `export const membreteBase64 = "data:image/png;base64,${b64}";\n`;
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/membreteBase64.ts', content);
console.log('Base64 generated!');
