import { NextRequest, NextResponse } from 'next/server';
import { SellerMarketplaceService } from '@/lib/services/sellerMarketplaceService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const apiKey = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Acceso no autorizado. Debe proporcionar su API Key en el header "Authorization: Bearer sk_live_..."' 
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.productos || !Array.isArray(body.productos) || body.productos.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El cuerpo de la petición debe contener un arreglo "productos" con al menos un ítem.' 
        },
        { status: 400 }
      );
    }

    const resultado = SellerMarketplaceService.syncProductsFromApi(apiKey, body.productos);

    return NextResponse.json({
      success: true,
      mensaje: `Sincronización exitosa de catálogo. ${resultado.procesados} productos procesados.`,
      procesados: resultado.procesados,
      errores: resultado.errores
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error en sincronización de catálogo API' },
      { status: 500 }
    );
  }
}
