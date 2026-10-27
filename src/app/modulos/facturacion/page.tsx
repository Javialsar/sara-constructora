'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  Download, 
  Send, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  Search, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Trash2, 
  Eye, 
  Share2, 
  Users, 
  Package, 
  Upload, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  Percent,
  ChevronRight,
  ChevronDown,
  Layers,
  Settings,
  LogOut,
  ExternalLink,
  Lock,
  Mail,
  Building2,
  Check,
  X,
  CreditCard,
  UserCheck,
  UserPlus,
  MapPin,
  Phone,
  Save,
  RotateCcw,
  Zap,
  CalendarRange
} from 'lucide-react';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';
import { createClient } from '@/lib/supabase/client';
import { PROVINCIAS_CANTONES_ECUADOR } from '@/lib/constants/ecuadorGeo';
import {
  PlanFacturacion,
  PlanContratadoInfo,
  PLANES_FACTURACION_DEFAULT,
  STORAGE_KEY_PLANES_ADMIN,
  STORAGE_KEY_PLAN_CONTRATADO,
  getPlanesFacturacionConfigurados,
  calcularDetalleCulminacionPlan
} from '@/lib/constants/planesFacturacion';

export interface ClienteEmisor {
  id: string;
  tipoIdentificacion: '04' | '05' | '06' | '07' | '08';
  identificacion: string;
  razonSocial: string;
  direccion: string;
  email: string;
  telefono?: string;
  ciudad?: string;
  esFrecuente?: boolean;
}

export const CLIENTES_PREDETERMINADOS: ClienteEmisor[] = [
  {
    id: 'cli-001',
    tipoIdentificacion: '04',
    identificacion: '1102978630001',
    razonSocial: 'CONSTRUCTORA BETANCOURT & ASOCIADOS CÍA. LTDA.',
    direccion: 'Av. Cuxibamba y Manuel Agustín Aguirre, Loja',
    email: 'contacto@constructora-betancourt.ec',
    telefono: '0998765432',
    ciudad: 'Loja',
    esFrecuente: true
  },
  {
    id: 'cli-002',
    tipoIdentificacion: '04',
    identificacion: '0190123456001',
    razonSocial: 'HORMIGONES DEL AUSTRO S.A.',
    direccion: 'Av. Solano y Doce de Abril, Cuenca',
    email: 'ventas@hormigonesdelaustro.com',
    telefono: '07 283 4567',
    ciudad: 'Cuenca',
    esFrecuente: true
  },
  {
    id: 'cli-003',
    tipoIdentificacion: '04',
    identificacion: '1791827364001',
    razonSocial: 'PROMOTORA INMOBILIARIA URBANA',
    direccion: 'Av. Naciones Unidas y Shyris, Edificio Urbania, Quito',
    email: 'facturacion@promotoraurbana.ec',
    telefono: '02 298 7654',
    ciudad: 'Quito',
    esFrecuente: true
  },
  {
    id: 'cli-004',
    tipoIdentificacion: '05',
    identificacion: '0103456789',
    razonSocial: 'ING. MARCO TOLEDO (TOPOGRAFÍA)',
    direccion: 'Calle Larga y Huayna Cápac, Cuenca',
    email: 'marco.toledo@topografia.ec',
    telefono: '0987654321',
    ciudad: 'Cuenca',
    esFrecuente: true
  },
  {
    id: 'cli-005',
    tipoIdentificacion: '07',
    identificacion: '9999999999999',
    razonSocial: 'CONSUMIDOR FINAL',
    direccion: 'Ecuador',
    email: 'consumidorfinal@sara.com',
    telefono: '0999999999',
    ciudad: 'Nacional',
    esFrecuente: false
  }
];

interface FacturaItem {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  tarifaIvaPct: number; // 0, 5, 8, 15
}

interface ComprobanteEmitido {
  id: string;
  tipo: '01' | '07' | '04' | '06';
  numero: string;
  cliente: string;
  identificacion: string;
  fecha: string;
  total: number;
  estado: 'AUTORIZADO' | 'EN_PROCESO' | 'DEVUELTA';
  claveAcceso: string;
  xmlAutorizado?: string;
}

