// ============================================================================
// GOBEE ("by Grupo Sara") — IDENTIDAD COMERCIAL, CATEGORÍAS Y TIPOS
// Paleta oficial:
//   - Ámbar Miel (Primary): #FDBE3B
//   - Negro Grafito (Contrast): #111827
//   - Fondo Claro Cliente: #FAFAFA
//   - Modo Oscuro Nativo Conductor: #0F172A
// ============================================================================

import type { CategoriaVehiculo } from '@/lib/services/saraFreightPricingService';

export const GOBEE_BRAND = {
  name: 'Gobee',
  seal: 'Gobee · Un servicio de Grupo Sara',
  colors: {
    amber: '#FDBE3B',
    amberHover: '#F5B024',
    graphite: '#111827',
    riderBg: '#FAFAFA',
    driverBg: '#0F172A',
  },
} as const;

export type GobeeCategoryId = 'gobee_go' | 'gobee_xl' | 'gobee_express' | 'gobee_cargo';

export interface GobeeCategoryConfig {
  id: GobeeCategoryId;
  name: string;
  tagline: string;
  subtitle: string;
  capacityLabel: string;
  etaBaseMin: number;
  baseFareUSD: number;
  perKmUSD: number;
  minFareUSD: number;
  commissionRate: number;
  legacyVehicleType: CategoriaVehiculo;
  requiresCargoDetails: boolean;
}

export const GOBEE_CATEGORIES: GobeeCategoryConfig[] = [
  {
    id: 'gobee_go',
    name: 'Gobee Go',
    tagline: 'Urbano rápido',
    subtitle: 'Sedán o hatchback climatizado · 1-4 pasajeros',
    capacityLabel: '4 pax',
    etaBaseMin: 3,
    baseFareUSD: 1.50,
    perKmUSD: 0.42,
    minFareUSD: 2.00,
    commissionRate: 0.15,
    legacyVehicleType: 'PICKUP_1T',
    requiresCargoDetails: false,
  },
  {
    id: 'gobee_xl',
    name: 'Gobee XL',
    tagline: 'SUV / Doble Cabina',
    subtitle: 'Amplio espacio para equipo técnico o equipaje',
    capacityLabel: '5 pax + equipo',
    etaBaseMin: 5,
    baseFareUSD: 2.25,
    perKmUSD: 0.58,
    minFareUSD: 3.00,
    commissionRate: 0.15,
    legacyVehicleType: 'PICKUP_1T',
    requiresCargoDetails: false,
  },
  {
    id: 'gobee_express',
    name: 'Gobee Express',
    tagline: 'Moto / Envíos',
    subtitle: 'Documentos, repuestos y paquetes urgentes',
    capacityLabel: 'Hasta 20 kg',
    etaBaseMin: 2,
    baseFareUSD: 1.00,
    perKmUSD: 0.30,
    minFareUSD: 1.50,
    commissionRate: 0.12,
    legacyVehicleType: 'PICKUP_1T',
    requiresCargoDetails: false,
  },
  {
    id: 'gobee_cargo',
    name: 'Gobee Cargo',
    tagline: 'Fletes / Materiales de obra',
    subtitle: 'Camioneta, camión o volqueta con control MTOP',
    capacityLabel: '1.2T – 32T',
    etaBaseMin: 7,
    baseFareUSD: 3.50,
    perKmUSD: 0.85,
    minFareUSD: 5.00,
    commissionRate: 0.10,
    legacyVehicleType: 'CAMION_5T',
    requiresCargoDetails: true,
  },
];

export const GOBEE_CATEGORY_MAP: Record<GobeeCategoryId, GobeeCategoryConfig> = {
  gobee_go: GOBEE_CATEGORIES[0],
  gobee_xl: GOBEE_CATEGORIES[1],
  gobee_express: GOBEE_CATEGORIES[2],
  gobee_cargo: GOBEE_CATEGORIES[3],
};

export interface GobeeGeoPoint {
  label: string;
  lat: number;
  lng: number;
  city?: string;
  province?: string;
}

export interface GobeeServerQuote {
  category: GobeeCategoryId;
  distanceKm: number;
  durationMin: number;
  fixedFareUSD: number;
  minBidUSD: number;
  maxBidUSD: number;
  commissionRate: number;
  driverNetUSD: number;
  source: 'rpc_postgis' | 'local_estimate';
}

export interface GobeeActiveTrip {
  id: string;
  orderId?: string;
  category: GobeeCategoryId;
  origin: GobeeGeoPoint;
  destination: GobeeGeoPoint;
  distanceKm: number;
  durationMin: number;
  pricingMode: 'fixed' | 'offer';
  agreedPriceUSD: number;
  status: 'searching' | 'accepted' | 'in_transit' | 'completed';
  pinCode: string;
  trackingToken: string;
  paymentMethod: 'efectivo' | 'kushki' | 'deuna';
  material?: string;
  weightTon?: number;
  driver?: {
    id: string;
    name: string;
    plate: string;
    vehicleLabel: string;
    rating: number;
    tripsCount: number;
    phone: string;
    etaMin: number;
  };
}

export interface GobeeIncomingRequest {
  id: string;
  category: GobeeCategoryId;
  originLabel: string;
  destLabel: string;
  originCoords: [number, number];
  destCoords: [number, number];
  distanceKm: number;
  pickupDistanceKm: number;
  durationMin: number;
  grossFareUSD: number;
  commissionPct: number;
  netEarningsUSD: number;
  isBackhaul: boolean;
  backhaulBonusLabel?: string;
  material?: string;
  weightTon?: number;
  pinCode: string;
  customerName: string;
  receivedAt: number;
}

export interface GobeeDriverVerificationState {
  cedula: boolean;
  licencia: boolean;
  matricula: boolean;
  biometria: boolean;
}
