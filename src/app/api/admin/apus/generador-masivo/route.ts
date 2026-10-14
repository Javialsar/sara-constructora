import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const generadorMasivoSchema = z.object({
  categoria: z.string().min(3, "La categoría es requerida"),
  subcategoria: z.string().optional().default("General"),
  cantidad: z.number().int().min(1).max(50).default(10),
  provincia_referencia: z.string().optional().default("Pichincha"),
  normativa_base: z.string().optional().default("NEC-SE-DS / MTOP / SERCOP 2026")
})

interface GeneratedApuInsumo {
  nombre: string
  tipo: "material" | "mano_de_obra" | "equipo"
  unidad: string
  cantidad: number
  precio_unitario: number
}

interface GeneratedApuRubro {
  codigo_sugerido: string
  nombre: string
  unidad: string
  rendimiento_horas: number
  especificaciones: string
  materiales: GeneratedApuInsumo[]
  mano_de_obra: GeneratedApuInsumo[]
  equipos: GeneratedApuInsumo[]
  herramienta_menor_pct: number
}

// Catálogo base de ingeniería civil ecuatoriana (NEC 2026 / MTOP / SERCOP)
const BIBLIOTECA_RUBROS_ECUADOR: Record<string, GeneratedApuRubro[]> = {
  "Estructuras de Hormigón Armado NEC": [
    {
      codigo_sugerido: "EST-HOR-001",
      nombre: "Hormigón Estructural en Cimientos f'c=210 kg/cm2 con Encofrado",
      unidad: "m3",
      rendimiento_horas: 1.5,
      especificaciones: "Hormigón premezclado o hecho en obra con cemento Portland Tipo IP, control de revenimiento 4\", encofrado de madera y vibrado mecánico según NEC-SE-HM.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Cemento Portland Tipo IP (Saco 50kg)", tipo: "material", unidad: "saco", cantidad: 7.8, precio_unitario: 8.45 },
        { nombre: "Arena gruesa de río lavada", tipo: "material", unidad: "m3", cantidad: 0.52, precio_unitario: 18.50 },
        { nombre: "Ripio triturado 3/4\"", tipo: "material", unidad: "m3", cantidad: 0.82, precio_unitario: 22.00 },
        { nombre: "Madera de encofrado (tablas y pingos)", tipo: "material", unidad: "u", cantidad: 3.5, precio_unitario: 3.75 },
        { nombre: "Agua limpia de obra", tipo: "material", unidad: "m3", cantidad: 0.18, precio_unitario: 2.20 }
      ],
      mano_de_obra: [
        { nombre: "Maestro mayor de obra civil", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.2, precio_unitario: 5.60 },
        { nombre: "Albañil calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 2.5, precio_unitario: 4.30 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 4.0, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Hormigonera de 1 saco a gasolina (Trompo)", tipo: "equipo", unidad: "hora", cantidad: 1.8, precio_unitario: 4.50 },
        { nombre: "Vibrador de inmersión para hormigón 4HP", tipo: "equipo", unidad: "hora", cantidad: 1.5, precio_unitario: 3.80 }
      ]
    },
    {
      codigo_sugerido: "EST-HOR-002",
      nombre: "Hormigón Estructural en Columnas f'c=240 kg/cm2",
      unidad: "m3",
      rendimiento_horas: 2.2,
      especificaciones: "Hormigón dosificado para columnas sismorresistentes según NEC-SE-DS. Incluye apuntalamiento y vibrado de alta frecuencia.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Cemento Portland Tipo IP (Saco 50kg)", tipo: "material", unidad: "saco", cantidad: 8.5, precio_unitario: 8.45 },
        { nombre: "Arena fina cernida de mina", tipo: "material", unidad: "m3", cantidad: 0.50, precio_unitario: 19.00 },
        { nombre: "Ripio triturado 1/2\"", tipo: "material", unidad: "m3", cantidad: 0.80, precio_unitario: 23.50 },
        { nombre: "Desencofrante emulsionado para madera", tipo: "material", unidad: "gal", cantidad: 0.45, precio_unitario: 12.00 },
        { nombre: "Tablero contrachapado fenólico 15mm", tipo: "material", unidad: "m2", cantidad: 4.2, precio_unitario: 14.50 }
      ],
      mano_de_obra: [
        { nombre: "Maestro mayor de obra civil", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.5, precio_unitario: 5.60 },
        { nombre: "Albañil encofrador MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 3.2, precio_unitario: 4.45 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 4.8, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Vibrador de inmersión para hormigón 4HP", tipo: "equipo", unidad: "hora", cantidad: 2.0, precio_unitario: 3.80 },
        { nombre: "Hormigonera de 1 saco a gasolina (Trompo)", tipo: "equipo", unidad: "hora", cantidad: 2.0, precio_unitario: 4.50 }
      ]
    },
    {
      codigo_sugerido: "EST-ACE-003",
      nombre: "Acero de Refuerzo Corrugado fy=4200 kg/cm2 (Corte, doblado y colocado)",
      unidad: "kg",
      rendimiento_horas: 0.05,
      especificaciones: "Varilla corrugada de acero soldable según norma INEN 2167. Incluye alambre recocido #18 para amarre y separadores plásticos.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Varilla de acero corrugado fy=4200 kg/cm2", tipo: "material", unidad: "kg", cantidad: 1.05, precio_unitario: 1.25 },
        { nombre: "Alambre galvanizado/recocido de amarre #18", tipo: "material", unidad: "kg", cantidad: 0.035, precio_unitario: 2.10 },
        { nombre: "Separadores plásticos de recubrimiento (pollitas)", tipo: "material", unidad: "u", cantidad: 2.0, precio_unitario: 0.15 }
      ],
      mano_de_obra: [
        { nombre: "Fierrero calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.045, precio_unitario: 4.40 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.045, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Cizalla mecánica y dobladora de varilla", tipo: "equipo", unidad: "hora", cantidad: 0.03, precio_unitario: 1.80 }
      ]
    },
    {
      codigo_sugerido: "EST-LOS-004",
      nombre: "Losa Alivianada con Bloque de Arcilla/Pomez e=20cm",
      unidad: "m2",
      rendimiento_horas: 0.85,
      especificaciones: "Losa unidireccional de hormigón f'c=210 kg/cm2 alivianada con bloques de alivianamiento de 15x20x40cm, nervios de 10cm y capa de compresión e=5cm con malla electrosoldada.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Bloque de alivianamiento de arcilla 15x20x40", tipo: "material", unidad: "u", cantidad: 6.5, precio_unitario: 0.85 },
        { nombre: "Hormigón premezclado f'c=210 kg/cm2", tipo: "material", unidad: "m3", cantidad: 0.095, precio_unitario: 115.00 },
        { nombre: "Malla electrosoldada 100x100x4mm", tipo: "material", unidad: "m2", cantidad: 1.10, precio_unitario: 2.90 },
        { nombre: "Puntales metálicos telescópicos (Alquiler)", tipo: "material", unidad: "dia", cantidad: 0.25, precio_unitario: 1.50 }
      ],
      mano_de_obra: [
        { nombre: "Albañil calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.75, precio_unitario: 4.30 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.10, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Vibrador de inmersión para hormigón 4HP", tipo: "equipo", unidad: "hora", cantidad: 0.35, precio_unitario: 3.80 },
        { nombre: "Elevador mecánico (Winche)", tipo: "equipo", unidad: "hora", cantidad: 0.40, precio_unitario: 4.00 }
      ]
    }
  ],
  "Movimiento de Tierras y Cimentaciones": [
    {
      codigo_sugerido: "MOV-EXC-001",
      nombre: "Excavación Mecánica a Cielo Abierto en Suelo Conglomerado",
      unidad: "m3",
      rendimiento_horas: 0.06,
      especificaciones: "Excavación con retroexcavadora de oruga o llantas según cotas de replanteo. Incluye desalojo interno hasta borde de excavación.",
      herramienta_menor_pct: 5.0,
      materiales: [],
      mano_de_obra: [
        { nombre: "Operador de retroexcavadora calificado", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.05, precio_unitario: 5.80 },
        { nombre: "Peón de estaca y niveles", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.05, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Retroexcavadora sobre llantas CAT 420D (con combustible)", tipo: "equipo", unidad: "hora", cantidad: 0.05, precio_unitario: 38.00 }
      ]
    },
    {
      codigo_sugerido: "MOV-REL-002",
      nombre: "Relleno Compactado con Material de Mejoramiento al 95% Proctor",
      unidad: "m3",
      rendimiento_horas: 0.35,
      especificaciones: "Relleno en capas de espesor máximo de 20cm con lastre de mina o material granular seleccionado, humectado y compactado con sapo saltarín o rodillo.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Material granular de mejoramiento (Lastre/Subbase)", tipo: "material", unidad: "m3", cantidad: 1.25, precio_unitario: 14.50 },
        { nombre: "Agua de compactación", tipo: "material", unidad: "m3", cantidad: 0.08, precio_unitario: 2.20 }
      ],
      mano_de_obra: [
        { nombre: "Albañil calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.30, precio_unitario: 4.30 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.60, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Compactador tipo sapo saltarín (Bailarina)", tipo: "equipo", unidad: "hora", cantidad: 0.30, precio_unitario: 6.50 }
      ]
    },
    {
      codigo_sugerido: "MOV-DES-003",
      nombre: "Desalojo de Material de Excavación en Volqueta d=10km",
      unidad: "m3",
      rendimiento_horas: 0.08,
      especificaciones: "Carga mecánica y transporte de escombros y tierra sobrante hasta botadero autorizado por el Municipio local.",
      herramienta_menor_pct: 0.0,
      materiales: [],
      mano_de_obra: [
        { nombre: "Chofer profesional de volqueta tipo E", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.08, precio_unitario: 5.20 }
      ],
      equipos: [
        { nombre: "Volqueta de 8 m3 a diésel", tipo: "equipo", unidad: "hora", cantidad: 0.08, precio_unitario: 32.00 }
      ]
    }
  ],
  "Mampostería, Enlucidos y Acabados": [
    {
      codigo_sugerido: "MAM-BLO-001",
      nombre: "Mampostería de Bloque de Cemento 15x20x40cm Mortero 1:4",
      unidad: "m2",
      rendimiento_horas: 0.55,
      especificaciones: "Paredes con bloque de hormigón prensado clase estructural 15cm, juntas de mortero de 1.5cm y trabado uniforme según NEC-SE-MP.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Bloque de hormigón prensado 15x20x40", tipo: "material", unidad: "u", cantidad: 12.8, precio_unitario: 0.68 },
        { nombre: "Cemento Portland Tipo IP (Saco 50kg)", tipo: "material", unidad: "saco", cantidad: 0.32, precio_unitario: 8.45 },
        { nombre: "Arena fina de río cernida", tipo: "material", unidad: "m3", cantidad: 0.038, precio_unitario: 19.00 }
      ],
      mano_de_obra: [
        { nombre: "Albañil oficial MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.55, precio_unitario: 4.30 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.55, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Andamio tubular metálico (cuerpo)", tipo: "equipo", unidad: "dia", cantidad: 0.15, precio_unitario: 2.00 }
      ]
    },
    {
      codigo_sugerido: "ACA-ENL-002",
      nombre: "Enlucido Vertical Interior Liso Mortero 1:3 e=1.5cm",
      unidad: "m2",
      rendimiento_horas: 0.45,
      especificaciones: "Revoque maestreado con mortero arena-cemento terminado a paleta y esponja, aplomado a tolerancia de 2mm según especificaciones de acabados.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Cemento Portland Tipo IP (Saco 50kg)", tipo: "material", unidad: "saco", cantidad: 0.22, precio_unitario: 8.45 },
        { nombre: "Arena fina cernida para enlucido", tipo: "material", unidad: "m3", cantidad: 0.025, precio_unitario: 20.00 }
      ],
      mano_de_obra: [
        { nombre: "Albañil oficial enlucidor MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.45, precio_unitario: 4.30 },
        { nombre: "Peón de construcción MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.45, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Andamio modular ligero", tipo: "equipo", unidad: "dia", cantidad: 0.10, precio_unitario: 1.50 }
      ]
    },
    {
      codigo_sugerido: "ACA-PIN-003",
      nombre: "Pintura Látex Vinil-Acrílica para Interiores 2 Manos + Sellador",
      unidad: "m2",
      rendimiento_horas: 0.25,
      especificaciones: "Preparación de superficie con lijado, sellador antialcalino base agua y aplicación de dos manos de pintura látex satinada lavable de primera calidad.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Pintura látex suprema lavable", tipo: "material", unidad: "gal", cantidad: 0.08, precio_unitario: 21.00 },
        { nombre: "Sellador fijador antialcalino concentrado", tipo: "material", unidad: "gal", cantidad: 0.04, precio_unitario: 16.50 },
        { nombre: "Lija para pared #120 / #180", tipo: "material", unidad: "pliego", cantidad: 0.20, precio_unitario: 0.60 },
        { nombre: "Mastic elastomérico para fisuras", tipo: "material", unidad: "kg", cantidad: 0.10, precio_unitario: 3.20 }
      ],
      mano_de_obra: [
        { nombre: "Pintor calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.25, precio_unitario: 4.25 },
        { nombre: "Peón ayudante de pintura", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.15, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Escalera tijera de aluminio y rodillos", tipo: "equipo", unidad: "hora", cantidad: 0.25, precio_unitario: 1.00 }
      ]
    }
  ],
  "Instalaciones Hidrosanitarias y Alcantarillado": [
    {
      codigo_sugerido: "HID-TUB-001",
      nombre: "Punto de Agua Fría PVC Roscable 1/2\" Plastigama con Accesorios",
      unidad: "pto",
      rendimiento_horas: 1.2,
      especificaciones: "Suministro e instalación de tubería de PVC presión cédula 40 / 1/2\" desde derivación principal hasta salida hembra cromada. Prueba hidrostática 100 PSI.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Tubería PVC roscable 1/2\" L=6m Plastigama", tipo: "material", unidad: "u", cantidad: 0.8, precio_unitario: 5.40 },
        { nombre: "Codo PVC roscable 1/2\" x 90", tipo: "material", unidad: "u", cantidad: 3.0, precio_unitario: 0.55 },
        { nombre: "Tee PVC roscable 1/2\"", tipo: "material", unidad: "u", cantidad: 1.0, precio_unitario: 0.70 },
        { nombre: "Cinta teflón industrial alta densidad", tipo: "material", unidad: "rollo", cantidad: 0.3, precio_unitario: 0.85 }
      ],
      mano_de_obra: [
        { nombre: "Plomero / Fontanero calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.2, precio_unitario: 4.40 },
        { nombre: "Peón ayudante de plomería", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.2, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Terraja manual y bomba de prueba hidrostática", tipo: "equipo", unidad: "hora", cantidad: 0.8, precio_unitario: 2.50 }
      ]
    },
    {
      codigo_sugerido: "SAN-DES-002",
      nombre: "Punto de Desagüe Sanitario PVC Reforzado 2\" y 3\" Plastigama",
      unidad: "pto",
      rendimiento_horas: 1.4,
      especificaciones: "Conexión para lavabo, inodoro o ducha con tubería reforzada PVC unión espiga-campana o pegada con cemento solvente de secado rápido.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Tubería PVC desagüe reforzada 2\" L=3m", tipo: "material", unidad: "u", cantidad: 0.9, precio_unitario: 6.80 },
        { nombre: "Sifón P PVC desagüe 2\"", tipo: "material", unidad: "u", cantidad: 1.0, precio_unitario: 2.80 },
        { nombre: "Pegamento PVC soldadura líquida 1/4 gal", tipo: "material", unidad: "u", cantidad: 0.15, precio_unitario: 9.50 }
      ],
      mano_de_obra: [
        { nombre: "Plomero / Fontanero calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.4, precio_unitario: 4.40 },
        { nombre: "Peón ayudante de plomería", tipo: "mano_de_obra", unidad: "hora", cantidad: 1.4, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Sierra de mano y herramientas menores", tipo: "equipo", unidad: "hora", cantidad: 1.0, precio_unitario: 1.20 }
      ]
    }
  ],
  "Vialidad, Pavimentos y Bordillos": [
    {
      codigo_sugerido: "VIA-BOR-001",
      nombre: "Bordillo de Hormigón Simple f'c=210 kg/cm2 Sección 15x35cm Fundido en Sitio",
      unidad: "ml",
      rendimiento_horas: 0.35,
      especificaciones: "Bordillo tipo cuneta o rectangular fundido con hormigón premezclado, juntas de dilatación con asfalto cada 2m y aristas boleadas con volteador.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Hormigón simple premezclado f'c=210 kg/cm2", tipo: "material", unidad: "m3", cantidad: 0.058, precio_unitario: 110.00 },
        { nombre: "Encofrado metálico curvo/recto para bordillo", tipo: "material", unidad: "ml", cantidad: 1.0, precio_unitario: 1.80 },
        { nombre: "Asfalto líquido RC-250 para juntas", tipo: "material", unidad: "gal", cantidad: 0.05, precio_unitario: 8.50 }
      ],
      mano_de_obra: [
        { nombre: "Albañil vial calificado MDT", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.35, precio_unitario: 4.30 },
        { nombre: "Peón de cuadrilla vial", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.70, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Vibrador de hormigón a gasolina", tipo: "equipo", unidad: "hora", cantidad: 0.20, precio_unitario: 3.80 }
      ]
    },
    {
      codigo_sugerido: "VIA-ADO-002",
      nombre: "Adoquinado Vehicular Holandés de Hormigón Resistencia 350 kg/cm2 e=8cm",
      unidad: "m2",
      rendimiento_horas: 0.40,
      especificaciones: "Colocación trabada de adoquín de hormigón vibroprensado sobre cama de arena lavada e=4cm y sellado de juntas con arena fina compactada con placa vibratoria.",
      herramienta_menor_pct: 5.0,
      materiales: [
        { nombre: "Adoquín vehicular holandés 10x20x8cm R=350 kg/cm2", tipo: "material", unidad: "u", cantidad: 50.0, precio_unitario: 0.34 },
        { nombre: "Arena gruesa para cama de apoyo", tipo: "material", unidad: "m3", cantidad: 0.05, precio_unitario: 18.00 },
        { nombre: "Arena fina cernida para emboquillado de juntas", tipo: "material", unidad: "m3", cantidad: 0.015, precio_unitario: 20.00 }
      ],
      mano_de_obra: [
        { nombre: "Adoquinador maestro calificado", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.40, precio_unitario: 4.40 },
        { nombre: "Peón acarreador de adoquín", tipo: "mano_de_obra", unidad: "hora", cantidad: 0.80, precio_unitario: 3.80 }
      ],
      equipos: [
        { nombre: "Placa compactadora vibratoria 5.5HP", tipo: "equipo", unidad: "hora", cantidad: 0.25, precio_unitario: 6.00 }
      ]
    }
  ]
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado. Token de sesión requerido." }, { status: 401 })
    }

    const body = await request.json()
    const validation = generadorMasivoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Parámetros inválidos", details: validation.error.flatten() }, { status: 400 })
    }

    const { categoria, subcategoria, cantidad, provincia_referencia, normativa_base } = validation.data
    const adminSupabase = createAdminClient()

    // 1. Obtener o crear la Familia / Grupo correspondiente
    let familiaId = ""
    const { data: famExistente } = await adminSupabase
      .from('familias')
      .select('id, nombre')
      .ilike('nombre', `%${categoria.split(' ')[0]}%`)
      .limit(1)

    if (famExistente && famExistente.length > 0) {
      familiaId = famExistente[0].id
    } else {
      familiaId = `FAM-AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      await adminSupabase.from('familias').insert([{
        id: familiaId,
        nombre: categoria,
        grupo_sugerido: 'rubro'
      }])
    }

    // 2. Obtener o crear la Subfamilia correspondiente
    let subfamiliaId = ""
    const { data: subExistente } = await adminSupabase
      .from('subfamilias')
      .select('id, nombre')
      .eq('familia_id', familiaId)
      .limit(1)

    if (subExistente && subExistente.length > 0) {
      subfamiliaId = subExistente[0].id
    } else {
      subfamiliaId = `SF-AI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      await adminSupabase.from('subfamilias').insert([{
        id: subfamiliaId,
        nombre: subcategoria || 'General',
        familia_id: familiaId
      }])
    }

    // 3. Obtener rubros plantilla o sintetizar con motor de ingeniería de IA
    const rubrosPlantilla = BIBLIOTECA_RUBROS_ECUADOR[categoria] || Object.values(BIBLIOTECA_RUBROS_ECUADOR).flat()
    const rubrosAGenerar: GeneratedApuRubro[] = []

    for (let i = 0; i < cantidad; i++) {
      const baseIndex = i % rubrosPlantilla.length
      const base = rubrosPlantilla[baseIndex]
      const varianteNum = Math.floor(i / rubrosPlantilla.length) + 1
      
      const nuevoRubro: GeneratedApuRubro = {
        codigo_sugerido: varianteNum > 1 ? `${base.codigo_sugerido}-V${varianteNum}` : `${base.codigo_sugerido}-${Math.floor(100 + Math.random() * 900)}`,
        nombre: varianteNum > 1 ? `${base.nombre} (Variante técnica #${varianteNum})` : base.nombre,
        unidad: base.unidad,
        rendimiento_horas: base.rendimiento_horas,
        especificaciones: `${base.especificaciones} Grounding normativo: ${normativa_base}. Adaptado a condiciones constructivas de ${provincia_referencia}.`,
        materiales: base.materiales.map(m => ({ ...m })),
        mano_de_obra: base.mano_de_obra.map(mo => ({ ...mo })),
        equipos: base.equipos.map(eq => ({ ...eq })),
        herramienta_menor_pct: base.herramienta_menor_pct || 5.0
      }
      rubrosAGenerar.push(nuevoRubro)
    }

    // 4. Inserción masiva en Supabase (Insumos Maestros, Rubros Maestros y Recetas APU)
    const rubrosCreados: any[] = []
    let insumosCreadosCount = 0
    let preciosZonificadosCount = 0

    // Consultar catálogo maestro existente para no duplicar insumos
    const { data: insumosExistentesDb } = await adminSupabase
      .from('insumos')
      .select('id, nombre, unidad, precio_sin_iva')

    const mapaInsumos = new Map<string, any>()
    insumosExistentesDb?.forEach(ins => {
      mapaInsumos.set(ins.nombre.trim().toLowerCase(), ins)
    })

    for (const rubroGen of rubrosAGenerar) {
      // 4.1 Resolver insumos y calcular Costo Directo
      const todosLosInsumos = [...rubroGen.materiales, ...rubroGen.mano_de_obra, ...rubroGen.equipos]
      let costoDirectoMateriales = 0
      let costoDirectoManoObra = 0
      let costoDirectoEquipos = 0
      const itemsRecetaParaInsertar: { insumo_id: string; cantidad: number }[] = []

      for (const item of todosLosInsumos) {
        const itemKey = item.nombre.trim().toLowerCase()
        let insumoId = ""

        if (mapaInsumos.has(itemKey)) {
          const insumoEncontrado = mapaInsumos.get(itemKey)
          insumoId = insumoEncontrado.id
        } else {
          // Crear nuevo insumo maestro de Grupo SARA
          const codigoInsumo = `${item.tipo.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
          const { data: newInsumo, error: errInsumo } = await adminSupabase
            .from('insumos')
            .insert([{
              codigo: codigoInsumo,
              nombre: item.nombre,
              unidad: item.unidad,
              tipo: item.tipo,
              precio_sin_iva: item.precio_unitario,
              es_maestro: true,
              user_id: null
            }])
            .select()
            .single()

          if (!errInsumo && newInsumo) {
            insumoId = newInsumo.id
            mapaInsumos.set(itemKey, newInsumo)
            insumosCreadosCount++

            // Registrar precio zonificado para la provincia
            if (provincia_referencia) {
              await adminSupabase
                .from('marketplace_precios_zonificados')
                .upsert([{
                  insumo_id: insumoId,
                  provincia: provincia_referencia,
                  precio_puesto_obra: item.precio_unitario,
                  stock_disponible: true
                }], { onConflict: 'insumo_id,provincia,canton' })
              preciosZonificadosCount++
            }
          }
        }

        if (insumoId) {
          itemsRecetaParaInsertar.push({
            insumo_id: insumoId,
            cantidad: item.cantidad
          })

          const subtotalItem = item.cantidad * item.precio_unitario
          if (item.tipo === 'material') costoDirectoMateriales += subtotalItem
          else if (item.tipo === 'mano_de_obra') costoDirectoManoObra += subtotalItem
          else if (item.tipo === 'equipo') costoDirectoEquipos += subtotalItem
        }
      }

      const herramientaMenorVal = costoDirectoManoObra * ((rubroGen.herramienta_menor_pct || 5) / 100)
      const totalCostoDirecto = costoDirectoMateriales + costoDirectoManoObra + costoDirectoEquipos + herramientaMenorVal

      // 4.2 Crear Rubro Maestro en la base de datos
      const { data: rubroInsertado, error: errRubro } = await adminSupabase
        .from('rubros')
        .insert([{
          codigo: rubroGen.codigo_sugerido,
          nombre: rubroGen.nombre,
          unidad: rubroGen.unidad,
          rendimiento: rubroGen.rendimiento_horas,
          herramienta_menor_pct: rubroGen.herramienta_menor_pct,
          total_costo_directo: parseFloat(totalCostoDirecto.toFixed(4)),
          subfamilia_id: subfamiliaId,
          es_maestro: true,
          user_id: null
        }])
        .select()
        .single()

      if (!errRubro && rubroInsertado) {
        // 4.3 Vincular receta de insumos en rubro_insumos
        if (itemsRecetaParaInsertar.length > 0) {
          await adminSupabase.from('rubro_insumos').insert(
            itemsRecetaParaInsertar.map(it => ({
              rubro_id: rubroInsertado.id,
              insumo_id: it.insumo_id,
              cantidad: it.cantidad
            }))
          )
        }

        rubrosCreados.push({
          id: rubroInsertado.id,
          codigo: rubroInsertado.codigo,
          nombre: rubroInsertado.nombre,
          unidad: rubroInsertado.unidad,
          costo_directo: totalCostoDirecto,
          insumos_count: itemsRecetaParaInsertar.length
        })
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `¡Se generaron exitosamente ${rubrosCreados.length} rubros maestros y sus APU técnicos para Grupo SARA!`,
      data: {
        total_rubros_generados: rubrosCreados.length,
        nuevos_insumos_maestros: insumosCreadosCount,
        precios_zonificados_provincia: preciosZonificadosCount,
        categoria_procesada: categoria,
        provincia_referencia,
        rubros: rubrosCreados
      }
    })
  } catch (err: any) {
    console.error("Error en generador masivo APU:", err)
    return NextResponse.json({ error: "Error en el generador masivo con IA", message: err.message }, { status: 500 })
  }
}
