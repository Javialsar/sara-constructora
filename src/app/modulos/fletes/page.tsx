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
import { GobeeBrandBadge } from '@/components/gobee/GobeeBrandBadge';
import type { VehiculoMapa } from '@/components/fletes/SaraFletesMap';
import SaraMultimodalTabBar from '@/components/fletes/SaraMultimodalTabBar';
import SaraViajesMandaditosQuickOrder from '@/components/fletes/SaraViajesMandaditosQuickOrder';
import SaraMobileBottomSheet, { BottomSheetSnapPoint } from '@/components/fletes/SaraMobileBottomSheet';
import SaraDriverNegotiationDrawer from '@/components/fletes/SaraDriverNegotiationDrawer';
import SaraNetworkStatusPill from '@/components/fletes/SaraNetworkStatusPill';
import { saveLastKnownPosition, enqueueOfflineEvent } from '@/lib/fletes/saraFletesOfflineBuffer';
import {
  startRealGpsWatcher,
  saveCalibratedDoorAnchor,
  findMatchingCalibratedAnchor,
} from '@/lib/fletes/saraGpsTelemetryEngine';
import { useClientDriverTracking } from '@/hooks/useClientDriverTracking';
import {
  isVehicleAllowedForModalidad,
  type MultimodalVerticalKey,
} from '@/lib/agents/fletes/saraFletesUXUIDesigner';

