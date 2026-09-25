require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testClone() {
  const { data: presupuestos } = await supabase.from('presupuestos_reales').select('*').limit(1)
  if (!presupuestos || presupuestos.length === 0) return console.log("No presupuestos found")
  
  const p = presupuestos[0]
  console.log("Original budget:", p.id, p.nombre_proyecto)
  
  const { id, created_at, updated_at, costo_directo_total, gran_total, clientes, proyectos, ...parentData } = p
  parentData.nombre_proyecto = p.nombre_proyecto + " (Prueba CLI)"
  
  const { data: newP, error } = await supabase.from('presupuestos_reales').insert([parentData]).select().single()
  
  if (error) {
    console.error("ERROR CLONING PARENT:", error)
    return
  } 
  
  console.log("SUCCESS CLONING PARENT!", newP.id)
  
  const { data: oldRubros } = await supabase.from('presupuesto_rubros').select('*').eq('presupuesto_id', id);
  console.log("Old Rubros count:", oldRubros?.length)

  if (oldRubros && oldRubros.length > 0) {
    for (const oldRubro of oldRubros) {
      const { id: oldRubroId, created_at: cat, updated_at: ucat, ...rData } = oldRubro;
      
      const { data: newRubro, error: errRubro } = await supabase.from('presupuesto_rubros').insert([{
        ...rData,
        presupuesto_id: newP.id
      }]).select().single();
      
      if (errRubro) {
        console.error("ERROR CLONING RUBRO:", errRubro)
        return
      }

      const { data: oldInsumos } = await supabase.from('presupuesto_rubro_insumos').select('*').eq('presupuesto_rubro_id', oldRubroId);
      
      if (oldInsumos && oldInsumos.length > 0) {
        const insumosPayload = oldInsumos.map((ins) => {
          const { id: oldInsId, created_at: catIns, updated_at: ucatIns, ...iData } = ins;
          return {
            ...iData,
            presupuesto_rubro_id: newRubro.id
          };
        });
        const { error: errIns } = await supabase.from('presupuesto_rubro_insumos').insert(insumosPayload);
        if (errIns) {
            console.error("ERROR CLONING INSUMOS:", errIns)
            return
        }
      }
    }
  }
  
  console.log("SUCCESS FULL CLONE!")
  await supabase.from('presupuestos_reales').delete().eq('id', newP.id)
}

testClone()
