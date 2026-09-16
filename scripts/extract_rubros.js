const xlsx = require('xlsx');
const fs = require('fs');

const wb = xlsx.readFile('public/Banco_Rubros_Construccion.xlsx');
const sheet = wb.Sheets['Rubros_Normativa_EC'];
const rows = xlsx.utils.sheet_to_json(sheet);

let sql = '-- INSERTAR RUBROS OFICIALES NORMATIVA EC\n\n';
let count = 0;

for (const row of rows) {
    const codigo = row['BANCO MAESTRO DE RUBROS – MATRIZ NORMATIVA ECUATORIANA'];
    const categoria = row['__EMPTY'];
    const nombre = row['__EMPTY_2'];
    const unidad = row['__EMPTY_3'];

    if (codigo && typeof codigo === 'string' && codigo.startsWith('RUB-') && nombre) {
        const safeNombre = String(nombre).replace(/'/g, "''").substring(0, 255);
        const safeCategoria = String(categoria || 'Generales').replace(/'/g, "''").substring(0, 100);
        const safeUnidad = String(unidad || 'u').replace(/'/g, "''").substring(0, 20);

        sql += `INSERT INTO rubros (codigo, nombre, unidad, categoria, total_costo_directo, herramienta_menor_pct) VALUES ('${codigo}', '${safeNombre}', '${safeUnidad}', '${safeCategoria}', 0, 5) ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, unidad = EXCLUDED.unidad, categoria = EXCLUDED.categoria;\n`;
        count++;
    }
}

fs.writeFileSync('supabase/seed_rubros_oficiales.sql', sql);
console.log(`Generated SQL for ${count} rubros.`);
