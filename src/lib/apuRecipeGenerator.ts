// ============================================================================
// SARA APU - MOTOR DE RECETAS ANALÍTICAS & SINCRONIZACIÓN DE INSUMOS
// Generador y sincronizador de insumos (Materiales, Mano de Obra CCEC, Equipos)
// según normativa ecuatoriana (CAMICON / SERCOP / MDT 2026)
// ============================================================================

export interface RecipeItemDef {
  nombre: string
  tipo: 'material' | 'mano_de_obra' | 'equipo' | 'transporte'
  unidad: string
  cantidad: number
  precio: number
  codigo?: string
}

// Catálogo canónico de recetas para rubros estándar y de cotizador
export const CANONICAL_APU_RECIPES: Record<string, RecipeItemDef[]> = {
  // --- CAPÍTULO 1: CONSULTORÍA Y DISEÑO ---
  "CONS-001": [ // Diseño Arquitectónico Ejecutivo, Planimetría 2D y Renders 3D ($15.00/m²)
    { nombre: "Arquitecto Diseñador Senior / Director de Proyecto", tipo: "mano_de_obra", unidad: "h", cantidad: 0.70, precio: 12.00, codigo: "MO-ARQ-01" },
    { nombre: "Dibujante Arquitectónico / Modelador BIM", tipo: "mano_de_obra", unidad: "h", cantidad: 0.80, precio: 5.00, codigo: "MO-DIB-01" },
    { nombre: "Estación de Trabajo CAD/BIM y Motor de Render", tipo: "equipo", unidad: "h", cantidad: 0.50, precio: 2.36, codigo: "EQ-BIM-01" },
    { nombre: "Planimetría Plotter A1 Bond y Memoria Descriptiva", tipo: "material", unidad: "u", cantidad: 0.16, precio: 5.00, codigo: "MAT-PLN-01" },
  ],
  "CONS-002": [ // Cálculo y Diseño Estructural Sísmico NEC ($8.50/m²)
    { nombre: "Ingeniero Civil Calculista Estructural NEC", tipo: "mano_de_obra", unidad: "h", cantidad: 0.50, precio: 12.00, codigo: "MO-ING-01" },
    { nombre: "Dibujante Estructural CAD / Planillero", tipo: "mano_de_obra", unidad: "h", cantidad: 0.20, precio: 5.00, codigo: "MO-DIB-02" },
    { nombre: "Software de Modelado y Cálculo Sísmico (ETABS/SAP2000)", tipo: "equipo", unidad: "h", cantidad: 0.50, precio: 1.30, codigo: "EQ-SOFT-01" },
    { nombre: "Memoria de Cálculo Sísmico y Planos Estructurales A1", tipo: "material", unidad: "u", cantidad: 0.10, precio: 5.00, codigo: "MAT-PLN-02" },
  ],
  "CONS-003": [ // Aprobación de Planos y Permisos Municipales ($816.00 GLB)
    { nombre: "Gestor Técnico / Tramitador Municipal Colegiado", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.00, precio: 350.00, codigo: "MO-GES-01" },
    { nombre: "Tasas Administrativas y Formularios de Aprobación GAD", tipo: "material", unidad: "GLB", cantidad: 1.00, precio: 448.50, codigo: "MAT-ADM-01" },
  ],
  "CONS-004": [ // Estudio Geotécnico de Mecánica de Suelos (Sondeos SPT) ($800.00 GLB)
    { nombre: "Ingeniero Geotécnico Especialista", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.00, precio: 360.00, codigo: "MO-GEO-01" },
    { nombre: "Equipo de Perforación y Penetración Estándar (SPT) + Ensayos Laboratorio", tipo: "equipo", unidad: "GLB", cantidad: 1.00, precio: 372.00, codigo: "EQ-GEO-01" },
    { nombre: "Informe Técnico Geotécnico con Perfiles Estratigráficos", tipo: "material", unidad: "GLB", cantidad: 1.00, precio: 50.00, codigo: "MAT-INF-01" },
  ],
  "CONS-005": [ // Levantamiento Topográfico con Estación Total / Dron RTK ($350.00 GLB)
    { nombre: "Topógrafo Profesional + Cadenero", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.00, precio: 200.00, codigo: "MO-TOP-01" },
    { nombre: "Estación Total Láser y Dron Fotogramétrico RTK", tipo: "equipo", unidad: "GLB", cantidad: 1.00, precio: 120.00, codigo: "EQ-TOP-01" },
    { nombre: "Planos Topográficos Georreferenciados y Curvas de Nivel", tipo: "material", unidad: "GLB", cantidad: 1.00, precio: 20.00, codigo: "MAT-TOP-01" },
  ],

  // --- CAPÍTULO 2: PRELIMINARES Y CIMENTACIÓN ---
  "PREL-001": [ // Replanteo y Nivelación con Estación Total ($2.80/m²)
    { nombre: "Topógrafo", tipo: "mano_de_obra", unidad: "h", cantidad: 0.15, precio: 6.50, codigo: "MO-TOP-02" },
    { nombre: "Cadenero / Peón de apoyo", tipo: "mano_de_obra", unidad: "h", cantidad: 0.25, precio: 3.80, codigo: "MO-PEO-01" },
    { nombre: "Estación Total / Nivel óptico láser", tipo: "equipo", unidad: "h", cantidad: 0.15, precio: 3.50, codigo: "EQ-NIV-01" },
    { nombre: "Madera para estacas, piola y pintura de replanteo", tipo: "material", unidad: "m²", cantidad: 1.00, precio: 0.30, codigo: "MAT-EST-01" },
  ],
  "PREL-002": [ // Excavación a Máquina para Cimientos y Desalojo ($7.50/m³)
    { nombre: "Retroexcavadora / Cargadora de orugas", tipo: "equipo", unidad: "h", cantidad: 0.16, precio: 28.00, codigo: "EQ-RET-01" },
    { nombre: "Volqueta 8m3 para desalojo de material", tipo: "equipo", unidad: "h", cantidad: 0.12, precio: 20.00, codigo: "EQ-VOL-01" },
    { nombre: "Peón excavador de obra civil", tipo: "mano_de_obra", unidad: "h", cantidad: 0.15, precio: 3.80, codigo: "MO-PEO-02" },
  ],

  // --- CAPÍTULO 3: ESTRUCTURAS Y HORMIGÓN ---
  "ESTR-001": [ // Hormigón Armado Sismo-Resistente ($113.00/m²)
    { nombre: "Hormigón Premezclado f'c=210 kg/cm2", tipo: "material", unidad: "m³", cantidad: 0.22, precio: 95.00, codigo: "MAT-HOR-01" },
    { nombre: "Acero de refuerzo corrugado fy=4200 kg/cm²", tipo: "material", unidad: "kg", cantidad: 35.0, precio: 1.45, codigo: "MAT-ACE-01" },
    { nombre: "Madera de encofrado y puntales metálicos (amortización)", tipo: "material", unidad: "u", cantidad: 0.25, precio: 18.00, codigo: "MAT-ENC-01" },
    { nombre: "Maestro de obra civil", tipo: "mano_de_obra", unidad: "h", cantidad: 0.80, precio: 5.50, codigo: "MO-MAE-01" },
    { nombre: "Albañil encofrador / fierrero", tipo: "mano_de_obra", unidad: "h", cantidad: 4.00, precio: 4.30, codigo: "MO-ALB-01" },
    { nombre: "Peón de cuadrilla de fundición", tipo: "mano_de_obra", unidad: "h", cantidad: 3.50, precio: 3.80, codigo: "MO-PEO-03" },
    { nombre: "Vibrador de hormigón a gasolina", tipo: "equipo", unidad: "h", cantidad: 0.50, precio: 3.50, codigo: "EQ-VIB-01" },
  ],
  "ESTR-002": [ // Acero de Refuerzo Corrugado fy=4200 ($1.65/kg)
    { nombre: "Varilla de acero corrugado fy=4200 (cortada y doblada)", tipo: "material", unidad: "kg", cantidad: 1.05, precio: 1.20, codigo: "MAT-VAR-01" },
    { nombre: "Alambre negro de amarre #18", tipo: "material", unidad: "kg", cantidad: 0.03, precio: 1.80, codigo: "MAT-ALM-01" },
    { nombre: "Fierrero calificado", tipo: "mano_de_obra", unidad: "h", cantidad: 0.05, precio: 4.30, codigo: "MO-FIE-01" },
    { nombre: "Ayudante fierrero", tipo: "mano_de_obra", unidad: "h", cantidad: 0.03, precio: 3.80, codigo: "MO-AYU-01" },
    { nombre: "Cizalla y dobladora de varilla", tipo: "equipo", unidad: "h", cantidad: 0.05, precio: 0.12, codigo: "EQ-DOB-01" },
  ],

  // --- CAPÍTULO 4: MAMPOSTERÍA Y ACABADOS ---
  "MAMP-001": [ // Mampostería de Bloque Pesado e=15cm ($14.20/m²)
    { nombre: "Bloque de concreto pesado 15x20x40cm", tipo: "material", unidad: "u", cantidad: 12.5, precio: 0.48, codigo: "MAT-BLO-01" },
    { nombre: "Cemento Selvalegre/Guapán IP", tipo: "material", unidad: "saco", cantidad: 0.35, precio: 8.50, codigo: "MAT-CEM-01" },
    { nombre: "Arena azul lavada de mina", tipo: "material", unidad: "m³", cantidad: 0.035, precio: 18.00, codigo: "MAT-ARE-01" },
    { nombre: "Albañil", tipo: "mano_de_obra", unidad: "h", cantidad: 0.65, precio: 4.30, codigo: "MO-ALB-02" },
    { nombre: "Peón de construcción", tipo: "mano_de_obra", unidad: "h", cantidad: 0.40, precio: 3.80, codigo: "MO-PEO-04" },
    { nombre: "Andamios tubulares de tijera", tipo: "equipo", unidad: "h", cantidad: 0.20, precio: 0.50, codigo: "EQ-AND-01" },
  ],
  "ACAB-001": [ // Acabados de Pisos, Paredes y Pintura ($88.00/m²)
    { nombre: "Porcelanato / Cerámica esmaltada de alto tráfico 60x60", tipo: "material", unidad: "m²", cantidad: 1.08, precio: 18.50, codigo: "MAT-POR-01" },
    { nombre: "Pegamento blanco flexible bond y emporce", tipo: "material", unidad: "saco", cantidad: 0.50, precio: 7.50, codigo: "MAT-PEG-01" },
    { nombre: "Masilla empaste interior y Pintura Látex Vinil acrílica", tipo: "material", unidad: "m²", cantidad: 1.00, precio: 8.50, codigo: "MAT-PIN-01" },
    { nombre: "Puertas tamboradas de madera con cerradura estándar", tipo: "material", unidad: "u", cantidad: 0.10, precio: 140.00, codigo: "MAT-PUE-01" },
    { nombre: "Maestro colocador de porcelanato y acabados", tipo: "mano_de_obra", unidad: "h", cantidad: 4.50, precio: 4.50, codigo: "MO-CER-01" },
    { nombre: "Pintor profesional", tipo: "mano_de_obra", unidad: "h", cantidad: 2.50, precio: 4.20, codigo: "MO-PIN-01" },
    { nombre: "Ayudante de acabados", tipo: "mano_de_obra", unidad: "h", cantidad: 2.50, precio: 3.80, codigo: "MO-AYU-02" },
    { nombre: "Cortadora de cerámica eléctrica y herramientas manuales", tipo: "equipo", unidad: "h", cantidad: 1.00, precio: 1.70, codigo: "EQ-COR-01" },
  ],
  "ACAB-003": [ // Mesón e Isla Central de Cocina ($1500.00 GLB)
    { nombre: "Plancha de Granito natural pulido para mesón e isla", tipo: "material", unidad: "m²", cantidad: 4.5, precio: 110.00, codigo: "MAT-GRA-01" },
    { nombre: "Módulos de cocina en melamina hidrófuga RH 18mm con herrajes soft-close", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 650.00, codigo: "MAT-MUE-01" },
    { nombre: "Fregadero de 2 pozos acero inoxidable Teka/Teka con grifería", tipo: "material", unidad: "u", cantidad: 1.0, precio: 180.00, codigo: "MAT-FRE-01" },
    { nombre: "Instalador artesanal de granito y carpintería", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 165.00, codigo: "MO-CAR-01" },
  ],
  "ACAB-005": [ // Sala Familiar de Estar Íntimo / TV Room ($700.00 GLB)
    { nombre: "Panel acústico ranurado y enchape decorativo de madera", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 380.00, codigo: "MAT-PAN-01" },
    { nombre: "Puntos de red HDMI empotrados y luz ambiental LED indirecta", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 180.00, codigo: "MAT-ILU-01" },
    { nombre: "Maestro electricista y decorador de interiores", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 135.00, codigo: "MO-ELE-01" },
  ],
  "ACAB-006": [ // Dormitorio Máster con Vestidor Walk-in y Baño Privado ($800.00 U)
    { nombre: "Clóset vestidor walk-in en melamina RH con cajonería y colgadores", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 520.00, codigo: "MAT-CLO-01" },
    { nombre: "Espejo flotante con iluminación LED perimetral", tipo: "material", unidad: "u", cantidad: 1.0, precio: 120.00, codigo: "MAT-ESP-01" },
    { nombre: "Instalador de carpintería y acabados", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 155.00, codigo: "MO-INS-01" },
  ],
  "ACAB-007": [ // Batería Sanitaria Completa FV con Mampara ($1500.00 U)
    { nombre: "Inodoro de alta eficiencia de descarga FV / Briggs", tipo: "material", unidad: "u", cantidad: 1.0, precio: 220.00, codigo: "MAT-INO-01" },
    { nombre: "Lavamanos de sobreponer con mesón y grifería monomando FV", tipo: "material", unidad: "u", cantidad: 1.0, precio: 280.00, codigo: "MAT-LAV-01" },
    { nombre: "Mampara de baño en vidrio templado 8mm con herrajes inox", tipo: "material", unidad: "u", cantidad: 1.0, precio: 380.00, codigo: "MAT-MAM-01" },
    { nombre: "Set de ducha teléfono y accesorios FV cromo", tipo: "material", unidad: "u", cantidad: 1.0, precio: 160.00, codigo: "MAT-DUC-01" },
    { nombre: "Plomero instalador hidrosanitario calificado", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 240.00, codigo: "MO-PLO-01" },
    { nombre: "Pegamentos, tubos de abasto, llaves de paso y selladores", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 208.00, codigo: "MAT-REP-01" },
  ],
  "ACAB-008": [ // Medio Baño Social ($800.00 U)
    { nombre: "Inodoro compacto para medio baño FV", tipo: "material", unidad: "u", cantidad: 1.0, precio: 180.00, codigo: "MAT-INO-02" },
    { nombre: "Mueble vanitorio con lavamanos suspendido y grifería alta FV", tipo: "material", unidad: "u", cantidad: 1.0, precio: 260.00, codigo: "MAT-VAN-01" },
    { nombre: "Espejo biselado y juego de accesorios de baño", tipo: "material", unidad: "u", cantidad: 1.0, precio: 90.00, codigo: "MAT-ESP-02" },
    { nombre: "Plomero instalador", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 160.00, codigo: "MO-PLO-02" },
    { nombre: "Insumos menores de conexión y silicona antihongos", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 102.00, codigo: "MAT-INS-01" },
  ],

  // --- CAPÍTULO 5: INSTALACIONES ELÉCTRICAS E HIDROSANITARIAS ---
  "INST-001": [ // Redes Eléctricas Interiores ($8.50/m²)
    { nombre: "Cable conductor de cobre flexible #12 y #14 AWG", tipo: "material", unidad: "m", cantidad: 5.5, precio: 0.65, codigo: "MAT-CAB-01" },
    { nombre: "Tubería corrugada flexible / reforzada conduit 3/4\"", tipo: "material", unidad: "m", cantidad: 3.2, precio: 0.45, codigo: "MAT-TUB-01" },
    { nombre: "Placas, interruptores y tomacorrientes polarizados", tipo: "material", unidad: "u", cantidad: 0.8, precio: 2.20, codigo: "MAT-PLA-01" },
    { nombre: "Electricista instalador calificado", tipo: "mano_de_obra", unidad: "h", cantidad: 0.35, precio: 4.40, codigo: "MO-ELE-02" },
    { nombre: "Ayudante electricista", tipo: "mano_de_obra", unidad: "h", cantidad: 0.25, precio: 3.80, codigo: "MO-AYU-03" },
  ],
  "INST-002": [ // Redes de Agua Fría/Caliente en Termofusión ($7.80/m²)
    { nombre: "Tubería de termofusión PPR 20mm y 25mm para agua potable", tipo: "material", unidad: "m", cantidad: 2.2, precio: 1.20, codigo: "MAT-TER-01" },
    { nombre: "Accesorios de termofusión (codos, tees, uniones mixtas)", tipo: "material", unidad: "u", cantidad: 1.5, precio: 0.90, codigo: "MAT-ACC-01" },
    { nombre: "Tubería de desagüe sanitario PVC 50mm y 110mm", tipo: "material", unidad: "m", cantidad: 1.2, precio: 1.30, codigo: "MAT-SAN-01" },
    { nombre: "Plomero gasfitero", tipo: "mano_de_obra", unidad: "h", cantidad: 0.30, precio: 4.30, codigo: "MO-PLO-03" },
    { nombre: "Ayudante plomero", tipo: "mano_de_obra", unidad: "h", cantidad: 0.25, precio: 3.80, codigo: "MO-AYU-04" },
  ],

  // --- CAPÍTULO 6: WELLNESS, RECREACIÓN Y EXTERIORES ---
  "WELL-001": [ // Zona BBQ con Pérgola y Asador ($2800.00 GLB)
    { nombre: "Estructura metálica para pérgola con policarbonato alveolar 8mm", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 1200.00, codigo: "MAT-PER-01" },
    { nombre: "Ladrillo refractario, parrilla de acero inoxidable con manivela y campana", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 750.00, codigo: "MAT-PAR-01" },
    { nombre: "Mesón de concreto con enchape cerámico y lavacopas", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 320.00, codigo: "MAT-MES-01" },
    { nombre: "Cuadrilla de herrero y albañil especializado", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 480.00, codigo: "MO-BBQ-01" },
  ],
  "WELL-002": [ // Jacuzzi / Hidromasaje Exterior con Calentador ($4200.00 GLB)
    { nombre: "Tina de hidromasaje en acrílico sanitario reforzado con fibra para 4-6 pers.", tipo: "material", unidad: "u", cantidad: 1.0, precio: 2200.00, codigo: "MAT-JAC-01" },
    { nombre: "Bomba de recirculación 1.5 HP, calentador eléctrico/gas y soplador blower", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 1050.00, codigo: "MAT-BOM-01" },
    { nombre: "Revestimiento perimetral en Deck WPC de madera plástica", tipo: "material", unidad: "m²", cantidad: 6.0, precio: 45.00, codigo: "MAT-DEC-01" },
    { nombre: "Instalador electromecánico especializado", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 620.00, codigo: "MO-TEC-01" },
  ],
  "WELL-004": [ // Terraza Accesible Rooftop con Impermeabilización ($1800.00 GLB)
    { nombre: "Membrana asfáltica polimérica 4mm gravillada para intemperie", tipo: "material", unidad: "m²", cantidad: 45.0, precio: 14.00, codigo: "MAT-MEM-01" },
    { nombre: "Pasamanos perimetral metálico con vidrio templado de seguridad", tipo: "material", unidad: "ML", cantidad: 15.0, precio: 45.00, codigo: "MAT-PAS-01" },
    { nombre: "Cuadrilla de impermeabilización y montaje", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 450.00, codigo: "MO-IMP-01" },
  ],
  "EXT-001": [ // Cerramiento Perimetral en Bloque con Malla ($120.00/ML)
    { nombre: "Bloque de concreto pesado 15x20x40cm y mortero", tipo: "material", unidad: "u", cantidad: 25.0, precio: 0.55, codigo: "MAT-BLO-02" },
    { nombre: "Hormigón ciclópeo para cimiento y zapatas", tipo: "material", unidad: "m³", cantidad: 0.25, precio: 75.00, codigo: "MAT-HOR-02" },
    { nombre: "Malla electrosoldada y alambre de púas superior", tipo: "material", unidad: "ML", cantidad: 1.0, precio: 18.00, codigo: "MAT-MAL-01" },
    { nombre: "Albañil y peón de obra para cerramientos", tipo: "mano_de_obra", unidad: "ML", cantidad: 1.0, precio: 38.00, codigo: "MO-ALB-03" },
    { nombre: "Herramienta menor y mezcladora", tipo: "equipo", unidad: "ML", cantidad: 1.0, precio: 8.50, codigo: "EQ-MEZ-01" },
  ],
  "EXT-002": [ // Cisterna Subterránea de Hormigón Armado ($2500.00 GLB)
    { nombre: "Hormigón armado impermeable f'c=240 kg/cm2 con Sika 1", tipo: "material", unidad: "m³", cantidad: 6.0, precio: 125.00, codigo: "MAT-HOR-03" },
    { nombre: "Bomba sumergible o centrífuga 0.75 HP con tanque hidroneumático", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 450.00, codigo: "MAT-BOM-02" },
    { nombre: "Tapa metálica hermética de registro con candado", tipo: "material", unidad: "u", cantidad: 1.0, precio: 95.00, codigo: "MAT-TAP-01" },
    { nombre: "Cuadrilla especializada de fundición e impermeabilización", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 750.00, codigo: "MO-FUN-01" },
    { nombre: "Vibrador y accesorios hidrosanitarios", tipo: "equipo", unidad: "GLB", cantidad: 1.0, precio: 410.00, codigo: "EQ-ACC-01" },
  ],
  "EXT-003": [ // Área de Garaje / Estacionamiento ($800.00 GLB)
    { nombre: "Adoquín vehicular holandés 10x20x6cm y arena de apoyo", tipo: "material", unidad: "m²", cantidad: 25.0, precio: 12.00, codigo: "MAT-ADO-01" },
    { nombre: "Bordillo de hormigón de confinamiento", tipo: "material", unidad: "ML", cantidad: 15.0, precio: 8.50, codigo: "MAT-BOR-01" },
    { nombre: "Colocador de adoquines y peón", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 280.00, codigo: "MO-ADO-01" },
    { nombre: "Compactador tipo sapo / rodillo manual", tipo: "equipo", unidad: "GLB", cantidad: 1.0, precio: 80.00, codigo: "EQ-SAP-01" },
  ],
  "EXT-004": [ // Sistema de Climatización ($1200.00 GLB)
    { nombre: "Unidad Split de Aire Acondicionado Inverter 12000 BTU", tipo: "material", unidad: "u", cantidad: 1.0, precio: 680.00, codigo: "MAT-SPL-01" },
    { nombre: "Tubería de cobre refrigerante con aislamiento y cables", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 140.00, codigo: "MAT-COB-01" },
    { nombre: "Técnico instalador de climatización certificado", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 260.00, codigo: "MO-CLI-01" },
    { nombre: "Bomba de vacío y manómetros de gas ecológico", tipo: "equipo", unidad: "GLB", cantidad: 1.0, precio: 110.00, codigo: "EQ-VAC-01" },
  ],
  "VAR-001": [ // Limpieza Final de Obra ($450.00 GLB)
    { nombre: "Detergentes industriales, removedor de cemento y ácido muriático", tipo: "material", unidad: "GLB", cantidad: 1.0, precio: 75.00, codigo: "MAT-DET-01" },
    { nombre: "Cuadrilla de limpieza final y pulido de vidrios", tipo: "mano_de_obra", unidad: "GLB", cantidad: 1.0, precio: 220.00, codigo: "MO-LIM-01" },
    { nombre: "Flete de volqueta para retiro de escombros finos", tipo: "transporte", unidad: "viaje", cantidad: 1.0, precio: 80.00, codigo: "TR-VOL-01" },
    { nombre: "Herramientas de limpieza y pulidora", tipo: "equipo", unidad: "GLB", cantidad: 1.0, precio: 65.00, codigo: "EQ-LIM-01" },
  ],
}

