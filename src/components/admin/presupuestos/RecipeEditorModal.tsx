import React from "react"
import { Edit3, X, Loader2, Plus, Save } from "lucide-react"
import { Virtuoso } from "react-virtuoso"

export default function RecipeEditorModal({
  isRecipeModalOpen,
  setIsRecipeModalOpen,
  currentRecipeRubro,
  currentPresupuesto,
  fetchPresupuestoRubros,
  rubrosRecipes,
  renderGroupedInsumos,
  insumoSearch,
  setInsumoSearch,
  searchingInsumos,
  allInsumos,
  handleAddInsumoToRecipe,
  handleSyncRecipeToMaster
}: any) {
  if (!isRecipeModalOpen || !currentRecipeRubro) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-6 border-b bg-white flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-brand-dark flex items-center gap-2">
              <Edit3 className="text-brand-sage" size={24} /> {currentRecipeRubro.codigo_rubro} - {currentRecipeRubro.nombre_rubro}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Estás modificando la receta (APU) <strong>solo para este proyecto</strong>.</p>
          </div>
          <button onClick={() => { setIsRecipeModalOpen(false); fetchPresupuestoRubros(currentPresupuesto?.id); }} className="text-gray-400 hover:text-red-500 p-2">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row grow overflow-hidden p-6 gap-6">
          <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h4 className="font-bold text-gray-800">Receta / Insumos del Rubro</h4>
            </div>
            <div className="overflow-y-auto grow p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 uppercase text-[10px] border-b">
                  <tr><th className="p-3">Insumo</th><th className="p-3 text-right">Cant/Rendimiento</th><th className="p-3 text-right">Costo U.</th><th className="p-3 text-right">Total</th><th className="p-3"></th></tr>
                </thead>
                <tbody>
                  {renderGroupedInsumos(rubrosRecipes[currentRecipeRubro.id], true)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto">
            {/* Resumen Card */}
            <div className="bg-brand-dark rounded-xl shadow-lg p-6 text-white shrink-0">
              <h2 className="text-xl font-bold mb-4 text-brand-sage border-b border-white/10 pb-2">Precio Unitario</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Materiales</span>
                  <span className="font-mono">
                    ${rubrosRecipes[currentRecipeRubro.id]?.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'material').reduce((acc: any, curr: any) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Mano Obra</span>
                  <span className="font-mono">
                    ${rubrosRecipes[currentRecipeRubro.id]?.filter((r: any) => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra').reduce((acc: any, curr: any) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Equipos (+ Herr.)</span>
                  <span className="font-mono">
                    ${rubrosRecipes[currentRecipeRubro.id]?.filter((r: any) => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo)).reduce((acc: any, curr: any) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>


              <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                <span className="text-sm font-bold text-gray-300">Costo Directo<br />Total</span>
                <span className="text-3xl font-black text-brand-sage">
                  ${rubrosRecipes[currentRecipeRubro.id]?.reduce((acc: any, curr: any) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                </span>
              </div>
              <button 
                onClick={handleSyncRecipeToMaster}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Save size={18} /> Sincronizar al Banco Maestro
              </button>

            </div>

            {/* Búsqueda Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 shrink-0 flex flex-col h-96">
              <h4 className="font-bold mb-4 text-brand-dark">Agregar Insumo a la Receta</h4>
              <input type="text" placeholder="Buscar catálogo maestro..." value={insumoSearch} onChange={e => setInsumoSearch(e.target.value)} className="w-full border p-2 rounded mb-4 shadow-sm" />
              <div className="relative grow overflow-y-auto">
                {searchingInsumos && <div className="absolute inset-0 bg-white/80 flex justify-center pt-4 z-10"><Loader2 className="animate-spin text-brand-sage" /></div>}
                {allInsumos.length > 0 ? (
                  <Virtuoso
                    style={{ height: '100%', width: '100%' }}
                    data={allInsumos}
                    itemContent={(index, ins: any) => (
                      <div className="pb-2">
                        <div key={ins.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex justify-between items-center shadow-sm hover:border-brand-sage transition-colors">
                          <div>
                            <div className="font-bold text-gray-800 leading-tight">{ins.nombre}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{ins.codigo}</div>
                            <div className="text-xs text-brand-dark font-medium mt-1">${Number(ins.precio_sin_iva).toFixed(4)} / {ins.unidad}</div>
                          </div>
                          <button onClick={() => handleAddInsumoToRecipe(ins)} className="bg-brand-sage text-white p-2 rounded transition-colors hover:bg-brand-dark shadow-sm"><Plus size={16} /></button>
                        </div>
                      </div>
                    )}
                  />
                ) : null}
                {allInsumos.length === 0 && insumoSearch.length >= 2 && !searchingInsumos && (
                  <div className="text-center py-4 text-gray-400 text-sm">No se encontraron insumos.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
