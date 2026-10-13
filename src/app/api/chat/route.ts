import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Base de conocimiento exhaustiva de Grupo SARA y todas sus divisiones
const KNOWLEDGE_BASE = {
  empresa: {
    nombre: "Grupo SARA",
    slogan: "Ingeniería y Arquitectura a la Vanguardia · Tecnología Integral",
    holding: "Holding multisectorial líder en Ecuador con más de 15 años de trayectoria.",
    sede_principal: "Cuenca, Azuay, Ecuador.",
    cobertura: "Nacional en las 24 provincias de Ecuador.",
    gerente_general: "Javier Sarango Gona",
    contacto_whatsapp: "+593 98 180 4023",
    email_contacto: "contacto@saraconstructora.com",
    email_gerencia: "gerencia@saraconstructora.com",
    horario: "Lunes a Viernes de 08:00 a 18:00 | Emergencias y soporte 24/7",
    bancos_oficiales: "Banco Pichincha (Cta. Corriente) y Banco de Guayaquil. Cobros habilitados vía QR DeUna y pasarela segura."
  },
  divisiones: [
    {
      nombre: "SARA-CONSTRUCTORA",
      tagline: "Obras Civiles, Arquitectura y Dirección Técnica",
      descripcion: "Planificación arquitectónica, cálculo y diseño estructural sismorresistente bajo norma NEC (Norma Ecuatoriana de la Construcción), fiscalización y dirección técnica colegiada de obras residenciales, viales y comerciales llave en mano.",
      servicios: [
        "Diseño arquitectónico y modelado BIM 3D",
        "Cálculo estructural sismorresistente avalado por ingenieros colegiados",
        "Construcción de viviendas unifamiliares, edificios y complejos comerciales",
        "Infraestructura vial, movimientos de tierras y alcantarillado",
        "Fiscalización independiente y dirección técnica de obra"
      ],
      ventajas: "Contratos con respaldo notarial, cumplimiento estricto de cronogramas y pruebas de laboratorio en hormigón y acero.",
      keywords: ["constructora", "construccion", "obra", "casa", "edificio", "arquitecto", "ingeniero", "plano", "diseno", "hormigon", "nec", "civil", "llave en mano", "estructural"]
    },
    {
      nombre: "SARA-INMOBILIARIA",
      tagline: "Bienes Raíces, Casas Campestres, Departamentos y Terrenos",
      descripcion: "Catálogo selecto de bienes raíces en Ecuador: lotes urbanizados, terrenos de alta plusvalía, casas de campo y departamentos ejecutivos con debida diligencia legal y respaldo notarial.",
      servicios: [
        "Venta de terrenos, lotes urbanizados y quintas",
        "Comercialización de departamentos de lujo y residencias",
        "Tasación y avalúo técnico pericial de inmuebles",
        "Asesoría para crédito hipotecario BIESS y banca privada",
        "Verificación legal de escrituras, gravámenes y catastros municipales"
      ],
      ventajas: "Cero intermediarios riesgosos; cada propiedad cuenta con estudio técnico de títulos y plusvalía garantizada.",
      keywords: ["inmobiliaria", "terreno", "propiedad", "lote", "departamento", "comprar casa", "vender", "bienes raices", "plusvalia", "biess", "escritura", "avaluo"]
    },
    {
      nombre: "SARA-ALOJAMIENTO (Stays)",
      tagline: "Suites & Villas Boutique Tipo Airbnb",
      descripcion: "Alojamientos temporales y ejecutivos de lujo ubicados en destinos estratégicos de Ecuador: Cuenca (Paucarbamba, Tomebamba, Centro Histórico), Quito, Galápagos y Baños.",
      servicios: [
        "Suites corporativas con cerraduras inteligentes de acceso autónomo 24/7",
        "Villas campestres y vacacionales para descanso familiar",
        "Conexión a internet por fibra óptica de alta velocidad y áreas de coworking",
        "Acabados interiores exclusivos diseñados por el equipo arquitectónico de Grupo SARA",
        "Servicio de limpieza profesional y atención personalizada"
      ],
      ventajas: "Estadía sin fricciones: reserva en línea, check-in digital instantáneo y factura autorizada por SRI.",
      keywords: ["alojamiento", "stays", "airbnb", "hotel", "hospedaje", "suite", "habitacion", "vacaciones", "cuenca", "departamento amoblado", "reserva"]
    },
    {
      nombre: "SARA-APU",
      tagline: "Software en la Nube de Análisis de Precios Unitarios y Presupuestos",
      descripcion: "Plataforma SaaS para análisis de precios unitarios (APU), cálculo de presupuestos de obra pública y privada, y gemelo digital de proyectos.",
      servicios: [
        "Base de datos de más de 9,800 rubros base actualizados con precios de mercado en Ecuador",
        "Desglose de Mano de Obra (salarios sectoriales), Materiales, Equipos y Transporte",
        "Cálculo automático de porcentajes de indirectos, utilidades e imprevistos",
        "Generación instantánea de cronogramas valorados y fórmulas polinómicas",
        "Exportación profesional a PDF y Excel para licitaciones públicas (SERCOP) y proyectos privados"
      ],
      planes: "Plan Constructor Pro por solo $19.99/mes con acceso completo.",
      ventajas: "Ahorra más del 80% del tiempo en cálculo de ofertas, compatible con los formatos oficiales de contratación pública y privada.",
      keywords: ["apu", "software", "presupuesto", "precios unitarios", "rubros", "costos", "analisis", "sercop", "licitacion", "cronograma", "rendimiento", "insumos"]
    },
    {
      nombre: "SARA-MARKETPLACE",
      tagline: "Suministro Directo de Materiales de Construcción",
      descripcion: "Portal de compras mayoristas de materiales e insumos de construcción directo de fábrica, eliminando sobreprecios de intermediarios.",
      servicios: [
        "Acero corrugado y perfiles estructurales de primeras marcas (Adelca, Novacero)",
        "Cemento fresco por sacos y al granel (Selvalegre, Chimborazo, Guapán)",
        "Áridos y agregados clasificados (arena lavada, ripio, lastre)",
        "Tubería sanitaria y de presión PVC",
        "Bloques estructurales, ladrillos y porcelanatos de primera"
      ],
      ventajas: "Cotización inmediata, descuentos por volumen y despacho garantizado a pie de obra en cualquier provincia.",
      keywords: ["marketplace", "compras", "materiales", "acero", "cemento", "arena", "ripio", "bloques", "hierro", "proveedor", "suministros", "ferreteria"]
    },
    {
      nombre: "SARA-FLETES",
      tagline: "Logística y Transporte Pesado con Monitoreo Satelital GPS 24/7",
      descripcion: "Operador logístico especializado en transporte de carga pesada, materiales áridos, maquinaria y estructuras para proyectos de construcción.",
      servicios: [
        "Flota de volquetas (8m³ a 14m³) para movimiento de tierras y agregados",
        "Camiones plataforma para traslado de varillas de acero, tuberías y vigas",
        "Mulas y cabezales para carga extrapesada interprovincial",
        "Winchas y camas bajas para transporte de maquinaria de obra pesada",
        "Rastreo GPS satelital en tiempo real con confirmación digital de entrega"
      ],
      ventajas: "Despacho inmediato, choferes profesionales certificados y seguros de carga activos.",
      keywords: ["fletes", "transporte", "volqueta", "camion", "plataforma", "logistica", "gps", "flete", "flete pesado", "carga", "maquinaria", "traslado"]
    },
    {
      nombre: "SARA-TALENTO",
      tagline: "Red de Profesionales y Técnicos Colegiados",
      descripcion: "Plataforma de selección y asignación de profesionales de la construcción verificados y listos para integrarse a proyectos.",
      servicios: [
        "Ingenieros civiles estructurales, hidrosanitarios y viales",
        "Arquitectos proyectistas y diseñadores de interiores",
        "Topógrafos con estación total y levantamientos con dron fotogramétrico RTK",
        "Maestros mayores de obra con récord comprobado",
        "Cuadrillas de fierreros, albañiles, carpinteros y electricistas certificados"
      ],
      ventajas: "Profesionales colegiados, evaluados con pruebas de competencia técnica y garantía de rendimiento.",
      keywords: ["talento", "ingeniero", "arquitecto", "topografo", "maestro de obra", "cuadrilla", "contratar", "personal", "profesional", "mano de obra"]
    },
    {
      nombre: "SARA-PAGOS",
      tagline: "Pasarela Blindada de Finanzas y Pagos de Obra",
      descripcion: "Sistema de custodia y liquidación financiera que protege el dinero de propietarios y contratistas mediante pagos condicionados a hitos verificados.",
      servicios: [
        "Custodia segura (Escrow) de anticipos de obra",
        "Liberación de fondos contra planillas de avance aprobadas por fiscalización",
        "Cobro ágil con QR empresarial DeUna (Banco Pichincha)",
        "Transferencias bancarias blindadas con validación automática de comprobantes",
        "Pago con tarjetas de crédito y débito Visa / Mastercard con opción de diferido"
      ],
      ventajas: "Cero riesgo de estafas o abandono de obra: el dinero del cliente no se entrega al constructor hasta que la etapa esté concluida con éxito.",
      keywords: ["pagos", "pasarela", "tarjeta", "deuna", "pichincha", "banco", "transferencia", "escrow", "custodia", "anticipo", "garantia", "dinero", "pagar"]
    }
  ],
  proyectos_emblematicos: [
    { nombre: "Torre Kary", ubicacion: "Vilcabamba, Loja", tipo: "Residencial de Alta Gama", estado: "En Construcción" },
    { nombre: "DUNA-DALTA", ubicacion: "Cuenca / Sector Paucarbamba", tipo: "Complejo Mixto Arquitectónico", estado: "En Fase de Diseño Ejecutivo" },
    { nombre: "Ciclope Industrial", ubicacion: "Arenillas, El Oro", tipo: "Parque Logístico y Galpones", estado: "En Construcción Estructural" }
  ]
};

