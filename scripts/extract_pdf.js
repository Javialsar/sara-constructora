const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

if (!code.includes('import { generatePDF }')) {
  code = code.replace('import jsPDF from "jspdf"', 'import { generatePDF } from "@/lib/pdfGenerator"');
  code = code.replace('import autoTable from "jspdf-autotable"\n', '');
  code = code.replace('import { membreteBase64 } from "@/lib/membreteBase64"\n', '');
}

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('const generatePDF = () => {'));

if (startIdx !== -1) {
    let endIdx = startIdx;
    let braces = 0;
    let started = false;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('{')) {
            braces += (lines[i].match(/\{/g) || []).length;
            started = true;
        }
        if (lines[i].includes('}')) {
            braces -= (lines[i].match(/\}/g) || []).length;
        }
        if (started && braces === 0) {
            endIdx = i;
            break;
        }
    }
    
    console.log("Start:", startIdx, "End:", endIdx);
    
    if (endIdx > startIdx) {
        const newCall = `  const handleGeneratePDF = () => {
    generatePDF({
      currentPresupuesto,
      proyectosCRM,
      totales: calcTotales(),
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
  }`;

        const before = lines.slice(0, startIdx).join('\n');
        const after = lines.slice(endIdx + 1).join('\n');
        
        let newCode = before + '\n' + newCall + '\n' + after;
        newCode = newCode.replace(/onClick=\{generatePDF\}/g, 'onClick={handleGeneratePDF}');
        
        fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', newCode);
        console.log("Extracted PDF generator successfully!");
    }
}
