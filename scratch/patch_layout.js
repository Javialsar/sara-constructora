const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

const hookStr = `
  useEffect(() => {
    if (!editingId && isModalOpen) {
      let famCode = formData.tipo.substring(0,3).toUpperCase();
      let subCode = 'GEN';
      
      if (formData.subfamilia_id) {
         const currentSub = subfamilias.find(s => s.id === formData.subfamilia_id);
         if (currentSub) {
            subCode = currentSub.nombre.substring(0,3).toUpperCase();
            const currentFam = familias.find(f => f.id === currentSub.familia_id);
            if (currentFam) {
               famCode = currentFam.nombre.substring(0,3).toUpperCase();
            }
         }
      }
      
      const itemsInSub = insumos.filter(i => formData.subfamilia_id ? i.subfamilia_id === formData.subfamilia_id : (!i.subfamilia_id && i.tipo === formData.tipo));
      let maxSeq = 0;
      itemsInSub.forEach(item => {
         const parts = item.codigo ? item.codigo.split('-') : [];
         if (parts.length > 0) {
           const numStr = parts[parts.length - 1];
           const num = parseInt(numStr, 10);
           if (!isNaN(num) && num > maxSeq) maxSeq = num;
         }
      });
      const seq = maxSeq + 1;
      const generatedCode = \`\${famCode}-\${subCode}-\${seq.toString().padStart(3, '0')}\`;
      setFormData(prev => prev.codigo !== generatedCode ? { ...prev, codigo: generatedCode } : prev);
    }
  }, [formData.subfamilia_id, formData.tipo, isModalOpen, editingId, insumos, familias, subfamilias]);

  const fetchData`;

c = c.replace(/const fetchData/, hookStr);

const modalHtmlOldRegex = /<form onSubmit=\{handleSubmit\} className="p-6 space-y-4\">[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">/;

const modalHtmlNew = `<form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Fila 1: Subgrupo y Tipo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo / Subgrupo</label>
                    <select value={formData.subfamilia_id} onChange={e => {
                        const newSubId = e.target.value;
                        let newTipo = formData.tipo;
                        if (newSubId) {
                           const currentSub = subfamilias.find(s => s.id === newSubId);
                           const currentFam = familias.find(f => f.id === currentSub?.familia_id);
                           if (currentFam && currentFam.grupo_sugerido) {
                              newTipo = currentFam.grupo_sugerido;
                           }
                        }
                        setFormData({...formData, subfamilia_id: newSubId, tipo: newTipo});
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                      <option value="">— Sin subgrupo —</option>
                      {familias.map(fam => (
                        <optgroup key={fam.id} label={fam.nombre}>
                          {subfsPorFamilia(fam.id).map(sf => (
                            <option key={sf.id} value={sf.id}>{sf.nombre}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo (Categoría) *</label>
                    <select required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                      <option value="material">Materiales</option>
                      <option value="equipo">Equipos y Maquinaria</option>
                      <option value="mano_de_obra">Mano de Obra</option>
                    </select>
                  </div>

                  {/* Fila 2: Código y Unidad */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                    <input type="text" placeholder="Ej. MAT-001" value={formData.codigo}
                      readOnly={!editingId}
                      onChange={e => setFormData({...formData, codigo: e.target.value})}
                      className={\`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 \${!editingId ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-mono' : 'border-gray-300 focus:border-brand-sage focus:ring-brand-sage'}\`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad de Medida *</label>
                    <input required type="text" placeholder="kg, m3, glb, h, u" value={formData.unidad}
                      onChange={e => setFormData({...formData, unidad: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                  </div>

                  {/* Fila 3: Nombre */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre / Descripción *</label>
                    <input required type="text" placeholder="Ej. Cemento Portland Tipo I (Saco 50kg)" value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                  </div>

                  {/* Fila 4: Precio y Proveedor */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Precio Ref. (sin IVA)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" step="0.0001" min="0" placeholder="0.0000" value={formData.precio_sin_iva || ''}
                        onChange={e => setFormData({...formData, precio_sin_iva: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Proveedor Principal</label>
                    <select value={formData.proveedor_id} onChange={e => setFormData({...formData, proveedor_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                      <option value="">— Sin proveedor —</option>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">`;

c = c.replace(modalHtmlOldRegex, modalHtmlNew);

fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
console.log('Done!');
