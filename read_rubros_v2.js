const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('public/Banco_Rubros_Construccion.xlsx');
const sheetName = 'Rubros_Normativa_EC';
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

let headerIndex = 0;
for(let i=0; i < data.length; i++) {
    if(data[i][0] === 'Código') {
        headerIndex = i;
        break;
    }
}

const rows = data.slice(headerIndex + 1).filter(r => r.length > 0 && r[0] && r[0].startsWith('RUB-')); 

const finalData = rows.map(r => ({
    codigo: r[0],
    categoria: r[1] || 'General',
    nombre: r[3] || 'Rubro sin nombre',
    unidad: r[4] || 'u',
    porcentaje_herramienta: 5.0,
    total_costo_directo: 0 // Inicia en 0 porque aún no tienen receta
})).filter(r => r.codigo);

fs.writeFileSync('rubros_import.json', JSON.stringify(finalData, null, 2));
console.log('Parsed', finalData.length, 'rubros to import.');
