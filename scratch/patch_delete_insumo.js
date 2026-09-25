const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

const target = `  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este insumo?")) return
    const { error } = await supabase.from('insumos').delete().eq('id', id)
    if (!error) fetchData(); else alert("Error al eliminar el insumo")
  }`;

// Note: since the file might have encoding issues with ¿, let's use a regex
const regex = /const handleDelete = async \(id: string\) => \{\s*if \(!confirm\(".*Eliminar este insumo\?"\)\) return\s*const \{ error \} = await supabase\.from\('insumos'\)\.delete\(\)\.eq\('id', id\)\s*if \(!error\) fetchData\(\); else alert\("Error al eliminar el insumo"\)\s*\}/;

const replacement = `const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este insumo de forma permanente?")) return
    
    // Primero, limpiar relaciones seguras (proveedores) para que no bloqueen el borrado
    await supabase.from('insumo_proveedores').delete().eq('insumo_id', id)
    
    const { error } = await supabase.from('insumos').delete().eq('id', id)
    
    if (!error) {
      fetchData()
    } else {
      console.error(error)
      if (error.code === '23503') {
        alert("⚠️ No se puede eliminar este insumo porque está siendo utilizado en la receta de uno o más Rubros (APU).\\n\\nDebes quitarlo de los Rubros correspondientes antes de poder eliminarlo.")
      } else {
        alert("Error al eliminar el insumo: " + error.message)
      }
    }
  }`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', content);
  console.log('Patched successfully');
} else {
  console.log('Target not found');
}
