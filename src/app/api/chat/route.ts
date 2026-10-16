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

  // =========================================================================
  // GUÍAS DE PROCESOS TÉCNICOS PASO A PASO CON EJEMPLOS DE INGENIERÍA REAL
  // =========================================================================

  // A. PROCESO: SARA Take-Off (Medición de Planos 2D en PDF / Auto-Detección)
  if (query.match(/\b(take[- ]?off|medir planos?|cubicacion|cubicar planos?|auto[- ]?deteccion|sara[- ]?vision|medicion en pdf|escalar planos?)\b/)) {
    return `📐 **GUÍA TÉCNICA PASO A PASO: MEDICIÓN DE PLANOS CON SARA TAKE-OFF 2D**

**🎯 Objetivo:**
Digitalizar planos arquitectónicos y estructurales en PDF o imagen para cuantificar áreas, longitudes y volúmenes con precisión milimétrica y vincularlos directamente a los rubros del presupuesto.

---

### 📋 **Procedimiento Paso a Paso:**

1. **Cargar el Plano:**
   Ingresa a **SARA Take-Off** (\`/dashboard/takeoff\`) y arrastra tu plano arquitectónico o estructural en formato PDF o imagen de alta resolución.
2. **Calibrar la Escala (Imprescindible):**
   Haz clic en la herramienta **"Calibrar Escala"**, haz clic en dos extremos de una cota conocida del plano (ej: un muro de 4.00 m) e introduce el valor numérico exacto en metros. Esto fija la equivalencia de píxeles por metro con precisión submilimétrica.
3. **Medición Manual o Asistida por IA:**
   • **Manual:** Selecciona la herramienta *Polígono* para losas/pisos, *Línea* para mamposterías/bordillos, o *Puntos* para elementos puntuales (columnas, zapatas).
   • **Automática con SARA-Vision:** Pulsa **\`[ 🤖 Auto-Detectar con IA ]\`**. La red neuronal segmenta recintos, deduce áreas netas y descuenta automáticamente los vanos de puertas y ventanas según la normativa constructiva.
4. **Vincular y Vaciar al Presupuesto:**
   Selecciona la medición y haz clic en **\`[ 🔗 Asignar a Rubro APU ]\`**. La cantidad se transfiere en tiempo real a la Mesa de Presupuestos sin errores de tipeo.

---

### 📐 **Ejemplo Práctico de Obra Real:**

* **Caso de Estudio:** Villa Unifamiliar en Loja — Cuantificación de Contrapiso de Hormigón Simple $e = 10\\text{ cm}$.
* **1. Medición de Sala-Comedor:**
  Polígono trazado en el plano: $6.50\\text{ m} \\times 5.20\\text{ m} = \\mathbf{33.80\\text{ m}^2}$.
* **2. Cubicación Volumétrica:**
  $$\\text{Volumen} = 33.80\\text{ m}^2 \\times 0.10\\text{ m} = 3.38\\text{ m}^3\\text{ de hormigón } f'c = 210\\text{ kg/cm}^2$$
* **3. Desperdicio Técnico (5% según norma):**
  $$3.38\\text{ m}^3 \\times 1.05 = \\mathbf{3.55\\text{ m}^3\\text{ a pedir en mixer}}$$
* **4. Impacto en Presupuesto:**
  El rubro *"Contrapiso de hormigón simple e=10cm"* recibe automáticamente la cantidad de **$33.80\\text{ m}^2$**. Al precio unitario de $14.25/m², el costo directo queda liquidado en **$481.65 USD**.

👉 **Acceso directo:** Puedes abrir el módulo ahora mismo desde el menú lateral en **1. ESTUDIO & PRESUPUESTACIÓN PRIVADA > SARA Take-Off (Planos 2D)**.`;
  }

  // B. PROCESO: Estructurar Presupuesto de Obra & Generar Rubros con IA
  if (query.match(/\b(crear presupuesto|armar presupuesto|hacer presupuesto|generar rubros?|ai[- ]?rubros|mesa de presupuestos|como cotizar|factor aiu|desglose apu)\b/)) {
    return `⚡ **GUÍA TÉCNICA PASO A PASO: MESA DE PRESUPUESTOS REALES & GENERACIÓN CON IA**

**🎯 Objetivo:**
Estructurar la oferta económica y técnica de un proyecto por capítulos, calculando precios unitarios desglosados en 4 componentes (Materiales, Mano de Obra, Equipos y Transporte) aplicando la fórmula del Factor AIU.

---

### 📋 **Procedimiento Paso a Paso:**

1. **Vincular al Proyecto Activo:**
   Ingresa a **Mesa de Presupuestos Reales** (\`/dashboard/presupuestos_reales\`). El sistema detecta la obra seleccionada en el selector superior y carga automáticamente su cliente y régimen.
2. **Definir Capítulos Constructivos:**
   Crea la estructura lógica de la obra:
   • *1. Trabajos Preliminares y Replanteo*
   • *2. Movimiento de Tierras y Cimentación*
   • *3. Estructura y Hormigones*
   • *4. Mampostería y Enlucidos*
   • *5. Instalaciones Hidrosanitarias y Eléctricas*
   • *6. Acabados de Primera*
3. **Inserción de Rubros e Inteligencia Artificial:**
   Escribe la descripción de la actividad en la fila de inserción rápida. Si el rubro no existe en tu catálogo, presiona **\`[ ⚡ Generar con IA ]\`** (ej: *"Muro de hormigón ciclópeo H=2.50m con 40% piedra bola"*). En 2 segundos, el motor genera la dosificación exacta de insumos, cuadrilla CCEC y equipo.
4. **Calibrar Precios en el Drawer Lateral (Slide-Over):**
   Haz clic en cualquier rubro para abrir el panel lateral deslizante. Ajusta rendimientos horarios y costos unitarios de insumos.
5. **Configurar el Factor AIU Predeterminado de la Empresa:**
   El sistema aplica automáticamente los valores corporativos configurados en **/dashboard/parametros**:
   • *Gastos Generales / Admin:* **10%**
   • *Imprevistos de Obra:* **5%**
   • *Utilidad Empresarial Deseada:* **10%**
   • *Factor AIU Total:* **25%** ($10\% + 5\% + 10\%$).
   • *Herramienta Menor:* **5%** sobre el subtotal de mano de obra.

---

### 📐 **Ejemplo Práctico de Obra Real:**

* **Rubro Analizado:** Mampostería de ladrillo panel de arcilla 6 huecos ($e = 15\\text{ cm}$) con mortero $1:4$.
* **1. Materiales por $m^2$:**
  • 25 unidades de ladrillo panel $\\times \\$0.32$ = $\\$8.00$
  • Cemento Selvalegre / Guapán ($0.18\\text{ sacos} \\times \\$7.50$) = $\\$1.35$
  • Arena lavada clasificada ($0.025\\text{ m}^3 \\times \\$18.00$) = $\\$0.45$
  • *Subtotal Materiales:* $\\$9.80$
* **2. Mano de Obra (Rendimiento: 0.85 horas/$m^2$):**
  • Cuadrilla: 1 Albañil ($\\$4.15/\\text{h}$) + 1 Peón ($\\$3.60/\\text{h}$) = $\\$7.75/\\text{hora}$
  • Costo cuadrilla $\\times 0.85\\text{ h} = \\mathbf{\\$6.59}$
* **3. Equipos y Herramientas (5% de Herramienta Menor M.O. según Parámetros):**
  • Andamios, badilejo, nivel, carretilla = $0.05 \\times \\$6.59 = \\mathbf{\\$0.33}$
* **4. Costo Directo Total (CD):**
  $$CD = \\$9.80 + \\$6.59 + \\$0.33 = \\mathbf{\\$16.72 / m^2}$$
* **5. Factor AIU Empresarial (25% = 10% Admin + 5% Imprevistos + 10% Utilidad):**
  $$P.U. = \\$16.72 \\times (1 + 0.25) = \\$16.72 \\times 1.25 = \\mathbf{\\$20.90 / m^2}$$
* **Presupuesto para $120\\text{ m}^2$:** $120 \\times \\$20.90 = \\mathbf{\\$2,508.00 USD}$.

👉 **Acceso directo:** Inicia tu presupuesto en **1. ESTUDIO & PRESUPUESTACIÓN PRIVADA > Mesa de Presupuestos Reales**.`;
  }

  // C. PROCESO: Licitaciones Públicas SERCOP & Matriz VAE
  if (query.match(/\b(sercop|licitacion|matriz vae|vae|contratacion publica|menor cuantia|pliego|convalidacion|losncp|reajuste)\b/)) {
    return `🏛️ **GUÍA TÉCNICA PASO A PASO: POSTULACIÓN SERCOP & MATRIZ VAE**

**🎯 Objetivo:**
Identificar licitaciones de obra pública en el Radar Nacional, estructurar la oferta conforme a la LOSNCP y su Reglamento General vigente, y calcular la Matriz de Valor Agregado Ecuatoriano (VAE) para garantizar la no descalificación.

---

### 📋 **Procedimiento Paso a Paso:**

1. **Explorar el Radar Nacional SERCOP:**
   Dirígete a **Radar de Licitaciones SERCOP** (\`/dashboard/sercop/radar\`). Filtra por tu provincia de cobertura (ej: Azuay, Loja, Pichincha) y modalidad contractual (Menor Cuantía, Cotización o Licitación).
2. **Postular y Crear Proyecto Público:**
   Haz clic en **\`[ Postular / Crear Proyecto SERCOP ]\`** en el proceso de tu interés. El sistema crea un proyecto con régimen \`publico_sercop\` importando el Código del Proceso (ej: \`MCO-GADML-015-2026\`) y la Entidad Contratante.
3. **Auditoría con el Agente SARA-SERCOP:**
   Consulta al **Agente SARA-SERCOP** (\`/dashboard/sercop/agente\`) para validar:
   • Anticipo máximo permitido (hasta 50% según el Art. 71 LOSNCP).
   • Convalidación de errores de forma vs. fondo (Art. 23 RGLOSNCP).
   • Equipo mínimo requerido y acreditación de propiedad o compromiso de arrendamiento.
4. **Calcular la Matriz VAE Oficial:**
   Ve a **Matriz VAE & Desagregación** (\`/dashboard/sercop/vae\`). El sistema clasifica tus insumos en producción nacional vs. importada y calcula el porcentaje ponderado para verificar que supere el umbral mínimo del pliego.

---

### 📐 **Ejemplo Práctico de Obra Real:**

* **Proceso Evaluado:** \`MCO-GADMA-008-2026\` — "Construcción de Cancha de Uso Múltiple y Graderíos".
* **Presupuesto Referencial del Estado:** $\\$42,500.00 USD$.
* **Exigencia del Pliego:** Porcentaje mínimo de VAE = **40.00%**.
* **1. Desglose de Insumos en la Oferta:**
  • Cemento Nacional (Selvalegre/Chimborazo): $\\$6,200$ (Nacional 100%)
  • Acero de Refuerzo (Adelca/Novacero): $\\$8,400$ (Nacional 100%)
  • Áridos y Lastre de Cantera Local: $\\$3,100$ (Nacional 100%)
  • Mano de Obra Ecuatoriana (Cuadrillas locales): $\\$12,500$ (Nacional 100%)
  • Luminarias LED Industriales Especiales: $\\$4,800$ (Importado 0%)
* **2. Ecuación del VAE:**
  $$\\text{Costo Directo Total} = \\$35,000.00 USD$$
  $$\\text{Componente Nacional Total} = \\$6,200 + \\$8,400 + \\$3,100 + \\$12,500 = \\$30,200.00 USD$$
  $$\\mathbf{\\% VAE} = \\left( \\frac{\\$30,200.00}{\\$35,000.00} \\right) \\times 100 = \\mathbf{86.29\\%}$$
* **3. Dictamen:** **CUMPLE** (86.29% $\\ge$ 40.00%). La oferta queda habilitada sin riesgo de descalificación por origen de componentes.

👉 **Acceso directo:** Explora procesos activos en **2. CONTRATACIÓN PÚBLICA (SERCOP) > Radar de Licitaciones SERCOP**.`;
  }

  // D. PROCESO: Cronograma de Obra, Lookahead y Planificación de Cuadrillas
  if (query.match(/\b(cronograma|gantt|lookahead|ruta critica|cpm|planificacion de obra|recursos por dia|cuadrillas|explosion de insumos)\b/)) {
    return `📅 **GUÍA TÉCNICA PASO A PASO: CRONOGRAMA, RUTA CRÍTICA Y LOOKAHEAD SEMANAL**

**🎯 Objetivo:**
Secuenciar las actividades del presupuesto en el tiempo, determinar la Ruta Crítica (CPM) y generar el reporte Lookahead descargable para coordinar bodega, choferes y maestros de obra por día, semana o mes.

---

### 📋 **Procedimiento Paso a Paso:**

1. **Generar la Secuencia Temporal:**
   Dentro de tu presupuesto en la pestaña **Cronograma (Gantt)**, vincula las dependencias de inicio-fin entre tareas (ej: *Fundición de losa* depende de *Armado de hierro* y *Encofrado*).
2. **Calcular la Duración Automática:**
   La duración de cada rubro se calcula dividiendo la cantidad total entre el rendimiento de la cuadrilla asignada:
   $$\\text{Días Laborales} = \\frac{\\text{Cantidad Total}}{\\text{Rendimiento Diario de la Cuadrilla}}$$
3. **Identificar la Ruta Crítica (CPM):**
   Las barras marcadas en rojo son las que no tienen holgura. Un retraso de 1 día en estas actividades desplaza la fecha de entrega final y genera multas contractuales.
4. **Filtrar por Horizonte Lookahead (Día / Semana / Mes):**
   Selecciona el filtro temporal para inspeccionar con exactitud qué insumos deben estar despachados en bodega y cuántos operarios deben ingresar a la obra esa semana.
5. **Descargar Reporte Ejecutivo en PDF:**
   Pulsa **\`[ 📥 Descargar Reporte de Actividades ]\`** para imprimir la orden de trabajo con firmas del Residente de Obra, Bodeguero y Director de Proyecto.

---

### 📐 **Ejemplo Práctico de Obra Real:**

* **Actividad:** Fundición de Zapatas y Plintos de Hormigón Armado ($18.00\\text{ m}^3$).
* **Horizonte:** Semana 3 (Lunes a Viernes).
* **1. Requerimiento de Personal (Lookahead Mano de Obra):**
  • 1 Maestro Mayor de Obra
  • 2 Fierreros armadores
  • 4 Albañiles calificados
  • 6 Peones de soporte y acarreo
* **2. Requerimiento de Materiales en Bodega:**
  • 144 sacos de Cemento Portland Tipo IP
  • $12.50\\text{ m}^3$ de ripio triturado $3/4"$
  • $8.20\\text{ m}^3$ de arena lavada de río
  • $1,350\\text{ kg}$ de varilla corrugada $\\varnothing 12\\text{ mm}$ y $\\varnothing 10\\text{ mm}$
  • $50\\text{ kg}$ de alambre recocido $\#18$
* **3. Maquinaria Programada:**
  • 1 Concretera de 1 saco ($8\\text{ horas/día}$)
  • 1 Vibrador de hormigón a gasolina con manguera de $38\\text{ mm}$

👉 **Acceso directo:** Abre tu cronograma en **1. ESTUDIO & PRESUPUESTACIÓN > Mesa de Presupuestos Reales > Pestaña Cronograma**.`;
  }

  // E. PROCESO: SARA-BIM 3D (Cómputos Métricos desde Modelos IFC / Revit)
  if (query.match(/\b(bim|ifc|revit|computos 3d|modelo 3d|volumetria 3d|extraccion de cantidades)\b/)) {
    return `🏢 **GUÍA TÉCNICA PASO A PASO: SARA-BIM & CÓMPUTOS 3D**

**🎯 Objetivo:**
Cargar modelos digitales en formato IFC (Industry Foundation Classes) provenientes de Revit, Archicad o CYPE para auditar geometrías tridimensionales y extraer volúmenes y áreas sin errores de cálculo manual.

---

### 📋 **Procedimiento Paso a Paso:**

1. **Subir el Modelo IFC:**
   Ingresa a **SARA-BIM (Cómputos 3D)** (\`/dashboard/apus/bim\`) y arrastra tu archivo \`.ifc\` arquitectónico o estructural.
2. **Navegación e Inspección en Visor 3D:**
   Usa el visor interactivo (rotación 360°, zoom y cortes de sección) para aislar por niveles (Planta Baja, Piso 1, Cubierta) o por familias (\`IfcWall\`, \`IfcBeam\`, \`IfcColumn\`, \`IfcSlab\`).
3. **Mapeo Semántico de Familias a Rubros APU:**
   Vincula cada tipo de elemento IFC con un rubro del Banco Maestro (ej: elementos \`IfcColumn\` de $30 \\times 30\\text{ cm}$ vinculados al rubro *"Columnas de hormigón armado f'c=240 kg/cm²"*).
4. **Extracción y Transferencia Automática:**
   Presiona **\`[ Exportar a Presupuesto ]\`**. SARA-BIM suma las volumetrías volumétricas exactas ($m^3$) y encofrados ($m^2$) transfiriéndolos directamente a tu hoja de costos.

---

### 📐 **Ejemplo Práctico de Obra Real:**

* **Edificio Residencial 4 Plantas:**
* **Extracción de Columnas Nivel +0.00 a +3.00:**
  • 16 columnas rectangulares de $0.35\\text{ m} \\times 0.35\\text{ m} \\times 2.80\\text{ m}$.
  • Volumen geométrico por columna: $0.35 \\times 0.35 \\times 2.80 = 0.343\\text{ m}^3$.
  • Volumen total extraído: $16 \\times 0.343 = \\mathbf{5.488\\text{ m}^3}$.
* **Área de Encofrado Metálico o Madera:**
  • Perímetro por columna: $(0.35 + 0.35) \\times 2 = 1.40\\text{ m}$.
  • Área por columna: $1.40 \\times 2.80 = 3.92\\text{ m}^2$.
  • Área total de encofrado: $16 \\times 3.92 = \\mathbf{62.72\\text{ m}^2}$.
* **Ahorro de Tiempo:** Extracción instantánea en 3 segundos vs. 4 horas de cubicación manual sobre planos en papel.

👉 **Acceso directo:** Carga tu modelo en **1. ESTUDIO & PRESUPUESTACIÓN > SARA-BIM (Cómputos 3D)**.`;
  }

  // =========================================================================
  // CONSULTAS CORPORATIVAS Y DE NEGOCIO HABITUALES
  // =========================================================================

  // 1. Saludos e Identidad
  if (query.match(/\b(hola|buenos dias|buenas tardes|buenas noches|saludos|que tal|quien eres|presentate|mentor)\b/)) {
    return `¡Hola! Soy **SARA-Mentor**, tu Co-Piloto de Inducción Técnica y de Procesos de **Grupo SARA** 👷‍♂️📐.

Mi misión es guiarte **paso a paso** en cualquier proceso de ingeniería, presupuestación o fiscalización con ejemplos reales y cálculos numéricos:

• 📐 **Take-Off 2D**: ¿Cómo medir planos PDF y auto-detectar recintos con IA?
• ⚡ **Presupuestos Reales**: ¿Cómo generar rubros APU desglosados y calcular el Factor AIU?
• 🏛️ **SERCOP & VAE**: ¿Cómo postular a licitaciones públicas y aprobar la Matriz VAE?
• 📅 **Cronograma Lookahead**: ¿Cómo planificar cuadrillas, insumos y ruta crítica?
• 🏢 **SARA-BIM 3D**: ¿Cómo extraer volumetrías de hormigón y acero desde archivos IFC?

¿Sobre qué proceso constructivo o módulo del sistema deseas que te explique el paso a paso?`;
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
  return `Con gusto te oriento. Como **SARA-Mentor**, estoy preparado para guiarte paso a paso con ejemplos de cálculo en cualquier proceso de la plataforma:

1. 📐 **SARA Take-Off (Planos 2D)**: Cuantificación milimétrica en PDF y auto-detección de recintos.
2. ⚡ **Mesa de Presupuestos Reales**: Estructura de capítulos, desglose APU y factor AIU.
3. 🏛️ **SERCOP & Matriz VAE**: Licitaciones públicas, normativa LOSNCP y Valor Agregado Ecuatoriano.
4. 📅 **Cronograma & Lookahead**: Planificación de obra, ruta crítica (CPM) y asignación de cuadrillas.
5. 🏢 **SARA-BIM 3D**: Extracción automatizada de volúmenes geométricos desde modelos IFC.

¿Cuál de estos procesos deseas que revisemos juntos con un ejemplo práctico? También puedes comunicarte directamente con Gerencia al **+593 98 180 4023**.`;
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
        const systemPrompt = `Eres SARA-Mentor, el Co-Piloto de Inducción Técnica y de Procesos Oficial de "Grupo SARA" (Holding de Ingeniería, Arquitectura y Construcción en Ecuador).
Tu rol es orientar a ingenieros, arquitectos, contratistas y personal técnico en CÓMO TRABAJA CADA PROCESO del ecosistema.

REGLAS ESENCIALES DE TUS RESPUESTAS:
1. Explica siempre con una metodología rigurosa:
   - 🎯 Objetivo del proceso.
   - 📋 Flujo Paso a Paso (Paso 1, Paso 2, Paso 3...).
   - 📐 Ejemplo Práctico de Obra Real con NÚMEROS Y FÓRMULAS CONCRETAS (dimensiones, rendimientos, m², m³, dosificaciones, VAE, etc.).
   - 🚀 Enlace o indicación de cómo acceder en el sistema.
2. Dominio de los procesos clave:
   - SARA Take-Off (/dashboard/takeoff): Medición de planos 2D en PDF, calibración de escala y auto-detección IA con descuento de vanos.
   - Mesa de Presupuestos (/dashboard/presupuestos_reales): Creación de capítulos, generación con IA [⚡ Generar con IA], desglose en 4 componentes (Materiales, Mano de Obra, Equipos, Transporte) y Factor AIU (18-25%).
   - Contratación Pública SERCOP (/dashboard/sercop/radar y /dashboard/sercop/vae): Búsqueda en radar, normativa LOSNCP, cálculo oficial de Matriz VAE (% de componente nacional) y convalidación de errores.
   - Cronograma Lookahead (/dashboard/presupuestos_reales pestaña Cronograma): Ruta Crítica (CPM), explosión de recursos diarios, cuadrillas y materiales para bodega.
   - SARA-BIM 3D (/dashboard/apus/bim): Carga de archivos IFC, cubicación automática de volúmenes y áreas sin errores de cálculo manual.
3. Tono: Ejecutivo, técnico, claro y constructivo en español ecuatoriano neutro.
Gerente General: Javier Sarango Gona (WhatsApp: +593 98 180 4023). Sede: Cuenca, Azuay, Ecuador.

${userProjectsContext ? `Proyectos del usuario autenticado:\n${userProjectsContext}` : 'El usuario es un profesional o visitante.'}`;

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
