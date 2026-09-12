require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Probando crear un usuario de prueba para ver si el trigger de la BD funciona...");
  const { data, error } = await supabase.auth.signUp({
    email: 'prueba.admin@gmail.com',
    password: 'Password123!',
    options: {
      data: {
        nombre: 'Prueba',
        apellido: 'Admin',
        telefono: '0999999999', // para evitar el NOT NULL error
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error("Error al registrar:", error.message);
  } else {
    console.log("Usuario de prueba registrado exitosamente. Ahora vamos a intentar hacer login con ese mismo usuario...");
    const loginRes = await supabase.auth.signInWithPassword({
      email: 'prueba.admin@gmail.com',
      password: 'Password123!'
    });
    
    if (loginRes.error) {
        console.error("Error al hacer login:", loginRes.error.message);
    } else {
        console.log("Login de prueba exitoso!");
    }
  }
}

fixUser();
