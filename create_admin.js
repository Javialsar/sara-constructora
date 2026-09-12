require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Registrando usuario...");
  const { data, error } = await supabase.auth.signUp({
    email: 'javier.sarango.gaona@gmail.com',
    password: 'Elkin-1971',
    options: {
      data: {
        nombre: 'Javier',
        apellido: 'Sarango',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error("Error al registrar:", error.message);
  } else {
    console.log("Usuario registrado exitosamente:", data.user?.email);
    console.log("NOTA: Como no tenemos el SERVICE_ROLE_KEY, el usuario se ha creado pero es posible que el trigger 'on_auth_user_created' le haya asignado es_admin=false en la tabla clientes. El rol en auth sí quedó como admin.");
  }
}

main();
