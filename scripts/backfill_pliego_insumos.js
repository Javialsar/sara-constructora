const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const PLIEGO_APU_RECETAS = {
  "54111.00.1": [
    { nombre: "Estación Total / Nivel de precisión láser", tipo: "equipo", unidad: "hora", cantidad: 0.05, precio_unitario: 3.50 },
    { nombre: "Topógrafo especialista calificado", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.05, precio_unitario: 5.60 },
    { nombre: "Peón cadenero de topografía", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.10, precio_unitario: 3.80 },
    { nombre: "Estacas de madera de monte 2x2\"", tipo: "material", unidad: "u", cantidad: 0.20, precio_unitario: 0.60 },
    { nombre: "Clavos con cabeza para madera 2\"", tipo: "material", unidad: "kg", cantidad: 0.03, precio_unitario: 2.10 },
    { nombre: "Pintura esmalte para estacas y marcas", tipo: "material", unidad: "gal", cantidad: 0.01, precio_unitario: 22.00 }
  ],
  "54210.02.1": [
    { nombre: "Herramienta menor (picos, palas, barretas)", tipo: "equipo", unidad: "hora", cantidad: 0.50, precio_unitario: 1.20 },
    { nombre: "Peón excavador de obra civil", tipo: "mano_de_obra", unidad: "hora", cantidad: 3.20, precio_unitario: 3.80 },
    { nombre: "Albañil de control de niveles", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.50, precio_unitario: 4.30 },
    { nombre: "Madera para entibado puntual y tablas", tipo: "material", unidad: "u", cantidad: 0.25, precio_unitario: 3.50 }
  ],
  "54220.01.3": [
    { nombre: "Hormigonera de 1 saco (Trompo) a gasolina", tipo: "equipo", unidad: "hora", cantidad: 1.80, precio_unitario: 4.50 },
    { nombre: "Vibrador de inmersión para hormigón 4HP", tipo: "equipo", unidad: "hora", cantidad: 1.50, precio_unitario: 3.80 },
    { nombre: "Maestro mayor de obra civil", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.50, precio_unitario: 5.60 },
    { nombre: "Albañil calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 3.50, precio_unitario: 4.30 },
    { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 6.00, precio_unitario: 3.80 },
    { nombre: "Cemento Portland Tipo IP (Saco 50kg)", tipo: "material", unidad: "saco", cantidad: 8.00, precio_unitario: 8.45 },
    { nombre: "Arena gruesa de río lavada", tipo: "material", unidad: "m3", cantidad: 0.52, precio_unitario: 18.50 },
    { nombre: "Ripio triturado 3/4\"", tipo: "material", unidad: "m3", cantidad: 0.82, precio_unitario: 22.00 },
    { nombre: "Aditivo plastificante para hormigón", tipo: "material", unidad: "kg", cantidad: 1.20, precio_unitario: 3.80 },
    { nombre: "Agua limpia de obra", tipo: "material", unidad: "m3", cantidad: 0.20, precio_unitario: 2.20 }
  ],
  "54290.00.4": [
    { nombre: "Cizalla mecánica y dobladora de varilla", tipo: "equipo", unidad: "hora", cantidad: 0.03, precio_unitario: 1.80 },
    { nombre: "Fierrero calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.05, precio_unitario: 4.40 },
    { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.05, precio_unitario: 3.80 },
    { nombre: "Varilla de acero corrugado fy=4200 kg/cm2", tipo: "material", unidad: "kg", cantidad: 1.05, precio_unitario: 1.25 },
    { nombre: "Alambre galvanizado/recocido de amarre #18", tipo: "material", unidad: "kg", cantidad: 0.035, precio_unitario: 2.10 },
    { nombre: "Separadores plásticos de recubrimiento (pollitas)", tipo: "material", unidad: "u", cantidad: 2.00, precio_unitario: 0.15 }
  ],
  "54310.03.2": [
    { nombre: "Andamio tubular metálico (cuerpo)", tipo: "equipo", unidad: "dia", cantidad: 0.15, precio_unitario: 2.00 },
    { nombre: "Albañil oficial MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.20, precio_unitario: 4.30 },
    { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.20, precio_unitario: 3.80 },
    { nombre: "Ladrillo panelón prensado 15x20x40", tipo: "material", unidad: "u", cantidad: 28.00, precio_unitario: 0.38 },
    { nombre: "Cemento Portland Tipo IP (Saco 50kg)", tipo: "material", unidad: "saco", cantidad: 0.40, precio_unitario: 8.45 },
    { nombre: "Arena fina cernida de mina", tipo: "material", unidad: "m3", cantidad: 0.045, precio_unitario: 19.00 },
    { nombre: "Chicotes de alambre galvanizado #14", tipo: "material", unidad: "kg", cantidad: 0.08, precio_unitario: 2.30 }
  ]
};

async function backfill() {
  console.log("Iniciando backfill para presupuesto 8a54a3ea-e5d8-4b86-be5a-d1cc43a97540...");
  const presId = '8a54a3ea-e5d8-4b86-be5a-d1cc43a97540';
  const { data: rubros } = await supabase.from('presupuesto_rubros').select('*').eq('presupuesto_id', presId);

  if (!rubros || rubros.length === 0) {
    console.log("No se encontraron rubros.");
    return;
  }

  // Mapa de insumos existentes
  const { data: insumosDb } = await supabase.from('insumos').select('id, nombre');
  const insumoMap = new Map();
  insumosDb?.forEach(i => insumoMap.set(i.nombre.trim().toLowerCase(), i.id));

  const subfamMap = {
    equipo: 'SF157',
    mano_de_obra: 'SF429',
    material: 'SF13656'
  };

  for (const rubro of rubros) {
    const receta = PLIEGO_APU_RECETAS[rubro.codigo_rubro];
    if (!receta) {
      console.log(`No hay receta para código ${rubro.codigo_rubro}`);
      continue;
    }

    console.log(`Poblando insumos para rubro ${rubro.codigo_rubro} - ${rubro.nombre_rubro}...`);

    for (const item of receta) {
      const key = item.nombre.trim().toLowerCase();
      let insumoId = insumoMap.get(key);

      if (!insumoId) {
        const codigoIns = `${item.tipo.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: newIns } = await supabase.from('insumos').insert([{
          codigo: codigoIns,
          nombre: item.nombre,
          tipo: item.tipo,
          unidad: item.unidad,
          precio_sin_iva: item.precio_unitario,
          subfamilia_id: subfamMap[item.tipo] || 'SF13656',
          is_global: true,
          es_maestro: true,
          user_id: null
        }]).select().single();

        if (newIns) {
          insumoId = newIns.id;
          insumoMap.set(key, insumoId);
        }
      }

      if (insumoId) {
        await supabase.from('presupuesto_rubro_insumos').insert([{
          presupuesto_rubro_id: rubro.id,
          insumo_id: insumoId,
          cantidad: item.cantidad,
          precio_sin_iva_snapshot: item.precio_unitario
        }]);
      }
    }
  }

  console.log("¡Backfill completado exitosamente!");
}

backfill();
