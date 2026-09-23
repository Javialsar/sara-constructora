import re

with open('src/app/admin/apus/insumos/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove formData.tipo === 'material' && ( ) around the provider selection
# Let's find the provider block.
provider_start = code.find('<Truck size={14} className="text-gray-500" />')
# Actually, let's just find the exact block and replace it.
# The block is wrapped in {formData.tipo === 'material' && ( <div> ... </div> )}

new_select_ui = r"""<div className="col-span-2">
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
                  </div>"""

# I need to match the whole `{formData.tipo === 'material' && ( <div> ... </div> )}`
# Let's find its boundaries.
pattern = r"\{formData\.tipo === 'material' && \(\s*<div>\s*<label.*?Vincular un proveedor.*?</p>\s*</div>\s*\)\}"
code = re.sub(pattern, new_select_ui, code, flags=re.DOTALL)

with open('src/app/admin/apus/insumos/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Modal patched perfectly!")
