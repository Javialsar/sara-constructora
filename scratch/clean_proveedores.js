const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanProveedores() {
  const { data: allProv, error } = await supabase.from('proveedores').select('*');
  if (error) { console.error(error); return; }
  
  const map = new Map();
  allProv.forEach(p => {
    const normalized = (p.razon_social || '').trim().toLowerCase();
    if (!map.has(normalized)) map.set(normalized, []);
    map.get(normalized).push(p);
  });
  
  const groups = Array.from(map.values()).filter(items => items.length > 1);
  console.log(`Found ${groups.length} groups of duplicate proveedores.`);
  
  let deleted = 0;
  for (const items of groups) {
    items.sort((a, b) => a.id.localeCompare(b.id)); // primary is oldest
    const primary = items[0];
    const dupIds = items.slice(1).map(i => i.id);
    
    // update insumo_proveedores
    await supabase.from('insumo_proveedores').update({ proveedor_id: primary.id }).in('proveedor_id', dupIds);
    
    // delete dups
    const { error: err } = await supabase.from('proveedores').delete().in('id', dupIds);
    if (!err) deleted += dupIds.length;
    else console.error('Error deleting prov:', err);
  }
  
  console.log(`Deleted ${deleted} duplicate proveedores.`);
}
cleanProveedores();
