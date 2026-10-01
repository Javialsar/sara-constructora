"use client"
import { useState, useEffect } from "react"
import { Check, CreditCard, Building, Upload, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function PlanesPage() {
  const [currentPlan, setCurrentPlan] = useState("gratis")
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "transferencia" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('suscripciones_saas').select('plan_id').eq('user_id', user.id).single()
        if (data?.plan_id) setCurrentPlan(data.plan_id)
      }
      setLoading(false)
    }
    fetchPlan()
  }, [])

  const handleSubscribe = async (metodo: "stripe" | "transferencia") => {
    setPaymentMethod(metodo)
    setIsProcessing(true)
    
    // Aquí integraremos el Checkout real de Stripe o el formulario de subida de transferencia
    setTimeout(() => {
      alert(`Has seleccionado pagar mediante: ${metodo}. En el siguiente paso implementaremos el Checkout.`);
      setIsProcessing(false)
    }, 1500)
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
        {/* PLAN GRATIS */}
        <div className={`bg-white rounded-3xl p-8 border-2 transition-all ${currentPlan === 'gratis' ? 'border-blue-500 shadow-xl relative' : 'border-slate-100 shadow-sm'}`}>
          {currentPlan === 'gratis' && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              TU PLAN ACTUAL
            </span>
          )}
          <h3 className="text-2xl font-bold text-slate-900">Básico</h3>
          <p className="text-slate-500 mt-2 text-sm">Perfecto para explorar la plataforma.</p>
          <div className="my-6">
            <span className="text-5xl font-black text-slate-900">$0</span>
            <span className="text-slate-500 font-medium">/mes</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 text-slate-700 text-sm"><Check className="text-blue-500 shrink-0" size={20} /> <span>Acceso a la base de insumos global.</span></li>
            <li className="flex gap-3 text-slate-700 text-sm"><Check className="text-blue-500 shrink-0" size={20} /> <span>1 Proyecto (Cotización Rápida).</span></li>
            <li className="flex gap-3 text-slate-700 text-sm"><Check className="text-blue-500 shrink-0" size={20} /> <span>Límite de 15 APUs personalizados.</span></li>
            <li className="flex gap-3 text-slate-400 text-sm"><XIcon /> <span>Exportación a PDF y Excel.</span></li>
            <li className="flex gap-3 text-slate-400 text-sm"><XIcon /> <span>Presupuestos Reales detallados.</span></li>
          </ul>

          <button 
            disabled={currentPlan === 'gratis'}
            className="w-full py-3 px-6 rounded-xl font-bold transition-all bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            {currentPlan === 'gratis' ? 'Plan Activo' : 'Seleccionar'}
          </button>
        </div>

        {/* PLAN PRO */}
        <div className={`bg-slate-900 rounded-3xl p-8 border-2 transition-all relative ${currentPlan === 'pro' ? 'border-blue-500 shadow-xl' : 'border-slate-800 shadow-2xl shadow-blue-900/20'}`}>
          {currentPlan === 'pro' && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              TU PLAN ACTUAL
            </span>
          )}
          {!currentPlan || currentPlan === 'gratis' && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              RECOMENDADO
            </span>
          )}
          <h3 className="text-2xl font-bold text-white">Profesional</h3>
          <p className="text-slate-400 mt-2 text-sm">Todo lo que necesitas para presupuestar sin límites.</p>
          <div className="my-6">
            <span className="text-5xl font-black text-white">$15</span>
            <span className="text-slate-400 font-medium">/mes</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 shrink-0" size={20} /> <span>Proyectos y Cotizaciones ilimitadas.</span></li>
            <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 shrink-0" size={20} /> <span>APUs y Rubros personalizados infinitos.</span></li>
            <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 shrink-0" size={20} /> <span>Módulo de Presupuestos Reales completo.</span></li>
            <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 shrink-0" size={20} /> <span>Exportación nativa a Excel (.xlsm) y PDF.</span></li>
            <li className="flex gap-3 text-slate-200 text-sm"><Check className="text-blue-400 shrink-0" size={20} /> <span>Actualización de precios de mercado.</span></li>
          </ul>

          {currentPlan === 'pro' ? (
             <button disabled className="w-full py-3 px-6 rounded-xl font-bold transition-all bg-slate-800 text-slate-400 cursor-not-allowed">
              Plan Activo
             </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-center text-slate-400 uppercase tracking-widest font-bold">Métodos de Pago</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSubscribe('stripe')}
                  disabled={isProcessing}
                  className="flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all font-semibold text-xs"
                >
                  <CreditCard size={20} />
                  <span>Tarjeta</span>
                </button>
                <button 
                  onClick={() => handleSubscribe('transferencia')}
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
      </div>
    </div>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}
