'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Send,
  MoreVertical,
  Check,
  X
} from 'lucide-react';

export interface ClienteFacturacion {
  id: string;
  ruc: string;
  razon_social: string;
  email: string;
  telefono: string;
  plan_codigo: string;
  plan_nombre: string;
  tipo_plan: 'tiempo' | 'bolsa' | 'suscripcion';
  documentos_emitidos: number;
  documentos_limite: number; // 0 = ilimitado
  fecha_inicio: string;
  fecha_vencimiento: string; // ISO date string
  estado: 'ACTIVO' | 'POR_VENCER' | 'VENCIDO' | 'PENDIENTE_PAGO';
  pago_validado: boolean;
  monto_pagado: number;
}

const CLIENTES_DEMO: ClienteFacturacion[] = [
  {
    id: 'cli-1',
    ruc: '1792345678001',
    razon_social: 'ING. CARLOS MENDOZA ARQUITECTURA & CONSTRUCCIÓN',
    email: 'carlos.mendoza@mendozaconstr.ec',
    telefono: '+593998124912',
    plan_codigo: 'BOLSA_15_DOCS',
    plan_nombre: 'Bolsa Micro (15 Docs)',
    tipo_plan: 'bolsa',
    documentos_emitidos: 12,
    documentos_limite: 15,
    fecha_inicio: '2026-10-01',
    fecha_vencimiento: '2027-10-01', // Bolsa sin caducidad pero cerca del límite
    estado: 'POR_VENCER', // le quedan solo 3 docs
    pago_validado: true,
    monto_pagado: 3.99
  },
  {
    id: 'cli-2',
    ruc: '0104589234001',
    razon_social: 'ARQ. PATRICIA VEGA CONSULTORA VIAL',
    email: 'pvega@vegaconsulting.com',
    telefono: '+593987654321',
    plan_codigo: 'MENSUAL_PRO',
    plan_nombre: 'Plan Mensual Pro',
    tipo_plan: 'suscripcion',
    documentos_emitidos: 48,
    documentos_limite: 0,
    fecha_inicio: '2026-09-28',
    fecha_vencimiento: '2026-10-28', // vence en 3 días!
    estado: 'POR_VENCER',
    pago_validado: true,
    monto_pagado: 7.99
  },
  {
    id: 'cli-3',
    ruc: '1791245896001',
    razon_social: 'HORMIGONES DEL AUSTRO S.A.',
    email: 'gerencia@hormigonesaustro.com',
    telefono: '+593991234567',
    plan_codigo: 'COMBO_ANUAL_VIP',
    plan_nombre: 'Combo Anual VIP + Firma Gratis',
    tipo_plan: 'suscripcion',
    documentos_emitidos: 342,
    documentos_limite: 0,
    fecha_inicio: '2026-08-15',
    fecha_vencimiento: '2027-08-15',
    estado: 'ACTIVO',
    pago_validado: true,
    monto_pagado: 59.99
  },
  {
    id: 'cli-4',
    ruc: '1103498125001',
    razon_social: 'TOPOGRAFÍA & GEODESIA LOJA CIA. LTDA.',
    email: 'contacto@topolojaservicios.ec',
    telefono: '+593984561230',
    plan_codigo: 'PASE_DIARIO_24H',
    plan_nombre: 'Pase Diario 24h',
    tipo_plan: 'tiempo',
    documentos_emitidos: 6,
    documentos_limite: 0,
    fecha_inicio: '2026-10-23',
    fecha_vencimiento: '2026-10-24', // Vencido
    estado: 'VENCIDO',
    pago_validado: true,
    monto_pagado: 1.50
  },
  {
    id: 'cli-5',
    ruc: '0992384751001',
    razon_social: 'CONSTRUCTORA GUAYAS Y ASOCIADOS',
    email: 'compras@guayasasociados.ec',
    telefono: '+593978912345',
    plan_codigo: 'BOLSA_60_DOCS',
    plan_nombre: 'Bolsa Estándar (60 Docs)',
    tipo_plan: 'bolsa',
    documentos_emitidos: 0,
    documentos_limite: 60,
    fecha_inicio: '2026-10-25',
    fecha_vencimiento: '2027-10-25',
    estado: 'PENDIENTE_PAGO',
    pago_validado: false,
    monto_pagado: 11.99
  }
];

