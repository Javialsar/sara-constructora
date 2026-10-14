"use client"

import React, { useState, useEffect } from "react"
import { 
  Box, 
  Layers, 
  Cpu, 
  TrendingDown, 
  ShoppingCart, 
  CheckCircle2, 
  Upload, 
  FileCode, 
  ExternalLink, 
  RefreshCw,
  Building,
  HardHat,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react"

export default function SaraBimPage() {
  const [modelos, setModelos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modeloActivo, setModeloActivo] = useState<string>("mod-1")

  // Modelo de ejemplo cargado desde Revit 2026
  const modeloDemo = {
    id: "mod-1",
    nombre_modelo: "EDIFICIO TORRE ESMERALDA - ESTRUCTURA & ALBAÑILERÍA",
    software: "Autodesk Revit 2026",
    guid: "7b4f2c91-44a3-48e0-bb12-9c3f19e4811a",
    volumen_hormigon: 342.50, // m³
    peso_acero: 28450.00, // kg
    area_mamposteria: 1120.00, // m²
    costo_apu_base: 148920.00,
    costo_marketplace_vivo: 132450.00,
    ahorro: 16470.00,
    porcentaje_ahorro: 11.1,
    elementos: [
      {
        id: "e1",
        categoria: "Structural Foundations",
        material: "Hormigón Simple f'c=280 kg/cm²",
        clasificacion: "hormigon",
        cantidad: "115.00 m³",
        precio_apu: 142.00,
        precio_market: 125.00,
        subtotal_apu: 16330.00,
        subtotal_market: 14375.00,
        ahorro: 1955.00
      },
      {
        id: "e2",
        categoria: "Structural Framing / Columns",
        material: "Hormigón Estructural f'c=240 kg/cm²",
        clasificacion: "hormigon",
        cantidad: "227.50 m³",
        precio_apu: 138.50,
        precio_market: 122.00,
        subtotal_apu: 31508.75,
        subtotal_market: 27755.00,
        ahorro: 3753.75
      },
      {
        id: "e3",
        categoria: "Structural Rebar",
        material: "Acero de Refuerzo Corrugado fy=4200",
        clasificacion: "acero",
        cantidad: "28,450.00 kg",
        precio_apu: 1.85,
        precio_market: 1.62,
        subtotal_apu: 52632.50,
        subtotal_market: 46089.00,
        ahorro: 6543.50
      },
      {
        id: "e4",
        categoria: "Walls / Masonry",
        material: "Ladrillo Panelón Prensado 8x12x24",
        clasificacion: "mamposteria",
        cantidad: "1,120.00 m²",
        precio_apu: 22.00,
        precio_market: 18.80,
        subtotal_apu: 24640.00,
        subtotal_market: 21056.00,
        ahorro: 3584.00
      }
    ]
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header SARA-BIM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2 border border-indigo-200/60 dark:border-indigo-800/60">
            <Box size={14} className="text-indigo-600 animate-pulse" />
            Módulo SARA-BIM • Integración Revit / Archicad
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Modelado BIM & Cotización en Tiempo Real
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Conexión directa entre el modelo 3D y la base de costos. Extracción de volumetrías (Material Takeoff) y cotización automática en <strong>SARA-MARKETPLACE</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Add-in instalado: Esperando sincronización desde Autodesk Revit o Archicad")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            <FileCode size={14} />
            Add-in Revit Conectado
          </button>
        </div>
      </div>

      {/* Tarjeta Resumen del Modelo Seleccionado */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 text-indigo-300 border border-white/15">
              {modeloDemo.software} • GUID: {modeloDemo.guid.slice(0, 18)}...
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {modeloDemo.nombre_modelo}
            </h2>
            <p className="text-xs text-indigo-200/80 leading-relaxed max-w-xl">
              Volumetría física extraída sin discrepancias. Todos los elementos estructurales y de mampostería fueron mapeados con el catálogo de rubros en <strong>SARA-APU</strong>.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Hormigón Total</span>
                <span className="text-lg font-black font-mono">{modeloDemo.volumen_hormigon} m³</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Acero de Refuerzo</span>
                <span className="text-lg font-black font-mono">{(modeloDemo.peso_acero / 1000).toFixed(1)} Ton</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">Mampostería</span>
                <span className="text-lg font-black font-mono">{modeloDemo.area_mamposteria} m²</span>
              </div>
            </div>
          </div>

          {/* Panel de Ahorro y Cotización en Vivo */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200">Presupuesto SARA-APU Base:</span>
              <span className="text-sm font-mono font-bold text-slate-300">
                ${modeloDemo.costo_apu_base.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Precio Vivo SARA-MARKETPLACE:</span>
              <span className="text-lg font-mono font-black text-emerald-400">
                ${modeloDemo.costo_marketplace_vivo.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-emerald-400" size={18} />
                <div>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase block">Ahorro Detectado B2B</span>
                  <span className="text-xs font-black text-white">-{modeloDemo.porcentaje_ahorro}% con Mayoristas</span>
                </div>
              </div>
              <span className="text-xl font-black text-emerald-300 font-mono">
                ${modeloDemo.ahorro.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => alert("Generando Orden de Compra B2B para despacho en obra...")}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingCart size={15} />
                Comprar en Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Desglosada de Elementos (Material Takeoff) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Desglose de Volumetría y Precios Comparados
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-semibold">4 familias estructurales detectadas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Categoría BIM</th>
                <th className="py-3 px-4">Material / Elemento</th>
                <th className="py-3 px-4 text-right">Volumen / Medida</th>
                <th className="py-3 px-4 text-right">P.U. APU Base</th>
                <th className="py-3 px-4 text-right">P.U. Marketplace</th>
                <th className="py-3 px-4 text-right">Subtotal Vivo</th>
                <th className="py-3 px-4 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
              {modeloDemo.elementos.map(el => (
                <tr key={el.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-500">{el.categoria}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{el.material}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">{el.cantidad}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-500">${el.precio_apu.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">${el.precio_market.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">${el.subtotal_market.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">-${el.ahorro.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
