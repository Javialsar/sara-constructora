"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, Calculator, Save, FileText, CheckCircle2, Download, UserPlus, X } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { createClientAccount } from "../clientes/actions"

export default function CotizadorPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'generar' | 'parametros' | 'historial'>('generar')
  
  // Estado para parÃ¡metros
  const [params, setParams] = useState<any>(null)
  const [loadingParams, setLoadingParams] = useState(true)
  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  // Estados de clientes
  const [clientes, setClientes] = useState<any[]>([])
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

  // Estado para la cotizaciÃ³n actual
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
    incMep: true,
    incTopografia: true,
  })

  const [savingQuote, setSavingQuote] = useState(false)

  // ExportaciÃ³n a PDF (Nativo)
  const pdfRef = useRef<HTMLDivElement>(null)
  
  const handleExportPDF = () => {
    // Usamos el diÃ¡logo de impresiÃ³n nativo del navegador,
    // que tiene soporte perfecto para CSS y permite "Guardar como PDF".
    window.print();
  }

  const [historialCotizaciones, setHistorialCotizaciones] = useState<any[]>([])
  
  // Cargar parÃ¡metros al iniciar
  useEffect(() => {
    fetchParametros()
    fetchClientes()
    fetchHistorialCotizaciones()
  }, [])

  const fetchParametros = async () => {
    setLoadingParams(true)
    const { data } = await supabase.from('cotizador_parametros').select('*').eq('id', 1).single()
    if (data) setParams(data)
    setLoadingParams(false)
  }

  const fetchHistorialCotizaciones = async () => {
    const { data: historialData, error } = await supabase
      .from('historial_cotizaciones')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error("Error cargando historial:", error)
      return
    }

    if (historialData) {
      // Traemos clientes manualmente para evitar errores de Foreign Keys
      const { data: clientesData } = await supabase.from('clientes').select('id, nombre, apellido')
      
      const merged = historialData.map(h => {
        const c = clientesData?.find(client => client.id === h.cliente_id)
        return {
          ...h,
          clientes: c || { nombre: 'Cliente', apellido: 'No encontrado' }
        }
      })
      
      setHistorialCotizaciones(merged)
    }
  }

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    if (data) setClientes(data)
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await createClientAccount(clientFormData)
    if (res.success) {
      setIsCreateModalOpen(false)
      await fetchClientes()
      // Seleccionar el nuevo (podemos buscarlo por nombre o simplemente resetear el dropdown)
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
      alert("CotizaciÃ³n guardada exitosamente en el historial.")
      fetchHistorialCotizaciones()
    }
    setSavingQuote(false)
  }

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingParams(true)
    const { error } = await supabase.from('cotizador_parametros').update(params).eq('id', 1)
    setSavingParams(false)
    if (error) {
      setMensajeParametros("Error al guardar: " + error.message)
    } else {
      setMensajeParametros("ParÃ¡metros guardados correctamente.")
      setTimeout(() => setMensajeParametros(""), 3000)
    }
  }

  // CÃ¡lculos en tiempo real
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

    // MÃ³dulo 1: Honorarios (DiseÃ±o y ConsultorÃ­a)
    let honorariosArq = cotizacion.incArquitectura ? areaValue * params.tarifa_diseno_arq_m2 : 0
    let honorariosEst = cotizacion.incEstructura ? areaValue * params.tarifa_diseno_est_m2 : 0
    let honorariosMep = cotizacion.incMep ? areaValue * params.tarifa_diseno_mep_m2 : 0
    let honorariosTop = cotizacion.incTopografia ? params.tarifa_topografia_base : 0

    const totalHonorarios = honorariosArq + honorariosEst + honorariosMep + honorariosTop

    return {
      costoObra,
      desgloseObra,
      honorariosArq,
      honorariosEst,
      honorariosMep,
      honorariosTop,
      totalHonorarios
    }
  }

  const resultados = calcularCostos()

  if (loadingParams) return <div className="p-8">Cargando motor de cÃ¡lculo...</div>

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <Calculator className="text-brand-sage" /> Cotizador AutomÃ¡tico
          </h1>
          <p className="text-gray-500 mt-2">Motor de consultorÃ­a y proyecciÃ³n paramÃ©trica de obra.</p>
        </div>
        
        {/* PestaÃ±as */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('generar')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'generar' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
          >
            <FileText size={16} /> Generar CotizaciÃ³n
          </button>
          <button 
            onClick={() => setActiveTab('parametros')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'parametros' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
          >
            <Settings size={16} /> ParÃ¡metros Base
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'historial' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
          >
            <CheckCircle2 size={16} /> Historial
          </button>
        </div>
      </div>

      {activeTab === 'parametros' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">ConfiguraciÃ³n Global de Tarifas</h2>
          {mensajeParametros && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensajeParametros.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-brand-sage/20 text-brand-dark'}`}>
              <CheckCircle2 size={20} /> {mensajeParametros}
            </div>
          )}
          
          <form onSubmit={handleSaveParams}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Tarifas DiseÃ±o */}
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2">Tarifas de DiseÃ±o ($ / mÂ²)</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Arquitectura Ejecutivo</label>
                  <input type="number" step="0.01" value={params?.tarifa_diseno_arq_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_arq_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">IngenierÃ­a Estructural</label>
                  <input type="number" step="0.01" value={params?.tarifa_diseno_est_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_est_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">IngenierÃ­as MEP</label>
                  <input type="number" step="0.01" value={params?.tarifa_diseno_mep_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_mep_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">TopografÃ­a (Costo Fijo Base)</label>
                  <input type="number" step="0.01" value={params?.tarifa_topografia_base || 0} onChange={e => setParams({...params, tarifa_topografia_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
              </div>

              {/* Estimador Obra */}
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2">Estimador de Obra ($ / mÂ²)</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Costo Base ConstrucciÃ³n</label>
                  <input type="number" step="0.01" value={params?.costo_base_construccion_m2 || 0} onChange={e => setParams({...params, costo_base_construccion_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  <p className="text-xs text-gray-400 mt-1">Este valor base se multiplicarÃ¡ por los factores.</p>
                </div>

                <h3 className="font-bold border-b pb-2 mt-8">Impuestos y Regulaciones</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Porcentaje IVA (%)</label>
                  <input type="number" step="0.1" value={params?.porcentaje_iva_base || 15} onChange={e => setParams({...params, porcentaje_iva_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  <p className="text-xs text-gray-400 mt-1">Este IVA se aplicarÃ¡ por defecto si se requiere factura.</p>
                </div>
              </div>

              {/* Factores Multiplicadores */}
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2">Factores Multiplicadores</h3>
                
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

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Acab. EconÃ³mico</label>
                    <input type="number" step="0.01" value={params?.factor_acabados_economico || 0.85} onChange={e => setParams({...params, factor_acabados_economico: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Acab. EstÃ¡ndar</label>
                    <input type="number" step="0.01" value={params?.factor_acabados_estandar || 1.00} onChange={e => setParams({...params, factor_acabados_estandar: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Acab. Premium</label>
                    <input type="number" step="0.01" value={params?.factor_acabados_premium || 1.40} onChange={e => setParams({...params, factor_acabados_premium: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-brand-sage" />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t flex justify-end">
              <button type="submit" disabled={savingParams} className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-2">
                <Save size={18} /> {savingParams ? "Guardando..." : "Guardar ParÃ¡metros"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'generar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel de Inputs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
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

              {/* Fila 2: Proyecto y Ãrea */}
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ãrea de ConstrucciÃ³n (mÂ²)</label>
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

                            {/* Par?metros de Terreno y Obra */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-4">Condiciones del Terreno y Obra</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Topograf?a</label>
                    <select value={cotizacion.pendiente} onChange={e => setCotizacion({...cotizacion, pendiente: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="plana">Plana (&lt; 5%)</option>
                      <option value="media">Media (5% - 20%)</option>
                      <option value="fuerte">Fuerte (&gt; 20%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Calidad Acabados</label>
                    <select value={cotizacion.acabados} onChange={e => setCotizacion({...cotizacion, acabados: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="economico">Económico / Social</option>
                      <option value="estandar">Estándar / Comercial</option>
                      <option value="premium">Premium / Lujo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tipo de Suelo</label>
                    <select value={cotizacion.suelo} onChange={e => setCotizacion({...cotizacion, suelo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="normal">Normal (Est?ndar)</option>
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
                      <option value="2">2 Plantas (?ptimo)</option>
                      <option value="3_mas">3 o m?s Plantas (+2%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Sis. Estructural</label>
                    <select value={cotizacion.estructura} onChange={e => setCotizacion({...cotizacion, estructura: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage bg-gray-50">
                      <option value="hormigon">Hormigón Armado</option>
                      <option value="metalica">Estruct. Metálica (+15%)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-bold text-gray-700 mb-4">Alcance de la ConsultorÃ­a (MÃ³dulo 1)</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incArquitectura} onChange={e => setCotizacion({...cotizacion, incArquitectura: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>DiseÃ±o ArquitectÃ³nico Ejecutivo</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incEstructura} onChange={e => setCotizacion({...cotizacion, incEstructura: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>DiseÃ±o Estructural / Geotecnia</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incMep} onChange={e => setCotizacion({...cotizacion, incMep: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>IngenierÃ­as MEP (Hidro / ElÃ©ctrica)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incTopografia} onChange={e => setCotizacion({...cotizacion, incTopografia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Levantamiento TopogrÃ¡fico Base</span>
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
                  <Save size={18} /> {savingQuote ? 'Guardando...' : 'Guardar Cotizaci?n'}
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
            
            

            {/* Contenedor que serÃ¡ convertido a PDF */}
            <div ref={pdfRef} className="space-y-6 bg-white p-4 sm:p-8 rounded-xl border border-transparent">
              
              {/* Encabezado PDF (Oculto en pantalla normal si quisiÃ©ramos, pero se ve bien integrado) */}
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
                  <p className="text-sm text-gray-500">Ãrea de Proyecto: {cotizacion.areaConstruccion} mÂ²</p>
                </div>
              </div>

              {/* Dashboard ConsultorÃ­a */}
              <div className="bg-brand-dark text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                <h3 className="text-sm tracking-widest text-brand-sage uppercase font-bold mb-4">MÃ³dulo 1: DiseÃ±o y ConsultorÃ­a</h3>
                <div className="text-4xl font-extrabold mb-6">
                  ${resultados?.totalHonorarios.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                
                <div className="space-y-2 text-sm text-gray-300">
                  {cotizacion.incTopografia && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Levantamiento TopogrÃ¡fico Base</span>
                      <span>${resultados?.honorariosTop.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incArquitectura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>DiseÃ±o ArquitectÃ³nico Ejecutivo</span>
                      <span>${resultados?.honorariosArq.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incEstructura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>DiseÃ±o Estructural y Geotecnia</span>
                      <span>${resultados?.honorariosEst.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incMep && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>IngenierÃ­as MEP (Hidrosanitaria / ElÃ©ctrica)</span>
                      <span>${resultados?.honorariosMep.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
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
                <h3 className="text-sm tracking-widest text-gray-500 uppercase font-bold mb-2">MÃ³dulo 2: ProyecciÃ³n ParamÃ©trica de Obra</h3>
                <p className="text-xs text-gray-400 mb-4">Estimador referencial (Orden de magnitud) previo al AnÃ¡lisis de Precios Unitarios (APUs).</p>
                
                <div className="text-3xl font-extrabold text-brand-dark mb-4">
                  ${resultados?.costoObra.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-500">Costo Base Referencial:</span>
                    <span className="font-medium">${params?.costo_base_construccion_m2} / mÂ²</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-500">Ajuste por TopografÃ­a ({cotizacion.pendiente}):</span>
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
                <p>Este documento es una proyecciÃ³n estimativa generada automÃ¡ticamente y no constituye un contrato legal ni una oferta vinculante final.</p>
                <p>Los valores de obra estÃ¡n sujetos a variaciones del mercado y estudios definitivos.</p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* PESTAÃ‘A HISTORIAL */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Historial de Cotizaciones Emitidas</h2>
          
          {historialCotizaciones.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No hay cotizaciones guardadas en el historial.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Fecha</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Proyecto</th>
                    <th className="px-4 py-3 text-right">Ãrea</th>
                    <th className="px-4 py-3 text-right">ConsultorÃ­a</th>
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
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo ElectrÃ³nico *</label>
                <input required type="email" placeholder="carlos@empresa.com" value={clientFormData.email} onChange={e => setClientFormData({...clientFormData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">TelÃ©fono / WhatsApp</label>
                <input type="text" placeholder="Ej. 098 765 4321" value={clientFormData.telefono} onChange={e => setClientFormData({...clientFormData, telefono: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">ContraseÃ±a Temporal *</label>
                <input required type="text" placeholder="Ej. Sara2026" value={clientFormData.password} onChange={e => setClientFormData({...clientFormData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage" />
                <p className="text-xs text-gray-500 mt-1">Comparte esta clave con el cliente. PodrÃ¡ cambiarla desde su panel.</p>
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



