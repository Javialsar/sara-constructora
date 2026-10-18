import { NextRequest, NextResponse } from 'next/server';
import { ComprasController } from '@/lib/controllers/saraAdvancedControllers';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any;

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      const xmlText = await req.text();
      body = { xmlContent: xmlText };
    } else {
      // Intentar multipart form data
      const formData = await req.formData();
      const xmlFile = formData.get('file') as File | null;
      const xmlText = xmlFile ? await xmlFile.text() : (formData.get('xmlContent') as string);
      const ordenCompraId = formData.get('ordenCompraId') as string | undefined;
      body = { xmlContent: xmlText, ordenCompraId };
    }

    const result = await ComprasController.parseXml(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[/api/v1/compras/parse-xml Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error procesando el archivo XML del SRI',
      },
      { status: 400 }
    );
  }
}
