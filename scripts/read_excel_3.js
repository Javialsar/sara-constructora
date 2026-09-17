const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');

if (workbook.SheetNames.includes('RUBROS')) {
    const sheet = workbook.Sheets['RUBROS'];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find the first data row (usually row index 3 or 4)
    console.log("DATA ROW 3:", json[3]);
}
