require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Reading Excel...");
    const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
    
    // 1. Build Insumo Map from Excel (code -> name)
    const excelInsumos = {}; // id -> { name, type, price, unit }
    
    // Mats
    const matRows = XLSX.utils.sheet_to_json(workbook.Sheets['MAT'], { header: 1 });
    for (let i = 5; i < matRows.length; i++) {
        const row = matRows[i];
        if (row && row[0] && row[1] && typeof row[0] === 'number') {
            excelInsumos[row[0]] = { name: String(row[1]).trim(), type: 'material', unit: row[2], price: row[3] };
        }
    }
    
    // EQ
    const eqRows = XLSX.utils.sheet_to_json(workbook.Sheets['EQUIPO'], { header: 1 });
    for (let i = 4; i < eqRows.length; i++) {
        const row = eqRows[i];
        if (row && row[0] && row[1] && typeof row[0] === 'number') {
            excelInsumos[row[0]] = { name: String(row[1]).trim(), type: 'equipo', unit: 'h', price: row[3] };
        }
    }
    
    // MO
    const moRows = XLSX.utils.sheet_to_json(workbook.Sheets['SALARIOS EN DOLARES'], { header: 1 });
    for (let i = 10; i < moRows.length; i++) {
        const row = moRows[i];
        // The structure of MO is messy, usually code is around col 7?
        // Let's just try to parse what we can
        let code = row[7];
        let name = row[8];
        let price = row[19] || row[12];
        if (typeof code === 'number' && name) {
            excelInsumos[code] = { name: String(name).trim(), type: 'mano_de_obra', unit: 'h', price: price };
        }
    }
    
    console.log(`Found ${Object.keys(excelInsumos).length} items in Excel dictionaries.`);
    
    // 2. Fetch existing Supabase Insumos to match by name
    console.log("Fetching DB insumos...");
    const { data: dbInsumos } = await supabase.from('insumos').select('id, codigo, nombre');
    
    // 3. Match Excel Insumos to DB Insumos
    let matched = 0;
    let unmatched = 0;
    
    for (const code in excelInsumos) {
        const item = excelInsumos[code];
        const match = dbInsumos.find(db => db.nombre.toLowerCase().trim() === item.name.toLowerCase().trim());
        if (match) {
            item.dbId = match.id;
            matched++;
        } else {
            unmatched++;
        }
    }
    
    console.log(`Insumos matched by name: ${matched}. Unmatched: ${unmatched}.`);
    
    // 4. Parse Rubros
    console.log("Parsing RUBROS...");
    const rubroRows = XLSX.utils.sheet_to_json(workbook.Sheets['RUBROS'], { header: 1 });
    const headerRow = rubroRows[3]; // contains MT1, CM1 etc
    
    let rubrosCount = 0;
    for (let i = 4; i < rubroRows.length; i++) {
        const row = rubroRows[i];
        if (row && typeof row[0] === 'number') {
            rubrosCount++;
        }
    }
    
    console.log(`Found ${rubrosCount} Rubros Maestros in Excel.`);
}

run().catch(console.error);
