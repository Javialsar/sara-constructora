const fs = require('fs');

let code = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf8');

// 1. Add insumoProvMap to state
code = code.replace(
  'const [insumos, setInsumos] = useState<Insumo[]>([])',
  'const [insumos, setInsumos] = useState<Insumo[]>([])\n  const [insumoProvMap, setInsumoProvMap] = useState<Record<string, string[]>>({})'
)

// 2. Add proveedores_ids to formData initialization
code = code.replace(
  'proveedor_id: ""\n  })',
  'proveedor_id: "",\n    proveedores_ids: [] as string[]\n  })'
)
code = code.replace(
  'proveedor_id: "" \n    })',
  'proveedor_id: "",\n      proveedores_ids: []\n    })'
)

// 3. Update fetchData
const fetchReplacement = `
    // Fetch Insumo_Proveedores
    const { data: dataIP } = await supabase.from('insumo_proveedores').select('*')
    if (dataIP) {
      const map: Record<string, string[]> = {}
      dataIP.forEach((ip: any) => {
        if (!map[ip.insumo_id]) map[ip.insumo_id] = []
        map[ip.insumo_id].push(ip.proveedor_id)
      })
      setInsumoProvMap(map)
    }

    setLoading(false)`

code = code.replace('setLoading(false)', fetchReplacement)

// 4. Update handleEdit
const editReplacement = `proveedor_id: insumo.proveedor_id || "",
      proveedores_ids: insumoProvMap[insumo.id] || (insumo.proveedor_id ? [insumo.proveedor_id] : [])`
code = code.replace('proveedor_id: insumo.proveedor_id || ""', editReplacement)

// 5. Update handleSubmit
const oldSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Limpiar el proveedor si está vacío para que se guarde como NULL en BD
    const payload = {
      ...formData,
      proveedor_id: formData.proveedor_id === "" ? null : formData.proveedor_id,
      fecha_actualizacion: new Date().toISOString()
    }
    
    if (editingId) {
      const { error } = await supabase
        .from('insumos')
        .update(payload)
        .eq('id', editingId)
        
      setSaving(false)
      if (!error) {
        closeModal()
        fetchData()
      } else {
        alert("Error al actualizar el insumo.")
        console.error(error)
      }
    } else {
      const { error } = await supabase
        .from('insumos')
        .insert([payload])

      setSaving(false)
      if (!error) {
        closeModal()
        fetchData()
      } else {
        alert("Error al guardar el insumo. Verifica que el código no esté duplicado.")
        console.error(error)
      }
    }
  }`

const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const provId = formData.proveedores_ids.length > 0 ? formData.proveedores_ids[0] : null
    const payload = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      unidad: formData.unidad,
      tipo: formData.tipo,
      categoria: formData.categoria,
      precio_sin_iva: formData.precio_sin_iva,
      proveedor_id: provId,
      fecha_actualizacion: new Date().toISOString()
    }
    
    let targetId = editingId;

    if (editingId) {
      const { error } = await supabase.from('insumos').update(payload).eq('id', editingId)
      if (error) {
        alert("Error al actualizar el insumo.")
        console.error(error)
        setSaving(false)
        return
      }
    } else {
      const { data, error } = await supabase.from('insumos').insert([payload]).select()
      if (error || !data) {
        alert("Error al guardar el insumo. Verifica que el código no esté duplicado.")
        console.error(error)
        setSaving(false)
        return
      }
      targetId = data[0].id
    }

    if (targetId) {
      await supabase.from('insumo_proveedores').delete().eq('insumo_id', targetId)
      if (formData.proveedores_ids.length > 0) {
        const insertData = formData.proveedores_ids.map(pid => ({ insumo_id: targetId, proveedor_id: pid }))
        await supabase.from('insumo_proveedores').insert(insertData)
      }
    }

    setSaving(false)
    closeModal()
    fetchData()
  }`

code = code.replace(oldSubmit, newSubmit)

// 6. Update table rendering
const oldTableRender = `{insumo.proveedor_id && (
                          <span className="text-brand-sage">
                            Prov: {proveedores.find(p => p.id === insumo.proveedor_id)?.razon_social || "Desconocido"}
                          </span>
                        )}`

const newTableRender = `{(insumoProvMap[insumo.id]?.length > 0) ? (
                          <span className="text-brand-sage leading-tight line-clamp-1" title={insumoProvMap[insumo.id].map(pid => proveedores.find(p => p.id === pid)?.razon_social).filter(Boolean).join(', ')}>
                            Prov: {insumoProvMap[insumo.id].map(pid => proveedores.find(p => p.id === pid)?.razon_social).filter(Boolean).join(', ')}
                          </span>
                        ) : insumo.proveedor_id && (
                          <span className="text-brand-sage leading-tight line-clamp-1">
                            Prov: {proveedores.find(p => p.id === insumo.proveedor_id)?.razon_social || "Desconocido"}
                          </span>
                        )}`

code = code.replace(oldTableRender, newTableRender)


// 7. Update Modal Provider Selector
const oldSelect = `<select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage transition-all outline-none bg-white"
                      value={formData.proveedor_id}
                      onChange={e => setFormData({...formData, proveedor_id: e.target.value})}
                    >
                      <option value="">-- Ningún proveedor / Proveedor Genérico --</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.razon_social}</option>
                      ))}
                    </select>`

const newSelect = `<div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto bg-white p-2">
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
                    </div>`

code = code.replace(oldSelect, newSelect)

fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', code)
console.log("Insumos multiproveedor patched successfully!")
