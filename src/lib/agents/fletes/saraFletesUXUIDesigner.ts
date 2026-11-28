export type MultimodalVerticalKey = 'viajes' | 'mandaditos' | 'fletes' | 'renta';

export interface VehicleOptionUI {
  id: string;
  nombre: string;
  subtitulo: string;
  icono: string;
  capacidadTexto: string;
  tarifaBaseMinUSD: number;
  tiempoLlegadaMinutos: number;
  popular?: boolean;
}

export interface ModalidadConfigUI {
  key: MultimodalVerticalKey;
  label: string;
  emoji: string;
  descripcionCorta: string;
  colorTheme: string; // Tailwind color token
  accentBg: string;
  vehiculos: VehicleOptionUI[];
}

export const MODALIDADES_SARA_FLETES: Record<MultimodalVerticalKey, ModalidadConfigUI> = {
  viajes: {
    key: 'viajes',
    label: 'Viajes',
    emoji: '🚕',
    descripcionCorta: 'Movilidad urbana rápida, segura y económica en autos o motos.',
    colorTheme: 'text-amber-400',
    accentBg: 'bg-amber-500',
    vehiculos: [
      {
        id: 'MOTO_PASS',
        nombre: 'Moto Pasajero',
        subtitulo: 'Rápida, económica y esquiva atascos',
        icono: '🏍️',
        capacidadTexto: '1 pasajero • Casco incluido',
        tarifaBaseMinUSD: 1.25,
        tiempoLlegadaMinutos: 3,
        popular: true
      },
      {
        id: 'AUTO_SEDAN',
        nombre: 'Auto Sedán',
        subtitulo: 'Cómodo, con A/C y maletero',
        icono: '🚗',
        capacidadTexto: 'Hasta 4 pasajeros',
        tarifaBaseMinUSD: 1.75,
        tiempoLlegadaMinutos: 4
      },
      {
        id: 'AUTO_PREMIUM',
        nombre: 'Confort Plus',
        subtitulo: 'SUV espaciosa y conductores VIP',
        icono: '✨',
        capacidadTexto: 'Hasta 4 pasajeros • Alta gama',
        tarifaBaseMinUSD: 2.50,
        tiempoLlegadaMinutos: 6
      },
      {
        id: 'MINIVAN_PASS',
        nombre: 'Minivan Grupal',
        subtitulo: 'Ideal familias o cuadrillas de obra',
        icono: '🚐',
        capacidadTexto: '6 a 8 pasajeros',
        tarifaBaseMinUSD: 3.50,
        tiempoLlegadaMinutos: 8
      }
    ]
  },
  mandaditos: {
    key: 'mandaditos',
    label: 'Mandaditos',
    emoji: '📦',
    descripcionCorta: 'Envíos y compras inmediatas en moto, auto o camioneta según los servicios habilitados por cada conductor.',
    colorTheme: 'text-emerald-400',
    accentBg: 'bg-emerald-500',
    vehiculos: [
      {
        id: 'DELIVERY_MOTO',
        nombre: 'Moto Express',
        subtitulo: 'Documentos, llaves y compras rápidas',
        icono: '🛵',
        capacidadTexto: 'Hasta 15 kg • Moto',
        tarifaBaseMinUSD: 1.25,
        tiempoLlegadaMinutos: 2,
        popular: true
      },
      {
        id: 'DELIVERY_MOTO_TERMICA',
        nombre: 'Moto Térmica',
        subtitulo: 'Comida, medicinas y paquetes protegidos',
        icono: '🏍️',
        capacidadTexto: 'Hasta 20 kg • Caja térmica',
        tarifaBaseMinUSD: 1.60,
        tiempoLlegadaMinutos: 3
      },
      {
        id: 'DELIVERY_AUTO',
        nombre: 'Auto Mandadito',
        subtitulo: 'Supermercado, cajas y envíos en maletero',
        icono: '🚗',
        capacidadTexto: 'Hasta 80 kg • Auto Sedán',
        tarifaBaseMinUSD: 1.85,
        tiempoLlegadaMinutos: 4
      },
      {
        id: 'DELIVERY_PICKUP',
        nombre: 'Pickup Express',
        subtitulo: 'Compras grandes, ferretería y bultos',
        icono: '🛻',
        capacidadTexto: 'Hasta 350 kg • Camioneta',
        tarifaBaseMinUSD: 2.40,
        tiempoLlegadaMinutos: 6
      }
    ]
  },
  fletes: {
    key: 'fletes',
    label: 'Fletes',
    emoji: '🚛',
    descripcionCorta: 'Transporte de materiales de construcción, mudanzas y carga pesada MTOP.',
    colorTheme: 'text-blue-400',
    accentBg: 'bg-blue-500',
    vehiculos: [
      {
        id: 'PICKUP_1T',
        nombre: 'Camioneta Pickup',
        subtitulo: 'Hasta 1.2 Ton | Balde abierto',
        icono: '🛻',
        capacidadTexto: '1.2 Ton • 2.5 m³',
        tarifaBaseMinUSD: 2.00,
        tiempoLlegadaMinutos: 6,
        popular: true
      },
      {
        id: 'FURGON_3T',
        nombre: 'Furgón Urbano',
        subtitulo: 'Hasta 3.5 Ton | Furgón cerrado',
        icono: '🚐',
        capacidadTexto: '3.5 Ton • 14 m³',
        tarifaBaseMinUSD: 2.50,
        tiempoLlegadaMinutos: 10
      },
      {
        id: 'CAMION_5T',
        nombre: 'Camión Liviano',
        subtitulo: 'Hasta 5.0 Ton | Barandas o plataforma',
        icono: '🚚',
        capacidadTexto: '5.0 Ton • 18 m³',
        tarifaBaseMinUSD: 3.00,
        tiempoLlegadaMinutos: 12
      },
      {
        id: 'VOLQUETA_V3A',
        nombre: 'Volqueta de Obra',
        subtitulo: 'Hasta 14 Ton (14m³) | Basculante',
        icono: '🚜',
        capacidadTexto: '14 Ton • 14 m³',
        tarifaBaseMinUSD: 18.00,
        tiempoLlegadaMinutos: 15
      },
      {
        id: 'CAMION_10T',
        nombre: 'Camión Mediano',
        subtitulo: 'Hasta 10 Ton | Plataforma 8m',
        icono: '🚛',
        capacidadTexto: '10 Ton • 25 m³',
        tarifaBaseMinUSD: 15.00,
        tiempoLlegadaMinutos: 20
      },
      {
        id: 'TRACTO_3S3',
        nombre: 'Tráiler / Mula 3S3',
        subtitulo: 'Hasta 32 Ton (51T PBV MTOP)',
        icono: '🏗️',
        capacidadTexto: '32 Ton • Plataforma',
        tarifaBaseMinUSD: 50.00,
        tiempoLlegadaMinutos: 30
      }
    ]
  },
  renta: {
    key: 'renta',
    label: 'Renta',
    emoji: '🔑',
    descripcionCorta: 'Alquiler directo por horas o días de todo tipo de vehículos (motos, autos, camionetas, camiones y maquinaria).',
    colorTheme: 'text-purple-400',
    accentBg: 'bg-purple-500',
    vehiculos: [
      {
        id: 'RENTA_MOTO',
        nombre: 'Motocicleta Urbana',
        subtitulo: 'Movilidad ágil por horas o día completo',
        icono: '🏍️',
        capacidadTexto: '$5/hr • $25/día',
        tarifaBaseMinUSD: 5.00,
        tiempoLlegadaMinutos: 5
      },
      {
        id: 'RENTA_AUTO',
        nombre: 'Auto Sedán / SUV',
        subtitulo: 'Viajes ejecutivos, turismo o diligencias',
        icono: '🚗',
        capacidadTexto: '$9/hr • $45/día',
        tarifaBaseMinUSD: 9.00,
        tiempoLlegadaMinutos: 8
      },
      {
        id: 'RENTA_PICKUP',
        nombre: 'Camioneta 4x4',
        subtitulo: 'Para visitas técnicas o fletes propios',
        icono: '🛻',
        capacidadTexto: '$12/hr • $65/día',
        tarifaBaseMinUSD: 12.00,
        tiempoLlegadaMinutos: 10,
        popular: true
      },
      {
        id: 'RENTA_FURGON',
        nombre: 'Furgón Carga',
        subtitulo: 'Distribución temporal de insumos',
        icono: '🚐',
        capacidadTexto: '$18/hr • $95/día',
        tarifaBaseMinUSD: 18.00,
        tiempoLlegadaMinutos: 15
      },
      {
        id: 'RENTA_VOLQUETA',
        nombre: 'Volqueta Obra 14m³',
        subtitulo: 'Con chofer calificado para movimiento de tierras',
        icono: '🚜',
        capacidadTexto: '$35/hr • $220/día',
        tarifaBaseMinUSD: 35.00,
        tiempoLlegadaMinutos: 20
      },
      {
        id: 'RENTA_RETRO',
        nombre: 'Retroexcavadora',
        subtitulo: 'Operador certificado y horómetro satelital',
        icono: '🏗️',
        capacidadTexto: '$45/hr • $280/día',
        tarifaBaseMinUSD: 45.00,
        tiempoLlegadaMinutos: 30
      }
    ]
  }
};

