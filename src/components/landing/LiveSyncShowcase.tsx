'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Hotel, 
  Truck, 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  CreditCard,
  Radio
} from 'lucide-react';
import { AirbnbListing } from '@/components/stays/AirbnbData';

interface LiveSyncShowcaseProps {
  realProjects: any[];
  realStays: AirbnbListing[];
  onOpenCheckout: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void;
}

export default function LiveSyncShowcase({ realProjects, realStays, onOpenCheckout }: LiveSyncShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'proyectos' | 'stays' | 'fletes'>('proyectos');

  return (
    <section className="py-24 bg-slate-950 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Sincronización en Tiempo Real</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Actividad en Vivo de la Base de Datos
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Datos verificados y alimentados en vivo desde Supabase y los módulos activos de Grupo SARA.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('proyectos')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'proyectos'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Obras en Ejecución ({realProjects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stays')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'stays'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>SARA Stays ({realStays.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('fletes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fletes'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Radar Fletes</span>
            </button>
          </div>
        </div>

        {/* Content Panel 1: PROYECTOS REALES */}
        {activeTab === 'proyectos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {realProjects.slice(0, 3).map((p) => (
              <div 
                key={p.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      {p.estado === 'en_diseno' ? 'En Planificación / Diseño' : p.estado || 'Activo'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      En Progreso
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{p.nombre}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-6">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{p.ubicacion || 'Ecuador'}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href="/constructora"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Ver Ficha Técnica</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => onOpenCheckout({
                      title: `Aporte / Separación Proyecto ${p.nombre}`,
                      amount: 150.00,
                      badgeText: "SARA Constructora",
                      isSubscription: false
                    })}
                    className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <CreditCard className="w-3 h-3 text-emerald-400" />
                    <span>Pagar Cuota</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Panel 2: SARA STAYS REALES */}
        {activeTab === 'stays' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {realStays.slice(0, 3).map((stay) => (
              <div 
                key={stay.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-xl group"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={stay.imagenes[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'}
                    alt={stay.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-slate-700">
                    {stay.ciudad}, {stay.pais}
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-slate-950" />
                    <span>{stay.rating}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{stay.titulo}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{stay.descripcion}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-white">${stay.precioNoche}</span>
                      <span className="text-xs text-slate-400 font-medium"> / noche</span>
                    </div>

                    <button
                      onClick={() => onOpenCheckout({
                        title: `Reserva: ${stay.titulo}`,
                        amount: stay.precioNoche,
                        badgeText: "SARA Stays Alojamiento",
                        isSubscription: false
                      })}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Reservar Ahora</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Panel 3: FLETES LOGÍSTICA REAL */}
        {activeTab === 'fletes' && (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Truck className="w-3.5 h-3.5" />
                <span>Despacho Logístico Nacional</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Monitoreo de Flota Pesada y Carga en Ruta
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Los transportistas de Grupo SARA están conectados mediante geolocalización satelital. Cada viaje cuenta con código de acceso verificado y liquidación por comisiones con billetera prepago.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/fletes"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <span>Abrir Consola de Fletes</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => onOpenCheckout({
                    title: "Recarga de Billetera Prepago SARA Fletes",
                    amount: 50.00,
                    badgeText: "Red de Fletes SARA",
                    isSubscription: false
                  })}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Hacer Recarga con Pasarela Estándar</span>
                </button>
              </div>
            </div>

            <div className="w-full md:w-96 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Unidades Activas Simuladas</div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-white">Camión Hino 5T (PBA-1234)</div>
                    <div className="text-[10px] text-slate-400">Ruta: Quito → Machachi</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">VIP</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Tráiler 20T (MAB-5544)</div>
                    <div className="text-[10px] text-slate-400">Ruta: Guayaquil → Cuenca</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Estándar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
