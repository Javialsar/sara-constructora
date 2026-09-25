const fs = require('fs');

let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// Extract QuantityInput
const regex = /const QuantityInput = \(\{ item, handleUpdateCantidad \}: \{ item: any, handleUpdateCantidad: any \}\) => \{[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\};\s*/;
const match = c.match(regex);

if (match) {
  // Remove from current position
  c = c.replace(regex, '');
  
  // Insert after imports (e.g. after 'export default function')
  const componentToInject = match[0];
  c = c.replace('export default function RubrosPage() {', componentToInject + '\nexport default function RubrosPage() {');
  
  fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
} else {
  console.log("Could not find QuantityInput to move");
}
