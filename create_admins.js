const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://llnagvtqkljattjbjduu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmFndnRxa2xqYXR0amJqZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyMzM5MSwiZXhwIjoyMTA0NDk5MzkxfQ.Hgt5KeEVnSimdgFj0PWrw48tG6OiouYtTtLgBrpQ1k4'
);

async function createAdmins() {
    console.log('Creating Kevin...');
    const { data: kevin, error: kError } = await supabase.auth.admin.createUser({
        email: 'kevinjsarangom@gmail.com',
        password: 'Sara.Kevin2026!',
        email_confirm: true,
        user_metadata: {
            full_name: 'Kevin Sarango Malacatus',
            phone: '+593 99 186 7021',
            role: 'admin',
            profession: 'Ingeniero Civil'
        }
    });
    if (kError) console.log('Kevin Error:', kError.message);
    else console.log('Kevin created!', kevin.user.id);

    console.log('Creating David...');
    const { data: david, error: dError } = await supabase.auth.admin.createUser({
        email: 'dasarango2707@gmail.com',
        password: 'Sara.David2026!',
        email_confirm: true,
        user_metadata: {
            full_name: 'David Sarango Malacatus',
            phone: '+593 96 290 5439',
            role: 'admin',
            profession: 'Arquitecto'
        }
    });
    if (dError) console.log('David Error:', dError.message);
    else console.log('David created!', david.user.id);
}

createAdmins();
