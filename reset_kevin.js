const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://llnagvtqkljattjbjduu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmFndnRxa2xqYXR0amJqZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyMzM5MSwiZXhwIjoyMTA0NDk5MzkxfQ.Hgt5KeEVnSimdgFj0PWrw48tG6OiouYtTtLgBrpQ1k4'
);

async function resetKevin() {
    const { data, error } = await supabase.auth.resetPasswordForEmail('kevinjsarangom@gmail.com');
    if (error) console.log('Error:', error.message);
    else console.log('Reset email sent successfully!');
}

resetKevin();
