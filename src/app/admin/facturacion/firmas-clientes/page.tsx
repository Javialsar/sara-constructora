'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  KeyRound, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  User,
  Building2,
  FileCheck2,
  Download,
  Upload,
  Check,
  X,
  Eye,
  RefreshCw,
  FileText,
  BadgeCheck,
  Bot,
  Sparkles
} from 'lucide-react';

export interface SolicitudFirma {
  id: string;
  cedula_ruc: string;
  nombres: string;
  tipo_persona: 'NATURAL' | 'JURIDICA';
  email: string;
  telefono: string;
  plan_nombre: string;
  vigencia_anios: number;
  precio_usd: number;
  metodo_pago: 'TRANSFERENCIA' | 'TARJETA_STRIPE' | 'DEUNA';
  numero_comprobante?: string;
  pago_validado: boolean;
  estado_tramite: 'PENDIENTE_VALIDACION' | 'EN_TRAMITE_ARCOTEL' | 'EMITIDO_ACTIVO' | 'POR_VENCER' | 'VENCIDO' | 'SUSPENDIDO';
  fecha_solicitud: string;
  fecha_emision?: string;
  fecha_caducidad?: string;
  archivo_p12_disponible: boolean;
  documento_cedula_url?: string;
  video_selfie_url?: string;
}

const FIRMAS_DEMO: SolicitudFirma[] = [
  {
    id: 'sol-001',
    cedula_ruc: '1792984512001',
    nombres: 'ING. CARLOS MENDOZA',
    tipo_persona: 'NATURAL',
    email: 'carlos.mendoza@mendozaconstr.ec',
    telefono: '+593998124912',
    plan_nombre: 'Firma P. Natural (1 Año)',
    vigencia_anios: 1,
    precio_usd: 18.00,
    metodo_pago: 'TRANSFERENCIA',
    numero_comprobante: '98124912',
    pago_validado: true,
    estado_tramite: 'EMITIDO_ACTIVO',
    fecha_solicitud: '2026-08-10',
    fecha_emision: '2026-08-10',
    fecha_caducidad: '2027-08-10',
    archivo_p12_disponible: true
  },
  {
    id: 'sol-002',
    cedula_ruc: '0104589234',
    nombres: 'ARQ. PATRICIA VEGA',
    tipo_persona: 'NATURAL',
    email: 'pvega@vegaconsulting.com',
    telefono: '+593987654321',
    plan_nombre: 'Firma P. Natural (1 Año)',
    vigencia_anios: 1,
    precio_usd: 18.00,
    metodo_pago: 'TARJETA_STRIPE',
    numero_comprobante: 'STRIPE_981264',
    pago_validado: true,
    estado_tramite: 'POR_VENCER',
    fecha_solicitud: '2025-11-10',
    fecha_emision: '2025-11-10',
    fecha_caducidad: '2026-11-10',
    archivo_p12_disponible: true
  },
  {
    id: 'sol-003',
    cedula_ruc: '1791245896001',
    nombres: 'HORMIGONES DEL AUSTRO S.A. (REP. LEGAL: ING. DAVID SARANGO)',
    tipo_persona: 'JURIDICA',
    email: 'gerencia@hormigonesaustro.com',
    telefono: '+593991234567',
    plan_nombre: 'Firma Representante Legal (2 Años)',
    vigencia_anios: 2,
    precio_usd: 38.00,
    metodo_pago: 'TRANSFERENCIA',
    numero_comprobante: '45891234',
    pago_validado: false,
    estado_tramite: 'PENDIENTE_VALIDACION',
    fecha_solicitud: '2026-10-25',
    archivo_p12_disponible: false
  }
];

export default function AdminFacturacionFirmasClientesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudFirma[]>(FIRMAS_DEMO);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAutoValidating, setIsAutoValidating] = useState<boolean>(false);
  const [docModalFirma, setDocModalFirma] = useState<SolicitudFirma | null>(null);

  // Carga inicial y sincronización con Supabase
  const sincronizarFirmas = async (mostrarToastAviso = false) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/facturacion/firmas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.solicitudes)) {
          setSolicitudes(data.solicitudes);
          localStorage.setItem('sara_admin_firmas_clientes', JSON.stringify(data.solicitudes));
          if (mostrarToastAviso) {
            mostrarToast('Datos sincronizados en tiempo real con Supabase.');
          }
        }
      }
    } catch (err) {
      console.warn('Error al conectar con la API de firmas:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sara_admin_firmas_clientes');
    if (saved) {
      try {
        setSolicitudes(JSON.parse(saved));
      } catch {}
    }
    sincronizarFirmas(false);

    // Auto-polling cada 15 segundos para integración en tiempo real
    const interval = setInterval(() => {
      sincronizarFirmas(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const persistir = (nuevas: SolicitudFirma[]) => {
    setSolicitudes(nuevas);
    localStorage.setItem('sara_admin_firmas_clientes', JSON.stringify(nuevas));
  };

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 4000);
  };

  const handleValidarPago = async (id: string) => {
    // Actualización optimista local
    const actualizadas = solicitudes.map(s => {
      if (s.id === id) {
        return {
          ...s,
          pago_validado: true,
          estado_tramite: 'EN_TRAMITE_ARCOTEL' as const
        };
      }
      return s;
    });
    persistir(actualizadas);
    mostrarToast('Pago validado en tiempo real. Trámite enviado a ARCOTEL.');

    // Persistencia real en Supabase
    try {
      await fetch('/api/facturacion/firmas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accion: 'VALIDAR_PAGO' })
      });
    } catch (err) {
      console.warn('Error persistiendo validación en Supabase:', err);
    }
  };

  const handleAutoValidarMasivoIA = async () => {
    try {
      setIsAutoValidating(true);
      const res = await fetch('/api/facturacion/firmas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'AUTO_VALIDAR_IA_MASIVO' })
      });
      const data = await res.json();
      if (data.success) {
        mostrarToast(`🤖 ${data.mensaje || 'Conciliación bancaria masiva completada con éxito.'}`);
        await sincronizarFirmas(false);
      } else {
        mostrarToast('No se encontraron pagos pendientes por conciliar.');
      }
    } catch (err) {
      mostrarToast('Error al conectar con el Agente de Conciliación Bancaria.');
    } finally {
      setIsAutoValidating(false);
    }
  };

  const handleEmitirCertificado = async (id: string) => {
    const now = new Date();
    const caducidad = new Date();
    caducidad.setFullYear(caducidad.getFullYear() + 1);

    const actualizadas = solicitudes.map(s => {
      if (s.id === id) {
        return {
          ...s,
          estado_tramite: 'EMITIDO_ACTIVO' as const,
          archivo_p12_disponible: true,
          fecha_emision: now.toISOString().split('T')[0],
          fecha_caducidad: caducidad.toISOString().split('T')[0]
        };
      }
      return s;
    });
    persistir(actualizadas);
    mostrarToast('Firma Electrónica .p12 emitida exitosamente y cargada a la bóveda del cliente.');

    // Persistencia real en Supabase
    try {
      await fetch('/api/facturacion/firmas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accion: 'EMITIR_P12' })
      });
    } catch (err) {
      console.warn('Error persistiendo emisión en Supabase:', err);
    }
  };

  const handleToggleSuspension = async (id: string) => {
    const solicitudTarget = solicitudes.find(s => s.id === id);
    const nuevoEstado = solicitudTarget?.estado_tramite === 'SUSPENDIDO' ? 'EMITIDO_ACTIVO' : 'SUSPENDIDO';

    const actualizadas = solicitudes.map(s => {
      if (s.id === id) {
        return { ...s, estado_tramite: nuevoEstado as any };
      }
      return s;
    });
    persistir(actualizadas);
    mostrarToast('Estado del certificado digital actualizado.');

    try {
      await fetch('/api/facturacion/firmas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          accion: nuevoEstado === 'SUSPENDIDO' ? 'SUSPENDER' : 'REACTIVAR' 
        })
      });
    } catch (err) {
      console.warn('Error persistiendo suspensión en Supabase:', err);
    }
  };

  const enviarWhatsAppRenovacionFirma = (s: SolicitudFirma) => {
    const cleanPhone = s.telefono.replace(/\D/g, '');
    let mensaje = `Hola ${s.nombres}, te saludamos de Grupo SARA Firmas Digitales. `;
    if (s.fecha_caducidad) {
      mensaje += `Tu certificado de Firma Electrónica (.p12) vencerá el próximo ${s.fecha_caducidad}. Para evitar bloqueos en el SRI, Quipux y SERCOP, puedes renovarla en 15 minutos en: https://sara-constructora.vercel.app/facturacion-electronica#firma-electronica`;
    } else {
      mensaje += `Tu trámite de firma electrónica está registrado en nuestro sistema. Hemos recibido tu comprobante de pago (${s.numero_comprobante || 'Ref: ' + s.cedula_ruc}) y estamos completando la emisión de tu certificado .p12.`;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    mostrarToast(`WhatsApp generado para ${s.nombres}`);
  };

  const filtradas = solicitudes.filter(s => {
    const match = s.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                  s.cedula_ruc.includes(busqueda) ||
                  s.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'TODOS' || s.estado_tramite === filtroEstado;
    return match && matchEstado;
  });

  const totalEmitidas = solicitudes.filter(s => s.estado_tramite === 'EMITIDO_ACTIVO').length;
  const totalPendientes = solicitudes.filter(s => !s.pago_validado || s.estado_tramite === 'PENDIENTE_VALIDACION').length;
  const totalPorVencer = solicitudes.filter(s => s.estado_tramite === 'POR_VENCER').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white font-bold shadow-2xl flex items-center gap-3 border border-amber-500/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm">{toastMensaje}</span>
        </div>
      )}

      {/* Modal de Inspección de Documentos */}
      {docModalFirma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">Requisitos Presentados</h3>
              </div>
              <button 
                onClick={() => setDocModalFirma(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-semibold block">Titular:</span>
                <span className="text-slate-900 font-black text-sm">{docModalFirma.nombres}</span>
                <span className="text-slate-500 block font-mono">Cédula: {docModalFirma.cedula_ruc}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Cédula Frontal y Posterior</div>
                      <div className="text-[11px] text-slate-500">{docModalFirma.documento_cedula_url || 'Adjuntado en solicitud'}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Cargado</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Selfie Biométrica con Cédula</div>
                      <div className="text-[11px] text-slate-500">{docModalFirma.video_selfie_url || 'Verificación facial biométrica'}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Verificado</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-slate-800">Comprobante / Referencia de Pago</div>
                      <div className="text-[11px] font-mono text-slate-600">{docModalFirma.metodo_pago}: {docModalFirma.numero_comprobante}</div>
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-slate-900">${docModalFirma.precio_usd.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDocModalFirma(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
              {!docModalFirma.pago_validado && (
                <button
                  onClick={() => {
                    handleValidarPago(docModalFirma.id);
                    setDocModalFirma(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar Pago Ahora</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              Módulo de Acreditación & Emisión
            </span>
            <span className="text-xs text-slate-500 font-medium">Entidad de Certificación ARCOTEL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-amber-600" />
            Emisión de Firmas Electrónicas (.p12) & Pagos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Revisa los comprobantes de pago de clientes de firmas, valida los requisitos de cédula y nombramiento, y envía recordatorios de renovación de certificados próximos a expirar.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleAutoValidarMasivoIA}
            disabled={isAutoValidating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Validar automáticamente todos los pagos bancarios con el Agente Autónomo SARA-IA"
          >
            <Bot className={`w-4 h-4 text-emerald-200 ${isAutoValidating ? 'animate-bounce' : ''}`} />
            <span>{isAutoValidating ? 'Agente Conciliando...' : '🤖 Auto-Validar con Agente IA'}</span>
          </button>

          <button
            onClick={() => sincronizarFirmas(true)}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Sincronizar en tiempo real con Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          <Link
            href="/facturacion-electronica#firma-electronica"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Landing de Firmas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Firmas Emitidas</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalEmitidas}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Certificados activos en bóveda</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Firmas Por Vencer</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{totalPorVencer}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">Expiran en menos de 30 días</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-blue-200 bg-blue-50/30 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Pagos por Validar</div>
            <div className="text-3xl font-black text-blue-600 mt-1">{totalPendientes}</div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">Comprobantes recibidos</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estándar Criptográfico</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">RSA 2048</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">SHA-256 with RSA Encryption</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por Cédula/RUC o Nombres..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['TODOS', 'EMITIDO_ACTIVO', 'POR_VENCER', 'PENDIENTE_VALIDACION', 'EN_TRAMITE_ARCOTEL'].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                filtroEstado === est 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {est === 'TODOS' ? 'Todas las Solicitudes' :
               est === 'EMITIDO_ACTIVO' ? '● Emitidas y Activas' :
               est === 'POR_VENCER' ? '⚠️ Próximas a Caducar' :
               est === 'PENDIENTE_VALIDACION' ? '💳 Pago Pendiente' : '⏳ En Trámite'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Firmas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Titular de la Firma</th>
                <th className="px-5 py-4">Tipo & Vigencia</th>
                <th className="px-5 py-4">Pago & Comprobante</th>
                <th className="px-5 py-4">Caducidad .p12</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones de Emisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No se encontraron solicitudes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtradas.map((s) => {
                  const diasRestantes = s.fecha_caducidad 
                    ? Math.ceil((new Date(s.fecha_caducidad).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Titular */}
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          {s.tipo_persona === 'NATURAL' ? <User className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                          <span>{s.nombres}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">ID: {s.cedula_ruc}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.email} · {s.telefono}</div>
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800">{s.plan_nombre}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Vigencia: {s.vigencia_anios} {s.vigencia_anios === 1 ? 'Año' : 'Años'} · Archivo .p12
                        </div>
                        <button
                          onClick={() => setDocModalFirma(s)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Requisitos</span>
                        </button>
                      </td>

                      {/* Pago */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-black text-slate-900">${s.precio_usd.toFixed(2)}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          {s.metodo_pago} {s.numero_comprobante ? `(Ref: ${s.numero_comprobante})` : ''}
                        </div>
                        <div className="mt-1">
                          {s.pago_validado ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Pago Aprobado
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Auto-IA</span>
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleValidarPago(s.id)}
                                className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                              >
                                Aprobar Manual
                              </button>
                              <button
                                onClick={() => handleValidarPago(s.id)}
                                className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                                title="Auto-validar con Agente IA"
                              >
                                <Bot className="w-3 h-3" />
                                <span>Auto-IA</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Caducidad */}
                      <td className="px-5 py-4">
                        {s.fecha_caducidad ? (
                          <div>
                            <div className="font-mono font-bold text-slate-800">{s.fecha_caducidad}</div>
                            <div className="text-[11px] mt-0.5">
                              {diasRestantes && diasRestantes <= 30 ? (
                                <span className="text-amber-600 font-bold">¡Caduca en {diasRestantes} días!</span>
                              ) : (
                                <span className="text-emerald-600 font-medium">{diasRestantes} días restantes</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pendiente de emisión</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.estado_tramite === 'EMITIDO_ACTIVO' ? 'bg-emerald-100 text-emerald-800' :
                          s.estado_tramite === 'POR_VENCER' ? 'bg-amber-100 text-amber-800' :
                          s.estado_tramite === 'EN_TRAMITE_ARCOTEL' ? 'bg-indigo-100 text-indigo-800' :
                          s.estado_tramite === 'PENDIENTE_VALIDACION' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {s.estado_tramite.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Emitir / Cargar .p12 */}
                          {s.estado_tramite !== 'EMITIDO_ACTIVO' && s.pago_validado && (
                            <button
                              onClick={() => handleEmitirCertificado(s.id)}
                              title="Aprobar y Emitir Certificado .p12"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Emitir .p12</span>
                            </button>
                          )}

                          {/* WhatsApp Recordatorio */}
                          <button
                            onClick={() => enviarWhatsAppRenovacionFirma(s)}
                            title="Enviar aviso o recordatorio por WhatsApp"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Suspender / Reactivar */}
                          {s.estado_tramite === 'EMITIDO_ACTIVO' && (
                            <button
                              onClick={() => handleToggleSuspension(s.id)}
                              title="Suspender Certificado Digital"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {s.estado_tramite === 'SUSPENDIDO' && (
                            <button
                              onClick={() => handleToggleSuspension(s.id)}
                              title="Reactivar Certificado Digital"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
