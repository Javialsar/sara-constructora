'use client';

import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  UploadCloud, 
  Lock, 
  Tag,
  Smartphone,
  Info
} from 'lucide-react';
import { processPayment } from '@/lib/services/checkoutService';

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
  title = "Suscríbete a Pro",
  badgeText = "Grupo SARA",
  amount,
  currency = "USD",
  isSubscription = false,
  subscriptionInterval = "por mes",
  items = [],
  defaultEmail = "cliente@gruposara.com",
  defaultCustomerName = ""
}: StandardCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | 'transfer'>('card');
  const [email, setEmail] = useState(defaultEmail);
  const [saveInfo, setSaveInfo] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoSuccess, setPromoSuccess] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState(defaultCustomerName);
  const [country, setCountry] = useState('Ecuador');

  // Transfer & QR state
  const [selectedBank, setSelectedBank] = useState<'pichincha' | 'guayaquil' | 'produbanco'>('pichincha');
  const [qrApp, setQrApp] = useState<'deuna' | 'pichincha' | 'sara_wallet'>('deuna');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherFileName, setVoucherFileName] = useState<string | null>(null);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState('');

  // Reset modal state whenever it is opened to prevent sticking on success screen
  React.useEffect(() => {
    if (isOpen) {
      setCompletedSuccess(false);
      setIsProcessing(false);
      setSuccessTxId('');
      setReferenceNumber('');
      setVoucherFile(null);
      setVoucherFileName(null);
    }
  }, [isOpen]);

  const handleResetForNewPayment = () => {
    setCompletedSuccess(false);
    setIsProcessing(false);
    setSuccessTxId('');
    setReferenceNumber('');
    setVoucherFile(null);
    setVoucherFileName(null);
  };

  if (!isOpen) return null;

  const finalTotal = Math.max(0, amount - discount);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyPromo = () => {
    if (!promoCode) return;
    setIsApplyingPromo(true);
    setTimeout(() => {
      setIsApplyingPromo(false);
      if (promoCode.toUpperCase() === 'SARA2026' || promoCode.toUpperCase() === 'PROMO') {
        const disc = amount * 0.10;
        setDiscount(disc);
        setPromoSuccess(true);
      } else {
        alert('Código de promoción no válido o expirado.');
      }
    }, 600);
  };

  const handleSubmit = async (e?: React.FormEvent, expressType?: 'apple_pay' | 'google_pay') => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    try {
      const result = await processPayment({
        serviceName: title,
        amount: finalTotal,
        customerEmail: email,
        customerName: cardHolder || 'Cliente SARA',
        paymentMethod: expressType ? 'express' : paymentMethod,
        paymentSubtype: expressType || (paymentMethod === 'transfer' ? selectedBank : paymentMethod === 'qr' ? qrApp : 'card'),
        metadata: {
          cardNumber: cardNumber ? cardNumber.replace(/\s+/g, '') : undefined,
          country,
          referenceNumber,
          voucherFileName: voucherFileName || undefined,
          isSubscription
        }
      });

      if (result.success) {
        setSuccessTxId(result.transactionId);
        setCompletedSuccess(true);
        setTimeout(() => {
          onSuccess(result.transactionId);
        }, 1800);
      } else {
        alert(result.error || 'Error al procesar el pago.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      alert('Error en la comunicación con la pasarela.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 md:p-6 overflow-y-auto">
      {/* Container - full screen on mobile, 2-column modal on md+ */}
      <div className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-4xl bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button top-right (mobile & desktop) */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 md:bg-transparent rounded-full transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= LEFT COLUMN: Resumen del Pedido ================= */}
        <div className="w-full md:w-5/12 bg-slate-50/80 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div>
            {/* Back button link */}
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
              Volver a SARA
            </button>

            {/* Badge & Service Info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                {badgeText}
              </span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                <ShieldCheck className="w-3 h-3 mr-1" /> Oficial
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug mb-1">
              {title}
            </h2>

            {/* Price display */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {currency} {finalTotal.toFixed(2)}
              </span>
              {isSubscription && (
                <span className="text-sm font-semibold text-slate-500">
                  {subscriptionInterval}
                </span>
              )}
            </div>

            {/* Itemized detail breakdown */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{currency} {amount.toFixed(2)}</span>
              </div>

              {items.length > 0 && items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-500 text-xs">
                  <span>{item.label}</span>
                  <span className="font-medium text-slate-700">{currency} {item.amount.toFixed(2)}</span>
                </div>
              ))}

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold text-xs">
                  <span>Descuento aplicado</span>
                  <span>- {currency} {discount.toFixed(2)}</span>
                </div>
              )}

              {/* Promo code accordion */}
              <div className="pt-2">
                {!promoSuccess ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Código de promoción"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCode}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isApplyingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cupón {promoCode.toUpperCase()} activado
                  </div>
                )}
              </div>

              {/* Total adeudado */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-slate-900">
                <span className="font-bold text-sm">Total adeudado hoy</span>
                <span className="font-black text-xl text-slate-900">{currency} {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Left footer note */}
          <div className="mt-8 pt-4 border-t border-slate-200/60 hidden md:block text-[11px] text-slate-400">
            <p className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" /> Transacción asegurada y auditada
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Formulario de Pago ================= */}
        <div className="w-full md:w-7/12 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          
          {completedSuccess ? (
            <div className="my-auto py-10 px-4 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-md ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1.5">¡Pago Registrado con Éxito!</h3>
              <p className="text-slate-600 text-sm max-w-sm mb-4">
                Tu transacción ha sido validada y acreditada en la pasarela oficial de Grupo SARA.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl font-mono text-xs font-bold text-slate-800 shadow-xs mb-6 w-full max-w-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Código de Transacción</div>
                <div className="text-sm font-black text-slate-900 flex items-center justify-center gap-2">
                  <span>{successTxId || 'TX-SARA-PROCESADA'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(successTxId || 'TX-SARA-PROCESADA', 'success_tx')}
                    className="text-slate-400 hover:text-slate-800 p-1"
                    title="Copiar comprobante"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Botones de Acción para evitar que se quede congelado */}
              <div className="w-full max-w-xs space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess(successTxId || 'TX-SARA-PROCESADA');
                    onClose();
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Continuar a mi Cuenta / Facturación</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={handleResetForNewPayment}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Realizar Otro Pago</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors"
                >
                  Cerrar ventana
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
              
              {/* Express Payment Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSubmit(undefined, 'apple_pay')}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-black hover:bg-slate-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm"
                  >
                    <span className="font-semibold text-xs tracking-tight"> Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(undefined, 'google_pay')}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm"
                  >
                    <span className="text-xs font-bold"><span className="text-blue-500">G</span> Pay</span>
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    O bien
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>

              {/* Informacion de Contacto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Información de contacto
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-correo@empresa.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 transition-all"
                />
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Método de pago
                </label>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white">
                  
                  {/* OPCION 1: Tarjeta / Stripe */}
                  <label 
                    className={`flex items-start p-3.5 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600" /> Tarjeta Crédito / Débito (Stripe)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded tracking-wide">STRIPE</span>
                          <span className="text-[10px] font-black bg-blue-900 text-white px-1.5 py-0.5 rounded">VISA</span>
                          <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">MC</span>
                          <span className="text-[10px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded">AMEX</span>
                        </div>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
                          <div>
                            <input
                              type="text"
                              required
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCardNumber(val);
                              }}
                              placeholder="Número de tarjeta (0000 0000 0000 0000)"
                              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-950 bg-white placeholder:text-slate-400"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                setExpiry(val);
                              }}
                              placeholder="MM / AA"
                              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-950 bg-white placeholder:text-slate-400"
                            />
                            <input
                              type="password"
                              required
                              maxLength={4}
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                              placeholder="CVC / CVV"
                              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-950 bg-white placeholder:text-slate-400"
                            />
                          </div>

                          <input
                            type="text"
                            required
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Nombre en la tarjeta"
                            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-950 bg-white placeholder:text-slate-400"
                          />

                          <div>
                            <select
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-semibold"
                            >
                              <option value="Ecuador">Ecuador</option>
                              <option value="Colombia">Colombia</option>
                              <option value="Peru">Perú</option>
                              <option value="Estados Unidos">Estados Unidos</option>
                              <option value="Otro">Otro País</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* OPCION 2: QR DeUna / Grupo SARA */}
                  <label 
                    className={`flex items-start p-3.5 cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'qr'}
                      onChange={() => setPaymentMethod('qr')}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-emerald-600" /> QR de la Empresa (DeUna / Banco Pichincha)
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Inmediato
                        </span>
                      </div>

                      {paymentMethod === 'qr' && (
                        <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setQrApp('deuna')}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${qrApp === 'deuna' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                              DeUna! Pichincha
                            </button>
                            <button
                              type="button"
                              onClick={() => setQrApp('sara_wallet')}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${qrApp === 'sara_wallet' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                              Billetera SARA
                            </button>
                          </div>

                          {/* Visual QR Code Display */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                            <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=GRUPOSARA_PAGO_${finalTotal.toFixed(2)}`} 
                                alt="QR DeUna Grupo SARA" 
                                className="w-24 h-24 rounded bg-white p-1"
                              />
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p className="font-bold text-slate-800">1. Escanea desde tu App DeUna o Pichincha</p>
                              <p>Monto exacto: <strong className="text-emerald-700">{currency} {finalTotal.toFixed(2)}</strong></p>
                              <p className="text-[11px] text-slate-500">Beneficiario: CONSTRUCTORA E INMOBILIARIA SARA S.A.S.</p>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold text-slate-700">
                                Número de referencia o comprobante DeUna *
                              </label>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const text = await navigator.clipboard.readText();
                                    if (text) setReferenceNumber(text.trim());
                                  } catch {}
                                }}
                                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                              >
                                Pegar del portapapeles
                              </button>
                            </div>
                            <input
                              type="text"
                              required
                              value={referenceNumber}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                              placeholder="Ej. DU-98124018 o código numérico"
                              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 placeholder:font-normal shadow-xs transition-all"
                            />
                            <p className="text-[11px] text-slate-500 mt-1">
                              Pega o digita el código de confirmación generado por DeUna al enviar el pago.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* OPCION 3: Transferencia Bancaria Directa */}
                  <label 
                    className={`flex items-start p-3.5 cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" /> Transferencia Bancaria (Cta Cte Grupo SARA)
                        </span>
                      </div>

                      {paymentMethod === 'transfer' && (
                        <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
                          {/* Tabs de Bancos */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedBank('pichincha')}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${selectedBank === 'pichincha' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                              Banco Pichincha
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedBank('guayaquil')}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${selectedBank === 'guayaquil' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                              Banco Guayaquil
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedBank('produbanco')}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${selectedBank === 'produbanco' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                              Produbanco
                            </button>
                          </div>

                          {/* Bank details card */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Banco:</span>
                              <span className="font-bold text-slate-800">
                                {selectedBank === 'pichincha' ? 'Banco Pichincha (Cta Corriente)' : selectedBank === 'guayaquil' ? 'Banco Guayaquil (Cta Corriente)' : 'Produbanco Grupo Promerica'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Número de Cuenta:</span>
                              <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                                {selectedBank === 'pichincha' ? '2100258941' : selectedBank === 'guayaquil' ? '0015894236' : '12050098412'}
                                <button
                                  type="button"
                                  onClick={() => handleCopy(selectedBank === 'pichincha' ? '2100258941' : selectedBank === 'guayaquil' ? '0015894236' : '12050098412', 'cta')}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">RUC Beneficiario:</span>
                              <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                                1792984512001
                                <button
                                  type="button"
                                  onClick={() => handleCopy('1792984512001', 'ruc')}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Razón Social:</span>
                              <span className="font-semibold text-slate-800">GRUPO SARA INVERSIONES S.A.S.</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Email Notificación:</span>
                              <span className="font-semibold text-slate-800">pagos@gruposara.com</span>
                            </div>
                            {copiedField && (
                              <p className="text-[11px] text-emerald-600 font-bold text-right">¡Copiado al portapapeles!</p>
                            )}
                          </div>

                          {/* Reference & Voucher */}
                          <div className="space-y-3 pt-1">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700">
                                  Número de Comprobante / Transacción *
                                </label>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const text = await navigator.clipboard.readText();
                                      if (text) setReferenceNumber(text.trim());
                                    } catch {}
                                  }}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                >
                                  Pegar del portapapeles
                                </button>
                              </div>
                              <input
                                type="text"
                                required
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Ej. 098124912 o código de autorización"
                                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 placeholder:font-normal shadow-xs transition-all"
                              />
                              <p className="text-[11px] text-slate-500 mt-1">
                                Digita los números de tu comprobante bancario para validar tu acreditación en tiempo real.
                              </p>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Subir Comprobante (Opcional)
                              </label>
                              <div className="border border-dashed border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center">
                                <label className="cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-medium">
                                  <UploadCloud className="w-4 h-4 text-slate-500" />
                                  <span>{voucherFileName ? voucherFileName : 'Seleccionar foto o PDF'}</span>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setVoucherFile(e.target.files[0]);
                                        setVoucherFileName(e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkbox: Guardar mis datos */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="save_info"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <label htmlFor="save_info" className="text-xs text-slate-600 cursor-pointer select-none">
                  Guardar mis datos para un proceso de compra más rápido con Grupo SARA
                </label>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Procesando pago seguro...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    <span>
                      {isSubscription ? `Suscribirse por ${currency} ${finalTotal.toFixed(2)}` : `Pagar ${currency} ${finalTotal.toFixed(2)}`}
                    </span>
                  </>
                )}
              </button>

              {/* Security badges footer */}
              <div className="pt-2 text-center space-y-1.5">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
                  <span>Powered by <strong>Stripe & Kushki</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Encriptación SSL 256-bit
                  </span>
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-3">
                  <a href="#condiciones" className="hover:underline">Condiciones de servicio</a>
                  <span>•</span>
                  <a href="#privacidad" className="hover:underline">Privacidad</a>
                  <span>•</span>
                  <a href="#soporte" className="hover:underline">Soporte Grupo SARA</a>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
