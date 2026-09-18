import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { membreteBase64 } from "@/lib/membreteBase64"

export const generatePresupuestoGeneralPDF = (options: any) => {
  try {
    const {
      currentPresupuesto,
      proyectosCRM,
      totales,
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    } = options;

    const { costoDirectoTotal, a, i, u, granTotal } = totales;

    const proyectoFound = proyectosCRM.find((p: any) => p.id === currentPresupuesto.proyecto_crm_id);
    const nombreCliente = proyectoFound?.clientes?.nombre || "Cliente No Asignado";
    const nombreTecnico = "Técnico Responsable";
    const diasEstimados = currentPresupuesto.dias_estimados || 30;

    const doc = new jsPDF();
    
    doc.addImage(membreteBase64, 'PNG', 50, 5, 110, 40)
    
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.text("PRESUPUESTO DE OBRA", 14, 55)
    doc.setFontSize(10); doc.setFont("helvetica", "bold")
    doc.text(`Proyecto:`, 14, 63); doc.setFont("helvetica", "normal"); doc.text(`${currentPresupuesto.nombre_proyecto}`, 35, 63)
    doc.setFont("helvetica", "bold"); doc.text(`Cliente:`, 14, 68); doc.setFont("helvetica", "normal"); doc.text(`${nombreCliente}`, 35, 68)
    doc.setFont("helvetica", "bold"); doc.text(`Elaborado por:`, 14, 73); doc.setFont("helvetica", "normal"); doc.text(`${nombreTecnico}`, 42, 73)
    
    doc.setFont("helvetica", "bold"); doc.text(`Fecha:`, 120, 63); doc.setFont("helvetica", "normal"); doc.text(`${new Date().toLocaleDateString()}`, 150, 63)
    doc.setFont("helvetica", "bold"); doc.text(`Plazo Estimado:`, 120, 68); doc.setFont("helvetica", "normal"); doc.text(`~${diasEstimados} días laborables`, 150, 68)
    
    const tableColumn = ["CÓDIGO", "RUBRO", "UNIDAD", "CANT.", "P. UNIT ($)", "SUBTOTAL ($)"]
    const tableRows = presupuestoRubros.map((item: any) => [
      item.codigo_rubro, item.nombre_rubro, item.unidad,
      Number(item.cantidad_obra).toFixed(2), Number(item.precio_unitario_snapshot).toFixed(2), Number(item.subtotal).toFixed(2)
    ])
    autoTable(doc, { startY: 78, head: [tableColumn], body: tableRows, theme: 'grid', styles: { fontSize: 8 }, headStyles: { fillColor: [44, 62, 80] } })
    
    let finalY = (doc as any).lastAutoTable?.finalY || 78
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("RESUMEN ECONÓMICO DEL PROYECTO", 120, finalY + 15)
    doc.setFontSize(10); 
    
    doc.setFont("helvetica", "bold"); doc.text("COSTO DIRECTO (C.D.):", 120, finalY + 25); 
    doc.text(`${costoDirectoTotal.toFixed(2)}`, 190, finalY + 25, { align: 'right' })
    
    doc.setFont("helvetica", "bold"); doc.text("COSTOS INDIRECTOS (C.I.):", 120, finalY + 35); 
    const totalCI = a + i + u;
    doc.text(`${totalCI.toFixed(2)}`, 190, finalY + 35, { align: 'right' })
    
    const indConfig = currentPresupuesto.indirectos_config || { ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 };
    const pctGgen = Number(indConfig.ggen) + Number(indConfig.pgas1) + Number(indConfig.pgas2) + Number(indConfig.pgas3);

    doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text(`- Gastos Generales (${pctGgen}%):`, 125, finalY + 41); doc.text(`${a.toFixed(2)}`, 190, finalY + 41, { align: 'right' })
    doc.text(`- Imprevistos (${indConfig.pimp}%):`, 125, finalY + 47); doc.text(`${i.toFixed(2)}`, 190, finalY + 47, { align: 'right' })
    doc.text(`- Utilidad (${indConfig.util}%):`, 125, finalY + 53); doc.text(`${u.toFixed(2)}`, 190, finalY + 53, { align: 'right' })
    doc.setTextColor(0);

    doc.setDrawColor(150); doc.line(120, finalY + 58, 190, finalY + 58);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("COSTO TOTAL (C.D. + C.I.):", 120, finalY + 65); 
    doc.text(`${granTotal.toFixed(2)}`, 190, finalY + 65, { align: 'right' })
    
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
    doc.text(`${nombreTecnico}`, 67.5, firmaY + 10, { align: "center" });

    doc.line(115, firmaY, 170, firmaY);
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("APROBADO POR (CLIENTE):", 142.5, firmaY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`${nombreCliente}`, 142.5, firmaY + 10, { align: "center" });

    doc.save(`Presupuesto_${currentPresupuesto.nombre_proyecto.replace(/\s+/g, '_')}.pdf`)
  } catch (error: any) {
    console.error(error);
    alert("Error al generar PDF: " + error.message);
  }
}

