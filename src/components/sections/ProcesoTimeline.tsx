"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const proceso = [
  { id: "01", title: "CONVERSAMOS", desc: "Entendemos tu idea, necesidades y objetivos." },
  { id: "02", title: "ANALIZAMOS", desc: "Estudiamos las condiciones y requerimientos del proyecto." },
  { id: "03", title: "DISEÑAMOS", desc: "Convertimos las necesidades en una solución arquitectónica y técnica." },
  { id: "04", title: "PLANIFICAMOS", desc: "Definimos recursos, presupuesto, tiempos y procesos." },
  { id: "05", title: "CONSTRUIMOS", desc: "Ejecutamos con seguimiento profesional." },
  { id: "06", title: "ENTREGAMOS", desc: "Verificamos el cumplimiento de lo planificado." },
]

export default function ProcesoTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  // Map scroll progress to the height of the glowing line
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section className="pt-16 pb-24 bg-brand-dark overflow-hidden relative" ref={containerRef}>
      
      {/* Decorative Grid on dark background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-3">Nuestro Proceso</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white">CÓMO LO HACEMOS</h3>
        </div>

        <div className="relative max-w-5xl mx-auto">
          
          {/* Central Line Background */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/10 md:-translate-x-1/2 rounded-full" />
          
          {/* Animated Glowing Line */}
          <motion.div 
            className="absolute left-4 md:left-1/2 top-0 w-[2px] bg-brand-sage md:-translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(60,122,82,0.8)]"
            style={{ height: lineHeight }}
          />

          <div className="space-y-12 md:space-y-24">
            {proceso.map((step, index) => {
              const isEven = index % 2 === 0
              
              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-center w-full group">
                  
                  {/* Left Side (Empty for Odd, Content for Even on Desktop) */}
                  <div className={`hidden md:block w-1/2 pr-12 text-right ${!isEven && 'md:invisible'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <span className="block font-mono text-5xl font-extrabold text-white/5 mb-2">{step.id}</span>
                      <h4 className="font-extrabold text-white text-2xl mb-2 tracking-wide group-hover:text-brand-sage transition-colors">{step.title}</h4>
                      <p className="text-gray-400 leading-relaxed text-lg">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Node / Center */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 md:-translate-x-1/2 z-20">
                    <motion.div 
                      className="w-full h-full bg-brand-dark border-2 border-brand-sage rounded-full flex items-center justify-center relative"
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {/* Pulse effect */}
                      <div className="absolute w-full h-full bg-brand-sage rounded-full animate-ping opacity-40" />
                      <div className="w-1.5 h-1.5 bg-brand-sage rounded-full" />
                    </motion.div>
                  </div>

                  {/* Right Side (Content for Odd on Desktop, All on Mobile) */}
                  <div className={`w-full pl-12 md:w-1/2 md:pl-12 text-left ${isEven && 'md:hidden'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <span className="block font-mono text-5xl font-extrabold text-white/5 mb-2">{step.id}</span>
                      <h4 className="font-extrabold text-white text-2xl mb-2 tracking-wide group-hover:text-brand-sage transition-colors">{step.title}</h4>
                      <p className="text-gray-400 leading-relaxed text-lg">{step.desc}</p>
                    </motion.div>
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
