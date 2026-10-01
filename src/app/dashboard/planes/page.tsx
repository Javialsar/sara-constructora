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

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
        {planes.map((plan) => {
          // Simplificamos la detección del plan activo usando el precio por ahora o ID
          const isCurrentPlan = 
            (plan.precio === 0 && currentPlan === 'gratis') || 
            (plan.precio > 0 && currentPlan === 'pro');
            
          const isFree = plan.precio === 0;

          return (
            <div key={plan.id} className={`${isFree ? 'bg-white border-2 border-slate-100 shadow-sm' : 'bg-slate-900 border-2 border-slate-800 shadow-2xl shadow-blue-900/20'} rounded-3xl p-8 transition-all relative ${isCurrentPlan ? (isFree ? 'border-blue-500 shadow-xl' : 'border-blue-500') : ''}`}>
              {isCurrentPlan && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide z-10">
                  TU PLAN ACTUAL
                </span>
              )}
              {!isCurrentPlan && plan.es_recomendado && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase z-10">
                  RECOMENDADO
                </span>
              )}
              <h3 className={`text-2xl font-bold ${isFree ? 'text-slate-900' : 'text-white'}`}>{plan.nombre}</h3>
              <p className={`mt-2 text-sm ${isFree ? 'text-slate-500' : 'text-slate-400'}`}>{plan.descripcion}</p>
              <div className="my-6">
                <span className={`text-5xl font-black ${isFree ? 'text-slate-900' : 'text-white'}`}>${plan.precio}</span>
                <span className={`font-medium ${isFree ? 'text-slate-500' : 'text-slate-400'}`}>/{plan.frecuencia}</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {(plan.beneficios || []).map((ben: string, i: number) => (
                  <li key={i} className={`flex gap-3 text-sm ${isFree ? 'text-slate-700' : 'text-slate-200'}`}>
                    <Check className={isFree ? 'text-blue-500' : 'text-blue-400'} size={20} /> <span>{ben}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                 <button disabled className={`w-full py-3 px-6 rounded-xl font-bold transition-all cursor-not-allowed ${isFree ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-400'}`}>
                  Plan Activo
                 </button>
              ) : isFree ? (
                 <button className="w-full py-3 px-6 rounded-xl font-bold transition-all bg-blue-50 text-blue-600 hover:bg-blue-100">
                  Seleccionar
                 </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-center text-slate-400 uppercase tracking-widest font-bold">Métodos de Pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleSubscribe('stripe', plan.id)}
                      disabled={isProcessing}
                      className="flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all font-semibold text-xs"
                    >
                      <CreditCard size={20} />
                      <span>Tarjeta</span>
                    </button>
                    <button 
                      onClick={() => handleSubscribe('transferencia', plan.id)}
                      disabled={isProcessing}
                      className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all font-semibold text-xs border border-slate-700 hover:border-slate-600"
                    >
                      <Building size={20} />
                      <span>Transferencia</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
