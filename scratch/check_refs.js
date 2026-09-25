const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function analyzeRefs() {
  // Fetch a small subset of duplicates to see if they are referenced
  let { data: allData } = await supabase.from('insumos').select('id, nombre');
  const map = new Map();
  allData.forEach(item => {
    const n = (item.nombre || '').trim().toLowerCase();
    if (!map.has(n)) map.set(n, []);
    map.get(n).push(item.id);
  });
  
  let dupIds = [];
  map.forEach((ids, name) => {
    if (ids.length > 1) {
      // Keep the first one, consider others duplicates
      dupIds = dupIds.concat(ids.slice(1));
    }
  });
  
  console.log('Total duplicate IDs:', dupIds.length);
  
  if (dupIds.length > 0) {
    // Check if any of these dupIds are in rubro_insumos
    const { data: refs, error } = await supabase.from('rubro_insumos').select('insumo_id').in('insumo_id', dupIds.slice(0, 1000));
    console.log('References found in first 1000 duplicates:', refs ? refs.length : error);
  }
}
analyzeRefs();