// Generador de receta analítica inteligente cuando no existe en el catálogo canónico
export function generateHeuristicRecipe(rubro: {
  codigo_rubro?: string
  nombre_rubro: string
  unidad: string
  precio_unitario_snapshot: number
}): RecipeItemDef[] {
  const pu = Number(rubro.precio_unitario_snapshot) || 10.0
  const q = (rubro.nombre_rubro || '').toLowerCase()
  const und = rubro.unidad || 'u'

  // Si es rubro de consultoría / planos
  if (q.includes("diseño") || q.includes("arquitect") || q.includes("plano") || q.includes("consult")) {
    const moCost = pu * 0.75
    const eqCost = pu * 0.15
    const matCost = Math.max(0.1, pu - moCost - eqCost)
    return [
      { nombre: `Especialista Técnico / Diseñador (${rubro.nombre_rubro})`, tipo: "mano_de_obra", unidad: "h", cantidad: Number((moCost / 12.0).toFixed(4)), precio: 12.00 },
      { nombre: "Estación de Trabajo y Software Especializado", tipo: "equipo", unidad: "h", cantidad: Number((eqCost / 3.0).toFixed(4)), precio: 3.00 },
      { nombre: "Memorias Técnicas y Planimetría Oficial A1", tipo: "material", unidad: und === 'm²' ? 'u' : und, cantidad: Number((matCost / 5.0).toFixed(4)), precio: 5.00 },
    ]
  }

  // Si es excavación o maquinaria
  if (q.includes("excav") || q.includes("maquin") || q.includes("desalojo") || q.includes("relleno")) {
    const eqCost = pu * 0.65
    const moCost = pu * 0.25
    const matCost = Math.max(0, pu - eqCost - moCost)
    return [
      { nombre: "Maquinaria Pesada / Equipo de Excavación", tipo: "equipo", unidad: "h", cantidad: Number((eqCost / 30.0).toFixed(4)), precio: 30.00 },
      { nombre: "Operador de Maquinaria / Peón de apoyo", tipo: "mano_de_obra", unidad: "h", cantidad: Number((moCost / 4.20).toFixed(4)), precio: 4.20 },
      ...(matCost > 0 ? [{ nombre: "Material granular / Señalización", tipo: "material" as const, unidad: und, cantidad: 1.0, precio: Number(matCost.toFixed(2)) }] : [])
    ]
  }

  // Estructura de construcción civil típica: 50% materiales, 35% mano de obra, 15% equipos
  const matTarget = pu * 0.50
  const moTarget = pu * 0.35
  const eqTarget = Math.max(0.01, pu - matTarget - moTarget)

  return [
    { nombre: `Materiales principales para ${rubro.nombre_rubro.slice(0, 40)}`, tipo: "material", unidad: und, cantidad: 1.0, precio: Number(matTarget.toFixed(2)) },
    { nombre: "Cuadrilla de Albañilería (MDT / CCEC)", tipo: "mano_de_obra", unidad: "h", cantidad: Number((moTarget / 4.20).toFixed(4)), precio: 4.20 },
    { nombre: "Herramientas y Equipo de Obra", tipo: "equipo", unidad: "h", cantidad: Number((eqTarget / 2.50).toFixed(4)), precio: 2.50 },
  ]
}

