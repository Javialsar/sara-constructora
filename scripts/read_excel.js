const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/APU-EXCEL-V7.xlsm');
console.log('Sheets:', workbook.SheetNames);

if (workbook.SheetNames.includes('RUBROS')) {
    const sheet = workbook.Sheets['RUBROS'];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Print first 50 rows to see the structure
    for (let i = 0; i < Math.min(50, json.length); i++) {
        console.log(json[i]);
    }
} else {
    console.log("No sheet named RUBROS found.");
}
