'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  KeyRound, 
  Search, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  CreditCard, 
  Clock, 
  Building2, 
  User,
  UserCheck, 
  Percent, 
  HelpCircle,
  QrCode,
  Smartphone,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';
import FirmaElectronicaWizard from '@/components/facturacion/FirmaElectronicaWizard';
import FirmaElectronicaModal from '@/components/facturacion/FirmaElectronicaModal';

export default function FacturacionElectronicaLanding() {
  const router = useRouter();

  // Modal de Firma Electrónica flotante para máxima comodidad
  const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false);

  const handleIrAlPortal = () => {
    if (typeof window !== 'undefined') {
      const isAuth = Boolean(
        localStorage.getItem('sara_facturacion_auth_email') ||
        localStorage.getItem('sara_facturacion_auth_ruc')
      );
      if (isAuth) {
        router.push('/modulos/facturacion');
      } else {
        router.push('/modulos/facturacion/auth');
      }
    } else {
      router.push('/modulos/facturacion/auth');
    }
  };

  // Estado para la calculadora de ahorro
  const [facturasAlMes, setFacturasAlMes] = useState<number>(5);

  // Estado para la consulta pública de comprobantes estilo BusPlace
  const [cedulaBusqueda, setCedulaBusqueda] = useState<string>('');
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false);

  // Modal de pago / checkout
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }>({
    isOpen: false,
    title: '',
    amount: 0,
    badgeText: 'SARA-FACTURACION'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const abrirCheckout = (plan: {
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }) => {
    setCheckoutModal({
      isOpen: true,
      title: plan.title,
      amount: plan.amount,
      badgeText: plan.badgeText,
      isSubscription: plan.isSubscription || false,
      subscriptionInterval: plan.subscriptionInterval
    });
  };

  // Recomendación de la calculadora
  const getRecomendacionCalculadora = () => {
    if (facturasAlMes <= 3) {
      return {
        plan: 'Bolsa Prepago Micro (15 Documentos)',
        precio: '$3.99',
        duracion: 'Te durará unos 4 a 5 meses',
        ahorro: 'Ahorras 85% vs planes anuales'
      };
    } else if (facturasAlMes <= 15) {
      return {
        plan: 'Bolsa Estándar (60 Documentos)',
        precio: '$11.99',
        duracion: 'Te durará unos 4 meses sin caducidad',
        ahorro: 'Ahorras 75% pagando solo lo que emites'
      };
    } else {
      return {
        plan: 'Plan Mensual Profesional Ilimitado',
        precio: '$7.99 / mes',
        duracion: 'Emisión ilimitada + catálogo de clientes',
        ahorro: 'Ideal para alto volumen continuo'
      };
    }
  };

  const recomendacion = getRecomendacionCalculadora();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 pt-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-6 h-6" />
          <div className="text-sm">{toastMessage}</div>
        </div>
      )}

      {/* SUB-HEADER NAVEGACIÓN RÁPIDA (BARRA SUPERIOR PRINCIPAL DEL MÓDULO) */}
      <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 text-xs font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors pr-3 border-r border-slate-800"
              title="Volver a Grupo SARA"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">Grupo SARA</span>
            </Link>
            <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> SARA FACTURACIÓN
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href="#planes" className="px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300 hover:text-white">
              Planes & Precios
            </a>
            <button 
              type="button"
              onClick={() => setIsFirmaModalOpen(true)} 
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Obtener Firma Digital
            </button>
            <a href="#consulta-publica" className="px-3 py-1.5 rounded-lg hover:bg-white/[0.05] text-slate-300 hover:text-white flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Descargar Facturas
            </a>
            <button 
              type="button"
              onClick={handleIrAlPortal} 
              className="ml-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 text-[11px] sm:text-xs uppercase tracking-wider cursor-pointer"
            >
              <span>PORTAL FACTURACION ELECTRONICA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 1. HERO PRINCIPAL */}
      <section className="relative overflow-hidden py-20 md:py-28 px-6 lg:px-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Normativa SRI 2026 · Tarifa IVA 15% & 5% Construcción · Acreditado ARCOTEL</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Facturación Electrónica SRI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              Sin Contratos Forzosos & Firma en 15 Minutos
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Emite facturas y retenciones legales ante el SRI desde tu teléfono en 30 segundos. Paga solo lo que usas con <strong className="text-white">Planes Diarios ($1.50)</strong>, <strong className="text-white">Bolsas Prepago ($3.99)</strong> o tramita tu <strong className="text-white">Firma Electrónica (.p12)</strong> hoy mismo con verificación biométrica.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsFirmaModalOpen(true)}
              className="w-full sm:w-auto min-h-[52px] px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <KeyRound className="w-5 h-5" />
              Obtener Firma Electrónica ($18)
            </button>
            <a
              href="#planes"
              className="w-full sm:w-auto min-h-[52px] px-8 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <FileText className="w-5 h-5 text-blue-400" />
              Ver Planes de Facturación
            </a>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-white/[0.08] text-center">
            <div>
              <div className="font-display text-2xl md:text-3xl font-extrabold text-amber-400">100% Legal</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Homologado SRI Offline</div>
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl font-extrabold text-blue-400">15 Minutos</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Entrega Firma Express</div>
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl font-extrabold text-emerald-400">Desde $1.50</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Plan Diario 24h</div>
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl font-extrabold text-purple-400">Cero Java</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Factura desde Celular</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MÓDULO ESTRELLA: OBTENCIÓN DE FIRMA ELECTRÓNICA INTEGRADA (ONE-FLOW EXPRESS) */}
      <section id="firma-electronica" className="py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-slate-900 border-y border-white/[0.08] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Emisión Digital Acreditada ARCOTEL</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Obtención de Firma Electrónica Express
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Válida para el SRI, Quipux, Notarías, SENAE, Compras Públicas (SERCOP) y contratos en PDF. Proceso 100% online con biometría facial, creación automática de tu cuenta y Factura Electrónica con IVA 15% desglosado.
            </p>
          </div>

          {/* Tarjetas de Planes Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Persona Natural */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Desde $18.00 USD
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Persona Natural</h3>
                <p className="text-xs text-slate-400 mt-1">Profesionales, arquitectos, ingenieros, técnicos y comerciantes.</p>

                <div className="mt-6 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Archivo <strong>.p12 descargable</strong> + Bóveda Cloud SARA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Vigencia: 1 Año ($18), 2 Años ($30), 5 Años ($55)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-400 font-bold">15 facturas electrónicas GRATIS incluidas</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Subtotal: $15.65 + IVA 15%: $2.35</span>
                  <span className="font-display text-2xl font-black text-amber-400 font-mono">$18.00 <span className="text-xs text-slate-400 font-normal">/ 1 año</span></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFirmaModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Solicitar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Persona Jurídica */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-amber-400/40 transition-all shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Desde $22.00 USD
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Persona Jurídica (Empresa)</h3>
                <p className="text-xs text-slate-400 mt-1">Representantes legales de Compañías S.A., Cía. Ltda., S.A.S. o Entidades.</p>

                <div className="mt-6 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Emisión con Razón Social y RUC de la Empresa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Vigencia: 1 Año ($22), 2 Años ($38), 5 Años ($65)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-400 font-bold">15 facturas electrónicas GRATIS incluidas</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Subtotal: $19.13 + IVA 15%: $2.87</span>
                  <span className="font-display text-2xl font-black text-amber-400 font-mono">$22.00 <span className="text-xs text-slate-400 font-normal">/ 1 año</span></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFirmaModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Solicitar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Gran Botón CTA Central para abrir el Modal */}
          <div className="text-center bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 p-8 rounded-3xl">
            <h3 className="font-display text-2xl font-black text-white mb-2">
              ¿Listo para obtener tu Firma Electrónica hoy mismo?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">
              Abre el formulario express en modal para ingresar tus datos, subir tus fotos con vista previa real y pagar en segundos con DeUna, Tarjeta o Transferencia.
            </p>
            <button
              type="button"
              onClick={() => setIsFirmaModalOpen(true)}
              className="min-h-[54px] px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 mx-auto active:scale-98 transition-all cursor-pointer"
            >
              <KeyRound className="w-5 h-5" />
              <span>Abrir Formulario de Solicitud en Modal Express</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. CALCULADORA INTERACTIVA DE AHORRO */}
      <section className="py-20 px-6 lg:px-12 bg-slate-950">
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-white/[0.08] p-8 md:p-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Calculadora Inteligente</span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2">
              ¿Cuánto emites al mes? Mira cuánto ahorras
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              No pagues suscripciones anuales caras si solo emites pocas facturas por honorarios o proyectos.
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-300 uppercase">Facturas estimadas al mes:</span>
              <span className="font-display text-3xl font-extrabold text-amber-400 font-mono">{facturasAlMes} docs</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={facturasAlMes}
              onChange={(e) => setFacturasAlMes(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 fact./mes</span>
              <span>15 fact./mes</span>
              <span>30 fact./mes</span>
              <span>50+ fact./mes</span>
            </div>
          </div>

          {/* Resultado de la Recomendación */}
          <div className="mt-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-2xl mx-auto">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold block mb-1">Tu Plan Recomendado</span>
              <div className="font-display text-lg font-extrabold text-white">{recomendacion.plan}</div>
              <div className="text-xs text-slate-300 mt-1">{recomendacion.duracion} · <strong className="text-emerald-400">{recomendacion.ahorro}</strong></div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-2xl font-extrabold text-amber-400 font-mono">{recomendacion.precio}</div>
              <a
                href="#planes"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 mt-1 uppercase"
              >
                Ver planes <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TABLA DE PLANES FLEXIBLES & BOLSAS DE FACTURAS */}
      <section id="planes" className="py-20 md:py-28 px-6 lg:px-12 bg-slate-900/60 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Precios Transparentes</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
              Planes por Días, Semanas & Bolsas de Facturas
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Elige entre planes de 24 horas o 7 días para liquidar trabajos específicos, paquetes de facturas sin caducidad o suscripciones completas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Plan 1: Plan Diario */}
            <div className="rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-400/40 p-6 sm:p-8 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 uppercase">
                  Plan por Día (24 Horas)
                </span>
                <h3 className="font-display text-xl font-extrabold text-white mt-3 mb-1">Plan Diario 24h</h3>
                <p className="text-xs text-slate-400 mb-6">Emisión ilimitada durante 24 horas continuas. Ideal para liquidar trabajos urgentes de fin de semana.</p>
                <div className="font-display text-4xl font-extrabold text-amber-400 font-mono mb-6">
                  $1.50 <span className="text-xs text-slate-400 font-sans font-normal">/ 24 horas</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Facturas y retenciones ilimitadas por 24h</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> RIDE oficial en PDF con código QR</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Envío automático por correo al cliente</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Cero ataduras ni suscripciones forzosas</li>
                </ul>
              </div>
              <button
                onClick={() => abrirCheckout({ title: 'Plan Diario (24 Horas) Facturación', amount: 1.50, badgeText: 'SARA Plan Diario' })}
                className="w-full min-h-[46px] rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 border border-white/[0.08] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Contratar Plan Diario ($1.50)
              </button>
            </div>

            {/* Plan 2: Plan Semanal */}
            <div className="rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-400/40 p-6 sm:p-8 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 uppercase">
                  Plan Semanal (7 Días)
                </span>
                <h3 className="font-display text-xl font-extrabold text-white mt-3 mb-1">Plan Semanal Sprint</h3>
                <p className="text-xs text-slate-400 mb-6">Facturación ilimitada durante 7 días. Diseñado para fiscalizadores, consultores e inspectores.</p>
                <div className="font-display text-4xl font-extrabold text-amber-400 font-mono mb-6">
                  $4.50 <span className="text-xs text-slate-400 font-sans font-normal">/ 7 días</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 7 Días de facturación ilimitada</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Facturas, Retenciones y Guías de Remisión</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Catálogo rápido de clientes guardados</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Descarga masiva de XMLs y PDFs</li>
                </ul>
              </div>
              <button
                onClick={() => abrirCheckout({ title: 'Plan Semanal (7 Días) Facturación', amount: 4.50, badgeText: 'SARA Plan Semanal' })}
                className="w-full min-h-[46px] rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 border border-white/[0.08] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Contratar Plan Semanal ($4.50)
              </button>
            </div>

            {/* Plan 3: Bolsa Micro 15 (Destacado Prepago) */}
            <div className="rounded-3xl bg-slate-950 border-2 border-amber-400/60 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                ⭐ Más Popular Independientes
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                  Bolsa Prepago Sin Caducidad
                </span>
                <h3 className="font-display text-xl font-extrabold text-white mt-3 mb-1">Bolsa Micro (15 Docs)</h3>
                <p className="text-xs text-slate-400 mb-6">15 comprobantes electrónicos que se descuentan según emites. Sin fecha de vencimiento.</p>
                <div className="font-display text-4xl font-extrabold text-amber-400 font-mono mb-6">
                  $3.99 <span className="text-xs text-slate-400 font-sans font-normal">pago único</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 15 Comprobantes que NO caducan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Portal de consulta rápida para tus clientes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Múltiples tarifas de IVA (0%, 5%, 8%, 15%)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Reenvío por WhatsApp y correo en 1 clic</li>
                </ul>
              </div>
              <button
                onClick={() => abrirCheckout({ title: 'Bolsa Prepago Micro (15 Comprobantes)', amount: 3.99, badgeText: 'Bolsa Prepago' })}
                className="w-full min-h-[46px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
              >
                Comprar Bolsa 15 Docs ($3.99)
              </button>
            </div>

            {/* Plan 4: Bolsa Estándar 60 */}
            <div className="rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-400/40 p-6 sm:p-8 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 uppercase">
                  Bolsa Prepago
                </span>
                <h3 className="font-display text-xl font-extrabold text-white mt-3 mb-1">Bolsa Estándar (60 Docs)</h3>
                <p className="text-xs text-slate-400 mb-6">Para técnicos, ingenieros residentes y transportistas con emisión moderada regular.</p>
                <div className="font-display text-4xl font-extrabold text-amber-400 font-mono mb-6">
                  $11.99 <span className="text-xs text-slate-400 font-sans font-normal">pago único</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 60 Comprobantes sin caducidad</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Acceso móvil PWA de alta velocidad</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Reportes para declaración mensual del SRI</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Soporte WhatsApp prioritario</li>
                </ul>
              </div>
              <button
                onClick={() => abrirCheckout({ title: 'Bolsa Prepago Estándar (60 Comprobantes)', amount: 11.99, badgeText: 'Bolsa Prepago' })}
                className="w-full min-h-[46px] rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 border border-white/[0.08] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Comprar Bolsa 60 Docs ($11.99)
              </button>
            </div>

            {/* Plan 5: Mensual Pro */}
            <div className="rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-400/40 p-6 sm:p-8 flex flex-col justify-between transition-all">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 uppercase">
                  Suscripción Mensual
                </span>
                <h3 className="font-display text-xl font-extrabold text-white mt-3 mb-1">Plan Mensual Pro</h3>
                <p className="text-xs text-slate-400 mb-6">Facturación ilimitada mensual, cotizaciones, cuentas por cobrar y catálogo de productos.</p>
                <div className="font-display text-4xl font-extrabold text-amber-400 font-mono mb-6">
                  $7.99 <span className="text-xs text-slate-400 font-sans font-normal">/ mes</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Facturación ilimitada sin límites</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Buzón de compras con gastos deducibles</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Reportes ATS automáticos para el SRI</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Cancela en cualquier momento</li>
                </ul>
              </div>
              <button
                onClick={() => abrirCheckout({ title: 'Plan Mensual Profesional Ilimitado', amount: 7.99, badgeText: 'Suscripción Mensual', isSubscription: true, subscriptionInterval: 'month' })}
                className="w-full min-h-[46px] rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 border border-white/[0.08] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Suscribirme por $7.99/mes
              </button>
            </div>

            {/* Plan 6: Combo Anual + Firma Gratis */}
            <div className="rounded-3xl bg-gradient-to-b from-slate-950 to-blue-950/40 border border-blue-400/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                🔥 Combo Completo Todo Incluido
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">
                  Anual + Firma Electrónica
                </span>
                <h3 className="font-display text-xl font-extrabold text-white mt-3 mb-1">Anual VIP + Firma Gratis</h3>
                <p className="text-xs text-slate-400 mb-6">Un año entero de facturación ilimitada con la emisión de tu Firma Electrónica de 1 año incluida.</p>
                <div className="font-display text-4xl font-extrabold text-amber-400 font-mono mb-6">
                  $59.99 <span className="text-xs text-slate-400 font-sans font-normal">/ año</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 365 Días de facturación ilimitada</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 font-bold" /> FIRMA ELECTRÓNICA DE 1 AÑO INCLUIDA</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Bóveda de llaves cifrada AES-256</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Soporte tributario VIP prioritario</li>
                </ul>
              </div>
              <button
                onClick={() => abrirCheckout({ title: 'Plan Anual Corporativo + Firma Electrónica Gratis', amount: 59.99, badgeText: 'Combo Anual VIP', isSubscription: true, subscriptionInterval: 'year' })}
                className="w-full min-h-[46px] rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25"
              >
                Adquirir Combo Anual ($59.99)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PORTAL DE CONSULTA PÚBLICA ESTILO BUSPLACE */}
      <section id="consulta-publica" className="py-20 px-6 lg:px-12 bg-slate-950 border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-white/[0.08] p-8 md:p-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Search className="w-3.5 h-3.5" />
              <span>Portal de Descarga Pública</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              ¿Compraste a un profesional o empresa de SARA?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Ingresa tu Cédula o RUC para consultar y descargar tus facturas y retenciones en PDF (RIDE) y XML sin necesidad de registrarte.
            </p>
          </div>

          <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ingresa tu Cédula o RUC (10 o 13 dígitos)..."
              value={cedulaBusqueda}
              onChange={(e) => setCedulaBusqueda(e.target.value)}
              className="flex-1 min-h-[50px] px-4 rounded-2xl bg-slate-950 border border-white/[0.12] focus:border-amber-400 text-white font-mono text-sm outline-none"
            />
            <button
              onClick={() => {
                if (!cedulaBusqueda || cedulaBusqueda.length < 10) {
                  triggerToast('Por favor ingresa un número de Cédula o RUC válido (mínimo 10 dígitos).');
                  return;
                }
                setBusquedaRealizada(true);
              }}
              className="min-h-[50px] px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <Search className="w-4 h-4" /> Buscar Facturas
            </button>
          </div>

          {/* Resultado Simulado de Búsqueda */}
          {busquedaRealizada && (
            <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3 animate-in fade-in-50">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Comprobantes encontrados para: <strong className="text-white">{cedulaBusqueda}</strong>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      AUTORIZADA
                    </span>
                    <span className="font-mono text-xs font-bold text-white">Factura Nº 001-001-000000142</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Emisor: GRUPO SARA CONSTRUCTORA CIA. LTDA. · Fecha: 24/10/2026
                  </div>
                  <div className="font-mono text-xs text-amber-400 font-bold mt-1">
                    Total: $145.00 USD (IVA 15% incluido)
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => triggerToast('Descargando RIDE Oficial en formato PDF con Código QR...')}
                    className="min-h-[38px] px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white border border-white/[0.08] flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-red-400" /> RIDE (PDF)
                  </button>
                  <button 
                    onClick={() => triggerToast('Descargando comprobante firmado en formato XML oficial SRI...')}
                    className="min-h-[38px] px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white border border-white/[0.08] flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> XML Firmado
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. CALL TO ACTION FINAL */}
      <section className="py-20 px-6 text-center bg-gradient-to-t from-slate-900 to-slate-950 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            ¿Listo para emitir tu primera factura legal en segundos?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Únete a la plataforma que democratizó la facturación en el Ecuador. Sin tarifas ocultas, con respaldo fiduciario y cumplimiento normativo estricto.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleIrAlPortal}
              className="w-full sm:w-auto min-h-[50px] px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
            >
              PORTAL FACTURACION ELECTRONICA <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DE SOLICITUD DE FIRMA ELECTRÓNICA (.p12) EXPRESS */}
      <FirmaElectronicaModal
        isOpen={isFirmaModalOpen}
        onClose={() => setIsFirmaModalOpen(false)}
      />

      {/* CHECKOUT MODAL UNIFICADO */}
      <StandardCheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={(txId) => {
          setCheckoutModal((prev) => ({ ...prev, isOpen: false }));
          triggerToast(`¡Pago procesado con éxito! Transacción: ${txId}. Tu servicio ha sido activado.`);
        }}
        title={checkoutModal.title}
        amount={checkoutModal.amount}
        badgeText={checkoutModal.badgeText}
        isSubscription={checkoutModal.isSubscription}
        subscriptionInterval={checkoutModal.subscriptionInterval}
        items={[
          { label: checkoutModal.title, amount: checkoutModal.amount }
        ]}
      />

      {/* FOOTER OFICIAL SARA FACTURACIÓN ELECTRÓNICA */}
      <footer className="border-t border-white/10 bg-slate-950 py-10 px-4 md:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">GRUPO SARA</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">SARA Facturación SRI</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Portal Grupo SARA</Link>
            <Link href="/portal-comprobantes" className="hover:text-white transition-colors">Consulta RIDE</Link>
            <Link href="/modulos/facturacion/auth" className="hover:text-white transition-colors">Acceso Emisores</Link>
          </div>
          <p className="text-[11px] text-slate-500">
            © 2026 GRUPO SARA. Sistema Autorizado SRI Ecuador & Firma Digital Acreditada ARCOTEL.
          </p>
        </div>
      </footer>
    </div>
  );
}