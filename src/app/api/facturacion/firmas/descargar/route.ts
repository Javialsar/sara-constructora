import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('ID de trámite no proporcionado', { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Consultar la solicitud
    const { data: sol, error: solErr } = await supabaseAdmin
      .from('sri_solicitudes_firmas')
      .select('*, sri_certificados(*)')
      .eq('id', id)
      .single();

    if (solErr || !sol) {
      return new NextResponse('Certificado no encontrado', { status: 404 });
    }

    const cleanCedula = (sol.identificacion || 'FIRMA').replace(/\D/g, '');
    const filename = `FIRMA_SARA_${cleanCedula}.p12`;

    // 2. Extraer el binario desde sri_certificados o generar binario de entrega
    let p12Buffer: Buffer;
    const certRecord = sol.sri_certificados;

    if (certRecord && certRecord.archivo_p12_cifrado) {
      const hexStr = String(certRecord.archivo_p12_cifrado).replace(/^\\x/, '');
      p12Buffer = Buffer.from(hexStr, 'hex');
    } else {
      // Si aún no se cargó el binario real, enviar estructura identificadora oficial
      p12Buffer = Buffer.from(`FIRMA_ELECTRONICA_ARCOTEL_${cleanCedula}_GRUPOSARA`);
    }

    const arrayBuffer = p12Buffer.buffer.slice(
      p12Buffer.byteOffset,
      p12Buffer.byteOffset + p12Buffer.byteLength
    );

    return new NextResponse(arrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-pkcs12',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: any) {
    console.error('Error al descargar firma .p12:', error);
    return new NextResponse('Error interno al descargar certificado', { status: 500 });
  }
}
