import os
import re

f = 'src/app/dashboard/presupuestos_reales/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# 1. Add bimDataToProcess state
if 'const [bimDataToProcess, setBimDataToProcess] = useState<any[] | null>(null)' not in c:
    c = c.replace('const [isBimModalOpen, setIsBimModalOpen] = useState(false)', 'const [isBimModalOpen, setIsBimModalOpen] = useState(false)\n  const [bimDataToProcess, setBimDataToProcess] = useState<any[] | null>(null)')

# 2. Add processBimData function
process_fn = """
  const processBimData = async (presupuestoId: string, bimData: any[]) => {
      const { data: dbRubros } = await supabase.from('rubros').select('*');
      if (!dbRubros) return;
      
      let added = 0;
      for (const row of bimData) {
         const material = row['Material'] || row['Name'] || row['Nombre'] || Object.values(row)[0];
         let cantidadStr = row['Volume'] || row['Area'] || row['Count'] || row['Cantidad'] || Object.values(row)[1];
         let cantidad = parseFloat(String(cantidadStr).replace(',', '.').replace(/[^0-9.]/g, '')) || 1;

         if (!material) continue;

         // Buscar rubro maestro
         const matchedRubro = dbRubros.find(r => r.nombre.toLowerCase().includes(String(material).toLowerCase()));
         if (matchedRubro) {
             const subtotal = matchedRubro.total_costo_directo * cantidad;
             const { data: newPresRubro, error } = await supabase.from('presupuesto_rubros').insert([{
                 presupuesto_id: presupuestoId,
                 rubro_id: matchedRubro.id,
                 codigo_rubro: matchedRubro.codigo,
                 nombre_rubro: matchedRubro.nombre,
                 unidad: matchedRubro.unidad,
                 precio_unitario_snapshot: matchedRubro.total_costo_directo,
                 cantidad_obra: cantidad,
                 subtotal: subtotal
             }]).select().single()

             if (error) continue;

             // clonar receta
             const { data: recetaMaestra } = await supabase.from('rubro_insumos').select('insumo_id, cantidad, insumo:insumos(precio_sin_iva)').eq('rubro_id', matchedRubro.id)
             if (recetaMaestra && recetaMaestra.length > 0) {
                const clonedRecipe = recetaMaestra.map(rm => {
                  const insumoObj = Array.isArray(rm.insumo) ? rm.insumo[0] : rm.insumo;
                  return {
                    presupuesto_rubro_id: newPresRubro.id,
                    insumo_id: rm.insumo_id,
                    cantidad: rm.cantidad,
                    precio_sin_iva_snapshot: insumoObj ? insumoObj.precio_sin_iva : 0
                  }
                });
                await supabase.from('presupuesto_rubro_insumos').insert(clonedRecipe);
             }
             added++;
         }
      }
      alert(`✅ SARA procesó el archivo BIM. Se vincularon exitosamente ${added} cuantificaciones con rubros existentes.`);
      fetchPresupuestoRubros(presupuestoId);
  }
"""
if 'const processBimData' not in c:
    c = c.replace('const openEditor = async (presupuesto) => {', process_fn + '\n  const openEditor = async (presupuesto) => {')

# 3. Update createMutation to call processBimData
target_mutation = """    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setIsNewModalOpen(false);
      openEditor(data);
      resetNewForm();
    }"""
replacement_mutation = """    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setIsNewModalOpen(false);
      openEditor(data);
      resetNewForm();

      if (bimDataToProcess && bimDataToProcess.length > 0) {
          await processBimData(data.id, bimDataToProcess);
          setBimDataToProcess(null);
      }
    }"""
if 'await processBimData(data.id, bimDataToProcess)' not in c:
    c = c.replace(target_mutation, replacement_mutation)


# 4. Update the Modal's onImport to set bimDataToProcess instead of alert
target_onimport = """          onImport={(data) => {
            alert(`SARA procesará estos ${data.length} registros y creará un Presupuesto automáticamente. (Fase 2 de Desarrollo)`);
            setIsBimModalOpen(false);
            setIsNewModalOpen(true);
          }}"""
replacement_onimport = """          onImport={(data) => {
            setBimDataToProcess(data);
            setIsBimModalOpen(false);
            setIsNewModalOpen(true);
          }}"""
c = c.replace(target_onimport, replacement_onimport)


with open(f, 'w', encoding='utf-8') as file: file.write(c)
