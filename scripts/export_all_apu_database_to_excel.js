const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchAll(tableName, selectQuery = '*', orderCol = 'id') {
  let allData = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectQuery)
      .order(orderCol, { ascending: true })
      .range(from, from + step - 1);

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      from += step;
      if (data.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allData;
}

async function exportDatabaseToExcel() {
  console.log("Iniciando extracción completa de la Base de Datos APU...");

  // 1. Fetch Insumos
  console.log("Extrayendo catálogo maestro de Insumos (4,300+ registros)...");
  const insumos = await fetchAll('insumos', 'id, codigo, nombre, tipo, unidad, precio_sin_iva, categoria, familia, subfamilia, origen');
  console.log(`Insumos extraídos: ${insumos.length}`);

  const insumosMap = new Map();
  insumos.forEach(ins => insumosMap.set(ins.id, ins));

  // 2. Fetch Rubros
  console.log("Extrayendo catálogo de Rubros...");
  const rubros = await fetchAll('rubros', 'id, codigo, nombre, categoria, unidad, rendimiento, herramienta_menor_pct, total_costo_directo, estado');
  console.log(`Rubros extraídos: ${rubros.length}`);

  const rubrosMap = new Map();
  rubros.forEach(r => rubrosMap.set(r.id, r));

  // 3. Fetch Recetas (rubro_insumos)
  console.log("Extrayendo recetas y desglose analítico APU...");
  const recetas = await fetchAll('rubro_insumos', 'id, rubro_id, insumo_id, cantidad');
  console.log(`Líneas de recetas extraídas: ${recetas.length}`);

  // 4. Provincias del Ecuador
  const provincias = [
    { ID: 1, Nombre: "Guayas", Region: "Costa" },
    { ID: 2, Nombre: "Pichincha", Region: "Sierra" },
    { ID: 3, Nombre: "Santa Elena", Region: "Costa" },
    { ID: 4, Nombre: "Esmeraldas", Region: "Costa" },
    { ID: 5, Nombre: "Azuay", Region: "Sierra" },
    { ID: 6, Nombre: "Bolívar", Region: "Sierra" },
    { ID: 7, Nombre: "Cañar", Region: "Sierra" },
    { ID: 8, Nombre: "Carchi", Region: "Sierra" },
    { ID: 9, Nombre: "Chimborazo", Region: "Sierra" },
    { ID: 10, Nombre: "Cotopaxi", Region: "Sierra" },
    { ID: 11, Nombre: "El Oro", Region: "Costa" },
    { ID: 13, Nombre: "Galápagos", Region: "Insular" },
    { ID: 14, Nombre: "Imbabura", Region: "Sierra" },
    { ID: 15, Nombre: "Loja", Region: "Sierra" },
    { ID: 16, Nombre: "Los Ríos", Region: "Costa" },
    { ID: 17, Nombre: "Manabí", Region: "Costa" },
    { ID: 18, Nombre: "Morona Santiago", Region: "Amazonía" },
    { ID: 19, Nombre: "Napo", Region: "Amazonía" },
    { ID: 20, Nombre: "Orellana", Region: "Amazonía" },
    { ID: 21, Nombre: "Pastaza", Region: "Amazonía" },
    { ID: 24, Nombre: "Santo Domingo de los Tsáchilas", Region: "Costa / Sierra" },
    { ID: 25, Nombre: "Sucumbíos", Region: "Amazonía" },
    { ID: 26, Nombre: "Tungurahua", Region: "Sierra" },
    { ID: 27, Nombre: "Zamora Chinchipe", Region: "Amazonía" }
  ];

  // Preparar hojas de cálculo
  // Hoja 1: Resumen
  const resumenRows = [
    { Metrica: "Plataforma / Ecosistema", Valor: "GRUPO SARA — Base de Datos Maestra APU Ecuador" },
    { Metrica: "Fecha de Generación", Valor: new Date().toISOString().split('T')[0] },
    { Metrica: "Total Insumos Registrados", Valor: insumos.length },
    { Metrica: "Total Rubros Registrados", Valor: rubros.length },
    { Metrica: "Total Desgloses de Receta APU", Valor: recetas.length },
    { Metrica: "Provincias Georreferenciadas", Valor: provincias.length },
    { Metrica: "Normativa Base", Valor: "SERCOP / CICS MDT / CAMICON / INEC IPCO 2026" },
    { Metrica: "Moneda", Valor: "USD (Dólares de los Estados Unidos)" },
    { Metrica: "Categorías Insumo", Valor: "Materiales, Mano de Obra, Equipos, Transporte, Herramienta Menor" }
  ];

  // Hoja 2: Rubros
  const rubrosRows = rubros.map(r => ({
    "ID Rubro": r.id,
    "Código": r.codigo || `RUB-${r.id}`,
    "Categoría / Capítulo": r.categoria || "General",
    "Descripción del Rubro": r.nombre,
    "Unidad": r.unidad || "u",
    "Rendimiento Diario": Number(r.rendimiento) || 1,
    "% Herramienta Menor": Number(r.herramienta_menor_pct) || 5,
    "Costo Directo Unitario (USD)": Number(r.total_costo_directo) || 0,
    "Estado": r.estado || "A"
  }));

  // Hoja 3: Recetas APU (Desglose analítico detallado)
  const recetasRows = recetas.map(rec => {
    const rubro = rubrosMap.get(rec.rubro_id) || {};
    const insumo = insumosMap.get(rec.insumo_id) || {};
    const cant = Number(rec.cantidad) || 0;
    const precio = Number(insumo.precio_sin_iva) || 0;
    const subtotal = Math.round(cant * precio * 10000) / 10000;

    let tipoEtiqueta = insumo.tipo || "material";
    if (tipoEtiqueta === "mano_de_obra") tipoEtiqueta = "Mano de Obra";
    else if (tipoEtiqueta === "equipo") tipoEtiqueta = "Equipo / Maquinaria";
    else if (tipoEtiqueta === "transporte") tipoEtiqueta = "Transporte";
    else tipoEtiqueta = "Material";

    return {
      "ID Receta": rec.id,
      "Código Rubro": rubro.codigo || `RUB-${rec.rubro_id}`,
      "Descripción Rubro": rubro.nombre || `Rubro ${rec.rubro_id}`,
      "Unidad Rubro": rubro.unidad || "u",
      "Tipo Componente APU": tipoEtiqueta,
      "Código Insumo": insumo.codigo || `INS-${rec.insumo_id}`,
      "Descripción Insumo": insumo.nombre || `Insumo ${rec.insumo_id}`,
      "Unidad Insumo": insumo.unidad || "u",
      "Cantidad / Rendimiento": cant,
      "Costo Unitario USD": precio,
      "Costo Parcial USD": subtotal
    };
  });

  // Hoja 4: Insumos Maestros
  const insumosRows = insumos.map(ins => {
    let tipoEtiqueta = ins.tipo || "material";
    if (tipoEtiqueta === "mano_de_obra") tipoEtiqueta = "Mano de Obra";
    else if (tipoEtiqueta === "equipo") tipoEtiqueta = "Equipo / Maquinaria";
    else if (tipoEtiqueta === "transporte") tipoEtiqueta = "Transporte";
    else tipoEtiqueta = "Material";

    return {
      "ID Insumo": ins.id,
      "Código": ins.codigo || `INS-${ins.id}`,
      "Tipo Componente": tipoEtiqueta,
      "Descripción del Insumo": ins.nombre,
      "Unidad": ins.unidad || "u",
      "Precio Unitario sin IVA (USD)": Number(ins.precio_sin_iva) || 0,
      "Categoría": ins.categoria || "",
      "Familia": ins.familia || "",
      "Subfamilia": ins.subfamilia || "",
      "Origen": ins.origen || "Nacional"
    };
  });

  // Hoja 5: Provincias
  const provinciasRows = provincias.map(p => ({
    "ID Provincia": p.ID,
    "Provincia": p.Nombre,
    "Región Geográfica": p.Region
  }));

  // Crear Workbook con XLSX
  const wb = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
  const wsRubros = XLSX.utils.json_to_sheet(rubrosRows);
  const wsRecetas = XLSX.utils.json_to_sheet(recetasRows);
  const wsInsumos = XLSX.utils.json_to_sheet(insumosRows);
  const wsProvincias = XLSX.utils.json_to_sheet(provinciasRows);

  // Auto-fit columnas básicas
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 45 }];
  wsRubros['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 60 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 10 }];
  wsRecetas['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 45 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 45 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
  wsInsumos['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 55 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  wsProvincias['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsRubros, "Rubros");
  XLSX.utils.book_append_sheet(wb, wsRecetas, "Recetas_APU");
  XLSX.utils.book_append_sheet(wb, wsInsumos, "Insumos_Maestros");
  XLSX.utils.book_append_sheet(wb, wsProvincias, "Provincias_Ecuador");

  // Rutas de guardado
  const fileName = "BASE_DE_DATOS_APU_ECUADOR_GRUPO_SARA.xlsx";
  const outputPathPublic = path.join(process.cwd(), "public", fileName);
  const outputPathRoot = path.join(process.cwd(), fileName);

  XLSX.writeFile(wb, outputPathPublic);
  XLSX.writeFile(wb, outputPathRoot);

  console.log(`Archivo Excel generado exitosamente en:`);
  console.log(`1. ${outputPathPublic}`);
  console.log(`2. ${outputPathRoot}`);
  console.log(`Estadísticas del Excel:`);
  console.log(`- Rubros: ${rubrosRows.length}`);
  console.log(`- Recetas APU: ${recetasRows.length}`);
  console.log(`- Insumos Maestros: ${insumosRows.length}`);
  console.log(`- Provincias: ${provinciasRows.length}`);
}

exportDatabaseToExcel().catch(err => {
  console.error("Error al exportar:", err);
  process.exit(1);
});
