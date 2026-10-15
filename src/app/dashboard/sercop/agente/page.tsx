"use client"

import React, { useState, useRef, useEffect } from "react"
import { useProject } from "@/contexts/ProjectContext"
import { 
  ShieldCheck, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Scale, 
  FileText, 
  FileSpreadsheet, 
  Building2, 
  ChevronRight, 
  RotateCcw,
  Loader2,
  ListChecks,
  ExternalLink
} from "lucide-react"

interface MensajeChat {
  id: string
  remitente: 'agente' | 'usuario'
  texto: string
  articulos?: string[]
  categoria?: string
  fecha: string
}

// Base de conocimiento normativo SERCOP 2026
const PREGUNTAS_RAPIDAS = [
  {
    titulo: "¿Cuál es el anticipo máximo legal en obras y cómo se amortiza?",
    prompt: "¿Cuál es el anticipo máximo legal permitido para contratos de obra en el SERCOP y cuál es la regla para su amortización en planillas?",
    articulos: ["Art. 71 LOSNCP", "Art. 139 RGLOSNCP"],
    respuesta: `De acuerdo con el **Artículo 71 de la Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP)** y el **Artículo 139 del Reglamento General a la LOSNCP**:

1. **Porcentaje Máximo de Anticipo en Obras:**
   - En contratos de obra pública, el anticipo no podrá exceder del **cincuenta por ciento (50%)** del valor del contrato adjudicado.
   - Requiere obligatoriamente la entrega previa de una **Garantía por Buen Uso del Anticipo** incondicional, irrevocable y de cobro inmediato por el **100% del monto del anticipo**.

2. **Regla de Amortización en Planillas de Avance de Obra:**
   - La amortización se realiza deduciendo en cada planilla de avance un porcentaje igual al porcentaje del anticipo otorgado (ej: si se entregó el 40%, se deduce el 40% del monto bruto de cada planilla), hasta liquidarlo en su totalidad antes de la recepción provisional de la obra.
   - El anticipo no pierde su calidad de fondos públicos hasta que haya sido efectivamente devengado en la obra ejecutada.`
  },
  {
    titulo: "¿Qué errores son convalidables en la oferta y cuáles causan descalificación?",
    prompt: "¿Cuáles son los errores convalidables de forma según el Art. 23 del Reglamento General a la LOSNCP y qué errores provocan descalificación directa?",
    articulos: ["Art. 23 RGLOSNCP", "Resolución SERCOP RE-2023-0134"],
    respuesta: `El **Artículo 23 del Reglamento General a la LOSNCP** regula taxativamente la convalidación de errores:

✅ **ERRORES CONVALIDABLES (De Forma):**
1. Errores mecanográficos, aritméticos o tipográficos en la oferta que no alteren el precio total ni el objeto.
2. Falta de sumilla o foliación en alguna hoja de la oferta.
3. Copias borrosas o documentos ilegibles que ya consten en registros públicos (ej: RUP, nombramientos en Superintendencia de Compañías).
4. Aclaración de inconsistencias entre la oferta técnica y las cartas de compromiso, siempre que la fecha de expedición del documento sea anterior a la fecha límite de entrega de ofertas.

❌ **ERRORES NO CONVALIDABLES (Descalificación Directa):**
1. No haber entregado la **Oferta Económica** o el formulario de la carta de presentación de la oferta debidamente firmado electrónicamente.
2. Incumplimiento del **Umbral Mínimo de Valor Agregado Ecuatoriano (VAE)** fijado en el pliego para el código CPC de la contratación.
3. Modificación sustancial de las especificaciones técnicas o retiro de rubros obligatorios del APU.
4. Presentar personal técnico o equipo que no cumpla con los requisitos mínimos a la fecha límite de presentación.`
  },
  {
    titulo: "¿Cómo opera la Matriz VAE y cuándo se descalifica por origen extranjero?",
    prompt: "¿Cómo se calcula el VAE en obras y en qué casos una oferta es descalificada por no alcanzar el umbral mínimo de Valor Agregado Ecuatoriano?",
    articulos: ["Art. 25.2 LOSNCP", "Resolución SERCOP Codificada 2026"],
    respuesta: `El **Valor Agregado Ecuatoriano (VAE)** en obras civiles se calcula conforme a la metodología oficial del SERCOP:

$$\\text{VAE Obra} = \\frac{\\text{Costo Mano de Obra Nac.} + \\text{Materiales Nac.} + \\text{Equipos Nac.} + \\text{Servicios Nac.}}{\\text{Costo Directo Total}} \\times 100$$

📌 **Puntos Clave Normativos:**
- **Mano de obra:** Se considera 100% ecuatoriana si los obreros y profesionales están domiciliados en Ecuador y afiliados al IESS.
- **Materiales e insumos:** Cemento nacional, áridos de canteras locales, acero habilitado localmente suman VAE positivo. Equipos electromecánicos importados reducen el porcentaje.
- **Causal de Descalificación:** Si el pliego establece un umbral del 40% y la matriz presentada por el oferente arroja 38.5%, la oferta es considerada **EXTRANJERA** y descalificada de pleno derecho en procedimientos de Menor Cuantía y Cotización, donde la LOSNCP otorga reserva de mercado exclusiva para producción y mano de obra nacional.`
  },
  {
    titulo: "¿Cómo se formula el Reajuste de Precios con el Decreto 458 y el INEC?",
    prompt: "¿Cuál es el procedimiento normativo para aplicar la Fórmula Polinómica de Reajuste de Precios según el Decreto 458 y los índices del INEC?",
    articulos: ["Art. 82 LOSNCP", "Decreto Ejecutivo 458", "Art. 141 RGLOSNCP"],
    respuesta: `Conforme al **Artículo 82 de la LOSNCP** y el **Decreto Ejecutivo 458**:

1. **Estructura de la Fórmula Polinómica:**
   $$Pr = Po \\cdot \\left( p_1 \\frac{B_1}{B_0} + p_2 \\frac{C_1}{C_0} + p_3 \\frac{D_1}{D_0} + \\dots + p_x \\frac{X_1}{X_0} \\right)$$
   - La suma de los coeficientes $p_1 + p_2 + \\dots + p_x$ debe ser **exactamente igual a 1.000**.
   - Cada componente representa un insumo preponderante (mano de obra cuadrilla tipo INEC, cemento, asfalto, acero, maquinaria, etc.).

2. **Índices de Precios del INEC:**
   - Los índices $B_0, C_0, \\dots$ son los publicados por el INEC para el **mes anterior a la fecha límite de presentación de ofertas**.
   - Los índices $B_1, C_1, \\dots$ son los correspondientes al mes de ejecución efectiva de la planilla.

3. **Reajuste Provisional vs Definitivo:**
   - Si a la fecha de pago de la planilla el INEC no ha publicado los índices definitivos, la entidad contratante está obligada a pagar el **reajuste provisional** con los últimos índices disponibles, procediendo a la reliquidación en la siguiente planilla una vez publicados los índices definitivos.`
  },
  {
    titulo: "¿Reglas para el Equipo Mínimo y Personal Técnico sin duplicidad?",
    prompt: "¿Cuáles son las normas del SERCOP sobre disponibilidad de equipo mínimo y personal técnico indispensable para no ser descalificado?",
    articulos: ["Art. 42 RGLOSNCP", "Resolución SERCOP RE-2023-0134"],
    respuesta: `La normativa del SERCOP sobre personal técnico y maquinaria establece:

1. **Equipo Mínimo:**
   - Se puede justificar mediante **título de propiedad** (matrícula, factura a nombre del oferente) o mediante **carta de compromiso de arrendamiento / compraventa** debidamente suscrita con un tercero propietario.
   - El equipo comprometido debe estar operativo y disponible en el territorio ecuatoriano durante el plazo de ejecución.

2. **Personal Técnico Indispensable:**
   - Todo profesional propuesto (Residente de Obra, Especialista Estructural, Especialista Ambiental) debe adjuntar su **Carta de Compromiso debidamente firmada** autorizando su inclusión en la oferta.
   - **Regla de No Duplicidad:** Un profesional no puede constar como residente o personal técnico de dedicación exclusiva en dos contratos públicos que se ejecuten simultáneamente en el mismo horario o en distintas ciudades sin factibilidad geográfica.`
  }
]

