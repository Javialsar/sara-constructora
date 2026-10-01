"use client"
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client"
import { Settings, Calculator, Save, FileText, CheckCircle2, Download, UserPlus, X } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { createClientAccount } from "../clientes/actions"

export default function CotizadorPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'generar' | 'parametros' | 'historial'>('generar')
  
  // Estado para parámetros
    const setParams = (updater: any) => {
    queryClient.setQueryData(['parametros_globales'], (old: any) => {
      if (typeof updater === 'function') return updater(old);
      return updater;
    });
  };

  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  // REACT QUERY FETCHES
  const { data: params, isLoading: loadingParams } = useQuery({
    queryKey: ['parametros_globales'],
    queryFn: async () => {
      const { data } = await supabase.from('parametros_globales').select('*').eq('id', 1).single();
      if (!data) return null;
      return {
        tarifa_diseno_arq_m2: data.cotizador_tarifas.arquitectura_ejecutivo,
        tarifa_diseno_est_m2: data.cotizador_tarifas.diseno_estructural,
        tarifa_geotecnia: data.cotizador_tarifas.estudio_geotecnia,
        tarifa_diseno_elec_m2: data.cotizador_tarifas.diseno_electrico,
        tarifa_diseno_hidro_m2: data.cotizador_tarifas.diseno_hidrico,
        tarifa_topografia_base: data.cotizador_tarifas.topografia,

        costo_base_construccion_m2: data.cotizador_obra_base.costo_construccion_base,
        porcentaje_iva_base: data.cotizador_obra_base.porcentaje_iva,

        factor_acabados_economico: data.cotizador_factores.acabado_economico,
        factor_acabados_estandar: data.cotizador_factores.acabado_estandar,
        factor_acabados_premium: data.cotizador_factores.acabado_premium,
        factor_suelo_normal: data.cotizador_factores.suelo_normal,
        factor_suelo_blando: data.cotizador_factores.suelo_blando,
        factor_suelo_rocoso: 1.05, 
        factor_estructura_hormigon: data.cotizador_factores.estructura_hormigon,
        factor_estructura_metalica: data.cotizador_factores.estructura_metalica,
        factor_pendiente_plana: data.cotizador_factores.pendiente_plana,
        factor_pendiente_media: data.cotizador_factores.pendiente_media,
        factor_pendiente_fuerte: data.cotizador_factores.pendiente_fuerte,

        costo_extra_master: data.cotizador_ensambles.dormitorio_master,
        costo_extra_bano_completo: data.cotizador_ensambles.bano_completo,
        costo_extra_medio_bano: data.cotizador_ensambles.medio_bano,
        costo_extra_lavanderia: data.cotizador_ensambles.lavanderia,
        costo_extra_cisterna: data.cotizador_ensambles.cisterna_subt,
        costo_extra_piscina: data.cotizador_ensambles.piscina_base,
        costo_extra_garaje_descubierto: data.cotizador_ensambles.garaje_descubierto,
        costo_extra_splits: data.cotizador_ensambles.clima_splits,
        
        factor_tipologia_unifamiliar: 1,
        factor_tipologia_multifamiliar: 1.15,
        factor_tipologia_comercial: 1.25,
        factor_tipologia_industrial: 0.85,
        porcentaje_adicional_por_piso: 0.03,
        factor_sotano: 1.4,
        factor_acceso_urbano: 1,
        factor_acceso_rural: 1.08,
        factor_pisos_1: 1.05,
        factor_pisos_2: 1,
        factor_pisos_3: 1.02,
        costo_extra_cocina_isla: 1500,
        costo_ml_cerramiento: 120,
        costo_extra_garaje_cubierto: 3500,
        costo_extra_aire_central: 4500,
      };
    }
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: historialCotizaciones = [] } = useQuery({
    queryKey: ['historial_cotizaciones'],
    queryFn: async () => {
      const { data: historialData } = await supabase.from('historial_cotizaciones').select('*').order('created_at', { ascending: false });
      if (!historialData) return [];
      const { data: clientesData } = await supabase.from('clientes').select('id, nombre, apellido');
      return historialData.map(h => {
        const c = clientesData?.find((client:any) => client.id === h.cliente_id);
        return {
          ...h,
          clientes: c || { nombre: 'Cliente', apellido: 'No encontrado' }
        };
      });
    }
  });
  const [selectedClienteId, setSelectedClienteId] = useState<string>("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientFormData, setClientFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: ""
  })

  // Estado para la cotización actual
  const [cotizacion, setCotizacion] = useState({
    nombreCliente: '',
    nombreProyecto: '',
    areaConstruccion: '100',
    // FASE 1: Terreno y Estructura
    pendiente: 'plana', 
    suelo: 'normal',
    accesibilidad: 'urbana',
    pisos: '2',
    estructura: 'hormigon',
    // FASE 2: Arquitectura y Distribucion
    acabados: 'estandar', 
    cuartosMaster: 1,
    cuartosNormales: 2,
    banosCompletos: 2,
    mediosBanos: 1,
    lavanderia: true,
    cocina: 'abierta', // cerrada, abierta
    // FASE 3: Exteriores y Extras
    cerramientoMl: 0,
    piscina: false,
    cisterna: true,
    garaje: 'descubierto', // ninguno, descubierto, cubierto
    climatizacion: 'splits', // ninguna, splits, central
    
    // Módulo 1 (Consultoría)
    incArquitectura: true,
    incEstructura: true,
    incGeotecnia: true,
    incElectrico: true,
    incHidrico: true,
    incTopografia: true,
  })

  const [savingQuote, setSavingQuote] = useState(false)

  // Exportación a PDF (Nativo)
  const pdfRef = useRef<HTMLDivElement>(null)
  
  const handleExportPDF = () => {
    // Usamos el diálogo de impresión nativo del navegador,
    // que tiene soporte perfecto para CSS y permite "Guardar como PDF".
    window.print();
  }

  

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createClientAccount(clientFormData)
    if (res.success) {
      setIsCreateModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      // Seleccionar el nuevo
      setClientFormData({nombre: '', apellido: '', email: '', telefono: '', password: ''})
      alert("Cliente creado y vinculado exitosamente.")
    } else {
      alert("Error: " + res.error)
    }
    setIsSubmitting(false)
  }

  const handleSaveQuote = async (resultados: any) => {
    if (!selectedClienteId) return alert("Por favor, selecciona o crea un cliente antes de guardar en el historial.")
    setSavingQuote(true)
    
    const payload = {
      cliente_id: selectedClienteId,
      nombre_proyecto: cotizacion.nombreProyecto,
      area_construccion: Number(cotizacion.areaConstruccion) || 0,
      total_consultoria: resultados.totalHonorarios,
      total_obra: resultados.costoObra,
      detalles_json: cotizacion
    }
    
    const { error } = await supabase.from('historial_cotizaciones').insert(payload)
    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert("Cotización guardada exitosamente en el historial.")
      queryClient.invalidateQueries({ queryKey: ['historial_cotizaciones'] })
    }
    setSavingQuote(false)
  }

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingParams(true)
    const { error } = await supabase.from('parametros_globales').update(params as any).eq('id', 1)
    setSavingParams(false)
    if (error) {
      setMensajeParametros("Error al guardar: " + error.message)
    } else {
      setMensajeParametros("Parámetros guardados correctamente.")
      setTimeout(() => setMensajeParametros(""), 3000)
    }
  }

  // Cálculos en tiempo real
  const calcularCostos = () => {
    if (!params) return null

    const areaValue = Number(cotizacion.areaConstruccion) || 0;

    // Factor Pendiente
    let fPendiente = params.factor_pendiente_plana
    if (cotizacion.pendiente === 'media') fPendiente = params.factor_pendiente_media
    if (cotizacion.pendiente === 'fuerte') fPendiente = params.factor_pendiente_fuerte

        // Factor Acabados
    let fAcabados = params.factor_acabados_estandar || 1
    if (cotizacion.acabados === 'economico') fAcabados = params.factor_acabados_economico || 0.85
    if (cotizacion.acabados === 'premium') fAcabados = params.factor_acabados_premium || 1.35

    // Factor Suelo
    let fSuelo = params.factor_suelo_normal || 1
    if (cotizacion.suelo === 'blando') fSuelo = params.factor_suelo_blando || 1.15
    if (cotizacion.suelo === 'rocoso') fSuelo = params.factor_suelo_rocoso || 1.05

    // Factor Accesibilidad
    let fAcceso = params.factor_acceso_urbano || 1
    if (cotizacion.accesibilidad === 'rural') fAcceso = params.factor_acceso_rural || 1.08

    // Factor Pisos
    let fPisos = params.factor_pisos_2 || 1
    if (cotizacion.pisos === '1') fPisos = params.factor_pisos_1 || 1.05
    if (cotizacion.pisos === '3_mas') fPisos = params.factor_pisos_3 || 1.02

    // Factor Estructura
    let fEstructura = params.factor_estructura_hormigon || 1
    if (cotizacion.estructura === 'metalica') fEstructura = params.factor_estructura_metalica || 1.15

    // Costo Base Paramétrico (m2 * factores)
    const costoObraBase = areaValue * (params.costo_base_construccion_m2 || 450) * fPendiente * fAcabados * fSuelo * fAcceso * fPisos * fEstructura

    // Costos Aditivos (Ensambles)
    let costoExtras = 0;
    
    // FASE 2: Arquitectura
    costoExtras += (Number(cotizacion.cuartosMaster) || 0) * (params.costo_extra_master || 800);
    costoExtras += (Number(cotizacion.banosCompletos) || 0) * (params.costo_extra_bano_completo || 1500);
    costoExtras += (Number(cotizacion.mediosBanos) || 0) * (params.costo_extra_medio_bano || 800);
    if (cotizacion.lavanderia) costoExtras += (params.costo_extra_lavanderia || 600);
    if (cotizacion.cocina === 'abierta') costoExtras += (params.costo_extra_cocina_isla || 1500);

    // FASE 3: Exteriores
    costoExtras += (Number(cotizacion.cerramientoMl) || 0) * (params.costo_ml_cerramiento || 120);
    if (cotizacion.piscina) costoExtras += (params.costo_extra_piscina || 12000);
    if (cotizacion.cisterna) costoExtras += (params.costo_extra_cisterna || 2500);
    if (cotizacion.garaje === 'cubierto') costoExtras += (params.costo_extra_garaje_cubierto || 3500);
    if (cotizacion.garaje === 'descubierto') costoExtras += (params.costo_extra_garaje_descubierto || 800);
    if (cotizacion.climatizacion === 'splits') costoExtras += (params.costo_extra_splits || 1200);
    if (cotizacion.climatizacion === 'central') costoExtras += (params.costo_extra_aire_central || 4500);

    const costoObra = costoObraBase + costoExtras;
    const desgloseObra = { base: costoObraBase, extras: costoExtras };

    // Módulo 1: Honorarios (Diseño y Consultoría)
    let honorariosArq = cotizacion.incArquitectura ? areaValue * (params.tarifa_diseno_arq_m2 || 12) : 0
      let honorariosEst = cotizacion.incEstructura ? areaValue * (params.tarifa_diseno_est_m2 || 8) : 0
      let honorariosGeotecnia = cotizacion.incGeotecnia ? (params.tarifa_geotecnia || 800) : 0
      let honorariosElec = cotizacion.incElectrico ? areaValue * (params.tarifa_diseno_elec_m2 || 3.5) : 0
      let honorariosHidro = cotizacion.incHidrico ? areaValue * (params.tarifa_diseno_hidro_m2 || 3.5) : 0
      let honorariosTop = cotizacion.incTopografia ? (params.tarifa_topografia_base || 350) : 0
  
      const totalHonorarios = honorariosArq + honorariosEst + honorariosGeotecnia + honorariosElec + honorariosHidro + honorariosTop

    return {
      costoObra,
      desgloseObra,
      honorariosArq,
        honorariosEst,
        honorariosGeotecnia,
        honorariosElec,
        honorariosHidro,
        honorariosTop,
      totalHonorarios
    }
  }

  const resultados = calcularCostos()

  if (loadingParams) return <div className="p-8">Cargando motor de cálculo...</div>

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Calculator className="text-brand-sage" /> Cotizador Automático
          </h1>
          <p className="text-gray-500 mt-2">Motor de consultoría y proyección paramétrica de obra.</p>
        </div>
        
        {/* Pestañas */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('generar')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'generar' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
          >
            <FileText size={16} /> Generar Cotización
          </button>
          
          <button 
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'historial' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
          >
            <CheckCircle2 size={16} /> Historial
          </button>
        </div>
      </div>

      {(false) && (
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Configuración Global de Tarifas</h2>
          {mensajeParametros && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensajeParametros.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-brand-sage/20 text-brand-dark'}`}>
              <CheckCircle2 size={20} /> {mensajeParametros}
            </div>
          )}
          
          <form onSubmit={handleSaveParams}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* Tarifas Diseño */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Consultoría y Diseño</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Arquitectura Ejecutivo ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_arq_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_arq_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Diseño Estructural ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_est_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_est_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Estudio Geotecnia (Costo Fijo)</label>
                    <input type="number" step="1" value={params?.tarifa_geotecnia || 0} onChange={e => setParams({...params, tarifa_geotecnia: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Diseño Eléctrico ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_elec_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_elec_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Diseño Hídrico ($/m²)</label>
                    <input type="number" step="0.01" value={params?.tarifa_diseno_hidro_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_hidro_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Topografía (Costo Fijo Base)</label>
                    <input type="number" step="1" value={params?.tarifa_topografia_base || 0} onChange={e => setParams({...params, tarifa_topografia_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                </div>
  
                {/* Estimador Obra */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Obra Base e Impuestos</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Costo Construcción Base ($/m²)</label>
                    <input type="number" step="1" value={params?.costo_base_construccion_m2 || 0} onChange={e => setParams({...params, costo_base_construccion_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                    <p className="text-xs text-gray-400 mt-1">Este valor base se multiplica por los factores.</p>
                  </div>
  
                  <div className="pt-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Porcentaje IVA (%)</label>
                    <input type="number" step="0.1" value={params?.porcentaje_iva_base || 15} onChange={e => setParams({...params, porcentaje_iva_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  </div>
                  
                  <h3 className="font-bold border-b pb-2 mt-8 text-brand-dark">Factores Terreno (x)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pendiente Plana</label>
                      <input type="number" step="0.01" value={params?.factor_pendiente_plana || 1} onChange={e => setParams({...params, factor_pendiente_plana: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pend. Media</label>
                      <input type="number" step="0.01" value={params?.factor_pendiente_media || 1.15} onChange={e => setParams({...params, factor_pendiente_media: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Pend. Fuerte</label>
                      <input type="number" step="0.01" value={params?.factor_pendiente_fuerte || 1.35} onChange={e => setParams({...params, factor_pendiente_fuerte: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                </div>
  
                {/* Factores Acabados */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Multiplicadores de Arquitectura</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Acab. Económico</label>
                      <input type="number" step="0.01" value={params?.factor_acabados_economico || 0.85} onChange={e => setParams({...params, factor_acabados_economico: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Acab. Estándar</label>
                      <input type="number" step="0.01" value={params?.factor_acabados_estandar || 1.00} onChange={e => setParams({...params, factor_acabados_estandar: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Acab. Premium</label>
                      <input type="number" step="0.01" value={params?.factor_acabados_premium || 1.40} onChange={e => setParams({...params, factor_acabados_premium: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Suelo Normal</label>
                      <input type="number" step="0.01" value={params?.factor_suelo_normal || 1.00} onChange={e => setParams({...params, factor_suelo_normal: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Suelo Blando</label>
                      <input type="number" step="0.01" value={params?.factor_suelo_blando || 1.15} onChange={e => setParams({...params, factor_suelo_blando: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Estr. Hormigón</label>
                      <input type="number" step="0.01" value={params?.factor_estructura_hormigon || 1.00} onChange={e => setParams({...params, factor_estructura_hormigon: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Estr. Metálica</label>
                      <input type="number" step="0.01" value={params?.factor_estructura_metalica || 1.15} onChange={e => setParams({...params, factor_estructura_metalica: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                </div>
                
                {/* Tarifas Ensambles Fijos */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2 text-brand-dark">Tarifas de Ensambles Extras ($)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Dorm. Master</label>
                      <input type="number" step="1" value={params?.costo_extra_master || 0} onChange={e => setParams({...params, costo_extra_master: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Baño Completo</label>
                      <input type="number" step="1" value={params?.costo_extra_bano_completo || 0} onChange={e => setParams({...params, costo_extra_bano_completo: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Medio Baño</label>
                      <input type="number" step="1" value={params?.costo_extra_medio_bano || 0} onChange={e => setParams({...params, costo_extra_medio_bano: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Lavandería</label>
                      <input type="number" step="1" value={params?.costo_extra_lavanderia || 0} onChange={e => setParams({...params, costo_extra_lavanderia: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Cisterna Subt.</label>
                      <input type="number" step="1" value={params?.costo_extra_cisterna || 0} onChange={e => setParams({...params, costo_extra_cisterna: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Piscina Base</label>
                      <input type="number" step="1" value={params?.costo_extra_piscina || 0} onChange={e => setParams({...params, costo_extra_piscina: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Garaje (Desc)</label>
                      <input type="number" step="1" value={params?.costo_extra_garaje_descubierto || 0} onChange={e => setParams({...params, costo_extra_garaje_descubierto: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Clima (Splits)</label>
                      <input type="number" step="1" value={params?.costo_extra_splits || 0} onChange={e => setParams({...params, costo_extra_splits: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                    </div>
                  </div>
                </div>

            </div>
            
            <div className="mt-8 pt-6 border-t flex justify-end">
              <button type="submit" disabled={savingParams} className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-2">
                <Save size={18} /> {savingParams ? "Guardando..." : "Guardar Parámetros Globales"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'generar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel de Inputs */}
          <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6 print:hidden">
            <h2 className="text-xl font-bold text-brand-dark mb-6 border-b pb-4">Inputs del Proyecto</h2>
            
            <div className="space-y-6">
              
              {/* Fila 1: Cliente */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Cliente</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                    value={selectedClienteId} 
                    onChange={e => {
                      setSelectedClienteId(e.target.value)
                      const selectedClient = clientes.find(c => c.id === e.target.value)
                      if (selectedClient) {
                        setCotizacion({...cotizacion, nombreCliente: `${selectedClient.nombre} ${selectedClient.apellido}`})
                      } else {
                        setCotizacion({...cotizacion, nombreCliente: ''})
                      }
                    }} 
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-white min-w-0"
                  >
                    <option value="">-- Seleccionar o crear nuevo --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="shrink-0 bg-brand-sage text-brand-dark px-4 py-2 rounded-lg hover:brightness-105 font-bold flex items-center justify-center gap-2"
                    title="Crear Nuevo Cliente"
                  >
                    <UserPlus size={18} /> Nuevo Cliente
                  </button>
                </div>
              </div>

              {/* Fila 2: Proyecto y Área */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Proyecto (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Residencia Familiar"
                    value={cotizacion.nombreProyecto} 
                    onChange={e => setCotizacion({...cotizacion, nombreProyecto: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Área de Construcción (mÂ²)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={cotizacion.areaConstruccion} 
                    onChange={e => setCotizacion({...cotizacion, areaConstruccion: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage text-lg font-medium"
                  />
                </div>
              </div>

                                          {/* FASE 1: CONDICIONANTES DEL SITIO Y ESTRUCTURA */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-brand-dark text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <label className="text-md font-bold text-gray-800">Condicionantes del Sitio y Estructura</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Topografía</label>
                    <select value={cotizacion.pendiente} onChange={e => setCotizacion({...cotizacion, pendiente: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="plana">Plana (&lt; 5%)</option>
                      <option value="media">Media (5% - 20%)</option>
                      <option value="fuerte">Fuerte (&gt; 20%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipo de Suelo</label>
                    <select value={cotizacion.suelo} onChange={e => setCotizacion({...cotizacion, suelo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="normal">Normal (Estándar)</option>
                      <option value="blando">Arcilloso/Blando (+15%)</option>
                      <option value="rocoso">Rocoso/Duro (+5%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Accesibilidad</label>
                    <select value={cotizacion.accesibilidad} onChange={e => setCotizacion({...cotizacion, accesibilidad: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="urbana">Urbana (Normal)</option>
                      <option value="rural">Rural/Remoto (+8%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Niveles / Pisos</label>
                    <select value={cotizacion.pisos} onChange={e => setCotizacion({...cotizacion, pisos: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="1">1 Planta (+5%)</option>
                      <option value="2">2 Plantas (Óptimo)</option>
                      <option value="3_mas">3 o más Plantas (+2%)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Sistema Estructural</label>
                    <select value={cotizacion.estructura} onChange={e => setCotizacion({...cotizacion, estructura: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="hormigon">Hormigón Armado</option>
                      <option value="metalica">Estruct. Metálica (+15%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FASE 2: ARQUITECTURA Y DISTRIBUCIÓN */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-brand-sage text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <label className="text-md font-bold text-gray-800">Arquitectura y Distribución</label>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gama de Acabados</label>
                  <select value={cotizacion.acabados} onChange={e => setCotizacion({...cotizacion, acabados: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-white border-l-4 border-l-brand-sage">
                    <option value="economico">Económico / Social</option>
                    <option value="estandar">Estándar / Comercial</option>
                    <option value="premium">Premium / Lujo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DORM. MASTER</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosMaster: Math.max(0, cotizacion.cuartosMaster - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.cuartosMaster} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosMaster: cotizacion.cuartosMaster + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DORM. ESTÁNDAR</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosNormales: Math.max(0, cotizacion.cuartosNormales - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.cuartosNormales} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, cuartosNormales: cotizacion.cuartosNormales + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">BAÑOS COMPL.</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, banosCompletos: Math.max(0, cotizacion.banosCompletos - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.banosCompletos} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, banosCompletos: cotizacion.banosCompletos + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">MEDIOS BAÑOS</label>
                    <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                      <button type="button" onClick={() => setCotizacion({...cotizacion, mediosBanos: Math.max(0, cotizacion.mediosBanos - 1)})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">-</button>
                      <input type="number" readOnly value={cotizacion.mediosBanos} className="w-full text-center bg-transparent outline-none font-bold text-brand-dark" />
                      <button type="button" onClick={() => setCotizacion({...cotizacion, mediosBanos: cotizacion.mediosBanos + 1})} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 font-bold">+</button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipo de Cocina</label>
                    <select value={cotizacion.cocina} onChange={e => setCotizacion({...cotizacion, cocina: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="cerrada">Cerrada Tradicional</option>
                      <option value="abierta">Abierta con Isla (+)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-2 w-full border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input type="checkbox" checked={cotizacion.lavanderia} onChange={e => setCotizacion({...cotizacion, lavanderia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                      <span className="font-bold text-sm text-gray-700">Incluir Cuarto Lavandería</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* FASE 3: EXTERIORES Y EQUIPAMIENTO */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <label className="text-md font-bold text-gray-800">Obras Exteriores y Equipamiento</label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cerramiento Perimetral (m)</label>
                    <input type="number" min="0" value={cotizacion.cerramientoMl} onChange={e => setCotizacion({...cotizacion, cerramientoMl: Number(e.target.value)})} placeholder="Ej: 40" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Garaje / Estacionamiento</label>
                    <select value={cotizacion.garaje} onChange={e => setCotizacion({...cotizacion, garaje: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="ninguno">Ninguno / Solo Huellas</option>
                      <option value="descubierto">Piso Descubierto (+)</option>
                      <option value="cubierto">Losa Cubierta (++)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Climatización</label>
                    <select value={cotizacion.climatizacion} onChange={e => setCotizacion({...cotizacion, climatizacion: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="ninguna">Pre-instalación (Ductos)</option>
                      <option value="splits">Equipos Splits (+)</option>
                      <option value="central">Aire Centralizado (++)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 justify-center pt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={cotizacion.cisterna} onChange={e => setCotizacion({...cotizacion, cisterna: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                      <span className="font-bold text-sm text-gray-700">Cisterna Subt. y Bomba</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={cotizacion.piscina} onChange={e => setCotizacion({...cotizacion, piscina: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                      <span className="font-bold text-sm text-gray-700">Construcción Piscina Base</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-bold text-gray-700 mb-4">Alcance de la Consultoría (Módulo 1)</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incArquitectura} onChange={e => setCotizacion({...cotizacion, incArquitectura: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Arquitectónico Ejecutivo</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incEstructura} onChange={e => setCotizacion({...cotizacion, incEstructura: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Estructural</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incGeotecnia} onChange={e => setCotizacion({...cotizacion, incGeotecnia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Estudio de Suelos (Geotecnia)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incElectrico} onChange={e => setCotizacion({...cotizacion, incElectrico: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Eléctrico</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incHidrico} onChange={e => setCotizacion({...cotizacion, incHidrico: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Diseño Hidrosanitario (Hídrico)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incTopografia} onChange={e => setCotizacion({...cotizacion, incTopografia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Levantamiento Topográfico Base</span>
                  </label>
                </div>
              </div>
            </div>

              {/* Botones de Acci?n */}
              <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 print:hidden">
                <button 
                  onClick={() => handleSaveQuote(resultados)}
                  disabled={savingQuote || !selectedClienteId}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-brand-dark text-brand-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                >
                  <Save size={18} /> {savingQuote ? 'Guardando...' : 'Guardar Cotización'}
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center justify-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors text-sm cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <Download size={18} /> Exportar a PDF
                </button>
              </div>
          </div>

          {/* Dashboards de Salida */}
          <div className="space-y-4">
            
            

            {/* Contenedor que será convertido a PDF */}
            <div ref={pdfRef} className="space-y-6 bg-white p-4 sm:p-8 rounded-xl border border-transparent">
              
              {/* Encabezado PDF (Oculto en pantalla normal si quisiéramos, pero se ve bien integrado) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-brand-dark tracking-tight">SARA Constructora</h2>
                  <p className="text-sm text-brand-sage font-bold uppercase tracking-widest mt-1">Propuesta de Servicios</p>
                  
                  {(cotizacion.nombreCliente || cotizacion.nombreProyecto) && (
                    <div className="mt-4 space-y-1">
                      {cotizacion.nombreCliente && (
                        <p className="text-sm font-bold text-gray-800">Cliente: <span className="font-normal text-gray-600">{cotizacion.nombreCliente}</span></p>
                      )}
                      {cotizacion.nombreProyecto && (
                        <p className="text-sm font-bold text-gray-800">Proyecto: <span className="font-normal text-gray-600">{cotizacion.nombreProyecto}</span></p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <p className="text-sm font-bold text-gray-800">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
                  <p className="text-sm text-gray-500">Área de Proyecto: {cotizacion.areaConstruccion} mÂ²</p>
                </div>
              </div>

              {/* Dashboard Consultoría */}
              <div className="bg-brand-dark text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                <h3 className="text-sm tracking-widest text-brand-sage uppercase font-bold mb-4">Módulo 1: Diseño y Consultoría</h3>
                <div className="text-4xl font-extrabold mb-6">
                  ${resultados?.totalHonorarios.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                
                <div className="space-y-2 text-sm text-gray-300">
                  {cotizacion.incTopografia && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Levantamiento Topográfico Base</span>
                      <span>${resultados?.honorariosTop.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incArquitectura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Arquitectónico Ejecutivo</span>
                      <span>${resultados?.honorariosArq?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incEstructura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Estructural</span>
                      <span>${resultados?.honorariosEst?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incGeotecnia && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Estudio de Suelos (Geotecnia)</span>
                      <span>${resultados?.honorariosGeotecnia?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incElectrico && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Eléctrico</span>
                      <span>${resultados?.honorariosElec?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incHidrico && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Hidrosanitario (Hídrico)</span>
                      <span>${resultados?.honorariosHidro?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incTopografia && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Levantamiento Topográfico Base</span>
                      <span>${resultados?.honorariosTop?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 text-brand-sage font-bold">
                    <span>IVA Estimado ({(params?.porcentaje_iva_base || 15)}%):</span>
                    <span>${((resultados?.totalHonorarios || 0) * ((params?.porcentaje_iva_base || 15) / 100)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Obra */}
              <div className="bg-white border-2 border-brand-sage/30 rounded-xl shadow-md p-6">
                <h3 className="text-sm tracking-widest text-gray-500 uppercase font-bold mb-2">Módulo 2: Proyección Paramétrica de Obra</h3>
                  <p className="text-xs text-gray-400 mb-4">Estimador referencial (Orden de magnitud) previo al Análisis de Precios Unitarios (APUs).</p>
                  
                  <div className="text-3xl font-extrabold text-brand-dark mb-1">
                    ${resultados?.costoObra.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </div>
                  <p className="text-sm font-bold text-brand-sage mb-4 uppercase">Gran Total (Incluye Obra, Extras y Ensambles)</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">Costo Base Referencial:</span>
                      <span className="font-medium">${params?.costo_base_construccion_m2} / m²</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-gray-500">Ajuste por Topografía ({cotizacion.pendiente}):</span>
                      <span className="font-medium">x {cotizacion.pendiente === 'plana' ? params?.factor_pendiente_plana : cotizacion.pendiente === 'media' ? params?.factor_pendiente_media : params?.factor_pendiente_fuerte}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ajuste por Calidad de Acabados ({cotizacion.acabados}):</span>
                      <span className="font-medium">x {cotizacion.acabados === 'economico' ? params?.factor_acabados_economico : cotizacion.acabados === 'estandar' ? params?.factor_acabados_estandar : params?.factor_acabados_premium}</span>
                    </div>
                      <div className="flex justify-between border-t border-gray-200 mt-2 pt-2">
                        <span className="text-gray-500">Tipo de Suelo ({cotizacion.suelo}):</span>
                        <span className="font-medium">x {cotizacion.suelo === 'normal' ? (params?.factor_suelo_normal || 1) : cotizacion.suelo === 'blando' ? (params?.factor_suelo_blando || 1.15) : (params?.factor_suelo_rocoso || 1.05)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Logística de Acceso ({cotizacion.accesibilidad}):</span>
                        <span className="font-medium">x {cotizacion.accesibilidad === 'urbana' ? (params?.factor_acceso_urbano || 1) : (params?.factor_acceso_rural || 1.08)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Niveles/Pisos ({cotizacion.pisos} pisos):</span>
                        <span className="font-medium">x {cotizacion.pisos === '1' ? (params?.factor_pisos_1 || 1.05) : cotizacion.pisos === '2' ? (params?.factor_pisos_2 || 1) : (params?.factor_pisos_3 || 1.02)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sistema Estructural ({cotizacion.estructura}):</span>
                        <span className="font-medium">x {cotizacion.estructura === 'hormigon' ? (params?.factor_estructura_hormigon || 1) : (params?.factor_estructura_metalica || 1.15)}</span>
                      </div>
                      
                      <div className="flex justify-between border-t border-gray-300 pt-3 mt-3 font-bold text-gray-800">
                        <span>Subtotal Obra Gris y Acabados Base:</span>
                        <span>${resultados?.desgloseObra?.base?.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>
                  </div>
                </div>
                
  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 mt-4">
                      <div className="font-bold text-gray-700 border-b pb-2 mb-2">Desglose de Ensambles y Extras</div>
                    {cotizacion.cuartosMaster > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.cuartosMaster} Dormitorios Master</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.cuartosMaster * (params?.costo_extra_master || 800)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.banosCompletos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.banosCompletos} Baños Completos</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.banosCompletos * (params?.costo_extra_bano_completo || 1500)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.mediosBanos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.mediosBanos} Medios Baños</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.mediosBanos * (params?.costo_extra_medio_bano || 800)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.lavanderia && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Área de Lavandería</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_lavanderia || 600).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.cocina === 'abierta' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cocina Abierta con Isla</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_cocina_isla || 1500).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.cerramientoMl > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{cotizacion.cerramientoMl}ml Cerramiento Perimetral</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.cerramientoMl * (params?.costo_ml_cerramiento || 120)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.cisterna && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cisterna Subterránea</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_cisterna || 2500).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.piscina && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Construcción de Piscina</span>
                        <span className="font-medium text-brand-sage">+ ${(params?.costo_extra_piscina || 12000).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.garaje !== 'ninguno' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Garaje ({cotizacion.garaje})</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.garaje === 'cubierto' ? (params?.costo_extra_garaje_cubierto || 3500) : (params?.costo_extra_garaje_descubierto || 800)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    {cotizacion.climatizacion !== 'ninguna' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Climatización ({cotizacion.climatizacion})</span>
                        <span className="font-medium text-brand-sage">+ ${(cotizacion.climatizacion === 'central' ? (params?.costo_extra_aire_central || 4500) : (params?.costo_extra_splits || 1200)).toLocaleString('en-US')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold">
                      <span className="text-gray-800">Total Extras:</span>
                      <span className="text-brand-dark">${(resultados?.desgloseObra?.extras || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
              
              {/* Footer PDF */}
              <div className="pt-8 text-center text-xs text-gray-400">
                <p>Este documento es una proyección estimativa generada automáticamente y no constituye un contrato legal ni una oferta vinculante final.</p>
                <p>Los valores de obra están sujetos a variaciones del mercado y estudios definitivos.</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* PESTAÃ‘A HISTORIAL */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Historial de Cotizaciones Emitidas</h2>
          
          {historialCotizaciones.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No hay cotizaciones guardadas en el historial.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left divide-y divide-gray-200">
                <thead className="bg-slate-100 text-slate-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Fecha</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Proyecto</th>
                    <th className="px-4 py-3 text-right">Área</th>
                    <th className="px-4 py-3 text-right">Consultoría</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Obra (Aprox)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historialCotizaciones.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(c.created_at).toLocaleDateString('es-ES')}</td>
                      <td className="px-4 py-3 font-medium text-brand-dark">{c.clientes?.nombre} {c.clientes?.apellido}</td>
                      <td className="px-4 py-3 text-gray-600">{c.nombre_proyecto || '-'}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{c.area_construccion} mÂ²</td>
                      <td className="px-4 py-3 text-right font-bold text-brand-sage">${Number(c.total_consultoria).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-600">${Number(c.total_obra).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Crear Cliente */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Crear Cuenta de Cliente</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre *</label>
                  <input required type="text" placeholder="Ej. Carlos" value={clientFormData.nombre} onChange={e => setClientFormData({...clientFormData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Apellido *</label>
                  <input required type="text" placeholder="Ej. Mendoza" value={clientFormData.apellido} onChange={e => setClientFormData({...clientFormData, apellido: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                <input required type="email" placeholder="carlos@empresa.com" value={clientFormData.email} onChange={e => setClientFormData({...clientFormData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <input type="text" placeholder="Ej. 098 765 4321" value={clientFormData.telefono} onChange={e => setClientFormData({...clientFormData, telefono: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Temporal *</label>
                <input required type="text" placeholder="Ej. Sara2026" value={clientFormData.password} onChange={e => setClientFormData({...clientFormData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
                <p className="text-xs text-gray-500 mt-1">Comparte esta clave con el cliente. Podrá cambiarla desde su panel.</p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-dark text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



