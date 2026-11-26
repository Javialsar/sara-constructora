import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/serverAuthGuard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const TRANSLATE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    translated_text: {
      type: 'STRING',
      description: 'Traducción natural, clara y precisa adaptada a contexto vial y logístico de Ecuador.',
    },
    detected_source_lang: {
      type: 'STRING',
      description: 'Código BCP-47 del idioma original detectado (ej. es-EC, en, fr, pt, de).',
    },
  },
  required: ['translated_text', 'detected_source_lang'],
};

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireServerAuth(req);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY no está configurada en el servidor para el Intérprete Simultáneo.',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const sourceLang = typeof body?.sourceLang === 'string' ? body.sourceLang.trim() : 'es-EC';
    const targetLang = typeof body?.targetLang === 'string' ? body.targetLang.trim() : 'en';
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
    const senderRole: 'customer' | 'driver' = body?.senderRole === 'driver' ? 'driver' : 'customer';

    if (!text || text.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'El mensaje debe tener entre 1 y 2000 caracteres.' },
        { status: 400 }
      );
    }

    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const prompt = [
      'Eres un intérprete simultáneo especializado en movilidad, logística, direcciones y modismos viales de Ecuador (redondel, panamericana, garita, volqueta, estibador, peaje, cuadra).',
      `Traduce el siguiente mensaje del idioma "${sourceLang}" al idioma "${targetLang}" conservando intención, cortesía y precisión operativa.`,
      `Mensaje: "${text}"`,
    ].join('\n');

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          responseMimeType: 'application/json',
          responseSchema: TRANSLATE_SCHEMA,
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.error?.message || 'Error en servicio de traducción Gemini.' },
        { status: 502 }
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return NextResponse.json({ success: false, error: 'Traducción vacía desde Gemini.' }, { status: 502 });
    }

    const parsed = JSON.parse(rawText) as { translated_text: string; detected_source_lang: string };
    let savedMessage = null;

    // Si hay orderId real, verificar pertenencia del usuario y persistir en fletes_chat_messages (dispara Realtime)
    if (orderId) {
      const admin = createAdminClient();
      const { data: orderRow } = await admin
        .from('fletes_orders')
        .select('id, customer_id, driver_id')
        .eq('id', orderId)
        .maybeSingle();

      if (!orderRow) {
        return NextResponse.json({ success: false, error: 'Orden no encontrada.' }, { status: 404 });
      }
      if (orderRow.customer_id !== user.id && orderRow.driver_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Acceso denegado: no perteneces a esta orden.' },
          { status: 403 }
        );
      }

      const { data: inserted, error: insertErr } = await admin
        .from('fletes_chat_messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          sender_role: senderRole,
          original_text: text,
          source_lang: parsed.detected_source_lang || sourceLang,
          translated_text: parsed.translated_text,
          target_lang: targetLang,
        })
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json(
          { success: false, error: `Error persistiendo mensaje traducido: ${insertErr.message}` },
          { status: 500 }
        );
      }
      savedMessage = inserted;
    }

    return NextResponse.json({
      success: true,
      translatedText: parsed.translated_text,
      sourceLang: parsed.detected_source_lang || sourceLang,
      targetLang,
      message: savedMessage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno en traductor simultáneo';
    const status = message.includes('No autenticado') ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
