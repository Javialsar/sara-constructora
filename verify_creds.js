require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Verificando credenciales...");
  const email = 'javier.sarango.gaona@gmail.com'; // con N
  const password = 'Elkin-1971';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Resultado: ERROR -", error.message);
  } else {
    console.log("Resultado: EXITO - El login funciona correctamente.");
    console.log("Rol del usuario en metadata:", data.user?.user_metadata?.role);
    
    // Check if the user is an admin in the clientes table
    const { data: cliente, error: dbError } = await supabase
      .from('clientes')
      .select('es_admin')
      .eq('email', email)
      .single();
      
    if (dbError) {
       console.log("Error consultando tabla clientes:", dbError.message);
    } else {
       console.log("Es admin en la tabla clientes?", cliente?.es_admin);
    }
  }
}

checkCredentials();
