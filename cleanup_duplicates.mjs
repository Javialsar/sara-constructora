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

async function deduplicate() {
  console.log("Iniciando escaneo de duplicados en subfamilias...");

  // 1. Obtener todos los subgrupos
  const { data: subfamilias, error: sfError } = await supabase.from('subfamilias').select('*');
  if (sfError) {
    console.error("Error obteniendo subfamilias:", sfError);
    return;
  }

  console.log(`Se encontraron ${subfamilias.length} subgrupos en total.`);

  // 2. Agrupar por familia_id y nombre normalizado
  const groups = {};
  for (const sf of subfamilias) {
    // Normalizar: quitar espacios extra y poner en mayúsculas
    let normalName = sf.nombre.trim().toUpperCase();
    
    // CASO ESPECIAL DE LIMPIEZA MANUAL (los typos creados en los intentos de Transporte)
    if (['LIVIANITOS', 'LIVIANITPS', 'LIVIANO', 'LIVIANOS', 'LIVIANOS-1'].includes(normalName)) {
      normalName = 'LIVIANOS'; // Agrupar todos bajo "LIVIANOS"
    }

    const key = `${sf.familia_id}_${normalName}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(sf);
  }

  let totalDeleted = 0;
  let totalReassigned = 0;

  // 3. Procesar grupos con más de 1 elemento (duplicados)
  for (const key in groups) {
    const items = groups[key];
    if (items.length > 1) {
      // Ordenar por created_at ascendente (quedarnos con el más antiguo, que será el principal)
      // Si no tienen created_at, por ID.
      items.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

      const primary = items[0];
      const duplicates = items.slice(1);

      console.log(`\n-- Grupo detectado: ${primary.nombre} (ID Principal: ${primary.id}) --`);
      console.log(`Duplicados a eliminar: ${duplicates.length}`);

      for (const dup of duplicates) {
        console.log(`   Procesando duplicado: ${dup.nombre} (${dup.id})`);

        // A. Actualizar insumos y rubros que apunten a este duplicado
        const { data: ins, error: e1 } = await supabase.from('insumos')
          .update({ subfamilia_id: primary.id })
          .eq('subfamilia_id', dup.id)
          .select();
        
        if (e1) console.error("   Error actualizando insumos:", e1);
        else if (ins && ins.length > 0) {
          console.log(`   -> Se reasignaron ${ins.length} insumos al principal.`);
          totalReassigned += ins.length;
        }

        const { data: rubros, error: e2 } = await supabase.from('rubros')
          .update({ subfamilia_id: primary.id })
          .eq('subfamilia_id', dup.id)
          .select();
        
        if (e2) console.error("   Error actualizando rubros:", e2);

        // B. Eliminar el subgrupo duplicado
        const { error: e3 } = await supabase.from('subfamilias')
          .delete()
          .eq('id', dup.id);
        
        if (e3) {
          console.error("   Error eliminando subgrupo duplicado:", e3);
        } else {
          console.log(`   -> Subgrupo duplicado eliminado.`);
          totalDeleted++;
        }
      }

      // Si el nombre principal era diferente (por el caso especial LIVIANOS), actualizarlo para que quede limpio
      if (primary.nombre !== 'LIVIANOS' && ['LIVIANITOS', 'LIVIANITPS', 'LIVIANO', 'LIVIANOS', 'LIVIANOS-1'].includes(primary.nombre.toUpperCase())) {
         await supabase.from('subfamilias').update({ nombre: 'LIVIANOS' }).eq('id', primary.id);
         console.log(`   -> Nombre del subgrupo principal corregido a LIVIANOS.`);
      }
    }
  }

  console.log(`\n=== LIMPIEZA FINALIZADA ===`);
  console.log(`Subgrupos eliminados: ${totalDeleted}`);
  console.log(`Insumos reasignados: ${totalReassigned}`);
}

deduplicate().catch(console.error);
