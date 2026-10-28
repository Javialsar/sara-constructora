'use client';

import React from 'react';
import SaraUnifiedPaymentGatewayModal from '@/components/pagos/SaraUnifiedPaymentGatewayModal';

export interface CheckoutItem {
  label: string;
  amount: number;
}

export interface StandardCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  title?: string;
  badgeText?: string;
  amount: number;
  currency?: string;
  isSubscription?: boolean;
  subscriptionInterval?: string; // 'por mes' | 'por año'
  items?: CheckoutItem[];
  defaultEmail?: string;
  defaultCustomerName?: string;
  onCancel?: () => void;
}

export default function StandardCheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Suscripción Plan GRUPO SARA',
  badgeText = 'Grupo SARA',
  amount,
  isSubscription = false,
  subscriptionInterval = 'por mes',
  items = [],
  defaultEmail = 'facturacion.cliente@gruposara.ec',
  defaultCustomerName = 'CLIENTE CORPORATIVO GRUPO SARA',
  onCancel
}: StandardCheckoutModalProps) {
  const handleClose = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const mainConcept =
    items.length > 0
      ? items.map((i) => i.label).join(' + ')
      : `${title}${isSubscription ? ` (${subscriptionInterval})` : ''}`;

  return (
    <SaraUnifiedPaymentGatewayModal
      isOpen={isOpen}
      onClose={handleClose}
      modulo="PAGOS"
      tituloModal="Pasarela de Pago Digital · GRUPO SARA"
      subtituloModal={`${badgeText} · ${title}`}
      amount={amount}
      compradorDefault={{
        razonSocial: defaultCustomerName || 'CLIENTE CORPORATIVO GRUPO SARA',
        email: defaultEmail || 'facturacion.cliente@gruposara.ec'
      }}
      beneficiario={{
        tipo: 'sara_holding',
        etiquetaRol: isSubscription ? 'PLAN DE SUSCRIPCIÓN:' : 'CONCEPTO DE LIQUIDACIÓN:',
        nombreCompleto: 'GRUPO SARA INVERSIONES S.A.S.',
        identificacion: '1792984512001',
        subtitulo: mainConcept
      }}
      onPaymentSuccess={(details) => {
        onSuccess(details.transaccionId || details.referenciaComprobante);
      }}
    />
  );
}
