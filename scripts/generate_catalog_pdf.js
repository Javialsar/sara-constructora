const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function callAutoTable(doc, options) {
  if (autoTable.default) {
    autoTable.default(doc, options);
  } else {
    autoTable(doc, options);
  }
}

async function buildPdf() {
  console.log('--- GENERANDO REPORTE PDF OFICIAL GRUPO SARA ---');

  // 1. Obtener datos de nuevos insumos
  const { data: insumosDb, error: insErr } = await supabase
    .from('insumos')
    .select('codigo, nombre, tipo, unidad, precio_sin_iva, proveedores:proveedores!insumos_proveedor_id_fkey(razon_social)')
    .ilike('codigo', '%-EC-%')
    .order('codigo');

  if (insErr) {
    console.error('Error fetching insumos:', insErr);
  }

  // 2. Obtener datos de nuevos rubros y sus recetas completas
  const { data: rubrosDb } = await supabase
    .from('rubros')
    .select(`
      id, codigo, nombre, categoria, unidad, rendimiento, herramienta_menor_pct, total_costo_directo,
      rubro_insumos (
        cantidad,
        insumos (
          codigo, nombre, tipo, unidad, precio_sin_iva
        )
      )
    `)
    .ilike('codigo', 'RUB-EC-%')
    .order('codigo');

  // 3. Obtener proveedores destacados desde el archivo de respaldo o base de datos
  const reportDataJson = JSON.parse(fs.readFileSync('scripts/catalogo_ecuador_report_data.json', 'utf-8'));
  const provsDb = reportDataJson.proveedores;

  console.log(`Datos obtenidos: ${insumosDb?.length || 0} Insumos | ${rubrosDb?.length || 0} Rubros con APU | ${provsDb?.length || 0} Proveedores`);

  // Crear documento PDF tamaño A4 vertical
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Función para Header Corporativo
  const addHeader = (title, subtitle) => {
    // Fondo superior azul marino
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Banda esmeralda de acento
    doc.setFillColor(16, 185, 129); // #10b981
    doc.rect(0, 28, pageWidth, 2, 'F');

    // Título institucional
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GRUPO SARA  |  SISTEMA INTEGRAL DE CONSTRUCCIÓN & APU', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // #94a3b8
    doc.text(title.toUpperCase(), 14, 19);

    if (subtitle) {
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(subtitle, 14, 25);
    }

    // Fecha en la esquina derecha
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`ECUADOR 2026 | V.2.0 MAESTRO`, pageWidth - 14, 18, { align: 'right' });
  };

  // Función para Footer
  const addFooter = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Catálogo Maestro de Insumos y Rubros APU • Grupo SARA Constructora • Válido para Ecuador', 14, pageHeight - 7);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
    }
  };

  // ==========================================
  // PÁGINA 1: PORTADA EJECUTIVA Y PROVEEDORES
  // ==========================================
  addHeader('Catálogo Maestro de Rubros y Base de Insumos Verificados', 'Actualización Técnica y Salarial Vigente (MDT / CAMICON / MTOP / NEC)');

  let yPos = 36;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('EXPANSIÓN OFICIAL DEL CATÁLOGO DE CONSTRUCCIÓN', 14, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Base de Datos Técnica Estandarizada para Profesionales de la Construcción en el Ecuador', 14, yPos);
  yPos += 8;

  // Cuadro informativo resumen
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, yPos, 182, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN DE ACTUALIZACIÓN DEL SISTEMA (GRUPO SARA 2026):', 18, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Rubros Técnicos con Recetas APU 100% Desglosadas: ${rubrosDb.length} rubros de alto impacto ingenieril.`, 20, yPos + 13);
  doc.text(`• Insumos Homologados en Mercado: ${insumosDb.length} insumos (Materiales, Mano de Obra MDT 2026, Maquinaria, Transporte).`, 20, yPos + 19);
  doc.text(`• Red de Proveedores y Fabricantes Líderes: ${provsDb.length} empresas verificadas con RUC y cobertura nacional.`, 20, yPos + 25);
  doc.text(`• Marco Técnico & Normativo: NEC-SE-DS (Sismorresistencia), MTOP 001-F, Acuerdos MDT Salarios 2026.`, 20, yPos + 31);

  yPos += 40;

  // SECCIÓN: DIRECTORIO DE PROVEEDORES LÍDERES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Directorio de Proveedores y Fabricantes Líderes en Ecuador', 14, yPos);
  yPos += 4;

  const provRows = (provsDb || []).map(p => [
    p.razon_social,
    p.ruc,
    p.contacto_vendedor || 'Atención Comercial',
    p.telefono || 'N/A',
    p.sitio_web ? p.sitio_web.replace('https://', '').replace('http://', '') : 'N/A'
  ]);

  callAutoTable(doc, {
    startY: yPos,
    head: [['Empresa / Fabricante', 'RUC', 'Contacto Comercial', 'Teléfono', 'Web Oficial']],
    body: provRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.6, textColor: [51, 65, 85] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 46 },
      3: { cellWidth: 24 },
      4: { cellWidth: 32 }
    },
    margin: { left: 14, right: 14 }
  });

  // ==========================================
  // PÁGINA 2: CATÁLOGO DE INSUMOS
  // ==========================================
  doc.addPage();
  addHeader('Catálogo de Insumos, Materiales, Mano de Obra y Equipos', 'Precios Referenciales en Obra sin IVA (Condiciones Ecuador 2026)');

  yPos = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Insumos Maestros Incorporados por Categorías', 14, yPos);
  yPos += 4;

  const insRows = (insumosDb || []).map(ins => {
    let tipoLabel = 'Material';
    if (ins.tipo === 'mano_de_obra') tipoLabel = 'Mano de Obra';
    else if (ins.tipo === 'equipo') tipoLabel = 'Equipo / Maq.';
    else if (ins.tipo === 'transporte') tipoLabel = 'Transporte';

    return [
      ins.codigo,
      ins.nombre,
      tipoLabel,
      ins.unidad,
      ins.proveedores?.razon_social || 'Fabricante Nacional',
      `$${Number(ins.precio_sin_iva).toFixed(2)}`
    ];
  });

  callAutoTable(doc, {
    startY: yPos,
    head: [['Código', 'Descripción del Insumo / Recurso', 'Tipo', 'Unidad', 'Proveedor / Marca Referente', 'P.U. Sin IVA']],
    body: insRows,
    theme: 'striped',
    styles: { fontSize: 6.8, cellPadding: 1.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 22 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 38 },
      5: { cellWidth: 18, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // ==========================================
  // PÁGINA: CATÁLOGO DE RUBROS MAESTROS
  // ==========================================
  doc.addPage();
  addHeader('Catálogo de Rubros de Obra Civil y Arquitectura', 'Costos Directos Unitarios (APU) Estandarizados según Normas NEC y MTOP');

  yPos = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Rubros de Construcción Incorporados al Catálogo Grupo SARA', 14, yPos);
  yPos += 4;

  const rubRows = (rubrosDb || []).map(r => [
    r.codigo,
    r.nombre,
    r.categoria || 'Obra Civil',
    r.unidad,
    `${r.rendimiento || 0.5} h`,
    `${r.rubro_insumos?.length || 0} ins.`,
    `$${Number(r.total_costo_directo).toFixed(2)}`
  ]);

  callAutoTable(doc, {
    startY: yPos,
    head: [['Código', 'Nombre Técnico del Rubro', 'Categoría', 'Unidad', 'Rend.', 'Receta', 'Costo Directo']],
    body: rubRows,
    theme: 'grid',
    styles: { fontSize: 6.8, cellPadding: 1.8, textColor: [30, 41, 59] },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 66 },
      2: { cellWidth: 32 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // ==========================================
  // PÁGINAS: DESGLOSE DETALLADO DE RECETAS DE APU
  // ==========================================
  doc.addPage();
  addHeader('Análisis de Precios Unitarios (APU) - Desglose Técnico', 'Recetas de Composición: Materiales, Mano de Obra, Equipos y Herramientas');

  yPos = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Desglose de Análisis de Precios Unitarios (APU) por Rubro', 14, yPos);
  yPos += 5;

  for (let idx = 0; idx < (rubrosDb || []).length; idx++) {
    const rub = rubrosDb[idx];

    // Verificar si necesitamos nueva página para no cortar el rubro
    if (yPos > pageHeight - 50) {
      doc.addPage();
      addHeader('Análisis de Precios Unitarios (APU) - Desglose Técnico', 'Recetas de Composición: Materiales, Mano de Obra, Equipos y Herramientas');
      yPos = 36;
    }

    // Cabecera del Rubro
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, yPos, 182, 11, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${rub.codigo} - ${rub.nombre}`, 17, yPos + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Categoría: ${rub.categoria} | Unidad: ${rub.unidad} | Rendimiento: ${rub.rendimiento} h | Herramienta Menor: ${rub.herramienta_menor_pct}%`, 17, yPos + 8.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105);
    doc.text(`Costo Directo: $${Number(rub.total_costo_directo).toFixed(2)}`, 192, yPos + 7, { align: 'right' });

    yPos += 13;

    // Tabla de insumos del rubro
    const recipeRows = (rub.rubro_insumos || []).map(ri => {
      const ins = ri.insumos;
      const cant = Number(ri.cantidad);
      const pu = Number(ins?.precio_sin_iva || 0);
      const sub = cant * pu;
      let tipoStr = 'Material';
      if (ins?.tipo === 'mano_de_obra') tipoStr = 'M. Obra';
      else if (ins?.tipo === 'equipo') tipoStr = 'Equipo';

      return [
        ins?.codigo || 'N/A',
        ins?.nombre || 'Insumo',
        tipoStr,
        ins?.unidad || 'u',
        cant.toFixed(4),
        `$${pu.toFixed(2)}`,
        `$${sub.toFixed(2)}`
      ];
    });

    callAutoTable(doc, {
      startY: yPos,
      head: [['Código', 'Descripción del Insumo', 'Tipo', 'Unidad', 'Cantidad', 'P. Unitario', 'Subtotal']],
      body: recipeRows,
      theme: 'plain',
      styles: { fontSize: 6.5, cellPadding: 1.1, textColor: [51, 65, 85] },
      headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 76 },
        2: { cellWidth: 18 },
        3: { cellWidth: 14, halign: 'center' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 16, halign: 'right' },
        6: { cellWidth: 18, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 5;
  }

  // Agregar número de páginas y footer a todas las páginas
  addFooter();

  // Guardar archivo PDF en public/reportes
  const outputPath = path.join(process.cwd(), 'public', 'reportes', 'Catalogo_Maestro_Rubros_e_Insumos_GrupoSARA.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`[ÉXITO TOTAL] PDF generado correctamente: ${outputPath} (${pdfBuffer.length} bytes)`);
}

buildPdf().catch(console.error);
