const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDuplicates() {
  let allData = [];
  let from = 0;
  const step = 1000;
  
  while (true) {
    const { data, error } = await supabase.from('insumos').select('id, nombre, codigo').range(from, from + step - 1);
    if (error) { console.error('Error fetching data:', error); break; }
    if (data && data.length > 0) {
      allData = allData.concat(data);
      if (data.length < step) break;
      from += step;
    } else {
      break;
    }
  }
  
  console.log('Total insumos fetched:', allData.length);
  
  const map = new Map();
  allData.forEach(item => {
    const normalized = (item.nombre || '').trim().toLowerCase();
    if (!map.has(normalized)) map.set(normalized, []);
    map.get(normalized).push(item);
  });
  
  let duplicates = [];
  map.forEach((items, name) => {
    if (items.length > 1) {
      duplicates.push({ name, count: items.length, items });
    }
  });
  
  console.log('Total unique names with duplicates:', duplicates.length);
  const totalDupItems = duplicates.reduce((acc, curr) => acc + curr.count, 0) - duplicates.length;
  console.log('Total duplicate records to remove:', totalDupItems);
  
  if (duplicates.length > 0) {
    console.log('\nTop 5 duplicates by count:');
    duplicates.sort((a, b) => b.count - a.count).slice(0, 5).forEach(d => {
      console.log(`- "${d.name}": ${d.count} times (Codes: ${d.items.map(i => i.codigo).join(', ')})`);
    });
  }
  
  // Optionally delete duplicates here if instructed...
  // For now we just identify them to plan our deletion strategy.
}

checkDuplicates();
