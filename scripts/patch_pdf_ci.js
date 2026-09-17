const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

const oldResumen = `      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text("RESUMEN ECONÓMICO", 120, finalY + 15)
      doc.setFont("helvetica", "normal")
      doc.text(\`Costo Directo:\`, 120, finalY + 25); doc.text(\`\${costoDirectoTotal.toFixed(2)}\`, 180, finalY + 25, { align: 'right' })
      doc.text(\`Administración (\${currentPresupuesto.porcentaje_admin}%):\`, 120, finalY + 32); doc.text(\`\${a.toFixed(2)}\`, 180, finalY + 32, { align: 'right' })
      doc.text(\`Imprevistos (\${currentPresupuesto.porcentaje_imprevistos}%):\`, 120, finalY + 39); doc.text(\`\${i.toFixed(2)}\`, 180, finalY + 39, { align: 'right' })
      doc.text(\`Utilidad (\${currentPresupuesto.porcentaje_utilidad}%):\`, 120, finalY + 46); doc.text(\`\${u.toFixed(2)}\`, 180, finalY + 46, { align: 'right' })
      doc.setFont("helvetica", "bold"); doc.text(\`GRAN TOTAL:\`, 120, finalY + 55); doc.text(\`\${granTotal.toFixed(2)}\`, 180, finalY + 55, { align: 'right' })`;

const newResumen = `      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("RESUMEN ECONÓMICO DEL PROYECTO", 120, finalY + 15)
      doc.setFontSize(10); 
      
      doc.setFont("helvetica", "bold"); doc.text("COSTO DIRECTO (C.D.):", 120, finalY + 25); 
      doc.text(\`$\${costoDirectoTotal.toFixed(2)}\`, 190, finalY + 25, { align: 'right' })
      
      doc.setFont("helvetica", "bold"); doc.text("COSTOS INDIRECTOS (C.I.):", 120, finalY + 35); 
      const totalCI = a + i + u;
      doc.text(\`$\${totalCI.toFixed(2)}\`, 190, finalY + 35, { align: 'right' })
      
      doc.setFont("helvetica", "normal"); doc.setTextColor(100);
      doc.text(\`- Administración (\${currentPresupuesto.porcentaje_admin}%):\`, 125, finalY + 41); doc.text(\`$\${a.toFixed(2)}\`, 190, finalY + 41, { align: 'right' })
      doc.text(\`- Imprevistos (\${currentPresupuesto.porcentaje_imprevistos}%):\`, 125, finalY + 47); doc.text(\`$\${i.toFixed(2)}\`, 190, finalY + 47, { align: 'right' })
      doc.text(\`- Utilidad (\${currentPresupuesto.porcentaje_utilidad}%):\`, 125, finalY + 53); doc.text(\`$\${u.toFixed(2)}\`, 190, finalY + 53, { align: 'right' })
      doc.setTextColor(0);

      doc.setDrawColor(150); doc.line(120, finalY + 58, 190, finalY + 58);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("COSTO TOTAL (C.D. + C.I.):", 120, finalY + 65); 
      doc.text(\`$\${granTotal.toFixed(2)}\`, 190, finalY + 65, { align: 'right' })`;

if (c.includes(oldResumen)) {
    c = c.replace(oldResumen, newResumen);
    fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
    console.log("Patched successfully");
} else {
    console.log("Pattern not found");
}
