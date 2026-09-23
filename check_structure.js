const fs = require('fs');
const c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const regex = /<input type="number"[^>]*pmaq1[^>]*>/;
const match = c.match(regex);
console.log("MATCH:", match[0]);

const start = c.indexOf(match[0]) - 50;
console.log("SURROUNDING:");
console.log(c.substring(start, start + 200));
