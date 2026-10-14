"use client"

import React, { useState, useEffect } from "react"
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Navigation,
  HardHat
} from "lucide-react"

interface Maquinaria {
  id: string
  codigo_maquinaria: string
  nombre_equipo: string
  categoria: string
  tarifa_hora: number
  tarifa_dia: number
  incluye_operador: boolean
  disponibilidad: string
  provincia: string
  canton: string
  latitud: number
  longitud: number
  foto_url: string
}

export default function SaraMaquinariaPage() {
  const [equipos, setEquipos] = useState<Maquinaria[]>([])
  const [categoria, setCategoria] = useState("todas")
  const [provincia, setProvincia] = useState("todas")
  const [loading, setLoading] = useState(true)
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Maquinaria | null>(null)
  const [horasReserva, setHorasReserva] = useState(8)
  const [escrowExitoso, setEscrowExitoso] = useState(false)

  useEffect(() => {
    fetchMaquinaria()
  }, [categoria, provincia])

  const fetchMaquinaria = async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (categoria !== "todas") q.set("categoria", categoria)
      if (provincia !== "todas") q.set("provincia", provincia)
      const res = await fetch(`/api/maquinaria?${q.toString()}`)
      const json = await res.json()
      if (json.success && json.data) {
        setEquipos(json.data)
      }
    } catch {
      console.warn("Fallo cargando maquinaria")
    } finally {
      setLoading(false)
    }
  }

  const handleSolicitarEscrow = async () => {
    if (!equipoSeleccionado) return
    setEscrowExitoso(false)

    try {
      const res = await fetch("/api/maquinaria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maquinaria_id: equipoSeleccionado.id.startsWith("m-") ? "00000000-0000-0000-0000-000000000001" : equipoSeleccionado.id,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          horas_solicitadas: horasReserva,
          latitud_destino: equipoSeleccionado.latitud,
          longitud_destino: equipoSeleccionado.longitud
        })
      })

      const json = await res.json()
      if (json.success) {
        setEscrowExitoso(true)
      }
    } catch {
      alert("Error procesando la solicitud de custodia Escrow")
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-200/60 dark:border-amber-800/60">
            <Truck size={14} className="text-amber-600" />
            SARA-MAQUINARIA • Logística Pesada & Uber de Equipo Caminero
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Reserva de Maquinaria y Equipos Pesados
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Conecta en tiempo real con operadores certificados de excavadoras, volquetas y rodillos en <strong>Loja, Azuay y El Oro</strong>. Pagos asegurados con custodia Escrow de <strong>SARA-PAGOS</strong>.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs">
        <div className="lg:col-span-6">
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 font-medium"
          >
            <option value="todas">Todas las Categorías de Equipo</option>
            <option value="excavacion">Movimiento de Tierras & Excavación</option>
            <option value="compactacion">Compactación & Asfalto</option>
            <option value="transporte_aridos">Transporte de Áridos (Volquetas)</option>
          </select>
        </div>
        <div className="lg:col-span-6">
          <select
            value={provincia}
            onChange={e => setProvincia(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 font-medium"
          >
            <option value="todas">Todas las Provincias del Austro</option>
            <option value="Loja">Loja (Cariamanga, Catamayo, Loja)</option>
            <option value="Azuay">Azuay (Cuenca, Paute, Gualaceo)</option>
            <option value="El Oro">El Oro (Machala, Pasaje, Santa Rosa)</option>
          </select>
        </div>
      </div>

      {/* Grid de Maquinaria Disponible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipos.map(eq => (
          <div
            key={eq.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                <img
                  src={eq.foto_url}
                  alt={eq.nombre_equipo}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow">
                  {eq.disponibilidad}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                  <MapPin size={11} /> {eq.canton}, {eq.provincia}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  {eq.codigo_maquinaria}
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                  {eq.nombre_equipo}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <HardHat size={13} className="text-gray-400" />
                  <span>{eq.incluye_operador ? "Operador Incluido" : "Sin Operador"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-950/60 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Tarifa por Hora</span>
                <div className="text-lg font-black text-gray-900 dark:text-white font-mono">
                  ${eq.tarifa_hora.toFixed(2)}
                </div>
              </div>

              <button
                onClick={() => { setEquipoSeleccionado(eq); setEscrowExitoso(false); }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
              >
                Solicitar Equipo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Reserva con Escrow */}
      {equipoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase text-amber-600">Custodia Preventiva de Fondos</span>
                <h2 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                  Reservar {equipoSeleccionado.nombre_equipo}
                </h2>
              </div>
              <button
                onClick={() => setEquipoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-gray-500">Tarifa Horaria:</span>
                <span className="font-bold">${equipoSeleccionado.tarifa_hora.toFixed(2)}/h</span>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Horas de Operación Estimadas:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={horasReserva}
                  onChange={e => setHorasReserva(parseInt(e.target.value) || 1)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-bold font-mono"
                />
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-black">
                <span>Total a Bloquear en Escrow:</span>
                <span className="font-mono text-emerald-600">
                  ${(horasReserva * equipoSeleccionado.tarifa_hora).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/50 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-blue-600" />
              <p>
                <strong>Garantía SARA-PAGOS:</strong> Los fondos permanecen bloqueados en custodia y solo se liberan al operador una vez que el fiscalizador firme la planilla de horas en <strong>SARA-FISCALIZA</strong>.
              </p>
            </div>

            {escrowExitoso ? (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-2">
                <CheckCircle2 size={16} /> ¡Reserva confirmada y custodia Escrow activada!
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEquipoSeleccionado(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSolicitarEscrow}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow transition"
                >
                  Confirmar y Bloquear Fondos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
