import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user, isAdmin } = await requireServerAuth(req);
    const admin = createAdminClient();

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload JSON inválido.' }, { status: 400 });
    }

    const {
      orderId,
      receiverName,
      photoBase64,
      photoMimeType,
      clientPhotoSha256,
      signatureSvg,
      receiverQrToken,
      gpsLat,
      gpsLng,
      distanceToDropoffM,
      triggerSettlement = true,
    } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'orderId es obligatorio.' }, { status: 400 });
    }
    if (!receiverName || typeof receiverName !== 'string' || receiverName.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Nombre del receptor autorizado es obligatorio.' }, { status: 400 });
    }
    if (!photoBase64 || typeof photoBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Evidencia fotográfica obligatoria para el e-POD.' }, { status: 400 });
    }
    if (typeof gpsLat !== 'number' || typeof gpsLng !== 'number' || !Number.isFinite(gpsLat) || !Number.isFinite(gpsLng)) {
      return NextResponse.json({ success: false, error: 'Coordenadas GPS verificables obligatorias.' }, { status: 400 });
    }

    const hasSignature = typeof signatureSvg === 'string' && signatureSvg.trim().length > 20;
    const hasQr = typeof receiverQrToken === 'string' && receiverQrToken.trim().length >= 8;

    if (!hasSignature && !hasQr) {
      return NextResponse.json(
        { success: false, error: 'Se requiere validación dual: firma táctil en pantalla o escaneo del Código QR único de la orden.' },
        { status: 400 }
      );
    }

    // 1. Verificar orden y pertenencia Zero-Trust
    const { data: order, error: orderErr } = await admin
      .from('fletes_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, error: 'Orden de flete no encontrada.' }, { status: 404 });
    }

    if (!isAdmin && order.driver_id !== user.id && order.customer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: solo el conductor o cliente de la orden pueden certificar el e-POD.' },
        { status: 403 }
      );
    }

    if (hasQr && order.receiver_qr_token && receiverQrToken.trim() !== order.receiver_qr_token) {
      return NextResponse.json(
        { success: false, error: 'Código QR inválido: no coincide con el token criptográfico único de esta orden.' },
        { status: 400 }
      );
    }

    // 2. Decodificar foto y calcular hash SHA-256 verificable en servidor
    const cleanBase64 = photoBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
    const photoBuffer = Buffer.from(cleanBase64, 'base64');
    if (photoBuffer.byteLength < 100 || photoBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Tamaño de fotografía inválido (debe ser <= 10 MB).' },
        { status: 400 }
      );
    }

    const serverSha256 = crypto.createHash('sha256').update(photoBuffer).digest('hex');
    if (clientPhotoSha256 && typeof clientPhotoSha256 === 'string' && clientPhotoSha256.toLowerCase() !== serverSha256) {
      return NextResponse.json(
        { success: false, error: 'Integridad comprometida: el hash SHA-256 de la evidencia fotográfica no coincide.' },
        { status: 400 }
      );
    }

    // 3. Subir evidencia sellada al bucket privado Supabase Storage `fletes-epod`
    const mime = typeof photoMimeType === 'string' ? photoMimeType : 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const storagePath = `orders/${orderId}/epod_${Date.now()}_${serverSha256.slice(0, 12)}.${ext}`;

    const { error: uploadErr } = await admin.storage
      .from('fletes-epod')
      .upload(storagePath, photoBuffer, {
        contentType: mime,
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json(
        { success: false, error: `Error subiendo evidencia al bucket fletes-epod: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    const verificationMethod: 'SIGNATURE' | 'QR_SCAN' | 'DUAL' =
      hasSignature && hasQr ? 'DUAL' : hasSignature ? 'SIGNATURE' : 'QR_SCAN';

    const verifiedAt = new Date().toISOString();

    // 4. Registrar acta criptográfica en fletes_epod_records con status = 'VERIFIED'
    const { data: epodRecord, error: epodErr } = await admin
      .from('fletes_epod_records')
      .upsert(
        {
          order_id: orderId,
          driver_id: order.driver_id || user.id,
          receiver_name: receiverName.trim(),
          photo_url: storagePath,
          photo_sha256: serverSha256,
          signature_svg: hasSignature ? signatureSvg : null,
          receiver_qr_token: hasQr ? receiverQrToken.trim() : null,
          verification_method: verificationMethod,
          gps_coords: `SRID=4326;POINT(${gpsLng} ${gpsLat})`,
          gps_lat: gpsLat,
          gps_lng: gpsLng,
          distance_to_dropoff_m: typeof distanceToDropoffM === 'number' ? distanceToDropoffM : null,
          status: 'VERIFIED',
          verified_at: verifiedAt,
        },
        { onConflict: 'order_id' }
      )
      .select()
      .single();

    if (epodErr) {
      return NextResponse.json(
        { success: false, error: `Error registrando acta e-POD: ${epodErr.message}` },
        { status: 500 }
      );
    }

    await admin
      .from('fletes_orders')
      .update({ status: 'EPOD_VERIFIED', updated_at: verifiedAt })
      .eq('id', orderId);

    // 5. Captura automática de pre-autorización Kushki si existe un intent AUTHORIZED
    let kushkiCaptureRef: string | null = null;
    const { data: preauthIntent } = await admin
      .from('fletes_payment_intents')
      .select('*')
      .eq('order_id', orderId)
      .eq('gateway', 'kushki')
      .eq('intent_type', 'preauth')
      .eq('status', 'AUTHORIZED')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (preauthIntent?.kushki_ticket_number && process.env.KUSHKI_PRIVATE_MERCHANT_ID) {
      const isProd = process.env.NODE_ENV === 'production';
      const captureUrl = isProd
        ? 'https://api.kushkipagos.com/card/v1/capture'
        : 'https://api-uat.kushkipagos.com/card/v1/capture';

      const capRes = await fetch(captureUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Private-Merchant-Id': process.env.KUSHKI_PRIVATE_MERCHANT_ID,
        },
        body: JSON.stringify({
          ticketNumber: preauthIntent.kushki_ticket_number,
          amount: {
            currency: 'USD',
            subtotalIva: 0,
            subtotalIva0: Number(preauthIntent.amount_usd),
            iva: 0,
            ice: 0,
          },
          fullResponse: true,
        }),
      });

      const capJson = await capRes.json().catch(() => null);
      if (capRes.ok && capJson?.ticketNumber) {
        kushkiCaptureRef = capJson.ticketNumber;
        await admin
          .from('fletes_payment_intents')
          .update({
            status: 'CAPTURED',
            raw_response: capJson,
            updated_at: new Date().toISOString(),
          })
          .eq('id', preauthIntent.id);
      }
    }

    // 6. Ejecutar RPC atómica process_flete_settlement si corresponde
    let settlementResult = null;
    if (triggerSettlement && order.driver_id) {
      const { data: rpcData, error: rpcErr } = await admin.rpc('process_flete_settlement', {
        p_order_id: orderId,
        p_payment_method: order.payment_method || 'kushki',
        p_gateway_ref: kushkiCaptureRef || order.gateway_ref || `EPOD-${serverSha256.slice(0, 10)}`,
      });
      if (!rpcErr) {
        settlementResult = rpcData;
      }
    }

    return NextResponse.json({
      success: true,
      epod: epodRecord,
      photoSha256: serverSha256,
      kushkiCaptureRef,
      settlement: settlementResult,
      sriInvoiceReady: true,
      sriEndpoint: '/api/facturacion/emitir',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno verificando e-POD';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