export default function FacturacionDashboardPage() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'EMITIR' | 'BUZON' | 'HISTORIAL' | 'CATALOGOS' | 'FIRMA' | 'PLANES' | 'CONFIG'>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal de Autenticación
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthLogin, setIsAuthLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRuc, setAuthRuc] = useState('');
  const [authRazonSocial, setAuthRazonSocial] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Modal de Recargas / Checkout
  const [checkoutConfig, setCheckoutConfig] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }>({
    isOpen: false,
    title: 'Bolsa Prepago Micro (15 Docs)',
    amount: 3.99,
    badgeText: 'Recarga Prepago'
  });

  // Datos del Tenant / Emisor SRI
  const [tenantInfo, setTenantInfo] = useState({
    ruc: '1111111111001',
    nombres: 'RODRIGO ISRAEL',
    apellidos: 'BETANCOURT SRANGO',
    razonSocial: 'RODRIGO ISRAEL BETANCOURT SRANGO',
    nombreComercial: 'Betancourt Ingeniería & Obras',
    email: 'israel@gmail.com',
    emailContador: 'contabilidad@israel.ec',
    contacto: '0998765432',
    telefonoFijo: '02 245 8900',
    provincia: 'Pichincha',
    ciudad: 'Quito',
    calles: 'Av. Amazonas y Naciones Unidas',
    referencia: 'Edificio Amazonas Plaza, Piso 5',
    tipoContribuyente: 'CONSTRUCCION',
    regimen: 'Régimen RIMPE - Negocio Emprendedor',
    obligadoContabilidad: 'NO',
    contribuyenteEspecial: 'NO',
    resolucionAgenteRetencion: '',
    establecimiento: '001',
    puntoEmision: '001',
    ambiente: 'PRODUCCIÓN (2)',
    planActivo: 'Bolsa Prepago Micro',
    creditosRestantes: 15,
    creditosTotales: 15,
    firmaEstado: 'ACTIVA',
    firmaVenceDias: 360,
    firmaEmisor: 'SECURITY DATA (ARCOTEL)'
  });

  const [emisionLoading, setEmisionLoading] = useState(false);
  const [emisionStep, setEmisionStep] = useState<string>('');

  // Manejo de Cerrar sesión activa del cliente y retorno al landing page comercial (Imagen 1)
  const handleCerrar = async () => {
    try {
      await fetch('/api/auth/facturacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (e) {
      console.warn('Aviso API logout:', e);
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Aviso al cerrar sesión Supabase:', e);
    }

    if (typeof window !== 'undefined') {
      // Borrar cookies de sesión de facturación
      document.cookie = 'sara_facturacion_session=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'sara_facturacion_email=; path=/; max-age=0; SameSite=Lax';

      // Limpiar por completo la sesión y datos del cliente activo
      localStorage.removeItem('sara_facturacion_auth_email');
      localStorage.removeItem('sara_facturacion_auth_ruc');
      localStorage.removeItem('sara_facturacion_auth_razon');
      localStorage.removeItem('sara_facturacion_emisor_data');
      localStorage.removeItem('sri_active_emisor');
      localStorage.removeItem('sri_tenant_id');
      localStorage.removeItem('sri_current_session');
      sessionStorage.clear();
    }

    // Redirigir a landing page comercial de facturación (Imagen 1)
    window.location.href = '/facturacion-electronica';
  };

  // Guardar datos del emisor
  const handleSaveDatosEmisor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tenantInfo.ruc || tenantInfo.ruc.length !== 13) {
      showToast('El RUC del emisor debe tener exactamente 13 dígitos.');
      return;
    }
    if (!tenantInfo.razonSocial && (!tenantInfo.nombres || !tenantInfo.apellidos)) {
      showToast('Por favor ingresa los nombres y apellidos o la razón social.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sara_facturacion_emisor_data', JSON.stringify(tenantInfo));
      localStorage.setItem('sara_facturacion_auth_ruc', tenantInfo.ruc);
      localStorage.setItem('sara_facturacion_auth_razon', tenantInfo.razonSocial);
      localStorage.setItem('sara_facturacion_auth_email', tenantInfo.email);
    }

    showToast('¡Datos del emisor actualizados y sincronizados con éxito!');
  };

  // Verificar sesión activa y cargar datos del emisor
  useEffect(() => {
    let isMounted = true;

    const verifyAndLoad = async () => {
      if (typeof window === 'undefined') return;

      const hasCookie = document.cookie.includes('sara_facturacion_session');
      const savedEmisorRaw = localStorage.getItem('sara_facturacion_emisor_data');
      const savedRuc = localStorage.getItem('sara_facturacion_auth_ruc');
      const savedRazon = localStorage.getItem('sara_facturacion_auth_razon');
      const savedEmail = localStorage.getItem('sara_facturacion_auth_email');

      let hasSupabaseUser = false;
      let userEmail = '';
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          hasSupabaseUser = true;
          userEmail = data.user.email || '';
        }
      } catch (e) {
        // Modo demo / offline
      }

      // Extraer email de cookie si existe
      let cookieEmail = '';
      try {
        const match = document.cookie.match(/sara_facturacion_session=([^;]+)/);
        if (match) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          cookieEmail = parsed.email || '';
        }
      } catch (e) {}

      const effectiveEmail = savedEmail || userEmail || cookieEmail;
      const isAuth = Boolean(savedEmail || savedRuc || savedEmisorRaw || hasSupabaseUser || hasCookie);

      // Si el cliente no tiene sesión activa, redirigir al portal de autenticación
      if (!isAuth) {
        window.location.href = '/modulos/facturacion/auth';
        return;
      }

      if (!isMounted) return;

      const isIsrael = effectiveEmail.toLowerCase() === 'israel@gmail.com';

      if (savedEmisorRaw) {
        try {
          const parsed = JSON.parse(savedEmisorRaw);
          setTenantInfo(prev => ({
            ...prev,
            ...parsed,
            nombres: parsed.nombres || (isIsrael ? 'RODRIGO ISRAEL' : prev.nombres),
            apellidos: parsed.apellidos || (isIsrael ? 'BETANCOURT SRANGO' : prev.apellidos),
            razonSocial: parsed.razonSocial || (isIsrael ? 'RODRIGO ISRAEL BETANCOURT SRANGO' : prev.razonSocial),
            ruc: parsed.ruc || (isIsrael ? '1111111111001' : prev.ruc),
            provincia: parsed.direccion?.provincia || parsed.provincia || prev.provincia,
            ciudad: parsed.direccion?.ciudad || parsed.ciudad || prev.ciudad,
            calles: parsed.direccion?.calles || parsed.calles || (isIsrael ? 'Av. Amazonas y Naciones Unidas' : prev.calles),
            contacto: parsed.contacto || (isIsrael ? '0998765432' : prev.contacto),
            email: parsed.email || effectiveEmail || prev.email
          }));
        } catch (e) {
          console.warn('Error al leer datos guardados del emisor:', e);
        }
      } else if (isIsrael) {
        const israelEmisor = {
          ruc: '1111111111001',
          nombres: 'RODRIGO ISRAEL',
          apellidos: 'BETANCOURT SRANGO',
          razonSocial: 'RODRIGO ISRAEL BETANCOURT SRANGO',
          nombreComercial: 'Betancourt Ingeniería & Obras',
          email: 'israel@gmail.com',
          emailContador: 'contabilidad@israel.ec',
          contacto: '0998765432',
          telefonoFijo: '02 245 8900',
          provincia: 'Pichincha',
          ciudad: 'Quito',
          calles: 'Av. Amazonas y Naciones Unidas',
          referencia: 'Edificio Amazonas Plaza, Piso 5',
          tipoContribuyente: 'CONSTRUCCION',
          regimen: 'Régimen RIMPE - Negocio Emprendedor',
          obligadoContabilidad: 'NO',
          contribuyenteEspecial: 'NO',
          resolucionAgenteRetencion: '',
          establecimiento: '001',
          puntoEmision: '001',
          ambiente: 'PRODUCCIÓN (2)',
          planActivo: 'Bolsa Prepago Micro',
          creditosRestantes: 15,
          creditosTotales: 15,
          firmaEstado: 'ACTIVA',
          firmaVenceDias: 360,
          firmaEmisor: 'SECURITY DATA (ARCOTEL)'
        };
        setTenantInfo(prev => ({ ...prev, ...israelEmisor }));
        localStorage.setItem('sara_facturacion_emisor_data', JSON.stringify(israelEmisor));
        localStorage.setItem('sara_facturacion_auth_email', 'israel@gmail.com');
        localStorage.setItem('sara_facturacion_auth_ruc', '1111111111001');
        localStorage.setItem('sara_facturacion_auth_razon', 'RODRIGO ISRAEL BETANCOURT SRANGO');
      } else if (savedRuc || savedRazon || effectiveEmail) {
        setTenantInfo(prev => ({
          ...prev,
          ruc: savedRuc || prev.ruc,
          razonSocial: savedRazon || prev.razonSocial,
          email: effectiveEmail || prev.email
        }));
      }
    };

    verifyAndLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  // Emisor de comprobantes
  const [tipoComprobante, setTipoComprobante] = useState<'01' | '07' | '04'>('01');
  const [clienteTipoId, setClienteTipoId] = useState<'04' | '05' | '07'>('05');
  const [clienteId, setClienteId] = useState<string>('0104567890');
  const [clienteNombre, setClienteNombre] = useState<string>('JUAN PÉREZ VINTIMILLA');
  const [clienteEmail, setClienteEmail] = useState<string>('juan.perez@constructora.ec');
  const [clienteDireccion, setClienteDireccion] = useState<string>('Av. Solano y Doce de Abril, Cuenca');

  // Clientes y Catálogo (Requerimiento 1)
  const [clientes, setClientes] = useState<ClienteEmisor[]>(CLIENTES_PREDETERMINADOS);
  const [mostrarSugerenciasClientes, setMostrarSugerenciasClientes] = useState(false);
  const [filtroCatalogoCliente, setFiltroCatalogoCliente] = useState('');
  const [nuevoClienteModalOpen, setNuevoClienteModalOpen] = useState(false);
  const [nuevoClienteData, setNuevoClienteData] = useState<Partial<ClienteEmisor>>({
    tipoIdentificacion: '04',
    identificacion: '',
    razonSocial: '',
    direccion: '',
    email: '',
    telefono: '',
    ciudad: 'Quito'
  });

  // Filtros Avanzados del Historial de Comprobantes (Requerimiento 2)
  const [filtroHistorialRuc, setFiltroHistorialRuc] = useState('');
  const [filtroHistorialRazon, setFiltroHistorialRazon] = useState('');
  const [filtroHistorialFechaDesde, setFiltroHistorialFechaDesde] = useState('');
  const [filtroHistorialFechaHasta, setFiltroHistorialFechaHasta] = useState('');
  const [filtroHistorialTipo, setFiltroHistorialTipo] = useState<string>('TODOS');
  const [filtroHistorialEstado, setFiltroHistorialEstado] = useState<string>('TODOS');

  // Planes y Tarjeta Activa Permanente (Requerimientos 3 y 4)
  const [planContratado, setPlanContratado] = useState<PlanContratadoInfo>({
    id: 'plan-3',
    codigo: 'BOLSA_15_DOCS',
    nombre: 'Bolsa Micro (15 Docs)',
    tipo_plan: 'bolsa',
    precio_usd: 3.99,
    creditosRestantes: 15,
    creditosTotales: 15,
    limite_documentos: 15,
    fechaActivacion: new Date().toISOString(),
    fechaExpiracion: null,
    duracion_dias: 0,
    activo: true
  });
  const [planesDisponibles, setPlanesDisponibles] = useState<PlanFacturacion[]>(PLANES_FACTURACION_DEFAULT);
  const [filtroTipoPlan, setFiltroTipoPlan] = useState<'TODOS' | 'tiempo' | 'bolsa' | 'suscripcion'>('TODOS');
  const [selectedPlanParaCheckout, setSelectedPlanParaCheckout] = useState<PlanFacturacion | null>(null);

  // Cargar clientes y sincronizar planes de administración
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cargar catálogo de clientes guardados
    try {
      const savedCli = localStorage.getItem('sara_facturacion_clientes_catalogo');
      if (savedCli) {
        const parsedCli = JSON.parse(savedCli);
        if (Array.isArray(parsedCli) && parsedCli.length > 0) {
          const idsExistentes = new Set(parsedCli.map((c: any) => c.identificacion));
          const combinados = [
            ...parsedCli,
            ...CLIENTES_PREDETERMINADOS.filter(c => !idsExistentes.has(c.identificacion))
          ];
          setClientes(combinados);
        } else {
          setClientes(CLIENTES_PREDETERMINADOS);
          localStorage.setItem('sara_facturacion_clientes_catalogo', JSON.stringify(CLIENTES_PREDETERMINADOS));
        }
      } else {
        localStorage.setItem('sara_facturacion_clientes_catalogo', JSON.stringify(CLIENTES_PREDETERMINADOS));
      }
    } catch (e) {
      console.warn('Error leyendo catálogo de clientes:', e);
    }

    // Cargar plan contratado activo
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEY_PLAN_CONTRATADO);
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        setPlanContratado(parsedPlan);
        setTenantInfo(prev => ({
          ...prev,
          planActivo: parsedPlan.nombre,
          creditosRestantes: parsedPlan.creditosRestantes,
          creditosTotales: parsedPlan.creditosTotales
        }));
      }
    } catch (e) {
      console.warn('Error leyendo plan contratado:', e);
    }

    // Sincronizar planes configurados en Administración (/admin/facturacion/planes)
    const recargarPlanes = () => {
      const planesConfig = getPlanesFacturacionConfigurados();
      setPlanesDisponibles(planesConfig);
    };

    recargarPlanes();
    window.addEventListener('storage', recargarPlanes);
    window.addEventListener('sara_admin_planes_updated', recargarPlanes);

    return () => {
      window.removeEventListener('storage', recargarPlanes);
      window.removeEventListener('sara_admin_planes_updated', recargarPlanes);
    };
  }, []);

  // Coincidencias de clientes al tipear RUC o Razón Social
  const qClienteId = (clienteId || '').trim();
  const qClienteNombre = (clienteNombre || '').toLowerCase().trim();
  const coincidenciasClientes = (qClienteId.length >= 2 || qClienteNombre.length >= 2)
    ? clientes.filter(c => {
        const matchId = qClienteId.length >= 2 && c.identificacion.includes(qClienteId);
        const matchNom = qClienteNombre.length >= 2 && c.razonSocial.toLowerCase().includes(qClienteNombre);
        return matchId || matchNom;
      })
    : [];

  const seleccionarCliente = (c: ClienteEmisor) => {
    setClienteId(c.identificacion);
    setClienteNombre(c.razonSocial);
    setClienteTipoId(c.tipoIdentificacion as any);
    setClienteDireccion(c.direccion);
    setClienteEmail(c.email);
    setMostrarSugerenciasClientes(false);
    showToast(`Cliente cargado: ${c.razonSocial}`);
  };

  const guardarClienteActualEnCatalogo = () => {
    if (!clienteId || !clienteNombre) {
      showToast('Por favor ingresa la identificación y razón social del cliente.');
      return;
    }
    const existe = clientes.some(c => c.identificacion === clienteId);
    if (existe) {
      showToast('Este cliente ya está registrado en tu catálogo.');
      return;
    }
    const nuevo: ClienteEmisor = {
      id: `cli-${Date.now()}`,
      tipoIdentificacion: clienteTipoId,
      identificacion: clienteId,
      razonSocial: clienteNombre,
      direccion: clienteDireccion || 'Ecuador',
      email: clienteEmail || '',
      esFrecuente: true
    };
    const actualizados = [nuevo, ...clientes];
    setClientes(actualizados);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sara_facturacion_clientes_catalogo', JSON.stringify(actualizados));
    }
    showToast(`¡Cliente "${clienteNombre}" guardado en tu catálogo!`);
  };

  const detallePlan = calcularDetalleCulminacionPlan(planContratado);

  const contratarPlan = (plan: PlanFacturacion) => {
    setSelectedPlanParaCheckout(plan);
    setCheckoutConfig({
      isOpen: true,
      title: `${plan.nombre} (${plan.badge})`,
      amount: plan.precio_usd,
      badgeText: plan.tipo_plan === 'suscripcion' ? 'Suscripción SRI' : 'Activación Plan',
      isSubscription: plan.tipo_plan === 'suscripcion',
      subscriptionInterval: plan.duracion_dias >= 365 ? 'year' : 'month'
    });
  };

  // Ítems de la factura
  const [items, setItems] = useState<FacturaItem[]>([
    {
      id: 'item-1',
      codigo: 'SRV-001',
      descripcion: 'Servicios de Fiscalización Técnica de Estructura de Hormigón',
      cantidad: 1,
      precioUnitario: 450.00,
      tarifaIvaPct: 15.00
    },
    {
      id: 'item-2',
      codigo: 'MAT-002',
      descripcion: 'Suministro de Varilla de Acero Corrugado 12mm (Tarifa Reducida Ley Construcción)',
      cantidad: 20,
      precioUnitario: 12.50,
      tarifaIvaPct: 5.00
    }
  ]);

  // Historial de comprobantes
  const [comprobantes, setComprobantes] = useState<ComprobanteEmitido[]>([
    {
      id: 'cmp-101',
      tipo: '01',
      numero: '001-001-000000142',
      cliente: 'HORMIGONES DEL AUSTRO S.A.',
      identificacion: '0190123456001',
      fecha: '24/10/2026',
      total: 712.50,
      estado: 'AUTORIZADO',
      claveAcceso: '2410202601179234567800120010010000001421234567819'
    },
    {
      id: 'cmp-102',
      tipo: '07',
      numero: '001-001-000000085',
      cliente: 'ING. MARCO TOLEDO (TOPOGRAFÍA)',
      identificacion: '0103456789',
      fecha: '22/10/2026',
      total: 80.00,
      estado: 'AUTORIZADO',
      claveAcceso: '2210202607179234567800120010010000000851234567812'
    },
    {
      id: 'cmp-103',
      tipo: '01',
      numero: '001-001-000000141',
      cliente: 'PROMOTORA INMOBILIARIA URBANA',
      identificacion: '1791827364001',
      fecha: '20/10/2026',
      total: 1250.00,
      estado: 'AUTORIZADO',
      claveAcceso: '2010202601179234567800120010010000001411234567815'
    }
  ]);

  // Filtrado reactivo de comprobantes en el Historial (Requerimiento 2 - Imagen 3)
  const comprobantesFiltrados = comprobantes.filter(c => {
    if (filtroHistorialRuc.trim() && !c.identificacion.includes(filtroHistorialRuc.trim())) return false;
    if (filtroHistorialRazon.trim() && !c.cliente.toLowerCase().includes(filtroHistorialRazon.toLowerCase().trim())) return false;
    if (filtroHistorialTipo !== 'TODOS' && c.tipo !== filtroHistorialTipo) return false;
    if (filtroHistorialEstado !== 'TODOS' && c.estado !== filtroHistorialEstado) return false;

    if (filtroHistorialFechaDesde || filtroHistorialFechaHasta) {
      const partes = c.fecha.split('/');
      let fechaComp: Date;
      if (partes.length === 3) {
        fechaComp = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      } else {
        fechaComp = new Date(c.fecha);
      }

      if (filtroHistorialFechaDesde) {
        const d = new Date(filtroHistorialFechaDesde);
        d.setHours(0, 0, 0, 0);
        if (fechaComp < d) return false;
      }
      if (filtroHistorialFechaHasta) {
        const h = new Date(filtroHistorialFechaHasta);
        h.setHours(23, 59, 59, 999);
        if (fechaComp > h) return false;
      }
    }
    return true;
  });

  const limpiarFiltrosHistorial = () => {
    setFiltroHistorialRuc('');
    setFiltroHistorialRazon('');
    setFiltroHistorialFechaDesde('');
    setFiltroHistorialFechaHasta('');
    setFiltroHistorialTipo('TODOS');
    setFiltroHistorialEstado('TODOS');
  };

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  // Cálculos de la factura
  const subtotal15 = items.filter(i => i.tarifaIvaPct === 15).reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
  const subtotal5 = items.filter(i => i.tarifaIvaPct === 5).reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
  const subtotal0 = items.filter(i => i.tarifaIvaPct === 0).reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
  const iva15 = subtotal15 * 0.15;
  const iva5 = subtotal5 * 0.05;
  const totalIva = iva15 + iva5;
  const subtotalGeneral = subtotal15 + subtotal5 + subtotal0;
  const totalFactura = subtotalGeneral + totalIva;

  const agregarItem = () => {
    const nuevo: FacturaItem = {
      id: `item-${Date.now()}`,
      codigo: 'SRV-NEW',
      descripcion: 'Nuevo Servicio o Rubro Profesional',
      cantidad: 1,
      precioUnitario: 100.00,
      tarifaIvaPct: 15.00
    };
    setItems([...items, nuevo]);
  };

  const eliminarItem = (id: string) => {
    if (items.length <= 1) {
      showToast('Debe existir al menos un ítem en la factura.');
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const emitirFacturaSRI = async () => {
    if (tenantInfo.creditosRestantes <= 0) {
      showToast('No tienes créditos disponibles en tu plan. Por favor recarga o activa un Pase Diario.');
      return;
    }

    setEmisionLoading(true);
    setEmisionStep('1/4: Generando Clave de Acceso de 49 dígitos (Módulo 11 oficial SRI)...');

    try {
      await new Promise(r => setTimeout(r, 350));
      setEmisionStep('2/4: Estructurando XML canónico v2.1.0 (IVA 15% General + IVA 5% Construcción)...');

      await new Promise(r => setTimeout(r, 350));
      setEmisionStep('3/4: Firmando digitalmente comprobante con estándar XAdES-BES y certificado X.509...');

      const res = await fetch('/api/facturacion/emitir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emisor: {
            ruc: tenantInfo.ruc,
            razonSocial: tenantInfo.razonSocial,
            nombreComercial: tenantInfo.nombreComercial,
            dirMatriz: tenantInfo.calles,
            establecimiento: tenantInfo.establecimiento || '001',
            puntoEmision: tenantInfo.puntoEmision || '001',
            obligadoContabilidad: tenantInfo.obligadoContabilidad || 'NO',
            regimen: tenantInfo.regimen,
            ambiente: tenantInfo.ambiente?.includes('2') ? '2' : '1'
          },
          comprador: {
            tipoIdentificacion: clienteTipoId,
            identificacion: clienteId,
            razonSocial: clienteNombre,
            direccion: clienteDireccion,
            email: clienteEmail
          },
          items: items.map(i => ({
            codigo: i.codigo,
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            descuento: 0,
            ivaTarifa: i.tarifaIvaPct === 5 ? 5 : i.tarifaIvaPct === 0 ? 0 : 15
          }))
        })
      });

      setEmisionStep('4/4: Transmitiendo en tiempo real a Web Service SRI (RecepcionComprobantesOffline)...');

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Fallo en la autorización del SRI.');
      }

      const cmp = json.comprobante;
      const nuevaFac: ComprobanteEmitido = {
        id: cmp.claveAcceso,
        tipo: tipoComprobante,
        numero: cmp.numeroComprobante,
        cliente: clienteNombre,
        identificacion: clienteId,
        fecha: new Date().toLocaleDateString('es-EC'),
        total: cmp.totalFactura,
        estado: 'AUTORIZADO',
        claveAcceso: cmp.claveAcceso,
        xmlAutorizado: cmp.xmlAutorizado
      };

      setComprobantes([nuevaFac, ...comprobantes]);
      setTenantInfo(prev => ({ ...prev, creditosRestantes: Math.max(0, prev.creditosRestantes - 1) }));
      if (planContratado.tipo_plan === 'bolsa') {
        setPlanContratado(prev => {
          const actual = {
            ...prev,
            creditosRestantes: Math.max(0, prev.creditosRestantes - 1)
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_PLAN_CONTRATADO, JSON.stringify(actual));
          }
          return actual;
        });
      }
      showToast(`¡Factura Nº ${nuevaFac.numero} firmada con XAdES-BES y AUTORIZADA inmediatamente por el SRI (Cero Multas Art. 314 CT)!`);
      setActiveTab('HISTORIAL');
    } catch (err: any) {
      showToast(`Error al emitir al SRI: ${err.message}`);
    } finally {
      setEmisionLoading(false);
      setEmisionStep('');
    }
  };

  const handleDescargarPdf = (c: ComprobanteEmitido) => {
    const url = `/api/facturacion/descargar?claveAcceso=${encodeURIComponent(c.claveAcceso)}&tipo=pdf&numero=${encodeURIComponent(c.numero)}&cliente=${encodeURIComponent(c.cliente)}&ruc=${encodeURIComponent(tenantInfo.ruc)}&razonSocial=${encodeURIComponent(tenantInfo.razonSocial)}&total=${c.total}`;
    window.open(url, '_blank');
    showToast(`Generando y descargando RIDE oficial en PDF de ${c.numero}...`);
  };

  const handleDescargarXml = (c: ComprobanteEmitido) => {
    const url = `/api/facturacion/descargar?claveAcceso=${encodeURIComponent(c.claveAcceso)}&tipo=xml&numero=${encodeURIComponent(c.numero)}&cliente=${encodeURIComponent(c.cliente)}&ruc=${encodeURIComponent(tenantInfo.ruc)}&razonSocial=${encodeURIComponent(tenantInfo.razonSocial)}&total=${c.total}`;
    window.open(url, '_blank');
    showToast(`Descargando archivo XML firmado XAdES-BES de ${c.numero}...`);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const supabase = createClient();
      if (isAuthLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setTenantInfo(prev => ({
          ...prev,
          email: authEmail,
          razonSocial: data.user.user_metadata?.full_name || prev.razonSocial,
          ruc: data.user.user_metadata?.ruc || prev.ruc
        }));
        showToast('¡Sesión iniciada con éxito!');
      } else {
        if (!authRuc || authRuc.length !== 13) {
          throw new Error('El RUC debe tener 13 dígitos.');
        }
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authRazonSocial,
              ruc: authRuc,
              role: 'emisor_facturacion'
            }
          }
        });
        if (error) throw error;
        setTenantInfo(prev => ({
          ...prev,
          email: authEmail,
          razonSocial: authRazonSocial,
          ruc: authRuc
        }));
        showToast('¡Cuenta de emisor creada exitosamente!');
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message || 'Error en autenticación');
    } finally {
      setAuthLoading(false);
    }
  };

  const abrirCheckoutPlan = (plan: { title: string; amount: number; badgeText: string; isSub?: boolean; interval?: string }) => {
    setCheckoutConfig({
      isOpen: true,
      title: plan.title,
      amount: plan.amount,
      badgeText: plan.badgeText,
      isSubscription: plan.isSub || false,
      subscriptionInterval: plan.interval
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Flotante */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <div className="text-sm">{toast}</div>
        </div>
      )}

      {/* MODAL DE CHECKOUT ESTÁNDAR INTEGRADO */}
      <StandardCheckoutModal
        isOpen={checkoutConfig.isOpen}
        onClose={() => setCheckoutConfig(prev => ({ ...prev, isOpen: false }))}
        title={checkoutConfig.title}
        amount={checkoutConfig.amount}
        badgeText={checkoutConfig.badgeText}
        isSubscription={checkoutConfig.isSubscription}
        subscriptionInterval={checkoutConfig.subscriptionInterval}
        defaultEmail={tenantInfo.email}
        defaultCustomerName={tenantInfo.razonSocial}
        onSuccess={(txId) => {
          if (selectedPlanParaCheckout) {
            const plan = selectedPlanParaCheckout;
            const esBolsa = plan.tipo_plan === 'bolsa';
            const docsNuevos = plan.limite_documentos > 0 ? plan.limite_documentos : 0;
            const duracionDias = plan.duracion_dias > 0 ? plan.duracion_dias : 0;
            const fechaAhora = new Date().toISOString();
            const fechaExp = duracionDias > 0 
              ? new Date(Date.now() + duracionDias * 86400000).toISOString()
              : null;

            const nuevoPlanContratado: PlanContratadoInfo = {
              id: plan.id,
              codigo: plan.codigo,
              nombre: plan.nombre,
              tipo_plan: plan.tipo_plan,
              precio_usd: plan.precio_usd,
              creditosRestantes: esBolsa ? ((planContratado.tipo_plan === 'bolsa' ? planContratado.creditosRestantes : 0) + docsNuevos) : 9999,
              creditosTotales: esBolsa ? ((planContratado.tipo_plan === 'bolsa' ? planContratado.creditosTotales : 0) + docsNuevos) : 9999,
              limite_documentos: plan.limite_documentos,
              fechaActivacion: fechaAhora,
              fechaExpiracion: fechaExp,
              duracion_dias: duracionDias,
              activo: true
            };

            setPlanContratado(nuevoPlanContratado);
            setTenantInfo(prev => ({
              ...prev,
              planActivo: nuevoPlanContratado.nombre,
              creditosRestantes: nuevoPlanContratado.creditosRestantes,
              creditosTotales: nuevoPlanContratado.creditosTotales
            }));

            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_PLAN_CONTRATADO, JSON.stringify(nuevoPlanContratado));
            }

            showToast(`¡Transacción confirmada (${txId})! Plan "${plan.nombre}" activado con éxito.`);
          } else {
            showToast(`¡Transacción confirmada (${txId})! Saldo recargado exitosamente.`);
            setTenantInfo(prev => ({ ...prev, creditosRestantes: prev.creditosRestantes + 15 }));
            setPlanContratado(prev => {
              const updated = {
                ...prev,
                creditosRestantes: prev.creditosRestantes + 15,
                creditosTotales: prev.creditosTotales + 15
              };
              if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_PLAN_CONTRATADO, JSON.stringify(updated));
              }
              return updated;
            });
          }
        }}
      />

      {/* MODAL DE AUTENTICACIÓN / CAMBIO DE EMISOR */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isAuthLogin ? 'Iniciar Sesión Emisor' : 'Crear Cuenta Emisor SRI'}
                  </h3>
                  <p className="text-xs text-slate-400">Portal de Facturación & Firma Grupo SARA</p>
                </div>
              </div>
              <button 
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isAuthLogin && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">RUC (13 dígitos) *</label>
                    <input
                      type="text"
                      required
                      maxLength={13}
                      value={authRuc}
                      onChange={(e) => setAuthRuc(e.target.value.replace(/\D/g, ''))}
                      placeholder="1792984512001"
                      className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Razón Social *</label>
                    <input
                      type="text"
                      required
                      value={authRazonSocial}
                      onChange={(e) => setAuthRazonSocial(e.target.value)}
                      placeholder="ING. CARLOS MENDOZA"
                      className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="contribuyente@sara.com"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {authLoading ? 'Verificando...' : (isAuthLogin ? 'Acceder al Portal' : 'Registrar Emisor')}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuthLogin(!isAuthLogin)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                >
                  {isAuthLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ARQUITECTURA DE DOS PANELES (PANEL IZQUIERDO MENÚ + PANEL DERECHO WORKSPACE)
          ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* =====================================================================
            PANEL IZQUIERDO: MENÚS, ESTADO TRIBUTARIO Y PLAN
            ===================================================================== */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 bg-slate-900 border-r border-white/[0.08] flex flex-col justify-between p-5 space-y-6">
          
          <div className="space-y-6">
            
            {/* Header Emisor / RUC */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] shadow-inner space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {tenantInfo.ambiente}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('CONFIG')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 uppercase font-bold tracking-wider cursor-pointer"
                    title="Editar Datos del Emisor SRI"
                  >
                    Editar
                  </button>
                  <span className="text-slate-600 text-[10px]">|</span>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="text-[10px] text-slate-400 hover:text-white uppercase font-bold tracking-wider cursor-pointer"
                    title="Cambiar Contribuyente o Iniciar Sesión"
                  >
                    Cuenta
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-display text-sm font-extrabold text-white leading-snug line-clamp-2">
                  {tenantInfo.razonSocial}
                </h2>
                <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                  RUC: <strong className="text-slate-300">{tenantInfo.ruc}</strong>
                </div>
              </div>

              {/* Mini Status Firma */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Firma .p12
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {tenantInfo.firmaVenceDias} días
                </span>
              </div>
            </div>

            {/* Menús de Navegación Vertical */}
            <nav className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Operaciones SRI
              </div>

              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Resumen & Balance SRI</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'DASHBOARD' ? 'bg-amber-600 text-slate-950 font-black' : 'bg-white/[0.08] text-amber-400'
                }`}>
                  $136.40
                </span>
              </button>

              <button
                onClick={() => setActiveTab('EMITIR')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'EMITIR'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Emitir Comprobante</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  SRI 2026
                </span>
              </button>

              <button
                onClick={() => setActiveTab('HISTORIAL')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'HISTORIAL'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Comprobantes Emitidos</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300">
                  {comprobantes.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('BUZON')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'BUZON'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>Buzón & Gastos Deducibles</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  Form 104
                </span>
              </button>

              <button
                onClick={() => setActiveTab('CATALOGOS')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'CATALOGOS'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Clientes & Rubros</span>
                </div>
              </button>

              <div className="pt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                Seguridad & Servicios
              </div>

              <button
                onClick={() => setActiveTab('FIRMA')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'FIRMA'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Bóveda de Firma (.p12)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  Válida
                </span>
              </button>

              <button
                onClick={() => setActiveTab('PLANES')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'PLANES'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Planes & Recargas</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                  Desde $1.50
                </span>
              </button>

              <button
                onClick={() => setActiveTab('CONFIG')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'CONFIG'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Datos Emisor</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">001-001</span>
              </button>
            </nav>

          </div>

          {/* Footer del Panel Izquierdo: Saldo de Plan y Botón de Recarga */}
          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            {/* TARJETA DEL PLAN ACTIVO PERMANENTE (Requerimiento 3 - Imagen 4) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Plan Activo</span>
                  <h4 className="font-display text-sm font-extrabold text-white mt-0.5 leading-tight">
                    {planContratado.nombre}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                  detallePlan.estaVencido 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : detallePlan.esBolsa
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {detallePlan.badgeEstado}
                </span>
              </div>

              {detallePlan.esBolsa ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-amber-400 font-mono tracking-tight">
                      {planContratado.creditosRestantes} <span className="text-xs text-slate-400 font-normal">/ {planContratado.creditosTotales} docs</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Sin Caducidad</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    {detallePlan.detalleSecundario}
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${detallePlan.porcentajeRestante}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {detallePlan.textoCulminacion}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {detallePlan.detalleSecundario}
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${detallePlan.porcentajeRestante}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTab('PLANES')}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ver Planes & Recargar</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
              <Link href="/portal-comprobantes" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>Consulta RIDE</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button 
                type="button"
                onClick={handleCerrar}
                className="hover:text-rose-400 text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                title="Cerrar sesión activa y volver a SARA Facturación"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>

        </aside>

        {/* =====================================================================
            PANEL DERECHO: ÁREA DE TRABAJO DINÁMICA
            ===================================================================== */}
        <main className="flex-1 bg-slate-950 p-6 md:p-8 overflow-y-auto space-y-8">
          
          {/* Header Superior del Área de Trabajo */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● Web Service SRI Online (soap.sri.gob.ec)
                </span>
                <span className="text-xs text-slate-500">Módulo 11 Verificado</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                {activeTab === 'DASHBOARD' && 'Resumen Ejecutivo & Balance Tributario SRI'}
                {activeTab === 'EMITIR' && 'Emisión de Facturas & Retenciones Electrónicas'}
                {activeTab === 'HISTORIAL' && 'Historial de Comprobantes Autorizados'}
                {activeTab === 'BUZON' && 'Buzón de Compras & Deducción de Gastos (Form. 104)'}
                {activeTab === 'CATALOGOS' && 'Directorio de Clientes & Catálogo de Rubros'}
                {activeTab === 'FIRMA' && 'Bóveda Cifrada de Certificado Digital (.p12)'}
                {activeTab === 'PLANES' && 'Catálogo de Planes, Pases y Firma Electrónica'}
                {activeTab === 'CONFIG' && 'Datos del Emisor SRI & Puntos de Emisión'}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              {activeTab !== 'EMITIR' && (
                <button
                  onClick={() => setActiveTab('EMITIR')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Nueva Factura</span>
                </button>
              )}
              <Link
                href="/facturacion-electronica"
                target="_blank"
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Ver landing page comercial de facturación"
              >
                <span>Landing Facturación</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </Link>
              <button
                type="button"
                onClick={handleCerrar}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Cerrar sesión activa y volver a SARA Facturación"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>

          {/* ===================================================================
              VISTA 1: DASHBOARD / BALANCE SRI (SIN \$ ESCAPADOS, TODO CON $)
              =================================================================== */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* BANNER NORMATIVO SRI 2026: PROCESAMIENTO INMEDIATO EN LÍNEA & CERO MULTAS ART. 314 CT */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/30 border border-emerald-500/30 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Transmisión Inmediata en Línea SRI (Art. 314 y 318 Código Tributario)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        ● WEB SERVICE SRI ONLINE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 max-w-3xl leading-relaxed">
                      Emisión y procesamiento en tiempo real con firma digital XAdES-BES. Blindaje absoluto contra sanciones de $30 a $1,500 y clausura de 7 días por emisión tardía o falta de entrega. Aplicación automática de tarifa 5% IVA en Materiales de Construcción (Res. NAC-DGERCGC24-00000013) y 15% General.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-white/[0.06]">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Firma Digital .p12</div>
                    <div className="text-xs font-bold text-amber-400 font-mono">XAdES-BES Activa</div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-ping"></div>
                </div>
              </div>

              {/* Tarjetas de Métricas de Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Facturado Mes (Ventas)</span>
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-white mt-2 font-mono">
                    $ 2,412.50
                  </div>
                  <div className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +18% frente al mes anterior
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">IVA Cobrado en Ventas</span>
                    <Percent className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-blue-400 mt-2 font-mono">
                    $ 278.40
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Desglose dual: IVA 15% ($262) e IVA 5% ($16.40)
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">IVA Soportado (Compras)</span>
                    <Receipt className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-purple-400 mt-2 font-mono">
                    $ 142.00
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Crédito tributario de facturas registradas
                  </div>
                </div>

                {/* Proyección Form. 104 */}
                <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Proyección IVA SRI (Form. 104)</span>
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="font-display text-3xl font-extrabold text-amber-400 mt-2 font-mono">
                    $ 136.40
                  </div>
                  <div className="text-xs text-amber-200/80 mt-2">
                    Estimado neto a pagar en próxima declaración
                  </div>
                </div>
              </div>

              {/* Grid 2 Columnas: Últimas Facturas y Herramientas Fiscales */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Últimos Comprobantes Emitidos */}
                <div className="lg:col-span-7 bg-slate-900 border border-white/[0.08] rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-lg font-bold text-white">Últimas Facturas Emitidas</h3>
                    <button 
                      onClick={() => setActiveTab('HISTORIAL')} 
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      Ver todas <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {comprobantes.map(c => (
                      <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-white/[0.06] flex items-center justify-between hover:border-amber-400/30 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {c.estado}
                            </span>
                            <span className="font-mono text-xs font-bold text-white">{c.numero}</span>
                          </div>
                          <div className="text-xs text-slate-300 font-semibold">{c.cliente}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Fecha: {c.fecha}</div>
                        </div>

                        <div className="text-right space-y-1.5">
                          <div className="font-mono text-base font-extrabold text-amber-400">
                            ${c.total.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDescargarPdf(c)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Descargar RIDE PDF Oficial"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDescargarXml(c)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                              title="Descargar XML Autorizado SRI"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Herramientas Fiscales SARA */}
                <div className="lg:col-span-5 bg-slate-900 border border-white/[0.08] rounded-3xl p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">Herramientas Fiscales SARA</h3>
                  
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Percent className="w-4 h-4" /> Tarifa 5% Materiales de Construcción
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Aplica automáticamente el 5% en varillas, cemento, bloques y áridos bajo Res. NAC-DGERCGC24-00000013.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" /> Retenciones Automáticas
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Genera el XML de retención 07 aplicando códigos Cód. 312 (1.75%), Cód. 344 (1.75%) y Cód. 303 (10%).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Algoritmo Módulo 11 Verificador
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cálculo estricto de los 49 dígitos de la clave de acceso para cero rechazos en el Web Service del SRI.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===================================================================
              VISTA 2: FORMULARIO DE EMISIÓN DE FACTURA / RETENCIÓN
              =================================================================== */}
          {activeTab === 'EMITIR' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-8 animate-in fade-in duration-200">
              
              {/* AVISO LEGAL PROCESAMIENTO INMEDIATO OBLIGATORIO */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-400 uppercase tracking-wide block mb-0.5">Disposición Legal Vigente SRI (Procesamiento en Línea Inmediato Obligatorio):</strong>
                  El SRI eliminó la emisión diferida. Toda factura electrónica debe ser transmitida en el momento mismo de la transacción al Web Service del SRI para su inmediata autorización. El sistema calcula automáticamente la clave de 49 dígitos con el algoritmo Módulo 11 oficial y firma con XAdES-BES para entrega instantánea al comprador, garantizando cero multas bajo los Art. 314 y 318 del Código Tributario.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-xl font-bold text-white">Datos del Comprobante</h3>
                  <p className="text-xs text-slate-400">Punto de Emisión: 001-001 · Secuencia automática asignada</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipoComprobante('01')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tipoComprobante === '01' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Factura (01)
                  </button>
                  <button
                    onClick={() => setTipoComprobante('07')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tipoComprobante === '07' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Retención (07)
                  </button>
                </div>
              </div>

              {/* DATOS DEL CLIENTE CON AUTOCOMPLETADO Y COINCIDENCIAS (Requerimiento 1 - Imágenes 1 y 2) */}
              <div className="space-y-4">
                
                {/* Barra de Selección Rápida de Clientes Frecuentes */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      Clientes Frecuentes (1 Clic para Autocompletar):
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('CATALOGOS')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Ver Directorio Completo ({clientes.length}) <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {clientes.slice(0, 5).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => seleccionarCliente(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          clienteId === c.identificacion
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 border-white/[0.08] text-slate-300 hover:border-amber-400/60 hover:text-white'
                        }`}
                        title={`Autocompletar con ${c.razonSocial}`}
                      >
                        <Building2 className={`w-3.5 h-3.5 ${clienteId === c.identificacion ? 'text-slate-950' : 'text-amber-400'}`} />
                        <span>{c.razonSocial.length > 28 ? c.razonSocial.slice(0, 28) + '...' : c.razonSocial}</span>
                        <span className={`font-mono text-[10px] ${clienteId === c.identificacion ? 'text-slate-800' : 'text-slate-500'}`}>
                          ({c.identificacion.slice(-4)})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formulario Principal de Identificación del Comprador */}
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Tipo Identificación */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo Identificación</label>
                      <select
                        value={clienteTipoId}
                        onChange={(e) => setClienteTipoId(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="05">Cédula (05)</option>
                        <option value="04">RUC (04)</option>
                        <option value="06">Pasaporte (06)</option>
                        <option value="07">Consumidor Final (07)</option>
                      </select>
                    </div>

                    {/* Cédula / RUC con Coincidencias */}
                    <div className="md:col-span-4 relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Cédula / RUC *</label>
                        {coincidenciasClientes.length > 0 && (
                          <span className="text-[10px] text-amber-400 font-mono font-bold animate-pulse">
                            {coincidenciasClientes.length} coincidencia{coincidenciasClientes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={clienteId}
                          onFocus={() => setMostrarSugerenciasClientes(true)}
                          onChange={(e) => {
                            setClienteId(e.target.value);
                            setMostrarSugerenciasClientes(true);
                          }}
                          placeholder="Ingresa RUC o Cédula..."
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                      </div>
                    </div>

                    {/* Razón Social / Nombre con Coincidencias */}
                    <div className="md:col-span-5 relative">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Razón Social / Nombre *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={clienteNombre}
                          onFocus={() => setMostrarSugerenciasClientes(true)}
                          onChange={(e) => {
                            setClienteNombre(e.target.value);
                            setMostrarSugerenciasClientes(true);
                          }}
                          placeholder="Nombre del cliente o contratista..."
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Users className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                      </div>
                    </div>

                  </div>

                  {/* DESPLEGABLE FLOTANTE DE COINCIDENCIAS (Requerimiento 1 - Imagen 1 y 2) */}
                  {mostrarSugerenciasClientes && coincidenciasClientes.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-slate-900/98 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl shadow-2xl p-3 max-h-72 overflow-y-auto space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center px-2 pb-2 border-b border-white/[0.08]">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          Coincidencias encontradas en tus clientes ({coincidenciasClientes.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => setMostrarSugerenciasClientes(false)}
                          className="text-[11px] text-slate-400 hover:text-white font-bold"
                        >
                          Cerrar [×]
                        </button>
                      </div>

                      <div className="divide-y divide-white/[0.06]">
                        {coincidenciasClientes.map(c => (
                          <div
                            key={c.id}
                            onClick={() => seleccionarCliente(c)}
                            className="p-3 rounded-xl hover:bg-amber-500/10 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors">
                                  {c.razonSocial}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                                  {c.tipoIdentificacion === '04' ? 'RUC' : 'CÉDULA'}
                                </span>
                              </div>
                              <div className="font-mono text-xs text-slate-400">
                                RUC / Cédula: <strong className="text-slate-200">{c.identificacion}</strong>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span>{c.direccion}</span>
                                {c.email && (
                                  <>
                                    <span className="text-slate-600">·</span>
                                    <Mail className="w-3 h-3 text-slate-500" />
                                    <span>{c.email}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                seleccionarCliente(c);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-sm"
                            >
                              Seleccionar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fila 2: Correo Electrónico y Dirección de Entrega */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Correo Electrónico (Para envío automático de XML & RIDE PDF)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={clienteEmail}
                          onChange={(e) => setClienteEmail(e.target.value)}
                          placeholder="cliente@ejemplo.com"
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Dirección Fiscal o Ubicación de Obra
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={clienteDireccion}
                          onChange={(e) => setClienteDireccion(e.target.value)}
                          placeholder="Calle principal, secundaria y ciudad..."
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={guardarClienteActualEnCatalogo}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/[0.08] hover:border-amber-400/60 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Guardar este cliente en el catálogo para futuras emisiones"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Guardar</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Ítems / Rubros de la Factura */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Detalle de Rubros y Suministros</h4>
                  <button
                    onClick={agregarItem}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Agregar Ítem
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase">Código</label>
                        <input
                          type="text"
                          value={item.codigo}
                          onChange={(e) => {
                            const actualizados = [...items];
                            actualizados[idx].codigo = e.target.value;
                            setItems(actualizados);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[10px] text-slate-500 uppercase">Descripción</label>
                        <input
                          type="text"
                          value={item.descripcion}
                          onChange={(e) => {
                            const actualizados = [...items];
                            actualizados[idx].descripcion = e.target.value;
                            setItems(actualizados);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => {
                            const actualizados = [...items];
                            actualizados[idx].cantidad = parseFloat(e.target.value) || 0;
                            setItems(actualizados);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase">P. Unitario ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precioUnitario}
                          onChange={(e) => {
                            const actualizados = [...items];
                            actualizados[idx].precioUnitario = parseFloat(e.target.value) || 0;
                            setItems(actualizados);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono text-white"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] text-slate-500 uppercase">IVA</label>
                        <select
                          value={item.tarifaIvaPct}
                          onChange={(e) => {
                            const actualizados = [...items];
                            actualizados[idx].tarifaIvaPct = parseInt(e.target.value);
                            setItems(actualizados);
                          }}
                          className="w-full px-1.5 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-xs font-mono font-bold text-amber-400"
                        >
                          <option value={15}>15%</option>
                          <option value={5}>5%</option>
                          <option value={0}>0%</option>
                        </select>
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          onClick={() => eliminarItem(item.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de Totales e IVA */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t border-white/[0.08]">
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Subtotal 15%: <strong className="text-white">${subtotal15.toFixed(2)}</strong> (IVA: ${iva15.toFixed(2)})</div>
                  <div>Subtotal 5% (Construcción): <strong className="text-white">${subtotal5.toFixed(2)}</strong> (IVA: ${iva5.toFixed(2)})</div>
                  <div>Subtotal 0%: <strong className="text-white">${subtotal0.toFixed(2)}</strong></div>
                  <div className="font-bold text-amber-400 pt-1 text-sm">
                    TOTAL A PAGAR: ${totalFactura.toFixed(2)} USD
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('HISTORIAL')}
                    className="px-5 py-3 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={emisionLoading}
                    onClick={emitirFacturaSRI}
                    className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {emisionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Transmitiendo en Línea al SRI...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Firmar con .p12 & Emitir al SRI (En Línea)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              VISTA 3: HISTORIAL DE COMPROBANTES EMITIDOS (Requerimiento 2 - Imagen 3)
              =================================================================== */}
          {activeTab === 'HISTORIAL' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Comprobantes Autorizados por el SRI</h3>
                  <p className="text-xs text-slate-400">Historial oficial con firma digital XAdES-BES y clave de acceso de 49 dígitos.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Total emitidos: <strong className="text-white">{comprobantes.length}</strong>
                  </span>
                </div>
              </div>

              {/* BARRA DE FILTROS AVANZADOS (Requerimiento 2 - Imagen 3) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Filtros de Búsqueda (RUC, Razón Social, Fechas Desde - Hasta)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      Mostrando <strong className="text-amber-400 font-bold">{comprobantesFiltrados.length}</strong> de <strong className="text-slate-300">{comprobantes.length}</strong> comprobantes
                    </span>
                    {(filtroHistorialRuc || filtroHistorialRazon || filtroHistorialFechaDesde || filtroHistorialFechaHasta || filtroHistorialTipo !== 'TODOS' || filtroHistorialEstado !== 'TODOS') && (
                      <button
                        onClick={limpiarFiltrosHistorial}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Limpiar todos los filtros aplicados"
                      >
                        <RotateCcw className="w-3 h-3" /> Limpiar Filtros
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
                  
                  {/* 1. Filtro RUC */}
                  <div className="lg:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Por RUC / Cédula
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filtroHistorialRuc}
                        onChange={(e) => setFiltroHistorialRuc(e.target.value)}
                        placeholder="Ej. 1102978630001"
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  {/* 2. Filtro Razón Social */}
                  <div className="lg:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Por Razón Social / Cliente
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filtroHistorialRazon}
                        onChange={(e) => setFiltroHistorialRazon(e.target.value)}
                        placeholder="Ej. Betancourt, Hormigones..."
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <Users className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  {/* 3. Filtro Fecha Desde */}
                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" /> Fecha Desde
                    </label>
                    <input
                      type="date"
                      value={filtroHistorialFechaDesde}
                      onChange={(e) => setFiltroHistorialFechaDesde(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* 4. Filtro Fecha Hasta */}
                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" /> Fecha Hasta
                    </label>
                    <input
                      type="date"
                      value={filtroHistorialFechaHasta}
                      onChange={(e) => setFiltroHistorialFechaHasta(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* 5. Filtro Tipo Comprobante */}
                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Tipo Doc.
                    </label>
                    <select
                      value={filtroHistorialTipo}
                      onChange={(e) => setFiltroHistorialTipo(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="TODOS">Todos los tipos</option>
                      <option value="01">Factura (01)</option>
                      <option value="07">Retención (07)</option>
                      <option value="04">Nota de Crédito (04)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* TABLA DE COMPROBANTES FILTRADOS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-white/[0.08]">
                    <tr>
                      <th className="px-5 py-4">Secuencia</th>
                      <th className="px-5 py-4">Cliente / Contratista</th>
                      <th className="px-5 py-4">Fecha Emisión</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Estado SRI</th>
                      <th className="px-5 py-4 text-right">Descargas Oficiales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {comprobantesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400 space-y-3">
                          <Search className="w-8 h-8 text-slate-600 mx-auto" />
                          <div className="font-bold text-white text-sm">
                            No se encontraron comprobantes que coincidan con los filtros aplicados.
                          </div>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Verifica el RUC ingresado, el rango de fechas o haz clic en limpiar filtros para ver todo el historial.
                          </p>
                          <button
                            onClick={limpiarFiltrosHistorial}
                            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
                          >
                            Limpiar Filtros
                          </button>
                        </td>
                      </tr>
                    ) : (
                      comprobantesFiltrados.map(c => (
                        <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>{c.numero}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {c.tipo === '01' ? 'Factura' : c.tipo === '07' ? 'Retención' : 'Comp.'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-200">{c.cliente}</div>
                            <div className="text-[11px] text-slate-500 font-mono">ID: {c.identificacion}</div>
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-mono">{c.fecha}</td>
                          <td className="px-5 py-4 font-mono font-bold text-amber-400 text-sm">
                            ${c.total.toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{c.estado}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleDescargarPdf(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-xs font-bold text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Descargar RIDE PDF Oficial"
                              >
                                <Download className="w-3.5 h-3.5" /> RIDE (PDF)
                              </button>
                              <button
                                onClick={() => handleDescargarXml(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Descargar XML Autorizado SRI"
                              >
                                <FileText className="w-3.5 h-3.5" /> XML
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              VISTA 4: BUZÓN & GASTOS DEDUCIBLES
              =================================================================== */}
          {activeTab === 'BUZON' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-white">Buzón de Compras Electrónicas & Deducción de Gastos</h3>
              <p className="text-xs text-slate-400">
                Facturas emitidas hacia tu RUC que aplican como crédito tributario y deducción de Impuesto a la Renta.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-1">
                  <div className="text-xs text-slate-400 font-bold uppercase">Materiales de Construcción</div>
                  <div className="font-mono text-2xl font-bold text-emerald-400">$ 450.00</div>
                  <div className="text-[11px] text-slate-500">Tarifa 5% IVA acreditado</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-1">
                  <div className="text-xs text-slate-400 font-bold uppercase">Alimentación & Viáticos Obra</div>
                  <div className="font-mono text-2xl font-bold text-blue-400">$ 180.00</div>
                  <div className="text-[11px] text-slate-500">Gasto 100% deducible</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-1">
                  <div className="text-xs text-slate-400 font-bold uppercase">Servicios Técnicos & Fletes</div>
                  <div className="font-mono text-2xl font-bold text-purple-400">$ 320.00</div>
                  <div className="text-[11px] text-slate-500">Retenciones practicadas</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300">Total Gastos Personales Deducibles Registrados:</span>
                <span className="font-mono text-lg font-black text-amber-400">$ 1,185.00 USD</span>
              </div>
            </div>
          )}

          {/* ===================================================================
              VISTA 5: CATÁLOGO DE CLIENTES Y RUBROS (INTERACTIVO - Requerimiento 1)
              =================================================================== */}
          {activeTab === 'CATALOGOS' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>Directorio de Clientes Frecuentes del Emisor</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Guarda los datos tributarios de tus clientes y contratistas para autocompletar la emisión en menos de 5 segundos.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setNuevoClienteModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Nuevo Cliente</span>
                  </button>
                </div>
              </div>

              {/* Barra de Búsqueda dentro del Catálogo */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={filtroCatalogoCliente}
                    onChange={(e) => setFiltroCatalogoCliente(e.target.value)}
                    placeholder="Buscar por RUC, Cédula, Razón Social o Ciudad..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>

                <span className="text-xs font-mono text-slate-400 self-center">
                  Total clientes registrados: <strong className="text-amber-400">{clientes.length}</strong>
                </span>
              </div>

              {/* Grid de Tarjetas de Clientes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientes
                  .filter(c => {
                    if (!filtroCatalogoCliente.trim()) return true;
                    const q = filtroCatalogoCliente.toLowerCase().trim();
                    return c.identificacion.includes(q) || c.razonSocial.toLowerCase().includes(q) || (c.direccion && c.direccion.toLowerCase().includes(q)) || (c.ciudad && c.ciudad.toLowerCase().includes(q));
                  })
                  .map(c => (
                    <div
                      key={c.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-white/[0.06] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-display font-extrabold text-sm text-white leading-snug">
                            {c.razonSocial}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            {c.tipoIdentificacion === '04' ? 'RUC (04)' : c.tipoIdentificacion === '05' ? 'CÉDULA (05)' : 'ID'}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-slate-300">
                          Identificación: <strong className="text-amber-400 font-bold">{c.identificacion}</strong>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="line-clamp-1">{c.direccion}</span>
                        </div>

                        {c.email && (
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="line-clamp-1 font-mono">{c.email}</span>
                          </div>
                        )}

                        {c.telefono && (
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-mono">{c.telefono}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                        <button
                          onClick={() => {
                            seleccionarCliente(c);
                            setActiveTab('EMITIR');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Emitir Factura</span>
                        </button>

                        <button
                          onClick={() => {
                            const actualizados = clientes.filter(item => item.id !== c.id);
                            setClientes(actualizados);
                            localStorage.setItem('sara_facturacion_clientes_catalogo', JSON.stringify(actualizados));
                            showToast(`Cliente "${c.razonSocial}" eliminado del catálogo.`);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* ===================================================================
              VISTA 6: BÓVEDA DE FIRMA ELECTRÓNICA (.p12)
              =================================================================== */}
          {activeTab === 'FIRMA' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Bóveda Cifrada de Firma Digital (.p12)</h3>
                  <p className="text-xs text-slate-400">Tu archivo criptográfico está protegido con cifrado AES-256 en servidores locales.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ESTADO: ACTIVA & SEGURA
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase">Titular:</span>
                    <strong className="text-white text-sm">{tenantInfo.razonSocial}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase">Entidad Emisora:</span>
                    <strong className="text-white text-sm">{tenantInfo.firmaEmisor}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase">Días Restantes:</span>
                    <strong className="text-emerald-400 text-sm font-mono">{tenantInfo.firmaVenceDias} días</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    ¿Deseas renovar tu certificado antes del vencimiento?
                  </span>
                  <button
                    onClick={() => abrirCheckoutPlan({ title: 'Renovación de Firma Electrónica .p12 (1 Año)', amount: 18.00, badgeText: 'Firma Digital SRI' })}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                  >
                    Renovar Firma ($18)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              VISTA 7: PLANES & RECARGAS (TODOS LOS PLANES CONFIGURADOS EN ADMIN - Requerimiento 4)
              =================================================================== */}
          {activeTab === 'PLANES' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Header con enlace directo al Módulo de Administración */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-white/[0.08] rounded-3xl p-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Sincronizado en Tiempo Real con Administración
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{planesDisponibles.length} planes disponibles</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Planes & Tarifas de Facturación Electrónica SRI
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Adquiere pases por tiempo ilimitado, bolsas prepago que nunca caducan o combos anuales con firma electrónica .p12 incluida.
                  </p>
                </div>

                <Link
                  href="/admin/facturacion/planes"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/[0.08] text-xs font-bold text-amber-400 flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
                  title="Configurar y editar planes en la vista de Administración"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Configurar Planes (Admin)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>

              {/* Pestañas de Filtro por Categoría */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'TODOS', label: `Todos los Planes (${planesDisponibles.length})` },
                  { id: 'tiempo', label: `Pases por Tiempo (${planesDisponibles.filter(p => p.tipo_plan === 'tiempo').length})` },
                  { id: 'bolsa', label: `Bolsas Prepago (${planesDisponibles.filter(p => p.tipo_plan === 'bolsa').length})` },
                  { id: 'suscripcion', label: `Suscripciones (${planesDisponibles.filter(p => p.tipo_plan === 'suscripcion').length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFiltroTipoPlan(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filtroTipoPlan === tab.id
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid de Todos los Planes Configurados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {planesDisponibles
                  .filter(p => p.activo && (filtroTipoPlan === 'TODOS' || p.tipo_plan === filtroTipoPlan))
                  .map(plan => {
                    const esPlanActivo = planContratado.codigo === plan.codigo;

                    return (
                      <div
                        key={plan.id}
                        className={`p-6 rounded-3xl bg-slate-900 border flex flex-col justify-between relative transition-all duration-300 ${
                          esPlanActivo
                            ? 'border-2 border-emerald-400 shadow-xl shadow-emerald-500/10'
                            : plan.es_destacado
                              ? 'border-2 border-amber-400 shadow-lg shadow-amber-500/10'
                              : 'border-white/[0.08] hover:border-white/[0.2]'
                        }`}
                      >
                        {/* Badges superiores */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            plan.es_destacado 
                              ? 'bg-amber-500 text-slate-950' 
                              : 'bg-white/[0.08] text-slate-300'
                          }`}>
                            {plan.badge || (plan.tipo_plan === 'bolsa' ? 'Sin Caducidad' : 'Plan SRI')}
                          </span>

                          {esPlanActivo && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" /> Plan Actual
                            </span>
                          )}
                        </div>

                        {/* Título y Descripción */}
                        <div className="space-y-2 mb-4">
                          <h4 className="text-lg font-bold text-white tracking-tight">
                            {plan.nombre}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                            {plan.descripcion}
                          </p>
                        </div>

                        {/* Precio y Periodo */}
                        <div className="py-4 border-y border-white/[0.06] my-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                              ${plan.precio_usd.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              USD {plan.periodo_texto ? plan.periodo_texto : (plan.tipo_plan === 'suscripcion' ? '/ mes' : 'pago único')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            {plan.tipo_plan === 'bolsa' 
                              ? `${plan.limite_documentos} comprobantes incluidos (Nunca caducan)`
                              : plan.duracion_dias > 0 
                                ? `Emisión ilimitada durante ${plan.duracion_dias} días continuos`
                                : 'Emisión ilimitada recurrente'}
                          </div>
                        </div>

                        {/* Lista de Beneficios */}
                        <ul className="space-y-2.5 my-4 text-xs text-slate-300 flex-1">
                          {plan.beneficios.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{b}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Botón de Contratación / Activación */}
                        <button
                          onClick={() => contratarPlan(plan)}
                          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            esPlanActivo
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                              : plan.es_destacado
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                                : 'bg-white/[0.08] hover:bg-amber-500 hover:text-slate-950 text-white'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>
                            {esPlanActivo 
                              ? `Recargar / Renovar ($${plan.precio_usd.toFixed(2)})` 
                              : `Contratar Plan ($${plan.precio_usd.toFixed(2)})`}
                          </span>
                        </button>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ===================================================================
              VISTA 8: DATOS DEL EMISOR SRI (INCREMENTADO CON TODOS LOS CAMPOS)
              =================================================================== */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Header de la Sección */}
              <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        SRI Ecuador 2026
                      </span>
                      <span className="text-xs text-slate-400">Puntos de Emisión 001-001</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Datos del Emisor & Establecimiento SRI
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      Actualiza y sincroniza tu identidad tributaria, domicilio fiscal y contacto para la emisión legal de comprobantes electrónicos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveDatosEmisor}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>

              {/* Formulario Completo de Datos del Emisor */}
              <form onSubmit={handleSaveDatosEmisor} className="space-y-8">
                
                {/* 1. IDENTIFICACIÓN DEL CONTRIBUYENTE */}
                <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      1. Identificación Legal & Tributaria
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Nombres del Emisor *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={tenantInfo.nombres || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, nombres: e.target.value })}
                        placeholder="Carlos Patricio"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Apellidos *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={tenantInfo.apellidos || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, apellidos: e.target.value })}
                        placeholder="Mendoza Andrade"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        RUC del Contribuyente (13 Dígitos) *
                      </label>
                      <input 
                        type="text" 
                        required
                        maxLength={13}
                        value={tenantInfo.ruc} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, ruc: e.target.value.replace(/\D/g, '') })}
                        placeholder="1792345678001"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] font-mono text-amber-400 font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Razón Social Completa *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={tenantInfo.razonSocial} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, razonSocial: e.target.value })}
                        placeholder="ING. CARLOS MENDOZA ARQUITECTURA & CONSTRUCCIÓN"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Nombre Comercial (Rótulo)
                      </label>
                      <input 
                        type="text" 
                        value={tenantInfo.nombreComercial || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, nombreComercial: e.target.value })}
                        placeholder="Mendoza Arquitectura & Obras"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Tipo de Contribuyente
                      </label>
                      <select
                        value={tenantInfo.tipoContribuyente || 'CONSTRUCCION'}
                        onChange={(e) => setTenantInfo({ ...tenantInfo, tipoContribuyente: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="PROFESIONAL">Persona Natural / Profesional</option>
                        <option value="CONSTRUCCION">Contratista / Obras Civiles</option>
                        <option value="PYME">Comercio / PYME</option>
                        <option value="EMPRESA">Compañía S.A. / Cía. Ltda.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Régimen Tributario SRI
                      </label>
                      <select
                        value={tenantInfo.regimen || 'Régimen RIMPE - Negocio Emprendedor'}
                        onChange={(e) => setTenantInfo({ ...tenantInfo, regimen: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Régimen General">Régimen General</option>
                        <option value="Régimen RIMPE - Negocio Emprendedor">Régimen RIMPE - Negocio Emprendedor</option>
                        <option value="Régimen RIMPE - Negocio Popular">Régimen RIMPE - Negocio Popular</option>
                        <option value="Contribuyente Especial">Contribuyente Especial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Obligado a Llevar Contabilidad
                      </label>
                      <select
                        value={tenantInfo.obligadoContabilidad || 'NO'}
                        onChange={(e) => setTenantInfo({ ...tenantInfo, obligadoContabilidad: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="NO">NO (Persona Natural / RIMPE)</option>
                        <option value="SI">SÍ (Sociedad / Contabilidad Legal)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. DIRECCIÓN Y DOMICILIO TRIBUTARIO */}
                <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      2. Dirección del Domicilio Tributario / Matriz
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Provincia *
                      </label>
                      <select
                        value={tenantInfo.provincia || 'Pichincha'}
                        onChange={(e) => {
                          const prov = e.target.value;
                          const cantones = PROVINCIAS_CANTONES_ECUADOR[prov] || ['Quito'];
                          setTenantInfo({ 
                            ...tenantInfo, 
                            provincia: prov, 
                            ciudad: cantones[0] 
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {Object.keys(PROVINCIAS_CANTONES_ECUADOR).map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Ciudad / Cantón *
                      </label>
                      <select
                        value={tenantInfo.ciudad || 'Quito'}
                        onChange={(e) => setTenantInfo({ ...tenantInfo, ciudad: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {(PROVINCIAS_CANTONES_ECUADOR[tenantInfo.provincia] || ['Quito']).map(cant => (
                          <option key={cant} value={cant}>{cant}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Referencia o Piso / Oficina
                      </label>
                      <input 
                        type="text" 
                        value={tenantInfo.referencia || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, referencia: e.target.value })}
                        placeholder="Edificio Platinum Plaza, Piso 4, Oficina 402"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Calles (Calle Principal y Secundaria / Numeración) *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={tenantInfo.calles || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, calles: e.target.value })}
                        placeholder="Av. República de El Salvador N36-84 y Naciones Unidas"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* 3. CONTACTO Y NOTIFICACIONES */}
                <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      3. Información de Contacto & Notificaciones SRI
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Teléfono Celular / WhatsApp *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={tenantInfo.contacto || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, contacto: e.target.value })}
                        placeholder="+593 99 876 5432"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] font-mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Teléfono Fijo Convencional
                      </label>
                      <input 
                        type="text" 
                        value={tenantInfo.telefonoFijo || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, telefonoFijo: e.target.value })}
                        placeholder="02 245 8900"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] font-mono text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Correo Electrónico Principal (Notificaciones SRI & Clientes) *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={tenantInfo.email} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, email: e.target.value })}
                        placeholder="carlos.mendoza@mendozaconstr.ec"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Correo Electrónico Copia / Contador
                      </label>
                      <input 
                        type="email" 
                        value={tenantInfo.emailContador || ''} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, emailContador: e.target.value })}
                        placeholder="contabilidad@mendozaconstr.ec"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* 4. CONFIGURACIÓN TÉCNICA DEL ESTABLECIMIENTO Y PUNTOS DE EMISIÓN */}
                <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                    <Settings className="w-5 h-5 text-purple-400" />
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      4. Puntos de Emisión & Configuración SRI
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Establecimiento
                      </label>
                      <input 
                        type="text" 
                        value={tenantInfo.establecimiento || '001'} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, establecimiento: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] font-mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Punto de Emisión
                      </label>
                      <input 
                        type="text" 
                        value={tenantInfo.puntoEmision || '001'} 
                        onChange={(e) => setTenantInfo({ ...tenantInfo, puntoEmision: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] font-mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Ambiente SRI
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        value={tenantInfo.ambiente} 
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-emerald-400 font-bold" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase font-bold tracking-wider mb-1.5">
                        Firma Digital .p12
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        value={`${tenantInfo.firmaEmisor} (${tenantInfo.firmaVenceDias} días)`} 
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-slate-300 font-mono" 
                      />
                    </div>
                  </div>
                </div>

                {/* BOTÓN INFERIOR DE GUARDADO */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
                  <p className="text-xs text-slate-500">
                    Los cambios guardados se aplicarán de inmediato a los nuevos XML emitidos y al membrete de las facturas RIDE PDF.
                  </p>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab('DASHBOARD')}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Volver al Dashboard
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Datos del Emisor</span>
                    </button>
                  </div>
                </div>

              </form>

            </div>
          )}

        </main>

      </div>

      {/* MODAL CREAR NUEVO CLIENTE (Requerimiento 1) */}
      {nuevoClienteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Registrar Cliente Frecuente</h3>
                  <p className="text-xs text-slate-400">Directorio de Emisión Rápida SRI</p>
                </div>
              </div>
              <button 
                onClick={() => setNuevoClienteModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!nuevoClienteData.identificacion || !nuevoClienteData.razonSocial) {
                  showToast('Por favor completa la identificación y la razón social.');
                  return;
                }
                const nuevo: ClienteEmisor = {
                  id: `cli-${Date.now()}`,
                  tipoIdentificacion: (nuevoClienteData.tipoIdentificacion || '04') as any,
                  identificacion: nuevoClienteData.identificacion,
                  razonSocial: nuevoClienteData.razonSocial,
                  direccion: nuevoClienteData.direccion || 'Ecuador',
                  email: nuevoClienteData.email || '',
                  telefono: nuevoClienteData.telefono || '',
                  ciudad: nuevoClienteData.ciudad || 'Quito',
                  esFrecuente: true
                };
                const actualizados = [nuevo, ...clientes];
                setClientes(actualizados);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('sara_facturacion_clientes_catalogo', JSON.stringify(actualizados));
                }
                setNuevoClienteModalOpen(false);
                setNuevoClienteData({
                  tipoIdentificacion: '04',
                  identificacion: '',
                  razonSocial: '',
                  direccion: '',
                  email: '',
                  telefono: '',
                  ciudad: 'Quito'
                });
                showToast(`¡Cliente "${nuevo.razonSocial}" guardado con éxito!`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Tipo Identificación *</label>
                  <select
                    value={nuevoClienteData.tipoIdentificacion}
                    onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, tipoIdentificacion: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  >
                    <option value="04">RUC (04)</option>
                    <option value="05">Cédula (05)</option>
                    <option value="06">Pasaporte (06)</option>
                    <option value="07">Consumidor Final (07)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Número ID (RUC / Cédula) *</label>
                  <input
                    type="text"
                    required
                    value={nuevoClienteData.identificacion}
                    onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, identificacion: e.target.value.trim() })}
                    placeholder="1102978630001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Razón Social o Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nuevoClienteData.razonSocial}
                  onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, razonSocial: e.target.value })}
                  placeholder="CONSTRUCTORA BETANCOURT & ASOCIADOS CÍA. LTDA."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Dirección Fiscal / Obra *</label>
                <input
                  type="text"
                  required
                  value={nuevoClienteData.direccion}
                  onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, direccion: e.target.value })}
                  placeholder="Av. Cuxibamba y Manuel Agustín Aguirre, Loja"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Correo Electrónico (Para envío RIDE/XML)</label>
                  <input
                    type="email"
                    value={nuevoClienteData.email}
                    onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, email: e.target.value })}
                    placeholder="contacto@constructora.ec"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={nuevoClienteData.telefono}
                    onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, telefono: e.target.value })}
                    placeholder="0998765432"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNuevoClienteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase cursor-pointer shadow-md"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PROCESAMIENTO INMEDIATO EN TIEMPO REAL AL SRI */}
      {emisionLoading && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-7 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center animate-bounce">
              <Send className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-display text-lg font-black text-white">Transmisión Inmediata en Línea SRI</h4>
              <p className="text-xs text-slate-400 mt-1">Conforme al Art. 314 y 318 del Código Tributario (Cero Sanciones)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-mono font-bold text-amber-400 min-h-[44px] flex items-center justify-center">
              {emisionStep || 'Procesando comprobante...'}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-full animate-pulse"></div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Entorno Seguro XAdES-BES · soap.sri.gob.ec · Web Service Oficial
            </p>
          </div>
        </div>
      )}

    </div>
  );
}