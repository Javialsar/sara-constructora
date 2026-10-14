import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CuadroComparativoDocumentData, ReporteConsolidadoDocumentData } from './advisory-types';

/**
 * Agrega el encabezado corporativo oficial de GRUPO SARA en el documento PDF
 */
const agregarMembreteSARA = (doc: jsPDF, tituloPrincipal: string, subtitulo: string) => {
  // Franja decorativa superior azul cobalto
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 18, 'F');

  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 18, 210, 3, 'F');

  // Texto del encabezado
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('GRUPO SARA · INGENIERÍA & ARQUITECTURA', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RED DE AGENTES COLECTIVOS · ECUADOR', 196, 12, { align: 'right' });

  // Título del documento
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(tituloPrincipal, 14, 30);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitulo, 14, 36);
};

/**
 * Agrega el pie de página con numeración y validación de seguridad
 */
const agregarPieDePagina = (doc: jsPDF, codigoDoc: string) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');

    doc.line(14, 283, 196, 283);
    doc.text(`Doc Ref: ${codigoDoc} | Emisión Autorizada Grupo SARA | Plataforma Cloud sara-constructora.vercel.app`, 14, 288);
    doc.text(`Página ${i} de ${pageCount}`, 196, 288, { align: 'right' });
  }
};

/**
 * 1. Genera y descarga el CUADRO COMPARATIVO DE PROVEEDORES (PDF)
 */
