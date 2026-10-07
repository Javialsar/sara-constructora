import { Request, Response, NextFunction } from 'express';

interface FreightRequest {
    id: string;
    origin: string;
    destination: string;
    distance_km: number;
    reference_price: number;
    status: 'broadcasting' | 'negotiating' | 'accepted' | 'in_transit';
    offers: DriverOffer[];
}

interface DriverOffer {
    driverId: string;
    proposedPrice: number;
    status: 'pending' | 'accepted' | 'rejected';
}

/**
 * Agente Backend - Módulo de Fletes tipo "Uber"
 * Servicio para difusión de solicitudes y negociación de fletes.
 */
export class UberFreightService {
    // Almacenamiento en memoria para demostración (idealmente Redis o PostgreSQL)
    private activeRequests: Map<string, FreightRequest> = new Map();

    /**
     * Emite una solicitud de flete a todos los transportistas cercanos
     */
    public async broadcastFreight(req: Request, res: Response, next: NextFunction) {
        try {
            const { origin, destination, distance, calculatedPrice } = req.body;
            
            const newRequest: FreightRequest = {
                id: crypto.randomUUID(),
                origin,
                destination,
                distance_km: distance,
                reference_price: calculatedPrice,
                status: 'broadcasting',
                offers: []
            };

            this.activeRequests.set(newRequest.id, newRequest);

            // TODO: Integrar WebSockets (Ej. Socket.io) o Push Notifications (FCM) 
            // para alertar a los transportistas (dueños de vehículos) en un radio de X km.

            return res.status(201).json({
                message: 'Solicitud de flete transmitida a transportistas cercanos.',
                request: newRequest
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Permite a un transportista proponer un nuevo precio (negociación) o aceptar el valor referencial
     */
    public async submitDriverOffer(req: Request, res: Response, next: NextFunction) {
        try {
            const { requestId, driverId, proposedPrice } = req.body;
            
            const freight = this.activeRequests.get(requestId);
            if (!freight) {
                return res.status(404).json({ error: 'Flete no encontrado o ya expirado.' });
            }

            freight.offers.push({
                driverId,
                proposedPrice,
                status: 'pending'
            });
            freight.status = 'negotiating';

            // TODO: Notificar al constructor sobre la contraoferta del transportista

            return res.status(200).json({
                message: 'Oferta enviada al constructor para aprobación.',
                freight
            });
        } catch (error) {
            next(error);
        }
    }
}

export const uberFreightService = new UberFreightService();
