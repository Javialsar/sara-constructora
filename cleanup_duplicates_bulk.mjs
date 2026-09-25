import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAll(table) {
  let allData = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data } = await supabase.from(table).select('*').range(from, from + step - 1);
    if (data && data.length > 0) {
      allData = allData.concat(data);
      if (data.length < step) break;
      from += step;
    } else {
      break;
    }
  }
  return allData;
}

async function deduplicateBulk() {
  console.log("Iniciando escaneo de duplicados en subfamilias (BULK OPTIMIZED)...");

  const subfamilias = await fetchAll('subfamilias');
  console.log(`Se encontraron ${subfamilias.length} subgrupos en total.`);

  const groups = {};
  for (const sf of subfamilias) {
    let normalName = sf.nombre.trim().toUpperCase();
    if (['LIVIANITOS', 'LIVIANITPS', 'LIVIANO', 'LIVIANOS', 'LIVIANOS-1'].includes(normalName)) {
      normalName = 'LIVIANOS';
    }
    const key = `${sf.familia_id}_${normalName}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(sf);
  }

  let totalDeleted = 0;
  let totalReassigned = 0;

  for (const key in groups) {
    const items = groups[key];
    if (items.length > 1) {
      items.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

      const primary = items[0];
      const duplicates = items.slice(1);
      const duplicateIds = duplicates.map(d => d.id);

      console.log(`\n-- Grupo: ${primary.nombre} (${duplicates.length} duplicados) --`);

      // Bulk update insumos
      // Supabase in() allows up to a certain amount, we chunk by 1000
      for (let i = 0; i < duplicateIds.length; i += 1000) {
        const chunk = duplicateIds.slice(i, i + 1000);
        
        // Update insumos
        const { data: ins, error: e1 } = await supabase.from('insumos')
          .update({ subfamilia_id: primary.id })
          .in('subfamilia_id', chunk)
          .select('id');
        if (e1) console.error("Error insumos:", e1);
        if (ins) totalReassigned += ins.length;

        // Update rubros
        const { error: e2 } = await supabase.from('rubros')
          .update({ subfamilia_id: primary.id })
          .in('subfamilia_id', chunk);
        if (e2) console.error("Error rubros:", e2);

        // Delete duplicates
        const { data: del, error: e3 } = await supabase.from('subfamilias')
          .delete()
          .in('id', chunk)
          .select('id');
        if (e3) console.error("Error eliminando:", e3);
        if (del) totalDeleted += del.length;
      }

      if (primary.nombre !== 'LIVIANOS' && ['LIVIANITOS', 'LIVIANITPS', 'LIVIANO', 'LIVIANOS', 'LIVIANOS-1'].includes(primary.nombre.toUpperCase())) {
         await supabase.from('subfamilias').update({ nombre: 'LIVIANOS' }).eq('id', primary.id);
      }
    }
  }

  console.log(`\n=== LIMPIEZA FINALIZADA ===`);
  console.log(`Subgrupos eliminados: ${totalDeleted}`);
  console.log(`Insumos reasignados: ${totalReassigned}`);
}

deduplicateBulk().catch(console.error);
