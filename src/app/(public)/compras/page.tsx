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
  Check
} from 'lucide-react';
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';
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
      <ModuloIntroSplash modulo="compras" />

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

      {/* CONTENIDO PRINCIPAL DE LA LANDING PAGE */}
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-20">
        
        {/* ========================================================================= */}
        {/* HERO SECTION DE COMPRAS / SARA-MARKETPLACE                                */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              
              {/* Columna Izquierda: Mensaje y Propuesta de Valor */}
              <div className="space-y-6 max-w-2xl">
                
                {/* Badge Corporativo */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-xs font-bold text-amber-400 shadow-lg backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="tracking-wider uppercase font-extrabold text-[11px]">SARA-MARKETPLACE 2026</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 font-semibold">Red Mayorista & Precios de Fábrica</span>
                </div>

                {/* Título Principal */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                  Suministro Directo de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">
                    Materiales de Construcción
                  </span>
                </h1>

                {/* Bajada */}
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal border-l-2 border-amber-500/80 pl-6">
                  Conexión directa entre fabricantes certificados (Adelca, Holcim, Novacero, Disensa) y contratistas en todo el Ecuador. Precios mayoristas sin intermediarios, tarifa 5% IVA de construcción, flete pesado MTOP geolocalizado y custodia en fideicomiso Escrow.
                </p>

                {/* Botones de Acción */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="#catalogo"
                    className="min-h-[48px] inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Explorar Catálogo Mayorista</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setSellerHubModalOpen(true)}
                    className="min-h-[48px] inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-amber-500/40 hover:border-amber-400 active:scale-[0.98] transition-all"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Vende en SARA / Portal Proveedores</span>
                  </button>

                  <Link
                    href="/modulos/compras"
                    className="min-h-[48px] inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs border border-slate-800 transition-all"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Ingresar al ERP de Obras & APU</span>
                  </Link>
                </div>

                {/* Carrito Flotante / Badge de Pedido */}
                {cartItems.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black text-xs">
                        {cartItems.length}
                      </div>
                      <span className="text-xs text-amber-200">
                        Tienes materiales en tu cotización por <strong className="text-white">${cartTotals.subtotal.toFixed(2)} USD</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setCartModalOpen(true)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                    >
                      Ver Pedido →
                    </button>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Tarjeta Visual de Garantía y Métricas */}
              <div className="w-full lg:w-96 space-y-4">
                <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      MÉTRICAS DEL ECOSISTEMA
                    </span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-white font-mono">38+</p>
                      <p className="text-[11px] text-slate-400 mt-1">Fabricantes y Canteras VIP</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-emerald-400 font-mono">-18.5%</p>
                      <p className="text-[11px] text-slate-400 mt-1">Ahorro Promedio en Obra</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-amber-400 font-mono">5% IVA</p>
                      <p className="text-[11px] text-slate-400 mt-1">Materiales Construcción SRI</p>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-cyan-400 font-mono">100%</p>
                      <p className="text-[11px] text-slate-400 mt-1">Custodia Fideicomiso Escrow</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Despacho en volquetas 14m³ y plataformas 30T</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ficha técnica INEN y certificado de calidad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Integración automática con análisis APU de obra</span>
                    </div>
                  </div>
                </div>

                {/* Banner Rápido para Vendedores */}
                <div 
                  onClick={() => setSellerHubModalOpen(true)}
                  className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        ¿Eres Fabricante o Ferretería Mayorista?
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Publica tu catálogo con comisión desde 1.8%
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: PLANES DE MEMBRESÍA PARA EMPRESAS PROVEEDORAS                  */}
        {/* ========================================================================= */}
        <section className="py-16 border-b border-slate-800/80 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MODELO DE MONETIZACIÓN & COMISIÓN GRUPO SARA
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Planes para Empresas, Fabricantes y Distribuidores
              </h2>
              <p className="text-sm text-slate-400">
                Selecciona tu plan para acceder a tu propio Dashboard con carga de catálogo vía Excel o API REST, facturación automatizada y cobro directo por cuentas bancarias o QRs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PLAN 1: VIP FÁBRICA */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/60 shadow-2xl flex flex-col justify-between group hover:border-amber-400 transition-all">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg">
                  MÁXIMA EXPOSICIÓN • PLAN RECOMENDADO
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                      <Star className="w-6 h-6 fill-amber-400" />
                    </span>
                    <span className="text-xs font-mono font-black px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg">
                      1.8% Comisión
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">VIP Fábrica</h3>
                    <p className="text-xs text-slate-400 mt-1">Grandes acerías, cementeras y canteras directas</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <strong>1ª Posición priorizada en la vitrina</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Conexión API REST ilimitada para ERP</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Carga masiva Excel sin límite de SKUs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Dispersión inmediata en Fideicomiso Escrow</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSellerHubModalOpen(true)}
                  className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Registrar con Plan VIP
                </button>
              </div>

              {/* PLAN 2: DISTRIBUIDOR PRO */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl">
                      <Boxes className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-mono font-black px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-lg">
                      3.5% Comisión
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Distribuidor Pro</h3>
                    <p className="text-xs text-slate-400 mt-1">Importadores mayoristas y centros de distribución</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Exposición secundaria en vitrina general</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Subida de productos mediante archivo Excel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Historial completo de ventas y facturas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Cobros con cuenta bancaria SPI y QR</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSellerHubModalOpen(true)}
                  className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Registrar Distribuidor Pro
                </button>
              </div>

              {/* PLAN 3: FERRETERÍA BÁSICA */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                      <Package className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-mono font-black px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      6.0% Comisión
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Ferretería Básica</h3>
                    <p className="text-xs text-slate-400 mt-1">Ferreterías cantonales y comercios locales</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Posicionamiento estándar en vitrina</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Registro manual de insumos y materiales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cobros bancarios y billeteras móviles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Perfil de empresa con RUC y logotipo</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSellerHubModalOpen(true)}
                  className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Registrar Ferretería Básica
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: CATÁLOGO Y VITRINA PRIORIZADA (ID: catalogo)                    */}
        {/* ========================================================================= */}
        <section id="catalogo" className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                <ShoppingCart className="w-4 h-4" />
                <span>CATÁLOGO MAYORISTA OFICIAL</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mt-1">
                Vitrina de Materiales con Precios Directos
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Productos organizados según el plan de cada fabricante: VIP Fábrica, Distribuidor Pro y Ferretería Básica.
              </p>
            </div>

            {/* Accesos Rápidos */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCartModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>Mi Pedido ({cartItems.length})</span>
              </button>

              <button
                onClick={() => setSellerHubModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>💼 Portal Empresas & Venta</span>
              </button>
            </div>
          </div>

          {/* COMPONENTE REACTIVO DE VITRINA Y FILTROS */}
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

        </section>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: PILARES DE SEGURIDAD & LOGÍSTICA SARA                           */}
        {/* ========================================================================= */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-900/60">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                GARANTÍA TOTAL GRUPO SARA
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                ¿Por Qué Comprar a Través de SARA-MARKETPLACE?
              </h2>
              <p className="text-sm text-slate-400">
                Diseñado por ingenieros civiles y fiscalizadores para eliminar sobreprecios, demoras de acarreo y riesgos tributarios en Ecuador.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Precios Directos de Planta</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eliminamos hasta 3 niveles de intermediarios. Cotiza acero, cemento y hormigón con precio de fábrica certificado.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
                  <Percent className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Tarifa 5% IVA de Construcción</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aplicación estricta de la Resolución SRI NAC-DGERCGC24-00000013 para insumos de obra civil en todo el territorio nacional.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl w-fit">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Fletes Pesados MTOP</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cálculo volumétrico automático en volquetas 14m³ y mulas 30T con seguimiento satelital GPS hasta pie de obra.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Fideicomiso Escrow</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tus fondos quedan custodiados de forma segura y solo se dispersan al vendedor una vez firmada el Acta de Entrega Conforme.
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
