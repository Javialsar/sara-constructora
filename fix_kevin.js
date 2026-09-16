const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://llnagvtqkljattjbjduu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmFndnRxa2xqYXR0amJqZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyMzM5MSwiZXhwIjoyMTA0NDk5MzkxfQ.Hgt5KeEVnSimdgFj0PWrw48tG6OiouYtTtLgBrpQ1k4'
);

async function fixKevin() {
    console.log("Searching for Kevin in smaller chunks...");
    let page = 1;
    let kevinId = null;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 20 });
        if (error) {
            console.error("Error fetching page", page, error);
            break;
        }
        if (!data.users || data.users.length === 0) break;

        const kevin = data.users.find(u => u.email === 'kevinjsarangom@gmail.com');
        if (kevin) {
            kevinId = kevin.id;
            break;
        }
        page++;
    }

    if (kevinId) {
        console.log("Found Kevin! ID:", kevinId);
        const { error: updErr } = await supabase.auth.admin.updateUserById(kevinId, {
            password: 'Sara.Kevin2026!',
            user_metadata: {
                full_name: 'Kevin Sarango Malacatus',
                phone: '+593 99 186 7021',
                role: 'admin',
                profession: 'Ingeniero Civil'
            }
        });
        if (updErr) console.log('Error updating:', updErr.message);
        else console.log('Success! Kevin updated to Sara.Kevin2026!');
    } else {
        console.log("Kevin not found in the list.");
    }
}

fixKevin();
