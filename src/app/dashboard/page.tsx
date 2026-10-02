"use client"
import Link from "next/link"
import { Calculator, Box, Layers, ArrowRight, FileSpreadsheet, Building2, Compass } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a tu panel de Presupuestos</h1>
        <p className="text-gray-500 mt-2">Crea cotizaciones y análisis de precios unitarios con nuestra base de datos actualizada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/presupuestos_reales" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileSpreadsheet size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Presupuestos Reales</h3>
          <p className="text-gray-500 text-sm mb-4">Crea presupuestos detallados por rubros, calcula indirectos (AIU) y exporta.</p>
          <div className="flex items-center text-purple-600 font-medium text-sm">
            Gestionar <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/dashboard/cotizador" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calculator size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Cotizador Rápido</h3>
          <p className="text-gray-500 text-sm mb-4">Proyección paramétrica para estimar costos rápidos sin detallar rubros.</p>
          <div className="flex items-center text-blue-600 font-medium text-sm">
            Comenzar <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/dashboard/apus/rubros" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Rubros</h3>
          <p className="text-gray-500 text-sm mb-4">Gestiona tus recetas, modifica rendimientos y crea rubros personalizados.</p>
          <div className="flex items-center text-indigo-600 font-medium text-sm">
            Ver catálogo <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/dashboard/apus/insumos" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Box size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Insumos</h3>
          <p className="text-gray-500 text-sm mb-4">Revisa y actualiza precios de materiales, equipos y mano de obra.</p>
          <div className="flex items-center text-emerald-600 font-medium text-sm">
            Ver insumos <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">El Catálogo Maestro a tu disposición</h2>
          <p className="text-blue-100 max-w-2xl">
            Como usuario de nuestro plan SaaS, tienes acceso a miles de insumos y rubros validados por Sara Constructora. 
            Puedes usarlos como plantilla y modificarlos para que se ajusten a tus propios proyectos sin afectar a los demás.
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Layers size={300} />
        </div>
      </div>

      {/* CROSS-SELLING ECOSISTEMA SARA */}
      <div className="pt-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest text-center">
            Descubre el Ecosistema SARA
          </h2>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SARA Inmobiliaria */}
          <Link href="/inmobiliaria" className="relative group overflow-hidden rounded-3xl shadow-lg border border-slate-200 block transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900"></div>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Building2 size={120} className="text-emerald-400" />
            </div>
            <div className="relative p-8 flex flex-col h-full min-h-[220px]">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4 border border-emerald-500/30">
                <Building2 size={14} /> División Corporativa
              </div>
              <h3 className="text-2xl font-black text-white mb-2">SARA Inmobiliaria</h3>
              <p className="text-slate-300 text-sm max-w-sm mb-6 flex-1">
                Invierte, compra, renta o vende propiedades con respaldo jurídico y técnico total garantizado por SARA Constructora.
              </p>
              <div className="flex items-center text-emerald-400 font-bold text-sm group-hover:text-emerald-300">
                Visitar Portal Inmobiliario <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          {/* SARA Stays */}
          <Link href="/stays" className="relative group overflow-hidden rounded-3xl shadow-lg border border-slate-200 block transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900"></div>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Compass size={120} className="text-amber-400" />
            </div>
            <div className="relative p-8 flex flex-col h-full min-h-[220px]">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4 border border-amber-500/30">
                <Compass size={14} /> Hospitality & Reservas
              </div>
              <h3 className="text-2xl font-black text-white mb-2">SARA Stays</h3>
              <p className="text-slate-300 text-sm max-w-sm mb-6 flex-1">
                Hospedaje de lujo, suites contemporáneas y villas vacacionales. Lugares inolvidables diseñados para inspirar.
              </p>
              <div className="flex items-center text-amber-400 font-bold text-sm group-hover:text-amber-300">
                Descubrir Alojamientos <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
