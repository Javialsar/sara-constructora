const fs = require('fs');

let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const generatePDFStr = `  const generatePDF = () => {
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
      doc.text(\`Costo Directo:\`, 120, finalY + 25); doc.text(\`\${costoDirectoTotal.toFixed(2)}\`, 180, finalY + 25, { align: 'right' })
      doc.text(\`Administración (\${currentPresupuesto.porcentaje_admin}%):\`, 120, finalY + 32); doc.text(\`\${a.toFixed(2)}\`, 180, finalY + 32, { align: 'right' })
      doc.text(\`Imprevistos (\${currentPresupuesto.porcentaje_imprevistos}%):\`, 120, finalY + 39); doc.text(\`\${i.toFixed(2)}\`, 180, finalY + 39, { align: 'right' })
      doc.text(\`Utilidad (\${currentPresupuesto.porcentaje_utilidad}%):\`, 120, finalY + 46); doc.text(\`\${u.toFixed(2)}\`, 180, finalY + 46, { align: 'right' })
      doc.setFont("helvetica", "bold"); doc.text(\`GRAN TOTAL:\`, 120, finalY + 55); doc.text(\`\${granTotal.toFixed(2)}\`, 180, finalY + 55, { align: 'right' })
      
      // ANEXO: APUS DETALLADOS
      if (presupuestoRubros.length > 0) {
        doc.addPage();
        doc.addImage(membreteBase64, 'PNG', 50, 10, 110, 40)
        doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("ANEXO: ANÁLISIS DE PRECIOS UNITARIOS", 14, 60)
        
        let startY = 75;
        
        presupuestoRubros.forEach((rubro, index) => {
          if (startY > 250) {
            doc.addPage();
            doc.addImage(membreteBase64, 'PNG', 50, 10, 110, 40)
            startY = 60;
          }
          
          doc.setFontSize(10); doc.setFont("helvetica", "bold");
          doc.text(\`Rubro: \${rubro.codigo_rubro} - \${rubro.nombre_rubro}\`, 14, startY)
          doc.setFont("helvetica", "normal");
          doc.text(\`Unidad: \${rubro.unidad} | Costo Directo U: $\${Number(rubro.precio_unitario_snapshot).toFixed(2)}\`, 14, startY + 5)
          
          const insumos = rubrosRecipes[rubro.id] || [];
          const apuCol = ["Insumo", "Unidad", "Cantidad", "Precio Unit.", "Subtotal"];
          const apuRows = [];
          
          const mat = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'material');
          if (mat.length > 0) {
            apuRows.push([{ content: 'MATERIALES', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [235, 245, 255], textColor: [41, 128, 185] } }]);
            mat.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
            });
          }
          const mo = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
          if (mo.length > 0) {
            apuRows.push([{ content: 'MANO DE OBRA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [255, 245, 235], textColor: [211, 84, 0] } }]);
            mo.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
            });
          }
          const eq = insumos.filter(r => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo));
          if (eq.length > 0) {
            apuRows.push([{ content: 'EQUIPOS Y MAQUINARIA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [245, 235, 255], textColor: [142, 68, 173] } }]);
            eq.forEach(m => {
               const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
               apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
            });
          }
          
          if(apuRows.length > 0) {
              autoTable(doc, {
                startY: startY + 8,
                head: [apuCol],
                body: apuRows,
                theme: 'grid',
                styles: { fontSize: 7 },
                headStyles: { fillColor: [240, 240, 240], textColor: [0,0,0] },
                margin: { top: 60 }
              });
              startY = doc.lastAutoTable?.finalY + 15 || startY + 20;
          } else {
              doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.text("No hay insumos registrados.", 14, startY + 12);
              startY += 20;
          }
        });
      }

      doc.save(\`Presupuesto_\${currentPresupuesto.nombre_proyecto.replace(/\\s+/g, '_')}.pdf\`)
    } catch (error) {
      console.error(error);
      alert("Error al generar PDF: " + error.message);
    }
  }`;

const originalStart = c.indexOf('  const generatePDF = () => {');
const originalEnd = c.indexOf('  const isBorrador =');

if (originalStart !== -1 && originalEnd !== -1) {
  c = c.substring(0, originalStart) + generatePDFStr + '\n\n' + c.substring(originalEnd);
  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
  console.log("Patched successfully");
} else {
  console.log("Could not find boundaries");
}
