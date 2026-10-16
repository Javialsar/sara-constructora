import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { membreteBase64 } from "@/lib/membreteBase64"


const getCompanyMembrete = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('my_company_logo');
    if (custom) return custom;
  }
  return membreteBase64;
};


const getCompanyProfile = () => {
  if (typeof window !== 'undefined') {
    const profileStr = localStorage.getItem('my_company_profile');
    if (profileStr) {
      try { return JSON.parse(profileStr).formData; } catch(e) {}
    }
    const identStr = localStorage.getItem('sara_empresa_identidad');
    if (identStr) {
      try {
        const id = JSON.parse(identStr);
        return {
          nombre_comercial: id.nombre_comercial,
          razon_social: id.razon_social,
          ruc: id.ruc,
          representante: id.gerente,
          telefono: id.telefono,
          email: id.email,
          website: id.sitio_web,
          direccion: `${id.calle_principal || ''} ${id.calle_secundaria || ''} - ${id.ciudad || ''}, ${id.provincia || ''}`
        };
      } catch(e) {}
    }
  }
  return null;
};

export const getSignersInfo = () => {
  if (typeof window !== 'undefined') {
    try {
      const reportesStr = localStorage.getItem('sara_reportes_config');
      const staffStr = localStorage.getItem('sara_empresa_staff');
      const empresaStr = localStorage.getItem('sara_empresa_identidad');

      const reportes = reportesStr ? JSON.parse(reportesStr) : null;
      const staff = staffStr ? JSON.parse(staffStr) : [];
      const empresa = empresaStr ? JSON.parse(empresaStr) : null;

      let principal = staff.find((t: any) => t.id === reportes?.tecnico_firmante_id) || staff[0] || {
        nombre: "Ing. Javier Sarango Gona",
        cargo: "Director General & Ing. Civil Estructural",
        senescyt: "1005-2016-189423"
      };

      return {
        tecnicoPrincipal: principal,
        segundaFirmaHabilitada: reportes?.segunda_firma_habilitada ?? true,
        segundaFirmaNombre: reportes?.segunda_firma_nombre || empresa?.gerente || "JOSE DE LA CUADRA",
        segundaFirmaCargo: reportes?.segunda_firma_cargo || "Representante Legal / Gerente General",
        empresa: empresa,
        reportesConfig: reportes
      };
    } catch(e) {}
  }
  return {
    tecnicoPrincipal: {
      nombre: "Ing. Javier Sarango Gona",
      cargo: "Director Técnico & Ing. Civil",
      senescyt: "1005-2016-189423"
    },
    segundaFirmaHabilitada: true,
    segundaFirmaNombre: "JOSE DE LA CUADRA",
    segundaFirmaCargo: "Representante Legal",
    empresa: null,
    reportesConfig: null
  };
};

