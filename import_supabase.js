const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    'https://llnagvtqkljattjbjduu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmFndnRxa2xqYXR0amJqZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkyMzM5MSwiZXhwIjoyMTA0NDk5MzkxfQ.Hgt5KeEVnSimdgFj0PWrw48tG6OiouYtTtLgBrpQ1k4'
);

const data = JSON.parse(fs.readFileSync('insumos_import.json', 'utf8'));

async function importData() {
    console.log('Starting import of', data.length, 'records...');
    
    // Chunk array into smaller pieces to avoid payload too large (Supabase limits to 1000 usually, but let's do 200)
    const chunkSize = 200;
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        // Use upsert to avoid duplicate key errors if run twice
        const { error } = await supabase.from('insumos').upsert(chunk, { onConflict: 'codigo' });
        
        if (error) {
            console.error('Error importing chunk', i, error);
            process.exit(1);
        }
        console.log('Imported', i + chunk.length, '/', data.length);
    }
    
    console.log('Import complete!');
}

importData();
