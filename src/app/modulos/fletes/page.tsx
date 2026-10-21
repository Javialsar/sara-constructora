'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  DollarSign, 
  MessageCircle, 
  Loader2, 
  CheckCircle, 
  Package, 
  ArrowRight,
  Crosshair,
  Route,
  Clock,
  ShieldCheck,
  Sparkles,
  Calendar,
  UserCheck,
  KeyRound,
  FileText
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
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      <span className="text-sm font-semibold tracking-wide">Cargando Mapa Satelital y Red Vial SARA...</span>
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
  
  // 1. Geolocalización en tiempo real
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(true);

  // 2. Coordenadas y Puntos de Carga / Descarga para Flete
  const [originText, setOriginText] = useState('MAtecons Chile, Cariamanga');
  const [destinationText, setDestinationText] = useState('El Dorado, Cariamanga');
  const [originPoint, setOriginPoint] = useState<GeocodedPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<GeocodedPoint | null>(null);
  const [rutaCalculada, setRutaCalculada] = useState<RutaVialCalculada | null>(null);

  // 3. Parámetros de la Carga (Flete)
  const [vehicleType, setVehicleType] = useState<CategoriaVehiculo>('PICKUP_1T');
  const [material, setMaterial] = useState('Otros Materiales');
  const [weight, setWeight] = useState<number>(1);
  const [tarifaEstimada, setTarifaEstimada] = useState<ResultadoTarifaFlete | null>(null);
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
      const puntoOrig = await SaraFreightRoutingService.geocodificarDireccion(
        origenTxt,
        userLocation || undefined
      );
      const puntoDest = await SaraFreightRoutingService.geocodificarDireccion(
        destinoTxt,
        puntoOrig ? [puntoOrig.lat, puntoOrig.lng] : userLocation || undefined
      );

      if (puntoOrig) setOriginPoint(puntoOrig);
      if (puntoDest) setDestinationPoint(puntoDest);

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
      } else {
        const distAprox = 1.8;
        const tarifa = SaraFreightPricingService.calcularTarifa(distAprox, peso, vehiculo, mat);
        setTarifaEstimada(tarifa);
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
    }
  }, [originText, destinationText, vehicleType, weight, material, serviceType, resolverRutaYTarifa]);

  const handleUsarMiUbicacionComoOrigen = () => {
    if (userLocation) {
      setOriginPoint({
        nombre: 'Mi Ubicación Actual (GPS)',
        lat: userLocation[0],
        lng: userLocation[1]
      });
      setOriginText('Mi Ubicación Actual (GPS)');
    }
  };

  // Solicitar el flete (Modo Flete Directo)
  const handlePedirFlete = async () => {
    if (!originText || !destinationText) return alert('Por favor ingresa origen y destino');
    if (!tarifaEstimada) return;

    const asignadoId = 'FLT-' + Math.floor(1000 + Math.random() * 9000);
    const code = generateAccessCode();

    await createFletesSolicitud({
      origen: originText,
      destino: destinationText,
      tarifa: tarifaEstimada.tarifaSugeridaUSD,
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
      referencePrice: tarifaEstimada.tarifaSugeridaUSD,
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
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-slate-100">
      <ModuloIntroSplash modulo="fletes" />

      {/* HEADER DE NAVEGACIÓN */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center shadow-lg relative z-20 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-xl shadow-md shadow-amber-500/20 text-slate-950">
            <Truck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                SARA <span className="text-amber-500">Fletes & Renta</span>
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                GPS En Vivo
              </span>
              <span className="hidden sm:inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Abierto a Todo Público
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transporte de carga on-demand y renta temporal de vehículos para empresas, constructores y público en general
            </p>
          </div>
        </div>

        {/* Toggle de Roles */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-bold">
          <button
            onClick={() => setViewMode('constructor')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'constructor'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Cliente / Público General
          </button>
          <button
            onClick={() => setViewMode('driver')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'driver'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Conductor / Transportista
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/modulos/fletes/mi-perfil"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-black transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            Mi Billetera / Conductor
          </Link>
          <Link
            href="/modulos/fletes/auth"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            Ingreso / Registro
          </Link>
          <Link href="/" className="text-slate-400 hover:text-amber-400 text-xs font-medium transition-colors">
            Inicio
          </Link>
        </div>
      </header>

      {/* ÁREA PRINCIPAL SPLIT */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        
        {/* PANEL LATERAL DE GESTIÓN */}
        <div className="w-full lg:w-[490px] bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* MODO 1: CONSTRUCTOR / CLIENTE */}
          {viewMode === 'constructor' && (
            <div className="p-6 space-y-5">
              
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
                  Flete de Carga (Por Viaje)
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
                  Renta Temporal (Horas / Días)
                </button>
              </div>

              {/* SELECTOR DE VEHÍCULO MULTIMODAL */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">
                  Categoría de Vehículo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATALOGO_VEHICULOS_SARA) as CategoriaVehiculo[]).map((catKey) => {
                    const v = CATALOGO_VEHICULOS_SARA[catKey];
                    const isSelected = vehicleType === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setVehicleType(catKey)}
                        className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl">{v.icono}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                        </div>
                        <div className="mt-1">
                          <p className="font-bold text-[11px] text-white leading-tight">{v.nombre}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{serviceType === 'renta' ? `$${v.tarifaHoraRentaUSD}/h` : `${v.capacidadTon}T`}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* VISTA A: FLETE DE CARGA (POR VIAJE / RUTA) */}
              {/* ------------------------------------------------------------ */}
              {serviceType === 'flete' && (
                <>
                  {/* Botón de Acceso Rápido al caso de Cariamanga */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Ejemplo rápido:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOriginText('MAtecons Chile, Cariamanga');
                        setDestinationText('El Dorado, Cariamanga');
                        setWeight(1);
                        setVehicleType('PICKUP_1T');
                      }}
                      className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg transition-all"
                    >
                      Cariamanga (MAtecons ➔ El Dorado)
                    </button>
                  </div>

                  {/* RUTA: ORIGEN Y DESTINO */}
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                          Punto de Carga (Origen)
                        </label>
                        <button
                          type="button"
                          onClick={handleUsarMiUbicacionComoOrigen}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                        >
                          <Crosshair className="w-3 h-3" />
                          Usar mi GPS
                        </button>
                      </div>
                      <input
                        type="text"
                        value={originText}
                        onChange={(e) => setOriginText(e.target.value)}
                        placeholder="Ej. MAtecons Chile, Cariamanga"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        Punto de Descarga (Destino)
                      </label>
                      <input
                        type="text"
                        value={destinationText}
                        onChange={(e) => setDestinationText(e.target.value)}
                        placeholder="Ej. El Dorado, Cariamanga"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {rutaCalculada && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1 font-medium">
                          <Route className="w-3.5 h-3.5 text-amber-500" />
                          Distancia: <strong className="text-white font-mono">{rutaCalculada.distanciaKm} km</strong>
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          Tiempo: <strong className="text-white font-mono">{rutaCalculada.duracionMinutos} min</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CARGA Y PESO */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                        Material
                      </label>
                      <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                        Peso (Ton)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={weight}
                        onChange={(e) => setWeight(Math.max(0.1, Number(e.target.value)))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* TARJETA DE TARIFA JUSTA FLETE */}
                  {tarifaEstimada && !activeFreight && (
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 p-4 rounded-2xl shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Tarifa Justa Calculada por IA
                        </span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {tarifaEstimada.esFleteLocal ? 'Local Urbano' : 'Interprovincial'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-3xl font-black text-amber-500 font-mono tracking-tight">
                            ${tarifaEstimada.tarifaSugeridaUSD.toFixed(2)}{' '}
                            <span className="text-xs font-semibold text-slate-400">USD</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Subasta inDrive: <strong>${tarifaEstimada.rangoNegociacionInDrive.minimoUSD.toFixed(2)}</strong> - <strong>${tarifaEstimada.rangoNegociacionInDrive.maximoUSD.toFixed(2)}</strong>
                          </p>
                        </div>

                        <div className="text-right text-[10px] text-slate-400 space-y-0.5">
                          <p>Banderazo: ${tarifaEstimada.desglose.banderazoUSD.toFixed(2)}</p>
                          <p>Distancia ({tarifaEstimada.distanciaKm} km): ${tarifaEstimada.desglose.costoDistanciaUSD.toFixed(2)}</p>
                          <p>Peso ({weight} Ton): ${tarifaEstimada.desglose.costoPesoUSD.toFixed(2)}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 italic border-t border-slate-800 pt-2">
                        {tarifaEstimada.explicacionIA}
                      </p>

                      <button
                        type="button"
                        onClick={handlePedirFlete}
                        disabled={isCalculatingRoute}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        Pedir Flete por ${tarifaEstimada.tarifaSugeridaUSD.toFixed(2)} USD
                      </button>
                    </div>
                  )}

                  {/* ESTADO DE FLETE ACTIVO */}
                  {activeFreight && (
                    <div className="bg-slate-950 border border-amber-500/50 p-5 rounded-2xl text-center space-y-4">
                      {activeFreight.status === 'searching' && (
                        <>
                          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                          <div>
                            <h3 className="font-black text-white text-lg">Buscando Transportistas en Zona...</h3>
                            <p className="text-xs text-slate-400 mt-1">Notificando a camionetas y camiones cercanos</p>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400">Oferta Inicial de Flete</p>
                            <p className="text-2xl font-black text-amber-500 font-mono">
                              ${activeFreight.referencePrice.toFixed(2)} USD
                            </p>
                          </div>
                        </>
                      )}

                      {activeFreight.status === 'accepted' && (
                        <>
                          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                          <div>
                            <h3 className="font-black text-white text-lg">¡Flete Asignado y en Ruta!</h3>
                            <p className="text-xs text-slate-400 mt-1">
                              El chofer va al punto de carga por <strong>${activeFreight.referencePrice.toFixed(2)} USD</strong>
                            </p>
                          </div>

                          <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1">
                              PIN de Seguridad de Entrega
                            </p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-widest">
                              {activeFreight.accessCode}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Entrégalo al chofer únicamente al verificar la carga
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveFreight(null)}
                            className="text-xs text-amber-400 underline font-bold"
                          >
                            Solicitar otro flete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ------------------------------------------------------------ */}
              {/* VISTA B: RENTA TEMPORAL (POR HORAS / DÍAS TIPO UBER RENT) */}
              {/* ------------------------------------------------------------ */}
              {serviceType === 'renta' && !reservaRentaActiva && (
                <div className="space-y-4">
                  
                  {/* Selector de Horas vs Días */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Modalidad de Renta
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

                    {/* Botones de duración rápida */}
                    <div className="grid grid-cols-3 gap-2">
                      {rentaDuracionTipo === 'HORAS' ? (
                        [2, 4, 8].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setRentaDuracionValor(h)}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
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
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                              rentaDuracionValor === d
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {d} {d === 1 ? 'Día' : 'Días'} {d >= 7 ? '(20% Off)' : d >= 3 ? '(10% Off)' : ''}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Switch: ¿Con Chofer? */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-amber-500" />
                        ¿Conductor Profesional Incluido?
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {rentaConChofer
                          ? 'Operador calificado se encarga de la conducción y cuidado.'
                          : 'Conducción libre (requiere garantía y licencia vigente).'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRentaConChofer(!rentaConChofer)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                        rentaConChofer ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md"></span>
                    </button>
                  </div>

                  {/* Datos del Solicitante y Entrega */}
                  <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                        Lugar de Entrega / Retiro
                      </label>
                      <input
                        type="text"
                        value={rentaLugarEntrega}
                        onChange={(e) => setRentaLugarEntrega(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                          Nombre / Empresa
                        </label>
                        <input
                          type="text"
                          value={rentaClienteNombre}
                          onChange={(e) => setRentaClienteNombre(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={rentaClienteTelefono}
                          onChange={(e) => setRentaClienteTelefono(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Cotización de Renta */}
                  {cotizacionRenta && (
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 p-4 rounded-2xl shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400">
                          Cotización de Renta Temporal
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                          {rentaDuracionValor} {rentaDuracionTipo.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-3xl font-black text-amber-500 font-mono">
                            ${cotizacionRenta.tarifaTotalUSD.toFixed(2)}{' '}
                            <span className="text-xs font-semibold text-slate-400">USD</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Garantía en custodia Escrow: <strong>${cotizacionRenta.depositoGarantiaUSD.toFixed(2)} USD</strong> (reembolsable)
                          </p>
                        </div>
                        <div className="text-right text-[10px] text-slate-400 space-y-0.5">
                          <p>Alquiler Base: ${cotizacionRenta.tarifaBaseUSD.toFixed(2)}</p>
                          <p>Chofer: ${cotizacionRenta.suplementoChoferUSD.toFixed(2)}</p>
                          <p>Seguro Flota: ${cotizacionRenta.seguroCoberturaUSD.toFixed(2)}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 italic border-t border-slate-800 pt-2">
                        {cotizacionRenta.detalles}
                      </p>

                      <button
                        type="button"
                        onClick={handleConfirmarRenta}
                        disabled={isProcessingRenta}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        {isProcessingRenta ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generando Contrato y PIN...
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            Reservar Renta por ${cotizacionRenta.tarifaTotalUSD.toFixed(2)} USD
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* RENTA CONFIRMADA */}
              {serviceType === 'renta' && reservaRentaActiva && (
                <div className="bg-slate-950 border border-emerald-500/50 p-5 rounded-2xl text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                  <div>
                    <h3 className="font-black text-white text-lg">¡Vehículo Reservado con Éxito!</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {reservaRentaActiva.vehiculoNombre} ({reservaRentaActiva.duracionTexto})
                    </p>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1">
                      PIN Digital de Desbloqueo y Entrega
                    </p>
                    <p className="text-3xl font-black text-emerald-400 font-mono tracking-widest">
                      {reservaRentaActiva.pinDesbloqueo}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Presenta este PIN al recibir el vehículo en {reservaRentaActiva.lugarEntrega}
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p>Total Alquiler: <strong>${reservaRentaActiva.tarifaTotal.toFixed(2)} USD</strong></p>
                    <p>Depósito en Custodia Escrow: <strong>${reservaRentaActiva.depositoGarantia.toFixed(2)} USD</strong></p>
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

            </div>
          )}

          {/* MODO 2: TRANSPORTISTA / CHOFER */}
          {viewMode === 'driver' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Panel de Transportista</h2>
                  <p className="text-xs text-slate-400">Recibe fletes y solicitudes de alquiler temporal</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              {!activeFreight ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                  <Navigation className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                  <h3 className="font-bold text-white text-base">Radar SARA Activo</h3>
                  <p className="text-xs text-slate-400">
                    Tu vehículo está visible en el mapa para fletes directos y alquileres temporales.
                  </p>
                  <div className="pt-2">
                    <span className="text-[11px] font-mono bg-slate-900 border border-slate-700 text-emerald-400 px-3 py-1 rounded-full">
                      Coordenadas GPS transmitiendo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-amber-500/50 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        ¡Nueva Solicitud en Zona!
                      </span>
                      <h3 className="font-black text-white text-base mt-1">
                        {activeFreight.material} ({activeFreight.weight} Ton)
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Oferta Cliente</span>
                      <p className="text-2xl font-black text-amber-500 font-mono">
                        ${activeFreight.referencePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <strong>Carga:</strong> {activeFreight.origin}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <strong>Entrega:</strong> {activeFreight.destination}
                    </p>
                    <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                      Distancia estimada: {activeFreight.distanciaKm} km (~{activeFreight.duracionMinutos} min)
                    </p>
                  </div>

                  {activeFreight.status === 'searching' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">
                          Contraofertar (Modo inDrive)
                        </label>
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            step="0.50"
                            placeholder="Tu tarifa propuesta (ej. 3.00)"
                            value={counterOffer}
                            onChange={(e) => setCounterOffer(e.target.value)}
                            className="w-full bg-transparent font-mono font-bold text-white focus:outline-none ml-1 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleDriverAccept}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-md"
                        >
                          Aceptar Oferta
                        </button>
                        <button
                          type="button"
                          onClick={handleDriverNegotiate}
                          disabled={!counterOffer}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all disabled:opacity-40 shadow-md"
                        >
                          Enviar Contraoferta
                        </button>
                      </div>
                    </div>
                  )}

                  {activeFreight.status === 'negotiating' && (
                    <div className="text-center py-4 space-y-2">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                      <p className="text-xs text-slate-300 font-bold">
                        Contraoferta de ${counterOffer} USD enviada al cliente...
                      </p>
                    </div>
                  )}

                  {activeFreight.status === 'accepted' && (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl text-center space-y-2">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-black text-emerald-400 uppercase">
                        ¡Viaje Aceptado! Dirígete al origen
                      </p>
                      <p className="text-xs text-slate-300">
                        Código de verificación requerido en destino:
                      </p>
                      <p className="text-2xl font-black text-white font-mono tracking-widest">
                        {activeFreight.accessCode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* CONTENEDOR DEL MAPA VECTORIAL INTERACTIVO EN TIEMPO REAL */}
        <div className="flex-1 relative w-full h-[450px] lg:h-auto min-h-[400px]">
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <p className="font-bold text-white leading-tight">
                Flota Zonificada Activa ({vehiculosZonificados.length} unidades en radar)
              </p>
              <p className="text-[10px] text-slate-400">
                {serviceType === 'flete' ? 'Modalidad: Flete de Carga On-Demand' : 'Modalidad: Renta Temporal Disponible'}
              </p>
            </div>
          </div>

          <SaraFletesMap
            userLocation={userLocation}
            origenCoords={originPoint ? [originPoint.lat, originPoint.lng] : null}
            destinoCoords={destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null}
            origenNombre={originText}
            destinoNombre={destinationText}
            rutaCoordenadas={serviceType === 'flete' ? rutaCalculada?.coordenadasRuta : undefined}
            vehiculosCercanos={vehiculosZonificados}
            vehiculoSeleccionado={vehicleType}
            onSelectVehiculo={(veh) => {
              setVehicleType(veh.tipoVehiculo);
            }}
          />
        </div>

      </div>
    </div>
  );
}