const addCompanyFooter = (doc: jsPDF) => {
  const profile = getCompanyProfile();
  if (!profile) return;
  
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    
    let footerParts = [];
    if (profile.nombre_comercial || profile.razon_social) {
      footerParts.push(profile.razon_social || profile.nombre_comercial);
    }
    if (profile.ruc) footerParts.push(`RUC: ${profile.ruc}`);
    if (profile.direccion) footerParts.push(`Dir: ${profile.direccion.substring(0,50)}`);
    if (profile.telefono) footerParts.push(`Tel: ${profile.telefono}`);
    if (profile.email) footerParts.push(`Email: ${profile.email}`);
    if (profile.website) footerParts.push(`Web: ${profile.website}`);
    
    if (footerParts.length > 0) {
      doc.text(footerParts.join('  |  '), 14, doc.internal.pageSize.height - 10);
    }
  }
};

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

    const signers = getSignersInfo();
    const proyectoFound = proyectosCRM.find((p: any) => p.id === currentPresupuesto.proyecto_crm_id);
    const nombreCliente = proyectoFound?.clientes?.nombre || "Cliente No Asignado";
    const nombreTecnico = signers.tecnicoPrincipal.nombre;
    const diasEstimados = currentPresupuesto.dias_estimados || 30;

    const doc = new jsPDF();
    
    doc.addImage(getCompanyMembrete(), 'PNG', 50, 5, 110, 40)
    
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.text("PRESUPUESTO DE OBRA", 14, 55)
    doc.setFontSize(10); doc.setFont("helvetica", "bold")
    doc.text(`Proyecto:`, 14, 63); doc.setFont("helvetica", "normal"); doc.text(`${currentPresupuesto.nombre_proyecto}`, 35, 63)
    doc.setFont("helvetica", "bold"); doc.text(`Cliente:`, 14, 68); doc.setFont("helvetica", "normal"); doc.text(`${nombreCliente}`, 35, 68)
    doc.setFont("helvetica", "bold"); doc.text(`Elaborado por:`, 14, 73); doc.setFont("helvetica", "normal"); doc.text(`${nombreTecnico} (${signers.tecnicoPrincipal.cargo})`, 42, 73)
    
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
    if (firmaY > 265) {
        doc.addPage();
        firmaY = 40;
    }

    doc.setDrawColor(0);
    // Firma 1: Técnico Responsable Seleccionado
    doc.line(30, firmaY, 95, firmaY);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("RESPONSABLE TÉCNICO:", 62.5, firmaY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`${signers.tecnicoPrincipal.nombre}`, 62.5, firmaY + 9, { align: "center" });
    doc.setFontSize(7); doc.setTextColor(100);
    doc.text(`${signers.tecnicoPrincipal.cargo}`, 62.5, firmaY + 13, { align: "center" });
    if (signers.tecnicoPrincipal.senescyt) {
      doc.text(`SENESCYT: ${signers.tecnicoPrincipal.senescyt}`, 62.5, firmaY + 17, { align: "center" });
    }
    doc.setTextColor(0);

    // Firma 2: Aprobación
    doc.line(115, firmaY, 180, firmaY);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    if (signers.segundaFirmaHabilitada) {
      doc.text("APROBACIÓN DE OBRA:", 147.5, firmaY + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(`${signers.segundaFirmaNombre}`, 147.5, firmaY + 9, { align: "center" });
      doc.setFontSize(7); doc.setTextColor(100);
      doc.text(`${signers.segundaFirmaCargo}`, 147.5, firmaY + 13, { align: "center" });
    } else {
      doc.text("APROBADO POR (CLIENTE):", 147.5, firmaY + 5, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(`${nombreCliente}`, 147.5, firmaY + 9, { align: "center" });
    }
    doc.setTextColor(0);

    addCompanyFooter(doc);

    doc.save(`Presupuesto_${currentPresupuesto.nombre_proyecto.replace(/\s+/g, '_')}.pdf`)
  } catch (error: any) {
    console.error(error);
    alert("Error al generar PDF: " + error.message);
  }
}

export const generateAPUsPDF = (options: any) => {
  return generateSercopApuPDF(options);
};

