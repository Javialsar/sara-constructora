'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  ShieldCheck, 
  Truck, 
  Package, 
  Star, 
  Eye, 
  ShoppingCart, 
  Sparkles, 
  CheckCircle2, 
  Percent, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Warehouse
} from 'lucide-react';
import { MarketplaceProduct, SellerProfile, SELLER_PLANS } from '@/lib/services/sellerMarketplaceService';

interface MarketplaceVitrinaSectionProps {
  productos: MarketplaceProduct[];
  sellers: SellerProfile[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoria: string;
  setCategoria: (c: string) => void;
  sellerId: string;
  setSellerId: (s: string) => void;
  planFiltro: string;
  setPlanFiltro: (p: string) => void;
  soloMasVendidos: boolean;
  setSoloMasVendidos: (v: boolean) => void;
  tarifaIva: number | undefined;
  setTarifaIva: (t: number | undefined) => void;
  onVerProducto: (p: MarketplaceProduct) => void;
  onAddToCart: (p: MarketplaceProduct, cant: number) => void;
  onOpenSellerHub: () => void;
  cartItemsCount: number;
}

export function MarketplaceVitrinaSection({
  productos,
  sellers,
  searchQuery,
  setSearchQuery,
  categoria,
  setCategoria,
  sellerId,
  setSellerId,
  planFiltro,
  setPlanFiltro,
  soloMasVendidos,
  setSoloMasVendidos,
  tarifaIva,
  setTarifaIva,
  onVerProducto,
  onAddToCart,
  onOpenSellerHub,
  cartItemsCount
}: MarketplaceVitrinaSectionProps) {

  const categorias = [
    { id: 'TODAS', label: 'Todas las Categorías' },
    { id: 'ACERO', label: 'Acero & Metales' },
    { id: 'CEMENTO_HORMIGON', label: 'Cemento & Hormigón' },
    { id: 'ARIDOS_PETREOS', label: 'Áridos de Cantera' },
    { id: 'ACABADOS', label: 'Acabados & Pinturas' },
    { id: 'TUBERIAS_PLOMERIA', label: 'Tuberías & Plomería' },
    { id: 'ELECTRICIDAD', label: 'Material Eléctrico' },
    { id: 'MAQUINARIA_EQUIPOS', label: 'Maquinaria & Equipos' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ===================================================================== */}
      {/* BANNER INFORMATIVO: JERARQUÍA DE EXPOSICIÓN VIP -> ESTÁNDAR -> BÁSICO */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              ALGORITMO DE POSICIONAMIENTO SARA
            </span>
            <span className="text-xs font-mono text-slate-400">
              Vitrina B2B Priorizada por Plan de Membresía
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Materiales de Construcción con Precios de Fábrica & Mayoristas
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Los productos se exhiben con estricta prioridad: 
            <strong className="text-amber-400 font-bold ml-1">1º Proveedores VIP Fábrica</strong> (Adelca, Holcim) directos de planta con comisión reducida 1.8%, 
            seguidos de <strong className="text-sky-400 font-bold ml-1">2º Distribuidores Pro</strong> (Novacero, Kubiec) y 
            <strong className="text-emerald-400 font-bold ml-1">3º Ferreterías Locales</strong>.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onOpenSellerHub}
            className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Publicar Productos de mi Empresa
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BARRA DE BÚSQUEDA Y FILTROS INTEGRADOS                                 */}
      {/* ===================================================================== */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Fila 1: Buscador y Filtros Principales */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Input de Búsqueda */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por material, SKU, especificación o marca..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Filtro por Empresa Proveedora */}
          <div className="md:col-span-3">
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todas las Empresas Proveedoras</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombreComercial} ({s.plan === 'VIP_FABRICA' ? 'VIP' : s.plan === 'ESTANDAR_PRO' ? 'PRO' : 'BÁSICO'})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Plan de Suscripción */}
          <div className="md:col-span-2">
            <select
              value={planFiltro}
              onChange={(e) => setPlanFiltro(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todos los Planes</option>
              <option value="VIP_FABRICA">★ Solo Fábricas VIP</option>
              <option value="ESTANDAR_PRO">Distribuidores Pro</option>
              <option value="BASICO_FERRETERIA">Ferreterías Básicas</option>
            </select>
          </div>

          {/* Filtro por Tarifa IVA */}
          <div className="md:col-span-2">
            <select
              value={tarifaIva === undefined ? 'TODOS' : tarifaIva.toString()}
              onChange={(e) => setTarifaIva(e.target.value === 'TODOS' ? undefined : parseInt(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Cualquier Tarifa IVA</option>
              <option value="5">IVA 5% (Material Calificado)</option>
              <option value="15">IVA 15% (Tarifa General)</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Píldoras de Categorías y Botón Más Vendidos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-bold transition-all ${
                  categoria === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoloMasVendidos(!soloMasVendidos)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                soloMasVendidos
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-black'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Los Más Vendidos de Obra
            </button>
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* CUADRÍCULA DE PRODUCTOS (GRID RESPONSIVO)                               */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Mostrando {productos.length} productos certificados</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Todos los insumos cumplen normativa INEN y SRI Módulo 11
          </span>
        </div>

        {productos.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No se encontraron materiales con los filtros aplicados
            </h3>
            <p className="text-xs text-slate-400">
              Intenta cambiar la categoría, el proveedor o el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((prod) => {
              const plan = SELLER_PLANS[prod.sellerPlan];
              const isVip = prod.sellerPlan === 'VIP_FABRICA';
              const isPro = prod.sellerPlan === 'ESTANDAR_PRO';

              return (
                <div 
                  key={prod.id}
                  className={`group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between ${
                    isVip 
                      ? 'border-amber-500/40 hover:border-amber-500 shadow-amber-500/5' 
                      : isPro 
                      ? 'border-sky-500/30 hover:border-sky-500 shadow-sky-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div>
                    {/* Imagen del Producto */}
                    <div className="relative h-44 bg-slate-800 overflow-hidden">
                      <img 
                        src={prod.imagenUrl} 
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      {/* Badge del Plan de la Empresa en la Esquina */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${plan.colorBadge}`}>
                          ★ {plan.badge}
                        </span>
                        {prod.esMasVendido && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-slate-950" />
                            Más Vendido
                          </span>
                        )}
                      </div>

                      {/* Tarifa IVA Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-md ${
                          prod.tarifaIvaPct === 5
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900/90 text-white border border-white/20'
                        }`}>
                          IVA {prod.tarifaIvaPct}% {prod.tarifaIvaPct === 5 ? '(SRI)' : ''}
                        </span>
                      </div>

                      {/* Fabricante y Calificación */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-bold truncate text-[11px] flex items-center gap-1 text-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {prod.sellerNombre}
                        </span>
                        <span className="text-[10px] font-mono flex items-center gap-0.5 text-amber-400">
                          ★ {prod.calificacion}
                        </span>
                      </div>
                    </div>

                    {/* Información Principal */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                          {prod.categoria.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {prod.nombre}
                        </h3>
                      </div>

                      {/* Precio y Desglose */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block">PRECIO UNITARIO:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black font-mono text-slate-950 dark:text-white">
                            ${prod.precioSinIva.toFixed(2)}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            /{prod.unidad}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Total inc. IVA: ${(prod.precioSinIva * (1 + prod.tarifaIvaPct / 100)).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Stock: {prod.stockDisponible}</span>
                        <span className="flex items-center gap-1 text-sky-400">
                          <Truck className="w-3.5 h-3.5" />
                          {prod.tiempoEntregaHoras}h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción de la Tarjeta */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onVerProducto(prod)}
                      className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      Ver Ficha
                    </button>

                    <button
                      onClick={() => onAddToCart(prod, 1)}
                      className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Pedir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
