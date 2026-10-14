const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createAdminClient(supabaseUrl, serviceKey);

function createAdminClient(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function run() {
  console.log("Iniciando reparación de rubros e insumos maestros...");

  // 1. Asegurar is_global = true en todos los rubros donde es_maestro = true o user_id IS NULL
  const { data: rubrosUpdated, error: errRubros } = await supabase
    .from('rubros')
    .update({ is_global: true })
    .or('es_maestro.eq.true,user_id.is.null')
    .select('id, codigo, nombre, is_global');

  if (errRubros) {
    console.error("Error actualizando rubros:", errRubros);
  } else {
    console.log(`Rubros actualizados a is_global=true: ${rubrosUpdated?.length || 0}`);
  }

  // 2. Asegurar is_global = true en todos los insumos donde es_maestro = true o user_id IS NULL
  const { data: insumosUpdated, error: errInsumos } = await supabase
    .from('insumos')
    .update({ is_global: true })
    .or('es_maestro.eq.true,user_id.is.null')
    .select('id, codigo, nombre, is_global');

  if (errInsumos) {
    console.error("Error actualizando insumos:", errInsumos);
  } else {
    console.log(`Insumos actualizados a is_global=true: ${insumosUpdated?.length || 0}`);
  }

  // 3. Asignar subfamilia_id a los insumos que no tienen (según su tipo)
  // Equipos: SF157 (Maquinaria y Equipos)
  // Mano de Obra: SF429 (Mano de Obra)
  // Materiales: SF13656 (Sin categoría) o SF2849
  const { error: errEq } = await supabase
    .from('insumos')
    .update({ subfamilia_id: 'SF157' })
    .is('subfamilia_id', null)
    .eq('tipo', 'equipo');
  console.log("Equipos sin subfamilia actualizados:", errEq ? errEq.message : 'OK');

  const { error: errMo } = await supabase
    .from('insumos')
    .update({ subfamilia_id: 'SF429' })
    .is('subfamilia_id', null)
    .eq('tipo', 'mano_de_obra');
  console.log("Mano de obra sin subfamilia actualizados:", errMo ? errMo.message : 'OK');

  const { error: errMat } = await supabase
    .from('insumos')
    .update({ subfamilia_id: 'SF13656' })
    .is('subfamilia_id', null)
    .or('tipo.eq.material,tipo.is.null');
  console.log("Materiales sin subfamilia actualizados:", errMat ? errMat.message : 'OK');

  // 4. Verificar VIA-ADO-002-V25
  const { data: rubroTest } = await supabase
    .from('rubros')
    .select('id, codigo, nombre, is_global, total_costo_directo')
    .eq('codigo', 'VIA-ADO-002-V25')
    .single();

  console.log("Estado de VIA-ADO-002-V25:", rubroTest);

  if (rubroTest) {
    const { data: riTest } = await supabase
      .from('rubro_insumos')
      .select('id, cantidad, insumos(id, codigo, nombre, tipo, subfamilia_id, precio_sin_iva, is_global)')
      .eq('rubro_id', rubroTest.id);

    console.log("Recetas encontradas para VIA-ADO-002-V25:", riTest?.length);
    console.log("Detalle de receta:", JSON.stringify(riTest, null, 2));
  }
}

run();
