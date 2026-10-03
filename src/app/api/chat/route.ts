import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Evitar cacheo
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  
  // 1. Intentar identificar al usuario para darle contexto personalizado
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  let systemContext = `Eres SARA, la Asistente de Inteligencia Artificial Oficial de "Grupo SARA" (Constructora, APU SaaS, Inmobiliaria y Stays).
Tu objetivo es ser ultra-servicial, técnica cuando se requiera, y siempre amable. Hablas en español neutro profesional.`;

  if (userId) {
    // Si está logueado, le damos datos en tiempo real de sus proyectos!
    const { data: proyectos } = await supabase.from('proyectos').select('nombre, avance_porcentaje, ubicacion').eq('cliente_id', userId);
    if (proyectos && proyectos.length > 0) {
      systemContext += `\n\nEl usuario actual está autenticado y tiene los siguientes proyectos en curso:\n`;
      proyectos.forEach((p: any) => {
        systemContext += `- Proyecto "${p.nombre}" en ${p.ubicacion} con un avance del ${p.avance_porcentaje}%.\n`;
      });
      systemContext += `\nUsa esta información para responder si pregunta por sus obras.`;
    }
  } else {
    systemContext += `\n\nEl usuario actual es un visitante público (no autenticado). Invítalo a usar el cotizador web o a dejar sus datos de contacto.`;
  }

  // 2. Si no hay API KEY, devolver un stream simulado (para no romper la app en demostración)
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    // Simulated Stream
    const encoder = new TextEncoder();
    const simulatedResponse = `Hola. Soy SARA-IA. He detectado tu contexto (Logueado: ${userId ? 'Sí' : 'No'}), pero mi clave de OpenAI (OPENAI_API_KEY) aún no ha sido configurada en las variables de entorno de este servidor. \n\nPor favor, pide al administrador que configure mi cerebro agregando la API Key en Vercel para empezar a procesar tus proyectos.`;
    
    const stream = new ReadableStream({
      async start(controller) {
        const words = simulatedResponse.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(`0:"${word} "\n`));
          await new Promise(r => setTimeout(r, 50));
        }
        controller.close();
      }
    });
    
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  // 3. Flujo Real con OpenAI
  try {
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemContext,
      messages,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error de SARA-IA:', error);
    return new Response(JSON.stringify({ error: 'Error comunicando con OpenAI' }), { status: 500 });
  }
}
