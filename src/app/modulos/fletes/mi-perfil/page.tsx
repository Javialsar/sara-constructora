'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  List, 
  Truck, 
  MapPin, 
  FileText, 
  History, 
  Wallet, 
  Camera, 
  ChevronRight, 
  CheckCircle, 
  Navigation, 
  Package, 
  Download, 
  CreditCard, 
  QrCode, 
  Building, 
  UploadCloud, 
  Loader2, 
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getFletesPlanes, debitConductorWallet } from '@/lib/fletes-data';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';
import type { VehiculoMapa } from '@/components/fletes/SaraFletesMap';
import { SaraFletesRealtimeService, PlanConfigItem } from '@/lib/services/saraFletesRealtimeService';

// Carga dinámica del mapa interactivo Leaflet sin SSR
const SaraFletesMap = dynamic(() => import('@/components/fletes/SaraFletesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 rounded-2xl border border-slate-800">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      <span className="text-sm font-semibold tracking-wide">Cargando Mapa Satelital y Radar de Fletes...</span>
    </div>
  )
});

export default function MiPerfilFletes() {
  const router = useRouter();
  const supabase = createClient();
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'sincronizacion' | 'vehiculo' | 'documentos' | 'billetera' | 'historial' | 'recargas'>('sincronizacion');
  const [planesList, setPlanesList] = useState<any[]>([]);

  // Verificación de autenticación de usuario
  useEffect(() => {
    async function verifyFletesAccess() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.replace('/modulos/fletes/auth');
          return;
        }

        setCurrentUser(user);
        setAuthLoading(false);
      } catch (e) {
        router.replace('/modulos/fletes/auth');
      }
    }
    verifyFletesAccess();
  }, [router, supabase]);

  useEffect(() => {
    getFletesPlanes().then(setPlanesList);
  }, []);

  // Estados del conductor y vehículo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cedulaRef = useRef<HTMLInputElement>(null);
  const licenciaRef = useRef<HTMLInputElement>(null);
  const matriculaRef = useRef<HTMLInputElement>(null);
  
  const [docCedula, setDocCedula] = useState(false);
  const [docLicencia, setDocLicencia] = useState(false);
  const [docMatricula, setDocMatricula] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ubicación del conductor (GPS)
  const [driverLocation, setDriverLocation] = useState<[number, number]>([-4.3285, -79.5560]); // Cariamanga / Loja por defecto
  const [driverCountry, setDriverCountry] = useState('Ecuador');
  const [driverProvince, setDriverProvince] = useState('Loja');
  const [driverCity, setDriverCity] = useState('Cariamanga');

  // Detección real de GPS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setDriverLocation([-4.3285, -79.5560]); // Cariamanga
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Estados Billetera y Planes Sincronizados
  const [balance, setBalance] = useState(119.00);
  const [rechargeAmount, setRechargeAmount] = useState(25);
  const [plan, setPlan] = useState<'VIP' | 'Estandar' | 'Basico'>('VIP');
  const [planesConfig, setPlanesConfig] = useState<PlanConfigItem[]>(() => {
    return SaraFletesRealtimeService.getPlanesConfig();
  });

  const planVIPConfig = useMemo(() => planesConfig.find(p => p.id === 'vip') || {
    id: 'vip', name: 'Plan VIP', monthlyPrice: 0.00, commissionRate: 30.0, priority: 'ALTA' as const, dispatchDelaySeconds: 0, benefits: ['Prioridad ALTA en Radar (Despacho Inmediato Nivel 1)', 'Carreras Ilimitadas a nivel nacional', 'Atención y Soporte 24/7 VIP']
  }, [planesConfig]);

  const planEstandarConfig = useMemo(() => planesConfig.find(p => p.id === 'standard') || {
    id: 'standard', name: 'Plan Estándar', monthlyPrice: 0.00, commissionRate: 20.0, priority: 'MEDIA' as const, dispatchDelaySeconds: 4, benefits: ['Prioridad MEDIA en Radar (Despacho Nivel 2 tras 4s)', 'Carreras Ilimitadas a nivel nacional', 'Atención y Soporte 24/7']
  }, [planesConfig]);

  const planBasicoConfig = useMemo(() => planesConfig.find(p => p.id === 'basic') || {
    id: 'basic', name: 'Plan Básico', monthlyPrice: 0.00, commissionRate: 10.0, priority: 'BAJA' as const, dispatchDelaySeconds: 8, benefits: ['Prioridad BAJA en Radar (Despacho Nivel 3 tras 8s)', 'Carreras Ilimitadas a nivel nacional', 'Atención y Soporte 24/7']
  }, [planesConfig]);

  // Carga inicial y persistencia del saldo de billetera por placa
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plate = currentUser?.user_metadata?.placa || 'PBA-1234';
      const savedBalance = localStorage.getItem(`sara_fletes_rt_wallet_${plate}`);
      if (savedBalance !== null) {
        setBalance(Number(savedBalance));
      }
    }
  }, [currentUser]);

  // Solicitud de flete entrante en tiempo real (SARA Realtime Bus)
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [tripAccepted, setTripAccepted] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  // Referencias mutables para el bus de eventos
  const balanceRef = useRef(balance);
  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const planRef = useRef(plan);
  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  // Cargar solicitud activa existente y suscribirse a eventos de clientes en vivo
  useEffect(() => {
    // 1. Revisar si hay un flete activo reciente o ya aceptado en el bus
    const acceptedDispatch = SaraFletesRealtimeService.getAcceptedDispatch();
    const activeReq = SaraFletesRealtimeService.getActiveRequest();

    if (acceptedDispatch || activeReq) {
      const fleteInfo = activeReq || ({} as any);
      setIncomingRequest({
        fleteId: acceptedDispatch?.fleteId || fleteInfo.id || 'FLT-ACTIVO',
        origen: fleteInfo.origen || 'Punto de Carga',
        destino: fleteInfo.destino || 'Punto de Entrega',
        cliente: fleteInfo.clienteNombre || 'Cliente SARA Constructora',
        material: fleteInfo.material ? `${fleteInfo.material} (${fleteInfo.pesoTon || 1} Ton)` : 'Material de Construcción',
        valorRef: acceptedDispatch?.precioAcordado || fleteInfo.tarifaOfertadaUSD || 2.50,
        distanciaKm: fleteInfo.distanciaKm || 1.8,
        coordsOrigen: fleteInfo.coordsOrigen || [-4.3298, -79.5611],
        coordsDestino: fleteInfo.coordsDestino || [-4.3287, -79.5606],
        codigoAcceso: acceptedDispatch?.codigoAcceso || fleteInfo.codigoAcceso,
        assignedDriverName: acceptedDispatch?.driverName || fleteInfo.assignedDriverName,
        assignedPlate: acceptedDispatch?.plate || fleteInfo.assignedPlate
      });

      if (acceptedDispatch || fleteInfo.status === 'accepted') {
        setTripAccepted(true);
        setAccessCode(acceptedDispatch?.codigoAcceso || fleteInfo.codigoAcceso);
      }
    }

    // 2. Suscribirse a solicitudes y despachos en tiempo real
    const unsub = SaraFletesRealtimeService.subscribe((evt) => {
      if (evt.type === 'NUEVA_SOLICITUD_FLETE') {
        // Validación estricta de saldo prepago: Mínimo $1.00 USD para que el radar notifique
        if (balanceRef.current < 1.00) {
          showToast(`⚠️ Radar silenciado: Tu saldo ($${balanceRef.current.toFixed(2)} USD) es menor a $1.00 USD. Recarga tu billetera.`);
          return;
        }

        // Evaluar retardo de despacho según la jerarquía del plan activo (VIP: 0s, Estándar: 4s, Básico: 8s)
        const currentPlan = planRef.current;
        const targetConfig = currentPlan === 'VIP' ? planVIPConfig : currentPlan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
        const delaySeconds = targetConfig?.dispatchDelaySeconds ?? (currentPlan === 'VIP' ? 0 : currentPlan === 'Estandar' ? 4 : 8);

        const deliverTripRequest = () => {
          // Verificar si el flete no fue tomado por otro conductor en los segundos previos
          const currentAccepted = SaraFletesRealtimeService.getAcceptedDispatch();
          if (currentAccepted && currentAccepted.fleteId === evt.payload.id) {
            return;
          }

          setIncomingRequest({
            fleteId: evt.payload.id,
            origen: evt.payload.origen,
            destino: evt.payload.destino,
            cliente: evt.payload.clienteNombre || 'Cliente SARA Constructora',
            material: `${evt.payload.material} (${evt.payload.pesoTon} Ton)`,
            valorRef: evt.payload.tarifaOfertadaUSD,
            distanciaKm: evt.payload.distanciaKm,
            coordsOrigen: evt.payload.coordsOrigen,
            coordsDestino: evt.payload.coordsDestino,
            codigoAcceso: evt.payload.codigoAcceso
          });
          showToast(`¡Nuevo flete en radar [Jerarquía ${targetConfig?.priority || 'ALTA'}]: ${evt.payload.origen} → ${evt.payload.destino}!`);
        };

        if (delaySeconds > 0) {
          setTimeout(deliverTripRequest, delaySeconds * 1000);
        } else {
          deliverTripRequest();
        }
      } else if (evt.type === 'CANCELAR_SOLICITUD_FLETE') {
        setIncomingRequest((prev: any) => {
          if (prev && prev.fleteId === evt.payload.fleteId) {
            showToast('El cliente ha cancelado la solicitud de flete.');
            setTripAccepted(false);
            setAccessCode(null);
            return null;
          }
          return prev;
        });
      } else if (evt.type === 'CLIENTE_ACEPTO_CONDUCTOR') {
        // Reflejar la orden de inmediato en el entorno del conductor
        setTripAccepted(true);
        setAccessCode(evt.payload.codigoAcceso);
        setIncomingRequest((prev: any) => ({
          ...prev,
          fleteId: evt.payload.fleteId,
          assignedDriverName: evt.payload.driverName,
          assignedPlate: evt.payload.plate,
          valorRef: evt.payload.precioAcordado || prev?.valorRef,
          codigoAcceso: evt.payload.codigoAcceso
        }));
        showToast(`¡Flete Asignado! Conductor: ${evt.payload.driverName} · Tarifa: $${evt.payload.precioAcordado} USD`);
      } else if (evt.type === 'PLANES_ACTUALIZADOS') {
        setPlanesConfig(evt.payload);
        showToast('¡Planes y comisiones de fletes sincronizados con Administración!');
      } else if (evt.type === 'DEBITO_COMISION_CONDUCTOR') {
        const myPlate = currentUser?.user_metadata?.placa || 'PBA-1234';
        if (evt.payload.plate === myPlate) {
          setBalance(evt.payload.nuevoSaldo);
        }
      }
    });

    return () => unsub();
  }, [tripAccepted, currentUser, planVIPConfig, planEstandarConfig, planBasicoConfig]);

  const handleAcceptTrip = async () => {
    if (!incomingRequest) return;
    const valorFlete = incomingRequest.valorRef || 3.50;
    const targetConfig = plan === 'VIP' ? planVIPConfig : plan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
    const comisionPct = targetConfig.commissionRate || (plan === 'VIP' ? 30.0 : plan === 'Estandar' ? 20.0 : 10.0);
    const comisionDebito = +(valorFlete * (comisionPct / 100)).toFixed(2);

    // 1. Verificación estricta de saldo prepago
    if (balance < 1.00 || balance < comisionDebito) {
      showToast(`⚠️ Saldo insuficiente ($${balance.toFixed(2)} USD). La comisión requerida es de $${comisionDebito.toFixed(2)} USD (${comisionPct}%). Recarga saldo para aceptar.`);
      setActiveTab('billetera');
      return;
    }

    const myPlate = currentUser?.user_metadata?.placa || 'PBA-1234';
    const driverName = currentUser?.user_metadata?.full_name || 'Carlos Mendoza';
    const code = incomingRequest?.codigoAcceso || ('SARA-' + Math.floor(1000 + Math.random() * 9000));

    // 2. Débito automático de la comisión desde la billetera prepago
    const debitResult = await debitConductorWallet({
      driverName,
      plate: myPlate,
      amount: comisionDebito,
      fleteId: incomingRequest.fleteId || 'FLT-DIRECT',
      tarifaFlete: valorFlete,
      comisionPorcentaje: comisionPct
    });

    const nuevoSaldo = debitResult.nuevoSaldo;
    setBalance(nuevoSaldo);
    setTripAccepted(true);
    setAccessCode(code);

    // 3. Emisión en tiempo real de aceptación al cliente
    SaraFletesRealtimeService.emit({
      type: 'CHOFER_ACEPTO_FLETE',
      payload: {
        fleteId: incomingRequest.fleteId || 'FLT-DIRECT',
        driverName,
        plate: myPlate,
        vehicleName: 'Volqueta Hino 14m³',
        codigoAcceso: code,
        precio: valorFlete,
        coords: driverLocation
      }
    });

    // 4. Notificaciones claras de saldo
    if (nuevoSaldo < 1.00) {
      showToast(`⚠️ Flete aceptado (Comisión -$${comisionDebito.toFixed(2)} USD). ¡ALERTA: Te quedan $${nuevoSaldo.toFixed(2)} USD de saldo! Recarga para no ser silenciado en el radar.`);
    } else {
      showToast(`¡Flete Aceptado! Se debitó comisión de $${comisionDebito.toFixed(2)} USD (${comisionPct}%). Saldo restante: $${nuevoSaldo.toFixed(2)} USD.`);
    }
  };

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<{
    title: string;
    amount: number;
    isSubscription: boolean;
    interval?: string;
  }>({
    title: 'Recarga de Saldo Prepago',
    amount: 25,
    isSubscription: false
  });

  const handleRecharge = () => {
    setCheckoutConfig({
      title: 'Recarga de Billetera SARA Fletes',
      amount: rechargeAmount,
      isSubscription: false
    });
    setIsCheckoutOpen(true);
  };

  const handleSelectPlanSubscription = (nombrePlan: 'VIP' | 'Estandar' | 'Basico') => {
    const targetConfig = nombrePlan === 'VIP' ? planVIPConfig : nombrePlan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
    setPlan(nombrePlan);
    showToast(`¡Plan ${nombrePlan} activado! Jerarquía: ${targetConfig.priority || 'ALTA'} · Comisión: ${targetConfig.commissionRate}% ($0.00/mes).`);
  };

  const viajes = [
    { id: 1, route: 'MAtecons Chile -> El Dorado (Cariamanga)', embarque: '12 Oct 2026, 14:00', llegada: '12 Oct 2026, 14:15', tiempo: '15 min', tarifa: 3.50, comision: 0.18, utilidad: 3.32 },
    { id: 2, route: 'Centro Cariamanga -> Vía Colaisaca', embarque: '10 Oct 2026, 09:15', llegada: '10 Oct 2026, 09:45', tiempo: '30 min', tarifa: 8.00, comision: 0.40, utilidad: 7.60 },
    { id: 3, route: 'Terminal Terrestre -> San Vicente', embarque: '08 Oct 2026, 16:30', llegada: '08 Oct 2026, 16:50', tiempo: '20 min', tarifa: 4.50, comision: 0.23, utilidad: 4.27 },
  ];

  const historialRecargas = [
    { fecha: '12 Oct 2026, 15:30', referencia: 'TRX-99882211', metodo: 'Tarjeta de Crédito', estado: 'En Verificación', valor: 50.00 },
    { fecha: '01 Oct 2026, 09:15', referencia: 'TRX-11223344', metodo: 'Transferencia Bancaria', estado: 'Aprobado', valor: 100.00 }
  ];

  const handleDownloadExcel = (type: 'viajes' | 'recargas') => {
    const dataToExport = type === 'viajes' ? viajes : historialRecargas;
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'viajes' ? 'Viajes' : 'Recargas');
    XLSX.writeFile(wb, `SARA-Fletes-${type}.xlsx`);
    showToast(`Archivo Excel de ${type} descargado exitosamente`);
  };

  const handleDownloadPDF = (type: 'viajes' | 'recargas') => {
    const doc = new jsPDF();
    doc.text(`GRUPO SARA - Historial de ${type === 'viajes' ? 'Viajes' : 'Recargas'}`, 14, 15);
    if (type === 'viajes') {
      autoTable(doc, {
        head: [['Ruta', 'Embarque', 'Llegada', 'Tarifa', 'Utilidad']],
        body: viajes.map(v => [v.route, v.embarque, v.llegada, `$${v.tarifa}`, `$${v.utilidad}`]),
        startY: 20
      });
    } else {
      autoTable(doc, {
        head: [['Fecha', 'Referencia', 'Método', 'Estado', 'Valor']],
        body: historialRecargas.map(r => [r.fecha, r.referencia, r.metodo, r.estado, `+$${r.valor}`]),
        startY: 20
      });
    }
    doc.save(`SARA-Fletes-${type}.pdf`);
    showToast(`Archivo PDF de ${type} generado exitosamente`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="font-bold text-sm tracking-wide">Cargando Cabina de Transportista SARA...</p>
      </div>
    );
  }

  // Objeto de vehículo del chofer para pintar en el mapa
  const choferVehiculoMapa: VehiculoMapa[] = [
    {
      id: 'MI-VEHICULO',
      nombreChofer: currentUser?.user_metadata?.full_name || 'Carlos Mendoza',
      placa: currentUser?.user_metadata?.placa || 'PBA-1234',
      tipoVehiculo: 'VOLQUETA_V3A',
      lat: driverLocation[0],
      lng: driverLocation[1],
      rating: 4.95,
      telefono: '0991234567',
      disponible: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-slate-100">
      {/* HEADER NAVBAR */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center shadow-lg relative z-20 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-xl text-slate-950 shadow-md">
            <Truck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">
                SARA <span className="text-amber-500">Cabina de Transportista</span>
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Panel de control de unidad, radar de pedidos, billetera y documentación oficial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* BADGE DESTACADO DE SALDO DE BILLETERA */}
          <div
            onClick={() => setActiveTab('billetera')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-xl border flex items-center gap-2.5 transition-all shadow-md ${
              balance < 1.00
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 animate-pulse'
                : balance < 5.00
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${balance < 1.00 ? 'bg-rose-500 text-white' : 'bg-slate-800 text-emerald-400'}`}>
              {balance < 1.00 ? <AlertTriangle className="w-4 h-4 animate-bounce" /> : <Wallet className="w-4 h-4" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                {balance < 1.00 ? '¡Saldo Crítico!' : 'Saldo Billetera'}
              </span>
              <span className="text-sm font-black font-mono leading-none tracking-tight">
                ${balance.toFixed(2)} <span className="text-[10px] font-normal text-slate-400 font-sans">USD</span>
              </span>
            </div>
            {balance < 1.00 && (
              <span className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md ml-1 shadow">
                Recargar
              </span>
            )}
          </div>

          <Link
            href="/modulos/fletes"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            ← Despachador de Fletes
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/modulos/fletes/auth');
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CUERPO PRINCIPAL SPLIT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* SIDEBAR DE PESTAÑAS */}
        <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className={`p-3 rounded-xl border mb-4 transition-all ${
              balance < 1.00 ? 'bg-rose-950/40 border-rose-500/70' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Chofer Asignado</p>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                  plan === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  plan === 'Estandar' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {plan} · {plan === 'VIP' ? 'Prioridad Alta' : plan === 'Estandar' ? 'Prioridad Media' : 'Prioridad Baja'}
                </span>
              </div>
              <p className="font-bold text-white text-sm mt-0.5">
                {currentUser?.user_metadata?.full_name || 'Carlos Mendoza'}
              </p>
              <p className="text-[11px] font-mono text-amber-400">
                Placa: {currentUser?.user_metadata?.placa || 'PBA-1234'}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Billetera Prepago:</span>
                <span className={`font-mono font-black ${balance < 1.00 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  ${balance.toFixed(2)} USD
                </span>
              </div>
              {balance < 1.00 && (
                <div className="mt-2 pt-2 border-t border-rose-500/30">
                  <p className="text-[10px] text-rose-300 font-bold leading-tight">
                    ⚠️ Saldo menor a $1.00. Radar silenciado.
                  </p>
                  <button
                    onClick={() => setActiveTab('billetera')}
                    className="mt-1 w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] py-1 rounded-md transition-colors"
                  >
                    Recargar Ahora
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('sincronizacion')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sincronizacion'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Sincronización & Radar
            </button>

            <button
              onClick={() => setActiveTab('vehiculo')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vehiculo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              Mi Cabina y Perfil
            </button>

            <button
              onClick={() => setActiveTab('documentos')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'documentos'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Mis Documentos
            </button>

            <button
              onClick={() => setActiveTab('billetera')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'billetera'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Billetera y Planes
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'historial'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              Historial de Viajes
            </button>

            <button
              onClick={() => setActiveTab('recargas')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recargas'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Historial de Recargas
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            SARA Fletes v2.4 • Red Ecuatoriana
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL SEGÚN TAB ACTIVA */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)] bg-slate-950">
          
          {/* ================================================================ */}
          {/* TAB 1: SINCRONIZACIÓN Y RADAR EN VIVO (CON MAPA COMPLETO) */}
          {/* ================================================================ */}
          {activeTab === 'sincronizacion' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* BANNER DE ALERTA CRÍTICA SI EL SALDO ES MENOR A $1.00 */}
              {balance < 1.00 && (
                <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500 p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl">
                      <AlertTriangle className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-black text-rose-200 text-sm flex items-center gap-2">
                        <span>⚠️ Te estás quedando sin saldo:</span>
                        <span className="font-mono bg-rose-500/30 px-2 py-0.5 rounded text-white font-black">${balance.toFixed(2)} USD</span>
                      </h4>
                      <p className="text-xs text-rose-300/90 mt-0.5">
                        Tu saldo es menor a $1.00 USD. Tu radar ha sido <strong>silenciado automáticamente</strong> y no recibirás notificaciones de carreras hasta que realices una recarga.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('billetera')}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Recargar Saldo Inmediato
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    Sincronización Fletes (Radar Activo en Tiempo Real)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tu unidad está transmitiendo coordenadas GPS y recibiendo viajes cercanos según tu jerarquía ({plan === 'VIP' ? 'Prioridad Alta' : plan === 'Estandar' ? 'Prioridad Media' : 'Prioridad Baja'}).
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${balance < 1.00 ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></span>
                  <span className="text-slate-300 font-bold">
                    {balance < 1.00 ? 'Radar En Pausa (Sin Saldo)' : `Transmitiendo en ${driverCity}, ${driverProvince}`}
                  </span>
                </div>
              </div>

              {/* MAPA COMPLETO EN VIVO */}
              <div className="flex-1 w-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl">
                <SaraFletesMap
                  userLocation={driverLocation}
                  origenCoords={incomingRequest ? incomingRequest.coordsOrigen : null}
                  destinoCoords={incomingRequest ? incomingRequest.coordsDestino : null}
                  origenNombre={incomingRequest?.origen}
                  destinoNombre={incomingRequest?.destino}
                  vehiculosCercanos={choferVehiculoMapa}
                  rutaCoordenadas={tripAccepted && incomingRequest ? [
                    incomingRequest.coordsOrigen,
                    [-4.3250, -79.5580],
                    incomingRequest.coordsDestino
                  ] : undefined}
                />

                {/* OVERLAY: SOLICITUD ENTRANTE FLOTANTE CON CÁLCULO DE COMISIÓN Y DESCUENTO DE SALDO */}
                {incomingRequest && !tripAccepted && (() => {
                  const valorRef = incomingRequest.valorRef || 3.50;
                  const targetConfig = plan === 'VIP' ? planVIPConfig : plan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
                  const comisionPct = targetConfig.commissionRate || (plan === 'VIP' ? 30.0 : plan === 'Estandar' ? 20.0 : 10.0);
                  const comisionUSD = +(valorRef * (comisionPct / 100)).toFixed(2);
                  const saldoPostViaje = +(balance - comisionUSD).toFixed(2);
                  const saldoSuficiente = balance >= 1.00 && balance >= comisionUSD;

                  return (
                    <div className="absolute top-6 right-6 z-20 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border-2 border-amber-500 p-5 rounded-2xl shadow-2xl animate-in fade-in zoom-in">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          ¡Nuevo Flete en Radar!
                        </span>
                        <div className="text-right">
                          <span className="text-base font-mono text-emerald-400 font-black">
                            ${valorRef.toFixed(2)} USD
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3">
                        <p className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></span>
                          <span><strong>Origen:</strong> {incomingRequest.origen}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
                          <span><strong>Destino:</strong> {incomingRequest.destino}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          Carga: {incomingRequest.material} • Distancia: {incomingRequest.distanciaKm} km
                        </p>
                      </div>

                      {/* DESGLOSE TRANSPARENTE DE COMISIÓN Y SALDO */}
                      <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl mb-4 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Tarifa de Carrera:</span>
                          <span className="font-mono text-white font-bold">${valorRef.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span>Comisión SARA ({plan} - {comisionPct}%):</span>
                          <span className="font-mono font-bold">-${comisionUSD.toFixed(2)} USD</span>
                        </div>
                        <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Tu Saldo Actual:</span>
                          <span className="font-mono font-bold text-amber-400">${balance.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Saldo tras aceptar:</span>
                          <span className={`font-mono font-bold ${saldoPostViaje < 1.00 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ${saldoPostViaje.toFixed(2)} USD
                          </span>
                        </div>
                      </div>

                      {!saldoSuficiente ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-rose-400 font-bold text-center">
                            ⚠️ Saldo insuficiente para cubrir la comisión de este flete (${comisionUSD.toFixed(2)} USD).
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('billetera')}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-rose-600/30"
                          >
                            Recargar Billetera Ahora
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setIncomingRequest(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={handleAcceptTrip}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/25"
                          >
                            Aceptar (-${comisionUSD.toFixed(2)})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* OVERLAY: VIAJE ACEPTADO (EN RUTA) */}
                {tripAccepted && (
                  <div className="absolute bottom-6 left-6 right-6 z-20 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 p-5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                        <Navigation className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base">En Ruta hacia el Punto de Carga</h4>
                        <p className="text-xs text-slate-400">Dirígete a: {incomingRequest?.origen}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Código de Entrega</p>
                        <p className="text-xl font-black font-mono text-emerald-400 tracking-widest">{accessCode}</p>
                      </div>
                      <button
                        onClick={() => {
                          setTripAccepted(false);
                          setAccessCode(null);
                          setIncomingRequest(null);
                          showToast('¡Flete finalizado con éxito!');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-3 rounded-xl text-xs transition-colors shadow-lg"
                      >
                        Completar Entrega
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: MI CABINA Y PERFIL (ESPAÑOL PURO CORREGIDO) */}
          {/* ================================================================ */}
          {activeTab === 'vehiculo' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Datos de Mi Cabina y Perfil</h2>
                <p className="text-xs text-slate-400">Actualiza la información de tu unidad y datos de contacto oficiales.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Foto del conductor */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Fotografía del Conductor</h4>
                    <p className="text-xs text-slate-400 mb-2">Para seguridad de los constructores y clientes, sube una foto clara de tu rostro.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg font-bold transition-colors"
                    >
                      {photoPreview ? 'Cambiar Foto' : 'Seleccionar Archivo'}
                    </button>
                  </div>
                </div>

                {/* Campos de texto en español impecable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Chofer Registrado</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.user_metadata?.full_name || 'Carlos Mendoza'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Celular / WhatsApp</label>
                    <input
                      type="text"
                      defaultValue="0991234567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Vehículo</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500">
                      <option>Volqueta de Obra (14m³)</option>
                      <option>Camión Liviano (5 Ton)</option>
                      <option>Camioneta Pickup (1.2 Ton)</option>
                      <option>Furgón Urbano (3.5 Ton)</option>
                      <option>Camión Mediano (10 Ton)</option>
                      <option>Tráiler / Mula Plataforma (32 Ton)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Placa (Letras y Números)</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.user_metadata?.placa || 'PBA-1234'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Ubicación en vivo */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Ubicación GPS Actual</h4>
                      <p className="text-xs text-slate-400">Transmite tu posición exacta para recibir viajes cercanos y mejorar tu cobertura.</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Conectado y Transmitiendo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">País</label>
                      <select value={driverCountry} onChange={e => setDriverCountry(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                        <option>Ecuador</option>
                        <option>Colombia</option>
                        <option>Perú</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Provincia</label>
                      <input type="text" value={driverProvince} onChange={e => setDriverProvince(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Ciudad / Cantón</label>
                      <input type="text" value={driverCity} onChange={e => setDriverCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: MIS DOCUMENTOS (ESPAÑOL PURO CORREGIDO) */}
          {/* ================================================================ */}
          {activeTab === 'documentos' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Validación de Documentos</h2>
                <p className="text-xs text-slate-400">Verificación normativa para habilitar viajes y despachos oficiales en el radar.</p>
              </div>

              <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-amber-300 text-xs font-semibold leading-relaxed">
                  <strong>Requisito Obligatorio:</strong> Para activar tu perfil y recibir notificaciones de fletes, sube copias legibles de tu cédula de identidad, licencia de conducir profesional y matrícula vehicular del año en curso.
                </p>
              </div>

              <div className="space-y-3">
                {/* Cédula */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Cédula de Identidad</h4>
                      <p className="text-xs text-slate-400">Sube una foto o PDF de tu documento (ambos lados legibles).</p>
                    </div>
                  </div>
                  <div>
                    <input type="file" ref={cedulaRef} className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setDocCedula(true); }} />
                    {docCedula ? (
                      <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Documento Recibido
                      </span>
                    ) : (
                      <button
                        onClick={() => cedulaRef.current?.click()}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" /> Subir Cédula
                      </button>
                    )}
                  </div>
                </div>

                {/* Licencia */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Licencia de Conducir (Tipo C / D / E)</h4>
                      <p className="text-xs text-slate-400">Sube tu licencia profesional vigente emitida por la ANT.</p>
                    </div>
                  </div>
                  <div>
                    <input type="file" ref={licenciaRef} className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setDocLicencia(true); }} />
                    {docLicencia ? (
                      <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Documento Recibido
                      </span>
                    ) : (
                      <button
                        onClick={() => licenciaRef.current?.click()}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" /> Subir Licencia
                      </button>
                    )}
                  </div>
                </div>

                {/* Matrícula */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Matrícula del Vehículo</h4>
                      <p className="text-xs text-slate-400">Documento de revisión técnica vehicular actualizado del año en curso.</p>
                    </div>
                  </div>
                  <div>
                    <input type="file" ref={matriculaRef} className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setDocMatricula(true); }} />
                    {docMatricula ? (
                      <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Documento Recibido
                      </span>
                    ) : (
                      <button
                        onClick={() => matriculaRef.current?.click()}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" /> Subir Matrícula
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: BILLETERA Y PLANES (FORMATO CLARO $49.99/MES Y 5% COMISIÓN) */}
          {/* ================================================================ */}
          {activeTab === 'billetera' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Billetera de Recargas y Planes de Comisión</h2>
                <p className="text-xs text-slate-400">Controla tu saldo disponible, recargas en línea y plan de suscripción activo.</p>
              </div>

              {/* Saldo y Recarga en línea */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Disponible en Billetera</p>
                    <h3 className="text-4xl font-black text-emerald-400 font-mono tracking-tight">${balance.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      De este saldo se debita automáticamente la comisión pactada por flete adjudicado.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800/80 mt-4 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Cuenta habilitada para recibir viajes
                  </div>
                </div>

                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-white text-base">Recargar Saldo a través de Administrador SARA</h4>
                    <p className="text-xs text-slate-400">Integración con pasarelas de pago automáticas y acreditación inmediata.</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[140px]">
                      <span className="absolute left-3.5 top-2.5 font-bold text-slate-500 text-sm">$</span>
                      <input
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(Math.max(5, Number(e.target.value)))}
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      onClick={handleRecharge}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <CreditCard className="w-4 h-4" /> Recargar Saldo Online
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px]">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-white">Tarjetas</p>
                        <p className="text-slate-400 text-[10px]">Crédito y Débito</p>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-white">Transferencias</p>
                        <p className="text-slate-400 text-[10px]">Bancos del Ecuador</p>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-white">Código QR</p>
                        <p className="text-slate-400 text-[10px]">Billeteras Móviles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE PLANES CON FORMATO ULTRA CLARO */}
              <div>
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-white">Planes de Notificación y Comisión Prepago</h3>
                    <p className="text-xs text-slate-400">Todos los planes tienen $0.00 de costo mensual y carreras ilimitadas. Se diferencian por la jerarquía de prioridad en el radar.</p>
                  </div>
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    100% Basado en Comisión por Carrera Ganada
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PLAN VIP */}
                  <div
                    onClick={() => handleSelectPlanSubscription('VIP')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      plan === 'VIP'
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-sm text-white">{planVIPConfig.name}</span>
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          {plan === 'VIP' ? 'Plan Activo' : 'Prioridad Alta'}
                        </span>
                      </div>

                      {/* Costo Mensual $0.00 Destacado */}
                      <div className="mb-3">
                        <p className="text-2xl font-black text-white font-mono">
                          $0.00 <span className="text-xs text-emerald-400 font-sans font-semibold">USD / mes (Sin Mensualidad)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Prepago 100% por carrera adjudicada</p>
                      </div>

                      {/* Jerarquía de Notificación */}
                      <div className="bg-amber-500/15 border border-amber-500/30 p-2.5 rounded-xl mb-3">
                        <p className="text-[10px] text-amber-400 uppercase font-black">Jerarquía de Notificación</p>
                        <p className="text-base font-black text-white">
                          Prioridad ALTA <span className="text-xs text-amber-300 font-normal font-mono">(Inmediato T=0s)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Recibe el viaje antes que cualquier otro plan</p>
                      </div>

                      {/* Comisión por Flete */}
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl mb-3">
                        <p className="text-[10px] text-slate-400 uppercase font-black">Comisión por Flete Ganado</p>
                        <p className="text-xl font-black text-emerald-400 font-mono">
                          {planVIPConfig.commissionRate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">por carrera</span>
                        </p>
                      </div>

                      <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
                        <li className="flex items-center gap-1.5 font-bold text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Despacho Inmediato Nivel 1 en Radar
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Carreras Ilimitadas a nivel nacional
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Atención y Soporte 24/7 VIP
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-colors ${
                        plan === 'VIP' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {plan === 'VIP' ? '✓ Plan Activo' : 'Activar Plan VIP (Prioridad Alta)'}
                    </button>
                  </div>

                  {/* PLAN ESTÁNDAR */}
                  <div
                    onClick={() => handleSelectPlanSubscription('Estandar')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      plan === 'Estandar'
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-sm text-white">{planEstandarConfig.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          plan === 'Estandar' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {plan === 'Estandar' ? 'Plan Activo' : 'Prioridad Media'}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-2xl font-black text-white font-mono">
                          $0.00 <span className="text-xs text-emerald-400 font-sans font-semibold">USD / mes (Sin Mensualidad)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Prepago 100% por carrera adjudicada</p>
                      </div>

                      {/* Jerarquía de Notificación */}
                      <div className="bg-blue-500/15 border border-blue-500/30 p-2.5 rounded-xl mb-3">
                        <p className="text-[10px] text-blue-400 uppercase font-black">Jerarquía de Notificación</p>
                        <p className="text-base font-black text-white">
                          Prioridad MEDIA <span className="text-xs text-blue-300 font-normal font-mono">(Nivel 2 tras 4s)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Notifica si los conductores VIP no toman el flete</p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl mb-3">
                        <p className="text-[10px] text-slate-400 uppercase font-black">Comisión por Flete Ganado</p>
                        <p className="text-xl font-black text-white font-mono">
                          {planEstandarConfig.commissionRate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">por carrera</span>
                        </p>
                      </div>

                      <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
                        <li className="flex items-center gap-1.5 font-bold text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Notificación Nivel 2 (a los 4s)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Carreras Ilimitadas a nivel nacional
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Atención y Soporte 24/7
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-colors ${
                        plan === 'Estandar' ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {plan === 'Estandar' ? '✓ Plan Activo' : 'Activar Estándar (Prioridad Media)'}
                    </button>
                  </div>

                  {/* PLAN BÁSICO */}
                  <div
                    onClick={() => handleSelectPlanSubscription('Basico')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      plan === 'Basico'
                        ? 'border-slate-500 bg-slate-800/40 shadow-lg'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-sm text-white">{planBasicoConfig.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          plan === 'Basico' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {plan === 'Basico' ? 'Plan Activo' : 'Prioridad Baja'}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-2xl font-black text-white font-mono">
                          $0.00 <span className="text-xs text-emerald-400 font-sans font-semibold">USD / mes (Sin Mensualidad)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Prepago 100% por carrera adjudicada</p>
                      </div>

                      {/* Jerarquía de Notificación */}
                      <div className="bg-slate-800/60 border border-slate-700 p-2.5 rounded-xl mb-3">
                        <p className="text-[10px] text-slate-400 uppercase font-black">Jerarquía de Notificación</p>
                        <p className="text-base font-black text-white">
                          Prioridad BAJA <span className="text-xs text-slate-400 font-normal font-mono">(Nivel 3 tras 8s)</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Notifica si los planes superiores no toman el flete</p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl mb-3">
                        <p className="text-[10px] text-slate-400 uppercase font-black">Comisión por Flete Ganado</p>
                        <p className="text-xl font-black text-white font-mono">
                          {planBasicoConfig.commissionRate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">por carrera</span>
                        </p>
                      </div>

                      <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
                        <li className="flex items-center gap-1.5 font-bold text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Notificación Nivel 3 (a los 8s)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Carreras Ilimitadas a nivel nacional
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Atención y Soporte 24/7
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-colors ${
                        plan === 'Basico' ? 'bg-slate-700 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {plan === 'Basico' ? '✓ Plan Activo' : 'Activar Básico (Prioridad Baja)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: HISTORIAL DE VIAJES */}
          {/* ================================================================ */}
          {activeTab === 'historial' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">Historial Detallado de Viajes</h2>
                  <p className="text-xs text-slate-400">Registro de carreras completadas, comisiones y utilidad neta obtenida.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownloadExcel('viajes')} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700">
                    <Download className="w-3.5 h-3.5" /> Excel
                  </button>
                  <button onClick={() => handleDownloadPDF('viajes')} className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3.5 font-bold">Ruta</th>
                        <th className="p-3.5 font-bold">Embarque</th>
                        <th className="p-3.5 font-bold">Llegada</th>
                        <th className="p-3.5 font-bold">Tiempo</th>
                        <th className="p-3.5 font-bold">Tarifa Cobrada</th>
                        <th className="p-3.5 font-bold">Comisión SARA</th>
                        <th className="p-3.5 font-bold">Utilidad Neta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {viajes.map((viaje) => (
                        <tr key={viaje.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 font-bold text-white">{viaje.route}</td>
                          <td className="p-3.5 text-slate-400">{viaje.embarque}</td>
                          <td className="p-3.5 text-slate-400">{viaje.llegada}</td>
                          <td className="p-3.5 text-slate-300 font-mono">{viaje.tiempo}</td>
                          <td className="p-3.5 font-mono font-bold text-white">${viaje.tarifa.toFixed(2)}</td>
                          <td className="p-3.5 font-mono font-bold text-rose-400">- ${viaje.comision.toFixed(2)}</td>
                          <td className="p-3.5 font-mono font-black text-emerald-400">${viaje.utilidad.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 6: HISTORIAL DE RECARGAS (ORGANIZADO A ANCHO COMPLETO - IMAGEN 1) */}
          {/* ================================================================ */}
          {activeTab === 'recargas' && (
            <div className="space-y-6 w-full animate-in fade-in">
              
              {/* Header Organizado y Equilibrado */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <div>
                  <h2 className="text-2xl font-black text-white">Historial de Recargas y Pagos</h2>
                  <p className="text-xs text-slate-400 mt-1">Verifica tus recargas en línea, transferencias bancarias y saldo disponible.</p>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleDownloadExcel('recargas')}
                      className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar Excel
                    </button>
                    <button
                      onClick={() => handleDownloadPDF('recargas')}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar PDF
                    </button>
                  </div>
                </div>

                {/* Tarjeta de Saldo Disponible Equilibrada */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 min-w-[260px]">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saldo Prepago Disponible</p>
                    <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">${balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Métricas Resumen a Ancho Completo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-slate-500">Total Histórico Recargado</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">$150.00 USD</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-slate-500">Transacciones Aprobadas</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">1 Acreditada</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <p className="text-[10px] font-black uppercase text-slate-500">En Verificación</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">1 Pendiente</p>
                </div>
              </div>

              {/* Tabla a Ancho Completo */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl w-full">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        <th className="p-4">Fecha y Hora</th>
                        <th className="p-4">Referencia / Comprobante</th>
                        <th className="p-4">Forma de Pago</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Valor Recargado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {historialRecargas.map((recarga, index) => (
                        <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 text-slate-300 font-medium">{recarga.fecha}</td>
                          <td className="p-4 font-mono text-slate-400 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-slate-500" />
                            {recarga.referencia}
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-2 text-slate-200">
                              {recarga.metodo.includes('Tarjeta') ? (
                                <CreditCard className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Building className="w-4 h-4 text-emerald-400" />
                              )}
                              {recarga.metodo}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                              recarga.estado === 'Aprobado'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>
                              {recarga.estado}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-black text-emerald-400 text-right text-base">
                            +${recarga.valor.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* TOAST DE NOTIFICACIÓN */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-amber-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in z-50">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* MODAL DE CHECKOUT ESTÁNDAR SARA */}
      <StandardCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(txId) => {
          setIsCheckoutOpen(false);
          if (checkoutConfig.isSubscription) {
            showToast(`¡Suscripción al ${checkoutConfig.title} activada! Ref: ${txId}`);
          } else {
            const nuevo = +(balance + checkoutConfig.amount).toFixed(2);
            setBalance(nuevo);
            if (typeof window !== 'undefined') {
              const plate = currentUser?.user_metadata?.placa || 'PBA-1234';
              localStorage.setItem(`sara_fletes_rt_wallet_${plate}`, nuevo.toString());
            }
            showToast(`¡Recarga de $${checkoutConfig.amount.toFixed(2)} USD acreditada exitosamente! Tu nuevo saldo es $${nuevo.toFixed(2)} USD. Ref: ${txId}`);
          }
        }}
        title={checkoutConfig.title}
        badgeText="SARA Fletes"
        amount={checkoutConfig.amount}
        isSubscription={checkoutConfig.isSubscription}
        subscriptionInterval={checkoutConfig.interval || 'por mes'}
        items={[
          {
            label: checkoutConfig.isSubscription 
              ? `Acceso a red y beneficios ${checkoutConfig.title}`
              : `Acreditación directa a billetera móvil SARA Fletes`,
            amount: checkoutConfig.amount
          }
        ]}
        defaultEmail="carlos.mendoza@gruposara.com"
        defaultCustomerName="Carlos Mendoza"
      />
    </div>
  );
}
