const XLSX = require('xlsx');
const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
const sheet = workbook.Sheets['RUBROS'];
const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log("ROW 5:", json[5].slice(0, 30));
