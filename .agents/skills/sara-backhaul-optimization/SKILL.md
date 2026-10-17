---
name: sara-backhaul-optimization
description: >-
  Optimización de fletes de retorno (Backhaul) eliminando viajes de vehículos en vacío en transporte pesado.
  Sincroniza desalojos de excavación con aprovisionamiento de áridos en canteras, reduciendo costos logísticos en 25% a 35%.
---

# sara-backhaul-optimization

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-backhaul-optimization`
- **Unidad de Negocio:** SARA Fletes Pesados & Gestión Ambiental
- **Objetivo Estratégico:**
  Eliminar el desperdicio económico y la huella de carbono generada por camiones y volquetas que circulan vacíos en sus trayectos de retorno (*deadhead miles*). Coordina de forma inteligente la sincronización entre volquetas que ingresan a obra con materiales pétreos desde canteras y la evacuación de material de excavación o escombros hacia escombreras municipales autorizadas a lo largo del mismo corredor vial, negociando tarifas con descuentos sustanciales ($25\% - 35\%$).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ordenanzas Municipales de Gestión de Escombros y Residuos de la Construcción (RCD):**
   - Disposición obligatoria de desalojo en escombreras autorizadas con pago de tasa de descargo y emisión del comprobante de disposición final.
   - Prohibición estricta y multas severas por botar escombros en quebradas o vías públicas.
2. **Normas Ambientales del Ministerio del Ambiente, Agua y Transición Ecológica (MAATE):**
   - Cobertura obligatoria con lona hermética en el cajón de la volqueta durante el acarreo de tierras para evitar polución atmosférica.
3. **Regulaciones del MTOP sobre Eficiencia Logística:**
   - Aprovechamiento racional de la capacidad de carga instalada del parque automotor comercial.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Detección de Oportunidades de Retorno en Vacío
1. Monitorear las rutas de despacho activas creadas por `sara-heavy-freight-routing`.
2. Identificar volquetas asignadas al suministro de áridos (Cantera $\rightarrow$ Frente de Obra).
3. Consultar la tabla de `desalojos_pendientes` del mismo frente de obra (ej. tierra de excavación de subsuelos, escombros de demolición).

### Paso 2: Análisis Geográfico de Desvío Angular y Corredor Vial
1. Localizar la escombrera municipal autorizada más próxima a la ruta de retorno hacia la cantera o parqueadero de la volqueta.
2. Calcular la distancia del desvío adicional ($\Delta D_{\text{desvio}}$):
   $$\Delta D_{\text{desvio}} = (D_{\text{obra}\rightarrow\text{escombrera}} + D_{\text{escombrera}\rightarrow\text{cantera}}) - D_{\text{obra}\rightarrow\text{cantera}}$$
3. Si el desvío adicional es $\le 8\,\text{km}$ y el tiempo extra es $\le 25\,\text{minutos}$, calificar el retorno como `BACKHAUL_ALTAMENTE_VIABLE`.

### Paso 3: Negociación Algorítmica de Tarifa y Liquidación de Ahorro
1. En lugar de pagar dos fletes separados (1 flete completo de áridos + 1 flete completo de desalojo):
   $$\text{Costo Separado} = \text{Flete Árido} + \text{Flete Desalojo} = 2 \times F_{\text{base}}$$
2. Aplicar tarifa de flete triangular Backhaul:
   $$\text{Costo Triangular} = F_{\text{base}} + (0.35 \text{ a } 0.45) \times F_{\text{base}}$$
3. Ahorro neto directo para el proyecto:
   $$\text{Ahorro Directo } (USD) = \text{Costo Separado} - \text{Costo Triangular} \quad (\approx 25\% - 35\%)$$
4. Notificar al transportista asignado con el nuevo itinerario enlazado:
   - Parada 1: Descarga de ripio en obra.
   - Parada 2: Carga inmediata de tierra de excavación en el mismo punto con retroexcavadora.
   - Parada 3: Descarga en escombrera municipal con código QR de autorización.

### Paso 4: Registro en Memoria Compartida
1. Registrar el ahorro generado en `SharedMemoryEntry` para alimentar los tableros de eficiencia de costos directos e indirectos.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Visualizador de Ruta Triangular (Loop Logístico):**
   - Diagrama circular estilizado en UI que muestra los tres nodos del viaje (Cantera $\rightarrow$ Obra $\rightarrow$ Escombrera) con flechas continuas y animación de pulso verde esmeralda.
   - Métrica de ahorro destacada en tipografía display titánica: `AHORRO GENERADO: $1,450.00 (-32%)`.
2. **Tarjeta de Sincronización en Tiempo Real:**
   - Vista móvil tipo *Match Card* con los datos de la volqueta y el ticket de escombrera disponible.
3. **Ergonomía:**
   - Botón táctil grande `min-h-[48px]` para "Confirmar Carga de Retorno" con confirmación de un solo swipe.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `fletes_backhaul`: Registro de viajes triangulares coordinados, kilometrajes y tarifas pactadas.
  - `obra_desalojos`: Registro de volúmenes cúbicos de tierra retirados y tickets de escombrera.
  - `shared_memory_entries`: Almacén del ahorro logístico acumulado.
- **Eventos del Bus:**
  - **Consume:** `VOLQUETA_EN_CAMINO_A_OBRA`, `DESALOJO_OBRA_DISPONIBLE`.
  - **Emite:** `BACKHAUL_ENLAZADO`, `AHORRO_LOGISTICO_REGISTRADO`.
- **SharedMemory Key:** `freight:backhaul:project:<proyectoId>:savings`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Optimización Backhaul
```json
{
  "optimizacionId": "bkh-loop-2026-031",
  "proyectoId": "sara-proj-2026-042",
  "volquetaPlaca": "PBA-4892",
  "conductor": "Sr. Segundo Toapanta",
  "itinerarioTriangular": {
    "origenPrimario": "Cantera Pifo (Entrega Áridos)",
    "nodoObra": "Torre Alborada (Descarga Árido / Carga Desalojo)",
    "nodoEscombrera": "Escombrera Municipal Oyacoto (Descarga Tierra)",
    "desvioAdicionalKm": 5.2,
    "tiempoAdicionalMinutos": 18
  },
  "economiaEscalaUSD": {
    "fleteNormalArido": 65.0,
    "fleteNormalDesalojo": 55.0,
    "costoTotalSinBackhaul": 120.0,
    "tarifaNegociadaBackhaul": 82.0,
    "ahorroNetoViaje": 38.0,
    "ahorroPorcentual": 31.67
  },
  "ticketEscombreraMunicipal": "ESC-DMQ-2026-99120",
  "estado": "EN_CURSO"
}
```

### 6.2 Reporte de Ahorro y Gestión Ambiental (PDF)
- Certificado de disposición ambiental adecuada en escombrera reglamentada.
- Resumen financiero de ahorro logístico acumulado transferible al cliente o retenido como utilidad neta del holding.
