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
  Radio,
  Layers,
  ChevronRight,
  Star,
  CheckCircle2,
  ThumbsUp,
  Award,
  MessageSquare,
  Share2,
  Users,
  FileText,
  AlertOctagon,
  AlertTriangle,
  CreditCard,
  Banknote,
  Building2,
  Wallet,
  QrCode
} from 'lucide-react';
import { SaraFloatingSosButton } from '@/components/fletes/SaraFloatingSosButton';
import { SaraDriverRatingModal } from '@/components/fletes/SaraDriverRatingModal';
import SaraFreightPaymentGatewayModal from '@/components/fletes/SaraFreightPaymentGatewayModal';
import { SaraGuiaRemisionService } from '@/lib/services/saraGuiaRemisionService';
import { SaraMtopBalanzasService } from '@/lib/services/saraMtopBalanzasService';
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
  RutaVialCalculada,
  SugerenciaDireccion
} from '@/lib/services/saraFreightRoutingService';
import { 
  SaraFletesRealtimeService, 
  SolicitudFleteRealtime 
} from '@/lib/services/saraFletesRealtimeService';
import ModuleBrandLogo from '@/components/layout/ModuleBrandLogo';
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
  status: 'searching' | 'negotiating' | 'accepted' | 'in_transit';
  accessCode?: string;
  distanciaKm?: number;
  duracionMinutos?: number;
  clienteNombre?: string;
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

function getVehiclePlural(type?: string): string {
  switch (type) {
    case 'PICKUP_1T': return 'camionetas';
    case 'FURGON_3_5T': return 'furgones';
    case 'CAMION_5T': return 'camiones';
    case 'VOLQUETA_14M3': return 'volquetas';
    case 'MULA_TRAILER_30T': return 'mulas y tráileres';
    case 'CAMABAJA_40T': return 'camas bajas';
    default: return 'vehículos';
  }
}

export interface DriverOffer {
  id: string;
  driverName: string;
  vehicleName: string;
  plate: string;
  rating: number;
  tripsCount: number;
  etaMinutes: number;
  distanceMeters: number;
  offeredPrice: number;
  isCounterOffer: boolean;
  phone: string;
}

