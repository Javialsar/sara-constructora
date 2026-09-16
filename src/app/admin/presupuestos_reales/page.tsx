"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Trash2, X, ArrowLeft, Save, Calculator, FileText, Download } from "lucide-react"

export default function PresupuestosRealesPage() {
  const supabase = createClient()
  
  // Vistas: 'lista' | 'editor' | 'explosion'
  const [view, setView] = useState<'lista' | 'editor' | 'explosion'>('lista')
  
  // Estado lista de Presupuestos
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [loadingPresupuestos, setLoadingPresupuestos] = useState(true)
  const [searchPresupuesto, setSearchPresupuesto] = useState("")

  // Estado Modal Nuevo Presupuesto
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newPresupuestoData, setNewPresupuestoData] = useState({
    nombre_proyecto: '',
    porcentaje_admin: 10.0,
    porcentaje_imprevistos: 5.0,
    porcentaje_utilidad: 10.0
  })

  // Estado del Editor de Presupuesto
  const [currentPresupuesto, setCurrentPresupuesto] = useState<any>(null)
  const [presupuestoRubros, setPresupuestoRubros] = useState<any[]>([])
  const [loadingRubros, setLoadingRubros] = useState(false)

  // Buscador de Rubros para agregar al presupuesto
  const [allRubros, setAllRubros] = useState<any[]>([])
  const [searchRubroTerm, setSearchRubroTerm] = useState("")
  const [isAddRubroModalOpen, setIsAddRubroModalOpen] = useState(false)

  // Estado de Explosión de Insumos
  const [explosionData, setExplosionData] = useState<any[]>([])
  const [loadingExplosion, setLoadingExplosion] = useState(false)

  useEffect(() => {
    fetchPresupuestos()
  }, [])

  // --- LOGICA DE LISTA ---
  const fetchPresupuestos = async () => {
    setLoadingPresupuestos(true)
    const { data, error } = await supabase.from('presupuestos_reales').select('*').order('created_at', { ascending: false })
    if (!error) setPresupuestos(data || [])
    setLoadingPresupuestos(false)
  }

  const handleCreatePresupuesto = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('presupuestos_reales').insert([newPresupuestoData]).select().single()
    if (!error) {
      setIsNewModalOpen(false)
      fetchPresupuestos()
      openEditor(data)
    }
  }

  const handleDeletePresupuesto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este presupuesto?")) return
    await supabase.from('presupuestos_reales').delete().eq('id', id)
    fetchPresupuestos()
  }

  // --- LOGICA DEL EDITOR ---
  const openEditor = async (presupuesto: any) => {
    setCurrentPresupuesto(presupuesto)
    setView('editor')
    fetchPresupuestoRubros(presupuesto.id)
    
    // Cargar catálogo maestro de rubros
    if (allRubros.length === 0) {
      const { data } = await supabase.from('rubros').select('*').order('categoria', { ascending: true })
      if (data) setAllRubros(data)
    }
  }

  const fetchPresupuestoRubros = async (presupuesto_id: string) => {
    setLoadingRubros(true)
    const { data, error } = await supabase
      .from('presupuesto_rubros')
      .select('*')
      .eq('presupuesto_id', presupuesto_id)
      .order('created_at', { ascending: true })
    
    if (!error) setPresupuestoRubros(data || [])
    setLoadingRubros(false)
  }

  const handleAddRubroToPresupuesto = async (rubro: any) => {
    const defaultCantidad = 1;
    const subtotal = rubro.total_costo_directo * defaultCantidad;
    
    const { error } = await supabase.from('presupuesto_rubros').insert([{
      presupuesto_id: currentPresupuesto.id,
      rubro_id: rubro.id,
      codigo_rubro: rubro.codigo,
      nombre_rubro: rubro.nombre,
      unidad: rubro.unidad,
      precio_unitario_snapshot: rubro.total_costo_directo,
      cantidad_obra: defaultCantidad,
      subtotal: subtotal
    }])
    if (!error) {
      setIsAddRubroModalOpen(false)
      setSearchRubroTerm("")
      fetchPresupuestoRubros(currentPresupuesto.id)
    }
  }

  const handleUpdateCantidadObra = async (item_id: string, nuevaCantidad: number, precioUnitario: number) => {
    const nuevoSubtotal = nuevaCantidad * precioUnitario
    await supabase.from('presupuesto_rubros').update({ 
      cantidad_obra: nuevaCantidad,
      subtotal: nuevoSubtotal
    }).eq('id', item_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
  }

  const handleRemoveRubro = async (item_id: string) => {
    await supabase.from('presupuesto_rubros').delete().eq('id', item_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
  }

  // Cálculos AIU
  const calcTotales = () => {
    const costoDirectoTotal = presupuestoRubros.reduce((acc, curr) => acc + Number(curr.subtotal), 0)
    
    const a = costoDirectoTotal * ((currentPresupuesto?.porcentaje_admin || 0) / 100)
    const i = costoDirectoTotal * ((currentPresupuesto?.porcentaje_imprevistos || 0) / 100)
    const u = costoDirectoTotal * ((currentPresupuesto?.porcentaje_utilidad || 0) / 100)
    
    const granTotal = costoDirectoTotal + a + i + u
    
    return { costoDirectoTotal, a, i, u, granTotal }
  }

  const savePresupuesto = async () => {
    const { costoDirectoTotal, granTotal } = calcTotales()
    await supabase.from('presupuestos_reales').update({ 
      costo_directo_total: costoDirectoTotal,
      gran_total: granTotal,
      porcentaje_admin: currentPresupuesto.porcentaje_admin,
      porcentaje_imprevistos: currentPresupuesto.porcentaje_imprevistos,
      porcentaje_utilidad: currentPresupuesto.porcentaje_utilidad
    }).eq('id', currentPresupuesto.id)
    alert("Presupuesto guardado correctamente")
    fetchPresupuestos()
  }

  // --- LOGICA EXPLOSION DE INSUMOS ---
  const generateExplosion = async () => {
    setLoadingExplosion(true)
    setView('explosion')
    
    // 1. Obtener los Rubros de este presupuesto y sus cantidades
    const { data: presRubros } = await supabase.from('presupuesto_rubros').select('rubro_id, cantidad_obra').eq('presupuesto_id', currentPresupuesto.id)
    
    if (!presRubros || presRubros.length === 0) {
      setExplosionData([])
      setLoadingExplosion(false)
      return
    }

    const rubroIds = presRubros.map(pr => pr.rubro_id)

    // 2. Obtener todas las recetas de esos rubros
    const { data: recetas } = await supabase
      .from('rubro_insumos')
      .select('rubro_id, cantidad, insumo:insumos(id, codigo, nombre, unidad, tipo, costo)')
      .in('rubro_id', rubroIds)

    // 3. Consolidar matemáticamente
    const consolidado: Record<string, any> = {}
    
    if (recetas) {
      recetas.forEach((recetaItem: any) => {
        if (!recetaItem.insumo) return
        
        const pr = presRubros.find(p => p.rubro_id === recetaItem.rubro_id)
        if (!pr) return

        // cantidad de obra (ej. 50 m2) * cantidad en receta (ej. 0.5 sacos/m2)
        const cantidadTotalRequerida = Number(pr.cantidad_obra) * Number(recetaItem.cantidad)
        const costoTotal = cantidadTotalRequerida * Number(recetaItem.insumo.costo)

        const insId = recetaItem.insumo.id
        if (!consolidado[insId]) {
          consolidado[insId] = {
            ...recetaItem.insumo,
            cantidad_total: 0,
            costo_total: 0
          }
        }
        
        consolidado[insId].cantidad_total += cantidadTotalRequerida
        consolidado[insId].costo_total += costoTotal
      })
    }

    // Convertir objeto a array ordenado por Tipo y luego por Nombre
    const explosionArray = Object.values(consolidado).sort((a: any, b: any) => {
      if (a.tipo < b.tipo) return -1;
      if (a.tipo > b.tipo) return 1;
      return a.nombre.localeCompare(b.nombre);
    })

    setExplosionData(explosionArray)
    setLoadingExplosion(false)
  }

  // Renderers
  const filteredPresupuestos = presupuestos.filter(p => p.nombre_proyecto.toLowerCase().includes(searchPresupuesto.toLowerCase()))
  
  const filteredRubrosSearch = allRubros.filter(r => 
    r.nombre.toLowerCase().includes(searchRubroTerm.toLowerCase()) || 
    r.codigo.toLowerCase().includes(searchRubroTerm.toLowerCase())
  ).slice(0, 15)

  if (view === 'explosion') {
    let totMateriales = explosionData.filter(i => i.tipo === 'material').reduce((acc, curr) => acc + curr.costo_total, 0)
    let totMO = explosionData.filter(i => i.tipo === 'mano_obra').reduce((acc, curr) => acc + curr.costo_total, 0)
    let totEq = explosionData.filter(i => i.tipo === 'equipo').reduce((acc, curr) => acc + curr.costo_total, 0)

    return (
      <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('editor')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
              <Download className="text-brand-sage" /> Explosión de Insumos
            </h1>
            <p className="text-gray-500 text-sm">Proyecto: <strong>{currentPresupuesto.nombre_proyecto}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Materiales</p>
            <p className="text-xl font-black text-blue-600">${totMateriales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Mano Obra</p>
            <p className="text-xl font-black text-orange-600">${totMO.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Equipos</p>
            <p className="text-xl font-black text-purple-600">${totEq.toFixed(2)}</p>
          </div>
          <div className="bg-brand-dark p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-brand-sage text-xs font-bold uppercase mb-1">Costo Directo</p>
            <p className="text-xl font-black text-white">${(totMateriales + totMO + totEq).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Insumo</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3 text-center">Unidad</th>
                  <th className="px-4 py-3 text-right text-brand-dark">CANTIDAD TOTAL</th>
                  <th className="px-4 py-3 text-right">Costo Unitario</th>
                  <th className="px-4 py-3 text-right text-brand-dark">COSTO TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingExplosion ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Calculando explosión...</td></tr>
                ) : (
                  explosionData.map((ins, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{ins.codigo}</td>
                      <td className="px-4 py-2 font-medium text-gray-800">{ins.nombre}</td>
                      <td className="px-4 py-2 text-center text-xs">
                        <span className={`px-2 py-1 rounded ${ins.tipo === 'material' ? 'bg-blue-50 text-blue-600' : ins.tipo === 'mano_obra' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                          {ins.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-xs font-bold text-gray-500">{ins.unidad}</td>
                      <td className="px-4 py-2 text-right font-black text-brand-sage bg-brand-sage/5">
                        {Number(ins.cantidad_total).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-500">${Number(ins.costo).toFixed(4)}</td>
                      <td className="px-4 py-2 text-right font-bold text-gray-800">${Number(ins.costo_total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'editor' && currentPresupuesto) {
    const { costoDirectoTotal, a, i, u, granTotal } = calcTotales()
    
    return (
      <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('lista')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2">
              <FileText className="text-brand-sage" /> {currentPresupuesto.nombre_proyecto}
            </h1>
            <p className="text-gray-500 text-sm">Creación de Presupuesto Real (Cantidades de Obra)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Izquierda: Rubros del Presupuesto */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Rubros del Proyecto</h2>
              <button onClick={() => setIsAddRubroModalOpen(true)} className="bg-brand-sage text-white text-sm font-bold py-1.5 px-4 rounded hover:bg-brand-dark transition-colors flex items-center gap-2">
                <Plus size={16} /> Agregar Rubro
              </button>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-bold uppercase text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Rubro</th>
                    <th className="px-4 py-3 text-center">Unidad</th>
                    <th className="px-4 py-3 text-right">Cant. Obra</th>
                    <th className="px-4 py-3 text-right">Precio Unitario</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingRubros ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Cargando...</td></tr>
                  ) : presupuestoRubros.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 m-4 rounded-xl">No hay rubros en el presupuesto.</td></tr>
                  ) : (
                    presupuestoRubros.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs text-brand-sage font-bold">{item.codigo_rubro}</td>
                        <td className="px-4 py-2 font-medium text-gray-800 text-xs max-w-[250px] truncate" title={item.nombre_rubro}>{item.nombre_rubro}</td>
                        <td className="px-4 py-2 text-center text-xs text-gray-500 font-bold">{item.unidad}</td>
                        <td className="px-4 py-2 text-right">
                          <input 
                            type="number" step="0.01" min="0" 
                            value={item.cantidad_obra}
                            onChange={(e) => handleUpdateCantidadObra(item.id, parseFloat(e.target.value) || 0, item.precio_unitario_snapshot)}
                            className="w-24 text-right border rounded px-2 py-1 focus:border-brand-sage focus:ring-1 outline-none font-bold text-brand-dark"
                          />
                        </td>
                        <td className="px-4 py-2 text-right text-xs text-gray-500">${Number(item.precio_unitario_snapshot).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-bold text-gray-800">${Number(item.subtotal).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => handleRemoveRubro(item.id)} className="text-gray-300 hover:text-red-500">
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Derecha: AIU y Totales */}
          <div className="bg-brand-dark rounded-xl shadow-lg p-6 text-white h-fit sticky top-6 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-brand-sage border-b border-white/10 pb-2">Resumen Económico</h2>
              <div className="flex justify-between items-end mb-4">
                <span className="text-gray-400 text-sm">Costo Directo</span>
                <span className="text-xl font-medium">${costoDirectoTotal.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cálculo A.I.U.</h3>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm w-28">Admin (A)</span>
                  <input type="number" value={currentPresupuesto.porcentaje_admin} onChange={(e) => setCurrentPresupuesto({...currentPresupuesto, porcentaje_admin: parseFloat(e.target.value)||0})} className="w-16 bg-white/10 border-none text-right px-2 py-1 rounded text-sm outline-none focus:ring-1 focus:ring-brand-sage" />
                  <span className="text-sm font-mono text-gray-300 w-24 text-right">${a.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm w-28">Imprevistos (I)</span>
                  <input type="number" value={currentPresupuesto.porcentaje_imprevistos} onChange={(e) => setCurrentPresupuesto({...currentPresupuesto, porcentaje_imprevistos: parseFloat(e.target.value)||0})} className="w-16 bg-white/10 border-none text-right px-2 py-1 rounded text-sm outline-none focus:ring-1 focus:ring-brand-sage" />
                  <span className="text-sm font-mono text-gray-300 w-24 text-right">${i.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm w-28">Utilidad (U)</span>
                  <input type="number" value={currentPresupuesto.porcentaje_utilidad} onChange={(e) => setCurrentPresupuesto({...currentPresupuesto, porcentaje_utilidad: parseFloat(e.target.value)||0})} className="w-16 bg-white/10 border-none text-right px-2 py-1 rounded text-sm outline-none focus:ring-1 focus:ring-brand-sage" />
                  <span className="text-sm font-mono text-gray-300 w-24 text-right">${u.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between items-end">
                <span className="text-gray-300 font-medium text-lg">Gran Total</span>
                <span className="text-3xl font-black text-brand-sage">${granTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={savePresupuesto} className="w-full bg-brand-sage text-brand-dark font-black py-3 rounded-lg hover:bg-white transition-colors flex justify-center items-center gap-2">
                <Save size={18} /> GUARDAR PRESUPUESTO
              </button>
              <button onClick={generateExplosion} className="w-full bg-transparent border border-brand-sage text-brand-sage font-bold py-3 rounded-lg hover:bg-brand-sage/10 transition-colors flex justify-center items-center gap-2">
                <Calculator size={18} /> EXPLOSIÓN DE INSUMOS
              </button>
            </div>
          </div>
        </div>

        {/* Modal Buscar Rubro */}
        {isAddRubroModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 shrink-0">
                <Search className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Buscar rubro por código o nombre..." 
                  value={searchRubroTerm}
                  onChange={(e) => setSearchRubroTerm(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-lg text-gray-800 placeholder:text-gray-400"
                />
                <button onClick={() => setIsAddRubroModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              
              <div className="overflow-y-auto p-2 grow">
                {searchRubroTerm.length < 2 ? (
                  <div className="text-center py-12 text-gray-400">Escribe al menos 2 letras para buscar un Rubro.</div>
                ) : filteredRubrosSearch.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No hay rubros que coincidan.</div>
                ) : (
                  <div className="space-y-1">
                    {filteredRubrosSearch.map(rubro => (
                      <div key={rubro.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-lg transition-colors cursor-pointer" onClick={() => handleAddRubroToPresupuesto(rubro)}>
                        <div className="flex gap-3 items-center">
                          <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                            <Calculator size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-800">{rubro.nombre}</div>
                            <div className="text-xs text-gray-500 font-mono text-brand-sage font-bold">{rubro.codigo} • {rubro.categoria}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-sm text-brand-dark">${Number(rubro.total_costo_directo).toFixed(2)}</div>
                            <div className="text-xs text-gray-400">por {rubro.unidad}</div>
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

  // Render Lista de Presupuestos
  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Presupuestos APU Reales</h1>
          <p className="text-gray-500 mt-2">Crea presupuestos detallados por rubros, cantidades de obra y costos indirectos (AIU).</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-brand-sage text-white font-bold py-2.5 px-6 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Buscar proyecto..." 
              value={searchPresupuesto}
              onChange={(e) => setSearchPresupuesto(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage shadow-sm bg-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Costo Directo</th>
                <th className="px-6 py-4 text-right">Gran Total</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingPresupuestos ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : filteredPresupuestos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No hay presupuestos.</td></tr>
              ) : (
                filteredPresupuestos.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-sage/5 transition-colors group cursor-pointer" onClick={() => openEditor(p)}>
                    <td className="px-6 py-3 font-bold text-brand-dark">{p.nombre_proyecto}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs uppercase font-bold">{p.estado}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-500">
                      ${Number(p.costo_directo_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-3 text-right font-black text-brand-sage">
                      ${Number(p.gran_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-brand-sage hover:text-brand-dark font-bold text-xs bg-brand-sage/10 px-3 py-1.5 rounded transition-colors">
                          Editar / Ver
                        </button>
                        <button onClick={(e) => handleDeletePresupuesto(p.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
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

      {/* Modal Nuevo Presupuesto */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Nuevo Presupuesto</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreatePresupuesto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre del Proyecto</label>
                <input type="text" value={newPresupuestoData.nombre_proyecto} onChange={e => setNewPresupuestoData({...newPresupuestoData, nombre_proyecto: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" required />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ADMIN (%)</label>
                  <input type="number" value={newPresupuestoData.porcentaje_admin} onChange={e => setNewPresupuestoData({...newPresupuestoData, porcentaje_admin: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">IMPREV (%)</label>
                  <input type="number" value={newPresupuestoData.porcentaje_imprevistos} onChange={e => setNewPresupuestoData({...newPresupuestoData, porcentaje_imprevistos: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">UTILIDAD (%)</label>
                  <input type="number" value={newPresupuestoData.porcentaje_utilidad} onChange={e => setNewPresupuestoData({...newPresupuestoData, porcentaje_utilidad: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors">Crear Presupuesto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
