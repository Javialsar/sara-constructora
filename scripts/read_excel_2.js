const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');

if (workbook.SheetNames.includes('RUBROS')) {
    const sheet = workbook.Sheets['RUBROS'];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Print headers and first 10 rows
    console.log("HEADERS:", json[0].slice(0, 10));
    console.log("ROW 1:", json[1].slice(0, 10));
    console.log("ROW 2:", json[2].slice(0, 10));
}
