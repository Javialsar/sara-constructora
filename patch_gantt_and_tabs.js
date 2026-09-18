const fs = require('fs');

// 1. Patch Gantt Colors
const ganttPath = 'src/components/admin/presupuestos/GanttModal.tsx';
let ganttCode = fs.readFileSync(ganttPath, 'utf8');

if (!ganttCode.includes("const colors =")) {
  ganttCode = ganttCode.replace(
    /return presupuestoRubros\.map\(\(pr: any, idx: number\) => \{/,
    `const colors = [
      { p: '#3b82f6', s: '#2563eb' }, // Blue
      { p: '#10b981', s: '#059669' }, // Emerald
      { p: '#f59e0b', s: '#d97706' }, // Amber
      { p: '#ef4444', s: '#dc2626' }, // Red
      { p: '#8b5cf6', s: '#7c3aed' }, // Purple
      { p: '#ec4899', s: '#db2777' }, // Pink
      { p: '#14b8a6', s: '#0d9488' }, // Teal
      { p: '#f97316', s: '#ea580c' }, // Orange
    ];
    
    return presupuestoRubros.map((pr: any, idx: number) => {`
  );

  ganttCode = ganttCode.replace(
    /styles: \{ progressColor: '#8b5cf6', progressSelectedColor: '#7c3aed' \}/,
    `styles: { progressColor: colors[idx % colors.length].p, progressSelectedColor: colors[idx % colors.length].s }`
  );

  fs.writeFileSync(ganttPath, ganttCode);
  console.log("Patched GanttModal.tsx");
}

// 2. Patch "Programación" to "Cronograma de Trabajo"
const pagePath = 'src/app/admin/presupuestos_reales/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

pageCode = pageCode.replace(
  /<Calendar size=\{16\} className="inline mr-2"\/> Programación/g,
  '<Calendar size={16} className="inline mr-2"/> Cronograma de Trabajo'
);

fs.writeFileSync(pagePath, pageCode);
console.log("Patched Programacion in Tabs");
