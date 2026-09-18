const fs = require('fs');

let c = fs.readFileSync('src/app/admin/proveedores/page.tsx', 'utf8');

// 1. Update type Proveedor
c = c.replace(
  /type Proveedor = \{([\s\S]*?)dias_credito: number([\s\S]*?)\}/,
  `type Proveedor = {$1dias_credito: number$2  direccion?: string\n  sitio_web?: string\n}`
);

// 2. Update formData state
c = c.replace(
  /dias_credito: 0\n  \}\)/,
  `dias_credito: 0,\n    direccion: "",\n    sitio_web: ""\n  })`
);

// 3. Update Table headers
c = c.replace(
  /<th className="py-3 px-4 font-semibold">Contacto<\/th>\s*<th className="py-3 px-4 font-semibold">Teléfono \/ Email<\/th>/,
  `<th className="py-3 px-4 font-semibold">Ubicación / Sitio</th>
                  <th className="py-3 px-4 font-semibold">Contacto</th>
                  <th className="py-3 px-4 font-semibold">Teléfono / Email</th>`
);

// 4. Update Table rows
c = c.replace(
  /<td className="py-3 px-4 text-gray-600">\{prov.contacto_vendedor \|\| "-"\}<\/td>/g,
  `<td className="py-3 px-4 text-gray-600 text-sm">
                      <div className="line-clamp-1" title={prov.direccion}>{prov.direccion || "-"}</div>
                      {prov.sitio_web && (
                        <a href={prov.sitio_web} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1 mt-1">
                          <BookOpen size={10} /> Web
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{prov.contacto_vendedor || "-"}</td>`
);

// 5. Update form inside the modal
c = c.replace(
  /<label className="block text-sm font-medium text-gray-700 mb-1">RUC \/ Identificación<\/label>([\s\S]*?)<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto<\/label>/,
  `<label className="block text-sm font-medium text-gray-700 mb-1">RUC / Identificación</label>$1<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Ubicación</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Av. Principal 123"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                    value={formData.direccion || ''}
                    onChange={e => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                  <input 
                    type="text" 
                    placeholder="https://www.proveedor.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                    value={formData.sitio_web || ''}
                    onChange={e => setFormData({...formData, sitio_web: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>`
);

fs.writeFileSync('src/app/admin/proveedores/page.tsx', c);
console.log('Patched');
