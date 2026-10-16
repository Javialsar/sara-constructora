"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Compass, 
  Ruler, 
  FileSpreadsheet, 
  ShieldCheck, 
  Calendar, 
  Cuboid,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight
} from "lucide-react"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function Chatbot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      role: 'assistant', 
      content: `¡Hola! Soy **SARA-Mentor**, tu Co-Piloto de Inducción Técnica y de Procesos de **Grupo SARA** 👷‍♂️📐.\n\nEstoy aquí para guiarte **paso a paso** en cualquier proceso con **ejemplos reales y cálculos numéricos** (fórmulas, rendimientos, dosificaciones, VAE, Lookahead semanal). \n\nSelecciona una de las guías rápidas o escríbeme tu consulta:` 
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quickGuides = [
    {
      id: "takeoff",
      label: "📐 Medir Planos (Take-Off 2D)",
      prompt: "¿Cómo medir planos 2D en PDF con Take-Off y auto-detectar recintos con IA?"
    },
    {
      id: "presupuestos",
      label: "⚡ Presupuesto con IA & AIU",
      prompt: "¿Cómo estructurar un presupuesto de obra con IA y calcular el Factor AIU?"
    },
    {
      id: "sercop",
      label: "🏛️ Licitaciones SERCOP & VAE",
      prompt: "¿Cómo postular a licitaciones en SERCOP y calcular la Matriz VAE oficial?"
    },
    {
      id: "lookahead",
      label: "📅 Lookahead & Cuadrillas",
      prompt: "¿Cómo planificar el cronograma Lookahead semanal para cuadrillas y bodega?"
    },
    {
      id: "bim",
      label: "🏢 Cómputos 3D (SARA-BIM)",
      prompt: "¿Cómo extraer volumetrías de hormigón y acero desde modelos IFC en SARA-BIM?"
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: queryText.trim() }
    const updatedHistory = [...messages, userMessage]
    setMessages(updatedHistory)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory })
      })
      const data = await res.json()
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.text || "No obtuve respuesta del servidor. Inténtalo de nuevo." 
      }])
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "⚠️ Hubo un inconveniente al conectar con SARA-Mentor. Por favor verifica tu conexión o intenta nuevamente." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendQuery(input)
  }

  // Detect internal routes and render quick action button
  const extractActionRoute = (content: string) => {
    if (content.includes('/dashboard/takeoff')) {
      return { path: '/dashboard/takeoff', label: '🚀 Ir a SARA Take-Off (Planos 2D)', icon: Ruler }
    }
    if (content.includes('/dashboard/presupuestos_reales')) {
      return { path: '/dashboard/presupuestos_reales', label: '🚀 Ir a Mesa de Presupuestos', icon: FileSpreadsheet }
    }
    if (content.includes('/dashboard/sercop/radar')) {
      return { path: '/dashboard/sercop/radar', label: '🚀 Ir a Radar SERCOP', icon: ShieldCheck }
    }
    if (content.includes('/dashboard/sercop/vae')) {
      return { path: '/dashboard/sercop/vae', label: '🚀 Ir a Matriz VAE', icon: ShieldCheck }
    }
    if (content.includes('/dashboard/apus/bim')) {
      return { path: '/dashboard/apus/bim', label: '🚀 Ir a SARA-BIM 3D', icon: Cuboid }
    }
    return null
  }

  return (
    <>
      {/* Botón Flotante con distintivo de Mentor */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-full shadow-xl border border-cyan-500/30 backdrop-blur-md transition-all hover:border-cyan-400"
              >
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <span>¿Dudas con un proceso? <b>Pregúntale a SARA-Mentor</b></span>
              </motion.button>

              <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white rounded-full shadow-2xl flex items-center justify-center relative hover:shadow-cyan-500/20"
                title="SARA-Mentor · Co-Piloto de Inducción Técnica"
              >
                <Bot size={28} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ventana de Chat SARA-Mentor */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden origin-bottom-right transition-all duration-200 ${
                isExpanded 
                  ? "w-[95vw] sm:w-[560px] md:w-[640px] h-[640px] max-h-[85vh]" 
                  : "w-[92vw] sm:w-[400px] h-[540px] max-h-[82vh]"
              }`}
            >
              {/* Header Técnico */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-4 py-3.5 flex items-center justify-between text-white border-b border-blue-900/40 shadow-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
                    <Bot size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm tracking-tight">SARA-Mentor</h3>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        IA TÉCNICA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Co-Piloto de Procesos & Metodología de Obra
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Reducir ventana" : "Ampliar para leer fórmulas"}
                    className="hidden sm:inline-flex text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Barra de Guías Rápidas */}
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium pl-1">
                  <Compass size={12} className="text-cyan-500" /> Guías:
                </span>
                {quickGuides.map(guide => (
                  <button
                    key={guide.id}
                    onClick={() => sendQuery(guide.prompt)}
                    disabled={isLoading}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-[11px] font-medium disabled:opacity-50"
                  >
                    {guide.label}
                  </button>
                ))}
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 font-sans">
                {messages.map((msg) => {
                  const actionRoute = msg.role === 'assistant' ? extractActionRoute(msg.content) : null
                  const Icon = actionRoute?.icon

                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-xl flex shrink-0 items-center justify-center shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gradient-to-tr from-cyan-600 to-blue-700 text-white'
                        }`}>
                          {msg.role === 'user' ? <User size={15} /> : <Bot size={17} />}
                        </div>

                        <div className="flex flex-col gap-2">
                          <div 
                            className={`p-3.5 rounded-2xl text-xs sm:text-[13px] shadow-sm whitespace-pre-wrap leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none font-normal'
                            }`}
                          >
                            {msg.content}
                          </div>

                          {/* Botón de Acción Directo si la respuesta sugiere un módulo */}
                          {actionRoute && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => {
                                setIsOpen(false)
                                router.push(actionRoute.path)
                              }}
                              className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs font-semibold shadow hover:from-blue-700 hover:to-cyan-700 transition-all hover:scale-102"
                            >
                              {Icon && <Icon size={14} />}
                              <span>{actionRoute.label}</span>
                              <ChevronRight size={13} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex shrink-0 items-center justify-center bg-cyan-600 text-white shadow-sm">
                        <Bot size={17} />
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                        <span className="text-[11px] text-slate-400 pl-2 font-mono">Calculando paso a paso...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input y Pie */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form 
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Escribe tu consulta o pide un paso a paso..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-800 dark:text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none transition-all border dark:border-slate-700 placeholder:text-slate-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md shadow-blue-600/20"
                    title="Enviar consulta"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SARA-Mentor v2.6 · Base de Conocimiento de Ingeniería
                  </span>
                  <span>Ecuador (NEC / LOSNCP)</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
