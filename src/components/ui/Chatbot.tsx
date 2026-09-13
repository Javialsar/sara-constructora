"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, User } from "lucide-react"

const faqs = [
  { keywords: ["servicios", "que hacen", "ofrecen", "arquitectura"], text: "Ofrecemos soluciones integrales en Arquitectura, Ingeniería Civil, Construcción y Consultoría Técnica, incluyendo diseño, construcción, ingeniería, topografía, presupuestos y remodelaciones." },
  { keywords: ["todo el proyecto", "diseño hasta la construccion", "llave en mano", "completo"], text: "Sí. Podemos acompañarte durante todas las etapas: estudios preliminares, diseño, ingeniería, planificación, presupuesto, construcción y supervisión." },
  { keywords: ["personalizadas", "viviendas", "casa", "mi casa"], text: "Sí. Diseñamos viviendas personalizadas de acuerdo a tus necesidades, estilo de vida, terreno y presupuesto, equilibrando estética y funcionalidad." },
  { keywords: ["edificios", "mayor escala", "comerciales"], text: "Sí. Nuestra propuesta abarca viviendas, edificios residenciales, comerciales e institucionales, integrando arquitectura e ingeniería." },
  { keywords: ["suelos", "estudio de suelos", "calculo estructural", "estructura"], text: "Son vitales para conocer las condiciones del terreno y definir la cimentación. Garantizan la seguridad, estabilidad y desempeño de tu proyecto." },
  { keywords: ["topografia", "levantamiento", "planimetria", "terreno"], text: "Sí. Realizamos levantamientos topográficos y planimetría para conocer las dimensiones del terreno, indispensable para planificar correctamente." },
  { keywords: ["presupuesto", "cotizacion", "apu", "costo", "precios"], text: "Sí. Elaboramos presupuestos detallados, cantidades de obra y Análisis de Precios Unitarios (APU) para estimar los costos con precisión antes de iniciar." },
  { keywords: ["visualizar", "3d", "renders", "maqueta", "imagen"], text: "¡Claro! Mediante modelado 3D y renders fotorrealistas podrás ver tu proyecto (espacios, materiales y fachadas) antes de construirlo." },
  { keywords: ["remodelaciones", "ampliaciones", "supervision", "existentes"], text: "Sí. Desarrollamos proyectos de remodelación, ampliación y ofrecemos dirección/supervisión técnica para controlar procesos constructivos." },
  { keywords: ["contacto", "hablar", "asesoria", "asesor", "whatsapp"], text: "Puedes solicitar una asesoría contactándonos directamente. Nuestro equipo analizará tus necesidades. ¿Te gustaría ir a nuestra página de contacto?", isLink: true }
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'bot'|'user', text: string}[]>([
    { role: 'bot', text: '¡Hola! Soy SARA, el asistente virtual de la constructora. ¿En qué te puedo ayudar hoy?' }
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setInput("")

    // Simular escritura de la IA
    setTimeout(() => {
      const lowerInput = userMessage.toLowerCase()
      
      // Buscar coincidencia en FAQs
      const match = faqs.find(faq => faq.keywords.some(kw => lowerInput.includes(kw)))
      
      if (match) {
        setMessages(prev => [...prev, { role: 'bot', text: match.text }])
        if (match.isLink) {
          setTimeout(() => {
            setMessages(prev => [...prev, { role: 'bot', text: 'Haz clic aquí para ir a contacto: [Ir a Contacto](/contacto)' }])
          }, 800)
        }
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: 'Es una gran pregunta. Para darte la información más exacta sobre tu proyecto, un ingeniero o arquitecto humano te puede ayudar mejor. ¿Deseas visitar nuestra página de contacto o llamarnos?' }])
      }
    }, 1000)
  }

  const renderText = (text: string) => {
    if (text.includes('[Ir a Contacto]')) {
      return (
        <span>
          Haz clic aquí para ir a contacto:{' '}
          <a href="/contacto" className="underline font-bold text-white hover:text-gray-200">
            Ir a Contacto
          </a>
        </span>
      )
    }
    return text
  }

  return (
    <>
      {/* Botón Flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-brand-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 transition-transform hover:scale-110 relative"
            >
              <MessageSquare size={24} />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Ventana de Chat */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 right-0 w-[350px] sm:w-[380px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden origin-bottom-right"
            >
              {/* Header */}
              <div className="bg-brand-dark px-4 py-4 flex items-center justify-between text-white shadow-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Bot size={22} className="text-brand-sage" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">SARA IA</h3>
                    <p className="text-[10px] text-gray-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full block"></span>
                      En línea
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-brand-sage text-brand-dark'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                      </div>
                      <div 
                        className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-gray-100 text-gray-800 rounded-tr-none' 
                          : 'bg-brand-dark text-white rounded-tl-none leading-relaxed'
                        }`}
                      >
                        {renderText(msg.text)}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Escribe tu consulta aquí..."
                    className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 rounded-full px-4 py-2.5 text-sm outline-none transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-full bg-brand-sage text-brand-dark flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a3b899] transition-colors"
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </form>
                <div className="text-center mt-2">
                  <span className="text-[9px] text-gray-400">Powered by SARA Inteligencia Artificial</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
