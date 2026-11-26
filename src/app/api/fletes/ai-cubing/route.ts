import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';

export const dynamic = 'force-dynamic';

export interface AiCubingResult {
  detected_materials: string[];
  estimated_volume_m3: number;
  estimated_weight_kg: number;
  recommended_vehicle_type: 'camioneta' | 'camion_3_5t' | 'volqueta' | 'plataforma';
  recommended_stevedores: number;
  safety_notes: string;
}

const CUBING_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    detected_materials: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Lista de materiales, bultos o mercancía identificados en la fotografía.',
    },
    estimated_volume_m3: {
      type: 'NUMBER',
      description: 'Volumen total estimado en metros cúbicos (número decimal positivo).',
    },
    estimated_weight_kg: {
      type: 'NUMBER',
      description: 'Peso total estimado en kilogramos.',
    },
    recommended_vehicle_type: {
      type: 'STRING',
      enum: ['camioneta', 'camion_3_5t', 'volqueta', 'plataforma'],
      description: 'Categoría exacta de vehículo recomendada según peso, volumen y tipo de carga.',
    },
    recommended_stevedores: {
      type: 'INTEGER',
      description: 'Cantidad recomendada de estibadores entre 0 y 4.',
    },
    safety_notes: {
      type: 'STRING',
      description: 'Advertencia operativa y de aseguramiento de carga (lona, eslingas, balanza MTOP, etc.).',
    },
  },
  required: [
    'detected_materials',
    'estimated_volume_m3',
    'estimated_weight_kg',
    'recommended_vehicle_type',
    'recommended_stevedores',
    'safety_notes',
  ],
};

export async function POST(req: NextRequest) {
  try {
    // 1. Validación estricta de sesión autenticada
    await requireServerAuth(req);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'GEMINI_API_KEY no está configurada en el servidor. Configura la credencial real para habilitar el Copiloto IA de Cubicaje.',
        },
        { status: 503 }
      );
    }

    let base64Image = '';
    let mimeType = 'image/jpeg';
    let userNotes = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image');
      userNotes = String(formData.get('notes') || '');
      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'Se requiere el archivo de imagen en el campo "image".' },
          { status: 400 }
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'La imagen supera el límite máximo de 10 MB.' },
          { status: 400 }
        );
      }
      mimeType = file.type || 'image/jpeg';
      const arrayBuf = await file.arrayBuffer();
      base64Image = Buffer.from(arrayBuf).toString('base64');
    } else {
      const body = await req.json().catch(() => null);
      if (!body?.imageBase64 || typeof body.imageBase64 !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Se requiere imageBase64 (o multipart/form-data con campo image).' },
          { status: 400 }
        );
      }
      const raw = body.imageBase64.trim();
      const dataUrlMatch = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        base64Image = dataUrlMatch[2];
      } else {
        mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg';
        base64Image = raw;
      }
      userNotes = typeof body.notes === 'string' ? body.notes : '';
    }

    const promptText = [
      'Eres un ingeniero logístico experto en cubicaje de carga y normativa MTOP de Ecuador para SARA FLETES.',
      'Analiza la fotografía adjunta de la carga a transportar y devuelve únicamente el JSON estructurado según el esquema.',
      'Reglas de clasificación de vehículo:',
      '- camioneta: hasta 1.000 kg o <= 2.5 m³ (bultos medianos, electrodomésticos, pocos sacos).',
      '- camion_3_5t: entre 1.001 kg y 3.500 kg o 2.6 a 12 m³ (mudanzas, pallets, varillas cortas, materiales secos).',
      '- volqueta: material pétreo a granel (ripio, arena, lastre, escombros, excavación).',
      '- plataforma: carga pesada/larga > 3.500 kg, maquinaria, varillas 12m, vigas metálicas o contenedores.',
      'recommended_stevedores debe estar entre 0 y 4.',
      userNotes ? `Contexto adicional del cliente: ${userNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: CUBING_RESPONSE_SCHEMA,
        },
      }),
    });

    const geminiJson = await geminiRes.json().catch(() => null);
    if (!geminiRes.ok) {
      const msg = geminiJson?.error?.message || 'Error invocando Gemini 2.5 Flash.';
      return NextResponse.json({ success: false, error: msg }, { status: 502 });
    }

    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'Gemini no devolvió una estimación estructurada válida.' },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText) as AiCubingResult;
    const clampedStevedores = Math.max(0, Math.min(4, Math.round(Number(parsed.recommended_stevedores) || 0)));

    const result: AiCubingResult = {
      detected_materials: Array.isArray(parsed.detected_materials) ? parsed.detected_materials.map(String) : [],
      estimated_volume_m3: Number(Math.max(0.1, Number(parsed.estimated_volume_m3) || 0.5).toFixed(2)),
      estimated_weight_kg: Math.round(Math.max(1, Number(parsed.estimated_weight_kg) || 50)),
      recommended_vehicle_type: parsed.recommended_vehicle_type,
      recommended_stevedores: clampedStevedores,
      safety_notes: String(parsed.safety_notes || 'Verificar sujeción de carga antes de iniciar marcha.'),
    };

    return NextResponse.json({ success: true, report: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno en Copiloto IA de Cubicaje';
    const status = message.includes('No autenticado') ? 401 : message.includes('Acceso denegado') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
