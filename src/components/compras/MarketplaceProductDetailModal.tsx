'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  Building2, 
  Package, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ShoppingCart, 
  ArrowRight,
  Info,
  DollarSign,
  Percent,
  Clock,
  Layers
} from 'lucide-react';
import { MarketplaceProduct, SELLER_PLANS } from '@/lib/services/sellerMarketplaceService';

interface ProductDetailModalProps {
  product: MarketplaceProduct | null;
  onClose: () => void;
  onAddToCart?: (product: MarketplaceProduct, cantidad: number) => void;
}

export function MarketplaceProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [cantidad, setCantidad] = useState(10);
  const [agregadoFeedback, setAgregadoFeedback] = useState(false);

  if (!product) return null;

  const planInfo = SELLER_PLANS[product.sellerPlan];
  const subtotalSinIva = product.precioSinIva * cantidad;
  const ivaUsd = subtotalSinIva * (product.tarifaIvaPct / 100);
  const totalEstimado = subtotalSinIva + ivaUsd;

  // Flete referencial estimado (peso total * factor SARA-Fletes)
  const pesoTotalKg = product.pesoUnitarioKg * cantidad;
  const fleteEstimadoUsd = Math.max(25, (pesoTotalKg / 1000) * 14.50 * 1.35);

  const handleAgregar = () => {
    if (onAddToCart) {
      onAddToCart(product, cantidad);
    }
    setAgregadoFeedback(true);
    setTimeout(() => {
      setAgregadoFeedback(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Cabecera del Modal */}
        <div className="relative h-48 md:h-64 bg-slate-800 overflow-hidden">
          <img 
            src={product.imagenUrl} 
            alt={product.nombre}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${planInfo.colorBadge}`}>
                ★ {planInfo.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/20 text-white backdrop-blur-sm">
                Categoría: {product.categoria.replace('_', ' ')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                product.tarifaIvaPct === 5 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
              }`}>
                IVA {product.tarifaIvaPct}% {product.tarifaIvaPct === 5 ? '(Calificado SRI Res. 013)' : '(Tarifa General)'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {product.nombre}
            </h2>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Fila 1: Fabricante & Precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            
            {/* Información del Vendedor */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-mono text-slate-400">PROVEEDOR & FABRICANTE:</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {product.sellerNombre}
                <span title="RUC Verificado Módulo 11 SRI">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                RUC: {product.sellerRuc} • Despacho garantizado en {product.tiempoEntregaHoras}h
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                {product.descripcion}
              </p>
            </div>

            {/* Caja de Precio Unitario */}
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold block mb-1">
                  PRECIO DE FÁBRICA / MAYORISTA
                </span>
                <div className="text-3xl font-black text-slate-950 dark:text-white font-mono">
                  ${product.precioSinIva.toFixed(2)}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
                    /{product.unidad}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                  + {product.tarifaIvaPct}% IVA (${(product.precioSinIva * (product.tarifaIvaPct / 100)).toFixed(2)})
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Stock disponible: {product.stockDisponible} {product.unidad}
              </div>
            </div>
          </div>

          {/* Fila 2: Especificaciones Técnicas INEN */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Ficha Técnica & Homologación INEN (Ecuador)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Norma Oficial:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {product.especificacionesTecnicas.normaInen || 'NTE INEN'}
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Resistencia Estructural:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {product.especificacionesTecnicas.resistencia || 'Conforme a Obra'}
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Dimensiones / Calibre:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {product.especificacionesTecnicas.dimensiones || 'Nominal'}
                </span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-1">Presentación:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {product.especificacionesTecnicas.presentacion}
                </span>
              </div>
            </div>
          </div>

          {/* Fila 3: Descuentos por Volumen (si existen) */}
          {product.descuentosVolumen && product.descuentosVolumen.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-500" />
                Descuentos por Lote y Camión Completo (Escala Mayorista)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.descuentosVolumen.map((dv, i) => (
                  <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 block">
                        Desde {dv.desdeCantidad} {product.unidad}:
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ${dv.precioUnitario.toFixed(2)}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg">
                      -{(100 - (dv.precioUnitario / product.precioSinIva) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fila 4: Calculador de Pedido y Flete SARA-Fletes */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="w-full md:w-auto flex items-center gap-4">
              <div>
                <label className="text-xs font-mono text-slate-500 dark:text-slate-400 block mb-1">
                  Cantidad a Solicitar ({product.unidad}):
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    max={product.stockDisponible}
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-center font-bold text-lg text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-mono text-slate-500">
                    (~{(pesoTotalKg / 1000).toFixed(2)} Toneladas)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">
                  Total Estimado (Inc. IVA {product.tarifaIvaPct}%):
                </span>
                <span className="text-2xl font-black font-mono text-amber-500">
                  ${totalEstimado.toFixed(2)}
                </span>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  Flete MTOP est: ~${fleteEstimadoUsd.toFixed(2)} USD
                </div>
              </div>

              <button
                onClick={handleAgregar}
                disabled={agregadoFeedback}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {agregadoFeedback ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-slate-950 animate-bounce" />
                    ¡Agregado al Carrito!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Pedido de Obra
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
