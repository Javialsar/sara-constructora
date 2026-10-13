const fs = require('fs');
let data = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
data = data.replace('router.push("/admin/login")', 'router.push("/login")');
fs.writeFileSync('src/app/dashboard/layout.tsx', data);
console.log("Patched successfully");
