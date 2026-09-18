"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Trash2, X, ArrowLeft, Save, FileText, Box, PenTool } from "lucide-react"

export default function RubrosPage() {
  const supabase = createClient()
  
  // Vistas
  const [view, setView] = useState<'lista' | 'editor'>('lista')
  
  // Lista de Rubros
  const [rubros, setRubros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Estado Modal Nuevo Rubro
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newRubroData, setNewRubroData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    unidad: 'm3',
    herramienta_menor_pct: 5.0
  })

  // Estado del Editor de Rubro (La Receta)
  const [currentRubro, setCurrentRubro] = useState<any>(null)
  const [rubroInsumos, setRubroInsumos] = useState<any[]>([])
  
  // Catálogo de Insumos para agregar a la receta
  const [allInsumos, setAllInsumos] = useState<any[]>([])
  const [searchInsumoTerm, setSearchInsumoTerm] = useState("")
  const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false)

  useEffect(() => {
    fetchRubros()
  }, [])

  // --- LOGICA LISTA DE RUBROS ---
  const fetchRubros = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('rubros').select('*').order('created_at', { ascending: false })
    if (!error) setRubros(data || [])
    setLoading(false)
  }

  const handleCreateRubro = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('rubros').insert([newRubroData]).select().single()
    if (!error) {
      setIsNewModalOpen(false)
      fetchRubros()
      openEditor(data)
    } else {
      alert("Error al crear el rubro. Revisa que el código no esté duplicado.")
    }
  }

  const handleDeleteRubro = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este rubro? Esto también borrará su receta.")) return
    await supabase.from('rubros').delete().eq('id', id)
    fetchRubros()
  }

  // --- LOGICA DEL EDITOR DE RECETA ---
  const openEditor = async (rubro: any) => {
    setCurrentRubro(rubro)
    setView('editor')
    fetchRubroInsumos(rubro.id)
    
    // Cargar catálogo de insumos si no se ha cargado
    if (allInsumos.length === 0) {
      const { data } = await supabase.from('insumos').select('*').order('nombre', { ascending: true })
      if (data) setAllInsumos(data)
    }
  }

  const fetchRubroInsumos = async (rubro_id: string) => {
    const { data, error } = await supabase
      .from('rubro_insumos')
      .select(`
        id, 
        cantidad, 
        insumo_id,
        insumos ( id, codigo, nombre, unidad, tipo, precio_sin_iva )
      `)
      .eq('rubro_id', rubro_id)
      
    if (!error) setRubroInsumos(data || [])
  }

  const handleAddInsumoToRubro = async (insumo: any) => {
    const defaultCantidad = 1.000;
    
    const { error } = await supabase.from('rubro_insumos').insert([{
      rubro_id: currentRubro.id,
      insumo_id: insumo.id,
      cantidad: defaultCantidad
    }])
    
    if (!error) {
      setIsAddInsumoModalOpen(false)
      setSearchInsumoTerm("")
      fetchRubroInsumos(currentRubro.id)
    }
  }

  const handleUpdateCantidad = async (item_id: string, nuevaCantidad: number) => {
    await supabase.from('rubro_insumos').update({ cantidad: nuevaCantidad }).eq('id', item_id)
    fetchRubroInsumos(currentRubro.id)
  }

  const handleRemoveInsumo = async (item_id: string) => {
    await supabase.from('rubro_insumos').delete().eq('id', item_id)
    fetchRubroInsumos(currentRubro.id)
  }

  // Cálculos de la Receta
  const calcTotalesReceta = () => {
    let totMateriales = 0;
    let totManoObra = 0;
    let totEquipos = 0;

    rubroInsumos.forEach(item => {
      const costoItem = item.cantidad * (item.insumos.precio_sin_iva || 0);
      if (item.insumos.tipo === 'material') totMateriales += costoItem;
      if (item.insumos.tipo === 'mano_de_obra') totManoObra += costoItem;
      if (item.insumos.tipo === 'equipo') totEquipos += costoItem;
    })

    const herramientaMenor = totManoObra * ((currentRubro?.herramienta_menor_pct || 0) / 100);
    totEquipos += herramientaMenor;

    const totalCostoDirecto = totMateriales + totManoObra + totEquipos;

    return { totMateriales, totManoObra, totEquipos, totalCostoDirecto, herramientaMenor }
  }

  const saveRubro = async () => {
    const { totalCostoDirecto } = calcTotalesReceta()
    const { error } = await supabase.from('rubros').update({ 
      herramienta_menor_pct: currentRubro.herramienta_menor_pct,
      total_costo_directo: totalCostoDirecto
    }).eq('id', currentRubro.id)
    
    if (!error) {
      alert("Rubro guardado y costeado correctamente.")
      fetchRubros()
    }
  }

  // Renderers
  const filteredRubros = rubros.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.codigo && r.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  const filteredInsumosSearch = allInsumos.filter(i => 
    i.nombre.toLowerCase().includes(searchInsumoTerm.toLowerCase()) || 
    (i.codigo && i.codigo.toLowerCase().includes(searchInsumoTerm.toLowerCase()))
  ).slice(0, 20)

  if (view === 'editor' && currentRubro) {
    const { totMateriales, totManoObra, totEquipos, totalCostoDirecto, herramientaMenor } = calcTotalesReceta()
    
    // Agrupación visual para la tabla
    const mats = rubroInsumos.filter(i => i.insumos.tipo === 'material')
    const mos = rubroInsumos.filter(i => i.insumos.tipo === 'mano_de_obra')
    const eqs = rubroInsumos.filter(i => i.insumos.tipo === 'equipo')

    return (
      <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('lista')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
              <PenTool className="text-brand-sage" /> {currentRubro.codigo} - {currentRubro.nombre}
            </h1>
            <p className="text-gray-500 text-sm">Análisis de Precio Unitario (APU) • Unidad: <strong>{currentRubro.unidad}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Izquierda: Componentes del Rubro */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Receta / Insumos del Rubro</h2>
              <button onClick={() => setIsAddInsumoModalOpen(true)} className="bg-brand-sage text-white text-sm font-bold py-1.5 px-4 rounded hover:bg-brand-dark transition-colors flex items-center gap-2">
                <Plus size={16} /> Agregar Insumo
              </button>
            </div>
            
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-slate-100 text-slate-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Insumo</th>
                    <th className="px-4 py-3 text-center">Unidad</th>
                    <th className="px-4 py-3 text-right">Rend. / Cant.</th>
                    <th className="px-4 py-3 text-right">Precio Ref.</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  
                  {/* MATERIALES */}
                  <tr className="bg-blue-50/50"><td colSpan={7} className="px-4 py-2 font-bold text-blue-700 text-xs">MATERIALES</td></tr>
                  {mats.length === 0 ? <tr><td colSpan={7} className="px-4 py-2 text-center text-gray-400 italic text-xs">No hay materiales</td></tr> : null}
                  {mats.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{item.insumos.codigo}</td>
                      <td className="px-4 py-2 font-medium text-gray-800 text-xs">{item.insumos.nombre}</td>
                      <td className="px-4 py-2 text-center text-xs text-gray-500 font-bold">{item.insumos.unidad}</td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-24 text-right border rounded px-2 py-1 focus:border-blue-500 focus:ring-1 outline-none text-xs" />
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-800">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
                      <td className="px-4 py-2 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></td>
                    </tr>
                  ))}

                  {/* MANO DE OBRA */}
                  <tr className="bg-orange-50/50"><td colSpan={7} className="px-4 py-2 font-bold text-orange-700 text-xs">MANO DE OBRA</td></tr>
                  {mos.length === 0 ? <tr><td colSpan={7} className="px-4 py-2 text-center text-gray-400 italic text-xs">No hay mano de obra</td></tr> : null}
                  {mos.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{item.insumos.codigo}</td>
                      <td className="px-4 py-2 font-medium text-gray-800 text-xs">{item.insumos.nombre}</td>
                      <td className="px-4 py-2 text-center text-xs text-gray-500 font-bold">{item.insumos.unidad}</td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-24 text-right border rounded px-2 py-1 focus:border-orange-500 focus:ring-1 outline-none text-xs" />
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-800">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
                      <td className="px-4 py-2 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></td>
                    </tr>
                  ))}

                  {/* EQUIPOS */}
                  <tr className="bg-purple-50/50"><td colSpan={7} className="px-4 py-2 font-bold text-purple-700 text-xs">EQUIPOS Y MAQUINARIA</td></tr>
                  {eqs.length === 0 ? <tr><td colSpan={7} className="px-4 py-2 text-center text-gray-400 italic text-xs">No hay equipos</td></tr> : null}
                  {eqs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{item.insumos.codigo}</td>
                      <td className="px-4 py-2 font-medium text-gray-800 text-xs">{item.insumos.nombre}</td>
                      <td className="px-4 py-2 text-center text-xs text-gray-500 font-bold">{item.insumos.unidad}</td>
                      <td className="px-4 py-2 text-right">
                        <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-24 text-right border rounded px-2 py-1 focus:border-purple-500 focus:ring-1 outline-none text-xs" />
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-800">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
                      <td className="px-4 py-2 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></td>
                    </tr>
                  ))}
                  <tr className="bg-purple-50/20">
                    <td colSpan={2} className="px-4 py-2 font-medium text-gray-500 text-xs text-right">Herramienta Menor:</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <input type="number" value={currentRubro.herramienta_menor_pct} onChange={(e) => setCurrentRubro({...currentRubro, herramienta_menor_pct: parseFloat(e.target.value)||0})} className="w-12 text-center border rounded py-0.5" />%
                      </div>
                    </td>
                    <td colSpan={2} className="px-4 py-2 text-right text-xs text-gray-400">Sobre M.O.</td>
                    <td className="px-4 py-2 text-right font-bold text-gray-800">${herramientaMenor.toFixed(4)}</td>
                    <td></td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Derecha: Resumen de Costos */}
          <div className="bg-brand-dark rounded-xl shadow-lg p-6 text-white h-fit sticky top-6 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-brand-sage border-b border-white/10 pb-2">Precio Unitario</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Materiales</span>
                  <span className="font-mono">${totMateriales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Mano Obra</span>
                  <span className="font-mono">${totManoObra.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Equipos (+ Herr.)</span>
                  <span className="font-mono">${totEquipos.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-300 font-medium text-sm">Costo Directo por {currentRubro.unidad}</span>
                  <span className="text-3xl font-black text-brand-sage">${totalCostoDirecto.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button onClick={saveRubro} className="w-full bg-brand-sage text-brand-dark font-black py-3 rounded-lg hover:bg-white transition-colors flex justify-center items-center gap-2 mt-4">
              <Save size={18} /> GUARDAR RUBRO
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
                  placeholder="Buscar insumo por nombre..." 
                  value={searchInsumoTerm}
                  onChange={(e) => setSearchInsumoTerm(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-lg text-gray-800 placeholder:text-gray-400"
                />
                <button onClick={() => setIsAddInsumoModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              
              <div className="overflow-y-auto p-2 grow">
                {searchInsumoTerm.length < 2 ? (
                  <div className="text-center py-12 text-gray-400">Escribe al menos 2 letras para buscar.</div>
                ) : filteredInsumosSearch.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No hay insumos que coincidan.</div>
                ) : (
                  <div className="space-y-1">
                    {filteredInsumosSearch.map(insumo => (
                      <div key={insumo.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-lg transition-colors cursor-pointer" onClick={() => handleAddInsumoToRubro(insumo)}>
                        <div className="flex gap-3 items-center">
                          <div className={`p-2 rounded-lg text-white ${insumo.tipo === 'material' ? 'bg-blue-500' : insumo.tipo === 'mano_de_obra' ? 'bg-orange-500' : 'bg-purple-500'}`}>
                            <Box size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-800">{insumo.nombre}</div>
                            <div className="text-xs text-gray-500 font-mono">{insumo.codigo} • {insumo.tipo}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-sm text-brand-dark">${Number(insumo.precio_sin_iva).toFixed(2)}</div>
                            <div className="text-xs text-gray-400">/ {insumo.unidad}</div>
                          </div>
                          <div className="bg-brand-sage text-white p-1.5 rounded hover:bg-brand-dark transition-colors">
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

  // Render Lista de Rubros
  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            <PenTool className="text-brand-sage" /> Catálogo de Rubros
          </h1>
          <p className="text-gray-500 mt-2">Crea las recetas (Análisis de Precios Unitarios) uniendo materiales, mano de obra y equipos.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-brand-sage text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Rubro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Buscar rubro por código o nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage shadow-sm bg-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left divide-y divide-gray-200">
            <thead className="bg-slate-100 text-slate-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nombre del Rubro</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-center">Unidad</th>
                <th className="px-6 py-4 text-right">Costo Directo</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : filteredRubros.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No hay rubros creados.</td></tr>
              ) : (
                filteredRubros.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-sage/5 transition-colors group cursor-pointer" onClick={() => openEditor(r)}>
                    <td className="px-6 py-3 font-mono text-brand-sage font-bold">{r.codigo}</td>
                    <td className="px-6 py-3 font-bold text-gray-800">{r.nombre}</td>
                    <td className="px-6 py-3 text-gray-500">{r.categoria || '-'}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{r.unidad}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-black text-brand-dark">
                      ${Number(r.total_costo_directo || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-brand-sage hover:text-brand-dark font-bold text-xs bg-brand-sage/10 px-3 py-1.5 rounded transition-colors">
                          Modificar APU
                        </button>
                        <button onClick={(e) => handleDeleteRubro(r.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
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
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Rubro</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateRubro} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                  <input type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" placeholder="Ej. HOR-001" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label>
                  <input type="text" value={newRubroData.unidad} onChange={e => setNewRubroData({...newRubroData, unidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" placeholder="m3, m2, ml, glb" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre del Rubro</label>
                <input type="text" value={newRubroData.nombre} onChange={e => setNewRubroData({...newRubroData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" placeholder="Ej. Hormigón simple f'c=210 kg/cm2" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Categoría / Capítulo (Opcional)</label>
                <input type="text" value={newRubroData.categoria} onChange={e => setNewRubroData({...newRubroData, categoria: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" placeholder="Ej. ESTRUCTURAS" />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors">Crear y Editar APU</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
