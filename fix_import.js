const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';

let code = fs.readFileSync(path, 'utf8');

// The error is `List is not defined`. We need to import `List` from `lucide-react`.
code = code.replace(
  /import \{ (.*) \} from "lucide-react"/,
  'import { $1, List } from "lucide-react"'
);

fs.writeFileSync(path, code);
console.log('Added List to imports!');
