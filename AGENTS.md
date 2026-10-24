<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Gobernanza y Arquitectura Multi-Agente — Ecosistema GRUPO SARA

Actúa como **Orquestador Central Autónomo (`SARA-BRAIN` / `SaraAgentOrchestrator`)** para todo el ecosistema empresarial de **GRUPO SARA**. Avanza de forma proactiva e integral en el diseño e implementación de Base de Datos (Supabase/PostgreSQL), Backend (Server Actions / API Routes / Bus de Eventos) y Frontend (Next.js App Router + PWA Offline-First), delegando tareas complejas a subagentes especializados (`self` o subagentes de dominio) sin requerir confirmación manual paso a paso para operaciones estándar de desarrollo.

---

## 1. Red de Agentes Especializados de Negocio (`src/lib/agents/`)

Cada unidad de negocio cuenta con un agente autónomo especializado y sus *skills* de ingeniería, finanzas, seguridad y logística ecuatoriana asociadas:

1. **`SARA-CONSTRUCTORA` (`saraConstructora.ts`) — Dirección Técnica, BIM y Fiscalización de Obra**
   - **Rol:** Estructuración raíz de proyectos civiles con zonificación sísmica NEC-15 (`NEC-SE-DS`), geolocalización satelital GPS, contenedores BIM bajo ISO 19650 (`IFC4` / `CDE`), Libro de Obra electrónico y auditoría SST.
   - **Skills Asociadas:** `sara-bim-ifc-parser`, `sara-takeoff-geometric-estimator`, `sara-field-inspection-geolog`, `sara-construction-governance`, `sara-safety-compliance-secap`, `sara-contractor-progress-billing`, `sara-regulatory-compliance-2026`.
   - **Evento Principal Emitido:** `PROYECTO_CREADO`.

2. **`SARA-APU` (`saraApu.ts`) — Ingeniería de Costos, Presupuestos y Licitación Pública (SERCOP)**
   - **Rol:** Cómputo volumétrico, análisis de precios unitarios (APU) con rendimientos calibrados por provincia del Ecuador, costos indirectos AIU, Fórmula Polinómica de reajuste de precios (INEC IPCO con $\sum p_i = 1.000$ y $p_x \le 0.200$), Desagregación Tecnológica y Valor Agregado Ecuatoriano (VAE).
   - **Skills Asociadas:** `sara-apu-ecuadorian-engineering`, `sara-indirects-polynomial-formula`, `sara-vae-calculator-compliance`, `sara-sercop-tender-intelligence`, `sara-machinery-caterpillar-costing`, `sara-evolutionary-yield-tuner`, `sara-regulatory-compliance-2026`.
   - **Evento Principal Emitido:** `APU_CONSOLIDADO`.

3. **`SARA-MARKETPLACE` (`saraMarketplace.ts`, `saraSellerOnboardingGuard.ts`, `saraCatalogIngestionEngine.ts`, `saraMarketplaceEscrowSettler.ts`, `saraKardexInventory.ts`, `saraPredictivePurchase.ts`) — Marketplace B2B de Doble Vía, Abastecimiento Mayorista y Seller Hub**
   - **Rol:** Plataforma de doble vía con exposición priorizada por planes de membresía (**VIP Fábrica 1.8%**, **Distribuidor Pro 3.5%**, **Ferretería Básica 6.0%**), cruce automático de materiales requeridos con proveedores mayoristas geolocalizados (*Landed Cost* con factor de sinuosidad vial $1.35$), tarifas diferenciadas de IVA ($5\%$ materiales de construcción Res. NAC-DGERCGC24-00000013 vs $15\%$ general), validación SRI Módulo 11, ingesta multicanal (Excel .xlsx y API REST para ERPs), custodia en Fideicomiso Escrow con dispersión contra recepción en obra y control Kardex Multibodega (NIC 2: CPP, $EOQ$, $ROP$).
   - **Skills Asociadas:** `sara-regulatory-compliance-2026`, `sara-process-quality-logic-gate`, `sara-enterprise-security-zero-trust`.
   - **Eventos Principales Emitidos:** `SUMINISTROS_ASIGNADOS`, `SELLER_EMPRESA_REGISTRADA`, `CATALOGO_MASIVO_INGESTADO`, `COMPRA_MARKETPLACE_CONCRETADA`, `LIQUIDACION_PROVEEDOR_EMITIDA`.

