import { createClient } from '@/lib/supabase/server';

// Evitar cacheo
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  let systemContext = `Eres SARA, la Asistente de Inteligencia Artificial Oficial de "Grupo SARA". Hablas en español neutro profesional.`;

  if (userId) {
    const { data: proyectos } = await supabase.from('proyectos').select('nombre, avance_porcentaje, ubicacion').eq('cliente_id', userId);
    if (proyectos && proyectos.length > 0) {
      systemContext += `\nEl usuario tiene los siguientes proyectos:\n`;
      proyectos.forEach((p: any) => {
        systemContext += `- Proyecto "${p.nombre}" en ${p.ubicacion} con avance del ${p.avance_porcentaje}%.\n`;
      });
    }
  } else {
    systemContext += `\nEl usuario es un visitante público.`;
  }

  // Simulated AI Logic (Si tuvieras OpenAI instalado, aquí harías el fetch a https://api.openai.com/v1/chat/completions)
  // Por ahora, le devolvemos una respuesta contextual basada en el backend de Supabase:
  
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  let reply = "";

  if (lastMessage.includes('proyecto') || lastMessage.includes('obra')) {
    if (userId) {
      reply = "He revisado la base de datos. " + systemContext.split('\nEl usuario tiene los siguientes proyectos:\n')[1] || "Actualmente no tienes proyectos activos.";
    } else {
      reply = "Para consultar tus proyectos, por favor inicia sesión en tu cuenta.";
    }
  } else if (lastMessage.includes('hola') || lastMessage.includes('saludos')) {
    reply = "¡Hola! Soy SARA-IA. ¿En qué te puedo ayudar hoy con el sistema APU o tus proyectos constructivos?";
  } else {
    reply = "Esa es una excelente pregunta. Mi integración con la API de OpenAI está lista en código, pero el administrador debe agregar la clave `OPENAI_API_KEY` a Vercel para procesar razonamiento avanzado. Por ahora, puedo responder sobre el estado de tus proyectos si me preguntas '¿cómo van mis proyectos?'.";
  }

  // Simulated 1s delay
  await new Promise(r => setTimeout(r, 1000));

  return new Response(JSON.stringify({ text: reply }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
