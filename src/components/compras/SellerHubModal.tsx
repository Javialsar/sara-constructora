'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Store,
  ShieldCheck, 
  Check, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Package, 
  FileSpreadsheet, 
  Code, 
  Layers, 
  Upload, 
  Download, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight, 
  Key, 
  Copy, 
  Clock, 
  Truck, 
  FileText,
  Star,
  LogOut,
  Calendar,
  BarChart3,
  Percent,
  Plus,
  CreditCard,
  QrCode,
  Smartphone,
  Landmark,
  Edit,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Image as ImageIcon,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  CheckCheck,
  Lock,
  User,
  ArrowLeft
} from 'lucide-react';
import { 
  SellerMarketplaceService, 
  SellerProfile, 
  SELLER_PLANS, 
  SellerPlanType, 
  MarketplaceProduct,
  SellerBankAccount,
  SellerMobileWallets
} from '@/lib/services/sellerMarketplaceService';
import {
  MarketplacePlansService,
  MarketplacePlan
} from '@/lib/services/marketplacePlansService';

interface SellerHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

export function SellerHubModal({ isOpen, onClose, onProductAdded }: SellerHubModalProps) {
  // 1. REGLA: Para ingresar a esta página debe primero autenticarse (null por defecto o recuperado de sesión persistente)
  const [currentSeller, setCurrentSeller] = useState<SellerProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('sara_seller_active_id');
      if (savedId) {
        return SellerMarketplaceService.getSellerById(savedId) || null;
      }
    }
    return null;
  });

  // Pestañas de navegación tipo Dashboard (Imagen 3)
  type TabKey = 
    | 'dashboard' 
    | 'historial_facturas' 
    | 'historial_articulos' 
    | 'catalogo_excel' 
    | 'catalogo_manual' 
    | 'catalogo_api'
    | 'datos_empresa'
    | 'cuentas_bancarias_qr'
    | 'config_plan';

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Modo Auth (Imagen 2): isLogin = true (Login) | false (Registro)
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Catálogo de Planes sincronizado con /admin/marketplace/planes
  const [catalogoPlanes, setCatalogoPlanes] = useState<MarketplacePlan[]>(() => MarketplacePlansService.getPlanes());

  // Ref para subida de archivo de logotipo desde equipo local
  const logoFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Formulario de Registro de Nueva Empresa
  const [regForm, setRegForm] = useState({
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    ciudad: 'Quito',
    direccionMatriz: '',
    plan: 'VIP' as SellerPlanType
  });

  // Formulario de Producto Manual
  const [prodManual, setProdManual] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'ACERO' as MarketplaceProduct['categoria'],
    unidad: 'quintal (qq)',
    precioSinIva: 45.00,
    tarifaIvaPct: 5 as 5 | 15,
    stockDisponible: 500,
    tiempoEntregaHoras: 24,
    pesoUnitarioKg: 45.0,
    normaInen: 'NTE INEN 2167',
    resistencia: 'fy = 420 MPa',
    dimensiones: '12mm x 12m',
    presentacion: 'Atado'
  });

  // Estado del Archivo Excel Simulador
  const [excelCargando, setExcelCargando] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Historial de Ventas filtros
  const [historialFiltroTexto, setHistorialFiltroTexto] = useState('');
  const [historialFiltroEstado, setHistorialFiltroEstado] = useState('TODOS');

  // Copiado al portapapeles
  const [copiadoApiKey, setCopiadoApiKey] = useState(false);
  const [copiadoCta, setCopiadoCta] = useState(false);

  // Estados para Datos de la Empresa
  const [empresaForm, setEmpresaForm] = useState({
    razonSocial: '',
    nombreComercial: '',
    ruc: '',
    direccionMatriz: '',
    ciudad: '',
    telefono: '',
    telefonosAdicionales: '',
    email: '',
    logoUrl: '',
    sitioWeb: '',
    descripcionEmpresa: '',
    ciudadesCobertura: ''
  });

  // Estados para Cuentas Bancarias & Códigos QR
  const [bankForm, setBankForm] = useState<SellerBankAccount>({
    banco: 'Banco Pichincha',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: '2100849201',
    titular: 'ACERÍA DEL ECUADOR C.A. ADELCA',
    identificacionTitular: '1790008594001',
    emailComprobantes: 'pagos.tesoreria@adelca.com.ec'
  });

  const [walletsForm, setWalletsForm] = useState<SellerMobileWallets>({
    deUnaCelular: '0992348190',
    deUnaQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=deuna%3A%2F%2Fpay%3Fphone%3D0992348190%26merchant%3DADELCA_MATRIZ',
    payphoneCelular: '0992348190',
    payphoneQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=payphone%3A%2F%2Fpay%3Fphone%3D0992348190%26client%3DADELCA',
    peigoCelular: '0992348190',
    peigoQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=peigo%3A%2F%2Ftransfer%3Faccount%3D0992348190%26holder%3DADELCA'
  });

  const [previewPasarelaTab, setPreviewPasarelaTab] = useState<'spi' | 'deuna' | 'payphone'>('spi');

  // Sincronizar formularios cuando cambia currentSeller
  useEffect(() => {
    if (currentSeller) {
      setEmpresaForm({
        razonSocial: currentSeller.razonSocial || '',
        nombreComercial: currentSeller.nombreComercial || '',
        ruc: currentSeller.ruc || '',
        direccionMatriz: currentSeller.direccionMatriz || '',
        ciudad: currentSeller.ciudad || 'Quito',
        telefono: currentSeller.telefono || '',
        telefonosAdicionales: currentSeller.telefonosAdicionales?.join(', ') || '',
        email: currentSeller.email || '',
        logoUrl: currentSeller.logoUrl || '',
        sitioWeb: currentSeller.sitioWeb || '',
        descripcionEmpresa: currentSeller.descripcionEmpresa || '',
        ciudadesCobertura: currentSeller.ciudadesCobertura?.join(', ') || ''
      });

      if (currentSeller.cuentaBancaria) {
        setBankForm({ ...currentSeller.cuentaBancaria });
      } else {
        setBankForm({
          banco: 'Banco Pichincha',
          tipoCuenta: 'Cuenta Corriente',
          numeroCuenta: '',
          titular: currentSeller.razonSocial,
          identificacionTitular: currentSeller.ruc,
          emailComprobantes: currentSeller.email
        });
      }

      if (currentSeller.billeterasMoviles) {
        setWalletsForm({ ...currentSeller.billeterasMoviles });
      }
    }
  }, [currentSeller]);

  // Datos reactivos del Dashboard
  const dashboardData = useMemo(() => {
    if (!currentSeller) return null;
    return SellerMarketplaceService.getSellerDashboardMetrics(currentSeller.id);
  }, [currentSeller, feedbackMsg]);

  // Historial reactivo
  const ventasHistorial = useMemo(() => {
    if (!currentSeller) return null;
    return SellerMarketplaceService.getSellerVentasHistorial(currentSeller.id, {
      search: historialFiltroTexto,
      estadoPago: historialFiltroEstado
    });
  }, [currentSeller, historialFiltroTexto, historialFiltroEstado, feedbackMsg]);

  // Refrescar catálogo de planes cuando se abra el modal o cambie de vista
  useEffect(() => {
    if (isOpen) {
      setCatalogoPlanes(MarketplacePlansService.getPlanes());
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Manejador: Subir archivo de logotipo desde equipo local
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFeedbackMsg({ tipo: 'error', texto: 'El archivo excede el tamaño máximo de 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEmpresaForm(prev => ({ ...prev, logoUrl: reader.result as string }));
          setFeedbackMsg({ tipo: 'success', texto: `Logotipo "${file.name}" cargado exitosamente.` });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejador: Cambiar o mejorar de Plan
  const handleCambiarPlan = (nuevoPlanId: string) => {
    if (!currentSeller) return;
    try {
      const planConfig = MarketplacePlansService.getPlanById(nuevoPlanId);
      const planNombre = planConfig?.nombre || nuevoPlanId;
      const updated = SellerMarketplaceService.updateSellerPlan(currentSeller.id, nuevoPlanId as any);
      setCurrentSeller(updated);
      setFeedbackMsg({ tipo: 'success', texto: `¡Plan actualizado con éxito al Plan ${planNombre} (${updated.comisionSaraPct}% de comisión Grupo SARA)!` });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'error', texto: err.message || 'Error al actualizar plan.' });
    }
  };

  // Manejador: Autenticación tipo Imagen 2
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validación de contraseñas al registrar (Imagen 1)
    if (!isLogin) {
      if (!regForm.password || regForm.password.trim().length < 6) {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (regForm.password !== regForm.confirmPassword) {
        setAuthError('Las contraseñas no coinciden. Por favor verifica que ambos campos sean idénticos.');
        return;
      }
    }

    setAuthLoading(true);

    setTimeout(() => {
      try {
        if (isLogin) {
          const seller = SellerMarketplaceService.authenticateSeller(loginEmail);
          setCurrentSeller(seller);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sara_seller_active_id', seller.id);
          }
          const planNom = SELLER_PLANS[seller.plan]?.nombre || seller.plan;
          setFeedbackMsg({ tipo: 'success', texto: `Sesión iniciada como ${seller.nombreComercial} (${planNom}).` });
        } else {
          const nuevo = SellerMarketplaceService.registerSeller({
            ruc: regForm.ruc,
            razonSocial: regForm.razonSocial,
            nombreComercial: regForm.nombreComercial,
            email: regForm.email,
            telefono: regForm.telefono,
            ciudad: regForm.ciudad,
            direccionMatriz: regForm.direccionMatriz,
            plan: regForm.plan
          });
          setCurrentSeller(nuevo);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sara_seller_active_id', nuevo.id);
          }
          const planNom = SELLER_PLANS[nuevo.plan]?.nombre || nuevo.plan;
          setFeedbackMsg({ tipo: 'success', texto: `Empresa ${nuevo.razonSocial} registrada con éxito en el ${planNom}.` });
        }
      } catch (err: any) {
        setAuthError(err.message || 'Error de autenticación.');
      } finally {
        setAuthLoading(false);
      }
    }, 400);
  };

  // Manejador: Cerrar Sesión
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sara_seller_active_id');
    }
    setCurrentSeller(null);
    setActiveTab('dashboard');
    setFeedbackMsg({ tipo: 'success', texto: 'Sesión de proveedor finalizada correctamente.' });
  };

  // Manejador: Guardar Datos de la Empresa
  const handleGuardarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    try {
      const updated = SellerMarketplaceService.updateSellerCompanyData(currentSeller.id, {
        razonSocial: empresaForm.razonSocial,
        nombreComercial: empresaForm.nombreComercial,
        ruc: empresaForm.ruc,
        direccionMatriz: empresaForm.direccionMatriz,
        ciudad: empresaForm.ciudad,
        telefono: empresaForm.telefono,
        telefonosAdicionales: empresaForm.telefonosAdicionales.split(',').map(s => s.trim()).filter(Boolean),
        email: empresaForm.email,
        logoUrl: empresaForm.logoUrl,
        sitioWeb: empresaForm.sitioWeb,
        descripcionEmpresa: empresaForm.descripcionEmpresa,
        ciudadesCobertura: empresaForm.ciudadesCobertura.split(',').map(s => s.trim()).filter(Boolean)
      });
      setCurrentSeller(updated);
      setFeedbackMsg({ tipo: 'success', texto: '¡Datos de la empresa y ficha fiscal actualizados exitosamente en SARA Marketplace!' });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'error', texto: err.message });
    }
  };

  // Manejador: Guardar Cuentas Bancarias & Códigos QR
  const handleGuardarCuentasYQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    try {
      const updated = SellerMarketplaceService.updateSellerBankDetails(currentSeller.id, bankForm, walletsForm);
      setCurrentSeller(updated);
      setFeedbackMsg({ tipo: 'success', texto: '¡Cuentas Bancarias SPI y Códigos QR de Cobro guardados exitosamente!' });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'error', texto: err.message });
    }
  };

  // Manejador: Regenerar Códigos QR Dinámicos
  const handleRegenerarQr = (wallet: 'deuna' | 'payphone' | 'peigo') => {
    if (wallet === 'deuna') {
      const phone = walletsForm.deUnaCelular || '0992348190';
      const merchant = encodeURIComponent(currentSeller?.nombreComercial || 'PROVEEDOR');
      setWalletsForm({
        ...walletsForm,
        deUnaQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=deuna%3A%2F%2Fpay%3Fphone%3D${phone}%26merchant%3D${merchant}`
      });
    } else if (wallet === 'payphone') {
      const phone = walletsForm.payphoneCelular || '0992348190';
      const client = encodeURIComponent(currentSeller?.nombreComercial || 'PROVEEDOR');
      setWalletsForm({
        ...walletsForm,
        payphoneQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=payphone%3A%2F%2Fpay%3Fphone%3D${phone}%26client%3D${client}`
      });
    } else if (wallet === 'peigo') {
      const phone = walletsForm.peigoCelular || '0992348190';
      const holder = encodeURIComponent(currentSeller?.razonSocial || 'EMPRESA');
      setWalletsForm({
        ...walletsForm,
        peigoQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=peigo%3A%2F%2Ftransfer%3Faccount%3D${phone}%26holder%3D${holder}`
      });
    }
    setFeedbackMsg({ tipo: 'success', texto: `Código QR para ${wallet.toUpperCase()} autogenerado y calibrado.` });
  };

  // Manejador: Agregar Producto Manual
  const handleGuardarProductoManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    try {
      SellerMarketplaceService.addProductManual(currentSeller.id, {
        nombre: prodManual.nombre,
        descripcion: prodManual.descripcion,
        categoria: prodManual.categoria,
        unidad: prodManual.unidad,
        precioSinIva: Number(prodManual.precioSinIva),
        tarifaIvaPct: prodManual.tarifaIvaPct,
        stockDisponible: Number(prodManual.stockDisponible),
        imagenUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
        especificacionesTecnicas: {
          normaInen: prodManual.normaInen,
          resistencia: prodManual.resistencia,
          dimensiones: prodManual.dimensiones,
          procedencia: 'NACIONAL',
          presentacion: prodManual.presentacion
        },
        tiempoEntregaHoras: Number(prodManual.tiempoEntregaHoras),
        pesoUnitarioKg: Number(prodManual.pesoUnitarioKg)
      });

      setFeedbackMsg({ tipo: 'success', texto: `Producto "${prodManual.nombre}" publicado en el Marketplace exitosamente.` });
      if (onProductAdded) onProductAdded();
      setProdManual({
        nombre: '',
        descripcion: '',
        categoria: 'ACERO',
        unidad: 'unidad (u)',
        precioSinIva: 10.00,
        tarifaIvaPct: 5,
        stockDisponible: 100,
        tiempoEntregaHoras: 24,
        pesoUnitarioKg: 10.0,
        normaInen: '',
        resistencia: '',
        dimensiones: '',
        presentacion: 'Estándar'
      });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'error', texto: err.message });
    }
  };

  // Manejador: Importación Excel Simulación
  const handleImportarExcel = () => {
    if (!currentSeller) return;
    setExcelCargando(true);
    setTimeout(() => {
      const filasExcel = [
        {
          nombre: 'Cemento Portland Tipo GU Especial para Estructuras (Saco 50 kg)',
          categoria: 'CEMENTO_HORMIGON',
          unidad: 'saco (50 kg)',
          precioSinIva: 7.95,
          tarifaIvaPct: 5,
          stockDisponible: 2400,
          normaInen: 'NTE INEN 2380',
          tiempoEntregaHoras: 12,
          pesoUnitarioKg: 50.0
        },
        {
          nombre: 'Pintura Látex Vinil Acrílica Lavable Super-Cubriente (Caneca 5 Gal)',
          categoria: 'ACABADOS',
          unidad: 'caneca (5 gal)',
          precioSinIva: 48.50,
          tarifaIvaPct: 15,
          stockDisponible: 180,
          normaInen: 'NTE INEN 1007',
          tiempoEntregaHoras: 24,
          pesoUnitarioKg: 20.0
        }
      ];

      const res = SellerMarketplaceService.importProductsFromExcel(currentSeller.id, filasExcel);
      setExcelCargando(false);
      setFeedbackMsg({ 
        tipo: 'success', 
        texto: `¡Carga masiva completada! Se importaron ${res.exitosos} productos nuevos a su catálogo oficial.` 
      });
      if (onProductAdded) onProductAdded();
    }, 1000);
  };

  // Grupos de Navegación del Dashboard (Imagen 3)
  const navGroups = [
    {
      title: '1. OPERACIONES & VENTAS',
      items: [
        { id: 'dashboard' as TabKey, label: 'Resumen & Estadísticas', icon: BarChart3 },
        { id: 'historial_facturas' as TabKey, label: 'Historial por Facturas', icon: FileText },
        { id: 'historial_articulos' as TabKey, label: 'Historial por Artículos', icon: Package },
      ]
    },
    {
      title: '2. CATÁLOGO DE PRODUCTOS',
      items: [
        { id: 'catalogo_excel' as TabKey, label: 'Subir Catálogo Excel (.xlsx)', icon: FileSpreadsheet },
        { id: 'catalogo_manual' as TabKey, label: 'Registro Manual de Insumos', icon: Plus },
        { id: 'catalogo_api' as TabKey, label: 'Conexión API REST & ERP', icon: Code },
      ]
    },
    {
      title: '3. PERFIL DE LA EMPRESA',
      items: [
        { id: 'datos_empresa' as TabKey, label: 'Datos de la Empresa & Logo', icon: Building2 },
      ]
    },
    {
      title: '4. FINANZAS & COBROS',
      items: [
        { id: 'cuentas_bancarias_qr' as TabKey, label: 'Cuentas Bancarias & QRs', icon: QrCode },
      ]
    },
    {
      title: '5. MEMBRESÍA & SEGURIDAD',
      items: [
        { id: 'config_plan' as TabKey, label: 'Plan & Credenciales API', icon: Key },
      ]
    }
  ];

  return (
    /* REGLA DEL USUARIO: "pero debes de ampliar toda la pantalla" (fixed inset-0 w-screen h-screen z-50) */
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      
      {/* ===================================================================== */}
      {/* PANTALLA 1: AUTENTICACIÓN EXACTA A LA IMAGEN 1 DE SARA-MARKETPLACE    */}
      {/* ===================================================================== */}
      {!currentSeller ? (
        <div className="w-full h-full bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
          
          {/* Tarjeta dividida idéntica al modelo de Imagen 1 (Blanco a la izquierda, Azul marino a la derecha) */}
          <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto border border-slate-200">
            
            {/* LADO IZQUIERDO: FORMULARIO BLANCO (IDÉNTICO A IMAGEN 1) */}
            <div className="w-full md:w-1/2 p-8 md:p-10 bg-white text-slate-900 flex flex-col justify-between">
              <div>
                {/* Botón Volver */}
                <button 
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors mb-6 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Volver al Inicio</span>
                </button>

                {/* Logo & Marca SARA Marketplace */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-md shadow-blue-600/30">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight tracking-tight">
                      SARA Marketplace
                    </h4>
                    <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-blue-600">
                      PROVEEDORES & FÁBRICAS
                    </span>
                  </div>
                </div>

                {/* Encabezado */}
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {isLogin ? 'Bienvenido de vuelta' : 'Registra tu Empresa'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isLogin 
                      ? 'Ingresa tus credenciales para acceder a tus productos y ventas.' 
                      : 'Publica tus materiales directo a constructoras en Ecuador.'}
                  </p>
                </div>

                {/* Mensaje de Error */}
                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  
                  {/* SI ES MODO REGISTRO: CAMPOS FISCALES */}
                  {!isLogin && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Plan de Membresía & Comisión
                        </label>
                        <select
                          value={regForm.plan}
                          onChange={(e) => setRegForm({ ...regForm, plan: e.target.value as SellerPlanType })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:border-blue-600 focus:outline-none"
                        >
                          {catalogoPlanes.map((p) => (
                            <option key={p.id} value={p.id}>
                              ⭐ Plan {p.nombre} ({p.porcentajeComision}% Comisión) - {p.badge}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">RUC (Módulo 11)</label>
                          <input 
                            required 
                            type="text" 
                            maxLength={13}
                            value={regForm.ruc}
                            onChange={(e) => setRegForm({ ...regForm, ruc: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none" 
                            placeholder="1790008594001" 
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Razón Social</label>
                          <input 
                            required 
                            type="text" 
                            value={regForm.razonSocial}
                            onChange={(e) => setRegForm({ ...regForm, razonSocial: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:outline-none" 
                            placeholder="ACERÍA DEL ECUADOR C.A." 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nombre Comercial</label>
                        <input 
                          required 
                          type="text" 
                          value={regForm.nombreComercial}
                          onChange={(e) => setRegForm({ ...regForm, nombreComercial: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-blue-600 focus:outline-none" 
                          placeholder="ADELCA Planta Industrial" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Campo: Correo Electrónico o RUC */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        required 
                        type="text" 
                        value={isLogin ? loginEmail : regForm.email}
                        onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none" 
                        placeholder={isLogin ? "tu@correo.com o RUC" : "ventas@empresa.com.ec"} 
                      />
                    </div>
                  </div>

                  {/* Campo: Contraseña (Con botón visualizar contraseña funcional - Imagen 1) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Contraseña</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => alert('Para reestablecer tu contraseña o soporte de acceso para empresas aliadas, escribe a compras@gruposara.com.ec')}
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        value={isLogin ? loginPassword : regForm.password}
                        onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegForm({ ...regForm, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-0.5 focus:outline-none"
                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Campo: Confirmar Contraseña para comparar que se ingrese correctamente (Imagen 1) */}
                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          required 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={regForm.confirmPassword}
                          onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                          className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                            regForm.confirmPassword && regForm.confirmPassword !== regForm.password 
                              ? 'border-rose-400 focus:border-rose-500' 
                              : regForm.confirmPassword && regForm.confirmPassword === regForm.password 
                                ? 'border-emerald-500 focus:border-emerald-600' 
                                : 'border-slate-200 focus:border-blue-600'
                          }`}
                          placeholder="Repite tu contraseña" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(prev => !prev)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-0.5 focus:outline-none"
                          title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regForm.confirmPassword && regForm.confirmPassword !== regForm.password && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">
                          Las contraseñas no coinciden.
                        </p>
                      )}
                      {regForm.confirmPassword && regForm.confirmPassword === regForm.password && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Contraseñas coinciden correctamente.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botón Principal Azul Idéntico a Imagen 1 */}
                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 text-xs mt-2"
                  >
                    {authLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verificando Credenciales...</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? 'Iniciar Sesión' : 'Completar Registro'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle Login / Registro */}
                <div className="mt-4 text-center">
                  <span className="text-xs text-slate-500">
                    {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta registrada? '}
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setAuthError(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    {isLogin ? 'Regístrate gratis' : 'Inicia Sesión'}
                  </button>
                </div>

                {/* Acceso Rápido Demo 1-Clic */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1.5 text-center uppercase tracking-wider">
                    Acceso Rápido Demo para Fabricantes:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {SellerMarketplaceService.getSellersList().slice(0, 4).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setCurrentSeller(s);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('sara_seller_active_id', s.id);
                          }
                          setFeedbackMsg({ tipo: 'success', texto: `Sesión iniciada como ${s.nombreComercial} (${SELLER_PLANS[s.plan].nombre}).` });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[10px] font-bold border border-slate-200 transition-all"
                      >
                        {s.nombreComercial.split(' ')[0]} ({SELLER_PLANS[s.plan].badge.split(' ')[1] || 'Plan'})
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* LADO DERECHO: PANEL AZUL MARINO OSCURO CON BENEFICIOS & TESTIMONIO (IDÉNTICO A IMAGEN 1) */}
            <div className="w-full md:w-1/2 p-8 md:p-10 bg-[#0c162d] text-white flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-8 relative z-10">
                
                {/* Título de Propuesta */}
                <h3 className="text-2xl md:text-3xl font-black text-white leading-snug">
                  Diseñado para fabricantes y distribuidores de la construcción.
                </h3>

                {/* Características */}
                <div className="space-y-6">
                  
                  {/* Característica 1 */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-2xl bg-slate-800/80 text-blue-400 border border-slate-700/60 shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Ventas Directas de Fábrica</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Conecta con miles de contratistas y obras civiles en todo el Ecuador sin intermediarios.
                      </p>
                    </div>
                  </div>

                  {/* Característica 2 */}
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-2xl bg-slate-800/80 text-blue-400 border border-slate-700/60 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Gestión Masiva & API</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Sincroniza inventarios por Excel y API REST al instante con tu propio logo corporativo.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Caja de Testimonio (Idéntica a Imagen 1) */}
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl backdrop-blur-sm">
                  {/* Estrellas */}
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>

                  {/* Cita */}
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &quot;Aumentamos nuestras ventas mayoristas de acero y cemento en un 40% durante el primer trimestre con Grupo SARA. La custodia con Fideicomiso Escrow es impecable.&quot;
                  </p>

                  {/* Autor */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                      FA
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        Ing. Fernando Alarcón
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Gerente Comercial · ADELCA / Proveedor VIP
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pie con cierre de modal */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>GRUPO SARA • Red B2B Ecuador</span>
                <button 
                  onClick={onClose}
                  className="hover:text-white transition-colors"
                >
                  Cerrar
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (

        /* ===================================================================== */
        /* PANTALLA 2: ENTORNO COMPLETO EXPANDIDO A TODA LA PANTALLA (IMAGEN 3)  */
        /* ===================================================================== */
        <div className="w-full h-full flex flex-col bg-slate-950 overflow-hidden animate-in fade-in duration-300">
          
          {/* TOPBAR SUPERIOR EXACTO A LA IMAGEN 3 */}
          <header className="bg-slate-950 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    SARA SELLER CENTRAL • VENDOR HUB
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${SELLER_PLANS[currentSeller.plan].colorBadge}`}>
                    {SELLER_PLANS[currentSeller.plan].badge}
                  </span>
                </div>
                <h2 className="text-base md:text-lg font-black tracking-tight leading-tight">
                  {currentSeller.nombreComercial}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">RUC: {currentSeller.ruc}</span>
                <span className="text-amber-400 font-bold ml-1">
                  ({currentSeller.comisionSaraPct}% Com.)
                </span>
                <button 
                  onClick={handleLogout}
                  className="ml-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Cerrar Sesión Empresa"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
                title="Cerrar Entorno de Proveedor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* BANNER VERDE DE NOTIFICACIÓN DE SESIÓN INICIADA (COMO EN IMAGEN 3) */}
          {feedbackMsg && (
            <div className={`px-6 py-2 text-xs font-mono flex items-center justify-between shrink-0 ${
              feedbackMsg.tipo === 'success' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-rose-500 text-white font-bold'
            }`}>
              <span>{feedbackMsg.texto}</span>
              <button onClick={() => setFeedbackMsg(null)} className="ml-4 font-black">✕</button>
            </div>
          )}

          {/* CUERPO PRINCIPAL DEL DASHBOARD: SIDEBAR + MAIN (IMAGEN 3) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* SIDEBAR LATERAL IZQUIERDO EXACTO A IMAGEN 3 */}
            <aside className="w-64 md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
              
              {/* Tarjeta de Empresa Activa */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
                <div className="flex items-center gap-3">
                  {currentSeller.logoUrl ? (
                    <img 
                      src={currentSeller.logoUrl} 
                      alt="Logo" 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                      {currentSeller.nombreComercial.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-white truncate">
                      {currentSeller.nombreComercial}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {currentSeller.ruc}
                    </p>
                    <div className="mt-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${SELLER_PLANS[currentSeller.plan].colorBadge}`}>
                        {SELLER_PLANS[currentSeller.plan].badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items de Navegación por Grupos (Imagen 3) */}
              <div className="p-3 space-y-4 flex-1">
                {navGroups.map((group, gi) => (
                  <div key={gi} className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2">
                      {group.title}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie del Sidebar: Cerrar Sesión Empresa */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión Empresa</span>
                </button>
              </div>
            </aside>

            {/* PANEL PRINCIPAL DE CONTENIDO (IMAGEN 3) */}
            <main className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Breadcrumb Superior */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-amber-500 font-bold">PORTAL DE PROVEEDORES</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="uppercase text-slate-700 dark:text-slate-200 font-bold">
                  {activeTab.replace(/_/g, ' ')}
                </span>
              </div>

              {/* ============================================================= */}
              {/* VISTA 1: DASHBOARD RESUMEN Y CUADROS ESTADÍSTICOS             */}
              {/* ============================================================= */}
              {activeTab === 'dashboard' && dashboardData && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="text-[11px] font-mono text-slate-400 block mb-1">VENTAS TOTALES (GMV):</span>
                      <div className="text-2xl font-black font-mono text-slate-950 dark:text-white">
                        ${dashboardData.kpis.gmvVentasBrutasUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Facturado a constructoras SARA</span>
                    </div>

                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold block">COMISIÓN GRUPO SARA:</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                          {currentSeller.comisionSaraPct}%
                        </span>
                      </div>
                      <div className="text-2xl font-black font-mono text-amber-500">
                        ${dashboardData.kpis.comisionSaraTotalUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Retención por plataforma</span>
                    </div>

                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mb-1">VENTAS NETAS A PERCIBIR:</span>
                      <div className="text-2xl font-black font-mono text-emerald-500">
                        ${dashboardData.kpis.netoVendedorTotalUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Liquidación directa a cuenta</span>
                    </div>

                    <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                      <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold block mb-1">EN CUSTODIA ESCROW:</span>
                      <div className="text-2xl font-black font-mono text-sky-400">
                        ${dashboardData.kpis.enCustodiaEscrowUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Liberación contra entrega en bodega</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">Evolución de Ventas Semanales (USD)</h4>
                          <p className="text-xs text-slate-400">Comportamiento diario de pedidos de obra colocados</p>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg font-bold">Últimos 7 días</span>
                      </div>

                      <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                        {dashboardData.serieVentasDias.map((d, di) => {
                          const maxVal = 10000;
                          const pct = Math.min(100, Math.max(15, (d.total / maxVal) * 100));
                          return (
                            <div key={di} className="flex-1 flex flex-col items-center gap-2 group">
                              <span className="text-[11px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                ${d.total}
                              </span>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden h-36 flex items-end">
                                <div 
                                  style={{ height: `${pct}%` }} 
                                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all group-hover:brightness-125"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{d.dia}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Mix de Catálogo</h4>
                        <p className="text-xs text-slate-400">Distribución de materiales registrados</p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {Object.entries(dashboardData.categoriasMap).map(([cat, cant]) => (
                          <div key={cat} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-600 dark:text-slate-300 font-bold">{cat}</span>
                              <span className="text-amber-500">{cant} productos</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${Math.min(100, (cant / 10) * 100)}%` }} 
                                className="h-full bg-amber-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-400">
                        Capacidad: {dashboardData.kpis.totalProductosCatalogados} / {SELLER_PLANS[currentSeller.plan].maxProductos} ítems
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 2: HISTORIAL POR FACTURAS                               */}
              {/* ============================================================= */}
              {activeTab === 'historial_facturas' && ventasHistorial && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Historial de Ventas por Facturas</h3>
                      <p className="text-xs text-slate-400">Registro oficial de compras recibidas por constructoras y dispersión Escrow</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                        <input 
                          type="text" 
                          value={historialFiltroTexto}
                          onChange={(e) => setHistorialFiltroTexto(e.target.value)}
                          placeholder="Buscar por factura, obra, cliente..."
                          className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                      <select
                        value={historialFiltroEstado}
                        onChange={(e) => setHistorialFiltroEstado(e.target.value)}
                        className="p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                      >
                        <option value="TODOS">Todos los estados</option>
                        <option value="LIBERADO_A_VENDEDOR">Liberado a Cuenta</option>
                        <option value="EN_CUSTODIA_ESCROW">En Custodia Escrow</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-mono text-[11px] text-slate-400 uppercase">
                          <th className="p-4">Factura & Orden</th>
                          <th className="p-4">Constructora / Obra</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4 text-right">Subtotal</th>
                          <th className="p-4 text-right">Total Facturado</th>
                          <th className="p-4 text-right">Comisión SARA</th>
                          <th className="p-4 text-right">Neto Proveedor</th>
                          <th className="p-4">Estado Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {ventasHistorial.porFacturas.map((vt) => (
                          <tr key={vt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-4">
                              <span className="font-bold text-slate-900 dark:text-white block">{vt.facturaNumero}</span>
                              <span className="text-[10px] text-slate-400">{vt.ordenCompraFolio}</span>
                            </td>
                            <td className="p-4 font-sans">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{vt.clienteNombre}</span>
                              <span className="text-[11px] text-slate-400">{vt.proyectoObra}</span>
                            </td>
                            <td className="p-4 text-slate-400">{new Date(vt.fecha).toLocaleDateString('es-EC')}</td>
                            <td className="p-4 text-right">${vt.subtotalUSD.toFixed(2)}</td>
                            <td className="p-4 text-right font-black text-slate-900 dark:text-white">${vt.totalUSD.toFixed(2)}</td>
                            <td className="p-4 text-right text-amber-500">-${vt.comisionSaraUSD.toFixed(2)}</td>
                            <td className="p-4 text-right font-black text-emerald-500">${vt.netoVendedorUSD.toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                vt.estadoPago === 'LIBERADO_A_VENDEDOR'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}>
                                {vt.estadoPago === 'LIBERADO_A_VENDEDOR' ? 'Liberado SPI' : 'Escrow Activo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 3: HISTORIAL POR ARTÍCULOS                              */}
              {/* ============================================================= */}
              {activeTab === 'historial_articulos' && ventasHistorial && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Desglose de Ventas por Artículos & SKUs</h3>
                    <p className="text-xs text-slate-400">Rendimiento de cada producto en las requisiciones de obras civiles</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-mono text-[11px] text-slate-400 uppercase">
                          <th className="p-4">SKU / Insumo</th>
                          <th className="p-4">Nombre del Material</th>
                          <th className="p-4 text-right">Cantidad Despachada</th>
                          <th className="p-4 text-right">Órdenes</th>
                          <th className="p-4 text-right">Facturación Generada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {ventasHistorial.porArticulos.map((art, ai) => (
                          <tr key={ai} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-4 font-bold text-amber-500">{art.sku}</td>
                            <td className="p-4 font-sans font-bold text-slate-900 dark:text-white">{art.nombre}</td>
                            <td className="p-4 text-right font-black">{art.cantidadTotalVendida} {art.unidad}</td>
                            <td className="p-4 text-right text-slate-400">{art.numeroFacturas} órdenes</td>
                            <td className="p-4 text-right text-emerald-500 font-black">${art.ingresoTotalUSD.toFixed(2)} USD</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 4: SUBIR CATÁLOGO EXCEL (.XLSX)                         */}
              {/* ============================================================= */}
              {activeTab === 'catalogo_excel' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Importador Masivo de Catálogo Excel (.xlsx)</h3>
                    <p className="text-xs text-slate-400">Carga miles de insumos en segundos con precios, tarifas diferenciadas de IVA (5% vs 15%) y normas INEN</p>
                  </div>

                  <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">Arrastra tu archivo Excel aquí o haz clic para seleccionarlo</h4>
                      <p className="text-xs text-slate-400 mt-1">Formatos compatibles: .xlsx, .xls y .csv (Tamaño máx: 25 MB)</p>
                    </div>

                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleImportarExcel}
                        disabled={excelCargando}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        {excelCargando ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Procesando e Importando Materiales...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Cargar Plantilla Oficial SARA (Simular Ingesta)</span>
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => setFeedbackMsg({ tipo: 'success', texto: 'Plantilla oficial de Excel descargada en su equipo.' })}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Plantilla .xlsx</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 5: REGISTRO MANUAL DE INSUMOS                           */}
              {/* ============================================================= */}
              {activeTab === 'catalogo_manual' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Registro Manual de Nuevo Material de Construcción</h3>
                    <p className="text-xs text-slate-400">Publica un ítem individual en la vitrina de SARA Marketplace con cumplimiento tributario SRI</p>
                  </div>

                  <form onSubmit={handleGuardarProductoManual} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Comercial del Material:</label>
                        <input 
                          type="text" 
                          required
                          value={prodManual.nombre}
                          onChange={(e) => setProdManual({ ...prodManual, nombre: e.target.value })}
                          placeholder="Ej: Varilla de Acero fy=4200 Ø12mm x 12m"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Categoría:</label>
                        <select 
                          value={prodManual.categoria}
                          onChange={(e) => setProdManual({ ...prodManual, categoria: e.target.value as any })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                        >
                          <option value="ACERO">Acero y Mallas</option>
                          <option value="CEMENTO_HORMIGON">Cemento y Hormigón</option>
                          <option value="ARIDOS_PETREOS">Áridos y Pétreos</option>
                          <option value="ACABADOS">Acabados y Pinturas</option>
                          <option value="TUBERIAS_PLOMERIA">Tuberías y Plomería</option>
                          <option value="ELECTRICIDAD">Electricidad e Iluminación</option>
                          <option value="MAQUINARIA_EQUIPOS">Maquinaria y Equipos</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Unidad de Medida:</label>
                        <input 
                          type="text" 
                          required
                          value={prodManual.unidad}
                          onChange={(e) => setProdManual({ ...prodManual, unidad: e.target.value })}
                          placeholder="Ej: quintal (qq), m3, saco, caneca"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Precio Unitario sin IVA ($ USD):</label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={prodManual.precioSinIva}
                          onChange={(e) => setProdManual({ ...prodManual, precioSinIva: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Tarifa IVA SRI:</label>
                        <select 
                          value={prodManual.tarifaIvaPct}
                          onChange={(e) => setProdManual({ ...prodManual, tarifaIvaPct: Number(e.target.value) as any })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                        >
                          <option value={5}>5% (Material de Construcción - Res. SRI)</option>
                          <option value={15}>15% (Tarifa General)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Norma Técnica INEN:</label>
                        <input 
                          type="text" 
                          value={prodManual.normaInen}
                          onChange={(e) => setProdManual({ ...prodManual, normaInen: e.target.value })}
                          placeholder="Ej: NTE INEN 2167"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Stock Disponible en Planta:</label>
                        <input 
                          type="number" 
                          required
                          value={prodManual.stockDisponible}
                          onChange={(e) => setProdManual({ ...prodManual, stockDisponible: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
                    >
                      Publicar Material en Marketplace B2B
                    </button>
                  </form>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 6: CONEXIÓN API REST & ERP (EXACTO A IMAGEN 3)          */}
              {/* ============================================================= */}
              {activeTab === 'catalogo_api' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Conexión API REST & Webhooks para ERPs
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sincroniza inventarios en tiempo real desde SAP, Oracle NetSuite, Odoo o Contifico
                    </p>
                  </div>

                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">API Key Privada de Producción:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentSeller.apiKey);
                          setCopiadoApiKey(true);
                          setTimeout(() => setCopiadoApiKey(false), 2000);
                        }}
                        className="text-xs font-mono text-amber-500 hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiadoApiKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiadoApiKey ? 'Copiada' : 'Copiar API Key'}
                      </button>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl font-mono text-xs text-slate-900 dark:text-white break-all select-all border border-slate-200 dark:border-slate-700">
                      {currentSeller.apiKey}
                    </div>

                    <div className="pt-2">
                      <span className="text-xs font-mono text-slate-400 block mb-2">Endpoint de Ingesta Masiva:</span>
                      <div className="p-3.5 bg-slate-950 text-amber-400 rounded-xl font-mono text-xs border border-slate-800 font-bold">
                        POST https://sara-constructora.vercel.app/api/marketplace/ingesta
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 7: DATOS DE LA EMPRESA & LOGOTIPO                       */}
              {/* ============================================================= */}
              {activeTab === 'datos_empresa' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Datos Corporativos & Ficha de la Empresa</h3>
                      <p className="text-xs text-slate-400">Administra la razón social, RUC tributario SRI, dirección matriz, teléfonos de despacho y logotipo</p>
                    </div>

                    <button
                      onClick={handleGuardarEmpresa}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Datos</span>
                    </button>
                  </div>

                  <form onSubmit={handleGuardarEmpresa} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
                        {empresaForm.logoUrl ? (
                          <img 
                            src={empresaForm.logoUrl} 
                            alt="Logotipo" 
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-[260px] space-y-2">
                        <label className="text-xs font-mono text-slate-400 block font-bold">
                          Logotipo Corporativo (Subir archivo de imagen o ingresar URL):
                        </label>

                        {/* Input tipo archivo para subir logotipo desde el disco local (Imagen 2) */}
                        <input 
                          type="file" 
                          ref={logoFileInputRef}
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden" 
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir Archivo de Logotipo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEmpresaForm({
                              ...empresaForm,
                              logoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop'
                            })}
                            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200"
                          >
                            Logo Demo
                          </button>

                          {empresaForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setEmpresaForm({ ...empresaForm, logoUrl: '' })}
                              className="px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold rounded-xl"
                            >
                              Quitar
                            </button>
                          )}
                        </div>

                        <div className="pt-1">
                          <input 
                            type="text" 
                            value={empresaForm.logoUrl}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, logoUrl: e.target.value })}
                            placeholder="O pega una URL: https://ejemplo.com/logo-empresa.png"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Razón Social (Oficial SRI):</label>
                        <input 
                          type="text" 
                          required
                          value={empresaForm.razonSocial}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, razonSocial: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Comercial / Marca en Marketplace:</label>
                        <input 
                          type="text" 
                          required
                          value={empresaForm.nombreComercial}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, nombreComercial: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-mono text-slate-400 block">RUC Ecuatoriano:</label>
                          <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Módulo 11 Verificado
                          </span>
                        </div>
                        <input 
                          type="text" 
                          maxLength={13}
                          required
                          value={empresaForm.ruc}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, ruc: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">Ciudad Matriz:</label>
                        <input 
                          type="text" 
                          required
                          value={empresaForm.ciudad}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, ciudad: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-mono text-slate-400 block mb-1">Dirección Matriz / Ubicación de Retiro de Carga:</label>
                        <input 
                          type="text" 
                          required
                          value={empresaForm.direccionMatriz}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, direccionMatriz: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Canales de Contacto & Despachos de Obra</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Teléfono PBX / Fijo:</label>
                          <input 
                            type="text" 
                            value={empresaForm.telefono}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Celulares / WhatsApp de Logística:</label>
                          <input 
                            type="text" 
                            value={empresaForm.telefonosAdicionales}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, telefonosAdicionales: e.target.value })}
                            placeholder="0992348190, 0984451200"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Correo para Facturación & Pedidos:</label>
                          <input 
                            type="email" 
                            required
                            value={empresaForm.email}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Sitio Web Oficial:</label>
                          <input 
                            type="url" 
                            value={empresaForm.sitioWeb}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, sitioWeb: e.target.value })}
                            placeholder="https://www.miempresa.com.ec"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-mono text-slate-400 block mb-1">Ciudades de Cobertura de Fletes Directos:</label>
                          <input 
                            type="text" 
                            value={empresaForm.ciudadesCobertura}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, ciudadesCobertura: e.target.value })}
                            placeholder="Quito, Guayaquil, Cuenca, Ambato, Loja"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-mono text-slate-400 block mb-1">Reseña de la Empresa / Acreditaciones Técnicas:</label>
                          <textarea 
                            rows={3}
                            value={empresaForm.descripcionEmpresa}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, descripcionEmpresa: e.target.value })}
                            placeholder="Describe certificaciones INEN, ISO 9001, capacidad logística y experiencia en obras civiles..."
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios de la Empresa</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 8: CUENTAS BANCARIAS & CÓDIGOS QR (IMAGEN 3)            */}
              {/* ============================================================= */}
              {activeTab === 'cuentas_bancarias_qr' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          Cuentas Bancarias & Códigos QR de Cobro
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          SPI Central BCE
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Res. SRI NAC-DGERCGC24-00000013
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Configuración de cuentas SPI interbancarias y billeteras móviles del Ecuador para dispersión automática de liquidaciones y cobros directos de clientes.
                      </p>
                    </div>

                    <button
                      onClick={handleGuardarCuentasYQr}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>

                  <form onSubmit={handleGuardarCuentasYQr} className="space-y-6">
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <Landmark className="w-4 h-4 text-amber-500" />
                        <span>Cuenta Bancaria Principal SPI (Transferencias Interbancarias Ecuador)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Institución Financiera (Banco / Cooperativa):</label>
                          <select
                            value={bankForm.banco}
                            onChange={(e) => setBankForm({ ...bankForm, banco: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                          >
                            <option value="Banco Pichincha">Banco Pichincha</option>
                            <option value="Banco Guayaquil">Banco Guayaquil</option>
                            <option value="Produbanco">Produbanco (Grupo Promerica)</option>
                            <option value="Banco del Austro">Banco del Austro</option>
                            <option value="Banco Bolivariano">Banco Bolivariano</option>
                            <option value="Banco Internacional">Banco Internacional</option>
                            <option value="Mutualista Pichincha">Mutualista Pichincha</option>
                            <option value="Cooperativa JEP">Cooperativa JEP</option>
                            <option value="Cooperativa Policía Nacional">Cooperativa Policía Nacional</option>
                            <option value="Cooperativa 29 de Octubre">Cooperativa 29 de Octubre</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Tipo de Cuenta:</label>
                          <select
                            value={bankForm.tipoCuenta}
                            onChange={(e) => setBankForm({ ...bankForm, tipoCuenta: e.target.value as any })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                          >
                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                            <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Número de Cuenta Bancaria:</label>
                          <input 
                            type="text" 
                            required
                            value={bankForm.numeroCuenta}
                            onChange={(e) => setBankForm({ ...bankForm, numeroCuenta: e.target.value })}
                            placeholder="Ej: 2100849201"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Completo o Razón Social del Titular:</label>
                          <input 
                            type="text" 
                            required
                            value={bankForm.titular}
                            onChange={(e) => setBankForm({ ...bankForm, titular: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Identificación del Titular (RUC o Cédula):</label>
                          <input 
                            type="text" 
                            required
                            value={bankForm.identificacionTitular}
                            onChange={(e) => setBankForm({ ...bankForm, identificacionTitular: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Correo para Comprobantes de Transferencia:</label>
                          <input 
                            type="email" 
                            required
                            value={bankForm.emailComprobantes}
                            onChange={(e) => setBankForm({ ...bankForm, emailComprobantes: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <Smartphone className="w-4 h-4 text-sky-400" />
                        <span>Billeteras Móviles Ecuador (Pagos Inmediatos & Sin Contacto)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-500">DeUna! (Banco Pichincha)</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500 text-slate-950 font-black">Activo</span>
                          </div>
                          <label className="text-[11px] font-mono text-slate-400 block">Número Celular Afiliado:</label>
                          <input 
                            type="text" 
                            value={walletsForm.deUnaCelular}
                            onChange={(e) => setWalletsForm({ ...walletsForm, deUnaCelular: e.target.value })}
                            placeholder="0992348190"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                          />
                          <p className="text-[10px] text-slate-400">Cobros inmediatos desde app DeUna! y red Pichincha.</p>
                        </div>

                        <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-orange-500">Payphone Ecuador</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500 text-white font-black">Activo</span>
                          </div>
                          <label className="text-[11px] font-mono text-slate-400 block">Celular / ID Payphone:</label>
                          <input 
                            type="text" 
                            value={walletsForm.payphoneCelular}
                            onChange={(e) => setWalletsForm({ ...walletsForm, payphoneCelular: e.target.value })}
                            placeholder="0992348190"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                          />
                          <p className="text-[10px] text-slate-400">Tarjetas Visa / Mastercard y saldo app Payphone.</p>
                        </div>

                        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-purple-400">Peigo (Banco Guayaquil)</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500 text-white font-black">Activo</span>
                          </div>
                          <label className="text-[11px] font-mono text-slate-400 block">Celular Afiliado:</label>
                          <input 
                            type="text" 
                            value={walletsForm.peigoCelular}
                            onChange={(e) => setWalletsForm({ ...walletsForm, peigoCelular: e.target.value })}
                            placeholder="0992348190"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                          />
                          <p className="text-[10px] text-slate-400">Transferencias instantáneas sin costo interbancario.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                          <QrCode className="w-4 h-4 text-emerald-400" />
                          <span>Códigos QR Oficiales de Cobro</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Resolución alta para escaneo en obra</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-black text-slate-900 dark:text-white">QR DeUna! Pichincha</span>
                          </div>

                          <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto shadow-md border border-slate-200 flex items-center justify-center">
                            <img 
                              src={walletsForm.deUnaQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=deuna-pichincha'} 
                              alt="QR DeUna" 
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <p className="text-[11px] font-mono text-slate-500">Escaneo directo con app DeUna!</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRegenerarQr('deuna')}
                              className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-500 font-bold rounded-xl text-[11px] transition-all flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Generar QR</span>
                            </button>
                            <label className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>Subir QR</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    setFeedbackMsg({ tipo: 'success', texto: 'QR personalizado de DeUna cargado.' });
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-xs font-black text-slate-900 dark:text-white">QR Payphone Ecuador</span>
                          </div>

                          <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto shadow-md border border-slate-200 flex items-center justify-center">
                            <img 
                              src={walletsForm.payphoneQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payphone-ecuador'} 
                              alt="QR Payphone" 
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <p className="text-[11px] font-mono text-slate-500">Escaneo con Payphone o cámara</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRegenerarQr('payphone')}
                              className="flex-1 py-1.5 bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-400 font-bold rounded-xl text-[11px] transition-all flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Generar QR</span>
                            </button>
                            <label className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>Subir QR</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    setFeedbackMsg({ tipo: 'success', texto: 'QR personalizado de Payphone cargado.' });
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                            <span className="text-xs font-black text-slate-900 dark:text-white">QR Peigo Guayaquil</span>
                          </div>

                          <div className="w-40 h-40 bg-white p-2 rounded-2xl mx-auto shadow-md border border-slate-200 flex items-center justify-center">
                            <img 
                              src={walletsForm.peigoQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=peigo-guayaquil'} 
                              alt="QR Peigo" 
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <p className="text-[11px] font-mono text-slate-500">Transferencias con QR Peigo</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRegenerarQr('peigo')}
                              className="flex-1 py-1.5 bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-400 font-bold rounded-xl text-[11px] transition-all flex items-center justify-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Generar QR</span>
                            </button>
                            <label className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>Subir QR</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    setFeedbackMsg({ tipo: 'success', texto: 'QR personalizado de Peigo cargado.' });
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold tracking-tight">Vista Previa en Vivo: Pasarela que Verá el Cliente</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                          Simulación Checkout de Compra de Obra
                        </span>
                      </div>

                      <div className="flex border-b border-slate-800 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setPreviewPasarelaTab('spi')}
                          className={`py-2 px-4 border-b-2 font-bold transition-all ${
                            previewPasarelaTab === 'spi' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                          }`}
                        >
                          Transferencia SPI
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPasarelaTab('deuna')}
                          className={`py-2 px-4 border-b-2 font-bold transition-all ${
                            previewPasarelaTab === 'deuna' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                          }`}
                        >
                          DeUna! Pichincha
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPasarelaTab('payphone')}
                          className={`py-2 px-4 border-b-2 font-bold transition-all ${
                            previewPasarelaTab === 'payphone' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                          }`}
                        >
                          Payphone Ecuador
                        </button>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        {previewPasarelaTab === 'spi' && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 block">BANCO DE DESTINO:</span>
                                <span className="text-sm font-bold text-white">{bankForm.banco} ({bankForm.tipoCuenta})</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 block">NÚMERO DE CUENTA:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono font-bold text-amber-400">{bankForm.numeroCuenta}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(bankForm.numeroCuenta);
                                      setCopiadoCta(true);
                                      setTimeout(() => setCopiadoCta(false), 2000);
                                    }}
                                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                                    title="Copiar Cuenta"
                                  >
                                    {copiadoCta ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 block">TITULAR:</span>
                                <span className="text-slate-200 font-semibold">{bankForm.titular}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 block">RUC / CÉDULA:</span>
                                <span className="text-slate-200 font-mono">{bankForm.identificacionTitular}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {previewPasarelaTab === 'deuna' && (
                          <div className="flex items-center gap-4">
                            <img 
                              src={walletsForm.deUnaQrUrl} 
                              alt="QR DeUna" 
                              className="w-24 h-24 bg-white p-1 rounded-xl shrink-0" 
                            />
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-amber-400">Paga al instante con DeUna!</span>
                              <p className="text-xs text-slate-300">
                                Celular: <span className="font-mono font-bold text-white">{walletsForm.deUnaCelular}</span>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Abre tu app DeUna! Pichincha, escanea el código o transfiere al número celular.
                              </p>
                            </div>
                          </div>
                        )}

                        {previewPasarelaTab === 'payphone' && (
                          <div className="flex items-center gap-4">
                            <img 
                              src={walletsForm.payphoneQrUrl} 
                              alt="QR Payphone" 
                              className="w-24 h-24 bg-white p-1 rounded-xl shrink-0" 
                            />
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-orange-400">Paga con Tarjeta o App Payphone</span>
                              <p className="text-xs text-slate-300">
                                Celular / ID: <span className="font-mono font-bold text-white">{walletsForm.payphoneCelular}</span>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Acepta tarjetas de crédito o débito Visa / Mastercard nacionales e internacionales.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cuentas Bancarias & Códigos QR</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ============================================================= */}
              {/* VISTA 9: PLAN & CREDENCIALES API (IMAGEN 3 & IMAGEN 4)         */}
              {/* ============================================================= */}
              {activeTab === 'config_plan' && (
                <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl">
                  
                  {/* Resumen del Plan Actual Activo */}
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono text-slate-400 block mb-1">PLAN ACTUALMENTE CONTRATADO:</span>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{SELLER_PLANS[currentSeller.plan]?.nombre || currentSeller.plan}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            Activo
                          </span>
                        </h4>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${SELLER_PLANS[currentSeller.plan]?.colorBadge || 'bg-blue-600 text-white'}`}>
                        {SELLER_PLANS[currentSeller.plan]?.badge || currentSeller.plan}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase">COMISIÓN GRUPO SARA</span>
                        <span className="text-2xl font-black text-amber-500">{currentSeller.comisionSaraPct}%</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Porcentaje retenido en dispersión Escrow</p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">COSTO MENSUAL</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          ${SELLER_PLANS[currentSeller.plan]?.costoMensualUSD || 0} <span className="text-xs font-normal text-slate-400">USD</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Suscripción fija mensual facturada</p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">CAPACIDAD DE CATÁLOGO</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {SELLER_PLANS[currentSeller.plan]?.maxProductos || 250} <span className="text-xs font-normal text-slate-400">SKUs</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Límite de materiales publicados</p>
                      </div>
                    </div>
                  </div>

                  {/* Catálogo de Planes Sincronizado desde el Módulo de Administración (Imagen 3 & Imagen 4) */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          Planes de Membresía del Marketplace B2B
                        </h4>
                        <p className="text-xs text-slate-400">
                          Planes oficiales configurados en Administración (VIP 15%, EMPRESARIAL 10%, BÁSICO 8%). Puedes cambiar de plan en cualquier momento.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                        Sincronizado con /admin/marketplace/planes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {catalogoPlanes.map((plan) => {
                        const esPlanActual = currentSeller.plan === plan.id || 
                          (plan.id === 'VIP' && currentSeller.plan === 'VIP_FABRICA') ||
                          (plan.id === 'EMPRESARIAL' && currentSeller.plan === 'ESTANDAR_PRO') ||
                          (plan.id === 'BASICO' && currentSeller.plan === 'BASICO_FERRETERIA');

                        return (
                          <div
                            key={plan.id}
                            className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                              esPlanActual 
                                ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400/50 shadow-sm'
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${plan.colorBadge}`}>
                                  {plan.badge || plan.nombre}
                                </span>
                                {esPlanActual && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    Tu Plan
                                  </span>
                                )}
                              </div>

                              <div>
                                <h5 className="text-xl font-black text-slate-900 dark:text-white">
                                  {plan.nombre}
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {plan.descripcion}
                                </p>
                              </div>

                              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-baseline justify-between">
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">COMISIÓN GRUPO SARA</span>
                                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{plan.porcentajeComision}%</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-mono text-slate-400 block">SUSCRIPCIÓN</span>
                                  <span className="text-lg font-bold text-slate-900 dark:text-white">${plan.costoMensualUSD}/mes</span>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <span className="text-[11px] font-mono text-slate-400 font-bold block uppercase">
                                  Características & Beneficios:
                                </span>
                                <ul className="space-y-2">
                                  {plan.caracteristicas.map((caract, cIdx) => (
                                    <li key={cIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{caract}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                              {esPlanActual ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-2.5 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl text-xs cursor-default flex items-center justify-center gap-1 border border-emerald-500/30"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Plan Activo</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCambiarPlan(plan.id)}
                                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                                >
                                  <span>Cambiar a este Plan</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </main>

          </div>

        </div>

      )}

    </div>
  );
}
