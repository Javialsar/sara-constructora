"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const DEFAULT_FAQS_INSTITUCIONALES = [
  {
    pregunta: "¿Qué servicios integrados comprende el holding GRUPO SARA?",
    respuesta: "GRUPO SARA INVERSIONES S.A.S. (RUC 1792984512001) integra planificación arquitectónica y construcción de obras bajo norma NEC-15, software de presupuestos APU y licitación SERCOP, catálogo inmobiliario IVS, suites de alojamiento corporativo y turístico SARA Stays, despacho de fletes pesados MTOP, matching de talento técnico SECAP y pasarela de pagos con custodia Escrow y facturación electrónica SRI automática."
  },
  {
    pregunta: "¿Cómo garantizan la seguridad de los pagos y la emisión de Factura Electrónica SRI?",
    respuesta: "Todas las transacciones operan bajo cifrado TLS 256-bit con desglose tributario transparente (IVA incluido 15% general o 5% materiales de construcción según Res. NAC-DGERCGC24-00000013). Al confirmar el pago, nuestro motor emite automáticamente la Factura Electrónica autorizada por el SRI con firma XAdES-BES v2.21 y descarga inmediata de RIDE PDF y XML."
  },
  {
    pregunta: "¿Puedo contratar un módulo individual o un proyecto llave en mano completo?",
    respuesta: "Cada uno de los módulos funciona de manera autónoma y a la vez sincronizada. Puedes suscribirte a SARA APU, alquilar una suite en SARA Stays, cotizar un flete pesado o contratar la ejecución integral de tu obra civil desde el holding matriz."
  },
  {
    pregunta: "¿En qué ciudades y provincias del Ecuador opera GRUPO SARA?",
    respuesta: "Contamos con sedes operativas en Quito, Cuenca, Guayaquil y Loja, y cobertura logística, técnica y digital en las 24 provincias del Ecuador."
  }
]

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)
  const [faqs, setFaqs] = useState<any[]>(DEFAULT_FAQS_INSTITUCIONALES)

  useEffect(() => {
    const fetchFaqs = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('preguntas_frecuentes')
        .select('pregunta, respuesta')
        .eq('estado', 'publicado')
        .order('orden', { ascending: true })
      
      if (data && data.length > 0) {
        setFaqs(data)
      }
    }
    fetchFaqs()
  }, [])

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 relative bg-slate-950 text-slate-100 border-t border-slate-900 overflow-hidden">
      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-brand-sage/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-brand-sage/30 text-brand-sage text-xs font-bold uppercase tracking-widest shadow-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Centro de Respuestas</span>
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight"
          >
            Preguntas Frecuentes
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Resolvemos las principales dudas sobre los servicios, contratación, facturación electrónica SRI, garantías y tecnología de GRUPO SARA.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all overflow-hidden shadow-xl"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none cursor-pointer group"
              >
                <span className="font-bold text-white text-base sm:text-lg pr-6 group-hover:text-brand-sage transition-colors">
                  {faq.pregunta}
                </span>
                <div className={`w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-brand-sage transition-all duration-300 ${
                  activeIndex === index ? "rotate-180 bg-brand-sage/20 border-brand-sage/40" : "rotate-0"
                }`}>
                  <ChevronDown size={18} />
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-800/80 pt-4">
                      {faq.respuesta}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 text-center space-y-3"
        >
          <p className="text-slate-400 text-sm">¿Tienes alguna consulta específica o requerimiento personalizado?</p>
          <a 
            href="https://wa.me/593981804023?text=Hola%20Grupo%20SARA,%20tengo%20una%20consulta%20sobre%20sus%20servicios" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-sage text-slate-950 font-black py-3 px-8 rounded-xl hover:bg-emerald-400 transition-all shadow-xl hover:scale-105"
          >
            <MessageSquare size={16} />
            <span>Hablar con un Asesor de GRUPO SARA</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