export const descargarCuadroComparativoPDF = (data: CuadroComparativoDocumentData) => {
  try {
    const doc = new jsPDF();

    agregarMembreteSARA(
      doc,
      'CUADRO COMPARATIVO DE PROVEEDORES Y SUMINISTROS',
      'Análisis técnico y financiero de insumos de obra civil con asignación de crédito y logística'
    );

    // Metadata del proyecto
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 41, 182, 22, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('PROYECTO:', 18, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(data.proyectoNombre, 40, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('UBICACIÓN:', 18, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(data.ubicacion, 40, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO DOC:', 125, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(data.codigoDocumento, 152, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA EMISIÓN:', 125, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(data.fechaEmision, 152, 54);

    // Tabla comparativa de proveedores
    const columnas = [
      'INSUMO / ESPECIFICACIÓN',
      'PROVEEDOR',
      'ORIGEN',
      'P. UNIT.',
      'FLETE',
      'CRÉDITO',
      'SCORE IA',
      'ESTADO'
    ];

    const filas = data.items.map((item) => [
      item.insumo,
      item.proveedor,
      item.ciudadOrigen,
      `$${item.precioUnitario.toFixed(2)} / ${item.unidad}`,
      item.fleteIncluido ? '✓ Bonificado' : 'No incluido',
      item.diasCredito > 0 ? `${item.diasCredito} días` : 'Contado',
      `${item.puntuacionConfianzaIA}%`,
      item.recomendado ? '★ Adjudicar' : 'Alternativa'
    ]);

    autoTable(doc, {
      startY: 68,
      head: [columnas],
      body: filas,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 34 },
        2: { cellWidth: 22 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 14, halign: 'center' },
        7: { cellWidth: 19, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: function (dataHook) {
        if (dataHook.section === 'body' && dataHook.column.index === 7) {
          if (dataHook.cell.raw === '★ Adjudicar') {
            dataHook.cell.styles.textColor = [16, 185, 129]; // verde esmeralda
          } else {
            dataHook.cell.styles.textColor = [100, 116, 139];
          }
        }
      }
    });

    let currentY = (doc as any).lastAutoTable?.finalY || 160;

    // Caja de Dictamen IA y Resumen Financiero
    if (currentY + 60 > 270) {
      doc.addPage();
      currentY = 25;
    } else {
      currentY += 8;
    }

    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, currentY, 182, 38, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('DICTAMEN DE ADJUDICACIÓN POR LA RED AGÉNTICA SARA:', 18, currentY + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitDictamen = doc.splitTextToSize(data.dictamenIA, 174);
    doc.text(splitDictamen, 18, currentY + 13);

    // Métricas clave en pastillas
    doc.setFont('helvetica', 'bold');
    doc.text(`• Ahorro Financiero Directo: $${data.resumenFinanciero.ahorroTotalProyectadoUSD.toFixed(2)} USD`, 18, currentY + 27);
    doc.text(`• Optimización de Flujo de Caja: +${data.resumenFinanciero.optimizacionFlujoCajaPct}%`, 95, currentY + 27);
    doc.text(`• Crédito Operativo Promedio: ${data.resumenFinanciero.diasCreditoPromedio} días`, 18, currentY + 33);
    doc.text(`• Opciones de Mercado Evaluadas: ${data.resumenFinanciero.totalOpcionesAnalizadas}`, 95, currentY + 33);

    // Firmas de Responsabilidad
    currentY += 52;
    if (currentY + 25 > 270) {
      doc.addPage();
      currentY = 30;
    }

    doc.setDrawColor(100, 116, 139);
    doc.line(25, currentY, 85, currentY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('EVALUADO POR (IA & TÉCNICO)', 55, currentY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(data.tecnicoResponsable, 55, currentY + 10, { align: 'center' });

    doc.line(125, currentY, 185, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text('APROBADO POR (DIRECTOR DE OBRA)', 155, currentY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(data.directorObra, 155, currentY + 10, { align: 'center' });

    agregarPieDePagina(doc, data.codigoDocumento);

    doc.save(`Cuadro_Comparativo_Proveedores_${data.proyectoNombre.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generando Cuadro Comparativo PDF:', error);
    throw error;
  }
};

/**
 * 2. Genera y descarga el REPORTE CONSOLIDADO DE INSUMOS Y LOGÍSTICA (PDF)
 */
export const descargarReporteConsolidadoPDF = (data: ReporteConsolidadoDocumentData) => {
  try {
    const doc = new jsPDF();

    agregarMembreteSARA(
      doc,
      'REPORTE CONSOLIDADO DE INSUMOS Y LOGÍSTICA PESADA',
      'Cubicación métrica, despacho vial unificado e impacto económico positivo consolidado'
    );

    // Ficha de Proyecto y Director de Obra
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 41, 182, 24, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('PROYECTO:', 18, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(data.proyectoNombre, 40, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('UBICACIÓN OBRA:', 18, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(data.ubicacionObra, 45, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('DIRECTOR DE OBRA:', 18, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(data.directorObra, 50, 60);

    doc.setFont('helvetica', 'bold');
    doc.text('CÓDIGO DOC:', 125, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(data.codigoDocumento, 152, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA:', 125, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(data.fechaEmision, 152, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('VOL. DESALOJO:', 125, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.volumenDesalojoTotalM3} m³ (${data.pesoTotalCargaTon} Ton)`, 152, 60);

    // Tabla de Desglose de Insumos y Logística Asignada
    const columnas = [
      'MATERIAL / ESPECIFICACIÓN',
      'CANTIDAD',
      'PUNTO DESPACHO',
      'TRANSPORTE PESADO',
      'COSTO BASE',
      'OPTIMIZADO',
      'AHORRO'
    ];

    const filas = data.materiales.map((m) => [
      m.material,
      `${m.cantidad} ${m.unidad}`,
      `${m.ubicacionDespacho} (${m.proveedorAsignado})`,
      `${m.tipoTransporteSugerido}\n[${m.cooperativaAliada}]`,
      `$${m.costoBaseUSD.toFixed(2)}`,
      `$${m.costoOptimizadoUSD.toFixed(2)}`,
      `$${m.ahorroEstimadoUSD.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [columnas],
      body: filas,
      theme: 'grid',
      styles: {
        fontSize: 7.2,
        cellPadding: 2.2,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 46 },
        1: { cellWidth: 20 },
        2: { cellWidth: 38 },
        3: { cellWidth: 34 },
        4: { cellWidth: 15, halign: 'right' },
        5: { cellWidth: 15, halign: 'right' },
        6: { cellWidth: 14, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
      }
    });

    let currentY = (doc as any).lastAutoTable?.finalY || 160;

    // Balance Financiero Consolidado
    if (currentY + 50 > 270) {
      doc.addPage();
      currentY = 25;
    } else {
      currentY += 8;
    }

    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, currentY, 182, 34, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // green-800
    doc.text('IMPACTO ECONÓMICO Y AHORRO CONSOLIDADO (RED GRUPO SARA):', 18, currentY + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`• Costo Logístico Tradicional de Mercado:`, 18, currentY + 15);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${data.balanceFinanciero.costoLogisticoTradicionalUSD.toFixed(2)} USD`, 82, currentY + 15);

    doc.setFont('helvetica', 'normal');
    doc.text(`• Costo Logístico Optimizado por la Red:`, 18, currentY + 21);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${data.balanceFinanciero.costoLogisticoOptimizadoUSD.toFixed(2)} USD`, 82, currentY + 21);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text(`• AHORRO NETO EN DÓLARES AMERICANOS:`, 18, currentY + 28);
    doc.setFontSize(10);
    doc.text(`$${data.balanceFinanciero.ahorroNetoLogisticaUSD.toFixed(2)} USD (${data.balanceFinanciero.porcentajeAhorroGlobal}% de reducción)`, 85, currentY + 28);

    // Declaración y Firmas para Director de Obra
    currentY += 46;
    if (currentY + 28 > 270) {
      doc.addPage();
      currentY = 30;
    }

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    const splitDecl = doc.splitTextToSize(data.declaracionResponsabilidad, 182);
    doc.text(splitDecl, 14, currentY);

    currentY += 22;
    doc.setDrawColor(100, 116, 139);
    doc.line(25, currentY, 85, currentY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('DIRECTOR DE OBRA RESPONSABLE', 55, currentY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(data.directorObra, 55, currentY + 10, { align: 'center' });

    doc.line(125, currentY, 185, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text('FISCALIZADOR TÉCNICO COLEGIADO', 155, currentY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(data.fiscalizadorColegiado, 155, currentY + 10, { align: 'center' });

    agregarPieDePagina(doc, data.codigoDocumento);

    doc.save(`Reporte_Consolidado_Insumos_Logistica_${data.proyectoNombre.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generando Reporte Consolidado PDF:', error);
    throw error;
  }
};
