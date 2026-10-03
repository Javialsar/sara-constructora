import React from 'react'
import { Star, ChevronLeft, ChevronRight, Compass } from 'lucide-react'
import { AirbnbListing } from './AirbnbData'

export interface HeroSectionProps {
  alojamientosDestacados: AirbnbListing[];
  heroStaysIdx: number;
  setHeroStaysIdx: React.Dispatch<React.SetStateAction<number>>;
  setHeroStaysPaused: React.Dispatch<React.SetStateAction<boolean>>;
  logoStays: string;
}

export default function HeroSection({
  alojamientosDestacados,
  heroStaysIdx,
  setHeroStaysIdx,
  setHeroStaysPaused,
  logoStays
}: HeroSectionProps) {
  const currentStay = alojamientosDestacados[heroStaysIdx]

  return (
    <section className="relative pt-12 pb-24 lg:pb-28 overflow-hidden bg-slate-950">
      {/* Fondo Base Oscuro */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay" />

      {/* Elementos Decorativos Flotantes (Luces) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          
          {/* Columna Izquierda: Copywriting y Call to Actions */}
          <div className="order-2 lg:order-1 pt-4 lg:pt-0">
            {/* Tagline / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest">
                La nueva era del Real Estate
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Descubre <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Alojamientos</span> con Alma de Autor.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed max-w-xl mb-8">
              En SARA Stays fusionamos la arquitectura de vanguardia, tecnología smart y diseño de interiores para crear estadías que no solo habitas, sino que experimentas y recuerdas.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a href="#catalogo" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] cursor-pointer">
                <Compass size={18} /> Explorar Catálogo
              </a>
              <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="Huésped" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="Huésped" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" alt="Huésped" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">4.9/5 Promedio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Showcase Cinemático Autoplay */}
          <div className="order-1 lg:order-2 relative" 
               onMouseEnter={() => setHeroStaysPaused(true)}
               onMouseLeave={() => setHeroStaysPaused(false)}>
            {/* Marco de Dispositivo / Pantalla */}
            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/5] rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl ring-1 ring-white/10 isolate">
              
              {/* Contenedor de Imágenes con Transición Crossfade */}
              <div className="absolute inset-0 w-full h-full">
                {alojamientosDestacados.map((stay, idx) => (
                  <div 
                    key={stay.id}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                      idx === heroStaysIdx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
                    }`}
                  >
                    <img 
                      src={stay.imagenes[0]} 
                      alt={stay.titulo} 
                      className="w-full h-full object-cover"
                    />
                    {/* Gradiente Oscuro inferior para el texto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  </div>
                ))}
              </div>

              {/* Distintivo Superior SARA Stays */}
              <div className="absolute top-6 left-6 z-20">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-lg flex items-center justify-center">
                  <img src={logoStays} alt="SARA Stays" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Botón Flotante Superior Derecho */}
              <div className="absolute top-6 right-6 z-20">
                <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <Star size={11} className="fill-slate-950 text-slate-950" /> Premium Selection
                </div>
              </div>

              {/* Controles Navigación Ocultos (Aparecen en Hover) */}
              <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setHeroStaysIdx(prev => (prev - 1 + alojamientosDestacados.length) % alojamientosDestacados.length); }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 transition-all shadow-xl"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setHeroStaysIdx(prev => (prev + 1) % alojamientosDestacados.length); }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 transition-all shadow-xl"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Información Inferior de la Propiedad */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
                <div className="transform transition-all duration-500 translate-y-0">
                  <div className="flex items-center gap-3 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {currentStay?.sector}, {currentStay?.ciudad}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>{currentStay?.tipo}</span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-4 line-clamp-2 leading-tight">
                    {currentStay?.titulo}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-0.5">Desde</p>
                      <p className="text-2xl font-black text-white">
                        ${currentStay?.precioNoche} <span className="text-sm font-medium text-slate-400">/ noche</span>
                      </p>
                    </div>
                    <a href="#catalogo" className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2">
                      Ver Detalles <ChevronRight size={14} />
                    </a>
                  </div>
                </div>

                {/* Indicadores de Carrusel */}
                <div className="flex gap-1.5 mt-6 justify-center">
                  {alojamientosDestacados.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroStaysIdx(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === heroStaysIdx 
                          ? "w-8 bg-amber-400" 
                          : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Ver foto ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
