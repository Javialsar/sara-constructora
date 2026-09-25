const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

c = c.replace(/const selectFamilia = \(id: string\) => \{/, 'const selectFamilia = (id: string) => {\n    setSearchTerm("");\n    setCurrentPage(1);');
c = c.replace(/const selectSubfamilia = \(id: string, familiaId: string\) => \{/, 'const selectSubfamilia = (id: string, familiaId: string) => {\n    setSearchTerm("");\n    setCurrentPage(1);');

c = c.replace(/onClick=\{\(\) => \{ setSelectedFamilia\(null\); setSelectedSubfamilia\(null\) \}\}/, 'onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null); setSearchTerm(""); setCurrentPage(1); }}');

fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
console.log('Done!');
