'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  CreditCard, 
  Building, 
  UploadCloud, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowRight,
  HardHat,
  Warehouse,
  Layers,
  Lock,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { 
  ConstructoraAdminService, 
  PlanConstructora, 
  ClienteSuscritoConstructora 
} from '@/lib/services/constructoraAdminService';
import { 
  ConstructoraSubscriptionService, 
  AccesoSubscriptionResult 
} from '@/lib/services/constructoraSubscriptionService';
import { getCuentasBancarias, CuentaBancariaEmpresa } from '@/lib/services/datosBancariosService';
import SaraUnifiedPaymentGatewayModal from '@/components/pagos/SaraUnifiedPaymentGatewayModal';

interface PlanesSuscripcionSectionProps {
  user?: any;
  onPlanChanged?: () => void;
}

export function PlanesSuscripcionSection({ user, onPlanChanged }: PlanesSuscripcionSectionProps) {
  const [planes, setPlanes] = useState<PlanConstructora[]>([]);
  const [ciclo, setCiclo] = useState<'MENSUAL' | 'ANUAL'>('MENSUAL');
  const [suscripcionActual, setSuscripcionActual] = useState<AccesoSubscriptionResult | null>(null);

  // Pasarela Unificada de Pago Digital (Estándar Imagen 1)
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanConstructora | null>(null);

  // Cuentas Bancarias
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([]);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    const listadoPlanes = ConstructoraAdminService.getPlanes();
    setPlanes(listadoPlanes);

    const sub = ConstructoraSubscriptionService.verificarAccesoModulos(user?.email || user?.id);
    setSuscripcionActual(sub);

    const ctas = await getCuentasBancarias();
    setCuentasBancarias(ctas);
  };

  const handlePagarPlan = (plan: PlanConstructora) => {
    setSelectedPlan(plan);
    setModalPagoOpen(true);
  };

  const cliente = suscripcionActual?.cliente;
  const planActualId = cliente?.planId;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Estado Actual de la Suscripción */}
      {suscripcionActual && (
        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          suscripcionActual.hasAccess
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-amber-500/40 text-white ring-1 ring-amber-500/30'
            : suscripcionActual.motivoBloqueo === 'PENDIENTE_ACTIVACION'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full animate-ping ${
                suscripcionActual.hasAccess ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs font-mono uppercase tracking-wider font-bold">
                {suscripcionActual.hasAccess ? 'Suscripción Activa y Vigente' : `Estado: ${cliente?.estado || 'INACTIVO'}`}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
                {cliente?.planNombre || 'Sin Plan Asignado'} ({cliente?.cicloFacturacion || 'MENSUAL'})
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black tracking-tight text-white">
              {suscripcionActual.mensaje}
            </h3>
            <p className="text-xs text-slate-400">
              {cliente?.fechaInicio && (
                <span>Activado el: <b className="text-white">{cliente.fechaInicio}</b> • </span>
              )}
              {cliente?.fechaVencimiento && (
                <span>Vence el: <b className="text-amber-400">{cliente.fechaVencimiento}</b></span>
              )}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {suscripcionActual.hasAccess ? (
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                  {suscripcionActual.diasRestantes}
                </span>
                <span className="text-xs text-slate-400 block">Días de Servicio</span>
              </div>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
                Activación Requerida
              </span>
            )}
          </div>
        </div>
      )}

      {mensajeExito && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={20} className="shrink-0" />
          <div className="text-xs font-medium">{mensajeExito}</div>
        </div>
      )}

      {/* Encabezado y Toggle de Facturación */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase">
          <Sparkles size={14} />
          <span>Planes Oficiales SaaS Constructora</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Elige el plan ideal para tus proyectos de obra civil
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Potencia tu control de presupuestos, compras, multibodega y contabilidad fiscal SRI. Tu plan mensual o anual inicia el día de la activación oficial por GRUPO SARA.
        </p>

        {/* Toggle Mensual / Anual */}
        <div className="inline-flex items-center p-1.5 bg-slate-200 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCiclo('MENSUAL')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              ciclo === 'MENSUAL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Facturación Mensual
          </button>
          <button
            type="button"
            onClick={() => setCiclo('ANUAL')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              ciclo === 'ANUAL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Facturación Anual</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono uppercase">
              Ahorra 2 Meses
            </span>
          </button>
        </div>
      </div>

      {/* Grid de Planes creados en Admin (Imagen 4) con Botones de Pago (Imagen 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
        {planes.map((plan) => {
          const isCurrentPlan = planActualId === plan.id && suscripcionActual?.hasAccess;
          const isRecommended = plan.esRecomendado || plan.codigo === 'PRO-PYME';
          const precio = ciclo === 'ANUAL' ? plan.precioAnual : plan.precioMensual;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 transition-all relative flex flex-col justify-between ${
                isRecommended
                  ? 'bg-slate-950 dark:bg-black border-2 border-amber-500/80 shadow-2xl shadow-amber-500/10 transform md:-translate-y-2'
                  : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400'
              }`}
            >
              {/* Badges superiores */}
              {isCurrentPlan && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase z-10 shadow-lg">
                  TU PLAN ACTUAL
                </span>
              )}

              {!isCurrentPlan && isRecommended && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase z-10 shadow-lg">
                  RECOMENDADO & MÁS POPULAR
                </span>
              )}

              <div>
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
                    CÓDIGO: {plan.codigo}
                  </span>
                  <h3 className={`text-xl font-bold mt-1 ${isRecommended ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {plan.descripcion}
                  </p>
                </div>

                {/* Precios */}
                <div className="my-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black font-mono tracking-tight ${isRecommended ? 'text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      ${precio.toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-400 font-sans font-bold">
                      /{ciclo === 'ANUAL' ? 'año' : 'mes'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {ciclo === 'ANUAL' ? (
                      <span className="text-emerald-400 font-semibold">Equivalente a ${(precio / 12).toFixed(2)} / mes facturado anualmente</span>
                    ) : (
                      <span>O anual con descuento: <b className="text-amber-400">${plan.precioAnual}/año</b></span>
                    )}
                  </p>
                </div>

                {/* Capacidades clave */}
                <div className="grid grid-cols-3 gap-2 py-3 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-center font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">OBRAS</span>
                    <span className="font-bold text-slate-900 dark:text-white">{plan.limiteProyectos}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">USUARIOS</span>
                    <span className="font-bold text-slate-900 dark:text-white">{plan.limiteUsuarios}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">ESPACIO</span>
                    <span className="font-bold text-slate-900 dark:text-white">{plan.almacenamientoGb} GB</span>
                  </div>
                </div>

                {/* Lista de Módulos Incluidos */}
                <div className="space-y-2 mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Módulos y Beneficios Incluidos:
                  </p>
                  {plan.modulosIncluidos.map((mod, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <Check size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className={isRecommended ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}>
                        {mod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Único de Pago (Diseño Imagen 2: Solo un botón pagar) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handlePagarPlan(plan)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CreditCard size={16} />
                  <span>Pagar Plan ({ciclo === 'ANUAL' ? `$${(plan.precioAnual / 12).toFixed(0)}` : `$${plan.precioMensual}`}/mes)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pasarela Unificada de Pago Digital (Estándar Imagen 1 & sara-unified-payment-gateway) */}
      {modalPagoOpen && selectedPlan && (
        <SaraUnifiedPaymentGatewayModal
          isOpen={modalPagoOpen}
          onClose={() => setModalPagoOpen(false)}
          modulo="CONSTRUCTORA"
          referenciaOperacionId={`PLAN-${selectedPlan.id}-${Date.now().toString().slice(-4)}`}
          tituloModal="Pasarela de Pago Digital · GRUPO SARA"
          subtituloModal={`Activación Plan ${selectedPlan.nombre} (${ciclo})`}
          amount={ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual}
          beneficiario={{
            tipo: 'sara_holding',
            etiquetaRol: 'Plan de Suscripción Constructora:',
            nombreCompleto: 'GRUPO SARA INVERSIONES S.A.S.',
            identificacion: '1792984512001',
            subtitulo: `Suscripción ${selectedPlan.nombre} · Facturación ${ciclo}`,
            bancoNombre: 'Banco Pichincha',
            tipoCuenta: 'Cuenta Corriente',
            numeroCuenta: '2100258941',
            email: 'pagos@gruposara.com',
            telefonoContacto: '+593 99 284 9102'
          }}
          desglose={{
            subtotalUSD: Number(((ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual) / 1.15).toFixed(2)),
            tarifaIvaPct: 15,
            montoIvaUSD: Number(((ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual) - ((ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual) / 1.15)).toFixed(2)),
            totalPagarUSD: ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual
          }}
          onPaymentSuccess={(resultado) => {
            ConstructoraSubscriptionService.registrarSolicitudPlan({
              clienteId: user?.id,
              razonSocial: user?.empresa || user?.nombre || 'Constructora Verificada',
              email: user?.email || 'contacto@saraconstructora.com',
              ruc: user?.identificacion || '1191728394001',
              telefono: '099 481 2938',
              ciudad: 'Quito',
              planId: selectedPlan.id,
              ciclo,
              metodoPago: resultado.metodo === 'tarjeta' ? 'TARJETA' : 'TRANSFERENCIA',
              comprobanteRef: resultado.referenciaComprobante,
              comprobanteUrl: resultado.voucherUrl || '/comprobante-mock.png',
              esActivacionInmediataDemo: true
            });
            setModalPagoOpen(false);
            setMensajeExito(
              `¡Pago procesado con éxito vía ${resultado.metodoNombre}! Tu suscripción a ${selectedPlan.nombre} (${ciclo}) está ACTIVA desde hoy. Tienes acceso completo a todos los módulos operativos.`
            );
            cargarDatos();
            if (onPlanChanged) onPlanChanged();
          }}
        />
      )}
    </div>
  );
}
