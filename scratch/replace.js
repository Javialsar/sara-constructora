const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/presupuestos_reales/page.tsx', 'utf8');

// 1. registerNew("nombre_proyecto")
c = c.replace(/<select \{\.\.\.registerNew\("nombre_proyecto"\)\} className=\{`w-full border rounded p-2 \$\{newErrors\.nombre_proyecto \? 'border-red-500' : ''\}`\}>\s*<option value="" disabled>-- Seleccione --<\/option>\s*\{proyectosCRM\.map\(\(p: any\) => <option key=\{p\.id\} value=\{p\.nombre\}>\{p\.nombre\} \{p\.cliente \? `\(\$\{p\.cliente\.nombre\} \$\{p\.cliente\.apellido\}\)` : ''\}<\/option>\)\}\s*<\/select>/g,
  `<AsyncSelect
    table="proyectos"
    selectFields="id, nombre, cliente_id, cliente:clientes(id, nombre, apellido, email)"
    searchColumns={['nombre']}
    displayFormat={(p) => p ? \`\${p.nombre} \${p.cliente ? \`(\${p.cliente.nombre} \${p.cliente.apellido})\` : ''}\` : ''}
    value={null}
    onChange={(p) => setNewValue("nombre_proyecto", p ? p.nombre : "")}
    placeholder="-- Buscar proyecto... --"
    className={\`w-full \${newErrors.nombre_proyecto ? 'border-red-500' : ''}\`}
  />`
);

// 2. cloneProyectoCrmId
c = c.replace(/<select\s*value=\{cloneProyectoCrmId\}\s*onChange=\{\(e\) => handleSelectCrmProjectForClone\(e\.target\.value\)\}\s*className="w-full border border-gray-300 rounded-xl p-2\.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"\s*>\s*<option value="">-- Selecciona un proyecto existente --<\/option>\s*\{proyectosCRM\.map\(\(p: any\) => \(\s*<option key=\{p\.id\} value=\{p\.id\}>\s*\{p\.nombre\} \{p\.cliente \? `\(Cliente: \$\{p\.cliente\.nombre\} \$\{p\.cliente\.apellido\}\)` : ''\}\s*<\/option>\s*\)\)\}\s*<\/select>/g,
  `<AsyncSelect
    table="proyectos"
    selectFields="id, nombre, cliente_id, cliente:clientes(id, nombre, apellido, email)"
    searchColumns={['nombre']}
    displayFormat={(p) => p ? \`\${p.nombre} \${p.cliente ? \`(\${p.cliente.nombre} \${p.cliente.apellido})\` : ''}\` : ''}
    value={cloneProyectoCrmId ? { id: cloneProyectoCrmId, nombre: cloneNombreProyecto } : null}
    onChange={(p) => {
      if (p) {
        setCloneProyectoCrmId(p.id);
        setCloneNombreProyecto(p.nombre);
        if (p.cliente_id) setCloneClienteId(p.cliente_id);
      } else {
        setCloneProyectoCrmId('');
        setCloneNombreProyecto(cloneSource.nombre_proyecto + ' (Copia)');
      }
    }}
    placeholder="-- Buscar proyecto... --"
    className="w-full min-w-0"
  />`
);

// 3. metaProyectoCrmId
c = c.replace(/<select\s*value=\{metaProyectoCrmId\}\s*onChange=\{\(e\) => handleSelectCrmProjectForMeta\(e\.target\.value\)\}\s*className="w-full border border-gray-300 rounded-xl p-2\.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"\s*>\s*<option value="">-- Selecciona un proyecto existente --<\/option>\s*\{proyectosCRM\.map\(\(p: any\) => \(\s*<option key=\{p\.id\} value=\{p\.id\}>\s*\{p\.nombre\} \{p\.cliente \? `\(Cliente: \$\{p\.cliente\.nombre\} \$\{p\.cliente\.apellido\}\)` : ''\}\s*<\/option>\s*\)\)\}\s*<\/select>/g,
  `<AsyncSelect
    table="proyectos"
    selectFields="id, nombre, cliente_id, cliente:clientes(id, nombre, apellido, email)"
    searchColumns={['nombre']}
    displayFormat={(p) => p ? \`\${p.nombre} \${p.cliente ? \`(\${p.cliente.nombre} \${p.cliente.apellido})\` : ''}\` : ''}
    value={metaProyectoCrmId ? { id: metaProyectoCrmId, nombre: metaNombreProyecto } : null}
    onChange={(p) => {
      if (p) {
        setMetaProyectoCrmId(p.id);
        setMetaNombreProyecto(p.nombre);
        if (p.cliente_id) setMetaClienteId(p.cliente_id);
      } else {
        setMetaProyectoCrmId('');
        setMetaNombreProyecto('');
      }
    }}
    placeholder="-- Buscar proyecto... --"
    className="w-full min-w-0"
  />`
);

// 4. cloneClienteId
c = c.replace(/<select\s*value=\{cloneClienteId\}\s*onChange=\{\(e\) => setCloneClienteId\(e\.target\.value\)\}\s*className="w-full border border-gray-300 rounded-xl p-2\.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"\s*>\s*<option value="">-- Sin cliente asignado \(o definir luego\) --<\/option>\s*\{clientesCRM\.map\(\(c: any\) => \(\s*<option key=\{c\.id\} value=\{c\.id\}>\s*\{c\.nombre\} \{c\.apellido\} \{c\.email \? `\(\$\{c\.email\}\)` : ''\}\s*<\/option>\s*\)\)\}\s*<\/select>/g,
  `<AsyncSelect
    table="clientes"
    selectFields="id, nombre, apellido, email"
    searchColumns={['nombre', 'apellido', 'email']}
    displayFormat={(c) => c ? \`\${c.nombre} \${c.apellido}\` : ''}
    value={cloneClienteId ? { id: cloneClienteId, nombre: 'Cliente', apellido: 'Asignado' } : null}
    onChange={(c) => {
      if (c) {
        setCloneClienteId(c.id);
      } else {
        setCloneClienteId('');
      }
    }}
    placeholder="-- Buscar cliente... --"
    className="w-full min-w-0"
  />`
);

// 5. metaClienteId
c = c.replace(/<select\s*value=\{metaClienteId\}\s*onChange=\{\(e\) => setMetaClienteId\(e\.target\.value\)\}\s*className="w-full border border-gray-300 rounded-xl p-2\.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"\s*>\s*<option value="">-- Sin cliente asignado \(o definir luego\) --<\/option>\s*\{clientesCRM\.map\(\(c: any\) => \(\s*<option key=\{c\.id\} value=\{c\.id\}>\s*\{c\.nombre\} \{c\.apellido\} \{c\.email \? `\(\$\{c\.email\}\)` : ''\}\s*<\/option>\s*\)\)\}\s*<\/select>/g,
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