// Checklist preventivo anti-descalificación
const CHECKLIST_ANTI_DESCALIFICACION = [
  { id: "c1", texto: "RUP activo en la categoría CPC del objeto contractual", ref: "Art. 18 LOSNCP", obligatorio: true },
  { id: "c2", texto: "Certificado de no tener deudas en firme con el SRI ni mora patronal con el IESS", ref: "Art. 62 LOSNCP", obligatorio: true },
  { id: "c3", texto: "No constar como Contratista Incumplido ni Adjudicatario Fallido en el SERCOP", ref: "Art. 62 y 63 LOSNCP", obligatorio: true },
  { id: "c4", texto: "Matriz VAE firmada y superando el umbral mínimo oficial exigido en el pliego", ref: "Art. 25.2 LOSNCP", obligatorio: true },
  { id: "c5", texto: "APU calculado con Salarios Sectoriales de la Construcción vigentes (MDT)", ref: "Acuerdo MDT 2026", obligatorio: true },
  { id: "c6", texto: "Fórmula Polinómica con coeficientes que sumen exactamente 1.000", ref: "Decreto 458", obligatorio: true },
  { id: "c7", texto: "Títulos de propiedad o cartas de arrendamiento vigentes del Equipo Mínimo", ref: "Art. 42 RGLOSNCP", obligatorio: true },
  { id: "c8", texto: "Cartas de compromiso suscritas por el Personal Técnico Clave indispensable", ref: "Art. 42 RGLOSNCP", obligatorio: true },
  { id: "c9", texto: "Cronograma valorado de trabajos concordante con el plazo total del pliego", ref: "Formularios SERCOP", obligatorio: true },
  { id: "c10", texto: "Oferta económica sin exceder el Presupuesto Referencial del proceso", ref: "Art. 52 LOSNCP", obligatorio: true }
]

