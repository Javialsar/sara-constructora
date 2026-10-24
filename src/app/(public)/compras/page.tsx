'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShoppingCart, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Percent, 
  TrendingUp, 
  Star, 
  Boxes, 
  Layers, 
  FileSpreadsheet, 
  CreditCard, 
  Package, 
  ChevronRight,
  PhoneCall,
  Clock,
  ArrowUpRight,
  Plus,
  Minus,
  Trash2,
  FileText,
  BadgeCheck,
  Check,
  Store
} from 'lucide-react';
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA } from '@/lib/services/logosService';
import { 
  SellerMarketplaceService, 
  MarketplaceProduct, 
  SellerProfile, 
  SELLER_PLANS 
} from '@/lib/services/sellerMarketplaceService';
import { MarketplaceProductDetailModal } from '@/components/compras/MarketplaceProductDetailModal';
import { SellerHubModal } from '@/components/compras/SellerHubModal';
import { MarketplaceVitrinaSection } from '@/components/compras/MarketplaceVitrinaSection';

export default function SaraComprasLandingPage() {
  const [logoCompras, setLogoCompras] = useState(DEFAULT_LOGOS_EMPRESA.compras || '/images/sara-grupo.png');

  // Estados del Buscador y Filtros del Marketplace
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceCategoria, setMarketplaceCategoria] = useState<string>('TODAS');
  const [marketplaceSellerId, setMarketplaceSellerId] = useState<string>('TODOS');
  const [marketplacePlanFiltro, setMarketplacePlanFiltro] = useState<string>('TODOS');
  const [marketplaceSoloMasVendidos, setMarketplaceSoloMasVendidos] = useState(false);
  const [marketplaceTarifaIva, setMarketplaceTarifaIva] = useState<number | undefined>(undefined);

  // Modales
  const [productoParaVerDetalle, setProductoParaVerDetalle] = useState<MarketplaceProduct | null>(null);
  const [sellerHubModalOpen, setSellerHubModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [sellerRefreshCounter, setSellerRefreshCounter] = useState(0);

  // Carrito de Cotización y Compra
  const [cartItems, setCartItems] = useState<{ product: MarketplaceProduct; cantidad: number }[]>([]);

  useEffect(() => {
    getLogosEmpresa().then((logos) => {
      if (logos?.compras) setLogoCompras(logos.compras);
    });
  }, []);

  // Productos ordenados por jerarquía VIP -> Pro -> Básico
  const marketplaceProductos = useMemo(() => {
    return SellerMarketplaceService.getMarketplaceProducts({
      search: marketplaceSearch,
      categoria: marketplaceCategoria === 'TODAS' ? undefined : marketplaceCategoria,
      sellerId: marketplaceSellerId === 'TODOS' ? undefined : marketplaceSellerId,
      plan: marketplacePlanFiltro === 'TODOS' ? undefined : (marketplacePlanFiltro as any),
      masVendidos: marketplaceSoloMasVendidos ? true : undefined,
      tarifaIva: marketplaceTarifaIva
    });
  }, [marketplaceSearch, marketplaceCategoria, marketplaceSellerId, marketplacePlanFiltro, marketplaceSoloMasVendidos, marketplaceTarifaIva, sellerRefreshCounter]);

  const sellersList = useMemo(() => {
    return SellerMarketplaceService.getSellersList();
  }, [sellerRefreshCounter]);

  // Cálculos del Carrito de Pedido
  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let totalIva5 = 0;
    let totalIva15 = 0;
    let fleteEstimado = 0;

    cartItems.forEach(item => {
      const lineSubtotal = item.product.precioSinIva * item.cantidad;
      subtotal += lineSubtotal;
      if (item.product.tarifaIvaPct === 5) {
        totalIva5 += lineSubtotal * 0.05;
      } else {
        totalIva15 += lineSubtotal * 0.15;
      }
      const fleteItem = (item.product.pesoUnitarioKg * 0.025);
      fleteEstimado += fleteItem * item.cantidad;
    });

    const total = subtotal + totalIva5 + totalIva15 + fleteEstimado;
    return { subtotal, totalIva5, totalIva15, fleteEstimado, total };
  }, [cartItems]);

  const handleAddToCart = (product: MarketplaceProduct, cant: number = 1) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].cantidad += cant;
        return copy;
      }
      return [...prev, { product, cantidad: cant }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newCant = item.cantidad + delta;
          return newCant > 0 ? { ...item, cantidad: newCant } : null;
        }
        return item;
      }).filter(Boolean) as { product: MarketplaceProduct; cantidad: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  return (
    <>
      {/* MODAL DETALLE DE PRODUCTO */}
      <MarketplaceProductDetailModal
        product={productoParaVerDetalle}
        onClose={() => setProductoParaVerDetalle(null)}
        onAddToCart={(prod, cant) => handleAddToCart(prod, cant)}
      />

      {/* MODAL ENTORNO DEL PROVEEDOR (SELLER CENTRAL / VENDOR HUB) */}
      <SellerHubModal
        isOpen={sellerHubModalOpen}
        onClose={() => setSellerHubModalOpen(false)}
        onProductAdded={() => setSellerRefreshCounter(prev => prev + 1)}
      />

      {/* DRAWER / MODAL DEL CARRITO DE COTIZACIÓN */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Pedido de Materiales de Obra</h3>
                  <p className="text-xs text-slate-400">Precios directos de fábrica & flete pesado MTOP</p>
                </div>
              </div>
              <button 
                onClick={() => setCartModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <Package className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
                  <p className="text-sm">No has agregado materiales a tu cotización aún.</p>
                  <button
                    onClick={() => setCartModalOpen(false)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.product.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between gap-4">
                    <img 
                      src={item.product.imagenUrl} 
                      alt={item.product.nombre} 
                      className="w-14 h-14 rounded-xl object-cover bg-slate-950 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                          {item.product.sellerNombre}
                        </span>
                        {item.product.tarifaIvaPct === 5 && (
                          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                            5% IVA
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{item.product.nombre}</h4>
                      <p className="text-xs font-mono text-slate-300">
                        ${item.product.precioSinIva.toFixed(2)} USD / {item.product.unidad}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                        className="p-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold w-7 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                        className="p-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-amber-400">
                        ${(item.product.precioSinIva * item.cantidad).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-[11px] text-red-400 hover:underline mt-1 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Materiales:</span>
                    <span className="text-white font-bold">${cartTotals.subtotal.toFixed(2)} USD</span>
                  </div>
                  {cartTotals.totalIva5 > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>IVA Reducido Construcción (5%):</span>
                      <span className="text-emerald-400 font-bold">${cartTotals.totalIva5.toFixed(2)} USD</span>
                    </div>
                  )}
                  {cartTotals.totalIva15 > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>IVA General (15%):</span>
                      <span className="text-slate-300 font-bold">${cartTotals.totalIva15.toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Flete Pesado MTOP Sugerido:</span>
                    <span className="text-amber-400 font-bold">${cartTotals.fleteEstimado.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-base font-black pt-2 border-t border-slate-800 text-white">
                    <span>Inversión Total Estimada:</span>
                    <span className="text-amber-400">${cartTotals.total.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/modulos/compras"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl text-center shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    Pasar a Requisición de Obra ERP
                  </Link>
                  <button
                    onClick={() => {
                      alert(`Cotización Oficial Generada con Éxito por un Total de $${cartTotals.total.toFixed(2)} USD. Un asesor técnico de GRUPO SARA te contactará de inmediato.`);
                      setCartModalOpen(false);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl text-center border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Emitir Cotización PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LANDING PAGE DE COMPRAS: VITRINA DIRECTA DE PRODUCTOS                     */}
      {/* ========================================================================= */}
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-20">
        
        {/* BARRA SUPERIOR DE CABECERA: SARA-MARKETPLACE */}
        <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-2xl shadow-md shadow-amber-500/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-md">
                    SARA-MARKETPLACE
                  </span>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    • Vitrina de Compras Mayoristas B2B
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Catálogo de Materiales Directo de Fábrica
                </h1>
              </div>
            </div>

            {/* Acciones de la barra superior */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setSellerHubModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Building2 className="w-4 h-4" />
                <span>💼 Vende en SARA / Portal Proveedores</span>
              </button>

              <button
                onClick={() => setCartModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="font-bold">{cartItems.length}</span>
                <span className="text-slate-400 hidden md:inline">en pedido</span>
              </button>

              <Link
                href="/modulos/compras"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs rounded-xl border border-slate-800 hidden lg:flex items-center gap-1.5"
                title="Ir al ERP Interno de Obras y APU"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Modo ERP</span>
              </Link>
            </div>

          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: VITRINA DIRECTA (SIN SCROLL NI BLOQUES INTERMEDIOS) */}
        <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
          
          {/* COMPONENTE REACTIVO DE VITRINA Y PRODUCTOS */}
          <MarketplaceVitrinaSection
            productos={marketplaceProductos}
            sellers={sellersList}
            searchQuery={marketplaceSearch}
            setSearchQuery={setMarketplaceSearch}
            categoria={marketplaceCategoria}
            setCategoria={setMarketplaceCategoria}
            sellerId={marketplaceSellerId}
            setSellerId={setMarketplaceSellerId}
            planFiltro={marketplacePlanFiltro}
            setPlanFiltro={setMarketplacePlanFiltro}
            soloMasVendidos={marketplaceSoloMasVendidos}
            setSoloMasVendidos={setMarketplaceSoloMasVendidos}
            tarifaIva={marketplaceTarifaIva}
            setTarifaIva={setMarketplaceTarifaIva}
            onVerProducto={(prod) => setProductoParaVerDetalle(prod)}
            onAddToCart={(prod, cant) => handleAddToCart(prod, cant)}
            onOpenSellerHub={() => setSellerHubModalOpen(true)}
            cartItemsCount={cartItems.length}
          />

          {/* ========================================================================= */}
          {/* SECCIÓN INFERIOR: PLANES DE MEMBRESÍA PARA EMPRESAS PROVEEDORAS           */}
          {/* ========================================================================= */}
          <section className="pt-12 pb-6 border-t border-slate-800/80 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PLANES DE MEMBRESÍA SARA-MARKETPLACE
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Publica los Productos de tu Empresa en GRUPO SARA
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona tu plan para acceder a tu entorno exclusivo (Dashboard a pantalla completa con gestión de RUC, cuentas bancarias, QRs y catálogo vía Excel o API REST).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PLAN 1: VIP FÁBRICA */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/60 shadow-xl flex flex-col justify-between group hover:border-amber-400 transition-all">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg">
                  1º LUGAR EN VITRINA • RECOMENDADO
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Star className="w-5 h-5 fill-amber-400" />
                    </span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-lg">
                      1.8% Comisión
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">VIP Fábrica</h3>
                    <p className="text-xs text-slate-400">Grandes acerías, cementeras y canteras</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <strong>Máxima prioridad en la vitrina</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Conexión API REST ilimitada para ERP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Carga masiva Excel sin límites</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSellerHubModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Registrar Empresa VIP
                </button>
              </div>

              {/* PLAN 2: DISTRIBUIDOR PRO */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                      <Boxes className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-lg">
                      3.5% Comisión
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Distribuidor Pro</h3>
                    <p className="text-xs text-slate-400">Importadores mayoristas y distribuidoras</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Exposición secundaria prioritaria</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Subida de productos mediante archivo Excel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Historial completo de ventas y facturas</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSellerHubModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Registrar Distribuidor Pro
                </button>
              </div>

              {/* PLAN 3: FERRETERÍA BÁSICA */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Package className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      6.0% Comisión
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Ferretería Básica</h3>
                    <p className="text-xs text-slate-400">Comercios locales y ferreterías cantonales</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Posicionamiento estándar en vitrina</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Registro manual de insumos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cobros con cuenta bancaria SPI y QR</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSellerHubModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Registrar Ferretería Básica
                </button>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECCIÓN DE SEGURIDAD & GARANTÍAS                                         */}
          {/* ========================================================================= */}
          <section className="pt-8 pb-12 border-t border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Precios Directos de Planta</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sin sobreprecios de intermediarios en acero, cemento y áridos.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Percent className="w-4 h-4" />
                  <span>Tarifa 5% IVA</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Aplicación de la tarifa reducida para materiales de construcción (SRI).
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Truck className="w-4 h-4" />
                  <span>Fletes Pesados MTOP</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Despacho en volquetas 14m³ y plataformas 30T a pie de obra.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Fideicomiso Escrow</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pago protegido hasta la entrega conforme y fiscalización en bodega.
                </p>
              </div>
            </div>
          </section>

        </main>

      </div>
    </>
  );
}
