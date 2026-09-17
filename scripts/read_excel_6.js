const XLSX = require('xlsx');
const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
const matSheet = workbook.Sheets['MAT'];
const moSheet = workbook.Sheets['SALARIOS EN DOLARES'];
const eqSheet = workbook.Sheets['EQUIPO'];

console.log("MAT:", XLSX.utils.sheet_to_json(matSheet, { header: 1 }).slice(0, 5));
console.log("MO:", XLSX.utils.sheet_to_json(moSheet, { header: 1 }).slice(0, 5));
console.log("EQ:", XLSX.utils.sheet_to_json(eqSheet, { header: 1 }).slice(0, 5));
