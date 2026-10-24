'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Building2, 
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
  Plus
} from 'lucide-react';
import { 
  SellerMarketplaceService, 
  SellerProfile, 
  SELLER_PLANS, 
  SellerPlanType, 
  MarketplaceProduct 
} from '@/lib/services/sellerMarketplaceService';

interface SellerHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

export function SellerHubModal({ isOpen, onClose, onProductAdded }: SellerHubModalProps) {
  // Estado de Sesión del Vendedor (inicia con Adelca VIP como demostración, pero permite cambiar o registrar)
  const [currentSeller, setCurrentSeller] = useState<SellerProfile | null>(() => {
    return SellerMarketplaceService.getSellerById('seller-adelca-01') || null;
  });

  // Pestañas internas del Seller Hub
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subir_materiales' | 'historial_ventas' | 'config_plan'>('dashboard');

  // Modo Auth: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginTerm, setLoginTerm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Formulario de Registro de Nuevo Proveedor
  const [regForm, setRegForm] = useState({
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    email: '',
    telefono: '',
    ciudad: 'Quito',
    direccionMatriz: '',
    plan: 'VIP_FABRICA' as SellerPlanType
  });

  // Pestañas de Subida de Materiales: 'excel' | 'manual' | 'api'
  const [uploadMethod, setUploadMethod] = useState<'excel' | 'manual' | 'api'>('excel');

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
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreviewRows, setExcelPreviewRows] = useState<any[]>([]);
  const [excelCargando, setExcelCargando] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Historial de Ventas: 'facturas' | 'articulos'
  const [historialSubTab, setHistorialSubTab] = useState<'facturas' | 'articulos'>('facturas');
  const [historialFiltroTexto, setHistorialFiltroTexto] = useState('');
  const [historialFiltroEstado, setHistorialFiltroEstado] = useState('TODOS');

  // Copiado al portapapeles
  const [copiadoApiKey, setCopiadoApiKey] = useState(false);

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

  if (!isOpen) return null;

  // Manejador: Autenticación rápida
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const seller = SellerMarketplaceService.authenticateSeller(loginTerm);
      setCurrentSeller(seller);
      setFeedbackMsg({ tipo: 'success', texto: `Bienvenido a su entorno, ${seller.nombreComercial}.` });
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Manejador: Registro de Nueva Empresa
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const nuevo = SellerMarketplaceService.registerSeller(regForm);
      setCurrentSeller(nuevo);
      setFeedbackMsg({ tipo: 'success', texto: `Empresa ${nuevo.razonSocial} registrada con éxito en el ${SELLER_PLANS[nuevo.plan].nombre}.` });
      setActiveTab('dashboard');
    } catch (err: any) {
      setAuthError(err.message);
    }
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
      // Reset form
      setProdManual({
        ...prodManual,
        nombre: '',
        descripcion: ''
      });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'error', texto: err.message });
    }
  };

  // Manejador: Carga Simulada de Excel
  const handleSubirExcelSimulado = () => {
    if (!currentSeller) return;
    setExcelCargando(true);
    setTimeout(() => {
      // Filas ejemplo importadas desde Excel
      const filasExcel = [
        {
          nombre: 'Perfil Angular de Acero 50x50x4mm x 6.00m',
          categoria: 'ACERO',
          unidad: 'pieza (6m)',
          precioSinIva: 22.40,
          tarifaIvaPct: 5,
          stockDisponible: 450,
          normaInen: 'NTE INEN 2215',
          tiempoEntregaHoras: 24,
          pesoUnitarioKg: 18.2
        },
        {
          nombre: 'Cemento Selvalegre Tipo IP (Saco 50kg)',
          categoria: 'CEMENTO_HORMIGON',
          unidad: 'saco (50kg)',
          precioSinIva: 8.10,
          tarifaIvaPct: 5,
          stockDisponible: 1200,
          normaInen: 'NTE INEN 490',
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
      setExcelPreviewRows([]);
      setExcelFile(null);
      setFeedbackMsg({ 
        tipo: 'success', 
        texto: `¡Carga masiva completada! Se importaron ${res.exitosos} productos nuevos a su catálogo oficial.` 
      });
      if (onProductAdded) onProductAdded();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* ================================================================= */}
        {/* CABECERA SUPERIOR DEL SELLER HUB */}
        {/* ================================================================= */}
        <div className="bg-slate-950 text-white px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  GRUPO SARA • SELLER CENTRAL & VENDOR HUB
                </span>
                {currentSeller && (
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${SELLER_PLANS[currentSeller.plan].colorBadge}`}>
                    {SELLER_PLANS[currentSeller.plan].badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black tracking-tight">
                {currentSeller ? currentSeller.nombreComercial : 'Portal de Proveedores & Fabricantes'}
              </h2>
            </div>
          </div>

          {/* Menú de Empresa / Sesión */}
          <div className="flex items-center gap-3">
            {currentSeller ? (
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">RUC: {currentSeller.ruc}</span>
                <span className="text-amber-400 font-bold ml-1">
                  (Comisión SARA: {currentSeller.comisionSaraPct}%)
                </span>
                <button 
                  onClick={() => setCurrentSeller(null)}
                  className="ml-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Cambiar de Empresa / Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-400">
                Seleccione o registre su empresa proveedora
              </span>
            )}

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK TEMPORAL NOTICES */}
        {feedbackMsg && (
          <div className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between shrink-0 ${
            feedbackMsg.tipo === 'success' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-rose-500 text-white font-bold'
          }`}>
            <span>{feedbackMsg.texto}</span>
            <button onClick={() => setFeedbackMsg(null)} className="ml-4 font-black">✕</button>
          </div>
        )}

        {/* ================================================================= */}
        {/* CONTENIDO PRINCIPAL: SI NO HAY SESIÓN O SI ESTÁ AUTENTICADO */}
        {/* ================================================================= */}
        {!currentSeller ? (
          
          /* ================================================================= */
          /* PANTALLA DE AUTENTICACIÓN Y REGISTRO CON SELECCIÓN DE PLAN */
          /* ================================================================= */
          <div className="p-6 md:p-10 overflow-y-auto space-y-8 flex-1">
            <div className="max-w-4xl mx-auto text-center space-y-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Vende tus Materiales de Construcción en GRUPO SARA
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Conecta tu empresa, fábrica o ferretería con más de 250 constructoras activas. Tus productos se integran automáticamente en las matrices de cotizaciones de presupuestos APU y compras de obra.
              </p>
              
              {/* Acceso Rápido Demo con Empresas Certificadas */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-mono text-slate-400 mr-2">Entrar rápido como empresa de prueba:</span>
                {SellerMarketplaceService.getSellersList().map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSeller(s);
                      setFeedbackMsg({ tipo: 'success', texto: `Sesión iniciada como ${s.nombreComercial} (${SELLER_PLANS[s.plan].nombre}).` });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      s.plan === 'VIP_FABRICA' 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-slate-950'
                        : s.plan === 'ESTANDAR_PRO'
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                    }`}
                  >
                    🏢 {s.nombreComercial} ({s.plan === 'VIP_FABRICA' ? 'VIP' : s.plan === 'ESTANDAR_PRO' ? 'PRO' : 'BÁSICO'})
                  </button>
                ))}
              </div>
            </div>

            {/* Alternador Login / Registro */}
            <div className="max-w-3xl mx-auto">
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    authMode === 'login'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Iniciar Sesión de Proveedor
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    authMode === 'register'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Registrar Empresa & Seleccionar Plan
                </button>
              </div>

              {authError && (
                <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-mono text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {authError}
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      RUC Ecuatoriano (13 dígitos) o Correo Corporativo:
                    </label>
                    <input 
                      type="text"
                      required
                      value={loginTerm}
                      onChange={(e) => setLoginTerm(e.target.value)}
                      placeholder="Ej: 1790008594001 o ventas@empresa.com.ec"
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
                  >
                    Ingresar a mi Seller Dashboard
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  
                  {/* SELECCIÓN DE PLANES CON COMISIONES */}
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3 text-center">
                      1. Elige tu Plan de Suscripción (Define tu Comisión y Posicionamiento):
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(Object.keys(SELLER_PLANS) as SellerPlanType[]).map((planKey) => {
                        const p = SELLER_PLANS[planKey];
                        const isSelected = regForm.plan === planKey;
                        return (
                          <div
                            key={planKey}
                            onClick={() => setRegForm({ ...regForm, plan: planKey })}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected 
                                ? 'border-amber-500 bg-amber-500/5 shadow-xl shadow-amber-500/10' 
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${p.colorBadge}`}>
                                  {p.badge}
                                </span>
                                {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                              </div>

                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {p.nombre}
                              </h4>
                              <div className="mt-2 text-2xl font-black font-mono text-slate-900 dark:text-white">
                                ${p.costoMensualUSD}
                                <span className="text-xs font-normal text-slate-400">/mes</span>
                              </div>

                              <div className="my-3 py-2 px-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold block">
                                  COMISIÓN GRUPO SARA:
                                </span>
                                <span className="text-lg font-black font-mono text-amber-500">
                                  {p.comisionSaraPct}%
                                </span>
                                <span className="text-[10px] text-slate-400 block">por venta concretada</span>
                              </div>

                              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-3">
                                {p.beneficios.slice(0, 4).map((b, bi) => (
                                  <li key={bi} className="flex items-start gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* FORMULARIO DE DATOS DE LA EMPRESA */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      2. Datos Fiscales de la Empresa Proveedora:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          RUC del Proveedor (Validación SRI Módulo 11):
                        </label>
                        <input 
                          type="text"
                          required
                          maxLength={13}
                          value={regForm.ruc}
                          onChange={(e) => setRegForm({ ...regForm, ruc: e.target.value })}
                          placeholder="Ej: 1790008594001"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          Razón Social (según RUC):
                        </label>
                        <input 
                          type="text"
                          required
                          value={regForm.razonSocial}
                          onChange={(e) => setRegForm({ ...regForm, razonSocial: e.target.value })}
                          placeholder="Ej: ACERÍA DEL ECUADOR C.A."
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          Nombre Comercial / Marca:
                        </label>
                        <input 
                          type="text"
                          required
                          value={regForm.nombreComercial}
                          onChange={(e) => setRegForm({ ...regForm, nombreComercial: e.target.value })}
                          placeholder="Ej: ADELCA Planta Alóag"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          Correo Electrónico Corporativo:
                        </label>
                        <input 
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="pedidos@empresa.com.ec"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          Teléfono de Despacho:
                        </label>
                        <input 
                          type="text"
                          required
                          value={regForm.telefono}
                          onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                          placeholder="+593 2 382 7200"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          Ciudad Principal de Bodega / Planta:
                        </label>
                        <input 
                          type="text"
                          required
                          value={regForm.ciudad}
                          onChange={(e) => setRegForm({ ...regForm, ciudad: e.target.value })}
                          placeholder="Ej: Quito / Guayaquil / Cuenca"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-mono text-slate-400 block mb-1">
                          Dirección Matriz / Ubicación de Retiro de Carga:
                        </label>
                        <input 
                          type="text"
                          required
                          value={regForm.direccionMatriz}
                          onChange={(e) => setRegForm({ ...regForm, direccionMatriz: e.target.value })}
                          placeholder="Panamericana Sur Km 38, Parque Industrial"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20"
                    >
                      Completar Registro y Activar Entorno de Ventas
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>

        ) : (

          /* ================================================================= */
          /* PANEL COMPLETO DEL PROVEEDOR AUTENTICADO */
          /* ================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* SUB-NAV DE PESTAÑAS DEL SELLER HUB */}
            <div className="bg-slate-100 dark:bg-slate-950 px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Resumen & Cuadros Estadísticos
              </button>

              <button
                onClick={() => setActiveTab('subir_materiales')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'subir_materiales'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Subir Catálogo (Excel / Manual / API)
              </button>

              <button
                onClick={() => setActiveTab('historial_ventas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'historial_ventas'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Historial de Ventas (Facturas & Artículos)
              </button>

              <button
                onClick={() => setActiveTab('config_plan')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'config_plan'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" />
                Plan ({currentSeller.plan === 'VIP_FABRICA' ? 'VIP 1.8%' : currentSeller.plan === 'ESTANDAR_PRO' ? 'PRO 3.5%' : 'BÁSICO 6%'}) & API Key
              </button>
            </div>

            {/* ÁREA DE CONTENIDO SEGÚN LA PESTAÑA */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
              
              {/* ------------------------------------------------------------- */}
              {/* PESTAÑA 1: DASHBOARD RESUMEN Y CUADROS ESTADÍSTICOS */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'dashboard' && dashboardData && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* KPI Cards Superiores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-mono text-slate-400 block mb-1">
                        VENTAS TOTALES (GMV):
                      </span>
                      <div className="text-2xl font-black font-mono text-slate-950 dark:text-white">
                        ${dashboardData.kpis.gmvVentasBrutasUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Facturado a constructoras SARA
                      </span>
                    </div>

                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold block">
                          COMISIÓN GRUPO SARA:
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black">
                          {currentSeller.comisionSaraPct}%
                        </span>
                      </div>
                      <div className="text-2xl font-black font-mono text-amber-500">
                        ${dashboardData.kpis.comisionSaraTotalUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Retención por plataforma
                      </span>
                    </div>

                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                        VENTAS NETAS A PERCIBIR:
                      </span>
                      <div className="text-2xl font-black font-mono text-emerald-500">
                        ${dashboardData.kpis.netoVendedorTotalUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Liquidación directa a cuenta
                      </span>
                    </div>

                    <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                      <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold block mb-1">
                        EN CUSTODIA ESCROW:
                      </span>
                      <div className="text-2xl font-black font-mono text-sky-400">
                        ${dashboardData.kpis.enCustodiaEscrowUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Liberación contra entrega en bodega
                      </span>
                    </div>
                  </div>

                  {/* Cuadros Estadísticos Interactivos */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Gráfico 1: Evolución Semanal de Ventas (Bar Chart interactivo) */}
                    <div className="lg:col-span-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            Evolución de Ventas Semanales (USD)
                          </h4>
                          <p className="text-xs text-slate-400">Comportamiento diario de pedidos de obra colocados</p>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg font-bold">
                          Últimos 7 días
                        </span>
                      </div>

                      {/* Renderizado de Barras */}
                      <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
                        {dashboardData.serieVentasDias.map((d, di) => {
                          const maxVal = 10000;
                          const pct = Math.min(100, Math.max(15, (d.total / maxVal) * 100));
                          return (
                            <div key={di} className="flex-1 flex flex-col items-center gap-2 group">
                              <span className="text-[11px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                ${d.total}
                              </span>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden h-36 flex items-end">
                                <div 
                                  style={{ height: `${pct}%` }} 
                                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all group-hover:brightness-125"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                {d.dia}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gráfico 2: Catálogo por Categorías */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                          Catálogo por Categoría
                        </h4>
                        <p className="text-xs text-slate-400 mb-4">Distribución de SKUs activos</p>

                        <div className="space-y-3">
                          {Object.entries(dashboardData.categoriasMap).map(([cat, cant]) => (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-slate-700 dark:text-slate-300">{cat.replace('_', ' ')}</span>
                                <span className="text-amber-500 font-bold">{cant} insumos</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${(cant / dashboardData.kpis.totalProductosCatalogados) * 100}%` }}
                                  className="h-full bg-amber-500 rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-400 flex items-center justify-between">
                        <span>Total SKUs Publicados:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{dashboardData.kpis.totalProductosCatalogados} de {dashboardData.planConfig.maxProductos} permitidos</span>
                      </div>
                    </div>

                  </div>

                  {/* Tabla de Top Productos Más Vendidos */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Artículos Estrella de tu Catálogo (Mayor Demanda de Obra)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                            <th className="pb-2">PRODUCTO / MATERIAL</th>
                            <th className="pb-2">CATEGORÍA</th>
                            <th className="pb-2">PRECIO SIN IVA</th>
                            <th className="pb-2">IVA APLICADO</th>
                            <th className="pb-2">UNIDADES VENDIDAS</th>
                            <th className="pb-2">ESTADO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {dashboardData.topProductos.map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 font-bold text-slate-900 dark:text-white">{p.nombre}</td>
                              <td className="py-2.5 text-slate-400">{p.categoria}</td>
                              <td className="py-2.5 text-amber-500 font-bold">${p.precioSinIva.toFixed(2)}</td>
                              <td className="py-2.5 text-emerald-400">{p.tarifaIvaPct}% (SRI)</td>
                              <td className="py-2.5 font-black text-slate-900 dark:text-white">{p.ventasTotales} {p.unidad}</td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                                  Activo en Vitrina
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PESTAÑA 2: SUBIR MATERIALES (EXCEL / MANUAL / API) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'subir_materiales' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Selector de Método de Carga */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setUploadMethod('excel')}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        uploadMethod === 'excel'
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <FileSpreadsheet className="w-6 h-6 text-emerald-500 mb-2" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Carga Masiva con Excel (.xlsx)</h4>
                      <p className="text-xs text-slate-400 mt-1">Sube cientos de materiales de una sola vez con nuestra plantilla estandarizada.</p>
                    </button>

                    <button
                      onClick={() => setUploadMethod('manual')}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        uploadMethod === 'manual'
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <Plus className="w-6 h-6 text-amber-500 mb-2" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Carga Manual Individual</h4>
                      <p className="text-xs text-slate-400 mt-1">Formulario detallado con ficha técnica INEN, fotos y precios mayoristas.</p>
                    </button>

                    <button
                      onClick={() => setUploadMethod('api')}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        uploadMethod === 'api'
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      <Code className="w-6 h-6 text-sky-400 mb-2" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Conexión API REST (ERP)</h4>
                      <p className="text-xs text-slate-400 mt-1">Sincroniza stock y precios en tiempo real desde SAP, Odoo o Contifico.</p>
                    </button>
                  </div>

                  {/* MÉTODO A: EXCEL */}
                  {uploadMethod === 'excel' && (
                    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                            Importador de Catálogo Excel (.xlsx / .csv)
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Descarga la plantilla con las columnas homologadas para el catálogo de obras del Ecuador.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setFeedbackMsg({
                              tipo: 'success',
                              texto: 'Plantilla "plantilla_materiales_sara_2026.xlsx" descargada en tu equipo.'
                            });
                          }}
                          className="px-4 py-2.5 bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border border-slate-600 transition-colors shrink-0"
                        >
                          <Download className="w-4 h-4 text-amber-500" />
                          Descargar Plantilla Excel SARA
                        </button>
                      </div>

                      {/* Dropzone Drag and Drop */}
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center bg-white dark:bg-slate-900/60 hover:border-amber-500 transition-all space-y-3">
                        <Upload className="w-10 h-10 text-amber-500 mx-auto" />
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
                        </div>
                        <p className="text-xs text-slate-400">
                          Formatos admitidos: .xlsx, .xls, .csv (Máximo 5,000 registros por archivo)
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleSubirExcelSimulado}
                            disabled={excelCargando}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-mono rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                          >
                            {excelCargando ? 'Procesando y Validando Columnas...' : '📁 Procesar Archivo Excel de Demostración'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MÉTODO B: MANUAL */}
                  {uploadMethod === 'manual' && (
                    <form onSubmit={handleGuardarProductoManual} className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        <Plus className="w-5 h-5 text-amber-500" />
                        Registrar Nuevo Insumo al Catálogo
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Comercial del Material:</label>
                          <input 
                            type="text"
                            required
                            value={prodManual.nombre}
                            onChange={(e) => setProdManual({ ...prodManual, nombre: e.target.value })}
                            placeholder="Ej: Cemento Selvalegre Tipo IP 50kg"
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Categoría:</label>
                          <select 
                            value={prodManual.categoria}
                            onChange={(e) => setProdManual({ ...prodManual, categoria: e.target.value as any })}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                          >
                            <option value="ACERO">Acero y Metales Estructurales</option>
                            <option value="CEMENTO_HORMIGON">Cemento y Hormigón</option>
                            <option value="ARIDOS_PETREOS">Áridos y Pétreos de Mina</option>
                            <option value="ACABADOS">Acabados y Pinturas</option>
                            <option value="TUBERIAS_PLOMERIA">Tuberías y Plomería</option>
                            <option value="ELECTRICIDAD">Material Eléctrico</option>
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
                            placeholder="Ej: quintal (qq), saco (50kg), m3"
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Precio Unitario Sin IVA (USD):</label>
                          <input 
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            value={prodManual.precioSinIva}
                            onChange={(e) => setProdManual({ ...prodManual, precioSinIva: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Tarifa IVA SRI Ecuador:</label>
                          <select 
                            value={prodManual.tarifaIvaPct}
                            onChange={(e) => setProdManual({ ...prodManual, tarifaIvaPct: parseInt(e.target.value) as any })}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
                          >
                            <option value={5}>5% IVA (Material de Construcción Calificado Res. 013)</option>
                            <option value={15}>15% IVA (Tarifa General)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Stock Disponible Inmediato:</label>
                          <input 
                            type="number"
                            required
                            value={prodManual.stockDisponible}
                            onChange={(e) => setProdManual({ ...prodManual, stockDisponible: parseInt(e.target.value) || 0 })}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-400 block mb-1">Norma Técnica INEN:</label>
                          <input 
                            type="text"
                            value={prodManual.normaInen}
                            onChange={(e) => setProdManual({ ...prodManual, normaInen: e.target.value })}
                            placeholder="NTE INEN 2167 / ASTM C1157"
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
                      >
                        Publicar Producto en el Marketplace
                      </button>
                    </form>
                  )}

                  {/* MÉTODO C: API REST */}
                  {uploadMethod === 'api' && (
                    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Code className="w-5 h-5 text-sky-400" />
                          Credenciales & Sincronización API REST
                        </h4>
                        <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                          SELLER_PLANS[currentSeller.plan].soportaApiSync 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {SELLER_PLANS[currentSeller.plan].soportaApiSync ? 'API Habilitada en tu Plan' : 'Requiere Plan VIP Fábrica'}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>TU API KEY SECRETA:</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(currentSeller.apiKey);
                              setCopiadoApiKey(true);
                              setTimeout(() => setCopiadoApiKey(false), 2000);
                            }}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiadoApiKey ? '¡Copiado!' : 'Copiar Key'}
                          </button>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg text-amber-400 select-all overflow-x-auto">
                          {currentSeller.apiKey}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-mono text-slate-400 block">Ejemplo cURL para sincronizar desde tu ERP (SAP / Odoo / Contifico):</label>
                        <pre className="p-4 bg-slate-950 rounded-2xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`curl -X POST https://sara-constructora.vercel.app/api/v1/seller/catalog/sync \\
  -H "Authorization: Bearer ${currentSeller.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "productos": [
      {
        "nombre": "Varilla Corrugada 14mm x 12m",
        "precioSinIva": 58.50,
        "tarifaIvaPct": 5,
        "stockDisponible": 1500,
        "categoria": "ACERO",
        "unidad": "quintal (qq)"
      }
    ]
  }'`}
                        </pre>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PESTAÑA 3: HISTORIAL DE VENTAS (FACTURAS & ARTÍCULOS) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'historial_ventas' && ventasHistorial && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Selector Sub-pestaña & Filtros */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
                      <button
                        onClick={() => setHistorialSubTab('facturas')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          historialSubTab === 'facturas'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        📄 Historial por Facturas / Órdenes
                      </button>
                      <button
                        onClick={() => setHistorialSubTab('articulos')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          historialSubTab === 'articulos'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        📦 Historial por Artículos / SKUs
                      </button>
                    </div>

                    {/* Filtros de Búsqueda */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          value={historialFiltroTexto}
                          onChange={(e) => setHistorialFiltroTexto(e.target.value)}
                          placeholder="Buscar cliente, factura o SKU..."
                          className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>

                      <select
                        value={historialFiltroEstado}
                        onChange={(e) => setHistorialFiltroEstado(e.target.value)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      >
                        <option value="TODOS">Todos los Pagos</option>
                        <option value="LIBERADO_A_VENDEDOR">Liberado a Cuenta</option>
                        <option value="EN_CUSTODIA_ESCROW">En Custodia Escrow</option>
                      </select>
                    </div>
                  </div>

                  {/* VISTA 1: POR FACTURAS */}
                  {historialSubTab === 'facturas' && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="p-4">FACTURA / OC</th>
                              <th className="p-4">FECHA</th>
                              <th className="p-4">CLIENTE CONSTRUCTORA</th>
                              <th className="p-4">OBRA / DESTINO</th>
                              <th className="p-4 text-right">TOTAL FACTURA</th>
                              <th className="p-4 text-right">COMISIÓN SARA</th>
                              <th className="p-4 text-right">NETO VENDEDOR</th>
                              <th className="p-4">ESTADO PAGO</th>
                              <th className="p-4">DESPACHO</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {ventasHistorial.porFacturas.map((v) => (
                              <tr key={v.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-slate-900 dark:text-white">
                                  {v.facturaNumero}
                                  <span className="block text-[10px] text-slate-400 font-normal">{v.ordenCompraFolio}</span>
                                </td>
                                <td className="p-4 text-slate-400">
                                  {new Date(v.fecha).toLocaleDateString('es-EC')}
                                </td>
                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                                  {v.clienteNombre}
                                  <span className="block text-[10px] text-slate-400 font-normal">RUC: {v.clienteRuc}</span>
                                </td>
                                <td className="p-4 text-slate-400">{v.proyectoObra}</td>
                                <td className="p-4 text-right font-black text-slate-900 dark:text-white font-mono">
                                  ${v.totalUSD.toFixed(2)}
                                </td>
                                <td className="p-4 text-right text-amber-500 font-bold font-mono">
                                  -${v.comisionSaraUSD.toFixed(2)}
                                  <span className="block text-[10px] text-slate-400">({v.comisionSaraPct}%)</span>
                                </td>
                                <td className="p-4 text-right text-emerald-500 font-black font-mono">
                                  ${v.netoVendedorUSD.toFixed(2)}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    v.estadoPago === 'LIBERADO_A_VENDEDOR'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  }`}>
                                    {v.estadoPago === 'LIBERADO_A_VENDEDOR' ? 'Liberado a Cuenta' : 'Custodia Escrow'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    v.estadoDespacho === 'ENTREGADO_CONFORME'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : v.estadoDespacho === 'EN_TRANSITO'
                                      ? 'bg-amber-500/10 text-amber-400'
                                      : 'bg-slate-500/10 text-slate-400'
                                  }`}>
                                    {v.estadoDespacho.replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VISTA 2: POR ARTÍCULOS */}
                  {historialSubTab === 'articulos' && (
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="p-4">SKU / CÓDIGO</th>
                              <th className="p-4">DESCRIPCIÓN DEL ARTÍCULO</th>
                              <th className="p-4">UNIDAD</th>
                              <th className="p-4 text-right">TOTAL VENDIDO</th>
                              <th className="p-4 text-right">NÚMERO DE FACTURAS</th>
                              <th className="p-4 text-right">INGRESOS GENERADOS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {ventasHistorial.porArticulos.map((art, ai) => (
                              <tr key={ai} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-amber-500">{art.sku}</td>
                                <td className="p-4 font-bold text-slate-900 dark:text-white">{art.nombre}</td>
                                <td className="p-4 text-slate-400">{art.unidad}</td>
                                <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                                  {art.cantidadTotalVendida}
                                </td>
                                <td className="p-4 text-right text-slate-400">
                                  {art.numeroFacturas} órdenes
                                </td>
                                <td className="p-4 text-right text-emerald-500 font-black">
                                  ${art.ingresoTotalUSD.toFixed(2)} USD
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PESTAÑA 4: PLAN & API KEY */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'config_plan' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-400 block mb-1">PLAN ACTUAL CONTRATADO:</span>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">
                          {SELLER_PLANS[currentSeller.plan].nombre}
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${SELLER_PLANS[currentSeller.plan].colorBadge}`}>
                        {SELLER_PLANS[currentSeller.plan].badge}
                      </span>
                    </div>

                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs font-mono space-y-1">
                      <div className="text-amber-500 font-bold">Porcentaje de Comisión Grupo SARA: {currentSeller.comisionSaraPct}%</div>
                      <div className="text-slate-400">Costo de Membresía Mensual: ${SELLER_PLANS[currentSeller.plan].costoMensualUSD} USD</div>
                      <div className="text-slate-400">Capacidad Máxima de Catálogo: {SELLER_PLANS[currentSeller.plan].maxProductos} productos</div>
                    </div>

                    <div className="pt-2">
                      <h5 className="text-xs font-mono text-slate-400 mb-2">Beneficios activos de tu plan:</h5>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {SELLER_PLANS[currentSeller.plan].beneficios.map((b, bi) => (
                          <li key={bi} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        )}

      </div>
    </div>
  );
}
