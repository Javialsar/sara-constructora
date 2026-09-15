"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, Calculator, Save, FileText, CheckCircle2, Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function CotizadorPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'generar' | 'parametros'>('generar')
  
  // Estado para parámetros
  const [params, setParams] = useState<any>(null)
  const [loadingParams, setLoadingParams] = useState(true)
  const [savingParams, setSavingParams] = useState(false)
  const [mensajeParametros, setMensajeParametros] = useState("")

  // Estado para la cotización actual
  const [cotizacion, setCotizacion] = useState({
    areaConstruccion: 100,
    pendiente: 'plana', // plana, media, fuerte
    acabados: 'estandar', // economico, estandar, premium
    incArquitectura: true,
    incEstructura: true,
    incMep: true,
    incTopografia: true,
  })

  // Exportación a PDF
  const pdfRef = useRef<HTMLDivElement>(null)
  const [exportingPDF, setExportingPDF] = useState(false)

  const handleExportPDF = async () => {
    if (!pdfRef.current) return
    setExportingPDF(true)
    
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(pdfRef.current!, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: '#ffffff'
        })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Cotizacion_SARA_${new Date().toISOString().split('T')[0]}.pdf`)
      } catch (error) {
        console.error("Error al exportar PDF:", error)
      }
      setExportingPDF(false)
    }, 100)
  }

  // Cargar parámetros al iniciar
  useEffect(() => {
    fetchParametros()
  }, [])

  const fetchParametros = async () => {
    setLoadingParams(true)
    const { data } = await supabase.from('cotizador_parametros').select('*').eq('id', 1).single()
    if (data) setParams(data)
    setLoadingParams(false)
  }

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingParams(true)
    const { error } = await supabase.from('cotizador_parametros').update(params).eq('id', 1)
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

    // Factor Pendiente
    let fPendiente = params.factor_pendiente_plana
    if (cotizacion.pendiente === 'media') fPendiente = params.factor_pendiente_media
    if (cotizacion.pendiente === 'fuerte') fPendiente = params.factor_pendiente_fuerte

    // Factor Acabados
    let fAcabados = params.factor_acabados_estandar
    if (cotizacion.acabados === 'economico') fAcabados = params.factor_acabados_economico
    if (cotizacion.acabados === 'premium') fAcabados = params.factor_acabados_premium

    // Módulo 2: Costo de Obra Paramétrico
    const costoObra = cotizacion.areaConstruccion * params.costo_base_construccion_m2 * fPendiente * fAcabados

    // Módulo 1: Honorarios (Diseño y Consultoría)
    let honorariosArq = cotizacion.incArquitectura ? cotizacion.areaConstruccion * params.tarifa_diseno_arq_m2 : 0
    let honorariosEst = cotizacion.incEstructura ? cotizacion.areaConstruccion * params.tarifa_diseno_est_m2 : 0
    let honorariosMep = cotizacion.incMep ? cotizacion.areaConstruccion * params.tarifa_diseno_mep_m2 : 0
    let honorariosTop = cotizacion.incTopografia ? params.tarifa_topografia_base : 0

    const totalHonorarios = honorariosArq + honorariosEst + honorariosMep + honorariosTop

    return {
      costoObra,
      honorariosArq,
      honorariosEst,
      honorariosMep,
      honorariosTop,
      totalHonorarios
    }
  }

  const resultados = calcularCostos()

  if (loadingParams) return <div className="p-8">Cargando motor de cálculo...</div>

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
            onClick={() => setActiveTab('parametros')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'parametros' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
          >
            <Settings size={16} /> Parámetros Base
          </button>
        </div>
      </div>

      {activeTab === 'parametros' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Configuración Global de Tarifas</h2>
          {mensajeParametros && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${mensajeParametros.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-brand-sage/20 text-brand-dark'}`}>
              <CheckCircle2 size={20} /> {mensajeParametros}
            </div>
          )}
          
          <form onSubmit={handleSaveParams}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Tarifas Diseño */}
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2">Tarifas de Diseño ($ / m²)</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Arquitectura Ejecutivo</label>
                  <input type="number" step="0.01" value={params?.tarifa_diseno_arq_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_arq_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ingeniería Estructural</label>
                  <input type="number" step="0.01" value={params?.tarifa_diseno_est_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_est_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ingenierías MEP</label>
                  <input type="number" step="0.01" value={params?.tarifa_diseno_mep_m2 || 0} onChange={e => setParams({...params, tarifa_diseno_mep_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Topografía (Costo Fijo Base)</label>
                  <input type="number" step="0.01" value={params?.tarifa_topografia_base || 0} onChange={e => setParams({...params, tarifa_topografia_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                </div>
              </div>

              {/* Estimador Obra */}
              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2">Estimador de Obra ($ / m²)</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Costo Base Construcción</label>
                  <input type="number" step="0.01" value={params?.costo_base_construccion_m2 || 0} onChange={e => setParams({...params, costo_base_construccion_m2: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  <p className="text-xs text-gray-400 mt-1">Este valor base se multiplicará por los factores.</p>
                </div>

                <h3 className="font-bold border-b pb-2 mt-8">Impuestos y Regulaciones</h3>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Porcentaje IVA (%)</label>
                  <input type="number" step="0.1" value={params?.porcentaje_iva_base || 15} onChange={e => setParams({...params, porcentaje_iva_base: parseFloat(e.target.value)})} className="w-full border rounded px-3 py-2 outline-none focus:border-brand-sage" />
                  <p className="text-xs text-gray-400 mt-1">Este IVA se aplicará por defecto si se requiere factura.</p>
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
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t flex justify-end">
              <button type="submit" disabled={savingParams} className="bg-brand-dark text-white px-6 py-2.5 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors flex items-center gap-2">
                <Save size={18} /> {savingParams ? "Guardando..." : "Guardar Parámetros"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'generar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel de Inputs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-brand-dark mb-6 border-b pb-4">Inputs del Proyecto</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Área de Construcción (m²)</label>
                <input 
                  type="number" 
                  value={cotizacion.areaConstruccion} 
                  onChange={e => setCotizacion({...cotizacion, areaConstruccion: Number(e.target.value)})} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage text-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Topografía</label>
                  <select 
                    value={cotizacion.pendiente} 
                    onChange={e => setCotizacion({...cotizacion, pendiente: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                  >
                    <option value="plana">Plana (&lt; 5%)</option>
                    <option value="media">Media (5% - 20%)</option>
                    <option value="fuerte">Fuerte (&gt; 20%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Calidad Acabados</label>
                  <select 
                    value={cotizacion.acabados} 
                    onChange={e => setCotizacion({...cotizacion, acabados: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                  >
                    <option value="economico">Económico / Social</option>
                    <option value="estandar">Estándar / Comercial</option>
                    <option value="premium">Premium / Lujo</option>
                  </select>
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
                    <span>Diseño Estructural / Geotecnia</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incMep} onChange={e => setCotizacion({...cotizacion, incMep: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Ingenierías MEP (Hidro / Eléctrica)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={cotizacion.incTopografia} onChange={e => setCotizacion({...cotizacion, incTopografia: e.target.checked})} className="w-5 h-5 accent-brand-sage" />
                    <span>Levantamiento Topográfico Base</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboards de Salida */}
          <div className="space-y-4">
            
            {/* Controles de Exportación */}
            <div className="flex justify-end">
              <button 
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-sage hover:text-brand-dark transition-colors text-sm"
              >
                <Download size={16} /> {exportingPDF ? 'Generando PDF...' : 'Exportar a PDF'}
              </button>
            </div>

            {/* Contenedor que será convertido a PDF */}
            <div ref={pdfRef} className="space-y-6 bg-white p-4 sm:p-8 rounded-xl border border-transparent">
              
              {/* Encabezado PDF (Oculto en pantalla normal si quisiéramos, pero se ve bien integrado) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-brand-dark tracking-tight">SARA Constructora</h2>
                  <p className="text-sm text-brand-sage font-bold uppercase tracking-widest mt-1">Propuesta de Servicios</p>
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <p className="text-sm font-bold text-gray-800">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
                  <p className="text-sm text-gray-500">Área de Proyecto: {cotizacion.areaConstruccion} m²</p>
                </div>
              </div>

              {/* Dashboard Consultoría */}
              <div className="bg-brand-dark text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sage/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
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
                      <span>${resultados?.honorariosArq.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incEstructura && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Diseño Estructural y Geotecnia</span>
                      <span>${resultados?.honorariosEst.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {cotizacion.incMep && (
                    <div className="flex justify-between border-b border-white/10 pb-1">
                      <span>Ingenierías MEP (Hidrosanitaria / Eléctrica)</span>
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
                <h3 className="text-sm tracking-widest text-gray-500 uppercase font-bold mb-2">Módulo 2: Proyección Paramétrica de Obra</h3>
                <p className="text-xs text-gray-400 mb-4">Estimador referencial (Orden de magnitud) previo al Análisis de Precios Unitarios (APUs).</p>
                
                <div className="text-3xl font-extrabold text-brand-dark mb-4">
                  ${resultados?.costoObra.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                
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
    </div>
  )
}
