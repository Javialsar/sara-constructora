"use client"
import { motion } from "framer-motion"

const proceso = [
  { id: "01", title: "CONVERSAMOS", desc: "Entendemos tu idea, necesidades y objetivos." },
  { id: "02", title: "ANALIZAMOS", desc: "Estudiamos las condiciones y requerimientos del proyecto." },
  { id: "03", title: "DISEÑAMOS", desc: "Convertimos las necesidades en una solución arquitectónica y técnica." },
  { id: "04", title: "PLANIFICAMOS", desc: "Definimos recursos, presupuesto, tiempos y procesos." },
  { id: "05", title: "CONSTRUIMOS", desc: "Ejecutamos con seguimiento profesional." },
  { id: "06", title: "ENTREGAMOS", desc: "Verificamos el cumplimiento de lo planificado." },
]

export default function ProcesoTimeline() {
  return (
    <section className="pt-16 pb-32 bg-brand-dark overflow-hidden relative">
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-sm font-bold tracking-[0.2em] text-brand-sage uppercase mb-3">Nuestro Proceso</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white">CÓMO LO HACEMOS</h3>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:block relative max-w-6xl mx-auto h-32 mt-12">
          
          {/* Base Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -translate-y-1/2 rounded-full" />
          
          {/* Animated Line */}
          <motion.div 
            className="absolute top-1/2 left-0 right-0 h-[2px] bg-brand-sage -translate-y-1/2 shadow-[0_0_15px_rgba(60,122,82,0.8)] origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <div className="grid grid-cols-6 gap-4 absolute inset-0">
            {proceso.map((step, i) => (
              <div key={step.id} className="relative flex justify-center items-center group h-full">
                
                {/* Node Point */}
                <motion.div 
                  className="w-4 h-4 bg-brand-dark border-2 border-brand-sage rounded-full z-20 relative cursor-pointer group-hover:bg-brand-sage transition-colors duration-300"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                >
                  <div className="absolute -inset-2 bg-brand-sage/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                </motion.div>

                {/* Number & Title (Static below line) */}
                <div className="absolute top-[60%] flex flex-col items-center w-max mt-4">
                  <span className="font-mono text-xl font-bold text-brand-sage mb-1">{step.id}</span>
                  <span className="text-xs font-bold text-white tracking-widest uppercase">{step.title}</span>
                </div>

                {/* Floating Card (Hover above line) */}
                <div className="absolute bottom-[60%] mb-4 w-48 bg-brand-sage p-4 rounded text-center opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30 shadow-xl">
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-sage rotate-45" />
                  <p className="text-brand-dark font-medium text-sm leading-tight relative z-10">
                    {step.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden max-w-sm mx-auto relative pl-8 mt-12 space-y-12">
          <div className="absolute top-0 bottom-0 left-3 w-[2px] bg-white/10" />
          
          <motion.div 
            className="absolute top-0 bottom-0 left-3 w-[2px] bg-brand-sage origin-top shadow-[0_0_15px_rgba(60,122,82,0.8)]"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {proceso.map((step, i) => (
            <motion.div 
              key={step.id} 
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute -left-[37px] top-1 w-4 h-4 bg-brand-dark border-2 border-brand-sage rounded-full z-10 group-hover:bg-brand-sage transition-colors" />
              <span className="block font-mono text-xl font-bold text-brand-sage mb-1">{step.id}</span>
              <h4 className="font-bold text-white mb-2 tracking-wide text-lg">{step.title}</h4>
              <p className="text-gray-400 leading-relaxed text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
