const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanDuplicates() {
  console.log('Fetching all insumos...');
  let allData = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await supabase.from('insumos').select('*').range(from, from + step - 1);
    if (error) { console.error('Error fetching data:', error); return; }
    if (data && data.length > 0) {
      allData = allData.concat(data);
      if (data.length < step) break;
      from += step;
    } else {
      break;
    }
  }
  
  console.log(`Total insumos fetched: ${allData.length}`);
  
  const map = new Map();
  allData.forEach(item => {
    const normalized = (item.nombre || '').trim().toLowerCase();
    if (!map.has(normalized)) map.set(normalized, []);
    map.get(normalized).push(item);
  });
  
  const groups = Array.from(map.values()).filter(items => items.length > 1);
  console.log(`Found ${groups.length} groups of duplicates.`);
  
  let processedGroups = 0;
  let totalDeleted = 0;
  
  for (const items of groups) {
    items.sort((a, b) => {
      if (a.subfamilia_id && !b.subfamilia_id) return -1;
      if (!a.subfamilia_id && b.subfamilia_id) return 1;
      if ((a.precio_sin_iva || 0) > 0 && !(b.precio_sin_iva > 0)) return -1;
      if (!(a.precio_sin_iva > 0) && (b.precio_sin_iva || 0) > 0) return 1;
      return a.id.localeCompare(b.id);
    });
    
    const primary = items[0];
    const duplicates = items.slice(1);
    const dupIds = duplicates.map(d => d.id);
    
    // 1. Update rubro_insumos
    await supabase.from('rubro_insumos').update({ insumo_id: primary.id }).in('insumo_id', dupIds);
    
    // 2. Update presupuesto_rubro_insumos
    await supabase.from('presupuesto_rubro_insumos').update({ insumo_id: primary.id }).in('insumo_id', dupIds);
    
    // 3. Delete from insumo_proveedores
    await supabase.from('insumo_proveedores').delete().in('insumo_id', dupIds);
    
    // 4. Delete from insumos
    const { error: err3 } = await supabase.from('insumos').delete().in('id', dupIds);
    if (err3) {
      console.error(`Error deleting insumos for ${primary.nombre}:`, err3.message);
    } else {
      totalDeleted += dupIds.length;
    }
    
    processedGroups++;
    if (processedGroups % 100 === 0) {
      console.log(`Processed ${processedGroups}/${groups.length} groups. Deleted ${totalDeleted} duplicates so far...`);
    }
  }
  
  console.log(`Finished! Total deleted: ${totalDeleted}`);
}

cleanDuplicates();
