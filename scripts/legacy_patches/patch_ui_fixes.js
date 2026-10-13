const fs = require('fs');
const path = 'src/app/admin/presupuestos_reales/page.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// 1. Fix the missing closing brace for handleGeneratePresupuestoGeneralPDF
let missingBraceIdx = lines.findIndex(l => l.includes('  const handleGenerateAPUsPDF = () => {'));
if (missingBraceIdx > -1) {
  // Check if the previous line is `    });`
  if (lines[missingBraceIdx - 1].includes('    });')) {
    // Add `  }` right before `const handleGenerateAPUsPDF = () => {`
    lines.splice(missingBraceIdx, 0, '  }');
  } else if (lines[missingBraceIdx - 2].includes('    });')) {
    lines.splice(missingBraceIdx - 1, 0, '  }');
  } else {
    console.log("Could not find where to insert }");
  }
}

// 2. Fix handleSavePresupuesto reference in the 'Costos Indirectos' tab
let saveRefIdx = lines.findIndex(l => l.includes('<button onClick={handleSavePresupuesto} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold'));
if (saveRefIdx > -1) {
  lines[saveRefIdx] = lines[saveRefIdx].replace('handleSavePresupuesto', 'handleSaveIndirectos');
}

// 3. Fix the "Explosión de Insumos" tab button injection
let reportTabIdx = lines.findIndex(l => l.includes("Reportes") && l.includes("setActiveTab('reportes')"));
if (reportTabIdx > -1) {
  // Find where the button actually closes
  let closeBtnIdx = reportTabIdx;
  while (!lines[closeBtnIdx].includes('</button>')) {
    closeBtnIdx++;
  }
  // The tab HTML was injected inside the <button>. Let's remove it if it's there.
  let wrongTabIdx = lines.findIndex((l, i) => i > reportTabIdx && i <= closeBtnIdx + 3 && l.includes("setActiveTab('explosion')"));
  if (wrongTabIdx > -1) {
    // Remove the 3 lines of the wrong tab
    lines.splice(wrongTabIdx, 3);
  }
}

// Re-evaluate where to inject
reportTabIdx = lines.findIndex(l => l.includes("Reportes") && l.includes("setActiveTab('reportes')"));
if (reportTabIdx > -1) {
  let closeBtnIdx = reportTabIdx;
  while (!lines[closeBtnIdx].includes('</button>')) {
    closeBtnIdx++;
  }
  
  const tabHTML = `          <button onClick={() => setActiveTab('explosion')} className={\`px-6 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'explosion' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}>
            <Box size={16} className="inline mr-2"/> Explosión de Insumos
          </button>`;
  
  // Inject right after the </button> of Reportes
  lines.splice(closeBtnIdx + 1, 0, tabHTML);
}

fs.writeFileSync(path, lines.join('\n'));
console.log("Patched missing brace, save function reference, and explosion tab");
