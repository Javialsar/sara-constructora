const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. In GruposManager: remove UI for subfamilias.
// For handleAddGrupo:
const addGrupoRegex = /const handleAddGrupo = async \(e: any\) => \{[\s\S]*?finally \{ setSaving\(false\) \}\s*\}/;
const newAddGrupo = `const handleAddGrupo = async (e: any) => {
    e.preventDefault(); if (!newGrupoNombre.trim()) return; setSaving(true);
    try {
      const id = 'FAM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      const { data, error } = await supabase.from('familias').insert([{ id, nombre: newGrupoNombre.trim(), grupo_sugerido: 'rubro' }]).select()
      if (!error && data) { 
        setNewGrupoNombre(""); setShowGrupoForm(false); setFamilias([...familias, data[0]]); 
        const sfId = 'SF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        const { data: sfData } = await supabase.from('subfamilias').insert([{ id: sfId, nombre: 'General', familia_id: id }]).select()
        if (sfData) setSubfamilias((prev: any) => [...prev, sfData[0]]);
      }
    } finally { setSaving(false) }
  }`;
content = content.replace(addGrupoRegex, newAddGrupo);

// 2. Hide subgrupos panel in GruposManager
// Replace the right pane of GruposManager with a dummy placeholder or remove it.
const rightPaneRegex = /<div className="md:col-span-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)$/;
// Wait, regex might be tricky. Let's just do a simpler string replace.
content = content.replace('{selectedFamilia ? (', '{false ? (');

// 3. In RubrosClient sidebar: remove Subgrupos mapping.
// Find: {isExpanded && subs.map(sf => { ... })}
const expandedSubsRegex = /\{isExpanded && subs\.map\(sf => \{[\s\S]*?\}\)\}/;
content = content.replace(expandedSubsRegex, '');

// Also remove Chevron logic from fam button:
content = content.replace('<span className="text-gray-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>', '');

// Also change selection logic:
// Instead of toggleFamilia, click selects familia directly.
content = content.replace('onClick={() => toggleFamilia(fam.id)}', 'onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); }}');

// 4. Modal "Nuevo Rubro": change "Subgrupo" to "Grupo".
content = content.replace('<label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subgrupo</label>', '<label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo</label>');

// Replace the `<select>` entirely
const selectPattern = /<select required value=\{\(newRubroData as any\)\.subfamilia_id \|\| ''\} onChange=\{e => \{[\s\S]*?\}\)\} \/>/; // Wait, it's easier to find it by lines or regex.

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
