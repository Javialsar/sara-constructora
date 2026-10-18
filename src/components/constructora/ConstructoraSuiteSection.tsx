"use client"

import React from "react"
import Link from "next/link"
import { 
  Receipt, 
  Boxes, 
  Users, 
  Compass, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Cpu,
  Scale,
  TrendingUp
} from "lucide-react"

export default function ConstructoraSuiteSection() {
  const serviciosConstructora = [
    {
      id: "three-way-match",
      icono: Receipt,
      titulo: "1. Three-Way Match SRI & Retenciones",
      subtitulo: "Auditoría Tributaria de Obra (Tolerancia ≤ 1%)",
      descripcion: "Cotejo tridimensional automatizado entre el XML de la factura del SRI, la Orden de Compra y la recepción en bodega. Calcula la retención de ley (Código 312/344) y genera el asiento contable de diario.",
      badge: "SRI & Finanzas",
      colorBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      puntos: ["Firma digital XAdES-BES", "Retención Renta 1.75% / IVA 30%-70%", "Partida Doble Automática"]
    },
    {
      id: "kardex-multibodega",
      icono: Boxes,
      titulo: "2. Kardex Multibodega & Trazabilidad",
      subtitulo: "Bodega Matriz vs Sub-bodegas de Obra",
      descripcion: "Control de inventario en tiempo real con Costo Promedio Ponderado (CPP). Emisión de Vales de Distribución con trazabilidad inversa a la factura del SRI y control de mermas técnicas de materiales.",
      badge: "Almacenes & Stock",
      colorBadge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      puntos: ["Despacho atómico por vale", "Modelado EOQ & Punto de Reorden", "Stock de Seguridad dinámico con Gantt"]
    },
    {
      id: "nomina-iess",
      icono: Users,
      titulo: "3. Nómina IESS & Tareo de Cuadrilla",
      subtitulo: "Sector Construcción Ecuador (Aporte 12.15%)",
      descripcion: "Procesamiento diario del tareo de cuadrillas (maestros mayores, fierreros, albañiles, peones), horas extras al 50%/100%, provisiones sociales completas y asignación del costo al rubro APU.",
      badge: "Talento Humano",
      colorBadge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      puntos: ["Aporte patronal 12.15% (SECAP/IECE)", "Décimos y Fondos de Reserva", "Costo hora efectivo en Rubro APU"]
    },
    {
      id: "procura-predictiva",
      icono: Compass,
      titulo: "4. Procuramiento Predictivo (Landed Cost)",
      subtitulo: "Ruteo en las 24 Provincias del Ecuador",
      descripcion: "Cálculo analítico del costo puesto en obra (Material + Flete) por corredor vial. Algoritmo de consolidación multiproyecto para compras por volumen a partir de la explosión de materiales BIM.",
      badge: "Logística Pesada",
      colorBadge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      puntos: ["Optimización Loja, Cuenca, Quito, GYE", "Ahorros del 8% al 12% por volumen", "Explosión de cubicaciones BIM"]
    },
    {
      id: "aprendizaje-colectivo",
      icono: Zap,
      titulo: "5. Aprendizaje Colectivo Continuo",
      subtitulo: "Cerebro Vectorial Adaptativo de Precios",
      descripcion: "Cuando el sistema detecta una variación de precio de un material en un XML del SRI, el conocimiento se actualiza e inmediatamente la IA recalcula recetas APU y proyecciones de margen en obras activas.",
      badge: "Inteligencia IA",
      colorBadge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      puntos: ["Memoria vectorial compartida", "Recálculo automático de márgenes", "Mitigación proactiva de inflación"]
    }
  ]

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-b border-white/10">
      {/* Fondo con brillo sutil y cuadrícula */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_40%,rgba(99,102,241,0.07),rgba(0,0,0,0))] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Cabecera de la Sección */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <Cpu className="w-3.5 h-3.5" />
            Servicios Operativos Avanzados SARA-CONSTRUCTORA
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Ingeniería de Software de Élite para la Construcción
          </h2>
          
          <p className="text-sm md:text-base text-slate-400 font-normal leading-relaxed">
            Las 5 herramientas de control técnico, financiero y logístico que convierten a <span className="text-white font-semibold">SARA-CONSTRUCTORA</span> en el módulo insignia del holding en el Ecuador.
          </p>

          <div className="pt-2">
            <Link
              href="/constructora/suite"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
            >
              <span>Abrir Consola Técnica de Constructora</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Grilla de los 5 Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviciosConstructora.map((servicio, idx) => {
            const Icon = servicio.icono
            return (
              <div
                key={servicio.id}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${servicio.colorBadge}`}>
                      {servicio.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {servicio.titulo}
                  </h3>
                  
                  <p className="text-xs text-indigo-400/90 font-medium mt-0.5 mb-2.5">
                    {servicio.subtitulo}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {servicio.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                  {servicio.puntos.map((punto, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                      <span>{punto}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Tarjeta 6 de Resumen & Enlace a la Consola */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center mb-4 shadow-sm shadow-indigo-500/30">
                <Sparkles size={22} />
              </div>
              <h3 className="text-base font-bold text-white">
                Módulo Estrella SARA-CONSTRUCTORA
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Todos estos servicios están interconectados mediante una arquitectura distribuida por eventos (EDA) respaldada por Supabase (PostgreSQL) con integridad atómica y tolerancia a fallos.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/constructora/suite"
                className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Ejecutar Simulación en Vivo</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
