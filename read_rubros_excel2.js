const xlsx = require('xlsx');
const workbook = xlsx.readFile('public/Banco_Rubros_Construccion.xlsx');
const sheetName = 'Rubros_Normativa_EC';
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
console.log('Rows 0 to 5 of Rubros_Normativa_EC:');
console.log(JSON.stringify(data.slice(0, 6), null, 2));
