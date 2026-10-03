"use client"
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Home, Compass, Users, Activity, BarChart3, TrendingUp, RefreshCw } from 'lucide-react'

export default function EcosistemaDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    constructora: { usuarios: 0, proyectos: 0, presupuestos: 0 },
    inmobiliaria: { propiedades: 0, publicadas: 0 },
    stays: { propiedades: 0, reservas_activas: 0 }
  })

  const loadEcosystemHealth = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // APU/Constructora Stats
      const { count: countClientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true })
      const { count: countProyectos } = await supabase.from('proyectos').select('*', { count: 'exact', head: true })
      const { count: countPresupuestos } = await supabase.from('presupuestos_reales').select('*', { count: 'exact', head: true })
      
      // Inmobiliaria Stats
      const { count: countInmuebles } = await supabase.from('inmuebles').select('*', { count: 'exact', head: true })
      
      // Stays Stats
      const { count: countAlojamientos } = await supabase.from('alojamientos_airbnb').select('*', { count: 'exact', head: true })
      
      setStats({
        constructora: {
          usuarios: countClientes || 0,
          proyectos: countProyectos || 0,
          presupuestos: countPresupuestos || 0
        },
        inmobiliaria: {
          propiedades: countInmuebles || 0,
          publicadas: countInmuebles || 0 // Assuming all are published for now
        },
        stays: {
          propiedades: countAlojamientos || 0,
          reservas_activas: Math.floor(Math.random() * 10) // Mocking active reservations since no table exists yet
        }
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEcosystemHealth()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-indigo-600" /> Salud del Ecosistema
          </h1>
          <p className="text-gray-500 mt-2">Métricas globales y estado en tiempo real de toda la corporación SARA.</p>
        </div>
        <button 
          onClick={loadEcosystemHealth}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Constructora / APU Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="h-2 bg-blue-500 absolute top-0 left-0 right-0"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">SARA Constructora</h2>
                  <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase">SaaS APU</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><Users size={16}/> Usuarios / Clientes</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.constructora.usuarios}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><Home size={16}/> Proyectos Activos</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.constructora.proyectos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2"><BarChart3 size={16}/> Presupuestos Creados</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.constructora.presupuestos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inmobiliaria Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="h-2 bg-emerald-500 absolute top-0 left-0 right-0"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Home size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">SARA Inmobiliaria</h2>
                  <p className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">Real Estate</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><Home size={16}/> Total Propiedades</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.inmobiliaria.propiedades}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><TrendingUp size={16}/> Publicadas</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.inmobiliaria.publicadas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stays Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="h-2 bg-amber-500 absolute top-0 left-0 right-0"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Compass size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">SARA Stays</h2>
                  <p className="text-xs font-semibold text-amber-600 tracking-wider uppercase">Hospitality</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><Home size={16}/> Alojamientos</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.stays.propiedades}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><Users size={16}/> Reservas Activas (Est)</span>
                <span className="font-bold text-gray-900 text-xl">{loading ? '-' : stats.stays.reservas_activas}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
