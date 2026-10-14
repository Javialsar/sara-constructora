// @ts-nocheck
"use client"
import BimImporterModal from "./components/BimImporterModal"
import RecipeModal from "./components/RecipeModal"
import SercopVaeAnalyzer from "./components/SercopVaeAnalyzer"
import IndirectosAnaliticoModal from "./components/IndirectosAnaliticoModal"
import { Cuboid, ShieldCheck, Cpu, Sparkles } from "lucide-react"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client"
import { Plus, Calendar, Search, Trash2, X, ArrowLeft, Copy, Save, Calculator, FileText, Download, Box, Users, Wrench, Hammer, Tag, Printer, Edit3, ChevronDown, ChevronRight, Lock, CheckCircle2, Loader2, List , Settings, Filter, Layers, Package, Boxes, PieChart} from "lucide-react"
import GanttModal from "@/components/admin/presupuestos/GanttModal"
import AgentNetworkChoreography from "@/components/agents/AgentNetworkChoreography"
import { SaraCoPilotAdvisor } from "@/components/agents/SaraCoPilotAdvisor"
import { ArrowRight } from "lucide-react"
import { generatePresupuestoGeneralPDF, generateAPUsPDF, generateExplosionPDF } from "@/lib/pdfGenerator"
import { generatePresupuestoGeneralExcel, generateExplosionExcel } from "@/lib/excelGenerator"
import autoTable from "jspdf-autotable"
import { membreteBase64 } from "@/lib/membreteBase64"
import AsyncSelect from "@/components/ui/AsyncSelect"


import { defaultFormulas, calcularTotalesPresupuesto } from "@/lib/calculadoras/presupuestos";
import { useProject } from "@/contexts/ProjectContext"


const presupuestoSchema = z.object({
  nombre_proyecto: z.string().min(2, "Seleccione un proyecto"),
  cliente_id: z.string().nullable().optional(),
  porcentaje_admin: z.number().min(0, "Mínimo 0"),
  porcentaje_imprevistos: z.number().min(0, "Mínimo 0"),
  porcentaje_utilidad: z.number().min(0, "Mínimo 0"),
  estado: z.string().default('borrador')
});
type PresupuestoFormValues = z.infer<typeof presupuestoSchema>;

