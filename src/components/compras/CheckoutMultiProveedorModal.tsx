'use client';

import React, { useState } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, Truck, Store, MapPin, 
  CreditCard, QrCode, ArrowRight, Building2, Package, Sparkles, 
  Phone, User, Lock, AlertCircle, ExternalLink, Copy,
  Upload, FileCheck, Image as ImageIcon, Trash2, Check, RefreshCw
} from 'lucide-react';
import { MarketplaceProduct, SellerMarketplaceService, SellerProfile } from '@/lib/services/sellerMarketplaceService';
import { CompradorSession } from './AuthSocialModal';
import { CANTONES_ECUADOR, CantonEcuador, GeoDistanceService } from '@/lib/services/geoDistanceService';

export interface CartItem {
  product: MarketplaceProduct;
  cantidad: number;
}

interface CheckoutMultiProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  comprador: CompradorSession | null;
  cantonSeleccionado: CantonEcuador;
  direccionEntrega?: string;
  tipoEntregaInicial?: 'DOMICILIO' | 'RETIRO_BODEGA';
  onRequireAuth: () => void;
  onOrderSuccess: (orderResult: any) => void;
}

export function CheckoutMultiProveedorModal({
  isOpen,
  onClose,
  cartItems,
  comprador,
  cantonSeleccionado,
  direccionEntrega,
  tipoEntregaInicial,
  onRequireAuth,
  onOrderSuccess
}: CheckoutMultiProveedorModalProps) {
  // Modal Step: 'checkout' | 'confirmacion_exitosa'
  const [step, setStep] = useState<'checkout' | 'confirmacion_exitosa'>('checkout');

  // Tipo de entrega: 'DOMICILIO' | 'RETIRO_BODEGA'
  const [tipoEntrega, setTipoEntrega] = useState<'DOMICILIO' | 'RETIRO_BODEGA'>(
    tipoEntregaInicial || 'DOMICILIO'
  );
  const [direccionExacta, setDireccionExacta] = useState(
    direccionEntrega || comprador?.direccionEntrega || 'Frente Principal de Obra, Calle Principal y Secundaria'
  );
  const [referenciaLlegada, setReferenciaLlegada] = useState('Portón metálico azul frente al parque');
  
  // Sincronizar dirección y modalidad de entrega si cambian externamente
  React.useEffect(() => {
    if (direccionEntrega) {
      setDireccionExacta(direccionEntrega);
    }
  }, [direccionEntrega]);

  React.useEffect(() => {
    if (tipoEntregaInicial) {
      setTipoEntrega(tipoEntregaInicial);
    }
  }, [tipoEntregaInicial]);

  // Estados de Tarjeta de Crédito/Débito (Skill sara-unified-payment-gateway)
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaNombre, setTarjetaNombre] = useState(comprador?.nombre || '');
  const [tarjetaExp, setTarjetaExp] = useState('');
  const [tarjetaCvv, setTarjetaCvv] = useState('');
  const [tarjetaDiferido, setTarjetaDiferido] = useState<'CORRIENTE' | '3_MESES' | '6_MESES' | '12_MESES'>('CORRIENTE');
  const [tarjetaFranquicia, setTarjetaFranquicia] = useState<'visa' | 'mastercard' | 'amex' | 'diners' | 'desconocida'>('desconocida');
  const [errorTarjeta, setErrorTarjeta] = useState<string | null>(null);

  const handleTarjetaNumeroChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    if (cleaned.startsWith('4')) setTarjetaFranquicia('visa');
    else if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) setTarjetaFranquicia('mastercard');
    else if (/^(34|37)/.test(cleaned)) setTarjetaFranquicia('amex');
    else if (/^(30[0-5]|36|38)/.test(cleaned)) setTarjetaFranquicia('diners');
    else setTarjetaFranquicia('desconocida');

    const parts = cleaned.match(/.{1,4}/g);
    setTarjetaNumero(parts ? parts.join(' ') : cleaned);
    if (errorTarjeta) setErrorTarjeta(null);
  };

  const handleTarjetaExpChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setTarjetaExp(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setTarjetaExp(cleaned);
    }
    if (errorTarjeta) setErrorTarjeta(null);
  };

  // Método de pago y comprobante de pago
  const [metodoPago, setMetodoPago] = useState<'DEUNA' | 'PAYPHONE' | 'PEIGO' | 'SPI' | 'TARJETA'>('DEUNA');
  const [destinatarioPago, setDestinatarioPago] = useState<'escrow_sara' | string>('escrow_sara');
  const [voucherDataUrl, setVoucherDataUrl] = useState<string | null>(null);
  const [voucherNombre, setVoucherNombre] = useState<string | null>(null);
  const [voucherSize, setVoucherSize] = useState<string | null>(null);
  const [avisoVoucher, setAvisoVoucher] = useState<string | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);

  // Orden generada final
  const [ordenGenerada, setOrdenGenerada] = useState<{
    folio: string;
    pinSeguridad: string;
    totalUSD: number;
    subOrdenesCount: number;
    enlaceRastreo: string;
    voucherAdjunto?: string | null;
    metodoPagoUsado?: string;
  } | null>(null);

  // Manejador de subida de comprobante
  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setVoucherNombre(file.name);
    setVoucherSize(`${sizeMb} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setVoucherDataUrl(result);
        setAvisoVoucher('¡Comprobante adjuntado con éxito para validación!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarVoucher = () => {
    setVoucherDataUrl(null);
    setVoucherNombre(null);
    setVoucherSize(null);
    setAvisoVoucher(null);
  };

  if (!isOpen) return null;

  // 1. Agrupar ítems por Proveedor (Multi-Vendor Split)
  const itemsPorProveedor: Record<string, {
    sellerId: string;
    sellerNombre: string;
    sellerRuc: string;
    sellerPlan: string;
    items: CartItem[];
    subtotalSinIva: number;
    iva5: number;
    iva15: number;
    totalConIva: number;
    distanciaKm: number;
    tiempoEntregaTexto: string;
  }> = {};

  let pesoTotalKg = 0;
  let subtotalMaterialesSinIva = 0;
  let totalIva5 = 0;
  let totalIva15 = 0;

  cartItems.forEach(item => {
    const sId = item.product.sellerId;
    if (!itemsPorProveedor[sId]) {
      // Coordenadas simuladas o reales del vendedor
      const bodegaCoords = item.product.bodegaCoordenadas || { lat: -0.1807, lng: -78.4678 };
      const dist = GeoDistanceService.distanciaVialEcuadorKm(bodegaCoords, cantonSeleccionado.coordenadas);
      const tiempoEst = GeoDistanceService.estimarTiempoTransporte(dist);

      itemsPorProveedor[sId] = {
        sellerId: sId,
        sellerNombre: item.product.sellerNombre,
        sellerRuc: item.product.sellerRuc,
        sellerPlan: item.product.sellerPlan,
        items: [],
        subtotalSinIva: 0,
        iva5: 0,
        iva15: 0,
        totalConIva: 0,
        distanciaKm: dist,
        tiempoEntregaTexto: tiempoEst.etiquetaTexto
      };
    }

    const sub = item.product.precioSinIva * item.cantidad;
    const ivaAmt = sub * (item.product.tarifaIvaPct / 100);

    itemsPorProveedor[sId].items.push(item);
    itemsPorProveedor[sId].subtotalSinIva += sub;
    if (item.product.tarifaIvaPct === 5) {
      itemsPorProveedor[sId].iva5 += ivaAmt;
      totalIva5 += ivaAmt;
    } else {
      itemsPorProveedor[sId].iva15 += ivaAmt;
      totalIva15 += ivaAmt;
    }
    itemsPorProveedor[sId].totalConIva += (sub + ivaAmt);

    subtotalMaterialesSinIva += sub;
    pesoTotalKg += (item.product.pesoUnitarioKg || 20) * item.cantidad;
  });

  const proveedoresList = Object.values(itemsPorProveedor);
  const pesoTotalTon = +(pesoTotalKg / 1000).toFixed(2);

  // 2. Cálculo Inteligente de Flota SARA-FLETES
  let tipoVehiculoMtop = 'Camioneta Cabina Simple (1.5 Ton)';
  let tarifaBaseFlete = 25;
  if (pesoTotalTon > 1.5 && pesoTotalTon <= 5.0) {
    tipoVehiculoMtop = 'Camión Ligero 2DB (5.0 Ton)';
    tarifaBaseFlete = 45;
  } else if (pesoTotalTon > 5.0 && pesoTotalTon <= 14.0) {
    tipoVehiculoMtop = 'Volqueta / Camión Mediano (14.0 Ton)';
    tarifaBaseFlete = 85;
  } else if (pesoTotalTon > 14.0) {
    tipoVehiculoMtop = 'Tractocamión Mula 3S3 Plataforma (30 Ton)';
    tarifaBaseFlete = 160;
  }

  // Costo de flete final: tarifa base + peajes proporcionales según distancia media
  const distanciaPromedioKm = proveedoresList.length > 0 
    ? Math.round(proveedoresList.reduce((acc, p) => acc + p.distanciaKm, 0) / proveedoresList.length)
    : 15;
  
  // Costo de flete final: verificar si los proveedores cuentan con transporte propio gratuito sin recargo
  const tieneEntregaPropiaGratis = cartItems.length > 0 && cartItems.every(it => Boolean(it.product.entregaGratisPropia));

  const costoFleteTotal = tipoEntrega === 'DOMICILIO' 
    ? (tieneEntregaPropiaGratis ? 0 : Math.max(25, Math.round(tarifaBaseFlete + (distanciaPromedioKm * 0.35))))
    : 0;

  const totalConsolidado = subtotalMaterialesSinIva + totalIva5 + totalIva15 + costoFleteTotal;

  // Manejar el pago
  const handleProcesarPago = () => {
    if (!comprador) {
      onRequireAuth();
      return;
    }

    // Validación estricta para Tarjeta de Crédito / Débito (sara-unified-payment-gateway)
    if (metodoPago === 'TARJETA') {
      const numLimpio = tarjetaNumero.replace(/\s/g, '');
      if (numLimpio.length < 15) {
        setErrorTarjeta('Por favor ingrese un número de tarjeta válido (mínimo 15 dígitos).');
        return;
      }
      if (tarjetaNombre.trim().length < 3) {
        setErrorTarjeta('Por favor ingrese el nombre del titular tal como figura en la tarjeta.');
        return;
      }
      if (tarjetaExp.length < 5) {
        setErrorTarjeta('Por favor ingrese la fecha de vencimiento (MM/AA).');
        return;
      }
      if (tarjetaCvv.length < 3) {
        setErrorTarjeta('Por favor ingrese el código de seguridad CVV/CVC (3 o 4 dígitos).');
        return;
      }
      setErrorTarjeta(null);
    }

    setProcesandoPago(true);

    setTimeout(() => {
      const folioGen = `SARA-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const pinGen = `${Math.floor(1000 + Math.random() * 9000)}`;

      setOrdenGenerada({
        folio: folioGen,
        pinSeguridad: pinGen,
        totalUSD: totalConsolidado,
        subOrdenesCount: proveedoresList.length,
        enlaceRastreo: `https://sara-constructora.vercel.app/fletes/rastreo/${folioGen}`,
        voucherAdjunto: voucherNombre,
        metodoPagoUsado: metodoPago
      });

      setProcesandoPago(false);
      setStep('confirmacion_exitosa');
      onOrderSuccess({
        folio: folioGen,
        pin: pinGen,
        totalUSD: totalConsolidado,
        voucherAdjunto: voucherNombre,
        metodoPagoUsado: metodoPago
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-slate-100 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PANTALLA 1: CHECKOUT MULTI-PROVEEDOR */}
        {step === 'checkout' && (
          <div className="space-y-6">
            
            {/* Cabecera */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  CHECKOUT MULTI-BODEGA
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {proveedoresList.length} {proveedoresList.length === 1 ? 'Proveedor Asignado' : 'Proveedores Consolidados'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Requisición y Pago Centralizado de Obra
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pagas una sola vez. SARA divide automáticamente las órdenes por bodega y coordina la logística pesada MTOP.
              </p>
            </div>

            {/* SECCIÓN 1: IDENTIFICACIÓN DEL COMPRADOR */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {comprador ? comprador.nombre : 'Comprador No Identificado'}
                    </span>
                    {comprador?.proveedorAuth && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-400">
                        {comprador.proveedorAuth}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    {comprador ? `RUC/Cédula: ${comprador.identificacionRucCedula} • WhatsApp: ${comprador.telefonoWhatsapp}` : 'Identifícate con 1 clic para facturación SRI y entrega'}
                  </span>
                </div>
              </div>

              {!comprador ? (
                <button
                  onClick={onRequireAuth}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  Identificarme con Google / Redes
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verificado SRI</span>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: SELECCIÓN DE ENTREGA (SARA-FLETES VS RETIRO) */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                Modalidad de Recepción de Materiales:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Opción A: SARA-FLETES a Domicilio/Obra */}
                <div
                  onClick={() => setTipoEntrega('DOMICILIO')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    tipoEntrega === 'DOMICILIO'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className={`w-5 h-5 ${tipoEntrega === 'DOMICILIO' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-black">Entrega en Obra con SARA-FLETES</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      +${costoFleteTotal} USD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Asignación: <strong className="text-white">{tipoVehiculoMtop}</strong>. Carga consolidada en origen y entrega a pie de obra con rastreo satelital.
                  </p>
                </div>

                {/* Opción B: Retiro en Bodega */}
                <div
                  onClick={() => setTipoEntrega('RETIRO_BODEGA')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    tipoEntrega === 'RETIRO_BODEGA'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Store className={`w-5 h-5 ${tipoEntrega === 'RETIRO_BODEGA' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-black">Retiro en Bodega del Proveedor</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      GRATIS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Retiras con tu propio transporte en el patio de cada empresa presentando la orden digital.
                  </p>
                </div>

              </div>

              {/* Formulario Dirección Si es a Domicilio */}
              {tipoEntrega === 'DOMICILIO' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <MapPin className="w-4 h-4" />
                    <span>Lugar de Descarga: {cantonSeleccionado.nombre}, {cantonSeleccionado.provincia}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Dirección de la Obra o Domicilio *
                      </label>
                      <input
                        type="text"
                        value={direccionExacta}
                        onChange={(e) => setDireccionExacta(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Calle principal, número y secundaria"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Punto de Referencia para Chofer MTOP *
                      </label>
                      <input
                        type="text"
                        value={referenciaLlegada}
                        onChange={(e) => setReferenciaLlegada(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Ej: Frente al puente, portón verde"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: DESGLOSE DE SUB-ÓRDENES POR EMPRESA (MULTI-VENDOR SPLIT) */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                Desglose de Sub-Órdenes por Empresa Proveedora:
              </span>
              <div className="space-y-3">
                {proveedoresList.map((prov, idx) => (
                  <div key={prov.sellerId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{prov.sellerNombre}</h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            RUC: {prov.sellerRuc} • Plan {prov.sellerPlan}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-amber-400 font-bold block">
                          📍 {prov.distanciaKm} km de tu obra
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {prov.tiempoEntregaTexto}
                        </span>
                      </div>
                    </div>

                    {/* Partidas de este proveedor */}
                    <div className="space-y-2">
                      {prov.items.map(it => (
                        <div key={it.product.id} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300">
                            {it.cantidad} {it.product.unidad} × {it.product.nombre}
                          </span>
                          <span className="text-white font-bold">
                            ${(it.product.precioSinIva * it.cantidad).toFixed(2)} USD
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/60 text-xs font-mono">
                      <span className="text-slate-400">
                        Factura Electrónica directa de este proveedor:
                      </span>
                      <span className="font-bold text-amber-400">
                        ${prov.totalConIva.toFixed(2)} USD (inc. IVA)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 4: SELECCIÓN DE MÉTODO DE PAGO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
                  Método de Pago Blindado (Fideicomiso Escrow):
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Protegido
                </span>
              </div>

              {/* Botones de Métodos de Pago */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'DEUNA', label: 'DeUna! Pichincha', desc: 'QR Oficial', icon: QrCode },
                  { id: 'PAYPHONE', label: 'Payphone Ecuador', desc: 'QR o Saldo', icon: CreditCard },
                  { id: 'PEIGO', label: 'Peigo Guayaquil', desc: 'QR Banco Guayaquil', icon: QrCode },
                  { id: 'SPI', label: 'Transferencia SPI', desc: 'Bancos / Coop.', icon: Building2 },
                  { id: 'TARJETA', label: 'Tarjeta de Crédito', desc: 'Visa / Mastercard', icon: Lock },
                ].map(m => {
                  const Icon = m.icon;
                  const isSelected = metodoPago === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoPago(m.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1.5" />
                      <div className="text-xs font-bold leading-tight">{m.label}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-900 opacity-80' : 'text-slate-500'}`}>
                        {m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CONTENEDOR DE PAGO POR QR / TRANSFERENCIA Y CARGA DE VOUCHER */}
              {metodoPago !== 'TARJETA' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/30 space-y-4 animate-in fade-in duration-200">
                  
                  {/* Selector de Destinatario: GRUPO SARA Escrow vs Proveedores de la orden */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block">
                      Selecciona la cuenta de la empresa para ver el Código QR oficial:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDestinatarioPago('escrow_sara')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          destinatarioPago === 'escrow_sara'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>GRUPO SARA Escrow (Fideicomiso Oficial)</span>
                      </button>

                      {proveedoresList.map(prov => (
                        <button
                          key={prov.sellerId}
                          type="button"
                          onClick={() => setDestinatarioPago(prov.sellerId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            destinatarioPago === prov.sellerId
                              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>{prov.sellerNombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detalle del QR y Datos Bancarios según Selección */}
                  {(() => {
                    const sellerObj = destinatarioPago !== 'escrow_sara'
                      ? SellerMarketplaceService.getSellerById(destinatarioPago)
                      : null;

                    const nombreEmpresa = sellerObj?.nombreComercial || 'GRUPO SARA CONSTRUCTORA S.A.S. (Fideicomiso Escrow)';
                    const rucEmpresa = sellerObj?.ruc || '1790008594001';
                    const bancoNombre = sellerObj?.cuentaBancaria?.banco || 'Banco Pichincha';
                    const tipoCta = sellerObj?.cuentaBancaria?.tipoCuenta || 'Cuenta Corriente';
                    const numCta = sellerObj?.cuentaBancaria?.numeroCuenta || '2100849201';
                    const titularCta = sellerObj?.cuentaBancaria?.titular || 'GRUPO SARA CONSTRUCTORA S.A.S.';

                    // URLs de códigos QR según método
                    let qrUrl = '';
                    let walletLabel = '';
                    let walletPhone = '';

                    if (metodoPago === 'DEUNA') {
                      walletLabel = 'DeUna! Banco Pichincha';
                      walletPhone = sellerObj?.billeterasMoviles?.deUnaCelular || '0992348190';
                      qrUrl = sellerObj?.billeterasMoviles?.deUnaQrUrl 
                        || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=deuna%3A%2F%2Fpay%3Fphone%3D${walletPhone}%26merchant%3D${encodeURIComponent(nombreEmpresa)}%26amount%3D${totalConsolidado.toFixed(2)}`;
                    } else if (metodoPago === 'PAYPHONE') {
                      walletLabel = 'Payphone Ecuador';
                      walletPhone = sellerObj?.billeterasMoviles?.payphoneCelular || '0992348190';
                      qrUrl = sellerObj?.billeterasMoviles?.payphoneQrUrl
                        || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=payphone%3A%2F%2Fpay%3Fphone%3D${walletPhone}%26client%3D${encodeURIComponent(nombreEmpresa)}%26amount%3D${totalConsolidado.toFixed(2)}`;
                    } else if (metodoPago === 'PEIGO') {
                      walletLabel = 'Peigo Banco Guayaquil';
                      walletPhone = sellerObj?.billeterasMoviles?.peigoCelular || '0992348190';
                      qrUrl = sellerObj?.billeterasMoviles?.peigoQrUrl
                        || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=peigo%3A%2F%2Ftransfer%3Faccount%3D${walletPhone}%26holder%3D${encodeURIComponent(nombreEmpresa)}`;
                    } else if (metodoPago === 'SPI') {
                      walletLabel = 'Transferencia SPI / Interbancaria';
                      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=spi%3A%2F%2Fbce%3Faccount%3D${numCta}%26bank%3D${encodeURIComponent(bancoNombre)}%26amount%3D${totalConsolidado.toFixed(2)}`;
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-800">
                        
                        {/* Lado QR Imagen */}
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                          <div className="w-48 h-48 bg-white p-2.5 rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center">
                            <img
                              src={qrUrl}
                              alt={`QR ${walletLabel}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-black text-white block">
                              Escanear con App {walletLabel}
                            </span>
                            <span className="text-[11px] font-mono text-amber-400 font-bold">
                              Monto exacto: ${totalConsolidado.toFixed(2)} USD
                            </span>
                          </div>
                        </div>

                        {/* Lado Datos de Cuenta y Comprobante */}
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                            <div className="text-amber-400 font-bold text-[11px] uppercase flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Datos de Transferencia Bancaria:</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Banco:</span>
                              <span className="text-white font-bold">{bancoNombre}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Tipo de Cuenta:</span>
                              <span className="text-white">{tipoCta}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Nº de Cuenta:</span>
                              <span className="text-amber-300 font-black tracking-wider">{numCta}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Titular:</span>
                              <span className="text-white text-[11px] text-right truncate max-w-[180px]">{titularCta}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">RUC:</span>
                              <span className="text-white font-mono">{rucEmpresa}</span>
                            </div>
                            {walletPhone && (
                              <div className="flex justify-between pt-1 border-t border-slate-800">
                                <span className="text-slate-400">Celular Afiliado:</span>
                                <span className="text-amber-400 font-bold">{walletPhone}</span>
                              </div>
                            )}
                          </div>

                          {/* SECCIÓN DE CARGA DE COMPROBANTE DE PAGO */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block">
                              📎 Subir Comprobante de Pago (Voucher / Foto / PDF) *:
                            </label>

                            {!voucherDataUrl ? (
                              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900 rounded-2xl cursor-pointer transition-all group">
                                <Upload className="w-6 h-6 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-white group-hover:text-amber-300">
                                  Haz clic para subir comprobante
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  Formatos: PNG, JPG, PDF (Máx. 10MB)
                                </span>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={handleVoucherUpload}
                                  className="hidden"
                                />
                              </label>
                            ) : (
                              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  {voucherDataUrl.startsWith('data:image') ? (
                                    <img
                                      src={voucherDataUrl}
                                      alt="Voucher Preview"
                                      className="w-10 h-10 object-cover rounded-lg border border-emerald-400 shrink-0"
                                    />
                                  ) : (
                                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                                      <FileCheck className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="overflow-hidden">
                                    <span className="text-xs font-bold text-white block truncate">
                                      {voucherNombre}
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400 block">
                                      {voucherSize} • Listo para conciliar
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleEliminarVoucher}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                                  title="Quitar comprobante"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {avisoVoucher && (
                              <span className="text-[11px] font-mono text-emerald-400 block">
                                ✓ {avisoVoucher}
                              </span>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

              {/* CONTENEDOR DE PAGO POR TARJETA DE CRÉDITO O DÉBITO (SKILL sara-unified-payment-gateway) */}
              {metodoPago === 'TARJETA' && (
                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 space-y-4 animate-in fade-in duration-200 shadow-xl">
                  {/* Encabezado Seguro */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Pasarela de Tarjeta de Crédito / Débito
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Visa, Mastercard, Diners Club, American Express • Encriptación TLS 256-Bit
                        </span>
                      </div>
                    </div>
                    {/* Badge de Franquicia detectada */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                        {tarjetaFranquicia === 'visa' && '💳 VISA'}
                        {tarjetaFranquicia === 'mastercard' && '💳 MASTERCARD'}
                        {tarjetaFranquicia === 'amex' && '💳 AMEX'}
                        {tarjetaFranquicia === 'diners' && '💳 DINERS CLUB'}
                        {tarjetaFranquicia === 'desconocida' && '💳 TARJETA'}
                      </span>
                    </div>
                  </div>

                  {errorTarjeta && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorTarjeta}</span>
                    </div>
                  )}

                  {/* Formulario de Tarjeta */}
                  <div className="space-y-3.5">
                    {/* Número de Tarjeta */}
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                        Número de Tarjeta *:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={19}
                          value={tarjetaNumero}
                          onChange={(e) => handleTarjetaNumeroChange(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Nombre del Titular */}
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                        Nombre del Titular (Como figura en la tarjeta) *:
                      </label>
                      <input
                        type="text"
                        value={tarjetaNombre}
                        onChange={(e) => {
                          setTarjetaNombre(e.target.value.toUpperCase());
                          if (errorTarjeta) setErrorTarjeta(null);
                        }}
                        placeholder="EJ: ROBERTO MORALES CH."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 font-sans uppercase font-bold focus:outline-none"
                      />
                    </div>

                    {/* Fecha de Expiración y CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                          Vencimiento (MM/AA) *:
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={tarjetaExp}
                          onChange={(e) => handleTarjetaExpChange(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 font-mono text-center focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                          Cód. Seguridad (CVV/CVC) *:
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={tarjetaCvv}
                          onChange={(e) => {
                            setTarjetaCvv(e.target.value.replace(/\D/g, ''));
                            if (errorTarjeta) setErrorTarjeta(null);
                          }}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 font-mono text-center tracking-widest focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Selector de Financiamiento / Diferido en Ecuador */}
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 font-bold uppercase block mb-1">
                        Plan de Financiamiento (Ecuador) *:
                      </label>
                      <select
                        value={tarjetaDiferido}
                        onChange={(e) => setTarjetaDiferido(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white font-mono focus:outline-none"
                      >
                        <option value="CORRIENTE">Pago Corriente (1 Cuota de ${totalConsolidado.toFixed(2)})</option>
                        <option value="3_MESES">3 Meses sin intereses (3 cuotas de ${(totalConsolidado / 3).toFixed(2)})</option>
                        <option value="6_MESES">6 Meses sin intereses (6 cuotas de ${(totalConsolidado / 6).toFixed(2)})</option>
                        <option value="12_MESES">12 Meses con intereses (12 cuotas referenciales de ${((totalConsolidado * 1.09) / 12).toFixed(2)})</option>
                      </select>
                    </div>

                    {/* Badge de Seguridad y Custodia Escrow */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Transacción protegida por Escrow SARA y PCI-DSS Nivel 1</span>
                      </div>
                      <span className="text-slate-500">Kushki / Payphone Card Gateway</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SECCIÓN 5: RESUMEN FINANCIERO Y EXPLICACIÓN DE FACTURACIÓN */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Materiales (Sin IVA):</span>
                  <span className="text-white font-bold">${subtotalMaterialesSinIva.toFixed(2)}</span>
                </div>
                {totalIva5 > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>IVA 5% (Material de Construcción SRI Res. 013):</span>
                    <span className="font-bold">+${totalIva5.toFixed(2)}</span>
                  </div>
                )}
                {totalIva15 > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>IVA 15% (Tarifa General):</span>
                    <span className="font-bold">+${totalIva15.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sky-400 pt-1 border-t border-slate-800">
                  <span>
                    {tipoEntrega === 'DOMICILIO'
                      ? (tieneEntregaPropiaGratis 
                          ? 'Transporte del Proveedor:' 
                          : `Logística SARA-FLETES (${pesoTotalTon} Ton):`)
                      : 'Modalidad de Recepción:'}
                  </span>
                  <span className={`font-bold ${costoFleteTotal > 0 ? 'text-sky-400' : 'text-emerald-400'}`}>
                    {tipoEntrega === 'DOMICILIO'
                      ? (tieneEntregaPropiaGratis
                          ? '$0.00 (Entrega sin recargo - Flota propia del Proveedor)'
                          : `+$${costoFleteTotal.toFixed(2)}`)
                      : 'GRATIS ($0.00 Retiro en Bodega)'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm">
                  <span className="font-bold text-white">Total a Pagar (Custodia Escrow):</span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    ${totalConsolidado.toFixed(2)} <span className="text-xs text-slate-400">USD</span>
                  </span>
                </div>
              </div>

              {/* Disclaimer de Facturación */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Gobernanza Tributaria & Liberación de Fondos:</strong>
                  Cada empresa proveedora emite su factura electrónica de material al 5% IVA. SARA-FLETES emite la factura del transporte. Tu pago queda 100% blindado en custodia Escrow hasta que verifiques y entregues tu PIN de recepción en obra.
                </div>
              </div>
            </div>

            {/* BOTÓN PRINCIPAL */}
            <button
              onClick={handleProcesarPago}
              disabled={procesandoPago}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              {procesandoPago ? (
                <span>Blindando Fondos en Fideicomiso Escrow...</span>
              ) : (
                <>
                  <span>Confirmar y Pagar Pedido (${totalConsolidado.toFixed(2)} USD)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </div>
        )}

        {/* PANTALLA 2: CONFIRMACIÓN EXITOSA & PIN DE SEGURIDAD */}
        {step === 'confirmacion_exitosa' && ordenGenerada && (
          <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                ¡PAGO RECIBIDO EN CUSTODIA ESCROW!
              </span>
              <h3 className="text-2xl font-black text-white">
                Orden Consolidada {ordenGenerada.folio}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hemos notificado a las <strong>{ordenGenerada.subOrdenesCount} empresas proveedoras</strong> para que preparen el despacho inmediato.
              </p>
            </div>

            {/* TARJETA DEL PIN DE ENTREGA */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 max-w-md mx-auto space-y-3 shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-400">
                <Lock className="w-4 h-4" />
                <span>TU PIN DE SEGURIDAD PARA LA DESCARGA EN OBRA</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-white py-2 bg-slate-900 rounded-2xl border border-slate-800">
                {ordenGenerada.pinSeguridad}
              </div>
              <p className="text-[11px] text-slate-400">
                Guarda este código. Solo entrégaselo al chofer o bodeguero cuando hayas revisado físicamente que el material llegó completo y en perfecto estado.
              </p>
            </div>

            {/* Comprobante de Pago Adjuntado */}
            {ordenGenerada.voucherAdjunto && (
              <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-2xl max-w-md mx-auto flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white block truncate">
                      {ordenGenerada.voucherAdjunto}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Comprobante en auditoría contable y conciliación Three-Way Match
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                  Registrado
                </span>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={ordenGenerada.enlaceRastreo}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <Truck className="w-4 h-4" />
                <span>Rastreo en Vivo SARA-FLETES</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Volver a la Vitrina
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
