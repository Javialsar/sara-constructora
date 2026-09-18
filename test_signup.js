const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_tech_signup@example.com',
    password: 'password123',
    options: {
      data: {
        nombre: 'Test Tech',
        role: 'tecnico'
      }
    }
  });

  if (error) {
    console.log('ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

test();
