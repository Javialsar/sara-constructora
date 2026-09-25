const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

const oldCode = `      if (editingId) {
        const { error } = await supabase.from('insumos').update(payload).eq('id', editingId)
        if (!error) {
          await supabase.from('insumo_proveedores').delete().eq('insumo_id', editingId)
          if (proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map(pid => ({ insumo_id: editingId, proveedor_id: pid })))
          setSaving(false); closeModal(); fetchData()
        } else { setSaving(false); alert("Error al actualizar el insumo."); console.error(error) }
      } else {
        const { data: newInsumo, error } = await supabase.from('insumos').insert([payload]).select().single()
        if (!error && newInsumo) {
          if (proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map(pid => ({ insumo_id: newInsumo.id, proveedor_id: pid })))
          setSaving(false); closeModal(); fetchData()
        } else { setSaving(false); alert("Error al guardar. Verifica que el c\\u00f3digo no est\\u01f8 duplicado."); console.error(error) }
      }`;

const newCode = `      // Validación de duplicados por nombre exacto
      const normalizedName = payload.nombre.trim().toLowerCase();
      const existing = insumos.find(i => i.nombre.toLowerCase().trim() === normalizedName && i.id !== editingId);
      
      if (existing) {
        alert("Ya existe un insumo con este nombre. Para evitar duplicados, utiliza otro nombre.");
        setSaving(false);
        return;
      }

      if (editingId) {
        const { error } = await supabase.from('insumos').update(payload).eq('id', editingId)
        if (!error) {
          await supabase.from('insumo_proveedores').delete().eq('insumo_id', editingId)
          if (proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map(pid => ({ insumo_id: editingId, proveedor_id: pid })))
          setSaving(false); closeModal(); fetchData()
        } else { setSaving(false); alert("Error al actualizar el insumo."); console.error(error) }
      } else {
        const { data: newInsumo, error } = await supabase.from('insumos').insert([payload]).select().single()
        if (!error && newInsumo) {
          if (proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map(pid => ({ insumo_id: newInsumo.id, proveedor_id: pid })))
          setSaving(false); closeModal(); fetchData()
        } else { setSaving(false); alert("Error al guardar. Verifica los datos."); console.error(error) }
      }`;

// In case encoding characters are messed up, we use regex to match the else block
const regex = /if \(editingId\) \{[\s\S]*?else \{[\s\S]*?const \{ data: newInsumo, error \} = await supabase\.from\('insumos'\)\.insert\(\[payload\]\)\.select\(\)\.single\(\)[\s\S]*?\}\s*\}/;

c = c.replace(regex, newCode);
fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
console.log('Patched duplicate check');
