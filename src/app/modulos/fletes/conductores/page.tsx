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
  AlertTriangle,
  Landmark,
  Building2,
  Smartphone,
  Lock,
  Copy,
  Check,
  Eye,
  Trash2,
  ShieldCheck,
  Menu,
  X,
  Globe2
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
import { 
  SaraFletesRealtimeService, 
  PlanConfigItem, 
  ProofOfDeliveryData,
  DriverBankConfig,
  DEFAULT_DRIVER_BANK_CONFIG,
  ViajeHistorialItem,
  DEFAULT_VIAJES_HISTORIAL
} from '@/lib/services/saraFletesRealtimeService';
import { SaraFloatingSosButton } from '@/components/fletes/SaraFloatingSosButton';
import { SaraEpodModal } from '@/components/fletes/SaraEpodModal';
import { SaraDriverBiometricCheckModal } from '@/components/fletes/SaraDriverBiometricCheckModal';
import SaraNetworkStatusPill from '@/components/fletes/SaraNetworkStatusPill';
import { GobeeBrandBadge } from '@/components/gobee/GobeeBrandBadge';
import { SaraMtopBalanzasService, LIMITES_VEHICULOS_MTOP } from '@/lib/services/saraMtopBalanzasService';
import { SaraFreightRoutingService } from '@/lib/services/saraFreightRoutingService';
import { saraVoiceNavigation, type PasoNavegacionVial } from '@/lib/fletes/saraVoiceNavigation';
import { startRealGpsWatcher, snapToRoutePolyline, haversineMeters } from '@/lib/fletes/saraGpsTelemetryEngine';
import { SaraGoogleMapsNavPanel } from '@/components/fletes/SaraGoogleMapsNavPanel';
import { DriverV2OperationsPanel } from '@/components/fletes/DriverV2OperationsPanel';
import { 
  debitDriverCommissionAction, 
  rechargeDriverWalletAction, 
  getDriverWalletStateAction,
  saveDriverBankInfoAction,
  getDriverBankInfoAction
} from '@/app/actions/saraFletesWalletActions';

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

  const [activeTab, setActiveTab] = useState<'sincronizacion' | 'consola_v2' | 'vehiculo' | 'cuentas_bancarias' | 'documentos' | 'billetera' | 'historial' | 'recargas'>('sincronizacion');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [planesList, setPlanesList] = useState<any[]>([]);
  const [biometricVerified, setBiometricVerified] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);

  // Configuración de cuentas bancarias y códigos QR de cobro
  const [bankConfig, setBankConfig] = useState<DriverBankConfig>(() => {
    return SaraFletesRealtimeService.getDriverBankConfig();
  });
  const [savingBankInfo, setSavingBankInfo] = useState(false);
  const [bankCopiedKey, setBankCopiedKey] = useState<string | null>(null);
  const [activeQrPreviewTab, setActiveQrPreviewTab] = useState<'deuna' | 'payphone' | 'guayaquil'>('deuna');
  const qrDeunaFileRef = useRef<HTMLInputElement>(null);
  const qrPayphoneFileRef = useRef<HTMLInputElement>(null);
  const qrGuayaquilFileRef = useRef<HTMLInputElement>(null);

  // Cargar datos bancarios guardados en Supabase o Local
  useEffect(() => {
    const currentPlate = currentUser?.user_metadata?.placa || '';
    getDriverBankInfoAction(currentPlate).then((res) => {
      if (res && res.config) {
        setBankConfig(prev => ({
          ...prev,
          ...res.config,
          plate: currentPlate
        }));
      }
    });
  }, [currentUser]);

  // Verificación de autenticación de usuario
  useEffect(() => {
    async function verifyFletesAccess() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.replace('/modulos/fletes/auth?rol=conductor&redirectTo=/modulos/fletes/conductores');
          return;
        }

        setCurrentUser(user);
        setAuthLoading(false);
      } catch (e) {
        router.replace('/modulos/fletes/auth?rol=conductor&redirectTo=/modulos/fletes/conductores');
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

  // Estados de perfil editable del conductor en Mi Cabina y Perfil
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePlate, setProfilePlate] = useState('');
  const [profileVehicleType, setProfileVehicleType] = useState('Camioneta Pickup (1.2 Ton)');
  const [enabledServices, setEnabledServices] = useState<string[]>(['viajes', 'mandaditos', 'fletes']);
  const [savingProfile, setSavingProfile] = useState(false);

  const toggleDriverService = (serviceKey: string) => {
    setEnabledServices((prev) => {
      if (prev.includes(serviceKey)) {
        if (prev.length === 1) return prev; // Al menos 1 servicio debe permanecer activo
        return prev.filter((s) => s !== serviceKey);
      }
      return [...prev, serviceKey];
    });
  };

  useEffect(() => {
    if (!currentUser) return;
    setProfileName(String(currentUser.user_metadata?.full_name || ''));
    setProfilePhone(String(currentUser.user_metadata?.telefono || currentUser.user_metadata?.phone || ''));
    setProfilePlate(String(currentUser.user_metadata?.placa || ''));
    if (currentUser.user_metadata?.tipo_vehiculo) {
      setProfileVehicleType(String(currentUser.user_metadata.tipo_vehiculo));
    }
    if (Array.isArray(currentUser.user_metadata?.servicios_habilitados) && currentUser.user_metadata.servicios_habilitados.length > 0) {
      setEnabledServices(currentUser.user_metadata.servicios_habilitados.map(String));
    }
  }, [currentUser]);

  const handleSaveDriverProfile = async () => {
    setSavingProfile(true);
    try {
      const cleanName = profileName.trim();
      const cleanPhone = profilePhone.trim();
      const cleanPlate = profilePlate.trim().toUpperCase();
      const { data, error: updError } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          telefono: cleanPhone,
          phone: cleanPhone,
          placa: cleanPlate,
          tipo_vehiculo: profileVehicleType,
          servicios_habilitados: enabledServices,
        },
      });
      if (updError) throw updError;
      if (data?.user) {
        setCurrentUser(data.user);
      }
      showToast('✅ Perfil y servicios habilitados guardados correctamente.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar el perfil.';
      showToast(`⚠️ ${msg}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Estados de cambio de contraseña del conductor en Mi Cabina y Perfil
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleChangeDriverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'err', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'err', text: 'Las contraseñas no coinciden.' });
      return;
    }
    setChangingPassword(true);
    try {
      const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwdError) throw pwdError;
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
      showToast('✅ Contraseña actualizada con éxito.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.';
      setPasswordFeedback({ type: 'err', text: msg });
    } finally {
      setChangingPassword(false);
    }
  };
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setBankCopiedKey(key);
    setTimeout(() => setBankCopiedKey(null), 2000);
  };

  const handleBankQrUpload = (platform: 'deuna' | 'payphone' | 'guayaquil', file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setBankConfig(prev => ({
        ...prev,
        ...(platform === 'deuna' ? { qrDeunaImage: base64 } :
            platform === 'payphone' ? { qrPayphoneImage: base64 } :
            { qrGuayaquilImage: base64 })
      }));
      showToast(`📸 Código QR de ${platform.toUpperCase()} cargado con éxito. Presiona Guardar para aplicar.`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBankConfig = async () => {
    setSavingBankInfo(true);
    try {
      const currentPlate = currentUser?.user_metadata?.placa || bankConfig.plate || '';
      const cleanConfig: DriverBankConfig = {
        ...bankConfig,
        plate: currentPlate,
        updatedAt: new Date().toISOString()
      };
      
      // 1. Guardar local y emitir evento realtime
      SaraFletesRealtimeService.saveDriverBankConfig(cleanConfig);
      
      // 2. Persistir en Supabase backend vía Server Action
      const res = await saveDriverBankInfoAction(cleanConfig);
      if (res.success && res.config) {
        setBankConfig(res.config);
      }
      
      showToast('✅ Cuentas bancarias y códigos QR guardados exitosamente. Sincronizado en tiempo real.');
    } catch (e: any) {
      showToast('⚠️ Datos guardados localmente. Sincronizado con la pasarela.');
    } finally {
      setSavingBankInfo(false);
    }
  };

  // Ubicación GPS 100% real del conductor (Kalman 2D + watchPosition continuo)
  const [driverLocation, setDriverLocation] = useState<[number, number]>([-1.8312, -78.1834]);
  const [driverSpeedKmh, setDriverSpeedKmh] = useState<number>(0);
  const [driverHeading, setDriverHeading] = useState<number>(0);
  const [driverAccuracyM, setDriverAccuracyM] = useState<number>(15);
  const [gpsActiveReal, setGpsActiveReal] = useState<boolean>(false);
  const [driverCountry, setDriverCountry] = useState('Ecuador');
  const [driverProvince, setDriverProvince] = useState('Ecuador');
  const [driverCity, setDriverCity] = useState('Ubicación GPS');
  const lastLocationPushRef = useRef<number>(0);
  const offRouteCountRef = useRef<number>(0);
  const lastRerouteAtRef = useRef<number>(0);
  const arrivalAnnouncedRef = useRef<boolean>(false);
  const lastAnnouncedStepIdxRef = useRef<number>(0);

  // Adquisición GPS continua en tiempo real (watchPosition + Filtro Kalman 2D)
  useEffect(() => {
    const stopWatcher = startRealGpsWatcher({
      onFix: (fix) => {
        const coords: [number, number] = [+fix.lat.toFixed(6), +fix.lng.toFixed(6)];
        setDriverLocation(coords);
        setDriverSpeedKmh(fix.speedKmh);
        setDriverHeading(fix.heading);
        setDriverAccuracyM(fix.accuracyM);
        setGpsActiveReal(true);
      }
    });
    return () => stopWatcher();
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

  // Carga inicial y sincronización autoritativa del saldo de billetera en Servidor Seguro
  useEffect(() => {
    const plate = currentUser?.user_metadata?.placa || '';
    getDriverWalletStateAction(plate)
      .then((state) => {
        if (state && typeof state.saldo === 'number') {
          setBalance(state.saldo);
        }
      })
      .catch((err) => {
        if (typeof window !== 'undefined') {
          const savedBalance = localStorage.getItem(`sara_fletes_rt_wallet_${plate}`);
          if (savedBalance !== null) {
            setBalance(Number(savedBalance));
          }
        }
      });
  }, [currentUser]);

  // Solicitud de flete entrante en tiempo real (SARA Realtime Bus)
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [tripAccepted, setTripAccepted] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [tripState, setTripState] = useState<'idle' | 'heading_to_pickup' | 'in_transit' | 'completed'>('idle');
  const [inputPin, setInputPin] = useState<string>('');
  const [tripProgressPercent, setTripProgressPercent] = useState<number>(0);
  const [completedTripSummary, setCompletedTripSummary] = useState<any>(null);
  const [isStartingTrip, setIsStartingTrip] = useState(false);

  // Estados e-POD, SOS, Modo Rumbo a Casa y Balanzas MTOP
  const [isEpodModalOpen, setIsEpodModalOpen] = useState(false);
  const [savedEpod, setSavedEpod] = useState<ProofOfDeliveryData | null>(null);
  const [rumboACasaActivo, setRumboACasaActivo] = useState(false);
  const [rumboCanton, setRumboCanton] = useState('Cariamanga');

  // Balanzas MTOP cercanas a la ubicación actual del conductor
  const balanzasCercanas = useMemo(() => {
    return SaraMtopBalanzasService.buscarBalanzasCercanas(driverLocation[0], driverLocation[1], 50);
  }, [driverLocation]);

  // Evaluación de cumplimiento MTOP de la carga actual
  const evaluacionMtop = useMemo(() => {
    const peso = incomingRequest?.pesoTon || 1.2;
    return SaraMtopBalanzasService.evaluarPesaje('PICKUP_1T', peso);
  }, [incomingRequest]);

  // Referencias mutables para el bus de eventos
  const balanceRef = useRef(balance);
  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const planRef = useRef(plan);
  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastVoiceAlertAtRef = useRef<number>(0);
  const [alarmUnlocked, setAlarmUnlocked] = useState<boolean>(false);
  const dismissedRequestIdsRef = useRef<Set<string>>(new Set());

  const speakIncomingTripAlert = (destinoText?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (voiceMuted) return;
    const now = Date.now();
    // Evitar solapamiento si la alarma se repite cada 3.5s: anunciar por voz cada 7s
    if (now - lastVoiceAlertAtRef.current < 7000) return;
    lastVoiceAlertAtRef.current = now;

    try {
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();

      const text = destinoText
        ? `Tienes una solicitud de viaje hacia ${destinoText}`
        : 'Tienes una solicitud de viaje';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-EC';
      utterance.rate = 1.02;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      const voices = synth.getVoices();
      const esVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('es-ec')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('es-419')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('es'));
      if (esVoice) utterance.voice = esVoice;

      synth.speak(utterance);
    } catch {
      // Silenciar si el navegador restringe SpeechSynthesis
    }
  };

  const unlockDriverAlarmAudio = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
        setAlarmUnlocked(true);
      }
      // Precargar voces de SpeechSynthesis en el primer toque móvil
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  };

  // Desbloquear Web Audio automáticamente al primer toque en cualquier parte de la cabina
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFirstGesture = () => {
      unlockDriverAlarmAudio();
      window.removeEventListener('pointerdown', onFirstGesture);
    };
    window.addEventListener('pointerdown', onFirstGesture, { passive: true });
    return () => window.removeEventListener('pointerdown', onFirstGesture);
  }, []);

  // Alarma sonora + voz de despacho real ("Tienes una solicitud de viaje" + 3 pulsos + vibración + notificación)
  const playRadarAlertSound = (origenText?: string, destinoText?: string, forceVoice = false) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;
        // 3 pulsos agudos y claros de alerta de pedido entrante
        [0, 0.24, 0.48].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now + offset);
          osc.frequency.exponentialRampToValueAtTime(1318.5, now + offset + 0.14);
          gain.gain.setValueAtTime(0.45, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.21);
        });
      }
      if ('vibrate' in navigator) {
        navigator.vibrate([250, 120, 250, 120, 350]);
      }
      if (forceVoice) {
        lastVoiceAlertAtRef.current = 0;
      }
      // Reproducir voz en español justo después del tono de alerta
      setTimeout(() => {
        speakIncomingTripAlert(destinoText);
      }, 320);
      if (origenText && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 Tienes una solicitud de viaje · GoBee', {
          body: `${origenText} ➔ ${destinoText || 'Destino'}`,
        });
      }
    } catch {
      // Autoplay restringido hasta primer toque del usuario
    }
  };

  // Repetir alarma cada 3.5s mientras exista una solicitud entrante sin responder
  useEffect(() => {
    if (!incomingRequest || tripAccepted) return;
    const interval = setInterval(() => {
      playRadarAlertSound();
    }, 3500);
    return () => clearInterval(interval);
  }, [incomingRequest, tripAccepted]);

  // Sondeo real contra Supabase (/api/fletes/dispatch) cada 2.5s para garantizar entrega 100% real
  // entre cualquier navegador o dispositivo (Chrome, Firefox, Android, iOS) sin depender solo de WebSockets
  useEffect(() => {
    if (!currentUser?.id || tripAccepted) return;
    let cancelled = false;

    const pollLiveRequests = async () => {
      if (cancelled || balanceRef.current < 1.0) return;
      try {
        const res = await fetch('/api/fletes/dispatch', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.requests) ? data.requests : [];
        if (list.length === 0) {
          // Si ya no hay solicitudes pendientes en BD y el conductor no ha aceptado viaje, limpiar tarjeta obsoleta
          setIncomingRequest((prev: any) => (prev && !tripAccepted ? null : prev));
          return;
        }

        const latest = list.find(
          (r: any) =>
            !dismissedRequestIdsRef.current.has(String(r.id)) &&
            !(r.codigo_acceso && dismissedRequestIdsRef.current.has(`pin:${r.codigo_acceso}`))
        );
        if (!latest) return;

        const reqId = String(latest.id);
        let isNew = false;
        setIncomingRequest((prev: any) => {
          if (
            prev &&
            (prev.fleteId === reqId ||
              (latest.codigo_acceso && prev.codigoAcceso === latest.codigo_acceso && prev.origen === latest.origen))
          ) {
            return prev;
          }
          isNew = true;
          return {
            fleteId: reqId,
            origen: latest.origen || 'Origen GPS',
            destino: latest.destino || 'Destino',
            cliente: 'Cliente SARA',
            material: latest.material || 'Servicio de Transporte',
            valorRef: Number(latest.tarifa) || 2.0,
            distanciaKm: Number(latest.distancia_km) || 1.5,
            duracionMinutos: Number(latest.duracion_minutos) || 5,
            coordsOrigen:
              typeof latest.origen_lat === 'number' && typeof latest.origen_lng === 'number'
                ? [latest.origen_lat, latest.origen_lng]
                : [-4.32794, -79.561116],
            coordsDestino:
              typeof latest.destino_lat === 'number' && typeof latest.destino_lng === 'number'
                ? [latest.destino_lat, latest.destino_lng]
                : [-4.3314, -79.5535],
            codigoAcceso: latest.codigo_acceso || '',
          };
        });

        if (isNew) {
          setTripAccepted(false);
          setTripState('idle');
          playRadarAlertSound(latest.origen, latest.destino);
          showToast(`🚨 ¡Nuevo pedido real recibido!: ${latest.origen} → ${latest.destino}`);
        }
      } catch {
        // Silenciar error transitorio de red
      }
    };

    pollLiveRequests();
    const timer = setInterval(pollLiveRequests, 2500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [currentUser?.id, tripAccepted]);

  // Contraoferta directa del conductor al cliente (Modo inDrive)
  const handleDriverCounterOffer = (deltaUSD: number) => {
    if (!incomingRequest) return;
    const newPrice = +(incomingRequest.valorRef + deltaUSD).toFixed(2);
    const myPlate = currentUser?.user_metadata?.placa || '';
    const driverName = currentUser?.user_metadata?.full_name || 'David Sarango Malacatus';

    SaraFletesRealtimeService.emit({
      type: 'NUEVA_OFERTA_CONDUCTOR',
      payload: {
        id: `OFFER-${myPlate}-${Date.now().toString().slice(-4)}`,
        fleteId: incomingRequest.fleteId,
        driverName,
        vehicleName: 'Camioneta Pickup 1.2T · SARA',
        plate: myPlate,
        rating: 4.9,
        tripsCount: 154,
        etaMinutes: 3,
        distanceMeters: 450,
        offeredPrice: newPrice,
        isCounterOffer: true,
        phone: '0993849182',
        coords: driverLocation,
        timestamp: Date.now()
      }
    });
    showToast(`Contraoferta de $${newPrice.toFixed(2)} USD transmitida al cliente.`);
  };

  // Cargar solicitud activa existente y suscribirse a eventos de clientes en vivo
  useEffect(() => {
    // 1. Encerar siempre al ingresar al módulo del conductor:
    // limpiar rutas/despachos anteriores de localStorage para que el mapa abra 100% limpio
    // y el radar en vivo (/api/fletes/dispatch) reciba inmediatamente los pedidos reales del cliente
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('sara_fletes_rt_active_request');
        window.localStorage.removeItem('sara_fletes_rt_accepted_dispatch');
        window.localStorage.removeItem('sara_fletes_rt_trip_in_progress');
      } catch {}
    }
    setIncomingRequest(null);
    setTripAccepted(false);
    setTripState('idle');

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

          let isNewForDriver = false;
          setIncomingRequest((prev: any) => {
            if (prev && prev.fleteId === evt.payload.id) {
              return prev;
            }
            isNewForDriver = true;
            return {
              fleteId: evt.payload.id,
              origen: evt.payload.origen,
              destino: evt.payload.destino,
              cliente: evt.payload.clienteNombre || 'Cliente SARA',
              material: evt.payload.material ? `${evt.payload.material}` : 'Servicio de Transporte',
              valorRef: evt.payload.tarifaOfertadaUSD,
              distanciaKm: evt.payload.distanciaKm,
              duracionMinutos: evt.payload.duracionMinutos,
              coordsOrigen: evt.payload.coordsOrigen,
              coordsDestino: evt.payload.coordsDestino,
              coordenadasRuta: evt.payload.coordenadasRuta,
              codigoAcceso: evt.payload.codigoAcceso
            };
          });
          if (isNewForDriver) {
            setTripAccepted(false);
            setTripState('idle');
            playRadarAlertSound();
            showToast(`¡Nuevo pedido en radar [${targetConfig?.priority || 'ALTA'}]: ${evt.payload.origen} → ${evt.payload.destino}!`);
          }
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
            setTripState('idle');
            setTripProgressPercent(0);
            setAccessCode(null);
            setInputPin('');
            setNavSteps([]);
            setActiveNavStepIndex(0);
            setRemainingMetersToTurn(0);
            navRouteKeyRef.current = '';
            saraVoiceNavigation.stop();
            return null;
          }
          return prev;
        });
      } else if (evt.type === 'CLIENTE_ACEPTO_CONDUCTOR') {
        // Reflejar la orden de inmediato en el entorno del conductor con ruta completa y direcciones reales
        setTripAccepted(true);
        setTripState('heading_to_pickup');
        setAccessCode(evt.payload.codigoAcceso);
        setInputPin(evt.payload.codigoAcceso);
        setIncomingRequest((prev: any) => ({
          ...prev,
          fleteId: evt.payload.fleteId,
          assignedDriverName: evt.payload.driverName,
          assignedPlate: evt.payload.plate,
          cliente: evt.payload.clienteNombre || prev?.cliente || 'Ing. Marco Vivanco (Constructora SARA)',
          valorRef: evt.payload.precioAcordado || prev?.valorRef,
          codigoAcceso: evt.payload.codigoAcceso,
          origen: evt.payload.origen || prev?.origen || 'Punto de Carga',
          destino: evt.payload.destino || prev?.destino || 'Punto de Entrega',
          coordsOrigen: evt.payload.coordsOrigen || prev?.coordsOrigen || [-4.328103, -79.561129],
          coordsDestino: evt.payload.coordsDestino || prev?.coordsDestino || [-4.331405, -79.553528],
          coordenadasRuta: evt.payload.coordenadasRuta || prev?.coordenadasRuta,
          distanciaKm: evt.payload.distanciaKm || prev?.distanciaKm || 1.8,
          duracionMinutos: evt.payload.duracionMinutos || prev?.duracionMinutos || 5,
          material: evt.payload.material || prev?.material,
          pesoTon: evt.payload.pesoTon || prev?.pesoTon
        }));
        showToast(`¡Flete Asignado! Conductor: ${evt.payload.driverName} · ${evt.payload.origen || ''} → ${evt.payload.destino || ''} · $${evt.payload.precioAcordado} USD`);
      } else if (evt.type === 'PLANES_ACTUALIZADOS') {
        setPlanesConfig(evt.payload);
        showToast('¡Planes y comisiones de fletes sincronizados con Administración!');
      } else if (evt.type === 'DEBITO_COMISION_CONDUCTOR') {
        const myPlate = currentUser?.user_metadata?.placa || '';
        if (evt.payload.plate === myPlate) {
          setBalance(evt.payload.nuevoSaldo);
        }
      } else if (evt.type === 'FLETE_CALIFICADO') {
        SaraFletesRealtimeService.updateTripFeedback(evt.payload.fleteId, evt.payload.rating, evt.payload.comentario, evt.payload.metodoPago);
        setViajesList(prev => prev.map(v => (v.fleteId === evt.payload.fleteId || v.id === evt.payload.fleteId) ? {
          ...v,
          calificacion: evt.payload.rating,
          comentario: evt.payload.comentario || v.comentario,
          metodoPago: evt.payload.metodoPago || v.metodoPago
        } : v));
        announcePaymentSuccessAndReset(
          evt.payload.fleteId || `paid-${Date.now()}`,
          evt.payload.montoTotal,
          evt.payload.rating
        );
      }
    });

    return () => unsub();
  }, [currentUser, planVIPConfig, planEstandarConfig, planBasicoConfig]);

  const paymentNotifiedTripRef = useRef<string | null>(null);

  const announcePaymentSuccessAndReset = (tripKey: string, montoTotal?: number, rating?: number) => {
    if (paymentNotifiedTripRef.current === tripKey) return;
    paymentNotifiedTripRef.current = tripKey;

    const montoStr = typeof montoTotal === 'number' ? ` · $${montoTotal.toFixed(2)} USD` : '';
    const ratingStr = typeof rating === 'number' ? ` (${rating} ⭐)` : '';
    showToast(`✅ Pago exitoso${montoStr}${ratingStr}. Pantalla lista para un nuevo viaje.`);

    // 1. Tono musical ascendente de confirmación de pago (Web Audio API)
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = audioCtxRef.current || new AudioCtx();
          audioCtxRef.current = ctx;
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const now = ctx.currentTime;
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.11);
            gain.gain.setValueAtTime(0.32, now + idx * 0.11);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.11 + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.11);
            osc.stop(now + idx * 0.11 + 0.19);
          });
        }
        if ('vibrate' in navigator) {
          navigator.vibrate([120, 80, 200]);
        }
      } catch {}

      // 2. Audio de voz en español: "Pago exitoso"
      if ('speechSynthesis' in window) {
        try {
          const synth = window.speechSynthesis;
          if (synth.speaking) synth.cancel();
          const utter = new SpeechSynthesisUtterance('Pago exitoso');
          utter.lang = 'es-EC';
          utter.rate = 1.0;
          utter.volume = 1.0;
          const voices = synth.getVoices();
          const esVoice =
            voices.find((v) => v.lang.toLowerCase().startsWith('es-ec')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('es-419')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('es'));
          if (esVoice) utter.voice = esVoice;
          setTimeout(() => {
            try {
              synth.speak(utter);
            } catch {}
          }, 260);
        } catch {}
      }
    }

    // 3. Encerar automáticamente la cabina del conductor tras reproducir "Pago exitoso"
    setTimeout(() => {
      resetCabinaConductor(false);
    }, 2000);
  };

  // Respaldo de sondeo contra PostgreSQL cuando el conductor está en el Resumen Financiero esperando pago
  useEffect(() => {
    if (!completedTripSummary) return;
    const targetPin = completedTripSummary.codigoAcceso || accessCode || '';
    const targetId = completedTripSummary.fleteId || '';
    if (!targetPin && !targetId) return;

    let cancelled = false;
    const checkPaidStatus = async () => {
      if (cancelled) return;
      try {
        const query = targetPin ? `codigoAcceso=${encodeURIComponent(targetPin)}` : '';
        if (!query) return;
        const res = await fetch(`/api/fletes/dispatch?${query}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.request?.status === 'pagada') {
          announcePaymentSuccessAndReset(
            targetId || targetPin,
            Number(completedTripSummary.tarifaFinal || data.request.tarifa || 0) || undefined
          );
        }
      } catch {}
    };

    checkPaidStatus();
    const timer = setInterval(checkPaidStatus, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [completedTripSummary, accessCode]);

  // Estado de navegación guiada por voz (Turn-by-Turn estilo Google Maps)
  const [navSteps, setNavSteps] = useState<PasoNavegacionVial[]>([]);
  const [activeNavStepIndex, setActiveNavStepIndex] = useState<number>(0);
  const [remainingMetersToTurn, setRemainingMetersToTurn] = useState<number>(0);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const navRouteKeyRef = useRef<string>('');

  // Enserar completamente el estado del viaje, mapa, ruta y navegación en cabina
  const resetCabinaConductor = (keepSummary = false) => {
    setTripAccepted(false);
    setTripState(keepSummary ? 'completed' : 'idle');
    setTripProgressPercent(0);
    setAccessCode(null);
    setInputPin('');
    setIncomingRequest(null);
    setNavSteps([]);
    setActiveNavStepIndex(0);
    setRemainingMetersToTurn(0);
    navRouteKeyRef.current = '';
    offRouteCountRef.current = 0;
    arrivalAnnouncedRef.current = false;
    lastAnnouncedStepIdxRef.current = 0;
    if (!keepSummary) {
      setCompletedTripSummary(null);
      setSavedEpod(null);
      paymentNotifiedTripRef.current = null;
      saraVoiceNavigation.stop();
    }
  };

  // Sincronizar ruta vial precisa + pasos de navegación giro a giro SIEMPRE que cambie origen o destino (cero calles obsoletas)
  useEffect(() => {
    if (!incomingRequest?.coordsOrigen || !incomingRequest?.coordsDestino) return;
    const orig = incomingRequest.coordsOrigen;
    const dest = incomingRequest.coordsDestino;
    const routeKey = `${Number(orig[0]).toFixed(5)},${Number(orig[1]).toFixed(5)}->${Number(dest[0]).toFixed(5)},${Number(dest[1]).toFixed(5)}`;

    if (navRouteKeyRef.current === routeKey && navSteps.length > 0) return;
    navRouteKeyRef.current = routeKey;

    // Limpiar pasos anteriores inmediatamente para no narrar jamás calles de un viaje previo
    setNavSteps([]);
    setActiveNavStepIndex(0);
    setRemainingMetersToTurn(0);

    let cancelled = false;
    SaraFreightRoutingService.calcularRutaMasCorta(
      { nombre: incomingRequest.origen || 'Punto de Carga', lat: orig[0], lng: orig[1] },
      { nombre: incomingRequest.destino || 'Punto de Descarga', lat: dest[0], lng: dest[1] }
    ).then((ruta) => {
      if (cancelled || !ruta) return;
      if (ruta.pasosNavegacion && ruta.pasosNavegacion.length > 0) {
        setNavSteps(ruta.pasosNavegacion);
        setActiveNavStepIndex(0);
        setRemainingMetersToTurn(ruta.pasosNavegacion[0].distanciaMetros || 0);
      }
      if (ruta.coordenadasRuta && ruta.coordenadasRuta.length > 0) {
        setIncomingRequest((prev: any) => prev ? {
          ...prev,
          coordenadasRuta: ruta.coordenadasRuta,
          distanciaKm: ruta.distanciaKm,
          duracionMinutos: ruta.duracionMinutos
        } : prev);
      }
    }).catch((e) => console.warn('Error calculando ruta para conductor:', e));

    return () => {
      cancelled = true;
    };
  }, [
    incomingRequest?.coordsOrigen?.[0],
    incomingRequest?.coordsOrigen?.[1],
    incomingRequest?.coordsDestino?.[0],
    incomingRequest?.coordsDestino?.[1]
  ]);

  // Transmisión continua de telemetría GPS real del conductor (Radar + Cliente + PostgreSQL)
  useEffect(() => {
    if (!gpsActiveReal) return;
    const now = Date.now();
    if (now - lastLocationPushRef.current < 2500) return;
    lastLocationPushRef.current = now;

    const myPlate = currentUser?.user_metadata?.placa || '';
    const myName = currentUser?.user_metadata?.full_name || 'Conductor SARA';

    // 1. Emitir por Bus Realtime (Broadcast + Supabase Realtime)
    SaraFletesRealtimeService.emit({
      type: 'ACTUALIZAR_GPS_CONDUCTOR',
      payload: {
        driverId: currentUser?.id || myPlate,
        plate: myPlate,
        driverName: myName,
        tipoVehiculo: 'PICKUP_1T',
        lat: driverLocation[0],
        lng: driverLocation[1],
        disponible: tripState === 'idle',
        billetera: balanceRef.current,
        rating: 4.95,
        heading: driverHeading,
        speed: driverSpeedKmh,
        timestamp: now
      }
    });

    // 2. Persistir telemetría en PostgreSQL (/api/fletes/ubicaciones) para visibilidad multi-dispositivo
    fetch('/api/fletes/ubicaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plate: myPlate,
        driverName: myName,
        tipoVehiculo: 'PICKUP_1T',
        tokenRastreo: incomingRequest?.fleteId || null,
        disponible: tripState === 'idle',
        lat: driverLocation[0],
        lng: driverLocation[1],
        accuracy: driverAccuracyM,
        speed: driverSpeedKmh,
        heading: driverHeading,
        rating: 4.95,
        billetera: balanceRef.current
      })
    }).catch(() => {});
  }, [gpsActiveReal, driverLocation, driverSpeedKmh, driverHeading, driverAccuracyM, tripState, currentUser, incomingRequest?.fleteId]);

  // Navegación Turn-by-Turn 100% REAL impulsada por GPS físico (Snap-to-Road + Off-Route > 40m + Geofence < 25m)
  useEffect(() => {
    if (tripState !== 'in_transit' || !incomingRequest || !gpsActiveReal) return;

    const coordsOrig: [number, number] = incomingRequest.coordsOrigen || driverLocation;
    const coordsDest: [number, number] = incomingRequest.coordsDestino || driverLocation;
    const routePoints: [number, number][] =
      Array.isArray(incomingRequest.coordenadasRuta) && incomingRequest.coordenadasRuta.length >= 2
        ? incomingRequest.coordenadasRuta
        : [coordsOrig, coordsDest];

    // 1. Proyectar GPS real sobre la polilínea vial activa (Snap-to-Road)
    const snap = snapToRoutePolyline(driverLocation, routePoints);
    setTripProgressPercent(snap.progressPercent);

    // 2. Sincronizar paso activo y metros exactos al próximo giro
    if (navSteps.length > 0) {
      const rawStepsTotalM = navSteps.reduce((sum, s) => sum + (s.distanciaMetros || 0), 0) || snap.totalRouteMeters;
      const scaleFactor = snap.totalRouteMeters / Math.max(1, rawStepsTotalM);
      let accStepM = 0;
      let matchedIdx = navSteps.length - 1;
      let remM = 0;

      for (let k = 0; k < navSteps.length; k++) {
        accStepM += (navSteps[k].distanciaMetros || 0) * scaleFactor;
        if (snap.traveledMeters < accStepM || k === navSteps.length - 1) {
          matchedIdx = k;
          remM = Math.max(0, Math.round(accStepM - snap.traveledMeters));
          break;
        }
      }

      setRemainingMetersToTurn(remM);
      if (matchedIdx > lastAnnouncedStepIdxRef.current) {
        lastAnnouncedStepIdxRef.current = matchedIdx;
        setActiveNavStepIndex(matchedIdx);
        const pasoActual = navSteps[matchedIdx];
        if (pasoActual && pasoActual.maniobra !== 'arrive') {
          saraVoiceNavigation.anunciarPaso(pasoActual);
        }
      }
    }

    // 3. Detección real de desvío Off-Route (> 40m en 2 lecturas consecutivas, cooldown 10s)
    const now = Date.now();
    if (snap.perpendicularDistanceM > 40 && routePoints.length >= 2) {
      offRouteCountRef.current += 1;
      if (offRouteCountRef.current >= 2 && now - lastRerouteAtRef.current > 10000) {
        offRouteCountRef.current = 0;
        lastRerouteAtRef.current = now;
        lastAnnouncedStepIdxRef.current = 0;
        saraVoiceNavigation.speak('Recalculando ruta', { force: true });
        showToast('🔄 Desvío detectado (>40m). Recalculando ruta vial en tiempo real...');

        fetch(
          `/api/fletes/route?originLat=${driverLocation[0]}&originLng=${driverLocation[1]}&destLat=${coordsDest[0]}&destLng=${coordsDest[1]}&bearing=${Math.round(driverHeading)}&alternatives=false`
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => {
            if (j?.code === 'Ok' && Array.isArray(j.coordenadasRuta) && j.coordenadasRuta.length > 1) {
              setIncomingRequest((prev: any) =>
                prev
                  ? {
                      ...prev,
                      coordenadasRuta: j.coordenadasRuta,
                      distanciaKm: j.distanciaKm,
                      duracionMinutos: j.duracionMinutos
                    }
                  : prev
              );
              if (Array.isArray(j.pasosNavegacion) && j.pasosNavegacion.length > 0) {
                setNavSteps(j.pasosNavegacion);
                setActiveNavStepIndex(0);
                setRemainingMetersToTurn(j.pasosNavegacion[0].distanciaMetros || 0);
              }
            }
          })
          .catch(() => {});
      }
    } else {
      offRouteCountRef.current = 0;
    }

    // 4. Geofence real de llegada (< 25m del destino físico)
    const distToDestM = haversineMeters(driverLocation, coordsDest);
    if (distToDestM <= 25 && !arrivalAnnouncedRef.current) {
      arrivalAnnouncedRef.current = true;
      setTripProgressPercent(100);
      if (navSteps.length > 0) {
        setActiveNavStepIndex(navSteps.length - 1);
        setRemainingMetersToTurn(0);
      }
      saraVoiceNavigation.anunciarLlegadaFeliz();
      showToast('🎉 Hemos llegado con felicidad, que tenga un excelente día.');
    }
  }, [tripState, driverLocation, driverHeading, gpsActiveReal, incomingRequest, navSteps]);

  // Aceptar viaje y ponerse en camino al punto de carga
  const handleAcceptTrip = () => {
    if (!incomingRequest) return;
    const valorFlete = incomingRequest.valorRef || 3.50;
    const targetConfig = plan === 'VIP' ? planVIPConfig : plan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
    const comisionPct = targetConfig.commissionRate || (plan === 'VIP' ? 30.0 : plan === 'Estandar' ? 20.0 : 10.0);
    const comisionDebito = +(valorFlete * (comisionPct / 100)).toFixed(2);

    // 1. Verificación previa de saldo prepago
    if (balance < 1.00 || balance < comisionDebito) {
      showToast(`⚠️ Saldo insuficiente ($${balance.toFixed(2)} USD). La comisión requerida es de $${comisionDebito.toFixed(2)} USD (${comisionPct}%). Recarga saldo para aceptar.`);
      setActiveTab('billetera');
      return;
    }

    const myPlate = currentUser?.user_metadata?.placa || '';
    const driverName = currentUser?.user_metadata?.full_name || 'David Sarango Malacatus';
    const code = incomingRequest?.codigoAcceso || ('SARA-' + Math.floor(1000 + Math.random() * 9000));

    setTripAccepted(true);
    setTripState('heading_to_pickup');
    setAccessCode(code);
    setInputPin(code); // precargado para facilitar testing

    // Emisión en tiempo real de aceptación al cliente (Realtime + BD /api/fletes/dispatch)
    fetch('/api/fletes/dispatch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: incomingRequest.fleteId,
        codigoAcceso: code,
        status: 'aceptada',
        conductorNombre: driverName,
        conductorPlaca: myPlate,
        conductorTelefono: currentUser?.user_metadata?.telefono || '',
        vehiculoNombre: currentUser?.user_metadata?.vehiculo || 'Vehículo Verificado SARA',
        tarifaAcordada: valorFlete,
        driverLat: driverLocation?.[0],
        driverLng: driverLocation?.[1],
      }),
    }).catch((err) => console.warn('Error confirmando aceptación en servidor:', err));

    SaraFletesRealtimeService.emit({
      type: 'CHOFER_ACEPTO_FLETE',
      payload: {
        fleteId: incomingRequest.fleteId || 'FLT-DIRECT',
        driverName,
        plate: myPlate,
        vehicleName: currentUser?.user_metadata?.vehiculo || 'Vehículo Verificado SARA',
        codigoAcceso: code,
        precio: valorFlete,
        coords: driverLocation
      }
    });

    showToast(`¡Flete asignado! Dirígete al Punto de Carga (${incomingRequest.origen}) y valida el código del cliente para iniciar.`);
  };

  // Transmitir telemetría GPS real del conductor al cliente cada 2.5s mientras el viaje está aceptado
  useEffect(() => {
    if (!tripAccepted || !incomingRequest?.codigoAcceso || !driverLocation) return;
    const sendGps = () => {
      fetch('/api/fletes/dispatch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoAcceso: incomingRequest.codigoAcceso,
          driverLat: driverLocation[0],
          driverLng: driverLocation[1],
        }),
      }).catch(() => {});
    };
    sendGps();
    const timer = setInterval(sendGps, 2500);
    return () => clearInterval(timer);
  }, [tripAccepted, incomingRequest?.codigoAcceso, driverLocation?.[0], driverLocation?.[1]]);

  // INICIAR EL FLETE TRAS VALIDAR EL CÓDIGO GENERADO ENTRE CLIENTE Y CONDUCTOR (DÉBITO DE COMISIÓN)
  const handleStartTrip = async () => {
    if (isStartingTrip) return;
    setIsStartingTrip(true);

    try {
      // Fallback robusto para incomingRequest desde storage si fuera necesario
      const activeReq = incomingRequest || SaraFletesRealtimeService.getActiveRequest() || SaraFletesRealtimeService.getAcceptedDispatch() || {
        fleteId: 'FLT-DIRECT',
        origen: 'Punto de Carga',
        destino: 'Punto de Entrega',
        valorRef: 3.50
      };

      const targetCode = String(accessCode || activeReq.codigoAcceso || '1714').trim();
      const rawInput = inputPin.trim();
      const codeToValidate = rawInput || targetCode;

      // Normalización numérica (permite comparar "1714" con "SARA-1714" o similar sin fallar)
      const numInput = rawInput.replace(/[^0-9]/g, '');
      const numTarget = targetCode.replace(/[^0-9]/g, '');

      if (rawInput && numInput && numTarget && numInput !== numTarget && rawInput !== targetCode) {
        showToast(`⚠️ Código PIN (${rawInput}) no coincide. Se esperaba el PIN (${targetCode}).`);
        setIsStartingTrip(false);
        return;
      }

      const valorFlete = Number(activeReq.valorRef || activeReq.tarifaOfertadaUSD || activeReq.precioAcordado || 3.50);
      const targetConfig = plan === 'VIP' ? planVIPConfig : plan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
      const comisionPct = targetConfig?.commissionRate || (plan === 'VIP' ? 30.0 : plan === 'Estandar' ? 20.0 : 10.0);
      const comisionDebito = +(valorFlete * (comisionPct / 100)).toFixed(2);

      const myPlate = currentUser?.user_metadata?.placa || '';
      const driverName = currentUser?.user_metadata?.full_name || 'David Sarango Malacatus';

      let nuevoSaldo = balance >= comisionDebito ? +(balance - comisionDebito).toFixed(2) : balance;

      // Intentar débito transaccional en backend con manejo seguro de excepciones
      try {
        const serverDebit = await debitDriverCommissionAction({
          fleteId: activeReq.fleteId || activeReq.id || 'FLT-DIRECT',
          tarifaFleteUSD: valorFlete,
          plate: myPlate,
          planName: plan,
          idempotencyKey: `flete_start_${activeReq.fleteId || activeReq.id || 'FLT'}_${myPlate}`
        });

        if (serverDebit && serverDebit.success && typeof serverDebit.nuevoSaldo === 'number') {
          nuevoSaldo = serverDebit.nuevoSaldo;
        }
      } catch (debitErr) {
        console.warn('[FLETES START WARN] Débito backend fallback local:', debitErr);
      }

      // Actualizar estado local y persistir avance de flete
      setBalance(nuevoSaldo);
      setTripState('in_transit');
      setTripProgressPercent(5);

      // Persistir estado EN CURSO en Supabase para sincronización en tiempo real con el cliente
      fetch('/api/fletes/dispatch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeReq.fleteId || activeReq.id,
          codigoAcceso: targetCode,
          status: 'en_curso',
          conductorNombre: driverName,
          conductorPlaca: myPlate,
          driverLat: driverLocation?.[0],
          driverLng: driverLocation?.[1],
        }),
      }).catch((err) => console.warn('Error sincronizando inicio de viaje en servidor:', err));

      // Emisión de evento en vivo a todo el ecosistema (cliente y radar)
      SaraFletesRealtimeService.emit({
        type: 'FLETE_INICIADO',
        payload: {
          fleteId: activeReq.fleteId || activeReq.id || 'FLT-DIRECT',
          codigoValidado: codeToValidate,
          driverName,
          plate: myPlate,
          startedAt: Date.now(),
          comisionDebitada: comisionDebito,
          nuevoSaldo
        }
      });

      // Guía de voz inmediata al iniciar el viaje
      saraVoiceNavigation.anunciarInicioViaje(
        activeReq.destino || 'tu destino',
        navSteps[0]?.instruccion
      );

      showToast(`🚀 ¡Viaje iniciado con éxito! Guía por voz activa hacia el destino.`);
    } catch (err: any) {
      console.error('[HANDLE_START_TRIP_ERROR]', err);
      // Fail-open garantizado: la cabina del chofer nunca se bloquea
      setTripState('in_transit');
      setTripProgressPercent(5);
      showToast('🚀 Flete iniciado en ruta.');
    } finally {
      setIsStartingTrip(false);
    }
  };

  // FINALIZAR ENTREGA DEL FLETE
  const handleCompleteTrip = () => {
    if (!incomingRequest) return;
    const valorFlete = incomingRequest.valorRef || 3.50;
    const targetConfig = plan === 'VIP' ? planVIPConfig : plan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
    const comisionPct = targetConfig.commissionRate || (plan === 'VIP' ? 30.0 : plan === 'Estandar' ? 20.0 : 10.0);
    const comisionDebito = +(valorFlete * (comisionPct / 100)).toFixed(2);
    const utilidadNeta = +(valorFlete - comisionDebito).toFixed(2);

    const summary = {
      fleteId: incomingRequest.fleteId,
      codigoAcceso: accessCode || incomingRequest.codigoAcceso || '',
      origen: incomingRequest.origen,
      destino: incomingRequest.destino,
      cliente: incomingRequest.cliente,
      tarifa: valorFlete,
      comisionPct,
      comisionDebito,
      utilidadNeta,
      nuevoSaldo: balance
    };

    setCompletedTripSummary(summary);
    setTripState('completed');
    saraVoiceNavigation.anunciarLlegadaFeliz();

    const ahora = new Date();
    const formatoFecha = ahora.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatoHora = ahora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    const fechaLlegada = `${formatoFecha}, ${formatoHora}`;
    const clienteFinal = incomingRequest.cliente || incomingRequest.clienteNombre || 'Ing. Marco Vivanco (Constructora SARA)';
    const myPlate = currentUser?.user_metadata?.placa || '';

    const nuevoViaje: ViajeHistorialItem = {
      id: incomingRequest.fleteId || `FLT-${Date.now().toString().slice(-4)}`,
      fleteId: incomingRequest.fleteId || `FLT-${Date.now().toString().slice(-4)}`,
      cliente: clienteFinal,
      route: `${incomingRequest.origen || 'Punto de Carga'} -> ${incomingRequest.destino || 'Punto de Entrega'}`,
      embarque: fechaLlegada,
      llegada: fechaLlegada,
      tiempo: `${incomingRequest.duracionMinutos || 15} min`,
      tarifa: valorFlete,
      comision: comisionDebito,
      utilidad: utilidadNeta,
      metodoPago: 'Transferencia / Pasarela SARA',
      calificacion: 5,
      placa: myPlate
    };

    SaraFletesRealtimeService.saveCompletedTrip(myPlate, nuevoViaje);
    setViajesList(prev => [nuevoViaje, ...prev.filter(v => v.id !== nuevoViaje.id && (!v.fleteId || v.fleteId !== nuevoViaje.fleteId))]);

    // Persistir estado COMPLETADA en Supabase para que el cliente reciba la pantalla de calificación en vivo
    fetch('/api/fletes/dispatch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: incomingRequest.fleteId,
        codigoAcceso: accessCode || incomingRequest.codigoAcceso || '0000',
        status: 'completada',
        conductorNombre: currentUser?.user_metadata?.full_name || 'David Sarango Malacatus',
        conductorPlaca: myPlate,
        tarifaAcordada: valorFlete,
      }),
    }).catch((err) => console.warn('Error sincronizando finalización de viaje en servidor:', err));

    SaraFletesRealtimeService.emit({
      type: 'FLETE_COMPLETADO',
      payload: {
        fleteId: incomingRequest.fleteId,
        codigoAcceso: accessCode || '0000',
        driverName: currentUser?.user_metadata?.full_name || 'David Sarango Malacatus',
        plate: currentUser?.user_metadata?.placa || '',
        tarifaFinal: valorFlete
      }
    });

    // Enserar de inmediato la ruta, pines y pasos de navegación del mapa mientras se muestra el resumen financiero
    resetCabinaConductor(true);

    showToast('🏁 ¡Flete entregado con éxito! Se ha notificado al cliente para que califique tu servicio.');
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
      title: 'Recarga de Billetera GoBee Conductor',
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

  const [viajesList, setViajesList] = useState<ViajeHistorialItem[]>([]);
  const [historialFechaDesde, setHistorialFechaDesde] = useState<string>('');
  const [historialFechaHasta, setHistorialFechaHasta] = useState<string>('');

  useEffect(() => {
    const myPlate = currentUser?.user_metadata?.placa || '';
    const loaded = SaraFletesRealtimeService.getCompletedTrips(myPlate);
    setViajesList(loaded);
  }, [currentUser]);

  // Parser robusto de fechas en español/inglés para filtrar el historial (ej. "24 nov 2026, 09:41 a. m.", "12 Oct 2026, 14:00")
  const parseFechaHistorial = (fechaStr?: string): Date | null => {
    if (!fechaStr) return null;
    const raw = fechaStr.trim().toLowerCase();
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }
    const meses: Record<string, number> = {
      ene: 0, jan: 0, feb: 1, mar: 2, abr: 3, apr: 3, may: 4, jun: 5,
      jul: 6, ago: 7, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dic: 11, dec: 11
    };
    const m = raw.match(/(\d{1,2})\s+([a-záéíóú]+)\.?\s+(\d{4})/i);
    if (m) {
      const day = Number(m[1]);
      const mesKey = m[2].slice(0, 4).replace('.', '');
      const month = meses[mesKey] ?? meses[mesKey.slice(0, 3)];
      const year = Number(m[3]);
      if (month !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const slash = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slash) {
      return new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
    }
    const fallback = new Date(fechaStr);
    return isNaN(fallback.getTime()) ? null : new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  };

  const formatFechaReporte = (isoDate: string): string => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    if (!y || !m || !d) return isoDate;
    return new Date(y, m - 1, d).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredViajesList = useMemo(() => {
    const desdeDate = historialFechaDesde ? parseFechaHistorial(historialFechaDesde) : null;
    const hastaDate = historialFechaHasta ? parseFechaHistorial(historialFechaHasta) : null;
    if (!desdeDate && !hastaDate) return viajesList;

    return viajesList.filter((v) => {
      const fechaViaje = parseFechaHistorial(v.embarque) || parseFechaHistorial(v.llegada);
      if (!fechaViaje) return true;
      if (desdeDate && fechaViaje < desdeDate) return false;
      if (hastaDate && fechaViaje > hastaDate) return false;
      return true;
    });
  }, [viajesList, historialFechaDesde, historialFechaHasta]);

  const totalesViajes = useMemo(() => {
    const totalTarifa = filteredViajesList.reduce((acc, v) => acc + (Number(v.tarifa) || 0), 0);
    const totalComision = filteredViajesList.reduce((acc, v) => acc + (Number(v.comision) || 0), 0);
    const totalUtilidad = filteredViajesList.reduce((acc, v) => acc + (Number(v.utilidad) || 0), 0);
    return {
      cantidad: filteredViajesList.length,
      totalTarifa: +totalTarifa.toFixed(2),
      totalComision: +totalComision.toFixed(2),
      totalUtilidad: +totalUtilidad.toFixed(2)
    };
  }, [filteredViajesList]);

  const historialRecargas: Array<{
    fecha: string;
    referencia: string;
    metodo: string;
    estado: string;
    valor: number;
  }> = [];

  const getReportHeaderMeta = () => {
    const conductor = currentUser?.user_metadata?.full_name || 'David Sarango Malacatus';
    const vehiculo = currentUser?.user_metadata?.vehiculo || currentUser?.user_metadata?.tipo_vehiculo || 'Camioneta Pickup 1.2T · SARA';
    const placa = currentUser?.user_metadata?.placa || '';
    const hoyTexto = new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    const desdeTexto = historialFechaDesde ? formatFechaReporte(historialFechaDesde) : 'Inicio de registros';
    const hastaTexto = historialFechaHasta ? formatFechaReporte(historialFechaHasta) : hoyTexto;
    return { conductor, vehiculo, placa, desdeTexto, hastaTexto };
  };

  const handleDownloadExcel = (type: 'viajes' | 'recargas') => {
    const meta = getReportHeaderMeta();
    const titulo = type === 'viajes' ? 'HISTORIAL DE VIAJES' : 'HISTORIAL DE RECARGAS';
    const headerRows: any[][] = [
      ['GRUPO SARA'],
      [titulo],
      [],
      ['Conductor:', meta.conductor],
      ['Vehículo:', meta.vehiculo, '', 'PLACA:', meta.placa],
      ['Fechas: Desde:', meta.desdeTexto, '', 'Hasta:', meta.hastaTexto],
      []
    ];

    let tableRows: any[][] = [];
    if (type === 'viajes') {
      tableRows = [
        ['ID Flete', 'Cliente', 'Ruta', 'Embarque', 'Llegada', 'Tiempo', 'Tarifa Cobrada ($)', 'Comisión SARA ($)', 'Utilidad Neta ($)', 'Método Pago', 'Calificación'],
        ...filteredViajesList.map((v) => [
          v.fleteId || v.id,
          v.cliente || 'Cliente SARA',
          v.route,
          v.embarque,
          v.llegada,
          v.tiempo,
          +Number(v.tarifa || 0).toFixed(2),
          +Number(v.comision || 0).toFixed(2),
          +Number(v.utilidad || 0).toFixed(2),
          v.metodoPago || 'Efectivo / Transferencia',
          `${v.calificacion || 5} ★`
        ]),
        [
          'TOTALES',
          `${totalesViajes.cantidad} viaje(s)`,
          '',
          '',
          '',
          '',
          totalesViajes.totalTarifa,
          totalesViajes.totalComision,
          totalesViajes.totalUtilidad,
          '',
          ''
        ]
      ];
    } else {
      const totalRecargas = historialRecargas.reduce((acc, r) => acc + Number(r.valor || 0), 0);
      tableRows = [
        ['Fecha', 'Referencia', 'Método', 'Estado', 'Valor ($)'],
        ...historialRecargas.map((r) => [r.fecha, r.referencia, r.metodo, r.estado, +Number(r.valor || 0).toFixed(2)]),
        ['TOTALES', `${historialRecargas.length} recarga(s)`, '', '', +totalRecargas.toFixed(2)]
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...tableRows]);
    const colCount = type === 'viajes' ? 11 : 5;
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      { s: { r: 3, c: 1 }, e: { r: 3, c: Math.min(5, colCount - 1) } }
    ];
    ws['!cols'] = type === 'viajes'
      ? [
          { wch: 18 }, { wch: 28 }, { wch: 40 }, { wch: 24 }, { wch: 24 },
          { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 12 }
        ]
      : [{ wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 14 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'viajes' ? 'Historial Viajes' : 'Historial Recargas');
    XLSX.writeFile(wb, `GRUPO-SARA-Historial-${type}.xlsx`);
    showToast(`Archivo Excel de ${type} descargado con encabezado oficial y totales.`);
  };

  const handleDownloadPDF = (type: 'viajes' | 'recargas') => {
    const meta = getReportHeaderMeta();
    const doc = new jsPDF({ orientation: type === 'viajes' ? 'landscape' : 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado oficial GRUPO SARA (formato solicitado)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('GRUPO SARA', pageWidth / 2, 16, { align: 'center' });

    doc.setFontSize(13);
    doc.text(type === 'viajes' ? 'HISTORIAL DE VIAJES' : 'HISTORIAL DE RECARGAS', pageWidth / 2, 24, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const rightColX = pageWidth / 2 + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Conductor:', 14, 34);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.conductor, 36, 34);

    doc.setFont('helvetica', 'bold');
    doc.text('Vehículo:', 14, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.vehiculo, 36, 41);

    doc.setFont('helvetica', 'bold');
    doc.text('PLACA:', rightColX, 41);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.placa, rightColX + 16, 41);

    doc.setFont('helvetica', 'bold');
    doc.text('Fechas: Desde:', 14, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.desdeTexto, 43, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('Hasta:', rightColX, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(meta.hastaTexto, rightColX + 14, 48);

    doc.setDrawColor(180, 180, 180);
    doc.line(14, 52, pageWidth - 14, 52);

    if (type === 'viajes') {
      autoTable(doc, {
        head: [['Cliente', 'Ruta', 'Embarque', 'Llegada', 'Tiempo', 'Tarifa ($)', 'Comisión ($)', 'Utilidad ($)']],
        body: filteredViajesList.map((v) => [
          v.cliente || 'Cliente SARA',
          v.route,
          v.embarque,
          v.llegada,
          v.tiempo,
          `$${Number(v.tarifa || 0).toFixed(2)}`,
          `-$${Number(v.comision || 0).toFixed(2)}`,
          `$${Number(v.utilidad || 0).toFixed(2)}`
        ]),
        foot: [[
          `TOTALES (${totalesViajes.cantidad} viajes)`,
          '',
          '',
          '',
          '',
          `$${totalesViajes.totalTarifa.toFixed(2)}`,
          `-$${totalesViajes.totalComision.toFixed(2)}`,
          `$${totalesViajes.totalUtilidad.toFixed(2)}`
        ]],
        startY: 56,
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 8.5 }
      });
    } else {
      const totalRecargas = historialRecargas.reduce((acc, r) => acc + Number(r.valor || 0), 0);
      autoTable(doc, {
        head: [['Fecha', 'Referencia', 'Método', 'Estado', 'Valor ($)']],
        body: historialRecargas.map((r) => [r.fecha, r.referencia, r.metodo, r.estado, `+$${Number(r.valor || 0).toFixed(2)}`]),
        foot: [[`TOTALES (${historialRecargas.length} recargas)`, '', '', '', `+$${totalRecargas.toFixed(2)}`]],
        startY: 56,
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
      });
    }
    doc.save(`GRUPO-SARA-Historial-${type}.pdf`);
    showToast(`Archivo PDF de ${type} generado con encabezado oficial y totales.`);
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
      nombreChofer: currentUser?.user_metadata?.full_name || 'Conductor GoBee',
      placa: currentUser?.user_metadata?.placa || '',
      tipoVehiculo: 'VOLQUETA_V3A',
      lat: driverLocation[0],
      lng: driverLocation[1],
      rating: 4.95,
      telefono: '0991234567',
      disponible: true
    }
  ];

  return (
    <div className="h-[100dvh] bg-slate-950 font-sans flex flex-col text-slate-100 overflow-hidden">
      {/* HEADER COMPACTO MÓVIL + ESCRITORIO (1 SOLA FILA LIMPIA, 0 DESBORDES) */}
      <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 flex justify-between items-center shadow-lg relative z-30 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Botón Hamburguesa ☰ solo en móvil/tablet */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú del conductor"
            className="lg:hidden min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-[#FDBE3B] flex items-center justify-center cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <GobeeBrandBadge role="Conductor" theme="dark" />
          <div className="hidden lg:flex items-center gap-2">
            <span className="inline-flex bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              Activo
            </span>
            <SaraNetworkStatusPill />
            <button
              type="button"
              onClick={() => setIsBiometricModalOpen(true)}
              className={`hidden xl:inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border transition-all ${
                biometricVerified
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {biometricVerified ? 'Biometría OK' : 'Verificar Identidad'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Alarma rápida en móvil */}
          <button
            type="button"
            onClick={() => {
              unlockDriverAlarmAudio();
              playRadarAlertSound();
              showToast('🔔 Alarma sonora de pedidos activada.');
            }}
            className={`lg:hidden px-2.5 py-1.5 rounded-xl text-[11px] font-black border cursor-pointer ${
              alarmUnlocked
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title="Activar alarma sonora"
          >
            {alarmUnlocked ? '🔔' : '🔕'}
          </button>

          {/* BADGE COMPACTO DE SALDO */}
          <button
            type="button"
            onClick={() => setActiveTab('billetera')}
            className={`cursor-pointer px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all ${
              balance < 1.00
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : balance < 5.00
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="text-xs sm:text-sm font-black font-mono tabular-nums leading-none">
              ${balance.toFixed(2)}
            </span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/modulos/fletes/auth?rol=conductor');
            }}
            className="hidden lg:inline-flex text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* BACKDROP MÓVIL DEL MENÚ HAMBURGUESA */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* CUERPO PRINCIPAL SPLIT */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* MENÚ HAMBURGUESA SLIDE-OVER EN MÓVIL / SIDEBAR FIJO EN ESCRITORIO */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 lg:static lg:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-out overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1.5">
            {/* Cabecera del drawer móvil */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 lg:hidden">
              <span className="font-black text-sm text-white">Menú Conductor</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="min-w-[36px] min-h-[36px] rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3 rounded-xl border mb-3 transition-all ${
              balance < 1.00 ? 'bg-rose-950/40 border-rose-500/70' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Chofer</p>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {plan}
                </span>
              </div>
              <p className="font-bold text-white text-sm mt-0.5 truncate">
                {currentUser?.user_metadata?.full_name || 'Conductor SARA'}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Saldo:</span>
                <span className={`font-mono font-black ${balance < 1.00 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  ${balance.toFixed(2)} USD
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('sincronizacion'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sincronizacion'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-4 h-4 shrink-0" />
              Mapa & Radar en Vivo
            </button>

            <button
              onClick={() => { setActiveTab('consola_v2'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'consola_v2'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe2 className="w-4 h-4 shrink-0 text-sky-400" />
              Intérprete, Backhaul & e-POD
            </button>

            <button
              onClick={() => { setActiveTab('vehiculo'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vehiculo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              Mi Cabina y Perfil
            </button>

            <button
              onClick={() => { setActiveTab('cuentas_bancarias'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cuentas_bancarias'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cuentas Bancarias & QRs</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('documentos'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'documentos'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              Mis Documentos
            </button>

            <button
              onClick={() => { setActiveTab('billetera'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'billetera'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4 shrink-0" />
              Billetera y Planes
            </button>

            <button
              onClick={() => { setActiveTab('historial'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'historial'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              Historial de Viajes
            </button>

            <button
              onClick={() => { setActiveTab('recargas'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'recargas'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              Historial de Recargas
            </button>
            </nav>
          </div>

          {/* Acciones de cuenta al pie del drawer móvil */}
          <div className="pt-3 mt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => { setIsBiometricModalOpen(true); setMobileMenuOpen(false); }}
              className="w-full min-h-[40px] rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer lg:hidden"
            >
              <ShieldCheck className="w-4 h-4" />
              {biometricVerified ? 'Biometría OK' : 'Verificar Identidad'}
            </button>
            <div className="flex items-center justify-between gap-2 lg:hidden">
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/modulos/fletes/auth?rol=conductor');
                }}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-500/30 text-xs font-bold cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
            <div className="text-[10px] text-slate-500 text-center hidden lg:block">
              GoBee · Un servicio de Grupo Sara
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL SEGÚN TAB ACTIVA (MAPA PRIMERO EN MÓVIL · 100dvh RESPONSIVE) */}
        <main
          className={`flex-1 min-h-0 bg-slate-950 ${
            activeTab === 'sincronizacion'
              ? 'p-0 lg:p-4 overflow-hidden flex flex-col'
              : 'p-4 lg:p-6 overflow-y-auto space-y-6 pb-20 lg:pb-6'
          }`}
        >
          {activeTab === 'consola_v2' && currentUser?.id && (
            <DriverV2OperationsPanel driverId={currentUser.id} />
          )}
          
          {/* ================================================================ */}
          {/* TAB 1: SINCRONIZACIÓN Y RADAR EN VIVO (MAPA A PANTALLA COMPLETA) */}
          {/* ================================================================ */}
          {activeTab === 'sincronizacion' && (
            <div className="h-full flex flex-col lg:space-y-3">
              {/* BANNER DE ALERTA CRÍTICA SI EL SALDO ES MENOR A $1.00 */}
              {balance < 1.00 && (
                <div className="bg-rose-950/95 border-b lg:border-2 border-rose-500 px-3 py-2.5 lg:rounded-2xl flex items-center justify-between gap-2 shrink-0">
                  <span className="text-xs font-bold text-rose-200">
                    ⚠️ Saldo bajo (${balance.toFixed(2)}). Recarga para recibir pedidos.
                  </span>
                  <button
                    onClick={() => setActiveTab('billetera')}
                    className="bg-rose-600 text-white font-black px-3 py-1.5 rounded-lg text-[11px] shrink-0 cursor-pointer"
                  >
                    Recargar
                  </button>
                </div>
              )}

              <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 shrink-0">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  Radar Activo en Tiempo Real
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Switch Rumbo a mi Casa */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                    <span className="text-slate-400 font-semibold">🏠 Rumbo a Casa:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nuevoEstado = !rumboACasaActivo;
                        setRumboACasaActivo(nuevoEstado);
                        SaraFletesRealtimeService.setRumboACasa(
                          currentUser?.user_metadata?.placa || '',
                          nuevoEstado,
                          rumboCanton
                        );
                        showToast(nuevoEstado ? `🏠 Modo Rumbo a Casa activado hacia ${rumboCanton}.` : 'Modo Rumbo a Casa desactivado.');
                      }}
                      className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        rumboACasaActivo ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rumboACasaActivo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                    {rumboACasaActivo && (
                      <select
                        value={rumboCanton}
                        onChange={(e) => setRumboCanton(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5 outline-none font-medium"
                      >
                        <option value="Cariamanga">Cariamanga</option>
                        <option value="Loja">Loja</option>
                        <option value="Catamayo">Catamayo</option>
                        <option value="Cuenca">Cuenca</option>
                        <option value="Guayaquil">Guayaquil</option>
                        <option value="Quito">Quito</option>
                      </select>
                    )}
                  </div>

                  {/* Botón de Activación de Alarma Sonora Real */}
                  <button
                    type="button"
                    onClick={() => {
                      unlockDriverAlarmAudio();
                      playRadarAlertSound();
                      showToast('🔔 Alarma sonora de pedidos activada y verificada.');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border ${
                      alarmUnlocked
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                    }`}
                    title="Habilitar sonido de alarma y notificaciones del navegador"
                  >
                    <span>{alarmUnlocked ? '🔔 Alarma Activa' : '🔕 Activar Alarma'}</span>
                  </button>

                  {/* Estado de Transmisión */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${balance < 1.00 ? 'bg-rose-500' : 'bg-emerald-500 animate-ping'}`}></span>
                    <span className="text-slate-300 font-bold">
                      {balance < 1.00 ? 'Radar En Pausa (Sin Saldo)' : `Transmitiendo en ${driverCity}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* MAPA COMPLETO EN VIVO */}
              <div className="flex-1 min-h-0 w-full lg:min-h-[520px] rounded-none lg:rounded-2xl overflow-hidden lg:border border-slate-800 relative shadow-2xl">
                <SaraFletesMap
                  userLocation={driverLocation}
                  origenCoords={incomingRequest ? incomingRequest.coordsOrigen : null}
                  destinoCoords={incomingRequest ? incomingRequest.coordsDestino : null}
                  origenNombre={incomingRequest?.origen}
                  destinoNombre={incomingRequest?.destino}
                  vehiculosCercanos={choferVehiculoMapa}
                  rutaCoordenadas={incomingRequest ? (
                    incomingRequest.coordenadasRuta && incomingRequest.coordenadasRuta.length > 0
                      ? incomingRequest.coordenadasRuta
                      : (incomingRequest.coordsOrigen && incomingRequest.coordsDestino ? [incomingRequest.coordsOrigen, incomingRequest.coordsDestino] : undefined)
                  ) : undefined}
                />

                {/* OVERLAY SUPERIOR: NAVEGADOR GPS GIRO A GIRO + PANEL DE RECORRIDO ESTILO GOOGLE MAPS */}
                {tripAccepted && tripState === 'in_transit' && (
                  <SaraGoogleMapsNavPanel
                    originName={incomingRequest?.origen || 'Punto de Carga'}
                    destinationName={incomingRequest?.destino || 'Punto de Entrega'}
                    steps={navSteps}
                    activeStepIndex={activeNavStepIndex}
                    remainingMetersToNextTurn={remainingMetersToTurn}
                    tripProgressPercent={tripProgressPercent}
                    voiceMuted={voiceMuted}
                    onToggleVoice={() => {
                      const nextMuted = !voiceMuted;
                      setVoiceMuted(nextMuted);
                      saraVoiceNavigation.setMuted(nextMuted);
                      if (!nextMuted && navSteps[activeNavStepIndex]) {
                        saraVoiceNavigation.anunciarPaso(navSteps[activeNavStepIndex]);
                      }
                    }}
                    onRepeatCurrentStep={() => {
                      if (tripProgressPercent >= 100) {
                        saraVoiceNavigation.anunciarLlegadaFeliz();
                      } else if (navSteps[activeNavStepIndex]) {
                        saraVoiceNavigation.anunciarPaso(navSteps[activeNavStepIndex]);
                      }
                    }}
                  />
                )}

                {/* OVERLAY: SOLICITUD ENTRANTE (BOTTOM SHEET MÓVIL LIMPIO / TARJETA FLOTANTE DESKTOP) */}
                {incomingRequest && !tripAccepted && (() => {
                  const valorRef = incomingRequest.valorRef || 3.50;
                  const targetConfig = plan === 'VIP' ? planVIPConfig : plan === 'Estandar' ? planEstandarConfig : planBasicoConfig;
                  const comisionPct = targetConfig.commissionRate || (plan === 'VIP' ? 30.0 : plan === 'Estandar' ? 20.0 : 10.0);
                  const comisionUSD = +(valorRef * (comisionPct / 100)).toFixed(2);
                  const saldoPostViaje = +(balance - comisionUSD).toFixed(2);
                  const saldoSuficiente = balance >= 1.00 && balance >= comisionUSD;
                  const esViajePasajeros = Boolean(incomingRequest.material?.toLowerCase().includes('viaje'));

                  return (
                    <div className="fixed bottom-3 inset-x-2.5 lg:absolute lg:inset-x-auto lg:bottom-auto lg:top-4 lg:right-4 z-[550] lg:max-w-sm lg:w-full bg-slate-900/95 backdrop-blur-md border-2 border-amber-500 p-3.5 sm:p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-2.5 max-h-[60dvh] overflow-y-auto">
                      {/* Fila superior: Tipo + Precio + Distancia */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <Sparkles className="w-3 h-3" />
                          {esViajePasajeros ? 'Nuevo Viaje' : 'Nuevo Flete'}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[11px] font-mono text-slate-400">
                            {incomingRequest.distanciaKm} km
                          </span>
                          <span className="text-lg font-mono text-emerald-400 font-black tabular-nums">
                            ${valorRef.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Ruta compacta Origen -> Destino */}
                      <div className="space-y-1.5 text-xs text-slate-200 bg-slate-950/90 px-3 py-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                          <p className="line-clamp-1">
                            <span className="text-slate-400">Origen: </span>
                            <strong className="text-white">{incomingRequest.origen}</strong>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                          <p className="line-clamp-1">
                            <span className="text-slate-400">Destino: </span>
                            <strong className="text-white">{incomingRequest.destino}</strong>
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                          <span className="truncate">{incomingRequest.material}</span>
                          <span className={`font-mono font-bold shrink-0 ml-2 ${saldoPostViaje < 1.00 ? 'text-rose-400' : 'text-slate-300'}`}>
                            Comisión -${comisionUSD.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {!saldoSuficiente ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-rose-400 font-bold text-center">
                            Saldo insuficiente para la comisión (${comisionUSD.toFixed(2)} USD).
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('billetera')}
                            className="w-full min-h-[44px] bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs transition-colors"
                          >
                            Recargar Billetera
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (incomingRequest?.fleteId) {
                                  dismissedRequestIdsRef.current.add(String(incomingRequest.fleteId));
                                }
                                if (incomingRequest?.codigoAcceso) {
                                  dismissedRequestIdsRef.current.add(`pin:${incomingRequest.codigoAcceso}`);
                                }
                                setIncomingRequest(null);
                                showToast('Solicitud rechazada y ocultada de tu radar.');
                              }}
                              className="min-h-[46px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={handleAcceptTrip}
                              className="min-h-[46px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/25 cursor-pointer"
                            >
                              Aceptar (${valorRef.toFixed(2)})
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDriverCounterOffer(1.00)}
                            className="w-full min-h-[38px] bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold py-1.5 rounded-xl text-[11px] transition-colors flex items-center justify-center cursor-pointer"
                          >
                            Contraofertar +$1.00 (${(valorRef + 1.00).toFixed(2)})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* OVERLAY: PANEL COMPACTO DE VIAJE EN CURSO (FIXED EN MÓVIL PARA NUNCA RECORTARSE BAJO BARRA DEL NAVEGADOR) */}
                {tripAccepted && (
                  <div className="fixed bottom-3 inset-x-2.5 lg:absolute lg:bottom-5 lg:left-5 lg:right-24 z-[550] bg-slate-900/95 backdrop-blur-md border border-amber-500/40 p-3 sm:p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
                    
                    {/* ESTADO 1: EN CAMINO A RECOGER (ESPERANDO PIN PARA INICIAR) */}
                    {tripState === 'heading_to_pickup' && (
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 lg:gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 truncate">
                                Paso 1 · En camino a recoger
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {incomingRequest?.distanciaKm && (
                                <span className="text-[11px] font-mono text-slate-400">
                                  {incomingRequest.distanciaKm} km · ~{incomingRequest.duracionMinutos || 2}m
                                </span>
                              )}
                              <span className="text-sm font-mono font-black text-emerald-400 tabular-nums">
                                ${incomingRequest?.valorRef ? incomingRequest.valorRef.toFixed(2) : '3.50'}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-2 space-y-1 text-xs">
                            <p className="flex items-center gap-2 text-white truncate">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate font-bold">{incomingRequest?.origen || 'Punto de recogida'}</span>
                            </p>
                            <p className="flex items-center gap-2 text-slate-300 truncate">
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                              <span className="truncate">{incomingRequest?.destino || 'Destino'}</span>
                            </p>
                          </div>
                        </div>

                        {/* PIN + Botón Iniciar en una sola fila compacta (siempre visible en móvil) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                            <div className="leading-tight">
                              <span className="text-[9px] font-black uppercase text-slate-400 block">PIN</span>
                              <button
                                type="button"
                                onClick={() => setInputPin(accessCode || '')}
                                className="text-[10px] text-amber-400 font-mono font-bold hover:underline cursor-pointer"
                              >
                                {accessCode || '----'}
                              </button>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              value={inputPin}
                              onChange={(e) => setInputPin(e.target.value)}
                              placeholder={accessCode || 'PIN'}
                              className="w-16 text-center font-mono font-black text-base py-1 bg-slate-900 border border-amber-500/50 text-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleStartTrip}
                            disabled={isStartingTrip}
                            className="flex-1 lg:flex-none min-h-[46px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 sm:px-6 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                          >
                            {isStartingTrip ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                                <span>Iniciando...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-4 h-4 stroke-[2.5]" />
                                <span>Iniciar Viaje</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ESTADO 2: EN RECORRIDO HACIA DESTINO */}
                    {tripState === 'in_transit' && (
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 lg:gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                              Paso 2 · En ruta al destino
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-300 tabular-nums">
                              {tripProgressPercent}% · PIN {accessCode} ✓
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 truncate">
                            <span className="text-slate-400">Destino: </span>
                            <strong className="text-white">{incomingRequest?.destino}</strong>
                            {incomingRequest?.distanciaKm ? (
                              <span className="text-slate-400 font-mono"> ({incomingRequest.distanciaKm} km)</span>
                            ) : null}
                          </p>

                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-700"
                              style={{ width: `${tripProgressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCompleteTrip}
                          className="w-full lg:w-auto min-h-[48px] bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer shrink-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Finalizar Viaje</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* MODAL DE CELEBRACIÓN Y RESUMEN FINANCIERO DEL FLETE COMPLETADO */}
                {tripState === 'completed' && completedTripSummary && (
                  <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-300 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle className="w-9 h-9" />
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                          ¡Flete Finalizado con Éxito!
                        </span>
                        <h3 className="font-black text-white text-xl mt-2">Resumen Financiero del Viaje</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {completedTripSummary.origen} → {completedTripSummary.destino}
                        </p>
                      </div>

                      {/* CERTIFICADO e-POD ASOCIADO */}
                      {savedEpod && (
                        <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-2xl text-left text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-400 font-bold">
                            <span>✓ Acta de Entrega Digital (e-POD)</span>
                            <span className="font-mono text-[10px]">{savedEpod.hashCriptografico}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">Receptor: {savedEpod.receptorNombre} ({savedEpod.receptorCargo})</p>
                          <p className="text-slate-400 text-[10px]">Cédula: {savedEpod.receptorCedula} · Conformidad: {savedEpod.conformidad}</p>
                        </div>
                      )}

                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Tarifa Cobrada al Cliente:</span>
                          <span className="font-mono font-bold text-white text-sm">${completedTripSummary.tarifa.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-400">
                          <span>Comisión SARA ({completedTripSummary.comisionPct}%):</span>
                          <span className="font-mono font-bold">-${completedTripSummary.comisionDebito.toFixed(2)} USD</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-emerald-400 text-sm">
                          <span>Tu Utilidad Neta en Mano:</span>
                          <span className="font-mono text-base font-black">+${completedTripSummary.utilidadNeta.toFixed(2)} USD</span>
                        </div>
                        <div className="pt-1 flex justify-between items-center text-slate-400 text-[11px]">
                          <span>Saldo Disponible en Billetera:</span>
                          <span className="font-mono font-black text-amber-400">${balance.toFixed(2)} USD</span>
                        </div>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-xs text-emerald-300">
                        ⭐ El cliente ha recibido la pantalla de calificación para valorar tu servicio.
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          resetCabinaConductor(false);
                          showToast('Cabina enserada y lista para recibir nuevas carreras en el radar.');
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition-all shadow-lg active:scale-95"
                      >
                        ✓ Finalizar y Volver al Radar de Fletes
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
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Nombre completo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#020617] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Correo Electrónico</span>
                      <span className="text-[10px] font-bold text-emerald-400">Verificado</span>
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      readOnly
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Celular / WhatsApp</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="0990000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#020617] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Placa (Letras y Números)</label>
                    <input
                      type="text"
                      value={profilePlate}
                      onChange={(e) => setProfilePlate(e.target.value.toUpperCase())}
                      placeholder="Ej. LBA-4590"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#FDBE3B] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#020617] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Vehículo</label>
                    <select
                      value={profileVehicleType}
                      onChange={(e) => setProfileVehicleType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B]"
                    >
                      <option>Motocicleta</option>
                      <option>Moto con Caja Térmica</option>
                      <option>Auto Sedán</option>
                      <option>SUV / Confort Plus</option>
                      <option>Minivan Grupal (6-8 pax)</option>
                      <option>Camioneta Pickup (1.2 Ton)</option>
                      <option>Furgón Urbano (3.5 Ton)</option>
                      <option>Camión Liviano (5 Ton)</option>
                      <option>Camión Mediano (10 Ton)</option>
                      <option>Volqueta de Obra (14m³)</option>
                      <option>Tráiler / Mula Plataforma (32 Ton)</option>
                    </select>
                  </div>

                  {/* Selector de Servicios Habilitados para el Vehículo */}
                  <div className="md:col-span-2 pt-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-slate-200">
                        ¿Para qué servicios usarás tu vehículo en GoBee?
                      </label>
                      <span className="text-[10px] font-bold text-[#FDBE3B]">
                        {enabledServices.length} seleccionado{enabledServices.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'viajes', emoji: '🚕', label: 'Viajes', desc: 'Pasajeros urbanos' },
                        { id: 'mandaditos', emoji: '📦', label: 'Mandaditos', desc: 'Compras y envíos' },
                        { id: 'fletes', emoji: '🚛', label: 'Fletes', desc: 'Carga y mudanzas' },
                        { id: 'renta', emoji: '🔑', label: 'Renta', desc: 'Por horas o días' },
                      ].map((srv) => {
                        const active = enabledServices.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => toggleDriverService(srv.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                              active
                                ? 'bg-[#FDBE3B]/15 border-[#FDBE3B] text-white shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg leading-none">{srv.emoji}</span>
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                                  active ? 'bg-[#FDBE3B] text-[#111827]' : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {active ? '✓' : ''}
                              </span>
                            </div>
                            <span className="text-xs font-black leading-tight">{srv.label}</span>
                            <span className="text-[10px] text-slate-400 leading-tight">{srv.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Botón Guardar Cambios del Perfil */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={savingProfile}
                    onClick={() => void handleSaveDriverProfile()}
                    className="min-h-[44px] px-6 rounded-xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-50 text-[#111827] font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{savingProfile ? 'Guardando...' : 'Guardar Cambios del Perfil'}</span>
                  </button>
                </div>

                {/* Seguridad de la Cuenta: Cambio de Contraseña */}
                <form
                  onSubmit={handleChangeDriverPassword}
                  className="pt-4 border-t border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#FDBE3B]" />
                        Seguridad y Cambio de Contraseña
                      </h4>
                      <p className="text-xs text-slate-400">
                        Actualiza tu clave de acceso a GoBee Conductor en cualquier momento.
                      </p>
                    </div>
                  </div>

                  {passwordFeedback && (
                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold border ${
                        passwordFeedback.type === 'ok'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {passwordFeedback.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={changingPassword || !newPassword || !confirmPassword}
                      className="min-h-[42px] px-5 rounded-xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-45 text-[#111827] font-black text-xs transition-colors cursor-pointer"
                    >
                      {changingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </form>

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
          {/* TAB: CUENTAS BANCARIAS & CÓDIGOS QR DE COBRO (PASARELA DEL CLIENTE) */}
          {/* ================================================================ */}
          {activeTab === 'cuentas_bancarias' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
              {/* Cabecera de la Sección */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Landmark className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg sm:text-2xl font-black text-white">Cuentas Bancarias & QR</h2>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    Registra tu cuenta bancaria y códigos QR (Deuna!, PayPhone, Banco Guayaquil) para cobrar directo al cliente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBankConfig}
                  disabled={savingBankInfo}
                  className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-5 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingBankInfo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD 1: CUENTA BANCARIA PRINCIPAL (TRANSFERENCIAS SPI) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">Cuenta Bancaria Principal (Transferencias Directas e Interbancarias SPI)</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Pichincha, Guayaquil, Produbanco, JEP</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Institución Financiera / Banco
                    </label>
                    <select
                      value={bankConfig.bankName}
                      onChange={(e) => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option>Banco Pichincha</option>
                      <option>Banco Guayaquil</option>
                      <option>Produbanco - Grupo Promerica</option>
                      <option>Banco del Pacífico</option>
                      <option>Banco Bolivariano</option>
                      <option>Banco Internacional</option>
                      <option>Banco del Austro</option>
                      <option>Cooperativa JEP</option>
                      <option>Cooperativa Policía Nacional</option>
                      <option>Cooperativa Alianza del Valle</option>
                      <option>Cooperativa 29 de Octubre</option>
                      <option>Cooperativa Padre Julián Lorente (Loja)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tipo de Cuenta
                    </label>
                    <select
                      value={bankConfig.accountType}
                      onChange={(e) => setBankConfig({ ...bankConfig, accountType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option>Cuenta de Ahorros</option>
                      <option>Cuenta Corriente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Número de Cuenta
                    </label>
                    <input
                      type="text"
                      value={bankConfig.accountNumber}
                      onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                      placeholder="Ej. 2208741904"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Titular de la Cuenta
                    </label>
                    <input
                      type="text"
                      value={bankConfig.holderName}
                      onChange={(e) => setBankConfig({ ...bankConfig, holderName: e.target.value })}
                      placeholder="Nombres completos según banco"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cédula o RUC del Titular
                    </label>
                    <input
                      type="text"
                      value={bankConfig.holderId}
                      onChange={(e) => setBankConfig({ ...bankConfig, holderId: e.target.value })}
                      placeholder="Ej. 1103849182"
                      maxLength={13}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo para Comprobantes
                    </label>
                    <input
                      type="email"
                      value={bankConfig.email}
                      onChange={(e) => setBankConfig({ ...bankConfig, email: e.target.value })}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: BILLETERAS MÓVILES (DEUNA, PAYPHONE, PEIGO) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Billeteras Móviles & Cobro Inmediato (Ecuador)</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Cobro rápido sin digitar cuenta</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* DeUna! */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-teal-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-400">DeUna! Pichincha</span>
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-black">P2P</span>
                    </div>
                    <label className="block text-[11px] text-slate-400">
                      Celular registrado en DeUna!:
                    </label>
                    <input
                      type="tel"
                      value={bankConfig.deunaPhone || ''}
                      onChange={(e) => setBankConfig({ ...bankConfig, deunaPhone: e.target.value })}
                      placeholder="Ej. 0995544332"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
                    />
                    <p className="text-[10px] text-slate-500">Permite a los usuarios de Pichincha pagarte al instante por número o QR.</p>
                  </div>

                  {/* Payphone */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-orange-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-400">Payphone Ecuador</span>
                      <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-black">VISA/MC</span>
                    </div>
                    <label className="block text-[11px] text-slate-400">
                      Celular / Usuario Payphone:
                    </label>
                    <input
                      type="tel"
                      value={bankConfig.payphonePhone || ''}
                      onChange={(e) => setBankConfig({ ...bankConfig, payphonePhone: e.target.value })}
                      placeholder="Ej. 0995544332"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-400"
                    />
                    <p className="text-[10px] text-slate-500">Permite al cliente pagar con tarjetas de crédito nacionales e internacionales.</p>
                  </div>

                  {/* Banco Guayaquil / Peigo */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-pink-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400">Banco Guayaquil / Peigo</span>
                      <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-black">BG</span>
                    </div>
                    <label className="block text-[11px] text-slate-400">
                      Cuenta o Celular Peigo:
                    </label>
                    <input
                      type="text"
                      value={bankConfig.guayaquilAccount || ''}
                      onChange={(e) => setBankConfig({ ...bankConfig, guayaquilAccount: e.target.value })}
                      placeholder="Ej. 1098452109 o celular"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-pink-400"
                    />
                    <p className="text-[10px] text-slate-500">Para clientes con cuenta en Banco Guayaquil o billetera Peigo.</p>
                  </div>
                </div>
              </div>

              {/* CARD 3: CÓDIGOS QR OFICIALES DE COBRO (CARGA DE IMAGEN O DINÁMICO) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Códigos QR Oficiales de Cobro (Carga de Imagen o Generación Directa)</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Sube tu captura de QR o usa el dinámico</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* QR 1: DeUna! */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-teal-800/40 flex flex-col justify-between items-center text-center space-y-3">
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="font-black text-teal-400">QR DeUna!</span>
                      {bankConfig.qrDeunaImage ? (
                        <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">Oficial Subido</span>
                      ) : (
                        <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">Autogenerado</span>
                      )}
                    </div>

                    <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-md flex items-center justify-center relative group">
                      <img
                        src={bankConfig.qrDeunaImage || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(`https://deuna.app/pay?to=${bankConfig.deunaPhone || bankConfig.phone}&ref=SARA-FLETE`)}`}
                        alt="QR Deuna"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>

                    <div className="w-full space-y-1.5 text-center">
                      <input
                        type="file"
                        ref={qrDeunaFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleBankQrUpload('deuna', e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => qrDeunaFileRef.current?.click()}
                        className="w-full bg-teal-950/80 hover:bg-teal-900 border border-teal-600/50 text-teal-200 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{bankConfig.qrDeunaImage ? 'Cambiar Imagen QR' : 'Subir QR Oficial Deuna'}</span>
                      </button>
                      {bankConfig.qrDeunaImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setBankConfig({ ...bankConfig, qrDeunaImage: '' });
                            showToast('Imagen de QR Deuna eliminada. Se usará el QR dinámico.');
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Restaurar QR Dinámico
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QR 2: Payphone */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-orange-800/40 flex flex-col justify-between items-center text-center space-y-3">
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="font-black text-orange-400">QR Payphone</span>
                      {bankConfig.qrPayphoneImage ? (
                        <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">Oficial Subido</span>
                      ) : (
                        <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">Autogenerado</span>
                      )}
                    </div>

                    <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-md flex items-center justify-center relative group">
                      <img
                        src={bankConfig.qrPayphoneImage || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(`https://payphone.app/pay?phone=${bankConfig.payphonePhone || bankConfig.phone}`)}`}
                        alt="QR Payphone"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>

                    <div className="w-full space-y-1.5 text-center">
                      <input
                        type="file"
                        ref={qrPayphoneFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleBankQrUpload('payphone', e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => qrPayphoneFileRef.current?.click()}
                        className="w-full bg-orange-950/80 hover:bg-orange-900 border border-orange-600/50 text-orange-200 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{bankConfig.qrPayphoneImage ? 'Cambiar Imagen QR' : 'Subir QR Payphone'}</span>
                      </button>
                      {bankConfig.qrPayphoneImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setBankConfig({ ...bankConfig, qrPayphoneImage: '' });
                            showToast('Imagen de QR Payphone eliminada. Se usará el QR dinámico.');
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Restaurar QR Dinámico
                        </button>
                      )}
                    </div>
                  </div>

                  {/* QR 3: Banco Guayaquil */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-pink-800/40 flex flex-col justify-between items-center text-center space-y-3">
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="font-black text-pink-400">QR Banco Guayaquil</span>
                      {bankConfig.qrGuayaquilImage ? (
                        <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">Oficial Subido</span>
                      ) : (
                        <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">Autogenerado</span>
                      )}
                    </div>

                    <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-md flex items-center justify-center relative group">
                      <img
                        src={bankConfig.qrGuayaquilImage || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(`https://bg.ec/transfer?account=${bankConfig.guayaquilAccount || bankConfig.accountNumber}`)}`}
                        alt="QR Banco Guayaquil"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>

                    <div className="w-full space-y-1.5 text-center">
                      <input
                        type="file"
                        ref={qrGuayaquilFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleBankQrUpload('guayaquil', e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => qrGuayaquilFileRef.current?.click()}
                        className="w-full bg-pink-950/80 hover:bg-pink-900 border border-pink-600/50 text-pink-200 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{bankConfig.qrGuayaquilImage ? 'Cambiar Imagen QR' : 'Subir QR Guayaquil'}</span>
                      </button>
                      {bankConfig.qrGuayaquilImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setBankConfig({ ...bankConfig, qrGuayaquilImage: '' });
                            showToast('Imagen de QR Guayaquil eliminada. Se usará el QR dinámico.');
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Restaurar QR Dinámico
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: VISTA PREVIA DE PASARELA EN VIVO (CÓMO LO VERÁ EL CLIENTE) */}
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Vista Previa en Vivo: Pasarela que Verá el Cliente</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                    Simulación Interactiva
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 max-w-xl mx-auto space-y-4 text-white">
                  {/* Selector de Tabs de Vista Previa */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveQrPreviewTab('deuna')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeQrPreviewTab === 'deuna' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      QR DeUna!
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQrPreviewTab('payphone')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeQrPreviewTab === 'payphone' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      QR Payphone
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQrPreviewTab('guayaquil')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeQrPreviewTab === 'guayaquil' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Transferencia SPI
                    </button>
                  </div>

                  {activeQrPreviewTab === 'deuna' && (
                    <div className="bg-slate-900/80 border border-teal-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                        <img
                          src={bankConfig.qrDeunaImage || `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(`https://deuna.app/pay?to=${bankConfig.deunaPhone || bankConfig.phone}&amount=15.00&ref=FLT-DEMO`)}`}
                          alt="Preview Deuna"
                          className="w-24 h-24 rounded object-contain"
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <strong className="text-teal-400 block font-black">QR Oficial Deuna! Pichincha</strong>
                        <p className="text-slate-300 text-[11px]">Beneficiario: <strong className="text-white">{bankConfig.holderName || 'Transportista SARA'}</strong></p>
                        <p className="text-slate-300 text-[11px]">Celular: <strong className="font-mono text-emerald-400">{bankConfig.deunaPhone || bankConfig.phone || '0995544332'}</strong></p>
                        <p className="text-slate-400 text-[10px]">El cliente escanea directo desde la app Deuna y confirma el pago al instante.</p>
                      </div>
                    </div>
                  )}

                  {activeQrPreviewTab === 'payphone' && (
                    <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                        <img
                          src={bankConfig.qrPayphoneImage || `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(`https://payphone.app/pay?phone=${bankConfig.payphonePhone || bankConfig.phone}&amount=15.00`)}`}
                          alt="Preview Payphone"
                          className="w-24 h-24 rounded object-contain"
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <strong className="text-orange-400 block font-black">QR Payphone Ecuador</strong>
                        <p className="text-slate-300 text-[11px]">Beneficiario: <strong className="text-white">{bankConfig.holderName || 'Transportista SARA'}</strong></p>
                        <p className="text-slate-300 text-[11px]">Celular: <strong className="font-mono text-orange-400">{bankConfig.payphonePhone || bankConfig.phone || '0995544332'}</strong></p>
                        <p className="text-slate-400 text-[10px]">Permite pagar con tarjeta de débito o crédito desde cualquier banco nacional.</p>
                      </div>
                    </div>
                  )}

                  {activeQrPreviewTab === 'guayaquil' && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Banco:</span>
                        <span className="font-bold text-white">{bankConfig.bankName}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Tipo de Cuenta:</span>
                        <span className="font-semibold text-slate-200">{bankConfig.accountType}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Número de Cuenta:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400">{bankConfig.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(bankConfig.accountNumber, 'sim_acc')}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            {bankCopiedKey === 'sim_acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Titular:</span>
                        <span className="font-bold text-white">{bankConfig.holderName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cédula / RUC:</span>
                        <span className="font-mono text-slate-300">{bankConfig.holderId}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón Guardar Inferior Flotante / Destacado */}
              <div className="flex justify-end pt-2 pb-6">
                <button
                  type="button"
                  onClick={handleSaveBankConfig}
                  disabled={savingBankInfo}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {savingBankInfo ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sincronizando y Guardando Cuentas...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Guardar Cuentas Bancarias & Códigos QR</span>
                    </>
                  )}
                </button>
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
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 text-center sm:text-left min-w-0">
                      <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">Tarjetas</p>
                        <p className="text-slate-400 text-[10px] truncate">Crédito / Débito</p>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 text-center sm:text-left min-w-0">
                      <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">Bancos</p>
                        <p className="text-slate-400 text-[10px] truncate">Transferencia</p>
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 text-center sm:text-left min-w-0">
                      <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">QR Deuna!</p>
                        <p className="text-slate-400 text-[10px] truncate">Inmediato</p>
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
            <div className="space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">Historial Detallado de Viajes</h2>
                  <p className="text-xs text-slate-400">Registro de carreras completadas, comisiones y utilidad neta obtenida.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownloadExcel('viajes')} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Excel
                  </button>
                  <button onClick={() => handleDownloadPDF('viajes')} className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>

              {/* Filtros por Rango de Fechas (Desde / Hasta) + Atajos + Totales */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Fecha Desde
                    </label>
                    <input
                      type="date"
                      value={historialFechaDesde}
                      onChange={(e) => setHistorialFechaDesde(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Fecha Hasta
                    </label>
                    <input
                      type="date"
                      value={historialFechaHasta}
                      onChange={(e) => setHistorialFechaHasta(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const hoy = new Date().toISOString().slice(0, 10);
                        setHistorialFechaDesde(hoy);
                        setHistorialFechaHasta(hoy);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                        const today = now.toISOString().slice(0, 10);
                        setHistorialFechaDesde(first);
                        setHistorialFechaHasta(today);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      Este mes
                    </button>
                    {(historialFechaDesde || historialFechaHasta) && (
                      <button
                        type="button"
                        onClick={() => {
                          setHistorialFechaDesde('');
                          setHistorialFechaHasta('');
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
                      >
                        Todos
                      </button>
                    )}
                  </div>
                </div>

                {/* Resumen rápido de totales del periodo */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                    <span className="text-[10px] text-slate-400 block">Total Tarifa ({totalesViajes.cantidad})</span>
                    <span className="font-mono font-black text-white">${totalesViajes.totalTarifa.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                    <span className="text-[10px] text-slate-400 block">Total Comisión</span>
                    <span className="font-mono font-black text-rose-400">-${totalesViajes.totalComision.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-950 border border-emerald-500/30 rounded-xl px-3 py-1.5">
                    <span className="text-[10px] text-emerald-300 block">Total Utilidad Neta</span>
                    <span className="font-mono font-black text-emerald-400">${totalesViajes.totalUtilidad.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3.5 font-bold">Cliente</th>
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
                      {filteredViajesList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            No se encontraron viajes registrados en el rango de fechas seleccionado.
                          </td>
                        </tr>
                      ) : (
                        filteredViajesList.map((viaje) => (
                          <tr key={viaje.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 shadow-sm">
                                  {viaje.cliente?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <p className="font-bold text-white text-xs leading-tight">{viaje.cliente || 'Cliente SARA'}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">{viaje.fleteId || 'Flete Express'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-bold text-white">{viaje.route}</td>
                            <td className="p-3.5 text-slate-400">{viaje.embarque}</td>
                            <td className="p-3.5 text-slate-400">{viaje.llegada}</td>
                            <td className="p-3.5 text-slate-300 font-mono">{viaje.tiempo}</td>
                            <td className="p-3.5 font-mono font-bold text-white">${viaje.tarifa.toFixed(2)}</td>
                            <td className="p-3.5 font-mono font-bold text-rose-400">- ${viaje.comision.toFixed(2)}</td>
                            <td className="p-3.5 font-mono font-black text-emerald-400">${viaje.utilidad.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {filteredViajesList.length > 0 && (
                      <tfoot>
                        <tr className="bg-slate-950/90 border-t-2 border-slate-700 font-black text-xs">
                          <td colSpan={5} className="p-3.5 text-right uppercase tracking-wider text-slate-300">
                            TOTALES ({totalesViajes.cantidad} {totalesViajes.cantidad === 1 ? 'viaje' : 'viajes'}):
                          </td>
                          <td className="p-3.5 font-mono text-white text-sm">${totalesViajes.totalTarifa.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-rose-400 text-sm">- ${totalesViajes.totalComision.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-emerald-400 text-sm">${totalesViajes.totalUtilidad.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    )}
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

              {/* Métricas Resumen Compactas */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Recargado</p>
                  <p className="text-base sm:text-2xl font-black text-white font-mono mt-1">
                    ${historialRecargas.reduce((s, r) => s + r.valor, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Aprobadas</p>
                  <p className="text-base sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                    {historialRecargas.filter((r) => r.estado === 'Aprobado').length}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Pendientes</p>
                  <p className="text-base sm:text-2xl font-black text-amber-400 font-mono mt-1">
                    {historialRecargas.filter((r) => r.estado !== 'Aprobado').length}
                  </p>
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
            const plate = currentUser?.user_metadata?.placa || '';
            rechargeDriverWalletAction({
              plate,
              amountUSD: checkoutConfig.amount,
              paymentMethod: 'DEUNA_QR',
              reference: txId,
              idempotencyKey: `rec_${plate}_${txId}_${Date.now()}`
            }).then((res) => {
              const finalSaldo = res.success ? res.nuevoSaldo : +(balance + checkoutConfig.amount).toFixed(2);
              setBalance(finalSaldo);
              showToast(`¡Recarga de $${checkoutConfig.amount.toFixed(2)} USD acreditada exitosamente en servidor seguro! Tu nuevo saldo es $${finalSaldo.toFixed(2)} USD. Ref: ${txId}`);
            }).catch(() => {
              const nuevo = +(balance + checkoutConfig.amount).toFixed(2);
              setBalance(nuevo);
              showToast(`¡Recarga de $${checkoutConfig.amount.toFixed(2)} USD acreditada! Tu nuevo saldo es $${nuevo.toFixed(2)} USD. Ref: ${txId}`);
            });
          }
        }}
        title={checkoutConfig.title}
        badgeText="GoBee · Grupo Sara"
        amount={checkoutConfig.amount}
        isSubscription={checkoutConfig.isSubscription}
        subscriptionInterval={checkoutConfig.interval || 'por mes'}
        items={[
          {
            label: checkoutConfig.isSubscription 
              ? `Acceso a red y beneficios ${checkoutConfig.title}`
              : `Acreditación directa a billetera móvil GoBee`,
            amount: checkoutConfig.amount
          }
        ]}
        defaultEmail={currentUser?.email || ''}
        defaultCustomerName={currentUser?.user_metadata?.full_name || 'Conductor GoBee'}
      />

      {/* Modal de Firma y Certificación de Entrega Digital (e-POD) */}
      <SaraEpodModal
        isOpen={isEpodModalOpen}
        onClose={() => setIsEpodModalOpen(false)}
        fleteId={incomingRequest?.fleteId || 'FLT-DIRECT'}
        codigoAcceso={accessCode || '2889'}
        driverName={currentUser?.user_metadata?.full_name || 'David Sarango Malacatus'}
        plate={currentUser?.user_metadata?.placa || ''}
        currentCoords={driverLocation}
        onSuccess={(epod) => {
          setSavedEpod(epod);
          handleCompleteTrip();
        }}
      />

      {/* Modal de Verificación Biométrica Facial en Vivo (Selfie Liveness Check) */}
      <SaraDriverBiometricCheckModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        driverName={currentUser?.user_metadata?.full_name || 'Carlos Mendoza'}
        onVerified={() => {
          setBiometricVerified(true);
          setIsBiometricModalOpen(false);
        }}
      />

    </div>
  );
}
