// @ts-nocheck
"use client"
import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Calendar, Search, Trash2, X, ArrowLeft, Save, Calculator, FileText, Download, Box, Users, Wrench, Hammer, Tag, Printer, Edit3, ChevronDown, ChevronRight, Lock, CheckCircle2, Loader2, List } from "lucide-react"
import GanttModal from "@/components/admin/presupuestos/GanttModal"
import { generatePresupuestoGeneralPDF, generateAPUsPDF, generateExplosionPDF } from "@/lib/pdfGenerator"
import autoTable from "jspdf-autotable"
import { membreteBase64 } from "@/lib/membreteBase64"

export default function PresupuestosRealesPage() {
  const supabase = createClient()
  
  const [view, setView] = useState('lista')
  const [indForm, setIndForm] = useState({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 })
  const [openGroup, setOpenGroup] = useState({ 1: false, 2: false, 3: true, 4: true, 5: true, 6: true })
  const [activeTab, setActiveTab] = useState('detalle')
  const [presupuestos, setPresupuestos] = useState([])
  const [searchPresupuesto, setSearchPresupuesto] = useState("")

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [newPresupuestoData, setNewPresupuestoData] = useState({
    nombre_proyecto: '',
    porcentaje_admin: 10.0,
    porcentaje_imprevistos: 5.0,
    porcentaje_utilidad: 10.0,
    estado: 'Borrador'
  })

  const [currentPresupuesto, setCurrentPresupuesto] = useState(null)
  const [presupuestoRubros, setPresupuestoRubros] = useState([])
  const [rubrosRecipes, setRubrosRecipes] = useState({}) // { pres_rubro_id: [] }
  const [expandedRubros, setExpandedRubros] = useState({}) // { pres_rubro_id: boolean }

  const [allRubros, setAllRubros] = useState([])
  const [searchRubroTerm, setSearchRubroTerm] = useState("")
  const [isAddRubroModalOpen, setIsAddRubroModalOpen] = useState(false)
  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false)


  const [allInsumos, setAllInsumos] = useState([]);
  const [insumoSearch, setInsumoSearch] = useState("");
  const [searchingInsumos, setSearchingInsumos] = useState(false);

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
        .ilike('nombre', `%${insumoSearch}%`)
        .limit(30);
      if (data) setAllInsumos(data);
      setSearchingInsumos(false);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [insumoSearch]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [currentRecipeRubro, setCurrentRecipeRubro] = useState(null)

  const [explosionData, setExplosionData] = useState([])
  const [loadingExplosion, setLoadingExplosion] = useState(false)

  const [proyectosCRM, setProyectosCRM] = useState([])
  const [userRole, setUserRole] = useState('admin')

  useEffect(() => {
    fetchPresupuestos()
    fetchProyectosCRM()
  }, [])

  const fetchProyectosCRM = async () => {
    const { data } = await supabase.from('proyectos').select('id, nombre, cliente:clientes(nombre, apellido)').order('created_at', { ascending: false })
    if (data) setProyectosCRM(data)
  }

  const fetchPresupuestos = async () => {
    const { data } = await supabase.from('presupuestos_reales').select('*').order('created_at', { ascending: false })
    if (data) setPresupuestos(data)
  }

  const handleCreatePresupuesto = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.from('presupuestos_reales').insert([newPresupuestoData]).select().single()
    if (!error) {
      setIsNewModalOpen(false)
      fetchPresupuestos()
      openEditor(data)
    }
  }

  const handleDeletePresupuesto = async (id, e) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este presupuesto?")) return
    await supabase.from('presupuestos_reales').delete().eq('id', id)
    fetchPresupuestos()
  }

  const handleSaveIndirectos = async () => {
    const { error } = await supabase.from('presupuestos_reales').update({
      indirectos_config: indForm
    }).eq('id', currentPresupuesto.id)
    if(!error) {
      setCurrentPresupuesto({...currentPresupuesto, porcentaje_admin: indForm.admin, porcentaje_imprevistos: indForm.imprevistos, porcentaje_utilidad: indForm.utilidad})
      fetchPresupuestos()
      alert("Costos Indirectos guardados correctamente")
    }
  }

  const handleMarcarEntregado = async () => {
    if (!confirm("¿Marcar como ENTREGADO? Ya no podrás editarlo.")) return
    await supabase.from('presupuestos_reales').update({ estado: 'Entregado' }).eq('id', currentPresupuesto.id)
    setCurrentPresupuesto({...currentPresupuesto, estado: 'Entregado'})
    fetchPresupuestos()
  }

  const openEditor = async (presupuesto) => {
    setCurrentPresupuesto(presupuesto)
    setIndForm(presupuesto.indirectos_config || { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 })
    setActiveTab('detalle')
    setIndForm(presupuesto.indirectos_config || { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 })
    setActiveTab('detalle')
    setView('editor')
    fetchPresupuestoRubros(presupuesto.id)
    
    if (allRubros.length === 0) {
      const { data } = await supabase.from('rubros').select('*').order('categoria', { ascending: true })
      if (data) setAllRubros(data)
    }
    
  }

  const fetchPresupuestoRubros = async (presupuesto_id) => {
    const { data } = await supabase.from('presupuesto_rubros').select('*').eq('presupuesto_id', presupuesto_id).order('created_at', { ascending: true })
    if (data) {
      setPresupuestoRubros(data)
      // Fetch all recipes for these rubros to have them ready for the accordion
      if (data.length > 0) {
        const { data: recipes } = await supabase.from('presupuesto_rubro_insumos')
          .select('id, presupuesto_rubro_id, cantidad, precio_sin_iva_snapshot, insumo:insumos(nombre, tipo, unidad)')
          .in('presupuesto_rubro_id', data.map(d => d.id))
        
        if (recipes) {
          const dict = {}
          recipes.forEach(r => {
            if (!dict[r.presupuesto_rubro_id]) dict[r.presupuesto_rubro_id] = []
            dict[r.presupuesto_rubro_id].push(r)
          })
          setRubrosRecipes(dict)
        }
      } else {
        setRubrosRecipes({})
      }
    }
  }

  const toggleRubro = (id) => {
    setExpandedRubros(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddRubroToPresupuesto = async (rubro) => {
    const defaultCantidad = 1;
    const subtotal = rubro.total_costo_directo * defaultCantidad;
    
    const { data: newPresRubro, error } = await supabase.from('presupuesto_rubros').insert([{
      presupuesto_id: currentPresupuesto.id,
      rubro_id: rubro.id,
      codigo_rubro: rubro.codigo,
      nombre_rubro: rubro.nombre,
      unidad: rubro.unidad,
      precio_unitario_snapshot: rubro.total_costo_directo,
      cantidad_obra: defaultCantidad,
      subtotal: subtotal
    }]).select().single()

    if (error) { alert("Error agregando rubro"); return; }

    const { data: recetaMaestra } = await supabase.from('rubro_insumos').select('insumo_id, cantidad, insumo:insumos(precio_sin_iva)').eq('rubro_id', rubro.id)
    
    if (recetaMaestra && recetaMaestra.length > 0) {
      const clonedRecipe = recetaMaestra.map(rm => {
        const insumoObj = Array.isArray(rm.insumo) ? rm.insumo[0] : rm.insumo;
        return {
          presupuesto_rubro_id: newPresRubro.id,
          insumo_id: rm.insumo_id,
          cantidad: rm.cantidad,
          precio_sin_iva_snapshot: insumoObj ? insumoObj.precio_sin_iva : 0
        }
      });
      await supabase.from('presupuesto_rubro_insumos').insert(clonedRecipe)
    }

    setIsAddRubroModalOpen(false)
    setSearchRubroTerm("")
    fetchPresupuestoRubros(currentPresupuesto.id)
    setExpandedRubros(prev => ({...prev, [newPresRubro.id]: true}))
  }

  
  const renderGroupedInsumos = (insumosList, isEditable) => {
    if (!insumosList || insumosList.length === 0) {
      return <tr><td colSpan={isEditable ? 5 : 4} className="py-4 text-center text-gray-400 italic">No hay insumos.</td></tr>
    }
    
    const grouped = { material: [], mano_de_obra: [], equipo: [], otros: [] };
    insumosList.forEach(r => {
      const type = Array.isArray(r.insumo) ? r.insumo[0]?.tipo : r.insumo?.tipo;
      if (type === 'material') grouped.material.push(r);
      else if (type === 'mano_de_obra') grouped.mano_de_obra.push(r);
      else if (type === 'equipo' || type === 'herramienta_menor') grouped.equipo.push(r);
      else grouped.otros.push(r);
    });

    const renderGroup = (groupName, title, colorClass) => {
      if (grouped[groupName].length === 0) return null;
      return (
        <React.Fragment key={groupName}>
          <tr>
            <td colSpan={isEditable ? 5 : 4} className={`py-1.5 px-2 font-bold text-[11px] uppercase ${colorClass}`}>
              {title}
            </td>
          </tr>
          {grouped[groupName].map(item => {
             const insObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
             const st = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot);
             return (
               <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                 <td className="p-2"><div className="font-medium text-gray-800">{insObj?.nombre}</div><div className="text-[10px] text-gray-400">{insObj?.codigo}</div></td>
                 <td className="p-2 text-right font-mono text-xs">
                   {isEditable ? (
                     <div className="flex justify-end items-center gap-1">
                       <input type="number" step="0.0001" min="0" value={item.cantidad} onChange={(e) => handleUpdateRecipeCantidad(item.id, parseFloat(e.target.value) || 0)} className="w-20 border rounded p-1 text-right font-bold" /> 
                       <span className="w-6 text-left">{insObj?.unidad}</span>
                     </div>
                   ) : (
                     <>{item.cantidad} {insObj?.unidad}</>
                   )}
                 </td>
                 <td className="p-2 text-right text-gray-500">${Number(item.precio_sin_iva_snapshot).toFixed(4)}</td>
                 <td className="p-2 text-right font-bold text-gray-800">${st.toFixed(2)}</td>
                 {isEditable && (
                   <td className="p-2 text-center"><button title="Bloquea el presupuesto e indica que ha sido entregado al cliente final." onClick={() => handleRemoveRecipeInsumo(item.id)} className="text-red-400 hover:text-red-600 p-1"><X size={14}/></button></td>
                 )}
               </tr>
             )
          })}
        </React.Fragment>
      )
    };

    
      const totalSuma = insumosList.reduce((acc, item) => {
         const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
         let sub = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot);
         return acc + sub;
      }, 0);

      return (
        <>
          {renderGroup('material', 'Materiales', 'text-blue-700 bg-blue-50/50')}
          {renderGroup('mano_de_obra', 'Mano de Obra', 'text-orange-700 bg-orange-50/50')}
          {renderGroup('equipo', 'Equipos y Maquinaria', 'text-purple-700 bg-purple-50/50')}
          {renderGroup('otros', 'Otros', 'text-gray-700 bg-gray-50/50')}
          <tr className="border-t-2 border-gray-200 bg-white">
            <td colSpan={isEditable ? 3 : 2} className="p-3 text-right font-black text-gray-700 text-sm uppercase">Costo Directo Total:</td>
            <td className="p-3 text-right font-black text-brand-dark text-sm">${totalSuma.toFixed(2)}</td>
            {isEditable && <td></td>}
          </tr>
        </>
      )
;
  };

  const handleUpdateCantidadObra = async (item_id, nuevaCantidad, precioUnitario) => {
    const nuevoSubtotal = nuevaCantidad * precioUnitario
    await supabase.from('presupuesto_rubros').update({ cantidad_obra: nuevaCantidad, subtotal: nuevoSubtotal }).eq('id', item_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
  }

  const handleRemoveRubro = async (item_id) => {
    await supabase.from('presupuesto_rubros').delete().eq('id', item_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
  }

  const updatePricesFromCatalog = async () => {
    if (!confirm("¿Actualizar precios al catálogo?")) return;
    const { data: insumosCat } = await supabase.from('insumos').select('id, precio_sin_iva');
    if (!insumosCat) return;

    const { data: allRecipeItems } = await supabase.from('presupuesto_rubro_insumos')
      .select('id, insumo_id, presupuesto_rubro_id')
      .in('presupuesto_rubro_id', presupuestoRubros.map(pr => pr.id))
      
    if (allRecipeItems) {
      for (const req of allRecipeItems) {
        const currentInsumo = insumosCat.find(i => i.id === req.insumo_id);
        if (currentInsumo) {
          await supabase.from('presupuesto_rubro_insumos').update({ precio_sin_iva_snapshot: currentInsumo.precio_sin_iva }).eq('id', req.id);
        }
      }
    }
    for (const pr of presupuestoRubros) {
      await recalcAndSaveRubroUnitario(pr.id, pr.cantidad_obra, pr.rubro_id)
    }
    alert("Precios actualizados.");
    fetchPresupuestoRubros(currentPresupuesto.id);
  }

  const openRecipeEditor = async (presRubro) => {
    setCurrentRecipeRubro(presRubro)
    setIsRecipeModalOpen(true)
  }

  const recalcAndSaveRubroUnitario = async (presRubroId, cantObra, rubroMaestroId) => {
    const { data: items } = await supabase.from('presupuesto_rubro_insumos').select('cantidad, precio_sin_iva_snapshot, insumo:insumos(tipo)').eq('presupuesto_rubro_id', presRubroId);
    let nuevoCosto = 0;
    let costoMO = 0;
    if (items) {
      items.forEach(i => {
        const iObj = Array.isArray(i.insumo) ? i.insumo[0] : i.insumo;
        const sub = Number(i.cantidad) * Number(i.precio_sin_iva_snapshot);
        nuevoCosto += sub;
        if (iObj && iObj.tipo === 'mano_de_obra') costoMO += sub;
      });
      const { data: maestro } = await supabase.from('rubros').select('herramienta_menor_pct').eq('id', rubroMaestroId).single()
      if (maestro) nuevoCosto += costoMO * (Number(maestro.herramienta_menor_pct) / 100);
    }
    const nuevoSubtotal = cantObra * nuevoCosto;
    await supabase.from('presupuesto_rubros').update({ precio_unitario_snapshot: nuevoCosto, subtotal: nuevoSubtotal }).eq('id', presRubroId);
  }

  const handleUpdateRecipeCantidad = async (recId, val) => {
    await supabase.from('presupuesto_rubro_insumos').update({ cantidad: val }).eq('id', recId)
    await recalcAndSaveRubroUnitario(currentRecipeRubro.id, currentRecipeRubro.cantidad_obra, currentRecipeRubro.rubro_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
  }

  const handleRemoveRecipeInsumo = async (recId) => {
    await supabase.from('presupuesto_rubro_insumos').delete().eq('id', recId)
    await recalcAndSaveRubroUnitario(currentRecipeRubro.id, currentRecipeRubro.cantidad_obra, currentRecipeRubro.rubro_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
  }

  const handleAddInsumoToRecipe = async (insumo) => {
    await supabase.from('presupuesto_rubro_insumos').insert([{
      presupuesto_rubro_id: currentRecipeRubro.id,
      insumo_id: insumo.id,
      cantidad: 1.0,
      precio_sin_iva_snapshot: insumo.precio_sin_iva
    }])
    await recalcAndSaveRubroUnitario(currentRecipeRubro.id, currentRecipeRubro.cantidad_obra, currentRecipeRubro.rubro_id)
    fetchPresupuestoRubros(currentPresupuesto.id)
    setInsumoSearch("")
  }


  const handleSyncRecipeToMaster = async () => {
    if (!currentRecipeRubro) return;
    const masterRubroId = currentRecipeRubro.rubro_id;
    const recipeItems = rubrosRecipes[currentRecipeRubro.id] || [];
    
    if (confirm("¿Estás seguro de que quieres sobreescribir la receta en el Banco Maestro de Rubros? Esto afectará a futuros presupuestos.")) {
      try {
        const newTotal = recipeItems.reduce((acc, curr) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0);
        
        await supabase.from('rubro_insumos').delete().eq('rubro_id', masterRubroId);
        
        const insertData = recipeItems.map(item => ({
          rubro_id: masterRubroId,
          insumo_id: item.insumo_id,
          cantidad: item.cantidad
        }));
        if(insertData.length > 0) {
          await supabase.from('rubro_insumos').insert(insertData);
        }
        
        await supabase.from('rubros').update({ total_costo_directo: newTotal }).eq('id', masterRubroId);
        
        alert("¡Receta sincronizada exitosamente al Catálogo Maestro!");
      } catch (e) {
        console.error(e);
        alert("Error al sincronizar");
      }
    }
  }

  const calcTotales = () => {
    let smaq = 0;
    let smob = 0;
    let smat = 0;

    presupuestoRubros.forEach(pr => {
      const q = Number(pr.cantidad_obra || 0);
      const items = rubrosRecipes[pr.id] || [];
      items.forEach(item => {
        const ism = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
        if (!ism) return;
        const cost = Number(item.cantidad) * Number(item.precio_sin_iva_snapshot) * q;
        if (ism.tipo === 'material') smat += cost;
        else if (ism.tipo === 'mano_de_obra') smob += cost;
        else if (ism.tipo === 'equipo' || ism.tipo === 'herramienta_menor') smaq += cost;
      });
    });

    const ind = currentPresupuesto?.indirectos_config || { pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 };

    const dmaq1 = smob * ((Number(ind.pmaq1) || 0) / 100);
    const cmaq = smaq + dmaq1;

    const dmob1 = smob * ((Number(ind.pmob1) || 0) / 100);
    const cmob = smob + dmob1;

    const dmat1 = smat * ((Number(ind.pmat1) || 0) / 100);
    const cmat = smat + dmat1;

    const costoDirectoTotal = cmat + cmob + cmaq;

    const sggen = costoDirectoTotal * ((Number(ind.ggen) || 0) / 100);
    const sgas1 = costoDirectoTotal * ((Number(ind.pgas1) || 0) / 100);
    const sgas2 = costoDirectoTotal * ((Number(ind.pgas2) || 0) / 100);
    const sgas3 = costoDirectoTotal * ((Number(ind.pgas3) || 0) / 100);
    const totalGastosGenerales = sggen + sgas1 + sgas2 + sgas3;

    const cnet = costoDirectoTotal + totalGastosGenerales;

    const simp = costoDirectoTotal * ((Number(ind.pimp) || 0) / 100);
    const sutil = costoDirectoTotal * ((Number(ind.util) || 0) / 100);

    const granTotal = cnet + sutil + simp;

    // Resumen variables para UI
    const a = totalGastosGenerales;
    const i = simp;
    const u = sutil;
    return { 
      costoDirectoTotal, a, i, u, granTotal, 
      smaq, smob, smat, 
      dmaq1, dmob1, dmat1, 
      cmaq, cmob, cmat, 
      sggen, sgas1, sgas2, sgas3, 
      totalGastosGenerales, cnet, simp, sutil
    }
  }

  const savePresupuesto = async () => {
    const { costoDirectoTotal, granTotal } = calcTotales()
    await supabase.from('presupuestos_reales').update({ 
      costo_directo_total: costoDirectoTotal,
      gran_total: granTotal,
      indirectos_config: currentPresupuesto.indirectos_config || indForm
    }).eq('id', currentPresupuesto.id)
    alert("Presupuesto guardado correctamente")
    fetchPresupuestos()
  }

  const generateExplosion = async () => {
    setLoadingExplosion(true)
    setView('explosion')
    if (presupuestoRubros.length === 0) { setExplosionData([]); setLoadingExplosion(false); return; }

    const { data: allRecipeItems, error } = await supabase
      .from('presupuesto_rubro_insumos')
      .select('presupuesto_rubro_id, cantidad, precio_sin_iva_snapshot, insumo:insumos(id, codigo, nombre, unidad, tipo)')
      .in('presupuesto_rubro_id', presupuestoRubros.map(pr => pr.id))

    if (error) { alert(error.message); setLoadingExplosion(false); return; }

    const consolidado = {}
    if (allRecipeItems) {
      allRecipeItems.forEach(item => {
        const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
        if (!iObj) return;
        const pr = presupuestoRubros.find(p => p.id === item.presupuesto_rubro_id)
        if (!pr) return
        const cantRequerida = Number(pr.cantidad_obra) * Number(item.cantidad)
        const costoTotal = cantRequerida * Number(item.precio_sin_iva_snapshot || 0)
        const insId = iObj.id
        if (!consolidado[insId]) {
          consolidado[insId] = { ...iObj, costo: item.precio_sin_iva_snapshot || 0, cantidad_total: 0, costo_total: 0 }
        }
        consolidado[insId].cantidad_total += cantRequerida
        consolidado[insId].costo_total += costoTotal
      })
    }
    const explosionArray = Object.values(consolidado).sort((a, b) => {
      if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
    })
    setExplosionData(explosionArray)
    setLoadingExplosion(false)
  }

  
  const generateSchedule = async () => {
    try {
      let needsInit = presupuestoRubros.some(pr => !pr.fecha_inicio);
      if (!needsInit) return;

      let currentDate = new Date();
      currentDate.setHours(0,0,0,0);
      
      const newRubros = [];
      
      for (let i = 0; i < presupuestoRubros.length; i++) {
        const pr = presupuestoRubros[i];
        let totalManHours = 0;
        const insumos = rubrosRecipes[pr.id] || [];
        const mo = insumos.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra');
        mo.forEach(m => {
          totalManHours += Number(m.cantidad || 0) * Number(pr.cantidad_obra || 0);
        });
        
        let dias = Math.max(1, Math.ceil((totalManHours / 24) * 1.2) || 1); 
        
        const updatePayload = {
          fecha_inicio: currentDate.toISOString().split('T')[0],
          duracion_dias: dias
        };
        
        await supabase.from('presupuesto_rubros').update(updatePayload).eq('id', pr.id);
        
        pr.fecha_inicio = updatePayload.fecha_inicio;
        pr.duracion_dias = updatePayload.duracion_dias;
        newRubros.push({...pr});
        
        currentDate.setDate(currentDate.getDate() + dias);
      }
      setPresupuestoRubros(newRubros);
    } catch (err) {
      console.error(err);
      alert("Error generando cronograma: " + err.message);
    }
  };

  const updateTaskSchedule = async (id, fieldOrUpdates, value) => {
    if (typeof fieldOrUpdates === 'object') {
      await supabase.from('presupuesto_rubros').update(fieldOrUpdates).eq('id', id);
    } else {
      await supabase.from('presupuesto_rubros').update({ [fieldOrUpdates]: value }).eq('id', id);
    }
    fetchPresupuestoRubros(currentPresupuesto.id);
  }

  const handleGeneratePresupuestoGeneralPDF = () => {
    generatePresupuestoGeneralPDF({
      currentPresupuesto,
      proyectosCRM,
      totales: calcTotales(),
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
  }

  const handleGenerateAPUsPDF = () => {
    generateAPUsPDF({
      currentPresupuesto,
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
  }

  const handleGenerateExplosionPDF = () => {
    const consolidado = {};
    presupuestoRubros.forEach(pr => {
      const q = Number(pr.cantidad_obra || 0);
      const items = rubrosRecipes[pr.id] || [];
      items.forEach(item => {
        const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
        if (!iObj) return;
        const cantRequerida = q * Number(item.cantidad);
        const costoTotal = cantRequerida * Number(item.precio_sin_iva_snapshot || 0);
        const insId = iObj.id;
        if (!consolidado[insId]) {
          consolidado[insId] = { ...iObj, costo: item.precio_sin_iva_snapshot || 0, cantidad_total: 0, costo_total: 0 };
        }
        consolidado[insId].cantidad_total += cantRequerida;
        consolidado[insId].costo_total += costoTotal;
      });
    });
    const explosionData = Object.values(consolidado).sort((a, b) => {
      if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
    });

    generateExplosionPDF({
      currentPresupuesto,
      explosionData
    });
  }

  }

  const isBorrador = !currentPresupuesto?.estado || currentPresupuesto.estado.toLowerCase() === 'borrador';

  if (false) { // Dead code removed for safety
    let totMateriales = explosionData.filter(i => i.tipo === 'material').reduce((acc, curr) => acc + curr.costo_total, 0)
    let totMO = explosionData.filter(i => i.tipo === 'mano_de_obra').reduce((acc, curr) => acc + curr.costo_total, 0)
    let totEq = explosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor').reduce((acc, curr) => acc + curr.costo_total, 0)
    let totOtros = explosionData.filter(i => i.tipo === 'otros').reduce((acc, curr) => acc + curr.costo_total, 0)

    return (
      <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('editor')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"><ArrowLeft size={20} /></button>
          <div><h1 className="text-2xl font-black text-brand-dark tracking-tight flex items-center gap-2"><Download className="text-brand-sage" /> Explosión de Insumos</h1><p className="text-gray-500 text-sm">Proyecto: <strong>{currentPresupuesto.nombre_proyecto}</strong></p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center"><p className="text-gray-500 text-xs font-bold mb-1">Materiales</p><p className="text-xl font-black text-blue-600">${totMateriales.toFixed(2)}</p></div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center"><p className="text-gray-500 text-xs font-bold mb-1">Mano Obra</p><p className="text-xl font-black text-orange-600">${totMO.toFixed(2)}</p></div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center"><p className="text-gray-500 text-xs font-bold mb-1">Equipos</p><p className="text-xl font-black text-purple-600">${totEq.toFixed(2)}</p></div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center"><p className="text-gray-500 text-xs font-bold mb-1">Otros</p><p className="text-xl font-black text-gray-600">${totOtros.toFixed(2)}</p></div>
          <div className="bg-brand-dark p-4 rounded-xl shadow-sm text-center"><p className="text-brand-sage text-xs font-bold mb-1">Costo Directo</p><p className="text-xl font-black text-white">${(totMateriales + totMO + totEq + totOtros).toFixed(2)}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-sm text-left border-collapse border border-gray-800"><thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]"><tr><th className="px-4 py-3">Cód</th><th className="px-4 py-3">Insumo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Und</th><th className="px-4 py-3 text-right">CANT. TOTAL</th><th className="px-4 py-3 text-right">P.U</th><th className="px-4 py-3 text-right">TOTAL</th></tr></thead><tbody className="divide-y divide-gray-800">
            {explosionData.map((ins, idx) => (
              <tr key={idx} className="hover:bg-gray-50"><td className="px-4 py-2 text-xs">{ins.codigo}</td><td className="px-4 py-2 font-medium">{ins.nombre}</td><td className="px-4 py-2"><span className="px-2 py-1 bg-gray-100 text-xs rounded">{ins.tipo}</span></td><td className="px-4 py-2 text-gray-500">{ins.unidad}</td><td className="px-4 py-2 text-right font-black text-brand-sage">{Number(ins.cantidad_total).toFixed(2)}</td><td className="px-4 py-2 text-right text-gray-500">${Number(ins.costo).toFixed(4)}</td><td className="px-4 py-2 text-right font-bold">${Number(ins.costo_total).toFixed(2)}</td></tr>
            ))}
          </tbody></table>
        </div>
      </div>
    )
  }

  if (view === 'editor' && currentPresupuesto) {
        const { 
          costoDirectoTotal, a, i, u, granTotal, 
          smaq, smob, smat, 
          dmaq1, dmob1, dmat1, 
          cmaq, cmob, cmat, 
          sggen, sgas1, sgas2, sgas3, 
          totalGastosGenerales, cnet, simp, sutil 
        } = calcTotales()
    return (
      <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('lista')} className="p-2 bg-white rounded-lg text-gray-500 shadow-sm border"><ArrowLeft size={20} /></button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2"><FileText className="text-brand-sage" /> {currentPresupuesto.nombre_proyecto}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isBorrador ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800 flex items-center gap-1'}`}>
                  {!isBorrador && <Lock size={12}/>} {currentPresupuesto.estado || 'Borrador'}
                </span>
              </div>
            </div>
          </div>
          {isBorrador && (
            <button onClick={handleMarcarEntregado} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm shadow-sm">
              <CheckCircle2 size={16} /> Marcar como Entregado
            </button>
          )}
        </div>

        {/* TABS HEADER */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('detalle')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'detalle' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <List size={16} className="inline mr-2"/> Detalle de Presupuesto
          </button>
          <button onClick={() => setActiveTab('indirectos')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'indirectos' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Calculator size={16} className="inline mr-2"/> Costos Indirectos
          </button>
          <button onClick={() => setActiveTab('reportes')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reportes' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FileText size={16} className="inline mr-2"/> Reportes
          </button>
          <button onClick={() => setIsGanttModalOpen(true)} className={`px-6 py-3 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-700`}>
            <Calendar size={16} className="inline mr-2"/> Cronograma de Trabajo
          </button>
        </div>

        {activeTab === 'detalle' && (

<div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Rubros del Proyecto</h2>
              <div className="flex gap-2">
                {isBorrador && (
                  <>
                    <button onClick={savePresupuesto} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded flex items-center gap-2 shadow-sm"><Save size={16} /> Guardar</button>
                    <button onClick={updatePricesFromCatalog} className="bg-white border text-gray-600 text-sm font-bold py-1.5 px-4 rounded hover:bg-gray-50 flex items-center gap-2">Actualizar Precios</button>
                    <button onClick={() => setIsAddRubroModalOpen(true)} className="bg-brand-sage text-white text-sm font-bold py-1.5 px-4 rounded hover:bg-brand-dark flex items-center gap-2"><Plus size={16} /> Agregar Rubro</button>
                  </>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-900 font-bold uppercase text-[10px] border-b border-gray-800">
                  <tr>
                    <th className="w-10"></th>
                    <th className="px-4 py-3">Cód</th>
                    <th className="px-4 py-3">Rubro</th>
                    <th className="px-4 py-3 text-center">Unidad</th>
                    <th className="px-4 py-3 text-right">Cant. Obra</th>
                    <th className="px-4 py-3 text-right">P. Unitario</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center">Predecesor</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {presupuestoRubros.map((item) => (
                    <div key={item.id} className="contents">
                    <tr className="hover:bg-gray-50">
                      <td className="px-2 text-center">
                        <button onClick={() => toggleRubro(item.id)} className="p-1 rounded hover:bg-gray-200 text-gray-500">
                          {expandedRubros[item.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-sage font-bold">{item.codigo_rubro}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs cursor-pointer" onClick={() => toggleRubro(item.id)}>{item.nombre_rubro}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold">{item.unidad}</td>
                      <td className="px-4 py-3 text-right">
                        {isBorrador ? (
                          <input type="number" step="0.01" min="0" value={item.cantidad_obra} onChange={(e) => handleUpdateCantidadObra(item.id, parseFloat(e.target.value) || 0, item.precio_unitario_snapshot)} className="w-24 text-right border rounded px-2 py-1 font-bold text-brand-dark" />
                        ) : (
                          <span className="font-bold">{item.cantidad_obra}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">${Number(item.precio_unitario_snapshot).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">${Number(item.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                        {isBorrador && (
                          <>
                            <button onClick={() => openRecipeEditor(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded border border-blue-100" title="Editar Receta de Proyecto"><Edit3 size={16} /></button>
                            <button onClick={() => handleRemoveRubro(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Eliminar"><X size={16} /></button>
                          </>
                        )}
                        {!isBorrador && <span className="text-gray-400 text-xs italic">Solo lectura</span>}
                      </td>
                    </tr>
                    
                    {expandedRubros[item.id] && (
                      <tr className="bg-gray-50/50">
                        <td></td>
                        <td colSpan={7} className="p-0">
                          <div className="p-4 border-l-4 border-brand-sage mx-4 my-2 bg-white shadow-sm rounded-r-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-bold text-gray-500 uppercase">Desglose de Insumos</h4>
                              {isBorrador && (
                                <button onClick={() => openRecipeEditor(item)} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                                  <Edit3 size={12}/> Modificar Insumos
                                </button>
                              )}
                            </div>
                            <table className="w-full text-xs">
                              <thead className="text-gray-400 border-b"><tr><th className="text-left py-1">Insumo</th><th className="text-right">Rendimiento</th><th className="text-right">Costo U.</th><th className="text-right">Subtotal</th></tr></thead>
                              <tbody>
                                {renderGroupedInsumos(rubrosRecipes[item.id], false)}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                    </div>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-4 border-gray-200">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-gray-500 uppercase text-xs font-bold">Costo Directo (Suma Subtotales)</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-gray-800">${costoDirectoTotal.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-gray-500 uppercase text-xs font-bold">Indirectos (AIU)</td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-gray-800">${(totalGastosGenerales + simp + sutil).toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                  <tr className="bg-brand-sage/10">
                    <td colSpan={6} className="px-4 py-3 text-right text-brand-dark uppercase text-xs font-black">Gran Total (Precio Venta)</td>
                    <td className="px-4 py-3 text-right text-xl font-black text-brand-sage">${granTotal.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
        
        )}

        {activeTab === 'indirectos' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-bold bg-white border rounded text-gray-700 shadow-sm">% Porcentajes por defecto</button>
                    <button className="px-4 py-2 text-sm font-bold bg-gray-200 border rounded text-gray-500 hover:bg-gray-300">Sumatoria Formulas por defecto</button>
                    <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="rounded text-brand-sage focus:ring-brand-sage"/> Visualizar frmulas</label>
                  </div>
                  <button onClick={handleSaveIndirectos} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors">
                    <Save size={16} /> Grabar
                  </button>
                </div>

                <div className="w-full text-sm">
                  {/* EQUIPOS */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between">
                    <span>1.- Equipos</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Materiales y Equipos</div>
                      <div className="w-24 text-right pr-4 font-mono">{smaq.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $smaq =</div>
                      <div className="flex-1 text-gray-500">Suma de Materiales y Equipos</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Herramientas Menores % M.O.</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pmaq1</span>
                        <input type="number" step="0.1" value={indForm.pmaq1} onChange={e => setIndForm({...indForm, pmaq1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{dmaq1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $dmaq1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cmob * $pmaq1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Equipos</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{cmaq.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cmaq =</div>
                      <div className="flex-1 font-mono text-gray-500">$smaq + $dmaq1</div>
                    </div>
                  </div>

                  {/* MANO DE OBRA */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>2.- Mano de Obra</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Mano de Obra</div>
                      <div className="w-24 text-right pr-4 font-mono">{smob.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $smob =</div>
                      <div className="flex-1 text-gray-500">Suma de Mano de Obra</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium"></div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pmob1</span>
                        <input type="number" step="0.1" value={indForm.pmob1} onChange={e => setIndForm({...indForm, pmob1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{dmob1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $dmob1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$smob * $pmob1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Mano de Obra</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{cmob.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cmob =</div>
                      <div className="flex-1 font-mono text-gray-500">$smob + $dmob1</div>
                    </div>
                  </div>

                  {/* MATERIALES */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>3.- Materiales</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Materiales</div>
                      <div className="w-24 text-right pr-4 font-mono">{smat.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $smat =</div>
                      <div className="flex-1 text-gray-500">Suma de Materiales</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium"></div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pmat1</span>
                        <input type="number" step="0.1" value={indForm.pmat1} onChange={e => setIndForm({...indForm, pmat1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{dmat1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $dmat1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$smat * $pmat1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Materiales</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{cmat.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cmat =</div>
                      <div className="flex-1 font-mono text-gray-500">$smat + $dmat1</div>
                    </div>
                    <div className="flex p-2 items-center bg-white font-black py-4">
                      <div className="w-1/3 text-right pr-4 text-gray-900">Costo directo</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{costoDirectoTotal.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cdir =</div>
                      <div className="flex-1 font-mono text-gray-500">$cmat + $cmob + $cmaq</div>
                    </div>
                  </div>

                  {/* GASTOS GENERALES Y ADMINISTRATIVOS */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>4.- Gastos generales y administrativos</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Gastos generales = (% de 1+2+3)</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$ggen</span>
                        <input type="number" step="0.1" value={indForm.ggen} onChange={e => setIndForm({...indForm, ggen: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sggen.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sggen =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $ggen / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Gastos de obra</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pgas1</span>
                        <input type="number" step="0.1" value={indForm.pgas1} onChange={e => setIndForm({...indForm, pgas1: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sgas1.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sgas1 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pgas1 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Financiamiento</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pgas2</span>
                        <input type="number" step="0.1" value={indForm.pgas2} onChange={e => setIndForm({...indForm, pgas2: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sgas2.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sgas2 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pgas2 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Polizas y Seguros</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pgas3</span>
                        <input type="number" step="0.1" value={indForm.pgas3} onChange={e => setIndForm({...indForm, pgas3: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sgas3.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sgas3 =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pgas3 / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total gastos generales y administrativos</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{totalGastosGenerales.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">=</div>
                      <div className="flex-1 font-mono text-gray-500">$sggen + $sgas1 + $sgas2 + $sgas3</div>
                    </div>
                    <div className="flex p-2 items-center bg-white font-black py-4">
                      <div className="w-1/3 text-right pr-4 text-gray-900">Costo neto</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{cnet.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cnet =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir + $sggen + $sgas1 + $sgas2 + $sgas3</div>
                    </div>
                  </div>

                  {/* IMPREVISTOS */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>5.- Imprevistos</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Imprevistos = (% de 1+2+3)</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$pimp</span>
                        <input type="number" step="0.1" value={indForm.pimp} onChange={e => setIndForm({...indForm, pimp: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{simp.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $simp =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $pimp / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total de Imprevistos</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{simp.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $cimp =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir + $simp</div>
                    </div>
                  </div>

                  {/* UTILIDAD */}
                  <div className="bg-[#5a9bd4] text-white p-2 font-bold flex justify-between mt-4">
                    <span>6.- Utilidad</span>
                    <span>^</span>
                  </div>
                  <div className="bg-white divide-y border-b">
                    <div className="flex p-2 items-center bg-blue-50/30">
                      <div className="w-1/3 text-left pl-4 font-medium">Utilidad = (% de 1+2+3)</div>
                      <div className="flex items-center w-24">
                        <span className="font-bold mr-2 text-gray-700">$util</span>
                        <input type="number" step="0.1" value={indForm.util} onChange={e => setIndForm({...indForm, util: parseFloat(e.target.value) || 0})} className="w-full border rounded p-1 text-right bg-blue-100" />
                      </div>
                      <div className="w-24 text-right pr-4 font-mono">{sutil.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $sutil =</div>
                      <div className="flex-1 font-mono text-gray-500">$cdir * $util / 100</div>
                    </div>
                    <div className="flex p-2 items-center bg-gray-50 font-bold">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Precio de venta</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono">{pven.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $pven =</div>
                      <div className="flex-1 font-mono text-gray-500">$cnet + $sutil + $simp</div>
                    </div>
                    <div className="flex p-2 items-center bg-white font-black py-4">
                      <div className="w-1/3 text-right pr-4 text-gray-900">Total Precio Unitario</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{pven.toFixed(2)}</div>
                      <div className="w-24 text-center font-mono text-gray-400">= $Stotal =</div>
                      <div className="flex-1 font-mono text-gray-500">$pven</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

        {activeTab === 'explosion' && (() => {
            const consolidado = {};
            presupuestoRubros.forEach(pr => {
              const q = Number(pr.cantidad_obra || 0);
              const items = rubrosRecipes[pr.id] || [];
              items.forEach(item => {
                const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
                if (!iObj) return;
                const cantRequerida = q * Number(item.cantidad);
                const costoTotal = cantRequerida * Number(item.precio_sin_iva_snapshot || 0);
                const insId = iObj.id;
                if (!consolidado[insId]) {
                  consolidado[insId] = { ...iObj, costo: item.precio_sin_iva_snapshot || 0, cantidad_total: 0, costo_total: 0 };
                }
                consolidado[insId].cantidad_total += cantRequerida;
                consolidado[insId].costo_total += costoTotal;
              });
            });
            const memExplosionData = Object.values(consolidado).sort((a, b) => {
              if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
            });
            const totMateriales = memExplosionData.filter(i => i.tipo === 'material').reduce((acc, curr) => acc + curr.costo_total, 0);
            const totMO = memExplosionData.filter(i => i.tipo === 'mano_de_obra').reduce((acc, curr) => acc + curr.costo_total, 0);
            const totEq = memExplosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor').reduce((acc, curr) => acc + curr.costo_total, 0);
            const totOtros = memExplosionData.filter(i => i.tipo === 'otros').reduce((acc, curr) => acc + curr.costo_total, 0);

            return (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border-b bg-gray-50">
                  <div className="p-4 text-center border-r"><p className="text-gray-500 text-xs font-bold mb-1">Materiales</p><p className="text-xl font-black text-blue-600">${totMateriales.toFixed(2)}</p></div>
                  <div className="p-4 text-center border-r"><p className="text-gray-500 text-xs font-bold mb-1">Mano Obra</p><p className="text-xl font-black text-orange-600">${totMO.toFixed(2)}</p></div>
                  <div className="p-4 text-center border-r"><p className="text-gray-500 text-xs font-bold mb-1">Equipos</p><p className="text-xl font-black text-purple-600">${totEq.toFixed(2)}</p></div>
                  <div className="p-4 text-center border-r"><p className="text-gray-500 text-xs font-bold mb-1">Otros</p><p className="text-xl font-black text-gray-600">${totOtros.toFixed(2)}</p></div>
                  <div className="p-4 text-center"><p className="text-gray-800 text-xs font-bold mb-1">Costo Directo</p><p className="text-xl font-black text-brand-sage">${(totMateriales + totMO + totEq + totOtros).toFixed(2)}</p></div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-sm text-left"><thead className="bg-white text-gray-400 font-bold uppercase text-[10px] border-b"><tr><th className="px-4 py-3">Cód</th><th className="px-4 py-3">Insumo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Und</th><th className="px-4 py-3 text-right">CANT. TOTAL</th><th className="px-4 py-3 text-right">P.U</th><th className="px-4 py-3 text-right">TOTAL</th></tr></thead><tbody className="divide-y divide-gray-100">
                    {memExplosionData.map((ins, idx) => (
                      <tr key={idx} className="hover:bg-gray-50"><td className="px-4 py-2 text-xs text-gray-500">{ins.codigo}</td><td className="px-4 py-2 font-medium">{ins.nombre}</td><td className="px-4 py-2"><span className="px-2 py-1 bg-gray-100 text-xs rounded">{ins.tipo}</span></td><td className="px-4 py-2 text-gray-400">{ins.unidad}</td><td className="px-4 py-2 text-right font-black text-brand-sage">{Number(ins.cantidad_total).toFixed(2)}</td><td className="px-4 py-2 text-right text-gray-500">${Number(ins.costo).toFixed(4)}</td><td className="px-4 py-2 text-right font-bold">${Number(ins.costo_total).toFixed(2)}</td></tr>
                    ))}
                    {memExplosionData.length === 0 && <tr><td colSpan="7" className="text-center py-10 text-gray-400">No hay insumos. Verifica que los rubros tengan recetas.</td></tr>}
                  </tbody></table>
                </div>
              </div>
            );
        })()}

{activeTab === 'reportes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full mb-10">
             <table className="w-full text-sm text-left">
              <thead className="bg-[#4b8fb4] text-white font-bold">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                  <th className="px-6 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Presupuesto General</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={handleGeneratePresupuestoGeneralPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mx-auto">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales del presupuesto.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Análisis de Precios Unitarios (APUs)</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={handleGenerateAPUsPDF} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mx-auto">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Análisis de precios unitarios detallado.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-800">Explosión de Insumos (Materiales)</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => {/* Aquí se puede poner un generador a futuro */}} onClick={handleGenerateExplosionPDF} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 mx-auto">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Totales de materiales agrupados en unidades.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}


        {/* Modal Buscar Rubro */}
        {isAddRubroModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 border-b flex gap-4 items-center bg-gray-50"><Search/><input type="text" autoFocus placeholder="Buscar rubro maestro..." value={searchRubroTerm} onChange={(e) => setSearchRubroTerm(e.target.value)} className="w-full bg-transparent outline-none text-lg" /><button onClick={() => setIsAddRubroModalOpen(false)}><X/></button></div>
              <div className="overflow-y-auto p-2 grow">
                {allRubros.filter(r => r.nombre.toLowerCase().includes(searchRubroTerm.toLowerCase()) || r.codigo.toLowerCase().includes(searchRubroTerm.toLowerCase())).slice(0, 15).map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-transparent rounded cursor-pointer" onClick={() => handleAddRubroToPresupuesto(r)}>
                    <div><div className="font-bold">{r.nombre}</div><div className="text-xs text-brand-sage font-mono">{r.codigo}</div></div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] uppercase text-gray-400 font-bold">Costo Ref.</div>
                          <div className="font-black text-brand-dark">${Number(r.total_costo_directo || 0).toFixed(2)}</div>
                        </div>
                        <button className="bg-brand-sage text-white p-2 rounded hover:bg-brand-dark"><Plus size={16}/></button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        
        {/* Modal Cronograma Gantt */}
        <GanttModal 
          isOpen={isGanttModalOpen} 
          onClose={() => setIsGanttModalOpen(false)} 
          presupuestoRubros={presupuestoRubros} 
          updateTaskSchedule={updateTaskSchedule} 
        />
        
        {/* Modal Editar Receta del Proyecto */}
                {isRecipeModalOpen && currentRecipeRubro && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-50 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
              <div className="p-6 border-b bg-white flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-brand-dark flex items-center gap-2">
                    <Edit3 className="text-brand-sage" size={24}/> {currentRecipeRubro.codigo_rubro} - {currentRecipeRubro.nombre_rubro}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Estás modificando la receta (APU) <strong>solo para este proyecto</strong>.</p>
                </div>
                <button onClick={() => { setIsRecipeModalOpen(false); fetchPresupuestoRubros(currentPresupuesto.id); }} className="text-gray-400 hover:text-red-500 p-2"><X size={24}/></button>
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
                          ${rubrosRecipes[currentRecipeRubro.id]?.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'material').reduce((acc, curr) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Mano Obra</span>
                        <span className="font-mono">
                          ${rubrosRecipes[currentRecipeRubro.id]?.filter(r => (Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo === 'mano_de_obra').reduce((acc, curr) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Equipos (+ Herr.)</span>
                        <span className="font-mono">
                          ${rubrosRecipes[currentRecipeRubro.id]?.filter(r => ['equipo', 'herramienta_menor'].includes((Array.isArray(r.insumo) ? r.insumo[0] : r.insumo)?.tipo)).reduce((acc, curr) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-300">Costo Directo<br/>Total</span>
                      <span className="text-3xl font-black text-brand-sage">
                        ${rubrosRecipes[currentRecipeRubro.id]?.reduce((acc, curr) => acc + (curr.cantidad * curr.precio_sin_iva_snapshot), 0).toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                    <button 
                      onClick={handleSyncRecipeToMaster}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                      <Save size={18} /> Sincronizar al Banco Maestro
                    </button>

                  {/* Búsqueda Card */}
                  {userRole === 'admin' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 shrink-0 flex flex-col h-96">
                    <h4 className="font-bold mb-4 text-brand-dark">Agregar Insumo a la Receta</h4>
                    <input type="text" placeholder="Buscar catálogo maestro..." value={insumoSearch} onChange={e => setInsumoSearch(e.target.value)} className="w-full border p-2 rounded mb-4 shadow-sm" />
                    <div className="space-y-2 relative grow overflow-y-auto">
                        {searchingInsumos && <div className="absolute inset-0 bg-white/80 flex justify-center pt-4 z-10"><Loader2 className="animate-spin text-brand-sage" /></div>}
                        {allInsumos.map(ins => (
                          <div key={ins.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex justify-between items-center shadow-sm hover:border-brand-sage transition-colors">
                            <div>
                              <div className="font-bold text-gray-800 leading-tight">{ins.nombre}</div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">{ins.codigo}</div>
                              <div className="text-xs text-brand-dark font-medium mt-1">${Number(ins.precio_sin_iva).toFixed(4)} / {ins.unidad}</div>
                            </div>
                            <button onClick={() => handleAddInsumoToRecipe(ins)} className="bg-brand-sage text-white p-2 rounded transition-colors hover:bg-brand-dark shadow-sm"><Plus size={16}/></button>
                          </div>
                        ))}
                        {allInsumos.length === 0 && insumoSearch.length >= 2 && !searchingInsumos && (
                          <div className="text-center py-4 text-gray-400 text-sm">No se encontraron insumos.</div>
                        )}
                      </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

    return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-black text-brand-dark">Presupuestos APU Reales</h1><p className="text-gray-500">Crea presupuestos detallados por rubros, cantidades de obra y costos indirectos (AIU).</p></div>
        {userRole === 'admin' && <button onClick={() => setIsNewModalOpen(true)} className="bg-brand-sage text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2"><Plus size={20} /> Nuevo Presupuesto</button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b bg-gray-50/50"><input type="text" placeholder="Buscar proyecto..." value={searchPresupuesto} onChange={(e) => setSearchPresupuesto(e.target.value)} className="w-full max-w-md px-4 py-2 border rounded-lg" /></div>
        <table className="w-full text-sm text-left"><thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b"><tr><th className="px-6 py-4">Proyecto</th><th className="px-6 py-4">Fecha</th><th className="px-6 py-4 text-center">Estado</th><th className="px-6 py-4 text-right">Costo Directo</th><th className="px-6 py-4 text-right">Gran Total</th><th className="px-6 py-4 text-center">Acciones</th></tr></thead><tbody className="divide-y divide-gray-50">
          {presupuestos.filter(p => p.nombre_proyecto.toLowerCase().includes(searchPresupuesto.toLowerCase())).map((p) => (
            <tr key={p.id} className="hover:bg-brand-sage/5 cursor-pointer" onClick={() => openEditor(p)}>
              <td className="px-6 py-3 font-bold text-brand-dark">{p.nombre_proyecto}</td>
              <td className="px-6 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-3 text-center"><span className={`px-2 py-1 rounded text-xs uppercase font-bold ${p.estado === 'Entregado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.estado || 'Borrador'}</span></td>
              <td className="px-6 py-3 text-right font-medium">${Number(p.costo_directo_total || 0).toFixed(2)}</td>
              <td className="px-6 py-3 text-right font-black text-brand-sage">${Number(p.gran_total || 0).toFixed(2)}</td>
              <td className="px-6 py-3 text-center"><span className="text-brand-sage font-bold mr-2 text-xs">Editar / Ver</span>{userRole === 'admin' && <button onClick={(e) => handleDeletePresupuesto(p.id, e)} className="text-gray-400 hover:text-red-500 p-1.5"><Trash2 size={16}/></button>}</td>
            </tr>
          ))}
        </tbody></table>
      </div>

      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between p-6 border-b"><h3 className="text-xl font-bold">Nuevo Presupuesto</h3><button onClick={() => setIsNewModalOpen(false)}><X/></button></div>
            <form onSubmit={handleCreatePresupuesto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Proyecto</label>
                <select value={newPresupuestoData.nombre_proyecto} onChange={e => setNewPresupuestoData({...newPresupuestoData, nombre_proyecto: e.target.value})} className="w-full border rounded p-2" required>
                  <option value="" disabled>-- Seleccione --</option>
                  {proyectosCRM.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold">ADMIN (%)</label><input type="number" value={newPresupuestoData.porcentaje_admin} onChange={e => setNewPresupuestoData({...newPresupuestoData, porcentaje_admin: parseFloat(e.target.value)})} className="w-full border rounded p-2" /></div>
                <div><label className="block text-xs font-bold">IMPREV (%)</label><input type="number" value={newPresupuestoData.porcentaje_imprevistos} onChange={e => setNewPresupuestoData({...newPresupuestoData, porcentaje_imprevistos: parseFloat(e.target.value)})} className="w-full border rounded p-2" /></div>
                <div><label className="block text-xs font-bold">UTILIDAD (%)</label><input type="number" value={newPresupuestoData.porcentaje_utilidad} onChange={e => setNewPresupuestoData({...newPresupuestoData, porcentaje_utilidad: parseFloat(e.target.value)})} className="w-full border rounded p-2" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setIsNewModalOpen(false)} className="px-5 py-2 font-bold">Cancelar</button><button type="submit" className="px-5 py-2 font-bold bg-brand-dark text-white rounded">Crear</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
