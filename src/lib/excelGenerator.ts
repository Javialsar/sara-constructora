import * as XLSX from 'xlsx';

export const generatePresupuestoGeneralExcel = (options: any) => {
  try {
    const {
      currentPresupuesto,
      proyectosCRM,
      totales,
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    } = options;

    const wb = XLSX.utils.book_new();

    // ==========================================
    // 1. HOJA DE RESUMEN (PRESUPUESTO GENERAL)
    // ==========================================
    const crmProject = proyectosCRM?.find((p: any) => p.id === currentPresupuesto.proyecto_crm_id);
    const projectName = currentPresupuesto.nombre_proyecto || crmProject?.nombre || 'Presupuesto Sin Nombre';

    const resumenData = [
      ["PRESUPUESTO GENERAL"],
      ["Proyecto:", projectName],
      ["Estado:", currentPresupuesto.estado || 'Borrador'],
      ["Fecha de Creación:", new Date(currentPresupuesto.created_at).toLocaleDateString()],
      [],
      ["RESUMEN DE COSTOS", "VALOR ($)"],
      ["Total Costo Directo", totales.costoDirectoTotal],
      ["Costos Indirectos (Admin, Imprevistos, Utilidad)", totales.totalGastosGenerales + totales.simp + totales.sutil],
      ["Total Costo Neto", totales.cnet],
      ["GRAN TOTAL (PRECIO DE VENTA)", totales.granTotal],
      [],
      ["DESGLOSE DE RUBROS (COSTO DIRECTO)"],
      ["Nº", "RUBRO", "CANTIDAD", "UNIDAD", "V. UNITARIO", "V. TOTAL"]
    ];

    let count = 1;
    let totalRubrosCalculated = 0;
    
    // Check if we have rubros mapped properly
    if (presupuestoRubros && presupuestoRubros.length > 0) {
      presupuestoRubros.forEach((pr: any) => {
        const baseRubro = allRubros?.find((r: any) => r.id === pr.rubro_id);
        const name = baseRubro?.nombre || 'Rubro Desconocido';
        const unit = baseRubro?.unidad || 'u';
        const qty = pr.cantidad || 0;
        
        // Calculate unit price from recipes
        const recipes = rubrosRecipes[pr.id] || [];
        let pUnit = 0;
        recipes.forEach((item: any) => {
          const price = item.precio_sin_iva_snapshot || item.insumo?.precio_sin_iva || 0;
          pUnit += (item.cantidad * price);
        });

        const pTotal = qty * pUnit;
        totalRubrosCalculated += pTotal;

        resumenData.push([
          count.toString(),
          name,
          qty,
          unit,
          pUnit,
          pTotal
        ]);
        count++;
      });
    }

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    
    // Formatting cols width
    wsResumen['!cols'] = [
      { wch: 5 },  // Nº
      { wch: 50 }, // Rubro / Desc
      { wch: 15 }, // Cantidad / Valor
      { wch: 10 }, // Unidad
      { wch: 15 }, // V Unit
      { wch: 15 }  // V Total
    ];

    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");


    // ==========================================
    // 2. HOJA DE EXPLOSIÓN DE INSUMOS
    // ==========================================
    // Aggregate all inputs required for the budget
    const insumosMap = new Map();

    if (presupuestoRubros && presupuestoRubros.length > 0) {
      presupuestoRubros.forEach((pr: any) => {
        const recipes = rubrosRecipes[pr.id] || [];
        recipes.forEach((item: any) => {
          if (!item.insumo) return;
          
          const iid = item.insumo.id;
          const price = item.precio_sin_iva_snapshot || item.insumo.precio_sin_iva || 0;
          const reqQty = item.cantidad * pr.cantidad;
          
          if (insumosMap.has(iid)) {
            const existing = insumosMap.get(iid);
            existing.cantidad += reqQty;
            existing.total = existing.cantidad * price;
          } else {
            insumosMap.set(iid, {
              codigo: item.insumo.codigo,
              nombre: item.insumo.nombre,
              tipo: item.insumo.tipo,
              unidad: item.insumo.unidad,
              precioUnitario: price,
              cantidad: reqQty,
              total: reqQty * price
            });
          }
        });
      });
    }

    const explosionData = [
      ["EXPLOSIÓN DE INSUMOS (MATERIALES, M.O., EQUIPOS)"],
      ["Proyecto:", projectName],
      [],
      ["CÓDIGO", "TIPO", "INSUMO", "UNIDAD", "CANTIDAD REQUERIDA", "PRECIO UNIT.", "SUBTOTAL"]
    ];

    let totalExplosion = 0;
    Array.from(insumosMap.values())
      .sort((a, b) => a.tipo.localeCompare(b.tipo)) // Sort by type
      .forEach(ins => {
        explosionData.push([
          ins.codigo || '-',
          ins.tipo?.toUpperCase() || 'MATERIAL',
          ins.nombre,
          ins.unidad,
          ins.cantidad,
          ins.precioUnitario,
          ins.total
        ]);
        totalExplosion += ins.total;
      });

    explosionData.push([]);
    explosionData.push(["", "", "", "", "", "TOTAL INSUMOS:", totalExplosion]);

    const wsExplosion = XLSX.utils.aoa_to_sheet(explosionData);
    wsExplosion['!cols'] = [
      { wch: 15 }, // Codigo
      { wch: 15 }, // Tipo
      { wch: 50 }, // Insumo
      { wch: 10 }, // Unidad
      { wch: 20 }, // Cantidad
      { wch: 15 }, // PU
      { wch: 15 }  // Subtotal
    ];

    XLSX.utils.book_append_sheet(wb, wsExplosion, "Explosión de Insumos");

    // ==========================================
    // EXPORT FILE
    // ==========================================
    const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `Presupuesto_${safeName}.xlsx`);

  } catch (error) {
    console.error("Error generating Excel:", error);
    alert("Ocurrió un error al generar el archivo Excel.");
  }
};

