const XLSX = require('xlsx');
const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
console.log("MAT ROW 5-7:");
console.log(XLSX.utils.sheet_to_json(workbook.Sheets['MAT'], { header: 1 }).slice(5, 8));

console.log("MO ROW 8-10:");
console.log(XLSX.utils.sheet_to_json(workbook.Sheets['SALARIOS EN DOLARES'], { header: 1 }).slice(8, 11));

console.log("EQ ROW 5-7:");
console.log(XLSX.utils.sheet_to_json(workbook.Sheets['EQUIPO'], { header: 1 }).slice(5, 8));
