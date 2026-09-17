const fs = require('fs');
let lines = fs.readFileSync('src/components/admin/presupuestos/GanttModal.tsx', 'utf8').split('\n');

lines[24] = "        name: `${idx + 1}. ${pr.nombre_rubro}`,";
lines[59] = "              <button className={`px-3 py-1 rounded ${viewMode === ViewMode.Day ? 'bg-white shadow' : 'hover:bg-gray-300'}`} onClick={() => setViewMode(ViewMode.Day)}>Días</button>";
lines[60] = "              <button className={`px-3 py-1 rounded ${viewMode === ViewMode.Week ? 'bg-white shadow' : 'hover:bg-gray-300'}`} onClick={() => setViewMode(ViewMode.Week)}>Semanas</button>";
lines[61] = "              <button className={`px-3 py-1 rounded ${viewMode === ViewMode.Month ? 'bg-white shadow' : 'hover:bg-gray-300'}`} onClick={() => setViewMode(ViewMode.Month)}>Meses</button>";

fs.writeFileSync('src/components/admin/presupuestos/GanttModal.tsx', lines.join('\n'));
console.log("Fixed templates correctly");
