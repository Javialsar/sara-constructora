const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

// 1. Add import
if (!code.includes('import GanttModal')) {
  code = code.replace('import jsPDF', 'import GanttModal from "@/components/admin/presupuestos/GanttModal"\nimport jsPDF');
}

// 2. Remove inline Gantt modal and replace with component
// We can use a regex that matches from `{/* Modal Cronograma Gantt */}` to just before `{/* Modal Editar Receta del Proyecto */}`
const regex = /\{\/\* Modal Cronograma Gantt \*\/\}([\s\S]*?)(\{\/\* Modal Editar Receta del Proyecto \*\/)/;

const newGanttCall = `{/* Modal Cronograma Gantt */}
        <GanttModal 
          isOpen={isGanttModalOpen} 
          onClose={() => setIsGanttModalOpen(false)} 
          presupuestoRubros={presupuestoRubros} 
          updateTaskSchedule={updateTaskSchedule} 
        />
        
        $2`;

if (regex.test(code)) {
  code = code.replace(regex, newGanttCall);
  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
  console.log("Replaced GanttModal successfully.");
} else {
  console.log("Could not find Gantt Modal chunk.");
}
