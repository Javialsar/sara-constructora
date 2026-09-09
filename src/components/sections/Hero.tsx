"use client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { MapPin, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-brand-dark">
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem'
        }}
      />
      
      {/* High-quality background image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute right-0 top-0 w-full lg:w-3/4 h-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')" }}
      />
      
      {/* Gradient overlay for blending */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent lg:to-brand-dark/20" />

      <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[80vh]">
        
        {/* Geometric Accents */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: "120px" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute left-6 md:left-12 top-0 w-px bg-brand-sage hidden md:block" 
        />

        <div className="max-w-5xl space-y-10 md:pl-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-px bg-brand-sage" />
            <h2 className="text-brand-sage font-bold tracking-[0.3em] uppercase text-xs md:text-sm">
              Ingeniería · Arquitectura · Construcción
            </h2>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-[6rem] font-extrabold text-white leading-[0.95] tracking-tighter"
            >
              DISEÑAMOS <span className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-brand-sage to-white">IDEAS.</span><br />
              CONSTRUIMOS <br className="md:hidden" />FUTURO.
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed font-light border-l-2 border-white/20 pl-6"
          >
            Transformamos visión en estructura. Integramos planificación, diseño y ejecución para proyectos de alta precisión arquitectónica y funcionalidad absoluta.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-8"
          >
            <Button variant="sage" size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-brand-sage text-brand-dark hover:text-white transition-colors" asChild>
              <Link href="/contacto">
                <span className="relative z-10 flex items-center gap-2">
                  Solicitar Cotización <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-brand-dark scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0" />
              </Link>
            </Button>
            
            <Link href="/proyectos" className="group flex items-center gap-3 text-white text-sm font-bold uppercase tracking-widest hover:text-brand-sage transition-colors">
              <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:border-brand-sage transition-colors">
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
              Conocer Proyectos
            </Link>
          </motion.div>

        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold rotate-90 mb-6">Scroll</span>
        <div className="w-px h-16 bg-white/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 64] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-brand-sage absolute top-0"
          />
        </div>
      </motion.div>

    </section>
  )
}
