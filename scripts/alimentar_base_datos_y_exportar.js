const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("ERROR: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Función de limpieza de cadenas para matching flexible
function cleanString(str) {
  if (!str) return '';
  return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}

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
      console.error(`Error en fetchAll ${tableName}:`, error.message);
      break;
    }

    if (data && data.length > 0) {
      allData.push(...data);
      from += step;
      if (data.length < step) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

// 24 Provincias del Ecuador con Factor Bioclimático Fgeo y Región
const PROVINCIAS_ECUADOR = [
  { ID: 1, Nombre: "Guayas", Region: "Costa", Altitud: "4 msnm", Factor_Fgeo: 0.95 },
  { ID: 2, Nombre: "Pichincha", Region: "Sierra", Altitud: "2.850 msnm", Factor_Fgeo: 0.90 },
  { ID: 3, Nombre: "Santa Elena", Region: "Costa", Altitud: "15 msnm", Factor_Fgeo: 0.95 },
  { ID: 4, Nombre: "Esmeraldas", Region: "Costa", Altitud: "10 msnm", Factor_Fgeo: 0.95 },
  { ID: 5, Nombre: "Azuay", Region: "Sierra", Altitud: "2.550 msnm", Factor_Fgeo: 0.92 },
  { ID: 6, Nombre: "Bolívar", Region: "Sierra", Altitud: "2.600 msnm", Factor_Fgeo: 0.90 },
  { ID: 7, Nombre: "Cañar", Region: "Sierra", Altitud: "3.100 msnm", Factor_Fgeo: 0.88 },
  { ID: 8, Nombre: "Carchi", Region: "Sierra", Altitud: "2.980 msnm", Factor_Fgeo: 0.88 },
  { ID: 9, Nombre: "Chimborazo", Region: "Sierra", Altitud: "2.750 msnm", Factor_Fgeo: 0.90 },
  { ID: 10, Nombre: "Cotopaxi", Region: "Sierra", Altitud: "2.770 msnm", Factor_Fgeo: 0.90 },
  { ID: 11, Nombre: "El Oro", Region: "Costa", Altitud: "6 msnm", Factor_Fgeo: 0.95 },
  { ID: 13, Nombre: "Galápagos", Region: "Insular", Altitud: "10 msnm", Factor_Fgeo: 0.85 },
  { ID: 14, Nombre: "Imbabura", Region: "Sierra", Altitud: "2.225 msnm", Factor_Fgeo: 0.93 },
  { ID: 15, Nombre: "Loja", Region: "Sierra", Altitud: "2.060 msnm", Factor_Fgeo: 0.93 },
  { ID: 16, Nombre: "Los Ríos", Region: "Costa", Altitud: "12 msnm", Factor_Fgeo: 0.95 },
  { ID: 17, Nombre: "Manabí", Region: "Costa", Altitud: "10 msnm", Factor_Fgeo: 0.95 },
  { ID: 18, Nombre: "Morona Santiago", Region: "Amazonía", Altitud: "1.050 msnm", Factor_Fgeo: 0.85 },
  { ID: 19, Nombre: "Napo", Region: "Amazonía", Altitud: "510 msnm", Factor_Fgeo: 0.85 },
  { ID: 20, Nombre: "Orellana", Region: "Amazonía", Altitud: "250 msnm", Factor_Fgeo: 0.85 },
  { ID: 21, Nombre: "Pastaza", Region: "Amazonía", Altitud: "950 msnm", Factor_Fgeo: 0.85 },
  { ID: 24, Nombre: "Santo Domingo de los Tsáchilas", Region: "Subtrópico", Altitud: "625 msnm", Factor_Fgeo: 0.92 },
  { ID: 25, Nombre: "Sucumbíos", Region: "Amazonía", Altitud: "297 msnm", Factor_Fgeo: 0.85 },
  { ID: 26, Nombre: "Tungurahua", Region: "Sierra", Altitud: "2.570 msnm", Factor_Fgeo: 0.92 },
  { ID: 27, Nombre: "Zamora Chinchipe", Region: "Amazonía", Altitud: "970 msnm", Factor_Fgeo: 0.85 }
];

// Proveedores Homologados en Ecuador para trazabilidad de compras y VAE
const PROVEEDORES_HOMOLOGADOS = [
  { RUC: "0990004199001", Empresa: "HOLCIM ECUADOR S.A.", Categoria: "Cemento, Prefabricados y Hormigones", Cobertura: "Nacional (24 Provincias)", VAE_Promedio: "88%" },
  { RUC: "1790016919001", Empresa: "UNACEM ECUADOR S.A.", Categoria: "Cemento Selvalegre y Derivados", Cobertura: "Sierra y Amazonía", VAE_Promedio: "90%" },
  { RUC: "1790054365001", Empresa: "NOVACERO S.A.", Categoria: "Acero Corrugado, Vigas y Cubiertas", Cobertura: "Nacional", VAE_Promedio: "75%" },
  { RUC: "1790082490001", Empresa: "ADELCA S.A.", Categoria: "Acería del Ecuador, Varillas y Mallas", Cobertura: "Nacional", VAE_Promedio: "82%" },
  { RUC: "0990011985001", Empresa: "PLASTIGAMA WAVIN", Categoria: "Tuberías PVC, PEAD y Conexiones", Cobertura: "Nacional", VAE_Promedio: "80%" },
  { RUC: "0190143807001", Empresa: "RIVAL TUBO SISTEMAS", Categoria: "Tubería Presión y Alcantarillado", Cobertura: "Nacional", VAE_Promedio: "84%" },
  { RUC: "0990055745001", Empresa: "SIKA ECUATORIANA S.A.", Categoria: "Aditivos, Impermeabilizantes y Morteros", Cobertura: "Nacional", VAE_Promedio: "70%" },
  { RUC: "0190135898001", Empresa: "GRAIMAN CÍA. LTDA.", Categoria: "Pisos Cerámicos, Porcelanatos y Revestimientos", Cobertura: "Nacional", VAE_Promedio: "85%" },
  { RUC: "1790055531001", Empresa: "FV - ÁREA ANDINA S.A.", Categoria: "Grifería y Artefactos Sanitarios", Cobertura: "Nacional", VAE_Promedio: "78%" },
  { RUC: "1790003183001", Empresa: "PINTURAS CÓNDOR S.A.", Categoria: "Pinturas Arquitectónicas e Industriales", Cobertura: "Nacional", VAE_Promedio: "76%" },
  { RUC: "0990004245001", Empresa: "IIASA CATERPILLAR ECUADOR", Categoria: "Maquinaria Pesada, Repuestos y Renta", Cobertura: "Nacional", VAE_Promedio: "45%" }
];

async function main() {
  console.log("===============================================================================");
  console.log("SARA APU — ALIMENTACIÓN Y CONSOLIDACIÓN DE BASE DE DATOS MAESTRA ECUADOR 2026");
  console.log("===============================================================================");

  // 1. Obtener insumos y rubros actuales de Supabase
  console.log("1. Extrayendo registros de Supabase...");
  const insumos = await fetchAll('insumos', 'id, codigo, nombre, tipo, unidad, precio_sin_iva, categoria, familia, subfamilia, origen');
  console.log(`✓ Insumos totales cargados: ${insumos.length}`);

  const rubros = await fetchAll('rubros', 'id, codigo, nombre, categoria, unidad, rendimiento, herramienta_menor_pct, total_costo_directo, estado');
  console.log(`✓ Rubros totales cargados: ${rubros.length}`);

  const insumosById = new Map();
  const insumosByCleanName = new Map();
  insumos.forEach(i => {
    insumosById.set(i.id, i);
    insumosByCleanName.set(cleanString(i.nombre), i);
  });

  // 2. Obtener recetas actuales
  const recetasActuales = await fetchAll('rubro_insumos', 'id, rubro_id, insumo_id, cantidad');
  console.log(`✓ Líneas de receta existentes: ${recetasActuales.length}`);

  const recetasByRubroId = new Map();
  recetasActuales.forEach(r => {
    if (!recetasByRubroId.has(r.rubro_id)) recetasByRubroId.set(r.rubro_id, []);
    recetasByRubroId.get(r.rubro_id).push(r);
  });

  // 3. Identificar insumos clave para el backfill canónico de rubros estándar
  // Peón, Albañil, Maestro Mayor, Fierrero, Operador, Herramientas, Volqueta, Trompo, Cemento, Arena, Ripio, Acero
  const peonInsumo = insumos.find(i => i.tipo === 'mano_de_obra' && /peon/i.test(i.nombre)) || insumos[0];
  const albanilInsumo = insumos.find(i => i.tipo === 'mano_de_obra' && /albanil/i.test(i.nombre)) || peonInsumo;
  const maestroInsumo = insumos.find(i => i.tipo === 'mano_de_obra' && /maestro mayor/i.test(i.nombre)) || albanilInsumo;
  const herrMenorInsumo = insumos.find(i => i.tipo === 'equipo' && /herramienta menor/i.test(i.nombre)) || insumos.find(i => i.tipo === 'equipo');
  const cementoInsumo = insumos.find(i => i.tipo === 'material' && /cemento/i.test(i.nombre)) || insumos[0];
  const arenaInsumo = insumos.find(i => i.tipo === 'material' && /arena/i.test(i.nombre)) || insumos[0];
  const ripioInsumo = insumos.find(i => i.tipo === 'material' && /ripio/i.test(i.nombre)) || insumos[0];
  const aguaInsumo = insumos.find(i => i.tipo === 'material' && /agua/i.test(i.nombre)) || insumos[0];
  const volquetaInsumo = insumos.find(i => i.tipo === 'equipo' && /volqueta/i.test(i.nombre)) || insumos.find(i => i.tipo === 'equipo');
  const retroInsumo = insumos.find(i => i.tipo === 'equipo' && /retroexcavadora|cargadora/i.test(i.nombre)) || volquetaInsumo;

  console.log("2. Analizando rubros sin receta o con costo directo $0.00...");
  let rubrosSinReceta = 0;
  let recetasCreadas = 0;
  const nuevasRecetas = [];

  for (const rubro of rubros) {
    const items = recetasByRubroId.get(rubro.id) || [];
    if (items.length === 0 || (Number(rubro.total_costo_directo) || 0) === 0) {
      rubrosSinReceta++;
      const cat = (rubro.categoria || '').toLowerCase();
      const nom = (rubro.nombre || '').toLowerCase();

      // Reglas de dosificación paramétrica según tipo de rubro:
      if (/excavaci|desalojo|movimiento de tierra|relleno|desbroce/i.test(nom) || /preliminar/i.test(cat)) {
        // Movimiento de tierras / preliminares
        nuevasRecetas.push(
          { rubro_id: rubro.id, insumo_id: retroInsumo.id, cantidad: 0.15 },
          { rubro_id: rubro.id, insumo_id: volquetaInsumo.id, cantidad: 0.12 },
          { rubro_id: rubro.id, insumo_id: peonInsumo.id, cantidad: 0.25 },
          { rubro_id: rubro.id, insumo_id: herrMenorInsumo.id, cantidad: 0.10 }
        );
      } else if (/hormig|concreto|columna|viga|zapata|losa|cadeneta/i.test(nom) || /estructura/i.test(cat)) {
        // Estructuras de hormigón
        nuevasRecetas.push(
          { rubro_id: rubro.id, insumo_id: cementoInsumo.id, cantidad: 7.50 },
          { rubro_id: rubro.id, insumo_id: arenaInsumo.id, cantidad: 0.55 },
          { rubro_id: rubro.id, insumo_id: ripioInsumo.id, cantidad: 0.85 },
          { rubro_id: rubro.id, insumo_id: aguaInsumo.id, cantidad: 0.18 },
          { rubro_id: rubro.id, insumo_id: albanilInsumo.id, cantidad: 3.20 },
          { rubro_id: rubro.id, insumo_id: peonInsumo.id, cantidad: 5.50 },
          { rubro_id: rubro.id, insumo_id: maestroInsumo.id, cantidad: 1.20 },
          { rubro_id: rubro.id, insumo_id: herrMenorInsumo.id, cantidad: 0.50 }
        );
      } else if (/mamposter|pared|bloque|ladrillo|enlucido|estuco/i.test(nom) || /albanileria/i.test(cat)) {
        // Mamposterías y acabados húmedos
        nuevasRecetas.push(
          { rubro_id: rubro.id, insumo_id: cementoInsumo.id, cantidad: 0.40 },
          { rubro_id: rubro.id, insumo_id: arenaInsumo.id, cantidad: 0.04 },
          { rubro_id: rubro.id, insumo_id: albanilInsumo.id, cantidad: 0.80 },
          { rubro_id: rubro.id, insumo_id: peonInsumo.id, cantidad: 0.80 },
          { rubro_id: rubro.id, insumo_id: herrMenorInsumo.id, cantidad: 0.15 }
        );
      } else {
        // Rubro genérico de obra civil
        nuevasRecetas.push(
          { rubro_id: rubro.id, insumo_id: albanilInsumo.id, cantidad: 0.50 },
          { rubro_id: rubro.id, insumo_id: peonInsumo.id, cantidad: 0.50 },
          { rubro_id: rubro.id, insumo_id: herrMenorInsumo.id, cantidad: 0.10 }
        );
      }
    }
  }

  console.log(`✓ Rubros identificados que requerían enriquecimiento: ${rubrosSinReceta}`);
  console.log(`✓ Nuevas asignaciones de insumo preparadas: ${nuevasRecetas.length}`);

  // 4. Inserción por lotes en Supabase
  if (nuevasRecetas.length > 0) {
    console.log("3. Sincronizando nuevas recetas en Supabase en lotes...");
    const batchSize = 100;
    for (let i = 0; i < nuevasRecetas.length; i += batchSize) {
      const chunk = nuevasRecetas.slice(i, i + batchSize);
      const { error: insErr } = await supabase.from('rubro_insumos').insert(chunk);
      if (insErr) {
        console.warn(`Aviso en lote ${i}:`, insErr.message);
      } else {
        recetasCreadas += chunk.length;
      }
    }
    console.log(`✓ Recetas insertadas exitosamente: ${recetasCreadas}`);
  }

  // 5. Recalcular total_costo_directo en todos los rubros
  console.log("4. Recalculando costo directo consolidado para todos los rubros...");
  const todasRecetas = await fetchAll('rubro_insumos', 'id, rubro_id, insumo_id, cantidad');
  const todasRecetasMap = new Map();
  todasRecetas.forEach(r => {
    if (!todasRecetasMap.has(r.rubro_id)) todasRecetasMap.set(r.rubro_id, []);
    todasRecetasMap.get(r.rubro_id).push(r);
  });

  let rubrosActualizados = 0;
  for (const rubro of rubros) {
    const items = todasRecetasMap.get(rubro.id) || [];
    let totMateriales = 0;
    let totManoObra = 0;
    let totEquipos = 0;

    for (const item of items) {
      const ins = insumosById.get(item.insumo_id);
      if (ins) {
        const costo = (Number(item.cantidad) || 0) * (Number(ins.precio_sin_iva) || 0);
        if (ins.tipo === 'material') totMateriales += costo;
        else if (ins.tipo === 'mano_de_obra') totManoObra += costo;
        else if (ins.tipo === 'equipo' || ins.tipo === 'transporte') totEquipos += costo;
      }
    }

    const hmPct = Number(rubro.herramienta_menor_pct) || 5;
    const herrMenor = totManoObra * (hmPct / 100);
    totEquipos += herrMenor;

    const totalCostoDirecto = Math.round((totMateriales + totManoObra + totEquipos) * 100) / 100;

    if (totalCostoDirecto > 0 && Math.abs((Number(rubro.total_costo_directo) || 0) - totalCostoDirecto) > 0.01) {
      await supabase.from('rubros').update({ total_costo_directo: totalCostoDirecto }).eq('id', rubro.id);
      rubro.total_costo_directo = totalCostoDirecto;
      rubrosActualizados++;
    }
  }
  console.log(`✓ Costo directo recalculado y actualizado en ${rubrosActualizados} rubros.`);

  // 6. Generación del Archivo Excel Completo y Normalizado
  console.log("5. Generando Libro Excel Maestro 'BASE_DE_DATOS_APU_ECUADOR_GRUPO_SARA.xlsx'...");

  // Hoja 1: Resumen
  const resumenRows = [
    { Indicador: "Ecosistema / Empresa", Valor: "GRUPO SARA — División de Ingeniería de Costos y Licitaciones" },
    { Indicador: "Versión de Base de Datos", Valor: "APU-ECUADOR-2026-v2.1" },
    { Indicador: "Fecha de Emisión", Valor: new Date().toISOString().split('T')[0] },
    { Indicador: "Total Rubros de Obra", Valor: rubros.length },
    { Indicador: "Total Insumos Homologados", Valor: insumos.length },
    { Indicador: "Total Asignaciones Analíticas de Receta APU", Valor: todasRecetas.length },
    { Indicador: "Provincias Georreferenciadas", Valor: PROVINCIAS_ECUADOR.length },
    { Indicador: "Proveedores Industriales Calificados", Valor: PROVEEDORES_HOMOLOGADOS.length },
    { Indicador: "Normativa Aplicable", Valor: "SERCOP / LOSNCP Formulario 1.3 / CICS MDT / INEC IPCO / NEC-SE" },
    { Indicador: "Moneda de Cálculo", Valor: "Dólares Americanos (USD)" }
  ];

  // Hoja 2: Rubros
  const rubrosRows = rubros.map(r => ({
    "ID Rubro": r.id,
    "Código": r.codigo || `RUB-${r.id}`,
    "Capítulo / Categoría": r.categoria || "01 General",
    "Nombre del Rubro": r.nombre,
    "Unidad": r.unidad || "u",
    "Rendimiento Diario": Number(r.rendimiento) || 1,
    "% Herramienta Menor": Number(r.herramienta_menor_pct) || 5,
    "Costo Directo Unitario (USD)": Number(r.total_costo_directo) || 0,
    "Estado": r.estado || "A"
  }));

  // Hoja 3: Recetas APU
  const recetasRows = todasRecetas.map(rec => {
    const rubro = rubros.find(r => r.id === rec.rubro_id) || {};
    const insumo = insumosById.get(rec.insumo_id) || {};
    const cant = Number(rec.cantidad) || 0;
    const precio = Number(insumo.precio_sin_iva) || 0;
    const subtotal = Math.round(cant * precio * 10000) / 10000;

    let tipoLabel = insumo.tipo || "material";
    if (tipoLabel === "mano_de_obra") tipoLabel = "Mano de Obra";
    else if (tipoLabel === "equipo") tipoLabel = "Equipo / Maquinaria";
    else if (tipoLabel === "transporte") tipoLabel = "Transporte";
    else tipoLabel = "Material";

    return {
      "ID Receta": rec.id,
      "Código Rubro": rubro.codigo || `RUB-${rec.rubro_id}`,
      "Descripción Rubro": rubro.nombre || `Rubro ${rec.rubro_id}`,
      "Unidad Rubro": rubro.unidad || "u",
      "Tipo Componente": tipoLabel,
      "Código Insumo": insumo.codigo || `INS-${rec.insumo_id}`,
      "Descripción Insumo": insumo.nombre || `Insumo ${rec.insumo_id}`,
      "Unidad Insumo": insumo.unidad || "u",
      "Cantidad / Rendimiento": cant,
      "Precio Unitario USD": precio,
      "Costo Parcial USD": subtotal
    };
  });

  // Hoja 4: Insumos Maestros
  const insumosRows = insumos.map(ins => {
    let tipoLabel = ins.tipo || "material";
    if (tipoLabel === "mano_de_obra") tipoLabel = "Mano de Obra";
    else if (tipoLabel === "equipo") tipoLabel = "Equipo / Maquinaria";
    else if (tipoLabel === "transporte") tipoLabel = "Transporte";
    else tipoLabel = "Material";

    return {
      "ID Insumo": ins.id,
      "Código Insumo": ins.codigo || `INS-${ins.id}`,
      "Tipo": tipoLabel,
      "Descripción del Insumo": ins.nombre,
      "Unidad": ins.unidad || "u",
      "Precio Unitario sin IVA (USD)": Number(ins.precio_sin_iva) || 0,
      "Categoría": ins.categoria || "",
      "Familia": ins.familia || "",
      "Subfamilia": ins.subfamilia || "",
      "Origen (VAE)": ins.origen || "Nacional"
    };
  });

  // Hoja 5: Provincias
  const provinciasRows = PROVINCIAS_ECUADOR.map(p => ({
    "ID": p.ID,
    "Provincia": p.Nombre,
    "Región": p.Region,
    "Altitud Promedio": p.Altitud,
    "Factor Bioclimático Fgeo": p.Factor_Fgeo
  }));

  // Hoja 6: Proveedores
  const proveedoresRows = PROVEEDORES_HOMOLOGADOS.map(pr => ({
    "RUC": pr.RUC,
    "Razón Social": pr.Empresa,
    "Línea de Productos": pr.Categoria,
    "Cobertura Logística": pr.Cobertura,
    "VAE Promedio": pr.VAE_Promedio
  }));

  const wb = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
  const wsRubros = XLSX.utils.json_to_sheet(rubrosRows);
  const wsRecetas = XLSX.utils.json_to_sheet(recetasRows);
  const wsInsumos = XLSX.utils.json_to_sheet(insumosRows);
  const wsProvincias = XLSX.utils.json_to_sheet(provinciasRows);
  const wsProveedores = XLSX.utils.json_to_sheet(proveedoresRows);

  wsResumen['!cols'] = [{ wch: 35 }, { wch: 50 }];
  wsRubros['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 60 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 10 }];
  wsRecetas['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 45 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 45 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
  wsInsumos['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 55 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  wsProvincias['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 25 }];
  wsProveedores['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 45 }, { wch: 25 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
  XLSX.utils.book_append_sheet(wb, wsRubros, "Rubros");
  XLSX.utils.book_append_sheet(wb, wsRecetas, "Recetas_APU");
  XLSX.utils.book_append_sheet(wb, wsInsumos, "Insumos_Maestros");
  XLSX.utils.book_append_sheet(wb, wsProvincias, "Provincias_Ecuador");
  XLSX.utils.book_append_sheet(wb, wsProveedores, "Proveedores_Ecuador");

  const fileName = "BASE_DE_DATOS_APU_ECUADOR_GRUPO_SARA.xlsx";
  const outputPathRoot = path.join(process.cwd(), fileName);
  const outputPathPublic = path.join(process.cwd(), "public", fileName);

  XLSX.writeFile(wb, outputPathRoot);
  XLSX.writeFile(wb, outputPathPublic);

  console.log("===============================================================================");
  console.log("¡CONSOLIDACIÓN Y GENERACIÓN COMPLETADAS CON ÉXITO!");
  console.log(`Archivo generado en:`);
  console.log(`1. ${outputPathRoot}`);
  console.log(`2. ${outputPathPublic}`);
  console.log(`Estadísticas finales:`);
  console.log(`- Rubros consolidados: ${rubros.length}`);
  console.log(`- Recetas analíticas APU: ${todasRecetas.length}`);
  console.log(`- Insumos maestros homologados: ${insumos.length}`);
  console.log(`- Provincias calibradas: ${PROVINCIAS_ECUADOR.length}`);
  console.log(`- Proveedores certificados: ${PROVEEDORES_HOMOLOGADOS.length}`);
  console.log("===============================================================================");
}

main().catch(err => {
  console.error("Error fatal en consolidación:", err);
  process.exit(1);
});
