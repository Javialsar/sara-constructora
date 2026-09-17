const fs = require('fs');
let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

code = code.replace(
  'handleAddInsumoToRecipe={handleAddInsumoToRecipe}\n        />\n    )\n  }',
  'handleAddInsumoToRecipe={handleAddInsumoToRecipe}\n        />\n      </div>\n    )\n  }'
);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
console.log("Fixed bracket issue.");
