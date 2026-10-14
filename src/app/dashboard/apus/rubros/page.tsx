"use client"
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Trash2, X, Save, Box, PenTool, ChevronLeft, ChevronRight, Minus, Edit3, Wrench, HardHat, Package, Layers, ArrowLeft, ChevronDown, Download, FileSpreadsheet, Loader2, Copy } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { membreteBase64 } from "@/lib/membreteBase64"


type Familia = { id: string, nombre: string, grupo_sugerido: string }
type Subfamilia = { id: string, nombre: string, familia_id: string }

function GruposManager({ familias, subfamilias, setFamilias, setSubfamilias, onBack }: any) {
  const supabase = createClient()
  const [selectedFamilia, setSelectedFamilia] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [newGrupoNombre, setNewGrupoNombre] = useState("")
  const [showGrupoForm, setShowGrupoForm] = useState(false)
  const [newSubNombre, setNewSubNombre] = useState("")
  const [showSubForm, setShowSubForm] = useState(false)
  const subfsPorFamilia = (fid: string) => subfamilias.filter((sf: any) => sf.familia_id === fid)

  const handleAddGrupo = async (e: any) => {
    e.preventDefault(); if (!newGrupoNombre.trim()) return; setSaving(true);
    try {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? `FAM-${crypto.randomUUID()}` : `FAM-${Date.now()}`
      const { data, error } = await supabase.from('familias').insert([{ id, nombre: newGrupoNombre.trim(), grupo_sugerido: 'rubro' }]).select()
      if (!error && data) { 
        setNewGrupoNombre(""); setShowGrupoForm(false); setFamilias([...familias, data[0]]); 
        const sfId = typeof crypto !== 'undefined' && crypto.randomUUID ? `SF-${crypto.randomUUID()}` : `SF-${Date.now()}`
        const { data: sfData } = await supabase.from('subfamilias').insert([{ id: sfId, nombre: 'General', familia_id: id }]).select()
        if (sfData) setSubfamilias((prev: any) => [...prev, sfData[0]]);
      }
    } finally { setSaving(false) }
  }

  const handleDeleteGrupo = async (id: string, nombre: string) => {
    if (!confirm("¿Eliminar " + nombre + "?")) return
    const { error } = await supabase.from('familias').delete().eq('id', id)
    if (!error) { if (selectedFamilia?.id === id) setSelectedFamilia(null); setFamilias(familias.filter((f:any) => f.id !== id)) }
  }

  const handleAddSubgrupo = async (e: any) => {
    e.preventDefault(); if (!selectedFamilia || !newSubNombre.trim()) return; setSaving(true);
    try {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? `SF-${crypto.randomUUID()}` : `SF-${Date.now()}`
      const { data, error } = await supabase.from('subfamilias').insert([{ id, nombre: newSubNombre.trim(), familia_id: selectedFamilia.id }]).select()
      if (!error && data) { setNewSubNombre(""); setShowSubForm(false); setSubfamilias([...subfamilias, data[0]]); }
    } finally { setSaving(false) }
  }

  const handleDeleteSubgrupo = async (id: string, nombre: string) => {
    if (!confirm("¿Eliminar " + nombre + "?")) return
    const { error } = await supabase.from('subfamilias').delete().eq('id', id)
    if (!error) setSubfamilias(subfamilias.filter((sf:any) => sf.id !== id))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white border border-gray-200">
          <ArrowLeft size={16} /> Volver al Catálogo
        </button>
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2"><Layers className="text-brand-sage" /> Gestión de Grupos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organiza los rubros en categorías estructuradas.</p>
        </div>
      </div>
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Grupos</h2></div>
            <button onClick={() => setShowGrupoForm(!showGrupoForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={14} /> Agregar</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {showGrupoForm && (
              <form onSubmit={handleAddGrupo} className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex flex-col gap-2">
                <input type="text" autoFocus value={newGrupoNombre} onChange={e => setNewGrupoNombre(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none" />
                <div className="flex justify-end gap-2 mt-1">
                  <button type="button" onClick={() => setShowGrupoForm(false)} className="px-3 py-1.5 text-xs text-gray-500">Cancelar</button>
                  <button type="submit" className="px-3 py-1.5 text-xs bg-brand-sage text-white rounded">Guardar</button>
                </div>
              </form>
            )}
            {familias.map((f:any) => (
              <div key={f.id} onClick={() => setSelectedFamilia(f)} className={"p-3 rounded-xl border cursor-pointer flex justify-between items-center " + (selectedFamilia?.id === f.id ? 'bg-blue-50 border-blue-200' : 'bg-white')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500"><Layers size={16} /></div>
                  <div><h3 className="font-bold text-sm">{f.nombre}</h3><p className="text-xs text-gray-400">{subfsPorFamilia(f.id).length} subgrupos</p></div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteGrupo(f.id, f.nombre) }} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <div><h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Subgrupos</h2></div>
            {selectedFamilia && <button onClick={() => setShowSubForm(!showSubForm)} className="bg-brand-sage text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={14} /> Agregar</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!selectedFamilia ? (
              <div className="text-gray-400 p-6 text-center">Selecciona un grupo</div>
            ) : (
              <>
                {showSubForm && (
                  <form onSubmit={handleAddSubgrupo} className="bg-emerald-50 p-3 rounded-lg flex flex-col gap-2">
                    <input type="text" autoFocus value={newSubNombre} onChange={e => setNewSubNombre(e.target.value)} className="w-full px-3 py-2 border rounded text-sm outline-none" />
                    <div className="flex justify-end gap-2 mt-1">
                      <button type="button" onClick={() => setShowSubForm(false)} className="px-3 py-1.5 text-xs text-gray-500">Cancelar</button>
                      <button type="submit" className="px-3 py-1.5 text-xs bg-brand-sage text-white rounded">Guardar</button>
                    </div>
                  </form>
                )}
                {subfsPorFamilia(selectedFamilia.id).map((sf:any) => (
                  <div key={sf.id} className="p-2.5 rounded-lg border bg-white flex justify-between items-center">
                    <div className="pl-2 border-l-2 border-brand-sage"><h3 className="font-bold text-xs">{sf.nombre}</h3></div>
                    <button onClick={() => handleDeleteSubgrupo(sf.id, sf.nombre)} className="p-1.5 text-gray-200 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const QuantityInput = ({ item, handleUpdateCantidad }: { item: any, handleUpdateCantidad: any }) => {
  const [val, setVal] = useState(item.cantidad.toString());

  useEffect(() => {
    if (parseFloat(val) !== parseFloat(item.cantidad)) {
      setVal(item.cantidad.toString());
    }
  }, [item.cantidad]);

  const commit = (newVal: string) => {
    const num = parseFloat(newVal);
    if (!isNaN(num)) handleUpdateCantidad(item.id, num);
  };

  const onStep = (dir: number) => {
    const newValStr = Math.max(0, parseFloat((parseFloat(val||'0') + dir * 0.01).toFixed(6))).toString();
    setVal(newValStr);
    commit(newValStr);
  };

  return (
    <div className="flex items-center justify-end gap-0">
      <button onClick={() => onStep(-1)} className="w-7 h-9 flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
        <Minus size={12} />
      </button>
      <input 
        type="text"
        inputMode="decimal"
        value={val}
        onChange={(e) => {
          let v = e.target.value;
          if (v.startsWith('.')) v = '0' + v;
          if (v === '' || /^\d*\.?\d*$/.test(v)) {
            setVal(v);
            commit(v);
          }
        }}
        className="w-28 h-9 text-center border-y border-gray-300 outline-none text-sm font-semibold text-gray-800 focus:border-blue-400 focus:bg-blue-50" 
      />
      <button onClick={() => onStep(1)} className="w-7 h-9 flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-200 text-gray-500 transition-colors">
        <Plus size={12} />
      </button>
    </div>
  );
};

  

const rubroSchema = z.object({
  codigo: z.string().min(2, "Requerido"),
  nombre: z.string().min(3, "Requerido"),
  unidad: z.string().min(1, "Requerido"),
  herramienta_menor_pct: z.number().min(0, "No negativo"),
  subfamilia_id: z.string().optional(),
  familia_id_temp: z.string().optional()
});
type RubroFormValues = z.infer<typeof rubroSchema>;

export default function RubrosPage() {
  const queryClient = useQueryClient();
  const [vista, setVista] = useState("catalogo");
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([]);
  const [expandedFamilias, setExpandedFamilias] = useState<Set<string>>(new Set());
  const [selectedFamilia, setSelectedFamilia] = useState<string | null>(null);
  const [selectedSubfamilia, setSelectedSubfamilia] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const supabase = createClient()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: rubrosData, isLoading: loading } = useQuery({
    queryKey: ['rubros', currentPage, searchTerm, selectedFamilia, selectedSubfamilia],
    queryFn: async () => {
      let query = supabase.from('rubros').select('*', { count: 'exact' });

      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
      }

      if (selectedSubfamilia) {
        query = query.eq('subfamilia_id', selectedSubfamilia);
      } else if (selectedFamilia) {
        const valid = subfamilias.filter((sf:any) => sf.familia_id === selectedFamilia).map((sf:any)=>sf.id);
        if (valid.length > 0) {
          query = query.in('subfamilia_id', valid);
        } else {
          query = query.eq('subfamilia_id', 'none');
        }
      }

      query = query.order('created_at', { ascending: false });

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    }
  });

  const rubros = rubrosData?.data || [];
  const totalItems = rubrosData?.count || 0;
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  
  const createMutation = useMutation({
    mutationFn: async (values: RubroFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { 
        ...values, 
        subfamilia_id: values.subfamilia_id || null,
        user_id: user?.id || null,
        es_maestro: false
      }; 
      delete (payload as any).familia_id_temp;
      const { data, error } = await supabase.from('rubros').insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rubros'] });
      setIsNewModalOpen(false);
      openEditor(data);
      resetNewForm();
    },
    onError: () => {
      alert("Error al crear el rubro. Revisa que el código no esté duplicado.");
    }
  });

  const { register: registerNew, handleSubmit: handleNewSubmit, reset: resetNewForm, formState: { errors: newErrors, isSubmitting: isNewSubmitting }, setValue: setNewValue, watch: watchNew } = useForm<RubroFormValues>({
    resolver: zodResolver(rubroSchema),
    defaultValues: { codigo: '', nombre: '', unidad: 'm3', herramienta_menor_pct: 5.0, subfamilia_id: '', familia_id_temp: '' }
  });

  const submitNewRubro = (data: RubroFormValues) => {
    createMutation.mutate(data);
  };


  const [familiasInsumo, setFamiliasInsumo] = useState<any[]>([])
  const [currentRubro, setCurrentRubro] = useState<any>(null)
  const [rubroInsumos, setRubroInsumos] = useState<any[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  
  const [allInsumos, setAllInsumos] = useState<any[]>([])
  const [searchInsumoTerm, setSearchInsumoTerm] = useState("")
  const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false)
  const [addInsumoCategory, setAddInsumoCategory] = useState<string>('')

  useEffect(() => { fetchRubros(); fetchAllInsumos(); }, [])
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedFamilia, selectedSubfamilia])

  const watchedFamId = watchNew('familia_id_temp');
  useEffect(() => {
    if (watchedFamId && isNewModalOpen) {
      const fam = familias.find((f:any) => f.id === watchedFamId);
      if (fam) {
        let famCode = fam.nombre.substring(0, 3).toUpperCase();
        const validSubs = subfamilias.filter((sf:any) => sf.familia_id === watchedFamId).map((sf:any) => sf.id);
        const rubrosFam = rubros.filter((r:any) => validSubs.includes(r.subfamilia_id));
        
        let maxSeq = 0;
        rubrosFam.forEach((r:any) => {
          if (r.codigo) {
            const parts = r.codigo.split('-');
            if (parts.length > 0) {
               const num = parseInt(parts[parts.length - 1], 10);
               if (!isNaN(num) && num > maxSeq) maxSeq = num;
            }
          }
        });
        const seq = maxSeq > 0 ? maxSeq + 1 : 1;
        const newCode = `${famCode}-${seq.toString().padStart(4, '0')}`;
        
        // Evitamos loop infinito verificando el valor actual
        if (watchNew('codigo') !== newCode) {
          setNewValue('codigo', newCode);
        }
      }
    }
  }, [watchedFamId, isNewModalOpen, familias, subfamilias, rubros, setNewValue, watchNew]);

    const fetchAll = async (table: string, filter?: {col: string, val: string}) => {
      let qCount = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) qCount = qCount.eq(filter.col, filter.val);
      const { count } = await qCount;
      if (!count) return [];

      let allData: any[] = [];
      const step = 1000;
      const reqs = [];
      for (let i = 0; i < count; i += step) {
        let q = supabase.from(table).select('*');
        if (filter) q = q.eq(filter.col, filter.val);
        reqs.push(q.range(i, i + step - 1));
      }
      
      const results = await Promise.all(reqs);
      for (const { data } of results) {
         if (data) allData = allData.concat(data);
      }
      return allData;
    }

  const fetchRubros = async () => {
    const [dFam, dSub, dFamIns] = await Promise.all([
      fetchAll('familias', {col:'grupo_sugerido', val:'rubro'}), fetchAll('subfamilias'), fetchAll('familias')
    ])
    if (dFamIns) setFamiliasInsumo(dFamIns.filter((f:any) => f.grupo_sugerido !== 'rubro').sort((a:any,b:any) => a.nombre.localeCompare(b.nombre)))
    if (dFam) { 
      dFam.sort((a:any,b:any)=>a.nombre.localeCompare(b.nombre)); 
      setFamilias(dFam); 
      setExpandedFamilias(new Set(dFam.map((f:any)=>f.id))) 
    }
    if (dSub) setSubfamilias(dSub.sort((a:any,b:any)=>a.nombre.localeCompare(b.nombre)))
  }

    const fetchAllInsumos = async () => {
    const data = await fetchAll('insumos');
    if (data) {
      data.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      setAllInsumos(data);
    }
  }

  const handleCloneRubro = async (rubro: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Debes iniciar sesión para clonar este rubro.")
      return
    }

    const nuevoCodigo = `${rubro.codigo || 'RUB'}-CLON`
    const { data: nuevoRubro, error: errRubro } = await supabase.from('rubros').insert([{
      codigo: nuevoCodigo,
      nombre: `${rubro.nombre} (Copia Mi Empresa)`,
      unidad: rubro.unidad,
      rendimiento: rubro.rendimiento,
      herramienta_menor_pct: rubro.herramienta_menor_pct,
      total_costo_directo: rubro.total_costo_directo,
      subfamilia_id: rubro.subfamilia_id,
      es_maestro: false,
      user_id: user.id
    }]).select().single()

    if (errRubro || !nuevoRubro) {
      alert("Error al clonar rubro: " + (errRubro?.message || "Desconocido"))
      return
    }

    const { data: recetaItems } = await supabase.from('rubro_insumos').select('insumo_id, cantidad').eq('rubro_id', rubro.id)
    if (recetaItems && recetaItems.length > 0) {
      await supabase.from('rubro_insumos').insert(
        recetaItems.map((it: any) => ({
          rubro_id: nuevoRubro.id,
          insumo_id: it.insumo_id,
          cantidad: it.cantidad
        }))
      )
    }

    queryClient.invalidateQueries({ queryKey: ['rubros'] })
    openEditor(nuevoRubro)
  }

  const handleDeleteRubro = async (id: string, e: React.MouseEvent, esMaestro?: boolean) => {
    e.stopPropagation()
    if (esMaestro) {
      alert("No se pueden eliminar rubros oficiales del catálogo maestro de Grupo SARA.")
      return
    }
    if (!confirm("¿Eliminar este rubro privado? Esto también borrará su receta.")) return
    await supabase.from('rubros').delete().eq('id', id)
    if (currentRubro && currentRubro.id === id) { setCurrentRubro(null); setRubroInsumos([]); setIsEditorOpen(false); }
    queryClient.invalidateQueries({ queryKey: ['rubros'] });
  }

  const openEditor = async (rubro: any) => {
    setCurrentRubro(rubro); setIsEditorOpen(true); fetchRubroInsumos(rubro.id)
  }
  const closeEditor = () => { setIsEditorOpen(false) }

  const fetchRubroInsumos = async (rubro_id: string) => {
    const { data, error } = await supabase.from('rubro_insumos')
      .select('id, cantidad, insumo_id, insumos ( id, codigo, nombre, unidad, tipo, precio_sin_iva, subfamilia_id )')
      .eq('rubro_id', rubro_id).order('id', { ascending: true })
    if (!error) setRubroInsumos(data || [])
  }

  const handleAddInsumoToRubro = async (insumo: any) => {
    const { error } = await supabase.from('rubro_insumos').insert([{ rubro_id: currentRubro.id, insumo_id: insumo.id, cantidad: 1.000 }])
    if (!error) { setIsAddInsumoModalOpen(false); setSearchInsumoTerm(""); fetchRubroInsumos(currentRubro.id); }
  }

  const handleUpdateCantidad = async (item_id: string, nuevaCantidad: number) => {
    await supabase.from('rubro_insumos').update({ cantidad: nuevaCantidad }).eq('id', item_id)
    fetchRubroInsumos(currentRubro.id)
  }

  const stepCantidad = (item_id: string, currentVal: number, direction: number) => {
    const newVal = Math.max(0, parseFloat((currentVal + direction * 0.01).toFixed(6)))
    handleUpdateCantidad(item_id, newVal)
  }

  const handleRemoveInsumo = async (item_id: string) => {
    await supabase.from('rubro_insumos').delete().eq('id', item_id)
    fetchRubroInsumos(currentRubro.id)
  }

  const calcTotalesReceta = () => {
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

  const saveRubro = async () => {
    const { totalCostoDirecto } = calcTotalesReceta()
    const { error } = await supabase.from('rubros').update({ herramienta_menor_pct: currentRubro.herramienta_menor_pct, total_costo_directo: totalCostoDirecto, nombre: currentRubro.nombre, unidad: currentRubro.unidad }).eq('id', currentRubro.id)
    if (!error) {
      // setRubros(rubros.map((r:any) => r.id === currentRubro.id ? {...r, total_costo_directo: totalCostoDirecto, herramienta_menor_pct: currentRubro.herramienta_menor_pct, nombre: currentRubro.nombre, unidad: currentRubro.unidad} : r))
      closeEditor()
    }
  }

  

  const subfsPorFamilia = (fid: string) => subfamilias.filter((sf:any) => sf.familia_id === fid)
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const paginatedRubros = rubros;

  const fetchFilteredForExport = async () => {
    let allData: any[] = [];
    const step = 1000;
    const reqs = [];
    for (let i = 0; i < totalItems; i += step) {
      let query = supabase.from('rubros').select('*');
      if (searchTerm) query = query.or(`nombre.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
      if (selectedSubfamilia) query = query.eq('subfamilia_id', selectedSubfamilia);
      else if (selectedFamilia) {
        const valid = subfamilias.filter((sf:any) => sf.familia_id === selectedFamilia).map((sf:any)=>sf.id);
        if (valid.length > 0) query = query.in('subfamilia_id', valid);
        else query = query.eq('subfamilia_id', 'none');
      }
      query = query.order('created_at', { ascending: false });
      reqs.push(query.range(i, i + step - 1));
    }
    const results = await Promise.all(reqs);
    for (const { data } of results) if (data) allData = allData.concat(data);
    return allData;
  }

  const getPageNumbers = () => {
    const pages = []; const max = 5;
    let s = Math.max(1, currentPage - Math.floor(max / 2));
    let e = Math.min(totalPages, s + max - 1);
    if (e - s + 1 < max) s = Math.max(1, e - max + 1);
    for (let i = s; i <= e; i++) pages.push(i);
    return pages;
  }

  const filteredInsumosSearch = allInsumos.filter((i:any) => {
      if (addInsumoCategory) {
        const validSubfams = subfamilias.filter((sf:any) => sf.familia_id === addInsumoCategory).map((sf:any) => sf.id);
        return validSubfams.includes(i.subfamilia_id);
      }
      return true;
    }).filter(i => i.nombre.toLowerCase().includes(searchInsumoTerm.toLowerCase()) || (i.codigo && i.codigo.toLowerCase().includes(searchInsumoTerm.toLowerCase()))).slice(0, 20)

  const { totalCostoDirecto, herramientaMenor } = currentRubro ? calcTotalesReceta() : { totalCostoDirecto:0, herramientaMenor:0 }

  
const renderInsumoRow = (item: any) => (
    <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      <td className="px-4 py-2.5 font-mono text-xs text-gray-500 font-semibold">{item.insumos.codigo}</td>
      <td className="px-4 py-2.5 font-medium text-gray-800 text-sm">{item.insumos.nombre}</td>
      <td className="px-4 py-2.5 text-center">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{item.insumos.unidad}</span>
      </td>
      <td className="px-4 py-2.5">
          <QuantityInput item={item} handleUpdateCantidad={handleUpdateCantidad} />
        </td>
      <td className="px-4 py-2.5 text-right text-sm text-gray-500">${Number(item.insumos.precio_sin_iva).toFixed(4)}</td>
      <td className="px-4 py-2.5 text-right font-bold text-gray-900 text-sm">${(item.cantidad * item.insumos.precio_sin_iva).toFixed(4)}</td>
      <td className="px-2 py-2.5 text-center">
        <button onClick={() => handleRemoveInsumo(item.id)} className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  )

  if (vista === 'grupos') return (
    <GruposManager familias={familias} subfamilias={subfamilias} setFamilias={setFamilias} setSubfamilias={setSubfamilias} onBack={() => setVista('catalogo')} />
  )

  // Consultar todas las recetas de los rubros filtrados
  const fetchAllRecipesForRubros = async (rubroList: any[]) => {
    if (!rubroList || rubroList.length === 0) return {};
    const ids = rubroList.map(r => r.id);
    let allItems: any[] = [];
    const chunkSize = 50;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('rubro_insumos')
        .select('id, rubro_id, cantidad, insumo_id, insumos ( id, codigo, nombre, unidad, tipo, precio_sin_iva, subfamilia_id )')
        .in('rubro_id', chunk)
        .order('id', { ascending: true });
      if (!error && data) {
        allItems = allItems.concat(data);
      }
    }
    const grouped: Record<string, any[]> = {};
    allItems.forEach(item => {
      if (!grouped[item.rubro_id]) grouped[item.rubro_id] = [];
      grouped[item.rubro_id].push(item);
    });
    return grouped;
  };

  // Exportar Excel: Resumen General + Recetas Detalladas (APU)
  const exportToExcel = async () => {
    if (totalItems === 0) {
      alert("No hay rubros para exportar con los filtros seleccionados.");
      return;
    }
    setIsExporting(true);
    try {
      const dataToExport = await fetchFilteredForExport();
      const recipesMap = await fetchAllRecipesForRubros(dataToExport);

      const nombreGrupo = selectedFamilia 
        ? (familias.find((f:any) => f.id === selectedFamilia)?.nombre || "Grupo Seleccionado")
        : "Todos los Grupos";

      // 1. HOJA DE RESUMEN GENERAL
      const headerResumen = [
        ["SARA CONSTRUCTORA S.A."],
        ["SISTEMA INTEGRADO DE CONTROL OPERATIVO - MÓDULO APU-SARA"],
        ["REPORTE: CATÁLOGO GENERAL DE RUBROS (RESUMEN)"],
        [`Grupo: ${nombreGrupo.toUpperCase()}`],
        [`Fecha y Hora de Emisión: ${new Date().toLocaleString()}`],
        [`Total de Rubros: ${dataToExport.length}`],
        [],
        ["Nº", "CÓDIGO", "NOMBRE DEL RUBRO", "GRUPO", "UNIDAD", "COSTO DIRECTO ($)"]
      ];

      const dataResumen = dataToExport.map((r: any, idx: number) => {
        const sf = subfamilias.find((s: any) => s.id === r.subfamilia_id);
        const fam = sf ? familias.find((f: any) => f.id === sf.familia_id) : null;
        return [
          idx + 1,
          r.codigo || "",
          r.nombre,
          fam ? fam.nombre : "",
          r.unidad,
          Number(r.total_costo_directo || 0)
        ];
      });

      // 2. HOJA DE RECETAS DETALLADAS (APU)
      const dataDetalle: any[][] = [
        ["SARA CONSTRUCTORA S.A."],
        ["ANÁLISIS DE PRECIOS UNITARIOS DETALLADO (RECETAS POR RUBRO)"],
        [`Grupo: ${nombreGrupo.toUpperCase()}`],
        [`Fecha y Hora de Emisión: ${new Date().toLocaleString()}`],
        [`Total de Rubros Analizados: ${dataToExport.length}`],
        []
      ];

      dataToExport.forEach((r: any) => {
        const items = recipesMap[r.id] || [];

        const materiales: any[] = [];
        const manoDeObra: any[] = [];
        const equipos: any[] = [];
        let totManoObra = 0;
        let totBase = 0;

        items.forEach((it: any) => {
          const ins = it.insumos || {};
          const tipo = (ins.tipo || '').toLowerCase();
          const pUnit = Number(ins.precio_sin_iva || 0);
          const cant = Number(it.cantidad || 0);
          const sub = cant * pUnit;
          totBase += sub;

          const rowData = {
            nombre: ins.nombre || "—",
            unidad: ins.unidad || "—",
            cantidad: cant,
            precioUnit: pUnit,
            subtotal: sub
          };

          if (tipo === 'mano_de_obra' || tipo === 'manodeobra' || tipo.includes('mano') || tipo === 'm.o.') {
            manoDeObra.push(rowData);
            totManoObra += sub;
          } else if (tipo === 'equipo' || tipo === 'equipos' || tipo === 'maquinaria' || tipo.includes('equipo')) {
            equipos.push(rowData);
          } else {
            materiales.push(rowData);
          }
        });

        const pctHM = Number(r.herramienta_menor_pct || 0);
        const herramientaMenorVal = totManoObra * (pctHM / 100);
        const costoDirectoCalc = totBase + herramientaMenorVal;
        const costoDirectoFinal = Number(r.total_costo_directo || costoDirectoCalc);

        dataDetalle.push([`Rubro: ${r.codigo || 'S/C'} - ${r.nombre}`]);
        dataDetalle.push([`Unidad: ${r.unidad} | Costo Directo U: $${costoDirectoFinal.toFixed(2)}`]);
        dataDetalle.push(["Insumo", "Unidad", "Cantidad", "Precio Unit.", "Subtotal"]);

        if (items.length === 0) {
          dataDetalle.push(["(Sin insumos asignados en la receta)", "-", "-", "-", "$0.00"]);
        } else {
          // Materiales
          if (materiales.length > 0) {
            dataDetalle.push(["MATERIALES"]);
            materiales.forEach(m => {
              dataDetalle.push([m.nombre, m.unidad, m.cantidad, m.precioUnit, m.subtotal]);
            });
          }
          // Mano de Obra
          if (manoDeObra.length > 0) {
            dataDetalle.push(["MANO DE OBRA"]);
            manoDeObra.forEach(mo => {
              dataDetalle.push([mo.nombre, mo.unidad, mo.cantidad, mo.precioUnit, mo.subtotal]);
            });
          }
          // Equipos y Maquinaria
          if (equipos.length > 0 || pctHM > 0) {
            dataDetalle.push(["EQUIPOS Y MAQUINARIA"]);
            equipos.forEach(eq => {
              dataDetalle.push([eq.nombre, eq.unidad, eq.cantidad, eq.precioUnit, eq.subtotal]);
            });
            if (pctHM > 0) {
              dataDetalle.push([`Herramienta Menor (${pctHM}% de M.O.)`, "%", pctHM, totManoObra, herramientaMenorVal]);
            }
          }
        }
        dataDetalle.push([]); // Espacio entre rubros
      });

      const wb = XLSX.utils.book_new();
      const wsResumen = XLSX.utils.aoa_to_sheet([...headerResumen, ...dataResumen]);
      const wsDetalle = XLSX.utils.aoa_to_sheet(dataDetalle);

      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");
      XLSX.utils.book_append_sheet(wb, wsDetalle, "Recetas Detalladas");

      XLSX.writeFile(wb, `Catalogo_Rubros_y_Recetas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Error al generar el archivo Excel");
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar PDF: Resumen General + Recetas Detalladas (APU)
  const exportToPDF = async () => {
    if (totalItems === 0) {
      alert("No hay rubros para exportar con los filtros seleccionados.");
      return;
    }
    setIsExporting(true);
    try {
      const dataToExport = await fetchFilteredForExport();
      const recipesMap = await fetchAllRecipesForRubros(dataToExport);
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      const nombreGrupo = selectedFamilia 
        ? (familias.find(f => f.id === selectedFamilia)?.nombre || "Grupo Seleccionado")
        : "Todos los Grupos";

      // Membrete Oficial centrado
      doc.addImage(membreteBase64, 'PNG', (pageWidth - 110) / 2, 5, 110, 32);

      // Título Principal
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text("CATÁLOGO DE RUBROS Y ANÁLISIS DE PRECIOS UNITARIOS (APU)", 14, 45);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Filtro / Grupo: ${nombreGrupo} | Emisión: ${new Date().toLocaleString()} | SARA Constructora`, 14, 51);
      doc.text(`Total de Rubros: ${dataToExport.length}`, 14, 56);

      // 1. TABLA RESUMEN GENERAL
      const tableColumn = ["Nº", "Código", "Nombre del Rubro", "Grupo", "Unidad", "Costo Directo ($)"];
      const tableRows = dataToExport.map((r: any, idx: number) => {
        const sf = subfamilias.find((s: any) => s.id === r.subfamilia_id);
        const fam = sf ? familias.find((f: any) => f.id === sf.familia_id) : null;
        return [
          idx + 1,
          r.codigo || "—",
          r.nombre,
          fam ? fam.nombre : "—",
          r.unidad,
          `$${Number(r.total_costo_directo || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 61,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 71, 63] }
      });

      // 2. SECCIÓN DETALLADA: RECETAS POR RUBRO
      doc.addPage();
      let currentY = 15;

      dataToExport.forEach((r: any) => {
        const items = recipesMap[r.id] || [];

        const materiales: any[] = [];
        const manoDeObra: any[] = [];
        const equipos: any[] = [];
        let totManoObra = 0;
        let totBase = 0;

        items.forEach((it: any) => {
          const ins = it.insumos || {};
          const tipo = (ins.tipo || '').toLowerCase();
          const pUnit = Number(ins.precio_sin_iva || 0);
          const cant = Number(it.cantidad || 0);
          const sub = cant * pUnit;
          totBase += sub;

          const rowData = {
            nombre: ins.nombre || "—",
            unidad: ins.unidad || "—",
            cantidad: cant,
            precioUnit: pUnit,
            subtotal: sub
          };

          if (tipo === 'mano_de_obra' || tipo === 'manodeobra' || tipo.includes('mano') || tipo === 'm.o.') {
            manoDeObra.push(rowData);
            totManoObra += sub;
          } else if (tipo === 'equipo' || tipo === 'equipos' || tipo === 'maquinaria' || tipo.includes('equipo')) {
            equipos.push(rowData);
          } else {
            materiales.push(rowData);
          }
        });

        const pctHM = Number(r.herramienta_menor_pct || 0);
        const herramientaMenorVal = totManoObra * (pctHM / 100);
        const costoDirectoCalc = totBase + herramientaMenorVal;
        const costoDirectoFinal = Number(r.total_costo_directo || costoDirectoCalc);

        // Si estamos cerca del final de la página (más de 160mm), creamos nueva página
        if (currentY > 165) {
          doc.addPage();
          currentY = 15;
        }

        // Título del Rubro idéntico a la referencia
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Rubro: ${r.codigo || 'S/C'} - ${r.nombre}`, 14, currentY + 2);

        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 30);
        doc.text(`Unidad: ${r.unidad} | Costo Directo U: $${costoDirectoFinal.toFixed(2)}`, 14, currentY + 7);

        currentY += 10;

        if (items.length === 0) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(140, 140, 140);
          doc.text("Sin insumos asignados en la receta de este rubro.", 16, currentY + 2);
          doc.setTextColor(0, 0, 0);
          currentY += 10;
        } else {
          const recipeCols = ["Insumo", "Unidad", "Cantidad", "Precio Unit.", "Subtotal"];
          const recipeRows: any[] = [];

          // 1. MATERIALES (si existen)
          if (materiales.length > 0) {
            recipeRows.push([
              {
                content: 'MATERIALES',
                colSpan: 5,
                styles: {
                  fillColor: [239, 246, 255], // blue-50
                  textColor: [30, 64, 175],   // blue-800
                  fontStyle: 'bold',
                  fontSize: 8.5
                }
              }
            ]);
            materiales.forEach(m => {
              recipeRows.push([
                m.nombre,
                m.unidad,
                m.cantidad.toFixed(4),
                m.precioUnit.toFixed(4),
                m.subtotal.toFixed(2)
              ]);
            });
          }

          // 2. MANO DE OBRA (si existe)
          if (manoDeObra.length > 0) {
            recipeRows.push([
              {
                content: 'MANO DE OBRA',
                colSpan: 5,
                styles: {
                  fillColor: [255, 247, 237], // orange-50
                  textColor: [194, 65, 12],   // orange-700
                  fontStyle: 'bold',
                  fontSize: 8.5
                }
              }
            ]);
            manoDeObra.forEach(mo => {
              recipeRows.push([
                mo.nombre,
                mo.unidad,
                mo.cantidad.toFixed(4),
                mo.precioUnit.toFixed(4),
                mo.subtotal.toFixed(2)
              ]);
            });
          }

          // 3. EQUIPOS Y MAQUINARIA (si existen o si hay herramienta menor)
          if (equipos.length > 0 || pctHM > 0) {
            recipeRows.push([
              {
                content: 'EQUIPOS Y MAQUINARIA',
                colSpan: 5,
                styles: {
                  fillColor: [250, 245, 255], // purple-50
                  textColor: [126, 34, 206],  // purple-700
                  fontStyle: 'bold',
                  fontSize: 8.5
                }
              }
            ]);
            equipos.forEach(eq => {
              recipeRows.push([
                eq.nombre,
                eq.unidad,
                eq.cantidad.toFixed(4),
                eq.precioUnit.toFixed(4),
                eq.subtotal.toFixed(2)
              ]);
            });

            if (pctHM > 0) {
              recipeRows.push([
                `Herramienta Menor (${pctHM}% de M.O.)`,
                "%",
                pctHM.toFixed(2),
                totManoObra.toFixed(4),
                herramientaMenorVal.toFixed(2)
              ]);
            }
          }

          autoTable(doc, {
            head: [recipeCols],
            body: recipeRows,
            startY: currentY,
            theme: 'grid',
            styles: { 
              fontSize: 8, 
              cellPadding: 2,
              lineColor: [229, 231, 235], // gray-200
              lineWidth: 0.2
            },
            headStyles: { 
              fillColor: [243, 244, 246], // gray-100
              textColor: [17, 24, 39],    // gray-900
              fontStyle: 'bold' 
            },
            columnStyles: {
              0: { cellWidth: 'auto', halign: 'left' },
              1: { cellWidth: 22, halign: 'center' },
              2: { cellWidth: 28, halign: 'center' },
              3: { cellWidth: 32, halign: 'right' },
              4: { cellWidth: 32, halign: 'right' }
            },
            margin: { left: 14, right: 14 }
          });

          currentY = (doc as any).lastAutoTable?.finalY + 10;
        }
      });

      doc.save(`Catalogo_Rubros_y_Recetas_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al generar el archivo PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight flex items-center gap-2">
            <PenTool className="text-brand-sage" /> Catálogo de Rubros
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Crea las recetas (Análisis de Precios Unitarios) uniendo materiales, mano de obra y equipos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToExcel} 
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm shadow-sm" 
            title="Exportar Resumen y Recetas a Excel"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            <span>Excel</span>
          </button>
          <button 
            onClick={exportToPDF} 
            disabled={isExporting}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm shadow-sm" 
            title="Exportar Resumen y Recetas a PDF"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>PDF</span>
          </button>
          <button onClick={() => {
            let initialValues = { codigo: '', nombre: '', unidad: 'm3', herramienta_menor_pct: 5.0, subfamilia_id: '', familia_id_temp: '' };
            if (selectedFamilia) {
               initialValues.familia_id_temp = selectedFamilia;
               const subs = subfamilias.filter((sf:any) => sf.familia_id === selectedFamilia);
               if (subs.length > 0) initialValues.subfamilia_id = subs[0].id;
            }
            resetNewForm(initialValues);
            setIsNewModalOpen(true);
          }} className="bg-brand-sage text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap text-sm">
            <Plus size={16} /> Nuevo Rubro
          </button>
        </div>
      </div>

      {/* MAIN: 2 PANELES QUE LLENAN LA PANTALLA */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        
        
        {/* LEFT: ÁRBOL DE GRUPOS */}
        <div className="w-full md:w-1/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 shrink-0 flex flex-col gap-2">
            <div className="flex justify-between items-center">
  <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Grupos</span>
  <button onClick={async () => {
    const nombre = window.prompt('Nombre del nuevo Grupo:');
    if (!nombre || !nombre.trim()) return;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? `FAM-${crypto.randomUUID()}` : `FAM-${Date.now()}`;
    const { data, error } = await supabase.from('familias').insert([{ id, nombre: nombre.trim(), grupo_sugerido: 'rubro' }]).select();
    if (!error && data) {
      setFamilias([...familias, data[0]]);
      const sfId = typeof crypto !== 'undefined' && crypto.randomUUID ? `SF-${crypto.randomUUID()}` : `SF-${Date.now()}`;
      const { data: sfData } = await supabase.from('subfamilias').insert([{ id: sfId, nombre: 'General', familia_id: id }]).select();
      if (sfData) setSubfamilias((prev: any) => [...prev, sfData[0]]);
    } else alert('No se pudo crear el grupo.');
  }} className="p-1.5 bg-brand-sage hover:bg-brand-dark text-white rounded transition-colors" title="Crear Grupo"><Plus size={14} /></button>
</div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              <input type="text" placeholder="Buscar grupo..." value={searchCategoryTerm} onChange={e => setSearchCategoryTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs outline-none focus:border-brand-sage" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
            <button onClick={() => { setSelectedFamilia(null); setSelectedSubfamilia(null) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${!selectedFamilia ? 'bg-brand-sage text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="flex items-center gap-2"><Box size={15} /> Todos</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedFamilia ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{totalItems}</span>
            </button>
            {familias.filter(f => f.nombre.toLowerCase().includes(searchCategoryTerm.toLowerCase()) || subfsPorFamilia(f.id).some(sf => sf.nombre.toLowerCase().includes(searchCategoryTerm.toLowerCase()))).map(fam => {
              const subs = subfsPorFamilia(fam.id)
              const isExpanded = expandedFamilias.has(fam.id)
              const isSelected = selectedFamilia === fam.id && !selectedSubfamilia
              return (
                <div key={fam.id} className="group relative">
                  <button onClick={() => { setSelectedFamilia(fam.id); setSelectedSubfamilia(null); setExpandedFamilias(prev => { const n = new Set(prev); if (n.has(fam.id)) n.delete(fam.id); else n.add(fam.id); return n }) }}
                    className={`w-full text-left px-2 py-2 pr-16 rounded-lg text-sm transition-colors flex items-center gap-1 ${isSelected ? 'bg-brand-sage text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                    
                    <span className="mr-1"><Layers size={14} /></span>
                    <span className="flex-1 truncate text-xs font-semibold">{fam.nombre}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{rubros.filter(r => subs.map(sf=>sf.id).includes(r.subfamilia_id || '')).length}</span>
                  </button>

                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-0.5 rounded shadow-sm">
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        const newName = window.prompt("Nuevo nombre del grupo:", fam.nombre);
                        if(newName && newName.trim() !== fam.nombre) {
                          const { error } = await supabase.from('familias').update({ nombre: newName.trim() }).eq('id', fam.id);
                          if(!error) setFamilias(familias.map((f:any) => f.id === fam.id ? {...f, nombre: newName.trim()} : f));
                        }
                      }} className="p-1 text-gray-400 hover:text-blue-500 rounded" title="Editar"><Edit3 size={12} /></button>
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`¿Eliminar el grupo "${fam.nombre}"?`)) return;
                        const { error } = await supabase.from('familias').delete().eq('id', fam.id);
                        if (!error) {
                          if (selectedFamilia === fam.id) setSelectedFamilia(null);
                          setFamilias(familias.filter((f: any) => f.id !== fam.id));
                        } else alert('No se puede eliminar porque tiene rubros asignados.');
                      }} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Eliminar"><Trash2 size={12} /></button>
                    </div>
                  
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: RUBROS TABLE */}
        <div className="w-full md:w-3/4 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-4 shrink-0">
            <div className="relative w-full max-w-md">
              <input type="text" placeholder="Buscar rubro por código o nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:border-brand-sage" />
              <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left divide-y divide-gray-200">
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
                    <tr key={r.id} className="transition-colors cursor-pointer hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-400" onClick={() => openEditor(r)}>
                      <td className="px-4 py-2.5 font-mono text-xs text-brand-sage font-bold whitespace-nowrap">{r.codigo}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800 leading-tight">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{r.nombre}</span>
                          {r.es_maestro ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">Oficial SARA</span>
                          ) : (
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">Privado Mi Empresa</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{r.unidad}</span></td>
                      <td className="px-4 py-2.5 text-right font-black text-brand-dark whitespace-nowrap">${Number(r.total_costo_directo || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          {r.es_maestro ? (
                            <>
                              <button onClick={(e) => handleCloneRubro(r, e)} className="p-1.5 text-brand-sage hover:text-brand-dark hover:bg-brand-sage/10 rounded transition-colors flex items-center gap-1 text-xs font-bold" title="Clonar rubro oficial a mi catálogo privado para personalizarlo">
                                <Copy size={15} />
                                <span className="hidden sm:inline">Clonar</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); openEditor(r); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Ver APU"><Edit3 size={15} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); openEditor(r); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar APU"><Edit3 size={15} /></button>
                              <button onClick={(e) => handleDeleteRubro(r.id, e, r.es_maestro)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 size={15} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500">Mostrando {rubros.length === 0 ? 0 : 1} a {Math.min(0 + itemsPerPage, rubros.length)} de {rubros.length} registros</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
              {getPageNumbers().map(num => (
                <button key={num} onClick={() => setCurrentPage(num)} className={`min-w-[28px] h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${currentPage === num ? 'bg-brand-sage text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>{num}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL APU EDITOR ===== */}
      {isEditorOpen && currentRubro && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-brand-sage/10 rounded-lg text-brand-sage shrink-0"><PenTool size={20} /></div>
                <div className="min-w-0">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2 truncate">
                    <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">{currentRubro.codigo}</span>
                    <input type="text" value={currentRubro.nombre} onChange={e => setCurrentRubro({...currentRubro, nombre: e.target.value})} className="truncate bg-transparent border-b border-dashed border-gray-400 hover:border-brand-sage focus:border-brand-sage outline-none flex-1" />
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">Unidad de Medida: <input type="text" value={currentRubro.unidad} onChange={e => setCurrentRubro({...currentRubro, unidad: e.target.value})} className="ml-1 w-16 text-gray-700 font-bold bg-transparent border-b border-dashed border-gray-400 hover:border-brand-sage focus:border-brand-sage outline-none text-center" /></p>
                </div>
              </div>
              <button onClick={closeEditor} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"><X size={20} /></button>
            </div>

            {/* Summary Cards */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
              <div className="grid grid-cols-4 gap-3">
                {familiasInsumo.map(famIns => {
                    const validSfIds = subfamilias.filter(sf => sf.familia_id === famIns.id).map(sf=>sf.id);
                    const items = rubroInsumos.filter(ri => validSfIds.includes(ri.insumos.subfamilia_id));
                    const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.insumos.precio_sin_iva), 0);
                    const isEquipos = famIns.nombre.toLowerCase().includes('equipo');
                    return (
                      <div key={famIns.id} className="bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate w-full" title={famIns.nombre}>{famIns.nombre}</span>
                        </div>
                        <div className="text-lg font-black text-gray-800">${(subtotal + (isEquipos ? herramientaMenor : 0)).toFixed(2)}</div>
                      </div>
                    )
                  })}
                  <div className="bg-brand-sage rounded-lg border border-brand-sage px-3 py-2.5 text-white shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Save size={14} className="text-brand-sage" />
                      <span className="text-xs font-semibold text-white/60">Costo Directo</span>
                    </div>
                    <div className="text-lg font-black text-brand-sage">${totalCostoDirecto.toFixed(2)}</div>
                  </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
              
              {familiasInsumo.map((famIns, idx) => {
                  const validSfIds = subfamilias.filter(sf => sf.familia_id === famIns.id).map(sf=>sf.id);
                  const items = rubroInsumos.filter(ri => validSfIds.includes(ri.insumos.subfamilia_id));
                  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.insumos.precio_sin_iva), 0);
                  const isEquipos = famIns.nombre.toLowerCase().includes('equipo');
                  const hMenor = isEquipos ? herramientaMenor : 0;
                  
                  return (
                    <div key={famIns.id} className="rounded-lg border border-gray-200 overflow-hidden mb-4 shadow-sm">
                      <div className="bg-gray-50 text-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5"><Layers size={14} className="text-brand-sage"/> {idx + 1}. {famIns.nombre}</span>
                          
                        </div>
                        <span className="font-black text-sm text-brand-dark">${(subtotal + hMenor).toFixed(4)}</span>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-white text-gray-400 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-xs w-[12%]">Código</th>
                            <th className="px-4 py-2 text-left font-semibold text-xs w-[38%]">Descripción</th>
                            <th className="px-4 py-2 text-center font-semibold text-xs w-[10%]">Unid.</th>
                            <th className="px-4 py-2 text-right font-semibold text-xs w-[15%]">Cantidad</th>
                            <th className="px-4 py-2 text-right font-semibold text-xs w-[15%]">Costo U.</th>
                            <th className="px-4 py-2 text-right font-semibold text-xs w-[15%]">Subtotal</th>
                            <th className="px-2 py-2 w-[5%]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {items.length === 0 && <tr><td colSpan={7} className="px-4 py-4 text-center text-gray-400 italic text-sm">No hay insumos en esta categoría</td></tr>}
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
              {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
              
              <div className="flex items-center gap-3">
                <button onClick={() => { setAddInsumoCategory(''); setIsAddInsumoModalOpen(true); }} className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-sage/10 text-brand-dark hover:bg-brand-sage/20 transition-colors flex items-center gap-2 border border-brand-sage/20"><Plus size={16} /> Agregar Insumos</button>
                  <button onClick={closeEditor} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cerrar</button>
                <button onClick={saveRubro} className="bg-brand-sage text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 text-sm shadow-sm">
                  <Save size={16} /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Rubro */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Crear Nuevo Rubro</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleNewSubmit(submitNewRubro)} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo</label>
                  <select required {...registerNew("familia_id_temp")} onChange={e => {
                    const famId = e.target.value;
                    let targetSubId = '';
                    if (famId) {
                      const subs = subfamilias.filter((sf:any) => sf.familia_id === famId);
                      if (subs.length > 0) targetSubId = subs[0].id;
                    }
                    setNewValue('familia_id_temp', famId);
                    setNewValue('subfamilia_id', targetSubId);
                  }} className={`w-full border rounded-lg px-3 py-2 outline-none ${newErrors.familia_id_temp ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="" disabled>-- Seleccione Grupo --</option>
                    {familias.filter((f:any) => f.grupo_sugerido === 'rubro').map((f:any) => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                {/* Selector de subgrupo removido por requerimiento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                    <input type="text" {...registerNew("codigo")} disabled className={`w-full border bg-gray-100 text-gray-500 cursor-not-allowed rounded-lg px-3 py-2 outline-none ${newErrors.codigo ? 'border-red-500' : 'border-gray-300'}`} placeholder="Auto-generado" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Herr. Menor (%)</label>
                    <input type="number" step="0.1" {...registerNew("herramienta_menor_pct", { valueAsNumber: true })} className={`w-full border rounded-lg px-3 py-2 outline-none ${newErrors.herramienta_menor_pct ? 'border-red-500' : 'border-gray-300'}`} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Descripción / Nombre</label>
                  <textarea {...registerNew("nombre")} rows={2} className={`w-full border rounded-lg px-3 py-2 outline-none ${newErrors.nombre ? 'border-red-500' : 'border-gray-300'}`} placeholder="Pared de bloque vibrado e=10cm..." required></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label>
                  <input type="text" {...registerNew("unidad")} className={`w-full border rounded-lg px-3 py-2 outline-none ${newErrors.unidad ? 'border-red-500' : 'border-gray-300'}`} placeholder="m3, m2, ml, glb" required />
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button type="submit" disabled={isNewSubmitting || createMutation.isPending} className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors">
                    {createMutation.isPending ? 'Creando...' : 'Crear Rubro'}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* MODAL: Buscar Insumo (z-60 para estar ENCIMA del modal APU) */}
      {isAddInsumoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 shrink-0">
              <Search className="text-gray-400" size={20} />
              <input type="text" autoFocus placeholder="Buscar insumo por nombre o código..." value={searchInsumoTerm} onChange={(e) => setSearchInsumoTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-lg text-gray-800 placeholder:text-gray-400" />
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
                        <div className={`p-2 rounded-lg text-white ${insumo.tipo === 'material' ? 'bg-sky-500' : insumo.tipo === 'mano_de_obra' ? 'bg-amber-500' : 'bg-purple-500'}`}><Box size={16} /></div>
                        <div><div className="font-bold text-sm text-gray-800">{insumo.nombre}</div><div className="text-xs text-gray-500 font-mono">{insumo.codigo} • {insumo.tipo}</div></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right"><div className="font-bold text-sm text-brand-dark">${Number(insumo.precio_sin_iva).toFixed(2)}</div><div className="text-xs text-gray-400">/ {insumo.unidad}</div></div>
                        <div className="bg-brand-sage text-white p-1.5 rounded hover:bg-brand-dark transition-colors"><Plus size={16} /></div>
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

