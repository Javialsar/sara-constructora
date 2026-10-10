const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('fletes_conductores').select('*').limit(1);
  if (error) {
    console.error('Error fetching:', error.message);
  } else {
    console.log('Success, data:', data);
  }
}
test();
