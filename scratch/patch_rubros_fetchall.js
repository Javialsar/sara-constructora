const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const regexFetchAll = /const fetchAll = async \(table: string, filter\?: \{col: string, val: string\}\) => \{[\s\S]*?return allData;\s*\}/;

const newFetchAll = `const fetchAll = async (table: string, filter?: {col: string, val: string}) => {
      let qCount = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) qCount = qCount.eq(filter.col, filter.val);
      const { count } = await qCount;
      if (!count) return [];

      let allData: any[] = [];
      const step = 1000;
      const reqs = [];
      for (let i = 0; i < count; i += step) {
        let q = supabase.from(table).select('*');
        if (filter) q = q.eq(filter.col, filter.val);
        reqs.push(q.range(i, i + step - 1));
      }
      
      const results = await Promise.all(reqs);
      for (const { data } of results) {
         if (data) allData = allData.concat(data);
      }
      return allData;
    }`;

if (c.match(regexFetchAll)) {
   c = c.replace(regexFetchAll, newFetchAll);
   fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
   console.log('Patched fetchAll parallel');
} else {
   console.log('Not found');
}
