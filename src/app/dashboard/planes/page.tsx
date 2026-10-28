"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  CreditCard, 
  Building, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { getCuentasBancarias, CuentaBancariaEmpresa } from "@/lib/services/datosBancariosService";
import { createClient } from "@/lib/supabase/client";
import SaraUnifiedPaymentGatewayModal from "@/components/pagos/SaraUnifiedPaymentGatewayModal";

export default function PlanesPage() {
  const [currentPlan, setCurrentPlan] = useState("gratis");
  const [planes, setPlanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Pasarela Unificada de Pago Digital (Estándar Imagen 1)
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [notificacionExito, setNotificacionExito] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data } = await supabase
          .from("suscripciones_saas")
          .select("plan_id")
          .eq("user_id", authUser.id)
          .single();
        if (data?.plan_id) setCurrentPlan(data.plan_id);
      }

      const { data: planesData } = await supabase
        .from("planes_suscripcion")
        .select("*")
        .order("orden", { ascending: true });

      if (planesData && planesData.length > 0) {
        setPlanes(planesData);
      } else {
        // Fallback robusto con planes por defecto
        setPlanes([
          {
            id: "gratis",
            nombre: "Básico Gratuito",
            precio: 0,
            frecuencia: "mes",
            descripcion: "Para presupuestos individuales y exploración del sistema.",
            es_recomendado: false,
            beneficios: [
              "Hasta 3 proyectos activos",
              "100 partidas APU con rendimientos",
              "Exportación PDF estándar",
              "Soporte por comunidad"
            ]
          },
          {
            id: "pro",
            nombre: "Profesional APU",
            precio: 49,
            frecuencia: "mes",
            descripcion: "Para ingenieros de costos y contratistas que licitan con el SERCOP.",
            es_recomendado: true,
            beneficios: [
              "Proyectos ilimitados",
              "Base de datos IPCO/INEC actualizada",
              "Fórmula Polinómica y VAE automático",
              "Desagregación Tecnológica SERCOP",
              "Integración BIM (Revit/IFC4)",
              "Soporte prioritario 24/7"
            ]
          },
          {
            id: "empresarial",
            nombre: "Empresarial Suite",
            precio: 149,
            frecuencia: "mes",
            descripcion: "Para constructoras y desarrolladores que operan múltiples frentes de obra.",
            es_recomendado: false,
            beneficios: [
              "Todo lo del Plan Profesional",
              "Módulos Constructora + Inmobiliaria + Stays",
              "Multi-usuario (hasta 15 usuarios)",
              "Kardex multibodega y logística Fletes",
              "Fideicomiso Escrow y conciliación SRI",
              "Capacitación in-company y SLA 99.9%"
            ]
          }
        ]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handlePagarPlan = (plan: any) => {
    setSelectedPlan(plan);
    setModalPagoOpen(true);
  };

  const handleBajarGratuito = async () => {
    setCurrentPlan("gratis");
    setNotificacionExito("Has cambiado al Plan Gratuito con éxito.");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 animate-in fade-in duration-200">
      {/* Banner de Notificación de Éxito */}
      {notificacionExito && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{notificacionExito}</span>
          </div>
          <button 
            onClick={() => setNotificacionExito(null)}
            className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles size={14} />
          <span>Ecosistema de Suscripciones GRUPO SARA</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Elige el plan ideal para tus proyectos
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Potencia tus análisis de precios unitarios, fiscalización de obra y compras mayoristas. 
          Cancela o cambia de plan en cualquier momento.
        </p>
      </div>

      {/* Grid de Planes con Botón Único Pagar (Estándar Imagen 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-6">
        {planes.map((plan) => {
          const isCurrentPlan = 
            currentPlan === plan.id || 
            (currentPlan === "gratis" && plan.precio === 0) ||
            (currentPlan === "pro" && plan.nombre.toLowerCase().includes("profesional"));
            
          const isRecommended = plan.es_recomendado || plan.esRecomendado;

          return (
            <div 
              key={plan.id} 
              className={`
                rounded-3xl p-6 transition-all relative flex flex-col justify-between
                ${isRecommended 
                  ? "bg-slate-950 dark:bg-black border-2 border-blue-500 shadow-2xl shadow-blue-500/15 transform md:-translate-y-2" 
                  : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400"
                }
              `}
            >
              {isCurrentPlan && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[11px] font-black tracking-wider uppercase z-10 shadow-lg">
                  TU PLAN ACTUAL
                </span>
              )}
              {!isCurrentPlan && isRecommended && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-[11px] font-black tracking-widest uppercase z-10 shadow-lg">
                  RECOMENDADO
                </span>
              )}

              <div>
                <h3 className={`text-xl font-bold ${isRecommended ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  {plan.nombre}
                </h3>
                <p className={`mt-2 text-xs min-h-[32px] ${isRecommended ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                  {plan.descripcion}
                </p>

                <div className="my-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black font-mono tracking-tight ${isRecommended ? "text-blue-400" : "text-slate-900 dark:text-white"}`}>
                      ${plan.precio}
                    </span>
                    <span className="text-xs text-slate-400 font-sans font-bold">
                      /{plan.frecuencia || "mes"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {plan.precio === 0 ? "Sin costo de por vida" : "Facturación mensual o anual recurrente"}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {/* FEATURE ESTRELLA B.I.M. (Solo para planes de pago) */}
                  {plan.precio > 0 && (
                    <li className={`flex gap-2.5 text-xs font-bold ${isRecommended ? "text-amber-300" : "text-amber-600 dark:text-amber-400"}`}>
                      <Check className="shrink-0 text-amber-400 mt-0.5" size={15} /> 
                      <span className="flex flex-col">
                        Integración BIM (Revit/IFC4)
                        <span className="text-[10px] font-normal uppercase tracking-wider opacity-85">Cuantificación 3D Automatizada</span>
                      </span>
                    </li>
                  )}
                  {(plan.beneficios || []).map((ben: string, i: number) => (
                    <li key={i} className={`flex items-start gap-2.5 text-xs ${isRecommended ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>
                      <Check className="shrink-0 text-blue-500 mt-0.5" size={15} />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón Único de Pago (Estándar Imagen 2: Solo un botón Pagar) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {isCurrentPlan ? (
                  <button 
                    disabled 
                    className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400"
                  >
                    Plan Activo
                  </button>
                ) : plan.precio === 0 ? (
                  <button 
                    onClick={handleBajarGratuito}
                    className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                  >
                    Activar Plan Gratuito
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => handlePagarPlan(plan)}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <CreditCard size={16} />
                    <span>Pagar Plan (${plan.precio}/{plan.frecuencia || "mes"})</span>
                  </button>
                )}
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
          modulo="APU"
          referenciaOperacionId={`SAAS-${selectedPlan.id.toUpperCase()}-${Date.now().toString().slice(-4)}`}
          tituloModal="Pasarela de Pago Digital · GRUPO SARA"
          subtituloModal={`Activación Plan ${selectedPlan.nombre} · APU & BIM Suite`}
          amount={selectedPlan.precio}
          beneficiario={{
            tipo: "sara_holding",
            etiquetaRol: "Plan de Suscripción SARA:",
            nombreCompleto: "GRUPO SARA INVERSIONES S.A.S.",
            identificacion: "1792984512001",
            subtitulo: `Suscripción ${selectedPlan.nombre} · Facturación Mensual`,
            bancoNombre: "Banco Pichincha",
            tipoCuenta: "Cuenta Corriente",
            numeroCuenta: "2100258941",
            email: "pagos@gruposara.com",
            telefonoContacto: "+593 99 284 9102"
          }}
          desglose={{
            subtotalUSD: Number((selectedPlan.precio / 1.15).toFixed(2)),
            tarifaIvaPct: 15,
            montoIvaUSD: Number((selectedPlan.precio - (selectedPlan.precio / 1.15)).toFixed(2)),
            totalPagarUSD: selectedPlan.precio
          }}
          onPaymentSuccess={async (resultado) => {
            const supabase = createClient();
            try {
              if (user?.id) {
                await supabase.from("ordenes_pago").insert({
                  user_id: user.id,
                  modulo: "saas",
                  referencia_id: selectedPlan.id,
                  concepto: `Suscripción SaaS APU - Plan ${selectedPlan.nombre} (${resultado.metodoNombre})`,
                  monto: selectedPlan.precio,
                  moneda: "USD",
                  estado: resultado.estado === "APROBADO" ? "completado" : "pendiente"
                });

                await supabase.from("suscripciones_saas").upsert({
                  user_id: user.id,
                  plan_id: selectedPlan.id,
                  updated_at: new Date().toISOString()
                });
              }
            } catch (err) {
              console.warn("Aviso de registro orden pago:", err);
            }

            setCurrentPlan(selectedPlan.id);
            setModalPagoOpen(false);
            setNotificacionExito(
              `¡Pago procesado con éxito vía ${resultado.metodoNombre}! Tu suscripción a ${selectedPlan.nombre} está ACTIVA.`
            );
          }}
        />
      )}
    </div>
  );
}