4. **`SARA-FLETES` (`saraFletes.ts`) — Logística de Carga Pesada, Ruteo MTOP y Optimización Backhaul**
   - **Rol:** Cubicación de carga total (abastecimiento de insumos + desalojo de excavación), asignación de flota pesada bajo Tabla Nacional de Pesos y Dimensiones MTOP (`2DB` $18\,\text{T}$, `V3A` Volqueta $14\,\text{m}^3$ / $27\,\text{T}$, `3S2` $48\,\text{T}$, `3S3` $51\,\text{T}$ PBV), peajes interprovinciales, liquidación inmediata y sincronización de retorno (*Backhaul*) para eliminar viajes en vacío.
   - **Skills Asociadas:** `sara-heavy-freight-routing`, `sara-backhaul-optimization`, `sara-regulatory-compliance-2026`.
   - **Evento Principal Emitido:** `LOGISTICA_PROCESADA`.

5. **`SARA-TALENTOHUMANO` (`saraTalentoHumano.ts`) — Reclutamiento Push-to-Work y Nómina de Construcción**
   - **Rol:** Selección geolocalizada de cuadrillas y especialistas, validación de certificaciones SECAP y normativa SST (**Decreto Ejecutivo 255** + **Resolución CD 513 IESS**), y cálculo de nómina y cargas prestacionales bajo el SBU vigente ($470 en 2025 / **$482 en 2026** Acuerdo MDT-2025-195, aporte personal $9.45\%$, patronal construcción $12.15\%$, fondos de reserva $8.33\%$).
   - **Skills Asociadas:** `sara-construction-labor-matching`, `sara-safety-compliance-secap`, `sara-regulatory-compliance-2026`.
   - **Evento Principal Emitido:** `CONVOCATORIA_TALENTO_EMITIDA`.

6. **`SARA-INMOBILIARIA` (`saraInmobiliaria.ts`) — Tasación Econométrica, Plusvalía y Corretaje Comercial**
   - **Rol:** Valuación de suelo y activos inmobiliarios por zona geográfica (`zoneKey` dinámica) bajo normas **IVS 2025**, modelado de Flujo de Caja Descontado (**VAN / TIR**), predicción de velocidad de absorción comercial y precalificación hipotecaria automática (**BIESS Vivienda Premier $2.99\%$**, **VIS/VIP $4.99\%$** y Banca Privada).
   - **Skills Asociadas:** `sara-realestate-market-absorption`, `sara-broker-lead-conversion`, `sara-regulatory-compliance-2026`.
   - **Evento Principal Emitido:** `ANALISIS_INMOBILIARIO_COMPLETO`.

7. **`SARA-ALOJAMIENTO` (`saraAlojamiento.ts`) — Campamentos Técnicos, Corporate Housing y Revenue Management**
   - **Rol:** Reserva automatizada de alojamiento corporativo para personal técnico foráneo, gestión de cerraduras inteligentes con PIN autónomo, métricas globales **USALI** (*ADR, Occupancy Rate, RevPAR, ALOS*) y aplicación de IVA Turístico del Ecuador ($15\%$ ordinario / **$8\%$ en feriados nacionales** con Registro MINTUR y LUAF).
   - **Skills Asociadas:** `sara-stays-dynamic-pricing`, `sara-stays-corporate-housing`, `sara-regulatory-compliance-2026`.
   - **Evento Principal Emitido:** `ALOJAMIENTOS_LOGISTICOS_RESERVADOS`.

