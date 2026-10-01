"use client"
import { useState, useEffect } from "react"
import { Check, CreditCard, Building, Upload, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function PlanesPage() {
  const [currentPlan, setCurrentPlan] = useState("gratis")
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "transferencia" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('suscripciones_saas').select('plan_id').eq('user_id', user.id).single()
        if (data?.plan_id) setCurrentPlan(data.plan_id)
      }
      const { data: planesData } = await supabase.from('planes_suscripcion').select('*').order('orden', { ascending: true })
      if (planesData) setPlanes(planesData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSubscribe = async (metodo: "stripe" | "transferencia", planId: string) => {
    setPaymentMethod(metodo)
    setIsProcessing(true)
    
    if (metodo === "stripe") {
      try {
        const res = await fetch("/api/pagos/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: planId,
            returnUrl: window.location.href.split('?')[0],
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url; 
        } else {
          alert("Error iniciando Stripe: " + data.error);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error(error);
        alert("Error de conexión");
        setIsProcessing(false);
      }
    } else {
      setTimeout(() => {
        alert("En el siguiente paso implementaremos el modal para subir el comprobante de transferencia.");
        setIsProcessing(false)
      }, 1500)
    }
  }

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Elige el plan ideal para tus proyectos</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Potencia tus análisis de precios unitarios y presupuestos. Cambia de plan o cancela cuando quieras.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mt-12 px-4">
        {planes.map((plan) => {
          // Lógica corregida: el Webhook ahora guarda el UUID del plan, por lo que currentPlan puede ser un UUID o 'gratis'
          const isCurrentPlan = 
            currentPlan === plan.id || 
            (currentPlan === 'gratis' && plan.precio === 0) ||
            (currentPlan === 'pro' && plan.nombre.toLowerCase().includes('profesional')); // Fallback para suscripciones viejas
            
          const isRecommended = plan.es_recomendado;

          return (
            <div key={plan.id} className={`
              rounded-3xl p-6 transition-all relative flex flex-col h-full
              ${isRecommended 
                ? 'bg-slate-900 border-2 border-slate-800 shadow-2xl shadow-blue-900/20 transform md:-translate-y-2' 
                : 'bg-white border-2 border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md'
              }
              ${isCurrentPlan && isRecommended ? 'border-blue-500 shadow-xl' : ''}
              ${isCurrentPlan && !isRecommended ? 'border-blue-500 shadow-xl bg-blue-50/30' : ''}
            `}>
              {isCurrentPlan && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide z-10 whitespace-nowrap">
                  TU PLAN ACTUAL
                </span>
              )}
              {!isCurrentPlan && isRecommended && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase z-10 whitespace-nowrap shadow-lg shadow-blue-500/30">
                  RECOMENDADO
                </span>
              )}
              
              <h3 className={`text-xl font-bold ${isRecommended ? 'text-white' : 'text-slate-900'}`}>{plan.nombre}</h3>
              <p className={`mt-2 text-xs h-8 ${isRecommended ? 'text-slate-400' : 'text-slate-500'}`}>{plan.descripcion}</p>
              
              <div className="my-6">
                <span className={`text-4xl font-black ${isRecommended ? 'text-white' : 'text-slate-900'}`}>${plan.precio}</span>
                <span className={`font-medium text-sm ${isRecommended ? 'text-slate-400' : 'text-slate-500'}`}>/{plan.frecuencia}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {(plan.beneficios || []).map((ben: string, i: number) => (
                  <li key={i} className={`flex gap-3 text-xs leading-relaxed ${isRecommended ? 'text-slate-200' : 'text-slate-600'}`}>
                    <Check className={`shrink-0 ${isRecommended ? 'text-blue-400' : 'text-blue-500'}`} size={16} /> <span>{ben}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isCurrentPlan ? (
                   <button disabled className={`w-full py-2.5 px-6 rounded-xl text-sm font-bold transition-all cursor-not-allowed ${isRecommended ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                    Plan Activo
                   </button>
                ) : plan.precio === 0 ? (
                   <button className={`w-full py-2.5 px-6 rounded-xl text-sm font-bold transition-all ${isRecommended ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                    Seleccionar
                   </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">Métodos de Pago</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleSubscribe('stripe', plan.id)}
                        disabled={isProcessing}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-semibold text-[11px] ${
                          isRecommended 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                        }`}
                      >
                        <CreditCard size={18} />
                        <span>Tarjeta</span>
                      </button>
                      <button 
                        onClick={() => handleSubscribe('transferencia', plan.id)}
                        disabled={isProcessing}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-semibold text-[11px] border ${
                          isRecommended 
                            ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-slate-600' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Building size={18} />
                        <span>Transferir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
