const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://llnagvtqkljattjbjduu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmFndnRxa2xqYXR0amJqZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyMzM5MSwiZXhwIjoyMTA0NDk5MzkxfQ.Hgt5KeEVnSimdgFj0PWrw48tG6OiouYtTtLgBrpQ1k4'
);

async function updateKevin() {
    // Buscar id de Kevin
    const { data: users, error: sErr } = await supabase.auth.admin.listUsers();
    if(sErr) { console.log(sErr); return; }
    
    const kevin = users.users.find(u => u.email === 'kevinjsarangom@gmail.com');
    if(!kevin) { console.log('Not found'); return; }

    const { error: updErr } = await supabase.auth.admin.updateUserById(kevin.id, {
        password: 'Sara.Kevin2026!',
        user_metadata: {
            full_name: 'Kevin Sarango Malacatus',
            phone: '+593 99 186 7021',
            role: 'admin',
            profession: 'Ingeniero Civil'
        }
    });
    if (updErr) console.log('Update Error:', updErr.message);
    else console.log('Kevin updated properly!');
}

updateKevin();
