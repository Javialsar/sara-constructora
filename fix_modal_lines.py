import re

with open('src/app/admin/apus/insumos/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r"""                \{formData\.tipo === 'material' && \(
                  <div className="col-span-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Truck size=\{14\} className="text-gray-500" />
                      Proveedor Vinculado \(Opcional\)
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none bg-white"
                      value=\{formData\.proveedor_id\}
                      onChange=\{e => setFormData\(\{\.\.\.formData, proveedor_id: e\.target\.value\}\)\}
                    >
                      <option value="">-- Ningún proveedor / Proveedor Genérico --</option>
                      \{proveedores\.map\(p => \(
                        <option key=\{p\.id\} value=\{p\.id\}>\{p\.razon_social\}</option>
                      \)\)\}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Vincular un proveedor te permite saber a quién comprar este material cuando ganes la obra\.</p>
                  </div>
                \)}"""

replacement = """
                  <div className="col-span-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Truck size={14} className="text-gray-500" />
                      Proveedores Vinculados (Opcional)
                    </label>
                    <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto bg-white p-2">
                      {proveedores.map(p => (
                        <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer text-sm">
                          <input 
                            type="checkbox"
                            className="rounded text-brand-sage focus:ring-brand-sage w-4 h-4"
                            checked={formData.proveedores_ids.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, proveedores_ids: [...formData.proveedores_ids, p.id]})
                              } else {
                                setFormData({...formData, proveedores_ids: formData.proveedores_ids.filter(id => id !== p.id)})
                              }
                            }}
                          />
                          {p.razon_social}
                        </label>
                      ))}
                      {proveedores.length === 0 && <span className="text-gray-400 text-sm">No hay proveedores registrados.</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Vincular proveedores te permite saber a quién comprar o alquilar este recurso cuando ganes la obra.</p>
                  </div>
"""

# Let's replace line by line to be absolutely safe
lines = code.split('\n')
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{formData.tipo === 'material' && (" in line:
        start_idx = i
        # Find the end
        for j in range(i, i+30):
            if j < len(lines) and "Vincular un proveedor te permite saber a" in lines[j]:
                end_idx = j + 2  # The </p>, then </div>, then )}
                break
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + replacement.split('\n') + lines[end_idx+1:]
    code = '\n'.join(new_lines)
    with open('src/app/admin/apus/insumos/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched by line perfectly!")
else:
    print("Could not find block")
