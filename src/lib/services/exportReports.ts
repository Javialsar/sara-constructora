"use client"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { EmpresaConfigService } from "./empresaConfigService"

export type ModuloReporteTipo = 'obras' | 'bodega' | 'compras' | 'contabilidad' | 'talento';

export interface KpiReporteItem {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
  color?: 'default' | 'danger' | 'warning' | 'success';
}

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) nativo
 * Incluye membrete con la Identidad Corporativa de la Empresa
 * y opcionalmente un bloque de Indicadores Clave de Gestión (KPIs)
 */
export function exportarAExcel(
  datos: Record<string, any>[], 
  nombreArchivo: string, 
  nombreHoja: string = "Reporte",
  tipoModulo: ModuloReporteTipo = 'obras',
  kpis?: KpiReporteItem[] | Record<string, string | number>
) {
  try {
    const { empresa, reportesConfig } = EmpresaConfigService.getConfigCompleta();
    const firmaModulo = reportesConfig?.firmasPorModulo?.[tipoModulo];
    
    // Crear metadata del encabezado
    const fechaHora = `${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' })}`;
    
    const encabezadoEmpresa: any[] = [
      { A: empresa.razon_social.toUpperCase() },
      { A: `RUC: ${empresa.ruc} | NOMBRE COMERCIAL: ${empresa.nombre_comercial}` },
      { A: `DIRECCIÓN: ${empresa.calle_principal}, ${empresa.ciudad} - ${empresa.provincia}` },
      { A: `TEL: ${empresa.telefono} | EMAIL: ${empresa.email} | GERENCIA: ${empresa.gerente}` },
      { A: `FECHA DE REPORTE: ${fechaHora}` },
      { A: `MÓDULO: SARA CONSTRUCTORA - ${tipoModulo.toUpperCase()}` },
    ];

    if (kpis) {
      encabezadoEmpresa.push({ A: "" });
      encabezadoEmpresa.push({ A: "=== INDICADORES CLAVE DE GESTIÓN Y EXISTENCIAS (KPIS) ===" });
      if (Array.isArray(kpis)) {
        kpis.forEach(item => {
          encabezadoEmpresa.push({ A: `${item.etiqueta.toUpperCase()}: ${item.valor}` });
        });
      } else {
        Object.entries(kpis).forEach(([k, v]) => {
          encabezadoEmpresa.push({ A: `${k.toUpperCase()}: ${v}` });
        });
      }
    }

    encabezadoEmpresa.push({ A: "" }); // Espacio vacío

    const wb = XLSX.utils.book_new();
    
    // Convertir encabezado y luego datos
    const ws = XLSX.utils.json_to_sheet(encabezadoEmpresa, { skipHeader: true });
    const filaDatosInicio = encabezadoEmpresa.length + 1;
    XLSX.utils.sheet_add_json(ws, datos, { origin: `A${filaDatosInicio}` });

    // Agregar bloque de firmas al pie del Excel
    const filaFirmasInicio = filaDatosInicio + datos.length + 3;
    const firma1Nombre = firmaModulo?.firma1_nombre || empresa.gerente || 'Ing. Responsable';
    const firma1Cargo = firmaModulo?.firma1_cargo || 'Residente / Responsable';
    const firma2Nombre = firmaModulo?.firma2_nombre || 'Fiscalizador / Auditor';
    const firma2Cargo = firmaModulo?.firma2_cargo || 'Fiscalización de Obra';

    XLSX.utils.sheet_add_aoa(ws, [
      ["_______________________________", "", "_______________________________"],
      [firma1Nombre, "", firma2Nombre],
      [firma1Cargo, "", firma2Cargo],
      [`Doc: ${firmaModulo?.firma1_documento || 'SENESCYT Reg.'}`, "", `Doc: ${firmaModulo?.firma2_documento || 'IESS / Reg.'}`]
    ], { origin: `A${filaFirmasInicio}` });

    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.xlsx`);
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    alert("Hubo un error al generar el archivo Excel.");
  }
}

/**
 * Exporta una tabla con encabezados y filas a un documento PDF profesional
 * Incorpora los datos oficiales configurados en "Configuración de la Empresa"
 * e incluye el bloque de firmas configurado para Contabilidad, Compras, Bodega u Obras.
 * Si se proporcionan 'kpis', dibuja tarjetas visuales ejecutivas de métricas antes de la tabla.
 */
export function exportarAPDF(
  tituloPrincipal: string,
  encabezados: string[],
  filas: (string | number)[][],
  nombreArchivo: string,
  subtitulo: string = "",
  tipoModulo: ModuloReporteTipo = 'obras',
  kpis?: KpiReporteItem[]
) {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const { empresa, reportesConfig } = EmpresaConfigService.getConfigCompleta();
    const firmaModulo = reportesConfig?.firmasPorModulo?.[tipoModulo];

    // Franja superior corporativa (slate-900 elegante)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 24, "F");

    // Borde inferior ámbar
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 23, 297, 1.5, "F");

    // Nombre de la Empresa o Razón Social
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const nombreEmpresa = (reportesConfig?.incluir_razon_social ? empresa.razon_social : empresa.nombre_comercial) || "SARA CONSTRUCTORA";
    doc.text(nombreEmpresa.toUpperCase(), 14, 10);

    // Subdatos de la empresa (RUC, Dirección, Teléfono)
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225); // slate-300
    
    const rucStr = reportesConfig?.incluir_ruc ? `RUC: ${empresa.ruc}  •  ` : "";
    const dirStr = reportesConfig?.incluir_direccion ? `${empresa.calle_principal}, ${empresa.ciudad}  •  ` : "";
    const telStr = reportesConfig?.incluir_telefono ? `Tel: ${empresa.telefono}` : "";
    doc.text(`${rucStr}${dirStr}${telStr}`, 14, 16);

    // Fecha y hora de emisión al extremo derecho
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text(
      `Emisión: ${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' })}`,
      230,
      10
    );

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Gerencia: ${empresa.gerente || 'Ing. Responsable'}`, 230, 16);

    // Título del Reporte
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(tituloPrincipal, 14, 32);

    if (subtitulo) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(subtitulo, 14, 37);
    }

    let startY = subtitulo ? 41 : 35;

    // Renderizar Bloque Visual de KPIs (si existen)
    if (kpis && kpis.length > 0) {
      const kpiY = subtitulo ? 40 : 35;
      const totalWidth = 269; // 297 - 28 (márgenes)
      const count = kpis.length;
      const gap = 2.5;
      const cardWidth = (totalWidth - (count - 1) * gap) / count;
      const cardHeight = 12;

      kpis.forEach((kpi, idx) => {
        const x = 14 + idx * (cardWidth + gap);

        // Estilo de color según estado
        if (kpi.color === 'danger') {
          doc.setFillColor(255, 241, 242);
          doc.setDrawColor(244, 63, 94);
        } else if (kpi.color === 'warning') {
          doc.setFillColor(254, 252, 232);
          doc.setDrawColor(234, 179, 8);
        } else if (kpi.color === 'success') {
          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(34, 197, 94);
        } else {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
        }

        doc.setLineWidth(0.3);
        doc.roundedRect(x, kpiY, cardWidth, cardHeight, 1.5, 1.5, "FD");

        // Etiqueta
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.etiqueta.toUpperCase(), x + 2.5, kpiY + 4);

        // Valor
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        if (kpi.color === 'danger') {
          doc.setTextColor(225, 29, 72);
        } else if (kpi.color === 'warning') {
          doc.setTextColor(180, 83, 9);
        } else if (kpi.color === 'success') {
          doc.setTextColor(21, 128, 61);
        } else {
          doc.setTextColor(15, 23, 42);
        }
        doc.text(kpi.valor, x + 2.5, kpiY + 9);
      });

      startY = kpiY + cardHeight + 4;
    }

    // Tabla con autoTable
    autoTable(doc, {
      startY: startY,
      head: [encabezados],
      body: filas,
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        valign: "middle"
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: startY, left: 14, right: 14, bottom: 35 }
    });

    // Obtener la posición Y final de la tabla para colocar las firmas
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    
    // Si la tabla terminó muy abajo, crear una página para las firmas
    let firmaY = finalY + 16;
    if (firmaY > 170) {
      doc.addPage();
      firmaY = 30;
    }

    // Dibujar Bloque Oficial de Firmas (Configuración de la Empresa)
    const firma1Nombre = firmaModulo?.firma1_nombre || empresa.gerente || 'Ing. Responsable';
    const firma1Cargo = firmaModulo?.firma1_cargo || 'Residente / Responsable';
    const firma1Doc = firmaModulo?.firma1_documento ? `Doc / SENESCYT: ${firmaModulo.firma1_documento}` : 'Registro Profesional Vigente';

    const firma2Nombre = firmaModulo?.firma2_nombre || 'Ing. Fiscalizador de Obra';
    const firma2Cargo = firmaModulo?.firma2_cargo || 'Fiscalización / Auditoría Técnica';
    const firma2Doc = firmaModulo?.firma2_documento ? `Doc / SENESCYT: ${firmaModulo.firma2_documento}` : 'Certificación SERCOP / IESS';

    // Línea 1
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.4);
    doc.line(30, firmaY + 12, 105, firmaY + 12);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(firma1Nombre, 67.5, firmaY + 17, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(firma1Cargo, 67.5, firmaY + 21, { align: "center" });
    doc.text(firma1Doc, 67.5, firmaY + 25, { align: "center" });

    // Línea 2
    doc.line(190, firmaY + 12, 265, firmaY + 12);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(firma2Nombre, 227.5, firmaY + 17, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(firma2Cargo, 227.5, firmaY + 21, { align: "center" });
    doc.text(firma2Doc, 227.5, firmaY + 25, { align: "center" });

    // Pie de página con datos de la empresa y paginación
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Documento Oficial generado por ${empresa.nombre_comercial} (${empresa.razon_social}) • RUC ${empresa.ruc} • Módulo: ${tipoModulo.toUpperCase()}`,
        14,
        202
      );
      doc.text(
        `Página ${i} de ${totalPages} • GRUPO SARA HOLDING`,
        240,
        202
      );
    }

    doc.save(`${nombreArchivo}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error al exportar a PDF:", error);
    alert("Hubo un error al generar el archivo PDF.");
  }
}
