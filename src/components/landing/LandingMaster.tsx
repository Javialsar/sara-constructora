'use client';

import React, { useState } from 'react';
import Hero from '@/components/sections/Hero';
import EcosystemMatrix from './EcosystemMatrix';
import FAQ from '@/components/sections/FAQ';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';
import { CheckCircle2 } from 'lucide-react';

export default function LandingMaster() {
  const [checkoutConfig, setCheckoutConfig] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
  }>({
    isOpen: false,
    title: 'Suscripción Plan Constructor Pro',
    amount: 19.99,
    badgeText: 'Grupo SARA',
    isSubscription: false
  });

  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const handleOpenCheckout = (item: {
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
  }) => {
    setCheckoutConfig({
      isOpen: true,
      title: item.title,
      amount: item.amount,
      badgeText: item.badgeText,
      isSubscription: item.isSubscription || false
    });
  };

  const handlePaymentSuccess = (txId: string) => {
    setCheckoutConfig((prev) => ({ ...prev, isOpen: false }));
    setPaymentSuccessToast(`¡Pago confirmado con éxito! ID Transacción: ${txId}`);
    setTimeout(() => setPaymentSuccessToast(null), 6000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Success Notification Toast */}
      {paymentSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-6 h-6" />
          <div className="text-sm">{paymentSuccessToast}</div>
        </div>
      )}

      {/* 1. Hero Principal Dinámico: logos rotativos flotantes sin cuadro */}
      <Hero 
        onOpenCheckout={handleOpenCheckout}
      />

      {/* 2. Ecosystem Matrix (Los 8 Módulos de Grupo SARA) */}
      <EcosystemMatrix 
        onOpenCheckout={handleOpenCheckout}
      />

      {/* 3. Sección de Preguntas Frecuentes (FAQ) */}
      <div id="faq">
        <FAQ />
      </div>

      {/* Unified Standard Checkout Modal */}
      <StandardCheckoutModal
        isOpen={checkoutConfig.isOpen}
        onClose={() => setCheckoutConfig((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={handlePaymentSuccess}
        title={checkoutConfig.title}
        amount={checkoutConfig.amount}
        badgeText={checkoutConfig.badgeText}
        isSubscription={checkoutConfig.isSubscription}
        items={[
          { label: checkoutConfig.title, amount: checkoutConfig.amount }
        ]}
      />
    </div>
  );
}