// Carga dinámica del mapa de Leaflet sin SSR para evitar errores de renderizado
const SaraFletesMap = dynamic(() => import('@/components/fletes/SaraFletesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
      <span className="text-sm font-semibold tracking-wide">Cargando mapa GoBee...</span>
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
  
  // 1. Geolocalización 100% real en tiempo real (sin anclar a ninguna ciudad fija)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userLocationAccuracy, setUserLocationAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  // 2. Coordenadas y Puntos de Carga / Descarga para Flete
  const [originText, setOriginText] = useState('Detectando tu ubicación GPS...');
  const [destinationText, setDestinationText] = useState('');
  const [originPoint, setOriginPoint] = useState<GeocodedPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<GeocodedPoint | null>(null);
  const [rutaCalculada, setRutaCalculada] = useState<RutaVialCalculada | null>(null);
  const [rutaActivaIndex, setRutaActivaIndex] = useState<number>(0);

  // Candados y estado interactivo de mapa para evitar desfasaje y saltos
  const originLockedByMapRef = useRef<boolean>(false);
  const bestOriginAccuracyRef = useRef<number>(Infinity);
  const [precisionPinMode, setPrecisionPinMode] = useState<boolean>(false);
  const [originManuallyConfirmed, setOriginManuallyConfirmed] = useState<boolean>(false);
  const destLockedByMapRef = useRef<boolean>(false);
  const userLocationRef = useRef<[number, number] | null>(null);
  const originPointRef = useRef<GeocodedPoint | null>(null);
  const destinationPointRef = useRef<GeocodedPoint | null>(null);
  const [mapClickMode, setMapClickMode] = useState<'origen' | 'destino' | null>(null);
  const [searchRadiusMeters, setSearchRadiusMeters] = useState<number>(1500);

  // Sincronizar referencias y persistir última posición GPS (Dead Reckoning Offline-First)
  useEffect(() => {
    userLocationRef.current = userLocation;
    if (userLocation) {
      saveLastKnownPosition(userLocation[0], userLocation[1]);
    }
  }, [userLocation]);

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

  // Manejo de escritura con búsqueda predictiva en Origen (bloquear GPS para que no sobrescriba al escribir)
  const handleOriginInputChange = (val: string) => {
    originLockedByMapRef.current = true;
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

  // Geocodificación directa de Destino (Enter, OnBlur o Auto-Sync de Hito)
  const handleDirectDestinationGeocode = async (text: string) => {
    if (!text || text.trim().length < 2) return;
    setIsCalculatingRoute(true);
    try {
      const pOrig = originPointRef.current || {
        nombre: 'Casa (Onlysoft), Gran Colombia y Atahualpa',
        lat: -4.328103,
        lng: -79.561129,
        ciudad: 'Cariamanga',
        provincia: 'Loja'
      };
      const geo = await SaraFreightRoutingService.geocodificarDireccion(
        text,
        [pOrig.lat, pOrig.lng]
      );
      if (geo) {
        destinationPointRef.current = geo;
        setDestinationPoint(geo);
        destLockedByMapRef.current = true;
        setShowDestSuggestions(false);
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(pOrig, geo);
        setRutaCalculada(ruta);
        const tarifa = SaraFreightPricingService.calcularTarifa(
          ruta.distanciaKm,
          weight,
          vehicleType,
          material
        );
        setTarifaEstimada(tarifa);
        setProposedPrice(tarifa.tarifaSugeridaUSD);
      }
    } catch (err) {
      console.warn('Error geocodificando destino directo:', err);
    } finally {
      setIsCalculatingRoute(false);
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
          const pOrig = originPointRef.current;
          const sugs = await SaraFreightRoutingService.buscarSugerenciasDireccion(
            val, 
            pOrig ? [pOrig.lat, pOrig.lng] : userLocation || [-4.328103, -79.561129]
          );
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
  const { draft, isLoaded: draftLoaded, updateDraft, resetDraft } = useFletesFormPersistence();
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
  // En móvil arranca compacto (estilo DiDi / Uber: 69% mapa libre + hoja inferior limpia)
  const [bottomSheetLevel, setBottomSheetLevel] = useState<'peek' | 'half' | 'full'>('peek');

  // Encerar siempre al ingresar al módulo del cliente: no restaurar rutas ni destinos de viajes anteriores
  useEffect(() => {
    if (draftLoaded) {
      resetDraft();
      setDestinationText('');
      setDestinationPoint(null);
      destinationPointRef.current = null;
      setRutaCalculada(null);
      setActiveFreight(null);
      setDriverOffers([]);
      setAssignedDriver(null);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem('sara_fletes_rt_active_request');
          window.localStorage.removeItem('sara_fletes_rt_accepted_dispatch');
          window.localStorage.removeItem('sara_fletes_rt_trip_in_progress');
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Transición automática de la hoja inferior según el paso del viaje (Paso 1 -> Paso 2 -> Paso 3)
  useEffect(() => {
    if (serviceType === 'viajes' || serviceType === 'mandaditos') {
      if (activeFreight || destinationPoint) {
        setBottomSheetLevel('half');
      } else {
        setBottomSheetLevel('peek');
      }
    }
  }, [destinationPoint, activeFreight, serviceType]);
  const [driverOffers, setDriverOffers] = useState<DriverOffer[]>([]);
  const [assignedDriver, setAssignedDriver] = useState<DriverOffer | null>(null);

  // Enserar completamente el estado del viaje, mapa y formulario al finalizar o cancelar
  const resetViajeCliente = useCallback(() => {
    setActiveFreight(null);
    setDriverOffers([]);
    setAssignedDriver(null);
    setDestinationText('');
    setDestinationPoint(null);
    destinationPointRef.current = null;
    destLockedByMapRef.current = false;
    setRutaCalculada(null);
    setTarifaEstimada(null);
    setProposedPrice(null);
    setDestinationSuggestions([]);
    setShowDestSuggestions(false);
    setMapClickMode(null);
    setSearchRadiusMeters(1500);
    setActiveStep(1);
    setBottomSheetLevel('peek');
    resetDraft();
  }, [resetDraft]);

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
    codigoAcceso?: string;
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

  // Ofertas 100% reales: únicamente llegan por evento NUEVA_OFERTA_CONDUCTOR / CHOFER_ACEPTO_FLETE (cero ofertas simuladas)
  useEffect(() => {
    if (activeFreight && activeFreight.status === 'searching') {
      setDriverOffers([]);
    }
  }, [activeFreight?.id, activeFreight?.status]);

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
        if (!activeFreightRef.current || activeFreightRef.current.id === evt.payload.fleteId || activeFreightRef.current.status === 'searching') {
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
          setActiveFreight((prev) => prev ? {
            ...prev,
            status: 'accepted',
            referencePrice: evt.payload.precio || prev.referencePrice,
            accessCode: evt.payload.codigoAcceso || prev.accessCode
          } : null);
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
          codigoAcceso: evt.payload.codigoAcceso || currentReq?.accessCode || undefined,
          driverName: evt.payload.driverName || 'Conductor Verificado GoBee',
          plate: evt.payload.plate || '',
          vehicleName: 'Vehículo Verificado GoBee',
          price: currentReq?.referencePrice || evt.payload.tarifaFinal || 3.50
        });
        setPaymentMethod('efectivo');
        setPaymentDetails(null);
        setIsPaymentGatewayOpen(false);
        setIsRatingModalOpen(true);
        resetViajeCliente();
      } else if (evt.type === 'CANCELAR_SOLICITUD_FLETE') {
        resetViajeCliente();
      } else if (evt.type === 'ACTUALIZAR_GPS_CONDUCTOR') {
        // Actualizar posición GPS real del conductor conectado en el mapa del cliente en vivo
        const p = evt.payload;
        if (p && p.plate && typeof p.lat === 'number' && typeof p.lng === 'number') {
          setLiveDriversMap((prev) => ({
            ...prev,
            [p.plate]: {
              id: p.driverId || p.plate,
              nombreChofer: p.driverName || 'Conductor SARA',
              placa: p.plate,
              tipoVehiculo: (p.tipoVehiculo as CategoriaVehiculo) || 'PICKUP_1T',
              lat: p.lat,
              lng: p.lng,
              rating: p.rating || 4.9,
              disponible: p.disponible !== false
            }
          }));
        }
      }
    });

    return () => unsub();
  }, []);

  // Detección y sincronización continua de GPS 100% REAL (watchPosition + Filtro Kalman 2D, sin ciudad hardcodeada)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('geolocation' in navigator)) {
      setGpsLoading(false);
      setOriginText('Selecciona tu punto de recogida en el mapa');
      return;
    }

    setGpsLoading(true);
    let lastReverseGeocodeAt = 0;

    const stopWatcher = startRealGpsWatcher({
      onFix: async (fix) => {
        let lat = +fix.lat.toFixed(6);
        let lng = +fix.lng.toFixed(6);
        let effectiveAccuracy = fix.accuracyM;
        let calibratedLabel: string | null = null;
        setGpsLoading(false);

        if (lat < -5.5 || lat > 2.0 || lng < -92.0 || lng > -74.5) {
          return;
        }

        // Si el navegador (ej. Firefox/PC Wi-Fi) reporta baja precisión (>40m), verificar si el círculo
        // real de incertidumbre contiene la puerta exacta calibrada previamente por el usuario
        if (effectiveAccuracy > 40 && !originLockedByMapRef.current) {
          const anchor = findMatchingCalibratedAnchor(lat, lng, effectiveAccuracy);
          if (anchor) {
            lat = +anchor.lat.toFixed(6);
            lng = +anchor.lng.toFixed(6);
            effectiveAccuracy = 5;
            calibratedLabel = anchor.label;
          }
        }

        const coords: [number, number] = [lat, lng];
        setUserLocation(coords);
        setUserLocationAccuracy(effectiveAccuracy);
        userLocationRef.current = coords;

        // Actualizar punto de recogida inmediatamente si mejora la precisión GPS (o tras 8s)
        const now = Date.now();
        const isPrecisionUpgrade =
          effectiveAccuracy < bestOriginAccuracyRef.current * 0.85 ||
          (effectiveAccuracy <= 25 && bestOriginAccuracyRef.current > 25);

        if (!originLockedByMapRef.current && (isPrecisionUpgrade || now - lastReverseGeocodeAt > 8000)) {
          lastReverseGeocodeAt = now;
          if (effectiveAccuracy < bestOriginAccuracyRef.current) {
            bestOriginAccuracyRef.current = effectiveAccuracy;
          }
          let nombreDetectado = calibratedLabel || 'Mi Ubicación Actual (GPS)';
          let ciudadDetectada = 'Ecuador';
          if (!calibratedLabel) {
            try {
              const dirActual = await SaraFreightRoutingService.reverseGeocodificar(lat, lng);
              if (dirActual) {
                nombreDetectado = dirActual;
                ciudadDetectada = dirActual.split(',')[1]?.trim() || dirActual.split(',')[0]?.trim() || 'Ecuador';
              }
            } catch {}
          }

          const pOrig: GeocodedPoint = {
            nombre: nombreDetectado,
            lat,
            lng,
            ciudad: ciudadDetectada
          };
          setOriginPoint(pOrig);
          originPointRef.current = pOrig;
          setOriginText(nombreDetectado);

          const pDest = destinationPointRef.current;
          if (pDest) {
            try {
              const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(pOrig, pDest);
              setRutaCalculada(ruta);
              setRutaActivaIndex(0);
              const tarifa = SaraFreightPricingService.calcularTarifa(
                ruta.distanciaKm,
                weight,
                vehicleType,
                material
              );
              setTarifaEstimada(tarifa);
              setProposedPrice(tarifa.tarifaSugeridaUSD);
            } catch (err) {
              console.error('Error recalculando ruta con nueva posición GPS:', err);
            }
          }
        }
      },
      onError: (err) => {
        console.warn('GPS en espera o sin permiso:', err.message);
        setGpsLoading(false);
        if (!originPointRef.current) {
          setOriginText('Activa tu GPS o fija el punto de recogida');
        }
      }
    });

    return () => stopWatcher();
  }, []);

  // Flota 100% REAL de conductores conectados en vivo (PostgreSQL /api/fletes/ubicaciones + Realtime Bus)
  const [liveDriversMap, setLiveDriversMap] = useState<Record<string, VehiculoMapa>>({});

  useEffect(() => {
    const centerLat = originPoint?.lat || userLocation?.[0];
    const centerLng = originPoint?.lng || userLocation?.[1];
    let cancelled = false;

    const fetchRealDrivers = async () => {
      try {
        const qs = new URLSearchParams({ radiusKm: '45' });
        if (typeof centerLat === 'number' && typeof centerLng === 'number') {
          qs.set('lat', String(centerLat));
          qs.set('lng', String(centerLng));
        }
        const res = await fetch(`/api/fletes/ubicaciones?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (Array.isArray(json?.drivers)) {
          const nextMap: Record<string, VehiculoMapa> = {};
          for (const d of json.drivers) {
            if (!d.placa || typeof d.lat !== 'number' || typeof d.lng !== 'number') continue;
            nextMap[d.placa] = {
              id: d.conductor_id || d.placa,
              nombreChofer: d.driver_name || 'Conductor SARA',
              placa: d.placa,
              tipoVehiculo: (d.tipo_vehiculo as CategoriaVehiculo) || 'PICKUP_1T',
              lat: d.lat,
              lng: d.lng,
              rating: Number(d.rating) || 4.9,
              disponible: d.disponible !== false
            };
          }
          setLiveDriversMap((prev) => ({ ...prev, ...nextMap }));
        }
      } catch {}
    };

    fetchRealDrivers();
    const interval = setInterval(fetchRealDrivers, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [originPoint?.lat, originPoint?.lng, userLocation?.[0], userLocation?.[1]]);

  const vehiculosZonificados = useMemo<VehiculoMapa[]>(() => {
    return Object.values(liveDriversMap).filter((v) =>
      isVehicleAllowedForModalidad(serviceType, v.tipoVehiculo)
    );
  }, [liveDriversMap, serviceType]);

  // Unidades cercanas filtradas estrictamente por modalidad y categoría seleccionada (nunca camiones en Viajes/Mandaditos)
  const vehiculosDisponiblesTipo = useMemo(() => {
    const matching = vehiculosZonificados.filter(v => v.tipoVehiculo === vehicleType);
    if (matching.length > 0) return matching;
    return vehiculosZonificados.slice(0, 3);
  }, [vehiculosZonificados, vehicleType]);

  // Pulso periódico (cada 4s) mientras el cliente está buscando conductor para que cualquier chofer
  // que abra o reconecte su radar en otro navegador/celular reciba el pedido real de inmediato
  useEffect(() => {
    if (!activeFreight || activeFreight.status !== 'searching') return;
    const pOrigCoords: [number, number] = originPoint
      ? [originPoint.lat, originPoint.lng]
      : userLocation || [-4.32794, -79.561116];
    const pDestCoords: [number, number] = destinationPoint
      ? [destinationPoint.lat, destinationPoint.lng]
      : pOrigCoords;

    const timer = setInterval(() => {
      SaraFletesRealtimeService.emit({
        type: 'NUEVA_SOLICITUD_FLETE',
        payload: {
          id: activeFreight.id,
          origen: activeFreight.origin,
          destino: activeFreight.destination,
          material: activeFreight.material,
          pesoTon: activeFreight.weight || 0.1,
          tipoVehiculo: activeFreight.vehicleType,
          tarifaOfertadaUSD: activeFreight.referencePrice,
          distanciaKm: activeFreight.distanciaKm || rutaCalculada?.distanciaKm || 1,
          duracionMinutos: activeFreight.duracionMinutos || rutaCalculada?.duracionMinutos || 5,
          coordsOrigen: pOrigCoords,
          coordsDestino: pDestCoords,
          coordenadasRuta: rutaCalculada?.coordenadasRuta,
          codigoAcceso: activeFreight.accessCode || '',
          clienteNombre: activeFreight.clienteNombre || 'Cliente SARA',
          status: 'searching',
          timestamp: Date.now(),
        },
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [activeFreight, originPoint, destinationPoint, userLocation, rutaCalculada]);

  const [liveServerDriverCoords, setLiveServerDriverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Sondeo bidireccional cada 1.5s contra /api/fletes/dispatch para recibir aceptación, inicio,
  // finalización y telemetría GPS en tiempo real en cualquier dispositivo (celular <-> PC)
  useEffect(() => {
    if (!activeFreight?.accessCode) {
      setLiveServerDriverCoords(null);
      return;
    }
    if (!['searching', 'accepted', 'in_transit'].includes(activeFreight.status)) return;

    let cancelled = false;
    const pollOrderStatus = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/fletes/dispatch?codigoAcceso=${encodeURIComponent(activeFreight.accessCode || '')}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        const req = data?.request;
        const tel = data?.driverTelemetry;

        if (tel && typeof tel.lat === 'number' && typeof tel.lng === 'number') {
          setLiveServerDriverCoords({ lat: tel.lat, lng: tel.lng });
        }

        if (!req) return;
        const dbStatus = String(req.status || '').toLowerCase();
        const acceptedPrice = Number(req.tarifa_acordada || req.tarifa || activeFreight.referencePrice);

        const buildDriverFromReq = (): DriverOffer => ({
          id: req.conductor_id || `DRV-${req.codigo_acceso}`,
          driverName: req.conductor_nombre || 'Conductor Verificado SARA',
          vehicleName: req.vehiculo_nombre || 'Vehículo Asignado SARA',
          plate: req.conductor_placa || '',
          rating: 4.9,
          tripsCount: 120,
          etaMinutes: 3,
          distanceMeters: 450,
          offeredPrice: acceptedPrice,
          isCounterOffer: false,
          phone: req.conductor_telefono || '',
        });

        if (dbStatus === 'aceptada' && activeFreight.status === 'searching') {
          setAssignedDriver(buildDriverFromReq());
          setActiveFreight((prev) =>
            prev ? { ...prev, status: 'accepted', referencePrice: acceptedPrice } : null
          );
          setDriverOffers([]);
          setBottomSheetLevel('half');
          try {
            if (typeof window !== 'undefined' && 'AudioContext' in window) {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.12);
              gain.gain.setValueAtTime(0.18, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.36);
            }
          } catch {}
        } else if (dbStatus === 'en_curso' && activeFreight.status !== 'in_transit') {
          setAssignedDriver((prev) => prev || buildDriverFromReq());
          setActiveFreight((prev) =>
            prev ? { ...prev, status: 'in_transit', referencePrice: acceptedPrice } : null
          );
          setDriverOffers([]);
          setBottomSheetLevel('half');
        } else if (dbStatus === 'completada') {
          setDriverToRate({
            fleteId: req.id || activeFreight.id,
            codigoAcceso: req.codigo_acceso || activeFreight.accessCode || undefined,
            driverName: req.conductor_nombre || 'Conductor Verificado GoBee',
            plate: req.conductor_placa || '',
            vehicleName: req.vehiculo_nombre || 'Vehículo Asignado GoBee',
            price: acceptedPrice,
          });
          setPaymentMethod('efectivo');
          setPaymentDetails(null);
          setIsPaymentGatewayOpen(false);
          setIsRatingModalOpen(true);
          resetViajeCliente();
        } else if (dbStatus === 'cancelada') {
          resetViajeCliente();
        }
      } catch {
        // Reintento automático en el siguiente ciclo
      }
    };

    pollOrderStatus();
    const timer = setInterval(pollOrderStatus, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeFreight?.accessCode, activeFreight?.status, activeFreight?.referencePrice, activeFreight?.id, resetViajeCliente]);

  // Seguimiento GPS en tiempo real del conductor asignado + Ruta de acercamiento + Audio ETA inteligente
  const matchedRadarDriver = useMemo(() => {
    if (!assignedDriver) return null;
    return (
      vehiculosZonificados.find(
        (v) =>
          (assignedDriver.plate && v.placa?.toUpperCase() === assignedDriver.plate.toUpperCase()) ||
          v.id === assignedDriver.id
      ) || null
    );
  }, [assignedDriver, vehiculosZonificados]);

  const isTripTrackingActive = Boolean(
    activeFreight && (activeFreight.status === 'accepted' || activeFreight.status === 'in_transit')
  );

  const clientDriverTracking = useClientDriverTracking({
    orderId: activeFreight?.id || null,
    isActive: isTripTrackingActive,
    tripPhase:
      activeFreight?.status === 'in_transit'
        ? 'in_transit'
        : activeFreight?.status === 'accepted'
          ? 'accepted'
          : 'other',
    driverName: assignedDriver?.driverName,
    vehicleName: assignedDriver?.vehicleName,
    plate: assignedDriver?.plate,
    accessCode: activeFreight?.accessCode,
    pickupCoords: originPoint ? [originPoint.lat, originPoint.lng] : null,
    destinationCoords: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null,
    radarDriverCoords:
      liveServerDriverCoords ||
      (matchedRadarDriver ? { lat: matchedRadarDriver.lat, lng: matchedRadarDriver.lng } : null),
    initialEtaMinutes: assignedDriver?.etaMinutes ?? null,
  });

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
        // Si ya tenemos un origen fijado en Cariamanga o por GPS del usuario, preservar las coordenadas exactas
        if (puntoOrig && userLocation && Math.abs(puntoOrig.lat - userLocation[0]) < 0.05) {
          // Coordenadas válidas de GPS / usuario preservadas
        } else {
          puntoOrig = await SaraFreightRoutingService.geocodificarDireccion(
            origenTxt,
            userLocation || undefined
          );
          if (puntoOrig) {
            originPointRef.current = puntoOrig;
            setOriginPoint(puntoOrig);
          }
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
    // En Viajes y Mandaditos NO auto-geocodificar mientras el usuario escribe:
    // solo se fija destino al seleccionar una sugerencia o presionar Enter / botón Ir
    if (serviceType === 'viajes' || serviceType === 'mandaditos') {
      return;
    }
    if (originText && destinationText) {
      const timer = setTimeout(() => {
        resolverRutaYTarifa(originText, destinationText, vehicleType, weight, material);
      }, 400);
      return () => clearTimeout(timer);
    } else if (!destinationText) {
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

  // Manejador de arrastre manual de Punto de Carga / Recogida (Origen)
  const handleOriginDragEnd = async (lat: number, lng: number) => {
    const exactLat = +lat.toFixed(6);
    const exactLng = +lng.toFixed(6);

    // Evitar fijar puntos accidentales fuera del Ecuador
    if (exactLat < -5.5 || exactLat > 2.0 || exactLng < -92.0 || exactLng > -75.0) {
      return;
    }

    originLockedByMapRef.current = true;
    setOriginManuallyConfirmed(true);
    setPrecisionPinMode(false);
    setUserLocation([exactLat, exactLng]);
    setUserLocationAccuracy(5);
    userLocationRef.current = [exactLat, exactLng];

    // Reverse geocoding real para etiquetar la puerta exacta confirmada
    let nombrePunto = `Puerta exacta (${exactLat}, ${exactLng})`;
    let ciudadPunto = 'Ecuador';
    try {
      const dir = await SaraFreightRoutingService.reverseGeocodificar(exactLat, exactLng);
      if (dir) {
        nombrePunto = dir;
        ciudadPunto = dir.split(',')[1]?.trim() || dir.split(',')[0]?.trim() || 'Ecuador';
      }
    } catch {}

    saveCalibratedDoorAnchor({ lat: exactLat, lng: exactLng, label: nombrePunto });

    const newPoint: GeocodedPoint = {
      nombre: nombrePunto,
      lat: exactLat,
      lng: exactLng,
      ciudad: ciudadPunto
    };
    setOriginPoint(newPoint);
    originPointRef.current = newPoint;
    setOriginText(nombrePunto);

    if (destinationPointRef.current) {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(newPoint, destinationPointRef.current);
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
  };

  // Manejador de arrastre manual de Punto de Descarga (Destino)
  const handleDestinationDragEnd = async (lat: number, lng: number) => {
    destLockedByMapRef.current = true;
    const exactLat = +lat.toFixed(5);
    const exactLng = +lng.toFixed(5);
    const newPoint: GeocodedPoint = {
      nombre: `Punto exacto (${exactLat}, ${exactLng})`,
      lat: exactLat,
      lng: exactLng,
      ciudad: destinationPoint?.ciudad || 'Cariamanga',
      provincia: destinationPoint?.provincia || 'Loja'
    };
    setDestinationPoint(newPoint);
    destinationPointRef.current = newPoint;

    if (originPointRef.current) {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(originPointRef.current, newPoint);
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

  // Manejador de clics directos sobre el mapa (solo cuando el usuario activa explícitamente el modo de selección)
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

    fetch('/api/fletes/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origen: orig,
        destino: dest,
        tarifa: precioFinal,
        distanciaKm: distKm,
        duracionMinutos: durMin,
        tipoVehiculo: vehicleType,
        material,
        codigoAcceso: code,
        coordsOrigen: originPoint ? [originPoint.lat, originPoint.lng] : userLocation,
        coordsDestino: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null,
      }),
    }).catch((err) => console.warn('Error despachando flete en servidor:', err));

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
    <div className="h-[100dvh] w-screen bg-slate-950 font-sans flex flex-col text-slate-100 overflow-hidden select-none">
      <ModuloIntroSplash modulo="fletes" />

      {/* TOPBAR ULTRA-COMPACTA & ERGONÓMICA */}
      <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 flex justify-between items-center z-30 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <GobeeBrandBadge role="Cliente" theme="dark" />
          <div className="hidden lg:block">
            <SaraNetworkStatusPill />
          </div>
        </div>

        {/* Acciones de sesión del cliente (sin enlaces cruzados a conductor) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExitModalOpen(true)}
            className="min-h-[38px] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-950/60 font-bold transition-colors cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      {/* ÁREA MAP-AS-CANVAS (100% VIEWPORT DINÁMICO CON CONTROLES FLOTANTES) */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden">
        
        {/* MAPA VECTORIAL DE FONDO COMPLETO */}
        <div className="absolute inset-0 z-0">
          <SaraFletesMap
            userLocation={userLocation}
            userLocationAccuracy={userLocationAccuracy}
            origenCoords={originPoint ? [originPoint.lat, originPoint.lng] : null}
            destinoCoords={destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null}
            origenNombre={originText}
            destinoNombre={destinationText}
            rutaCoordenadas={rutaCalculada?.coordenadasRuta}
            rutasAlternativas={rutaCalculada?.rutasAlternativas}
            rutaActivaIndex={rutaActivaIndex}
            onSelectRutaAlternativa={(idx) => {
              const alt = rutaCalculada?.rutasAlternativas?.find((r) => r.index === idx);
              if (alt && rutaCalculada) {
                setRutaActivaIndex(idx);
                setRutaCalculada({
                  ...rutaCalculada,
                  distanciaKm: alt.distanciaKm,
                  duracionMinutos: alt.duracionMinutos,
                  coordenadasRuta: alt.coordenadasRuta,
                  pasosNavegacion: alt.pasosNavegacion,
                  ladoLlegada: alt.ladoLlegada
                });
                const tarifa = SaraFreightPricingService.calcularTarifa(
                  alt.distanciaKm,
                  weight,
                  vehicleType,
                  material
                );
                setTarifaEstimada(tarifa);
                setProposedPrice(tarifa.tarifaSugeridaUSD);
              }
            }}
            vehiculosCercanos={vehiculosZonificados}
            vehiculoSeleccionado={vehicleType}
            tipoModalidad={serviceType}
            searchRadiusMeters={activeFreight?.status === 'searching' ? searchRadiusMeters : null}
            isSearchingDriver={activeFreight?.status === 'searching'}
            activeDriverTracking={
              isTripTrackingActive && clientDriverTracking.driverPosition
                ? {
                    driverName: assignedDriver?.driverName || 'Conductor asignado',
                    plate: assignedDriver?.plate || '',
                    vehicleType: activeFreight?.vehicleType || vehicleType,
                    lat: clientDriverTracking.driverPosition.lat,
                    lng: clientDriverTracking.driverPosition.lng,
                    heading: clientDriverTracking.driverPosition.heading,
                    speedKmh: clientDriverTracking.driverPosition.speedKmh,
                    etaMinutes: clientDriverTracking.etaMinutes,
                    distanceMeters: clientDriverTracking.distanceMeters,
                    hasArrivedPickup: clientDriverTracking.hasArrivedPickup,
                    approachRouteCoords: clientDriverTracking.approachRouteCoords,
                  }
                : null
            }
            onOriginDragEnd={handleOriginDragEnd}
            onDestinationDragEnd={handleDestinationDragEnd}
            onMapClick={handleMapClick}
            precisionPinMode={precisionPinMode}
            onConfirmPrecisionPin={(lat, lng) => handleOriginDragEnd(lat, lng)}
            onCancelPrecisionPin={() => setPrecisionPinMode(false)}
            onSelectVehiculo={(veh) => {
              setVehicleType(veh.tipoVehiculo);
            }}
          />
        </div>

        {/* BANNER FLOTANTE: MODO CLIC EN MAPA ACTIVADO */}
        {mapClickMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-full text-xs flex items-center gap-2.5 shadow-2xl border-2 border-slate-950 animate-bounce">
            <span className="text-sm">📍</span>
            <span>
              {mapClickMode === 'origen'
                ? 'Haz clic exactamente en tu puerta en el mapa (ej. Onlysoft)'
                : 'Haz clic en el mapa para ubicar tu destino'}
            </span>
            <button
              type="button"
              onClick={() => setMapClickMode(null)}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-2 py-0.5 rounded-full text-[10px] transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PANEL FLOTANTE DE GESTIÓN (DESKTOP: ISLA FLOTANTE / MÓVIL: BOTTOM SHEET TÁCTIL) */}
        {/* ------------------------------------------------------------- */}
        <SaraMobileBottomSheet
          snapPoint={(bottomSheetLevel === 'peek' ? 'collapsed' : bottomSheetLevel === 'full' ? 'expanded' : 'half') as BottomSheetSnapPoint}
          onSnapChange={(snap) => {
            setBottomSheetLevel(snap === 'collapsed' ? 'peek' : snap === 'expanded' ? 'full' : 'half');
          }}
          className={isPanelCollapsed ? '!w-[320px] !max-h-[56px]' : ''}
          headerContent={
            <div className="px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h2 className="text-xs font-black text-white uppercase tracking-wider">
                  {serviceType === 'viajes' ? '🚕 Viajes Rápidos' : serviceType === 'mandaditos' ? '📦 Mandaditos Express' : serviceType === 'fletes' ? '🚛 Flete On-Demand' : '🔑 Renta de Vehículos'}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={isPanelCollapsed ? 'Expandir panel' : 'Minimizar panel'}
                >
                  {isPanelCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          }
        >

          {/* CONTENIDO DEL PANEL CON SCROLL SUAVE */}
          {!isPanelCollapsed && (
            <div className="space-y-3 pb-16 lg:pb-2">
              
              {/* MODO CLIENTE / PÚBLICO GENERAL */}
              {(
                <>
                  {/* -------------------------------------------------------- */}
                  {/* ESTADO GLOBAL: FLETE O VIAJE ACTIVO Y SEGUIMIENTO EN VIVO */}
                  {/* -------------------------------------------------------- */}
                  {activeFreight ? (
                    <div className="bg-slate-950 border border-amber-500/60 p-4 rounded-2xl space-y-3 shadow-2xl animate-in fade-in duration-300">
                      {activeFreight.status === 'searching' && (
                        <SaraDriverNegotiationDrawer
                          offers={driverOffers}
                          referencePrice={activeFreight.referencePrice}
                          vehicleLabel={serviceType === 'viajes' ? 'Vehículos de Pasajeros' : serviceType === 'mandaditos' ? 'Repartidores Express' : getVehiclePlural(activeFreight.vehicleType)}
                          onAcceptOffer={(offer) => handleAcceptDriverOffer(offer)}
                          onRejectOffer={(offerId) => handleRejectDriverOffer(offerId)}
                          onRadiusChange={(radiusMeters) => setSearchRadiusMeters(radiusMeters)}
                          onBoostPrice={(deltaUSD) => {
                            const boosted = +(activeFreight.referencePrice + deltaUSD).toFixed(2);
                            setActiveFreight(prev => prev ? { ...prev, referencePrice: boosted } : null);
                            setProposedPrice(boosted);
                            enqueueOfflineEvent('BOOST_OFFER', {
                              fleteId: activeFreight.id,
                              newPrice: boosted
                            });
                          }}
                          onCancelSearch={() => {
                            if (activeFreight) {
                              if (activeFreight.accessCode) {
                                fetch('/api/fletes/dispatch', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    codigoAcceso: activeFreight.accessCode,
                                    status: 'cancelada',
                                  }),
                                }).catch(() => {});
                              }
                              SaraFletesRealtimeService.emit({
                                type: 'CANCELAR_SOLICITUD_FLETE',
                                payload: { fleteId: activeFreight.id }
                              });
                            }
                            setActiveFreight(null);
                            setDriverOffers([]);
                            setSearchRadiusMeters(1500);
                          }}
                        />
                      )}

                      {(activeFreight.status === 'accepted' || activeFreight.status === 'in_transit') && (
                        <SaraActiveTripCard
                          activeFreight={activeFreight}
                          assignedDriver={assignedDriver}
                          currentCoords={userLocation || (originPoint ? [originPoint.lat, originPoint.lng] : null)}
                          liveTracking={{
                            etaMinutes: clientDriverTracking.etaMinutes,
                            distanceMeters: clientDriverTracking.distanceMeters,
                            speedKmh: clientDriverTracking.driverPosition?.speedKmh ?? null,
                            hasArrivedPickup: clientDriverTracking.hasArrivedPickup,
                            voiceEnabled: clientDriverTracking.voiceEnabled,
                            lastAnnouncement: clientDriverTracking.lastAnnouncement,
                            onToggleVoice: clientDriverTracking.toggleVoice,
                            onReplayVoice: clientDriverTracking.replayVoiceEta,
                          }}
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
                            const origC: [number, number] = originPoint ? [originPoint.lat, originPoint.lng] : [-4.328103, -79.561129];
                            const destC: [number, number] = destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : [-4.331405, -79.553528];
                            const distKm = rutaCalculada?.distanciaKm || activeFreight.distanciaKm || 1.2;
                            const durMin = rutaCalculada?.duracionMinutos || activeFreight.duracionMinutos || Math.max(2, Math.round(distKm * 2.5));
                            const drvName = assignedDriver?.driverName || 'Conductor SARA';
                            const drvPlate = assignedDriver?.plate || '';
                            const drvVeh = assignedDriver?.vehicleName || 'Vehículo Asignado SARA';

                            SaraFletesRealtimeService.savePublicTrackingSnapshot(trackingToken, {
                              driverName: drvName,
                              plate: drvPlate,
                              vehicleName: drvVeh,
                              origin: activeFreight.origin,
                              destination: activeFreight.destination,
                              originCoords: origC,
                              destinationCoords: destC,
                              coordenadasRuta: rutaCalculada?.coordenadasRuta,
                              material: activeFreight.material,
                              distanceKm: distKm,
                              duracionMinutos: durMin
                            } as any);

                            const qs = new URLSearchParams({
                              o: `${origC[0].toFixed(6)},${origC[1].toFixed(6)}`,
                              d: `${destC[0].toFixed(6)},${destC[1].toFixed(6)}`,
                              on: activeFreight.origin,
                              dn: activeFreight.destination,
                              dr: drvName,
                              pl: drvPlate,
                              v: drvVeh,
                              m: activeFreight.material,
                              km: String(distKm),
                              min: String(durMin),
                              ...(activeFreight.accessCode ? { pin: activeFreight.accessCode } : {})
                            });
                            const shareUrl = `${window.location.origin}/fletes/rastreo/${trackingToken}?${qs.toString()}`;
                            const text = encodeURIComponent(
                              `🚚 *GoBee (Grupo Sara): Rastreo de Viaje en Vivo*\n\n` +
                              `• Chofer: ${drvName} (${drvPlate})\n` +
                              `• Vehículo: ${drvVeh}\n` +
                              `• Ruta: ${activeFreight.origin} ➔ ${activeFreight.destination} (${distKm} km · ~${durMin} min)\n` +
                              `• PIN de Recepción: ${activeFreight.accessCode}\n\n` +
                              `📍 Sigue el vehículo en tiempo real aquí:\n${shareUrl}`
                            );
                            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                          }}
                          onFinishOrCancel={() => {
                            resetViajeCliente();
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      {/* -------------------------------------------------------- */}
                      {/* SECCIÓN VIAJES / MANDADITOS (PASAJEROS UBER/DIDI Y EXPRESS) */}
                      {/* -------------------------------------------------------- */}
                      {(serviceType === 'viajes' || serviceType === 'mandaditos') && (
                    <div className="space-y-2.5">
                      {/* PASO 1 (Estilo DiDi / inDrive / Uber): Solo buscador "¿A dónde vas?" para máxima visibilidad del mapa */}
                      {!destinationPoint ? (
                      <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                        <div ref={destInputWrapperRef} className="relative">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
                              const queryVal = destinationText.trim();
                              if (queryVal.length >= 2) {
                                setShowDestSuggestions(false);
                                await handleDirectDestinationGeocode(queryVal);
                              }
                            }}
                            className="flex items-center gap-2 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700 focus-within:border-amber-500 shadow-inner"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                            <input
                              type="text"
                              enterKeyHint="search"
                              value={destinationText}
                              onChange={(e) => handleDestinationInputChange(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
                                  const queryVal = e.currentTarget.value.trim();
                                  if (queryVal.length >= 2) {
                                    setShowDestSuggestions(false);
                                    await handleDirectDestinationGeocode(queryVal);
                                  }
                                }
                              }}
                              placeholder={serviceType === 'viajes' ? '¿A dónde vas?' : '¿A dónde enviamos tu paquete?'}
                              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-bold"
                            />
                            {destinationText && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDestinationText('');
                                  setDestinationPoint(null);
                                  setRutaCalculada(null);
                                }}
                                className="text-slate-500 hover:text-white text-xs px-1 py-0.5 rounded transition-colors cursor-pointer"
                                title="Borrar destino"
                              >
                                ✕
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={isCalculatingRoute || destinationText.trim().length < 2}
                              className="shrink-0 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Buscar dirección y trazar ruta"
                            >
                              {isCalculatingRoute ? '...' : 'Ir'}
                            </button>
                          </form>
                          {/* Menú de sugerencias predictivas de Destino (en flujo normal para nunca recortarse) */}
                          {showDestSuggestions && destinationSuggestions.length > 0 && (
                            <div className="mt-2 bg-slate-950 border border-slate-700/80 rounded-xl shadow-xl p-1 max-h-72 overflow-y-auto">
                              {destinationSuggestions.map((sug) => (
                                <button
                                  key={sug.id}
                                  type="button"
                                  onClick={() => handleSelectDestinationSuggestion(sug)}
                                  className="w-full p-2 rounded-lg text-left hover:bg-slate-900 flex items-start gap-2 text-xs transition-colors"
                                >
                                  <span className="text-amber-400 mt-0.5 text-xs">🚩</span>
                                  <div className="truncate">
                                    <p className="font-bold text-white truncate">{sug.titulo}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{sug.subtitulo}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      ) : (
                      <>
                        {/* PASO 2 (Estilo DiDi / inDrive / Uber): Resumen compacto de ruta + botón volver + Vehículos + CTA */}
                        <div className="bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDestinationPoint(null);
                              destinationPointRef.current = null;
                              setRutaCalculada(null);
                              setBottomSheetLevel('peek');
                            }}
                            className="shrink-0 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                            title="Cambiar dirección de destino"
                          >
                            ← Cambiar
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-white truncate">
                              🚩 {destinationText || destinationPoint.nombre}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Desde: {originText || 'Casa (Onlysoft)'}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            {isCalculatingRoute
                              ? '...'
                              : `${(rutaCalculada?.distanciaKm || 1.2).toFixed(1)} km · ${rutaCalculada?.duracionMinutos || 3}m`}
                          </span>
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
                            clienteNombre: 'Usuario SARA (Cariamanga)'
                          };
                          setActiveFreight(simulatedReq);
                          setProposedPrice(params.tarifaUSD);

                          // 1. Publicar solicitud REAL en servidor (/api/fletes/dispatch -> Supabase fletes_solicitudes, fila única sin duplicados)
                          fetch('/api/fletes/dispatch', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              origen: simulatedReq.origin,
                              destino: simulatedReq.destination,
                              tarifa: params.tarifaUSD,
                              distanciaKm: simulatedReq.distanciaKm || 3.2,
                              duracionMinutos: simulatedReq.duracionMinutos || 9,
                              tipoVehiculo: params.vehiculoId || 'AUTO_SEDAN',
                              material: simulatedReq.material,
                              codigoAcceso: simulatedReq.accessCode,
                              coordsOrigen: originPoint ? [originPoint.lat, originPoint.lng] : userLocation,
                              coordsDestino: destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null,
                            }),
                          }).catch((err) => console.warn('Error despachando solicitud en servidor:', err));

                          const pOrigCoords: [number, number] = originPoint ? [originPoint.lat, originPoint.lng] : (userLocation || [-4.328103, -79.561129]);
                          const pDestCoords: [number, number] = destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : [-4.331405, -79.553528];

                          // 2. Publicar solicitud en el bus en tiempo real para todos los conductores y pestañas
                          const reqPayload: SolicitudFleteRealtime = {
                            id: simulatedReq.id,
                            origen: simulatedReq.origin,
                            destino: simulatedReq.destination,
                            material: simulatedReq.material,
                            pesoTon: 0.1,
                            tipoVehiculo: 'PICKUP_1T',
                            tarifaOfertadaUSD: params.tarifaUSD,
                            distanciaKm: simulatedReq.distanciaKm || 3.2,
                            duracionMinutos: simulatedReq.duracionMinutos || 9,
                            coordsOrigen: pOrigCoords,
                            coordsDestino: pDestCoords,
                            coordenadasRuta: rutaCalculada?.coordenadasRuta,
                            codigoAcceso: simulatedReq.accessCode || '0000',
                            clienteNombre: 'Usuario SARA (Cariamanga)',
                            status: 'searching',
                            timestamp: Date.now()
                          };

                          SaraFletesRealtimeService.emit({
                            type: 'NUEVA_SOLICITUD_FLETE',
                            payload: reqPayload
                          });
                        }}
                      />
                      </>
                      )}
                    </div>
                  )}

                  {/* -------------------------------------------------------- */}
                  {/* SECCIÓN A: FLETE DE CARGA ON-DEMAND */}
                  {/* -------------------------------------------------------- */}
                  {serviceType === 'fletes' && (
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
                        originSuggestions={originSuggestions}
                        destinationSuggestions={destinationSuggestions}
                        showOriginSuggestions={showOriginSuggestions}
                        showDestSuggestions={showDestSuggestions}
                        isSearchingOrigin={isSearchingOrigin}
                        isSearchingDest={isSearchingDest}
                        onSelectOriginSuggestion={(sug) => {
                          void handleSelectOriginSuggestion(sug);
                          updateDraft({ originText: sug.titulo });
                        }}
                        onSelectDestinationSuggestion={(sug) => {
                          void handleSelectDestinationSuggestion(sug);
                          updateDraft({ destinationText: sug.titulo });
                        }}
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
                        onSetPrice={(price) => {
                          const validPrice = Math.max(1.0, +price.toFixed(2));
                          setProposedPrice(validPrice);
                          updateDraft({ proposedPrice: validPrice });
                        }}
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
                </>
              )}

              </div>
          )}
        </SaraMobileBottomSheet>

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
          resetViajeCliente();
        }}
        onOpenPaymentGateway={() => setIsPaymentGatewayOpen(true)}
        onRatingSubmitted={(msg) => {
          setIsRatingModalOpen(false);
          setPaymentSuccessToast(msg);
          setDriverToRate(null);
          resetViajeCliente();
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

      {/* BARRA INFERIOR DE MODALIDADES (ICONOS EXPANSIVOS ESTILO APP MÓVIL — SIN CUBRIR EL MAPA) */}
      {!activeFreight && (
        <div className="fixed bottom-3 left-3 right-3 z-40 lg:left-4 lg:right-auto lg:w-[376px]">
          <SaraMultimodalTabBar
            activeTab={serviceType}
            onChangeTab={(tab) => {
              setServiceType(tab);
              if (tab === 'viajes' || tab === 'mandaditos') {
                setBottomSheetLevel(destinationPoint ? 'half' : 'peek');
              } else if (bottomSheetLevel === 'peek') {
                setBottomSheetLevel('half');
              }
            }}
          />
        </div>
      )}

      {/* Botón de Pánico SOS 24/7 Flotante (Ergonómico, Top-Right) */}
      <SaraFloatingSosButton
        userType="cliente"
        fleteId={activeFreight?.id}
        driverName={assignedDriver?.driverName || 'Conductor SARA'}
        plate={assignedDriver?.plate || ''}
        currentCoords={originPoint ? [originPoint.lat, originPoint.lng] : undefined}
        className="top-[72px] left-3 bottom-auto lg:top-20 lg:right-6 lg:left-auto"
      />
    </div>
  );
}
