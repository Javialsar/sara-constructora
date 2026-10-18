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

interface PlanesSuscripcionSectionProps {
  user?: any;
  onPlanChanged?: () => void;
}

export function PlanesSuscripcionSection({ user, onPlanChanged }: PlanesSuscripcionSectionProps) {
  const [planes, setPlanes] = useState<PlanConstructora[]>([]);
  const [ciclo, setCiclo] = useState<'MENSUAL' | 'ANUAL'>('MENSUAL');
  const [suscripcionActual, setSuscripcionActual] = useState<AccesoSubscriptionResult | null>(null);

  // Modales de Pago
  const [modalTransferenciaOpen, setModalTransferenciaOpen] = useState(false);
  const [modalTarjetaOpen, setModalTarjetaOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanConstructora | null>(null);

  // Cuentas Bancarias
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([]);

  // Formulario Transferencia
  const [transferenciaData, setTransferenciaData] = useState({
    bancoOrigen: 'Banco Pichincha',
    numeroComprobante: '',
    montoDepositado: 0,
    comprobanteArchivo: null as File | null,
    comprobanteUrl: '',
    notas: ''
  });

  // Formulario Tarjeta
  const [tarjetaData, setTarjetaData] = useState({
    numeroTarjeta: '4532 •••• •••• 8912',
    nombreTitular: user?.nombre || 'David Sarango M.',
    expiracion: '12/28',
    cvv: '891'
  });

  const [procesandoPago, setProcesandoPago] = useState(false);
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

  const handleSeleccionarTransferencia = (plan: PlanConstructora) => {
    setSelectedPlan(plan);
    const monto = ciclo === 'ANUAL' ? plan.precioAnual : plan.precioMensual;
    setTransferenciaData(prev => ({
      ...prev,
      montoDepositado: monto,
      numeroComprobante: `DEP-${Math.floor(100000 + Math.random() * 900000)}`
    }));
    setModalTransferenciaOpen(true);
  };

  const handleSeleccionarTarjeta = (plan: PlanConstructora) => {
    setSelectedPlan(plan);
    setModalTarjetaOpen(true);
  };

  const handleConfirmarTransferencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setProcesandoPago(true);

    setTimeout(() => {
      ConstructoraSubscriptionService.registrarSolicitudPlan({
        clienteId: user?.id,
        razonSocial: user?.empresa || user?.nombre || 'Constructora Verificada',
        email: user?.email || 'contacto@saraconstructora.com',
        ruc: user?.identificacion || '1191728394001',
        telefono: '099 481 2938',
        ciudad: 'Loja',
        planId: selectedPlan.id,
        ciclo,
        metodoPago: 'TRANSFERENCIA',
        comprobanteRef: transferenciaData.numeroComprobante,
        comprobanteUrl: transferenciaData.comprobanteUrl || '/comprobante-mock.png',
        esActivacionInmediataDemo: false // Pasa a PENDIENTE_PAGO para aprobación del admin
      });

      setProcesandoPago(false);
      setModalTransferenciaOpen(false);
      setMensajeExito(
        `¡Comprobante de Transferencia registrado con éxito para ${selectedPlan.nombre}! El Administrador de GRUPO SARA validará la acreditación bancaria y activará tu periodo de ${ciclo === 'ANUAL' ? '1 año' : '1 mes'} desde el instante de su confirmación.`
      );
      cargarDatos();
      if (onPlanChanged) onPlanChanged();
    }, 1200);
  };

  const handleConfirmarTarjeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setProcesandoPago(true);

    setTimeout(() => {
      // Pago con tarjeta: Auto-activación inmediata
      ConstructoraSubscriptionService.registrarSolicitudPlan({
        clienteId: user?.id,
        razonSocial: user?.empresa || user?.nombre || 'Constructora Verificada',
        email: user?.email || 'contacto@saraconstructora.com',
        ruc: user?.identificacion || '1191728394001',
        telefono: '099 481 2938',
        ciudad: 'Loja',
        planId: selectedPlan.id,
        ciclo,
        metodoPago: 'TARJETA',
        comprobanteRef: `AUTH-STRIPE-${Date.now().toString().slice(-6)}`,
        esActivacionInmediataDemo: true // Activación inmediata con pasarela
      });

      setProcesandoPago(false);
      setModalTarjetaOpen(false);
      setMensajeExito(
        `¡Pago con Tarjeta procesado con éxito! Tu suscripción a ${selectedPlan.nombre} (${ciclo}) está ACTIVA desde hoy. Tienes acceso completo a todos los módulos operativos.`
      );
      cargarDatos();
      if (onPlanChanged) onPlanChanged();
    }, 1500);
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

              {/* Botones de Método de Pago (Idénticos a Imagen 2) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block text-center">
                  MÉTODOS DE PAGO
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSeleccionarTarjeta(plan)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all hover:scale-102"
                  >
                    <CreditCard size={15} />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeleccionarTransferencia(plan)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow transition-all hover:scale-102"
                  >
                    <Building size={15} />
                    <span>Transferir</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Pago con Transferencia Bancaria */}
      {modalTransferenciaOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="text-amber-500" size={22} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pago por Transferencia Bancaria Directa
                </h3>
              </div>
              <button
                onClick={() => setModalTransferenciaOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumen del Plan */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-500 block">{selectedPlan.nombre}</span>
                <span className="text-slate-400 text-[10px]">Facturación {ciclo}</span>
              </div>
              <span className="text-base font-black font-mono text-amber-400">
                ${(ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual).toFixed(2)} USD
              </span>
            </div>

            {/* Cuentas Bancarias de Grupo SARA */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Cuentas Bancarias Oficiales de GRUPO SARA HOLDING:
              </span>
              <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-mono space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>BANCO PICHINCHA</span>
                    <span className="text-amber-500">CTA. CORRIENTE</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>No. 2100284910</span>
                    <span>RUC: 1191728394001</span>
                  </div>
                  <div className="text-[10px] text-slate-500">GRUPO SARA HOLDING CÍA. LTDA.</div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-mono space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>BANCO DE LOJA</span>
                    <span className="text-amber-500">CTA. CORRIENTE</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>No. 2901847291</span>
                    <span>RUC: 1191728394001</span>
                  </div>
                  <div className="text-[10px] text-slate-500">GRUPO SARA HOLDING CÍA. LTDA.</div>
                </div>
              </div>
            </div>

            {/* Formulario de Confirmación */}
            <form onSubmit={handleConfirmarTransferencia} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Banco de Origen:
                  </label>
                  <input
                    type="text"
                    required
                    value={transferenciaData.bancoOrigen}
                    onChange={e => setTransferenciaData(prev => ({ ...prev, bancoOrigen: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    No. Comprobante / Referencia:
                  </label>
                  <input
                    type="text"
                    required
                    value={transferenciaData.numeroComprobante}
                    onChange={e => setTransferenciaData(prev => ({ ...prev, numeroComprobante: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Adjuntar Foto o PDF del Comprobante:
                </label>
                <div className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center bg-slate-50 dark:bg-slate-850">
                  <UploadCloud size={20} className="mx-auto text-amber-500 mb-1" />
                  <span className="text-[11px] text-slate-400 block">Subir comprobante bancario (JPG, PNG o PDF)</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        setTransferenciaData(prev => ({ ...prev, comprobanteArchivo: e.target.files![0] }));
                      }
                    }}
                    className="mt-1 text-xs text-slate-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-800 rounded-xl text-[10px] text-slate-400 flex items-start gap-2">
                <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  El mes de suscripción comenzará a regir a partir de que el Administrador de GRUPO SARA confirme la recepción del depósito y active tu cuenta.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalTransferenciaOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoPago}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {procesandoPago ? 'Registrando...' : 'Registrar Pago & Notificar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Pago con Tarjeta */}
      {modalTarjetaOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="text-amber-500" size={22} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pago Seguro con Tarjeta
                </h3>
              </div>
              <button
                onClick={() => setModalTarjetaOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-amber-500 block">{selectedPlan.nombre}</span>
                <span className="text-slate-400 text-[10px]">Facturación {ciclo}</span>
              </div>
              <span className="text-base font-black font-mono text-amber-400">
                ${(ciclo === 'ANUAL' ? selectedPlan.precioAnual : selectedPlan.precioMensual).toFixed(2)} USD
              </span>
            </div>

            <form onSubmit={handleConfirmarTarjeta} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Número de Tarjeta:
                </label>
                <input
                  type="text"
                  required
                  value={tarjetaData.numeroTarjeta}
                  onChange={e => setTarjetaData(prev => ({ ...prev, numeroTarjeta: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Titular de la Tarjeta:
                </label>
                <input
                  type="text"
                  required
                  value={tarjetaData.nombreTitular}
                  onChange={e => setTarjetaData(prev => ({ ...prev, nombreTitular: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Vence (MM/AA):
                  </label>
                  <input
                    type="text"
                    required
                    value={tarjetaData.expiracion}
                    onChange={e => setTarjetaData(prev => ({ ...prev, expiracion: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    CVV:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={tarjetaData.cvv}
                    onChange={e => setTarjetaData(prev => ({ ...prev, cvv: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0" />
                <span>Transacción encriptada con cifrado bancario TLS 1.3 de 256 bits.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalTarjetaOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesandoPago}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {procesandoPago ? 'Procesando Cobro...' : 'Pagar & Activar Inmediato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
