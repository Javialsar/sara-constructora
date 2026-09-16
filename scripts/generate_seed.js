const xlsx = require('xlsx');
const fs = require('fs');

console.log("Reading Excel file...");
const wb = xlsx.readFile('public/APU-EXCEL-V7.xlsm');

const sheetMat = wb.Sheets['MAT'];
const sheetMO = wb.Sheets['SALARIOS EN DOLARES'];
const sheetEq = wb.Sheets['EQUIPO'];
const sheetAnalisis = wb.Sheets['ANALISIS'];

const mats = xlsx.utils.sheet_to_json(sheetMat, { header: 1 });
const mos = xlsx.utils.sheet_to_json(sheetMO, { header: 1 });
const eqs = xlsx.utils.sheet_to_json(sheetEq, { header: 1 });
const analisis = xlsx.utils.sheet_to_json(sheetAnalisis, { header: 1 });

console.log("Generating SQL...");

let sql = `
-- LIMPIAR DATOS VIEJOS SI SE DESEA (Opcional)
-- DELETE FROM rubro_insumos;
-- DELETE FROM rubros;
-- DELETE FROM insumos;

`;

let insumosMap = {}; // name -> { type, unit, price, id }

// MATERIALES
for (let i = 1; i < mats.length; i++) {
    const row = mats[i];
    if (row[1] && row[2]) {
        let name = String(row[1]).trim().substring(0, 255);
        let unit = String(row[2]).trim().substring(0, 10);
        let price = parseFloat(row[3]) || 0;
        if (name && !insumosMap[name]) {
            insumosMap[name] = { type: 'material', unit, price };
        }
    }
}

// MANO DE OBRA
for (let i = 1; i < mos.length; i++) {
    const row = mos[i];
    if (row[1] && row[3]) {
        let name = String(row[1]).trim().substring(0, 255);
        let unit = 'h'; // usually hour
        let price = parseFloat(row[3]) || 0; // check real hourly wage
        if (name && !insumosMap[name]) {
            insumosMap[name] = { type: 'mano_de_obra', unit, price };
        }
    }
}

// EQUIPO
for (let i = 1; i < eqs.length; i++) {
    const row = eqs[i];
    if (row[1] && row[2]) {
        let name = String(row[1]).trim().substring(0, 255);
        let price = parseFloat(row[2]) || 0;
        if (name && !insumosMap[name]) {
            insumosMap[name] = { type: 'equipo', unit: 'h', price };
        }
    }
}

// Prepare INSUMOS SQL
let insumoIdCounter = 1000;
for (const [name, data] of Object.entries(insumosMap)) {
    data.id = `INS-GEN-${insumoIdCounter++}`;
    sql += `INSERT INTO insumos (codigo, nombre, tipo, unidad, precio_sin_iva, clasificacion) VALUES ('${data.id}', '${name.replace(/'/g, "''")}', '${data.type}', '${data.unit}', ${data.price.toFixed(4)}, '${data.type}') ON CONFLICT (codigo) DO NOTHING;\n`;
}

// ANALISIS / RUBROS (Extract Recipes)
let currentRubro = null;
let currentRubroId = 1000;
let rubroSql = '';
let recipeSql = '';

// This is a naive parser for the typical APU excel format where header rows define the APU.
// E.g., cell [A] says "RUBRO:" and [B] has the name.
for (let i = 0; i < analisis.length; i++) {
    const row = analisis[i];
    if (!row || row.length === 0) continue;
    
    // Attempt to identify a Rubro header
    if (String(row[0]).trim().toUpperCase() === 'RUBRO:') {
        let name = String(row[1] || 'SIN NOMBRE').trim();
        let unit = String(row[3] || 'u').trim(); // Assuming unit is in column 3
        currentRubro = {
            id: `RUB-GEN-${currentRubroId++}`,
            name,
            unit
        };
        rubroSql += `INSERT INTO rubros (codigo, nombre, unidad, categoria, total_costo_directo, herramienta_menor_pct) VALUES ('${currentRubro.id}', '${name.replace(/'/g, "''")}', '${unit}', 'Generales', 0, 5) ON CONFLICT (codigo) DO NOTHING;\n`;
        continue;
    }

    if (currentRubro) {
        // Try to read an insumo line
        // Usually: [1] Insumo Name, [2] Unidad, [3] Cantidad, [4] Precio
        let itemName = String(row[1] || '').trim();
        let qty = parseFloat(row[3]);
        if (itemName && qty > 0 && insumosMap[itemName]) {
            recipeSql += `
DO $$
DECLARE
    v_insumo_id UUID;
    v_rubro_id UUID;
BEGIN
    SELECT id INTO v_insumo_id FROM insumos WHERE codigo = '${insumosMap[itemName].id}' LIMIT 1;
    SELECT id INTO v_rubro_id FROM rubros WHERE codigo = '${currentRubro.id}' LIMIT 1;
    
    IF v_insumo_id IS NOT NULL AND v_rubro_id IS NOT NULL THEN
        INSERT INTO rubro_insumos (rubro_id, insumo_id, cantidad) VALUES (v_rubro_id, v_insumo_id, ${qty}) ON CONFLICT DO NOTHING;
    END IF;
END $$;
`;
        }
    }
}

fs.writeFileSync('supabase/seed_excel.sql', sql + '\n' + rubroSql + '\n' + recipeSql);
console.log("SQL generated at supabase/seed_excel.sql");
