const xlsx = require('xlsx');
const workbook = xlsx.readFile('public/Banco_Rubros_Construccion.xlsx');
console.log('Sheets:', workbook.SheetNames);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
console.log('First 10 rows of sheet 1:');
console.log(JSON.stringify(data.slice(0, 10), null, 2));