export default function SaraFletesEngine() {
  const [viewMode, setViewMode] = useState<'constructor' | 'driver'>('constructor');
  const [serviceType, setServiceType] = useState<'flete' | 'renta'>('flete');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // 1. Geolocalización en tiempo real
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);

  // 2. Coordenadas y Puntos de Carga / Descarga para Flete
  const [originText, setOriginText] = useState('Mi Ubicación Actual (GPS)');
  const [destinationText, setDestinationText] = useState('');
  const [originPoint, setOriginPoint] = useState<GeocodedPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<GeocodedPoint | null>(null);
  const [rutaCalculada, setRutaCalculada] = useState<RutaVialCalculada | null>(null);

  // Candados y estado interactivo de mapa para evitar desfasaje y saltos
  const originLockedByMapRef = useRef<boolean>(false);
  const destLockedByMapRef = useRef<boolean>(false);
  const originPointRef = useRef<GeocodedPoint | null>(null);
  const destinationPointRef = useRef<GeocodedPoint | null>(null);
  const [mapClickMode, setMapClickMode] = useState<'origen' | 'destino' | null>(null);

  // Sincronizar referencias para evitar recreación de callbacks
  useEffect(() => {
    originPointRef.current = originPoint;
  }, [originPoint]);

  useEffect(() => {
    destinationPointRef.current = destinationPoint;
  }, [destinationPoint]);

  // Estados para sugerencias predictivas (Autocomplete en tiempo real a nivel nacional)
  const [originSuggestions, setOriginSuggestions] = useState<SugerenciaDireccion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<SugerenciaDireccion[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const originDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const destDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const originInputWrapperRef = useRef<HTMLDivElement>(null);
  const destInputWrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar menús de sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originInputWrapperRef.current && !originInputWrapperRef.current.contains(e.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destInputWrapperRef.current && !destInputWrapperRef.current.contains(e.target as Node)) {
        setShowDestSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejo de escritura con búsqueda predictiva en Origen
  const handleOriginInputChange = (val: string) => {
    originLockedByMapRef.current = false;
    setOriginText(val);

    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);
    if (val.trim().length >= 2) {
      setIsSearchingOrigin(true);
      originDebounceRef.current = setTimeout(async () => {
        try {
          const sugs = await SaraFreightRoutingService.buscarSugerenciasDireccion(val, userLocation || undefined);
          setOriginSuggestions(sugs);
          setShowOriginSuggestions(sugs.length > 0);
        } catch (e) {
          console.warn('Error buscando sugerencias origen:', e);
        } finally {
          setIsSearchingOrigin(false);
        }
      }, 180);
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
      setIsSearchingOrigin(false);
    }
  };

  // Manejo de escritura con búsqueda predictiva en Destino
  const handleDestinationInputChange = (val: string) => {
    destLockedByMapRef.current = false;
    setDestinationText(val);

    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    if (val.trim().length >= 2) {
      setIsSearchingDest(true);
      destDebounceRef.current = setTimeout(async () => {
        try {
          const sugs = await SaraFreightRoutingService.buscarSugerenciasDireccion(val, originPoint ? [originPoint.lat, originPoint.lng] : userLocation || undefined);
          setDestinationSuggestions(sugs);
          setShowDestSuggestions(sugs.length > 0);
        } catch (e) {
          console.warn('Error buscando sugerencias destino:', e);
        } finally {
          setIsSearchingDest(false);
        }
      }, 180);
    } else {
      setDestinationSuggestions([]);
      setShowDestSuggestions(false);
      setIsSearchingDest(false);
    }
  };

  // Selección de sugerencia de Origen
  const handleSelectOriginSuggestion = async (sug: SugerenciaDireccion) => {
    originLockedByMapRef.current = true;
    setOriginText(sug.titulo);
    setShowOriginSuggestions(false);

    const newPoint: GeocodedPoint = {
      nombre: sug.titulo,
      lat: sug.lat,
      lng: sug.lng,
      ciudad: sug.ciudad,
      provincia: sug.provincia
    };
    originPointRef.current = newPoint;
    setOriginPoint(newPoint);

    const pDest = destinationPointRef.current;
    if (pDest) {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(newPoint, pDest);
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
        console.error('Error calculando ruta al seleccionar origen:', err);
      } finally {
        setIsCalculatingRoute(false);
      }
    }
  };

  // Selección de sugerencia de Destino
  const handleSelectDestinationSuggestion = async (sug: SugerenciaDireccion) => {
    destLockedByMapRef.current = true;
    setDestinationText(sug.titulo);
    setShowDestSuggestions(false);

    const newPoint: GeocodedPoint = {
      nombre: sug.titulo,
      lat: sug.lat,
      lng: sug.lng,
      ciudad: sug.ciudad,
      provincia: sug.provincia
    };
    destinationPointRef.current = newPoint;
    setDestinationPoint(newPoint);

    const pOrig = originPointRef.current;
    if (pOrig) {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(pOrig, newPoint);
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
        console.error('Error calculando ruta al seleccionar destino:', err);
      } finally {
        setIsCalculatingRoute(false);
      }
    }
  };

  // Selección rápida de rutas nacionales icónicas
  const handleSelectRutaRapida = async (
    nomOrig: string,
    coordsOrig: [number, number],
    ciudadOrig: string,
    provOrig: string,
    nomDest: string,
    coordsDest: [number, number],
    ciudadDest: string,
    provDest: string
  ) => {
    originLockedByMapRef.current = true;
    destLockedByMapRef.current = true;

    const pOrig: GeocodedPoint = {
      nombre: nomOrig,
      lat: coordsOrig[0],
      lng: coordsOrig[1],
      ciudad: ciudadOrig,
      provincia: provOrig
    };
    const pDest: GeocodedPoint = {
      nombre: nomDest,
      lat: coordsDest[0],
      lng: coordsDest[1],
      ciudad: ciudadDest,
      provincia: provDest
    };

    setOriginText(nomOrig);
    setDestinationText(nomDest);
    originPointRef.current = pOrig;
    destinationPointRef.current = pDest;
    setOriginPoint(pOrig);
    setDestinationPoint(pDest);
    setShowOriginSuggestions(false);
    setShowDestSuggestions(false);

    setIsCalculatingRoute(true);
    try {
      const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(pOrig, pDest);
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
      console.error('Error calculando ruta rápida:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

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
  const [clienteNombre, setClienteNombre] = useState('Ing. Marco Vivanco (Constructora SARA)');
  const [activeFreight, setActiveFreight] = useState<FreightRequest | null>(null);
  const [counterOffer, setCounterOffer] = useState<string>('');
  const [driverOffers, setDriverOffers] = useState<DriverOffer[]>([]);
  const [assignedDriver, setAssignedDriver] = useState<DriverOffer | null>(null);

  // Estados Avanzados 2026: Guía de Remisión SRI, Calculadora de Estiba y Control MTOP
  const [guiaRemisionClave, setGuiaRemisionClave] = useState<string>('');
  const [guiaRemisionValidacion, setGuiaRemisionValidacion] = useState<{ valida: boolean; error?: string } | null>(null);
  const [peonesEstibaCount, setPeonesEstibaCount] = useState<number>(0);
  const costoEstibaUSD = peonesEstibaCount * 15.00;

  // Evaluación de cumplimiento de balanza MTOP en tiempo real
  const mtopCheck = useMemo(() => {
    return SaraMtopBalanzasService.evaluarPesaje(vehicleType, weight);
  }, [vehicleType, weight]);

  const balanzasEnCorredor = useMemo(() => {
    if (!originPoint || !destinationPoint) return [];
    return SaraMtopBalanzasService.obtenerBalanzasEnCorredor(
      [originPoint.lat, originPoint.lng],
      [destinationPoint.lat, destinationPoint.lng]
    );
  }, [originPoint, destinationPoint]);

  // Estados del Modal de Calificación al Conductor (Estilo Uber / DiDi / inDrive)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [driverToRate, setDriverToRate] = useState<{
    fleteId: string;
    driverName: string;
    plate: string;
    vehicleName: string;
    price: number;
  } | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [selectedRatingTags, setSelectedRatingTags] = useState<string[]>(['Puntualidad']);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    method: string;
    methodName: string;
    reference: string;
    amount: number;
  } | null>(null);

  // Generador de código PIN de entrega segura
  const generateAccessCode = () => Math.floor(1000 + Math.random() * 9000).toString();

  // Simulación dinámica de ofertas de conductores cercanos al solicitar flete
  useEffect(() => {
    if (activeFreight && activeFreight.status === 'searching') {
      setDriverOffers([]);
      const timers: NodeJS.Timeout[] = [];
      const basePrice = activeFreight.referencePrice;
      const vehName = CATALOGO_VEHICULOS_SARA[activeFreight.vehicleType]?.nombre || 'Vehículo de Carga';

      // Prefijo de placa según provincia de origen
      const centerLat = originPoint?.lat || userLocation?.[0] || -4.3285;
      const centerLng = originPoint?.lng || userLocation?.[1] || -79.5560;
      let pCode = 'L'; // Loja por defecto
      const prov = (originPoint?.provincia || '').toLowerCase();
      if (prov.includes('pichincha') || (centerLat > -0.5 && centerLat < 0.2)) pCode = 'P';
      else if (prov.includes('guayas') || (centerLat > -2.5 && centerLat < -1.8 && centerLng < -79.7)) pCode = 'G';
      else if (prov.includes('azuay') || (centerLat > -3.1 && centerLat < -2.7)) pCode = 'A';
      else if (prov.includes('el oro') || (centerLat > -3.6 && centerLat < -3.1)) pCode = 'O';
      else if (prov.includes('tungurahua') || (centerLat > -1.4 && centerLat < -1.1)) pCode = 'T';
      else if (prov.includes('manabi') || (centerLat > -1.2 && centerLat < -0.8 && centerLng < -80.3)) pCode = 'M';
      else if (prov.includes('santo domingo') || (centerLat > -0.4 && centerLat < -0.1 && centerLng < -79.1)) pCode = 'J';

      // Oferta 1: DAVID SARANGO (Camioneta Pickup 1.2T · FLT-VEH-06 a 210m, respuesta rápida)
      timers.push(setTimeout(() => {
        setDriverOffers(prev => [
          ...prev,
          {
            id: 'OFFER-SARANGO',
            driverName: 'David Sarango',
            vehicleName: `Camioneta Pickup 1.2T · SARA`,
            plate: `${pCode}FA-9012`,
            rating: 4.9,
            tripsCount: 142,
            etaMinutes: 2,
            distanceMeters: 210,
            offeredPrice: basePrice,
            isCounterOffer: false,
            phone: '0995544332'
          }
        ]);
      }, 200));

      // Oferta 2: MANUEL CÁRDENAS (Camioneta 1T · FLT-VEH-01 a 380m)
      timers.push(setTimeout(() => {
        setDriverOffers(prev => [
          ...prev,
          {
            id: 'OFFER-01',
            driverName: 'Manuel Cárdenas',
            vehicleName: `Camioneta 1T · ${vehName}`,
            plate: `${pCode}BA-3421`,
            rating: 4.9,
            tripsCount: 184,
            etaMinutes: 3,
            distanceMeters: 380,
            offeredPrice: basePrice,
            isCounterOffer: false,
            phone: '0993849182'
          }
        ]);
      }, 500));

      // Oferta 3: PEDRO JIMBO (Furgón 3T Urbano · FLT-VEH-07 a 420m)
      timers.push(setTimeout(() => {
        setDriverOffers(prev => [
          ...prev,
          {
            id: 'OFFER-JIMBO',
            driverName: 'Pedro Jimbo',
            vehicleName: `Furgón 3T Urbano`,
            plate: `${pCode}GA-6543`,
            rating: 4.8,
            tripsCount: 118,
            etaMinutes: 3,
            distanceMeters: 420,
            offeredPrice: basePrice,
            isCounterOffer: false,
            phone: '0981122334'
          }
        ]);
      }, 900));

      // Oferta 4: LUIS TOAPANTA (Furgón 3.5T Urbano · FLT-VEH-03 a 510m)
      timers.push(setTimeout(() => {
        setDriverOffers(prev => [
          ...prev,
          {
            id: 'OFFER-02',
            driverName: 'Luis Toapanta',
            vehicleName: `Furgón 3.5T Urbano`,
            plate: `${pCode}CA-9876`,
            rating: 4.7,
            tripsCount: 96,
            etaMinutes: 4,
            distanceMeters: 510,
            offeredPrice: basePrice,
            isCounterOffer: false,
            phone: '0961128472'
          }
        ]);
      }, 4700));

      // Oferta 5: CARLOS MENDOZA (Camión Hino 5T · FLT-VEH-02 a 680m, con contraoferta inDrive)
      timers.push(setTimeout(() => {
        const contraTarifa = +(basePrice + 0.50).toFixed(2);
        setDriverOffers(prev => [
          ...prev,
          {
            id: 'OFFER-03',
            driverName: 'Carlos Mendoza',
            vehicleName: `Camión Hino 5T`,
            plate: `${pCode}BK-1234`,
            rating: 4.8,
            tripsCount: 312,
            etaMinutes: 5,
            distanceMeters: 680,
            offeredPrice: contraTarifa,
            isCounterOffer: true,
            phone: '0984710293'
          }
        ]);
      }, 5900));

      return () => {
        timers.forEach(t => clearTimeout(t));
      };
    }
  }, [activeFreight, originPoint, userLocation]);

  // Referencia mutable a activeFreight para el bus en tiempo real
  const activeFreightRef = useRef<FreightRequest | null>(null);
  useEffect(() => {
    activeFreightRef.current = activeFreight;
  }, [activeFreight]);

  // Suscripción al bus en tiempo real SARA-FLETES (BroadcastChannel & LocalStorage)
  useEffect(() => {
    // 1. Restaurar flete activo y despacho aceptado si existen
    const savedDispatch = SaraFletesRealtimeService.getAcceptedDispatch();
    const savedReq = SaraFletesRealtimeService.getActiveRequest();

    if (savedDispatch || savedReq) {
      if (savedDispatch) {
        setAssignedDriver({
          id: 'ASSIGNED_' + savedDispatch.plate,
          driverName: savedDispatch.driverName,
          vehicleName: 'Vehículo Asignado SARA',
          plate: savedDispatch.plate,
          rating: 4.9,
          tripsCount: 160,
          etaMinutes: 2,
          distanceMeters: 250,
          offeredPrice: savedDispatch.precioAcordado,
          isCounterOffer: false,
          phone: '0995544332'
        });
      }

      if (savedReq) {
        setActiveFreight({
          id: savedReq.id,
          origin: savedReq.origen,
          destination: savedReq.destino,
          material: savedReq.material,
          weight: savedReq.pesoTon,
          vehicleType: (savedReq.tipoVehiculo as CategoriaVehiculo) || 'PICKUP_1T',
          referencePrice: savedDispatch ? savedDispatch.precioAcordado : savedReq.tarifaOfertadaUSD,
          status: (savedDispatch || savedReq.status === 'accepted') ? 'accepted' : 'searching',
          accessCode: savedDispatch?.codigoAcceso || savedReq.codigoAcceso,
          distanciaKm: savedReq.distanciaKm,
          duracionMinutos: savedReq.duracionMinutos
        });
      }
    }

    // 2. Suscribirse a eventos en vivo entre pestañas/roles
    const unsub = SaraFletesRealtimeService.subscribe((evt) => {
      if (evt.type === 'NUEVA_OFERTA_CONDUCTOR') {
        if (activeFreightRef.current && activeFreightRef.current.id === evt.payload.fleteId) {
          setDriverOffers((prev) => {
            if (prev.some(o => o.id === evt.payload.id)) return prev;
            return [
              {
                id: evt.payload.id,
                driverName: evt.payload.driverName,
                vehicleName: evt.payload.vehicleName,
                plate: evt.payload.plate,
                rating: evt.payload.rating,
                tripsCount: evt.payload.tripsCount,
                etaMinutes: evt.payload.etaMinutes,
                distanceMeters: evt.payload.distanceMeters,
                offeredPrice: evt.payload.offeredPrice,
                isCounterOffer: evt.payload.isCounterOffer,
                phone: evt.payload.phone
              },
              ...prev
            ];
          });
        }
      } else if (evt.type === 'CHOFER_ACEPTO_FLETE') {
        if (activeFreightRef.current && activeFreightRef.current.id === evt.payload.fleteId) {
          setAssignedDriver({
            id: 'CHOFER_DIRECTO_' + evt.payload.plate,
            driverName: evt.payload.driverName,
            vehicleName: evt.payload.vehicleName,
            plate: evt.payload.plate,
            rating: 4.9,
            tripsCount: 154,
            etaMinutes: 2,
            distanceMeters: 300,
            offeredPrice: evt.payload.precio,
            isCounterOffer: false,
            phone: '0993849182'
          });
          setActiveFreight((prev) => prev ? { ...prev, status: 'accepted' } : null);
        }
      } else if (evt.type === 'CLIENTE_ACEPTO_CONDUCTOR') {
        // Reflejar la orden de inmediato en el entorno del conductor
        setAssignedDriver({
          id: 'ASSIGNED_' + evt.payload.plate,
          driverName: evt.payload.driverName,
          vehicleName: 'Vehículo Asignado SARA',
          plate: evt.payload.plate,
          rating: 4.9,
          tripsCount: 160,
          etaMinutes: 2,
          distanceMeters: 250,
          offeredPrice: evt.payload.precioAcordado,
          isCounterOffer: false,
          phone: '0995544332'
        });

        setActiveFreight((prev) => {
          if (prev) {
            return {
              ...prev,
              status: 'accepted',
              referencePrice: evt.payload.precioAcordado,
              accessCode: evt.payload.codigoAcceso || prev.accessCode
            };
          }
          const req = SaraFletesRealtimeService.getActiveRequest();
          if (req) {
            return {
              id: req.id,
              origin: req.origen,
              destination: req.destino,
              material: req.material,
              weight: req.pesoTon,
              vehicleType: (req.tipoVehiculo as CategoriaVehiculo) || 'PICKUP_1T',
              referencePrice: evt.payload.precioAcordado,
              status: 'accepted',
              accessCode: evt.payload.codigoAcceso || req.codigoAcceso,
              distanciaKm: req.distanciaKm,
              duracionMinutos: req.duracionMinutos
            };
          }
          return null;
        });
      } else if (evt.type === 'FLETE_INICIADO') {
        setActiveFreight((prev) => prev ? {
          ...prev,
          status: 'in_transit'
        } : null);
      } else if (evt.type === 'FLETE_COMPLETADO') {
        // Al terminar el viaje, abrir el modal de calificación al conductor (estilo Uber / inDrive)
        const currentReq = activeFreightRef.current;
        setDriverToRate({
          fleteId: evt.payload.fleteId,
          driverName: evt.payload.driverName || 'David Sarango',
          plate: evt.payload.plate || 'PBA-1234',
          vehicleName: 'Camioneta Pickup 1.2T · SARA',
          price: currentReq?.referencePrice || evt.payload.tarifaFinal || 3.50
        });
        setPaymentMethod('efectivo');
        setPaymentDetails(null);
        setIsPaymentGatewayOpen(false);
        setIsRatingModalOpen(true);
        setActiveFreight(null);
        setDriverOffers([]);
        setAssignedDriver(null);
      } else if (evt.type === 'CANCELAR_SOLICITUD_FLETE') {
        setActiveFreight(null);
        setDriverOffers([]);
        setAssignedDriver(null);
      }
    });

    return () => unsub();
  }, []);

  // Detección inicial de GPS del navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setGpsLoading(false);
          const pOrig = { nombre: 'Mi Ubicación Actual (GPS)', lat: coords[0], lng: coords[1], ciudad: 'Ecuador' };
          setOriginPoint(pOrig);
          originPointRef.current = pOrig;
        },
        (err) => {
          console.warn('Geolocalización en modo referencial:', err.message);
          const defaultCoords: [number, number] = [-4.3285, -79.5560];
          setUserLocation(defaultCoords);
          setGpsLoading(false);
          const pOrig = { nombre: 'Mi Ubicación Actual (GPS)', lat: defaultCoords[0], lng: defaultCoords[1], ciudad: 'Cariamanga' };
          setOriginPoint(pOrig);
          originPointRef.current = pOrig;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation([-4.3285, -79.5560]);
      setGpsLoading(false);
    }
  }, []);

  // Flota de vehículos zonificados alrededor de la zona de operación con placas provinciales de Ecuador (ANT)
  const vehiculosZonificados = useMemo<VehiculoMapa[]>(() => {
    const centerLat = originPoint?.lat || userLocation?.[0] || -4.3285;
    const centerLng = originPoint?.lng || userLocation?.[1] || -79.5560;

    // Prefijo de placa según provincia o latitud/longitud
    let pCode = 'L'; // Loja por defecto
    const prov = (originPoint?.provincia || '').toLowerCase();
    if (prov.includes('pichincha') || (centerLat > -0.5 && centerLat < 0.2)) pCode = 'P';
    else if (prov.includes('guayas') || (centerLat > -2.5 && centerLat < -1.8 && centerLng < -79.7)) pCode = 'G';
    else if (prov.includes('azuay') || (centerLat > -3.1 && centerLat < -2.7)) pCode = 'A';
    else if (prov.includes('el oro') || (centerLat > -3.6 && centerLat < -3.1)) pCode = 'O';
    else if (prov.includes('tungurahua') || (centerLat > -1.4 && centerLat < -1.1)) pCode = 'T';
    else if (prov.includes('manabi') || (centerLat > -1.2 && centerLat < -0.8 && centerLng < -80.3)) pCode = 'M';
    else if (prov.includes('santo domingo') || (centerLat > -0.4 && centerLat < -0.1 && centerLng < -79.1)) pCode = 'J';
    else if (prov.includes('chimborazo')) pCode = 'H';
    else if (prov.includes('imbabura')) pCode = 'I';
    else if (prov.includes('cotopaxi')) pCode = 'X';
    else if (prov.includes('los rios')) pCode = 'R';
    else if (prov.includes('esmeraldas')) pCode = 'E';
    else if (prov.includes('carchi')) pCode = 'C';
    else if (prov.includes('canar')) pCode = 'U';
    else if (prov.includes('santa elena')) pCode = 'Y';
    else if (prov.includes('sucumbios')) pCode = 'K';
    else if (prov.includes('pastaza')) pCode = 'S';
    else if (prov.includes('napo')) pCode = 'N';
    else if (prov.includes('morona')) pCode = 'V';
    else if (prov.includes('zamora')) pCode = 'Z';
    else if (prov.includes('bolivar')) pCode = 'B';
    else if (prov.includes('galapagos')) pCode = 'W';

    return [
      {
        id: 'FLT-VEH-01',
        nombreChofer: 'Manuel Cárdenas',
        placa: `${pCode}BA-3421`,
        tipoVehiculo: 'PICKUP_1T',
        lat: +(centerLat + 0.0018).toFixed(5),
        lng: +(centerLng - 0.0016).toFixed(5),
        rating: 4.9,
        telefono: '0993849182',
        disponible: true
      },
      {
        id: 'FLT-VEH-02',
        nombreChofer: 'Carlos Mendoza',
        placa: `${pCode}BK-1234`,
        tipoVehiculo: 'CAMION_5T',
        lat: +(centerLat - 0.0022).toFixed(5),
        lng: +(centerLng + 0.0021).toFixed(5),
        rating: 4.8,
        telefono: '0984710293',
        disponible: true
      },
      {
        id: 'FLT-VEH-03',
        nombreChofer: 'Luis Toapanta',
        placa: `${pCode}CA-9876`,
        tipoVehiculo: 'FURGON_3T',
        lat: +(centerLat + 0.0026).toFixed(5),
        lng: +(centerLng + 0.0015).toFixed(5),
        rating: 4.7,
        telefono: '0961128472',
        disponible: true
      },
      {
        id: 'FLT-VEH-04',
        nombreChofer: 'Jorge Encalada',
        placa: `${pCode}DA-5512`,
        tipoVehiculo: 'VOLQUETA_V3A',
        lat: +(centerLat - 0.0032).toFixed(5),
        lng: +(centerLng - 0.0024).toFixed(5),
        rating: 4.9,
        telefono: '0991204857',
        disponible: true
      },
      {
        id: 'FLT-VEH-05',
        nombreChofer: 'Marco Vinicio Guamán',
        placa: `${pCode}EA-4321`,
        tipoVehiculo: 'TRACTO_3S3',
        lat: +(centerLat + 0.0038).toFixed(5),
        lng: +(centerLng - 0.0032).toFixed(5),
        rating: 5.0,
        telefono: '0998273641',
        disponible: true
      },
      {
        id: 'FLT-VEH-06',
        nombreChofer: 'David Sarango',
        placa: `${pCode}FA-9012`,
        tipoVehiculo: 'PICKUP_1T',
        lat: +(centerLat - 0.0012).toFixed(5),
        lng: +(centerLng - 0.0026).toFixed(5),
        rating: 4.9,
        telefono: '0995544332',
        disponible: true
      },
      {
        id: 'FLT-VEH-07',
        nombreChofer: 'Pedro Jimbo',
        placa: `${pCode}GA-6543`,
        tipoVehiculo: 'FURGON_3T',
        lat: +(centerLat + 0.0020).toFixed(5),
        lng: +(centerLng - 0.0028).toFixed(5),
        rating: 4.8,
        telefono: '0981122334',
        disponible: true
      }
    ];
  }, [originPoint, userLocation]);

  // Unidades cercanas filtradas automáticamente por categoría de vehículo seleccionada (Radar Inmediato)
  const vehiculosDisponiblesTipo = useMemo(() => {
    const matching = vehiculosZonificados.filter(v => v.tipoVehiculo === vehicleType);
    if (matching.length > 0) return matching;
    // Si no hay exactamente de esa categoría, presentar las unidades activas más cercanas
    return vehiculosZonificados.slice(0, 3);
  }, [vehiculosZonificados, vehicleType]);

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
      let puntoOrig = originPointRef.current;
      if (!originLockedByMapRef.current || !puntoOrig) {
        puntoOrig = await SaraFreightRoutingService.geocodificarDireccion(
          origenTxt,
          userLocation || undefined
        );
        if (puntoOrig) {
          originPointRef.current = puntoOrig;
          setOriginPoint(puntoOrig);
        }
      }

      // Pequeña pausa de serialización para evitar colisiones de peticiones geoespaciales
      await new Promise(r => setTimeout(r, 180));

      let puntoDest = destinationPointRef.current;
      if (!destLockedByMapRef.current || !puntoDest) {
        puntoDest = await SaraFreightRoutingService.geocodificarDireccion(
          destinoTxt,
          puntoOrig ? [puntoOrig.lat, puntoOrig.lng] : userLocation || undefined
        );
        if (puntoDest) {
          destinationPointRef.current = puntoDest;
          setDestinationPoint(puntoDest);
        }
      }

      if (puntoOrig && puntoDest) {
        // Si ambos puntos tienen coordenadas idénticas o solapadas, desfasamos ligeramente el destino 350m para diferenciarlos
        if (Math.abs(puntoOrig.lat - puntoDest.lat) < 0.0002 && Math.abs(puntoOrig.lng - puntoDest.lng) < 0.0002) {
          puntoDest = {
            ...puntoDest,
            lat: +(puntoDest.lat + 0.0035).toFixed(5),
            lng: +(puntoDest.lng + 0.0028).toFixed(5)
          };
          destinationPointRef.current = puntoDest;
          setDestinationPoint(puntoDest);
        }

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
  }, [userLocation]);

  useEffect(() => {
    if (originText && destinationText && serviceType === 'flete') {
      const timer = setTimeout(() => {
        resolverRutaYTarifa(originText, destinationText, vehicleType, weight, material);
      }, 400);
      return () => clearTimeout(timer);
    } else if (serviceType === 'flete' && !destinationText) {
      const distAprox = 1.8;
      const tarifa = SaraFreightPricingService.calcularTarifa(distAprox, weight, vehicleType, material);
      setTarifaEstimada(tarifa);
      setProposedPrice((prev) => prev ?? tarifa.tarifaSugeridaUSD);
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
      originLockedByMapRef.current = true;
      if (dir) {
        setOriginText(dir);
      } else {
        setOriginText(`Punto exacto (${exactLat}, ${exactLng})`);
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
      destLockedByMapRef.current = true;
      if (dir) {
        setDestinationText(dir);
      } else {
        setDestinationText(`Punto exacto (${exactLat}, ${exactLng})`);
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

  // Solicitar el flete (Modo Flete Directo con emisión en tiempo real)
  const handlePedirFlete = async () => {
    const orig = originText || 'Mi Ubicación Actual (GPS)';
    let dest = destinationText;
    if (!dest) {
      dest = 'Entrega Local (Zona Urbana)';
      setDestinationText('Entrega Local (Zona Urbana)');
    }

    const distKm = rutaCalculada?.distanciaKm || 1.8;
    const durMin = rutaCalculada?.duracionMinutos || 8;
    const tarifa = tarifaEstimada || SaraFreightPricingService.calcularTarifa(distKm, weight, vehicleType, material);
    if (!tarifaEstimada) {
      setTarifaEstimada(tarifa);
    }

    const precioBase = proposedPrice || tarifa.tarifaSugeridaUSD;
    const precioFinal = +(precioBase + costoEstibaUSD).toFixed(2);
    const asignadoId = 'FLT-' + Math.floor(1000 + Math.random() * 9000);
    const code = generateAccessCode();

    await createFletesSolicitud({
      origen: orig,
      destino: dest,
      tarifa: precioFinal,
      distanciaKm: distKm,
      vehiculoKey: vehicleType,
      material,
      peso: weight,
      codigoAcceso: code
    });

    setActiveFreight({
      id: asignadoId,
      origin: orig,
      destination: dest,
      material,
      weight,
      vehicleType,
      referencePrice: precioFinal,
      status: 'searching',
      accessCode: code,
      distanciaKm: distKm,
      duracionMinutos: durMin
    });

    // Emisión en tiempo real en canal de transportistas SARA
    SaraFletesRealtimeService.emit({
      type: 'NUEVA_SOLICITUD_FLETE',
      payload: {
        id: asignadoId,
        origen: originText,
        destino: destinationText,
        material,
        pesoTon: weight,
        tipoVehiculo: vehicleType,
        tarifaOfertadaUSD: precioFinal,
        distanciaKm: distKm,
        duracionMinutos: durMin,
        coordsOrigen: originPoint ? [originPoint.lat, originPoint.lng] : [-4.3285, -79.5560],
        coordsDestino: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : [-4.3210, -79.5620],
        coordenadasRuta: rutaCalculada?.coordenadasRuta,
        codigoAcceso: code,
        clienteNombre: clienteNombre || 'Ing. Marco Vivanco (Constructora SARA)',
        status: 'searching',
        timestamp: Date.now(),
        guiaRemision: guiaRemisionClave ? {
          claveAcceso: guiaRemisionClave,
          autorizada: guiaRemisionValidacion?.valida ?? false
        } : undefined,
        requiereEstiba: peonesEstibaCount > 0,
        peonesCount: peonesEstibaCount,
        costoEstibaUSD: costoEstibaUSD
      }
    });
  };

  // Solicitar flete directo a conductor seleccionado del radar automático
  const handleDirectDriverRequest = async (veh: VehiculoMapa) => {
    const orig = originText || 'Mi Ubicación Actual (GPS)';
    let dest = destinationText;
    if (!dest) {
      dest = 'Entrega Local (Zona Urbana)';
      setDestinationText('Entrega Local (Zona Urbana)');
    }

    const latDiff = Math.abs(veh.lat - (originPoint?.lat || userLocation?.[0] || -4.3285));
    const lngDiff = Math.abs(veh.lng - (originPoint?.lng || userLocation?.[1] || -79.5560));
    const distMeters = Math.max(180, Math.round((latDiff + lngDiff) * 111000));
    const etaMin = Math.max(2, Math.round(distMeters / 150));
    const price = proposedPrice || (tarifaEstimada?.tarifaSugeridaUSD || 3.50);

    const directOffer: DriverOffer = {
      id: `DIRECT-${veh.id}`,
      driverName: veh.nombreChofer,
      vehicleName: CATALOGO_VEHICULOS_SARA[veh.tipoVehiculo]?.nombre || 'Vehículo de Carga',
      plate: veh.placa,
      rating: veh.rating,
      tripsCount: 140,
      etaMinutes: etaMin,
      distanceMeters: distMeters,
      offeredPrice: price,
      isCounterOffer: false,
      phone: veh.telefono || '0993849182'
    };

    const distKm = rutaCalculada?.distanciaKm || 1.8;
    const durMin = rutaCalculada?.duracionMinutos || 8;
    const asignadoId = 'FLT-' + Math.floor(1000 + Math.random() * 9000);
    const code = generateAccessCode();

    await createFletesSolicitud({
      origen: orig,
      destino: dest,
      tarifa: price,
      distanciaKm: distKm,
      vehiculoKey: veh.tipoVehiculo,
      material,
      peso: weight,
      codigoAcceso: code
    });

    setActiveFreight({
      id: asignadoId,
      origin: orig,
      destination: dest,
      material,
      weight,
      vehicleType: veh.tipoVehiculo,
      referencePrice: price,
      status: 'searching',
      accessCode: code,
      distanciaKm: distKm,
      duracionMinutos: durMin
    });

    setDriverOffers([directOffer]);

    SaraFletesRealtimeService.emit({
      type: 'NUEVA_SOLICITUD_FLETE',
      payload: {
        id: asignadoId,
        origen: orig,
        destino: dest,
        material,
        pesoTon: weight,
        tipoVehiculo: veh.tipoVehiculo,
        tarifaOfertadaUSD: price,
        distanciaKm: distKm,
        duracionMinutos: durMin,
        coordsOrigen: originPoint ? [originPoint.lat, originPoint.lng] : (userLocation || [-4.3285, -79.5560]),
        coordsDestino: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : [-4.3210, -79.5620],
        coordenadasRuta: rutaCalculada?.coordenadasRuta,
        codigoAcceso: code,
        clienteNombre: clienteNombre || 'Ing. Marco Vivanco (Constructora SARA)',
        status: 'searching',
        timestamp: Date.now()
      }
    });
  };

  // Aceptar oferta de conductor en radar y notificar en tiempo real
  const handleAcceptDriverOffer = async (offer: DriverOffer) => {
    if (!activeFreight) return;
    setAssignedDriver(offer);
    setActiveFreight(prev => prev ? {
      ...prev,
      status: 'accepted',
      referencePrice: offer.offeredPrice
    } : null);

    if (activeFreight.id) {
      await updateFletesSolicitudStatus(activeFreight.id, 'asignado', activeFreight.accessCode);

      SaraFletesRealtimeService.emit({
        type: 'CLIENTE_ACEPTO_CONDUCTOR',
        payload: {
          fleteId: activeFreight.id,
          driverName: offer.driverName,
          plate: offer.plate,
          codigoAcceso: activeFreight.accessCode || '0000',
          precioAcordado: offer.offeredPrice,
          clienteNombre: activeFreight.clienteNombre || clienteNombre || 'Ing. Marco Vivanco (Constructora SARA)',
          origen: activeFreight.origin || originText,
          destino: activeFreight.destination || destinationText,
          coordsOrigen: originPoint ? [originPoint.lat, originPoint.lng] : (userLocation || [-4.3285, -79.5560]),
          coordsDestino: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : [-4.3210, -79.5620],
          coordenadasRuta: rutaCalculada?.coordenadasRuta,
          distanciaKm: activeFreight.distanciaKm || rutaCalculada?.distanciaKm || 1.8,
          duracionMinutos: activeFreight.duracionMinutos || rutaCalculada?.duracionMinutos || 8,
          material: activeFreight.material,
          pesoTon: activeFreight.weight
        }
      });
    }
  };

  // Rechazar oferta específica de conductor
  const handleRejectDriverOffer = (offerId: string) => {
    setDriverOffers(prev => prev.filter(o => o.id !== offerId));
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
        <div className="flex items-center gap-4">
          <ModuleBrandLogo modulo="fletes" size="sm" showBackToHolding={false} />
          <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            GPS MTOP En Vivo
          </span>
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

                          {/* Campos de texto con botones contextuales y Autocomplete Nacional */}
                          <div className="flex-1 space-y-2">
                            {/* Input Origen */}
                            <div className="relative" ref={originInputWrapperRef}>
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
                              <div className="relative">
                                <input
                                  type="text"
                                  value={originText}
                                  onChange={(e) => handleOriginInputChange(e.target.value)}
                                  onFocus={() => {
                                    if (originSuggestions.length > 0) setShowOriginSuggestions(true);
                                  }}
                                  placeholder="Escribe dirección, hito o cantón nacional 🟢"
                                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-7"
                                />
                                {isSearchingOrigin && (
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  </div>
                                )}
                              </div>

                              {/* Dropdown Predictivo de Sugerencias en Tiempo Real (Origen) */}
                              {showOriginSuggestions && originSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800">
                                  {originSuggestions.map((sug) => (
                                    <button
                                      key={sug.id}
                                      type="button"
                                      onClick={() => handleSelectOriginSuggestion(sug)}
                                      className="w-full text-left p-2.5 hover:bg-slate-800/90 transition-colors flex items-center gap-2.5 group"
                                    >
                                      <span className="shrink-0">
                                        {sug.tipo === 'puerto' && '🚢'}
                                        {sug.tipo === 'terminal' && '🚌'}
                                        {sug.tipo === 'canton' && '🏙️'}
                                        {sug.tipo === 'via' && '🛣️'}
                                        {sug.tipo === 'hito' && '🏢'}
                                        {sug.tipo === 'geo' && '📍'}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                          {sug.titulo}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">
                                          {sug.subtitulo}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Input Destino */}
                            <div className="relative" ref={destInputWrapperRef}>
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
                              <div className="relative">
                                <input
                                  type="text"
                                  value={destinationText}
                                  onChange={(e) => handleDestinationInputChange(e.target.value)}
                                  onFocus={() => {
                                    if (destinationSuggestions.length > 0) setShowDestSuggestions(true);
                                  }}
                                  placeholder="Escribe dirección, hito o cantón nacional 🚩"
                                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-7"
                                />
                                {isSearchingDest && (
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  </div>
                                )}
                              </div>

                              {/* Dropdown Predictivo de Sugerencias en Tiempo Real (Destino) */}
                              {showDestSuggestions && destinationSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800">
                                  {destinationSuggestions.map((sug) => (
                                    <button
                                      key={sug.id}
                                      type="button"
                                      onClick={() => handleSelectDestinationSuggestion(sug)}
                                      className="w-full text-left p-2.5 hover:bg-slate-800/90 transition-colors flex items-center gap-2.5 group"
                                    >
                                      <span className="shrink-0">
                                        {sug.tipo === 'puerto' && '🚢'}
                                        {sug.tipo === 'terminal' && '🚌'}
                                        {sug.tipo === 'canton' && '🏙️'}
                                        {sug.tipo === 'via' && '🛣️'}
                                        {sug.tipo === 'hito' && '🏢'}
                                        {sug.tipo === 'geo' && '📍'}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                          {sug.titulo}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">
                                          {sug.subtitulo}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
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

                        {/* Chips rápidos de rutas estratégicas a nivel nacional */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-thin">
                          <span className="text-slate-500 font-semibold shrink-0">Rutas Nacionales:</span>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'MAtecons Chile, Cariamanga', [-4.3292, -79.5548], 'Cariamanga', 'Loja',
                              'El Dorado, Cariamanga', [-4.3210, -79.5620], 'Cariamanga', 'Loja'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Cariamanga Centro
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Terminal Terrestre Reina del Cisne (Loja)', [-3.9785, -79.2045], 'Loja', 'Loja',
                              'Cantera de Áridos Bella María (Loja)', [-3.9650, -79.2150], 'Loja', 'Loja'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Loja · Bella María
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Terminal Quitumbe, Quito', [-0.2917, -78.5522], 'Quito', 'Pichincha',
                              'Parque La Carolina (Torre Qorner), Quito', [-0.1807, -78.4820], 'Quito', 'Pichincha'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Quito · Quitumbe a Carolina
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Terminal Portuario Contecon (Puerto Marítimo)', [-2.2844, -79.9011], 'Guayaquil', 'Guayas',
                              'Vía a Daule Km 12 (Zona Industrial), Guayaquil', [-2.1200, -79.9400], 'Guayaquil', 'Guayas'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Guayaquil · Puerto a Vía Daule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Parque Industrial de Cuenca', [-2.8750, -78.9750], 'Cuenca', 'Azuay',
                              'Challuabamba (Zona Residencial), Cuenca', [-2.8620, -78.9320], 'Cuenca', 'Azuay'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Cuenca · Parque Industrial
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Mercado Mayorista de Ambato', [-1.2689, -78.6389], 'Ambato', 'Tungurahua',
                              'Parque Industrial de Ambato', [-1.2189, -78.5989], 'Ambato', 'Tungurahua'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Ambato · Mayorista
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Terminal Portuario Yilport Puerto Bolívar', [-3.2644, -79.9989], 'Machala', 'El Oro',
                              'Av. 25 de Junio (Centro Comercial), Machala', [-3.2600, -79.9550], 'Machala', 'El Oro'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Machala · Puerto Bolívar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectRutaRapida(
                              'Terminal Portuario de Manta (TPM)', [-0.9450, -80.7228], 'Manta', 'Manabí',
                              'Playa El Murciélago (Zona Hotelera), Manta', [-0.9440, -80.7300], 'Manta', 'Manabí'
                            )}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors"
                          >
                            Manta · Puerto a Murciélago
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
                                onClick={() => {
                                  setVehicleType(catKey);
                                  const distKm = rutaCalculada?.distanciaKm || 1.8;
                                  const tarifa = SaraFreightPricingService.calcularTarifa(distKm, weight, catKey, material);
                                  setTarifaEstimada(tarifa);
                                  setProposedPrice(tarifa.tarifaSugeridaUSD);
                                }}
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

                      {/* RADAR AUTOMÁTICO DE UNIDADES CERCANAS (AL SELECCIONAR VEHÍCULO SIN ESPERAR A SOLICITAR FLETE) */}
                      {!activeFreight && (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                Radar Activo: {CATALOGO_VEHICULOS_SARA[vehicleType]?.nombre}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              {vehiculosDisponiblesTipo.length} unidades en la zona
                            </span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {vehiculosDisponiblesTipo.map((veh) => {
                              const latDiff = Math.abs(veh.lat - (originPoint?.lat || userLocation?.[0] || -4.3285));
                              const lngDiff = Math.abs(veh.lng - (originPoint?.lng || userLocation?.[1] || -79.5560));
                              const distMeters = Math.max(180, Math.round((latDiff + lngDiff) * 111000));
                              const etaMin = Math.max(2, Math.round(distMeters / 150));
                              const estPrice = proposedPrice || (tarifaEstimada?.tarifaSugeridaUSD || 3.50);

                              return (
                                <div
                                  key={veh.id}
                                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 text-xs group shadow-sm"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                                      {veh.nombreChofer.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-white text-xs truncate">{veh.nombreChofer}</span>
                                        <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0">
                                          {veh.placa}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <span className="text-amber-400 font-bold">★ {veh.rating}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-emerald-400 font-semibold">⚡ ~{etaMin} min ({distMeters}m)</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-slate-400 truncate">Saldo OK</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-right hidden sm:block">
                                      <p className="font-mono font-bold text-xs text-white">${estPrice.toFixed(2)}</p>
                                      <p className="text-[8px] text-slate-500 font-semibold">USD</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDirectDriverRequest(veh)}
                                      className="bg-slate-800 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 group-hover:border-amber-500 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                                    >
                                      <span>Pedir</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={handlePedirFlete}
                            className="w-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm mt-1"
                          >
                            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                            <span>Transmitir Oferta (${(proposedPrice || 2.80).toFixed(2)} USD) a unidades en radar</span>
                          </button>
                        </div>
                      )}

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

                      {/* ESTADO DE FLETE ACTIVO Y SEGUIMIENTO CON OFERTAS DE CONDUCTORES */}
                      {activeFreight && (
                        <div className="bg-slate-950 border border-amber-500/60 p-4 rounded-2xl space-y-3">
                          {activeFreight.status === 'searching' && (
                            <div className="space-y-3">
                              {/* SECCIÓN NOTIFICANDO A CONDUCTORES (IDÉNTICO A IMAGEN 1) */}
                              <div className="text-center space-y-2 py-1">
                                <div className="w-9 h-9 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                <div>
                                  <h3 className="font-black text-white text-base">Notificando a Conductores...</h3>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Transmitiendo oferta a {getVehiclePlural(activeFreight.vehicleType)} en radar
                                  </p>
                                </div>
                                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 max-w-[260px] mx-auto">
                                  <span className="text-[10px] text-slate-400 block font-medium">Tu oferta actual:</span>
                                  <p className="text-xl font-black text-amber-500 font-mono">
                                    ${activeFreight.referencePrice.toFixed(2)} USD
                                  </p>
                                </div>
                              </div>

                              {/* LISTA DE OFERTAS EN TIEMPO REAL */}
                              {driverOffers.length === 0 ? (
                                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-center space-y-2">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                                    <Truck className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-300">Esperando respuesta de conductores...</p>
                                  <p className="text-[10px] text-slate-500">Transmitiendo solicitud a los vehículos visibles en el mapa</p>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                                    <span>Conductores que respondieron ({driverOffers.length})</span>
                                    <span className="text-emerald-400 font-mono">En vivo</span>
                                  </div>

                                  {driverOffers.map((offer) => (
                                    <div
                                      key={offer.id}
                                      className="bg-slate-900 border border-slate-700/80 hover:border-amber-500/70 p-3 rounded-2xl transition-all shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-base shadow-inner">
                                            {offer.driverName.charAt(0)}
                                          </div>
                                          <div>
                                            <h4 className="font-black text-white text-xs">{offer.driverName}</h4>
                                            <p className="text-[10px] text-slate-400">{offer.vehicleName} · <span className="font-mono text-slate-300 font-bold">{offer.plate}</span></p>
                                            <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                                              <span>★ {offer.rating}</span>
                                              <span className="text-slate-500 font-normal">({offer.tripsCount} viajes)</span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <p className="text-base font-black font-mono text-emerald-400">
                                            ${offer.offeredPrice.toFixed(2)} <span className="text-[10px] font-sans font-semibold text-slate-400">USD</span>
                                          </p>
                                          <span className="text-[9px] font-bold text-slate-300 flex items-center justify-end gap-1 mt-0.5">
                                            ⚡ {offer.etaMinutes} min ({offer.distanceMeters}m)
                                          </span>
                                          {offer.isCounterOffer && (
                                            <span className="inline-block text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-500/40 mt-1">
                                              Contraoferta
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex gap-2 pt-1 border-t border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => handleAcceptDriverOffer(offer)}
                                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          Aceptar este Conductor
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRejectDriverOffer(offer.id)}
                                          className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                        >
                                          Rechazar
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (activeFreight) {
                                    SaraFletesRealtimeService.emit({
                                      type: 'CANCELAR_SOLICITUD_FLETE',
                                      payload: { fleteId: activeFreight.id }
                                    });
                                  }
                                  setActiveFreight(null);
                                  setDriverOffers([]);
                                }}
                                className="w-full text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors pt-1"
                              >
                                Cancelar Búsqueda
                              </button>
                            </div>
                          )}

                          {(activeFreight.status === 'accepted' || activeFreight.status === 'in_transit') && (
                            <div className="space-y-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                                  activeFreight.status === 'in_transit'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                }`}>
                                  {activeFreight.status === 'in_transit' ? (
                                    <Truck className="w-7 h-7 animate-bounce" />
                                  ) : (
                                    <CheckCircle className="w-7 h-7" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                                    activeFreight.status === 'in_transit'
                                      ? 'text-amber-400 bg-amber-950/80 border-amber-500/40'
                                      : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                                  }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                                    {activeFreight.status === 'in_transit' ? '¡Flete en Recorrido Activo!' : '¡Conductor en Camino al Punto de Carga!'}
                                  </span>
                                  <h3 className="font-black text-white text-base mt-1">
                                    {assignedDriver?.driverName || 'Conductor SARA'}
                                  </h3>
                                  <p className="text-xs text-slate-400">
                                    {assignedDriver?.vehicleName} · Placa: <strong className="text-white font-mono">{assignedDriver?.plate}</strong>
                                  </p>
                                </div>
                              </div>

                              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                <div className="text-left">
                                  <span className="text-slate-400 text-[10px] block">Tarifa acordada:</span>
                                  <p className="text-xl font-black font-mono text-emerald-400">
                                    ${activeFreight.referencePrice.toFixed(2)} USD
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[10px] block">
                                    {activeFreight.status === 'in_transit' ? 'Estado del Recorrido:' : 'Llegada estimada:'}
                                  </span>
                                  <p className="text-sm font-bold text-white flex items-center justify-end gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    {activeFreight.status === 'in_transit' ? 'Carga a bordo (~38 km/h)' : `~${assignedDriver?.etaMinutes || 3} min`}
                                  </p>
                                </div>
                              </div>

                              {/* PIN de seguridad de entrega / embarque */}
                              <div className={`border p-3.5 rounded-xl text-center ${
                                activeFreight.status === 'in_transit'
                                  ? 'bg-amber-950/30 border-amber-500/40'
                                  : 'bg-emerald-950/40 border-emerald-500/40'
                              }`}>
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-0.5">
                                  {activeFreight.status === 'in_transit' ? 'Código Validado de Entrega' : 'Código PIN de Embarque'}
                                </p>
                                <p className="text-3xl font-black text-white font-mono tracking-widest">
                                  {activeFreight.accessCode}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {activeFreight.status === 'in_transit'
                                    ? 'El conductor validó el código e inició el recorrido de entrega'
                                    : 'Indica este código al conductor para validar la carga e iniciar el viaje'}
                                </p>
                              </div>

                              {/* Botón de Compartir Seguimiento Satelital en Vivo por WhatsApp (Zero-Login) */}
                              <button
                                type="button"
                                onClick={() => {
                                  const trackingToken = activeFreight.id || `TRK-${Date.now().toString().slice(-6)}`;
                                  SaraFletesRealtimeService.savePublicTrackingSnapshot(trackingToken, {
                                    driverName: assignedDriver?.driverName || "David Sarango",
                                    plate: assignedDriver?.plate || "PCX-4590",
                                    origin: activeFreight.origin,
                                    destination: activeFreight.destination,
                                    originCoords: originPoint ? [originPoint.lat, originPoint.lng] : [-4.3248, -79.5562],
                                    destinationCoords: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : [-3.9931, -79.2042],
                                    material: activeFreight.material,
                                    distanceKm: rutaCalculada?.distanciaKm || 4.2
                                  });
                                  const shareUrl = `${window.location.origin}/fletes/rastreo/${trackingToken}`;
                                  const text = encodeURIComponent(
                                    `🚚 *SARA-FLETES: Rastreo de Viaje en Vivo*\n\n` +
                                    `• Chofer: ${assignedDriver?.driverName || "Conductor SARA"} (${assignedDriver?.plate || "PBA-1234"})\n` +
                                    `• Carga: ${activeFreight.material}\n` +
                                    `• PIN de Recepción: ${activeFreight.accessCode}\n\n` +
                                    `📍 Sigue el camión en tiempo real aquí (sin necesidad de iniciar sesión):\n${shareUrl}`
                                  );
                                  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                                }}
                                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold py-2.5 px-3 rounded-xl border border-emerald-500/40 text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                              >
                                <Share2 className="w-4 h-4 text-emerald-400" />
                                <span>Compartir Rastreo por WhatsApp con Residente de Obra</span>
                              </button>

                              {/* Botones de contacto directo */}
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`tel:${assignedDriver?.phone || '0993849182'}`}
                                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                  📞 Llamar
                                </a>
                                <a
                                  href={`https://wa.me/593${(assignedDriver?.phone || '0993849182').replace(/^0/, '')}?text=Hola%20${encodeURIComponent(assignedDriver?.driverName || 'amigo')},%20solicité%20un%20flete%20en%20SARA%20Fletes.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                                >
                                  💬 WhatsApp
                                </a>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveFreight(null);
                                  setDriverOffers([]);
                                  setAssignedDriver(null);
                                }}
                                className="w-full text-xs text-amber-400 hover:text-amber-300 font-bold underline text-center pt-1"
                              >
                                Finalizar viaje o solicitar otro flete
                              </button>
                            </div>
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
                        <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl text-center space-y-2.5">
                          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                          <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                              ¡Viaje Asignado y Confirmado!
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              El cliente ha aceptado la propuesta en tiempo real.
                            </p>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-left text-xs space-y-1.5">
                            {assignedDriver && (
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                <span className="text-slate-400 text-[11px]">Conductor:</span>
                                <span className="font-bold text-white">
                                  {assignedDriver.driverName} <span className="font-mono text-amber-400">({assignedDriver.plate})</span>
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                              <span className="text-slate-400 text-[11px]">Tarifa Acordada:</span>
                              <span className="font-black text-emerald-400 font-mono text-sm">
                                ${activeFreight.referencePrice.toFixed(2)} USD
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-[11px]">Distancia Ruta:</span>
                              <span className="font-bold text-slate-200 font-mono">
                                {activeFreight.distanciaKm ? `${activeFreight.distanciaKm.toFixed(1)} km` : '~2 km'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-900 border border-emerald-500/30 p-2.5 rounded-xl">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                              Código PIN requerido en destino
                            </p>
                            <p className="text-2xl font-black text-white font-mono tracking-widest mt-0.5">
                              {activeFreight.accessCode}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              Solicita este código al cliente al descargar el material
                            </p>
                          </div>
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

      {/* NOTIFICACIÓN TOAST DE CONFIRMACIÓN DE PAGO Y CALIFICACIÓN */}
      {paymentSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-emerald-500/80 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-lg w-[92%] sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-xs">
            <h5 className="font-bold text-emerald-400">¡Viaje y Pago Finalizados con Éxito!</h5>
            <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{paymentSuccessToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentSuccessToast(null)}
            className="ml-auto text-slate-400 hover:text-white text-xs font-bold p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODAL INTEGRADO DE PAGO Y CALIFICACIÓN AL CONDUCTOR (COMPONENTE MODULAR) */}
      <SaraDriverRatingModal
        isOpen={isRatingModalOpen}
        driverToRate={driverToRate}
        paymentDetails={paymentDetails}
        onClose={() => {
          setIsRatingModalOpen(false);
          setDriverToRate(null);
        }}
        onOpenPaymentGateway={() => setIsPaymentGatewayOpen(true)}
        onRatingSubmitted={(msg) => {
          setIsRatingModalOpen(false);
          setPaymentSuccessToast(msg);
          setDriverToRate(null);
          setTimeout(() => setPaymentSuccessToast(null), 6000);
        }}
      />      {/* MODAL PASARELA DE PAGO DIGITAL: DATOS BANCARIOS DEL CONDUCTOR, QRS Y TARJETA */}
      {isPaymentGatewayOpen && driverToRate && (
        <SaraFreightPaymentGatewayModal
          isOpen={isPaymentGatewayOpen}
          onClose={() => setIsPaymentGatewayOpen(false)}
          onPaymentSuccess={(details) => {
            setPaymentDetails({
              method: details.method,
              methodName: details.methodName,
              reference: details.reference,
              amount: details.amount
            });
            setPaymentMethod(details.method === 'transferencia' ? 'transferencia' : 'tarjeta');
            setIsPaymentGatewayOpen(false);
          }}
          amount={driverToRate.price}
          driverName={driverToRate.driverName}
          driverPlate={driverToRate.plate}
          driverVehicle={driverToRate.vehicleName}
          fleteId={driverToRate.fleteId}
          driverBankInfo={SaraFletesRealtimeService.getDriverBankConfig(driverToRate.plate)}
        />
      )}

      {/* Botón de Pánico SOS 24/7 Flotante */}
      <SaraFloatingSosButton
        userType="cliente"
        fleteId={activeFreight?.id}
        driverName={assignedDriver?.driverName || "David Sarango"}
        plate={assignedDriver?.plate || "PCX-4590"}
        currentCoords={originPoint ? [originPoint.lat, originPoint.lng] : [-4.3248, -79.5562]}
      />
    </div>
  );
}
