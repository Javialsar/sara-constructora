"use client"
import { useState } from "react"
import { Briefcase, Plus, Search } from "lucide-react"

export default function ProveedoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-brand-sage" />
            Directorio de Proveedores
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona los proveedores de materiales y equipos para tus proyectos.
          </p>
        </div>
        <button className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all">
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar proveedor..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage w-64"
            />
          </div>
        </div>
        
        <div className="text-center py-12 text-gray-400">
          <Briefcase size={48} className="mx-auto mb-3 opacity-20" />
          <p>La base de datos de proveedores está vacía.</p>
          <p className="text-sm mt-1">Aún debemos conectar esta tabla con Supabase.</p>
        </div>
      </div>
    </div>
  )
}
