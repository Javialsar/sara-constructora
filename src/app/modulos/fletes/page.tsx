'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Truck, 
  MapPin, 
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
import { SaraFletesExitConfirmModal } from '@/components/fletes/SaraFletesExitConfirmModal';
import { SaraDriverSecurityModal, DriverSecurityProfile } from '@/components/fletes/SaraDriverSecurityModal';
import { SaraActiveTripCard } from '@/components/fletes/SaraActiveTripCard';
import { SaraFletesWizard, DESTINOS_FRECUENTES } from '@/components/fletes/SaraFletesWizard';
import { assignVehicleCategory } from '@/lib/fletes/assignVehicleCategory';
import { useFletesFormPersistence } from '@/lib/fletes/useFletesFormPersistence';
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
import SaraMultimodalTabBar from '@/components/fletes/SaraMultimodalTabBar';
import SaraViajesMandaditosQuickOrder from '@/components/fletes/SaraViajesMandaditosQuickOrder';
import type { MultimodalVerticalKey } from '@/lib/agents/fletes/saraFletesUXUIDesigner';

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
  
  const [serviceType, setServiceType] = useState<MultimodalVerticalKey>('fletes');
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

  // Hook de persistencia de formulario en localStorage
  const { draft, isLoaded: draftLoaded, updateDraft } = useFletesFormPersistence();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [unitType, setUnitType] = useState<'TON' | 'M3'>('TON');
  const [helpersCount, setHelpersCount] = useState<number>(0);
  const [tasaBotaderoEnabled, setTasaBotaderoEnabled] = useState<boolean>(false);

  // Modales de Seguridad y Salida
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedDriverForSecurity, setSelectedDriverForSecurity] = useState<DriverSecurityProfile | null>(null);

  // 3. Parámetros de la Carga (Flete) y Subasta inDrive
  const [vehicleType, setVehicleType] = useState<CategoriaVehiculo>('PICKUP_1T');
  const [material, setMaterial] = useState('Arena / Ripio');
  const [weight, setWeight] = useState<number>(1);
  const [sacosCementoCount, setSacosCementoCount] = useState<number>(20);
  const [tarifaEstimada, setTarifaEstimada] = useState<ResultadoTarifaFlete | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [bottomSheetLevel, setBottomSheetLevel] = useState<'peek' | 'half' | 'full'>('half');

  // Sincronizar datos restaurados desde draft al iniciar
  useEffect(() => {
    if (draftLoaded) {
      if (draft.originText) setOriginText(draft.originText);
      if (draft.destinationText) setDestinationText(draft.destinationText);
      if (draft.originPoint) setOriginPoint(draft.originPoint);
      if (draft.destinationPoint) setDestinationPoint(draft.destinationPoint);
      if (draft.material) setMaterial(draft.material);
      if (draft.weight) setWeight(draft.weight);
      if (draft.unitType) setUnitType(draft.unitType);
      if (draft.helpersCount !== undefined) setHelpersCount(draft.helpersCount);
      if (draft.tasaBotaderoEnabled !== undefined) setTasaBotaderoEnabled(draft.tasaBotaderoEnabled);
      if (draft.proposedPrice !== null) setProposedPrice(draft.proposedPrice);
      if (draft.sacosCementoCount) setSacosCementoCount(draft.sacosCementoCount);
      if (draft.activeStep) setActiveStep(draft.activeStep);
    }
  }, [draftLoaded]);

  // Motor puro y reactivo de asignación de vehículo (Carga vs Tipo de Vehículo)
  const assignedVehicleInfo = useMemo(() => {
    return assignVehicleCategory(material, weight);
  }, [material, weight]);

  // Sincronizar vehicleType automáticamente con la regla recomendada
  useEffect(() => {
    if (assignedVehicleInfo.category && assignedVehicleInfo.category !== vehicleType) {
      setVehicleType(assignedVehicleInfo.category);
    }
  }, [assignedVehicleInfo.category]);

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

  // Validación Inteligente de Compatibilidad de Carga & Material
  const materialValidation = useMemo(() => {
    const isAridos = material === 'Arena / Ripio' || material === 'Desalojo de Escombros';
    const isVarillas = material === 'Varillas de Acero';
    const isSacos = material === 'Cemento (Sacos)' || material === 'Acabados / Cerámica';

    // Regla 1: Áridos / Escombros
    const aridosBloqueado = isAridos && (vehicleType === 'FURGON_3T');
    const aridosAdvertencia = isAridos && (vehicleType === 'PICKUP_1T' && weight > 1.2);

    // Regla 2: Varillas de Acero (6m - 12m)
    const varillasBloqueado = isVarillas && vehicleType === 'PICKUP_1T';
    const varillasRecomendado = isVarillas && (vehicleType === 'CAMION_10T' || vehicleType === 'TRACTO_3S3');

    // Regla 3: Capacidad física estricta
    const vInfo = CATALOGO_VEHICULOS_SARA[vehicleType];
    const sobrecapacidad = weight > (vInfo?.capacidadTon || 1);

    let alertMessage: string | null = null;
    let isBlocked = false;

    if (aridosBloqueado) {
      alertMessage = '⚠️ No se puede cargar áridos o escombros a granel en Furgón Cerrado (dificulta descarga sin volquete).';
      isBlocked = true;
    } else if (aridosAdvertencia) {
      alertMessage = '⚠️ Para más de 1.2T de áridos se recomienda Volqueta de Obra (14 m³).';
    } else if (varillasBloqueado) {
      alertMessage = '⛔ Varillas de Acero (6m a 12m) prohibidas en Camioneta Pickup por normativa MTOP (riesgo de voladizo).';
      isBlocked = true;
    } else if (sobrecapacidad) {
      alertMessage = '⛔ Peso de carga (' + weight + 'T) supera la capacidad del vehículo (' + (vInfo?.capacidadTon || 1) + 'T).';
      isBlocked = true;
    }

    return {
      isBlocked,
      alertMessage,
      isAridos,
      isVarillas,
      isSacos,
      varillasRecomendado
    };
  }, [material, vehicleType, weight]);

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
    if (originText && destinationText && serviceType === 'fletes') {
      const timer = setTimeout(() => {
        resolverRutaYTarifa(originText, destinationText, vehicleType, weight, material);
      }, 400);
      return () => clearTimeout(timer);
    } else if (serviceType === 'fletes' && !destinationText) {
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

        {/* App exclusiva del CLIENTE: el conductor opera en /modulos/fletes/mi-perfil (acceso desde /fletes) */}
        <div className="flex items-center gap-2">
          <Link
            href="/fletes?elegir=1"
            className="text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            Cambiar perfil
          </Link>
          <button
            type="button"
            onClick={() => setIsExitModalOpen(true)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1.5 transition-colors"
          >
            Salir
          </button>
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
            rutaCoordenadas={serviceType === 'fletes' ? rutaCalculada?.coordenadasRuta : undefined}
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
            /* Móvil: Bottom Sheet en 3 niveles */
            absolute bottom-0 left-0 right-0 rounded-t-3xl
            ${bottomSheetLevel === 'peek' ? 'h-[72px] overflow-hidden' : ''}
            ${bottomSheetLevel === 'half' ? 'max-h-[75vh] h-[75vh]' : ''}
            ${bottomSheetLevel === 'full' ? 'max-h-[92vh] h-[92vh]' : ''}
            /* Desktop: Tarjeta Flotante Lateral */
            lg:bottom-auto lg:top-4 lg:left-4 lg:right-auto lg:w-[470px] lg:max-h-[calc(100vh-88px)] lg:h-auto lg:rounded-2xl
            ${isPanelCollapsed ? 'translate-y-[calc(100%-48px)] lg:translate-y-0 lg:w-[320px] lg:max-h-[64px]' : ''}
          `}
        >
          {/* Header del Panel con Botón de Minimizar / Maximizar y controles de Bottom Sheet */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            {/* Tirador táctil para móviles con cambio de nivel */}
            <div 
              onClick={() => {
                setBottomSheetLevel(prev => prev === 'peek' ? 'half' : prev === 'half' ? 'full' : 'peek');
              }}
              className="lg:hidden absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-600 active:bg-amber-500 rounded-full cursor-pointer transition-colors" 
              title="Deslizar Bottom Sheet"
            />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">
                {serviceType === 'viajes' ? '🚕 Viajes Rápidos' : serviceType === 'mandaditos' ? '📦 Mandaditos Express' : serviceType === 'fletes' ? '🚛 Flete On-Demand' : '🔑 Renta de Vehículos'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Controles de Nivel Móvil */}
              <div className="lg:hidden flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setBottomSheetLevel('peek')}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${bottomSheetLevel === 'peek' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Ruta
                </button>
                <button
                  type="button"
                  onClick={() => setBottomSheetLevel('half')}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${bottomSheetLevel === 'half' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Carga
                </button>
                <button
                  type="button"
                  onClick={() => setBottomSheetLevel('full')}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${bottomSheetLevel === 'full' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Ofertas
                </button>
              </div>
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
            <div className="p-4 space-y-4 overflow-y-auto max-h-[82vh] lg:max-h-[calc(100vh-160px)]">
              
              {/* MODO CLIENTE / PÚBLICO GENERAL */}
              {(
                <>
                  {/* SELECTOR MULTIMODAL UNIFICADO: VIAJES (UBER/DIDI), MANDADITOS, FLETES (CARGA) Y RENTA */}
                  <div className="sticky top-0 z-20 pb-1 bg-slate-900/90 backdrop-blur-md">
                    <SaraMultimodalTabBar
                      activeTab={serviceType}
                      onChangeTab={(tab) => {
                        setServiceType(tab);
                        // Si el flete estaba activo o buscando, resetearlo para permitir interactuar con la nueva modalidad
                        if (activeFreight) {
                          setActiveFreight(null);
                          setDriverOffers([]);
                        }
                        // Asegurar que en móvil el bottom sheet se expanda al cambiar de pestaña
                        if (bottomSheetLevel === 'peek') {
                          setBottomSheetLevel('half');
                        }
                      }}
                    />
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SECCIÓN VIAJES / MANDADITOS (PASAJEROS UBER/DIDI Y EXPRESS) */}
                  {/* -------------------------------------------------------- */}
                  {(serviceType === 'viajes' || serviceType === 'mandaditos') && !activeFreight && (
                    <div className="space-y-3">
                      {/* Selectores de Ruta Rápidos para Viajes */}
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                            {serviceType === 'viajes' ? '🚖 Punto de Partida y Destino' : '📦 Retiro y Entrega de Paquete'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rutaCalculada ? `${rutaCalculada.distanciaKm.toFixed(1)} km · ${rutaCalculada.duracionMinutos} min` : 'GPS Directo'}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <input
                              type="text"
                              value={originText}
                              onChange={(e) => handleOriginInputChange(e.target.value)}
                              placeholder="Punto de partida (GPS)"
                              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                            />
                          </div>
                          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                            <input
                              type="text"
                              value={destinationText}
                              onChange={(e) => handleDestinationInputChange(e.target.value)}
                              placeholder="¿A dónde vas?"
                              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      <SaraViajesMandaditosQuickOrder
                        modalidad={serviceType}
                        distanciaKm={rutaCalculada?.distanciaKm || 3.2}
                        duracionEstimadaMin={rutaCalculada?.duracionMinutos || 9}
                        origenNombre={originText || 'Mi Ubicación Actual'}
                        destinoNombre={destinationText || 'Destino en Cariamanga'}
                        isRequesting={false}
                        onRequestConfirm={(params) => {
                          // Iniciar solicitud inmediata para viajes o mandaditos
                          const simulatedReq: FreightRequest = {
                            id: `SARA-${serviceType.toUpperCase()}-${Date.now().toString().slice(-5)}`,
                            origin: originText || 'Mi Ubicación GPS',
                            destination: destinationText || 'Destino Seleccionado',
                            material: serviceType === 'viajes' ? `Viaje de ${params.pasajerosCount || 1} pasajero(s)` : `Mandadito: ${params.paqueteTipo || 'Paquete Express'}`,
                            weight: 0.1,
                            vehicleType: 'PICKUP_1T',
                            referencePrice: params.tarifaUSD,
                            status: 'searching',
                            accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
                            distanciaKm: rutaCalculada?.distanciaKm || 3.2,
                            duracionMinutos: rutaCalculada?.duracionMinutos || 9,
                            clienteNombre: 'Usuario SARA'
                          };
                          setActiveFreight(simulatedReq);
                          setProposedPrice(params.tarifaUSD);

                          // Emitir ofertas dinámicas simuladas en tiempo real
                          setTimeout(() => {
                            setDriverOffers([
                              {
                                id: 'OFFER-VIAJE-1',
                                driverName: 'Manuel Cárdenas',
                                vehicleName: params.vehiculoNombre,
                                plate: 'LBA-2341',
                                phone: '0987654321',
                                offeredPrice: params.tarifaUSD,
                                etaMinutes: 3,
                                distanceMeters: 450,
                                rating: 4.9,
                                tripsCount: 312,
                                isCounterOffer: false
                              },
                              {
                                id: 'OFFER-VIAJE-2',
                                driverName: 'David Sarango',
                                vehicleName: params.vehiculoNombre,
                                plate: 'PCX-4590',
                                phone: '0991234567',
                                offeredPrice: +(params.tarifaUSD + 0.50).toFixed(2),
                                etaMinutes: 5,
                                distanceMeters: 750,
                                rating: 4.8,
                                tripsCount: 184,
                                isCounterOffer: true
                              }
                            ]);
                          }, 1200);
                        }}
                      />
                    </div>
                  )}

                  {/* -------------------------------------------------------- */}
                  {/* SECCIÓN A: FLETE DE CARGA ON-DEMAND */}
                  {/* -------------------------------------------------------- */}
                  {serviceType === 'fletes' && (
                    <>
                      {/* WIZARD VISUAL COMPLETO: RUTA, MATERIAL, EXTRAS Y TARIFA */}
                      <SaraFletesWizard
                        activeStep={activeStep}
                        setActiveStep={(step) => {
                          setActiveStep(step);
                          updateDraft({ activeStep: step });
                        }}
                        originText={originText}
                        destinationText={destinationText}
                        onOriginChange={(val) => {
                          handleOriginInputChange(val);
                          updateDraft({ originText: val });
                        }}
                        onDestinationChange={(val) => {
                          handleDestinationInputChange(val);
                          updateDraft({ destinationText: val });
                        }}
                        onSelectDestinoFrecuente={(dest) => {
                          handleSelectRutaRapida(
                            originText || 'Punto de Carga',
                            originPoint ? [originPoint.lat, originPoint.lng] : [-4.3285, -79.5560],
                            originPoint?.ciudad || 'Loja',
                            originPoint?.provincia || 'Loja',
                            dest.nombre,
                            dest.coords,
                            dest.canton,
                            dest.provincia
                          );
                          updateDraft({
                            destinationText: dest.nombre,
                            destinationPoint: { 
                              nombre: dest.nombre, 
                              lat: dest.coords[0], 
                              lng: dest.coords[1], 
                              ciudad: dest.canton, 
                              provincia: dest.provincia 
                            }
                          });
                        }}
                        onSwapRoute={handleSwapRoute}
                        onUseGpsOrigin={handleUsarMiUbicacionComoOrigen}
                        onMarkOriginOnMap={() => setMapClickMode(mapClickMode === 'origen' ? null : 'origen')}
                        onMarkDestOnMap={() => setMapClickMode(mapClickMode === 'destino' ? null : 'destino')}
                        mapClickMode={mapClickMode}
                        selectedMaterial={material}
                        onSelectMaterial={(matName) => {
                          setMaterial(matName);
                          updateDraft({ material: matName });
                          if (rutaCalculada) {
                            const tarifa = SaraFreightPricingService.calcularTarifa(rutaCalculada.distanciaKm, weight, vehicleType, matName);
                            setTarifaEstimada(tarifa);
                            setProposedPrice(tarifa.tarifaSugeridaUSD);
                            updateDraft({ proposedPrice: tarifa.tarifaSugeridaUSD });
                          }
                        }}
                        weight={weight}
                        onWeightChange={(val) => {
                          setWeight(val);
                          updateDraft({ weight: val });
                          if (rutaCalculada) {
                            const tarifa = SaraFreightPricingService.calcularTarifa(rutaCalculada.distanciaKm, val, vehicleType, material);
                            setTarifaEstimada(tarifa);
                            setProposedPrice(tarifa.tarifaSugeridaUSD);
                            updateDraft({ proposedPrice: tarifa.tarifaSugeridaUSD });
                          }
                        }}
                        unitType={unitType}
                        onUnitTypeChange={(u) => {
                          setUnitType(u);
                          updateDraft({ unitType: u });
                        }}
                        sacosCementoCount={sacosCementoCount}
                        onSacosCementoChange={(count) => {
                          setSacosCementoCount(count);
                          updateDraft({ sacosCementoCount: count });
                        }}
                        helpersCount={helpersCount}
                        onHelpersChange={(cnt) => {
                          setHelpersCount(cnt);
                          setPeonesEstibaCount(cnt);
                          updateDraft({ helpersCount: cnt });
                        }}
                        tasaBotaderoEnabled={tasaBotaderoEnabled}
                        onTasaBotaderoToggle={(en) => {
                          setTasaBotaderoEnabled(en);
                          updateDraft({ tasaBotaderoEnabled: en });
                        }}
                        suggestedPrice={tarifaEstimada?.tarifaSugeridaUSD || 2.80}
                        proposedPrice={proposedPrice || (tarifaEstimada?.tarifaSugeridaUSD || 2.80)}
                        onAdjustPrice={handleAdjustPrice}
                        acceptanceProbability={acceptanceProbability}
                        isCalculatingRoute={isCalculatingRoute}
                        onTransmitOffer={handlePedirFlete}
                        assignedVehicleInfo={assignedVehicleInfo}
                        selectedVehicleType={vehicleType}
                        onSelectVehicleType={(cat) => {
                          setVehicleType(cat);
                          if (rutaCalculada) {
                            const tarifa = SaraFreightPricingService.calcularTarifa(rutaCalculada.distanciaKm, weight, cat, material);
                            setTarifaEstimada(tarifa);
                            setProposedPrice(tarifa.tarifaSugeridaUSD);
                          }
                        }}
                        distanciaKm={rutaCalculada?.distanciaKm || 2.4}
                        duracionMinutos={rutaCalculada?.duracionMinutos || 8}
                      />
                      
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
                                    <span>Contraofertas recibidas ({driverOffers.length})</span>
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
                                          Aceptar Contraoferta
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
                            <SaraActiveTripCard
                              activeFreight={activeFreight}
                              assignedDriver={assignedDriver}
                              onOpenDriverProfile={() => {
                                if (assignedDriver) {
                                  setSelectedDriverForSecurity({
                                    id: assignedDriver.id,
                                    driverName: assignedDriver.driverName,
                                    plate: assignedDriver.plate,
                                    vehicleName: assignedDriver.vehicleName,
                                    rating: assignedDriver.rating,
                                    phone: assignedDriver.phone,
                                    licenseType: 'Tipo E',
                                    yearsExperience: 8,
                                    tripsCount: assignedDriver.tripsCount || 142,
                                    antCertified: true,
                                    mtopRegistry: 'MTOP-REG-2026-LOJA-89',
                                    matriculaYear: 2026,
                                    insuranceActive: true,
                                    photoInitial: assignedDriver.driverName.charAt(0)
                                  });
                                }
                              }}
                              onShareWhatsApp={() => {
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
                                  `📍 Sigue el camión en tiempo real aquí:\n${shareUrl}`
                                );
                                window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                              }}
                              onFinishOrCancel={() => {
                                setActiveFreight(null);
                                setDriverOffers([]);
                                setAssignedDriver(null);
                              }}
                            />
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

      {/* MODAL DE CONFIRMACIÓN DE SALIDA */}
      <SaraFletesExitConfirmModal
        isOpen={isExitModalOpen}
        hasActiveTrip={!!activeFreight}
        onCancel={() => setIsExitModalOpen(false)}
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          window.location.href = '/';
        }}
      />

      {/* MODAL DE FICHA DE SEGURIDAD DEL CONDUCTOR ANT / MTOP */}
      <SaraDriverSecurityModal
        driver={selectedDriverForSecurity}
        isOpen={!!selectedDriverForSecurity}
        onClose={() => setSelectedDriverForSecurity(null)}
        onRequestDriver={(drv) => {
          const vehMatch = vehiculosZonificados.find(v => v.id === drv.id);
          if (vehMatch) {
            handleDirectDriverRequest(vehMatch);
          } else {
            handlePedirFlete();
          }
        }}
      />

      {/* Botón de Pánico SOS 24/7 Flotante (Ergonómico, Top-Right) */}
      <SaraFloatingSosButton
        userType="cliente"
        fleteId={activeFreight?.id}
        driverName={assignedDriver?.driverName || "David Sarango"}
        plate={assignedDriver?.plate || "PCX-4590"}
        currentCoords={originPoint ? [originPoint.lat, originPoint.lng] : [-4.3248, -79.5562]}
        className="top-3 right-4 bottom-auto lg:top-4 lg:right-6"
      />
    </div>
  );
}
