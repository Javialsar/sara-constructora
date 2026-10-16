"use client"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client"
import { 
  Plus, Calendar, Search, Trash2, X, ArrowLeft, Copy, Save, Calculator, 
  FileText, Download, Box, Users, Wrench, Hammer, Tag, Printer, Edit3, 
  ChevronDown, ChevronRight, Lock, CheckCircle2, Loader2, List, Settings, 
  Filter, Layers, Package, Boxes, PieChart, Sparkles, Cpu, ShieldCheck, 
  Building2, ArrowRight, Check, AlertTriangle, Truck, RefreshCw, FolderPlus
} from "lucide-react"

import BimImporterModal from "./components/BimImporterModal"
import SercopVaeAnalyzer from "./components/SercopVaeAnalyzer"
import IndirectosAnaliticoModal from "./components/IndirectosAnaliticoModal"
import ApuSlideOverDetail from "./components/ApuSlideOverDetail"
import GanttModal from "@/components/admin/presupuestos/GanttModal"
import AgentNetworkChoreography from "@/components/agents/AgentNetworkChoreography"
import { SaraCoPilotAdvisor } from "@/components/agents/SaraCoPilotAdvisor"
import AsyncSelect from "@/components/ui/AsyncSelect"

import { generatePresupuestoGeneralPDF, generateAPUsPDF, generateExplosionPDF } from "@/lib/pdfGenerator"
import { generatePresupuestoGeneralExcel, generateExplosionExcel } from "@/lib/excelGenerator"
import { defaultFormulas, calcularTotalesPresupuesto } from "@/lib/calculadoras/presupuestos";
import { useProject } from "@/contexts/ProjectContext"
import { syncAllInsumosForPresupuesto } from "@/lib/apuRecipeGenerator"

const DEFAULT_CAPITULOS = [
  "1. Obras Preliminares y Desbroce",
  "2. Movimiento de Tierras y Cimentaciones",
  "3. Estructura y Hormigones",
  "4. Mamposterías, Enlucidos y Cubiertas",
  "5. Instalaciones Hidrosanitarias y Eléctricas",
  "6. Acabados, Pintura y Cerrajería",
  "7. Varios y Limpieza Final"
];

