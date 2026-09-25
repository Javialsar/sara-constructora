require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testClone() {
  const { data: presupuestos } = await supabase.from('presupuestos_reales').select('*').limit(1)
  const p = presupuestos[0]
  
  const { id, created_at, updated_at, costo_directo_total, gran_total, clientes, proyectos, ...parentData } = p
  console.log(Object.keys(parentData))
}

testClone()
