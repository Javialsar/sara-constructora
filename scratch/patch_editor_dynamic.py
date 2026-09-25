import re

with open('scratch/page.tsx.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
content = re.sub(
    r'(const \[currentRubro, setCurrentRubro\] = useState<any>\(null\))',
    r'const [familiasInsumo, setFamiliasInsumo] = useState<any[]>([])\n  \1',
    content
)

# 2. fetchRubros
fetch_rubros_old = """const [dRubros, dFam, dSub] = await Promise.all([
      fetchAll('rubros'), fetchAll('familias', {col:'grupo_sugerido', val:'rubro'}), fetchAll('subfamilias')
    ])"""
fetch_rubros_new = """const [dRubros, dFam, dSub, dFamIns] = await Promise.all([
      fetchAll('rubros'), fetchAll('familias', {col:'grupo_sugerido', val:'rubro'}), fetchAll('subfamilias'), fetchAll('familias')
    ])"""
content = content.replace(fetch_rubros_old, fetch_rubros_new)

# 3. setFamiliasInsumo inside fetchRubros
set_rubros_old = """if (dRubros) setRubros(dRubros.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))"""
set_rubros_new = """if (dRubros) setRubros(dRubros.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    if (dFamIns) setFamiliasInsumo(dFamIns.filter((f:any) => f.grupo_sugerido !== 'rubro').sort((a:any,b:any) => a.nombre.localeCompare(b.nombre)))"""
content = content.replace(set_rubros_old, set_rubros_new)

# 4. calcTotalesReceta
calc_totales_old_regex = r'const calcTotalesReceta = \(\) => \{.*?(?=const saveRubro = async \(\) => \{)'
calc_totales_new = """const calcTotalesReceta = () => {
    let baseTotal = 0;
    rubroInsumos.forEach(item => {
      baseTotal += item.cantidad * (item.insumos.precio_sin_iva || 0);
    });
    let totManoObra = 0;
    const moFam = familiasInsumo.find(f => f.nombre.toLowerCase().includes('mano de obra'));
    if (moFam) {
       const moSubfamIds = subfamilias.filter(sf => sf.familia_id === moFam.id).map(sf=>sf.id);
       rubroInsumos.forEach(item => {
         if (moSubfamIds.includes(item.insumos.subfamilia_id)) {
            totManoObra += item.cantidad * (item.insumos.precio_sin_iva || 0);
         }
       });
    }
    const herramientaMenor = totManoObra * ((currentRubro?.herramienta_menor_pct || 0) / 100);
    return { totalCostoDirecto: baseTotal + herramientaMenor, herramientaMenor };
  }

  """
content = re.sub(calc_totales_old_regex, calc_totales_new, content, flags=re.DOTALL)

# 5. Totals destruct in render
tot_destruct_old = """const mats = rubroInsumos.filter(i => i.insumos.tipo === 'material')
  const mos = rubroInsumos.filter(i => i.insumos.tipo === 'mano_de_obra')
  const eqs = rubroInsumos.filter(i => i.insumos.tipo === 'equipo')
  const { totMateriales, totManoObra, totEquipos, totalCostoDirecto, herramientaMenor } = currentRubro ? calcTotalesReceta() : { totMateriales:0, totManoObra:0, totEquipos:0, totalCostoDirecto:0, herramientaMenor:0 }"""
tot_destruct_new = """const { totalCostoDirecto, herramientaMenor } = currentRubro ? calcTotalesReceta() : { totalCostoDirecto:0, herramientaMenor:0 }"""
content = content.replace(tot_destruct_old, tot_destruct_new)

# 6. Header Boxes
boxes_old_regex = r'<div className="p-3 border border-gray-200 rounded-lg flex flex-col justify-center items-center">.*?<Wrench.*?</Wrench>.*?</div.*?<div className="p-3 border border-gray-200 rounded-lg flex flex-col justify-center items-center">.*?<HardHat.*?</HardHat>.*?</div.*?<div className="p-3 border border-gray-200 rounded-lg flex flex-col justify-center items-center">.*?<Package.*?</Package>.*?</div'
boxes_new = """{familiasInsumo.map(famIns => {
                  const validSfIds = subfamilias.filter(sf => sf.familia_id === famIns.id).map(sf=>sf.id);
                  const items = rubroInsumos.filter(ri => validSfIds.includes(ri.insumos.subfamilia_id));
                  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.insumos.precio_sin_iva), 0);
                  const isEquipos = famIns.nombre.toLowerCase().includes('equipo');
                  return (
                    <div key={famIns.id} className="p-3 border border-gray-200 rounded-lg flex flex-col justify-center items-center relative group" title={famIns.nombre}>
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1 truncate w-full text-center">{famIns.nombre}</span>
                      <span className="text-sm font-black text-gray-800">${(subtotal + (isEquipos ? herramientaMenor : 0)).toFixed(2)}</span>
                    </div>
                  )
                })}"""
content = re.sub(boxes_old_regex, boxes_new, content, flags=re.DOTALL)

# 7. Tables body
tables_old_regex = r'\{\/\* 1\. EQUIPOS Y MAQUINARIA \*\/}.*?(?=\{\/\* MODAL: Agregar Insumo \*\/})'
tables_new = """<div className="flex flex-col gap-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {familiasInsumo.map((famIns, idx) => {
                  const validSfIds = subfamilias.filter(sf => sf.familia_id === famIns.id).map(sf=>sf.id);
                  const items = rubroInsumos.filter(ri => validSfIds.includes(ri.insumos.subfamilia_id));
                  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.insumos.precio_sin_iva), 0);
                  const isEquipos = famIns.nombre.toLowerCase().includes('equipo');
                  const hMenor = isEquipos ? herramientaMenor : 0;
                  
                  return (
                    <div key={famIns.id} className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gray-50 text-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5"><Layers size={14} className="text-brand-sage"/> {idx + 1}. {famIns.nombre}</span>
                          <button onClick={() => { setAddInsumoCategory(famIns.id); setIsAddInsumoModalOpen(true); }} className="ml-2 text-xs bg-brand-sage/10 hover:bg-brand-sage/20 text-brand-dark px-2 py-0.5 rounded font-semibold transition-colors flex items-center gap-1 shadow-sm"><Plus size={12}/> Agregar</button>
                        </div>
                        <span className="font-black text-sm text-brand-dark">${(subtotal + hMenor).toFixed(4)}</span>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-white text-gray-400 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-xs w-[12%]">Cdigo</th>
                            <th className="px-4 py-2 text-left font-semibold text-xs w-[38%]">Descripcin</th>
                            <th className="px-4 py-2 text-center font-semibold text-xs w-[10%]">Unid.</th>
                            <th className="px-4 py-2 text-right font-semibold text-xs w-[15%]">Cantidad</th>
                            <th className="px-4 py-2 text-right font-semibold text-xs w-[15%]">Costo U.</th>
                            <th className="px-4 py-2 text-right font-semibold text-xs w-[15%]">Subtotal</th>
                            <th className="px-2 py-2 w-[5%]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {items.length === 0 && <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-400 italic text-sm">No hay insumos en esta categora</td></tr>}
                          {items.map(item => renderInsumoRow(item))}
                          {isEquipos && (
                            <tr className="bg-purple-50/30">
                              <td colSpan={3} className="px-4 py-2.5 text-right text-xs text-purple-700 font-medium flex items-center justify-end gap-2">
                                Herramienta Menor:
                                <input type="number" inputMode="decimal" value={currentRubro.herramienta_menor_pct} onChange={(e) => setCurrentRubro({...currentRubro, herramienta_menor_pct: parseFloat(e.target.value)||0})} className="w-12 px-1 py-0.5 border border-purple-200 rounded text-center outline-none focus:border-purple-400 bg-white" />
                                <span className="text-purple-400 font-bold">% s/M.O.</span>
                              </td>
                              <td colSpan={3} className="px-4 py-2.5 text-right font-black text-purple-800 text-sm">${hMenor.toFixed(4)}</td>
                              <td></td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>

              """
content = re.sub(tables_old_regex, tables_new, content, flags=re.DOTALL)

# 8. search filteredInsumos
search_old_regex = r'const filteredInsumosSearch = allInsumos\.filter\(i => addInsumoCategory \? i\.tipo === addInsumoCategory : true\)'
search_new = """const filteredInsumosSearch = allInsumos.filter((i:any) => {
      if (addInsumoCategory) {
        const validSubfams = subfamilias.filter((sf:any) => sf.familia_id === addInsumoCategory).map((sf:any) => sf.id);
        return validSubfams.includes(i.subfamilia_id);
      }
      return true;
    })"""
content = re.sub(search_old_regex, search_new, content)

with open('src/app/admin/apus/rubros/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied")
