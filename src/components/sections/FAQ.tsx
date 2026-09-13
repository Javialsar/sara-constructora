"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    pregunta: "¿Qué servicios ofrece SARA CONSTRUCTORA?",
    respuesta: "Ofrecemos soluciones integrales en Arquitectura, Ingeniería Civil, Construcción y Consultoría Técnica, incluyendo diseño arquitectónico, construcción de viviendas y edificios, ingeniería y cálculo estructural, estudios de suelos, topografía y planimetría, presupuestos y APU, remodelaciones y ampliaciones, dirección y supervisión de obras, modelado 3D, renders y asesoría técnica."
  },
  {
    pregunta: "¿Pueden encargarse de todo el proyecto, desde el diseño hasta la construcción?",
    respuesta: "Sí. Podemos acompañar al cliente durante las diferentes etapas del proyecto: estudios preliminares, diseño arquitectónico, ingeniería, planificación, presupuesto, construcción y supervisión, permitiendo una gestión integral y coordinada."
  },
  {
    pregunta: "¿Realizan diseños y construcción de viviendas personalizadas?",
    respuesta: "Sí. Diseñamos viviendas de acuerdo con las necesidades, estilo de vida, características del terreno, presupuesto y expectativas del cliente, buscando equilibrio entre funcionalidad, estética, seguridad y aprovechamiento de los espacios."
  },
  {
    pregunta: "¿SARA CONSTRUCTORA también desarrolla edificios y proyectos de mayor escala?",
    respuesta: "Sí. Nuestra propuesta profesional comprende viviendas, edificios residenciales, comerciales, institucionales y otros proyectos de infraestructura, integrando arquitectura e ingeniería de acuerdo con las características y requerimientos de cada obra."
  },
  {
    pregunta: "¿Por qué son importantes el estudio de suelos y el cálculo estructural antes de construir?",
    respuesta: "Porque permiten conocer las condiciones del terreno y definir técnicamente la estructura y cimentación requeridas. Estos estudios son fundamentales para proyectar una construcción con adecuados criterios de seguridad, estabilidad y desempeño estructural."
  },
  {
    pregunta: "¿Realizan levantamientos topográficos y planimetría?",
    respuesta: "Sí. Realizamos levantamientos topográficos y trabajos de planimetría necesarios para conocer las características, dimensiones y condiciones del terreno, información indispensable para una correcta planificación y desarrollo del proyecto."
  },
  {
    pregunta: "¿Pueden elaborar el presupuesto de una obra antes de comenzar la construcción?",
    respuesta: "Sí. Elaboramos presupuestos, cantidades de obra y Análisis de Precios Unitarios (APU) para estimar técnicamente los costos del proyecto y facilitar una mejor planificación y control de los recursos."
  },
  {
    pregunta: "¿Puedo visualizar mi vivienda o edificio antes de construirlo?",
    respuesta: "Sí. Mediante modelado 3D y renders fotorrealistas podemos representar visualmente el proyecto antes de su ejecución, facilitando la comprensión de espacios, materiales, fachadas y acabados, así como la toma de decisiones durante el diseño."
  },
  {
    pregunta: "¿Realizan remodelaciones, ampliaciones y supervisión de obras existentes?",
    respuesta: "Sí. Desarrollamos proyectos de remodelación y ampliación, además de servicios de dirección y supervisión técnica para controlar procesos constructivos y verificar que la ejecución corresponda a las especificaciones y planificación establecidas."
  },
  {
    pregunta: "¿Cómo puedo solicitar una asesoría o cotización para mi proyecto?",
    respuesta: "Puede comunicarse con SARA CONSTRUCTORA y contarnos qué desea construir, remodelar o desarrollar. Nuestro equipo analizará inicialmente sus necesidades y podrá orientarlo sobre los estudios, diseño, ingeniería, presupuesto y servicios técnicos que requiera su proyecto."
  }
]

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-200">
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
