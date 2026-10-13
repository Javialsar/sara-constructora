const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const content = fs.readFileSync('data.json', 'utf16le');
const regex = /"razon_social":\s*"([^"]+)",[\s\S]*?"logo_url":\s*"([^"]+)"/g;

const logoMap = {};
let match;
while ((match = regex.exec(content)) !== null) {
  const name = match[1].trim().toLowerCase();
  const url = match[2].trim();
  if (url && url !== 'null') {
    logoMap[name] = url;
  }
}

console.log(`Recovered ${Object.keys(logoMap).length} logos from backup.`);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function restore() {
  const { data } = await supabase.from('proveedores').select('id, razon_social').is('user_id', null);
  let count = 0;
  for (const row of data) {
    const name = row.razon_social.trim().toLowerCase();
    if (logoMap[name]) {
      console.log(`Restoring logo for ${name}`);
      await supabase.from('proveedores').update({ logo_url: logoMap[name] }).eq('id', row.id);
      count++;
    }
  }
  console.log(`Successfully restored ${count} logos to the database.`);
}

restore().catch(console.error);
