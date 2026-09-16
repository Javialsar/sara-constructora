const fs = require('fs');
let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf8');

// --- 1. Modify the Rubro modal to show Price ---
const rubroMatch = `                      <div><div className="font-bold">{r.nombre}</div><div className="text-xs text-brand-sage font-mono">{r.codigo}</div></div>
                      <button className="bg-brand-sage text-white p-2 rounded hover:bg-brand-dark"><Plus size={16}/></button>`;

const rubroReplacement = `                      <div><div className="font-bold">{r.nombre}</div><div className="text-xs text-brand-sage font-mono">{r.codigo}</div></div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] uppercase text-gray-400 font-bold">Costo Ref.</div>
                          <div className="font-black text-brand-dark">$\${Number(r.total_costo_directo || 0).toFixed(2)}</div>
                        </div>
                        <button className="bg-brand-sage text-white p-2 rounded hover:bg-brand-dark"><Plus size={16}/></button>
                      </div>`;
c = c.replace(rubroMatch, rubroReplacement);


// --- 2. Implement remote search for Insumos in the Recipe Editor ---
// Find the states
const stateMatch = `  const [allInsumos, setAllInsumos] = useState([])
  const [insumoSearch, setInsumoSearch] = useState("")`;

const stateReplacement = `  const [allInsumos, setAllInsumos] = useState([])
  const [insumoSearch, setInsumoSearch] = useState("")
  const [searchingInsumos, setSearchingInsumos] = useState(false)

  // Auto-search effect for Insumos
  useEffect(() => {
    if (!insumoSearch || insumoSearch.length < 2) {
      setAllInsumos([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setSearchingInsumos(true);
      const { data } = await supabase
        .from('insumos')
        .select('*')
        .ilike('nombre', \`%\${insumoSearch}%\`)
        .limit(30);
      if (data) setAllInsumos(data);
      setSearchingInsumos(false);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [insumoSearch]);`;

c = c.replace(stateMatch, stateReplacement);

// Remove the initial 1000-limit fetch of allInsumos
c = c.replace(/if \(allInsumos\.length === 0\) \{\s*const \{ data \} = await supabase\.from\('insumos'\)\.select\('\*'\)\.order\('tipo', \{ ascending: true \}\)\s*if \(data\) setAllInsumos\(data\)\s*\}/g, '');

// Fix the mapping in the UI
const insumoUIMatch = `                    <div className="space-y-2">
                      {allInsumos.filter(i => i.nombre.toLowerCase().includes(insumoSearch.toLowerCase()) || i.codigo.toLowerCase().includes(insumoSearch.toLowerCase())).slice(0, 10).map(ins => (
                        <div key={ins.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm flex justify-between items-center shadow-sm">
                          <div><div className="font-bold text-gray-800">{ins.nombre}</div><div className="text-xs text-gray-500">$\${ins.precio_sin_iva} / {ins.unidad}</div></div>
                          <button onClick={() => handleAddInsumoToRecipe(ins)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded"><Plus size={16}/></button>
                        </div>
                      ))}
                    </div>`;

const insumoUIReplacement = `                    <div className="space-y-2 relative">
                      {searchingInsumos && <div className="absolute inset-0 bg-gray-50/80 flex justify-center pt-4 z-10"><Loader2 className="animate-spin text-brand-sage" /></div>}
                      {allInsumos.map(ins => (
                        <div key={ins.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm flex justify-between items-center shadow-sm hover:border-brand-sage transition-colors">
                          <div>
                            <div className="font-bold text-gray-800 leading-tight">{ins.nombre}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{ins.codigo}</div>
                            <div className="text-xs text-brand-dark font-medium mt-1">$\${Number(ins.precio_sin_iva).toFixed(4)} / {ins.unidad}</div>
                          </div>
                          <button onClick={() => handleAddInsumoToRecipe(ins)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded transition-colors"><Plus size={16}/></button>
                        </div>
                      ))}
                      {allInsumos.length === 0 && insumoSearch.length >= 2 && !searchingInsumos && (
                        <div className="text-center py-4 text-gray-400 text-sm">No se encontraron insumos.</div>
                      )}
                    </div>`;

c = c.replace(insumoUIMatch, insumoUIReplacement);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
console.log('Fixed dual features!');
