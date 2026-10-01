const fs = require('fs');
let content = fs.readFileSync('src/app/api/inmobiliaria/inmuebles/route.ts', 'utf8');
const items = content.match(/codigo:\s*"(.*?)"/g);
console.log(items);
