const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/presupuestos_reales/page.tsx', 'utf8');

c = c.replace(/<select\s+value=\{metaClienteId\}\s+onChange=\{\(e\) => setMetaClienteId\(e\.target\.value\)\}\s+className="w-full border border-gray-300 rounded-xl p-2\.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"\s*>\s*<option value="">-- Sin cliente asignado --<\/option>\s*\{clientesCRM\.map\(\(c: any\) => \(\s*<option key=\{c\.id\} value=\{c\.id\}>\s*\{c\.nombre\} \{c\.apellido\} \{c\.email \? `\(\$\{c\.email\}\)` : ''\}\s*<\/option>\s*\)\)\}\s*<\/select>/g,
  `<AsyncSelect
    table="clientes"
    selectFields="id, nombre, apellido, email"
    searchColumns={['nombre', 'apellido', 'email']}
    displayFormat={(c) => c ? \`\${c.nombre} \${c.apellido}\` : ''}
    value={metaClienteId ? { id: metaClienteId, nombre: 'Cliente', apellido: 'Asignado' } : null}
    onChange={(c) => {
      if (c) {
        setMetaClienteId(c.id);
      } else {
        setMetaClienteId('');
      }
    }}
    placeholder="-- Buscar cliente... --"
    className="w-full min-w-0"
  />`
);

fs.writeFileSync('src/app/dashboard/presupuestos_reales/page.tsx', c);
