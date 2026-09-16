"use client"
import { useState } from "react"
import { Wrench, Plus, Search } from "lucide-react"

export default function TrabajadoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="text-brand-sage" />
            Personal de Obra (Mano de Obra)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Catálogo de trabajadores, maestros y operarios para el cálculo de APUs.
          </p>
        </div>
        <button className="bg-brand-sage text-brand-dark px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-opacity-90 transition-all">
          <Plus size={18} />
          Registrar Personal
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar trabajador o especialidad..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-sage w-80"
            />
          </div>
        </div>
        
        <div className="text-center py-12 text-gray-400">
          <Wrench size={48} className="mx-auto mb-3 opacity-20" />
          <p>El directorio de personal está vacío.</p>
          <p className="text-sm mt-1">Aún debemos conectar esta tabla con Supabase.</p>
        </div>
      </div>
    </div>
  )
}
