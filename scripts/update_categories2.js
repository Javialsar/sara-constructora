const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Reading Excel file...");
  const wb = xlsx.readFile('public/APU-EXCEL-V7.xlsm');
  const matSheet = wb.Sheets['MAT'];
  const json = xlsx.utils.sheet_to_json(matSheet, { header: 1 });

  let currentCategory = 'Materiales Generales';
  const categoryMap = new Map();

  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    if (row.length > 1 && typeof row[1] === 'string') {
      const val = row[1].trim();
      if (!row[0] && val === val.toUpperCase() && val !== 'POR KM' && val !== 'DESCRIPCIÓN' && val.length > 3) {
        currentCategory = val;
      } else if (row[0] && typeof row[0] === 'number') {
        categoryMap.set(val, currentCategory);
      }
    }
  }

  console.log(`Found ${categoryMap.size} material categorizations in Excel.`);

  let allMateriales = [];
  let from = 0;
  let to = 999;
  
  console.log("Fetching ALL materials from database...");
  while (true) {
    const { data: materiales, error } = await supabase
      .from('insumos')
      .select('id, nombre')
      .eq('tipo', 'material')
      .range(from, to);
      
    if (error) {
      console.error("Error fetching materials:", error);
      return;
    }
    
    if (!materiales || materiales.length === 0) break;
    
    allMateriales = allMateriales.concat(materiales);
    from += 1000;
    to += 1000;
  }

  console.log(`Found ${allMateriales.length} total materials in database.`);
  
  let matchCount = 0;
  const updates = [];
  
  for (const mat of allMateriales) {
    const cat = categoryMap.get(mat.nombre.trim());
    if (cat) {
      matchCount++;
      updates.push({ id: mat.id, categoria: cat });
    }
  }

  console.log(`Matched ${matchCount} materials with Excel categories. Updating...`);

  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const promises = chunk.map(u => 
      supabase.from('insumos').update({ categoria: u.categoria }).eq('id', u.id)
    );
    await Promise.all(promises);
    process.stdout.write(`\rUpdated ${Math.min(i + chunkSize, updates.length)} / ${updates.length}`);
  }
  
  console.log("\nUpdate complete!");
}

main().catch(console.error);
