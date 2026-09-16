require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedApus() {
  console.log("Iniciando carga de Plantillas Maestras de APU...");

  // 1. INSUMOS (Materiales, Mano de Obra, Equipos)
  const insumos = [
    { codigo: 'MAT-001', nombre: 'Cemento Portland Tipo I', unidad: 'kg', tipo: 'material', precio_sin_iva: 0.17 },
    { codigo: 'MAT-002', nombre: 'Arena gruesa', unidad: 'm3', tipo: 'material', precio_sin_iva: 15.00 },
    { codigo: 'MAT-003', nombre: 'Ripio triturado', unidad: 'm3', tipo: 'material', precio_sin_iva: 18.00 },
    { codigo: 'MAT-004', nombre: 'Agua', unidad: 'lt', tipo: 'material', precio_sin_iva: 0.002 },
    { codigo: 'MAT-005', nombre: 'Madera de encofrado', unidad: 'u', tipo: 'material', precio_sin_iva: 3.50 },
    { codigo: 'MAT-006', nombre: 'Clavos', unidad: 'kg', tipo: 'material', precio_sin_iva: 1.50 },
    { codigo: 'MO-001', nombre: 'Peón / Ayudante (E2)', unidad: 'h', tipo: 'mano_de_obra', precio_sin_iva: 3.50 },
    { codigo: 'MO-002', nombre: 'Albañil (D2)', unidad: 'h', tipo: 'mano_de_obra', precio_sin_iva: 3.80 },
    { codigo: 'MO-003', nombre: 'Maestro Mayor (C1)', unidad: 'h', tipo: 'mano_de_obra', precio_sin_iva: 4.20 },
    { codigo: 'EQ-001', nombre: 'Hormigonera 1 saco', unidad: 'h', tipo: 'equipo', precio_sin_iva: 3.50 },
    { codigo: 'EQ-002', nombre: 'Vibrador de hormigón', unidad: 'h', tipo: 'equipo', precio_sin_iva: 2.50 }
  ];

  console.log("Insertando Insumos...");
  const insumosMap = {};
  for (const ins of insumos) {
    const { data, error } = await supabase.from('insumos').upsert([ins], { onConflict: 'codigo' }).select().single();
    if (error) console.error("Error insertando insumo:", ins.codigo, error.message);
    else insumosMap[ins.codigo] = data.id;
  }

  // 2. RUBROS
  const rubros = [
    {
      codigo: 'RUB-001',
      nombre: 'Hormigón simple f\'c=210 kg/cm2',
      categoria: 'ESTRUCTURAS',
      unidad: 'm3',
      herramienta_menor_pct: 5.0
    },
    {
      codigo: 'RUB-002',
      nombre: 'Enlucido vertical paleteado fino',
      categoria: 'MAMPOSTERIA',
      unidad: 'm2',
      herramienta_menor_pct: 5.0
    },
    {
      codigo: 'RUB-003',
      nombre: 'Excavación manual de zanjas',
      categoria: 'PRELIMINARES',
      unidad: 'm3',
      herramienta_menor_pct: 5.0
    }
  ];

  console.log("Insertando Rubros...");
  const rubrosMap = {};
  for (const rub of rubros) {
    const { data, error } = await supabase.from('rubros').upsert([rub], { onConflict: 'codigo' }).select().single();
    if (error) console.error("Error insertando rubro:", rub.codigo, error.message);
    else rubrosMap[rub.codigo] = data.id;
  }

  // 3. RECETAS (Rubro_Insumos)
  const recetas = [
    // Receta: Hormigón 210
    { rubro_codigo: 'RUB-001', insumo_codigo: 'MAT-001', cantidad: 350.0 }, // 350kg cemento
    { rubro_codigo: 'RUB-001', insumo_codigo: 'MAT-002', cantidad: 0.45 },  // arena
    { rubro_codigo: 'RUB-001', insumo_codigo: 'MAT-003', cantidad: 0.85 },  // ripio
    { rubro_codigo: 'RUB-001', insumo_codigo: 'MAT-004', cantidad: 180.0 }, // agua
    { rubro_codigo: 'RUB-001', insumo_codigo: 'MO-001', cantidad: 6.0 },    // peón (rendimiento 6h / m3)
    { rubro_codigo: 'RUB-001', insumo_codigo: 'MO-002', cantidad: 1.5 },    // albañil
    { rubro_codigo: 'RUB-001', insumo_codigo: 'EQ-001', cantidad: 1.0 },    // hormigonera
    { rubro_codigo: 'RUB-001', insumo_codigo: 'EQ-002', cantidad: 1.0 },    // vibrador

    // Receta: Enlucido
    { rubro_codigo: 'RUB-002', insumo_codigo: 'MAT-001', cantidad: 6.5 },   // cemento
    { rubro_codigo: 'RUB-002', insumo_codigo: 'MAT-002', cantidad: 0.025 }, // arena fina
    { rubro_codigo: 'RUB-002', insumo_codigo: 'MAT-004', cantidad: 4.0 },   // agua
    { rubro_codigo: 'RUB-002', insumo_codigo: 'MO-001', cantidad: 0.5 },    // peón
    { rubro_codigo: 'RUB-002', insumo_codigo: 'MO-002', cantidad: 0.6 },    // albañil

    // Receta: Excavación manual
    { rubro_codigo: 'RUB-003', insumo_codigo: 'MO-001', cantidad: 3.5 },    // peón
  ];

  console.log("Insertando Recetas...");
  for (const rec of recetas) {
    const rubro_id = rubrosMap[rec.rubro_codigo];
    const insumo_id = insumosMap[rec.insumo_codigo];
    
    if (rubro_id && insumo_id) {
      // Check if exists
      const { data: exist } = await supabase.from('rubro_insumos').select('id').eq('rubro_id', rubro_id).eq('insumo_id', insumo_id).single();
      
      if (!exist) {
        await supabase.from('rubro_insumos').insert([{
          rubro_id,
          insumo_id,
          cantidad: rec.cantidad
        }]);
      }
    }
  }

  // 4. Recalcular los costos directos de cada rubro
  console.log("Actualizando costos directos de Rubros...");
  for (const rubro_id of Object.values(rubrosMap)) {
    const { data: insumos } = await supabase.from('rubro_insumos').select('cantidad, insumos(tipo, precio_sin_iva)').eq('rubro_id', rubro_id);
    
    let mo = 0, mat = 0, eq = 0;
    for (const item of insumos) {
      const costo = item.cantidad * item.insumos.precio_sin_iva;
      if (item.insumos.tipo === 'mano_de_obra') mo += costo;
      else if (item.insumos.tipo === 'material') mat += costo;
      else if (item.insumos.tipo === 'equipo') eq += costo;
    }
    
    const hm = mo * 0.05; // 5% de herramienta menor
    const total = mat + mo + eq + hm;
    
    await supabase.from('rubros').update({ total_costo_directo: total }).eq('id', rubro_id);
  }

  console.log("¡Carga de Plantillas Finalizada con Éxito!");
}

seedApus().catch(console.error);
