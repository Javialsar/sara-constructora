import { NextRequest, NextResponse } from 'next/server';
import { SaraDossierBancarioService } from '@/lib/services/saraDossierBancarioService';

export async function GET(req: NextRequest) {
  try {
    const dossieres = SaraDossierBancarioService.getDossieres();
    return NextResponse.json({
      ok: true,
      data: dossieres,
      total: dossieres.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al consultar dossieres bancarios' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proyectoNombre, constructora, ruc, presupuestoUSD } = body;

    if (!proyectoNombre || !constructora || !ruc || !presupuestoUSD) {
      return NextResponse.json(
        { ok: false, error: 'Campos obligatorios faltantes: proyectoNombre, constructora, ruc, presupuestoUSD' },
        { status: 400 }
      );
    }

    const nuevoDossier = SaraDossierBancarioService.emitirCertificado(
      proyectoNombre,
      constructora,
      ruc,
      Number(presupuestoUSD)
    );

    return NextResponse.json({
      ok: true,
      message: 'Dossier Bancario y Certificación UAFE emitido con éxito.',
      data: nuevoDossier
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al emitir certificación fiduciaria' },
      { status: 500 }
    );
  }
}
