'use client';
import React from 'react';
import StandardCheckoutModal, { CheckoutItem } from '@/components/checkout/StandardCheckoutModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  planName: string;
  montoContrato?: number;
  tipoPago?: 'membresia' | 'escrow_obra' | 'marketplace' | 'factoring';
  porcentajeEscrow?: number;
}

export default function PaymentGatewayModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  planName,
  montoContrato,
  tipoPago = 'membresia',
  porcentajeEscrow = 1.0
}: PaymentModalProps) {
  
  if (tipoPago === 'escrow_obra' && montoContrato) {
    const feeEscrow = +(montoContrato * (porcentajeEscrow / 100)).toFixed(2);
    const totalGarantizado = +(montoContrato + feeEscrow).toFixed(2);

    const itemsEscrow: CheckoutItem[] = [
      { label: `Fondo de Garantía de Obra en Custodia Escrow (${planName})`, amount: montoContrato },
      { label: `Tarifa de Custodia y Fiscalización Fiduciaria SARA-PAGOS (${porcentajeEscrow}%)`, amount: feeEscrow }
    ];

    return (
      <StandardCheckoutModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        title="Fideicomiso Escrow SARA-PAGOS"
        badgeText="Blindaje Fiduciario de Obra"
        amount={totalGarantizado}
        isSubscription={false}
        items={itemsEscrow}
        defaultEmail="contratista@gruposara.com"
        defaultCustomerName="Ingeniero Contratista"
      />
    );
  }

  // Costo de validación / membresía estándar
  const fee = planName === 'VIP' ? 49.99 : planName === 'Estandar' ? 19.99 : 4.99;

  return (
    <StandardCheckoutModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title={`Plan ${planName} - Membresía SARA`}
      badgeText="SARA Fintech & Pagos"
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