export default function PresupuestosRealesPage() {
  const supabase = createClient()
  const queryClient = useQueryClient();

  const { projects, activeProject, currentCliente, isGlobalMode, setGlobalMode, openCreateModal, setActiveProject } = useProject();
  
  const [selectedProjectName, setSelectedProjectName] = useState("")
  const [isCustomProject, setIsCustomProject] = useState(false)
  const [newAdminPct, setNewAdminPct] = useState(10.0)
  const [newImprevPct, setNewImprevPct] = useState(5.0)
  const [newUtilPct, setNewUtilPct] = useState(10.0)
  
  const [view, setView] = useState('lista')
  const [indForm, setIndForm] = useState({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0 })
  const [showFormulas, setShowFormulas] = useState(false)
  const [openGroup, setOpenGroup] = useState({ 1: false, 2: false, 3: true, 4: true, 5: true, 6: true })
  const [activeTab, setActiveTab] = useState('detalle')
  const [explosionTypeFilter, setExplosionTypeFilter] = useState('todos')
  const [explosionSearch, setExplosionSearch] = useState('')
  
  const [searchPresupuesto, setSearchPresupuesto] = useState("")

  const { data: presupuestos = [] } = useQuery({
    queryKey: ['presupuestos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from('presupuestos_reales')
        .select('*, cliente:clientes(id, nombre, apellido, email)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (user) {
        const { data: cli } = await supabase
          .from('clientes')
          .select('id, es_admin')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (cli && !cli.es_admin) {
          query = query.or(`cliente_id.eq.${cli.id},user_id.eq.${user.id}`);
        } else if (!cli) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data } = await query;
      return data || [];
    }
  });

  // ⚡ Sincronización en tiempo real de presupuestos
  useEffect(() => {
    const channel = supabase
      .channel('presupuestos-realtime-listener')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presupuestos_reales' }, () => {
        queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ⚡ Sincronización de espacio de trabajo al cambiar de proyecto activo
  const prevProjectIdRef = useRef<string | null>(activeProject?.id || null);
  const prevGlobalModeRef = useRef<boolean>(isGlobalMode);

  useEffect(() => {
    const projectChanged = prevProjectIdRef.current !== (activeProject?.id || null);
    const globalChanged = prevGlobalModeRef.current !== isGlobalMode;

    if (projectChanged || globalChanged) {
      prevProjectIdRef.current = activeProject?.id || null;
      prevGlobalModeRef.current = isGlobalMode;

      // Si el usuario seleccionó otra obra en el selector superior, cerrar cualquier editor/explosión y volver a la lista del proyecto
      setView('lista');
      setCurrentPresupuesto(null);
    }
  }, [activeProject?.id, isGlobalMode]);

  // Lista de presupuestos filtrados por la obra activa o búsqueda
  const filteredPresupuestos = useMemo(() => {
    return presupuestos.filter((p: any) => {
      // Filtro por obra activa
      if (!isGlobalMode && activeProject) {
        const pNom = (p.nombre_proyecto || '').toLowerCase().trim();
        const actNom = activeProject.nombre.toLowerCase().trim();
        if (pNom !== actNom && !pNom.includes(actNom) && !actNom.includes(pNom)) {
          return false;
        }
      }
      const searchLower = searchPresupuesto.toLowerCase();
      const matchProject = p.nombre_proyecto?.toLowerCase().includes(searchLower);
      const clientName = p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}`.toLowerCase() : '';
      return matchProject || clientName.includes(searchLower);
    });
  }, [presupuestos, isGlobalMode, activeProject, searchPresupuesto]);

  // ⚡ Si venimos redirigidos tras exportar una licitación, abrir automáticamente el presupuesto
  useEffect(() => {
    if (typeof window !== "undefined" && presupuestos.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('nuevo_id');
      if (targetId) {
        const target = presupuestos.find((p: any) => p.id === targetId);
        if (target) {
          openEditor(target);
        }
      }
    }
  }, [presupuestos]);

  const proyectosCRM: any[] = [];
  const clientesCRM: any[] = [];

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      // Importante: No enviar columnas inexistentes a la tabla presupuestos_reales (ej. user_id)
      const payload = {
        nombre_proyecto: values.nombre_proyecto,
        cliente_id: values.cliente_id || null,
        porcentaje_admin: Number(values.porcentaje_admin) || 10.0,
        porcentaje_imprevistos: Number(values.porcentaje_imprevistos) || 5.0,
        porcentaje_utilidad: Number(values.porcentaje_utilidad) || 10.0,
        estado: 'borrador'
      };
      const { data, error } = await supabase
        .from('presupuestos_reales')
        .insert([payload])
        .select('*, cliente:clientes(id, nombre, apellido, email)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setIsNewModalOpen(false);

      // Si el presupuesto creado corresponde a un proyecto registrado, activarlo en el espacio de trabajo
      const matched = projects.find((p: any) => p.nombre.toLowerCase() === data.nombre_proyecto.toLowerCase());
      if (matched) {
        setActiveProject(matched);
      }

      openEditor(data);

      if (bimDataToProcess && bimDataToProcess.length > 0) {
        await processBimData(data.id, bimDataToProcess);
        setBimDataToProcess(null);
      }
    },
    onError: (error: any) => {
      console.error("Error al crear presupuesto:", error);
      alert("Error al crear presupuesto: " + (error.message || JSON.stringify(error)));
    }
  });

  const handleDirectCreatePresupuesto = (e: React.FormEvent) => {
    e.preventDefault();
    const nombreFinal = selectedProjectName.trim();

    if (!nombreFinal) {
      alert("Por favor ingresa o selecciona el nombre de la obra o proyecto.");
      return;
    }

    const matched = projects.find((p: any) => p.nombre.toLowerCase() === nombreFinal.toLowerCase());
    const clienteFinal = matched?.cliente_id || currentCliente?.id || null;

    createMutation.mutate({
      nombre_proyecto: nombreFinal,
      cliente_id: clienteFinal,
      porcentaje_admin: Number(newAdminPct) || 10.0,
      porcentaje_imprevistos: Number(newImprevPct) || 5.0,
      porcentaje_utilidad: Number(newUtilPct) || 10.0
    });
  };

  const openNewPresupuestoModal = (overrideProjectName?: string) => {
    const defaultName = overrideProjectName 
      ? overrideProjectName 
      : (!isGlobalMode && activeProject) 
        ? activeProject.nombre 
        : (projects[0]?.nombre || "");
    setSelectedProjectName(defaultName);
    setIsCustomProject(false);
    setIsNewModalOpen(true);
  };

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isBimModalOpen, setIsBimModalOpen] = useState(false)
  const [bimDataToProcess, setBimDataToProcess] = useState<any[] | null>(null)
  const [newPresupuestoData, setNewPresupuestoData] = useState({
    nombre_proyecto: '',
    porcentaje_admin: 10.0,
    porcentaje_imprevistos: 5.0,
    porcentaje_utilidad: 10.0,
    estado: 'borrador'
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
    const loadEmpresaParams = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ep } = await supabase
        .from('empresa_parametros_cliente')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (ep) {
        const a = Number(ep.porcentaje_admin_default) || 10.0
        const i = Number(ep.porcentaje_imprevistos_default) || 5.0
        const u = Number(ep.porcentaje_utilidad_default) || 10.0
        setNewAdminPct(a)
        setNewImprevPct(i)
        setNewUtilPct(u)
        setNewValue("porcentaje_admin", a)
        setNewValue("porcentaje_imprevistos", i)
        setNewValue("porcentaje_utilidad", u)
      }
    }
    loadEmpresaParams()
  }, [])

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
  const [isIndirectosModalOpen, setIsIndirectosModalOpen] = useState(false)

  const [explosionData, setExplosionData] = useState([])
  const [loadingExplosion, setLoadingExplosion] = useState(false)

  
  const [userRole, setUserRole] = useState('admin')
  const [userName, setUserName] = useState('')

  // Modal Duplicar Presupuesto
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSource, setCloneSource] = useState<any>(null);
  const [cloneDestinoTipo, setCloneDestinoTipo] = useState<'crm' | 'manual'>('crm');
  const [cloneProyectoCrmId, setCloneProyectoCrmId] = useState('');
  const [cloneNombreProyecto, setCloneNombreProyecto] = useState('');
  const [cloneClienteId, setCloneClienteId] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  // Modal Reasignar Proyecto / Cliente
  const [isEditMetaModalOpen, setIsEditMetaModalOpen] = useState(false);
  const [metaTargetPresupuesto, setMetaTargetPresupuesto] = useState<any>(null);
  const [metaDestinoTipo, setMetaDestinoTipo] = useState<'crm' | 'manual'>('crm');
  const [metaProyectoCrmId, setMetaProyectoCrmId] = useState('');
  const [metaNombreProyecto, setMetaNombreProyecto] = useState('');
  const [metaClienteId, setMetaClienteId] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  useEffect(() => {
    fetchPresupuestos()
    
    // Fetch actual user role
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        if (user.user_metadata?.role) {
          setUserRole(user.user_metadata.role)
        }
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name)
        }
      }
    }
    fetchUser()
  }, [])

  const fetchPresupuestos = async () => {
    await queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
  }

  const openCloneModal = (presupuesto: any, e?: any) => {
    if (e) e.stopPropagation();
    setCloneSource(presupuesto);
    setCloneDestinoTipo('crm');
    setCloneProyectoCrmId('');
    setCloneNombreProyecto(presupuesto.nombre_proyecto + " (Copia)");
    setCloneClienteId(presupuesto.cliente_id || '');
    setIsCloneModalOpen(true);
  };

  const handleSelectCrmProjectForClone = (projectId: string) => {
    setCloneProyectoCrmId(projectId);
    const found = proyectosCRM.find((p: any) => p.id === projectId);
    if (found) {
      setCloneNombreProyecto(found.nombre);
      if (found.cliente_id) {
        setCloneClienteId(found.cliente_id);
      }
    }
  };

  const executeClonePresupuesto = async () => {
    if (!cloneSource) return;
    const targetNombre = cloneNombreProyecto.trim();
    if (!targetNombre) {
      alert("Por favor ingrese o seleccione el nombre del proyecto.");
      return;
    }

    setIsCloning(true);
    try {
      const { id, created_at, updated_at, cliente, clientes, proyectos, ...parentData } = cloneSource;
      
      // 1. Insert new budget with new project name, new client_id, and preserve totals & indirects
      const { data: newPresupuesto, error: errParent } = await supabase.from('presupuestos_reales').insert([{
        ...parentData,
        nombre_proyecto: targetNombre,
        cliente_id: cloneClienteId ? cloneClienteId : null,
        estado: 'borrador',
        costo_directo_total: cloneSource.costo_directo_total || 0,
        gran_total: cloneSource.gran_total || 0
      }]).select('*, cliente:clientes(id, nombre, apellido, email)').single();
      
      if (errParent) throw errParent;

      // 2. Fetch old rubros
      const { data: oldRubros } = await supabase.from('presupuesto_rubros').select('*').eq('presupuesto_id', id);
      
      if (oldRubros && oldRubros.length > 0) {
        for (const oldRubro of oldRubros) {
          const { id: oldRubroId, created_at: cat, updated_at: ucat, ...rData } = oldRubro;
          
          const { data: newRubro, error: errRubro } = await supabase.from('presupuesto_rubros').insert([{
            ...rData,
            presupuesto_id: newPresupuesto.id
          }]).select().single();
          
          if (errRubro) throw errRubro;

          // Fetch old insumos for this specific rubro
          const { data: oldInsumos } = await supabase.from('presupuesto_rubro_insumos').select('*').eq('presupuesto_rubro_id', oldRubroId);
          
          if (oldInsumos && oldInsumos.length > 0) {
            const insumosPayload = oldInsumos.map((ins: any) => {
              const { id: oldInsId, created_at: catIns, updated_at: ucatIns, ...iData } = ins;
              return {
                ...iData,
                presupuesto_rubro_id: newRubro.id
              };
            });
            await supabase.from('presupuesto_rubro_insumos').insert(insumosPayload);
          }
        }
      }
      
      await queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setIsCloneModalOpen(false);
      alert(`¡Presupuesto duplicado con éxito y asignado a "${targetNombre}"!`);
      openEditor(newPresupuesto);
      
    } catch (error: any) {
      console.error("Error al clonar:", error);
      alert("Ocurrió un error al clonar: " + (error.message || error.details || JSON.stringify(error)));
    } finally {
      setIsCloning(false);
    }
  };

  const openEditMetaModal = (presupuesto: any, e?: any) => {
    if (e) e.stopPropagation();
    setMetaTargetPresupuesto(presupuesto);
    const matchedCrm = proyectosCRM.find((p: any) => p.nombre?.trim().toLowerCase() === presupuesto.nombre_proyecto?.trim().toLowerCase());
    if (matchedCrm) {
      setMetaDestinoTipo('crm');
      setMetaProyectoCrmId(matchedCrm.id);
    } else {
      setMetaDestinoTipo('manual');
      setMetaProyectoCrmId('');
    }
    setMetaNombreProyecto(presupuesto.nombre_proyecto || '');
    setMetaClienteId(presupuesto.cliente_id || '');
    setIsEditMetaModalOpen(true);
  };

  const handleSelectCrmProjectForMeta = (projectId: string) => {
    setMetaProyectoCrmId(projectId);
    const found = proyectosCRM.find((p: any) => p.id === projectId);
    if (found) {
      setMetaNombreProyecto(found.nombre);
      if (found.cliente_id) {
        setMetaClienteId(found.cliente_id);
      }
    }
  };

  const executeSaveMeta = async () => {
    if (!metaTargetPresupuesto) return;
    const targetNombre = metaNombreProyecto.trim();
    if (!targetNombre) {
      alert("Por favor ingrese o seleccione el nombre del proyecto.");
      return;
    }

    setIsSavingMeta(true);
    try {
      const { data, error } = await supabase.from('presupuestos_reales').update({
        nombre_proyecto: targetNombre,
        cliente_id: metaClienteId ? metaClienteId : null
      }).eq('id', metaTargetPresupuesto.id).select('*, cliente:clientes(id, nombre, apellido, email)').single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['presupuestos'] });

      if (currentPresupuesto && currentPresupuesto.id === metaTargetPresupuesto.id) {
        setCurrentPresupuesto(data);
      }

      setIsEditMetaModalOpen(false);
      alert("¡Proyecto y cliente actualizados correctamente!");
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar: " + (error.message || JSON.stringify(error)));
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDeletePresupuesto = async (id, e) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este presupuesto?")) return
    await supabase.from('presupuestos_reales').delete().eq('id', id)
    fetchPresupuestos()
  }

  const handleSaveIndirectos = async () => {
    const { error } = await supabase.from('presupuestos_reales').update({
      indirectos_config: indForm,
      observaciones: currentPresupuesto.observaciones ? currentPresupuesto.observaciones + `\n(Modificado por ${userName} - ${new Date().toLocaleDateString()})` : `Modificado por ${userName} - ${new Date().toLocaleDateString()}`
    }).eq('id', currentPresupuesto.id)
    if(!error) {
      setCurrentPresupuesto({...currentPresupuesto, porcentaje_admin: indForm.admin, porcentaje_imprevistos: indForm.imprevistos, porcentaje_utilidad: indForm.utilidad})
      fetchPresupuestos()
      alert("Costos Indirectos guardados correctamente")
    }
  }

  const handleMarcarEntregado = async () => {
    if (!confirm("¿Marcar como ENTREGADO / APROBADO? Ya no podrás editarlo.")) return
    await supabase.from('presupuestos_reales').update({ estado: 'aprobado' }).eq('id', currentPresupuesto.id)
    setCurrentPresupuesto({...currentPresupuesto, estado: 'aprobado'})
    fetchPresupuestos()
  }

  const openEditor = async (presupuesto: any) => {
    let pres = { ...presupuesto };
    if (!pres.cliente && pres.cliente_id && clientesCRM?.length > 0) {
      pres.cliente = clientesCRM.find((c: any) => c.id === pres.cliente_id) || null;
    }

    // Sincronizar automáticamente la obra activa en el navbar para que coincida con el presupuesto que se está editando
    const matched = projects.find((p: any) => p.nombre.toLowerCase() === (pres.nombre_proyecto || '').toLowerCase());
    if (matched && (!activeProject || activeProject.id !== matched.id)) {
      prevProjectIdRef.current = matched.id;
      setActiveProject(matched);
    }

    setCurrentPresupuesto(pres);
    setIndForm({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, ...(presupuesto.indirectos_config || {}) });
    setActiveTab('detalle');
    setView('editor');
    fetchPresupuestoRubros(presupuesto.id);
    
    if (allRubros.length === 0) {
      const { data } = await supabase.from('rubros').select('*').order('categoria', { ascending: true });
      if (data) setAllRubros(data);
    }
  }

  const fetchPresupuestoRubros = async (presupuesto_id) => {
    const { data } = await supabase.from('presupuesto_rubros').select('*').eq('presupuesto_id', presupuesto_id).order('created_at', { ascending: true })
    if (data) {
      setPresupuestoRubros(data)
      // Fetch all recipes for these rubros to have them ready for the accordion
      if (data.length > 0) {
        const { data: recipes } = await supabase.from('presupuesto_rubro_insumos')
          .select('id, presupuesto_rubro_id, cantidad, precio_sin_iva_snapshot, insumo:insumos(id, codigo, nombre, tipo, unidad)')
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
      // Consultar precios zonificados del Marketplace si existen
      const insumoIds = recetaMaestra.map(rm => rm.insumo_id);
      const preciosZonificadosMap = new Map();

      try {
        const { data: pzList } = await supabase
          .from('marketplace_precios_zonificados')
          .select('insumo_id, precio_puesto_obra')
          .in('insumo_id', insumoIds);

        if (pzList && pzList.length > 0) {
          pzList.forEach(pz => {
            preciosZonificadosMap.set(pz.insumo_id, Number(pz.precio_puesto_obra));
          });
        }
      } catch (errZon) {
        console.warn("Marketplace zonificado no disponible, usando precio base:", errZon);
      }

      const clonedRecipe = recetaMaestra.map(rm => {
        const insumoObj = Array.isArray(rm.insumo) ? rm.insumo[0] : rm.insumo;
        const precioZonificado = preciosZonificadosMap.get(rm.insumo_id);
        const precioFinal = precioZonificado !== undefined ? precioZonificado : (insumoObj ? insumoObj.precio_sin_iva : 0);
        return {
          presupuesto_rubro_id: newPresRubro.id,
          insumo_id: rm.insumo_id,
          cantidad: rm.cantidad,
          precio_sin_iva_snapshot: precioFinal
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
    return calcularTotalesPresupuesto({
      presupuestoRubros,
      rubrosRecipes,
      currentPresupuesto,
      indForm
    });
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

    const handleGeneratePresupuestoGeneralExcel = () => {
    generatePresupuestoGeneralExcel({
      currentPresupuesto,
      proyectosCRM,
      totales: calcTotales(),
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
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

  const handleGenerateExplosionPDF = (filterType?: string) => {
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
    let explosionData = Object.values(consolidado).sort((a, b) => {
      if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
    });
    
    let title = "EXPLOSIÓN DE INSUMOS";
    if (filterType === 'equipo') {
       explosionData = explosionData.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor');
       title = "REPORTE DE EQUIPOS";
    } else if (filterType === 'mano_de_obra') {
       explosionData = explosionData.filter(i => i.tipo === 'mano_de_obra');
       title = "REPORTE DE MANO DE OBRA";
    } else if (filterType === 'material') {
       explosionData = explosionData.filter(i => i.tipo === 'material');
       title = "REPORTE DE MATERIALES";
    }

    generateExplosionPDF({
      currentPresupuesto,
      explosionData,
      title
    });
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
          <table className="w-full text-sm text-left border-collapse border border-gray-800 divide-y divide-gray-200"><thead className="bg-slate-100 text-slate-700 border-b border-gray-200"><tr><th className="px-4 py-3">Cód</th><th className="px-4 py-3">Insumo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Und</th><th className="px-4 py-3 text-right">CANT. TOTAL</th><th className="px-4 py-3 text-right">P.U</th><th className="px-4 py-3 text-right">TOTAL</th></tr></thead><tbody className="divide-y divide-gray-800">
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2">
                  <FileText className="text-brand-sage" /> {currentPresupuesto.nombre_proyecto}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isBorrador ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800 flex items-center gap-1'}`}>
                  {!isBorrador && <Lock size={12}/>} {currentPresupuesto.estado || 'borrador'}
                </span>
                <button 
                  onClick={() => openEditMetaModal(currentPresupuesto)} 
                  title="Cambiar Proyecto o Cliente asignado" 
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition shadow-sm ml-2"
                >
                  <Edit3 size={13} /> Reasignar Proyecto / Cliente
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium text-gray-600">
                  <Users size={13} className="text-gray-400" />
                  Cliente: <strong className="text-gray-900">{currentPresupuesto.cliente ? `${currentPresupuesto.cliente.nombre} ${currentPresupuesto.cliente.apellido}` : (clientesCRM.find((c: any) => c.id === currentPresupuesto.cliente_id) ? `${clientesCRM.find((c: any) => c.id === currentPresupuesto.cliente_id).nombre} ${clientesCRM.find((c: any) => c.id === currentPresupuesto.cliente_id).apellido}` : 'Sin cliente asignado')}</strong>
                </span>
                <span>•</span>
                <span>Creado: {new Date(currentPresupuesto.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {isBorrador && (
            <button onClick={handleMarcarEntregado} className="bg-brand-sage hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm shadow-sm transition-all">
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
                    <button onClick={() => setActiveTab('explosion')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'explosion' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Calculator size={16} className="inline mr-2"/> Explosión de Insumos
          </button>
          <button onClick={() => setActiveTab('vae_sercop')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'vae_sercop' ? 'border-brand-sage text-brand-dark bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <ShieldCheck size={16} className="inline mr-2 text-emerald-600"/> Cumplimiento VAE (SERCOP)
          </button>
          <button onClick={() => setActiveTab('reportes')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reportes' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FileText size={16} className="inline mr-2"/> Reportes
          </button>
          <button onClick={() => setIsGanttModalOpen(true)} className={`px-6 py-3 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-gray-700`}>
            <Calendar size={16} className="inline mr-2"/> Cronograma de Trabajo
          </button>
          <button onClick={() => setActiveTab('red_agentes')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'red_agentes' ? 'border-amber-500 text-amber-900 bg-amber-50/70 font-black' : 'border-transparent text-amber-700 hover:text-amber-900 bg-amber-50/30'}`}>
            <Cpu size={16} className="inline mr-2 text-amber-500 animate-pulse"/> Red de Agentes IA & Co-Piloto
          </button>
        </div>

        {activeTab === 'detalle' && (

<div className="w-full">
          {/* Banner Interactivo de Co-Piloto Asesor */}
          <div className="mb-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/40 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-100 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-white">Co-Piloto Asesor SARA Activo: </span>
                <span className="text-slate-300">
                  Analizando opciones de proveedores en Quito/Cuenca y coordinación de carga con cooperativa local.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('red_agentes')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-xs flex-shrink-0 cursor-pointer"
            >
              <span>Abrir Co-Piloto & Asesoría IA</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Rubros del Proyecto</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('red_agentes')} 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-sm font-black py-1.5 px-4 rounded flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Cpu size={16} /> Red de Agentes IA
                </button>
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
              <table className="w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-slate-100 text-slate-700 border-b border-gray-200">
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
                    <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
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
                            <table className="w-full text-xs divide-y divide-gray-200">
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
              <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIndForm({...indForm, pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0})} className='px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-slate-600 shadow-sm hover:bg-slate-50 transition-colors'>% Porcentajes por defecto</button>
                    <button onClick={() => setIndForm({...indForm, formulas: defaultFormulas})} className='px-4 py-2 text-sm font-medium bg-slate-100 border border-transparent rounded-lg text-slate-600 hover:bg-slate-200 transition-colors'>Restaurar Fórmulas por defecto</button>
                    <button onClick={() => setIsIndirectosModalOpen(true)} className='px-4 py-2 text-sm font-bold bg-amber-50 border border-amber-200 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-sm'>
                      <Calculator size={15} /> Justificación Analítica SERCOP (AIU)
                    </button>
                    <div className="flex items-center gap-2 ml-4">
                      <input type="checkbox" id="show-formulas" checked={showFormulas} onChange={(e) => setShowFormulas(e.target.checked)} className="rounded text-brand-sage focus:ring-brand-sage w-4 h-4 cursor-pointer" />
                      <label htmlFor="show-formulas" className="text-sm text-gray-600 font-medium cursor-pointer">Visualizar fórmulas</label>
                    </div>
                  </div>
                  <button onClick={handleSaveIndirectos} className="bg-brand-sage hover:opacity-90 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm text-sm">
                    <Save size={16} /> Grabar Fórmulas
                  </button>
                </div>

                <div className="w-full text-sm">
                  {/* EQUIPOS */}
                  <div className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8">
                    <span>1.- Equipos</span>
                    
                  </div>
                  <div className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4">
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 hover:bg-gray-50 transition-colors">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Materiales y Equipos</div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{smaq.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $smaq =</div>
                      <div className="flex-1 text-gray-500">Suma de Materiales y Equipos</div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Herramientas Menores % M.O.</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pmaq1</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pmaq1} onChange={(e) => setIndForm({...indForm, pmaq1: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{dmaq1.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $dmaq1 =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).dmaq1} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), dmaq1: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).dmaq1}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-100 font-bold border-t border-gray-200">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Equipos</div>
                      <div className="w-24 pl-8"></div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{cmaq.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $cmaq =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cmaq} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cmaq: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cmaq}</div> )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* MANO DE OBRA */}
                  <div className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8">
                    <span>2.- Mano de Obra</span>
                    
                  </div>
                  <div className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4">
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 hover:bg-gray-50 transition-colors">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Mano de Obra</div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{smob.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $smob =</div>
                      <div className="flex-1 text-gray-500">Suma de Mano de Obra</div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium"></div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pmob1</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pmob1} onChange={(e) => setIndForm({...indForm, pmob1: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{dmob1.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $dmob1 =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).dmob1} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), dmob1: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).dmob1}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-100 font-bold border-t border-gray-200">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Mano de Obra</div>
                      <div className="w-24 pl-8"></div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{cmob.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $cmob =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cmob} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cmob: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cmob}</div> )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* MATERIALES */}
                  <div className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8">
                    <span>3.- Materiales</span>
                    
                  </div>
                  <div className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4">
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 hover:bg-gray-50 transition-colors">
                      <div className="w-1/3 text-right pr-4 text-gray-600 font-medium">Subtotal Materiales</div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{smat.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $smat =</div>
                      <div className="flex-1 text-gray-500">Suma de Materiales</div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium"></div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pmat1</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pmat1} onChange={(e) => setIndForm({...indForm, pmat1: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{dmat1.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $dmat1 =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).dmat1} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), dmat1: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).dmat1}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-100 font-bold border-t border-gray-200">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total Materiales</div>
                      <div className="w-24 pl-8"></div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{cmat.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $cmat =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cmat} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cmat: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cmat}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex p-4 items-center bg-brand-dark text-white rounded-b-xl shadow-inner mt-px">
                      <div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Costo directo</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{costoDirectoTotal.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $cdir =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cdir} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cdir: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cdir}</div> )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* GASTOS GENERALES Y ADMINISTRATIVOS */}
                  <div className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8">
                    <span>4.- Gastos generales y administrativos</span>
                    
                  </div>
                  <div className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4">
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Gastos generales = (% de 1+2+3)</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$ggen</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.ggen} onChange={(e) => setIndForm({...indForm, ggen: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{sggen.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $sggen =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).sggen} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), sggen: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).sggen}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Gastos de obra</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pgas1</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pgas1} onChange={(e) => setIndForm({...indForm, pgas1: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{sgas1.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $sgas1 =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).sgas1} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), sgas1: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).sgas1}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Financiamiento</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pgas2</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pgas2} onChange={(e) => setIndForm({...indForm, pgas2: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{sgas2.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $sgas2 =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).sgas2} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), sgas2: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).sgas2}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Polizas y Seguros</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pgas3</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pgas3} onChange={(e) => setIndForm({...indForm, pgas3: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{sgas3.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $sgas3 =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).sgas3} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), sgas3: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).sgas3}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-100 font-bold border-t border-gray-200">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total gastos generales y administrativos</div>
                      <div className="w-24 pl-8"></div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{totalGastosGenerales.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">=</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cgas} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cgas: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cgas}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex p-4 items-center bg-brand-dark text-white rounded-b-xl shadow-inner mt-px">
                      <div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Costo neto</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{cnet.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $cnet =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cnet} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cnet: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cnet}</div> )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* IMPREVISTOS */}
                  <div className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8">
                    <span>5.- Imprevistos</span>
                    
                  </div>
                  <div className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4">
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Imprevistos = (% de 1+2+3)</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$pimp</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.pimp} onChange={(e) => setIndForm({...indForm, pimp: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{simp.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $simp =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).simp} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), simp: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).simp}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-100 font-bold border-t border-gray-200">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Total de Imprevistos</div>
                      <div className="w-24 pl-8"></div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{simp.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $cimp =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).cimp} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), cimp: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).cimp}</div> )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* UTILIDAD */}
                  <div className="bg-slate-50 text-slate-700 px-5 py-3.5 font-bold text-xs uppercase tracking-widest flex justify-between items-center rounded-t-xl border border-gray-200 border-b-0 mt-8">
                    <span>6.- Utilidad</span>
                    
                  </div>
                  <div className="bg-white divide-y divide-gray-100 border border-gray-200 rounded-b-xl shadow-sm mb-4">
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-l-4 border-brand-sage">
                      <div className="w-1/3 text-left pl-4 font-medium">Utilidad = (% de 1+2+3)</div>
                      <div className="flex items-center w-48 flex-shrink-0">
                        <span className={`font-mono text-xs text-gray-400 w-16 text-right mr-2 ${showFormulas ? '' : 'hidden'}`}>$util</span>
                        <div className="relative"><input type="number" step="0.1" min="0" value={indForm.util} onChange={(e) => setIndForm({...indForm, util: e.target.value})} className="w-24 h-9 border border-gray-300 rounded-lg text-right pr-7 pl-2 text-sm font-bold text-brand-dark outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all bg-white shadow-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span></div>
                      </div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{sutil.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $sutil =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).sutil} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), sutil: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).sutil}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap p-3 items-center gap-y-2 bg-gray-100 font-bold border-t border-gray-200">
                      <div className="w-1/3 text-right pr-4 text-gray-700">Precio de venta</div>
                      <div className="w-24 pl-8"></div>
                      <div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>{granTotal.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $granTotal =</div>
                      {showFormulas ? ( <input type='text' value={(indForm.formulas || defaultFormulas).granTotal} onChange={e => setIndForm({...indForm, formulas: {...(indForm.formulas || defaultFormulas), granTotal: e.target.value}})} className='flex-1 font-mono text-xs text-brand-dark bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage shadow-sm' /> ) : ( <div className='flex-1 font-mono text-gray-500'>{(indForm.formulas || defaultFormulas).granTotal}</div> )}
                        </>
                      )}
                    </div>
                    <div className="flex p-4 items-center bg-brand-dark text-white rounded-b-xl shadow-inner mt-px">
                      <div className="w-1/3 text-right pr-4 text-brand-sage font-black uppercase tracking-wider">Total Precio Unitario</div>
                      <div className="w-24 pl-8"></div>
                      <div className="w-24 text-right pr-4 font-mono text-lg">{granTotal.toFixed(2)}</div>
                      {showFormulas && (
                        <>
                          <div className="w-24 text-center font-mono text-gray-400">= $Stotal =</div>
                      <div className="flex-1 font-mono text-gray-500">$granTotal</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

        {activeTab === 'explosion' && (() => {
            const consolidado: Record<string, any> = {};
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

            const allExplosionItems = Object.values(consolidado).sort((a, b) => {
              if (a.tipo < b.tipo) return -1; if (a.tipo > b.tipo) return 1; return a.nombre.localeCompare(b.nombre);
            });

            const matItems = allExplosionItems.filter(i => i.tipo === 'material');
            const moItems = allExplosionItems.filter(i => i.tipo === 'mano_de_obra');
            const eqItems = allExplosionItems.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor');
            const otrosItems = allExplosionItems.filter(i => i.tipo === 'otros');

            const totMateriales = matItems.reduce((acc, curr) => acc + curr.costo_total, 0);
            const totMO = moItems.reduce((acc, curr) => acc + curr.costo_total, 0);
            const totEq = eqItems.reduce((acc, curr) => acc + curr.costo_total, 0);
            const totOtros = otrosItems.reduce((acc, curr) => acc + curr.costo_total, 0);
            const totDirecto = totMateriales + totMO + totEq + totOtros;

            // Apply type filter
            let filteredItems = allExplosionItems;
            if (explosionTypeFilter === 'material') {
              filteredItems = matItems;
            } else if (explosionTypeFilter === 'mano_de_obra') {
              filteredItems = moItems;
            } else if (explosionTypeFilter === 'equipo') {
              filteredItems = eqItems;
            } else if (explosionTypeFilter === 'otros') {
              filteredItems = otrosItems;
            }

            // Apply search filter
            if (explosionSearch.trim()) {
              const q = explosionSearch.toLowerCase().trim();
              filteredItems = filteredItems.filter(i => 
                (i.nombre && i.nombre.toLowerCase().includes(q)) ||
                (i.codigo && i.codigo.toLowerCase().includes(q)) ||
                (i.unidad && i.unidad.toLowerCase().includes(q))
              );
            }

            const filteredTotalCost = filteredItems.reduce((acc, curr) => acc + curr.costo_total, 0);

            const handleExportCurrentExplosionPDF = () => {
              const filterParam = explosionTypeFilter === 'todos' ? undefined : explosionTypeFilter;
              handleGenerateExplosionPDF(filterParam);
            };

            const handleExportCurrentExplosionExcel = () => {
              let filterTitle = "EXPLOSIÓN GENERAL DE INSUMOS";
              if (explosionTypeFilter === 'material') filterTitle = "REPORTE DE INSUMOS - MATERIALES";
              else if (explosionTypeFilter === 'mano_de_obra') filterTitle = "REPORTE DE INSUMOS - MANO DE OBRA";
              else if (explosionTypeFilter === 'equipo') filterTitle = "REPORTE DE INSUMOS - EQUIPOS Y MAQUINARIA";
              else if (explosionTypeFilter === 'otros') filterTitle = "REPORTE DE INSUMOS - OTROS";

              generateExplosionExcel({
                currentPresupuesto,
                explosionData: filteredItems,
                title: filterTitle
              });
            };

            return (
              <div className="space-y-6 mb-12">
                {/* Header Superior y Acciones */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-sage/10 text-brand-sage flex items-center justify-center font-bold">
                      <Layers size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Explosión Consolidada de Insumos</h2>
                      <p className="text-xs text-gray-500">
                        Consolidación matemática de recursos en base a las cantidades de obra del proyecto
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCurrentExplosionPDF}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors"
                      title="Descargar reporte en formato PDF"
                    >
                      <FileText size={15} />
                      Exportar PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCurrentExplosionExcel}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors"
                      title="Descargar reporte en formato Excel .xlsx"
                    >
                      <Download size={15} />
                      Exportar Excel
                    </button>
                  </div>
                </div>

                {/* 5 Tarjetas KPI Ejecutivas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Tarjeta Costo Directo */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl p-4 shadow-sm border border-gray-700 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Costo Directo</span>
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                        <Calculator size={15} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-white">${totDirecto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-300 mt-2 pt-2 border-t border-white/10">
                        <span>{allExplosionItems.length} insumos totales</span>
                        <span className="font-semibold text-emerald-400">100% CD</span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Materiales */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 hover:border-blue-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Materiales</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Package size={15} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-blue-900">${totMateriales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span>{matItems.length} ítems</span>
                        <span className="font-semibold text-blue-600">
                          {totDirecto > 0 ? ((totMateriales / totDirecto) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Mano de Obra */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-200 hover:border-amber-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Mano de Obra</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Users size={15} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-amber-900">${totMO.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span>{moItems.length} cuadrillas</span>
                        <span className="font-semibold text-amber-600">
                          {totDirecto > 0 ? ((totMO / totDirecto) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Equipos */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200 hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Equipos & Maq.</span>
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Wrench size={15} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-purple-900">${totEq.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span>{eqItems.length} máquinas</span>
                        <span className="font-semibold text-purple-600">
                          {totDirecto > 0 ? ((totEq / totDirecto) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Otros */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Otros / Varios</span>
                      <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                        <Boxes size={15} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tight text-gray-800">${totOtros.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span>{otrosItems.length} especiales</span>
                        <span className="font-semibold text-gray-600">
                          {totDirecto > 0 ? ((totOtros / totDirecto) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtros de Categoría y Barra de Búsqueda */}
                <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Pills de Filtrado */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setExplosionTypeFilter('todos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        explosionTypeFilter === 'todos'
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        explosionTypeFilter === 'todos' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {allExplosionItems.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExplosionTypeFilter('material')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        explosionTypeFilter === 'material'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Materiales
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        explosionTypeFilter === 'material' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-800'
                      }`}>
                        {matItems.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExplosionTypeFilter('mano_de_obra')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        explosionTypeFilter === 'mano_de_obra'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      Mano de Obra
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        explosionTypeFilter === 'mano_de_obra' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {moItems.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExplosionTypeFilter('equipo')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        explosionTypeFilter === 'equipo'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      Equipos
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        explosionTypeFilter === 'equipo' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-800'
                      }`}>
                        {eqItems.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExplosionTypeFilter('otros')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        explosionTypeFilter === 'otros'
                          ? 'bg-gray-700 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Otros
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        explosionTypeFilter === 'otros' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-800'
                      }`}>
                        {otrosItems.length}
                      </span>
                    </button>
                  </div>

                  {/* Input de Búsqueda */}
                  <div className="relative min-w-[260px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar insumo o código..."
                      value={explosionSearch}
                      onChange={(e) => setExplosionSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white transition-all text-gray-800"
                    />
                    {explosionSearch && (
                      <button
                        type="button"
                        onClick={() => setExplosionSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabla de Insumos Ejecutiva */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[11px]">
                        <tr>
                          <th className="px-4 py-3.5 w-24">Cód.</th>
                          <th className="px-4 py-3.5">Descripción del Insumo</th>
                          <th className="px-4 py-3.5 text-center w-32">Categoría</th>
                          <th className="px-4 py-3.5 text-center w-20">Und</th>
                          <th className="px-4 py-3.5 text-right w-32">Cant. Requerida</th>
                          <th className="px-4 py-3.5 text-right w-28">P. Unitario</th>
                          <th className="px-4 py-3.5 text-right w-32">Costo Total</th>
                          <th className="px-4 py-3.5 text-right w-28">% Incidencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredItems.map((ins, idx) => {
                          const cant = Number(ins.cantidad_total || 0);
                          const pu = Number(ins.costo || 0);
                          const cTot = Number(ins.costo_total || 0);
                          const pct = totDirecto > 0 ? (cTot / totDirecto) * 100 : 0;

                          // Categoría badge
                          let badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
                          let badgeLabel = ins.tipo || 'General';
                          if (ins.tipo === 'material') {
                            badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                            badgeLabel = "Material";
                          } else if (ins.tipo === 'mano_de_obra') {
                            badgeClass = "bg-amber-50 text-amber-800 border-amber-200";
                            badgeLabel = "Mano de Obra";
                          } else if (ins.tipo === 'equipo' || ins.tipo === 'herramienta_menor') {
                            badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
                            badgeLabel = "Equipo / Maq.";
                          } else if (ins.tipo === 'otros') {
                            badgeClass = "bg-gray-100 text-gray-600 border-gray-300";
                            badgeLabel = "Otros";
                          }

                          return (
                            <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                              <td className="px-4 py-3 font-mono text-gray-500 font-medium">
                                {ins.codigo || '-'}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {ins.nombre}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                                  {badgeLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-500 font-mono">
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-gray-700">
                                  {ins.unidad || 'UND'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-black text-gray-900 font-mono">
                                {cant.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600 font-mono">
                                ${pu.toFixed(4)}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-gray-900 font-mono">
                                ${cTot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-brand-sage h-full rounded-full" 
                                      style={{ width: `${Math.min(pct * 2, 100)}%` }} 
                                    />
                                  </div>
                                  <span className="font-mono text-[10px] text-gray-500 w-9 text-right font-semibold">
                                    {pct.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredItems.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-16">
                              <div className="max-w-xs mx-auto text-gray-400 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                                  <Layers size={24} />
                                </div>
                                <p className="font-bold text-gray-700 text-sm">No se encontraron insumos</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {explosionSearch 
                                    ? `No hay coincidencias para "${explosionSearch}".` 
                                    : "Verifica que los rubros del presupuesto tengan recetas con insumos asignados."}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>

                      {filteredItems.length > 0 && (
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300 font-bold text-gray-900">
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-right text-[11px] text-gray-500 uppercase tracking-wider">
                              Subtotal Insumos Filtrados ({filteredItems.length} ítems):
                            </td>
                            <td colSpan={3} className="px-4 py-3 text-right font-black text-sm text-brand-dark font-mono">
                              ${filteredTotalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-700">
                              {totDirecto > 0 ? ((filteredTotalCost / totDirecto) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            );
        })()}

        {activeTab === 'vae_sercop' && (
          <SercopVaeAnalyzer
            presupuesto={currentPresupuesto}
            presupuestoRubros={presupuestoRubros}
            rubrosRecipes={rubrosRecipes}
            costoDirectoTotal={costoDirectoTotal}
            granTotal={granTotal}
          />
        )}

{activeTab === 'reportes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full mb-10">
             <table className="w-full text-sm text-left divide-y divide-gray-200">
              <thead className="bg-brand-sage text-white font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3 text-center w-32">PDF</th>
                  <th className="px-6 py-3 text-center w-32">⚙</th>
                  <th className="px-6 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">Presupuesto</td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralPDF} className="bg-red-600 hover:bg-red-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <FileText size={14}/> PDF
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <Download size={14}/> Excel
                      </button>
                    </td>
                  <td className="px-6 py-4 text-gray-600">Totales del presupuesto.</td>
                </tr>
                <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">Análisis de Precios Unitarios (APUs)</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={handleGenerateAPUsPDF} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                          <Download size={14}/> Excel
                      </button>
                    </td>
                  <td className="px-6 py-4 text-gray-600">Análisis de precios unitarios.</td>
                </tr>
                <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">Precios unitarios elementales (PUEs)</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleGenerateExplosionPDF()} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                        <FileText size={14}/> Generar
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                          <Download size={14}/> Excel
                      </button>
                    </td>
                  <td className="px-6 py-4 text-gray-600">Precios unitarios elementales.</td>
                </tr>
                <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">Equipo</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleGenerateExplosionPDF('equipo')} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                          <Download size={14}/> Excel
                      </button>
                    </td>
                  <td className="px-6 py-4 text-gray-600">Totales de maquinaria y equipos del presupuesto. En unidades comerciales.</td>
                </tr>
                <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">Mano de obra</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleGenerateExplosionPDF('mano_de_obra')} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                          <Download size={14}/> Excel
                      </button>
                    </td>
                  <td className="px-6 py-4 text-gray-600">Totales de mano de obra del presupuesto. En unidades comerciales.</td>
                </tr>
                <tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">Materiales</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleGenerateExplosionPDF('material')} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                      <FileText size={14}/> Generar
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={handleGeneratePresupuestoGeneralExcel} className="bg-green-600 hover:bg-green-700 text-white w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                          <Download size={14}/> Excel
                      </button>
                    </td>
                  <td className="px-6 py-4 text-gray-600">Totales de materiales agrupados por categorías. En unidades comerciales.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'red_agentes' && (
          <div className="w-full mb-12 space-y-8">
            {/* 1. Co-Piloto Asesor Interactivo con Consultor Senior, Persistencia en sara_ai_advisory_logs y Exportables */}
            <SaraCoPilotAdvisor
              proyectoId={currentPresupuesto?.id || activeProject?.id || 'presupuesto-activo'}
              nombreProyecto={currentPresupuesto?.nombre_proyecto || activeProject?.nombre || "Obra Activa"}
              ubicacion={activeProject?.ubicacion || "Cuenca, Azuay"}
              costoDirectoTotal={costoDirectoTotal || currentPresupuesto?.costo_directo_total || 45200}
              volumenDesalojoM3={Math.max(30, Math.round((costoDirectoTotal || 45200) / 1000))}
            />

            {/* 2. Topologia de la Red de Agentes Colectivos */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-500" />
                  <span>Topología y Sincronización de la Red Colectiva de Agentes (8 Nodos)</span>
                </h3>
              </div>
              <AgentNetworkChoreography
                initialContext={{
                  nombre: currentPresupuesto?.nombre_proyecto || activeProject?.nombre || "Obra Activa",
                  provincia: activeProject?.ubicacion?.includes(',') ? activeProject.ubicacion.split(',')[1].trim() : "Azuay",
                  ciudad: activeProject?.ubicacion?.split(',')[0].trim() || "Cuenca",
                  areaM2: Math.max(80, Math.round((costoDirectoTotal || 50000) / 480)),
                  tipologia: 'Residencial',
                  costoReferencial: costoDirectoTotal || currentPresupuesto?.costo_directo_total || 51918,
                  rubros: (presupuestoRubros || []).map((r: any) => ({
                    codigo: r.codigo_rubro || r.codigo || 'R-00',
                    nombre: r.nombre_rubro || r.nombre || 'Rubro de obra',
                    unidad: r.unidad || 'und',
                    cantidad: Number(r.cantidad_obra || r.cantidad || 1),
                    subtotal: Number(r.subtotal || 0)
                  }))
                }}
                autoRun={true}
              />
            </div>
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
        {isRecipeModalOpen && (
          <RecipeModal
            currentRecipeRubro={currentRecipeRubro}
            setIsRecipeModalOpen={setIsRecipeModalOpen}
            fetchPresupuestoRubros={fetchPresupuestoRubros}
            currentPresupuestoId={currentPresupuesto?.id}
            rubrosRecipes={rubrosRecipes}
            renderGroupedInsumos={renderGroupedInsumos}
            handleSyncRecipeToMaster={handleSyncRecipeToMaster}
            userRole={userRole}
            insumoSearch={insumoSearch}
            setInsumoSearch={setInsumoSearch}
            searchingInsumos={searchingInsumos}
            allInsumos={allInsumos}
            handleAddInsumoToRecipe={handleAddInsumoToRecipe}
          />
        )}
        {/* Modal Justificación Analítica Indirectos (AIU) */}
        <IndirectosAnaliticoModal
          isOpen={isIndirectosModalOpen}
          onClose={() => setIsIndirectosModalOpen(false)}
          costoDirectoTotal={costoDirectoTotal}
          projectName={currentPresupuesto?.nombre_proyecto || 'Proyecto'}
          onApplyPercentages={(adminPct, impPct, utilPct) => {
            setIndForm(prev => ({
              ...prev,
              ggen: adminPct,
              pimp: impPct,
              util: utilPct
            }))
          }}
        />
      </div>
    )
  }

    return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div><h1 className="text-3xl font-black text-brand-dark">Presupuestos APU Reales</h1><p className="text-gray-500">Crea presupuestos detallados por rubros, cantidades de obra y costos indirectos (AIU).</p></div>
        {userRole === 'admin' && (
            <div className="flex gap-3">
              <button onClick={() => setIsBimModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-full hover:shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                <Cuboid size={20} /> Importación BIM
              </button>
              <button onClick={() => openNewPresupuestoModal()} className="bg-brand-sage text-white font-semibold py-2.5 px-5 rounded-full hover:shadow-md hover:opacity-90 transition-all flex items-center gap-2"><Plus size={20} /> Nuevo Presupuesto</button>
            </div>
          )}
      </div>

      {/* Banner Contextual de Espacio de Trabajo / Obra Activa */}
      <div className={`p-4 rounded-2xl mb-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs ${
        !isGlobalMode && activeProject
          ? "bg-gradient-to-r from-blue-50 to-indigo-50/70 border-blue-200 dark:from-slate-900 dark:to-blue-950/40 dark:border-blue-900/60"
          : "bg-gray-50 border-gray-200 dark:bg-slate-900/50 dark:border-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
            !isGlobalMode && activeProject
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
          }`}>
            {!isGlobalMode && activeProject ? "🏗️" : "🌐"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {!isGlobalMode && activeProject ? "Espacio de Trabajo Activo" : "Vista Global Multi-Obra"}
              </span>
              {!isGlobalMode && activeProject && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  {activeProject.provincia}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {!isGlobalMode && activeProject ? activeProject.nombre : "Todos los Proyectos y Presupuestos"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {!isGlobalMode && activeProject 
                ? "Filtrando presupuestos, explosión de insumos y AIU exclusivamente para esta obra."
                : "Visualizando el portafolio consolidado de todas tus obras en Ecuador."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isGlobalMode && activeProject ? (
            <button
              onClick={() => setGlobalMode()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              🌐 Ver Todas las Obras
            </button>
          ) : (
            <button
              onClick={() => openCreateModal()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              + Nueva Obra
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-900/5 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <input 
            type="text" 
            placeholder="Buscar por proyecto o cliente..." 
            value={searchPresupuesto} 
            onChange={(e) => setSearchPresupuesto(e.target.value)} 
            className="w-full max-w-md px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" 
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Total en vista: {filteredPresupuestos.length} presupuestos
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Costo Directo</th>
                <th className="px-6 py-4 text-right">Gran Total</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {filteredPresupuestos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <p className="text-sm font-semibold">
                        {!isGlobalMode && activeProject
                          ? `No se encontraron presupuestos registrados para "${activeProject.nombre}".`
                          : "No hay presupuestos que coincidan con la búsqueda."}
                      </p>
                      {!isGlobalMode && activeProject && (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openNewPresupuestoModal(activeProject.nombre)}
                            className="px-4 py-2 bg-brand-sage text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                          >
                            + Crear Presupuesto para {activeProject.nombre}
                          </button>
                          <button
                            onClick={() => setGlobalMode()}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Ver Todas las Obras
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPresupuestos.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-sage/5 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => openEditor(p)}>
                    <td className="px-6 py-3">
                      <div className="font-bold text-brand-dark dark:text-white text-sm">{p.nombre_proyecto}</div>
                    </td>
                    <td className="px-6 py-3">
                      {p.cliente ? (
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                            {p.cliente.nombre?.[0] || 'C'}
                          </div>
                          <span>{p.cliente.nombre} {p.cliente.apellido}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin cliente</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${p.estado === 'aprobado' || p.estado === 'enviado' || p.estado === 'Entregado' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'}`}>
                        {p.estado || 'borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-medium">${Number(p.costo_directo_total || 0).toFixed(2)}</td>
                    <td className="px-6 py-3 text-right font-black text-brand-sage">${Number(p.gran_total || 0).toFixed(2)}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditor(p);
                            setActiveTab('red_agentes');
                          }} 
                          title="Analizar con Red de Agentes IA"
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs mr-1"
                        >
                          <Cpu size={13} className="text-amber-500" />
                          <span>Red Agentes</span>
                        </button>
                        <button 
                          onClick={() => openEditor(p)} 
                          className="text-brand-sage font-bold mr-1 text-xs hover:underline"
                        >
                          Editar / Ver
                        </button>
                        <button 
                          onClick={(e) => openEditMetaModal(p, e)} 
                          title="Reasignar Proyecto / Cliente" 
                          className="text-gray-400 hover:text-emerald-600 p-1.5 transition-colors rounded hover:bg-emerald-50"
                        >
                          <Edit3 size={16}/>
                        </button>
                        <button 
                          onClick={(e) => openCloneModal(p, e)} 
                          title="Duplicar para otro Proyecto o Cliente" 
                          className="text-gray-400 hover:text-blue-500 p-1.5 transition-colors rounded hover:bg-blue-50"
                        >
                          <Copy size={16}/>
                        </button>
                        {userRole === 'admin' && (
                          <button 
                            onClick={(e) => handleDeletePresupuesto(p.id, e)} 
                            title="Eliminar Presupuesto" 
                            className="text-gray-400 hover:text-red-500 p-1.5 transition-colors rounded hover:bg-red-50"
                          >
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  🏗️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nuevo Presupuesto de Obra</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Asigna la obra y define los porcentajes de indirectos (AIU)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDirectCreatePresupuesto} className="p-6 space-y-4">
              {/* Selector / Asignación de Obra */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Proyecto / Obra Asignada
                </label>

                <div className="space-y-2.5">
                  <select
                    value={isCustomProject ? "__CUSTOM__" : selectedProjectName}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === "__CUSTOM__") {
                        setIsCustomProject(true)
                        setSelectedProjectName("")
                      } else {
                        setIsCustomProject(false)
                        setSelectedProjectName(val)
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="" disabled>-- Selecciona el proyecto para este presupuesto --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre} {p.provincia ? `• ${p.provincia}` : ""} {activeProject?.id === p.id ? " (Obra Activa)" : ""}
                      </option>
                    ))}
                    <option value="__CUSTOM__">✍️ Escribir otro nombre de proyecto...</option>
                  </select>

                  {isCustomProject ? (
                    <div className="relative animate-in fade-in duration-200">
                      <input
                        type="text"
                        placeholder="Escribe el nombre de la obra (ej: Residencial Las Palmeras)"
                        value={selectedProjectName}
                        onChange={(e) => setSelectedProjectName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-blue-400 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        autoFocus
                      />
                      {projects.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomProject(false)
                            setSelectedProjectName(activeProject?.nombre || projects[0]?.nombre || "")
                          }}
                          className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-1.5 inline-block"
                        >
                          ↩ Volver a seleccionar de mis obras registradas
                        </button>
                      )}
                    </div>
                  ) : (
                    selectedProjectName && (
                      <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            ✓
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                              Presupuesto se creará bajo:
                            </span>
                            <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                              {selectedProjectName}
                            </div>
                          </div>
                        </div>
                        {activeProject?.nombre === selectedProjectName ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0">
                            Obra activa
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                            Cambiará a esta obra
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Parámetros de Indirectos (AIU) */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-2">
                  Porcentajes de Indirectos de la Obra (AIU)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      ADMIN (%)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newAdminPct}
                      onChange={(e) => setNewAdminPct(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-right font-bold text-gray-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      IMPREV (%)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newImprevPct}
                      onChange={(e) => setNewImprevPct(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-right font-bold text-gray-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      UTILIDAD (%)
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={newUtilPct}
                      onChange={(e) => setNewUtilPct(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm bg-white dark:bg-slate-800 text-right font-bold text-gray-900 dark:text-white" 
                    />
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsNewModalOpen(false)} 
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {createMutation.isPending ? "Creando Presupuesto..." : "Crear Presupuesto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DUPLICAR PRESUPUESTO */}
      {isCloneModalOpen && cloneSource && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Copy size={20} className="text-brand-sage" /> Duplicar Presupuesto
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Asigna esta copia a otro proyecto y cliente de tu empresa.
                </p>
              </div>
              <button onClick={() => !isCloning && setIsCloneModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Presupuesto Origen */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                  <span>Presupuesto origen a duplicar:</span>
                </div>
                <div className="text-sm font-semibold">{cloneSource.nombre_proyecto}</div>
                <div className="text-amber-800/80 mt-0.5">
                  Se copiarán automáticamente todos sus rubros, insumos, cantidades y fórmulas de costos indirectos.
                </div>
              </div>

              {/* Selector de Modo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Destino del Presupuesto Duplicado</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCloneDestinoTipo('crm')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${cloneDestinoTipo === 'crm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Proyecto de CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCloneDestinoTipo('manual');
                      if (cloneDestinoTipo === 'crm') {
                        setCloneNombreProyecto(cloneSource.nombre_proyecto + ' (Copia)');
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${cloneDestinoTipo === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Nombre Personalizado
                  </button>
                </div>
              </div>

              {cloneDestinoTipo === 'crm' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Seleccionar Proyecto de "MIS PROYECTOS"
                  </label>
                  <AsyncSelect
    table="proyectos"
    selectFields="id, nombre, cliente_id, cliente:clientes(id, nombre, apellido, email)"
    searchColumns={['nombre']}
    displayFormat={(p) => p ? `${p.nombre} ${p.cliente ? `(${p.cliente.nombre} ${p.cliente.apellido})` : ''}` : ''}
    value={cloneProyectoCrmId ? { id: cloneProyectoCrmId, nombre: cloneNombreProyecto } : null}
    onChange={(p) => {
      if (p) {
        setCloneProyectoCrmId(p.id);
        setCloneNombreProyecto(p.nombre);
        if (p.cliente_id) setCloneClienteId(p.cliente_id);
      } else {
        setCloneProyectoCrmId('');
        setCloneNombreProyecto(cloneSource.nombre_proyecto + ' (Copia)');
      }
    }}
    placeholder="-- Buscar proyecto... --"
    className="w-full min-w-0"
  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Al seleccionar un proyecto, se asignará su nombre y su cliente automáticamente.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombre del Nuevo Proyecto / Presupuesto *
                  </label>
                  <input
                    type="text"
                    value={cloneNombreProyecto}
                    onChange={(e) => setCloneNombreProyecto(e.target.value)}
                    placeholder="Ej. Casa de Playa - Familia López"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"
                  />
                </div>
              )}

              {/* Selector de Cliente */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cliente Asignado
                </label>
                <AsyncSelect
    table="clientes"
    selectFields="id, nombre, apellido, email"
    searchColumns={['nombre', 'apellido', 'email']}
    displayFormat={(c) => c ? `${c.nombre} ${c.apellido}` : ''}
    value={cloneClienteId ? { id: cloneClienteId, nombre: 'Cliente', apellido: 'Asignado' } : null}
    onChange={(c) => {
      if (c) {
        setCloneClienteId(c.id);
      } else {
        setCloneClienteId('');
      }
    }}
    placeholder="-- Buscar cliente... --"
    className="w-full min-w-0"
  />
                <p className="text-[11px] text-gray-400 mt-1">
                  Puedes cambiar el cliente libremente o asignarlo más adelante.
                </p>
              </div>

              {/* Footer acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  disabled={isCloning}
                  onClick={() => setIsCloneModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isCloning || !cloneNombreProyecto.trim()}
                  onClick={executeClonePresupuesto}
                  className="px-6 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isCloning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Duplicando...
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Duplicar y Asignar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REASIGNAR PROYECTO / CLIENTE */}
      {isEditMetaModalOpen && metaTargetPresupuesto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 size={20} className="text-brand-sage" /> Reasignar Proyecto y Cliente
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Modifica a qué proyecto o cliente pertenece este presupuesto.
                </p>
              </div>
              <button onClick={() => !isSavingMeta && setIsEditMetaModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Presupuesto actual */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
                <div className="text-[11px] uppercase font-bold text-slate-500">Presupuesto actual:</div>
                <div className="text-sm font-bold text-gray-900">{metaTargetPresupuesto.nombre_proyecto}</div>
                <div className="text-slate-500 mt-0.5">
                  Cliente actual: <strong>{metaTargetPresupuesto.cliente ? `${metaTargetPresupuesto.cliente.nombre} ${metaTargetPresupuesto.cliente.apellido}` : 'Sin cliente'}</strong>
                </div>
              </div>

              {/* Selector de Modo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Asignar Proyecto</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMetaDestinoTipo('crm')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${metaDestinoTipo === 'crm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Vincular a Proyecto CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaDestinoTipo('manual')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${metaDestinoTipo === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    Escribir Nombre Libre
                  </button>
                </div>
              </div>

              {metaDestinoTipo === 'crm' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Seleccionar de "MIS PROYECTOS"
                  </label>
                  <AsyncSelect
    table="proyectos"
    selectFields="id, nombre, cliente_id, cliente:clientes(id, nombre, apellido, email)"
    searchColumns={['nombre']}
    displayFormat={(p) => p ? `${p.nombre} ${p.cliente ? `(${p.cliente.nombre} ${p.cliente.apellido})` : ''}` : ''}
    value={metaProyectoCrmId ? { id: metaProyectoCrmId, nombre: metaNombreProyecto } : null}
    onChange={(p) => {
      if (p) {
        setMetaProyectoCrmId(p.id);
        setMetaNombreProyecto(p.nombre);
        if (p.cliente_id) setMetaClienteId(p.cliente_id);
      } else {
        setMetaProyectoCrmId('');
        setMetaNombreProyecto('');
      }
    }}
    placeholder="-- Buscar proyecto... --"
    className="w-full min-w-0"
  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={metaNombreProyecto}
                    onChange={(e) => setMetaNombreProyecto(e.target.value)}
                    placeholder="Nombre del proyecto..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-brand-sage focus:outline-none"
                  />
                </div>
              )}

              {/* Selector de Cliente */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cliente Asignado
                </label>
                <AsyncSelect
    table="clientes"
    selectFields="id, nombre, apellido, email"
    searchColumns={['nombre', 'apellido', 'email']}
    displayFormat={(c) => c ? `${c.nombre} ${c.apellido}` : ''}
    value={metaClienteId ? { id: metaClienteId, nombre: 'Cliente', apellido: 'Asignado' } : null}
    onChange={(c) => {
      if (c) {
        setMetaClienteId(c.id);
      } else {
        setMetaClienteId('');
      }
    }}
    placeholder="-- Buscar cliente... --"
    className="w-full min-w-0"
  />
              </div>

              {/* Footer acciones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  disabled={isSavingMeta}
                  onClick={() => setIsEditMetaModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSavingMeta || !metaNombreProyecto.trim()}
                  onClick={executeSaveMeta}
                  className="px-6 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingMeta ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BIM */}
      {isBimModalOpen && (
        <BimImporterModal 
          onClose={() => setIsBimModalOpen(false)}
          onImport={(data) => {
            setBimDataToProcess(data);
            setIsBimModalOpen(false);
            setIsNewModalOpen(true);
          }}
        />
      )}
    </div>
  )
}