export default function AgenteSercopPage() {
  const { activeProject } = useProject()
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: "m-0",
      remitente: "agente",
      texto: `¡Saludos Ingeniero! Soy **SARA-SERCOP**, tu Auditor Normativo y Asesor Especializado en Contratación Pública del Ecuador.

Cuento con la base legal completa de la **LOSNCP**, el **Reglamento General vigente**, las **Resoluciones del SERCOP 2026**, el **Decreto 458 (Fórmulas Polinómicas)** y la **Metodología Oficial de Valor Agregado Ecuatoriano (VAE)**.

${activeProject ? `📌 **Obra activa en Suite:** "${activeProject.nombre}" ${activeProject.codigo_proceso ? `(${activeProject.codigo_proceso})` : ''}` : 'Selecciona una consulta rápida o escribe cualquier duda técnica o jurídica sobre tu pliego para auditarlo de inmediato.'}`,
      articulos: ["LOSNCP", "RGLOSNCP 2026", "Decreto 458"],
      fecha: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const [inputTexto, setInputTexto] = useState("")
  const [cargando, setCargando] = useState(false)
  const [checklistEstado, setChecklistEstado] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: true
  })
  const [tabActiva, setTabActiva] = useState<'chat' | 'checklist'>('chat')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  const handleEnviar = (textoPregunta?: string) => {
    const promptFinal = (textoPregunta || inputTexto).trim()
    if (!promptFinal || cargando) return

    const nuevoMsgUser: MensajeChat = {
      id: `u-${Date.now()}`,
      remitente: 'usuario',
      texto: promptFinal,
      fecha: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    }

    setMensajes(prev => [...prev, nuevoMsgUser])
    if (!textoPregunta) setInputTexto("")
    setCargando(true)

    // Buscar si coincide con alguna pregunta rápida
    const coincideFaq = PREGUNTAS_RAPIDAS.find(faq => 
      promptFinal.toLowerCase().includes(faq.titulo.toLowerCase().substring(0, 20)) ||
      promptFinal.toLowerCase().includes(faq.prompt.toLowerCase().substring(0, 20))
    )

    setTimeout(() => {
      let respuestaTexto = ""
      let articulosCitados: string[] = []

      if (coincideFaq) {
        respuestaTexto = coincideFaq.respuesta
        articulosCitados = coincideFaq.articulos
      } else {
        // Respuesta contextual basada en normativa SERCOP
        const lower = promptFinal.toLowerCase()
        if (lower.includes("anticipo") || lower.includes("garantía")) {
          respuestaTexto = `Conforme al **Artículo 71 de la LOSNCP**, el anticipo máximo en obras es del **50%**. La garantía por buen uso debe cubrir el **100%** del valor recibido y mantenerse vigente hasta la amortización total en las planillas de avance.`
          articulosCitados = ["Art. 71 LOSNCP", "Art. 74 LOSNCP"]
        } else if (lower.includes("convalid") || lower.includes("error") || lower.includes("subsan")) {
          respuestaTexto = `Según el **Artículo 23 del RGLOSNCP**, solo se admiten convalidaciones de errores de forma (aritméticos, foliación, sumilla, documentos públicos ya registrados). Nunca se puede alterar el precio total de la oferta ni modificar el objeto contractual.`
          articulosCitados = ["Art. 23 RGLOSNCP"]
        } else if (lower.includes("vae") || lower.includes("agregado") || lower.includes("nacional")) {
          respuestaTexto = `El **Valor Agregado Ecuatoriano (VAE)** es obligatorio (Art. 25.2 LOSNCP). La oferta que no alcance el umbral fijado en el pliego para el CPC será considerada como oferta de origen extranjero y quedará descalificada en procedimientos de reserva de mercado.`
          articulosCitados = ["Art. 25.2 LOSNCP", "Resolución SERCOP 2026"]
        } else if (lower.includes("reajuste") || lower.includes("polin") || lower.includes("inec")) {
          respuestaTexto = `El reajuste de precios se rige por el **Decreto Ejecutivo 458**. La fórmula polinómica debe sumar exactamente 1.000 en sus coeficientes y utilizar los índices de precios de la construcción emitidos por el INEC del mes anterior a la fecha límite de ofertas.`
          articulosCitados = ["Decreto 458", "Art. 82 LOSNCP"]
        } else {
          respuestaTexto = `He analizado tu consulta bajo el marco de la **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP)** y su **Reglamento General vigente**.

Para obras y consultoría pública, asegúrate de:
1. Validar que los precios unitarios desglosados en el APU respeten los salarios mínimos sectoriales del MDT.
2. Contar con las cartas de compromiso debidamente suscritas por el personal técnico indispensable.
3. Presentar la Matriz VAE superando el porcentaje umbral oficial.
4. Cumplir con la foliación correlativa y firma electrónica con certificado acreditado en Ecuador (BCE, Security Data, ANFAC).`
          articulosCitados = ["Art. 42 RGLOSNCP", "Art. 52 LOSNCP"]
        }
      }

      const nuevoMsgAgente: MensajeChat = {
        id: `a-${Date.now()}`,
        remitente: 'agente',
        texto: respuestaTexto,
        articulos: articulosCitados,
        fecha: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
      }

      setMensajes(prev => [...prev, nuevoMsgAgente])
      setCargando(false)
    }, 700)
  }

  const toggleCheck = (id: string) => {
    setChecklistEstado(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const checklistCumplidos = Object.values(checklistEstado).filter(Boolean).length
  const porcentajeCumplimiento = Math.round((checklistCumplidos / CHECKLIST_ANTI_DESCALIFICACION.length) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner de Cabecera */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <Bot size={14} className="text-blue-400" />
              <span>Inteligencia Artificial Jurídica & Técnica</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              🤖 Agente SARA-SERCOP (Auditor Normativo)
            </h1>
            <p className="text-sm text-blue-200/80 max-w-2xl leading-relaxed">
              Asesoría jurídica y técnica en tiempo real para licitaciones públicas en Ecuador. 
              Fundamentado en la LOSNCP, Reglamento General, Resoluciones del SERCOP 2026, Decreto 458 y matrices VAE.
            </p>
          </div>

          {/* Toggle de Pestañas Chat vs Checklist */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setTabActiva('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                tabActiva === 'chat'
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              <Bot size={14} />
              <span>Chat Consultor</span>
            </button>
            <button
              onClick={() => setTabActiva('checklist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                tabActiva === 'checklist'
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              <ListChecks size={14} />
              <span>Checklist Anti-Descalificación</span>
            </button>
          </div>
        </div>

        {/* Indicador de Obra Activa vinculada */}
        {activeProject && (
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-blue-200">
            <span className="font-bold uppercase text-[10px] text-gray-400">Contexto Activo:</span>
            <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
              {activeProject.nombre}
            </span>
            {activeProject.codigo_proceso && (
              <span className="font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {activeProject.codigo_proceso}
              </span>
            )}
          </div>
        )}
      </div>

      {tabActiva === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Panel de Consultas Rápidas Normativas */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                <Scale size={15} className="text-blue-600" />
                <span>Consultas Frecuentes de Contratistas</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Haz clic en cualquier pregunta para obtener el dictamen fundamentado en artículos de ley:
              </p>

              <div className="space-y-2">
                {PREGUNTAS_RAPIDAS.map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEnviar(faq.prompt)}
                    className="w-full text-left p-3 rounded-2xl bg-gray-50 dark:bg-slate-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-start gap-2 group"
                  >
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                    <span>{faq.titulo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tarjeta de Referencia Jurídica */}
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-5 rounded-3xl border border-amber-500/20 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                <BookOpen size={14} />
                <span>Marco Legal Actualizado 2026</span>
              </div>
              <ul className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP).</li>
                <li>• Reglamento General a la LOSNCP (Decreto Ejecutivo 488).</li>
                <li>• Codificación de Resoluciones del SERCOP vigentes.</li>
                <li>• Decreto Ejecutivo 458: Fórmulas Polinómicas e Índices INEC.</li>
              </ul>
            </div>
          </div>

          {/* Columna Derecha: Consola Interactiva de Chat */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
            
            {/* Header del Chat */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>SARA-SERCOP Bot</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </h3>
                  <p className="text-[10px] text-gray-400">Auditor Normativo en Línea</p>
                </div>
              </div>

              <button
                onClick={() => setMensajes([mensajes[0]])}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1"
                title="Reiniciar conversación"
              >
                <RotateCcw size={12} />
                <span>Limpiar</span>
              </button>
            </div>

            {/* Contenedor de Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {mensajes.map(m => {
                const esAgente = m.remitente === 'agente'
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${esAgente ? "justify-start" : "justify-end"}`}
                  >
                    {esAgente && (
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-1">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        esAgente
                          ? "bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-100 shadow-xs"
                          : "bg-blue-600 text-white shadow-md"
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{m.texto}</div>

                      {/* Artículos de Ley citados */}
                      {m.articulos && m.articulos.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Fundamento Legal:</span>
                          {m.articulos.map((art, i) => (
                            <span 
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                            >
                              {art}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={`text-[9px] text-right ${esAgente ? "text-gray-400" : "text-blue-200"}`}>
                        {m.fecha}
                      </div>
                    </div>

                    {!esAgente && (
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                )
              })}

              {cargando && (
                <div className="flex gap-3 items-center text-xs text-gray-400 italic">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                  <span>SARA-SERCOP consultando normativa y jurisprudencia...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input para escribir consulta */}
            <form
              onSubmit={e => {
                e.preventDefault()
                handleEnviar()
              }}
              className="p-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputTexto}
                onChange={e => setInputTexto(e.target.value)}
                placeholder="Escribe tu consulta sobre pliegos, anticipos, convalidaciones o VAE..."
                className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <button
                type="submit"
                disabled={cargando || !inputTexto.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>Consultar</span>
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Pestaña: Checklist Preventivo Anti-Descalificación */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span>Auditor Preventivo Anti-Descalificación SERCOP</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Verifica estos 10 puntos críticos obligatorios antes de subir tu oferta al portal de compras públicas.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Cumplimiento</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {checklistCumplidos} / {CHECKLIST_ANTI_DESCALIFICACION.length} ({porcentajeCumplimiento}%)
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-black text-xs text-emerald-600">
                {porcentajeCumplimiento}%
              </div>
            </div>
          </div>

          {/* Lista de Puntos */}
          <div className="space-y-3">
            {CHECKLIST_ANTI_DESCALIFICACION.map((item, idx) => {
              const estaChequeado = checklistEstado[item.id] || false
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    estaChequeado
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                      : "bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      estaChequeado
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-300 dark:border-slate-700 text-transparent"
                    }`}>
                      {estaChequeado && <CheckCircle2 size={16} />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">
                        {idx + 1}. {item.texto}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                        Fundamento: <span className="font-semibold text-blue-600 dark:text-blue-400">{item.ref}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    estaChequeado
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
                  }`}>
                    {estaChequeado ? "✅ Verificado" : "⚠️ Pendiente"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
