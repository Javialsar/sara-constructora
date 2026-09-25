const fs = require('fs');

function patchFile(filepath) {
  let c = fs.readFileSync(filepath, 'utf-8');
  
  const oldFetchAll = /const fetchAll = async \([^)]*\) => \{[\s\S]*?return allData\s*\}/;
  
  const newFetchAll = `const fetchAll = async (table: string, orderCol?: string) => {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (!count) return [];
    
    const step = 1000;
    const reqs = [];
    for (let i = 0; i < count; i += step) {
      let query = supabase.from(table).select('*');
      if (orderCol) query = query.order(orderCol, { ascending: true });
      reqs.push(query.range(i, i + step - 1));
    }
    
    const results = await Promise.all(reqs);
    let allData: any[] = [];
    for (const { data, error } of results) {
      if (error) console.error('Error fetching ' + table, error);
      if (data) allData = allData.concat(data);
    }
    return allData;
  }`;

  c = c.replace(oldFetchAll, newFetchAll);
  fs.writeFileSync(filepath, c);
  console.log('Patched', filepath);
}

patchFile('src/app/admin/apus/insumos/page.tsx');
patchFile('src/app/admin/apus/rubros/page.tsx');
