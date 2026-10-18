"use client"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { EmpresaConfigService } from "./empresaConfigService"

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) nativo
 * Incluye membrete con la Identidad Corporativa de la Empresa
 */
export function exportarAExcel(datos: Record<string, any>[], nombreArchivo: string, nombreHoja: string = "Reporte") {
  try {
    const empresaConfig = EmpresaConfigService.getEmpresa();
    
    // Crear metadata del encabezado
    const fechaHora = `${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' })}`;
    
    const encabezadoEmpresa = [
      { A: empresaConfig.razon_social.toUpperCase() },
      { A: `RUC: ${empresaConfig.ruc} | NOMBRE COMERCIAL: ${empresaConfig.nombre_comercial}` },
      { A: `DIRECCIÓN: ${empresaConfig.calle_principal}, ${empresaConfig.ciudad} - ${empresaConfig.provincia}` },
      { A: `TEL: ${empresaConfig.telefono} | EMAIL: ${empresaConfig.email} | GERENCIA: ${empresaConfig.gerente}` },
      { A: `FECHA DE REPORTE: ${fechaHora}` },
      { A: "" }, // Espacio vacío
    ];

    const wb = XLSX.utils.book_new();
    
    // Convertir encabezado y luego datos
    const ws = XLSX.utils.json_to_sheet(encabezadoEmpresa, { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, datos, { origin: "A7" });

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
 */
export function exportarAPDF(
  tituloPrincipal: string,
  encabezados: string[],
  filas: (string | number)[][],
  nombreArchivo: string,
  subtitulo: string = ""
) {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const { empresa, reportesConfig } = EmpresaConfigService.getConfigCompleta();

    // Franja superior corporativa (ámbar/oro y slate oscuro elegante)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 24, "F");

    // Borde inferior ámbar
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 23, 297, 1.5, "F");

    // Nombre de la Empresa o Razón Social
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const nombreEmpresa = (reportesConfig.incluir_razon_social ? empresa.razon_social : empresa.nombre_comercial) || "SARA CONSTRUCTORA";
    doc.text(nombreEmpresa.toUpperCase(), 14, 10);

    // Subdatos de la empresa (RUC, Dirección, Teléfono)
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225); // slate-300
    
    const rucStr = reportesConfig.incluir_ruc ? `RUC: ${empresa.ruc}  •  ` : "";
    const dirStr = reportesConfig.incluir_direccion ? `${empresa.calle_principal}, ${empresa.ciudad}  •  ` : "";
    const telStr = reportesConfig.incluir_telefono ? `Tel: ${empresa.telefono}` : "";
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
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(tituloPrincipal, 14, 34);

    if (subtitulo) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(subtitulo, 14, 40);
    }

    const startY = subtitulo ? 45 : 39;

    // Tabla con autoTable
    autoTable(doc, {
      startY: startY,
      head: [encabezados],
      body: filas,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        valign: "middle"
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: 45, left: 14, right: 14, bottom: 20 }
    });

    // Pie de página con datos de la empresa y paginación
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Documento Oficial generado por ${empresa.nombre_comercial} (${empresa.razon_social}) • RUC ${empresa.ruc}`,
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