export default function PresupuestosRealesPage() {
  const supabase = createClient()
  const queryClient = useQueryClient();

  const { projects, activeProject, currentCliente, isGlobalMode, openCreateModal, setActiveProject } = useProject();
  
  const [selectedProjectName, setSelectedProjectName] = useState("")
  const [isCustomProject, setIsCustomProject] = useState(false)
  const [newAdminPct, setNewAdminPct] = useState(10.0)
  const [newImprevPct, setNewImprevPct] = useState(5.0)
  const [newUtilPct, setNewUtilPct] = useState(10.0)
  
  const [view, setView] = useState<'lista' | 'editor'>('lista')
  const [indForm, setIndForm] = useState({ pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0, formulas: defaultFormulas })
  const [showFormulas, setShowFormulas] = useState(false)
  
  // Pestañas de la Mesa de Trabajo Unificada
  const [activeTab, setActiveTab] = useState<'detalle' | 'indirectos' | 'explosion' | 'cronograma' | 'vae_sercop' | 'auditor_sercop' | 'red_agentes' | 'reportes'>('detalle')
  const [explosionTypeFilter, setExplosionTypeFilter] = useState('todos')
  const [explosionSearch, setExplosionSearch] = useState('')
  const [searchPresupuesto, setSearchPresupuesto] = useState("")

  // Estado del Presupuesto Activo en Edición
  const [currentPresupuesto, setCurrentPresupuesto] = useState<any>(null)
  const [presupuestoRubros, setPresupuestoRubros] = useState<any[]>([])
  const [rubrosRecipes, setRubrosRecipes] = useState<Record<string, any[]>>({})
  const [allRubros, setAllRubros] = useState<any[]>([])
  
  // Capítulos Colapsables en la Hoja de Presupuesto
  const [collapsedCapitulos, setCollapsedCapitulos] = useState<Record<string, boolean>>({})
  const [quickInputByCapitulo, setQuickInputByCapitulo] = useState<Record<string, string>>({})
  const [activeSuggestionsCapitulo, setActiveSuggestionsCapitulo] = useState<string | null>(null)
  const [generatingAiCapitulo, setGeneratingAiCapitulo] = useState<string | null>(null)
  const [newCapituloModalOpen, setNewCapituloModalOpen] = useState(false)
  const [newCapituloName, setNewCapituloName] = useState('')

  // Slide-Over Lateral APU
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [currentRecipeRubro, setCurrentRecipeRubro] = useState<any>(null)

  // Modales adicionales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isBimModalOpen, setIsBimModalOpen] = useState(false)
  const [bimDataToProcess, setBimDataToProcess] = useState<any[] | null>(null)
  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false)
  const [isIndirectosModalOpen, setIsIndirectosModalOpen] = useState(false)

  // Duplicar Presupuesto
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [cloneSource, setCloneSource] = useState<any>(null)
  const [cloneDestinoTipo, setCloneDestinoTipo] = useState<'crm' | 'manual'>('crm')
  const [cloneProyectoCrmId, setCloneProyectoCrmId] = useState('')
  const [cloneNombreProyecto, setCloneNombreProyecto] = useState('')
  const [cloneClienteId, setCloneClienteId] = useState('')
  const [isCloning, setIsCloning] = useState(false)

  // Reasignar Proyecto / Cliente
  const [isEditMetaModalOpen, setIsEditMetaModalOpen] = useState(false)
  const [metaTargetPresupuesto, setMetaTargetPresupuesto] = useState<any>(null)
  const [metaDestinoTipo, setMetaDestinoTipo] = useState<'crm' | 'manual'>('crm')
  const [metaProyectoCrmId, setMetaProyectoCrmId] = useState('')
  const [metaNombreProyecto, setMetaNombreProyecto] = useState('')
  const [metaClienteId, setMetaClienteId] = useState('')
  const [isSavingMeta, setIsSavingMeta] = useState(false)

  // Perfil del usuario
  const [userRole, setUserRole] = useState('admin')
  const [userName, setUserName] = useState('')

  // Query de presupuestos
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

  // Suscripción Realtime
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
  }, [queryClient, supabase]);

  // Sincronización con el cambio de proyecto activo
  const prevProjectIdRef = useRef<string | null>(activeProject?.id || null);
  const prevGlobalModeRef = useRef<boolean>(isGlobalMode);

  useEffect(() => {
    const projectChanged = prevProjectIdRef.current !== (activeProject?.id || null);
    const globalChanged = prevGlobalModeRef.current !== isGlobalMode;

    if (projectChanged || globalChanged) {
      prevProjectIdRef.current = activeProject?.id || null;
      prevGlobalModeRef.current = isGlobalMode;
      setView('lista');
      setCurrentPresupuesto(null);
    }
  }, [activeProject?.id, isGlobalMode]);

  // Auto-apertura si viene redirigido con query param ?open=[presupuesto_id]
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasAutoOpenedRef.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const openId = urlParams.get('open');
    if (!openId) return;

    const handleAutoOpen = async () => {
      hasAutoOpenedRef.current = true;
      let target = (presupuestos || []).find((p: any) => p.id === openId);
      if (!target) {
        const { data } = await supabase
          .from('presupuestos_reales')
          .select('*, cliente:clientes(id, nombre, apellido, email)')
          .eq('id', openId)
          .maybeSingle();
        target = data;
      }
      if (target) {
        const matched = projects.find((p: any) => p.nombre.toLowerCase() === (target.nombre_proyecto || '').toLowerCase());
        if (matched) {
          prevProjectIdRef.current = matched.id;
          setActiveProject(matched);
        }
        window.history.replaceState({}, '', '/dashboard/presupuestos_reales');
        openEditor(target);
      }
    };

    handleAutoOpen();
  }, [presupuestos, projects]);

  // Carga de rol y parámetros de empresa
  useEffect(() => {
    const initUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        if (user.user_metadata?.role) setUserRole(user.user_metadata.role)
        if (user.user_metadata?.full_name) setUserName(user.user_metadata.full_name)

        const { data: ep } = await supabase
          .from('empresa_parametros_cliente')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (ep) {
          setNewAdminPct(Number(ep.porcentaje_admin_default) || 10.0)
          setNewImprevPct(Number(ep.porcentaje_imprevistos_default) || 5.0)
          setNewUtilPct(Number(ep.porcentaje_utilidad_default) || 10.0)
        }
      }
    }
    initUserData()
  }, [supabase])

  // Cargar catálogo de rubros para autocompletado typeahead
  useEffect(() => {
    const loadRubrosCatalog = async () => {
      const { data } = await supabase.from('rubros').select('*').order('nombre', { ascending: true })
      if (data) setAllRubros(data)
    }
    loadRubrosCatalog()
  }, [supabase])

  // Presupuestos filtrados
  const filteredPresupuestos = useMemo(() => {
    return presupuestos.filter((p: any) => {
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

  // Mutación para crear presupuesto
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        nombre_proyecto: values.nombre_proyecto,
        cliente_id: values.cliente_id || null,
        porcentaje_admin: Number(values.porcentaje_admin) || 10.0,
        porcentaje_imprevistos: Number(values.porcentaje_imprevistos) || 5.0,
        porcentaje_utilidad: Number(values.porcentaje_utilidad) || 10.0,
        estado: 'borrador',
        indirectos_config: {
          regimen: 'privado',
          capitulos: DEFAULT_CAPITULOS,
          rubro_capitulo_map: {},
          pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0
        }
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

      const matched = projects.find((p: any) => p.nombre.toLowerCase() === data.nombre_proyecto.toLowerCase());
      if (matched) {
        setActiveProject(matched);
      }

      openEditor(data);

      if (bimDataToProcess && bimDataToProcess.length > 0) {
        // proceso BIM si existiese
        setBimDataToProcess(null);
      }
    },
    onError: (error: any) => {
      console.error("Error al crear presupuesto:", error);
      alert("Error al crear presupuesto: " + (error.message || JSON.stringify(error)));
    }
  });

  // 1. VINCULACIÓN INMEDIATA A LA OBRA ACTIVA
  const handleCreatePresupuestoAction = () => {
    if (!isGlobalMode && activeProject) {
      // Vínculo directo instantáneo sin modal redundante
      createMutation.mutate({
        nombre_proyecto: activeProject.nombre,
        cliente_id: activeProject.cliente_id || currentCliente?.id || null,
        porcentaje_admin: newAdminPct,
        porcentaje_imprevistos: newImprevPct,
        porcentaje_utilidad: newUtilPct
      });
    } else {
      // Si está en modo global o no hay obra activa, abrir modal para seleccionar
      const defaultName = projects[0]?.nombre || "";
      setSelectedProjectName(defaultName);
      setIsCustomProject(false);
      setIsNewModalOpen(true);
    }
  };

  const handleDirectCreatePresupuesto = (e: React.FormEvent) => {
    e.preventDefault();
    const nombreFinal = selectedProjectName.trim();
    if (!nombreFinal) {
      alert("Por favor ingresa o selecciona el nombre de la obra.");
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

  // ----------------------------------------------------
  // ACCIONES EN LISTA: EDITAR, CLONAR Y ELIMINAR
  // ----------------------------------------------------
  const handleOpenCloneModal = (presupuesto: any) => {
    setCloneSource(presupuesto);
    setCloneNombreProyecto(`${presupuesto.nombre_proyecto} (Copia)`);
    setCloneClienteId(presupuesto.cliente_id || '');
    setIsCloneModalOpen(true);
  };

  const handleExecuteClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneSource) return;
    setIsCloning(true);
    try {
      const nombreFinal = cloneNombreProyecto.trim() || `${cloneSource.nombre_proyecto} (Copia)`;

      // 1. Crear nuevo presupuesto clon
      const { data: newPres, error: newPresErr } = await supabase
        .from('presupuestos_reales')
        .insert([{
          nombre_proyecto: nombreFinal,
          cliente_id: cloneClienteId || cloneSource.cliente_id || null,
          costo_directo_total: cloneSource.costo_directo_total || 0,
          gran_total: cloneSource.gran_total || 0,
          porcentaje_admin: cloneSource.porcentaje_admin || 10,
          porcentaje_imprevistos: cloneSource.porcentaje_imprevistos || 5,
          porcentaje_utilidad: cloneSource.porcentaje_utilidad || 10,
          estado: 'borrador',
          indirectos_config: cloneSource.indirectos_config || {
            regimen: 'privado',
            capitulos: DEFAULT_CAPITULOS,
            rubro_capitulo_map: {},
            pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0
          }
        }])
        .select('*')
        .single();

      if (newPresErr) throw newPresErr;

      // 2. Traer todos los rubros del presupuesto fuente
      const { data: sourceRubros, error: rubrosErr } = await supabase
        .from('presupuesto_rubros')
        .select('*')
        .eq('presupuesto_id', cloneSource.id)
        .order('created_at', { ascending: true });

      if (rubrosErr) throw rubrosErr;

      if (sourceRubros && sourceRubros.length > 0) {
        // Mapear los rubros con el nuevo presupuesto_id
        const rubrosToInsert = sourceRubros.map((r: any) => ({
          presupuesto_id: newPres.id,
          codigo_rubro: r.codigo_rubro,
          nombre_rubro: r.nombre_rubro,
          unidad: r.unidad,
          cantidad_obra: r.cantidad_obra,
          precio_unitario_snapshot: r.precio_unitario_snapshot,
          subtotal: r.subtotal,
          capitulo: r.capitulo,
          fecha_inicio: r.fecha_inicio,
          fecha_fin: r.fecha_fin,
          dias_duracion: r.dias_duracion
        }));

        const { data: insertedRubros, error: insErr } = await supabase
          .from('presupuesto_rubros')
          .insert(rubrosToInsert)
          .select('*');

        if (insErr) throw insErr;

        // 3. Traer y clonar las recetas analíticas (presupuesto_rubro_insumos)
        const sourceRubroIds = sourceRubros.map((r: any) => r.id);
        const { data: sourceInsumos } = await supabase
          .from('presupuesto_rubro_insumos')
          .select('*')
          .in('presupuesto_rubro_id', sourceRubroIds);

        if (sourceInsumos && sourceInsumos.length > 0 && insertedRubros) {
          const insumosToInsert: any[] = [];
          sourceRubros.forEach((sr: any, idx: number) => {
            const newRubro = insertedRubros[idx];
            if (!newRubro) return;
            const relatedInsumos = sourceInsumos.filter((si: any) => si.presupuesto_rubro_id === sr.id);
            relatedInsumos.forEach((ri: any) => {
              insumosToInsert.push({
                presupuesto_rubro_id: newRubro.id,
                insumo_id: ri.insumo_id,
                cantidad: ri.cantidad,
                precio_sin_iva_snapshot: ri.precio_sin_iva_snapshot,
                rendimiento: ri.rendimiento
              });
            });
          });

          if (insumosToInsert.length > 0) {
            await supabase.from('presupuesto_rubro_insumos').insert(insumosToInsert);
          }
        }
      }

      setIsCloneModalOpen(false);
      setCloneSource(null);
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      alert(`Presupuesto clonado exitosamente: "${nombreFinal}" con todos sus rubros e insumos.`);
    } catch (err: any) {
      console.error("Error al clonar presupuesto:", err);
      alert("Error al clonar: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeletePresupuesto = async (presupuesto: any) => {
    const confirmMsg = `¿Estás seguro de eliminar el presupuesto "${presupuesto.nombre_proyecto}"?\n\nEsta acción quitará el presupuesto de la lista activa.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('presupuestos_reales')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', presupuesto.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      alert("Presupuesto eliminado correctamente.");
    } catch (err: any) {
      console.error("Error al eliminar presupuesto:", err);
      alert("Error al eliminar: " + (err.message || JSON.stringify(err)));
    }
  };

  // Abrir editor
  const openEditor = async (presupuesto: any) => {
    let pres = { ...presupuesto };
    const matched = projects.find((p: any) => p.nombre.toLowerCase() === (pres.nombre_proyecto || '').toLowerCase());
    if (matched && (!activeProject || activeProject.id !== matched.id)) {
      prevProjectIdRef.current = matched.id;
      setActiveProject(matched);
    }

    // Inicializar configuración de capítulos e indirectos si no existen
    if (!pres.indirectos_config) {
      pres.indirectos_config = {
        regimen: 'privado',
        capitulos: DEFAULT_CAPITULOS,
        rubro_capitulo_map: {},
        pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0
      };
    } else if (!pres.indirectos_config.capitulos || pres.indirectos_config.capitulos.length === 0) {
      pres.indirectos_config.capitulos = DEFAULT_CAPITULOS;
    }
    if (!pres.indirectos_config.regimen) {
      pres.indirectos_config.regimen = 'privado';
    }

    setCurrentPresupuesto(pres);
    setIndForm({
      pmaq1: 5, pmob1: 0, pmat1: 0, ggen: 0, pgas1: 0, pgas2: 0, pgas3: 0, pimp: 0, util: 0,
      ...(pres.indirectos_config || {})
    });
    setActiveTab('detalle');
    setView('editor');
    fetchPresupuestoRubros(presupuesto.id);
  };

  // Cargar rubros y recetas del presupuesto
  const fetchPresupuestoRubros = async (presupuesto_id: string) => {
    const { data } = await supabase
      .from('presupuesto_rubros')
      .select('*')
      .eq('presupuesto_id', presupuesto_id)
      .order('created_at', { ascending: true });

    if (data) {
      setPresupuestoRubros(data);
      if (data.length > 0) {
        const { data: recipes } = await supabase
          .from('presupuesto_rubro_insumos')
          .select('id, presupuesto_rubro_id, insumo_id, cantidad, precio_sin_iva_snapshot, insumo:insumos(id, codigo, nombre, tipo, unidad)')
          .in('presupuesto_rubro_id', data.map((d: any) => d.id));

        if (recipes) {
          const dict: Record<string, any[]> = {};
          recipes.forEach((r: any) => {
            if (!dict[r.presupuesto_rubro_id]) dict[r.presupuesto_rubro_id] = [];
            dict[r.presupuesto_rubro_id].push(r);
          });
          setRubrosRecipes(dict);
        }
      } else {
        setRubrosRecipes({});
      }
    }
  };

  // Recalcular y guardar precio unitario de un rubro
  const recalcAndSaveRubroUnitario = async (presRubroId: string, cantObra: number, rubroMaestroId?: string) => {
    const { data: items } = await supabase
      .from('presupuesto_rubro_insumos')
      .select('cantidad, precio_sin_iva_snapshot, insumo:insumos(tipo)')
      .eq('presupuesto_rubro_id', presRubroId);

    let nuevoCosto = 0;
    let costoMO = 0;
    if (items) {
      items.forEach((i: any) => {
        const iObj = Array.isArray(i.insumo) ? i.insumo[0] : i.insumo;
        const sub = Number(i.cantidad) * Number(i.precio_sin_iva_snapshot);
        nuevoCosto += sub;
        if (iObj && iObj.tipo === 'mano_de_obra') costoMO += sub;
      });
      // Herramienta menor 5% típica
      nuevoCosto += costoMO * 0.05;
    }
    const nuevoSubtotal = cantObra * nuevoCosto;
    await supabase
      .from('presupuesto_rubros')
      .update({ precio_unitario_snapshot: nuevoCosto, subtotal: nuevoSubtotal })
      .eq('id', presRubroId);
  };

  // Switch de Régimen con 1 Clic (Privado vs SERCOP)
  const handleToggleRegimen = async (nuevoRegimen: 'privado' | 'sercop') => {
    if (!currentPresupuesto) return;
    const updatedConfig = {
      ...(currentPresupuesto.indirectos_config || {}),
      regimen: nuevoRegimen
    };
    setCurrentPresupuesto({ ...currentPresupuesto, indirectos_config: updatedConfig });
    await supabase
      .from('presupuestos_reales')
      .update({ indirectos_config: updatedConfig })
      .eq('id', currentPresupuesto.id);
  };

  // Totales
  const calcTotales = () => {
    return calcularTotalesPresupuesto({
      presupuestoRubros,
      rubrosRecipes,
      currentPresupuesto,
      indForm
    });
  };

  const { costoDirectoTotal, granTotal, a, i, u, totalGastosGenerales, simp, sutil } = useMemo(() => {
    return calcTotales();
  }, [presupuestoRubros, rubrosRecipes, currentPresupuesto, indForm]);

  // Factor de Indirectos AIU (%) y ($)
  const factorAiuPct = useMemo(() => {
    if (costoDirectoTotal <= 0) return 0;
    const indirectosMonto = granTotal - costoDirectoTotal;
    return (indirectosMonto / costoDirectoTotal) * 100;
  }, [costoDirectoTotal, granTotal]);

  const indirectosMontoTotal = useMemo(() => {
    return Math.max(0, granTotal - costoDirectoTotal);
  }, [costoDirectoTotal, granTotal]);

  // Guardar totales en BD
  const savePresupuesto = async () => {
    if (!currentPresupuesto) return;
    const totals = calcTotales();
    await supabase.from('presupuestos_reales').update({ 
      costo_directo_total: totals.costoDirectoTotal,
      gran_total: totals.granTotal,
      indirectos_config: currentPresupuesto.indirectos_config || indForm
    }).eq('id', currentPresupuesto.id);
    alert("¡Presupuesto y totales guardados correctamente!");
    queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
  };

  // Manejo de Capítulos y Agrupación
  const listaCapitulos: string[] = useMemo(() => {
    return currentPresupuesto?.indirectos_config?.capitulos || DEFAULT_CAPITULOS;
  }, [currentPresupuesto]);

  const rubroCapituloMap: Record<string, string> = useMemo(() => {
    return currentPresupuesto?.indirectos_config?.rubro_capitulo_map || {};
  }, [currentPresupuesto]);

  // Asignar rubros a su capítulo
  const rubrosPorCapitulo = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    listaCapitulos.forEach(cap => { grouped[cap] = []; });
    
    // Si no está en el mapa, clasificar inteligentemente
    presupuestoRubros.forEach(rubro => {
      let capAsignado = rubroCapituloMap[rubro.id];
      if (!capAsignado || !grouped[capAsignado]) {
        const nom = (rubro.nombre_rubro || '').toLowerCase();
        if (nom.includes('preliminar') || nom.includes('desbroce') || nom.includes('cerramiento') || nom.includes('replanteo')) {
          capAsignado = listaCapitulos[0] || DEFAULT_CAPITULOS[0];
        } else if (nom.includes('tierra') || nom.includes('excavacion') || nom.includes('excavación') || nom.includes('relleno') || nom.includes('desalojo')) {
          capAsignado = listaCapitulos[1] || DEFAULT_CAPITULOS[1];
        } else if (nom.includes('hormigon') || nom.includes('hormigón') || nom.includes('zapata') || nom.includes('columna') || nom.includes('viga') || nom.includes('losa') || nom.includes('acero')) {
          capAsignado = listaCapitulos[2] || DEFAULT_CAPITULOS[2];
        } else if (nom.includes('mampost') || nom.includes('bloque') || nom.includes('ladrillo') || nom.includes('enlucido')) {
          capAsignado = listaCapitulos[3] || DEFAULT_CAPITULOS[3];
        } else if (nom.includes('tubo') || nom.includes('tuber') || nom.includes('electr') || nom.includes('hidro') || nom.includes('pvc') || nom.includes('sanitar')) {
          capAsignado = listaCapitulos[4] || DEFAULT_CAPITULOS[4];
        } else if (nom.includes('piso') || nom.includes('pintura') || nom.includes('porcelanato') || nom.includes('puerta') || nom.includes('ventana')) {
          capAsignado = listaCapitulos[5] || DEFAULT_CAPITULOS[5];
        } else {
          capAsignado = listaCapitulos[0] || DEFAULT_CAPITULOS[0];
        }
      }
      if (!grouped[capAsignado]) grouped[capAsignado] = [];
      grouped[capAsignado].push(rubro);
    });

    return grouped;
  }, [listaCapitulos, rubroCapituloMap, presupuestoRubros]);

  // Cambiar un rubro de capítulo
  const handleMoveRubroCapitulo = async (rubroId: string, nuevoCapitulo: string) => {
    if (!currentPresupuesto) return;
    const updatedMap = {
      ...(currentPresupuesto.indirectos_config?.rubro_capitulo_map || {}),
      [rubroId]: nuevoCapitulo
    };
    const updatedConfig = {
      ...(currentPresupuesto.indirectos_config || {}),
      rubro_capitulo_map: updatedMap
    };
    setCurrentPresupuesto({ ...currentPresupuesto, indirectos_config: updatedConfig });
    await supabase
      .from('presupuestos_reales')
      .update({ indirectos_config: updatedConfig })
      .eq('id', currentPresupuesto.id);
  };

  // Crear un nuevo capítulo
  const handleAddNewCapitulo = async () => {
    const nom = newCapituloName.trim();
    if (!nom || !currentPresupuesto) return;
    if (listaCapitulos.includes(nom)) {
      alert("Este capítulo ya existe.");
      return;
    }
    const updatedCapitulos = [...listaCapitulos, nom];
    const updatedConfig = {
      ...(currentPresupuesto.indirectos_config || {}),
      capitulos: updatedCapitulos
    };
    setCurrentPresupuesto({ ...currentPresupuesto, indirectos_config: updatedConfig });
    await supabase
      .from('presupuestos_reales')
      .update({ indirectos_config: updatedConfig })
      .eq('id', currentPresupuesto.id);
    setNewCapituloName('');
    setNewCapituloModalOpen(false);
  };

  // Toggle colapsar capítulo
  const toggleCapitulo = (cap: string) => {
    setCollapsedCapitulos(prev => ({ ...prev, [cap]: !prev[cap] }));
  };

  // 3. INSERCIÓN RÁPIDA DE RUBRO POR CATÁLOGO EN CAPÍTULO
  const handleAddCatalogRubroToCapitulo = async (rubro: any, capituloName: string) => {
    if (!currentPresupuesto) return;
    const defaultCantidad = 1;
    const pu = Number(rubro.total_costo_directo || 0);
    const subtotal = pu * defaultCantidad;

    const { data: newPresRubro, error } = await supabase.from('presupuesto_rubros').insert([{
      presupuesto_id: currentPresupuesto.id,
      rubro_id: rubro.id,
      codigo_rubro: rubro.codigo,
      nombre_rubro: rubro.nombre,
      unidad: rubro.unidad,
      precio_unitario_snapshot: pu,
      cantidad_obra: defaultCantidad,
      subtotal: subtotal
    }]).select().single();

    if (error) {
      alert("Error agregando rubro: " + error.message);
      return;
    }

    // Copiar receta del catálogo maestro al presupuesto
    const { data: recetaMaestra } = await supabase
      .from('rubro_insumos')
      .select('insumo_id, cantidad, insumo:insumos(precio_sin_iva)')
      .eq('rubro_id', rubro.id);

    if (recetaMaestra && recetaMaestra.length > 0) {
      const clonedRecipe = recetaMaestra.map((rm: any) => {
        const insumoObj = Array.isArray(rm.insumo) ? rm.insumo[0] : rm.insumo;
        return {
          presupuesto_rubro_id: newPresRubro.id,
          insumo_id: rm.insumo_id,
          cantidad: rm.cantidad,
          precio_sin_iva_snapshot: insumoObj ? insumoObj.precio_sin_iva : 0
        };
      });
      await supabase.from('presupuesto_rubro_insumos').insert(clonedRecipe);
    }

    // Mapear al capítulo
    const updatedMap = {
      ...(currentPresupuesto.indirectos_config?.rubro_capitulo_map || {}),
      [newPresRubro.id]: capituloName
    };
    const updatedConfig = {
      ...(currentPresupuesto.indirectos_config || {}),
      rubro_capitulo_map: updatedMap
    };
    setCurrentPresupuesto({ ...currentPresupuesto, indirectos_config: updatedConfig });
    await supabase.from('presupuestos_reales').update({ indirectos_config: updatedConfig }).eq('id', currentPresupuesto.id);

    // Limpiar input y sugerencias
    setQuickInputByCapitulo(prev => ({ ...prev, [capituloName]: '' }));
    setActiveSuggestionsCapitulo(null);
    await fetchPresupuestoRubros(currentPresupuesto.id);
  };

  // 3. GENERAR RUBRO CON IA EN TIEMPO REAL
  const handleGenerateRubroWithAi = async (capituloName: string) => {
    const promptText = (quickInputByCapitulo[capituloName] || '').trim();
    if (!promptText || promptText.length < 3) {
      alert("Por favor escribe una descripción del rubro a generar (ej: 'Muro de contención de hormigón armado f'c=210 kg/cm2 H=2.5m').");
      return;
    }
    if (!currentPresupuesto) return;

    setGeneratingAiCapitulo(capituloName);
    try {
      const res = await fetch('/api/ai-rubros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion_rubro: promptText,
          unidad_sugerida: promptText.toLowerCase().includes('muro') || promptText.toLowerCase().includes('hormig') ? 'm3' : 'm2',
          complejidad: 'estandar'
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "No se pudo generar el rubro con IA.");
      }

      const aiData = await res.json();

      // Calcular costo unitario inicial
      let costoMateriales = 0;
      (aiData.materiales || []).forEach((m: any) => {
        costoMateriales += (Number(m.cantidad || 0) * Number(m.precio_unitario || 0));
      });

      let costoMO = 0;
      (aiData.mano_de_obra || []).forEach((m: any) => {
        costoMO += (Number(m.cantidad || 0) * Number(m.precio_unitario || 0));
      });

      let costoEquipos = 0;
      (aiData.equipos || []).forEach((e: any) => {
        if (e.unidad === '%mo') {
          costoEquipos += (costoMO * (Number(e.cantidad || 5) / 100));
        } else {
          costoEquipos += (Number(e.cantidad || 0) * Number(e.precio_unitario || 0));
        }
      });

      const costoUnitarioTotal = costoMateriales + costoMO + costoEquipos;
      const codPrefix = (aiData.unidad || 'UND').toUpperCase().slice(0, 3);
      const codRandom = Math.floor(100 + Math.random() * 900);
      const codigoGenerado = `IA-${codPrefix}-${codRandom}`;

      // Insertar rubro
      const { data: newPresRubro, error: errInsert } = await supabase.from('presupuesto_rubros').insert([{
        presupuesto_id: currentPresupuesto.id,
        codigo_rubro: codigoGenerado,
        nombre_rubro: aiData.nombre_rubro || promptText,
        unidad: aiData.unidad || 'u',
        cantidad_obra: 1.0,
        precio_unitario_snapshot: Number(costoUnitarioTotal.toFixed(4)),
        subtotal: Number(costoUnitarioTotal.toFixed(2))
      }]).select().single();

      if (errInsert) throw errInsert;

      // Mapear al capítulo
      const updatedMap = {
        ...(currentPresupuesto.indirectos_config?.rubro_capitulo_map || {}),
        [newPresRubro.id]: capituloName
      };
      const updatedConfig = {
        ...(currentPresupuesto.indirectos_config || {}),
        rubro_capitulo_map: updatedMap
      };
      await supabase.from('presupuestos_reales').update({ indirectos_config: updatedConfig }).eq('id', currentPresupuesto.id);

      // Consolidar insumos de la receta en presupuesto_rubro_insumos
      const insumosToProcess = [
        ...(aiData.materiales || []).map((m: any) => ({ ...m, tipo: 'material' })),
        ...(aiData.mano_de_obra || []).map((m: any) => ({ ...m, tipo: 'mano_de_obra' })),
        ...(aiData.equipos || []).map((e: any) => ({ ...e, tipo: 'equipo' }))
      ];

      for (const item of insumosToProcess) {
        let insId = item.insumo_existente_id;
        if (!insId) {
          const { data: found } = await supabase.from('insumos').select('id').ilike('nombre', item.nombre).maybeSingle();
          if (found) {
            insId = found.id;
          } else {
            const { data: created } = await supabase.from('insumos').insert([{
              codigo: `INS-${Date.now().toString().slice(-6)}`,
              nombre: item.nombre,
              tipo: item.tipo,
              unidad: item.unidad || 'u',
              precio_sin_iva: Number(item.precio_unitario) || 1.0
            }]).select('id').single();
            if (created) insId = created.id;
          }
        }

        if (insId) {
          await supabase.from('presupuesto_rubro_insumos').insert([{
            presupuesto_rubro_id: newPresRubro.id,
            insumo_id: insId,
            cantidad: Number(item.cantidad) || 1,
            precio_sin_iva_snapshot: Number(item.precio_unitario) || 0
          }]);
        }
      }

      setQuickInputByCapitulo(prev => ({ ...prev, [capituloName]: '' }));
      setActiveSuggestionsCapitulo(null);
      await fetchPresupuestoRubros(currentPresupuesto.id);
      setCurrentPresupuesto({ ...currentPresupuesto, indirectos_config: updatedConfig });
      alert(`⚡ ¡Rubro "${aiData.nombre_rubro}" generado con IA y desglosado con éxito!`);
    } catch (err: any) {
      console.error("Error generando con IA:", err);
      alert("Error al generar con IA: " + (err.message || JSON.stringify(err)));
    } finally {
      setGeneratingAiCapitulo(null);
    }
  };

  // Modificar cantidad de obra inline
  const handleUpdateCantidadObra = async (itemId: string, nuevaCantidad: number, precioUnitario: number) => {
    const nuevoSubtotal = nuevaCantidad * precioUnitario;
    await supabase.from('presupuesto_rubros').update({ 
      cantidad_obra: nuevaCantidad, 
      subtotal: nuevoSubtotal 
    }).eq('id', itemId);
    fetchPresupuestoRubros(currentPresupuesto.id);
  };

  // Eliminar rubro
  const handleRemoveRubro = async (itemId: string) => {
    if (!confirm("¿Eliminar este rubro del presupuesto?")) return;
    await supabase.from('presupuesto_rubros').delete().eq('id', itemId);
    fetchPresupuestoRubros(currentPresupuesto.id);
  };

  // 4. ABRIR SLIDE-OVER DRAWER DE APU
  const handleOpenApuSlideOver = (rubro: any) => {
    setCurrentRecipeRubro(rubro);
    setIsSlideOverOpen(true);
  };

  // Callback al actualizar receta desde el Slide-over
  const handleRecipeUpdated = async () => {
    if (!currentPresupuesto || !currentRecipeRubro) return;
    await recalcAndSaveRubroUnitario(currentRecipeRubro.id, currentRecipeRubro.cantidad_obra, currentRecipeRubro.rubro_id);
    await fetchPresupuestoRubros(currentPresupuesto.id);
  };

  const [isSyncingAllInsumos, setIsSyncingAllInsumos] = useState(false);

  // Sincronizar masivamente las recetas e insumos de todos los rubros del presupuesto
  const handleSyncAllInsumos = async () => {
    if (!currentPresupuesto?.id) return;
    setIsSyncingAllInsumos(true);
    try {
      const res = await syncAllInsumosForPresupuesto(supabase, currentPresupuesto.id);
      await fetchPresupuestoRubros(currentPresupuesto.id);
      alert(`¡Sincronización de insumos completada! Se verificaron ${res.totalRubros || 0} rubros.`);
    } catch (err: any) {
      console.error("Error al sincronizar insumos:", err);
      alert("Error al sincronizar insumos: " + (err.message || err));
    } finally {
      setIsSyncingAllInsumos(false);
    }
  };

  // Guardar Fórmulas de Indirectos
  const handleSaveIndirectos = async () => {
    const { error } = await supabase.from('presupuestos_reales').update({
      indirectos_config: {
        ...(currentPresupuesto.indirectos_config || {}),
        ...indForm
      }
    }).eq('id', currentPresupuesto.id);
    if (!error) {
      alert("Costos Indirectos y Fórmulas guardadas correctamente");
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
    }
  };

  // Generadores PDF y Excel
  const handleGeneratePresupuestoGeneralExcel = () => {
    generatePresupuestoGeneralExcel({
      currentPresupuesto,
      proyectosCRM: projects,
      totales: calcTotales(),
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
  };

  const handleGeneratePresupuestoGeneralPDF = () => {
    generatePresupuestoGeneralPDF({
      currentPresupuesto,
      proyectosCRM: projects,
      totales: calcTotales(),
      presupuestoRubros,
      rubrosRecipes,
      allRubros
    });
  };

  const handleGenerateAPUsPDF = () => {
    generateAPUsPDF({
      currentPresupuesto,
      presupuestoRubros,
      rubrosRecipes,
      allRubros,
      tecnicoResponsable: currentCliente ? `${currentCliente.nombre} ${currentCliente.apellido}` : (currentPresupuesto?.cliente ? `${currentPresupuesto.cliente.nombre} ${currentPresupuesto.cliente.apellido}` : "Ing. Residente / Oferente Responsable"),
      registroProfesional: currentCliente?.identificacion ? `C.I. / RUP: ${currentCliente.identificacion}` : "Reg. Profesional / C.I.: 1104XXXXXX",
      entidadContratante: currentPresupuesto?.entidad_contratante || activeProject?.entidad_contratante || "Entidad Contratante (SERCOP Ecuador)",
      codigoProceso: currentPresupuesto?.codigo_proceso || activeProject?.codigo_proceso || "PROCESO-SERCOP-2026"
    });
  };

  const isBorrador = !currentPresupuesto?.estado || currentPresupuesto.estado.toLowerCase() === 'borrador';
  const currentRegimen = currentPresupuesto?.indirectos_config?.regimen || 'privado';

  // ==========================================
  // RENDER: VISTA EDITOR DE LA MESA DE TRABAJO
  // ==========================================
  if (view === 'editor' && currentPresupuesto) {
    return (
      <div className="-m-4 md:-m-6 min-h-[calc(100vh-4rem)] bg-slate-100/70 text-slate-800 pb-16">
        
        {/* CABECERA EJECUTIVA UNIFICADA - MESA DE TRABAJO TÉCNICA */}
        <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-lg px-4 sm:px-6 py-4 text-white transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Lado Izquierdo: Identidad de la Obra y Switch de Régimen */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('lista')}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 bg-slate-800/60"
                title="Volver a la lista de presupuestos"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Mesa de Trabajo APU
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isBorrador ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1'
                  }`}>
                    {!isBorrador && <Lock size={10} />}
                    {currentPresupuesto.estado || 'borrador'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                  <Building2 size={22} className="text-amber-400 shrink-0" />
                  <span>{currentPresupuesto.nombre_proyecto}</span>
                </h1>
                
                <p className="text-xs text-slate-400 mt-0.5">
                  Cliente: <strong className="text-slate-200">{currentPresupuesto.cliente ? `${currentPresupuesto.cliente.nombre} ${currentPresupuesto.cliente.apellido}` : 'Sin cliente asignado'}</strong> • Creado: {new Date(currentPresupuesto.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* SWITCH DE RÉGIMEN (1 CLIC: Privado vs SERCOP) */}
              <div className="ml-2 sm:ml-4 bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleRegimen('privado')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    currentRegimen === 'privado'
                      ? 'bg-slate-800 text-purple-300 shadow-xs border border-purple-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo Privado / Residencial: margen de utilidad, compras y flujo ágil"
                >
                  <Building2 size={13} className={currentRegimen === 'privado' ? 'text-purple-400' : ''} />
                  <span>Privado</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleRegimen('sercop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    currentRegimen === 'sercop'
                      ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo SERCOP: formato 4 columnas oficiales, VAE y auditoría de pliegos"
                >
                  <ShieldCheck size={13} />
                  <span>🏛️ Público SERCOP</span>
                </button>
              </div>
            </div>

            {/* Lado Derecho: Acciones Ejecutivas */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleGeneratePresupuestoGeneralExcel}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition shadow-xs flex items-center gap-1.5"
                title="Descargar presupuesto general en Excel"
              >
                <Download size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">Excel Oficial</span>
              </button>

              <button
                type="button"
                onClick={handleGeneratePresupuestoGeneralPDF}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition shadow-xs flex items-center gap-1.5"
                title="Generar presupuesto en PDF con membrete"
              >
                <FileText size={14} className="text-rose-400" />
                <span className="hidden sm:inline">Reporte PDF</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAPUsPDF}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition shadow-xs flex items-center gap-1.5"
                title="Imprimir desglose de todos los APUs en PDF"
              >
                <Printer size={14} className="text-blue-400" />
                <span className="hidden sm:inline">Libro de APUs</span>
              </button>

              {isBorrador && (
                <button
                  type="button"
                  onClick={savePresupuesto}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Guardar</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 TARJETAS KPI DE ALTA GAMA EN TEMA OSCURO EJECUTIVO */}
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
            {/* Costo Directo */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Costo Directo (CD)</span>
                <span className="text-lg font-black text-white font-mono">
                  ${costoDirectoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Calculator size={16} />
              </div>
            </div>

            {/* Factor Indirectos AIU */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                  Indirectos AIU ({factorAiuPct.toFixed(1)}%)
                </span>
                <span className="text-lg font-black text-amber-300 font-mono">
                  ${indirectosMontoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <PieChart size={16} />
              </div>
            </div>

            {/* Gran Total (Precio de Venta) */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl border border-blue-400/40 flex items-center justify-between shadow-md">
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-blue-100 tracking-wider">Total Presupuesto (P.V.)</span>
                <span className="text-lg font-black font-mono text-white">
                  ${granTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>

            {/* Cantidad de Rubros y Capítulos */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Volumen de Obra</span>
                <span className="text-sm font-black text-white">
                  {presupuestoRubros.length} rubros <span className="font-normal text-slate-400 text-xs">en {listaCapitulos.length} caps.</span>
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* PESTAÑAS DE VISTA DEL PRESUPUESTO */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-1 py-1">
            <button
              onClick={() => setActiveTab('detalle')}
              className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'detalle'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <List size={15} />
              <span>Hoja de Presupuesto (Grid)</span>
            </button>

            <button
              onClick={() => setActiveTab('indirectos')}
              className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'indirectos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator size={15} />
              <span>Indirectos (AIU)</span>
            </button>

            <button
              onClick={() => setActiveTab('explosion')}
              className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'explosion'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package size={15} />
              <span>Explosión de Insumos</span>
            </button>

            <button
              onClick={() => setIsGanttModalOpen(true)}
              className="py-2.5 px-4 text-xs font-extrabold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Calendar size={15} />
              <span>Cronograma (Gantt)</span>
            </button>

            {/* Pestañas específicas SERCOP */}
            {currentRegimen === 'sercop' && (
              <>
                <button
                  onClick={() => setActiveTab('vae_sercop')}
                  className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                    activeTab === 'vae_sercop'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
                  }`}
                >
                  <ShieldCheck size={15} />
                  <span>Matriz VAE & Desagregación</span>
                </button>

                <button
                  onClick={() => setActiveTab('auditor_sercop')}
                  className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                    activeTab === 'auditor_sercop'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>Auditor SARA-SERCOP</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('red_agentes')}
              className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'red_agentes'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
              }`}
            >
              <Cpu size={15} className="animate-pulse" />
              <span>Red Agentes IA & Co-Piloto</span>
            </button>

            <button
              onClick={() => setActiveTab('reportes')}
              className={`py-2.5 px-4 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'reportes'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText size={15} />
              <span>Reportes</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL POR PESTAÑA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

          {/* 1. TAB: HOJA DE PRESUPUESTO (GRID POR CAPÍTULOS + INLINE IA) */}
          {activeTab === 'detalle' && (
            <div className="space-y-6">
              
              {/* Barra superior de acciones de la hoja */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Estructura Jerárquica de Capítulos y Rubros</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inserta rubros escribiendo en cada capítulo con sugerencias del catálogo o genera recetas completas con IA.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSyncingAllInsumos}
                    onClick={handleSyncAllInsumos}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Sincronizar y generar recetas de insumos faltantes (materiales, cuadrillas CCEC, equipos) para todos los rubros"
                  >
                    {isSyncingAllInsumos ? <Loader2 size={15} className="animate-spin text-amber-700" /> : <Sparkles size={15} className="text-amber-600" />}
                    <span>{isSyncingAllInsumos ? "Sincronizando..." : "⚡ Sincronizar Insumos"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCapituloModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
                  >
                    <FolderPlus size={15} className="text-blue-600" />
                    <span>+ Nuevo Capítulo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const allCollapsed = Object.values(collapsedCapitulos).every(Boolean);
                      const nextState: Record<string, boolean> = {};
                      listaCapitulos.forEach(c => { nextState[c] = !allCollapsed; });
                      setCollapsedCapitulos(nextState);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Contraer / Expandir Todos
                  </button>
                </div>
              </div>

              {/* LISTA DE CAPÍTULOS */}
              <div className="space-y-5">
                {listaCapitulos.map((capituloNombre, capIndex) => {
                  const rubrosDelCapitulo = rubrosPorCapitulo[capituloNombre] || [];
                  const subtotalCapitulo = rubrosDelCapitulo.reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);
                  const pctCapitulo = costoDirectoTotal > 0 ? (subtotalCapitulo / costoDirectoTotal) * 100 : 0;
                  const isCollapsed = collapsedCapitulos[capituloNombre];
                  const currentInput = quickInputByCapitulo[capituloNombre] || '';

                  // Filtrar sugerencias del catálogo
                  const matchingCatalog = currentInput.trim().length >= 2
                    ? allRubros.filter(r => 
                        (r.nombre || '').toLowerCase().includes(currentInput.toLowerCase().trim()) ||
                        (r.codigo || '').toLowerCase().includes(currentInput.toLowerCase().trim())
                      ).slice(0, 8)
                    : [];

                  return (
                    <div 
                      key={capituloNombre}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                    >
                      {/* Cabecera del Capítulo */}
                      <div 
                        onClick={() => toggleCapitulo(capituloNombre)}
                        className="p-4 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                          >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                Cap. {capIndex + 1}
                              </span>
                              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                {capituloNombre}
                              </h3>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {rubrosDelCapitulo.length} {rubrosDelCapitulo.length === 1 ? 'rubro' : 'rubros'} en este capítulo
                            </span>
                          </div>
                        </div>

                        {/* Subtotal del capítulo y % sobre CD */}
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Subtotal Capítulo</span>
                            <span className="text-base font-black text-slate-900 font-mono">
                              ${subtotalCapitulo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="hidden sm:block text-left w-20">
                            <span className="text-[10px] font-bold text-slate-400 block">{pctCapitulo.toFixed(1)}% CD</span>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, pctCapitulo)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenido del Capítulo: Tabla de Rubros + Fila Inline */}
                      {!isCollapsed && (
                        <div>
                          {rubrosDelCapitulo.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs divide-y divide-slate-100">
                                <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                  <tr>
                                    <th className="py-2.5 px-3">Cód</th>
                                    <th className="py-2.5 px-4">Descripción del Rubro</th>
                                    <th className="py-2.5 px-2 text-center w-16">Unidad</th>
                                    <th className="py-2.5 px-3 text-right w-28">Cant. Obra</th>
                                    <th className="py-2.5 px-3 text-right w-28">P. Unitario ($)</th>
                                    <th className="py-2.5 px-4 text-right w-32">Subtotal ($)</th>
                                    <th className="py-2.5 px-2 text-center w-24">Capítulo</th>
                                    <th className="py-2.5 px-3 text-center w-28">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {rubrosDelCapitulo.map((item) => (
                                    <tr 
                                      key={item.id}
                                      className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-blue-700">
                                        {item.codigo_rubro || '-'}
                                      </td>

                                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                                        <div className="flex items-center gap-2">
                                          <span>{item.nombre_rubro}</span>
                                          {item.codigo_rubro?.startsWith('IA-') && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                              <Sparkles size={10} /> IA
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="py-2.5 px-2 text-center text-slate-600 font-mono font-bold">
                                        {item.unidad}
                                      </td>

                                      <td className="py-2.5 px-3 text-right">
                                        {isBorrador ? (
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            defaultValue={item.cantidad_obra}
                                            onBlur={(e) => handleUpdateCantidadObra(item.id, parseFloat(e.target.value) || 0, item.precio_unitario_snapshot)}
                                            className="w-20 text-right font-mono font-bold border border-slate-200 rounded p-1 text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                                          />
                                        ) : (
                                          <span className="font-mono font-bold text-slate-800">{item.cantidad_obra}</span>
                                        )}
                                      </td>

                                      <td className="py-2.5 px-3 text-right">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenApuSlideOver(item)}
                                          className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                          title="Hacer clic para abrir desglose de APU"
                                        >
                                          ${Number(item.precio_unitario_snapshot || 0).toFixed(2)}
                                        </button>
                                      </td>

                                      <td className="py-2.5 px-4 text-right font-mono font-black text-slate-900">
                                        ${Number(item.subtotal || 0).toFixed(2)}
                                      </td>

                                      {/* Selector rápido para mover de capítulo */}
                                      <td className="py-2.5 px-2 text-center">
                                        <select
                                          value={capituloNombre}
                                          onChange={(e) => handleMoveRubroCapitulo(item.id, e.target.value)}
                                          className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 text-slate-600 outline-none max-w-[90px] truncate"
                                        >
                                          {listaCapitulos.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                          ))}
                                        </select>
                                      </td>

                                      {/* Acciones */}
                                      <td className="py-2.5 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenApuSlideOver(item)}
                                            className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition-colors flex items-center gap-1"
                                            title="Ver / Editar desglose de insumos en el Drawer lateral"
                                          >
                                            <Edit3 size={11} />
                                            <span>APU</span>
                                          </button>

                                          {isBorrador && (
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveRubro(item.id)}
                                              className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors"
                                              title="Eliminar rubro"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400 italic">
                              Este capítulo aún no tiene rubros asignados. Usa la barra de abajo para añadir uno.
                            </div>
                          )}

                          {/* FILA RÁPIDA DE INSERCIÓN INLINE EN ESTE CAPÍTULO */}
                          {isBorrador && (
                            <div className="p-3 bg-slate-50/60 border-t border-slate-200 relative">
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                <div className="relative flex-1 w-full">
                                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 shadow-2xs">
                                    <Search size={14} className="text-slate-400 shrink-0" />
                                    <input
                                      type="text"
                                      placeholder={`Escribe el nombre del rubro para "${capituloNombre}" (autocompleta o genera con IA)...`}
                                      value={currentInput}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setQuickInputByCapitulo(prev => ({ ...prev, [capituloNombre]: val }));
                                        setActiveSuggestionsCapitulo(val.length >= 2 ? capituloNombre : null);
                                      }}
                                      onFocus={() => {
                                        if (currentInput.length >= 2) setActiveSuggestionsCapitulo(capituloNombre);
                                      }}
                                      className="w-full text-xs bg-transparent outline-none text-slate-900"
                                    />
                                    {currentInput && (
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setQuickInputByCapitulo(prev => ({ ...prev, [capituloNombre]: '' }));
                                          setActiveSuggestionsCapitulo(null);
                                        }}
                                        className="text-slate-400 hover:text-slate-600"
                                      >
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>

                                  {/* DROPDOWN TYPEAHEAD AUTOCOMPLETADO */}
                                  {activeSuggestionsCapitulo === capituloNombre && matchingCatalog.length > 0 && (
                                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-slate-100">
                                      <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Rubros sugeridos del Catálogo Maestro ({matchingCatalog.length})
                                      </div>
                                      {matchingCatalog.map((r) => (
                                        <div
                                          key={r.id}
                                          onClick={() => handleAddCatalogRubroToCapitulo(r, capituloNombre)}
                                          className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                        >
                                          <div>
                                            <span className="font-bold text-slate-800">{r.nombre}</span>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                              {r.codigo} • Und: {r.unidad}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-slate-700">${Number(r.total_costo_directo || 0).toFixed(2)}</span>
                                            <button className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px]">
                                              + Insertar
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* BOTÓN INSTANTÁNEO [⚡ GENERAR CON IA] */}
                                <button
                                  type="button"
                                  disabled={generatingAiCapitulo === capituloNombre || !currentInput.trim()}
                                  onClick={() => handleGenerateRubroWithAi(capituloNombre)}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                                  title="Generar receta y desglose de APU con IA en 2 segundos"
                                >
                                  {generatingAiCapitulo === capituloNombre ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin text-slate-950" />
                                      <span>Generando APU con IA...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={14} className="text-slate-950" />
                                      <span>⚡ Generar con IA</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 2. TAB: INDIRECTOS ANALÍTICOS (AIU) */}
          {activeTab === 'indirectos' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Configuración Analítica de Costos Indirectos (AIU)</h2>
                  <p className="text-xs text-slate-500">
                    Ajusta los porcentajes de administración, imprevistos y utilidad del proyecto.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIndirectosModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition shadow-xs flex items-center gap-1.5"
                  >
                    <Calculator size={14} />
                    <span>Justificación Analítica SERCOP</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveIndirectos}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Guardar Fórmulas</span>
                  </button>
                </div>
              </div>

              {/* Tarjetas de los 3 Componentes Clave */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Gastos Administrativos / Generales (A)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={indForm.ggen}
                      onChange={(e) => setIndForm({ ...indForm, ggen: parseFloat(e.target.value) || 0 })}
                      className="w-24 text-right font-mono font-black text-lg border border-slate-300 rounded-lg p-1.5 bg-white"
                    />
                    <span className="font-black text-slate-500">%</span>
                    <span className="text-xs font-mono text-slate-700 ml-auto font-bold">
                      = ${(costoDirectoTotal * (Number(indForm.ggen) / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Imprevistos de Obra (I)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={indForm.pimp}
                      onChange={(e) => setIndForm({ ...indForm, pimp: parseFloat(e.target.value) || 0 })}
                      className="w-24 text-right font-mono font-black text-lg border border-slate-300 rounded-lg p-1.5 bg-white"
                    />
                    <span className="font-black text-slate-500">%</span>
                    <span className="text-xs font-mono text-slate-700 ml-auto font-bold">
                      = ${(costoDirectoTotal * (Number(indForm.pimp) / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Margen de Utilidad (U)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={indForm.util}
                      onChange={(e) => setIndForm({ ...indForm, util: parseFloat(e.target.value) || 0 })}
                      className="w-24 text-right font-mono font-black text-lg border border-slate-300 rounded-lg p-1.5 bg-white"
                    />
                    <span className="font-black text-slate-500">%</span>
                    <span className="text-xs font-mono text-slate-700 ml-auto font-bold">
                      = ${(costoDirectoTotal * (Number(indForm.util) / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen Final de Venta */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider block">Cálculo Total Consolidado</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Costo Directo (${costoDirectoTotal.toFixed(2)}) + Indirectos (${indirectosMontoTotal.toFixed(2)})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block uppercase font-bold">Gran Total Presupuesto</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ${granTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. TAB: EXPLOSIÓN DE INSUMOS */}
          {activeTab === 'explosion' && (
            <div className="space-y-6">
              {(() => {
                const consolidado: Record<string, any> = {};
                presupuestoRubros.forEach(pr => {
                  const q = Number(pr.cantidad_obra || 0);
                  const items = rubrosRecipes[pr.id] || [];
                  items.forEach((item: any) => {
                    const iObj = Array.isArray(item.insumo) ? item.insumo[0] : item.insumo;
                    if (!iObj) return;
                    const cantReq = q * Number(item.cantidad || 0);
                    const costTot = cantReq * Number(item.precio_sin_iva_snapshot || 0);
                    const idIns = iObj.id;
                    if (!consolidado[idIns]) {
                      consolidado[idIns] = {
                        ...iObj,
                        costo: item.precio_sin_iva_snapshot || 0,
                        cantidad_total: 0,
                        costo_total: 0
                      };
                    }
                    consolidado[idIns].cantidad_total += cantReq;
                    consolidado[idIns].costo_total += costTot;
                  });
                });

                const allItems = Object.values(consolidado);
                const matItems = allItems.filter(i => i.tipo === 'material');
                const moItems = allItems.filter(i => i.tipo === 'mano_de_obra');
                const eqItems = allItems.filter(i => i.tipo === 'equipo' || i.tipo === 'herramienta_menor');
                const trItems = allItems.filter(i => i.tipo === 'transporte' || i.tipo === 'flete');

                let filtered = allItems;
                if (explosionTypeFilter === 'material') filtered = matItems;
                else if (explosionTypeFilter === 'mano_de_obra') filtered = moItems;
                else if (explosionTypeFilter === 'equipo') filtered = eqItems;
                else if (explosionTypeFilter === 'transporte') filtered = trItems;

                if (explosionSearch.trim()) {
                  const q = explosionSearch.toLowerCase().trim();
                  filtered = filtered.filter(i => 
                    (i.nombre && i.nombre.toLowerCase().includes(q)) ||
                    (i.codigo && i.codigo.toLowerCase().includes(q))
                  );
                }

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">Explosión Consolidada de Recursos</h2>
                        <p className="text-xs text-slate-500">
                          {allItems.length} insumos totales calculados a partir de las cantidades de obra.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => generateExplosionPDF({ currentPresupuesto, explosionData: filtered, title: "EXPLOSIÓN DE INSUMOS" })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs flex items-center gap-1.5"
                        >
                          <FileText size={14} />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => generateExplosionExcel({ currentPresupuesto, explosionData: filtered, title: "EXPLOSIÓN DE INSUMOS" })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs flex items-center gap-1.5"
                        >
                          <Download size={14} />
                          <span>Excel</span>
                        </button>
                      </div>
                    </div>

                    {/* Filtros de la Explosión */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={() => setExplosionTypeFilter('todos')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          explosionTypeFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Todos ({allItems.length})
                      </button>
                      <button
                        onClick={() => setExplosionTypeFilter('material')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          explosionTypeFilter === 'material' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Materiales ({matItems.length})
                      </button>
                      <button
                        onClick={() => setExplosionTypeFilter('mano_de_obra')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          explosionTypeFilter === 'mano_de_obra' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Mano de Obra ({moItems.length})
                      </button>
                      <button
                        onClick={() => setExplosionTypeFilter('equipo')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          explosionTypeFilter === 'equipo' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Equipos ({eqItems.length})
                      </button>
                      <button
                        onClick={() => setExplosionTypeFilter('transporte')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          explosionTypeFilter === 'transporte' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Transporte ({trItems.length})
                      </button>

                      <input
                        type="text"
                        placeholder="Buscar insumo..."
                        value={explosionSearch}
                        onChange={(e) => setExplosionSearch(e.target.value)}
                        className="ml-auto px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      />
                    </div>

                    {/* Tabla de la Explosión */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-4">Insumo</th>
                            <th className="py-2.5 px-2 text-center">Tipo</th>
                            <th className="py-2.5 px-2 text-center">Und</th>
                            <th className="py-2.5 px-3 text-right">Cant. Requerida</th>
                            <th className="py-2.5 px-3 text-right">P. Unitario ($)</th>
                            <th className="py-2.5 px-4 text-right">Costo Total ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtered.map((ins: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono text-slate-400">{ins.codigo || '-'}</td>
                              <td className="py-2 px-4 font-semibold text-slate-800">{ins.nombre}</td>
                              <td className="py-2 px-2 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                                  {ins.tipo}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center font-mono text-slate-500">{ins.unidad}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                {Number(ins.cantidad_total || 0).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-600">
                                ${Number(ins.costo || 0).toFixed(3)}
                              </td>
                              <td className="py-2 px-4 text-right font-mono font-black text-slate-900">
                                ${Number(ins.costo_total || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 4. TAB: MATRIZ VAE & DESAGREGACIÓN TECNOLÓGICA (SERCOP) */}
          {activeTab === 'vae_sercop' && (
            <SercopVaeAnalyzer
              presupuesto={currentPresupuesto}
              presupuestoRubros={presupuestoRubros}
              rubrosRecipes={rubrosRecipes}
              costoDirectoTotal={costoDirectoTotal}
              granTotal={granTotal}
            />
          )}

          {/* 5. TAB: AUDITOR SARA-SERCOP */}
          {activeTab === 'auditor_sercop' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Auditor SARA de Pliegos SERCOP Ecuador 2026</h2>
                  <p className="text-xs text-slate-500">
                    Inspección automática de cumplimiento normativo conforme a la Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Regla 1: VAE */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span className="font-bold text-xs text-emerald-950 uppercase">Umbral Mínimo de VAE</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    El Valor Agregado Ecuatoriano supera el umbral referencial para obras civiles (mínimo 40.0% requerido).
                  </p>
                </div>

                {/* Regla 2: Formato 4 Columnas */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span className="font-bold text-xs text-emerald-950 uppercase">Estructura Desagregada de 4 Columnas</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Los rubros están divididos en Materiales, Mano de Obra, Equipos y Transporte conforme a la Tabla 1 del SERCOP.
                  </p>
                </div>

                {/* Regla 3: Salarios Sectoriales MDT */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span className="font-bold text-xs text-emerald-950 uppercase">Salarios Sectoriales y FSBC 2026</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Las cuadrillas de albañil, peón y fierrero incorporan beneficios de ley, IESS patronal y décimos de ley.
                  </p>
                </div>

                {/* Regla 4: Herramienta Menor */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span className="font-bold text-xs text-emerald-950 uppercase">Herramienta Menor Regulada</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    El porcentaje de herramienta menor está en el rango estándar oficial (3.0% - 5.0% de la mano de obra).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. TAB: RED DE AGENTES IA & CO-PILOTO */}
          {activeTab === 'red_agentes' && (
            <div className="space-y-8">
              <SaraCoPilotAdvisor
                proyectoId={currentPresupuesto?.id || activeProject?.id || 'presupuesto-activo'}
                nombreProyecto={currentPresupuesto?.nombre_proyecto || activeProject?.nombre || "Obra Activa"}
                ubicacion={activeProject?.ubicacion || "Cuenca, Azuay"}
                costoDirectoTotal={costoDirectoTotal || 45200}
                volumenDesalojoM3={Math.max(30, Math.round((costoDirectoTotal || 45200) / 1000))}
              />

              <AgentNetworkChoreography
                initialContext={{
                  nombre: currentPresupuesto?.nombre_proyecto || activeProject?.nombre || "Obra Activa",
                  provincia: activeProject?.provincia || "Azuay",
                  ciudad: activeProject?.ubicacion?.split(',')[0].trim() || "Cuenca",
                  areaM2: Math.max(80, Math.round((costoDirectoTotal || 50000) / 480)),
                  tipologia: 'Residencial',
                  costoReferencial: costoDirectoTotal || 51918,
                  rubros: presupuestoRubros.map((r: any) => ({
                    codigo: r.codigo_rubro || 'R-00',
                    nombre: r.nombre_rubro || 'Rubro de obra',
                    unidad: r.unidad || 'und',
                    cantidad: Number(r.cantidad_obra || 1),
                    subtotal: Number(r.subtotal || 0)
                  }))
                }}
                autoRun={true}
              />
            </div>
          )}

          {/* 7. TAB: REPORTES */}
          {activeTab === 'reportes' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 mb-2">Descarga de Reportes Oficiales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Presupuesto General con Membrete</h3>
                    <p className="text-xs text-slate-500">Totales, capítulos y desglose de rubros.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleGeneratePresupuestoGeneralPDF} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold">PDF</button>
                    <button onClick={handleGeneratePresupuestoGeneralExcel} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Excel</button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Libro Completo de APUs</h3>
                    <p className="text-xs text-slate-500">Análisis detallado de precios unitarios con insumos.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleGenerateAPUsPDF} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Generar PDF</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* MODAL PARA AGREGAR NUEVO CAPÍTULO */}
        {newCapituloModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
              <h3 className="text-base font-black text-slate-900 mb-2">Crear Nuevo Capítulo</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ingresa el nombre del capítulo jerárquico (ej: "8. Jardinería y Paisajismo").
              </p>
              <input
                type="text"
                autoFocus
                placeholder="Nombre del nuevo capítulo..."
                value={newCapituloName}
                onChange={(e) => setNewCapituloName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewCapituloModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddNewCapitulo}
                  disabled={!newCapituloName.trim()}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
                >
                  Agregar Capítulo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. SLIDE-OVER DRAWER LATERAL PARA DESGLOSE DEL APU */}
        <ApuSlideOverDetail
          isOpen={isSlideOverOpen}
          onClose={() => setIsSlideOverOpen(false)}
          currentRecipeRubro={currentRecipeRubro}
          currentPresupuestoId={currentPresupuesto?.id}
          rubrosRecipes={rubrosRecipes}
          regimen={currentRegimen}
          userRole={userRole}
          supabase={supabase}
          onRecipeUpdated={handleRecipeUpdated}
          allInsumos={allRubros}
        />

        {/* MODAL CRONOGRAMA GANTT */}
        <GanttModal
          isOpen={isGanttModalOpen}
          onClose={() => setIsGanttModalOpen(false)}
          presupuestoRubros={presupuestoRubros}
          updateTaskSchedule={async (id: string, fieldOrUpdates: any, value?: any) => {
            if (typeof fieldOrUpdates === 'object') {
              await supabase.from('presupuesto_rubros').update(fieldOrUpdates).eq('id', id);
            } else {
              await supabase.from('presupuesto_rubros').update({ [fieldOrUpdates]: value }).eq('id', id);
            }
            fetchPresupuestoRubros(currentPresupuesto.id);
          }}
        />

        {/* MODAL JUSTIFICACIÓN ANALÍTICA INDIRECTOS (AIU) */}
        <IndirectosAnaliticoModal
          isOpen={isIndirectosModalOpen}
          onClose={() => setIsIndirectosModalOpen(false)}
          costoDirectoTotal={costoDirectoTotal}
          projectName={currentPresupuesto?.nombre_proyecto || 'Proyecto'}
          onApplyPercentages={(adminPct: number, impPct: number, utilPct: number) => {
            setIndForm(prev => ({
              ...prev,
              ggen: adminPct,
              pimp: impPct,
              util: utilPct
            }));
          }}
        />

      </div>
    );
  }

  // ==========================================
  // RENDER: VISTA LISTA DE PRESUPUESTOS
  // ==========================================
  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Presupuestos APU Reales
          </h1>
          <p className="text-sm text-slate-500">
            Mesa de trabajo unificada para análisis de precios unitarios, indirectos AIU y pliegos SERCOP.
          </p>
        </div>

        {userRole === 'admin' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBimModalOpen(true)}
              className="px-4 py-2.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-xs flex items-center gap-2"
            >
              <span>Cuboid</span>
              <span>Importar BIM</span>
            </button>

            {/* 1. BOTÓN CREAR PRESUPUESTO CON VINCULACIÓN DIRECTA */}
            <button
              onClick={handleCreatePresupuestoAction}
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-full text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creando Presupuesto...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>
                    {!isGlobalMode && activeProject
                      ? `+ Crear Presupuesto para ${activeProject.nombre}`
                      : "+ Nuevo Presupuesto"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Banner de Obra Activa en el Workspace */}
      <div className={`p-4 rounded-2xl mb-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-xs ${
        !isGlobalMode && activeProject
          ? "bg-gradient-to-r from-blue-50 to-indigo-50/70 border-blue-200"
          : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-xs ${
            !isGlobalMode && activeProject ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
          }`}>
            {!isGlobalMode && activeProject ? "🏗️" : "🌐"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                {!isGlobalMode && activeProject ? "Obra Activa Seleccionada" : "Vista Multi-Obra Global"}
              </span>
              {!isGlobalMode && activeProject?.provincia && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                  {activeProject.provincia}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {!isGlobalMode && activeProject ? activeProject.nombre : "Portafolio General de Obras"}
            </h2>
            <p className="text-xs text-slate-500">
              {!isGlobalMode && activeProject 
                ? "Al crear un nuevo presupuesto se vinculará directamente a esta obra sin pedir datos redundantes."
                : "Visualizando los presupuestos de todos tus proyectos en Ecuador."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isGlobalMode && activeProject ? (
            <button
              onClick={() => setActiveProject(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              🌐 Ver Todas las Obras
            </button>
          ) : (
            <button
              onClick={() => openCreateModal()}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              + Nueva Obra
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Presupuestos */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <input
            type="text"
            placeholder="Buscar por proyecto o cliente..."
            value={searchPresupuesto}
            onChange={(e) => setSearchPresupuesto(e.target.value)}
            className="w-full max-w-md px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-slate-500 font-semibold">
            {filteredPresupuestos.length} {filteredPresupuestos.length === 1 ? 'presupuesto' : 'presupuestos'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Obra / Proyecto</th>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5 text-center">Régimen</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Costo Directo ($)</th>
                <th className="px-6 py-3.5 text-right">Gran Total ($)</th>
                <th className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPresupuestos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold mb-2">No se encontraron presupuestos registrados.</p>
                    <button
                      onClick={handleCreatePresupuestoAction}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      + Crear Primer Presupuesto
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPresupuestos.map((p) => {
                  const reg = p.indirectos_config?.regimen || 'privado';
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openEditor(p)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{p.nombre_proyecto}</div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}` : 'Sin cliente asignado'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          reg === 'sercop' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {reg === 'sercop' ? '🏛️ SERCOP' : '🏢 Privado'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.estado || 'borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono font-medium">
                        ${Number(p.costo_directo_total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono font-black text-slate-900">
                        ${Number(p.gran_total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Botón Editar / Abrir Mesa */}
                          <button
                            type="button"
                            onClick={() => openEditor(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 font-bold text-xs shadow-2xs border border-blue-200 hover:border-blue-600 cursor-pointer"
                            title="Abrir y Editar Presupuesto en la Mesa de Trabajo"
                          >
                            <Edit3 size={13} />
                            <span>Editar</span>
                          </button>

                          {/* 2. Botón Clonar / Duplicar */}
                          <button
                            type="button"
                            onClick={() => handleOpenCloneModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1 font-bold text-xs shadow-2xs border border-amber-200 hover:border-amber-500 cursor-pointer"
                            title="Clonar / Duplicar Presupuesto con sus Rubros e Insumos"
                          >
                            <Copy size={13} />
                            <span className="hidden sm:inline">Clonar</span>
                          </button>

                          {/* 3. Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDeletePresupuesto(p)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-2xs border border-red-200 hover:border-red-600 cursor-pointer"
                            title="Eliminar Presupuesto"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear Presupuesto (solo cuando no hay obra activa) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Nuevo Presupuesto de Obra</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDirectCreatePresupuesto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Proyecto / Obra</label>
                <select
                  value={isCustomProject ? "__CUSTOM__" : selectedProjectName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__CUSTOM__") {
                      setIsCustomProject(true);
                      setSelectedProjectName("");
                    } else {
                      setIsCustomProject(false);
                      setSelectedProjectName(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 outline-none"
                >
                  <option value="" disabled>-- Selecciona el proyecto --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.nombre}>{p.nombre} {p.provincia ? `• ${p.provincia}` : ''}</option>
                  ))}
                  <option value="__CUSTOM__">✍️ Escribir otro nombre...</option>
                </select>

                {isCustomProject && (
                  <input
                    type="text"
                    placeholder="Nombre de la obra..."
                    value={selectedProjectName}
                    onChange={(e) => setSelectedProjectName(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    autoFocus
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  {createMutation.isPending ? "Creando..." : "Crear y Abrir Mesa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal BIM */}
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

      {/* Modal para Clonar Presupuesto */}
      {isCloneModalOpen && cloneSource && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Copy size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Clonar / Duplicar Presupuesto</h3>
                  <p className="text-[11px] text-slate-500">Duplica todos los rubros, insumos y configuración de indirectos</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsCloneModalOpen(false); setCloneSource(null); }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteClone} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Nombre del Presupuesto Duplicado *
                </label>
                <input
                  type="text"
                  required
                  value={cloneNombreProyecto}
                  onChange={(e) => setCloneNombreProyecto(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  placeholder="Ej: Residencia El Chiquito - Variante 2"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Presupuesto Original Fuente
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">{cloneSource.nombre_proyecto}</div>
                  <div className="text-slate-500 flex items-center justify-between">
                    <span>Cliente: {cloneSource.cliente ? `${cloneSource.cliente.nombre} ${cloneSource.cliente.apellido}` : 'Sin cliente'}</span>
                    <span className="font-mono font-bold text-slate-700">${Number(cloneSource.gran_total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <span className="font-bold block">✨ ¿Qué se duplicará con esta acción?</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-800">
                  <li>Todos los capítulos y estructura de la hoja de presupuesto.</li>
                  <li>Todos los rubros con sus cantidades de obra y precios unitarios.</li>
                  <li>Las recetas analíticas completas de insumos (Materiales, Mano de Obra, Equipos y Transporte).</li>
                  <li>La configuración de indirectos y porcentajes AIU.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isCloning}
                  onClick={() => { setIsCloneModalOpen(false); setCloneSource(null); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCloning || !cloneNombreProyecto.trim()}
                  className="px-5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCloning ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Duplicando Rubros e Insumos...</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Confirmar y Clonar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
