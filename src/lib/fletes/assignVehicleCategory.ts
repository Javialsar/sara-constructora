import { CategoriaVehiculo } from '@/lib/services/saraFreightPricingService';

export interface AssignVehicleResult {
  category: CategoriaVehiculo;
  reason: string;
  badge?: string;
  isEscalatedByLength?: boolean;
}

/**
 * Motor puro de asignación y reglas de vehículo SARA-FLETES:
 * - Regla 1 (<= 1.0 Ton y material corto): Asigna Camioneta Pickup (PICKUP_1T).
 * - Regla 2 (Material === "Varillas de Acero"): Escala a Camión Mediano (CAMION_10T) por longitud de varillas (12m).
 * - Regla 3 (1.1 Ton a 3.5 Ton): Asigna Camión Liviano 3.5T (FURGON_3T o CAMION_5T).
 * - Regla 4 (> 3.5 Ton o Material === "Desalojo de Escombros" > 1.5 Ton): Asigna Volqueta (VOLQUETA_V3A) o Camión Pesado (TRACTO_3S3 si > 14T).
 */
export function assignVehicleCategory(material: string, weightTons: number): AssignVehicleResult {
  const isVarillas = material.toLowerCase().includes('varilla');
  const isEscombros = material.toLowerCase().includes('escombro') || material.toLowerCase().includes('arena') || material.toLowerCase().includes('ripio');

  // Regla 2 prioritaria: Varillas de Acero
  if (isVarillas) {
    if (weightTons > 10.0) {
      return {
        category: 'TRACTO_3S3',
        reason: 'Varillas de acero de alto tonelaje en plataforma 32T MTOP.',
        badge: 'Asignado tráiler plataforma por longitud y peso (12m / >10T)',
        isEscalatedByLength: true
      };
    }
    return {
      category: 'CAMION_10T',
      reason: 'Varillas de acero (6m - 12m) requieren plataforma o cajón largo para evitar voladizo peligroso en carretera.',
      badge: 'Asignado camión largo por longitud de varillas (12m)',
      isEscalatedByLength: true
    };
  }

  // Regla 4: Volqueta para escombros pesados o áridos > 1.5T o carga pesada > 3.5T
  if ((isEscombros && weightTons > 1.5) || (material === 'Desalojo de Escombros')) {
    if (weightTons > 14.0) {
      return {
        category: 'TRACTO_3S3',
        reason: 'Desalojo masivo de obra civil en unidad pesada MTOP.',
        badge: 'Unidad pesada para desalojo masivo (>14T)'
      };
    }
    return {
      category: 'VOLQUETA_V3A',
      reason: 'Material a granel o escombros requieren tolva basculante para descarga automática en botadero.',
      badge: 'Volqueta de Obra con tolva basculante (14m³)'
    };
  }

  if (weightTons > 14.0) {
    return {
      category: 'TRACTO_3S3',
      reason: 'Carga pesada industrial que supera la capacidad de camiones rígidos (51T PBV MTOP).',
      badge: 'Tráiler / Mula Plataforma (32T útiles)'
    };
  }

  if (weightTons > 3.5) {
    return {
      category: 'VOLQUETA_V3A',
      reason: 'Carga de obra superior a 3.5 Ton asignada a equipo pesado con capacidad de 14 Ton.',
      badge: 'Equipo de transporte pesado (Hasta 14 Ton)'
    };
  }

  // Regla 3: 1.1 Ton a 3.5 Ton
  if (weightTons > 1.0) {
    return {
      category: 'FURGON_3T',
      reason: 'Carga media protegida y distribuida en camión liviano hasta 3.5 Ton.',
      badge: 'Camión liviano para carga de 1.1T a 3.5T'
    };
  }

  // Regla 1: <= 1.0 Ton
  return {
    category: 'PICKUP_1T',
    reason: 'Carga ligera de transporte rápido en camioneta de obra 1.2 Ton.',
    badge: 'Camioneta Pickup ágil para obra (Hasta 1.2 Ton)'
  };
}
