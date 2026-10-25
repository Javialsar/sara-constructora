'use client';

import React, { useState } from 'react';
import { 
  Search, 
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
  Clock, 
  ArrowUpDown, 
  Tag, 
  Boxes, 
  MapPin, 
  Zap,
  Flame,
  ChevronRight,
  SlidersHorizontal,
  BadgePercent,
  CheckCircle,
  Map,
  Navigation
} from 'lucide-react';
import { MarketplaceProduct, SellerProfile, SELLER_PLANS } from '@/lib/services/sellerMarketplaceService';
import { CANTONES_ECUADOR, CantonEcuador, CoordenadasGPS, GeoDistanceService } from '@/lib/services/geoDistanceService';
import UbicacionObraMapModal from './UbicacionObraMapModal';

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
  direccionExactaEntrega?: string;
  setDireccionExactaEntrega?: (dir: string) => void;
  coordenadasEntrega?: CoordenadasGPS;
  setCoordenadasEntrega?: (coords: CoordenadasGPS) => void;
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
  setOrdenarPorCercania,
  direccionExactaEntrega,
  setDireccionExactaEntrega,
  coordenadasEntrega,
  setCoordenadasEntrega
}: MarketplaceVitrinaSectionProps) {

  // Ordenamiento local y mapa
  const [ordenamiento, setOrdenamiento] = useState<'prioridad' | 'precio_asc' | 'precio_desc' | 'stock'>('prioridad');
  const [feedbackItemAgregado, setFeedbackItemAgregado] = useState<string | null>(null);
  const [detectandoGps, setDetectandoGps] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [direccionExacta, setDireccionExacta] = useState(
    direccionExactaEntrega || 'Av. Universitaria y 10 de Agosto, Frente a Obra'
  );
  const [coordsActuales, setCoordsActuales] = useState<CoordenadasGPS>(
    coordenadasEntrega || cantonSeleccionado.coordenadas
  );

  // Sincronizar estado local si vienen props externos
  React.useEffect(() => {
    if (direccionExactaEntrega) setDireccionExacta(direccionExactaEntrega);
  }, [direccionExactaEntrega]);

  React.useEffect(() => {
    if (coordenadasEntrega) setCoordsActuales(coordenadasEntrega);
  }, [coordenadasEntrega]);

  const handleDetectarGps = () => {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización.');
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
        setCantonSeleccionado(CANTONES_ECUADOR[3]); // Fallback Loja
      },
      { timeout: 8000 }
    );
  };

  const categorias = [
    { id: 'TODAS', label: 'Todo el Catálogo', icon: Boxes },
    { id: 'CEMENTO_HORMIGON', label: 'Cemento & Hormigón', icon: Warehouse },
    { id: 'ACERO', label: 'Acero & Hierro', icon: Layers },
    { id: 'ARIDOS_PETREOS', label: 'Áridos & Arena', icon: Package },
    { id: 'TUBERIAS_PLOMERIA', label: 'Tuberías & PVC', icon: Building2 },
    { id: 'ACABADOS', label: 'Acabados & Paneles', icon: Sparkles },
    { id: 'ELECTRICIDAD', label: 'Material Eléctrico', icon: Zap },
    { id: 'MAQUINARIA_EQUIPOS', label: 'Maquinaria', icon: Truck }
  ];

  // Tags populares de búsqueda
  const quickTags = [
    { label: '🔥 Cemento GU $7.90', query: 'Cemento' },
    { label: '⚡ Varilla 12mm $44.00', query: 'Varilla' },
    { label: '🧱 Bloque $0.52', query: 'Bloque' },
    { label: '💧 Tubo PVC 110mm', query: 'Tubo' },
    { label: '🏗️ Malla R-100', query: 'Malla' }
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
    return list;
  }, [productos, ordenamiento, ordenarPorCercania, cantonSeleccionado]);

  // Productos destacados para "Ofertas Relámpago de Fábrica"
  const ofertasRelampago = React.useMemo(() => {
    return productos.filter(p => p.esMasVendido || p.descuentosVolumen?.length).slice(0, 4);
  }, [productos]);

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
    setOrdenarPorCercania(false);
  };

  return (
    <div className="space-y-6 pb-24">

      {/* ===================================================================== */}
      {/* 1. FRANJA SUPERIOR DE CONFIANZA TEMU-STYLE (1-CLIC BENEFICIOS)          */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-2 px-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mx-auto sm:mx-0">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Despacho Pesado MTOP a tu Obra</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Pago Seguro 100% Escrow SARA</span>
          </span>
          <span className="flex items-center gap-1.5">
            <BadgePercent className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>IVA 5% Obra Calificado SRI</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Precios Directos de Planta y Mayoristas</span>
          </span>
        </div>

        <button
          onClick={onOpenSellerHub}
          className="hidden lg:flex items-center gap-1 px-3 py-1 bg-white/15 hover:bg-white/25 rounded-xl text-white font-bold transition-colors"
        >
          <span>¿Eres Proveedor? Vende en SARA</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. BARRA DE BÚSQUEDA ANCHA & GEOLOCALIZACIÓN DE OBRA                    */}
      {/* ===================================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          
          {/* Buscador Central Protagonista */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cemento, varilla 12mm, bloque, arena, tubería PVC, fábrica..."
              className="w-full pl-11 pr-10 py-3.5 bg-slate-950 border-2 border-amber-500/50 hover:border-amber-400 focus:border-amber-400 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-sans shadow-inner transition-colors"
            />
            <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toggle Rápido: Más Cercanos */}
          <button
            onClick={() => setOrdenarPorCercania(!ordenarPorCercania)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              ordenarPorCercania
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Más Cercanos a mi Obra</span>
            {ordenarPorCercania && <Check className="w-3.5 h-3.5" />}
          </button>

        </div>

        {/* ===================================================================== */}
        {/* BARRA: ENTREGAR MERCADERÍA EN: (DIRECCIÓN EXACTA + GPS + MAPA)       */}
        {/* ===================================================================== */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-2 border-t border-slate-800">
          
          {/* Campo de Dirección Exacta */}
          <div className="flex-1 flex items-center gap-2.5 bg-slate-950 border border-slate-800 focus-within:border-amber-400 rounded-2xl px-3.5 py-2 transition-colors">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <label 
                htmlFor="direccionEntregaInput"
                className="text-[10px] font-mono text-amber-400 font-black uppercase shrink-0 tracking-wider"
              >
                ENTREGAR MERCADERÍA EN:
              </label>
              <input
                id="direccionEntregaInput"
                type="text"
                value={direccionExacta}
                onChange={(e) => {
                  const val = e.target.value;
                  setDireccionExacta(val);
                  if (setDireccionExactaEntrega) setDireccionExactaEntrega(val);
                }}
                placeholder="Ingresa ciudad, calles principales, intersección o lote de obra..."
                className="flex-1 bg-transparent text-white font-medium text-xs placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selector de Cantón / Ciudad */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold hidden sm:inline">Ciudad:</span>
            <select
              value={cantonSeleccionado.id}
              onChange={(e) => {
                const found = CANTONES_ECUADOR.find(c => c.id === e.target.value);
                if (found) {
                  setCantonSeleccionado(found);
                  setCoordsActuales(found.coordenadas);
                  if (setCoordenadasEntrega) setCoordenadasEntrega(found.coordenadas);
                }
              }}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {CANTONES_ECUADOR.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.nombre} ({c.provincia})
                </option>
              ))}
            </select>
          </div>

          {/* Botones: 📍 GPS y 🗺️ MAPA GPS */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleDetectarGps}
              disabled={detectandoGps}
              title="Detectar GPS de mi dispositivo"
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 font-mono text-xs font-bold rounded-2xl border border-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <Navigation className={`w-3.5 h-3.5 ${detectandoGps ? 'animate-spin' : ''}`} />
              <span>{detectandoGps ? 'GPS...' : '📍 GPS'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMapModalOpen(true)}
              title="Abrir mapa interactivo para fijar la ubicación exacta con un clic"
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-mono text-xs font-black rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Map className="w-3.5 h-3.5 text-slate-950" />
              <span>🗺️ Mapa GPS</span>
            </button>
          </div>

        </div>

        {/* Tags Rápidos de Búsqueda */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-400 font-bold shrink-0 hidden sm:inline">Populares:</span>
          {quickTags.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(t.query)}
              className="px-3 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 whitespace-nowrap transition-colors font-medium"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. PÍLDORAS DE CATEGORÍAS TÁCTILES                                     */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categorias.map(cat => {
          const Icon = cat.icon;
          const isActive = categoria === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* 4. SECCIÓN TEMU: ⚡ OFERTAS RELÁMPAGO DE FÁBRICA                       */}
      {/* ===================================================================== */}
      {!searchQuery && categoria === 'TODAS' && (
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20">
                <Flame className="w-5 h-5 fill-slate-950" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>OFERTAS RELÁMPAGO DE FÁBRICA</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                    PRECIO DIRECTO
                  </span>
                </h2>
                <span className="text-xs text-slate-400">
                  Descuentos mayoristas aplicados directamente por los fabricantes certificados
                </span>
              </div>
            </div>

            <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Oferta por tiempo limitado</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {ofertasRelampago.map(p => {
              const precioFerreteriaRef = +(p.precioSinIva * 1.18).toFixed(2);
              const ahorroPct = Math.round(((precioFerreteriaRef - p.precioSinIva) / precioFerreteriaRef) * 100);
              const bodegaCoords = p.bodegaCoordenadas || { lat: -0.1807, lng: -78.4678 };
              const dist = GeoDistanceService.distanciaVialEcuadorKm(bodegaCoords, cantonSeleccionado.coordenadas);

              return (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 flex flex-col justify-between group transition-all hover:shadow-xl"
                >
                  <div className="space-y-2.5">
                    {/* Imagen con Badges de Ahorro */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                      <img
                        src={p.imagenUrl}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-md">
                        -{ahorroPct}%
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] font-mono text-amber-400 truncate border border-slate-800">
                        📍 {dist} km • {cantonSeleccionado.nombre}
                      </div>
                    </div>

                    {/* Título & Fabricante */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {p.sellerNombre}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {p.nombre}
                      </h4>
                    </div>

                    {/* Precios Estilo TEMU */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black font-mono text-amber-400">
                          ${p.precioSinIva.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-slate-500 line-through">
                          ${precioFerreteriaRef.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                        Ahorras ${(precioFerreteriaRef - p.precioSinIva).toFixed(2)} /{p.unidad}
                      </span>
                    </div>

                    {/* Barra de Progreso de Stock */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 block">
                        Stock en planta: <strong className="text-white">{p.stockDisponible} {p.unidad}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAgregarRapido(p)}
                    className="w-full mt-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {feedbackItemAgregado === p.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Pedir a Fábrica</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. CUADRÍCULA GENERAL DE MATERIALES (ESTILO TEMU LIMPIO Y RÁPIDO)      */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        
        {/* Encabezado de la cuadrícula con filtros secundarios */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">
              {categoria === 'TODAS' ? 'Todos los Materiales Disponibles' : `Categoría: ${categoria}`}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
              {productosOrdenados.length}
            </span>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-amber-400 hover:underline text-[11px] ml-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Ordenar por:</span>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="prioridad">★ Recomendados / Fábrica VIP</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="stock">Mayor Stock Disponible</option>
            </select>
          </div>
        </div>

        {/* Cuadrícula */}
        {productosOrdenados.length === 0 ? (
          <div className="p-16 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
            <Package className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No se encontraron materiales</h3>
              <p className="text-xs text-slate-400">Prueba con otra palabra clave o limpia los filtros aplicados.</p>
            </div>
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {productosOrdenados.map((prod) => {
              const precioFerreteriaRef = +(prod.precioSinIva * 1.15).toFixed(2);
              const ahorroPct = Math.round(((precioFerreteriaRef - prod.precioSinIva) / precioFerreteriaRef) * 100);
              const bodegaCoords = prod.bodegaCoordenadas || { lat: -0.1807, lng: -78.4678 };
              const dist = GeoDistanceService.distanciaVialEcuadorKm(bodegaCoords, cantonSeleccionado.coordenadas);
              const tiempo = GeoDistanceService.estimarTiempoTransporte(dist);
              const isVip = prod.sellerPlan === 'VIP_FABRICA' || prod.sellerPlan === 'VIP';

              return (
                <div
                  key={prod.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-3 flex flex-col justify-between group transition-all duration-200 hover:shadow-2xl"
                >
                  <div className="space-y-2.5">
                    
                    {/* Imagen Cuadrada 1:1 con Badges */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950">
                      <img
                        src={prod.imagenUrl}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Badge Plan / Fábrica */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase shadow-md ${
                          isVip ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                        }`}>
                          {isVip ? '★ FÁBRICA' : 'DISTRIBUIDOR'}
                        </span>
                        {ahorroPct > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-black text-[9px] shadow-md w-fit">
                            -{ahorroPct}%
                          </span>
                        )}
                      </div>

                      {/* Tarifa IVA 5% */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold shadow-md ${
                          prod.tarifaIvaPct === 5 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/90 text-slate-300'
                        }`}>
                          IVA {prod.tarifaIvaPct}%
                        </span>
                      </div>

                      {/* Insignia de Distancia en la Foto */}
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-sm rounded-xl px-2 py-1 text-[10px] font-mono flex items-center justify-between text-slate-200 border border-slate-800">
                        <span className="flex items-center gap-1 text-amber-400 font-bold truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>A {dist} km</span>
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {tiempo.esExpress ? '2h - 4h' : `${tiempo.tiempoHoras}h`}
                        </span>
                      </div>
                    </div>

                    {/* Nombre y Proveedor */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate font-medium">
                        {prod.sellerNombre}
                      </span>
                      <h3 className="font-bold text-xs text-white line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                        {prod.nombre}
                      </h3>
                    </div>

                    {/* Precios Grandes Estilo TEMU */}
                    <div className="pt-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black font-mono text-amber-400">
                          ${prod.precioSinIva.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-slate-500 line-through">
                          ${precioFerreteriaRef.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        por {prod.unidad} (c/IVA: ${(prod.precioSinIva * (1 + prod.tarifaIvaPct / 100)).toFixed(2)})
                      </span>
                    </div>

                    {/* Calificación y Compras */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{prod.calificacion}</span>
                      </span>
                      <span>{prod.ventasTotales} vendidos</span>
                    </div>

                  </div>

                  {/* Acciones */}
                  <div className="pt-3 space-y-1.5">
                    <button
                      onClick={() => handleAgregarRapido(prod)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 ${
                        feedbackItemAgregado === prod.id
                          ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      {feedbackItemAgregado === prod.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡En el Pedido!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Añadir</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onVerProducto(prod)}
                      className="w-full py-1 text-[10px] font-mono text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ficha Técnica INEN</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* 6. BARRA FLOTANTE DE PEDIDO INMEDIATO (BOTTOM CHECKOUT BAR)           */}
      {/* ===================================================================== */}
      {cartItemsCount > 0 && onOpenCartDrawer && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <div className="p-3 sm:p-4 bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-md shadow-amber-500/20 font-black">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-white block">
                  {cartItemsCount} {cartItemsCount === 1 ? 'material seleccionado' : 'materiales en tu lista'}
                </span>
                <span className="text-[11px] font-mono text-amber-400">
                  Entrega coordinada con SARA-FLETES en {cantonSeleccionado.nombre}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenCartDrawer}
              className="px-5 sm:px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Ver Pedido y Pagar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE MAPA INTERACTIVO OPENSTREETMAP PARA GEOLOCALIZAR LA ENTREGA */}
      {/* ===================================================================== */}
      <UbicacionObraMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        coordenadasIniciales={coordsActuales}
        direccionInicial={direccionExacta}
        cantonActual={cantonSeleccionado}
        onConfirmarUbicacion={({ coordenadas, direccion, canton }) => {
          setCoordsActuales(coordenadas);
          setDireccionExacta(direccion);
          setCantonSeleccionado(canton);
          setOrdenarPorCercania(true);
          if (setDireccionExactaEntrega) setDireccionExactaEntrega(direccion);
          if (setCoordenadasEntrega) setCoordenadasEntrega(coordenadas);
        }}
      />

    </div>
  );
}
