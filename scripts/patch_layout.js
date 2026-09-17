const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');

code = code.replace(
  'import "./globals.css";',
  'import "./globals.css";\nimport Providers from "@/lib/providers";'
);

code = code.replace(
  '{children}',
  '<Providers>\n          {children}\n        </Providers>'
);

fs.writeFileSync('src/app/layout.tsx', code);
console.log("Patched layout.tsx successfully.");
