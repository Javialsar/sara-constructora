'use client';
import React from 'react';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  planName: string;
}

export default function PaymentGatewayModal({ isOpen, onClose, onSuccess, planName }: PaymentModalProps) {
  // Costo de validación / setup según el plan
  const fee = planName === 'VIP' ? 49.99 : planName === 'Estandar' ? 19.99 : 4.99;

  return (
    <StandardCheckoutModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title={`Plan ${planName} - Membresía SARA`}
      badgeText="SARA Fletes & Pro"
      amount={fee}
      isSubscription={true}
      subscriptionInterval="por mes"
      items={[
        { label: `Cuota de validación y verificación de perfil Plan ${planName}`, amount: fee }
      ]}
      defaultEmail="carlos.mendoza@gruposara.com"
      defaultCustomerName="Carlos Mendoza"
    />
  );
}
