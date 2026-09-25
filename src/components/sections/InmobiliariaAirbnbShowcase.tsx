import Link from "next/link"
import { Building2, Sparkles, ArrowRight, Home, Key, MapPin, CheckCircle2 } from "lucide-react"

export default function InmobiliariaAirbnbShowcase() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-b border-gray-800">
      {/* Grilla sutil */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-brand-sage/20 text-emerald-400 border border-brand-sage/30 mb-4">
            Ecosistema Integral SARA
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
            Más que una Constructora: Tu Aliado Inmobiliario y de Hospitalidad
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Ya sea que busques comprar una casa terminada, invertir en un terreno para construir o disfrutar de una estadía de lujo por noche en Cuenca, tenemos la solución perfecta.
          </p>
        </div>

        {/* 2 Tarjetas Maestras: Inmobiliaria & Airbnb */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tarjeta 1: SARA Inmobiliaria */}
          <div className="bg-gradient-to-br from-[#0c2217] to-slate-900 rounded-3xl p-8 border border-emerald-800/40 shadow-xl flex flex-col justify-between group hover:border-emerald-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-sage/20 text-emerald-400 flex items-center justify-center border border-brand-sage/30">
                  <Building2 size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Compra · Venta · Terrenos
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-3 group-hover:text-emerald-300 transition-colors">
                SARA Inmobiliaria & Bienes Raíces
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Catálogo verificado de casas residenciales, departamentos de estreno y terrenos listos para construir. Te asesoramos con créditos hipotecarios (BIESS / Banca privada) y proyectos de edificación llave en mano.
              </p>

              <ul className="space-y-2.5 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Propiedades 100% verificadas técnica y jurídicamente</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Sinergia exclusiva: Terreno + Construcción con SARA</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Servicio de consignación para dueños particulares</span>
                </li>
              </ul>
            </div>

            <Link
              href="/inmobiliaria"
              className="w-full py-3.5 px-6 rounded-xl bg-brand-sage hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              Explorar Catálogo Inmobiliario <ArrowRight size={15} />
            </Link>
          </div>

          {/* Tarjeta 2: SARA Airbnb */}
          <div className="bg-gradient-to-br from-slate-900 to-[#1b190f] rounded-3xl p-8 border border-amber-800/40 shadow-xl flex flex-col justify-between group hover:border-amber-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Sparkles size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Nacional & Mundial
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-3 group-hover:text-amber-300 transition-colors">
                SARA Suites & Alojamientos Globales
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Descubre suites ejecutivas y villas vacacionales en los destinos más cotizados de Ecuador (Cuenca, Quito, Guayaquil, Galápagos) y ciudades internacionales de primer nivel (Miami, Madrid, Cancún, Medellín). Reserva directa sin comisiones extras.
              </p>

              <ul className="space-y-2.5 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>Check-in autónomo 24/7 con cerraduras digitales</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>WiFi simétrico de alta velocidad y áreas para teletrabajo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>Servicio de gestión Airbnb para inversionistas (10-15% rentabilidad)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/airbnb"
              className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all"
            >
              Ver Alojamientos y Reservar <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
