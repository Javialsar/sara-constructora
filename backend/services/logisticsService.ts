export interface Transporter {
    id: string;
    name: string;
    capacityKg: number;
    capacityM3: number;
    isAvailable: boolean;
}

export interface FreightAssignment {
    id: string;
    transporterId: string;
    distanceKm: number;
    totalWeightKg: number;
    totalVolumeM3: number;
    calculatedCost: number;
    status: 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
}

// Mock database for transporters
const transportersDB: Transporter[] = [
    { id: 't1', name: 'Transportes Rápidos', capacityKg: 5000, capacityM3: 20, isAvailable: true },
    { id: 't2', name: 'Carga Segura', capacityKg: 15000, capacityM3: 50, isAvailable: true },
    { id: 't3', name: 'Logística Express', capacityKg: 3000, capacityM3: 15, isAvailable: false }
];

const freightAssignmentsDB: FreightAssignment[] = [];

export class LogisticsService {
    // Base rates for freight cost calculation
    private readonly BASE_RATE_PER_KM = 2.5; // Cost per km
    private readonly RATE_PER_KG = 0.05; // Cost per kg
    private readonly RATE_PER_M3 = 15.0; // Cost per cubic meter

    /**
     * Calculate freight costs based on distance, total weight, and volume.
     */
    public calculateFreightCost(distanceKm: number, weightKg: number, volumeM3: number): number {
        const distanceCost = distanceKm * this.BASE_RATE_PER_KM;
        const weightCost = weightKg * this.RATE_PER_KG;
        const volumeCost = volumeM3 * this.RATE_PER_M3;

        return distanceCost + weightCost + volumeCost;
    }

    /**
     * Assign freight to an available transporter that meets the capacity requirements.
     */
    public assignFreight(distanceKm: number, weightKg: number, volumeM3: number): FreightAssignment {
        // Find available transporters with sufficient capacity for the freight
        const availableTransporters = transportersDB.filter(t => 
            t.isAvailable && t.capacityKg >= weightKg && t.capacityM3 >= volumeM3
        );

        if (availableTransporters.length === 0) {
            throw new Error('No available transporters found with sufficient capacity for this freight.');
        }

        // Simple assignment logic: assign to the first available transporter that fits the criteria
        const assignedTransporter = availableTransporters[0];
        
        // Mark transporter as unavailable once assigned (simplified for demonstration)
        assignedTransporter.isAvailable = false;

        const calculatedCost = this.calculateFreightCost(distanceKm, weightKg, volumeM3);

        const assignment: FreightAssignment = {
            id: Math.random().toString(36).substr(2, 9),
            transporterId: assignedTransporter.id,
            distanceKm,
            totalWeightKg: weightKg,
            totalVolumeM3: volumeM3,
            calculatedCost,
            status: 'ASSIGNED'
        };

        freightAssignmentsDB.push(assignment);
        return assignment;
    }
}
