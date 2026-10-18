import express from 'express';
import cors from 'cors';
import { escrowService } from './services/escrowService';
import { uberFreightService } from './services/uberFreightService';
import { predictiveService } from './services/predictiveDigitalTwin';
// import { saraTalentoService } from './services/saraTalentoService'; // Asumiendo que el agente terminó
// import { logisticsService } from './services/logisticsService'; // Asumiendo que el agente terminó

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS GRUPO SARA - MÓDULOS UNIFICADOS
// ==========================================

// 1. Módulo Fintech & Escrow
app.post('/api/escrow/create', escrowService.createEscrow.bind(escrowService));
app.post('/api/escrow/release', escrowService.releaseFunds.bind(escrowService));
app.post('/api/escrow/dispute', escrowService.disputeAndRefund.bind(escrowService));

// 2. Módulo Red Agéntica de Fletes (Tipo Uber)
app.post('/api/freight/broadcast', uberFreightService.broadcastFreight.bind(uberFreightService));
app.post('/api/freight/offer', uberFreightService.submitDriverOffer.bind(uberFreightService));

// 3. Gemelo Digital / Compras Predictivas (Importador)
app.post('/api/twin/import-schedule', predictiveService.processSchedule.bind(predictiveService));

// 4. Módulo Ecosistema Avanzado v1 (Orquestación, Three-Way Match, Kardex Multibodega, Nómina IESS)
app.post('/api/v1/compras/parse-xml', async (req, res) => {
  try {
    const { ComprasController } = await import('../../src/lib/controllers/saraAdvancedControllers');
    const result = await ComprasController.parseXml(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/bodega/distribuir', async (req, res) => {
  try {
    const { BodegaController } = await import('../../src/lib/controllers/saraAdvancedControllers');
    const result = await BodegaController.transferir(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/nominas/calcular', async (req, res) => {
  try {
    const { NominaController } = await import('../../src/lib/controllers/saraAdvancedControllers');
    const result = await NominaController.calcular(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/conocimiento/simular-impacto', async (req, res) => {
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

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'SARA Ecosystem Online', version: '2.0-Advanced' }));

// Inicio de Servidor
app.listen(PORT, () => {
    console.log(`[🚀 Grupo SARA] Backend orquestado y ejecutándose en puerto ${PORT}`);
});