/**
 * Clasificación estricta de flota permitida por modalidad en mapa, radar y cotizador:
 * - viajes: solo vehículos de pasajeros para viajes cortos (motos, autos, SUV, minivan).
 * - mandaditos: exclusivamente motocicletas.
 * - fletes: exclusivamente vehículos de carga y camiones MTOP.
 * - renta: todo tipo de vehículos.
 */
export function isVehicleAllowedForModalidad(
  modalidad: MultimodalVerticalKey,
  tipoVehiculo: string
): boolean {
  const code = String(tipoVehiculo || '').toUpperCase();
  if (modalidad === 'renta') return true;

  const isMoto = code.includes('MOTO') || code.includes('DELIVERY_MOTO');
  const isPassenger =
    isMoto ||
    code.includes('AUTO') ||
    code.includes('SEDAN') ||
    code.includes('TAXI') ||
    code.includes('SUV') ||
    code.includes('MINIVAN');
  const isHeavyOrCargo =
    code.includes('PICKUP') ||
    code.includes('FURGON') ||
    code.includes('CAMION') ||
    code.includes('VOLQUETA') ||
    code.includes('MULA') ||
    code.includes('TRAILER') ||
    code.includes('TRACTO') ||
    code.includes('CAMABAJA') ||
    code.includes('PLATAFORMA');

  if (modalidad === 'mandaditos') return isMoto;
  if (modalidad === 'viajes') return isPassenger && !isHeavyOrCargo;
  if (modalidad === 'fletes') return isHeavyOrCargo;
  return true;
}

