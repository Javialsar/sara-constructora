/**
 * CATÁLOGO OFICIAL: 100+ COMBINACIONES DE COLOR DE CANVA
 * Extraídas y estructuradas con cuartetos cromáticos (60-30-10 + Texto)
 * Fuente: Canva Design School (https://www.canva.com/es_mx/aprende/100-combinaciones-colores-como-aplicarlas-disenos/)
 */

export interface CanvaPaletteItem {
  id: number;
  nombre: string;
  nombreEs: string;
  categoria: string;
  color1: string; // Fondo Base Dominante (60%)
  color2: string; // Superficie / Paneles / Cards (30%)
  color3: string; // Acento / Botones Primarios CTAs (10%)
  color4: string; // Texto y Contraste de Lectura
  hexArray: [string, string, string, string];
}

export const CANVA_100_PALETTES: CanvaPaletteItem[] = [
  {
    "id": 1,
    "nombre": "Fresh and bright",
    "nombreEs": "Fresco y Brillante",
    "categoria": "Naturaleza",
    "color1": "#f98866",
    "color2": "#ff420e",
    "color3": "#80bd9e",
    "color4": "#89da59",
    "hexArray": [
      "#f98866",
      "#ff420e",
      "#80bd9e",
      "#89da59"
    ]
  },
  {
    "id": 2,
    "nombre": "Subdued and proffesional",
    "nombreEs": "Sobrio y Profesional",
    "categoria": "Corporativo & Moderno",
    "color1": "#90afc5",
    "color2": "#336b87",
    "color3": "#2a3132",
    "color4": "#763626",
    "hexArray": [
      "#90afc5",
      "#336b87",
      "#2a3132",
      "#763626"
    ]
  },
  {
    "id": 3,
    "nombre": "Dark and earthy",
    "nombreEs": "Oscuro y Terrenal",
    "categoria": "Naturaleza",
    "color1": "#46211a",
    "color2": "#693d3d",
    "color3": "#ba5536",
    "color4": "#a43820",
    "hexArray": [
      "#46211a",
      "#693d3d",
      "#ba5536",
      "#a43820"
    ]
  },
  {
    "id": 4,
    "nombre": "Crisp and dramatic",
    "nombreEs": "Nítido y Dramático",
    "categoria": "Elegancia & Joya",
    "color1": "#505160",
    "color2": "#68829e",
    "color3": "#aebd38",
    "color4": "#598234",
    "hexArray": [
      "#505160",
      "#68829e",
      "#aebd38",
      "#598234"
    ]
  },
  {
    "id": 5,
    "nombre": "Cool blues",
    "nombreEs": "Azules Frescos",
    "categoria": "Corporativo & Moderno",
    "color1": "#003b46",
    "color2": "#07575b",
    "color3": "#66a5ad",
    "color4": "#c4dfe6",
    "hexArray": [
      "#003b46",
      "#07575b",
      "#66a5ad",
      "#c4dfe6"
    ]
  },
  {
    "id": 6,
    "nombre": "Outdoorsy and Natural",
    "nombreEs": "Rústico y Natural",
    "categoria": "Naturaleza",
    "color1": "#2e4600",
    "color2": "#486b00",
    "color3": "#a2c523",
    "color4": "#7d4427",
    "hexArray": [
      "#2e4600",
      "#486b00",
      "#a2c523",
      "#7d4427"
    ]
  },
  {
    "id": 7,
    "nombre": "Watery blue-greens",
    "nombreEs": "Verdes Azulados Acuáticos",
    "categoria": "Naturaleza",
    "color1": "#021c1e",
    "color2": "#004445",
    "color3": "#2c7873",
    "color4": "#6fb98f",
    "hexArray": [
      "#021c1e",
      "#004445",
      "#2c7873",
      "#6fb98f"
    ]
  },
  {
    "id": 8,
    "nombre": "Primary colors with a vibrant twist",
    "nombreEs": "Primarios Vibrantes",
    "categoria": "Creativo & Pop",
    "color1": "#375e97",
    "color2": "#fb6542",
    "color3": "#ffbb00",
    "color4": "#3f681c",
    "hexArray": [
      "#375e97",
      "#fb6542",
      "#ffbb00",
      "#3f681c"
    ]
  },
  {
    "id": 9,
    "nombre": "Refreshing and pretty",
    "nombreEs": "Refrescante y Bonito",
    "categoria": "Alimentos & Bebidas",
    "color1": "#98dbc6",
    "color2": "#5bc8ac",
    "color3": "#e6d72a",
    "color4": "#f18d9e",
    "hexArray": [
      "#98dbc6",
      "#5bc8ac",
      "#e6d72a",
      "#f18d9e"
    ]
  },
  {
    "id": 10,
    "nombre": "Playful greens and blues",
    "nombreEs": "Verdes y Azules Lúdicos",
    "categoria": "Creativo & Pop",
    "color1": "#324851",
    "color2": "#86ac41",
    "color3": "#34675c",
    "color4": "#7da3a1",
    "hexArray": [
      "#324851",
      "#86ac41",
      "#34675c",
      "#7da3a1"
    ]
  },
  {
    "id": 11,
    "nombre": "Fresh and energetic",
    "nombreEs": "Fresco y Enérgico",
    "categoria": "Naturaleza",
    "color1": "#4cb5f5",
    "color2": "#b7b8b6",
    "color3": "#34675c",
    "color4": "#b3c100",
    "hexArray": [
      "#4cb5f5",
      "#b7b8b6",
      "#34675c",
      "#b3c100"
    ]
  },
  {
    "id": 12,
    "nombre": "Surf and turf",
    "nombreEs": "Mar y Tierra",
    "categoria": "Viajes & Cálidos",
    "color1": "#f4cc70",
    "color2": "#de7a22",
    "color3": "#20948b",
    "color4": "#6ab187",
    "hexArray": [
      "#f4cc70",
      "#de7a22",
      "#20948b",
      "#6ab187"
    ]
  },
  {
    "id": 13,
    "nombre": "Autumn in vermont",
    "nombreEs": "Otoño en Vermont",
    "categoria": "Naturaleza",
    "color1": "#8d230f",
    "color2": "#1e434c",
    "color3": "#9b4f0f",
    "color4": "#c99e10",
    "hexArray": [
      "#8d230f",
      "#1e434c",
      "#9b4f0f",
      "#c99e10"
    ]
  },
  {
    "id": 14,
    "nombre": "Icy blues and grays",
    "nombreEs": "Azules Glaciares y Grises",
    "categoria": "Corporativo & Moderno",
    "color1": "#f1f1f2",
    "color2": "#bcbabe",
    "color3": "#a1d6e2",
    "color4": "#1995ad",
    "hexArray": [
      "#f1f1f2",
      "#bcbabe",
      "#a1d6e2",
      "#1995ad"
    ]
  },
  {
    "id": 15,
    "nombre": "Birds and berries",
    "nombreEs": "Bayas y Naturaleza Silvestre",
    "categoria": "Alimentos & Bebidas",
    "color1": "#9a9eab",
    "color2": "#5d535e",
    "color3": "#ec96a4",
    "color4": "#dfe166",
    "hexArray": [
      "#9a9eab",
      "#5d535e",
      "#ec96a4",
      "#dfe166"
    ]
  },
  {
    "id": 16,
    "nombre": "Day and night",
    "nombreEs": "Día y Noche",
    "categoria": "Elegancia & Joya",
    "color1": "#011a27",
    "color2": "#063852",
    "color3": "#f0810f",
    "color4": "#e6df44",
    "hexArray": [
      "#011a27",
      "#063852",
      "#f0810f",
      "#e6df44"
    ]
  },
  {
    "id": 17,
    "nombre": "Stylish and retro",
    "nombreEs": "Elegante y Retro",
    "categoria": "Vintage & Estilo",
    "color1": "#75b1a9",
    "color2": "#d9b44a",
    "color3": "#4f6457",
    "color4": "#acd0c0",
    "hexArray": [
      "#75b1a9",
      "#d9b44a",
      "#4f6457",
      "#acd0c0"
    ]
  },
  {
    "id": 18,
    "nombre": "Shades of citrus",
    "nombreEs": "Gama Cítrica",
    "categoria": "Alimentos & Bebidas",
    "color1": "#eb8a44",
    "color2": "#f9dc24",
    "color3": "#4b7447",
    "color4": "#8eba43",
    "hexArray": [
      "#eb8a44",
      "#f9dc24",
      "#4b7447",
      "#8eba43"
    ]
  },
  {
    "id": 19,
    "nombre": "Sunset to dusk",
    "nombreEs": "Atardecer y Penumbra",
    "categoria": "Viajes & Cálidos",
    "color1": "#363237",
    "color2": "#2d4262",
    "color3": "#73605b",
    "color4": "#d09683",
    "hexArray": [
      "#363237",
      "#2d4262",
      "#73605b",
      "#d09683"
    ]
  },
  {
    "id": 20,
    "nombre": "Bright and tropical",
    "nombreEs": "Brillante y Tropical",
    "categoria": "Viajes & Cálidos",
    "color1": "#f52549",
    "color2": "#fa6775",
    "color3": "#ffd64d",
    "color4": "#9bc01c",
    "hexArray": [
      "#f52549",
      "#fa6775",
      "#ffd64d",
      "#9bc01c"
    ]
  },
  {
    "id": 21,
    "nombre": "Warm naturals",
    "nombreEs": "Naturales Cálidos",
    "categoria": "Naturaleza",
    "color1": "#2e2300",
    "color2": "#6e6702",
    "color3": "#c05805",
    "color4": "#db9501",
    "hexArray": [
      "#2e2300",
      "#6e6702",
      "#c05805",
      "#db9501"
    ]
  },
  {
    "id": 22,
    "nombre": "Bold berries",
    "nombreEs": "Bayas Intensas / Conchovino",
    "categoria": "Alimentos & Bebidas",
    "color1": "#50312f",
    "color2": "#cb0000",
    "color3": "#e4ea8c",
    "color4": "#3f6c45",
    "hexArray": [
      "#50312f",
      "#cb0000",
      "#e4ea8c",
      "#3f6c45"
    ]
  },
  {
    "id": 23,
    "nombre": "Summer sunflower",
    "nombreEs": "Girasol de Verano",
    "categoria": "Naturaleza",
    "color1": "#34888c",
    "color2": "#7caa2d",
    "color3": "#f5e356",
    "color4": "#cb6318",
    "hexArray": [
      "#34888c",
      "#7caa2d",
      "#f5e356",
      "#cb6318"
    ]
  },
  {
    "id": 24,
    "nombre": "Modern and crisp",
    "nombreEs": "Moderno y Nítido",
    "categoria": "Corporativo & Moderno",
    "color1": "#0f1b07",
    "color2": "#ffffff",
    "color3": "#5c821a",
    "color4": "#c6d166",
    "hexArray": [
      "#0f1b07",
      "#ffffff",
      "#5c821a",
      "#c6d166"
    ]
  },
  {
    "id": 25,
    "nombre": "Timeless and nautical",
    "nombreEs": "Náutico Clásico",
    "categoria": "Corporativo & Moderno",
    "color1": "#00293c",
    "color2": "#1e656d",
    "color3": "#f1f3ce",
    "color4": "#f62a00",
    "hexArray": [
      "#00293c",
      "#1e656d",
      "#f1f3ce",
      "#f62a00"
    ]
  },
  {
    "id": 26,
    "nombre": "Neutral and versatile",
    "nombreEs": "Neutro y Versátil",
    "categoria": "Corporativo & Moderno",
    "color1": "#626d71",
    "color2": "#cdcdc0",
    "color3": "#ddbc95",
    "color4": "#b38867",
    "hexArray": [
      "#626d71",
      "#cdcdc0",
      "#ddbc95",
      "#b38867"
    ]
  },
  {
    "id": 27,
    "nombre": "Cheerful brights",
    "nombreEs": "Luminosos Alegres",
    "categoria": "Creativo & Pop",
    "color1": "#258039",
    "color2": "#f5be41",
    "color3": "#31a9b8",
    "color4": "#cf3721",
    "hexArray": [
      "#258039",
      "#f5be41",
      "#31a9b8",
      "#cf3721"
    ]
  },
  {
    "id": 28,
    "nombre": "Garden fresh",
    "nombreEs": "Fresco de Jardín",
    "categoria": "Naturaleza",
    "color1": "#ee693f",
    "color2": "#f69454",
    "color3": "#fcfdfe",
    "color4": "#739f3d",
    "hexArray": [
      "#ee693f",
      "#f69454",
      "#fcfdfe",
      "#739f3d"
    ]
  },
  {
    "id": 29,
    "nombre": "Summer barbeque",
    "nombreEs": "Barbacoa de Verano",
    "categoria": "Alimentos & Bebidas",
    "color1": "#b9d9c3",
    "color2": "#752a07",
    "color3": "#fbcb7b",
    "color4": "#eb5e30",
    "hexArray": [
      "#b9d9c3",
      "#752a07",
      "#fbcb7b",
      "#eb5e30"
    ]
  },
  {
    "id": 30,
    "nombre": "Berry blues",
    "nombreEs": "Arándanos y Azules",
    "categoria": "Alimentos & Bebidas",
    "color1": "#1e1f26",
    "color2": "#283655",
    "color3": "#4d648d",
    "color4": "#d0e1f9",
    "hexArray": [
      "#1e1f26",
      "#283655",
      "#4d648d",
      "#d0e1f9"
    ]
  },
  {
    "id": 31,
    "nombre": "Lemonade stand",
    "nombreEs": "Puesto de Limonada",
    "categoria": "Alimentos & Bebidas",
    "color1": "#f70025",
    "color2": "#f7efe2",
    "color3": "#f25c00",
    "color4": "#f9a603",
    "hexArray": [
      "#f70025",
      "#f7efe2",
      "#f25c00",
      "#f9a603"
    ]
  },
  {
    "id": 32,
    "nombre": "Serene and spa like",
    "nombreEs": "Sereno y Spa",
    "categoria": "Bienestar & Zen",
    "color1": "#a1be95",
    "color2": "#e2dfa2",
    "color3": "#92aac7",
    "color4": "#ed5752",
    "hexArray": [
      "#a1be95",
      "#e2dfa2",
      "#92aac7",
      "#ed5752"
    ]
  },
  {
    "id": 33,
    "nombre": "Fun and tropical",
    "nombreEs": "Divertido y Tropical",
    "categoria": "Viajes & Cálidos",
    "color1": "#4897d8",
    "color2": "#ffdb5c",
    "color3": "#fa6e59",
    "color4": "#f8a055",
    "hexArray": [
      "#4897d8",
      "#ffdb5c",
      "#fa6e59",
      "#f8a055"
    ]
  },
  {
    "id": 34,
    "nombre": "Spicy neutrals",
    "nombreEs": "Neutros Especiados",
    "categoria": "Alimentos & Bebidas",
    "color1": "#af4425",
    "color2": "#662e1c",
    "color3": "#ebdcb2",
    "color4": "#c9a66b",
    "hexArray": [
      "#af4425",
      "#662e1c",
      "#ebdcb2",
      "#c9a66b"
    ]
  },
  {
    "id": 35,
    "nombre": "Pastels",
    "nombreEs": "Tonos Pastel",
    "categoria": "Bienestar & Zen",
    "color1": "#c1e1dc",
    "color2": "#ffccac",
    "color3": "#ffeb94",
    "color4": "#fdd475",
    "hexArray": [
      "#c1e1dc",
      "#ffccac",
      "#ffeb94",
      "#fdd475"
    ]
  },
  {
    "id": 36,
    "nombre": "Bold and cultured",
    "nombreEs": "Audaz y Cosmopolita",
    "categoria": "Corporativo & Moderno",
    "color1": "#4c3f54",
    "color2": "#d13525",
    "color3": "#f2c057",
    "color4": "#486824",
    "hexArray": [
      "#4c3f54",
      "#d13525",
      "#f2c057",
      "#486824"
    ]
  },
  {
    "id": 37,
    "nombre": "Sunny citrus",
    "nombreEs": "Cítrico Soleado",
    "categoria": "Alimentos & Bebidas",
    "color1": "#faaf08",
    "color2": "#fa812f",
    "color3": "#fa4032",
    "color4": "#fef3e2",
    "hexArray": [
      "#faaf08",
      "#fa812f",
      "#fa4032",
      "#fef3e2"
    ]
  },
  {
    "id": 38,
    "nombre": "Crisp complementary colors",
    "nombreEs": "Complementarios Nítidos",
    "categoria": "Creativo & Pop",
    "color1": "#f4ec6a",
    "color2": "#bbcf4a",
    "color3": "#e73f0b",
    "color4": "#a11f0c",
    "hexArray": [
      "#f4ec6a",
      "#bbcf4a",
      "#e73f0b",
      "#a11f0c"
    ]
  },
  {
    "id": 39,
    "nombre": "Warm and rustic",
    "nombreEs": "Cálido y Rústico",
    "categoria": "Naturaleza",
    "color1": "#fef2e4",
    "color2": "#fd974f",
    "color3": "#c60000",
    "color4": "#805a3b",
    "hexArray": [
      "#fef2e4",
      "#fd974f",
      "#c60000",
      "#805a3b"
    ]
  },
  {
    "id": 40,
    "nombre": "Neon night",
    "nombreEs": "Noche Neón",
    "categoria": "Elegancia & Joya",
    "color1": "#f77604",
    "color2": "#b8d20b",
    "color3": "#f56c57",
    "color4": "#231b12",
    "hexArray": [
      "#f77604",
      "#b8d20b",
      "#f56c57",
      "#231b12"
    ]
  },
  {
    "id": 41,
    "nombre": "Jewel tones",
    "nombreEs": "Tonos Joya Preciosa",
    "categoria": "Elegancia & Joya",
    "color1": "#7f152e",
    "color2": "#d61800",
    "color3": "#edae01",
    "color4": "#e94f08",
    "hexArray": [
      "#7f152e",
      "#d61800",
      "#edae01",
      "#e94f08"
    ]
  },
  {
    "id": 42,
    "nombre": "Polished and inviting",
    "nombreEs": "Pulcro y Acogedor",
    "categoria": "Corporativo & Moderno",
    "color1": "#eae2d6",
    "color2": "#d5c3aa",
    "color3": "#867666",
    "color4": "#e1b80d",
    "hexArray": [
      "#eae2d6",
      "#d5c3aa",
      "#867666",
      "#e1b80d"
    ]
  },
  {
    "id": 43,
    "nombre": "Fresh greens",
    "nombreEs": "Verdes Frescos",
    "categoria": "Naturaleza",
    "color1": "#265c00",
    "color2": "#68a225",
    "color3": "#b3de81",
    "color4": "#fdffff",
    "hexArray": [
      "#265c00",
      "#68a225",
      "#b3de81",
      "#fdffff"
    ]
  },
  {
    "id": 44,
    "nombre": "Wintery reds",
    "nombreEs": "Rojos Invernales / Rubí",
    "categoria": "Elegancia & Joya",
    "color1": "#a10115",
    "color2": "#d72c16",
    "color3": "#f0efea",
    "color4": "#c0b2b5",
    "hexArray": [
      "#a10115",
      "#d72c16",
      "#f0efea",
      "#c0b2b5"
    ]
  },
  {
    "id": 45,
    "nombre": "Summer fiesta",
    "nombreEs": "Fiesta de Verano",
    "categoria": "Creativo & Pop",
    "color1": "#c7db00",
    "color2": "#7aa802",
    "color3": "#f78b2d",
    "color4": "#e4b600",
    "hexArray": [
      "#c7db00",
      "#7aa802",
      "#f78b2d",
      "#e4b600"
    ]
  },
  {
    "id": 46,
    "nombre": "Chocolaty browns",
    "nombreEs": "Chocolates y Cafés",
    "categoria": "Alimentos & Bebidas",
    "color1": "#301b28",
    "color2": "#523634",
    "color3": "#b6452c",
    "color4": "#ddc5a2",
    "hexArray": [
      "#301b28",
      "#523634",
      "#b6452c",
      "#ddc5a2"
    ]
  },
  {
    "id": 47,
    "nombre": "Naturally elegant",
    "nombreEs": "Naturalmente Elegante",
    "categoria": "Elegancia & Joya",
    "color1": "#ebdf00",
    "color2": "#7e7b15",
    "color3": "#563e20",
    "color4": "#b38540",
    "hexArray": [
      "#ebdf00",
      "#7e7b15",
      "#563e20",
      "#b38540"
    ]
  },
  {
    "id": 48,
    "nombre": "Cozy and warm",
    "nombreEs": "Cozy and warm",
    "categoria": "Viajes & Cálidos",
    "color1": "#662225",
    "color2": "#b51d0a",
    "color3": "#ead39c",
    "color4": "#7d5e3c",
    "hexArray": [
      "#662225",
      "#b51d0a",
      "#ead39c",
      "#7d5e3c"
    ]
  },
  {
    "id": 49,
    "nombre": "Violet sunset",
    "nombreEs": "Violet sunset",
    "categoria": "Naturaleza",
    "color1": "#4b4345",
    "color2": "#556dac",
    "color3": "#f79b77",
    "color4": "#755248",
    "hexArray": [
      "#4b4345",
      "#556dac",
      "#f79b77",
      "#755248"
    ]
  },
  {
    "id": 50,
    "nombre": "Strawberries and cream",
    "nombreEs": "Strawberries and cream",
    "categoria": "Viajes & Cálidos",
    "color1": "#d8412f",
    "color2": "#fe7a47",
    "color3": "#fcfdfe",
    "color4": "#f5ca99",
    "hexArray": [
      "#d8412f",
      "#fe7a47",
      "#fcfdfe",
      "#f5ca99"
    ]
  },
  {
    "id": 51,
    "nombre": "Grecian holiday",
    "nombreEs": "Grecian holiday",
    "categoria": "Corporativo & Moderno",
    "color1": "#2988bc",
    "color2": "#2f496e",
    "color3": "#f4eade",
    "color4": "#ed8c72",
    "hexArray": [
      "#2988bc",
      "#2f496e",
      "#f4eade",
      "#ed8c72"
    ]
  },
  {
    "id": 52,
    "nombre": "Bold and basic",
    "nombreEs": "Bold and basic",
    "categoria": "Viajes & Cálidos",
    "color1": "#000b29",
    "color2": "#d70026",
    "color3": "#f8f5f2",
    "color4": "#edb83d",
    "hexArray": [
      "#000b29",
      "#d70026",
      "#f8f5f2",
      "#edb83d"
    ]
  },
  {
    "id": 53,
    "nombre": "Vineyard neutrals",
    "nombreEs": "Vineyard neutrals",
    "categoria": "Corporativo & Moderno",
    "color1": "#1e0000",
    "color2": "#500805",
    "color3": "#9d331f",
    "color4": "#bc6d4f",
    "hexArray": [
      "#1e0000",
      "#500805",
      "#9d331f",
      "#bc6d4f"
    ]
  },
  {
    "id": 54,
    "nombre": "Modern and urban",
    "nombreEs": "Modern and urban",
    "categoria": "Viajes & Cálidos",
    "color1": "#f9ba32",
    "color2": "#426e86",
    "color3": "#f8f1e5",
    "color4": "#2f3131",
    "hexArray": [
      "#f9ba32",
      "#426e86",
      "#f8f1e5",
      "#2f3131"
    ]
  },
  {
    "id": 55,
    "nombre": "Misty greens",
    "nombreEs": "Misty greens",
    "categoria": "Corporativo & Moderno",
    "color1": "#04202c",
    "color2": "#304040",
    "color3": "#5b7065",
    "color4": "#c9d1c8",
    "hexArray": [
      "#04202c",
      "#304040",
      "#5b7065",
      "#c9d1c8"
    ]
  },
  {
    "id": 56,
    "nombre": "Sunkissed village",
    "nombreEs": "Sunkissed village",
    "categoria": "Viajes & Cálidos",
    "color1": "#d24136",
    "color2": "#eb8a3e",
    "color3": "#ebb582",
    "color4": "#785a46",
    "hexArray": [
      "#d24136",
      "#eb8a3e",
      "#ebb582",
      "#785a46"
    ]
  },
  {
    "id": 57,
    "nombre": "Sun and sky",
    "nombreEs": "Sun and sky",
    "categoria": "Viajes & Cálidos",
    "color1": "#217ca3",
    "color2": "#e29930",
    "color3": "#32384d",
    "color4": "#211f30",
    "hexArray": [
      "#217ca3",
      "#e29930",
      "#32384d",
      "#211f30"
    ]
  },
  {
    "id": 58,
    "nombre": "Aqua blues",
    "nombreEs": "Aqua blues",
    "categoria": "Corporativo & Moderno",
    "color1": "#004d47",
    "color2": "#128277",
    "color3": "#52958b",
    "color4": "#b9c4c9",
    "hexArray": [
      "#004d47",
      "#128277",
      "#52958b",
      "#b9c4c9"
    ]
  },
  {
    "id": 59,
    "nombre": "Urban oasis",
    "nombreEs": "Urban oasis",
    "categoria": "Corporativo & Moderno",
    "color1": "#506d2f",
    "color2": "#2a2922",
    "color3": "#f3ebdd",
    "color4": "#7d5642",
    "hexArray": [
      "#506d2f",
      "#2a2922",
      "#f3ebdd",
      "#7d5642"
    ]
  },
  {
    "id": 60,
    "nombre": "Candy coated brights",
    "nombreEs": "Candy coated brights",
    "categoria": "Viajes & Cálidos",
    "color1": "#f47d4a",
    "color2": "#e1315b",
    "color3": "#ffec5c",
    "color4": "#008dcb",
    "hexArray": [
      "#f47d4a",
      "#e1315b",
      "#ffec5c",
      "#008dcb"
    ]
  },
  {
    "id": 61,
    "nombre": "Muted and antique",
    "nombreEs": "Muted and antique",
    "categoria": "Viajes & Cálidos",
    "color1": "#a4cabc",
    "color2": "#eab364",
    "color3": "#b2473e",
    "color4": "#acbd78",
    "hexArray": [
      "#a4cabc",
      "#eab364",
      "#b2473e",
      "#acbd78"
    ]
  },
  {
    "id": 62,
    "nombre": "Classy and timeless",
    "nombreEs": "Classy and timeless",
    "categoria": "Corporativo & Moderno",
    "color1": "#16253d",
    "color2": "#002c54",
    "color3": "#efb509",
    "color4": "#cd7213",
    "hexArray": [
      "#16253d",
      "#002c54",
      "#efb509",
      "#cd7213"
    ]
  },
  {
    "id": 63,
    "nombre": "Cosmopolitan",
    "nombreEs": "Cosmopolitan",
    "categoria": "Viajes & Cálidos",
    "color1": "#8593ae",
    "color2": "#5a4e4d",
    "color3": "#7e675e",
    "color4": "#dda288",
    "hexArray": [
      "#8593ae",
      "#5a4e4d",
      "#7e675e",
      "#dda288"
    ]
  },
  {
    "id": 64,
    "nombre": "Cheerful and friendly",
    "nombreEs": "Cheerful and friendly",
    "categoria": "Viajes & Cálidos",
    "color1": "#2b616d",
    "color2": "#b2dbd5",
    "color3": "#ffffff",
    "color4": "#fa8d62",
    "hexArray": [
      "#2b616d",
      "#b2dbd5",
      "#ffffff",
      "#fa8d62"
    ]
  },
  {
    "id": 65,
    "nombre": "Nightlife",
    "nombreEs": "Nightlife",
    "categoria": "Viajes & Cálidos",
    "color1": "#00cffa",
    "color2": "#ff0038",
    "color3": "#ffce38",
    "color4": "#020509",
    "hexArray": [
      "#00cffa",
      "#ff0038",
      "#ffce38",
      "#020509"
    ]
  },
  {
    "id": 66,
    "nombre": "Coastal",
    "nombreEs": "Coastal",
    "categoria": "Viajes & Cálidos",
    "color1": "#a5c3cf",
    "color2": "#f3d3b8",
    "color3": "#e59d5c",
    "color4": "#a99f3c",
    "hexArray": [
      "#a5c3cf",
      "#f3d3b8",
      "#e59d5c",
      "#a99f3c"
    ]
  },
  {
    "id": 67,
    "nombre": "Maritime brights",
    "nombreEs": "Maritime brights",
    "categoria": "Corporativo & Moderno",
    "color1": "#257985",
    "color2": "#5ea8a7",
    "color3": "#ffffff",
    "color4": "#ff4447",
    "hexArray": [
      "#257985",
      "#5ea8a7",
      "#ffffff",
      "#ff4447"
    ]
  },
  {
    "id": 68,
    "nombre": "Vintage charm",
    "nombreEs": "Vintage charm",
    "categoria": "Viajes & Cálidos",
    "color1": "#fcc875",
    "color2": "#baa896",
    "color3": "#e6ccb5",
    "color4": "#e38b75",
    "hexArray": [
      "#fcc875",
      "#baa896",
      "#e6ccb5",
      "#e38b75"
    ]
  },
  {
    "id": 69,
    "nombre": "Understated and versatile",
    "nombreEs": "Understated and versatile",
    "categoria": "Viajes & Cálidos",
    "color1": "#335252",
    "color2": "#d4dde1",
    "color3": "#aa4b41",
    "color4": "#2d3033",
    "hexArray": [
      "#335252",
      "#d4dde1",
      "#aa4b41",
      "#2d3033"
    ]
  },
  {
    "id": 70,
    "nombre": "Artic sunrise",
    "nombreEs": "Artic sunrise",
    "categoria": "Viajes & Cálidos",
    "color1": "#ffccbb",
    "color2": "#6eb5c0",
    "color3": "#006c84",
    "color4": "#e2e8e4",
    "hexArray": [
      "#ffccbb",
      "#6eb5c0",
      "#006c84",
      "#e2e8e4"
    ]
  },
  {
    "id": 71,
    "nombre": "Mediterranean afternoon",
    "nombreEs": "Mediterranean afternoon",
    "categoria": "Viajes & Cálidos",
    "color1": "#8c0004",
    "color2": "#c8000a",
    "color3": "#e8a735",
    "color4": "#e2c499",
    "hexArray": [
      "#8c0004",
      "#c8000a",
      "#e8a735",
      "#e2c499"
    ]
  },
  {
    "id": 72,
    "nombre": "Hazy grays",
    "nombreEs": "Hazy grays",
    "categoria": "Corporativo & Moderno",
    "color1": "#2c4a52",
    "color2": "#537072",
    "color3": "#8e9b97",
    "color4": "#f4ebdb",
    "hexArray": [
      "#2c4a52",
      "#537072",
      "#8e9b97",
      "#f4ebdb"
    ]
  },
  {
    "id": 73,
    "nombre": "City sights",
    "nombreEs": "City sights",
    "categoria": "Viajes & Cálidos",
    "color1": "#c5001a",
    "color2": "#e4e3db",
    "color3": "#113743",
    "color4": "#c5beba",
    "hexArray": [
      "#c5001a",
      "#e4e3db",
      "#113743",
      "#c5beba"
    ]
  },
  {
    "id": 74,
    "nombre": "Retro and relaxing",
    "nombreEs": "Retro and relaxing",
    "categoria": "Viajes & Cálidos",
    "color1": "#d35c37",
    "color2": "#bf9a77",
    "color3": "#d6c6b9",
    "color4": "#97b8c2",
    "hexArray": [
      "#d35c37",
      "#bf9a77",
      "#d6c6b9",
      "#97b8c2"
    ]
  },
  {
    "id": 75,
    "nombre": "Green fields",
    "nombreEs": "Green fields",
    "categoria": "Viajes & Cálidos",
    "color1": "#919636",
    "color2": "#524a3a",
    "color3": "#fffae1",
    "color4": "#5a5f37",
    "hexArray": [
      "#919636",
      "#524a3a",
      "#fffae1",
      "#5a5f37"
    ]
  },
  {
    "id": 76,
    "nombre": "Distintive and unexpected",
    "nombreEs": "Distintive and unexpected",
    "categoria": "Viajes & Cálidos",
    "color1": "#52908b",
    "color2": "#e5e2ca",
    "color3": "#ddbc95",
    "color4": "#e7472e",
    "hexArray": [
      "#52908b",
      "#e5e2ca",
      "#ddbc95",
      "#e7472e"
    ]
  },
  {
    "id": 77,
    "nombre": "Sleek and modern",
    "nombreEs": "Sleek and modern",
    "categoria": "Viajes & Cálidos",
    "color1": "#2f2e33",
    "color2": "#d5d6d2",
    "color3": "#ffffff",
    "color4": "#3a5199",
    "hexArray": [
      "#2f2e33",
      "#d5d6d2",
      "#ffffff",
      "#3a5199"
    ]
  },
  {
    "id": 78,
    "nombre": "Orange accent",
    "nombreEs": "Orange accent",
    "categoria": "Viajes & Cálidos",
    "color1": "#756867",
    "color2": "#dad9d3",
    "color3": "#353c3f",
    "color4": "#ff8d3f",
    "hexArray": [
      "#756867",
      "#dad9d3",
      "#353c3f",
      "#ff8d3f"
    ]
  },
  {
    "id": 79,
    "nombre": "Beyond black and white",
    "nombreEs": "Beyond black and white",
    "categoria": "Viajes & Cálidos",
    "color1": "#31a2ac",
    "color2": "#af1c1c",
    "color3": "#f0eff0",
    "color4": "#2f2f28",
    "hexArray": [
      "#31a2ac",
      "#af1c1c",
      "#f0eff0",
      "#2f2f28"
    ]
  },
  {
    "id": 80,
    "nombre": "Shabby chic neutrals",
    "nombreEs": "Shabby chic neutrals",
    "categoria": "Viajes & Cálidos",
    "color1": "#6c5f5b",
    "color2": "#cdab81",
    "color3": "#dac3b3",
    "color4": "#4f4a45",
    "hexArray": [
      "#6c5f5b",
      "#cdab81",
      "#dac3b3",
      "#4f4a45"
    ]
  },
  {
    "id": 81,
    "nombre": "Warm and cool",
    "nombreEs": "Warm and cool",
    "categoria": "Viajes & Cálidos",
    "color1": "#444c5c",
    "color2": "#ce5a57",
    "color3": "#78a5a3",
    "color4": "#e1b16a",
    "hexArray": [
      "#444c5c",
      "#ce5a57",
      "#78a5a3",
      "#e1b16a"
    ]
  },
  {
    "id": 82,
    "nombre": "Industrial and in control",
    "nombreEs": "Industrial and in control",
    "categoria": "Viajes & Cálidos",
    "color1": "#20232a",
    "color2": "#acbebe",
    "color3": "#f4f4ef",
    "color4": "#a01d26",
    "hexArray": [
      "#20232a",
      "#acbebe",
      "#f4f4ef",
      "#a01d26"
    ]
  },
  {
    "id": 83,
    "nombre": "Autumn oranges and complemtentary neutrals",
    "nombreEs": "Autumn oranges and complemtentary neutrals",
    "categoria": "Viajes & Cálidos",
    "color1": "#d55448",
    "color2": "#ffa577",
    "color3": "#f9f9ff",
    "color4": "#896e69",
    "hexArray": [
      "#d55448",
      "#ffa577",
      "#f9f9ff",
      "#896e69"
    ]
  },
  {
    "id": 84,
    "nombre": "Pool party",
    "nombreEs": "Pool party",
    "categoria": "Corporativo & Moderno",
    "color1": "#344d90",
    "color2": "#5cc5ef",
    "color3": "#ffb745",
    "color4": "#e7552c",
    "hexArray": [
      "#344d90",
      "#5cc5ef",
      "#ffb745",
      "#e7552c"
    ]
  },
  {
    "id": 85,
    "nombre": "Classic metallics",
    "nombreEs": "Classic metallics",
    "categoria": "Viajes & Cálidos",
    "color1": "#080706",
    "color2": "#efefef",
    "color3": "#d1b280",
    "color4": "#594d46",
    "hexArray": [
      "#080706",
      "#efefef",
      "#d1b280",
      "#594d46"
    ]
  },
  {
    "id": 86,
    "nombre": "Subtle and versatile",
    "nombreEs": "Subtle and versatile",
    "categoria": "Viajes & Cálidos",
    "color1": "#5f968e",
    "color2": "#bfdccf",
    "color3": "#e05858",
    "color4": "#d5c9b1",
    "hexArray": [
      "#5f968e",
      "#bfdccf",
      "#e05858",
      "#d5c9b1"
    ]
  },
  {
    "id": 87,
    "nombre": "Professional and traditional",
    "nombreEs": "Professional and traditional",
    "categoria": "Viajes & Cálidos",
    "color1": "#962715",
    "color2": "#ffffff",
    "color3": "#1e1e20",
    "color4": "#bbc3c6",
    "hexArray": [
      "#962715",
      "#ffffff",
      "#1e1e20",
      "#bbc3c6"
    ]
  },
  {
    "id": 88,
    "nombre": "Light and natural",
    "nombreEs": "Light and natural",
    "categoria": "Viajes & Cálidos",
    "color1": "#688b8a",
    "color2": "#a0b084",
    "color3": "#faefd4",
    "color4": "#a57c65",
    "hexArray": [
      "#688b8a",
      "#a0b084",
      "#faefd4",
      "#a57c65"
    ]
  },
  {
    "id": 89,
    "nombre": "Shadowy and dramatic",
    "nombreEs": "Shadowy and dramatic",
    "categoria": "Viajes & Cálidos",
    "color1": "#262f34",
    "color2": "#f34a4a",
    "color3": "#f1d3bc",
    "color4": "#615049",
    "hexArray": [
      "#262f34",
      "#f34a4a",
      "#f1d3bc",
      "#615049"
    ]
  },
  {
    "id": 90,
    "nombre": "Golden afternoon",
    "nombreEs": "Golden afternoon",
    "categoria": "Viajes & Cálidos",
    "color1": "#882426",
    "color2": "#cdbea7",
    "color3": "#323030",
    "color4": "#c29545",
    "hexArray": [
      "#882426",
      "#cdbea7",
      "#323030",
      "#c29545"
    ]
  },
  {
    "id": 91,
    "nombre": "Dark and handsome",
    "nombreEs": "Dark and handsome",
    "categoria": "Naturaleza",
    "color1": "#42313a",
    "color2": "#6c2d2c",
    "color3": "#9f4636",
    "color4": "#f1dcc9",
    "hexArray": [
      "#42313a",
      "#6c2d2c",
      "#9f4636",
      "#f1dcc9"
    ]
  },
  {
    "id": 92,
    "nombre": "Technology meets nature",
    "nombreEs": "Technology meets nature",
    "categoria": "Viajes & Cálidos",
    "color1": "#fbcd4b",
    "color2": "#a3a599",
    "color3": "#282623",
    "color4": "#88a550",
    "hexArray": [
      "#fbcd4b",
      "#a3a599",
      "#282623",
      "#88a550"
    ]
  },
  {
    "id": 93,
    "nombre": "Cheerful blues and pink",
    "nombreEs": "Cheerful blues and pink",
    "categoria": "Viajes & Cálidos",
    "color1": "#ffbebd",
    "color2": "#fcfcfa",
    "color3": "#337bae",
    "color4": "#1a405f",
    "hexArray": [
      "#ffbebd",
      "#fcfcfa",
      "#337bae",
      "#1a405f"
    ]
  },
  {
    "id": 94,
    "nombre": "Exotic and high impact",
    "nombreEs": "Exotic and high impact",
    "categoria": "Viajes & Cálidos",
    "color1": "#0f1f38",
    "color2": "#8e7970",
    "color3": "#f55449",
    "color4": "#1b4b5a",
    "hexArray": [
      "#0f1f38",
      "#8e7970",
      "#f55449",
      "#1b4b5a"
    ]
  },
  {
    "id": 95,
    "nombre": "Back to school",
    "nombreEs": "Back to school",
    "categoria": "Viajes & Cálidos",
    "color1": "#81715e",
    "color2": "#faae3d",
    "color3": "#e38533",
    "color4": "#e4535e",
    "hexArray": [
      "#81715e",
      "#faae3d",
      "#e38533",
      "#e4535e"
    ]
  },
  {
    "id": 96,
    "nombre": "Bright and painterly",
    "nombreEs": "Bright and painterly",
    "categoria": "Viajes & Cálidos",
    "color1": "#061283",
    "color2": "#fd3c3c",
    "color3": "#ffb74c",
    "color4": "#138d90",
    "hexArray": [
      "#061283",
      "#fd3c3c",
      "#ffb74c",
      "#138d90"
    ]
  },
  {
    "id": 97,
    "nombre": "Urban living",
    "nombreEs": "Urban living",
    "categoria": "Viajes & Cálidos",
    "color1": "#dddede",
    "color2": "#232122",
    "color3": "#a5c05b",
    "color4": "#7ba4a8",
    "hexArray": [
      "#dddede",
      "#232122",
      "#a5c05b",
      "#7ba4a8"
    ]
  },
  {
    "id": 98,
    "nombre": "1950s kitchen",
    "nombreEs": "1950s kitchen",
    "categoria": "Viajes & Cálidos",
    "color1": "#b3dbc0",
    "color2": "#fe0000",
    "color3": "#fdf6f6",
    "color4": "#67baca",
    "hexArray": [
      "#b3dbc0",
      "#fe0000",
      "#fdf6f6",
      "#67baca"
    ]
  },
  {
    "id": 99,
    "nombre": "Smoky purples",
    "nombreEs": "Smoky purples",
    "categoria": "Viajes & Cálidos",
    "color1": "#a49592",
    "color2": "#727077",
    "color3": "#eed8c9",
    "color4": "#e99787",
    "hexArray": [
      "#a49592",
      "#727077",
      "#eed8c9",
      "#e99787"
    ]
  },
  {
    "id": 100,
    "nombre": "Trendy and metropolitan",
    "nombreEs": "Trendy and metropolitan",
    "categoria": "Viajes & Cálidos",
    "color1": "#488a99",
    "color2": "#dbae58",
    "color3": "#fbe9e7",
    "color4": "#b4b4b4",
    "hexArray": [
      "#488a99",
      "#dbae58",
      "#fbe9e7",
      "#b4b4b4"
    ]
  },
  {
    "id": 101,
    "nombre": "Fun and professional",
    "nombreEs": "Fun and professional",
    "categoria": "Viajes & Cálidos",
    "color1": "#4abdac",
    "color2": "#fc4a1a",
    "color3": "#f7b733",
    "color4": "#dfdce3",
    "hexArray": [
      "#4abdac",
      "#fc4a1a",
      "#f7b733",
      "#dfdce3"
    ]
  },
  {
    "id": 102,
    "nombre": "Art history inspired",
    "nombreEs": "Art history inspired",
    "categoria": "Viajes & Cálidos",
    "color1": "#ffce00",
    "color2": "#0375b4",
    "color3": "#007849",
    "color4": "#262228",
    "hexArray": [
      "#ffce00",
      "#0375b4",
      "#007849",
      "#262228"
    ]
  },
  {
    "id": 103,
    "nombre": "Muted tones",
    "nombreEs": "Muted tones",
    "categoria": "Viajes & Cálidos",
    "color1": "#c0b283",
    "color2": "#dcd0c0",
    "color3": "#f4f4f4",
    "color4": "#373737",
    "hexArray": [
      "#c0b283",
      "#dcd0c0",
      "#f4f4f4",
      "#373737"
    ]
  },
  {
    "id": 104,
    "nombre": "Modern and clean",
    "nombreEs": "Modern and clean",
    "categoria": "Viajes & Cálidos",
    "color1": "#e37222",
    "color2": "#07889b",
    "color3": "#66b9bf",
    "color4": "#eeaa7b",
    "hexArray": [
      "#e37222",
      "#07889b",
      "#66b9bf",
      "#eeaa7b"
    ]
  },
  {
    "id": 105,
    "nombre": "Neon tones and sharp contrast",
    "nombreEs": "Neon tones and sharp contrast",
    "categoria": "Viajes & Cálidos",
    "color1": "#0e0b16",
    "color2": "#a239ca",
    "color3": "#4717f6",
    "color4": "#e7dfdd",
    "hexArray": [
      "#0e0b16",
      "#a239ca",
      "#4717f6",
      "#e7dfdd"
    ]
  },
  {
    "id": 106,
    "nombre": "Muted and minimal",
    "nombreEs": "Muted and minimal",
    "categoria": "Viajes & Cálidos",
    "color1": "#96858f",
    "color2": "#6d7993",
    "color3": "#9099a2",
    "color4": "#d5d5d5",
    "hexArray": [
      "#96858f",
      "#6d7993",
      "#9099a2",
      "#d5d5d5"
    ]
  },
  {
    "id": 107,
    "nombre": "Warm and bold",
    "nombreEs": "Warm and bold",
    "categoria": "Corporativo & Moderno",
    "color1": "#000000",
    "color2": "#062f4f",
    "color3": "#813772",
    "color4": "#b82601",
    "hexArray": [
      "#000000",
      "#062f4f",
      "#813772",
      "#b82601"
    ]
  },
  {
    "id": 108,
    "nombre": "Clean and highlighted",
    "nombreEs": "Clean and highlighted",
    "categoria": "Viajes & Cálidos",
    "color1": "#caebf2",
    "color2": "#a9a9a9",
    "color3": "#ff3b3f",
    "color4": "#efefef",
    "hexArray": [
      "#caebf2",
      "#a9a9a9",
      "#ff3b3f",
      "#efefef"
    ]
  },
  {
    "id": 109,
    "nombre": "Warm tones",
    "nombreEs": "Warm tones",
    "categoria": "Viajes & Cálidos",
    "color1": "#d7cec7",
    "color2": "#565656",
    "color3": "#76323f",
    "color4": "#c09f80",
    "hexArray": [
      "#d7cec7",
      "#565656",
      "#76323f",
      "#c09f80"
    ]
  },
  {
    "id": 110,
    "nombre": "Sharp and modern",
    "nombreEs": "Sharp and modern",
    "categoria": "Corporativo & Moderno",
    "color1": "#3cc47c",
    "color2": "#1e392a",
    "color3": "#e9c893",
    "color4": "#828081",
    "hexArray": [
      "#3cc47c",
      "#1e392a",
      "#e9c893",
      "#828081"
    ]
  },
  {
    "id": 111,
    "nombre": "Cool vs warm",
    "nombreEs": "Cool vs warm",
    "categoria": "Corporativo & Moderno",
    "color1": "#18121e",
    "color2": "#233237",
    "color3": "#984b43",
    "color4": "#eac67a",
    "hexArray": [
      "#18121e",
      "#233237",
      "#984b43",
      "#eac67a"
    ]
  },
  {
    "id": 112,
    "nombre": "Pretty pastels",
    "nombreEs": "Pretty pastels",
    "categoria": "Viajes & Cálidos",
    "color1": "#bfd8d2",
    "color2": "#fedcd2",
    "color3": "#df744a",
    "color4": "#dcb239",
    "hexArray": [
      "#bfd8d2",
      "#fedcd2",
      "#df744a",
      "#dcb239"
    ]
  },
  {
    "id": 113,
    "nombre": "Bold and punchy",
    "nombreEs": "Bold and punchy",
    "categoria": "Viajes & Cálidos",
    "color1": "#e24e42",
    "color2": "#e9b000",
    "color3": "#eb6e80",
    "color4": "#008f95",
    "hexArray": [
      "#e24e42",
      "#e9b000",
      "#eb6e80",
      "#008f95"
    ]
  },
  {
    "id": 114,
    "nombre": "Tints and tones",
    "nombreEs": "Tints and tones",
    "categoria": "Viajes & Cálidos",
    "color1": "#94618e",
    "color2": "#49274a",
    "color3": "#f4decb",
    "color4": "#f8eee7",
    "hexArray": [
      "#94618e",
      "#49274a",
      "#f4decb",
      "#f8eee7"
    ]
  },
  {
    "id": 115,
    "nombre": "Splash of color",
    "nombreEs": "Splash of color",
    "categoria": "Viajes & Cálidos",
    "color1": "#4484ce",
    "color2": "#d9d9d9",
    "color3": "#f9cf00",
    "color4": "#f19f4d",
    "hexArray": [
      "#4484ce",
      "#d9d9d9",
      "#f9cf00",
      "#f19f4d"
    ]
  },
  {
    "id": 116,
    "nombre": "Elegant and sophisticated",
    "nombreEs": "Elegant and sophisticated",
    "categoria": "Corporativo & Moderno",
    "color1": "#0b83c5",
    "color2": "#328cc1",
    "color3": "#d9b310",
    "color4": "#1d2731",
    "hexArray": [
      "#0b83c5",
      "#328cc1",
      "#d9b310",
      "#1d2731"
    ]
  },
  {
    "id": 117,
    "nombre": "Summer inspired",
    "nombreEs": "Summer inspired",
    "categoria": "Viajes & Cálidos",
    "color1": "#286da8",
    "color2": "#cd5360",
    "color3": "#b37d4e",
    "color4": "#438496",
    "hexArray": [
      "#286da8",
      "#cd5360",
      "#b37d4e",
      "#438496"
    ]
  },
  {
    "id": 118,
    "nombre": "Professional and modern",
    "nombreEs": "Professional and modern",
    "categoria": "Viajes & Cálidos",
    "color1": "#c5c1c0",
    "color2": "#0a1612",
    "color3": "#1a2930",
    "color4": "#f7ce3e",
    "hexArray": [
      "#c5c1c0",
      "#0a1612",
      "#1a2930",
      "#f7ce3e"
    ]
  },
  {
    "id": 119,
    "nombre": "Bold blacks and vibrand highlights",
    "nombreEs": "Bold blacks and vibrand highlights",
    "categoria": "Viajes & Cálidos",
    "color1": "#000000",
    "color2": "#ec576b",
    "color3": "#4ec5c1",
    "color4": "#e5e338",
    "hexArray": [
      "#000000",
      "#ec576b",
      "#4ec5c1",
      "#e5e338"
    ]
  },
  {
    "id": 120,
    "nombre": "Clean gradient and fresh blues",
    "nombreEs": "Clean gradient and fresh blues",
    "categoria": "Naturaleza",
    "color1": "#77c9d4",
    "color2": "#57bc90",
    "color3": "#015249",
    "color4": "#a5a5af",
    "hexArray": [
      "#77c9d4",
      "#57bc90",
      "#015249",
      "#a5a5af"
    ]
  },
  {
    "id": 121,
    "nombre": "Cheerful and sleek",
    "nombreEs": "Cheerful and sleek",
    "categoria": "Viajes & Cálidos",
    "color1": "#6b7a8f",
    "color2": "#f7882f",
    "color3": "#f7c331",
    "color4": "#dcc7aa",
    "hexArray": [
      "#6b7a8f",
      "#f7882f",
      "#f7c331",
      "#dcc7aa"
    ]
  },
  {
    "id": 122,
    "nombre": "Luxurious and modern",
    "nombreEs": "Luxurious and modern",
    "categoria": "Viajes & Cálidos",
    "color1": "#0f1626",
    "color2": "#ab987a",
    "color3": "#ff533d",
    "color4": "#f5f5f5",
    "hexArray": [
      "#0f1626",
      "#ab987a",
      "#ff533d",
      "#f5f5f5"
    ]
  },
  {
    "id": 123,
    "nombre": "Unique and striking",
    "nombreEs": "Unique and striking",
    "categoria": "Viajes & Cálidos",
    "color1": "#cf6766",
    "color2": "#30415d",
    "color3": "#031424",
    "color4": "#8eaebd",
    "hexArray": [
      "#cf6766",
      "#30415d",
      "#031424",
      "#8eaebd"
    ]
  },
  {
    "id": 124,
    "nombre": "Unexpected color combinations",
    "nombreEs": "Unexpected color combinations",
    "categoria": "Viajes & Cálidos",
    "color1": "#6e3667",
    "color2": "#88d317",
    "color3": "#1a0315",
    "color4": "#535353",
    "hexArray": [
      "#6e3667",
      "#88d317",
      "#1a0315",
      "#535353"
    ]
  },
  {
    "id": 125,
    "nombre": "Retro inspired",
    "nombreEs": "Retro inspired",
    "categoria": "Viajes & Cálidos",
    "color1": "#fedc3d",
    "color2": "#000000",
    "color3": "#01abaa",
    "color4": "#fea680",
    "hexArray": [
      "#fedc3d",
      "#000000",
      "#01abaa",
      "#fea680"
    ]
  },
  {
    "id": 126,
    "nombre": "Antique and clean",
    "nombreEs": "Antique and clean",
    "categoria": "Viajes & Cálidos",
    "color1": "#b56357",
    "color2": "#b4dbc0",
    "color3": "#eae3ea",
    "color4": "#a7b3a5",
    "hexArray": [
      "#b56357",
      "#b4dbc0",
      "#eae3ea",
      "#a7b3a5"
    ]
  },
  {
    "id": 127,
    "nombre": "Striking and energetic",
    "nombreEs": "Striking and energetic",
    "categoria": "Viajes & Cálidos",
    "color1": "#f81b84",
    "color2": "#f5ce28",
    "color3": "#43c0f6",
    "color4": "#f2eee2",
    "hexArray": [
      "#f81b84",
      "#f5ce28",
      "#43c0f6",
      "#f2eee2"
    ]
  },
  {
    "id": 128,
    "nombre": "Fresh and lively",
    "nombreEs": "Fresh and lively",
    "categoria": "Viajes & Cálidos",
    "color1": "#4cdef5",
    "color2": "#a4d555",
    "color3": "#ff5992",
    "color4": "#841983",
    "hexArray": [
      "#4cdef5",
      "#a4d555",
      "#ff5992",
      "#841983"
    ]
  },
  {
    "id": 129,
    "nombre": "Clean and crisp",
    "nombreEs": "Clean and crisp",
    "categoria": "Viajes & Cálidos",
    "color1": "#99d3df",
    "color2": "#88bbd6",
    "color3": "#cdcdcd",
    "color4": "#e9e9e9",
    "hexArray": [
      "#99d3df",
      "#88bbd6",
      "#cdcdcd",
      "#e9e9e9"
    ]
  },
  {
    "id": 130,
    "nombre": "Colorful without clashing",
    "nombreEs": "Colorful without clashing",
    "categoria": "Viajes & Cálidos",
    "color1": "#fa7c92",
    "color2": "#6ec4d8",
    "color3": "#fff7c0",
    "color4": "#66ab8c",
    "hexArray": [
      "#fa7c92",
      "#6ec4d8",
      "#fff7c0",
      "#66ab8c"
    ]
  },
  {
    "id": 131,
    "nombre": "Cool and calm",
    "nombreEs": "Cool and calm",
    "categoria": "Viajes & Cálidos",
    "color1": "#6bbaa7",
    "color2": "#fba100",
    "color3": "#6c648b",
    "color4": "#b6a19e",
    "hexArray": [
      "#6bbaa7",
      "#fba100",
      "#6c648b",
      "#b6a19e"
    ]
  },
  {
    "id": 132,
    "nombre": "Modern and muted",
    "nombreEs": "Modern and muted",
    "categoria": "Viajes & Cálidos",
    "color1": "#a9b7c0",
    "color2": "#c7d8c6",
    "color3": "#efd9c1",
    "color4": "#cccbc6",
    "hexArray": [
      "#a9b7c0",
      "#c7d8c6",
      "#efd9c1",
      "#cccbc6"
    ]
  },
  {
    "id": 133,
    "nombre": "Earthy and fresh",
    "nombreEs": "Earthy and fresh",
    "categoria": "Viajes & Cálidos",
    "color1": "#945d60",
    "color2": "#626e60",
    "color3": "#af473c",
    "color4": "#3c3c3c",
    "hexArray": [
      "#945d60",
      "#626e60",
      "#af473c",
      "#3c3c3c"
    ]
  },
  {
    "id": 134,
    "nombre": "High saturation and high energy",
    "nombreEs": "High saturation and high energy",
    "categoria": "Viajes & Cálidos",
    "color1": "#fe65b7",
    "color2": "#e9c904",
    "color3": "#8fc33a",
    "color4": "#62edd6",
    "hexArray": [
      "#fe65b7",
      "#e9c904",
      "#8fc33a",
      "#62edd6"
    ]
  },
  {
    "id": 135,
    "nombre": "Warm and wonderful",
    "nombreEs": "Warm and wonderful",
    "categoria": "Viajes & Cálidos",
    "color1": "#7cd8d5",
    "color2": "#f53240",
    "color3": "#f9be02",
    "color4": "#02c8a7",
    "hexArray": [
      "#7cd8d5",
      "#f53240",
      "#f9be02",
      "#02c8a7"
    ]
  },
  {
    "id": 136,
    "nombre": "Vintage charm 2",
    "nombreEs": "Vintage charm 2",
    "categoria": "Viajes & Cálidos",
    "color1": "#cda34f",
    "color2": "#e9e7da",
    "color3": "#636b46",
    "color4": "#373f27",
    "hexArray": [
      "#cda34f",
      "#e9e7da",
      "#636b46",
      "#373f27"
    ]
  },
  {
    "id": 137,
    "nombre": "Cool jewel tones",
    "nombreEs": "Cool jewel tones",
    "categoria": "Naturaleza",
    "color1": "#67aeca",
    "color2": "#675682",
    "color3": "#5f0f4e",
    "color4": "#e52a6f",
    "hexArray": [
      "#67aeca",
      "#675682",
      "#5f0f4e",
      "#e52a6f"
    ]
  },
  {
    "id": 138,
    "nombre": "Stormy hues",
    "nombreEs": "Stormy hues",
    "categoria": "Viajes & Cálidos",
    "color1": "#494e6b",
    "color2": "#98878f",
    "color3": "#985e6d",
    "color4": "#192231",
    "hexArray": [
      "#494e6b",
      "#98878f",
      "#985e6d",
      "#192231"
    ]
  },
  {
    "id": 139,
    "nombre": "Clean and collegiate",
    "nombreEs": "Clean and collegiate",
    "categoria": "Viajes & Cálidos",
    "color1": "#4abdac",
    "color2": "#99ced4",
    "color3": "#eeb6b7",
    "color4": "#6e7376",
    "hexArray": [
      "#4abdac",
      "#99ced4",
      "#eeb6b7",
      "#6e7376"
    ]
  },
  {
    "id": 140,
    "nombre": "Simple and fresh",
    "nombreEs": "Simple and fresh",
    "categoria": "Viajes & Cálidos",
    "color1": "#414141",
    "color2": "#ccdfcb",
    "color3": "#ff6a5c",
    "color4": "#056571",
    "hexArray": [
      "#414141",
      "#ccdfcb",
      "#ff6a5c",
      "#056571"
    ]
  },
  {
    "id": 141,
    "nombre": "Tropical tones",
    "nombreEs": "Tropical tones",
    "categoria": "Viajes & Cálidos",
    "color1": "#1fb58f",
    "color2": "#eab126",
    "color3": "#f24c4e",
    "color4": "#1b7b34",
    "hexArray": [
      "#1fb58f",
      "#eab126",
      "#f24c4e",
      "#1b7b34"
    ]
  },
  {
    "id": 142,
    "nombre": "Bold feature colors",
    "nombreEs": "Bold feature colors",
    "categoria": "Viajes & Cálidos",
    "color1": "#e14658",
    "color2": "#22252c",
    "color3": "#3f3250",
    "color4": "#c0b3a0",
    "hexArray": [
      "#e14658",
      "#22252c",
      "#3f3250",
      "#c0b3a0"
    ]
  },
  {
    "id": 143,
    "nombre": "Antique tones",
    "nombreEs": "Antique tones",
    "categoria": "Corporativo & Moderno",
    "color1": "#155765",
    "color2": "#57652a",
    "color3": "#ab9353",
    "color4": "#4d2c3d",
    "hexArray": [
      "#155765",
      "#57652a",
      "#ab9353",
      "#4d2c3d"
    ]
  },
  {
    "id": 144,
    "nombre": "Neon and bold",
    "nombreEs": "Neon and bold",
    "categoria": "Viajes & Cálidos",
    "color1": "#d48cf8",
    "color2": "#0e8044",
    "color3": "#b5e582",
    "color4": "#08302f",
    "hexArray": [
      "#d48cf8",
      "#0e8044",
      "#b5e582",
      "#08302f"
    ]
  },
  {
    "id": 145,
    "nombre": "Simple but bold",
    "nombreEs": "Simple but bold",
    "categoria": "Viajes & Cálidos",
    "color1": "#f7ef6a",
    "color2": "#93c178",
    "color3": "#465c8b",
    "color4": "#dfdce3",
    "hexArray": [
      "#f7ef6a",
      "#93c178",
      "#465c8b",
      "#dfdce3"
    ]
  },
  {
    "id": 146,
    "nombre": "Corporate and sleek",
    "nombreEs": "Corporate and sleek",
    "categoria": "Viajes & Cálidos",
    "color1": "#f7f5e6",
    "color2": "#333a56",
    "color3": "#52658f",
    "color4": "#e8e8e8",
    "hexArray": [
      "#f7f5e6",
      "#333a56",
      "#52658f",
      "#e8e8e8"
    ]
  },
  {
    "id": 147,
    "nombre": "Modern and minimal",
    "nombreEs": "Modern and minimal",
    "categoria": "Viajes & Cálidos",
    "color1": "#c06014",
    "color2": "#eddbc0",
    "color3": "#000000",
    "color4": "#cdcdcd",
    "hexArray": [
      "#c06014",
      "#eddbc0",
      "#000000",
      "#cdcdcd"
    ]
  },
  {
    "id": 148,
    "nombre": "Fun and cheerful",
    "nombreEs": "Fun and cheerful",
    "categoria": "Viajes & Cálidos",
    "color1": "#a7d2cb",
    "color2": "#f2d388",
    "color3": "#c98474",
    "color4": "#874c62",
    "hexArray": [
      "#a7d2cb",
      "#f2d388",
      "#c98474",
      "#874c62"
    ]
  },
  {
    "id": 149,
    "nombre": "Sunny and calm",
    "nombreEs": "Sunny and calm",
    "categoria": "Viajes & Cálidos",
    "color1": "#cae4db",
    "color2": "#dcae1d",
    "color3": "#00303f",
    "color4": "#7a9d96",
    "hexArray": [
      "#cae4db",
      "#dcae1d",
      "#00303f",
      "#7a9d96"
    ]
  },
  {
    "id": 150,
    "nombre": "Pop art",
    "nombreEs": "Pop art",
    "categoria": "Viajes & Cálidos",
    "color1": "#d7dd35",
    "color2": "#575da9",
    "color3": "#e42d9f",
    "color4": "#02558b",
    "hexArray": [
      "#d7dd35",
      "#575da9",
      "#e42d9f",
      "#02558b"
    ]
  }
];

export const CANVA_CATEGORIAS = [
  'TODAS',
  'Naturaleza',
  'Alimentos & Bebidas',
  'Corporativo & Moderno',
  'Viajes & Cálidos',
  'Elegancia & Joya',
  'Creativo & Pop',
  'Bienestar & Zen',
  'Vintage & Estilo'
] as const;
