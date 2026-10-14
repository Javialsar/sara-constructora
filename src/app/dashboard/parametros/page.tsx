"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, Save, CheckCircle2, Hash, FileText, Landmark, ShieldCheck, Percent, HelpCircle, Loader2 } from "lucide-react"

export default function ParametrosClientePage() {
  const supabase = createClient()
  
  const [params, setParams] = useState({
    // Precisión Decimal
    decimales_calculos: 4,
    decimales_cantidades: 2,
    decimales_precios: 2,

    // Costos Indirectos AIU
    porcentaje_admin_default: 10.0,
    porcentaje_imprevistos_default: 5.0,
    porcentaje_utilidad_default: 10.0,
    herramienta_menor_default: 5.0,

    // Políticas Fiscales SRI Ecuador 2026
    regimen_tributario: "general", // general, rimpe_emprendedor, rimpe_popular, contribuyente_especial
    es_agente_retencion: false,
    retencion_renta_pct: 1.75,
    retencion_iva_pct: 30.0,
    tarifa_iva_vigente: 15.0,

    // Cotizador Rápido y Márgenes
    margen_comercial_minimo: 12.0,
    costo_metro_cuadrado_referencial: 450.0
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    fetchParametros()
  }, [])

  const fetchParametros = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('empresa_parametros_cliente')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setParams(prev => ({
          ...prev,
          ...data
        }))
      }
    } catch (err) {
      console.error("Error al cargar parámetros de empresa:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMensaje("")
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Sesión no válida. Inicia sesión nuevamente.")
        return
      }

      const payload = {
        user_id: user.id,
        decimales_calculos: Number(params.decimales_calculos),
        decimales_cantidades: Number(params.decimales_cantidades),
        decimales_precios: Number(params.decimales_precios),
        porcentaje_admin_default: Number(params.porcentaje_admin_default),
        porcentaje_imprevistos_default: Number(params.porcentaje_imprevistos_default),
        porcentaje_utilidad_default: Number(params.porcentaje_utilidad_default),
        herramienta_menor_default: Number(params.herramienta_menor_default),
        regimen_tributario: params.regimen_tributario,
        es_agente_retencion: params.es_agente_retencion,
        retencion_renta_pct: Number(params.retencion_renta_pct),
        retencion_iva_pct: Number(params.retencion_iva_pct),
        tarifa_iva_vigente: Number(params.tarifa_iva_vigente),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('empresa_parametros_cliente')
        .upsert([payload], { onConflict: 'user_id' })

      if (!error) {
        setMensaje("¡Parámetros de tu empresa y políticas SRI guardados exitosamente!")
        setTimeout(() => setMensaje(""), 4000)
      } else {
        setMensaje("Error al guardar: " + error.message)
      }
    } catch (err: any) {
      setMensaje("Error inesperado: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col justify-center items-center h-full">
        <Loader2 className="w-10 h-10 text-brand-sage animate-spin mb-3" />
        <p className="text-gray-500 font-medium text-sm">Cargando parámetros empresariales...</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-sage uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> Configuración de Tu Empresa Constructora
          </div>
          <h1 className="text-3xl font-black text-brand-dark flex items-center gap-3">
            <Settings className="text-brand-sage" size={32} />
            Parámetros Empresariales & Políticas SRI
          </h1>
          <p className="text-gray-500 mt-1 max-w-2xl text-sm">
            Control absoluto de tu estructura de costos indirectos (AIU), precisión numérica y obligaciones tributarias ante el SRI Ecuador (2026).
          </p>
        </div>

        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-sage hover:bg-brand-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Guardar Parámetros</span>
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
          mensaje.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        }`}>
          <CheckCircle2 size={20} className={mensaje.includes("Error") ? "text-red-500" : "text-emerald-600"} />
          <span>{mensaje}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECCIÓN 1: Precisión Decimal y Rendimiento del Sistema */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-4 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <Hash size={18} className="text-brand-sage" />
              1. Precisión Decimal en Presupuestos y Reportes
            </div>
            <span className="text-xs text-slate-400 font-mono">Norma Ecuatoriana SERCOP</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Cálculos Internos (Decimales)</label>
              <input
                type="number"
                min="2"
                max="6"
                value={params.decimales_calculos}
                onChange={e => handleChange('decimales_calculos', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage bg-gray-50/50"
              />
              <p className="text-[11px] text-gray-400 mt-1">Precisión de punto flotante para cálculo de recetas invisibles (Recomendado: 4).</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Cantidades de Obra (Decimales)</label>
              <input
                type="number"
                min="0"
                max="4"
                value={params.decimales_cantidades}
                onChange={e => handleChange('decimales_cantidades', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage bg-gray-50/50"
              />
              <p className="text-[11px] text-gray-400 mt-1">Decimales visibles en volúmenes de obra m3, m2, kg (Recomendado: 2).</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Precios en Pantalla y PDF ($)</label>
              <input
                type="number"
                min="2"
                max="4"
                value={params.decimales_precios}
                onChange={e => handleChange('decimales_precios', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage bg-gray-50/50"
              />
              <p className="text-[11px] text-gray-400 mt-1">Decimales para exportación de ofertas al cliente y SERCOP (Recomendado: 2).</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Costos Indirectos AIU Predeterminados de tu Constructora */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-brand-sage text-white p-4 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <FileText size={18} />
              2. Costos Indirectos (AIU) Predeterminados para Nuevos Presupuestos
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">Margen Base</span>
          </div>
          <div className="p-6">
            <p className="text-xs text-gray-500 mb-5">
              Al crear un nuevo presupuesto en <strong>SARA-APU</strong>, estos porcentajes se aplicarán automáticamente como tu plantilla empresarial. Podrás ajustarlos individualmente por proyecto.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Gastos Generales / Admin (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.porcentaje_admin_default}
                    onChange={e => handleChange('porcentaje_admin_default', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Costos de oficina técnica, ingeniería y dirección de obra.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Imprevistos de Obra (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.porcentaje_imprevistos_default}
                    onChange={e => handleChange('porcentaje_imprevistos_default', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Fondo de contingencia para variaciones de campo.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Utilidad Empresarial Deseada (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.porcentaje_utilidad_default}
                    onChange={e => handleChange('porcentaje_utilidad_default', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Margen neto objetivo antes de retenciones fiscales.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Herramienta Menor (% M.O.)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.herramienta_menor_default}
                    onChange={e => handleChange('herramienta_menor_default', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-brand-sage font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Desgaste de palas, carretillas, flexómetros y equipo menor.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Políticas Fiscales y Tributarias SRI Ecuador 2026 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <Landmark size={18} className="text-amber-400" />
              3. Políticas Tributarias & Retenciones SRI (Ecuador 2026)
            </div>
            <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">SARA-DASHBOARD SRI</span>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-xs text-gray-500">
              Estas variables alimentan las alertas y reservas preventivas de flujo de caja en <strong>SARA-DASHBOARD SRI</strong> para que tu constructora nunca sufra multas o descalces financieros al momento de liquidar impuestos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Régimen Tributario de Tu Empresa</label>
                <select
                  value={params.regimen_tributario}
                  onChange={e => handleChange('regimen_tributario', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="general">Régimen General (Sociedades / Personas Naturales Obligadas)</option>
                  <option value="rimpe_emprendedor">RIMPE - Sector Emprendedores</option>
                  <option value="rimpe_popular">RIMPE - Negocio Popular</option>
                  <option value="contribuyente_especial">Contribuyente Especial Calificado SRI</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Define el formato de declaración semestral o mensual.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Tarifa IVA Vigente (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={params.tarifa_iva_vigente}
                    onChange={e => handleChange('tarifa_iva_vigente', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Tarifa nacional oficial para construcción (15% según Ley Orgánica 2024-2026).</p>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">¿Eres Agente de Retención SRI?</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.es_agente_retencion}
                    onChange={e => handleChange('es_agente_retencion', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-xs font-bold text-gray-700">
                    {params.es_agente_retencion ? "SÍ (Designado por Resolución SRI)" : "NO (Sujeto Pasivo Estándar)"}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Retención en la Fuente del Impuesto a la Renta (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={params.retencion_renta_pct}
                    onChange={e => handleChange('retencion_renta_pct', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Porcentaje habitual aplicado a contratos de obra civil y materiales (1.75% / 2.75%).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Retención del IVA a Proveedores (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={params.retencion_iva_pct}
                    onChange={e => handleChange('retencion_iva_pct', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <Percent size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Porcentaje de retención sobre el IVA liquidado (30% para bienes, 70% para servicios).</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-brand-sage hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Guardar Todos los Parámetros</span>
          </button>
        </div>

      </form>
    </div>
  )
}