export const PRESETS_MANDADITOS = [
  { id: 'doc', label: '📄 Documentos Legales', pesoKg: 1 },
  { id: 'med', label: '💊 Medicinas Urgentes', pesoKg: 0.5 },
  { id: 'com', label: '🍔 Comida / Víveres', pesoKg: 3 },
  { id: 'rep', label: '🔧 Repuestos / Herramientas', pesoKg: 10 }
];

export class SaraFletesUXUIDesigner {
  static readonly AGENT_ID = '@Agent-UXUI-Designer';

  /**
   * Obtiene la configuración de una modalidad
   */
  static getModalidadConfig(modalidad: MultimodalVerticalKey): ModalidadConfigUI {
    return MODALIDADES_SARA_FLETES[modalidad] || MODALIDADES_SARA_FLETES.viajes;
  }

  /**
   * Valida en milisegundos si la orden cumple con las reglas de cero frustración
   */
  static validateOrderInstant(params: {
    origen: string;
    destino: string;
    vehiculoSeleccionado: string;
  }): { isValid: boolean; errorSugerido?: string } {
    if (!params.origen || params.origen.trim().length === 0) {
      return { isValid: false, errorSugerido: 'Indica tu punto de origen o usa el botón GPS 📍' };
    }
    if (!params.destino || params.destino.trim().length === 0) {
      return { isValid: false, errorSugerido: 'Selecciona o escribe el destino 🚩' };
    }
    if (!params.vehiculoSeleccionado) {
      return { isValid: false, errorSugerido: 'Elige el tipo de transporte' };
    }
    return { isValid: true };
  }
}
