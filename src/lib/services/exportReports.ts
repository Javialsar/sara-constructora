"use client"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx) nativo
 */
export function exportarAExcel(datos: Record<string, any>[], nombreArchivo: string, nombreHoja: string = "Reporte") {
  try {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(datos)
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.xlsx`)
  } catch (error) {
    console.error("Error al exportar a Excel:", error)
    alert("Hubo un error al generar el archivo Excel.")
  }
}

/**
 * Exporta una tabla con encabezados y filas a un documento PDF profesional
 */
export function exportarAPDF(
  tituloPrincipal: string,
  encabezados: string[],
  filas: (string | number)[][],
  nombreArchivo: string,
  subtitulo: string = ""
) {
  try {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

    // Encabezado corporativo SARA
    doc.setFillColor(34, 53, 44) // brand-dark / brand-sage
    doc.rect(0, 0, 297, 18, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("SARA CONSTRUCTORA & INMOBILIARIA", 14, 12)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString("es-EC")} ${new Date().toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' })}`, 220, 12)

    // Título del Reporte
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(tituloPrincipal, 14, 28)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(subtitulo, 14, 34)

    // Tabla con autoTable
    autoTable(doc, {
      startY: 40,
      head: [encabezados],
      body: filas,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        valign: "middle"
      },
      headStyles: {
        fillColor: [34, 53, 44],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { top: 40, left: 14, right: 14, bottom: 15 }
    })

    // Pie de página
    const totalPages = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Página ${i} de ${totalPages} • Sistema Integral SARA Constructora e Inmobiliaria`,
        14,
        202
      )
    }

    doc.save(`${nombreArchivo}_${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Error al exportar a PDF:", error)
    alert("Hubo un error al generar el archivo PDF.")
  }
}
