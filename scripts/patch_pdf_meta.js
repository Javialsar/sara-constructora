const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

// Patch 1: Query
c = c.replace(
  "const { data } = await supabase.from('proyectos').select('id, nombre').order('created_at', { ascending: false })",
  "const { data } = await supabase.from('proyectos').select('id, nombre, cliente:clientes(nombre, apellido)').order('created_at', { ascending: false })"
);

// Patch 2: PDF Logic
const pdfReplacement = `  const generatePDF = () => {
    try {
      if (!currentPresupuesto) return
      const { costoDirectoTotal, a, i, u, granTotal } = calcTotales()
      const doc = new jsPDF()
      
      const proyecto = proyectosCRM.find(p => p.nombre === currentPresupuesto.nombre_proyecto);
      const nombreCliente = proyecto?.cliente ? \`\${proyecto.cliente.nombre} \${proyecto.cliente.apellido}\` : 'Consumidor Final';
      const nombreTecnico = 'Ing. Javier (SARA Constructora)';

      let totalManHours = 0;
      presupuestoRubros.forEach(rubro => {
        const insumos = rubrosRecipes[rubro.id] || [];
        const mos = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
        mos.forEach(mo => {
          totalManHours += (Number(mo.cantidad) * Number(rubro.cantidad_obra));
        });
      });
      // Asumiendo unidad de MO en horas: 3 personas x 8h = 24h/día. Si la unidad es jornada (1 = 1 día), el cálculo variará, pero como es estimativo:
      // SARA usa mucho 'h' (hora). 
      let diasEstimados = Math.ceil((totalManHours / 24) * 1.2);
      if (diasEstimados < 1) diasEstimados = 1;

      // Agregar membrete centrado
      doc.addImage(membreteBase64, 'PNG', 50, 5, 110, 40)
      
      doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.text("PRESUPUESTO DE OBRA", 14, 55)
      doc.setFontSize(10); doc.setFont("helvetica", "bold")
      doc.text(\`Proyecto:\`, 14, 63); doc.setFont("helvetica", "normal"); doc.text(\`\${currentPresupuesto.nombre_proyecto}\`, 35, 63)
      doc.setFont("helvetica", "bold"); doc.text(\`Cliente:\`, 14, 68); doc.setFont("helvetica", "normal"); doc.text(\`\${nombreCliente}\`, 35, 68)
      doc.setFont("helvetica", "bold"); doc.text(\`Elaborado por:\`, 14, 73); doc.setFont("helvetica", "normal"); doc.text(\`\${nombreTecnico}\`, 42, 73)
      
      doc.setFont("helvetica", "bold"); doc.text(\`Fecha:\`, 120, 63); doc.setFont("helvetica", "normal"); doc.text(\`\${new Date().toLocaleDateString()}\`, 150, 63)
      doc.setFont("helvetica", "bold"); doc.text(\`Plazo Estimado:\`, 120, 68); doc.setFont("helvetica", "normal"); doc.text(\`~\${diasEstimados} días laborables\`, 150, 68)
      
      const tableColumn = ["CÓDIGO", "RUBRO", "UNIDAD", "CANT.", "P. UNIT ($)", "SUBTOTAL ($)"]
      const tableRows = presupuestoRubros.map(item => [
        item.codigo_rubro, item.nombre_rubro, item.unidad,
        Number(item.cantidad_obra).toFixed(2), Number(item.precio_unitario_snapshot).toFixed(2), Number(item.subtotal).toFixed(2)
      ])
      autoTable(doc, { startY: 78, head: [tableColumn], body: tableRows, theme: 'grid', styles: { fontSize: 8 }, headStyles: { fillColor: [44, 62, 80] } })
      
      let finalY = doc.lastAutoTable?.finalY || 78
      if (finalY > 230) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text("RESUMEN ECONÓMICO", 120, finalY + 15)
      doc.setFont("helvetica", "normal")
      doc.text(\`Costo Directo:\`, 120, finalY + 25); doc.text(\`\${costoDirectoTotal.toFixed(2)}\`, 180, finalY + 25, { align: 'right' })
      doc.text(\`Administración (\${currentPresupuesto.porcentaje_admin}%):\`, 120, finalY + 32); doc.text(\`\${a.toFixed(2)}\`, 180, finalY + 32, { align: 'right' })
      doc.text(\`Imprevistos (\${currentPresupuesto.porcentaje_imprevistos}%):\`, 120, finalY + 39); doc.text(\`\${i.toFixed(2)}\`, 180, finalY + 39, { align: 'right' })
      doc.text(\`Utilidad (\${currentPresupuesto.porcentaje_utilidad}%):\`, 120, finalY + 46); doc.text(\`\${u.toFixed(2)}\`, 180, finalY + 46, { align: 'right' })
      doc.setFont("helvetica", "bold"); doc.text(\`GRAN TOTAL:\`, 120, finalY + 55); doc.text(\`\${granTotal.toFixed(2)}\`, 180, finalY + 55, { align: 'right' })
      
      let firmaY = finalY + 85;
      if (firmaY > 270) {
          doc.addPage();
          firmaY = 40;
      }

      doc.setDrawColor(0);
      doc.line(40, firmaY, 95, firmaY);
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text("ELABORADO POR:", 67.5, firmaY + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(\`\${nombreTecnico}\`, 67.5, firmaY + 10, { align: "center" });

      doc.line(115, firmaY, 170, firmaY);
      doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text("APROBADO POR (CLIENTE):", 142.5, firmaY + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(\`\${nombreCliente}\`, 142.5, firmaY + 10, { align: "center" });

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
  c = c.substring(0, originalStart) + pdfReplacement + '\n\n' + c.substring(originalEnd);
  fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
  console.log("Patched successfully!");
} else {
  console.log("Failed to find boundaries");
}
