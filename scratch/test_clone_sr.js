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
  } else {
    console.log("SUCCESS CLONING PARENT!", newP.id)
    
    // delete it
    await supabase.from('presupuestos_reales').delete().eq('id', newP.id)
  }
}

testClone()