export const generateSercopApuPDF = (options: any) => {
  try {
    const {
      currentPresupuesto,
      presupuestoRubros,
      rubrosRecipes,
      allRubros,
      tecnicoResponsable = "Ing. Residente / Oferente Responsable",
      registroProfesional = "Reg. Profesional / C.I.: 1104XXXXXX",
      entidadContratante = "Entidad Contratante (SERCOP Ecuador)",
      codigoProceso = "PROCESO-SERCOP-2026"
    } = options;

    if (!presupuestoRubros || presupuestoRubros.length === 0) {
      alert("No hay rubros en el presupuesto para generar APUs.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Configuración de indirectos del presupuesto
    const indConfig = currentPresupuesto?.indirectos_config || { ggen: 10, pimp: 3, util: 5 };
    const pctGgen = Number(indConfig.ggen || 10) + Number(indConfig.pgas1 || 0) + Number(indConfig.pgas2 || 0) + Number(indConfig.pgas3 || 0);
    const pctImp = Number(indConfig.pimp || 3);
    const pctUtil = Number(indConfig.util || 5);
    const pctAiuTotal = pctGgen + pctImp + pctUtil;

    presupuestoRubros.forEach((rubro: any, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      // 1. Membrete oficial
      try {
        doc.addImage(getCompanyMembrete(), 'PNG', 14, 8, 45, 18);
      } catch (e) {}

      // 2. Encabezado Oficial SERCOP
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("SISTEMA NACIONAL DE CONTRATACIÓN PÚBLICA - SERCOP", pageWidth / 2, 14, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("FORMULARIO OFICIAL DE ANÁLISIS DE PRECIOS UNITARIOS (A.P.U.)", pageWidth / 2, 19, { align: "center" });

      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(14, 28, pageWidth - 14, 28);

      // 3. Ficha Técnica del Proceso y Rubro
      doc.setFontSize(8);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("PROYECTO:", 14, 33);
      doc.setFont("helvetica", "normal");
      doc.text(`${currentPresupuesto?.nombre_proyecto || "Obra Civil"}`, 35, 33);

      doc.setFont("helvetica", "bold");
      doc.text("ENTIDAD:", 14, 38);
      doc.setFont("helvetica", "normal");
      doc.text(`${currentPresupuesto?.entidad_contratante || entidadContratante}`, 35, 38);

      doc.setFont("helvetica", "bold");
      doc.text("CÓDIGO:", 120, 33);
      doc.setFont("helvetica", "normal");
      doc.text(`${currentPresupuesto?.codigo_proceso || codigoProceso}`, 140, 33);

      doc.setFont("helvetica", "bold");
      doc.text("FECHA:", 120, 38);
      doc.setFont("helvetica", "normal");
      doc.text(`${new Date().toLocaleDateString('es-EC')}`, 140, 38);

      // Caja Destacada del Rubro
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 42, pageWidth - 28, 14, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 42, pageWidth - 28, 14, 'S');

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`RUBRO ${index + 1}: [${rubro.codigo_rubro || "RUB-001"}] ${rubro.nombre_rubro}`, 17, 48);

      const rubroMaestro = allRubros?.find((ar: any) => ar.id === rubro.rubro_id);
      const rendimiento = rubroMaestro?.rendimiento || rubro.rendimiento || 1.0;

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`UNIDAD: ${rubro.unidad}   |   RENDIMIENTO: ${Number(rendimiento).toFixed(2)} h/${rubro.unidad}   |   CANTIDAD OBRA: ${Number(rubro.cantidad_obra).toFixed(2)} ${rubro.unidad}`, 17, 53);

      // 4. Tablas Desglosadas (4 Secciones SERCOP)
      const insumos = rubrosRecipes[rubro.id] || [];
      let startY = 60;

      // --- SECCIÓN 1: EQUIPOS Y HERRAMIENTAS ---
      const eq = insumos.filter((r: any) => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo));
      const mo = insumos.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
      let costoMO = mo.reduce((acc: number, m: any) => acc + (Number(m.cantidad) * Number(m.precio_sin_iva_snapshot || 0)), 0);
      
      const hmPct = rubroMaestro ? (Number(rubroMaestro.herramienta_menor_pct) || 5) : 5;
      const hmValue = costoMO * (hmPct / 100);

      const eqRows: any[] = eq.map((m: any) => {
        const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
        const cant = Number(m.cantidad || 0);
        const pu = Number(m.precio_sin_iva_snapshot || 0);
        return [iObj?.nombre || 'Equipo', iObj?.unidad || 'h', cant.toFixed(4), pu.toFixed(4), (cant * pu).toFixed(4)];
      });
      if (hmValue > 0) {
        eqRows.push([`Herramienta Menor (${hmPct}% de Mano de Obra CCEC)`, '%mo', (hmPct / 100).toFixed(4), costoMO.toFixed(4), hmValue.toFixed(4)]);
      }
      let subtotalEquipos = eq.reduce((acc: number, m: any) => acc + (Number(m.cantidad) * Number(m.precio_sin_iva_snapshot || 0)), 0) + hmValue;

      autoTable(doc, {
        startY: startY,
        head: [["1. EQUIPOS Y HERRAMIENTAS", "UND", "CANT.", "TARIFA H ($)", "SUBTOTAL ($)"]],
        body: eqRows.length > 0 ? eqRows : [["No requiere equipo mecánico pesado", "-", "-", "-", "0.0000"]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
        foot: [["SUBTOTAL EQUIPOS (A)", "", "", "", `$ ${subtotalEquipos.toFixed(4)}`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'right' }
      });

      startY = (doc as any).lastAutoTable?.finalY + 3;

      // --- SECCIÓN 2: MANO DE OBRA (CCEC / MDT) ---
      const moRows: any[] = mo.map((m: any) => {
        const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
        const cant = Number(m.cantidad || 0);
        const pu = Number(m.precio_sin_iva_snapshot || 0);
        return [iObj?.nombre || 'Categoría Ocupacional CCEC', iObj?.unidad || 'h', cant.toFixed(4), pu.toFixed(4), (cant * pu).toFixed(4)];
      });

      autoTable(doc, {
        startY: startY,
        head: [["2. MANO DE OBRA (Tablas Sectoriales CCEC/MDT)", "UND", "CANT.", "COSTO H. ($)", "SUBTOTAL ($)"]],
        body: moRows.length > 0 ? moRows : [["Mano de obra incluida en subcontrato", "-", "-", "-", "0.0000"]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
        foot: [["SUBTOTAL MANO DE OBRA (B)", "", "", "", `$ ${costoMO.toFixed(4)}`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'right' }
      });

      startY = (doc as any).lastAutoTable?.finalY + 3;

      // --- SECCIÓN 3: MATERIALES ---
      const mat = insumos.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'material');
      let subtotalMateriales = mat.reduce((acc: number, m: any) => acc + (Number(m.cantidad) * Number(m.precio_sin_iva_snapshot || 0)), 0);
      const matRows: any[] = mat.map((m: any) => {
        const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
        const cant = Number(m.cantidad || 0);
        const pu = Number(m.precio_sin_iva_snapshot || 0);
        return [iObj?.nombre || 'Material de construcción', iObj?.unidad || 'u', cant.toFixed(4), pu.toFixed(4), (cant * pu).toFixed(4)];
      });

      autoTable(doc, {
        startY: startY,
        head: [["3. MATERIALES (Precios Referencia Mercado/INEC)", "UND", "CANT.", "PRECIO U ($)", "SUBTOTAL ($)"]],
        body: matRows.length > 0 ? matRows : [["No requiere materiales adicionales", "-", "-", "-", "0.0000"]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [44, 122, 123], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
        foot: [["SUBTOTAL MATERIALES (C)", "", "", "", `$ ${subtotalMateriales.toFixed(4)}`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'right' }
      });

      startY = (doc as any).lastAutoTable?.finalY + 3;

      // --- SECCIÓN 4: TRANSPORTE ---
      const trans = insumos.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'transporte');
      let subtotalTransporte = trans.reduce((acc: number, m: any) => acc + (Number(m.cantidad) * Number(m.precio_sin_iva_snapshot || 0)), 0);
      const transRows: any[] = trans.map((m: any) => {
        const iObj = Array.isArray(m.insumo) ? m.insumo[0] : m.insumo;
        const cant = Number(m.cantidad || 0);
        const pu = Number(m.precio_sin_iva_snapshot || 0);
        return [iObj?.nombre || 'Transporte y Acarreo de Material', iObj?.unidad || 'm3-km', cant.toFixed(4), pu.toFixed(4), (cant * pu).toFixed(4)];
      });

      autoTable(doc, {
        startY: startY,
        head: [["4. TRANSPORTE (Fletes y Acarreos MTOP)", "UND", "DIST./VOL.", "TARIFA ($)", "SUBTOTAL ($)"]],
        body: transRows.length > 0 ? transRows : [["Transporte incluido en precio puesto en obra", "km", "0.0000", "0.0000", "0.0000"]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
        foot: [["SUBTOTAL TRANSPORTE (D)", "", "", "", `$ ${subtotalTransporte.toFixed(4)}`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'right' }
      });

      startY = (doc as any).lastAutoTable?.finalY + 4;

      // --- RESUMEN ECONÓMICO FINAL & DESGLOSE AIU ---
      const costoDirectoRubro = subtotalEquipos + costoMO + subtotalMateriales + subtotalTransporte;
      const valorAIU = costoDirectoRubro * (pctAiuTotal / 100);
      const precioUnitarioFinal = costoDirectoRubro + valorAIU;

      const summaryRows = [
        ["TOTAL COSTO DIRECTO (A + B + C + D):", `$ ${costoDirectoRubro.toFixed(4)}`],
        [`INDIRECTOS Y UTILIDAD AIU (${pctAiuTotal.toFixed(2)}%):`, `$ ${valorAIU.toFixed(4)}`],
        [`  - Gastos Generales y Administración (${pctGgen}%):`, `$ ${(costoDirectoRubro * (pctGgen / 100)).toFixed(4)}`],
        [`  - Imprevistos (${pctImp}%):`, `$ ${(costoDirectoRubro * (pctImp / 100)).toFixed(4)}`],
        [`  - Utilidad (${pctUtil}%):`, `$ ${(costoDirectoRubro * (pctUtil / 100)).toFixed(4)}`],
        ["PRECIO UNITARIO TOTAL PROPUESTO (P.U.):", `$ ${precioUnitarioFinal.toFixed(4)} / ${rubro.unidad}`]
      ];

      autoTable(doc, {
        startY: startY,
        body: summaryRows,
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 1 },
        columnStyles: {
          0: { cellWidth: 140, fontStyle: 'bold', textColor: [30, 41, 59] },
          1: { cellWidth: 42, halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] }
        }
      });

      startY = (doc as any).lastAutoTable?.finalY + 4;

      // 5. Cita Normativa Obligatoria SERCOP
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text("Nota Técnica Obligatoria: Precios referenciados con cotizaciones locales e índices CAMICON / INEC Ecuador.", 14, startY);
      doc.text("Salarios reales de mano de obra según Tablas Sectoriales CCEC / MDT con Factor de Sobrecosto (FSBC). Rendimientos documentados según normas MTOP/CAMICON.", 14, startY + 3.5);

      // 6. Casillero de Firma del Responsable Técnico (Obligatorio SERCOP)
      const firmaY = Math.max(startY + 14, pageHeight - 32);

      doc.setDrawColor(100);
      doc.line(pageWidth / 2 - 40, firmaY, pageWidth / 2 + 40, firmaY);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("FIRMA DEL PROFESIONAL RESPONSABLE TÉCNICO", pageWidth / 2, firmaY + 4, { align: "center" });

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70);
      doc.text(`${tecnicoResponsable}`, pageWidth / 2, firmaY + 8, { align: "center" });
      doc.text(`${registroProfesional}   |   Oferente Habilitado RUP`, pageWidth / 2, firmaY + 11.5, { align: "center" });
    });

    const nombreArchivo = `APUs_SERCOP_${(currentPresupuesto?.nombre_proyecto || "Obra").replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
  } catch (error: any) {
    console.error(error);
    alert("Error al generar APUs formato SERCOP: " + error.message);
  }
};

export const generateExplosionPDF = (options: any) => {
  try {
    const { currentPresupuesto, explosionData } = options;

    if (!explosionData || explosionData.length === 0) {
      alert("No hay datos de explosión de insumos.");
      return;
    }

    const doc = new jsPDF();
    doc.addImage(getCompanyMembrete(), 'PNG', 50, 5, 110, 40)
    
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); 
    doc.text(options.title || "EXPLOSIÓN DE INSUMOS", 14, 55)
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
