const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: 'test_tech_999@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      nombre: 'Test Tech',
      role: 'tecnico'
    }
  });

  if (error) {
    console.log('ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
    await adminClient.auth.admin.deleteUser(data.user.id);
  }
}

test();
