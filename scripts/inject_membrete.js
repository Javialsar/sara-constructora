const fs = require('fs');

let code = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

// Inject import
if (!code.includes('membreteBase64')) {
    code = code.replace('import autoTable from "jspdf-autotable"', 'import autoTable from "jspdf-autotable"\nimport { membreteBase64 } from "@/lib/membreteBase64"');
}

// Re-write generatePDF completely
const newPdfLogic = `const generatePDF = () => {
    try {
      if (!currentPresupuesto) return
      const { costoDirectoTotal, a, i, u, granTotal } = calcTotales()
      const doc = new jsPDF()
      
      // Agregar membrete centrado
      doc.addImage(membreteBase64, 'PNG', 50, 10, 110, 40)
      
      doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.text("PRESUPUESTO DE OBRA", 14, 65)
      doc.setFontSize(12); doc.setFont("helvetica", "normal")
      doc.text(\`Proyecto: \${currentPresupuesto.nombre_proyecto}\`, 14, 75)
      doc.text(\`Fecha: \${new Date().toLocaleDateString()}\`, 14, 83)
      
      const tableColumn = ["CÓDIGO", "RUBRO", "UNIDAD", "CANT.", "P. UNIT ($)", "SUBTOTAL ($)"]
      const tableRows = presupuestoRubros.map(item => [
        item.codigo_rubro, item.nombre_rubro, item.unidad,
        Number(item.cantidad_obra).toFixed(2), Number(item.precio_unitario_snapshot).toFixed(2), Number(item.subtotal).toFixed(2)
      ])
      autoTable(doc, { startY: 90, head: [tableColumn], body: tableRows, theme: 'grid', styles: { fontSize: 8 }, headStyles: { fillColor: [44, 62, 80] } })
      const finalY = doc.lastAutoTable?.finalY || 90
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text("RESUMEN ECONÓMICO", 120, finalY + 15)
      doc.setFont("helvetica", "normal")
      doc.text(\`Costo Directo:\`, 120, finalY + 25); doc.text(\`$\${costoDirectoTotal.toFixed(2)}\`, 180, finalY + 25, { align: 'right' })
      doc.text(\`Administración (\${currentPresupuesto.porcentaje_admin}%):\`, 120, finalY + 32); doc.text(\`$\${a.toFixed(2)}\`, 180, finalY + 32, { align: 'right' })
      doc.text(\`Imprevistos (\${currentPresupuesto.porcentaje_imprevistos}%):\`, 120, finalY + 39); doc.text(\`$\${i.toFixed(2)}\`, 180, finalY + 39, { align: 'right' })
      doc.text(\`Utilidad (\${currentPresupuesto.porcentaje_utilidad}%):\`, 120, finalY + 46); doc.text(\`$\${u.toFixed(2)}\`, 180, finalY + 46, { align: 'right' })
      doc.setFont("helvetica", "bold"); doc.text(\`GRAN TOTAL:\`, 120, finalY + 55); doc.text(\`$\${granTotal.toFixed(2)}\`, 180, finalY + 55, { align: 'right' })
      doc.save(\`Presupuesto_\${currentPresupuesto.nombre_proyecto.replace(/\\s+/g, '_')}.pdf\`)
    } catch (error) {
      console.error(error);
      alert("Error al generar PDF: " + error.message);
    }
  }`;

const oldFuncRegex = /const generatePDF = \(\) => \{[\s\S]*?alert\("Error al generar PDF: " \+ error\.message\);\s*\}\s*\}/;
code = code.replace(oldFuncRegex, newPdfLogic);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', code);
console.log("PDF Membrete injected");
