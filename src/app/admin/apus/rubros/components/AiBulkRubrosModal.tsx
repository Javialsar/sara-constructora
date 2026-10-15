"use client"
import { useState } from "react"
import { Sparkles, X, Loader2, CheckCircle2, AlertTriangle, Layers, MapPin, BookOpen, Hash, ArrowRight } from "lucide-react"

interface AiBulkRubrosModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  esPrivado?: boolean
  proyectoId?: string
  proyectoNombre?: string
}

const CATEGORIAS_CONSTRUCTIVAS = [
  { id: "Estructuras de Hormigón Armado NEC", label: "Hormigones Estructurales y Acero (NEC)", icon: "🏗️", desc: "Zapatas, vigas, columnas, losas y muros de contención" },
  { id: "Movimiento de Tierras y Cimentaciones", label: "Movimiento de Tierras & Cimientos", icon: "🚜", desc: "Excavación a máquina, desalojo, rellenos compactados" },
  { id: "Mampostería, Enlucidos y Acabados", label: "Mampostería, Enlucidos y Pinturas", icon: "🧱", desc: "Paredes de bloque/ladrillo, revoques lisos y acabados vinílicos" },
  { id: "Instalaciones Hidrosanitarias y Alcantarillado", label: "Instalaciones Hidrosanitarias (Plastigama)", icon: "💧", desc: "Puntos de agua fría, caliente, desagües y cajas de revisión" },
  { id: "Vialidad, Pavimentos y Bordillos", label: "Vialidad, Bordillos y Adoquinados", icon: "🛣️", desc: "Bordillos fundidos, aceras peatonales, adoquín holandés" }
]

const PROVINCIAS_ECUADOR = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", 
  "El Oro", "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", 
  "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza", 
  "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos", 
  "Tungurahua", "Zamora Chinchipe"
]

export default function AiBulkRubrosModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  esPrivado = false,
  proyectoId,
  proyectoNombre
}: AiBulkRubrosModalProps) {
  const [categoria, setCategoria] = useState(CATEGORIAS_CONSTRUCTIVAS[0].id)
  const [cantidad, setCantidad] = useState(10)
  const [provincia, setProvincia] = useState("Pichincha")
  const [normativa, setNormativa] = useState("NEC-SE-DS / MTOP / SERCOP 2026")
  
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState("")

  if (!isOpen) return null

  const handleGenerarLote = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    setResultado(null)

    try {
      const res = await fetch("/api/admin/apus/generador-masivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria,
          cantidad: Number(cantidad),
          provincia_referencia: provincia,
          normativa_base: normativa,
          es_privado: esPrivado,
          proyecto_id: proyectoId || null
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || "Error al generar rubros con IA")
      }

      setResultado(data.data)
      onSuccess()
    } catch (err: any) {
      setErrorMsg(err.message || "Error inesperado durante la generación masiva.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-dark via-slate-900 to-brand-sage text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="text-brand-sage animate-pulse" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {esPrivado ? "Generador Masivo de Rubros Privados con IA" : "Generador Masivo de Rubros & APU con IA"}
              </h2>
              <p className="text-xs text-white/70">
                {esPrivado 
                  ? `🔒 Exclusivo para tu cuenta ${proyectoNombre ? `· Proyecto: ${proyectoNombre}` : ''} (No altera el Catálogo Oficial de Grupo SARA)`
                  : "Expansión del Catálogo Maestro Oficial de Grupo SARA (Ecuador 2026)"}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/80">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {resultado ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">¡Generación Masiva Completada con Éxito!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {esPrivado
                      ? `Se crearon ${resultado.total_rubros_generados} rubros privados para tu uso exclusivo. El Catálogo Maestro de Grupo SARA permanece inalterable.`
                      : `Se crearon ${resultado.total_rubros_generados} rubros maestros con sus desgloses técnicos de materiales, mano de obra sectorial (MDT) y equipos mecánicos.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 border rounded-lg text-center">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Rubros Creados</span>
                  <div className="text-2xl font-black text-brand-dark">{resultado.total_rubros_generados}</div>
                </div>
                <div className="p-3 bg-gray-50 border rounded-lg text-center">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Insumos Nuevos</span>
                  <div className="text-2xl font-black text-blue-600">{resultado.nuevos_insumos_maestros}</div>
                </div>
                <div className="p-3 bg-gray-50 border rounded-lg text-center">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Precios en {provincia}</span>
                  <div className="text-2xl font-black text-amber-600">{resultado.precios_zonificados_provincia}</div>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 uppercase">
                  Muestra de Rubros Generados e Incorporados al Catálogo
                </div>
                <div className="max-h-52 overflow-y-auto divide-y text-xs">
                  {resultado.rubros?.map((r: any) => (
                    <div key={r.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <span className="font-mono font-bold text-blue-600 mr-2">{r.codigo}</span>
                        <span className="font-medium text-gray-800">{r.nombre}</span>
                        <span className="ml-2 text-gray-400">({r.unidad})</span>
                      </div>
                      <div className="font-bold text-emerald-700">
                        ${Number(r.costo_directo).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResultado(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Generar Otro Lote
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-brand-sage text-white rounded-lg text-xs font-bold hover:bg-brand-dark"
                >
                  Ver Catálogo Actualizado
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerarLote} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertTriangle size={16} className="shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Selector de Categoría Especializada */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-brand-sage" />
                  1. Especialidad de Ingeniería / Categoría Constructiva
                </label>
                <div className="space-y-2">
                  {CATEGORIAS_CONSTRUCTIVAS.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setCategoria(cat.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        categoria === cat.id
                          ? "border-brand-sage bg-brand-sage/5 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl">{cat.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-xs text-gray-800">{cat.label}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{cat.desc}</div>
                      </div>
                      {categoria === cat.id && (
                        <div className="w-5 h-5 rounded-full bg-brand-sage text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 size={13} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cantidad y Zonificación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={14} className="text-brand-sage" />
                    2. Cantidad de Rubros por Lote
                  </label>
                  <select
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-brand-sage"
                  >
                    <option value={5}>5 rubros técnicos</option>
                    <option value={10}>10 rubros técnicos (Recomendado)</option>
                    <option value={20}>20 rubros técnicos</option>
                    <option value={30}>30 rubros técnicos</option>
                    <option value={50}>50 rubros técnicos (Lote Grande)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-sage" />
                    3. Zonificación Provincial (Marketplace)
                  </label>
                  <select
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-brand-sage"
                  >
                    {PROVINCIAS_ECUADOR.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Normativa Técnica */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-brand-sage" />
                  4. Normativa y Literatura de Referencia
                </label>
                <input
                  type="text"
                  value={normativa}
                  onChange={(e) => setNormativa(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-gray-50 outline-none focus:ring-2 focus:ring-brand-sage"
                />
              </div>

              {/* Botón de Acción */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-sage to-emerald-700 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Investigando literatura & procesando APUs...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generar Lote Masivo con IA</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
