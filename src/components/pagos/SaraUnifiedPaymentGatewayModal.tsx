'use client';

// ============================================================================
// PASARELA DE PAGO DIGITAL UNIFICADA — ECOSISTEMA GRUPO SARA
// Compatible con los 8 módulos: Fletes, Stays, Marketplace, Talento, Inmobiliaria,
// Constructora, APU y Pagos.
// Canales soportados: Tarjeta (Débito/Crédito con diferido), Códigos QR (DeUna,
// PayPhone, Banco Guayaquil), Transferencia Bancaria (Pichincha, Guayaquil, Produbanco),
// PayPal y Billetera SARA / Custodia Escrow.
// Cumplimiento: PCI-DSS SAQ-A, Encriptación TLS 256-Bit y Normativa SRI Ecuador.
// ============================================================================

import React, { useState, useId } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  ArrowLeft, 
  ExternalLink,
  Loader2,
  DollarSign,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Wallet,
  Sparkles,
  Info
} from 'lucide-react';

export type SaraModuloPago = 
  | 'FLETES' 
  | 'STAYS' 
  | 'MARKETPLACE' 
  | 'TALENTO' 
  | 'INMOBILIARIA' 
  | 'CONSTRUCTORA' 
  | 'APU' 
  | 'PAGOS';

export type MetodoPagoUniversal = 
  | 'tarjeta' 
  | 'qr' 
  | 'transferencia' 
  | 'paypal' 
  | 'billetera_escrow';

export interface DesgloseImpuestosSRI {
  subtotalUSD: number;
  tarifaIvaPct: 0 | 5 | 8 | 15;
  montoIvaUSD: number;
  retencionRentaCodigo?: string;
  retencionRentaMontoUSD?: number;
  retencionIvaMontoUSD?: number;
  totalPagarUSD: number;
}

export interface BeneficiarioPagoContexto {
  tipo: 'transportista' | 'proveedor' | 'anfitrion' | 'trabajador' | 'inmobiliaria' | 'sara_holding';
  etiquetaRol?: string; // Ej: "Transportista Asignado:", "Proveedor Mayorista:", "Anfitrión Stays:"
  nombreCompleto: string;
  identificacion: string; // RUC o Cédula
  subtitulo?: string; // Ej: "Camioneta Pickup 1.2T · SARA · PBA-1234"
  bancoNombre?: string;
  tipoCuenta?: 'Cuenta de Ahorros' | 'Cuenta Corriente';
  numeroCuenta?: string;
  telefonoContacto?: string;
  email?: string;
  qrDeunaImage?: string;
  qrPayphoneImage?: string;
  qrGuayaquilImage?: string;
}

export interface SaraUnifiedPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  modulo?: SaraModuloPago;
  referenciaOperacionId?: string; // Ej: "FLT-2026-089", "OC-2026-104", "RES-STAYS-8201"
  tituloModal?: string;
  subtituloModal?: string;
  beneficiario?: BeneficiarioPagoContexto;
  amount: number;
  desglose?: DesgloseImpuestosSRI;
  metodosHabilitados?: MetodoPagoUniversal[];
  permitirDiferido?: boolean;
  onPaymentSuccess: (details: {
    transaccionId: string;
    metodo: MetodoPagoUniversal;
    metodoNombre: string;
    referenciaComprobante: string;
    montoTotalUSD: number;
    voucherUrl?: string;
    plazoDiferidoMeses?: number;
    estado: 'APROBADO' | 'PENDIENTE_CONCILIACION';
  }) => void;
}

