"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight } from "lucide-react"

export default function RubrosPage() {
  const supabase = createClient()
  
  // Lista de Rubros
  const [rubros, setRubros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")
  
  // Categorias y Paginas
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
    fetchAllInsumos()
  }, [])

  // Resetear página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  // --- LOGICA DE DATOS ---
  const fetchRubros = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('rubros').select('*').order('created_at', { ascending: false })
    if (!error) setRubros(data || [])
    setLoading(false)
  }

  const fetchAllInsumos = async () => {
    const { data } = await supabase.from('insumos').select('*').order('nombre', { ascending: true })
    if (data) setAllInsumos(data)
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
    if (currentRubro && currentRubro.id === id) {
      setCurrentRubro(null)
      setRubroInsumos([])
    }
    fetchRubros()
  }

  // --- LOGICA DEL EDITOR DE RECETA ---
  const openEditor = async (rubro: any) => {
    setCurrentRubro(rubro)
    fetchRubroInsumos(rubro.id)
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
      // Update the rubros list with the new cost
      setRubros(rubros.map(r => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct} : r))
    }
  }

  // --- DERIVADOS Y PAGINACION ---
  // Extraer categorías únicas
  const categories = Array.from(new Set(rubros.map(r => r.categoria || 'Sin Categoría'))).sort().filter(c => c.toLowerCase().includes(searchCategoryTerm.toLowerCase()))

  let filteredRubros = rubros.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.codigo && r.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (selectedCategory) {
    filteredRubros = filteredRubros.filter(r => (r.categoria || 'Sin Categoría') === selectedCategory)
  }

  const totalPages = Math.max(1, Math.ceil(filteredRubros.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRubros = filteredRubros.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let end = Math.min(totalPages, start + maxPagesToShow - 1);
    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  const filteredInsumosSearch = allInsumos.filter(i => 
    i.nombre.toLowerCase().includes(searchInsumoTerm.toLowerCase()) || 
    (i.codigo && i.codigo.toLowerCase().includes(searchInsumoTerm.toLowerCase()))
  ).slice(0, 20)

  // Desglose de insumos actuales
  const mats = rubroInsumos.filter(i => i.insumos.tipo === 'material')
  const mos = rubroInsumos.filter(i => i.insumos.tipo === 'mano_de_obra')
  const eqs = rubroInsumos.filter(i => i.insumos.tipo === 'equipo')
  
  const { totMateriales, totManoObra, totEquipos, totalCostoDirecto, herramientaMenor } = currentRubro ? calcTotalesReceta() : { totMateriales:0, totManoObra:0, totEquipos:0, totalCostoDirecto:0, herramientaMenor:0 }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            <PenTool className="text-brand-sage" /> Catálogo de Rubros
          </h1>
          <p className="text-gray-500 text-sm mt-1">Crea las recetas (Análisis de Precios Unitarios) uniendo materiales, mano de obra y equipos.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-brand-sage text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Nuevo Rubro
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="flex flex-col flex-1 gap-6">
        
        {/* UPPER HALF: GROUPS & RUBROS */}
        <div className="flex flex-col md:flex-row gap-4 h-[550px] shrink-0">
          
          {/* LEFT PANEL: GROUPS */}
          <div className="w-full md:w-1/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0 flex flex-col gap-2">
              <div className="flex justify-between items-center font-bold text-gray-700 text-sm uppercase tracking-wider">
                <span>Categorías</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{categories.length}</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar grupo..." 
                  value={searchCategoryTerm}
                  onChange={(e) => setSearchCategoryTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-brand-sage focus:border-brand-sage"
                />
                <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              <button 
                onClick={() => { setSelectedCategory(null); setSearchCategoryTerm(""); }} 
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory ? 'bg-brand-sage text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Todas las categorías
              </button>
              {categories.map(c => (
                <button 
                  key={c}
                  onClick={() => setSelectedCategory(c)} 
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c ? 'bg-brand-sage text-white shadow-sm font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: RUBROS TABLE */}
          <div className="w-full md:w-3/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-4 shrink-0">
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Buscar rubro por código o nombre..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage"
                />
                <Search className="absolute left-3 top-2 text-gray-400" size={16} />
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col justify-between">
              <table className="w-full text-sm text-left divide-y divide-gray-200 h-full">
                <thead className="bg-slate-50 text-slate-700 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Código</th>
                    <th className="px-4 py-3">Nombre del Rubro</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">Unidad</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Costo Directo</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Cargando...</td></tr>
                  ) : paginatedRubros.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay rubros en esta categoría.</td></tr>
                  ) : (
                    paginatedRubros.map((r) => (
                      <tr 
                        key={r.id} 
                        className={`transition-colors cursor-pointer ${currentRubro?.id === r.id ? 'bg-blue-100 border-l-4 border-blue-600 shadow-inner' : 'hover:bg-gray-50 border-l-4 border-transparent'}`} 
                        onClick={() => openEditor(r)}
                      >
                        <td className="px-4 py-2 font-mono text-xs text-brand-sage font-bold whitespace-nowrap">{r.codigo}</td>
                        <td className="px-4 py-2 font-medium text-gray-800 leading-tight">{r.nombre}</td>
                        <td className="px-4 py-2 text-center">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{r.unidad}</span>
                        </td>
                        <td className="px-4 py-2 text-right font-black text-brand-dark whitespace-nowrap">
                          ${Number(r.total_costo_directo || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-2">
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

            {/* PAGINATION */}
            <div className="p-2 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">
                Mostrando {filteredRubros.length === 0 ? 0 : startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRubros.length)} de {filteredRubros.length} registros
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {getPageNumbers().map(num => (
                  <button 
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[28px] h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${currentPage === num ? 'bg-brand-sage text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    {num}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER HALF: APU RECIPE DETAILS */}
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage flex flex-col shrink-0">
          {!currentRubro ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <Box size={48} className="mb-4 opacity-20" />
              <p>Selecciona un rubro de la tabla superior para ver su Análisis de Precio Unitario (APU)</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* APU Header */}
              <div className="p-3 border-b border-gray-100 bg-brand-dark text-white flex justify-between items-center shrink-0">
                <div className="truncate pr-4">
                  <h2 className="font-bold text-sm truncate flex items-center gap-2">
                    <span className="text-brand-sage font-mono">{currentRubro.codigo}</span> {currentRubro.nombre}
                  </h2>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{currentRubro.unidad}</span>
                  <div className="text-brand-sage font-black text-lg">${totalCostoDirecto.toFixed(2)}</div>
                  <button onClick={saveRubro} className="bg-brand-sage text-brand-dark font-bold py-1.5 px-4 rounded hover:bg-white transition-colors flex items-center gap-2 text-xs">
                    <Save size={14} /> Guardar Costo
                  </button>
                </div>
              </div>

              {/* APU Actions */}
              <div className="p-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-gray-500 uppercase">Detalle de Insumos</span>
                <button onClick={() => setIsAddInsumoModalOpen(true)} className="bg-brand-dark text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-1.5">
                  <Plus size={14} /> Agregar Insumo
                </button>
              </div>

              {/* APU Table */}
              <div className="flex-1 overflow-hidden flex flex-col justify-between">
                <table className="w-full text-sm text-left divide-y divide-gray-200 h-full">
                  <thead className="bg-slate-50 text-slate-700 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-xs font-semibold">Código</th>
                      <th className="px-4 py-2 text-xs font-semibold">Insumo</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold">Unid.</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold">Rend./Cant.</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold">Costo U.</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold">Subtotal</th>
                      <th className="px-4 py-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {/* EQUIPOS */}
                    <tr className="bg-purple-50/50"><td colSpan={7} className="px-4 py-1.5 font-bold text-purple-700 text-xs">EQUIPOS Y MAQUINARIA (Total: ${totEquipos.toFixed(4)})</td></tr>
                    {eqs.length === 0 && <tr><td colSpan={7} className="px-4 py-2 text-center text-gray-400 italic text-xs">No hay equipos</td></tr>}
                    {eqs.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-1.5 font-mono text-xs text-gray-500">{item.insumos.codigo}</td>
                        <td className="px-4 py-1.5 font-medium text-gray-800 text-xs truncate max-w-xs">{item.insumos.nombre}</td>
                        <td className="px-4 py-1.5 text-center text-xs text-gray-500 font-bold">{item.insumos.unidad}</td>
                        <td className="px-4 py-1.5 text-right">
                          <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-20 text-right border rounded px-1.5 py-0.5 focus:border-purple-500 focus:ring-1 outline-none text-xs" />
                        </td>
                        <td className="px-4 py-1.5 text-right text-xs text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
                        <td className="px-4 py-1.5 text-right font-bold text-gray-800 text-xs">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
                        <td className="px-4 py-1.5 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></td>
                      </tr>
                    ))}
                    <tr className="bg-purple-50/20">
                      <td colSpan={2} className="px-4 py-1.5 font-medium text-gray-500 text-xs text-right">Herramienta Menor:</td>
                      <td className="px-4 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <input type="number" value={currentRubro.herramienta_menor_pct} onChange={(e) => setCurrentRubro({...currentRubro, herramienta_menor_pct: parseFloat(e.target.value)||0})} className="w-10 text-center border rounded py-0.5" />%
                        </div>
                      </td>
                      <td colSpan={2} className="px-4 py-1.5 text-right text-xs text-gray-400">S. M.O.</td>
                      <td className="px-4 py-1.5 text-right font-bold text-gray-800 text-xs">${herramientaMenor.toFixed(4)}</td>
                      <td></td>
                    </tr>

                    {/* MANO DE OBRA */}
                    <tr className="bg-orange-50/50"><td colSpan={7} className="px-4 py-1.5 font-bold text-orange-700 text-xs">MANO DE OBRA (Total: ${totManoObra.toFixed(4)})</td></tr>
                    {mos.length === 0 && <tr><td colSpan={7} className="px-4 py-2 text-center text-gray-400 italic text-xs">No hay mano de obra</td></tr>}
                    {mos.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-1.5 font-mono text-xs text-gray-500">{item.insumos.codigo}</td>
                        <td className="px-4 py-1.5 font-medium text-gray-800 text-xs truncate max-w-xs">{item.insumos.nombre}</td>
                        <td className="px-4 py-1.5 text-center text-xs text-gray-500 font-bold">{item.insumos.unidad}</td>
                        <td className="px-4 py-1.5 text-right">
                          <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-20 text-right border rounded px-1.5 py-0.5 focus:border-orange-500 focus:ring-1 outline-none text-xs" />
                        </td>
                        <td className="px-4 py-1.5 text-right text-xs text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
                        <td className="px-4 py-1.5 text-right font-bold text-gray-800 text-xs">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
                        <td className="px-4 py-1.5 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></td>
                      </tr>
                    ))}

                    {/* MATERIALES */}
                    <tr className="bg-blue-50/50"><td colSpan={7} className="px-4 py-1.5 font-bold text-blue-700 text-xs">MATERIALES (Total: ${totMateriales.toFixed(4)})</td></tr>
                    {mats.length === 0 && <tr><td colSpan={7} className="px-4 py-2 text-center text-gray-400 italic text-xs">No hay materiales</td></tr>}
                    {mats.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-1.5 font-mono text-xs text-gray-500">{item.insumos.codigo}</td>
                        <td className="px-4 py-1.5 font-medium text-gray-800 text-xs truncate max-w-xs">{item.insumos.nombre}</td>
                        <td className="px-4 py-1.5 text-center text-xs text-gray-500 font-bold">{item.insumos.unidad}</td>
                        <td className="px-4 py-1.5 text-right">
                          <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-20 text-right border rounded px-1.5 py-0.5 focus:border-blue-500 focus:ring-1 outline-none text-xs" />
                        </td>
                        <td className="px-4 py-1.5 text-right text-xs text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
                        <td className="px-4 py-1.5 text-right font-bold text-gray-800 text-xs">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
                        <td className="px-4 py-1.5 text-center"><button onClick={() => handleRemoveInsumo(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS (Nuevo Rubro y Buscar Insumo) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Crear Nuevo Rubro</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRubro} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                  <input type="text" value={newRubroData.codigo} onChange={e => setNewRubroData({...newRubroData, codigo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. HOR-001" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label>
                  <input type="text" value={newRubroData.unidad} onChange={e => setNewRubroData({...newRubroData, unidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="m3, m2, ml, glb" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre del Rubro</label>
                <input type="text" value={newRubroData.nombre} onChange={e => setNewRubroData({...newRubroData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. Hormigón simple f'c=210" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Categoría</label>
                <input type="text" value={newRubroData.categoria} onChange={e => setNewRubroData({...newRubroData, categoria: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-sm" placeholder="Ej. ESTRUCTURAS" />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors">Crear Rubro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddInsumoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 shrink-0">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text" 
                autoFocus
                placeholder="Buscar insumo por nombre o código..." 
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
