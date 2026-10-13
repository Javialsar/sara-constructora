import re

with open('src/app/admin/presupuestos_reales/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add the 'Explosión de Insumos' tab button
tab_btn = r"""          <button onClick={() => setActiveTab('explosion')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'explosion' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Calculator size={16} className="inline mr-2"/> Explosión de Insumos
          </button>
"""

code = code.replace(
    '<button onClick={() => setActiveTab(\'reportes\')}',
    tab_btn + '          <button onClick={() => setActiveTab(\'reportes\')}'
)

# Update the 'Reportes' table content to match the 6 reports
reportes_table_new = r"""<table className="w-full text-sm text-left">
              <thead className="bg-[#4b8fb4] text-white font-bold">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-center w-32">pdf</th>
                  <th className="px-6 py-3 text-center w-32">⚙</th>
                  <th className="px-6 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Presupuesto</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={handleGeneratePresupuestoGeneralPDF} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <Settings size={14}/> Configurar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales del presupuesto.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Análisis de Precios Unitarios (APUs)</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={handleGenerateAPUsPDF} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <Settings size={14}/> Configurar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Análisis de precios unitarios.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Precios unitarios elementales (PUEs)</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => alert("Próximamente")} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <Settings size={14}/> Configurar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Precios unitarios elementales.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Equipo</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleGenerateExplosionPDF('equipo')} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <Settings size={14}/> Configurar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales de maquinaria y equipos del presupuesto. En unidades comerciales.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Mano de obra</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleGenerateExplosionPDF('mano_de_obra')} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <Settings size={14}/> Configurar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales de mano de obra del presupuesto. En unidades comerciales.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Materiales</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleGenerateExplosionPDF('material')} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <Settings size={14}/> Configurar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales de materiales agrupados por categorías. En unidades comerciales.</td>
                </tr>
              </tbody>
            </table>"""

# Remove old reportes table and insert the new one
start_str = r'<table className="w-full text-sm text-left">'
end_str = r'</table>'
pattern = start_str + r'.*?' + end_str
code = re.sub(pattern, reportes_table_new, code, flags=re.DOTALL)

# Handle handleGenerateExplosionPDF receiving a filter type
# Old def: const handleGenerateExplosionPDF = () => {
# New def: const handleGenerateExplosionPDF = (filterType?: string) => {
code = code.replace('const handleGenerateExplosionPDF = () => {', 'const handleGenerateExplosionPDF = (filterType?: string) => {')

# The generation logic creates `explosionData`. We will filter it if filterType is provided.
explosion_logic = r"""
      // Traer todos los insumos de los rubros
      const { data: allInsumos, error } = await supabase.from('insumos').select('*').in('id', Array.from(insumosIds))
      
      const consolidado: Record<string, any> = {}
      
      presupuestoRubros.forEach(pr => {
        const q = Number(pr.cantidad_obra || 0)
        const items = rubrosRecipes[pr.id] || []
        items.forEach(item => {
          const ismId = item.insumo_id
          if (!consolidado[ismId]) {
            const dbIsm = allInsumos?.find(i => i.id === ismId)
            consolidado[ismId] = {
              codigo: dbIsm?.codigo || 'N/A',
              nombre: dbIsm?.nombre || 'Desconocido',
              unidad: dbIsm?.unidad || 'u',
              tipo: dbIsm?.tipo || 'otros',
              cantidad_total: 0,
              precio_unitario: Number(item.precio_sin_iva_snapshot),
              costo_total: 0
            }
          }
          const itemCant = Number(item.cantidad) * q
          consolidado[ismId].cantidad_total += itemCant
          consolidado[ismId].costo_total += itemCant * Number(item.precio_sin_iva_snapshot)
        })
      })

      let explosionData = Object.values(consolidado).sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo)
        return b.costo_total - a.costo_total
      })

      if (filterType) {
        if (filterType === 'equipo') {
            explosionData = explosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor')
        } else {
            explosionData = explosionData.filter(i => i.tipo === filterType)
        }
      }
"""

# Now we need to insert the filtering logic into the handleGenerateExplosionPDF body
# Since handleGenerateExplosionPDF is complex, I will just rewrite the `const explosionData = Object.values(consolidado).sort((a, b) => { ... })` part
code = code.replace(
    r"""const explosionData = Object.values(consolidado).sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo)
        return b.costo_total - a.costo_total
      })""",
    r"""let explosionData = Object.values(consolidado).sort((a, b) => {
        if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo)
        return b.costo_total - a.costo_total
      })

      if (filterType) {
        if (filterType === 'equipo') {
            explosionData = explosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor')
        } else {
            explosionData = explosionData.filter(i => i.tipo === filterType)
        }
      }"""
)

with open('src/app/admin/presupuestos_reales/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Reportes patched!")
