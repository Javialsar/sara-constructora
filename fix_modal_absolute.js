const fs = require('fs');

let code = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf8');

// The block starts with {formData.tipo === 'material' && (
// Let's use substring replacement from that exact start up to the closing )} of that block.

const startIdx = code.indexOf("{formData.tipo === 'material' && (");
if (startIdx !== -1) {
    const endIdx = code.indexOf(")}", startIdx);
    
    if (endIdx !== -1) {
        const replacement = `<div className="col-span-2 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
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
                  </div>`;
        
        // Notice we replaced the `{formData...}` wrapper entirely, so it will always render!
        code = code.substring(0, startIdx) + replacement + code.substring(endIdx + 2);
        
        fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', code);
        console.log("Replaced perfectly!");
    }
} else {
    console.log("Could not find start");
}
