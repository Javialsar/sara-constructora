"use client"
import Link from "next/link"
import { Building2, MessageCircle, ArrowRight, ShieldCheck, Home as HomeIcon, TrendingUp } from "lucide-react"

export default function HomeInmobiliariaSection() {
  const whatsappInmobiliaria = "https://wa.me/593981804023?text=Hola%20SARA%20Inmobiliaria,%20deseo%20asesor%C3%ADa%20para%20comprar,%20vender%20o%20consignar%20una%20propiedad"

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 via-[#071810] to-brand-dark text-white relative overflow-hidden border-t border-brand-sage/20">
      {/* Resplandores ambientales de fondo */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand-sage/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-px bg-brand-sage" />
              <span className="text-xs font-black uppercase tracking-widest text-brand-sage">
                Bienes Raíces · Compra · Venta · Arriendo · Terrenos
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              SARA <span className="text-brand-sage">INMOBILIARIA</span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed">
              <strong>Tu próximo espacio está aquí.</strong> Compra, venta y arriendo de casas, departamentos y terrenos con confianza, procesos confiables, seguridad jurídica y acompañamiento profesional de <strong>SARA Constructora</strong>.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/inmobiliaria"
              className="px-6 py-3.5 rounded-2xl bg-brand-sage hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Building2 size={16} /> Ver Catálogo Inmobiliario
            </Link>
            <a
              href={whatsappInmobiliaria}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
            >
              <MessageCircle size={16} className="text-emerald-400" /> Consignar Mi Propiedad
            </a>
          </div>
        </div>

        {/* Imagen 3: Banner de Inmobiliaria con efecto interactivo y enlace */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-brand-sage/30 bg-slate-900 group">
          <Link href="/inmobiliaria" className="block relative cursor-pointer overflow-hidden">
            <img
              src="/sara-inmobiliaria.png"
              alt="SARA Inmobiliaria - Tu próximo espacio está aquí"
              className="w-full h-auto object-cover group-hover:scale-[1.015] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6 md:p-8">
              <div className="hidden sm:block">
                <span className="text-brand-sage font-bold text-sm block">SARA Bienes Raíces</span>
                <span className="text-white text-xs">Haz clic para descubrir propiedades en venta, arriendo y terrenos</span>
              </div>
              <span className="px-5 py-2.5 rounded-xl bg-brand-sage text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl">
                Explorar Catálogo <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
