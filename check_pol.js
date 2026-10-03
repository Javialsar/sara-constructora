const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.rpc('exec_sql', {query: "select * from pg_policies where tablename = 'presupuestos_reales'"});
  if (error) {
    // If exec_sql doesn't exist, we can't easily query pg_policies via REST. We must use python + psycopg2 or something, but we don't have db string.
    console.log("No exec_sql RPC");
  }
}
main();
