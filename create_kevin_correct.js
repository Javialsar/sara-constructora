const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://llnagvtqkljattjbjduu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmFndnRxa2xqYXR0amJqZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyMzM5MSwiZXhwIjoyMTA0NDk5MzkxfQ.Hgt5KeEVnSimdgFj0PWrw48tG6OiouYtTtLgBrpQ1k4'
);

async function createKevin() {
    console.log('Creating Kevin with new email...');
    const { data: kevin, error: kError } = await supabase.auth.admin.createUser({
        email: 'kjsarango68@gmail.com',
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
    else console.log('Kevin created successfully with ID:', kevin.user.id);
}

createKevin();
