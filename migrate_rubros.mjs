import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateRubroCategorias() {
  console.log("Iniciando migracion de categorias de rubros a familias/subfamilias...");

  // 1. Obtener todos los rubros
  let allRubros = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data } = await supabase.from('rubros').select('id, categoria, subfamilia_id').range(from, from + step - 1);
    if (data && data.length > 0) {
      allRubros = allRubros.concat(data);
      if (data.length < step) break;
      from += step;
    } else break;
  }
  
  console.log(`Se encontraron ${allRubros.length} rubros.`);

  // 2. Extraer categorias unicas que no esten vacias
  const categorias = Array.from(new Set(allRubros.map(r => r.categoria).filter(Boolean)));
  console.log(`Se encontraron ${categorias.length} categorias unicas.`);

  // 3. Crear familias y subfamilias
  const catMap = {}; // categoria -> subfamilia_id

  for (const cat of categorias) {
    // Check if familia exists
    const { data: existingFam } = await supabase.from('familias')
      .select('id')
      .eq('nombre', cat)
      .eq('grupo_sugerido', 'rubro')
      .single();

    let famId;
    if (existingFam) {
      famId = existingFam.id;
    } else {
      famId = 'FAM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await supabase.from('familias').insert([{ id: famId, nombre: cat, grupo_sugerido: 'rubro' }]);
    }

    // Check if subfamilia "General" exists for this fam
    const { data: existingSub } = await supabase.from('subfamilias')
      .select('id')
      .eq('familia_id', famId)
      .eq('nombre', 'General')
      .single();

    let subId;
    if (existingSub) {
      subId = existingSub.id;
    } else {
      subId = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await supabase.from('subfamilias').insert([{ id: subId, nombre: 'General', familia_id: famId }]);
    }

    catMap[cat] = subId;
  }

  // 4. Actualizar rubros
  let updatedCount = 0;
  for (const rubro of allRubros) {
    if (rubro.categoria && !rubro.subfamilia_id) {
      const targetSubId = catMap[rubro.categoria];
      if (targetSubId) {
        await supabase.from('rubros').update({ subfamilia_id: targetSubId }).eq('id', rubro.id);
        updatedCount++;
      }
    }
  }

  console.log(`Migracion completada. Rubros actualizados: ${updatedCount}`);
}

migrateRubroCategorias().catch(console.error);
