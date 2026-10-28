'use client';

import React, { useState } from 'react';
import Hero from '@/components/sections/Hero';
import EcosystemMatrix from './EcosystemMatrix';
import FAQ from '@/components/sections/FAQ';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';
import DynamicModuleQuoteModal from '@/components/modals/DynamicModuleQuoteModal';
import { CheckCircle2 } from 'lucide-react';
import { LogosEmpresa } from '@/lib/services/logosService';

interface LandingMasterProps {
  initialLogos?: LogosEmpresa;
}

export default function LandingMaster({ initialLogos }: LandingMasterProps) {
  const [checkoutConfig, setCheckoutConfig] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }>({
    isOpen: false,
    title: 'Suscripción Plan Constructor Pro',
    amount: 19.99,
    badgeText: 'Grupo SARA',
    isSubscription: false
  });

  const [quoteModalConfig, setQuoteModalConfig] = useState<{
    isOpen: boolean;
    moduleId: string;
    moduleLogoUrl?: string;
  }>({
    isOpen: false,
    moduleId: 'constructora'
  });

  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const handleOpenCheckout = (item: {
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }) => {
    setCheckoutConfig({
      isOpen: true,
      title: item.title,
      amount: item.amount,
      badgeText: item.badgeText,
      isSubscription: item.isSubscription || false,
      subscriptionInterval: item.subscriptionInterval
    });
  };

  const handleOpenQuoteModal = (item: {
    id: string;
    title: string;
    logoUrl?: string;
  }) => {
    setQuoteModalConfig({
      isOpen: true,
      moduleId: item.id,
      moduleLogoUrl: item.logoUrl
    });
  };

  const handleSelectPlanForCheckout = (planData: {
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }) => {
    setCheckoutConfig({
      isOpen: true,
      title: planData.title,
      amount: planData.amount,
      badgeText: planData.badgeText,
      isSubscription: planData.isSubscription || false,
      subscriptionInterval: planData.subscriptionInterval
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

      {/* 1. Hero Principal Dinámico: logos rotativos oficiales desde BD */}
      <Hero 
        onOpenCheckout={handleOpenCheckout}
        onOpenQuoteModal={handleOpenQuoteModal}
        initialLogos={initialLogos}
      />

      {/* 2. Ecosystem Matrix (Los Módulos de Grupo SARA con sus logos de BD) */}
      <EcosystemMatrix 
        onOpenCheckout={handleOpenCheckout}
        onOpenQuoteModal={handleOpenQuoteModal}
        initialLogos={initialLogos}
      />

      {/* 3. Sección de Preguntas Frecuentes (FAQ) */}
      <div id="faq">
        <FAQ />
      </div>

      {/* Modal Inteligente de Selección de Planes Reales por Módulo */}
      <DynamicModuleQuoteModal
        isOpen={quoteModalConfig.isOpen}
        onClose={() => setQuoteModalConfig((prev) => ({ ...prev, isOpen: false }))}
        moduleId={quoteModalConfig.moduleId}
        moduleLogoUrl={quoteModalConfig.moduleLogoUrl}
        onSelectPlanForCheckout={handleSelectPlanForCheckout}
      />

      {/* Unified Standard Checkout Modal */}
      <StandardCheckoutModal
        isOpen={checkoutConfig.isOpen}
        onClose={() => setCheckoutConfig((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={handlePaymentSuccess}
        title={checkoutConfig.title}
        amount={checkoutConfig.amount}
        badgeText={checkoutConfig.badgeText}
        isSubscription={checkoutConfig.isSubscription}
        subscriptionInterval={checkoutConfig.subscriptionInterval}
        items={[
          { label: checkoutConfig.title, amount: checkoutConfig.amount }
        ]}
      />
    </div>
  );
}
