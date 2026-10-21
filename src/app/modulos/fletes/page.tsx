'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  DollarSign, 
  Loader2, 
  CheckCircle, 
  Package, 
  ArrowRight,
  ArrowUpDown,
  Crosshair,
  Route,
  Clock,
  ShieldCheck,
  Sparkles,
  UserCheck,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Zap,
  Sliders,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';
import { 
  createFletesSolicitud, 
  updateFletesSolicitudStatus,
  createFletesReservaRenta 
} from '@/lib/fletes-data';
import { 
  CategoriaVehiculo, 
  CATALOGO_VEHICULOS_SARA, 
  SaraFreightPricingService, 
  ResultadoTarifaFlete,
  ResultadoRentaTemporal
} from '@/lib/services/saraFreightPricingService';
import { 
  SaraFreightRoutingService, 
  GeocodedPoint, 
  RutaVialCalculada 
} from '@/lib/services/saraFreightRoutingService';
import type { VehiculoMapa } from '@/components/fletes/SaraFletesMap';

// Carga dinámica del mapa de Leaflet sin SSR para evitar errores de renderizado
const SaraFletesMap = dynamic(() => import('@/components/fletes/SaraFletesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
      <span className="text-sm font-semibold tracking-wide">Cargando Red Satelital y Vial SARA...</span>
    </div>
  )
});

interface FreightRequest {
  id: string;
  origin: string;
  destination: string;
  material: string;
  weight: number;
  vehicleType: CategoriaVehiculo;
  referencePrice: number;
  status: 'searching' | 'negotiating' | 'accepted';
  accessCode?: string;
  distanciaKm?: number;
  duracionMinutos?: number;
}

interface ReservaRentaConfirmada {
  id: string;
  vehiculoNombre: string;
  duracionTexto: string;
  conChofer: boolean;
  tarifaTotal: number;
  depositoGarantia: number;
  pinDesbloqueo: string;
  lugarEntrega: string;
}