export default function AdminFacturacionClientesPage() {
  const [clientes, setClientes] = useState<ClienteFacturacion[]>(CLIENTES_DEMO);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const sincronizarClientes = async (mostrarToastAviso = false) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/facturacion/clientes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.clientes)) {
          setClientes(data.clientes);
          localStorage.setItem('sara_admin_clientes_facturacion', JSON.stringify(data.clientes));
          if (mostrarToastAviso) {
            mostrarToast('Clientes sincronizados en tiempo real con Supabase.');
          }
        }
      }
    } catch (err) {
      console.warn('Error sincronizando clientes:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sara_admin_clientes_facturacion');
    if (saved) {
      try {
        setClientes(JSON.parse(saved));
      } catch {}
    }
    sincronizarClientes(false);

    const interval = setInterval(() => {
      sincronizarClientes(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const persistirClientes = (nuevos: ClienteFacturacion[]) => {
    setClientes(nuevos);
    localStorage.setItem('sara_admin_clientes_facturacion', JSON.stringify(nuevos));
  };

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 4000);
  };

  const handleValidarPago = (id: string) => {
    const actualizados = clientes.map(c => {
      if (c.id === id) {
        return {
          ...c,
          pago_validado: true,
          estado: 'ACTIVO' as const
        };
      }
      return c;
    });
    persistirClientes(actualizados);
    mostrarToast('Pago validado con éxito. Plan del cliente activado de inmediato.');
  };

  const handleToggleEstado = (id: string) => {
    const actualizados = clientes.map(c => {
      if (c.id === id) {
        const nuevoEstado = c.estado === 'ACTIVO' ? 'VENCIDO' : 'ACTIVO';
        return { ...c, estado: nuevoEstado as any };
      }
      return c;
    });
    persistirClientes(actualizados);
    mostrarToast('Estado de suscripción actualizado.');
  };

  const handleRecargarBolsa = (id: string, docsAdicionales: number) => {
    const actualizados = clientes.map(c => {
      if (c.id === id) {
        return {
          ...c,
          documentos_limite: (c.documentos_limite || 0) + docsAdicionales,
          estado: 'ACTIVO' as const
        };
      }
      return c;
    });
    persistirClientes(actualizados);
    mostrarToast(`Se recargaron +${docsAdicionales} comprobantes a la cuenta.`);
  };

  const enviarWhatsAppRenovacion = (c: ClienteFacturacion) => {
    const diasRestantes = Math.ceil((new Date(c.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const docsRestantes = c.documentos_limite > 0 ? (c.documentos_limite - c.documentos_emitidos) : 'ilimitados';
    
    let mensaje = `Hola ${c.razon_social}, te saludamos de Grupo SARA Facturación Electrónica SRI. `;
    if (c.tipo_plan === 'bolsa') {
      mensaje += `Te informamos que a tu plan ${c.plan_nombre} le quedan únicamente ${docsRestantes} comprobantes disponibles. `;
    } else {
      mensaje += `Te informamos que tu suscripción ${c.plan_nombre} vence el ${c.fecha_vencimiento} (${diasRestantes <= 0 ? 'ya ha expirado' : `en ${diasRestantes} días`}). `;
    }
    mensaje += `Para mantener tu emisión continua y firma digital sin interrupciones, renueva tu plan directamente aquí: https://sara-constructora.vercel.app/facturacion-electronica#planes`;

    const cleanPhone = c.telefono.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    mostrarToast(`Mensaje de renovación generado para ${c.razon_social}`);
  };

  const enviarEmailRenovacion = (c: ClienteFacturacion) => {
    const subject = encodeURIComponent(`Recordatorio de Renovación Facturación SRI - Grupo SARA`);
    const body = encodeURIComponent(`Estimado/a ${c.razon_social},\n\nLe recordamos que su plan de facturación electrónica (${c.plan_nombre}) está próximo a vencer o agotar su saldo.\n\nPuede renovar en 1 minuto en https://sara-constructora.vercel.app/facturacion-electronica#planes\n\nSaludos cordiales,\nGrupo SARA Soporte Tributario`);
    window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
  };

  // Filtrado
  const clientesFiltrados = clientes.filter(c => {
    const matchBusqueda = c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.ruc.includes(busqueda) ||
                          c.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'TODOS' || c.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const totalPorVencer = clientes.filter(c => c.estado === 'POR_VENCER').length;
  const totalPendientesPago = clientes.filter(c => !c.pago_validado || c.estado === 'PENDIENTE_PAGO').length;
  const totalActivos = clientes.filter(c => c.estado === 'ACTIVO').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Toast Notificación */}
      {toastMensaje && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white font-bold shadow-2xl flex items-center gap-3 border border-amber-500/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm">{toastMensaje}</span>
        </div>
      )}

      {/* Header Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              Gestión de Cartera de Facturación
            </span>
            <span className="text-xs text-slate-500 font-medium">Control de Vencimientos & Renovaciones</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-600" />
            Clientes & Vencimientos de Facturación SRI
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitorea el consumo de comprobantes, vigencias de pases y envía recordatorios inmediatos por WhatsApp o correo para volver a contratar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => sincronizarClientes(true)}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Sincronizar en tiempo real con Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          <Link
            href="/modulos/facturacion"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Portal Emisor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Métricas de Cartera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Clientes</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{clientes.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">{totalActivos} con plan activo</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Próximos a Vencer</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{totalPorVencer}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">Enviar recordatorio urgente</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-blue-200 bg-blue-50/30 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Pendientes de Pago</div>
            <div className="text-3xl font-black text-blue-600 mt-1">{totalPendientesPago}</div>
            <div className="text-[11px] text-blue-700 font-semibold mt-1">Transferencias por validar</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tasa de Renovación</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">94.2%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Recurrencia mensual/anual</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por RUC, Razón Social o Email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['TODOS', 'ACTIVO', 'POR_VENCER', 'PENDIENTE_PAGO', 'VENCIDO'].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                filtroEstado === est 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {est === 'TODOS' ? 'Todos los Clientes' :
               est === 'ACTIVO' ? '● Activos' :
               est === 'POR_VENCER' ? '⚠️ Por Vencer' :
               est === 'PENDIENTE_PAGO' ? '💳 Pendiente Pago' : '⛔ Vencidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Contribuyente / RUC</th>
                <th className="px-5 py-4">Plan & Consumo</th>
                <th className="px-5 py-4">Vigencia / Vencimiento</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Pago</th>
                <th className="px-5 py-4 text-right">Acciones de Fidelización</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {clientesFiltrados.map((c) => {
                const diasParaVencer = Math.ceil((new Date(c.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const saldoBolsa = c.documentos_limite > 0 ? (c.documentos_limite - c.documentos_emitidos) : null;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Contribuyente */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900 text-xs">{c.razon_social}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">RUC: {c.ruc}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.email} · {c.telefono}</div>
                    </td>

                    {/* Plan y Consumo */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{c.plan_nombre}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {c.tipo_plan === 'bolsa' ? (
                          <div className="space-y-1">
                            <span>Saldo: <strong>{saldoBolsa}</strong> de {c.documentos_limite} docs</span>
                            <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${saldoBolsa && saldoBolsa <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(100, (c.documentos_emitidos / (c.documentos_limite || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span>{c.documentos_emitidos} docs emitidos (Ilimitado)</span>
                        )}
                      </div>
                    </td>

                    {/* Vigencia */}
                    <td className="px-5 py-4">
                      <div className="font-mono text-slate-700 font-semibold">{c.fecha_vencimiento}</div>
                      <div className="text-[11px] mt-0.5">
                        {c.estado === 'VENCIDO' ? (
                          <span className="text-rose-600 font-bold">Expiró hace {Math.abs(diasParaVencer)} días</span>
                        ) : c.tipo_plan === 'bolsa' ? (
                          <span className="text-slate-500">Saldo prepago continuo</span>
                        ) : diasParaVencer <= 7 ? (
                          <span className="text-amber-600 font-bold">¡Vence en {diasParaVencer} días!</span>
                        ) : (
                          <span className="text-emerald-600">{diasParaVencer} días restantes</span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' :
                        c.estado === 'POR_VENCER' ? 'bg-amber-100 text-amber-800' :
                        c.estado === 'PENDIENTE_PAGO' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.estado === 'ACTIVO' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {c.estado === 'POR_VENCER' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {c.estado === 'PENDIENTE_PAGO' && <Clock className="w-3 h-3 text-blue-600" />}
                        {c.estado === 'VENCIDO' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {c.estado.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Pago */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-900">${c.monto_pagado.toFixed(2)}</div>
                      {c.pago_validado ? (
                        <span className="text-[10px] text-emerald-600 font-semibold">● Validado</span>
                      ) : (
                        <button
                          onClick={() => handleValidarPago(c.id)}
                          className="mt-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs cursor-pointer"
                        >
                          Validar Pago
                        </button>
                      )}
                    </td>

                    {/* Acciones de Fidelización */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Botón WhatsApp Recordatorio */}
                        <button
                          onClick={() => enviarWhatsAppRenovacion(c)}
                          title="Enviar Recordatorio por WhatsApp"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Botón Email Recordatorio */}
                        <button
                          onClick={() => enviarEmailRenovacion(c)}
                          title="Enviar Email de Renovación"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Activo/Suspender */}
                        <button
                          onClick={() => handleToggleEstado(c.id)}
                          title={c.estado === 'ACTIVO' ? 'Suspender acceso' : 'Reactivar acceso'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            c.estado === 'ACTIVO' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {c.estado === 'ACTIVO' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* Recargar Bolsa */}
                        {c.tipo_plan === 'bolsa' && (
                          <button
                            onClick={() => handleRecargarBolsa(c.id, 15)}
                            title="Recargar +15 comprobantes"
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] cursor-pointer"
                          >
                            +15 Docs
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}