export const generateAPUsPDF = (options: any) => {
  try {
    const {
      currentPresupuesto,
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    } = options;

    const doc = new jsPDF();
    
    if (presupuestoRubros.length === 0) {
      alert("No hay rubros en el presupuesto para generar APUs.");
      return;
    }

    let startY = 60;
    let isFirstPage = true;

    presupuestoRubros.forEach((rubro: any) => {
      if (startY > 250 || isFirstPage) {
        if (!isFirstPage) {
          doc.addPage();
        }
        doc.addImage(membreteBase64, 'PNG', 50, 10, 110, 40)
        doc.setFontSize(16); doc.setFont("helvetica", "bold"); 
        doc.text("ANÁLISIS DE PRECIOS UNITARIOS (APUS)", 14, 60)
        startY = 75;
        isFirstPage = false;
      }
      
      doc.setFontSize(10); doc.setFont("helvetica", "bold");
      doc.text(`Rubro: ${rubro.codigo_rubro} - ${rubro.nombre_rubro}`, 14, startY)
      doc.setFont("helvetica", "normal");
      doc.text(`Unidad: ${rubro.unidad} | Costo Directo U: $${Number(rubro.precio_unitario_snapshot).toFixed(2)}`, 14, startY + 5)
      
      const insumos = rubrosRecipes[rubro.id] || [];
      const apuCol = ["Insumo", "Unidad", "Cantidad", "Precio Unit.", "Subtotal"];
      const apuRows: any[] = [];
      
      const mat = insumos.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'material');
      if (mat.length > 0) {
        apuRows.push([{ content: 'MATERIALES', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [235, 245, 255], textColor: [41, 128, 185] } }]);
        mat.forEach((m: any) => {
           const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
           apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
        });
      }
      const mo = insumos.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
      let costoMO = 0;
      if (mo.length > 0) {
        apuRows.push([{ content: 'MANO DE OBRA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [255, 245, 235], textColor: [211, 84, 0] } }]);
        mo.forEach((m: any) => {
           const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
           const sub = m.cantidad * m.precio_sin_iva_snapshot;
           costoMO += sub;
           apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), sub.toFixed(2)]);
        });
      }
      
      const eq = insumos.filter((r: any) => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo));
      
      const rubroMaestro = allRubros.find((ar: any) => ar.id === rubro.rubro_id);
      const hmPct = rubroMaestro ? (Number(rubroMaestro.herramienta_menor_pct) || 0) : 5;
      const hmValue = costoMO * (hmPct / 100);

      if (eq.length > 0 || hmValue > 0) {
        apuRows.push([{ content: 'EQUIPOS Y MAQUINARIA', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [245, 235, 255], textColor: [142, 68, 173] } }]);
        eq.forEach((m: any) => {
           const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
           apuRows.push([iObj?.nombre || '', iObj?.unidad || '', Number(m.cantidad).toFixed(4), Number(m.precio_sin_iva_snapshot).toFixed(4), (m.cantidad * m.precio_sin_iva_snapshot).toFixed(2)]);
        });
        if (hmValue > 0) {
           apuRows.push([`Herramienta Menor (${hmPct}% de M.O.)`, '%', hmPct.toFixed(2), costoMO.toFixed(4), hmValue.toFixed(2)]);
        }
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
          startY = (doc as any).lastAutoTable?.finalY + 15 || startY + 20;
      } else {
          doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.text("No hay insumos registrados.", 14, startY + 12);
          startY += 20;
      }
    });

    doc.save(`APUs_${currentPresupuesto.nombre_proyecto.replace(/\s+/g, '_')}.pdf`);
  } catch (error: any) {
    console.error(error);
    alert("Error al generar PDF de APUs: " + error.message);
  }
}

