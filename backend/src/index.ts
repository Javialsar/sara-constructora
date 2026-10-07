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

// Healthcheck
app.get('/health', (req, res) => res.status(200).json({ status: 'SARA Ecosystem Online' }));

// Inicio de Servidor
app.listen(PORT, () => {
    console.log(`[🚀 Grupo SARA] Backend orquestado y ejecutándose en puerto ${PORT}`);
});
