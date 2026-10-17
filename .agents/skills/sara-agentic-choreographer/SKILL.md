---
name: sara-agentic-choreographer
description: >-
  Orquestación central y supervisión de la coreografía de eventos del ecosistema multi-agente de GRUPO SARA.
  Garantiza el flujo reactivo sin intervención humana, maneja reintentos con backoff exponencial y sincroniza la memoria compartida.
---

# sara-agentic-choreographer

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-agentic-choreographer`
- **Unidad de Negocio:** SARA Brain / Núcleo de Orquestación Multi-Agente
- **Objetivo Estratégico:**
  Supervisar, coordinar y garantizar la ejecución reactiva y resiliente de toda la red de agentes autónomos y workers especializados de GRUPO SARA (`SARA-CONSTRUCTORA`, `SARA-APU`, `SARA-MARKETPLACE`, `SARA-FLETES`, `SARA-TALENTOHUMANO`, `SARA-INMOBILIARIA`, `SARA-ALOJAMIENTO`, `SARA-PAGOS`). Controla la precedencia secuencial de eventos del holding, aísla fallos, gestiona reintentos con retroceso exponencial (*exponential backoff con jitter*), registra auditorías de trazas transaccionales (`correlationId`) y sincroniza la capa de memoria unificada (`SharedMemoryEntry`).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Patrón Arquitectónico Enterprise Integration Patterns (EIP):**
   - Publish-Subscribe Channel, Event-Driven Architecture (EDA), Choreography vs Orchestration, Content-Based Router y Dead Letter Channel.
2. **Estándares de Confiabilidad y Disponibilidad (SRE / Google Site Reliability Engineering):**
   - Límites de tiempo de respuesta (SLA per-agent $< 5.000\,\text{ms}$).
   - Circuit Breaker Pattern para prevenir degradación en cascada en la red de agentes.
3. **ISO/IEC 25010 (Calidad de Software y Sistemas):**
   - Tolerancia a fallos, recuperabilidad, integridad de datos e interoperabilidad entre microservicios.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Gestión de la Cadena de Precedencia Transaccional
1. Al crearse un proyecto o dispararse una acción directiva, generar un `correlationId` UUIDv4 único.
2. Supervisar la ejecución de la cadena lineal y en abanico (*fan-out*) establecida:
   $$\begin{aligned}
   \text{PROYECTO\_CREADO} &\longrightarrow \text{APU\_CONSOLIDADO} \\
   &\longrightarrow \text{SUMINISTROS\_ASIGNADOS} \longrightarrow \text{LOGISTICA\_PROCESADA} \\
   &\longrightarrow \text{CONVOCATORIA\_TALENTO\_EMITIDA} \\
   &\longrightarrow \text{ALOJAMIENTOS\_LOGISTICOS\_RESERVADOS} \\
   &\longrightarrow \text{ECOSISTEMA\_FINANCIADO\_Y\_BLINDADO}
   \end{aligned}$$
3. Cada worker que recibe un evento procesa su carga útil (`payload`), actualiza su estado a `completed` y emite el siguiente evento encadenado hacia los destinatarios correspondientes.

### Paso 2: Control de Errores, Aislamiento y Política de Reintentos
1. Monitorear el tiempo de ejecución de cada evento (`executionTimeMs`).
2. Si un agente supera los $5.000\,\text{ms}$ o arroja una excepción no controlada:
   - Registrar el fallo en `sara_agent_events` con `status = 'failed'`.
   - Ejecutar la política de reintento con retroceso exponencial:
     $$T_{\text{espera}} = \min(T_{\text{max}}, T_{\text{base}} \times 2^{\text{intento}}) + \text{jitter}$$
     *(Donde $T_{\text{base}} = 500\,\text{ms}$, $\text{intentos\_max} = 3$)*.
3. Si tras tres (3) intentos el worker continúa fallando:
   - Mover el evento a la cola de contingencia (*Dead Letter Queue* en `sara_dead_letter_events`).
   - Disparar el evento de contingencia alternativa sin detener los demás flujos paralelos no dependientes.
   - Emitir alerta de intervención al Administrador de Sistemas de GRUPO SARA.

### Paso 3: Sincronización y Gobernanza de Memoria Compartida
1. Persistir los resultados consolidados de cada fase en `shared_memory_entries` con su correspondiente `namespace`, `memoryKey` y `confidenceScore`.
2. Garantizar que ningún worker consuma datos con una antigüedad o índice de confianza inconsistente.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Monitor de Coreografía de Agentes en Tiempo Real (`AgentNetworkChoreography.tsx`):**
   - Visualización topológica en grafo o diagrama de red de nodos interactivo.
   - Cada agente se representa con su avatar distintivo, anillo de pulso perimetral verde durante procesamiento activo, línea de flujo de datos animada con partículas luminosas y badge de latencia en milisegundos (`font-mono text-xs text-emerald-400`).
2. **Inspección de Trazas de Eventos (Event Inspector Slide-Over):**
   - Vista lateral de auditoría que permite seleccionar cualquier evento y visualizar su payload JSON formateado con resaltado de sintaxis limpio, marcas de tiempo UTC y tiempo de respuesta.
3. **Ergonomía:**
   - Botón de "Reintentar Flujo Manualmente" con área táctil mínima de 44px para contingencias operativas.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `sara_agent_events`: Registro maestro de eventos despachados, payloads y estados.
  - `shared_memory_entries`: Capa de memoria compartida inter-agente.
  - `src/lib/agents/orchestrator.ts`: Motor de orquestación en TypeScript.
  - `src/lib/agents/event-bus.ts`: Bus asíncrono y despacho pub-sub.
- **Eventos del Bus:**
  - **Supervisa todos los eventos:** `PROYECTO_CREADO`, `APU_CONSOLIDADO`, `SUMINISTROS_ASIGNADOS`, `LOGISTICA_PROCESADA`, `CONVOCATORIA_TALENTO_EMITIDA`, `ANALISIS_INMOBILIARIO_COMPLETO`, `ALOJAMIENTOS_LOGISTICOS_RESERVADOS`, `ECOSISTEMA_FINANCIADO_Y_BLINDADO`.
  - **Emite:** `COREOGRAFIA_COMPLETADA_EXITOSAMENTE`, `ALERTA_EXCEPCION_AGENTE`.
- **SharedMemory Key:** `orchestration:pipeline:<correlationId>:execution_graph`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Traza de Coreografía
```json
{
  "correlationId": "cor-a82f-4b11-9e23-71cd02a83f12",
  "proyectoId": "sara-proj-2026-042",
  "estadoGeneral": "COMPLETADO_EXITOSO",
  "tiempoTotalEjecucionMs": 1420,
  "cadenaEventos": [
    {
      "paso": 1,
      "eventType": "PROYECTO_CREADO",
      "originAgent": "SARA-CONSTRUCTORA",
      "targetAgents": ["SARA-APU"],
      "latenciaMs": 180,
      "status": "completed"
    },
    {
      "paso": 2,
      "eventType": "APU_CONSOLIDADO",
      "originAgent": "SARA-APU",
      "targetAgents": ["SARA-MARKETPLACE", "SARA-TALENTOHUMANO"],
      "latenciaMs": 420,
      "status": "completed"
    },
    {
      "paso": 3,
      "eventType": "LOGISTICA_PROCESADA",
      "originAgent": "SARA-FLETES",
      "targetAgents": ["SARA-PAGOS"],
      "latenciaMs": 210,
      "status": "completed"
    },
    {
      "paso": 4,
      "eventType": "ECOSISTEMA_FINANCIADO_Y_BLINDADO",
      "originAgent": "SARA-PAGOS",
      "targetAgents": ["SARA-CONSTRUCTORA"],
      "latenciaMs": 610,
      "status": "completed"
    }
  ],
  "memoriaCompartidaActualizada": true,
  "incidentesRegistrados": 0
}
```

### 6.2 Reporte de Diagnóstico y Telemetría del Sistema (PDF)
- Diagrama de flujo transaccional con tiempos de respuesta por micro-agente.
- Estadísticas de throughput, p95 y p99 de tiempos de despacho.
- Certificación de inmutabilidad de la cadena de eventos de GRUPO SARA.
