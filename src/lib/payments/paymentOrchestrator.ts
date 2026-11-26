/**
 * Orquestador Multi-Pasarela Real — SARA FLETES v2.0 (Ecuador)
 * - Kushki: Principal (Tokenización 1-Clic, diferidos 3/6/9/12, Pre-autorización 7 días + Captura).
 * - PayPhone: Secundario / Fallback automático silencioso (tarifa real 5% + IVA Ecuador 15%).
 * - Deuna! Empresas: QR Dinámico Instantáneo (Banco Pichincha / BGR / Cooperativas).
 * - Efectivo + SARA Wallet: Descuento atómico de comisión operativa (10%).
 */

export type PaymentGatewayMethod = 'kushki' | 'payphone' | 'deuna' | 'cash';
export type DeferredMonths = 0 | 3 | 6 | 9 | 12;

export interface OrchestratedPaymentRequest {
  orderId: string;
  amountUsd: number;
  method: PaymentGatewayMethod;
  intentType: 'charge' | 'preauth' | 'topup';
  kushkiToken?: string;
  deferredMonths?: DeferredMonths;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}

export interface OrchestratedPaymentResult {
  success: boolean;
  gatewayUsed: PaymentGatewayMethod;
  fallbackTriggered: boolean;
  status: 'PAID' | 'AUTHORIZED' | 'PENDING_QR' | 'PENDING_REDIRECT' | 'CASH_ACCEPTED' | 'FAILED';
  gatewayRef?: string;
  ticketNumber?: string;
  payphonePayUrl?: string;
  deunaQrPayload?: string;
  deunaQrImageUrl?: string;
  preauthExpiresAt?: string;
  gatewayFeeEstimateUsd?: number;
  error?: string;
}

export const PAYPHONE_COMMISSION_RATE = 0.05; // 5%
export const ECUADOR_IVA_RATE = 0.15; // 15% IVA vigente Ecuador
export const SARA_CASH_COMMISSION_RATE = 0.10; // 10% comisión operativa
export const KUSHKI_PREAUTH_VALIDITY_DAYS = 7;

export function calculatePayphoneFeeUsd(amountUsd: number): {
  baseCommissionUsd: number;
  ivaOnCommissionUsd: number;
  totalFeeUsd: number;
} {
  const baseCommissionUsd = Number((amountUsd * PAYPHONE_COMMISSION_RATE).toFixed(2));
  const ivaOnCommissionUsd = Number((baseCommissionUsd * ECUADOR_IVA_RATE).toFixed(2));
  return {
    baseCommissionUsd,
    ivaOnCommissionUsd,
    totalFeeUsd: Number((baseCommissionUsd + ivaOnCommissionUsd).toFixed(2)),
  };
}

export function calculateSaraCashCommissionUsd(amountUsd: number): number {
  return Number((amountUsd * SARA_CASH_COMMISSION_RATE).toFixed(2));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ejecuta el cobro/pre-autorización con fallback automático silencioso de Kushki -> PayPhone
 * ante timeout o caída 5xx del endpoint principal.
 */
export async function executeOrchestratedPayment(
  req: OrchestratedPaymentRequest
): Promise<OrchestratedPaymentResult> {
  if (req.method === 'cash') {
    return {
      success: true,
      gatewayUsed: 'cash',
      fallbackTriggered: false,
      status: 'CASH_ACCEPTED',
      gatewayFeeEstimateUsd: calculateSaraCashCommissionUsd(req.amountUsd),
    };
  }

  if (req.method === 'deuna') {
    const res = await fetchWithTimeout('/api/pagos/deuna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: req.orderId,
        amountUsd: req.amountUsd,
        intentType: req.intentType,
        description: req.description || `SARA FLETES Orden ${req.orderId}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        gatewayUsed: 'deuna',
        fallbackTriggered: false,
        status: 'FAILED',
        error: data.error || 'No se pudo generar el QR dinámico Deuna! Empresas.',
      };
    }
    return {
      success: true,
      gatewayUsed: 'deuna',
      fallbackTriggered: false,
      status: 'PENDING_QR',
      gatewayRef: data.transactionId,
      deunaQrPayload: data.qrPayload,
      deunaQrImageUrl: data.qrImageUrl,
    };
  }

  if (req.method === 'payphone') {
    return executePayphoneDirect(req, false);
  }

  // Método principal: Kushki (con fallback silencioso a PayPhone si hay timeout o error 5xx)
  try {
    const res = await fetchWithTimeout('/api/pagos/kushki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: req.kushkiToken,
        orderId: req.orderId,
        amount: req.amountUsd,
        intentType: req.intentType,
        deferredMonths: req.deferredMonths ?? 0,
        description: req.description || `SARA FLETES Orden ${req.orderId}`,
      }),
    });

    if (res.status >= 500) {
      // Fallback silencioso automático a PayPhone
      return executePayphoneDirect(req, true);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        gatewayUsed: 'kushki',
        fallbackTriggered: false,
        status: 'FAILED',
        error: data.error || 'Transacción rechazada por Kushki.',
      };
    }

    return {
      success: true,
      gatewayUsed: 'kushki',
      fallbackTriggered: false,
      status: req.intentType === 'preauth' ? 'AUTHORIZED' : 'PAID',
      gatewayRef: data.transactionId,
      ticketNumber: data.ticketNumber,
      preauthExpiresAt: data.preauthExpiresAt,
    };
  } catch {
    // Timeout o error de red en Kushki -> Fallback automático silencioso a PayPhone
    return executePayphoneDirect(req, true);
  }
}

async function executePayphoneDirect(
  req: OrchestratedPaymentRequest,
  fallbackTriggered: boolean
): Promise<OrchestratedPaymentResult> {
  try {
    const res = await fetchWithTimeout('/api/pagos/payphone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: req.orderId,
        amountUsd: req.amountUsd,
        intentType: req.intentType,
        email: req.customerEmail,
        phoneNumber: req.customerPhone,
        description: req.description || `SARA FLETES Orden ${req.orderId}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        gatewayUsed: 'payphone',
        fallbackTriggered,
        status: 'FAILED',
        error: data.error || 'Error iniciando cobro en PayPhone.',
      };
    }

    return {
      success: true,
      gatewayUsed: 'payphone',
      fallbackTriggered,
      status: 'PENDING_REDIRECT',
      gatewayRef: data.clientTransactionId,
      payphonePayUrl: data.payWithCard || data.payWithPayPhone,
      gatewayFeeEstimateUsd: calculatePayphoneFeeUsd(req.amountUsd).totalFeeUsd,
    };
  } catch (err) {
    return {
      success: false,
      gatewayUsed: 'payphone',
      fallbackTriggered,
      status: 'FAILED',
      error: err instanceof Error ? err.message : 'Error de red comunicando con PayPhone.',
    };
  }
}
