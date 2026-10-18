import { NextRequest, NextResponse } from 'next/server';
import { BodegaController } from '@/lib/controllers/saraAdvancedControllers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await BodegaController.transferir(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[/api/v1/bodega/distribuir Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error procesando la transferencia entre bodegas',
      },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bodegaId = searchParams.get('bodegaId');
    if (!bodegaId) {
      return NextResponse.json(
        { success: false, error: 'Parámetro bodegaId requerido' },
        { status: 400 }
      );
    }
    const result = await BodegaController.consultarStock(bodegaId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
