import { NextRequest, NextResponse } from 'next/server';
import { CANVA_100_PALETTES, CANVA_CATEGORIAS } from '@/lib/theme/canva100Palettes';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase()?.trim() || '';
    const categoria = searchParams.get('categoria') || '';

    let filtradas = CANVA_100_PALETTES;

    if (categoria && categoria !== 'TODAS') {
      filtradas = filtradas.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }

    if (q) {
      filtradas = filtradas.filter(p => 
        p.nombre.toLowerCase().includes(q) ||
        p.nombreEs.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.hexArray.some(h => h.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      total: filtradas.length,
      categorias: CANVA_CATEGORIAS,
      paletas: filtradas
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