// Generador de respuesta inteligente en caso de que no haya clave de OpenAI
function generarRespuestaInteligente(mensajeUsuario: string, userProjectsContext: string = ""): string {
  const query = mensajeUsuario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Saludos e Identidad
  if (query.match(/\b(hola|buenos dias|buenas tardes|buenas noches|saludos|que tal|quien eres|presentate)\b/)) {
    return `¡Hola! Soy **SARA-IA**, la Asistente de Inteligencia Artificial Oficial de **Grupo SARA** 🏢✨.

Formo parte del ecosistema corporativo que integra:
• 🏗️ **SARA-CONSTRUCTORA**: Obras civiles, diseño arquitectónico y cálculo estructural.
• 🏡 **SARA-INMOBILIARIA**: Venta de terrenos, casas campestres y departamentos.
• 🧳 **SARA-ALOJAMIENTO (Stays)**: Suites y villas boutique tipo Airbnb con check-in 24/7.
• 📊 **SARA-APU**: Software de análisis de precios unitarios y presupuestos de obra.
• 🛒 **SARA-MARKETPLACE**: Compra directa de acero, cemento y materiales al por mayor.
• 🚛 **SARA-FLETES**: Transporte pesado con monitoreo satelital GPS 24/7.
• 👷 **SARA-TALENTO**: Red de ingenieros civiles, arquitectos colegiados y técnicos.
• 💳 **SARA-PAGOS**: Pasarela blindada con custodia y pagos por avance de obra.

¿En qué división o proyecto te puedo asesorar hoy? También puedes contactar a nuestro Gerente General por WhatsApp al **+593 98 180 4023**.`;
  }

  // 2. Consulta de Proyectos personales
  if (query.match(/\b(mi proyecto|mis proyectos|como va mi obra|avance de mi|estado de mi)\b/)) {
    if (userProjectsContext) {
      return `📋 **Estado de tus Proyectos en Grupo SARA**:\n\n${userProjectsContext}\nSi necesitas detalles técnicos o coordinar una visita a la obra, contáctanos directamente al **+593 98 180 4023**.`;
    } else {
      return `Para consultar el estado y porcentaje de avance de tus proyectos específicos, por favor inicia sesión con tu cuenta de cliente en el sistema. Si aún no eres cliente registrado, indícame qué tipo de obra deseas cotizar (residencial, vial, estructural) y con gusto te asistiré.`;
    }
  }

  // 3. Proyectos emblemáticos de la empresa
  if (query.match(/\b(proyectos|obras de la empresa|obras anteriores|que han construido|portafolio|torre kary|duna dalta|ciclope)\b/)) {
    let resp = `🏗️ **Proyectos Emblemáticos de Grupo SARA**:\n\n`;
    KNOWLEDGE_BASE.proyectos_emblematicos.forEach(p => {
      resp += `• **${p.nombre}** (${p.ubicacion}): ${p.tipo} — *Estado: ${p.estado}*.\n`;
    });
    resp += `\nContamos con más de 120 obras civiles y arquitectónicas ejecutadas bajo estricta normativa NEC en Ecuador. ¿Deseas información sobre alguno en específico?`;
    return resp;
  }

  // 4. Búsqueda directa por divisiones
  for (const div of KNOWLEDGE_BASE.divisiones) {
    const match = div.keywords.some(k => query.includes(k));
    if (match) {
      let resp = `🏢 **${div.nombre}** — *${div.tagline}*\n\n${div.descripcion}\n\n`;
      resp += `**Servicios Principales:**\n`;
      div.servicios.forEach(s => {
        resp += `• ${s}\n`;
      });
      if (div.planes) {
        resp += `\n**Tarifa / Planes:** ${div.planes}\n`;
      }
      if (div.ventajas) {
        resp += `\n**Ventaja Garantizada:** ${div.ventajas}\n\n`;
      }
      resp += `📲 ¿Deseas contratar o cotizar? Comunícate directamente al WhatsApp oficial **+593 98 180 4023** o al correo **contacto@saraconstructora.com**.`;
      return resp;
    }
  }

  // 5. Contacto, Dirección y Teléfonos
  if (query.match(/\b(contacto|telefono|whatsapp|direccion|oficina|ubicacion|donde estan|donde queda|correo|email|gerente|javier)\b/)) {
    return `📍 **Canales Oficiales de Grupo SARA**:

• **Gerente General**: ${KNOWLEDGE_BASE.empresa.gerente_general}
• **WhatsApp / Teléfono Directo**: ${KNOWLEDGE_BASE.empresa.contacto_whatsapp}
• **Correo Electrónico**: ${KNOWLEDGE_BASE.empresa.email_contacto}
• **Sede Matriz**: ${KNOWLEDGE_BASE.empresa.sede_principal}
• **Cobertura**: Cobertura técnica y operativa en las 24 provincias de Ecuador.
• **Horario**: ${KNOWLEDGE_BASE.empresa.horario}

Puedes escribirnos en cualquier momento al WhatsApp para agendar una reunión presencial o virtual.`;
  }

  // 6. Precios, Cotizaciones y Pagos
  if (query.match(/\b(precio|costo|cuanto cuesta|cotizar|cotizacion|tarifa|banco|cuenta bancaria|pagar|pago)\b/)) {
    return `💼 **Cotizaciones y Métodos de Pago en Grupo SARA**:

1. **Cotizaciones de Obra (SARA-CONSTRUCTORA)**: Elaboramos presupuestos detallados por rubros previa revisión de planos arquitectónicos o visita técnica al terreno.
2. **Software SARA-APU**: Suscripción Plan Constructor Pro por **$19.99/mes** con acceso a más de 9,800 rubros actualizados.
3. **Modalidad de Pago Segura (SARA-PAGOS)**:
   • Cuentas directas en **Banco Pichincha** y **Banco de Guayaquil**.
   • Pago rápido con código QR **DeUna**.
   • Tarjetas de crédito/débito en nuestra pasarela web blindada.
   • **Fondo en Custodia (Escrow)**: El dinero del anticipo solo se libera contra hitos de obra verificados con informe técnico.

¿Deseas que coordinemos una cotización formal para tu proyecto? Escríbenos al **+593 98 180 4023**.`;
  }

  // 7. Respuesta Global por defecto con orientación completa
  return `Con gusto te asesoro. En **Grupo SARA** cubrimos todo el ciclo de la construcción e inversión inmobiliaria:

1. **SARA-CONSTRUCTORA**: Obras civiles, planos y dirección técnica colegiada (norma NEC).
2. **SARA-INMOBILIARIA**: Venta de lotes, casas campestres y departamentos con estudio legal.
3. **SARA-ALOJAMIENTO (Stays)**: Suites ejecutivas y turísticas tipo Airbnb en Cuenca y Ecuador.
4. **SARA-APU**: Software de presupuestos y precios unitarios ($19.99/mes).
5. **SARA-MARKETPLACE**: Cemento, acero y áridos al por mayor directo de fábrica.
6. **SARA-FLETES**: Volquetas y transporte pesado con monitoreo satelital 24/7.
7. **SARA-TALENTO**: Contratación de ingenieros, arquitectos y cuadrillas de albañilería.
8. **SARA-PAGOS**: Fondos en custodia y pasarela de pago blindada.

Para una atención inmediata, también puedes llamar o chatear al WhatsApp corporativo **+593 98 180 4023** con Javier Sarango Gona (Gerente General).`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    let userProjectsContext = "";

    try {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        const { data: proyectos } = await supabase
          .from('proyectos')
          .select('nombre, avance_porcentaje, ubicacion, estado')
          .eq('cliente_id', userId);
          
        if (proyectos && proyectos.length > 0) {
          userProjectsContext = proyectos.map((p: any) => 
            `- Proyecto "${p.nombre}" en ${p.ubicacion || 'Ecuador'} con avance del ${p.avance_porcentaje || 0}% (Estado: ${p.estado || 'En curso'})`
          ).join('\n');
        }
      }
    } catch {
      // Visitante anónimo sin sesión activa
    }

    const lastMessage = messages && messages.length > 0 
      ? messages[messages.length - 1].content 
      : "";

    // 1. Si existe clave de OpenAI configurada en el entorno, usar GPT para responder de forma natural
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.startsWith('sk-')) {
      try {
        const systemPrompt = `Eres SARA-IA, la Asistente de Inteligencia Artificial Oficial de "Grupo SARA" (Holding de Ingeniería, Construcción y Tecnología en Ecuador).
Hablas con un tono ejecutivo, cordial, técnico y altamente profesional en español ecuatoriano neutro.
Gerente General: Javier Sarango Gona. Teléfono / WhatsApp: +593 98 180 4023. Correo: contacto@saraconstructora.com. Sede: Cuenca, Azuay, con operaciones en todo Ecuador.

Conocimiento Oficial del Ecosistema de Grupo SARA:
1. SARA-CONSTRUCTORA: Obras civiles, diseño arquitectónico, cálculo estructural sismorresistente bajo norma NEC, fiscalización y llave en mano.
2. SARA-INMOBILIARIA: Terrenos, casas campestres, departamentos con título notarial limpio y crédito BIESS/banca privada.
3. SARA-ALOJAMIENTO (Stays): Suites y villas boutique tipo Airbnb en Cuenca, Quito, Galápagos y Baños con cerradura inteligente 24/7.
4. SARA-APU: Software cloud de análisis de precios unitarios con 9,800+ rubros ecuatorianos, SERCOP y reportes por $19.99/mes.
5. SARA-MARKETPLACE: Venta al por mayor sin intermediarios de acero Adelca/Novacero, cemento Guapán/Selvalegre y áridos.
6. SARA-FLETES: Volquetas y plataformas pesadas con monitoreo satelital GPS 24/7 nacional.
7. SARA-TALENTO: Ingenieros civiles, arquitectos colegiados, topógrafos con drones y maestros de obra calificados.
8. SARA-PAGOS: Escrow blindado (fondos retenidos hasta verificación técnica de avance), QR DeUna y cuentas directas Banco Pichincha / Guayaquil.

${userProjectsContext ? `Proyectos del usuario autenticado:\n${userProjectsContext}` : 'El usuario es un visitante o cliente general.'}

Responde de forma clara, estructurada con viñetas cuando sea útil y siempre orienta al usuario a resolver su duda o comunicarse al WhatsApp corporativo.`;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-6)
            ],
            temperature: 0.5,
            max_tokens: 600
          })
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const reply = aiJson?.choices?.[0]?.message?.content;
          if (reply) {
            return new Response(JSON.stringify({ text: reply }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      } catch (err) {
        console.warn("Fallo llamada a OpenAI, recurriendo al motor semántico interno de Grupo SARA:", err);
      }
    }

    // 2. Si no hay OpenAI key o la llamada falló, usar el motor semántico interno con toda la información
    const reply = generarRespuestaInteligente(lastMessage, userProjectsContext);

    return new Response(JSON.stringify({ text: reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error en endpoint /api/chat:", error);
    return new Response(JSON.stringify({ 
      text: "Hola, soy SARA-IA. Nuestro holding Grupo SARA abarca Construcción, Inmobiliaria, Stays, Software APU, Marketplace, Fletes satelitales, Talento técnico y Pagos blindados. Puedes contactar directamente a gerencia al WhatsApp +593 98 180 4023." 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