export const generateExplosionExcel = (options: {
  currentPresupuesto: any;
  explosionData: any[];
  title?: string;
}) => {
  try {
    const { currentPresupuesto, explosionData, title = "EXPLOSIÓN DE INSUMOS" } = options;
    const wb = XLSX.utils.book_new();
    const projectName = currentPresupuesto?.nombre_proyecto || 'Proyecto';

    const sheetData: any[][] = [
      ["SARA CONSTRUCTORA - SISTEMA DE PRESUPUESTOS"],
      [title],
      ["Proyecto:", projectName],
      ["Código:", currentPresupuesto?.codigo || 'N/A'],
      ["Fecha de Reporte:", new Date().toLocaleDateString()],
      [],
      ["CÓDIGO", "INSUMO", "TIPO", "UNIDAD", "CANT. TOTAL", "PRECIO UNIT. ($)", "COSTO TOTAL ($)"]
    ];

    let totalCosto = 0;
    explosionData.forEach((item) => {
      const cant = Number(item.cantidad_total || 0);
      const pu = Number(item.costo || 0);
      const tot = Number(item.costo_total || 0);
      totalCosto += tot;
      sheetData.push([
        item.codigo || '-',
        item.nombre || 'Insumo',
        (item.tipo || 'material').toUpperCase(),
        item.unidad || 'UND',
        cant,
        pu,
        tot
      ]);
    });

    sheetData.push([]);
    sheetData.push(["", "", "", "", "", "COSTO TOTAL:", totalCosto]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 16 }, // Codigo
      { wch: 45 }, // Insumo
      { wch: 18 }, // Tipo
      { wch: 10 }, // Unidad
      { wch: 15 }, // Cantidad Total
      { wch: 16 }, // Precio Unitario
      { wch: 16 }  // Costo Total
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Explosión Insumos");
    const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `Explosion_${safeName}.xlsx`);
  } catch (err) {
    console.error("Error generating explosion excel:", err);
    alert("Error al exportar la explosión de insumos a Excel.");
  }
};

