import re

with open("src/app/admin/presupuestos_reales/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Add 'Copy' to imports
if "Copy" not in c and "lucide-react" in c:
    c = c.replace("Trash2, X, ArrowLeft,", "Trash2, X, ArrowLeft, Copy,")

# 2. Add handleClonePresupuesto function
clone_fn = """
  const handleClonePresupuesto = async (presupuesto: any, e: any) => {
    e.stopPropagation();
    if (!confirm(`¿Estás seguro de duplicar el presupuesto "${presupuesto.nombre_proyecto}"? Se copiarán todos sus rubros e insumos.`)) return;

    try {
      const { id, created_at, costo_directo_total, gran_total, ...parentData } = presupuesto;
      
      // 1. Insert new budget
      const { data: newPresupuesto, error: errParent } = await supabase.from('presupuestos_reales').insert([{
        ...parentData,
        nombre_proyecto: parentData.nombre_proyecto + " (Copia)",
        estado: 'Borrador'
      }]).select().single();
      
      if (errParent) throw errParent;

      // 2. Fetch old rubros
      const { data: oldRubros } = await supabase.from('presupuesto_rubros').select('*').eq('presupuesto_id', id);
      
      if (oldRubros && oldRubros.length > 0) {
        // We will insert rubros one by one to reliably map their new IDs for their insumos
        for (const oldRubro of oldRubros) {
          const { id: oldRubroId, created_at: cat, ...rData } = oldRubro;
          
          const { data: newRubro, error: errRubro } = await supabase.from('presupuesto_rubros').insert([{
            ...rData,
            presupuesto_id: newPresupuesto.id
          }]).select().single();
          
          if (errRubro) throw errRubro;

          // Fetch old insumos for this specific rubro
          const { data: oldInsumos } = await supabase.from('presupuesto_rubro_insumos').select('*').eq('presupuesto_rubro_id', oldRubroId);
          
          if (oldInsumos && oldInsumos.length > 0) {
            const insumosPayload = oldInsumos.map((ins: any) => {
              const { id: oldInsId, created_at: catIns, ...iData } = ins;
              return {
                ...iData,
                presupuesto_rubro_id: newRubro.id
              };
            });
            await supabase.from('presupuesto_rubro_insumos').insert(insumosPayload);
          }
        }
      }
      
      alert("¡Presupuesto clonado con éxito!");
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      
    } catch (error: any) {
      console.error("Error al clonar:", error);
      alert("Ocurrió un error al clonar el presupuesto. Revisa la consola.");
    }
  }

  const handleDeletePresupuesto = async"""

c = c.replace("const handleDeletePresupuesto = async", clone_fn)

# 3. Inject Clone button in the view
old_td = """<td className="px-6 py-3 text-center"><span className="text-brand-sage font-bold mr-2 text-xs">Editar / Ver</span>{userRole === 'admin' && <button onClick={(e) => handleDeletePresupuesto(p.id, e)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={16}/></button>}</td>"""
new_td = """<td className="px-6 py-3 text-center">
  <span className="text-brand-sage font-bold mr-2 text-xs">Editar / Ver</span>
  {userRole === 'admin' && (
    <>
      <button onClick={(e) => handleClonePresupuesto(p, e)} title="Duplicar Presupuesto" className="text-gray-400 hover:text-blue-500 p-1.5 transition-colors"><Copy size={16}/></button>
      <button onClick={(e) => handleDeletePresupuesto(p.id, e)} title="Eliminar Presupuesto" className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"><Trash2 size={16}/></button>
    </>
  )}
</td>"""

c = c.replace(old_td, new_td)

with open("src/app/admin/presupuestos_reales/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