export default function SaraFletesEngine() {
  const [viewMode, setViewMode] = useState<'constructor' | 'driver'>('constructor');
  const [serviceType, setServiceType] = useState<'flete' | 'renta'>('flete');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // 1. Geolocalización en tiempo real
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);

  // 2. Coordenadas y Puntos de Carga / Descarga para Flete
  const [originText, setOriginText] = useState('MAtecons Chile, Cariamanga');
  const [destinationText, setDestinationText] = useState('El Dorado, Cariamanga');
  const [originPoint, setOriginPoint] = useState<GeocodedPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<GeocodedPoint | null>(null);
  const [rutaCalculada, setRutaCalculada] = useState<RutaVialCalculada | null>(null);

  // Candados y estado interactivo de mapa para evitar desfasaje y saltos
  const originLockedByMapRef = useRef<boolean>(false);
  const destLockedByMapRef = useRef<boolean>(false);
  const [mapClickMode, setMapClickMode] = useState<'origen' | 'destino' | null>(null);

  // 3. Parámetros de la Carga (Flete) y Subasta inDrive
  const [vehicleType, setVehicleType] = useState<CategoriaVehiculo>('PICKUP_1T');
  const [material, setMaterial] = useState('Otros Materiales');
  const [weight, setWeight] = useState<number>(1);
  const [tarifaEstimada, setTarifaEstimada] = useState<ResultadoTarifaFlete | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // 4. Parámetros de Renta Temporal (Uber Rent / Por Horas o Días)
  const [rentaDuracionTipo, setRentaDuracionTipo] = useState<'HORAS' | 'DIAS'>('HORAS');
  const [rentaDuracionValor, setRentaDuracionValor] = useState<number>(4);
  const [rentaConChofer, setRentaConChofer] = useState<boolean>(true);
  const [rentaClienteNombre, setRentaClienteNombre] = useState('Ing. Residente de Obra');
  const [rentaClienteTelefono, setRentaClienteTelefono] = useState('0991234567');
  const [rentaLugarEntrega, setRentaLugarEntrega] = useState('Ferretería Central / Obra Cariamanga');
  const [cotizacionRenta, setCotizacionRenta] = useState<ResultadoRentaTemporal | null>(null);
  const [reservaRentaActiva, setReservaRentaActiva] = useState<ReservaRentaConfirmada | null>(null);
  const [isProcessingRenta, setIsProcessingRenta] = useState(false);

  // 5. Estados de negociación y despacho
  const [activeFreight, setActiveFreight] = useState<FreightRequest | null>(null);
  const [counterOffer, setCounterOffer] = useState<string>('');

  // Generador de código PIN de entrega segura
  const generateAccessCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Detección inicial de GPS del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setGpsLoading(false);
        },
        (err) => {
          console.warn('Geolocalización en modo referencial:', err.message);
          setUserLocation([-4.3285, -79.5560]);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation([-4.3285, -79.5560]);
      setGpsLoading(false);
    }
  }, []);

  // Flota de vehículos zonificados alrededor de la zona de operación
  const vehiculosZonificados = useMemo<VehiculoMapa[]>(() => {
    const centerLat = originPoint?.lat || userLocation?.[0] || -4.3285;
    const centerLng = originPoint?.lng || userLocation?.[1] || -79.5560;

    return [
      {
        id: 'FLT-VEH-01',
        nombreChofer: 'Manuel Cárdenas',
        placa: 'LBA-3421',
        tipoVehiculo: 'PICKUP_1T',
        lat: +(centerLat + 0.0035).toFixed(5),
        lng: +(centerLng - 0.0028).toFixed(5),
        rating: 4.9,
        telefono: '0993849182',
        disponible: true
      },
      {
        id: 'FLT-VEH-02',
        nombreChofer: 'Carlos Mendoza',
        placa: 'PBA-1234',
        tipoVehiculo: 'CAMION_5T',
        lat: +(centerLat - 0.0042).toFixed(5),
        lng: +(centerLng + 0.0031).toFixed(5),
        rating: 4.8,
        telefono: '0984710293',
        disponible: true
      },
      {
        id: 'FLT-VEH-03',
        nombreChofer: 'Luis Toapanta',
        placa: 'GCA-9876',
        tipoVehiculo: 'FURGON_3T',
        lat: +(centerLat + 0.0021).toFixed(5),
        lng: +(centerLng + 0.0045).toFixed(5),
        rating: 4.7,
        telefono: '0961128472',
        disponible: true
      },
      {
        id: 'FLT-VEH-04',
        nombreChofer: 'Jorge Encalada',
        placa: 'UBA-5512',
        tipoVehiculo: 'VOLQUETA_V3A',
        lat: +(centerLat - 0.0055).toFixed(5),
        lng: +(centerLng - 0.0038).toFixed(5),
        rating: 4.9,
        telefono: '0991204857',
        disponible: true
      },
      {
        id: 'FLT-VEH-05',
        nombreChofer: 'Marco Vinicio Guamán',
        placa: 'LBB-4321',
        tipoVehiculo: 'TRACTO_3S3',
        lat: +(centerLat + 0.0065).toFixed(5),
        lng: +(centerLng - 0.0072).toFixed(5),
        rating: 5.0,
        telefono: '0998273641',
        disponible: true
      }
    ];
  }, [originPoint, userLocation]);

  // Recalcular Cotización de Renta Temporal
  useEffect(() => {
    const cot = SaraFreightPricingService.calcularRentaTemporal(
      vehicleType,
      rentaDuracionTipo,
      rentaDuracionValor,
      rentaConChofer
    );
    setCotizacionRenta(cot);
  }, [vehicleType, rentaDuracionTipo, rentaDuracionValor, rentaConChofer]);

  // Función para Geocodificar y Trazar la Ruta más corta
  const resolverRutaYTarifa = useCallback(async (
    origenTxt: string,
    destinoTxt: string,
    vehiculo: CategoriaVehiculo,
    peso: number,
    mat: string
  ) => {
    setIsCalculatingRoute(true);
    try {
      let puntoOrig = originPoint;
      if (!originLockedByMapRef.current || !puntoOrig) {
        puntoOrig = await SaraFreightRoutingService.geocodificarDireccion(
          origenTxt,
          userLocation || undefined
        );
        if (puntoOrig) setOriginPoint(puntoOrig);
      }

      let puntoDest = destinationPoint;
      if (!destLockedByMapRef.current || !puntoDest) {
        puntoDest = await SaraFreightRoutingService.geocodificarDireccion(
          destinoTxt,
          puntoOrig ? [puntoOrig.lat, puntoOrig.lng] : userLocation || undefined
        );
        if (puntoDest) setDestinationPoint(puntoDest);
      }

      if (puntoOrig && puntoDest) {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(puntoOrig, puntoDest);
        setRutaCalculada(ruta);

        const tarifa = SaraFreightPricingService.calcularTarifa(
          ruta.distanciaKm,
          peso,
          vehiculo,
          mat
        );
        setTarifaEstimada(tarifa);
        setProposedPrice(tarifa.tarifaSugeridaUSD);
      } else {
        const distAprox = 1.8;
        const tarifa = SaraFreightPricingService.calcularTarifa(distAprox, peso, vehiculo, mat);
        setTarifaEstimada(tarifa);
        setProposedPrice(tarifa.tarifaSugeridaUSD);
      }
    } catch (err) {
      console.error('Error calculando ruta o tarifa:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [userLocation, originPoint, destinationPoint]);

  useEffect(() => {
    if (originText && destinationText && serviceType === 'flete') {
      const timer = setTimeout(() => {
        resolverRutaYTarifa(originText, destinationText, vehicleType, weight, material);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [originText, destinationText, vehicleType, weight, material, serviceType, resolverRutaYTarifa]);

  // Intercambiar Ruta (Origen ⇅ Destino)
  const handleSwapRoute = () => {
    const prevOriginText = originText;
    const prevDestText = destinationText;
    const prevOriginPoint = originPoint;
    const prevDestPoint = destinationPoint;

    originLockedByMapRef.current = false;
    destLockedByMapRef.current = false;

    setOriginText(prevDestText);
    setDestinationText(prevOriginText);
    setOriginPoint(prevDestPoint);
    setDestinationPoint(prevOriginPoint);
  };

  const handleUsarMiUbicacionComoOrigen = () => {
    if (userLocation) {
      originLockedByMapRef.current = true;
      setOriginPoint({
        nombre: 'Mi Ubicación Actual (GPS)',
        lat: userLocation[0],
        lng: userLocation[1]
      });
      setOriginText('Mi Ubicación Actual (GPS)');
    }
  };

  // Manejador de arrastre manual de Punto de Carga (Origen)
  const handleOriginDragEnd = async (lat: number, lng: number) => {
    originLockedByMapRef.current = true;
    const exactLat = +lat.toFixed(5);
    const exactLng = +lng.toFixed(5);
    const newPoint: GeocodedPoint = {
      nombre: `Punto exacto (${exactLat}, ${exactLng})`,
      lat: exactLat,
      lng: exactLng
    };
    setOriginPoint(newPoint);

    if (destinationPoint) {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(newPoint, destinationPoint);
        setRutaCalculada(ruta);
        const tarifa = SaraFreightPricingService.calcularTarifa(
          ruta.distanciaKm,
          weight,
          vehicleType,
          material
        );
        setTarifaEstimada(tarifa);
        setProposedPrice(tarifa.tarifaSugeridaUSD);
      } catch (err) {
        console.error('Error recalculando ruta al arrastrar origen:', err);
      } finally {
        setIsCalculatingRoute(false);
      }
    }

    SaraFreightRoutingService.reverseGeocodificar(exactLat, exactLng).then((dir) => {
      if (dir) {
        setOriginText(dir);
      } else {
        setOriginText(`Coord: ${exactLat}, ${exactLng}`);
      }
    });
  };

  // Manejador de arrastre manual de Punto de Descarga (Destino)
  const handleDestinationDragEnd = async (lat: number, lng: number) => {
    destLockedByMapRef.current = true;
    const exactLat = +lat.toFixed(5);
    const exactLng = +lng.toFixed(5);
    const newPoint: GeocodedPoint = {
      nombre: `Punto exacto (${exactLat}, ${exactLng})`,
      lat: exactLat,
      lng: exactLng
    };
    setDestinationPoint(newPoint);

    if (originPoint) {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(originPoint, newPoint);
        setRutaCalculada(ruta);
        const tarifa = SaraFreightPricingService.calcularTarifa(
          ruta.distanciaKm,
          weight,
          vehicleType,
          material
        );
        setTarifaEstimada(tarifa);
        setProposedPrice(tarifa.tarifaSugeridaUSD);
      } catch (err) {
        console.error('Error recalculando ruta al arrastrar destino:', err);
      } finally {
        setIsCalculatingRoute(false);
      }
    }

    SaraFreightRoutingService.reverseGeocodificar(exactLat, exactLng).then((dir) => {
      if (dir) {
        setDestinationText(dir);
      } else {
        setDestinationText(`Coord: ${exactLat}, ${exactLng}`);
      }
    });
  };

  // Manejador de clics directos sobre el mapa
  const handleMapClick = (lat: number, lng: number) => {
    if (mapClickMode === 'origen') {
      handleOriginDragEnd(lat, lng);
      setMapClickMode(null);
    } else if (mapClickMode === 'destino') {
      handleDestinationDragEnd(lat, lng);
      setMapClickMode(null);
    }
  };

  // Ajustes de oferta inDrive
  const handleAdjustPrice = (delta: number) => {
    if (!tarifaEstimada || proposedPrice === null) return;
    const minP = tarifaEstimada.rangoNegociacionInDrive.minimoUSD;
    const maxP = tarifaEstimada.rangoNegociacionInDrive.maximoUSD * 1.5;
    const nextVal = +(Math.max(minP, Math.min(maxP, proposedPrice + delta))).toFixed(2);
    setProposedPrice(nextVal);
  };

  // Cálculo de probabilidad de aceptación
  const acceptanceProbability = useMemo(() => {
    if (!tarifaEstimada || proposedPrice === null) return { percent: 95, label: 'Alta', color: 'text-emerald-400 bg-emerald-500/20' };
    const base = tarifaEstimada.tarifaSugeridaUSD;
    const min = tarifaEstimada.rangoNegociacionInDrive.minimoUSD;
    if (proposedPrice >= base) {
      return { percent: 98, label: 'Inmediata (98%)', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
    }
    const ratio = (proposedPrice - min) / (base - min || 1);
    const p = Math.max(30, Math.min(95, Math.round(50 + ratio * 45)));
    if (p >= 75) return { percent: p, label: `Alta (${p}%)`, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
    if (p >= 55) return { percent: p, label: `Media (${p}%)`, color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
    return { percent: p, label: `Baja (${p}%)`, color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' };
  }, [tarifaEstimada, proposedPrice]);

  // Solicitar el flete (Modo Flete Directo)
  const handlePedirFlete = async () => {
    if (!originText || !destinationText) return alert('Por favor ingresa origen y destino');
    if (!tarifaEstimada) return;

    const precioFinal = proposedPrice || tarifaEstimada.tarifaSugeridaUSD;
    const asignadoId = 'FLT-' + Math.floor(1000 + Math.random() * 9000);
    const code = generateAccessCode();

    await createFletesSolicitud({
      origen: originText,
      destino: destinationText,
      tarifa: precioFinal,
      material,
      peso: weight,
      codigoAcceso: code
    });

    setActiveFreight({
      id: asignadoId,
      origin: originText,
      destination: destinationText,
      material,
      weight,
      vehicleType,
      referencePrice: precioFinal,
      status: 'searching',
      accessCode: code,
      distanciaKm: rutaCalculada?.distanciaKm || 1.8,
      duracionMinutos: rutaCalculada?.duracionMinutos || 8
    });
  };

  // Confirmar Renta Temporal (Modo Uber Rent)
  const handleConfirmarRenta = async () => {
    if (!cotizacionRenta) return;
    setIsProcessingRenta(true);
    const pin = generateAccessCode();

    const res = await createFletesReservaRenta({
      clienteNombre: rentaClienteNombre,
      clienteTelefono: rentaClienteTelefono,
      modalidadRenta: rentaConChofer ? 'CON_CHOFER' : 'SIN_CHOFER',
      duracionTipo: rentaDuracionTipo,
      duracionValor: rentaDuracionValor,
      tarifaTotal: cotizacionRenta.tarifaTotalUSD,
      depositoGarantia: cotizacionRenta.depositoGarantiaUSD,
      lugarEntrega: rentaLugarEntrega,
      pinDesbloqueo: pin
    });

    setReservaRentaActiva({
      id: res?.id || ('RES-' + Math.floor(1000 + Math.random() * 9000)),
      vehiculoNombre: CATALOGO_VEHICULOS_SARA[vehicleType]?.nombre || 'Vehículo SARA',
      duracionTexto: `${rentaDuracionValor} ${rentaDuracionTipo.toLowerCase()}`,
      conChofer: rentaConChofer,
      tarifaTotal: cotizacionRenta.tarifaTotalUSD,
      depositoGarantia: cotizacionRenta.depositoGarantiaUSD,
      pinDesbloqueo: pin,
      lugarEntrega: rentaLugarEntrega
    });
    setIsProcessingRenta(false);
  };

  // Acciones Modo Transportista
  const handleDriverAccept = async () => {
    if (activeFreight) {
      setActiveFreight(prev => prev ? { ...prev, status: 'accepted' } : null);
      if (activeFreight.id) {
        await updateFletesSolicitudStatus(activeFreight.id, 'asignado', activeFreight.accessCode);
      }
    }
  };

  const handleDriverNegotiate = () => {
    if (activeFreight && counterOffer) {
      setActiveFreight(prev => prev ? { ...prev, status: 'negotiating' } : null);
      setTimeout(async () => {
        const finalP = parseFloat(counterOffer);
        setActiveFreight(prev => prev ? { ...prev, referencePrice: finalP, status: 'accepted' } : null);
        if (activeFreight?.id) {
          await updateFletesSolicitudStatus(activeFreight.id, 'asignado', activeFreight.accessCode);
        }
      }, 2500);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 font-sans flex flex-col text-slate-100 overflow-hidden select-none">
      <ModuloIntroSplash modulo="fletes" />

      {/* TOPBAR ULTRA-COMPACTA & ERGONÓMICA */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl shadow-md shadow-amber-500/20 text-slate-950">
            <Truck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              SARA <span className="text-amber-500">FLETES</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              GPS En Vivo
            </span>
            <span className="hidden md:inline-block bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
              Abierto a Todo Público
            </span>
          </div>
        </div>

        {/* Toggle de Roles: Cliente vs Chofer */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-bold">
            <button
              onClick={() => setViewMode('constructor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'constructor'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Solicitar</span>
            </button>
            <button
              onClick={() => setViewMode('driver')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'driver'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Conductor</span>
            </button>
          </div>

          <Link
            href="/modulos/fletes/mi-perfil"
            className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mi Billetera</span>
          </Link>
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-xs px-2 py-1.5 transition-colors"
          >
            Salir
          </Link>
        </div>
      </header>

      {/* ÁREA MAP-AS-CANVAS (100% VIEWPORT CON CONTROLES FLOTANTES) */}
      <div className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden">
        
        {/* MAPA VECTORIAL DE FONDO COMPLETO */}
        <div className="absolute inset-0 z-0">
          <SaraFletesMap
            userLocation={userLocation}
            origenCoords={originPoint ? [originPoint.lat, originPoint.lng] : null}
            destinoCoords={destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null}
            origenNombre={originText}
            destinoNombre={destinationText}
            rutaCoordenadas={serviceType === 'flete' ? rutaCalculada?.coordenadasRuta : undefined}
            vehiculosCercanos={vehiculosZonificados}
            vehiculoSeleccionado={vehicleType}
            onOriginDragEnd={handleOriginDragEnd}
            onDestinationDragEnd={handleDestinationDragEnd}
            onMapClick={handleMapClick}
            onSelectVehiculo={(veh) => {
              setVehicleType(veh.tipoVehiculo);
            }}
          />
        </div>

        {/* BANNER FLOTANTE: MODO CLIC EN MAPA ACTIVADO */}
        {mapClickMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-full text-xs flex items-center gap-2.5 shadow-2xl border-2 border-slate-950 animate-bounce">
            <span className="text-sm">📍</span>
            <span>Haz clic en el mapa para ubicar <strong>{mapClickMode === 'origen' ? '🟢 CARGA (Origen)' : '🚩 DESCARGA (Destino)'}</strong></span>
            <button
              type="button"
              onClick={() => setMapClickMode(null)}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-2 py-0.5 rounded-full text-[10px] transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PANEL FLOTANTE DE GESTIÓN (DESKTOP: ISLA FLOTANTE / MÓVIL: BOTTOM SHEET) */}
        {/* ------------------------------------------------------------- */}
        <aside
          className={`z-20 transition-all duration-300 ease-out flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl
            /* Móvil: Bottom Sheet */
            absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl
            /* Desktop: Tarjeta Flotante Lateral */
            lg:bottom-auto lg:top-4 lg:left-4 lg:right-auto lg:w-[470px] lg:max-h-[calc(100vh-88px)] lg:rounded-2xl
            ${isPanelCollapsed ? 'translate-y-[calc(100%-48px)] lg:translate-y-0 lg:w-[320px] lg:max-h-[64px]' : ''}
          `}
        >
          {/* Header del Panel con Botón de Minimizar / Maximizar */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            {/* Tirador para móviles */}
            <div className="lg:hidden absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-700 rounded-full" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">
                {viewMode === 'constructor' 
                  ? (serviceType === 'flete' ? 'Cotizador de Flete On-Demand' : 'Renta Temporal de Vehículos')
                  : 'Radar de Conductor SARA'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isPanelCollapsed ? 'Expandir panel' : 'Minimizar panel'}
              >
                {isPanelCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CONTENIDO DEL PANEL CON SCROLL SUAVE */}
          {!isPanelCollapsed && (
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-56px)] lg:max-h-[calc(100vh-160px)]">
              
              {/* MODO CLIENTE / PÚBLICO GENERAL */}
              {viewMode === 'constructor' && (
                <>
                  {/* SWITCH DUAL: FLETE VS RENTA TEMPORAL */}
                  <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setServiceType('flete')}
                      className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        serviceType === 'flete'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Route className="w-3.5 h-3.5" />
                      Flete por Viaje
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType('renta')}
                      className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        serviceType === 'renta'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Renta Horas / Días
                    </button>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SECCIÓN A: FLETE DE CARGA ON-DEMAND */}
                  {/* -------------------------------------------------------- */}
                  {serviceType === 'flete' && (
                    <>
                      {/* TIMELINE DE RUTA (CONEXIÓN ELEGANTE CON BOTÓN SWAP) */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 relative">
                        <div className="flex items-stretch gap-3">
                          {/* Columna visual con línea continua */}
                          <div className="flex flex-col items-center py-2 shrink-0">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
                            <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-500 via-slate-600 to-amber-500 my-1"></div>
                            <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></span>
                          </div>

                          {/* Campos de texto con botones contextuales */}
                          <div className="flex-1 space-y-2">
                            {/* Input Origen */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                  Punto de Carga (Origen)
                                </label>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setMapClickMode(mapClickMode === 'origen' ? null : 'origen')}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                                      mapClickMode === 'origen'
                                        ? 'bg-emerald-500 text-slate-950 font-black'
                                        : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                                    }`}
                                  >
                                    📍 Marcar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleUsarMiUbicacionComoOrigen}
                                    className="text-[9px] text-blue-400 bg-blue-950/40 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold"
                                  >
                                    GPS
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={originText}
                                onChange={(e) => {
                                  originLockedByMapRef.current = false;
                                  setOriginText(e.target.value);
                                }}
                                placeholder="Escribe o arrastra el pin 🟢"
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            {/* Input Destino */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                                  Punto de Descarga (Destino)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setMapClickMode(mapClickMode === 'destino' ? null : 'destino')}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${
                                    mapClickMode === 'destino'
                                      ? 'bg-amber-500 text-slate-950 font-black'
                                      : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                                  }`}
                                >
                                  📍 Marcar
                                </button>
                              </div>
                              <input
                                type="text"
                                value={destinationText}
                                onChange={(e) => {
                                  destLockedByMapRef.current = false;
                                  setDestinationText(e.target.value);
                                }}
                                placeholder="Escribe o arrastra el pin 🚩"
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Botón Swap vertical en el centro */}
                          <div className="flex items-center justify-center shrink-0">
                            <button
                              type="button"
                              onClick={handleSwapRoute}
                              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 flex items-center justify-center transition-all shadow-md active:scale-95"
                              title="Invertir origen y destino (Swap)"
                            >
                              <ArrowUpDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Chips rápidos de destino sugerido */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                          <span className="text-slate-500 font-semibold shrink-0">Rutas:</span>
                          <button
                            type="button"
                            onClick={() => {
                              originLockedByMapRef.current = false;
                              destLockedByMapRef.current = false;
                              setOriginText('MAtecons Chile, Cariamanga');
                              setDestinationText('El Dorado, Cariamanga');
                            }}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            Cariamanga Centro
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              originLockedByMapRef.current = false;
                              destLockedByMapRef.current = false;
                              setOriginText('MAtecons Chile, Cariamanga');
                              setDestinationText('Cantera Bella María, Loja');
                            }}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg whitespace-nowrap"
                          >
                            Cantera Bella María
                          </button>
                        </div>
                      </div>

                      {/* SELECTOR HORIZONTAL DE FLOTA ESTILO UBER CON ETA Y PRECIOS */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Vehículos Disponibles ({Object.keys(CATALOGO_VEHICULOS_SARA).length} Opciones)
                          </label>
                          {rutaCalculada && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {rutaCalculada.distanciaKm} km · ~{rutaCalculada.duracionMinutos} min
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                          {(Object.keys(CATALOGO_VEHICULOS_SARA) as CategoriaVehiculo[]).map((catKey) => {
                            const v = CATALOGO_VEHICULOS_SARA[catKey];
                            const isSelected = vehicleType === catKey;
                            const distKm = rutaCalculada?.distanciaKm || 2;
                            const estPrice = SaraFreightPricingService.calcularTarifa(distKm, weight, catKey, material).tarifaSugeridaUSD;

                            return (
                              <button
                                key={catKey}
                                type="button"
                                onClick={() => setVehicleType(catKey)}
                                className={`shrink-0 w-32 p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-2xl">{v.icono}</span>
                                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Zap className="w-2.5 h-2.5" />
                                    3 min
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <p className="font-black text-xs text-white leading-tight truncate">{v.nombre}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Capacidad: {v.capacidadTon}T</p>
                                </div>
                                <div className="mt-2 pt-1 border-t border-slate-800 flex items-baseline justify-between">
                                  <span className="text-sm font-black font-mono text-amber-400">
                                    ${estPrice.toFixed(2)}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-semibold">USD</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* AJUSTES DE MATERIAL Y PESO */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                            Material a Transportar
                          </label>
                          <select
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option>Otros Materiales</option>
                            <option>Cemento (Sacos)</option>
                            <option>Arena / Ripio</option>
                            <option>Varillas de Acero</option>
                            <option>Bloques / Ladrillos</option>
                            <option>Acabados / Cerámica</option>
                            <option>Desalojo de Escombros</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                            Peso de la Carga (Ton)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={weight}
                            onChange={(e) => setWeight(Math.max(0.1, Number(e.target.value)))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* BARRA DE OFERTA / SUBASTA ESTILO INDRIVE */}
                      {tarifaEstimada && proposedPrice !== null && !activeFreight && (
                        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/50 p-3.5 rounded-2xl shadow-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Oferta Negociable (Modo inDrive)
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acceptanceProbability.color}`}>
                              Probabilidad: {acceptanceProbability.label}
                            </span>
                          </div>

                          {/* Selector de precio con botones rápidos +/- 0.50 */}
                          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleAdjustPrice(-0.50)}
                              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-all active:scale-95"
                              title="Reducir $0.50 USD"
                            >
                              -$0.50
                            </button>

                            <div className="text-center">
                              <p className="text-2xl font-black font-mono text-amber-500">
                                ${proposedPrice.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USD</span>
                              </p>
                              <p className="text-[9px] text-slate-400">
                                Sugerido IA: ${tarifaEstimada.tarifaSugeridaUSD.toFixed(2)} (Rango: ${tarifaEstimada.rangoNegociacionInDrive.minimoUSD.toFixed(2)} - ${tarifaEstimada.rangoNegociacionInDrive.maximoUSD.toFixed(2)})
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAdjustPrice(0.50)}
                              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition-all active:scale-95"
                              title="Aumentar $0.50 USD"
                            >
                              +$0.50
                            </button>
                          </div>

                          {/* Botón Principal de Envío */}
                          <button
                            type="button"
                            onClick={handlePedirFlete}
                            disabled={isCalculatingRoute}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Truck className="w-4 h-4 stroke-[2.5]" />
                            Solicitar Flete por ${proposedPrice.toFixed(2)} USD
                          </button>
                        </div>
                      )}

                      {/* ESTADO DE FLETE ACTIVO Y SEGUIMIENTO */}
                      {activeFreight && (
                        <div className="bg-slate-950 border border-amber-500/60 p-4 rounded-2xl text-center space-y-3">
                          {activeFreight.status === 'searching' && (
                            <>
                              <Loader2 className="w-9 h-9 text-amber-500 animate-spin mx-auto" />
                              <div>
                                <h3 className="font-black text-white text-base">Notificando a Conductores...</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Transmitiendo oferta a camionetas en radar</p>
                              </div>
                              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400">Tu oferta actual:</span>
                                <p className="text-xl font-black text-amber-500 font-mono">
                                  ${activeFreight.referencePrice.toFixed(2)} USD
                                </p>
                              </div>
                            </>
                          )}

                          {activeFreight.status === 'accepted' && (
                            <>
                              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                              <div>
                                <h3 className="font-black text-white text-base">¡Flete Asignado y en Ruta!</h3>
                                <p className="text-xs text-slate-400">
                                  Chofer en camino por <strong>${activeFreight.referencePrice.toFixed(2)} USD</strong>
                                </p>
                              </div>

                              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                                <p className="text-[10px] font-black uppercase text-emerald-400 mb-0.5">
                                  PIN de Seguridad de Entrega
                                </p>
                                <p className="text-2xl font-black text-emerald-400 font-mono tracking-widest">
                                  {activeFreight.accessCode}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Entrégalos al conductor al verificar la carga
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveFreight(null)}
                                className="text-xs text-amber-400 underline font-bold"
                              >
                                Solicitar otro viaje
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* -------------------------------------------------------- */}
                  {/* SECCIÓN B: RENTA TEMPORAL (POR HORAS / DÍAS TIPO UBER RENT) */}
                  {/* -------------------------------------------------------- */}
                  {serviceType === 'renta' && !reservaRentaActiva && (
                    <div className="space-y-3">
                      {/* Duración rápida */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            Duración de Renta
                          </label>
                          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => { setRentaDuracionTipo('HORAS'); setRentaDuracionValor(4); }}
                              className={`px-2.5 py-1 rounded-md transition-all ${rentaDuracionTipo === 'HORAS' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                            >
                              Por Horas
                            </button>
                            <button
                              type="button"
                              onClick={() => { setRentaDuracionTipo('DIAS'); setRentaDuracionValor(2); }}
                              className={`px-2.5 py-1 rounded-md transition-all ${rentaDuracionTipo === 'DIAS' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'}`}
                            >
                              Por Días
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {rentaDuracionTipo === 'HORAS' ? (
                            [2, 4, 8].map((h) => (
                              <button
                                key={h}
                                type="button"
                                onClick={() => setRentaDuracionValor(h)}
                                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  rentaDuracionValor === h
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-black'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {h} Horas
                              </button>
                            ))
                          ) : (
                            [1, 3, 7].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setRentaDuracionValor(d)}
                                className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                  rentaDuracionValor === d
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-black'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {d} {d === 1 ? 'Día' : 'Días'} {d >= 7 ? '(20% Off)' : ''}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Switch: ¿Con Chofer? */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-amber-500" />
                            ¿Con Chofer Profesional?
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {rentaConChofer ? 'Operador calificado incluido en la tarifa.' : 'Conducción libre (requiere garantía).'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRentaConChofer(!rentaConChofer)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                            rentaConChofer ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-950 shadow-md"></span>
                        </button>
                      </div>

                      {/* Cotización de Renta */}
                      {cotizacionRenta && (
                        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 p-3.5 rounded-2xl shadow-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400">
                              Resumen de Alquiler
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                              {rentaDuracionValor} {rentaDuracionTipo.toLowerCase()}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <div>
                              <p className="text-2xl font-black text-amber-500 font-mono">
                                ${cotizacionRenta.tarifaTotalUSD.toFixed(2)}{' '}
                                <span className="text-xs font-semibold text-slate-400">USD</span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Depósito garantía: <strong>${cotizacionRenta.depositoGarantiaUSD.toFixed(2)} USD</strong> (reembolsable)
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleConfirmarRenta}
                            disabled={isProcessingRenta}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-xs"
                          >
                            {isProcessingRenta ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Confirmando Reserva...
                              </>
                            ) : (
                              <>
                                <KeyRound className="w-4 h-4" />
                                Reservar por ${cotizacionRenta.tarifaTotalUSD.toFixed(2)} USD
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RENTA CONFIRMADA */}
                  {serviceType === 'renta' && reservaRentaActiva && (
                    <div className="bg-slate-950 border border-emerald-500/50 p-4 rounded-2xl text-center space-y-3">
                      <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                      <div>
                        <h3 className="font-black text-white text-base">¡Vehículo Reservado!</h3>
                        <p className="text-xs text-slate-400">
                          {reservaRentaActiva.vehiculoNombre} ({reservaRentaActiva.duracionTexto})
                        </p>
                      </div>

                      <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                        <p className="text-[10px] font-black uppercase text-emerald-400 mb-0.5">
                          PIN Digital de Desbloqueo
                        </p>
                        <p className="text-2xl font-black text-emerald-400 font-mono tracking-widest">
                          {reservaRentaActiva.pinDesbloqueo}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Presenta este PIN al recibir la unidad
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReservaRentaActiva(null)}
                        className="text-xs text-amber-400 underline font-bold"
                      >
                        Hacer otra reserva
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* MODO CONDUCTOR / TRANSPORTISTA */}
              {viewMode === 'driver' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-white">Panel de Conductor</h3>
                      <p className="text-xs text-slate-400">Recibe pedidos y contraoferta en tiempo real</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>

                  {!activeFreight ? (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-2.5">
                      <Navigation className="w-9 h-9 text-amber-500 mx-auto animate-bounce" />
                      <h4 className="font-bold text-white text-sm">Radar SARA Conectado</h4>
                      <p className="text-xs text-slate-400">
                        Tu vehículo está visible en el mapa para fletes directos y alquileres temporales.
                      </p>
                      <span className="inline-block text-[10px] font-mono bg-slate-900 border border-slate-700 text-emerald-400 px-2.5 py-1 rounded-full">
                        Coordenadas GPS transmitiendo
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-amber-500/50 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                            ¡Nueva Solicitud en Radar!
                          </span>
                          <h4 className="font-black text-white text-sm mt-1">
                            {activeFreight.material} ({activeFreight.weight} Ton)
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400">Oferta Cliente</span>
                          <p className="text-xl font-black text-amber-500 font-mono">
                            ${activeFreight.referencePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <p className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate"><strong>Carga:</strong> {activeFreight.origin}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="truncate"><strong>Entrega:</strong> {activeFreight.destination}</span>
                        </p>
                      </div>

                      {activeFreight.status === 'searching' && (
                        <div className="space-y-2">
                          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <input
                              type="number"
                              step="0.50"
                              placeholder="Tu contraoferta (ej. 3.00)"
                              value={counterOffer}
                              onChange={(e) => setCounterOffer(e.target.value)}
                              className="w-full bg-transparent font-mono font-bold text-white focus:outline-none ml-1 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={handleDriverAccept}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-xl text-xs transition-all shadow-md"
                            >
                              Aceptar Oferta
                            </button>
                            <button
                              type="button"
                              onClick={handleDriverNegotiate}
                              disabled={!counterOffer}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs transition-all disabled:opacity-40 shadow-md"
                            >
                              Contraofertar
                            </button>
                          </div>
                        </div>
                      )}

                      {activeFreight.status === 'accepted' && (
                        <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl text-center space-y-1">
                          <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto" />
                          <p className="text-xs font-black text-emerald-400 uppercase">
                            ¡Viaje Asignado!
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Código requerido al entregar:
                          </p>
                          <p className="text-xl font-black text-white font-mono tracking-widest">
                            {activeFreight.accessCode}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
