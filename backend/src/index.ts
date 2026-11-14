import express from 'express';
import cors from 'cors';
import { escrowService } from '../services/escrowService';
import { uberFreightService } from '../services/uberFreightService';
import { predictiveService } from '../services/predictiveDigitalTwin';

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de CORS Zero-Trust con dominios autorizados
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://saraconstructora.com',
  'https://www.saraconstructora.com'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política CORS Zero-Trust de GRUPO SARA'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Middleware de Seguridad Zero-Trust para endpoints internos
const requireBackendAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  const expectedKey = process.env.SARA_INTERNAL_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (process.env.NODE_ENV === 'production' || expectedKey) {
    if (!apiKey || (apiKey !== expectedKey && apiKey !== `Bearer ${expectedKey}`)) {
      return res.status(401).json({
        success: false,
        error: 'Acceso denegado: Se requiere API Key o Bearer token autorizado para invocar servicios backend de GRUPO SARA.'
      });
    }
  }
  next();
};

// ==========================================
// RUTAS GRUPO SARA - MÓDULOS UNIFICADOS
// ==========================================

// 1. Módulo Fintech & Escrow (Protegido)
app.post('/api/escrow/create', requireBackendAuth, escrowService.createEscrow.bind(escrowService));
app.post('/api/escrow/release', requireBackendAuth, escrowService.releaseFunds.bind(escrowService));
app.post('/api/escrow/dispute', requireBackendAuth, escrowService.disputeAndRefund.bind(escrowService));

// 2. Módulo Red Agéntica de Fletes (Protegido)
app.post('/api/freight/broadcast', requireBackendAuth, uberFreightService.broadcastFreight.bind(uberFreightService));
app.post('/api/freight/offer', requireBackendAuth, uberFreightService.submitDriverOffer.bind(uberFreightService));

// 3. Gemelo Digital / Compras Predictivas (Protegido)
app.post('/api/twin/import-schedule', requireBackendAuth, predictiveService.processSchedule.bind(predictiveService));

// 4. Módulo Ecosistema Avanzado v1 (Protegido)
app.post('/api/v1/compras/parse-xml', requireBackendAuth, async (req, res) => {
  try {
    const { ComprasController } = await import('../../src/lib/controllers/saraAdvancedControllers');
    const result = await ComprasController.parseXml(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/bodega/distribuir', requireBackendAuth, async (req, res) => {
  try {
    const { BodegaController } = await import('../../src/lib/controllers/saraAdvancedControllers');
    const result = await BodegaController.transferir(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/nominas/calcular', requireBackendAuth, async (req, res) => {
  try {
    const { NominaController } = await import('../../src/lib/controllers/saraAdvancedControllers');
    const result = await NominaController.calcular(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/conocimiento/simular-impacto', requireBackendAuth, async (req, res) => {
  try {
    const { VectorKnowledgeService } = await import('../../src/lib/services/vectorKnowledgeService');
    const { itemKey, nuevoPrecio, origen } = req.body;
    const result = await VectorKnowledgeService.registerPriceMutationFromSri(
      itemKey,
      Number(nuevoPrecio),
      origen
    );
    res.status(200).json({ success: true, resultado: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Healthcheck público
app.get('/health', (req, res) => res.status(200).json({ status: 'SARA Ecosystem Online', version: '2.0-Advanced' }));

// Inicio de Servidor
app.listen(PORT, () => {
    console.log(`[🚀 Grupo SARA] Backend orquestado y ejecutándose en puerto ${PORT}`);
});
