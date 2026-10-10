const fs = require('fs');
let c = fs.readFileSync('rewrite_admin_recharges.js', 'utf8');
c = c.replace('${recharge.amount.toFixed(2)}', '\\${recharge.amount.toFixed(2)}');
fs.writeFileSync('rewrite_admin_recharges.js', c);
