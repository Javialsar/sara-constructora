import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';

export const dynamic = 'force-dynamic';

const VOICE_BOOKING_SCHEMA = {
  type: 'OBJECT',
  properties: {
    vertical: {
      type: 'STRING',
      enum: ['viajes', 'mandaditos', 'fletes', 'renta'],
      description: 'Vertical logística detectada.',
    },
    origin_label: {
      type: 'STRING',
      description: 'Dirección, cantera, obra o punto de origen mencionado (vacío si no se mencionó).',
    },
    dest_label: {
      type: 'STRING',
      description: 'Dirección, obra o punto de destino mencionado (vacío si no se mencionó).',
    },
    recommended_vehicle_type: {
      type: 'STRING',
      enum: ['auto', 'moto', 'camioneta', 'camion_3_5t', 'volqueta', 'plataforma'],
      description: 'Tipo de vehículo solicitado o inferido.',
    },
    stevedores_count: {
      type: 'INTEGER',
      description: 'Número de estibadores solicitados (0 a 4).',
    },
    rental_hours: {
      type: 'INTEGER',
      description: 'Horas de renta si la vertical es renta (0 si no aplica).',
    },
    cargo_notes: {
      type: 'STRING',
      description: 'Resumen de materiales, bultos o instrucciones especiales.',
    },
  },
  required: [
    'vertical',
    'origin_label',
    'dest_label',
    'recommended_vehicle_type',
    'stevedores_count',
    'rental_hours',
    'cargo_notes',
  ],
};

export async function POST(req: NextRequest) {
  try {
    await requireServerAuth(req);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY no está configurada en el servidor para Solicitud por Voz IA.',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    const transcript = typeof body?.transcript === 'string' ? body.transcript.trim() : '';
    if (transcript.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Se requiere una transcripción de voz válida.' },
        { status: 400 }
      );
    }

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const prompt = [
      'Eres el despachador de voz Zero-UI de SARA FLETES en Ecuador.',
      'Extrae los parámetros exactos de la solicitud hablada del cliente y devuelve SOLO JSON válido según el esquema.',
      'Verticales: viajes (transporte de personas), mandaditos (encomiendas/paquetes rápidos), fletes (carga, materiales de construcción, mudanza, volqueta, camión), renta (alquiler de vehículo por horas o días).',
      `Transcripción del cliente: "${transcript}"`,
    ].join('\n');

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: VOICE_BOOKING_SCHEMA,
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.error?.message || 'Error procesando nota de voz con Gemini.' },
        { status: 502 }
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'Respuesta vacía del modelo Gemini.' },
        { status: 502 }
      );
    }

    const booking = JSON.parse(rawText);
    booking.stevedores_count = Math.max(0, Math.min(4, Math.round(Number(booking.stevedores_count) || 0)));

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno en Voice Booking IA';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
