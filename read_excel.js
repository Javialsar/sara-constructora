const xlsx = require('xlsx');
const fs = require('fs');
const workbook = xlsx.readFile('public/Catalogo_Construccion.xlsx');
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

// Find the row that contains 'Código'
let headerIndex = 0;
for(let i=0; i < data.length; i++) {
    if(data[i][0] === 'Código') {
        headerIndex = i;
        break;
    }
}

const rows = data.slice(headerIndex + 1).filter(r => r.length > 0 && r[0]); 

const mapTipo = (t) => {
    if(!t) return 'material';
    const tu = t.toString().toUpperCase().trim();
    if(tu === 'MAT' || tu === 'MATERIAL') return 'material';
    if(tu === 'MO' || tu === 'MANO DE OBRA') return 'mano_obra';
    if(tu === 'EQ' || tu === 'EQUIPO') return 'equipo';
    return 'material';
};

const finalData = rows.map(r => ({
    codigo: r[0],
    tipo: mapTipo(r[1]),
    categoria: r[2] || 'General',
    nombre: (r[4] || 'Sin nombre') + (r[5] ? ' - ' + r[5] : ''),
    unidad: r[6] || 'u',
    costo: parseFloat(r[14]) || 0 
})).filter(r => r.codigo);

fs.writeFileSync('insumos_import.json', JSON.stringify(finalData, null, 2));
console.log('Saved', finalData.length, 'records to insumos_import.json');
