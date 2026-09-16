"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Edit2, Trash2, X, ArrowLeft, Box, Users, Wrench, Hammer, Tag, Save, Calculator } from "lucide-react"

export default function RubrosPage() {
  const supabase = createClient()
  
  // Vistas: 'lista' | 'editor'
  const [view, setView] = useState<'lista' | 'editor'>('lista')
  
  // Estado lista de Rubros
  const [rubros, setRubros] = useState<any[]>([])
  const [loadingRubros, setLoadingRubros] = useState(true)
  const [searchRubro, setSearchRubro] = useState("")

  // Estado Modal Nuevo Rubro
  const [isNewRubroModalOpen, setIsNewRubroModalOpen] = useState(false)
  const [newRubroData, setNewRubroData] = useState({
    codigo: '',
    nombre: '',
    unidad: 'm2',
    categoria: '',
    porcentaje_herramienta: 5.0
  })

  // Estado del Editor de Rubro (Receta)
  const [currentRubro, setCurrentRubro] = useState<any>(null)
  const [rubroInsumos, setRubroInsumos] = useState<any[]>([])
  const [loadingReceta, setLoadingReceta] = useState(false)

  // Buscador de Insumos para agregar a la receta
  const [allInsumos, setAllInsumos] = useState<any[]>([])
  const [searchInsumo, setSearchInsumo] = useState("")
  const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false)

  useEffect(() => {
    fetchRubros()
  }, [])

  // --- LOGICA DE LISTA DE RUBROS ---
  const fetchRubros = async () => {
    setLoadingRubros(true)
    const { data, error } = await supabase.from('rubros').select('*').order('categoria', { ascending: true })
    if (!error) setRubros(data || [])
    setLoadingRubros(false)
  }

  const handleCreateRubro = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('rubros').insert([newRubroData]).select().single()
    if (error) {
      alert("Error al crear rubro. Verifica que el código no esté duplicado.")
    } else {
      setIsNewRubroModalOpen(false)
      fetchRubros()
      openEditor(data) // Abrir editor inmediatamente
    }
  }

  const handleDeleteRubro = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este rubro? Esto no se puede deshacer.")) return
    await supabase.from('rubros').delete().eq('id', id)
    fetchRubros()
  }

  // --- LOGICA DEL EDITOR DE RECETA ---
  const openEditor = async (rubro: any) => {
    setCurrentRubro(rubro)
    setView('editor')
    fetchReceta(rubro.id)
    
    // Cargar todos los insumos si no están cargados
    if (allInsumos.length === 0) {
      const { data } = await supabase.from('insumos').select('*').order('nombre', { ascending: true })
      if (data) setAllInsumos(data)
    }
  }

  const fetchReceta = async (rubro_id: string) => {
    setLoadingReceta(true)
    // Hacemos un join con la tabla insumos
    const { data, error } = await supabase
      .from('rubro_insumos')
      .select(`
        id, cantidad,
        insumo:insumos (id, codigo, nombre, tipo, unidad, costo)
      `)
      .eq('rubro_id', rubro_id)
    
    if (!error) {
      // @ts-ignore
      setRubroInsumos(data || [])
    }
    setLoadingReceta(false)
  }

  const handleAddInsumoToReceta = async (insumo: any) => {
    const defaultCantidad = 1;
    const { error } = await supabase.from('rubro_insumos').insert([{
      rubro_id: currentRubro.id,
      insumo_id: insumo.id,
      cantidad: defaultCantidad
    }])
    if (!error) {
      setIsAddInsumoModalOpen(false)
      setSearchInsumo("")
      fetchReceta(currentRubro.id)
    } else {
      alert("Error al agregar. Tal vez ya existe en la receta.")
    }
  }

  const handleUpdateCantidad = async (recetaId: string, nuevaCantidad: number) => {
    await supabase.from('rubro_insumos').update({ cantidad: nuevaCantidad }).eq('id', recetaId)
    fetchReceta(currentRubro.id) // Refrescar para recalcular
  }

  const handleRemoveFromReceta = async (recetaId: string) => {
    await supabase.from('rubro_insumos').delete().eq('id', recetaId)
    fetchReceta(currentRubro.id)
  }

  // Cálculos matemáticos en tiempo real del APU
  const calcTotalAPU = () => {
    let totMat = 0; let totMO = 0; let totEq = 0;

    rubroInsumos.forEach(item => {
      if (!item.insumo) return;
      const subtotal = Number(item.cantidad) * Number(item.insumo.costo);
      if (item.insumo.tipo === 'material') totMat += subtotal;
      if (item.insumo.tipo === 'mano_obra') totMO += subtotal;
      if (item.insumo.tipo === 'equipo') totEq += subtotal;
    })

    // Sumar el porcentaje de herramienta menor sobre la mano de obra
    const costoHerramientaMenor = totMO * ((currentRubro?.porcentaje_herramienta || 0) / 100);
    totEq += costoHerramientaMenor;

    const costoDirecto = totMat + totMO + totEq;
    return { totMat, totMO, totEq, costoHerramientaMenor, costoDirecto }
  }

  const saveCostoDirecto = async () => {
    const { costoDirecto } = calcTotalAPU()
    await supabase.from('rubros').update({ total_costo_directo: costoDirecto }).eq('id', currentRubro.id)
    alert("APU Guardado Correctamente")
    fetchRubros() // Actualiza la tabla principal por detrás
  }


  // Renderers
  const filteredRubros = rubros.filter(r => 
    r.nombre.toLowerCase().includes(searchRubro.toLowerCase()) || 
    r.codigo.toLowerCase().includes(searchRubro.toLowerCase())
  )

  const filteredInsumosSearch = allInsumos.filter(i => 
    i.nombre.toLowerCase().includes(searchInsumo.toLowerCase()) || 
    i.codigo.toLowerCase().includes(searchInsumo.toLowerCase())
  ).slice(0, 15) // Solo mostrar los 15 primeros para no saturar

  if (view === 'editor' && currentRubro) {
    const { totMat, totMO, totEq, costoHerramientaMenor, costoDirecto } = calcTotalAPU()
    
    return (
      <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('lista')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
              <Calculator className="text-brand-sage" /> {currentRubro.codigo} - {currentRubro.nombre}
            </h1>
            <p className="text-gray-500 text-sm">Unidad de medida: <strong>{currentRubro.unidad}</strong> | Categoría: <strong>{currentRubro.categoria}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lado izquierdo: La tabla de receta */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Insumos del Rubro (Receta)</h2>
              <button onClick={() => setIsAddInsumoModalOpen(true)} className="bg-brand-sage text-white text-sm font-bold py-1.5 px-4 rounded hover:bg-brand-dark transition-colors flex items-center gap-2">
                <Plus size={16} /> Agregar Insumo
              </button>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-bold uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Insumo</th>
                    <th className="px-4 py-3 text-center">Unidad</th>
                    <th className="px-4 py-3 text-right">Rendimiento (Cant)</th>
                    <th className="px-4 py-3 text-right">Costo Unit.</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingReceta ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Cargando receta...</td></tr>
                  ) : rubroInsumos.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 m-4 rounded-xl">La receta está vacía. Agrega insumos para calcular el APU.</td></tr>
                  ) : (
                    rubroInsumos.map((item) => {
                      if (!item.insumo) return null;
                      const subtotal = Number(item.cantidad) * Number(item.insumo.costo);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 group">
                          <td className="px-4 py-2">
                            {item.insumo.tipo === 'material' ? <Box size={14} className="text-blue-500" /> : 
                             item.insumo.tipo === 'mano_obra' ? <Users size={14} className="text-orange-500" /> : 
                             item.insumo.tipo === 'equipo' ? <Wrench size={14} className="text-purple-500" /> : 
                             item.insumo.tipo === 'herramienta_menor' ? <Hammer size={14} className="text-teal-500" /> : 
                             <Tag size={14} className="text-gray-500" />}
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-800 text-xs">{item.insumo.nombre}</td>
                          <td className="px-4 py-2 text-center text-xs text-gray-500">{item.insumo.unidad}</td>
                          <td className="px-4 py-2 text-right">
                            <input 
                              type="number" step="0.0001" min="0" 
                              value={item.cantidad}
                              onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-right border rounded px-2 py-1 text-xs focus:border-brand-sage focus:ring-1 outline-none"
                            />
                          </td>
                          <td className="px-4 py-2 text-right text-xs text-gray-500">${Number(item.insumo.costo).toFixed(4)}</td>
                          <td className="px-4 py-2 text-right font-bold text-gray-800 text-xs">${subtotal.toFixed(4)}</td>
                          <td className="px-4 py-2 text-center">
                            <button onClick={() => handleRemoveFromReceta(item.id)} className="text-gray-300 hover:text-red-500">
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lado derecho: Resumen APU */}
          <div className="bg-brand-dark rounded-xl shadow-lg p-6 text-white h-fit sticky top-6">
            <h2 className="text-xl font-bold mb-6 text-brand-sage border-b border-white/10 pb-4">Análisis de Precio (APU)</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2"><Box size={14}/> Materiales</span>
                <span className="font-mono font-medium">${totMat.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2"><Users size={14}/> Mano de Obra (MO)</span>
                <span className="font-mono font-medium">${totMO.toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-2"><Wrench size={14}/> Equipos y Maquinaria</span>
                <span className="font-mono font-medium">${(totEq - costoHerramientaMenor).toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-gray-400 flex items-center gap-2 text-xs pl-6">+ Herramienta ({currentRubro.porcentaje_herramienta}% MO)</span>
                <span className="font-mono text-gray-400 text-xs">${costoHerramientaMenor.toFixed(4)}</span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-300 font-medium">Costo Directo / {currentRubro.unidad}</span>
                <span className="text-3xl font-black text-brand-sage">${costoDirecto.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={saveCostoDirecto} className="w-full bg-brand-sage text-brand-dark font-black py-3 rounded-lg hover:bg-white transition-colors flex justify-center items-center gap-2 shadow-lg">
              <Save size={18} /> GUARDAR APU
            </button>
          </div>
        </div>

        {/* Modal Buscar Insumo */}
        {isAddInsumoModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 shrink-0">
                <Search className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Buscar material, equipo o mano de obra..." 
                  value={searchInsumo}
                  onChange={(e) => setSearchInsumo(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-lg text-gray-800 placeholder:text-gray-400"
                />
                <button onClick={() => setIsAddInsumoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              
              <div className="overflow-y-auto p-2 grow">
                {searchInsumo.length < 2 ? (
                  <div className="text-center py-12 text-gray-400">Escribe al menos 2 letras para buscar en el catálogo de {allInsumos.length} insumos.</div>
                ) : filteredInsumosSearch.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No hay resultados para "{searchInsumo}"</div>
                ) : (
                  <div className="space-y-1">
                    {filteredInsumosSearch.map(ins => (
                      <div key={ins.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-lg transition-colors cursor-pointer" onClick={() => handleAddInsumoToReceta(ins)}>
                        <div className="flex gap-3 items-center">
                          <div className={`p-2 rounded-lg ${ins.tipo === 'material' ? 'bg-blue-50 text-blue-500' : ins.tipo === 'mano_obra' ? 'bg-orange-50 text-orange-500' : ins.tipo === 'equipo' ? 'bg-purple-50 text-purple-500' : ins.tipo === 'herramienta_menor' ? 'bg-teal-50 text-teal-500' : 'bg-gray-50 text-gray-500'}`}>
                            {ins.tipo === 'material' ? <Box size={16} /> : ins.tipo === 'mano_obra' ? <Users size={16} /> : ins.tipo === 'equipo' ? <Wrench size={16} /> : ins.tipo === 'herramienta_menor' ? <Hammer size={16} /> : <Tag size={16} />}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-800">{ins.nombre}</div>
                            <div className="text-xs text-gray-500 font-mono">{ins.codigo} • {ins.categoria}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-sm text-brand-dark">${Number(ins.costo).toFixed(2)}</div>
                            <div className="text-xs text-gray-400">por {ins.unidad}</div>
                          </div>
                          <div className="bg-gray-100 p-1.5 rounded text-gray-400 hover:bg-brand-sage hover:text-white transition-colors">
                            <Plus size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render por defecto: Lista de Rubros
  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Catálogo de Rubros (APUs)</h1>
          <p className="text-gray-500 mt-2">Crea las recetas matemáticas de precios unitarios para armar tus presupuestos.</p>
        </div>
        <button 
          onClick={() => setIsNewRubroModalOpen(true)}
          className="bg-brand-sage text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Rubro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Buscar rubro por nombre o código..." 
              value={searchRubro}
              onChange={(e) => setSearchRubro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage shadow-sm bg-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nombre del Rubro</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-center">Unidad</th>
                <th className="px-6 py-4 text-right">Costo Directo (Total)</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingRubros ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Cargando rubros...</td></tr>
              ) : filteredRubros.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No hay rubros creados.</td></tr>
              ) : (
                filteredRubros.map((rubro) => (
                  <tr key={rubro.id} className="hover:bg-brand-sage/5 transition-colors group cursor-pointer" onClick={() => openEditor(rubro)}>
                    <td className="px-6 py-3 font-mono text-xs text-brand-sage font-bold">{rubro.codigo}</td>
                    <td className="px-6 py-3 font-medium text-brand-dark">{rubro.nombre}</td>
                    <td className="px-6 py-3 text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{rubro.categoria}</span></td>
                    <td className="px-6 py-3 text-center font-bold text-gray-500">{rubro.unidad}</td>
                    <td className="px-6 py-3 text-right font-black text-gray-800">
                      ${Number(rubro.total_costo_directo || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-brand-sage hover:text-brand-dark font-bold text-xs bg-brand-sage/10 px-3 py-1.5 rounded transition-colors">
                          Editar Receta
                        </button>
                        <button onClick={(e) => handleDeleteRubro(rubro.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Rubro */}
      {isNewRubroModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Rubro</h3>
              <button onClick={() => setIsNewRubroModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateRubro} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Código (Ej. RUB-01)</label>
                  <input type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage font-mono uppercase" required />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Unidad (Ej. m2, m3, ml)</label>
                  <input type="text" value={newRubroData.unidad} onChange={e => setNewRubroData({...newRubroData, unidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage font-bold text-center" required />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre del Rubro</label>
                  <input type="text" value={newRubroData.nombre} onChange={e => setNewRubroData({...newRubroData, nombre: e.target.value})} placeholder="Ej. Losa de Hormigón Armado e=20cm" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage" required />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Categoría / Especialidad</label>
                  <input type="text" value={newRubroData.categoria} onChange={e => setNewRubroData({...newRubroData, categoria: e.target.value})} placeholder="Ej. Estructura, Cimentación, Eléctrico..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage" required />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">% Herramienta Menor (Sobre MO)</label>
                  <input type="number" step="0.1" value={newRubroData.porcentaje_herramienta} onChange={e => setNewRubroData({...newRubroData, porcentaje_herramienta: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage" required />
                  <p className="text-[10px] text-gray-400 mt-1">Suele ser entre 3% y 5% de la Mano de Obra para desgaste de palas, picos, etc.</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewRubroModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors shadow-sm">Crear Rubro y Añadir Insumos</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
