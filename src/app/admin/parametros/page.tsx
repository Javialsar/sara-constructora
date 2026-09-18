"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, Save, CheckCircle2, Calculator, Hash, FileText } from "lucide-react"

export default function ParametrosGlobalesPage() {
  const supabase = createClient()
  
  const [params, setParams] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    fetchParametros()
  }, [])

  const fetchParametros = async () => {
    setLoading(true)
    const { data } = await supabase.from('parametros_globales').select('*').eq('id', 1).single()
    if (data) {
      setParams(data)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMensaje("")
    
    const { error } = await supabase
      .from('parametros_globales')
      .update({
        decimales_config: params.decimales_config,
        cotizador_tarifas: params.cotizador_tarifas,
        cotizador_obra_base: params.cotizador_obra_base,
        cotizador_factores: params.cotizador_factores,
        cotizador_ensambles: params.cotizador_ensambles,
        indirectos_default: params.indirectos_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    setSaving(false)
    if (!error) {
      setMensaje("¡Parámetros actualizados con éxito!")
      setTimeout(() => setMensaje(""), 3000)
    } else {
      setMensaje("Error al guardar: " + error.message)
    }
  }

  const handleChange = (category: string, field: string, value: string | number) => {
    setParams((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
      }
    }))
  }

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-brand-sage border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (!params) {
    return <div className="p-8 text-red-500 font-bold">Error: No se pudo cargar la configuración global. Verifica la base de datos.</div>
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-dark flex items-center gap-3">
          <Settings className="text-brand-sage" size={32} />
          Parámetros Globales
        </h1>
        <p className="text-gray-500 mt-2">Single Source of Truth: Modifica aquí los valores base que afectan a todo el ecosistema SARA Constructora.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECCIÓN 1: Precisión y Sistema */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gray-800 text-white p-4 font-bold flex items-center gap-2">
            <Hash size={18} className="text-brand-sage" />
            Precisión Decimal y Sistema
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Cálculos Internos</label>
              <input type="number" step="1" value={params.decimales_config.calculos_internos} onChange={e => handleChange('decimales_config', 'calculos_internos', e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-sage bg-gray-50" />
              <p className="text-[10px] text-gray-400 mt-1">Decimales para las matemáticas invisibles.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Cantidades de Obra</label>
              <input type="number" step="1" value={params.decimales_config.cantidades} onChange={e => handleChange('decimales_config', 'cantidades', e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-sage bg-gray-50" />
              <p className="text-[10px] text-gray-400 mt-1">Decimales para volúmenes de obra y materiales.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Reportes PDF e Interfaz</label>
              <input type="number" step="1" value={params.decimales_config.reportes_pdf} onChange={e => handleChange('decimales_config', 'reportes_pdf', e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-sage bg-gray-50" />
              <p className="text-[10px] text-gray-400 mt-1">Decimales para mostrar dinero en pantalla y PDFs.</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Costos Indirectos por Defecto */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-brand-sage text-brand-dark p-4 font-bold flex items-center gap-2">
            <FileText size={18} />
            Costos Indirectos (Por Defecto)
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">Estos valores se utilizarán como base al crear nuevos presupuestos APU.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Administración (%)</label>
                <input type="number" step="0.1" value={params.indirectos_default.porcentaje_admin} onChange={e => handleChange('indirectos_default', 'porcentaje_admin', e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-sage font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Imprevistos (%)</label>
                <input type="number" step="0.1" value={params.indirectos_default.porcentaje_imprevistos} onChange={e => handleChange('indirectos_default', 'porcentaje_imprevistos', e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-sage font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Utilidad (%)</label>
                <input type="number" step="0.1" value={params.indirectos_default.porcentaje_utilidad} onChange={e => handleChange('indirectos_default', 'porcentaje_utilidad', e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-sage font-mono" />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Cotizador Automático */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gray-100 border-b p-4 font-bold flex items-center gap-2 text-brand-dark">
            <Calculator size={18} className="text-gray-600" />
            Parámetros del Cotizador Automático
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Obra Base e IVA */}
            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 text-brand-dark text-sm">Base e Impuestos</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Costo Construcción Base ($/m²)</label>
                <input type="number" step="1" value={params.cotizador_obra_base.costo_construccion_base} onChange={e => handleChange('cotizador_obra_base', 'costo_construccion_base', e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-brand-sage" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Porcentaje IVA (%)</label>
                <input type="number" step="0.1" value={params.cotizador_obra_base.porcentaje_iva} onChange={e => handleChange('cotizador_obra_base', 'porcentaje_iva', e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-brand-sage" />
              </div>
            </div>

            {/* Consultoría */}
            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 text-brand-dark text-sm">Consultoría y Diseño</h3>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Arq. Ejecutivo ($/m²)</label>
                <input type="number" step="0.1" value={params.cotizador_tarifas.arquitectura_ejecutivo} onChange={e => handleChange('cotizador_tarifas', 'arquitectura_ejecutivo', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">D. Estructural ($/m²)</label>
                <input type="number" step="0.1" value={params.cotizador_tarifas.diseno_estructural} onChange={e => handleChange('cotizador_tarifas', 'diseno_estructural', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">D. Eléctrico ($/m²)</label>
                <input type="number" step="0.1" value={params.cotizador_tarifas.diseno_electrico} onChange={e => handleChange('cotizador_tarifas', 'diseno_electrico', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">D. Hídrico ($/m²)</label>
                <input type="number" step="0.1" value={params.cotizador_tarifas.diseno_hidrico} onChange={e => handleChange('cotizador_tarifas', 'diseno_hidrico', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Geotecnia (Fijo $)</label>
                <input type="number" step="1" value={params.cotizador_tarifas.estudio_geotecnia} onChange={e => handleChange('cotizador_tarifas', 'estudio_geotecnia', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Topografía (Fijo $)</label>
                <input type="number" step="1" value={params.cotizador_tarifas.topografia} onChange={e => handleChange('cotizador_tarifas', 'topografia', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
              </div>
            </div>

            {/* Multiplicadores */}
            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 text-brand-dark text-sm">Multiplicadores (x)</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Acab. Econ.</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.acabado_economico} onChange={e => handleChange('cotizador_factores', 'acabado_economico', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Acab. Estándar</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.acabado_estandar} onChange={e => handleChange('cotizador_factores', 'acabado_estandar', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Acab. Premium</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.acabado_premium} onChange={e => handleChange('cotizador_factores', 'acabado_premium', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div></div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Suelo Normal</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.suelo_normal} onChange={e => handleChange('cotizador_factores', 'suelo_normal', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Suelo Blando</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.suelo_blando} onChange={e => handleChange('cotizador_factores', 'suelo_blando', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Estr. Hormigón</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.estructura_hormigon} onChange={e => handleChange('cotizador_factores', 'estructura_hormigon', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Estr. Metálica</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.estructura_metalica} onChange={e => handleChange('cotizador_factores', 'estructura_metalica', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pend. Plana</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.pendiente_plana} onChange={e => handleChange('cotizador_factores', 'pendiente_plana', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pend. Media</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.pendiente_media} onChange={e => handleChange('cotizador_factores', 'pendiente_media', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pend. Fuerte</label>
                  <input type="number" step="0.01" value={params.cotizador_factores.pendiente_fuerte} onChange={e => handleChange('cotizador_factores', 'pendiente_fuerte', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
              </div>
            </div>

            {/* Ensambles */}
            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2 text-brand-dark text-sm">Ensambles Fijos ($)</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Dorm. Master</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.dormitorio_master} onChange={e => handleChange('cotizador_ensambles', 'dormitorio_master', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Baño Compl.</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.bano_completo} onChange={e => handleChange('cotizador_ensambles', 'bano_completo', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Medio Baño</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.medio_bano} onChange={e => handleChange('cotizador_ensambles', 'medio_bano', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Lavandería</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.lavanderia} onChange={e => handleChange('cotizador_ensambles', 'lavanderia', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Cisterna</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.cisterna_subt} onChange={e => handleChange('cotizador_ensambles', 'cisterna_subt', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Piscina</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.piscina_base} onChange={e => handleChange('cotizador_ensambles', 'piscina_base', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Garaje Desc.</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.garaje_descubierto} onChange={e => handleChange('cotizador_ensambles', 'garaje_descubierto', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Clima (Splits)</label>
                  <input type="number" step="1" value={params.cotizador_ensambles.clima_splits} onChange={e => handleChange('cotizador_ensambles', 'clima_splits', e.target.value)} className="w-full border rounded px-2 py-1 text-sm outline-none" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CONTROLES */}
        <div className="flex items-center justify-end gap-4 pb-12">
          {mensaje && (
            <div className="flex items-center gap-2 text-brand-sage font-bold bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle2 size={20} />
              {mensaje}
            </div>
          )}
          <button type="submit" disabled={saving} className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-sage hover:text-brand-dark transition-all flex items-center gap-2 shadow-lg shadow-gray-200">
            <Save size={20} />
            {saving ? "Guardando..." : "Guardar Todos Los Parámetros"}
          </button>
        </div>

      </form>
    </div>
  )
}
