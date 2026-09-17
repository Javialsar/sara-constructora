require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Fetching all rubros...");
    const { data: rubros, error: errR } = await supabase.from('rubros').select('*');
    if (errR) { console.error(errR); return; }
    
    console.log(`Found ${rubros.length} rubros. Recalculating totals...`);
    
    // Fetch all rubro_insumos with joined insumos
    const { data: rubroInsumos } = await supabase.from('rubro_insumos').select('*, insumos(precio_sin_iva, tipo)');
    
    // Group by rubro_id
    const riByRubro = {};
    for (const ri of rubroInsumos) {
        if (!riByRubro[ri.rubro_id]) riByRubro[ri.rubro_id] = [];
        riByRubro[ri.rubro_id].push(ri);
    }
    
    let updated = 0;
    
    // Recalculate
    for (const rubro of rubros) {
        let totMateriales = 0;
        let totManoObra = 0;
        let totEquipos = 0;
        
        const items = riByRubro[rubro.id] || [];
        for (const item of items) {
            const ins = item.insumos;
            if (ins) {
                const costoItem = (item.cantidad || 0) * (ins.precio_sin_iva || 0);
                if (ins.tipo === 'material') totMateriales += costoItem;
                if (ins.tipo === 'mano_de_obra') totManoObra += costoItem;
                if (ins.tipo === 'equipo') totEquipos += costoItem;
            }
        }
        
        const hmPct = rubro.herramienta_menor_pct || 0;
        const herramientaMenor = totManoObra * (hmPct / 100);
        totEquipos += herramientaMenor;
        
        const totalCostoDirecto = totMateriales + totManoObra + totEquipos;
        
        // Update if it's different or 0
        if (Math.abs((rubro.total_costo_directo || 0) - totalCostoDirecto) > 0.001) {
            await supabase.from('rubros')
                .update({ total_costo_directo: totalCostoDirecto })
                .eq('id', rubro.id);
            updated++;
            
            // Log a few
            if (updated <= 5) {
                console.log(`Updated ${rubro.codigo} from ${rubro.total_costo_directo} to ${totalCostoDirecto}`);
            }
        }
    }
    
    console.log(`Done! Updated ${updated} rubros out of ${rubros.length}.`);
}

run().catch(console.error);
