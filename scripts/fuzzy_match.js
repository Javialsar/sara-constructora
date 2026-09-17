require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanString(str) {
    if (!str) return '';
    return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}

async function run() {
    console.log("Reading Excel...");
    const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
    const excelInsumos = {}; 
    
    const matRows = XLSX.utils.sheet_to_json(workbook.Sheets['MAT'], { header: 1 });
    for (let i = 5; i < matRows.length; i++) {
        const row = matRows[i];
        if (row && row[0] && row[1] && typeof row[0] === 'number') {
            excelInsumos[row[0]] = { name: String(row[1]).trim(), type: 'material', unit: row[2], price: row[3] };
        }
    }
    
    console.log(`Found ${Object.keys(excelInsumos).length} items in MAT.`);
    
    const { data: dbInsumos } = await supabase.from('insumos').select('id, codigo, nombre');
    
    let matched = 0;
    let unmatched = 0;
    
    for (const code in excelInsumos) {
        const item = excelInsumos[code];
        const cleanedExcel = cleanString(item.name);
        
        const match = dbInsumos.find(db => cleanString(db.nombre) === cleanedExcel);
        if (match) {
            item.dbId = match.id;
            matched++;
        } else {
            unmatched++;
            if (unmatched < 10) console.log(`Unmatched: "${item.name}"`);
        }
    }
    
    console.log(`Insumos matched (fuzzy): ${matched}. Unmatched: ${unmatched}.`);
}
run();
