"use client"
import Link from "next/link"
import { Calendar, MessageCircle, ArrowRight, ShieldCheck, Sparkles, Building, Key } from "lucide-react"

export default function HomeAirbnbSection() {
  const whatsappAirbnb = "https://wa.me/593981804023?text=Hola%20SARA%20Constructora,%20deseo%20m%C3%A1s%20informaci%C3%B3n%20para%20publicar%20mi%20propiedad%20o%20reservar%20en%20Airbnb"

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-brand-dark via-[#0a1e16] to-slate-950 text-white relative overflow-hidden border-t border-brand-sage/20">
      {/* Resplandores ambientales de fondo */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-sage/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-px bg-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Hospitality · Suites · Renta Vacacional & Corporativa
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              SARA <span className="text-amber-400">AIRBNB</span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed">
              <strong>Tu propiedad, una gran oportunidad.</strong> Convierte tu casa, departamento o propiedad en una fuente de ingresos, con el respaldo de <strong>SARA Constructora</strong>. Administración integral, mayor rentabilidad y cobertura nacional y mundial.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/airbnb"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar size={16} /> Ver Alojamientos y Reservar
            </Link>
            <a
              href={whatsappAirbnb}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
            >
              <MessageCircle size={16} className="text-emerald-400" /> Publicar Mi Propiedad
            </a>
          </div>
        </div>

        {/* Imagen 2: Banner de Airbnb con efecto interactivo y enlace */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-900 group">
          <Link href="/airbnb" className="block relative cursor-pointer overflow-hidden">
            <img
              src="/sara-airbnb.png"
              alt="SARA Airbnb - Tu propiedad, una gran oportunidad"
              className="w-full h-auto object-cover group-hover:scale-[1.015] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6 md:p-8">
              <div className="hidden sm:block">
                <span className="text-amber-400 font-bold text-sm block">SARA Hospitality Global</span>
                <span className="text-white text-xs">Haz clic para buscar destinos y reservar en tiempo real</span>
              </div>
              <span className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl">
                Explorar Alojamientos <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
