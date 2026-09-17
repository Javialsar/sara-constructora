const XLSX = require('xlsx');
const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
console.log("MO ROW 15-20:");
console.log(XLSX.utils.sheet_to_json(workbook.Sheets['SALARIOS EN DOLARES'], { header: 1 }).slice(15, 20));