8. **`SARA-PAGOS` (`saraPagos.ts`, `saraFinancialQuant.ts`) — Fideicomiso Escrow, Gobernanza SRI, UAFE y Liquidez Cuantitativa**
   - **Rol:** Blindaje financiero mediante cuentas de custodia *Escrow* con hitos reescalables que suman exactamente $100\%$, conciliación *Three-Way Match* ($\le 1.0\%$), validación de Comprobantes Electrónicos SRI (dígito verificador **Módulo 11** + firma XAdES-BES), retenciones vigentes (Cód. `344` Obra Civil **$2.00\%$ IR** y **$30\%$ IVA**; Cód. `312` Materiales **$1.75\%$ IR**; `RIMPE` **$1.00\%$ / $0\%$**), monitoreo antilavado **UAFE** (umbral **RESU $\ge \$10,000\,\text{USD}$**) y pruebas de estrés de liquidez (*CFCR* a 30/60/90 días).
   - **Skills Asociadas:** `sara-sri-tax-escrow-governance`, `sara-cashflow-liquidity-stress`, `sara-regulatory-compliance-2026`, `sara-enterprise-security-zero-trust`.
   - **Evento Principal Emitido:** `ECOSISTEMA_FINANCIADO_Y_BLINDADO`.

---

## 2. Escuadrón Transversal de Gobernanza, Seguridad, Calidad y Diseño

1. **`sara-systems-process-qa-auditor` (`sara-process-quality-logic-gate`):**
   - Supervisa la arquitectura de sistemas, elimina cuellos de botella de procesos, garantiza persistencia real en Supabase (cero mutaciones efímeras solo en estado local) y verifica invariantes matemáticas.
2. **`sara-redteam-security-hacker` (`sara-enterprise-security-zero-trust`):**
   - Audita continuamente API Routes y Server Actions bajo arquitectura Zero-Trust, exigiendo verificación de sesión/rol vía `app_metadata` o BD antes de usar `service_role`, bloqueos transaccionales `FOR UPDATE` en Kardex/Escrow y sanitización anti-XSS/XXE.
3. **`sara-enterprise-uiux-auditor` (`sara-enterprise-uiux-uniformity`):**
   - Garantiza uniformidad visual super-empresarial en los 8 módulos (`<ModuleTopBar />` con App Launcher, temas oscuro/claro sin inversión destructiva de blancos, `font-display` + `font-mono tabular-nums`, touch targets $\ge 44\times44\,\text{px}$ y cero `window.alert`).
4. **`sara-domain-standards-researcher` (`sara-regulatory-compliance-2026`):**
   - Verifica y actualiza permanentemente el cumplimiento normativo frente a SERCOP, INEC, NEC-15, ISO 19650, MTOP, IESS/MDT, SRI, UAFE, BIESS/IVS y USALI.

---

## 3. Coreografía Transaccional y Memoria Compartida (`sara-agentic-choreographer`)

Toda operación transversal entre módulos debe respetar la cadena reactiva de eventos sin duplicación entre modo imperativo y reactivo, persistiendo su contexto en `sara_agent_memory` y `sara_agent_events` con un `correlationId` único:

1. `PROYECTO_CREADO` $\rightarrow$ Dispara a `SARA-APU`.
2. `APU_CONSOLIDADO` $\rightarrow$ Dispara en paralelo a `SARA-INMOBILIARIA` (con el costo real de obra ya calculado), `SARA-MARKETPLACE` y `SARA-TALENTOHUMANO`.
3. `SUMINISTROS_ASIGNADOS` $\rightarrow$ Dispara a `SARA-FLETES` (cubicación de suministros + desalojo, ruteo MTOP y *Backhaul*).
4. `CONVOCATORIA_TALENTO_EMITIDA` $\rightarrow$ Dispara a `SARA-ALOJAMIENTO` cuando existe personal foráneo (`requiereAlojamientoTecnico === true`).
5. **Barrera de Sincronización (*Join Barrier*):** `LOGISTICA_PROCESADA` + `ALOJAMIENTOS_LOGISTICOS_RESERVADOS` (o exención local) $\rightarrow$ Dispara a `SARA-PAGOS` para constituir el fideicomiso *Escrow*, validar umbrales UAFE y emitir `ECOSISTEMA_FINANCIADO_Y_BLINDADO`.
6. **Cierre de Obra:** `SaraLearningEngine` ejecuta `CICLO_APRENDIZAJE_FINALIZADO`, calibrando rendimientos de APU, tiempos logísticos y costos reales en `sara_agent_knowledge_base`.
