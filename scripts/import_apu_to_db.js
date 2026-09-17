require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function cleanString(str) {
    if (!str) return '';
    return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}

async function run() {
    console.log("Reading Excel APU-EXCEL-V7.xlsm...");
    const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
    const excelInsumos = {}; 
    
    // Read MAT
    const matRows = XLSX.utils.sheet_to_json(workbook.Sheets['MAT'], { header: 1 });
    for (let i = 5; i < matRows.length; i++) {
        const row = matRows[i];
        if (row && typeof row[0] === 'number' && row[1]) {
            excelInsumos[row[0]] = { name: String(row[1]).trim().substring(0,255), type: 'material', unit: String(row[2] || 'u').trim(), price: Number(row[3]) || 0 };
        }
    }
    
    // Read EQ
    const eqRows = XLSX.utils.sheet_to_json(workbook.Sheets['EQUIPO'], { header: 1 });
    for (let i = 4; i < eqRows.length; i++) {
        const row = eqRows[i];
        if (row && typeof row[0] === 'number' && row[1]) {
            excelInsumos[row[0]] = { name: String(row[1]).trim().substring(0,255), type: 'equipo', unit: 'h', price: Number(row[3]) || 0 };
        }
    }
    
    // Read MO
    const moRows = XLSX.utils.sheet_to_json(workbook.Sheets['SALARIOS EN DOLARES'], { header: 1 });
    for (let i = 10; i < moRows.length; i++) {
        const row = moRows[i];
        let code = row[7];
        let name = row[8];
        let price = Number(row[19]) || Number(row[12]) || 0;
        if (typeof code === 'number' && name) {
            excelInsumos[code] = { name: String(name).trim().substring(0,255), type: 'mano_de_obra', unit: 'h', price: price };
        }
    }
    
    console.log(`Loaded ${Object.keys(excelInsumos).length} insumos from Excel.`);
    
    // Fetch DB insumos
    console.log("Fetching DB insumos...");
    let { data: dbInsumos } = await supabase.from('insumos').select('id, codigo, nombre');
    
    const dbInsumosByFuzzy = {};
    for (const db of dbInsumos) {
        dbInsumosByFuzzy[cleanString(db.nombre)] = db;
    }
    
    let toInsertInsumos = [];
    let matCount = 9000, eqCount = 9000, moCount = 9000;
    
    for (const code in excelInsumos) {
        const item = excelInsumos[code];
        const fuzzy = cleanString(item.name);
        
        if (dbInsumosByFuzzy[fuzzy]) {
            item.dbId = dbInsumosByFuzzy[fuzzy].id; // Map to existing
        } else {
            // Needs insert
            let newCode = '';
            if (item.type === 'material') newCode = `MAT-EXC-D-${matCount++}`;
            else if (item.type === 'equipo') newCode = `EQ-EXC-D-${eqCount++}`;
            else newCode = `MO-EXC-D-${moCount++}`;
            
            const newIns = {
                codigo: newCode,
                nombre: item.name.substring(0, 255),
                tipo: item.type,
                unidad: item.unit,
                precio_sin_iva: item.price
            };
            toInsertInsumos.push({ excelCode: code, data: newIns });
        }
    }
    
    console.log(`Matching: ${Object.keys(excelInsumos).length - toInsertInsumos.length} found in DB.`);
    console.log(`Need to insert ${toInsertInsumos.length} new insumos.`);
    
    // Insert new insumos in chunks
    const chunkSize = 500;
    for (let i = 0; i < toInsertInsumos.length; i += chunkSize) {
        const chunk = toInsertInsumos.slice(i, i + chunkSize);
        const { data, error } = await supabase.from('insumos').upsert(chunk.map(c => c.data), { onConflict: 'codigo' }).select('id, codigo, nombre');
        if (error) {
            console.error("Error inserting insumos:", error);
            return;
        }
        // Map back the generated IDs
        for (const inserted of data) {
            // find which excelCode it was
            const original = chunk.find(c => cleanString(c.data.nombre) === cleanString(inserted.nombre));
            if (original) {
                excelInsumos[original.excelCode].dbId = inserted.id;
            }
        }
        console.log(`Inserted chunk of ${chunk.length} insumos.`);
    }
    
    // Check if we have all mappings
    for (const code in excelInsumos) {
        if (!excelInsumos[code].dbId) {
            console.warn("WARNING: Still missing dbId for", excelInsumos[code].name);
        }
    }
    
    // Fetch existing Rubros
    console.log("Fetching DB rubros...");
    const { data: dbRubros } = await supabase.from('rubros').select('id, codigo, nombre');
    const dbRubrosByFuzzy = {};
    for (const r of dbRubros) dbRubrosByFuzzy[cleanString(r.nombre)] = r;
    
    // Parse RUBROS sheet
    console.log("Parsing RUBROS sheet...");
    const rubroRows = XLSX.utils.sheet_to_json(workbook.Sheets['RUBROS'], { header: 1 });
    const headers = rubroRows[3];
    
    // Find column indexes for components
    // Headers look like: MT1, CM1, MT2, CM2...
    const colMap = {};
    for (let c = 0; c < headers.length; c++) {
        if (typeof headers[c] === 'string' && headers[c].trim() !== '') {
            colMap[headers[c].trim()] = c;
        }
    }
    
    let rubrosToInsert = [];
    let rubroDataList = [];
    
    for (let i = 4; i < rubroRows.length; i++) {
        const row = rubroRows[i];
        const code = row[0];
        if (typeof code !== 'number') continue;
        
        const cat = row[2];
        const name = row[3];
        const spec = row[4] || '';
        const unit = row[5];
        
        if (!name) continue;
        
        const fuzzy = cleanString(name);
        if (dbRubrosByFuzzy[fuzzy]) {
            // Already exists, skip
            continue;
        }
        
        // Prepare rubro for insert
        const newRubro = {
            codigo: `RUB-EXC-${code}`.substring(0, 20),
            nombre: String(name).trim(),
            
            unidad: String(unit).trim().substring(0, 20),
            categoria: String(cat).trim()
        };
        
        // Extract recipe
        const recipe = [];
        
        // Helper to extract pair
        const extractPair = (idCol, qtyCol) => {
            if (colMap[idCol] !== undefined && colMap[qtyCol] !== undefined) {
                const insCode = row[colMap[idCol]];
                const insQty = row[colMap[qtyCol]];
                if (typeof insCode === 'number' && typeof insQty === 'number' && insQty > 0) {
                    const mapped = excelInsumos[insCode];
                    if (mapped && mapped.dbId) {
                        recipe.push({ insumo_id: mapped.dbId, cantidad: insQty, dbId: mapped.dbId });
                    }
                }
            }
        };
        
        for (let j = 1; j <= 20; j++) extractPair(`MT${j}`, `CM${j}`);
        for (let j = 1; j <= 20; j++) extractPair(`MO${j}`, `NP${j}`);
        for (let j = 1; j <= 20; j++) extractPair(`EQ${j}`, `NE${j}`);
        
        
        if (!rubrosToInsert.find(r => r.codigo === newRubro.codigo)) { rubrosToInsert.push(newRubro); rubroDataList.push({ data: newRubro, recipe }); }
    }
    
    console.log(`Found ${rubroDataList.length} new Rubros to insert.`);
    
    // Insert Rubros
    for (let i = 0; i < rubroDataList.length; i += chunkSize) {
        const chunk = rubroDataList.slice(i, i + chunkSize);
        const { data, error } = await supabase.from('rubros').upsert(chunk.map(c => c.data), { onConflict: 'codigo' }).select('id, codigo, nombre');
        if (error) {
            console.error("Error inserting rubros:", error);
            return;
        }
        
        // Prepare rubro_insumos inserts
        const recipeInserts = [];
        for (const inserted of data) {
            const original = chunk.find(c => cleanString(c.data.nombre) === cleanString(inserted.nombre));
            if (original && original.recipe.length > 0) {
                for (const rItem of original.recipe) {
                    recipeInserts.push({
                        rubro_id: inserted.id,
                        insumo_id: rItem.dbId,
                        cantidad: rItem.cantidad
                    });
                }
            }
        }
        
        // Insert recipes
        if (recipeInserts.length > 0) {
            const { error: errRecipe } = await supabase.from('rubro_insumos').upsert(recipeInserts);
            if (errRecipe) {
                console.error("Error inserting recipes:", errRecipe);
            }
        }
        console.log(`Inserted chunk of ${chunk.length} rubros and their recipes.`);
    }
    
    console.log("Migration complete!");
}

run().catch(console.error);
