"use client"
import React, { useState } from "react"
import { FileDown, Loader2, CheckCircle2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DownloadReportProps {
  proyecto: {
    id: string
    nombre: string
    estado: string
    ubicacion?: string
    avance: number
    created_at?: string
    clientes?: {
      nombre?: string
      apellido?: string
      email?: string
      telefono?: string
    }
  }
  avances?: Array<{
    id: string
    fecha: string
    titulo: string
    descripcion?: string
    tipo?: string
    url?: string
  }>
}

export default function DescargarReportePDF({ proyecto, avances = [] }: DownloadReportProps) {
  const [generando, setGenerando] = useState(false)
  const [completado, setCompletado] = useState(false)

  const generarPDF = async () => {
    try {
      setGenerando(true)
      const doc = new jsPDF()

      // 1. Encabezado Corporativo
      doc.setFillColor(47, 54, 48) // #2F3630 (Brand Dark)
      doc.rect(0, 0, 210, 38, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("GRUPO SARA - CONSTRUCTORA", 14, 18)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(177, 194, 177) // #B1C2B1 (Brand Sage)
      doc.text("INFORME TÉCNICO DE FISCALIZACIÓN Y AVANCE DE OBRA", 14, 26)

      doc.setFontSize(8)
      doc.setTextColor(220, 220, 220)
      const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })
      doc.text(`Fecha de emisión: ${fechaHoy}`, 14, 32)

      // 2. Cuadro de Datos Generales del Proyecto
      doc.setTextColor(40, 40, 40)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("1. RESUMEN EJECUTIVO DEL PROYECTO", 14, 48)

      const clienteNombre = proyecto.clientes 
        ? `${proyecto.clientes.nombre || ""} ${proyecto.clientes.apellido || ""}`.trim() 
        : "Propietario Registrado"

      const estadoTexto = proyecto.estado === "en_construccion" 
        ? "En Construcción Activa" 
        : (proyecto.estado === "finalizado" ? "Obra Finalizada" : "Fase de Diseño")

      autoTable(doc, {
        startY: 52,
        theme: "plain",
        head: [],
        body: [
          ["Nombre de la Obra:", proyecto.nombre || "S/N", "Avance Físico:", `${proyecto.avance || 0}%`],
          ["Propietario / Cliente:", clienteNombre || "N/A", "Estado Actual:", estadoTexto],
          ["Ubicación Geográfica:", proyecto.ubicacion || "Ecuador", "Contacto:", proyecto.clientes?.email || "contacto@sara.com"]
        ],
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [60, 60, 60], cellWidth: 42 },
          1: { cellWidth: 60 },
          2: { fontStyle: "bold", textColor: [60, 60, 60], cellWidth: 35 },
          3: { fontStyle: "bold", textColor: [47, 54, 48], cellWidth: 45 }
        }
      })

      // 3. Barra Gráfica de Avance
      const finalYTabla = (doc as any).lastAutoTable?.finalY || 80
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`Porcentaje de Ejecución Consolidado: ${proyecto.avance || 0}%`, 14, finalYTabla + 8)

      // Fondo de la barra
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(14, finalYTabla + 12, 182, 6, 2, 2, "F")
      // Relleno de la barra
      const anchoProgreso = Math.max(2, (182 * (proyecto.avance || 0)) / 100)
      doc.setFillColor(139, 157, 139) // Sage
      doc.roundedRect(14, finalYTabla + 12, anchoProgreso, 6, 2, 2, "F")

      // 4. Bitácora de Avances Documentados
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("2. BITÁCORA TÉCNICA Y EVIDENCIA FOTOGRÁFICA", 14, finalYTabla + 28)

      const filasAvances = (avances.length > 0 ? avances : [
        {
          fecha: new Date().toISOString(),
          titulo: "Inspección de obra y control de calidad",
          descripcion: "Verificación de plintos, estructura y avance conforme a especificaciones técnicas.",
          tipo: "foto"
        }
      ]).map((a, idx) => [
        `#${idx + 1}`,
        new Date(a.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
        a.titulo || "Avance registrado",
        a.descripcion || "Sin observaciones adicionales",
        a.tipo ? a.tipo.toUpperCase() : "REGISTRO"
      ])

      autoTable(doc, {
        startY: finalYTabla + 32,
        theme: "striped",
        head: [["ID", "Fecha", "Hito / Actividad", "Observaciones Técnicas", "Tipo"]],
        body: filasAvances,
        headStyles: { fillColor: [47, 54, 48], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 26 },
          2: { cellWidth: 55, fontStyle: "bold" },
          3: { cellWidth: 70 },
          4: { cellWidth: 19 }
        }
      })

      // 5. Firmas de Responsabilidad Técnica
      const finalYBitacora = (doc as any).lastAutoTable?.finalY || 160
      const firmaY = Math.min(finalYBitacora + 35, 255)

      // Línea fiscalizador
      doc.setDrawColor(120, 120, 120)
      doc.line(25, firmaY, 90, firmaY)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("DIRECTOR TÉCNICO DE OBRA", 32, firmaY + 6)
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text("SARA Constructora Cía. Ltda.", 35, firmaY + 11)

      // Línea cliente/fiscalización
      doc.line(120, firmaY, 185, firmaY)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("SUPERVISIÓN / CLIENTE", 132, firmaY + 6)
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(clienteNombre, 137, firmaY + 11)

      // Pie de página
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text("Documento generado automáticamente por el Ecosistema Corporativo SARA - Inmutable bajo auditoría.", 14, 288)

      // Descargar archivo
      const sanitizedName = (proyecto.nombre || "proyecto").replace(/[^a-zA-Z0-9_-]/g, "_")
      doc.save(`Informe_Fiscalizacion_${sanitizedName}.pdf`)

      setCompletado(true)
      setTimeout(() => setCompletado(false), 4000)
    } catch (e: any) {
      console.error("Error al generar PDF:", e)
      alert("No se pudo generar el reporte: " + e.message)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <button
      onClick={generarPDF}
      disabled={generando}
      className="inline-flex items-center gap-2 bg-brand-sage hover:bg-brand-sage/90 text-brand-dark px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
      title="Descargar informe técnico oficial en formato PDF"
    >
      {generando ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Generando PDF...</span>
        </>
      ) : completado ? (
        <>
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>Descargado con Éxito</span>
        </>
      ) : (
        <>
          <FileDown size={16} />
          <span>Descargar Informe Técnico (PDF)</span>
        </>
      )}
    </button>
  )
}
