require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data: ins1 } = await s.from('insumos').select('codigo, nombre').eq('codigo', '101');
    const { data: ins2 } = await s.from('insumos').select('codigo, nombre').eq('codigo', '35');
    console.log("101:", ins1);
    console.log("35:", ins2);
}
run();
