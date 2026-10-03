export interface ResenaHuesped {
  id: string
  autor: string
  ciudadOrigen: string
  pais: string
  bandera: string
  fecha: string
  rating: number
  comentario: string
  verificado?: boolean
}

export interface AirbnbListing {
  id: string
  codigo: string
  titulo: string
  tipo: "suite" | "loft" | "penthouse" | "quinta" | "studio" | "villa" | "casa" | "departamento"
  alcance: "nacional" | "internacional"
  pais: string
  bandera: string
  ciudad: string
  sector: string
  lat: number
  lng: number
  precioNoche: number
  tarifaLimpieza: number
  rating: number
  reviewsCount: number
  isSuperhost: boolean
  maxHuespedes: number
  camas: number
  habitaciones: number
  banos: number
  imagenes: string[]
  descripcion: string
  amenidades: string[]
  reglas: string[]
  resenas?: ResenaHuesped[]
}

export function getDefaultReviewsForListing(stay: AirbnbListing): ResenaHuesped[] {
  if (stay.ciudad === "Cuenca") {
    return [
      {
        id: "rev-1",
        autor: "Daniela Vintimilla",
        ciudadOrigen: "Guayaquil",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 2 semanas",
        rating: 5,
        comentario: "Una experiencia inmejorable. La vista y el entorno son espectaculares, el departamento estuvo impecable y la cerradura inteligente facilitó el ingreso autónomo a la hora que llegamos. ¡100% recomendado!"
      },
      {
        id: "rev-2",
        autor: "Mark & Sarah Jenkins",
        ciudadOrigen: "Austin, Texas",
        pais: "Estados Unidos",
        bandera: "🇺🇸",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "One of the best stays we've booked in South America! High-speed WiFi for our remote work, comfortable King mattress, and super safe area. The SARA Hospitality team was always available."
      },
      {
        id: "rev-3",
        autor: "Ing. Esteban Cordero",
        ciudadOrigen: "Quito",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "Acabados de primera, sábanas de alta calidad y cafetera Nespresso lista con cápsulas. Todo funcionó a la perfección y el parqueadero subterráneo es amplio."
      }
    ]
  } else if (stay.ciudad === "Yunguilla") {
    return [
      {
        id: "rev-1",
        autor: "Familia Cárdenas Mora",
        ciudadOrigen: "Guayaquil",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 3 semanas",
        rating: 5,
        comentario: "El clima del valle y la piscina climatizada con jacuzzi privado hicieron de nuestro descanso familiar algo inolvidable. Las áreas de BBQ y cocina están equipadas con todo."
      },
      {
        id: "rev-2",
        autor: "Dr. Marcelo Ávila",
        ciudadOrigen: "Cuenca",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "Excelente propiedad vacacional. Paz absoluta, hermosas áreas verdes y mucha privacidad. La atención del personal de SARA fue de primer nivel."
      }
    ]
  } else if (stay.alcance === "internacional") {
    return [
      {
        id: "rev-1",
        autor: "Alejandro & Valeria R.",
        ciudadOrigen: "Cuenca",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 3 semanas",
        rating: 5,
        comentario: "Reservamos nuestro hospedaje en el exterior a través de SARA y fue un acierto total. Ubicación estratégica, check-in digital sin demoras y tarifa transparente en dólares."
      },
      {
        id: "rev-2",
        autor: "Gabriel Montenegro",
        ciudadOrigen: "Madrid",
        pais: "España",
        bandera: "🇪🇸",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "Alojamiento impecable con diseño de vanguardia. Cerca de todos los puntos de interés, luminoso y muy silencioso para descansar."
      }
    ]
  }
  return [
    {
      id: "rev-1",
      autor: "María Fernanda Crespo",
      ciudadOrigen: "Quito",
      pais: "Ecuador",
      bandera: "🇪🇨",
      fecha: "Hace 2 semanas",
      rating: 5,
      comentario: "Hermoso lugar, súper limpio y acogedor. Las fotos reflejan exactamente la realidad. La atención de SARA fue inmediata y muy cordial."
    },
    {
      id: "rev-2",
      autor: "David Henderson",
      ciudadOrigen: "Toronto",
      pais: "Canadá",
      bandera: "🇨🇦",
      fecha: "Hace 1 mes",
      rating: 5,
      comentario: "Fantastic location and great amenities. Fast internet, cozy bed, and smooth self-check-in with the smart lock. Would definitely stay again!"
    }
  ]
}

