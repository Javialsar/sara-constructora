const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
const sheet = workbook.Sheets['RUBROS'];
const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("ROW 3 (Sub-headers):", json[3].slice(0, 15));
console.log("ROW 4 (First data):", json[4].slice(0, 20));
