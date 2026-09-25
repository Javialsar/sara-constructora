const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const oldCode = `  const fetchAllInsumos = async () => {
    const { data } = await supabase.from('insumos').select('*').order('nombre', { ascending: true })
    if (data) setAllInsumos(data)
  }`;

const newCode = `  const fetchAllInsumos = async () => {
    const data = await fetchAll('insumos');
    if (data) {
      data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      setAllInsumos(data);
    }
  }`;

// use Regex to ensure matching despite formatting differences
const regex = /const fetchAllInsumos = async \(\) => \{[\s\S]*?setAllInsumos\(data\)[\s\S]*?\}/;

if (c.match(regex)) {
   c = c.replace(regex, newCode);
   fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
   console.log('Patched');
} else {
   console.log('Not found');
}
