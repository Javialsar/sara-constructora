'use client';
import React, { useState } from 'react';
import { CreditCard, ShieldCheck, X, Loader2, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  planName: string;
}

export default function PaymentGatewayModal({ isOpen, onClose, onSuccess, planName }: PaymentModalProps) {
  const [gateway, setGateway] = useState<'Kushki' | 'Stripe'>('Kushki');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  // Costo de validación / setup según el plan
  const fee = planName === 'VIP' ? 49.99 : planName === 'Estandar' ? 19.99 : 4.99;

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/pagos/kushki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, plan: planName, amount: fee })
      });
      const data = await response.json();

      if (data.success) {
        onSuccess(data.transactionId);
      } else {
        alert("Error en el pago: " + data.error);
        setIsProcessing(false);
      }
    } catch (error) {
      alert("Error de conexión con la pasarela.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>

        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <ShieldCheck className="w-6 h-6 text-emerald-500 mr-2" />
            Pago Seguro
          </h2>
          <p className="text-slate-500 text-sm mt-1">Autorización y tokenización de tarjeta.</p>
        </div>

        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button 
              type="button"
              onClick={() => setGateway('Kushki')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${gateway === 'Kushki' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Kushki (Ecuador)
            </button>
            <button 
              type="button"
              onClick={() => setGateway('Stripe')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${gateway === 'Stripe' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Stripe (Global)
            </button>
          </div>

          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-blue-800 font-bold">Plan {planName}</p>
              <p className="text-blue-600 text-xs">Fee de verificación de perfil</p>
            </div>
            <div className="text-2xl font-black text-blue-900">${fee}</div>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titular de la Tarjeta</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre en la tarjeta" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Tarjeta</label>
              <div className="relative">
                <CreditCard className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} type="text" maxLength={16} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="0000 0000 0000 0000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiración</label>
                <input required type="text" maxLength={5} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                <input required type="password" maxLength={4} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="123" />
              </div>
            </div>

            <button disabled={isProcessing} type="submit" className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center">
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando con {gateway}...</>
              ) : (
                `Pagar $${fee} de forma segura`
              )}
            </button>

            <p className="text-center text-xs text-slate-400 flex items-center justify-center mt-4">
              <ShieldCheck className="w-4 h-4 mr-1" />
              Tus datos están encriptados de extremo a extremo
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
