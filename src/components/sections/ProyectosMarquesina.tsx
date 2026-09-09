"use client"
import { motion } from "framer-motion"
import Link from "next/link"

const proyectosDestacados = [
  { id: 1, name: "Torre Empresarial ZENT", location: "Loja", status: "Finalizado", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800" },
  { id: 2, name: "Residencial Los Álamos", location: "Cariamanga", status: "En Construcción", img: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=800" },
  { id: 3, name: "Complejo Deportivo", location: "Macará", status: "Diseño", img: "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=800" },
  { id: 4, name: "Edificio Vista Alta", location: "Loja", status: "Finalizado", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800" },
  { id: 5, name: "Casa Hacienda", location: "Catamayo", status: "En Construcción", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800" },
]

export default function ProyectosMarquesina() {
  // Duplicamos el array para crear el efecto infinito suave
  const proyectos = [...proyectosDestacados, ...proyectosDestacados]

  return (
    <section className="bg-white py-12 md:py-20 overflow-hidden border-t border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tighter uppercase mb-2">
            Portafolio Destacado
          </h2>
          <p className="text-brand-sage font-bold tracking-widest text-xs uppercase">
            Proyectos en desarrollo y ejecutados
          </p>
        </div>
        <Link href="/proyectos" className="text-brand-dark hover:text-brand-sage text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          Ver todos los proyectos →
        </Link>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Marquesina animada */}
        <motion.div 
          className="flex gap-6 px-3 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 40, // Ajusta la velocidad aquí
            repeat: Infinity,
          }}
        >
          {proyectos.map((proyecto, idx) => (
            <div 
              key={`${proyecto.id}-${idx}`} 
              className="relative w-[300px] md:w-[450px] aspect-[4/3] group overflow-hidden bg-brand-black flex-shrink-0 cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${proyecto.img})` }}
              />
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="bg-brand-sage text-brand-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                    {proyecto.status}
                  </span>
                </div>
                
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-bold text-xl md:text-2xl tracking-tight mb-1">
                    {proyecto.name}
                  </h3>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-brand-sage inline-block" />
                    {proyecto.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
