"use client"
import { motion } from "framer-motion"
import { Award, Building2, ShieldCheck, MapPin } from "lucide-react"

const metricas = [
  {
    valor: "15+",
    etiqueta: "Años de Trayectoria",
    detalle: "Ingeniería y dirección de obra",
    icono: Award
  },
  {
    valor: "45+",
    etiqueta: "Obras Edificadas",
    detalle: "Residencial, comercial e industrial",
    icono: Building2
  },
  {
    valor: "100%",
    etiqueta: "Norma Sísmica NEC",
    detalle: "Garantía estructural certificada",
    icono: ShieldCheck
  },
  {
    valor: "Nacional",
    etiqueta: "Cobertura en Ecuador",
    detalle: "Loja, Azuay, Pichincha, El Oro",
    icono: MapPin
  }
]

export default function Trayectoria() {
  return (
    <section className="bg-brand-dark text-white py-16 md:py-20 relative overflow-hidden border-t border-b border-white/10">
      
      {/* Fondo sutil con rejilla y radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(197,160,89,0.08),rgba(0,0,0,0))] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricas.map((item, idx) => {
            const Icon = item.icono
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-sage/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-sage/15 border border-brand-sage/30 flex items-center justify-center text-brand-sage mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight mb-2 group-hover:text-brand-sage transition-colors">
                  {item.valor}
                </div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-sage mb-1">
                  {item.etiqueta}
                </div>
                <div className="text-xs text-slate-400">
                  {item.detalle}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
