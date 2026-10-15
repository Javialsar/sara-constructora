"use client"
import React, { useState, useEffect, useMemo } from "react"
import { 
  X, Plus, Trash2, Save, Sparkles, AlertCircle, 
  Package, Users, Wrench, Truck, Check, Search, Loader2, ArrowRight
} from "lucide-react"

interface ApuSlideOverDetailProps {
  isOpen: boolean
  onClose: () => void
  currentRecipeRubro: any
  currentPresupuestoId: string
  rubrosRecipes: Record<string, any[]>
  regimen?: 'privado' | 'sercop'
  userRole?: string
  supabase: any
  onRecipeUpdated: () => Promise<void>
  allInsumos?: any[]
}

export default function ApuSlideOverDetail({
  isOpen,
  onClose,
  currentRecipeRubro,
  currentPresupuestoId,
  rubrosRecipes,
  regimen = 'privado',
  userRole = 'admin',
  supabase,
  onRecipeUpdated
}: ApuSlideOverDetailProps) {
  const [activeSection, setActiveSection] = useState<'materiales' | 'mano_de_obra' | 'equipos' | 'transporte'>('materiales')
  const [searchInsumoTerm, setSearchInsumoTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [herramientaPct, setHerramientaPct] = useState<number>(5.0)

  // Insumos del rubro actual
  const rawItems = useMemo(() => {
    if (!currentRecipeRubro?.id) return []
    return rubrosRecipes[currentRecipeRubro.id] || []
  }, [currentRecipeRubro?.id, rubrosRecipes])

  // Categorizar insumos
  const categorized = useMemo(() => {
    const mat: any[] = []
    const mo: any[] = []
    const eq: any[] = []
    const tr: any[] = []

    rawItems.forEach((r: any) => {
      const insObj = Array.isArray(r.insumo) ? r.insumo[0] : r.insumo
      const tipo = (insObj?.tipo || '').toLowerCase()
      if (tipo === 'material') {
        mat.push(r)
      } else if (tipo === 'mano_de_obra') {
        mo.push(r)
      } else if (tipo === 'transporte' || tipo === 'flete') {
        tr.push(r)
      } else {
        eq.push(r) // equipos y herramientas
      }
    })

    return { materiales: mat, mano_de_obra: mo, equipos: eq, transporte: tr }
  }, [rawItems])

  // Totales por componente
  const sumSection = (items: any[]) => {
    return items.reduce((acc, curr) => {
      const cant = Number(curr.cantidad || 0)
      const pu = Number(curr.precio_sin_iva_snapshot || 0)
      return acc + (cant * pu)
    }, 0)
  }

  const totalMateriales = useMemo(() => sumSection(categorized.materiales), [categorized.materiales])
  const totalMO = useMemo(() => sumSection(categorized.mano_de_obra), [categorized.mano_de_obra])
  const totalEquiposBase = useMemo(() => sumSection(categorized.equipos), [categorized.equipos])
  const totalTransporte = useMemo(() => sumSection(categorized.transporte), [categorized.transporte])
  
  // Herramienta menor (5% de Mano de Obra típico en Ecuador)
  const valorHerramientaMenor = useMemo(() => {
    return (totalMO * (herramientaPct / 100))
  }, [totalMO, herramientaPct])

  const totalEquiposTotal = totalEquiposBase + valorHerramientaMenor
  const totalCostoDirecto = totalMateriales + totalMO + totalEquiposTotal + totalTransporte

  // Búsqueda en catálogo maestro
  useEffect(() => {
    if (!searchInsumoTerm || searchInsumoTerm.trim().length < 2) {
      setSearchResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      const targetTipo = activeSection === 'materiales' ? 'material' 
        : activeSection === 'mano_de_obra' ? 'mano_de_obra'
        : activeSection === 'transporte' ? 'transporte' : 'equipo'

      let query = supabase
        .from('insumos')
        .select('*')
        .ilike('nombre', `%${searchInsumoTerm.trim()}%`)
        .limit(20)

      const { data } = await query
      if (data) {
        // Ordenar dando prioridad a los del tipo seleccionado
        const sorted = [...data].sort((a, b) => {
          if (a.tipo === targetTipo && b.tipo !== targetTipo) return -1
          if (a.tipo !== targetTipo && b.tipo === targetTipo) return 1
          return a.nombre.localeCompare(b.nombre)
        })
        setSearchResults(sorted)
      }
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInsumoTerm, activeSection, supabase])

  // Modificar cantidad/rendimiento
  const handleUpdateCantidad = async (itemId: string, newCant: number) => {
    if (newCant < 0) return
    try {
      await supabase
        .from('presupuesto_rubro_insumos')
        .update({ cantidad: newCant })
        .eq('id', itemId)
      await onRecipeUpdated()
    } catch (err) {
      console.error("Error al actualizar cantidad:", err)
    }
  }

  // Modificar precio snapshot del insumo en el proyecto
  const handleUpdatePrecio = async (itemId: string, newPrecio: number) => {
    if (newPrecio < 0) return
    try {
      await supabase
        .from('presupuesto_rubro_insumos')
        .update({ precio_sin_iva_snapshot: newPrecio })
        .eq('id', itemId)
      await onRecipeUpdated()
    } catch (err) {
      console.error("Error al actualizar precio:", err)
    }
  }

  // Eliminar insumo del rubro
  const handleRemoveInsumo = async (itemId: string) => {
    try {
      await supabase
        .from('presupuesto_rubro_insumos')
        .delete()
        .eq('id', itemId)
      await onRecipeUpdated()
    } catch (err) {
      console.error("Error al eliminar insumo:", err)
    }
  }

  // Agregar insumo seleccionado al rubro
  const handleAddInsumo = async (insumo: any) => {
    if (!currentRecipeRubro?.id) return
    try {
      await supabase.from('presupuesto_rubro_insumos').insert([{
        presupuesto_rubro_id: currentRecipeRubro.id,
        insumo_id: insumo.id,
        cantidad: 1.0,
        precio_sin_iva_snapshot: Number(insumo.precio_sin_iva) || 0
      }])
      setSearchInsumoTerm('')
      setSearchResults([])
      await onRecipeUpdated()
    } catch (err) {
      console.error("Error agregando insumo:", err)
    }
  }

  // Sincronizar hacia el catálogo maestro
  const handleSyncToMaster = async () => {
    if (!currentRecipeRubro?.rubro_id) {
      alert("Este rubro fue creado localmente y no tiene plantilla maestra enlazada.")
      return
    }
    if (!confirm("¿Deseas sobreescribir la receta en el Banco Maestro de Rubros? Esto actualizará la receta base para futuras obras.")) return
    
    setIsSaving(true)
    try {
      const masterRubroId = currentRecipeRubro.rubro_id
      await supabase.from('rubro_insumos').delete().eq('rubro_id', masterRubroId)
      
      const insertData = rawItems.map((item: any) => ({
        rubro_id: masterRubroId,
        insumo_id: item.insumo_id,
        cantidad: item.cantidad
      }))

      if (insertData.length > 0) {
        await supabase.from('rubro_insumos').insert(insertData)
      }
      await supabase.from('rubros').update({ total_costo_directo: totalCostoDirecto }).eq('id', masterRubroId)
      alert("¡Receta sincronizada exitosamente al Catálogo Maestro!")
    } catch (e: any) {
      console.error(e)
      alert("Error al sincronizar: " + (e.message || JSON.stringify(e)))
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !currentRecipeRubro) return null

  const itemsToShow = categorized[activeSection] || []

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Header del Slide-over */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-black bg-blue-100 text-blue-800">
                    {currentRecipeRubro.codigo_rubro || 'RUB-00'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-200 text-slate-700">
                    Und: {currentRecipeRubro.unidad || 'u'}
                  </span>
                  {regimen === 'sercop' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      🏛️ SERCOP 4 Columnas
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">
                      🏢 Régimen Privado
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {currentRecipeRubro.nombre_rubro}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Desglose analítico de insumos y rendimientos por unidad de obra producida.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Resumen KPI del APU en cabecera */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200/80">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="block text-[10px] font-bold uppercase text-blue-600">Materiales</span>
                <span className="text-sm font-black text-slate-800 font-mono">${totalMateriales.toFixed(2)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="block text-[10px] font-bold uppercase text-amber-600">Mano de Obra</span>
                <span className="text-sm font-black text-slate-800 font-mono">${totalMO.toFixed(2)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="block text-[10px] font-bold uppercase text-purple-600">Equipos & Herr.</span>
                <span className="text-sm font-black text-slate-800 font-mono">${totalEquiposTotal.toFixed(2)}</span>
              </div>
              <div className="bg-blue-600 p-2 rounded-lg text-white text-center shadow-xs">
                <span className="block text-[10px] font-bold uppercase text-blue-200">P. Unitario Directo</span>
                <span className="text-sm font-black font-mono">${totalCostoDirecto.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas de las 4 Columnas */}
          <div className="flex border-b border-slate-200 bg-white px-4">
            <button
              onClick={() => setActiveSection('materiales')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeSection === 'materiales'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package size={14} className="text-blue-600" />
              <span>Materiales</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-mono">
                {categorized.materiales.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('mano_de_obra')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeSection === 'mano_de_obra'
                  ? 'border-amber-600 text-amber-700 bg-amber-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={14} className="text-amber-600" />
              <span>Mano de Obra (CCEC)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                {categorized.mano_de_obra.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('equipos')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeSection === 'equipos'
                  ? 'border-purple-600 text-purple-700 bg-purple-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench size={14} className="text-purple-600" />
              <span>Equipos & Maq.</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono">
                {categorized.equipos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('transporte')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeSection === 'transporte'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck size={14} className="text-emerald-600" />
              <span>Transporte</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {categorized.transporte.length}
              </span>
            </button>
          </div>

          {/* Cuerpo: Lista de Insumos de la sección activa */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Buscador de Insumos rápido para agregar a esta sección */}
            <div className="relative">
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <Search size={16} className="text-slate-400 ml-1" />
                <input
                  type="text"
                  placeholder={`Buscar y agregar insumo a ${activeSection.replace('_', ' ')}...`}
                  value={searchInsumoTerm}
                  onChange={(e) => setSearchInsumoTerm(e.target.value)}
                  className="w-full text-xs bg-transparent outline-none text-slate-800"
                />
                {searching && <Loader2 size={15} className="animate-spin text-blue-600 mr-1" />}
                {searchInsumoTerm && (
                  <button onClick={() => setSearchInsumoTerm('')} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Resultados flotantes */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((ins) => (
                    <div
                      key={ins.id}
                      onClick={() => handleAddInsumo(ins)}
                      className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{ins.nombre}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {ins.codigo} • {ins.tipo} • Und: {ins.unidad}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">${Number(ins.precio_sin_iva || 0).toFixed(2)}</span>
                        <button className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabla de Insumos de la Sección */}
            {itemsToShow.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-xs text-slate-400 font-medium">
                  No hay insumos agregados en esta categoría.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Usa el buscador superior para agregar insumos del catálogo o cuadrillas CCEC.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Descripción Insumo</th>
                      <th className="py-2.5 px-2 text-center">Unidad</th>
                      <th className="py-2.5 px-2 text-right">Rendimiento / Cant.</th>
                      <th className="py-2.5 px-2 text-right">P. Unitario ($)</th>
                      <th className="py-2.5 px-3 text-right">Subtotal ($)</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {itemsToShow.map((item: any) => {
                      const insObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo
                      const cant = Number(item.cantidad || 0)
                      const pu = Number(item.precio_sin_iva_snapshot || 0)
                      const sub = cant * pu

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800 leading-tight">
                              {insObj?.nombre || 'Insumo sin nombre'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {insObj?.codigo || '-'}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-500 font-mono">
                            {insObj?.unidad || 'und'}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              defaultValue={cant}
                              onBlur={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-right font-mono font-bold border border-slate-200 rounded p-1 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              defaultValue={pu}
                              onBlur={(e) => handleUpdatePrecio(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-right font-mono border border-slate-200 rounded p-1 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                            ${sub.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveInsumo(item.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                              title="Quitar insumo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-[11px] uppercase tracking-wider text-slate-500">
                        Subtotal {activeSection.replace('_', ' ')}:
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs font-black text-blue-700">
                        ${sumSection(itemsToShow).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Ajuste de Herramienta Menor en sección de Equipos */}
            {activeSection === 'equipos' && (
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-900 block">Herramienta Menor (% Mano de Obra)</span>
                  <span className="text-[11px] text-purple-700">
                    Aplica automáticamente según especificación SERCOP y Cámara de la Construcción.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={herramientaPct}
                      onChange={(e) => setHerramientaPct(parseFloat(e.target.value) || 0)}
                      className="w-16 border border-purple-300 rounded-lg p-1.5 text-right font-bold text-xs bg-white pr-6"
                    />
                    <span className="absolute right-2 top-1.5 text-purple-500 font-bold">%</span>
                  </div>
                  <span className="font-mono font-black text-purple-900 text-xs">
                    = ${valorHerramientaMenor.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Fórmulas y detalle SERCOP en sección de Mano de Obra */}
            {activeSection === 'mano_de_obra' && regimen === 'sercop' && (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <span>Factor de Salario Básico y Beneficios Sociales (FSBC):</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Las cuadrillas incorporan salarios mínimos sectoriales del Ministerio del Trabajo 2026 más 13°, 14°, fondos de reserva y aportes IESS patronal.
                </p>
              </div>
            )}
          </div>

          {/* Footer del Slide-Over */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nuevo Costo Unitario</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ${totalCostoDirecto.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ {currentRecipeRubro.unidad}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {userRole === 'admin' && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSyncToMaster}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  title="Sobreescribir esta receta en el Banco Maestro de Rubros"
                >
                  <Save size={14} />
                  <span>Guardar a Banco Maestro</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Aplicar y Cerrar</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
