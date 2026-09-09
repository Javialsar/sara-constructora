"use client"
import { motion } from "framer-motion"

export default function Trayectoria() {
  return (
    <section className="bg-brand-sage text-brand-dark py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x-0 md:divide-x border-brand-dark/20">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-4"
          >
            <div className="text-4xl md:text-5xl font-extrabold mb-2">15+</div>
            <div className="text-xs font-bold uppercase tracking-[0.2em]">Años de Experiencia</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="px-4 md:border-l border-brand-dark/20"
          >
            <div className="text-4xl md:text-5xl font-extrabold mb-2">45+</div>
            <div className="text-xs font-bold uppercase tracking-[0.2em]">Proyectos Entregados</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="px-4 md:border-l border-brand-dark/20"
          >
            <div className="text-4xl md:text-5xl font-extrabold mb-2">100%</div>
            <div className="text-xs font-bold uppercase tracking-[0.2em]">Garantía Estructural</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="px-4 md:border-l border-brand-dark/20"
          >
            <div className="text-4xl md:text-5xl font-extrabold mb-2">3</div>
            <div className="text-xs font-bold uppercase tracking-[0.2em]">Ciudades Cobertura</div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
