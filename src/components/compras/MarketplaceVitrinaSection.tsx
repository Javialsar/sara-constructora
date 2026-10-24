'use client';

import React, { useState } from 'react';
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
  Warehouse,
  Check,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  Tag,
  Boxes,
  HelpCircle,
  ChevronRight,
  Info,
  SlidersHorizontal,
  MapPin,
  Zap
} from 'lucide-react';
import { MarketplaceProduct, SellerProfile, SELLER_PLANS } from '@/lib/services/sellerMarketplaceService';
import { CANTONES_ECUADOR, CantonEcuador, GeoDistanceService } from '@/lib/services/geoDistanceService';

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
  cartItems?: { product: MarketplaceProduct; cantidad: number }[];
  onOpenCartDrawer?: () => void;
  cantonSeleccionado: CantonEcuador;
  setCantonSeleccionado: (c: CantonEcuador) => void;
  ordenarPorCercania: boolean;
  setOrdenarPorCercania: (val: boolean) => void;
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
  cartItemsCount,
  cartItems = [],
  onOpenCartDrawer,
  cantonSeleccionado,
  setCantonSeleccionado,
  ordenarPorCercania,
  setOrdenarPorCercania
}: MarketplaceVitrinaSectionProps) {

  // Ordenamiento local
  const [ordenamiento, setOrdenamiento] = useState<'prioridad' | 'precio_asc' | 'precio_desc' | 'stock'>('prioridad');
  const [feedbackItemAgregado, setFeedbackItemAgregado] = useState<string | null>(null);
  const [detectandoGps, setDetectandoGps] = useState(false);

  const handleDetectarGps = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setDetectandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const masCercano = GeoDistanceService.encontrarCantonMasCercano(coords);
        setCantonSeleccionado(masCercano);
        setOrdenarPorCercania(true);
        setDetectandoGps(false);
      },
      (err) => {
        setDetectandoGps(false);
        // Fallback a Loja si el usuario rechaza
        setCantonSeleccionado(CANTONES_ECUADOR[3]);
      },
      { timeout: 8000 }
    );
  };

  const categorias = [
    { id: 'TODAS', label: 'Todas las Categorías', icon: Boxes },
    { id: 'ACERO', label: 'Acero & Metales', icon: Layers },
    { id: 'CEMENTO_HORMIGON', label: 'Cemento & Hormigón', icon: Warehouse },
    { id: 'ARIDOS_PETREOS', label: 'Áridos de Cantera', icon: Package },
    { id: 'ACABADOS', label: 'Acabados & Pinturas', icon: Sparkles },
    { id: 'TUBERIAS_PLOMERIA', label: 'Tuberías & Plomería', icon: Building2 },
    { id: 'ELECTRICIDAD', label: 'Material Eléctrico', icon: ZapIcon },
    { id: 'MAQUINARIA_EQUIPOS', label: 'Maquinaria & Equipos', icon: Truck }
  ];

  function ZapIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    );
  }

  // Tags rápidos de búsqueda
  const quickTags = [
    { label: 'Varilla fy=4200 Ø12mm', query: 'Varilla 12mm' },
    { label: 'Cemento GU 50kg', query: 'Cemento' },
    { label: 'Malla Electrosoldada', query: 'Malla' },
    { label: 'Bloque Prensado 15x20x40', query: 'Bloque' },
    { label: 'Tubo Desagüe 110mm', query: 'Tubo 110' }
  ];

  // Aplicar ordenamiento
  const productosOrdenados = React.useMemo(() => {
    let list = [...productos];
    if (ordenarPorCercania) {
      return list.sort((a, b) => {
        const coordsA = a.bodegaCoordenadas || { lat: -0.1807, lng: -78.4678 };
        const coordsB = b.bodegaCoordenadas || { lat: -0.1807, lng: -78.4678 };
        const distA = GeoDistanceService.distanciaVialEcuadorKm(coordsA, cantonSeleccionado.coordenadas);
        const distB = GeoDistanceService.distanciaVialEcuadorKm(coordsB, cantonSeleccionado.coordenadas);
        return distA - distB;
      });
    }
    if (ordenamiento === 'precio_asc') {
      return list.sort((a, b) => a.precioSinIva - b.precioSinIva);
    }
    if (ordenamiento === 'precio_desc') {
      return list.sort((a, b) => b.precioSinIva - a.precioSinIva);
    }
    if (ordenamiento === 'stock') {
      return list.sort((a, b) => b.stockDisponible - a.stockDisponible);
    }
    return list; // Por defecto ya viene ordenado por Jerarquía VIP -> Pro -> Básico
  }, [productos, ordenamiento, ordenarPorCercania, cantonSeleccionado]);

  const handleAgregarRapido = (prod: MarketplaceProduct) => {
    onAddToCart(prod, 1);
    setFeedbackItemAgregado(prod.id);
    setTimeout(() => {
      setFeedbackItemAgregado(null);
    }, 1500);
  };

  const hayFiltrosActivos = searchQuery || categoria !== 'TODAS' || sellerId !== 'TODOS' || planFiltro !== 'TODOS' || soloMasVendidos || tarifaIva !== undefined;

  const limpiarFiltros = () => {
    setSearchQuery('');
    setCategoria('TODAS');
    setSellerId('TODOS');
    setPlanFiltro('TODOS');
    setSoloMasVendidos(false);
    setTarifaIva(undefined);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ===================================================================== */}
      {/* 1. HERO BANNER DE ALTO IMPACTO CORPORATIVO (WORLD-CLASS B2B MARKETPLACE) */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 md:p-10">
        
        {/* Glow ambiental de fondo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-3xl">
            {/* Badges de Certificación y Cumplimiento Normativo */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                SARA MARKETPLACE B2B
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                IVA 5% Calificado SRI Res. NAC-DGERCGC24-00000013
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Truck className="w-3.5 h-3.5" />
                Despacho MTOP Nacional
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance">
              Materiales de Construcción con <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Precios de Fábrica</span> & Mayoristas
            </h1>

            {/* Subtítulo descriptivo con los nuevos porcentajes de comisión */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl text-pretty">
              Conexión directa entre plantas industriales, distribuidores certificados y obras civiles en todo el Ecuador. Adquisiciones blindadas mediante <strong className="text-amber-400 font-bold">Fideicomiso Escrow SARA</strong>, cubicación de carga pesada y prioridad por membresía: 
              <span className="text-amber-300 font-semibold ml-1">1º VIP Fábrica (15%)</span>, 
              <span className="text-sky-300 font-semibold ml-1">2º Empresarial Pro (10%)</span> y 
              <span className="text-emerald-300 font-semibold ml-1">3º Ferreterías (8%)</span>.
            </p>

            {/* Micro KPIs de Confianza para Compradores y Constructoras */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">AHORRO TRIBUTARIO</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">5% IVA Obra</span>
                <p className="text-[10px] text-slate-400 mt-0.5">vs 15% tarifa estándar</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">BLINDAJE FINANCIERO</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">100% Escrow</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Pago retenido hasta bodega</p>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">CUBICACIÓN Y LOGÍSTICA</span>
                <span className="text-base sm:text-lg font-black text-sky-400 font-mono">24h - 48h MTOP</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Volquetas, mulas y plataformas</p>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas del Proveedor / Pedido */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-72">
            <button
              onClick={onOpenSellerHub}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-slate-950 text-amber-400 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-950 font-black text-xs uppercase tracking-tight">Portal Vendedores</span>
                  <span className="block text-[10px] text-slate-900 font-mono font-bold">Publicar Catálogo & Fichas</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {cartItemsCount > 0 && onOpenCartDrawer && (
              <button
                onClick={onOpenCartDrawer}
                className="w-full p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span>Ver Pedido de Obra</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-blue-600 text-xs font-black">
                  {cartItemsCount} {cartItemsCount === 1 ? 'ítem' : 'ítems'}
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. CONSOLA ENTERPRISE DE BÚSQUEDA, FILTROS Y CATEGORÍAS                 */}
      {/* ===================================================================== */}
      <div className="bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        
        {/* BARRA DE GEOCERCANÍA & UBICACIÓN DE OBRA */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                UBICACIÓN DE TU OBRA / DESCARGA:
              </span>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <select
                  value={cantonSeleccionado.id}
                  onChange={(e) => {
                    const found = CANTONES_ECUADOR.find(c => c.id === e.target.value);
                    if (found) setCantonSeleccionado(found);
                  }}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {CANTONES_ECUADOR.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.provincia}) - {c.region}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleDetectarGps}
                  disabled={detectandoGps}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-mono text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <span>{detectandoGps ? 'Detectando...' : '📍 Detectar mi GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOrdenarPorCercania(!ordenarPorCercania)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                ordenarPorCercania
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Más Cercanos a mi Obra</span>
              {ordenarPorCercania && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Fila Principal: Buscador + Dropdowns de Filtrado */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Input de Búsqueda Principal */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar varilla, cemento, áridos, tubería, SKU, marca..."
              className="w-full pl-10 pr-9 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-2xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Empresa Proveedora */}
          <div className="md:col-span-3">
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="w-full py-3 px-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-2xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value="TODOS">🏢 Todos los Fabricantes</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombreComercial} ({s.plan === 'VIP_FABRICA' || s.plan === 'VIP' ? '★ VIP' : s.plan === 'ESTANDAR_PRO' || s.plan === 'EMPRESARIAL' ? 'Pro' : 'Básico'})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Nivel de Membresía */}
          <div className="md:col-span-2">
            <select
              value={planFiltro}
              onChange={(e) => setPlanFiltro(e.target.value)}
              className="w-full py-3 px-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-2xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value="TODOS">⭐ Todos los Planes</option>
              <option value="VIP_FABRICA">★ VIP Fábrica (15%)</option>
              <option value="ESTANDAR_PRO">Empresarial Pro (10%)</option>
              <option value="BASICO_FERRETERIA">Básico Ferretería (8%)</option>
            </select>
          </div>

          {/* Filtro por Tarifa IVA SRI */}
          <div className="md:col-span-2">
            <select
              value={tarifaIva === undefined ? 'TODOS' : tarifaIva.toString()}
              onChange={(e) => setTarifaIva(e.target.value === 'TODOS' ? undefined : parseInt(e.target.value))}
              className="w-full py-3 px-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-2xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
            >
              <option value="TODOS">🧾 Cualquier IVA</option>
              <option value="5">IVA 5% (Material Calificado SRI)</option>
              <option value="15">IVA 15% (Tarifa General)</option>
            </select>
          </div>
        </div>

        {/* Fila de Tags Rápidos de Búsqueda */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Frecuentes:
          </span>
          {quickTags.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(t.query)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Fila de Categorías & Ordenamiento */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Scroll Horizontal de Píldoras de Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
            {categorias.map(cat => {
              const Icon = cat.icon;
              const isActive = categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap font-bold flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filtro Más Vendidos & Selector de Orden */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSoloMasVendidos(!soloMasVendidos)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border shrink-0 ${
                soloMasVendidos
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-black'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${soloMasVendidos ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
              <span>Más Vendidos</span>
            </button>

            <div className="relative shrink-0">
              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value as any)}
                className="py-2 pl-3 pr-8 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="prioridad">⭐ Prioridad Fábrica VIP</option>
                <option value="precio_asc">Menor Precio</option>
                <option value="precio_desc">Mayor Precio</option>
                <option value="stock">Mayor Stock en Bodega</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-xl border border-rose-500/30 transition-colors"
                title="Limpiar todos los filtros"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. BARRA DE ESTADO & CONTADOR DE RESULTADOS                            */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono px-1">
        <div className="flex items-center gap-2 text-slate-400">
          <span>Mostrando <strong className="text-white font-bold">{productosOrdenados.length}</strong> materiales certificados</span>
          {hayFiltrosActivos && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
              Filtros activos
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Normas NTE INEN / ASTM Verificadas
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">
            Flete calculado automáticamente con factor de sinuosidad 1.35
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CUADRÍCULA DE PRODUCTOS (HIGH-END B2B CARDS)                       */}
      {/* ===================================================================== */}
      {productosOrdenados.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              No se encontraron materiales con los filtros seleccionados
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Intenta cambiar la categoría, el proveedor o eliminar los términos de búsqueda aplicados.
            </p>
          </div>
          <button
            onClick={limpiarFiltros}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20"
          >
            Limpiar Filtros y Ver Todo el Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosOrdenados.map((prod) => {
            const plan = SELLER_PLANS[prod.sellerPlan] || SELLER_PLANS['BASICO_FERRETERIA'];
            const isVip = prod.sellerPlan === 'VIP_FABRICA' || prod.sellerPlan === 'VIP';
            const isPro = prod.sellerPlan === 'ESTANDAR_PRO' || prod.sellerPlan === 'EMPRESARIAL';
            const precioTotalConIva = prod.precioSinIva * (1 + prod.tarifaIvaPct / 100);
            const bodegaCoords = prod.bodegaCoordenadas || { lat: -0.1807, lng: -78.4678 };
            const distVial = GeoDistanceService.distanciaVialEcuadorKm(bodegaCoords, cantonSeleccionado.coordenadas);
            const tiempoEst = GeoDistanceService.estimarTiempoTransporte(distVial);

            return (
              <div 
                key={prod.id}
                className={`group relative bg-slate-900/90 hover:bg-slate-900 rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between ${
                  isVip 
                    ? 'border-amber-500/40 hover:border-amber-400 shadow-amber-500/5' 
                    : isPro 
                    ? 'border-sky-500/30 hover:border-sky-400 shadow-sky-500/5'
                    : 'border-slate-800 hover:border-slate-700 shadow-slate-950/50'
                }`}
              >
                <div>
                  {/* IMAGEN Y BADGES FLOTANTES */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img 
                      src={prod.imagenUrl} 
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Badge del Plan de Membresía */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
                        isVip 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950' 
                          : isPro 
                          ? 'bg-sky-500 text-white font-bold' 
                          : 'bg-emerald-600 text-white font-bold'
                      }`}>
                        ★ {isVip ? 'VIP Fábrica' : isPro ? 'Empresarial Pro' : 'Ferretería'}
                      </span>
                      {prod.esMasVendido && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md w-fit">
                          <Star className="w-2.5 h-2.5 fill-slate-950" />
                          Más Vendido
                        </span>
                      )}
                    </div>

                    {/* Tarifa IVA SRI Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black shadow-lg ${
                        prod.tarifaIvaPct === 5
                          ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                          : 'bg-slate-950/90 text-slate-200 border border-slate-700'
                      }`}>
                        IVA {prod.tarifaIvaPct}% {prod.tarifaIvaPct === 5 ? '✓ SRI' : ''}
                      </span>
                    </div>

                    {/* Fila Inferior de Imagen: Fabricante y Valoración */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10">
                      <span className="font-bold truncate text-[11px] flex items-center gap-1.5 text-slate-200 bg-slate-950/80 px-2 py-1 rounded-lg backdrop-blur-sm border border-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{prod.sellerNombre}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg text-amber-400 backdrop-blur-sm border border-slate-800">
                        ★ {prod.calificacion}
                      </span>
                    </div>
                  </div>

                  {/* CUERPO PRINCIPAL DEL PRODUCTO */}
                  <div className="p-5 space-y-4">
                    
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        <span>{prod.categoria.replace('_', ' ')}</span>
                        {prod.especificacionesTecnicas?.normaInen && (
                          <span className="text-amber-400/90 truncate max-w-[150px]">
                            {prod.especificacionesTecnicas.normaInen}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {prod.nombre}
                      </h3>
                    </div>

                    {/* CAJA DE PRECIOS ENTERPRISE */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-mono text-slate-400">PRECIO UNITARIO:</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">Sin IVA</span>
                      </div>
                      
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black font-mono text-white tracking-tight">
                          ${prod.precioSinIva.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          / {prod.unidad}
                        </span>
                      </div>

                      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Total inc. IVA:</span>
                        <span className="font-bold text-slate-200">${precioTotalConIva.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Descuento por Volumen (Si existe) */}
                    {prod.descuentosVolumen && prod.descuentosVolumen.length > 0 && (
                      <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] font-mono text-amber-400 flex items-center justify-between">
                        <span>Mayorista: desde {prod.descuentosVolumen[0].desdeCantidad} {prod.unidad.split(' ')[0]}</span>
                        <span className="font-black">${prod.descuentosVolumen[0].precioUnitario.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Distancia y Tiempo de Despacho a la Obra */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold truncate max-w-[170px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">A {distVial} km ({cantonSeleccionado.nombre})</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tiempoEst.esExpress ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400'
                      }`}>
                        {tiempoEst.esExpress ? 'Express 2h-4h' : `${tiempoEst.tiempoHoras}h`}
                      </span>
                    </div>

                    {/* Metadatos Logísticos & Stock */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Warehouse className="w-3.5 h-3.5 text-slate-500" />
                        <span>Stock: <strong className="text-white">{prod.stockDisponible}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sky-400 justify-end">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{prod.tiempoEntregaHoras}h a obra</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* BOTONES DE ACCIÓN DE LA TARJETA */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onVerProducto(prod)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ficha Técnica</span>
                  </button>

                  <button
                    onClick={() => handleAgregarRapido(prod)}
                    className={`py-2.5 px-3 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      feedbackItemAgregado === prod.id
                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                    }`}
                  >
                    {feedbackItemAgregado === prod.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Pedir</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. BARRA FLOTANTE DE PEDIDO / REQUISICIÓN DE OBRA                      */}
      {/* ===================================================================== */}
      {cartItemsCount > 0 && onOpenCartDrawer && (
        <aside 
          aria-label="Resumen de Requisición de Obra"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 p-4 rounded-3xl shadow-2xl shadow-slate-950/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {cartItemsCount} {cartItemsCount === 1 ? 'material seleccionado' : 'materiales seleccionados'} para obra
              </span>
              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Custodia garantizada vía Fideicomiso Escrow
              </span>
            </div>
          </div>

          <button
            onClick={onOpenCartDrawer}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <span>Revisar Requisición</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </aside>
      )}

    </div>
  );
}
