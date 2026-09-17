require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { count: c1 } = await s.from('rubros').select('*', { count: 'exact', head: true });
    const { count: c2 } = await s.from('insumos').select('*', { count: 'exact', head: true });
    console.log('Rubros:', c1, 'Insumos:', c2);
}
run();
