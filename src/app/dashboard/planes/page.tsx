"use client"
import { useState, useEffect } from "react"
import { Check, CreditCard, Building, Upload, AlertCircle, Loader2, X, Camera } from "lucide-react"
import { getCuentasBancarias, CuentaBancariaEmpresa } from '@/lib/services/datosBancariosService'
import { createClient } from "@/lib/supabase/client"

export default function PlanesPage() {
  const [currentPlan, setCurrentPlan] = useState("gratis")
  const [planes, setPlanes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "transferencia" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedPlanForTransfer, setSelectedPlanForTransfer] = useState<any>(null)
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([])
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)

  
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

      const ctas = await getCuentasBancarias()
      setCuentasBancarias(ctas)

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
      const plan = planes.find(p => p.id === planId);
      setSelectedPlanForTransfer(plan);
      setShowTransferModal(true);
      setIsProcessing(false);
    }
  }

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
  }

  
  const handleUploadReceipt = async () => {
    if (!receiptFile || !selectedPlanForTransfer) return;
    setUploadingReceipt(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Subir comprobante a Storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `comprobante-${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sara-assets')
        .upload(`comprobantes/${fileName}`, receiptFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('sara-assets').getPublicUrl(`comprobantes/${fileName}`);

      // 2. Crear orden_pago
      const { error: dbError } = await supabase.from('ordenes_pago').insert({
        user_id: user.id,
        modulo: 'saas',
        referencia_id: selectedPlanForTransfer.id,
        concepto: `Suscripción SaaS APU - Plan ${selectedPlanForTransfer.nombre}`,
        monto: selectedPlanForTransfer.precio,
        moneda: 'USD',
        estado: 'pendiente'
      });

      if (dbError) throw dbError;
      
      // Intentamos guardar la URL en metadata si existiese alguna forma, pero por ahora dependemos de que el admin revise
      // Lo ideal es que luego alteremos la BD para añadir comprobante_url.
      
      setTransferSuccess(true);
    } catch (err: any) {
      alert("Error al subir el comprobante: " + err.message);
    } finally {
      setUploadingReceipt(false);
    }
  };


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
                   <button className="w-full py-2.5 px-6 rounded-xl text-sm font-bold transition-all border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                    Bajar a Gratuito
                   </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">Métodos de Pago</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleSubscribe('stripe', plan.id)}
                        disabled={isProcessing}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-bold text-[11px] ${
                          isRecommended 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        } ${isProcessing ? 'opacity-50' : ''}`}
                      >
                        <CreditCard size={18} />
                        <span>Tarjeta</span>
                      </button>
                      <button 
                        onClick={() => handleSubscribe('transferencia', plan.id)}
                        disabled={isProcessing}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-bold text-[11px] border-2 ${
                          isRecommended 
                            ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        } ${isProcessing ? 'opacity-50' : ''}`}
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

      {/* MODAL DE TRANSFERENCIA */}
      {showTransferModal && selectedPlanForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pago por Transferencia</h3>
                <p className="text-sm text-slate-500">Plan {selectedPlanForTransfer.nombre} - ${selectedPlanForTransfer.precio}</p>
              </div>
              <button onClick={() => { setShowTransferModal(false); setTransferSuccess(false); setReceiptFile(null); }} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {transferSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">¡Comprobante Enviado!</h4>
                  <p className="text-slate-600 max-w-md mx-auto">Hemos recibido tu comprobante. Nuestro equipo lo verificará y activará tu plan en las próximas horas.</p>
                  <button onClick={() => { setShowTransferModal(false); setTransferSuccess(false); setReceiptFile(null); }} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
                    Entendido
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cuentas Disponibles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cuentasBancarias.map((cta) => (
                        <div key={cta.id} className="p-4 rounded-2xl border border-slate-200 bg-white relative overflow-hidden group">
                          {cta.qrUrl && (
                            <div className="absolute top-4 right-4 w-12 h-12 rounded bg-slate-100 p-1 border border-slate-200 cursor-pointer overflow-hidden hover:scale-[2] origin-top-right transition-transform shadow-sm">
                              <img src={cta.qrUrl} alt="QR de Pago" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className="text-xs font-bold text-blue-600 mb-2">{cta.banco}</p>
                          <p className="text-sm font-black text-slate-900 font-mono tracking-wider">{cta.numeroCuenta}</p>
                          <p className="text-[10px] text-slate-500 uppercase mt-1">{cta.tipoCuenta}</p>
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                            <p className="text-[11px] text-slate-600"><b>A nombre de:</b> {cta.beneficiario}</p>
                            <p className="text-[11px] text-slate-600"><b>RUC:</b> {cta.cedulaRuc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <Upload size={18} /> Adjuntar Comprobante
                    </h4>
                    
                    <label className={`w-full flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${receiptFile ? 'border-blue-500 bg-blue-100/50' : 'border-blue-300 hover:bg-blue-100/50 bg-white'}`}>
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} />
                      {receiptFile ? (
                        <div className="text-center text-blue-700">
                          <Check size={24} className="mx-auto mb-2" />
                          <span className="text-sm font-bold block">{receiptFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center text-blue-600/70">
                          <Camera size={24} className="mx-auto mb-2" />
                          <span className="text-sm font-medium block">Click para subir foto o PDF</span>
                        </div>
                      )}
                    </label>

                    <button 
                      onClick={handleUploadReceipt}
                      disabled={!receiptFile || uploadingReceipt}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                    >
                      {uploadingReceipt ? <Loader2 size={18} className="animate-spin" /> : "Enviar para Aprobación"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
