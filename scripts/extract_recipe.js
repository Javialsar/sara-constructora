const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

if (!code.includes('import RecipeEditorModal')) {
  code = code.replace('import GanttModal from "@/components/admin/presupuestos/GanttModal"', 'import GanttModal from "@/components/admin/presupuestos/GanttModal"\nimport RecipeEditorModal from "@/components/admin/presupuestos/RecipeEditorModal"');
}

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('{/* Modal Editar Receta del Proyecto */}'));
let endIdx = -1;

for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].includes('</div') && lines[i+1]?.includes(')') && lines[i+2]?.includes('}')) {
    // Found the end of the modal
    if (lines[i-1]?.includes(')}')) {
      endIdx = i + 2;
      break;
    }
  }
}

// Actually let's just find the first "    return (" after the startIdx.
const returnIdx = lines.findIndex((l, i) => i > startIdx && l.includes('    return ('));
if (returnIdx !== -1) {
    // The modal ends just before "      </div>\n    )\n  }\n\n    return ("
    const modalEnd = returnIdx - 4; 
    
    const newCall = `        {/* Modal Editar Receta del Proyecto */}
        <RecipeEditorModal 
          isRecipeModalOpen={isRecipeModalOpen}
          setIsRecipeModalOpen={setIsRecipeModalOpen}
          currentRecipeRubro={currentRecipeRubro}
          currentPresupuesto={currentPresupuesto}
          fetchPresupuestoRubros={fetchPresupuestoRubros}
          rubrosRecipes={rubrosRecipes}
          renderGroupedInsumos={renderGroupedInsumos}
          insumoSearch={insumoSearch}
          setInsumoSearch={setInsumoSearch}
          searchingInsumos={searchingInsumos}
          allInsumos={allInsumos}
          handleAddInsumoToRecipe={handleAddInsumoToRecipe}
        />`;

    const before = lines.slice(0, startIdx).join('\n');
    const after = lines.slice(modalEnd + 1).join('\n');
    
    fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', before + '\n' + newCall + '\n' + after);
    console.log("Replaced using lines.");
}
