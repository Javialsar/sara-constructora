const fs = require('fs');
let content = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Replace fetchRubros properly using regex for robust matching
content = content.replace(/const fetchRubros = async \(\) => \{[\s\S]*?setLoading\(false\)\r?\n  \}/, `  const fetchAll = async (table: string, filter?: {col: string, val: string}) => {
    let allData: any[] = []; let from = 0; const step = 1000;
    while (true) {
      let q = supabase.from(table).select('*')
      if (filter) q = q.eq(filter.col, filter.val)
      const { data } = await q.range(from, from + step - 1)
      if (data && data.length > 0) { allData = allData.concat(data); if (data.length < step) break; from += step; } else break;
    }
    return allData;
  }

  const fetchRubros = async () => {
    setLoading(true)
    const [dRubros, dFam, dSub] = await Promise.all([
      fetchAll('rubros'), fetchAll('familias', {col:'grupo_sugerido', val:'rubro'}), fetchAll('subfamilias')
    ])
    if (dRubros) setRubros(dRubros.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    if (dFam) { 
      dFam.sort((a,b)=>a.nombre.localeCompare(b.nombre)); 
      setFamilias(dFam); 
      setExpandedFamilias(new Set(dFam.map(f=>f.id))) 
    }
    if (dSub) setSubfamilias(dSub.sort((a,b)=>a.nombre.localeCompare(b.nombre)))
    setLoading(false)
  }`);

// 2. Inject GruposManager return before the main return
// We must be careful because targetReturn might have CRLF or LF
const targetReturnLF = `  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">`;
const targetReturnCRLF = `  return (\r\n    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">`;

const injectedReturnLF = `  if (vista === 'grupos') return (
    <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => setVista('catalogo')} />
  )\n\n` + targetReturnLF;

const injectedReturnCRLF = `  if (vista === 'grupos') return (
    <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => setVista('catalogo')} />
  )\r\n\r\n` + targetReturnCRLF;

if (!content.includes("if (vista === 'grupos') return")) {
  if (content.includes(targetReturnCRLF)) {
    content = content.replace(targetReturnCRLF, injectedReturnCRLF);
  } else if (content.includes(targetReturnLF)) {
    content = content.replace(targetReturnLF, injectedReturnLF);
  }
}

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', content);