export const generateExplosionPDF = (options: any) => {
  try {
    const { currentPresupuesto, explosionData } = options;

    if (!explosionData || explosionData.length === 0) {
      alert("No hay datos de explosión de insumos.");
      return;
    }

    const doc = new jsPDF();
    doc.addImage(membreteBase64, 'PNG', 50, 5, 110, 40)
    
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); 
    doc.text("EXPLOSIÓN DE INSUMOS", 14, 55)
    doc.setFontSize(10); doc.setFont("helvetica", "bold")
    doc.text(`Proyecto:`, 14, 63); doc.setFont("helvetica", "normal"); doc.text(`${currentPresupuesto.nombre_proyecto}`, 35, 63)
    doc.setFont("helvetica", "bold"); doc.text(`Fecha:`, 120, 63); doc.setFont("helvetica", "normal"); doc.text(`${new Date().toLocaleDateString()}`, 135, 63)

    let totMateriales = explosionData.filter((i: any) => i.tipo === 'material').reduce((acc: number, curr: any) => acc + curr.costo_total, 0);
    let totMO = explosionData.filter((i: any) => i.tipo === 'mano_de_obra').reduce((acc: number, curr: any) => acc + curr.costo_total, 0);
    let totEq = explosionData.filter((i: any) => i.tipo === 'equipo' || i.tipo === 'herramienta_menor').reduce((acc: number, curr: any) => acc + curr.costo_total, 0);
    let totOtros = explosionData.filter((i: any) => i.tipo === 'otros').reduce((acc: number, curr: any) => acc + curr.costo_total, 0);

    const summaryTable = [
      ["Materiales", "Mano Obra", "Equipos", "Otros", "Costo Directo Total"],
      [`$${totMateriales.toFixed(2)}`, `$${totMO.toFixed(2)}`, `$${totEq.toFixed(2)}`, `$${totOtros.toFixed(2)}`, `$${(totMateriales + totMO + totEq + totOtros).toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: 70,
      body: summaryTable,
      theme: 'grid',
      styles: { halign: 'center', fontSize: 9 },
      headStyles: { fillColor: [44, 62, 80] },
      bodyStyles: { fontStyle: 'bold' }
    });

    let finalY = (doc as any).lastAutoTable?.finalY + 10 || 90;

    const tableColumn = ["CÓD.", "INSUMO", "TIPO", "UND", "CANT. TOTAL", "P.U ($)", "TOTAL ($)"];
    const tableRows = explosionData.map((item: any) => [
      item.codigo,
      item.nombre,
      item.tipo,
      item.unidad,
      Number(item.cantidad_total).toFixed(4),
      Number(item.costo).toFixed(4),
      Number(item.costo_total).toFixed(2)
    ]);

    autoTable(doc, {
      startY: finalY,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [75, 143, 180] }
    });

    doc.save(`Explosion_Insumos_${currentPresupuesto.nombre_proyecto.replace(/\s+/g, '_')}.pdf`);
  } catch (error: any) {
    console.error(error);
    alert("Error al generar PDF de Explosión: " + error.message);
  }
}
