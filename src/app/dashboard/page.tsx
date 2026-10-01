"use client"
import Link from "next/link"
import { Calculator, Box, Layers, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a tu panel de Presupuestos</h1>
        <p className="text-gray-500 mt-2">Crea cotizaciones y análisis de precios unitarios con nuestra base de datos actualizada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/cotizador" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calculator size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Crear Presupuesto</h3>
          <p className="text-gray-500 text-sm mb-4">Inicia un nuevo presupuesto desde cero o utilizando rubros existentes.</p>
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
          <p className="text-gray-500 text-sm mb-4">Revisa y actualiza los precios de materiales, equipos y mano de obra.</p>
          <div className="flex items-center text-emerald-600 font-medium text-sm">
            Ver insumos <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">El Catálogo Maestro a tu disposición</h2>
          <p className="text-blue-100 max-w-2xl mb-6">
            Como usuario de nuestro plan SaaS, tienes acceso a miles de insumos y rubros validados por Sara Constructora. 
            Puedes usarlos como plantilla y modificarlos para que se ajusten a tus propios proyectos sin afectar a los demás.
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Layers size={300} />
        </div>
      </div>
    </div>
  )
}
