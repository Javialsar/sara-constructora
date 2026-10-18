import { NextRequest, NextResponse } from 'next/server';
import { VectorKnowledgeService } from '@/lib/services/vectorKnowledgeService';
import { PredictivePurchaseService } from '@/lib/services/predictivePurchaseService';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de Seguridad y Sesión Profesional
    const auth = await authenticateProfessionalRequest(req);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'No autorizado' },
        { status: auth.status || 401 }
      );
    }
    const body = await req.json();
    const { itemKey, nuevoPrecio, origen } = body;

    if (!itemKey || !nuevoPrecio) {
      return NextResponse.json(
        { success: false, error: 'Parámetros itemKey y nuevoPrecio requeridos' },
        { status: 400 }
      );
    }

    const resultado = await VectorKnowledgeService.registerPriceMutationFromSri(
      itemKey,
      Number(nuevoPrecio),
      origen || {
        numeroComprobante: '001-001-999888777',
        rucEmisor: '1792048592001',
        razonSocial: 'PROVEEDOR INDUSTRIAL S.A.',
      }
    );

    return NextResponse.json({ success: true, resultado }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const conocimientos = VectorKnowledgeService.getAllKnowledge();
    return NextResponse.json({ success: true, conocimientos }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
