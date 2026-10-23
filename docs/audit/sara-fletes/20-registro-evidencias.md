# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 20. Registro de Evidencias Técnicas Reproducibles

**Documento:** 20 de 21  
**Alcance:** Comandos exactos, salidas de consola, trazas de ejecución y pruebas de concepto (PoC).  

---

### 1. Evidencia de Ejecución de Suites Automatizadas

#### Comando 1: Verificación de Estado de Git
```powershell
PS D:\SaS_Proyectos\sara-constructora> git status
On branch master
nothing to commit, working tree clean
```

#### Comando 2: Ejecución de Test Suite Especializada SARA-FLETES V2
```powershell
PS D:\SaS_Proyectos\sara-constructora> npx tsx --env-file=.env.local tests/run-sara-fletes-audit-suite.ts

===============================================================
   EJECUTANDO SUITE DE AUDITORÍA INDEPENDIENTE: SARA-FLETES V2   
===============================================================

--- 1. Tarificación Dinámica, Tarifas Mínimas y Factores de Material ---
  [PASS] [FLT-PRC-001] Flete local urbano aplica tarifa base urbana sin recargos pesados
  [PASS] [FLT-PRC-002] Tarifa mínima de $2.00 USD garantizada para distancias ínfimas
  [PASS] [FLT-PRC-003] Recargo de complejidad para Varillas de Acero (factor ~1.15)
  [PASS] [FLT-PRC-004] Renta por 4 horas con chofer calcula base + suplemento + seguro
  [PASS] [FLT-PRC-005] Descuento del 20% aplicado automáticamente en renta semanal (>= 7 días)

--- 2. Ciberseguridad Telemática, Filtro Cinemático y Mock GPS ---
  [PASS] [FLT-SEC-001] Telemetría cinemática plausible aprobada con ThreatLevel LOW
  [PASS] [FLT-SEC-002] Detección y bloqueo de salto cinemático imposible (>130 km/h) como CRITICAL
  [PASS] [FLT-SEC-003] Detección de Mock Location por precisión fija de 0.0m reportada
  [PASS] [FLT-SEC-004] Rechazo de telemetría corrupta o desordenada en el tiempo (Delta <= 0 ms)

--- 3. Conformidad Técnica MTOP, PBV y Balanzas Estatales ---
  [PASS] [FLT-MTP-001] Carga de 13T en Volqueta V3A dentro de norma legal MTOP (PBV <= 27T)
  [PASS] [FLT-MTP-002] Detección automática de sobrepeso ilegal (+2.5T) y sanción calculada según SBU 2026 ($482)
  [PASS] [FLT-MTP-003] Identificación de balanzas oficiales de pesaje en corredor Quito-Latacunga

--- 4. Infraestructura Geográfica y Geocodificación Estratégica ---
  [PASS] [FLT-GEO-001] Puntos portuarios estratégicos de comercio exterior georreferenciados
  [PASS] [FLT-GEO-002] Fórmula de Haversine calibrada (Quito - Guayaquil en ~265 - 280 km geodésicos)

===============================================================
RESULTADO DE LA SUITE SARA-FLETES: 14 PASADOS | 0 FALLADOS (TOTAL: 14)
===============================================================
```

#### Comando 3: Ejecución de Test Suite de Red-Teaming y Ecosistema
```powershell
PS D:\SaS_Proyectos\sara-constructora> npx tsx --env-file=.env.local tests/run-ecosystem-security-tests.ts

===============================================================
   INICIANDO TEST SUITE & RED-TEAMING: ECOSISTEMA GRUPO SARA   
===============================================================

--- 1. Pruebas de Resiliencia ante Ataques XXE & XML Malformado ---
  [PASS] Mitigación de Inyección XXE en Facturas SRI

--- 2. Pruebas de Prevención de Fraude en Facturas (3-Way Match) ---
  [PASS] Detección Automática de Sobrecargo / Fraude en Factura de Proveedor

--- 3. Pruebas de Integridad de Nómina y Retenciones IESS Ecuador ---
  [PASS] Cálculo de Sueldo Ganado Base
  [PASS] Cálculo de Horas Suplementarias con Recargo Ley (50%)
  [PASS] Cálculo de Aporte Personal IESS (9.45%)
  [PASS] Cálculo de Aporte Patronal IESS (12.15% + SECAP)
  [PASS] Neto a Transferir al Trabajador

--- 4. Pruebas de Sincronización Bodega ↔ Fletes y Liquidación ---
  [PASS] Catálogo de Red de Choferes SARA-Fletes Disponible
  [PASS] Persistencia de Calificación y Liquidación de Flete

--- 5. Verificación de Agente Auditor de Base de Datos ---
  [PASS] Tasa de Integridad de Persistencia Global (100%)
  [PASS] Monitoreo de 8 Módulos Clave del Ecosistema

===============================================================
RESULTADO DE LA SUITE: 11 PASADOS | 0 FALLADOS
===============================================================
```

---

### 2. Evidencias de Código Auditado

1. **Evidencia de Fallback a LocalStorage en Billetera:**
   - Archivo: `src/lib/fletes-data.ts`, líneas 248-254.
   - Demostración de persistencia local desprotegida susceptible de manipulación por el usuario en DevTools.
2. **Evidencia de Modal de Pago Simulado sin Tokenización:**
   - Archivo: `src/components/fletes/SaraFreightPaymentGatewayModal.tsx`, líneas 85-139.
   - Demostración de campos de tarjeta sin cifrado de hardware y simulación con `setTimeout`.
3. **Evidencia de BOLA en Débito por Placa:**
   - Archivo: `src/app/actions/saraFletesWalletActions.ts`, líneas 147-153.
   - Consulta `placa.eq.${request.plate}` sin relación con el usuario de sesión (`auth.uid()`).