export const AIRBNB_DATA: AirbnbListing[] = [
  // ==========================================
  // NACIONAL (ECUADOR)
  // ==========================================
  {
    id: "ab-1",
    codigo: "SARA-EC-01",
    titulo: "Master Suite de Diseño Frente al Río Tomebamba",
    tipo: "suite",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "Puertas del Sol",
    lat: -2.8980,
    lng: -79.0180,
    precioNoche: 48,
    tarifaLimpieza: 15,
    rating: 4.98,
    reviewsCount: 54,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1,
    imagenes: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Disfruta de amaneceres únicos con el sonido del río Tomebamba. Suite contemporánea equipada con cerradura inteligente para llegada autónoma 24/7, cama King con sábanas de 600 hilos, cafetera Nespresso e internet simétrico de alta velocidad.",
    amenidades: ["Vista al Río", "WiFi 300 Mbps Fibra", "Smart Lock (Self Check-in)", "Smart TV 55\" 4K", "Cafetera Nespresso", "Parqueadero Subterráneo", "Cocina Equipada"],
    reglas: ["Check-in: 15:00 a 22:00", "Check-out: 11:00", "No se permiten fiestas", "No fumar dentro de la suite"]
  },
  {
    id: "ab-2",
    codigo: "SARA-EC-02",
    titulo: "Loft Patrimonial en Calle Larga - Centro Histórico",
    tipo: "loft",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "Centro Histórico",
    lat: -2.8974,
    lng: -79.0045,
    precioNoche: 59,
    tarifaLimpieza: 20,
    rating: 4.95,
    reviewsCount: 78,
    isSuperhost: true,
    maxHuespedes: 3,
    camas: 2,
    habitaciones: 1,
    banos: 1.5,
    imagenes: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Una joya arquitectónica restaurada que combina muros originales de adobe visto con acabados industriales de acero y madera noble. A solo 4 minutos a pie del Parque Calderón y museos.",
    amenidades: ["Balcón Republicano", "Paredes de Adobe Visto", "Cama Queen", "Cocina Integral", "Agua Caliente Central", "WiFi Alta Velocidad", "Espacio de Trabajo"],
    reglas: ["Check-in: 14:00", "Check-out: 11:00", "Pet Friendly (Bajo petición)", "Cuidado con patrimonio"]
  },
  {
    id: "ab-3",
    codigo: "SARA-EC-03",
    titulo: "Villa Campestre Los Guayacanes con Piscina en Yunguilla",
    tipo: "quinta",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Santa Isabel",
    sector: "Valle de Yunguilla",
    lat: -3.2730,
    lng: -79.3140,
    precioNoche: 165,
    tarifaLimpieza: 35,
    rating: 5.0,
    reviewsCount: 38,
    isSuperhost: true,
    maxHuespedes: 8,
    camas: 5,
    habitaciones: 4,
    banos: 3.5,
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "El escape de fin de semana definitivo bajo el cálido sol de Yunguilla. Piscina temperada privada, zona de fogata nocturna, pérgola BBQ con horno de leña, billar y árboles de cítricos a tu disposición.",
    amenidades: ["Piscina Temperada Privada", "Pérgola BBQ con Horno", "Zona de Fogata", "Mesa de Billar", "Parqueo para 6 Autos", "Clima Cálido", "Sonido Envolvente"],
    reglas: ["Check-in: 13:00", "Check-out: 16:00 (Late check-out)", "Mascotas bienvenidas", "Música moderada en la noche"]
  },
  {
    id: "ab-4",
    codigo: "SARA-EC-04",
    titulo: "Suite Ejecutiva en Puerto Santa Ana con Vista al Río",
    tipo: "suite",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Guayaquil",
    sector: "Puerto Santa Ana",
    lat: -2.1810,
    lng: -79.8760,
    precioNoche: 68,
    tarifaLimpieza: 20,
    rating: 4.96,
    reviewsCount: 45,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1,
    imagenes: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "En el epicentro financiero y gastronómico más moderno de Guayaquil. Edificio The Point con piscina sinfín en la terraza, jacuzzi, gimnasio completo y seguridad privada 24 horas.",
    amenidades: ["Piscina en Rooftop", "Vista al Río Guayas", "Gimnasio y Sauna", "Aire Acondicionado Central", "WiFi Fibra 300 Mbps", "Seguridad Blindada 24/7"],
    reglas: ["Check-in: 15:00", "Check-out: 11:00", "Prohibido fiestas", "Acceso con tarjeta electrónica"]
  },
  {
    id: "ab-5",
    codigo: "SARA-EC-05",
    titulo: "Eco-Lodge Exclusivo en Puerto Ayora - Islas Galápagos",
    tipo: "villa",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Galápagos",
    sector: "Santa Cruz / Puerto Ayora",
    lat: -0.7432,
    lng: -90.3135,
    precioNoche: 185,
    tarifaLimpieza: 40,
    rating: 4.99,
    reviewsCount: 62,
    isSuperhost: true,
    maxHuespedes: 4,
    camas: 2,
    habitaciones: 2,
    banos: 2,
    imagenes: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Villa ecológica sustentable rodeada de vegetación endémica y tortugas gigantes en su hábitat. Diseñada con energía solar, terrazas de bambú y aire acondicionado ecológico a pocos minutos de Tortuga Bay.",
    amenidades: ["Energía Solar", "Bicicletas de Cortesía", "Tour Assistance", "Cocina Abierta", "Agua Purificada Ilimitada", "WiFi Satelital Starlink"],
    reglas: ["Estricto respeto a fauna de Galápagos", "No plásticos de un solo uso", "Check-in: 14:00", "Check-out: 10:00"]
  },

  // ==========================================
  // INTERNACIONAL (MUNDIAL)
  // ==========================================
  {
    id: "ab-6",
    codigo: "SARA-INT-01",
    titulo: "Luxury High-Rise Penthouse en Brickell con Bahía View",
    tipo: "penthouse",
    alcance: "internacional",
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    ciudad: "Miami, FL",
    sector: "Brickell Financial District",
    lat: 25.7617,
    lng: -80.1918,
    precioNoche: 220,
    tarifaLimpieza: 50,
    rating: 4.97,
    reviewsCount: 88,
    isSuperhost: true,
    maxHuespedes: 4,
    camas: 2,
    habitaciones: 2,
    banos: 2,
    imagenes: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Viva la experiencia cosmopolita de Miami en el corazón de Brickell. Piso 42 con balcón panorámico hacia Biscayne Bay, acabados de mármol italiano, piscina infinita estilo resort y servicio de valet parking.",
    amenidades: ["Vista a Biscayne Bay", "Piscina Resort & Spa", "Valet Parking Incluido", "WiFi 500 Mbps", "Gimnasio Equinox", "Lavadora/Secadora Bosch"],
    reglas: ["Check-in: 16:00", "Check-out: 11:00", "Registro con ID obligatorio", "No fiestas en la propiedad"]
  },
  {
    id: "ab-7",
    codigo: "SARA-INT-02",
    titulo: "Apartamento de Diseño en Barrio de Salamanca",
    tipo: "loft",
    alcance: "internacional",
    pais: "España",
    bandera: "🇪🇸",
    ciudad: "Madrid",
    sector: "Barrio de Salamanca",
    lat: 40.4280,
    lng: -3.6840,
    precioNoche: 135,
    tarifaLimpieza: 30,
    rating: 4.96,
    reviewsCount: 71,
    isSuperhost: true,
    maxHuespedes: 3,
    camas: 2,
    habitaciones: 1,
    banos: 1,
    imagenes: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Elegante departamento madrileño con techos de 3.5 metros y molduras clásicas en la exclusiva calle Serrano. Calefacción por suelo radiante, cocina de diseño Santos y walking distance al Parque del Retiro.",
    amenidades: ["Techos Altos Clásicos", "Suelo Radiante", "A 5 min del Retiro", "Cocina Santos Equipada", "Smart Lock", "Cafetera Espresso", "WiFi 600 Mbps"],
    reglas: ["Check-in: 15:00", "Check-out: 11:00", "Silencio a partir de las 22:00", "No se permite fumar"]
  },
  {
    id: "ab-8",
    codigo: "SARA-INT-03",
    titulo: "Villa Exclusiva Frente al Mar Caribe en Cancún",
    tipo: "villa",
    alcance: "internacional",
    pais: "México",
    bandera: "🇲🇽",
    ciudad: "Cancún",
    sector: "Zona Hotelera / Playa",
    lat: 21.1350,
    lng: -86.7490,
    precioNoche: 290,
    tarifaLimpieza: 60,
    rating: 5.0,
    reviewsCount: 43,
    isSuperhost: true,
    maxHuespedes: 8,
    camas: 5,
    habitaciones: 4,
    banos: 4,
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Acceso directo a la arena blanca y aguas turquesa del Caribe. Piscina privada con camastros, terraza lounge con asador, servicio opcional de chef privado y kayak de cortesía.",
    amenidades: ["Acceso Directo a la Playa", "Piscina Privada Frente al Mar", "Kayaks y Paddleboards", "Asador en Terraza", "Aire Acondicionado Inverter", "Staff de Limpieza Diario"],
    reglas: ["Check-in: 15:00", "Check-out: 12:00", "Respeto a la zona de anidación de tortugas", "Eventos solo bajo autorización"]
  },
  {
    id: "ab-9",
    codigo: "SARA-INT-04",
    titulo: "Suite Panorámica con Jacuzzi en El Poblado",
    tipo: "suite",
    alcance: "internacional",
    pais: "Colombia",
    bandera: "🇨🇴",
    ciudad: "Medellín",
    sector: "El Poblado / Provenza",
    lat: 6.2085,
    lng: -75.5670,
    precioNoche: 75,
    tarifaLimpieza: 20,
    rating: 4.94,
    reviewsCount: 57,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1.5,
    imagenes: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "En el corazón de Provenza, el barrio más 'cool' del mundo según TimeOut. Balcón con jacuzzi hidromasaje privado con vista a la vegetación tropical de Medellín, sonido Bose e internet Starlink ultraveloz.",
    amenidades: ["Jacuzzi Privado en Balcón", "Ubicación en Provenza", "Sonido Bose", "Starlink WiFi 350 Mbps", "Smart Lock", "Gimnasio en Edificio", "Seguridad 24h"],
    reglas: ["Check-in: 14:00", "Check-out: 11:00", "Estricta política de convivencia", "Registro con cédula/pasaporte"]
  }
]
