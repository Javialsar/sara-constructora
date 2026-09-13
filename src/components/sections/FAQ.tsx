"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<any[]>([])

  useEffect(() => {
    const fetchFaqs = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('preguntas_frecuentes')
        .select('pregunta, respuesta')
        .eq('estado', 'publicado')
        .order('orden', { ascending: true })
      
      if (data) {
        setFaqs(data)
      }
    }
    fetchFaqs()
  }, [])

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-brand-dark mb-6"
          >
            Preguntas Frecuentes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Resolvemos tus principales dudas sobre nuestros servicios de arquitectura, ingeniería y construcción.
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-bold text-brand-dark pr-8">{faq.pregunta}</span>
                <ChevronDown 
                  className={`shrink-0 text-brand-sage transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : "rotate-0"
                  }`} 
                  size={20} 
                />
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
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
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm mb-4">¿Tienes alguna otra duda?</p>
          <a 
            href="/contacto" 
            className="inline-block bg-brand-dark text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-sage hover:text-brand-dark transition-colors"
          >
            Contáctanos
          </a>
        </motion.div>
      </div>
    </section>
  )
}
