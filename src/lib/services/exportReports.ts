"use client"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { EmpresaConfigService } from "./empresaConfigService"

export type ModuloReporteTipo = 'obras' | 'bodega' | 'compras' | 'contabilidad' | 'talento';

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) nativo
 * Incluye membrete con la Identidad Corporativa de la Empresa
 */
export function exportarAExcel(
  datos: Record<string, any>[], 
  nombreArchivo: string, 
  nombreHoja: string = "Reporte",
  tipoModulo: ModuloReporteTipo = 'obras'
) {
  try {
    const { empresa, reportesConfig } = EmpresaConfigService.getConfigCompleta();
    const firmaModulo = reportesConfig?.firmasPorModulo?.[tipoModulo];
    
    // Crear metadata del encabezado
    const fechaHora = `${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' })}`;
    
    const encabezadoEmpresa = [
      { A: empresa.razon_social.toUpperCase() },
      { A: `RUC: ${empresa.ruc} | NOMBRE COMERCIAL: ${empresa.nombre_comercial}` },
      { A: `DIRECCIÓN: ${empresa.calle_principal}, ${empresa.ciudad} - ${empresa.provincia}` },
      { A: `TEL: ${empresa.telefono} | EMAIL: ${empresa.email} | GERENCIA: ${empresa.gerente}` },
      { A: `FECHA DE REPORTE: ${fechaHora}` },
      { A: `MÓDULO: SARA CONSTRUCTORA - ${tipoModulo.toUpperCase()}` },
      { A: "" }, // Espacio vacío
    ];

    const wb = XLSX.utils.book_new();
    
    // Convertir encabezado y luego datos
    const ws = XLSX.utils.json_to_sheet(encabezadoEmpresa, { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, datos, { origin: "A8" });

    // Agregar bloque de firmas al pie del Excel
    const filaFirmasInicio = datos.length + 10;
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
 */
export function exportarAPDF(
  tituloPrincipal: string,
  encabezados: string[],
  filas: (string | number)[][],
  nombreArchivo: string,
  subtitulo: string = "",
  tipoModulo: ModuloReporteTipo = 'obras'
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
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(tituloPrincipal, 14, 33);

    if (subtitulo) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(subtitulo, 14, 38);
    }

    const startY = subtitulo ? 43 : 37;

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
      margin: { top: 43, left: 14, right: 14, bottom: 35 }
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