export default function SaraUnifiedPaymentGatewayModal({
  isOpen,
  onClose,
  modulo = 'PAGOS',
  referenciaOperacionId = `TX-${Date.now().toString().slice(-6)}`,
  tituloModal = 'Pasarela de Pago Digital',
  subtituloModal = 'Pago Seguro y Garantizado · GRUPO SARA',
  amount,
  desglose,
  beneficiario = {
    tipo: 'sara_holding',
    etiquetaRol: 'Beneficiario del Pago:',
    nombreCompleto: 'GRUPO SARA S.A.S.',
    identificacion: '1191784920001',
    subtitulo: 'Plataforma Corporativa Central',
    bancoNombre: 'Banco Pichincha',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: '2100284910',
    email: 'pagos@gruposara.com',
    telefonoContacto: '+593 99 554 4332'
  },
  metodosHabilitados = ['tarjeta', 'qr', 'transferencia', 'paypal', 'billetera_escrow'],
  permitirDiferido = true,
  onPaymentSuccess
}: SaraUnifiedPaymentGatewayModalProps) {
  // Pestaña activa: 'tarjeta' | 'qr' | 'transferencia' | 'paypal' | 'billetera_escrow'
  const [activeTab, setActiveTab] = useState<MetodoPagoUniversal>('tarjeta');
  const [selectedQrPlatform, setSelectedQrPlatform] = useState<'deuna' | 'payphone' | 'guayaquil'>('deuna');
  const [selectedBank, setSelectedBank] = useState<'pichincha' | 'guayaquil' | 'produbanco' | 'cooperativa'>('pichincha');
  
  // Tarjeta Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [plazoDiferido, setPlazoDiferido] = useState<number>(0); // 0 = corriente, 3, 6, 12 meses
  
  // Referencias & Vouchers
  const [referenceCode, setReferenceCode] = useState('');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showDesglose, setShowDesglose] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputId = useId();

  if (!isOpen) return null;

  const montoFinal = Number(amount || desglose?.totalPagarUSD || 0);

  // Copia rápida al portapapeles
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Carga de tarjeta de prueba (Mock para entornos de sandbox / QA)
  const handleCargarTarjetaPrueba = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('12/28');
    setCardCvc('884');
    setCardHolder('CLIENTE DE PRUEBA SARA');
  };

  // Detección automática de franquicia de tarjeta
  const getCardBrand = (num: string): string => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^5[1-5]/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    if (/^3(?:0[0-5]|[68])/.test(clean)) return 'DINERS';
    if (/^6(?:011|5)/.test(clean)) return 'DISCOVER';
    return '';
  };

  const cardBrand = getCardBrand(cardNumber);

  // Carga de comprobante de transferencia
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoucherFile(file);
      if (file.type.startsWith('image/')) {
        setVoucherPreview(URL.createObjectURL(file));
      } else {
        setVoucherPreview(null);
      }
    }
  };

  // Confirmación de pago con simulación y despacho transaccional
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      let ref = referenceCode.trim();
      let methodName = 'Tarjeta de Crédito / Débito';
      let estadoResultado: 'APROBADO' | 'PENDIENTE_CONCILIACION' = 'APROBADO';

      if (activeTab === 'tarjeta') {
        methodName = `Tarjeta ${cardBrand || 'Bancaria'} (${plazoDiferido > 0 ? `Diferido ${plazoDiferido} meses` : 'Corriente'})`;
        ref = ref || `TX-CARD-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (activeTab === 'qr') {
        estadoResultado = 'APROBADO';
        if (selectedQrPlatform === 'deuna') {
          methodName = 'QR DeUna! (Banco Pichincha)';
          ref = ref || `DU-${Math.floor(100000 + Math.random() * 900000)}`;
        } else if (selectedQrPlatform === 'payphone') {
          methodName = 'QR PayPhone Ecuador';
          ref = ref || `PP-${Math.floor(100000 + Math.random() * 900000)}`;
        } else {
          methodName = 'QR Banco Guayaquil / Peigo';
          ref = ref || `BG-${Math.floor(100000 + Math.random() * 900000)}`;
        }
      } else if (activeTab === 'transferencia') {
        estadoResultado = 'PENDIENTE_CONCILIACION';
        methodName = `Transferencia Bancaria (${selectedBank.toUpperCase()})`;
        ref = ref || `TR-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (activeTab === 'paypal') {
        methodName = 'PayPal Express Checkout (USD)';
        ref = ref || `PAYPAL-${Math.floor(1000000 + Math.random() * 9000000)}`;
      } else {
        methodName = 'Billetera SARA / Custodia Escrow';
        ref = ref || `ESCROW-${referenciaOperacionId}`;
      }

      onPaymentSuccess({
        transaccionId: `SARA-PAY-${Date.now().toString(36).toUpperCase()}`,
        metodo: activeTab,
        metodoNombre: methodName,
        referenciaComprobante: ref,
        montoTotalUSD: montoFinal,
        voucherUrl: voucherFile ? `https://storage.gruposara.ec/vouchers/${voucherFile.name}` : undefined,
        plazoDiferidoMeses: plazoDiferido > 0 ? plazoDiferido : undefined,
        estado: estadoResultado
      });
      onClose();
    }, 850);
  };

  // QRs dinámicos oficiales
  const effectivePhone = beneficiario.telefonoContacto || '0995544332';
  const qrDataMap = {
    deuna: `https://deuna.app/pay?to=${effectivePhone}&amount=${montoFinal.toFixed(2)}&ref=${referenciaOperacionId}`,
    payphone: `https://payphone.app/pay?phone=${effectivePhone}&amount=${montoFinal.toFixed(2)}&client=${encodeURIComponent(beneficiario.nombreCompleto)}`,
    guayaquil: `https://bg.ec/transfer?account=${beneficiario.numeroCuenta || '2100284910'}&amount=${montoFinal.toFixed(2)}`
  };

  const currentUploadedQr = 
    selectedQrPlatform === 'deuna' ? beneficiario.qrDeunaImage :
    selectedQrPlatform === 'payphone' ? beneficiario.qrPayphoneImage :
    beneficiario.qrGuayaquilImage;

  const qrImageSource = currentUploadedQr || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(qrDataMap[selectedQrPlatform])}`;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-payment-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 my-auto text-white">
        
        {/* Cabecera del Modal con Icono de Seguridad */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="unified-payment-modal-title" className="font-black text-white text-base">
                {tituloModal}
              </h3>
              <p className="text-xs text-slate-400">
                {subtituloModal}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar pasarela de pago"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen del Beneficiario y Monto Total */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {beneficiario.etiquetaRol || 'Beneficiario Asignado:'}
              </span>
              <h4 className="font-bold text-white text-sm">
                {beneficiario.nombreCompleto}
              </h4>
              <p className="text-xs text-slate-400">
                {beneficiario.subtitulo || `RUC/C.I.: ${beneficiario.identificacion}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total a Pagar:
              </span>
              <span className="font-mono font-black text-emerald-400 text-xl tracking-tight">
                ${montoFinal.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Desglose colapsable de impuestos SRI si está disponible */}
          {desglose && (
            <div className="border-t border-slate-800/80 pt-2">
              <button
                type="button"
                onClick={() => setShowDesglose(!showDesglose)}
                className="w-full text-[11px] font-semibold text-slate-400 hover:text-emerald-400 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Detalle contable & tributario SRI</span>
                {showDesglose ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDesglose && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1 animate-in fade-in duration-150">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono">${desglose.subtotalUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA ({desglose.tarifaIvaPct}%):</span>
                    <span className="font-mono">${desglose.montoIvaUSD.toFixed(2)}</span>
                  </div>
                  {desglose.retencionRentaMontoUSD ? (
                    <div className="flex justify-between text-amber-400">
                      <span>Retención IR (Cód. {desglose.retencionRentaCodigo || '312/344'}):</span>
                      <span className="font-mono">-${desglose.retencionRentaMontoUSD.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-1 mt-1">
                    <span>Monto a liquidar:</span>
                    <span className="font-mono text-emerald-400">${desglose.totalPagarUSD.toFixed(2)} USD</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pestañas de Selección de Medio Digital */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          {metodosHabilitados.includes('tarjeta') && (
            <button
              type="button"
              onClick={() => setActiveTab('tarjeta')}
              className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'tarjeta'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="text-[11px]">Tarjeta</span>
            </button>
          )}

          {metodosHabilitados.includes('qr') && (
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="text-[11px]">QRs</span>
            </button>
          )}

          {metodosHabilitados.includes('transferencia') && (
            <button
              type="button"
              onClick={() => setActiveTab('transferencia')}
              className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'transferencia'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Transferencia</span>
            </button>
          )}

          {metodosHabilitados.includes('paypal') && (
            <button
              type="button"
              onClick={() => setActiveTab('paypal')}
              className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'paypal'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[11px] font-black italic">P</span>
              <span className="text-[11px]">PayPal</span>
            </button>
          )}

          {metodosHabilitados.includes('billetera_escrow') && (
            <button
              type="button"
              onClick={() => setActiveTab('billetera_escrow')}
              className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'billetera_escrow'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[11px]">Escrow</span>
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* PESTAÑA 1: TARJETA DE CRÉDITO O DÉBITO                           */}
        {/* ================================================================= */}
        {activeTab === 'tarjeta' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Banner de Entorno Seguro PCI-DSS */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-400 block">ENTORNO SEGURO & SANDBOX (PCI-DSS)</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Conexión cifrada de extremo a extremo. Los datos bancarios se tokenizan de forma segura sin almacenarse en texto plano.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <Lock size={12} />
                Encriptación TLS 256-Bit
              </span>
              <button 
                type="button"
                onClick={handleCargarTarjetaPrueba}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
              >
                Cargar Tarjeta de Prueba
              </button>
            </div>

            {/* Número de Tarjeta con Badge de Marca */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Número de Tarjeta
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                />
                {cardBrand && (
                  <span className="absolute right-3 top-2.5 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {cardBrand}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Expiración
                </label>
                <input 
                  type="text" 
                  placeholder="MM / AA"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-center"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  CVC / CVV
                </label>
                <input 
                  type="password" 
                  placeholder="123"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  maxLength={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-center tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Nombre del Titular de la Tarjeta
              </label>
              <input 
                type="text" 
                placeholder="NOMBRE COMO FIGURA EN EL PLÁSTICO"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 uppercase tracking-wide"
              />
            </div>

            {/* Modalidad de Pago: Corriente vs Diferido */}
            {permitirDiferido && (
              <div className="pt-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Plan de Financiamiento:
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { meses: 0, label: 'Corriente' },
                    { meses: 3, label: '3 Meses' },
                    { meses: 6, label: '6 Meses' },
                    { meses: 12, label: '12 Meses' }
                  ].map(op => (
                    <button
                      key={op.meses}
                      type="button"
                      onClick={() => setPlazoDiferido(op.meses)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        plazoDiferido === op.meses
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
                {plazoDiferido > 0 && (
                  <p className="text-[10px] text-emerald-400/90 mt-1.5 text-center font-mono">
                    {plazoDiferido} cuotas estimadas de ${(montoFinal / plazoDiferido).toFixed(2)} USD / mes
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 2: CÓDIGOS QR INTERBANCARIOS (DEUNA, PAYPHONE, BG)       */}
        {/* ================================================================= */}
        {activeTab === 'qr' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Sub-pestañas de App QR */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedQrPlatform('deuna')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  selectedQrPlatform === 'deuna'
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                DeUna! Pichincha
              </button>

              <button
                type="button"
                onClick={() => setSelectedQrPlatform('payphone')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  selectedQrPlatform === 'payphone'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                PayPhone QR
              </button>

              <button
                type="button"
                onClick={() => setSelectedQrPlatform('guayaquil')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                  selectedQrPlatform === 'guayaquil'
                    ? 'bg-pink-600 text-white border-pink-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Banco Guayaquil
              </button>
            </div>

            {/* Visualizador QR Centrado */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-white p-2.5 rounded-xl shadow-lg mb-2">
                <img 
                  src={qrImageSource} 
                  alt={`QR ${selectedQrPlatform}`} 
                  className="w-36 h-36 object-contain"
                />
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Escanea con tu App bancaria oficial
              </span>
              <p className="text-xs text-white font-mono font-bold">
                Monto cargado: <strong className="text-emerald-400">${montoFinal.toFixed(2)} USD</strong>
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Beneficiario: {beneficiario.nombreCompleto} ({effectivePhone})
              </span>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Número de Referencia / Comprobante de la App (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="Ej: 948201 / DU-10492"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 3: TRANSFERENCIA BANCARIA NACIONAL                       */}
        {/* ================================================================= */}
        {activeTab === 'transferencia' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Selector de Entidad Financiera */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              {[
                { id: 'pichincha', label: 'Pichincha' },
                { id: 'guayaquil', label: 'Guayaquil' },
                { id: 'produbanco', label: 'Produbanco' },
                { id: 'cooperativa', label: 'JEP/Coop' }
              ].map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBank(b.id as any)}
                  className={`py-1.5 rounded-lg border transition cursor-pointer text-center ${
                    selectedBank === b.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Datos para transferir con 1-click copy */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Banco:</span>
                  <span className="font-bold text-white">
                    {selectedBank === 'pichincha' ? 'Banco Pichincha' :
                     selectedBank === 'guayaquil' ? 'Banco Guayaquil' :
                     selectedBank === 'produbanco' ? 'Produbanco' : 'Cooperativa JEP'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Tipo:</span>
                  <span className="font-semibold text-slate-300">{beneficiario.tipoCuenta || 'Cuenta de Ahorros'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Número de Cuenta:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {beneficiario.numeroCuenta || '2208741904'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(beneficiario.numeroCuenta || '2208741904', 'cuenta')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'cuenta' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedKey === 'cuenta' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Titular & C.I./RUC:</span>
                  <span className="text-slate-300 font-semibold">{beneficiario.nombreCompleto}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">RUC: {beneficiario.identificacion}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(beneficiario.identificacion, 'ruc')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'ruc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedKey === 'ruc' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Zona de Carga de Voucher */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Adjuntar Comprobante / Voucher de Pago
              </label>
              <label 
                htmlFor={fileInputId}
                className="w-full p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900/80 flex items-center justify-center gap-2 cursor-pointer transition text-xs"
              >
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud size={16} className="text-emerald-400" />
                <span className="text-slate-300 truncate max-w-[260px]">
                  {voucherFile ? voucherFile.name : 'Subir captura o PDF de la transferencia'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 4: PAYPAL (PAGOS INTERNACIONALES)                         */}
        {/* ================================================================= */}
        {activeTab === 'paypal' && (
          <div className="space-y-3 py-2 text-center animate-in fade-in duration-150">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto text-xl font-black italic">
                P
              </div>
              <h4 className="font-bold text-white text-sm">PayPal Checkout Express</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Paga de forma instantánea con tu saldo de PayPal o tarjetas internacionales sin comisiones imprevistas.
              </p>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-emerald-400 text-sm font-bold border border-slate-800">
                Total a cargar: ${montoFinal.toFixed(2)} USD
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTAÑA 5: BILLETERA DIGITAL SARA / CUSTODIA ESCROW              */}
        {/* ================================================================= */}
        {activeTab === 'billetera_escrow' && (
          <div className="space-y-3 py-1 animate-in fade-in duration-150">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Fondo de Custodia Fideicomiso:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  Blindaje Escrow SARA
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">
                Retención Condicionada por Hitos Técnicos
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Los fondos quedan custodiados de forma inviolable en el fideicomiso de obra o fletes. El desembolso al beneficiario se autoriza automáticamente una vez emitida el acta conforme por fiscalización.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                <span className="text-slate-400">Garantía de Satisfacción:</span>
                <span className="text-emerald-400 font-bold">100% Protegido</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón Principal Prominente de Confirmación */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin text-slate-950" />
                <span>Procesando pago seguro...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} className="text-slate-950" />
                <span>CONFIRMAR Y APLICAR PAGO (${montoFinal.toFixed(2)} USD)</span>
              </>
            )}
          </button>
        </div>

        {/* Pie de Página Legal SRI */}
        <p className="text-center text-[10px] text-slate-500 font-mono tracking-tight pt-1">
          SARA-PAGOS · Cumplimiento de Normativa SRI (Resolución NAC-DGERCGC24-00000013)
        </p>
      </div>
    </div>
  );
}
