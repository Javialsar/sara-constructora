---
name: sara-process-quality-logic-gate
description: >-
  Control de procesos end-to-end, prevención de errores lógicos, invariantes matemáticas y pruebas de calidad (QA) para los 8 módulos de GRUPO SARA.
  Úsese antes de confirmar cambios en agentes, servicios financieros, inventario, nómina o flujos de usuario.
---

# sara-process-quality-logic-gate

## 1. Objetivo de la Skill
Actuar como compuerta de **Control de Procesos y Control de Calidad (QA)** para garantizar que todos los flujos de **GRUPO SARA** sean fáciles de seguir, 100% persistidos en base de datos y libres de errores lógicos, condiciones de carrera o pérdidas de datos.

---

## 2. Invariantes Lógicas y Matemáticas Obligatorias (Zero Logic Errors)

1. **Invariante de Coreografía sin Duplicación (`SaraAgentOrchestrator`):**
   - Cuando se ejecuta `ejecutarFlujoIntegral()`, los eventos publicados en `SaraEventBus` deben marcarse como trazas de corrida síncrona o verificar idempotencia por `(correlationId, eventType, originAgent)` para que los suscriptores reactivos de `init()` no ejecuten cada agente por segunda vez en segundo plano.
   - `SARA-PAGOS` debe esperar la barrera de sincronización (*Join Barrier*) de `LOGISTICA_PROCESADA` y `ALOJAMIENTOS_LOGISTICOS_RESERVADOS` (si `requiereAlojamientoTecnico === true`), y `SARA-INMOBILIARIA` debe ejecutarse después de disponer del costo real de `SARA-APU`.

2. **Invariante de Conservación Financiera en Fideicomiso Escrow (`SARA-PAGOS`):**
   - La suma de los porcentajes de todos los hitos de liberación en [`saraPagos.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/agents/workers/saraPagos.ts) debe ser **siempre igual al $100.0\%$** ($\sum \text{hito}_i = 100\%$). Si el anticipo (`Hito 1`) varía dinámicamente según la regla evolutiva `max_anticipo_pct`, los hitos restantes (`Hito 2`, `Hito 3`, `Hito 4`) deben reescalarse proporcionalmente sobre $(100 - \text{max\_anticipo\_pct})\%$.
   - Ninguna liberación de factura en [`DashboardFinanciero.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/components/sara/DashboardFinanciero.tsx) puede superar el saldo disponible en custodia (`releasedFunds + invoiceAmount <= totalEscrow`).

3. **Invariante de Unicidad y Estado en Pagos (`checkoutService` + `PagosClient`):**
   - Una transacción de pago debe insertarse **una sola vez** en `ordenes_pago` y `transacciones` (en el servidor), nunca duplicarse entre la ruta API y el cliente.
   - Homologar los estados de `ordenes_pago` (`'completado'` / `'completada'`, `'pendiente'`, `'rechazado'`) en toda la aplicación para que ninguna orden pagada se etiquete erróneamente como rechazada.

4. **Invariante de Persistencia Real (Fin de Estado Efímero en Admin y Módulos):**
   - Toda acción administrativa o de campo (aprobar choferes o recargas en [`admin/fletes/page.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/app/admin/fletes/page.tsx), aprobar candidatos en [`admin/talento/page.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/app/admin/talento/page.tsx), guardar el parte diario en [`dashboard/fiscaliza/page.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/app/dashboard/fiscaliza/page.tsx), o fragmentar OCs en [`ApuRequisitionComprasWorkflow.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/components/compras/ApuRequisitionComprasWorkflow.tsx)) debe persistir en Supabase y usar `localStorage` únicamente como caché offline sincronizable.
   - Prohibido sobrescribir nombres reales de base de datos con diccionarios de demostración (`nombresMapeo` en [`fletes-data.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/fletes-data.ts) o `` `Profesional ${idx + 1}` `` en [`talentoService.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/services/talentoService.ts)).

5. **Invariante de Cuadre Contable por Partida Doble:**
   - Todo asiento contable generado por `ThreeWayMatchService`, `IessPayrollService` o `ContabilidadRepository` debe verificar $|\sum \text{Debe} - \sum \text{Haber}| < 0.01\,\text{USD}$ antes de persistirse.
