'use client';

import React from 'react';
import SaraUnifiedPaymentGatewayModal from '@/components/pagos/SaraUnifiedPaymentGatewayModal';

export interface DriverBankInfo {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderId: string;
  phone: string;
  email: string;
  deunaPhone?: string;
  payphonePhone?: string;
  guayaquilAccount?: string;
  qrDeunaImage?: string;
  qrPayphoneImage?: string;
  qrGuayaquilImage?: string;
}

export interface SaraFreightPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (details: {
    method: 'tarjeta' | 'deuna_qr' | 'payphone_qr' | 'transferencia';
    methodName: string;
    reference: string;
    amount: number;
  }) => void;
  amount: number;
  driverName: string;
  driverPlate: string;
  driverVehicle: string;
  fleteId?: string;
  driverBankInfo?: DriverBankInfo;
}

export default function SaraFreightPaymentGatewayModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  driverName,
  driverPlate,
  driverVehicle,
  fleteId,
  driverBankInfo
}: SaraFreightPaymentGatewayModalProps) {
  return (
    <SaraUnifiedPaymentGatewayModal
      isOpen={isOpen}
      onClose={onClose}
      modulo="FLETES"
      referenciaOperacionId={fleteId || `FLT-${Date.now().toString().slice(-6)}`}
      tituloModal="Pasarela de Pago Digital · SARA-FLETES"
      subtituloModal={`Liquidación de Transporte Pesado · ${driverVehicle} (${driverPlate})`}
      amount={amount}
      beneficiario={{
        tipo: 'transportista',
        etiquetaRol: 'PAGO LOGÍSTICO AL TRANSPORTISTA:',
        nombreCompleto: driverBankInfo?.holderName || driverName || 'TRANSPORTISTA CERTIFICADO SARA',
        identificacion: driverBankInfo?.holderId || '1792984512001',
        subtitulo: `${driverName} · ${driverVehicle} · Placa ${driverPlate}`,
        bancoNombre: driverBankInfo?.bankName || 'Banco Pichincha',
        numeroCuenta: driverBankInfo?.accountNumber || '2100258941',
        email: driverBankInfo?.email || 'fletes@gruposara.ec',
        telefonoContacto: driverBankInfo?.phone || '+593 99 284 9102'
      }}
      onPaymentSuccess={(details) => {
        const mappedMethod: 'tarjeta' | 'deuna_qr' | 'payphone_qr' | 'transferencia' =
          details.metodo === 'tarjeta'
            ? 'tarjeta'
            : details.metodo === 'qr'
              ? 'deuna_qr'
              : 'transferencia';
        onPaymentSuccess({
          method: mappedMethod,
          methodName: details.metodoNombre,
          reference: details.referenciaComprobante,
          amount: details.montoTotalUSD
        });
      }}
    />
  );
}
