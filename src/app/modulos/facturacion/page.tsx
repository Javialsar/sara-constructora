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
  MapPin,
  Phone,
  Save
} from 'lucide-react';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';
import { createClient } from '@/lib/supabase/client';
import { PROVINCIAS_CANTONES_ECUADOR } from '@/lib/constants/ecuadorGeo';

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
    ruc: '1792345678001',
    nombres: 'Carlos Patricio',
    apellidos: 'Mendoza Andrade',
    razonSocial: 'ING. CARLOS MENDOZA ARQUITECTURA & CONSTRUCCIÓN',
    nombreComercial: 'Mendoza Arquitectura & Obras',
    email: 'carlos.mendoza@mendozaconstr.ec',
    emailContador: 'contabilidad@mendozaconstr.ec',
    contacto: '+593 99 876 5432',
    telefonoFijo: '02 245 8900',
    provincia: 'Pichincha',
    ciudad: 'Quito',
    calles: 'Av. República de El Salvador N36-84 y Naciones Unidas',
    referencia: 'Edificio Platinum Plaza, Piso 4, Oficina 402',
    tipoContribuyente: 'CONSTRUCCION',
    regimen: 'Régimen RIMPE - Negocio Emprendedor',
    obligadoContabilidad: 'NO',
    contribuyenteEspecial: 'NO',
    resolucionAgenteRetencion: '',
    establecimiento: '001',
    puntoEmision: '001',
    ambiente: 'PRODUCCIÓN (2)',
    planActivo: 'Bolsa Prepago Micro',
    creditosRestantes: 12,
    creditosTotales: 15,
    firmaEstado: 'ACTIVA',
    firmaVenceDias: 284,
    firmaEmisor: 'SECURITY DATA (ARCOTEL)'
  });

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

  const emitirFacturaSRI = () => {
    if (tenantInfo.creditosRestantes <= 0) {
      showToast('No tienes créditos disponibles en tu plan. Por favor recarga o activa un Pase Diario.');
      return;
    }

    const nuevaFac: ComprobanteEmitido = {
      id: `cmp-${Date.now()}`,
      tipo: tipoComprobante,
      numero: `001-001-000000${143 + comprobantes.length}`,
      cliente: clienteNombre,
      identificacion: clienteId,
      fecha: new Date().toLocaleDateString('es-EC'),
      total: totalFactura,
      estado: 'AUTORIZADO',
      claveAcceso: `25102026${tipoComprobante}${tenantInfo.ruc}20010010000001431234567811`
    };

    setComprobantes([nuevaFac, ...comprobantes]);
    setTenantInfo(prev => ({ ...prev, creditosRestantes: Math.max(0, prev.creditosRestantes - 1) }));
    showToast(`¡Factura Nº ${nuevaFac.numero} firmada con XAdES-BES y AUTORIZADA por el SRI con éxito!`);
    setActiveTab('HISTORIAL');
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
          showToast(`¡Transacción confirmada (${txId})! Créditos y plan activados.`);
          setTenantInfo(prev => ({ ...prev, creditosRestantes: prev.creditosRestantes + 15 }));
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
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/[0.08] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Plan Activo:</span>
                <span className="font-bold text-amber-400">{tenantInfo.planActivo}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-white font-mono">
                  {tenantInfo.creditosRestantes} <span className="text-xs text-slate-400 font-normal">/ {tenantInfo.creditosTotales} docs</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Sin Caducidad</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${(tenantInfo.creditosRestantes / tenantInfo.creditosTotales) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => abrirCheckoutPlan({ title: 'Bolsa Prepago Micro (15 Comprobantes)', amount: 3.99, badgeText: 'Bolsa Prepago' })}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Recargar Saldo ($3.99)</span>
            </button>

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
                              onClick={() => showToast(`Descargando RIDE PDF de ${c.numero}...`)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-red-400 transition-colors cursor-pointer"
                              title="Descargar RIDE PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => showToast(`Descargando XML firmado XAdES-BES de ${c.numero}...`)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-emerald-400 transition-colors cursor-pointer"
                              title="Descargar XML"
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

              {/* Datos del Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo Identificación</label>
                  <select
                    value={clienteTipoId}
                    onChange={(e) => setClienteTipoId(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-bold text-white"
                  >
                    <option value="05">Cédula (05)</option>
                    <option value="04">RUC (04)</option>
                    <option value="07">Consumidor Final (07)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cédula / RUC *</label>
                  <input
                    type="text"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-mono font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Razón Social / Nombre *</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-bold text-white"
                  />
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
                    onClick={emitirFacturaSRI}
                    className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Firmar con .p12 & Emitir al SRI</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              VISTA 3: HISTORIAL DE COMPROBANTES EMITIDOS
              =================================================================== */}
          {activeTab === 'HISTORIAL' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-bold text-white">Comprobantes Autorizados por el SRI</h3>
                <span className="text-xs text-slate-400 font-mono">Total emitidos: {comprobantes.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-white/[0.08]">
                    <tr>
                      <th className="px-5 py-4">Secuencia</th>
                      <th className="px-5 py-4">Cliente / Contratista</th>
                      <th className="px-5 py-4">Fecha</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Estado SRI</th>
                      <th className="px-5 py-4 text-right">Descargas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {comprobantes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-white">{c.numero}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-200">{c.cliente}</div>
                          <div className="text-[11px] text-slate-500 font-mono">ID: {c.identificacion}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-mono">{c.fecha}</td>
                        <td className="px-5 py-4 font-mono font-bold text-amber-400">${c.total.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => showToast(`Descargando RIDE PDF de ${c.numero}...`)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-xs font-bold text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> RIDE (PDF)
                            </button>
                            <button
                              onClick={() => showToast(`Descargando XML firmado XAdES-BES de ${c.numero}...`)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-xs font-bold text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" /> XML
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
              VISTA 5: CATÁLOGO DE CLIENTES Y RUBROS
              =================================================================== */}
          {activeTab === 'CATALOGOS' && (
            <div className="bg-slate-900 border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-white">Directorio de Clientes Frecuentes</h3>
              <p className="text-xs text-slate-400">Guarda datos de tus clientes para emitir facturas en menos de 10 segundos.</p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">HORMIGONES DEL AUSTRO S.A.</div>
                    <div className="font-mono text-xs text-slate-400">RUC: 0190123456001 · Cuenca, Ecuador</div>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">Cliente Frecuente</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">PROMOTORA INMOBILIARIA URBANA</div>
                    <div className="font-mono text-xs text-slate-400">RUC: 1791827364001 · Quito, Ecuador</div>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">Cliente Frecuente</span>
                </div>
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
              VISTA 7: PLANES & RECARGAS
              =================================================================== */}
          {activeTab === 'PLANES' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white">Planes & Recargas Disponibles</h3>
                <p className="text-xs text-slate-400">Adquiere pases diarios, bolsas prepago o suscríbete para facturación ilimitada.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pase por Horas</span>
                    <h4 className="text-lg font-bold text-white mt-1">Pase Diario 24h</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Facturación ilimitada por 24 horas continuas.</p>
                    <div className="text-3xl font-black text-amber-400 font-mono mb-4">$1.50</div>
                  </div>
                  <button
                    onClick={() => abrirCheckoutPlan({ title: 'Pase Diario 24h Facturación', amount: 1.50, badgeText: 'Day Pass' })}
                    className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 font-bold text-xs uppercase cursor-pointer transition-all"
                  >
                    Activar por $1.50
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-400/60 flex flex-col justify-between relative shadow-xl">
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                    ⭐ Popular
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Sin Caducidad</span>
                    <h4 className="text-lg font-bold text-white mt-1">Bolsa Micro (15 Docs)</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-4">15 comprobantes electrónicos que nunca vencen.</p>
                    <div className="text-3xl font-black text-amber-400 font-mono mb-4">$3.99</div>
                  </div>
                  <button
                    onClick={() => abrirCheckoutPlan({ title: 'Bolsa Prepago Micro (15 Docs)', amount: 3.99, badgeText: 'Bolsa Prepago' })}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase cursor-pointer shadow-md shadow-amber-500/20 transition-all"
                  >
                    Comprar Bolsa ($3.99)
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Suscripción</span>
                    <h4 className="text-lg font-bold text-white mt-1">Plan Mensual Pro</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Comprobantes ilimitados + Formulario 104.</p>
                    <div className="text-3xl font-black text-amber-400 font-mono mb-4">$7.99 <span className="text-xs text-slate-400 font-normal">/ mes</span></div>
                  </div>
                  <button
                    onClick={() => abrirCheckoutPlan({ title: 'Plan Mensual Profesional Ilimitado', amount: 7.99, badgeText: 'Suscripción Mensual', isSub: true, interval: 'month' })}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase cursor-pointer transition-all"
                  >
                    Suscribirme ($7.99)
                  </button>
                </div>
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

    </div>
  );
}