// Sincroniza un rubro individual de presupuesto_rubros insertando sus insumos en presupuesto_rubro_insumos
export async function syncInsumosForPresupuestoRubro(
  supabase: any,
  presRubro: {
    id: string
    codigo_rubro?: string
    nombre_rubro: string
    unidad?: string
    precio_unitario_snapshot?: number
  }
) {
  if (!presRubro?.id) return { success: false, count: 0 }

  // 1. Verificar si ya tiene insumos
  const { data: existingInsumos } = await supabase
    .from('presupuesto_rubro_insumos')
    .select('id')
    .eq('presupuesto_rubro_id', presRubro.id)

  if (existingInsumos && existingInsumos.length > 0) {
    return { success: true, count: existingInsumos.length, alreadyExisted: true }
  }

  // 2. Obtener la receta correspondiente (canónica o heurística)
  const code = (presRubro.codigo_rubro || '').trim()
  let recipe = CANONICAL_APU_RECIPES[code]

  if (!recipe || recipe.length === 0) {
    recipe = generateHeuristicRecipe({
      codigo_rubro: presRubro.codigo_rubro,
      nombre_rubro: presRubro.nombre_rubro,
      unidad: presRubro.unidad || 'u',
      precio_unitario_snapshot: Number(presRubro.precio_unitario_snapshot) || 10
    })
  }

  // 3. Para cada insumo en la receta, encontrarlo en la tabla 'insumos' o crearlo
  const insumosToInsert: Array<{
    presupuesto_rubro_id: string
    insumo_id: string
    cantidad: number
    precio_sin_iva_snapshot: number
  }> = []

  for (const item of recipe) {
    // Buscar si existe en insumos
    let insumoId: string | null = null

    const { data: matched } = await supabase
      .from('insumos')
      .select('id, precio_sin_iva')
      .ilike('nombre', item.nombre.trim())
      .limit(1)

    if (matched && matched.length > 0) {
      insumoId = matched[0].id
    } else {
      // Crear el insumo canónico en el catálogo
      const nuevoCodigo = item.codigo || `INS-${Math.floor(1000 + Math.random() * 9000)}`
      const { data: created, error: createErr } = await supabase
        .from('insumos')
        .insert([{
          codigo: nuevoCodigo,
          nombre: item.nombre,
          tipo: item.tipo,
          unidad: item.unidad,
          precio_sin_iva: item.precio,
          is_global: true,
          es_maestro: false
        }])
        .select('id')
        .single()

      if (!createErr && created) {
        insumoId = created.id
      }
    }

    if (insumoId) {
      insumosToInsert.push({
        presupuesto_rubro_id: presRubro.id,
        insumo_id: insumoId,
        cantidad: item.cantidad,
        precio_sin_iva_snapshot: item.precio
      })
    }
  }

  // 4. Insertar en presupuesto_rubro_insumos
  if (insumosToInsert.length > 0) {
    const { error: insErr } = await supabase
      .from('presupuesto_rubro_insumos')
      .insert(insumosToInsert)

    if (insErr) {
      console.error("Error al insertar insumos para rubro:", presRubro.id, insErr)
      return { success: false, error: insErr.message }
    }
  }

  return { success: true, count: insumosToInsert.length }
}

// Sincroniza TODOS los rubros de un presupuesto que no tengan insumos
export async function syncAllInsumosForPresupuesto(supabase: any, presupuestoId: string) {
  if (!presupuestoId) return { syncedCount: 0 }

  const { data: rubros, error } = await supabase
    .from('presupuesto_rubros')
    .select('id, codigo_rubro, nombre_rubro, unidad, precio_unitario_snapshot')
    .eq('presupuesto_id', presupuestoId)

  if (error || !rubros) return { syncedCount: 0 }

  let syncedCount = 0
  for (const r of rubros) {
    const res = await syncInsumosForPresupuestoRubro(supabase, r)
    if (res.success && !res.alreadyExisted) {
      syncedCount++
    }
  }

  return { syncedCount, totalRubros: rubros.length }
}
