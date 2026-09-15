const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { error } = await supabase.from('historial_cotizaciones').insert({
    cliente_id: '00000000-0000-0000-0000-000000000000',
    total_obra: 0
  });
  console.log(error);
}
check();
