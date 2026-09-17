const fs = require('fs');
let c = fs.readFileSync('scripts/import_apu_to_db.js', 'utf8');
c = c.replace(/codigo:\s*`RUB-EXC-\$\{code\}`/g, 'codigo: `RUB-EXC-${code}`.substring(0, 20)');
c = c.replace(/unidad:\s*String\(unit\)\.trim\(\)/g, 'unidad: String(unit).trim().substring(0, 20)');
// And since I previously replaced `EXC-B` with `EXC-C`, let's do `EXC-D` just to be safe.
c = c.replace(/MAT-EXC-C-/g, 'MAT-EXC-D-').replace(/EQ-EXC-C-/g, 'EQ-EXC-D-').replace(/MO-EXC-C-/g, 'MO-EXC-D-');
fs.writeFileSync('scripts/import_apu_to_db.js', c);
