# INFORME MAESTRO DE AUDITORÍA PROFUNDA Y EVOLUCIÓN EMPRESARIAL
## Módulo: SARA-CONSTRUCTORA (Ecosistema Empresarial GRUPO SARA)

- **Fecha de Auditoría:** 23 de Octubre de 2026
- **Auditor Líder:** Principal Software Architect & Multi-Agent Orchestrator
- **Entorno Evaluado:** Repositorio Oficial `sara-constructora` / Landing `https://sara-constructora.vercel.app/constructora` / Suite `/constructora/suite`
- **Modo de Ejecución:** FASE 1 — Auditoría Exhaustiva de Solo Lectura (Read-Only)
- **Estado de TypeScript del Proyecto:** Compilación limpia sin errores (`npx tsc --noEmit` -> Exit Code 0)

---

## 1. Resumen Ejecutivo

El módulo **SARA-CONSTRUCTORA** representa la columna vertebral técnica del holding ecuatoriano **GRUPO SARA**. La auditoría técnica y arquitectónica profunda de solo lectura revela una dualidad marcada en el sistema:

1. **Ingeniería Conceptual y Lógica de Negocio Sólida:**
   - La modelación matemática de costos, compras predictivas (`Landed Cost` con factor de sinuosidad vial de $1.35$), retenciones tributarias del SRI (códigos `312` $1.75\%$ en materiales, `344` $2.00\%$ en obra civil, `303` $10.0\%$ en honorarios y régimen RIMPE), asientos contables por partida doble, cálculo de nómina de construcción bajo la normativa del IESS (SBU 2026 en $\$482.00$, aporte patronal $12.15\%$, fondos de reserva $8.33\%$ y décimos) y la Fórmula Polinómica de reajuste de precios del SERCOP/INEC ($\sum p_i = 1.000$ y $p_x \le 0.200$) están **correctamente formuladas en código TypeScript puro**.

2. **Brecha Crítica de Persistencia y Seguridad (Fachada / Simulación):**
   - A pesar de contar con esquemas DDL exhaustivos en PostgreSQL (`supabase/sara_ecosistema_avanzado_ddl.sql`), las operaciones clave de la interfaz en `/constructora/suite` (**Kardex Multibodega**, **Órdenes de Compra**, **Devoluciones de Mercadería**, **Suscripciones de Clientes**, y **Auditoría de Datos**) **no están persistiendo transaccionalmente en Supabase**. En su lugar, el frontend almacena los datos en el `localStorage` del navegador o en variables estáticas en memoria (`Map`, arrays locales).
   - El servicio `SaraDatabaseAuditorService` genera un panel simulado que muestra un falso estado `SINCRONIZADO 100%` con supuesta latencia de `32ms`, incluso cuando la base de datos remota no es consultada.
   - Existe una vulnerabilidad crítica de **Aislamiento Horizontal (IDOR / BOLA)** en `/portal/dashboard`: la consulta `supabase.from("proyectos").select("*")` carga todos los proyectos de la base de datos sin filtrar por el `cliente_id` del usuario autenticado, exponiendo obras, avances fotográficos y documentos técnicos privados de terceros.
   - Las capacidades publicitadas de **Visor BIM 3D con extracción de volumetrías IFC/Revit** y **Cerebro Vectorial de Inteligencia Artificial** son simulaciones visuales con transformaciones CSS 3D (`perspective: 1000px`) y un almacén estático en memoria (`Map`), sin integración de parsers IFC reales (`web-ifc`) ni bases vectoriales (`pgvector`).
   - La validación de firma electrónica **XAdES-BES** se limita a comprobar la presencia de cadenas de texto (`includes('<Signature')`), lo que permite eludir la validación con XMLs manipulados.

---

## 2. Inventario Real de Tecnologías y Dependencias

| Categoría | Tecnología / Paquete | Versión Real | Propósito en el Código |
|---|---|---|---|
| **Framework Base** | Next.js (App Router) | `16.3.4` | Enrutamiento, Server Actions, API Routes |
| **Biblioteca UI** | React / React DOM | `19.2.8` | Renderizado reactivo y Server Components |
| **Lenguaje** | TypeScript | `^5` | Tipado estático (Verificado: 0 errores en `tsc`) |
| **Estilos** | TailwindCSS + PostCSS | `^4` | Motor de estilos atómico |
| **BaaS / Base de Datos** | `@supabase/ssr` / `@supabase/supabase-js` | `0.12.7` / `2.116.0` | Cliente Supabase para Browser y Server |
| **Driver PostgreSQL** | `pg` | `^8.23.0` | Conexión directa a PostgreSQL (scripts auxiliares) |
| **Animación & Gestos** | `framer-motion` | `^13.2.0` | Transiciones UI y Splash Screen de entrada |
| **Mapas Geoespaciales** | `leaflet` / `react-leaflet` | `^1.9.4` / `^5.0.0` | Georreferenciación de obras y fletes |
| **Generación Documental** | `jspdf` / `jspdf-autotable` | `^4.2.1` / `^5.0.8` | Generación de reportes PDF |
| **Gestión de Formularios** | `react-hook-form` / `@hookform/resolvers` | `^7.88.0` / `^5.9.1` | Validación de entradas |
| **Validación de Esquemas** | `zod` | `^4.6.5` | Validación de contratos de datos y payloads API |
| **Pasarela de Pagos** | `stripe` / `@stripe/stripe-js` | `^23.0.0` / `^10.0.0` | Pagos internacionales con tarjeta |
| **Soporte PWA** | `@ducanh2912/next-pwa` | `^10.2.9` | Service Worker y modo Offline |

---

## 3. Mapa de Arquitectura Actual

```
                        [ Cliente Web / Navegador / PWA ]
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
[ Rutas Públicas ]                                            [ Suite Privada ]
/constructora                                                 /constructora/suite
/constructora/auth                                            /portal/dashboard
/portal (Login)                                               /admin / /dashboard
        │                                                             │
        ▼                                                             ▼
[ Componentes Landing ]                                       [ Vistas Operativas ]
ConstructoraIntro (Splash 2s)                                 ConstructoraDashboardView
ConstructoraSuiteSection                                      MisProyectosSection
ContactoSection (Cotizaciones)                                BodegaKardexSection
        │                                                             │
        ├──────────────────────────────┬──────────────────────────────┤
        ▼                              ▼                              ▼
[ Server Actions ]             [ Next.js API Routes ]         [ Servicios en Memoria ]
src/app/actions/leads.ts       /api/v1/compras/parse-xml      threeWayMatchService
src/app/actions/public.ts      /api/v1/bodega/distribuir      kardexMultibodegaService
src/app/actions/admin.ts       /api/v1/nominas/calcular       iessPayrollService
                               /api/bim/takeoff               vectorKnowledgeService
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
                       ┌──────────────────────────────┐
                       │    Supabase (PostgreSQL)     │
                       ├──────────────────────────────┤
                       │ tablas: proyectos, avances,  │
                       │ cotizaciones, clientes,      │
                       │ parametros_globales          │
                       └──────────────────────────────┘
                                       ▲
                 (Desconectadas o en localStorage en el Frontend):
                 bodegas, kardex_multibodega, kardex_movimientos,
                 ordenes_compra, facturas_sri, asientos_contables.
```

---

## 4. Matriz de Capacidades: Publicidad vs Realidad

| # | Capacidad Anunciada | Estado | Evidencia Concreta en Código | Veredicto Técnico |
|---|---|---|---|---|
| 1 | Solicitud de cotizaciones y proyectos | **CONFIRMADA** | `src/app/actions/public.ts`, `ContactoSection.tsx`. Inserta en tabla `cotizaciones`. | Operativo contra Supabase. |
| 2 | Portal de clientes privado | **PARCIAL / INSEGURO** | `src/app/(public)/portal/dashboard/page.tsx`. Permite login, pero ejecuta `select('*')` sin aislar por `cliente_id`. | Vulnerabilidad IDOR crítica. |
| 3 | Portafolio y mapa interactivo | **PARCIAL** | `ProjectsMap.tsx`. Leaflet embebido. Bug en inicialización de `customIcon` provoca bloqueo en "Cargando mapa...". | Requiere corrección en SSR/Hydration. |
| 4 | Consola técnica de construcción | **PARCIAL** | `/constructora/suite` (`EcosistemaAvanzadoPage`). Interfaz visual completa con pestañas técnicas. | Lógica visual rica, persistencia desconectada. |
| 5 | Three-Way Match SRI (XML vs OC vs Bodega) | **PARCIAL** | `threeWayMatchService.ts` calcula varianza $\le 1\%$, pero `localStorage` guarda devoluciones. No persiste en PostgreSQL. | Algoritmo real, almacenamiento efímero. |
| 6 | Retenciones SRI, firma electrónica y asientos | **PARCIAL** | Retenciones y partida doble correctas. Firma XAdES-BES solo verifica etiquetas `<Signature>` por texto plano. | Sin validación criptográfica real. |
| 7 | Kardex Multibodega CPP, EOQ y ROP | **SIMULADA** | `BodegaKardexSection.tsx` utiliza arrays estáticos en React state. No invoca a la tabla `kardex_multibodega`. | Interfaz simulada desconectada de BD. |
| 8 | Nómina IESS, tareo y costo en APU | **PARCIAL** | `iessPayrollService.ts` aplica fórmulas legales exactas (SBU $482, 12.15% patronal). No persiste planillas cerradas. | Fórmulas válidas sin persistencia oficial. |
| 9 | Compras predictivas y Landed Cost | **PARCIAL** | `predictivePurchaseService.ts` modela Haversine y sinuosidad vial. Ahorros del 8%-12% son fijos de prueba. | Modelo analítico funcional con datos mock. |
| 10 | Integración logística interprovincial | **CONFIRMADA** | Sincronización con `saraFletesSyncService.ts` y tablas MTOP de pesos por eje. | Enlazado funcionalmente con el módulo de fletes. |
| 11 | Integración de cantidades BIM (IFC / Revit) | **SIMULADA** | `src/app/dashboard/bim/page.tsx` utiliza cubos CSS 3D (`perspective: 1000px`) y un `alert()` para el Add-in. | Sin motor WebGL/Three.js ni parser IFC. |
| 12 | IA para gobierno de precios y vectores | **SIMULADA** | `vectorKnowledgeService.ts` usa un `new Map()` en memoria con 3 insumos predefinidos. Cero embeddings o pgvector. | Sin modelos de machine learning ni embeddings. |
| 13 | Arquitectura distribuida por eventos (EDA) | **CONFIRMADA** | `SaraEventBus` en `event-bus.ts` emite eventos tipados y persiste auditoría en `sara_agent_events`. | Bus de eventos transaccional implementado. |

---

## 5. Top 10 Hallazgos de Mayor Impacto (Riesgos y Soluciones)

### Hallazgo 1: Exposición Horizontal de Proyectos y Planos Privados (IDOR / BOLA)
- **Área:** Seguridad / Portal de Clientes.
- **Estado:** CONFIRMADA.
- **Severidad:** **P0 — Crítico**.
- **Archivo:** `src/app/(public)/portal/dashboard/page.tsx` (L144-153).
- **Evidencia:** `loadClientData()` ejecuta `supabase.from("proyectos").select("*")` sin cláusula `.eq('cliente_id', user.id)`. Cualquier cliente autenticado visualiza todos los proyectos, avances fotográficos confidenciales y planos técnicos de otras empresas.
- **Impacto:** Violación flagrante de confidencialidad, Ley Orgánica de Protección de Datos Personales del Ecuador y riesgo de fuga de propiedad intelectual arquitectónica.
- **Solución Propuesta:** Filtrar estrictamente por `cliente_id` en el query del cliente y corregir las políticas RLS en PostgreSQL eliminando `CREATE POLICY "proyectos_select_public" ON proyectos FOR SELECT USING (true);`.

---

### Hallazgo 2: Falsa Verificación de Firma Electrónica XAdES-BES en Facturas SRI
- **Área:** Facturación SRI & Auditoría Tributaria.
- **Estado:** CONFIRMADA.
- **Severidad:** **P0 — Crítico**.
- **Archivo:** `src/lib/services/sriXmlService.ts` (L126-128).
- **Evidencia:**
  ```typescript
  const hasSignature = cleanXml.includes('ds:Signature') || cleanXml.includes('<Signature');
  const hasCertificate = cleanXml.includes('ds:X509Certificate') || cleanXml.includes('<X509Certificate');
  const firmaDigitalValida = hasSignature && hasCertificate;
  ```
- **Impacto:** Cualquier atacante puede enviar un XML tributario con etiquetas `<Signature><X509Certificate>falso</X509Certificate></Signature>` y el sistema lo certifica como válido, permitiendo fraude en el Three-Way Match.
- **Solución Propuesta:** Integrar validación de certificados X.509 real (verificación de cadena de confianza con los PSC del Ecuador: BCE, Security Data, ANFAC, Uanataca) o desacoplar a un worker de validación de firma criptográfica mediante PKI.

---

### Hallazgo 3: Persistencia Fantasma e Informe Simulado en Auditoría de Base de Datos
- **Área:** Supabase & Integridad de Datos.
- **Estado:** CONFIRMADA.
- **Severidad:** **P0 — Crítico**.
- **Archivo:** `src/lib/services/saraDatabaseAuditorService.ts` (L55-195).
- **Evidencia:** Para 5 de las 8 tablas operativas (`kardex_movimientos`, `ordenes_compra`, `devoluciones`, `fletes_solicitudes`, `empresa_configuracion`), el código nunca invoca a Supabase; toma la cantidad del `localStorage`, le asigna `registrosRemotos = localCount`, hardcodea `estado: 'SINCRONIZADO'` e imprime `mensajesAgente.push('✅ Supabase conectado con latencia de 32ms.')`.
- **Impacto:** Crea una falsa sensación de seguridad e integridad técnica en la gerencia; si el usuario borra la caché o cambia de navegador, pierde todo el inventario, recepciones y devoluciones.
- **Solución Propuesta:** Conectar `BodegaKardexSection.tsx` directamente con los repositorios `KardexRepository`, `ComprasRepository` y `ContabilidadRepository`, eliminando las respuestas sintéticas del auditor.

---

### Hallazgo 4: Descargas de Documentos Técnicos Simuladas con `alert()`
- **Área:** Gestor Documental / Seguridad de Archivos.
- **Estado:** CONFIRMADA.
- **Severidad:** **P1 — Alto**.
- **Archivo:** `src/components/constructora/MisProyectosSection.tsx` (L926-928) y `ApuRequisitionComprasWorkflow.tsx` (L698).
- **Evidencia:**
  ```typescript
  const handleDescargarDocSimulado = (doc: any) => {
    alert(`Descargando archivo oficial "${doc.nombre_archivo || doc.titulo}" (${doc.peso || '4.5 MB'}) del proyecto "${doc.proyecto_nombre}".`);
  };
  ```
- **Impacto:** Los residentes de obra y fiscalizadores no pueden descargar planos reales en campo ni expedientes técnicos desde la nube; la acción bloquea la interfaz con un diálogo emergente nativo.
- **Solución Propuesta:** Conectar con Supabase Storage generando URLs firmadas de corta duración (`supabase.storage.from('documentos_obra').createSignedUrl(path, 300)`) con headers de Content-Disposition adecuados.

---

### Hallazgo 5: Bloqueo Permanente de Pantalla en "Cargando mapa..." (Leaflet SSR Bug)
- **Área:** Experiencia de Usuario & Mapas.
- **Estado:** CONFIRMADA.
- **Severidad:** **P1 — Alto**.
- **Archivo:** `src/components/ui/ProjectsMap.tsx` (L7-15, L66).
- **Evidencia:** `customIcon` se instancia en el ámbito global del módulo con `typeof window !== 'undefined' ? new L.Icon(...) : null`. Durante la evaluación estática de Server Components / SSR, `customIcon` se evalúa como `null`. Al montarse en cliente, la condición `if (!mounted || !customIcon)` permanece en `true` para siempre si no se fuerza la re-instanciación dentro de un `useEffect`, bloqueando la pantalla con el texto "Cargando mapa...".
- **Impacto:** Clientes y evaluadores en la página de proyectos ven un mapa en blanco con parpadeo infinito.
- **Solución Propuesta:** Mover la inicialización de `L.Icon` dentro del hook `useEffect` o asegurar la carga dinámica con `{ ssr: false }` garantizando que el icono se cree únicamente tras la hidratación en el navegador.

---

### Hallazgo 6: Splash Screen "Iniciando Entorno" Intrusivo y Sin Memoria de Sesión
- **Área:** UX / Experiencia de Primer Ingreso.
- **Estado:** CONFIRMADA.
- **Severidad:** **P2 — Medio**.
- **Archivo:** `src/components/ui/ModuloIntroSplash.tsx` (L130-208).
- **Evidencia:** `isVisible` inicia siempre en `true` cada vez que el usuario navega a `/constructora` o `/portal`. Obliga a esperar 2.0 segundos de animación 3D del logo en cada recarga sin verificar si la sesión ya vio la intro previamente (`sessionStorage.getItem('hasSeenIntro')`).
- **Impacto:** Fricción severa para usuarios frecuentes y personal operativo de obra que requiere consultar información de forma ágil desde dispositivos móviles.
- **Solución Propuesta:** Comprobar `sessionStorage.getItem('sara_constructora_intro_seen')`; si existe, saltar inmediatamente el splash o reducir su duración a cero.

---

### Hallazgo 7: Módulo BIM 3D Simulado con Cajas CSS y Alertas Nativas
- **Área:** BIM & Ingeniería de Cómputos.
- **Estado:** CONFIRMADA.
- **Severidad:** **P2 — Medio**.
- **Archivo:** `src/app/dashboard/bim/page.tsx` (L51-100, L250, L316-320).
- **Evidencia:** El visor publicitado como "WebGL / 3D Canvas" renderiza cajas CSS mediante `style={{ perspective: "1000px" }}` con datos codificados en `modeloDemo`. El botón "Add-in Revit 2026" ejecuta `alert("Add-in SARA-Revit 2026 activo: Enlace bidireccional establecido.")`. No existe librería de análisis de archivos IFC (`web-ifc` / `openBIM`) instalada en `package.json`.
- **Impacto:** Imposibilidad de cargar planos o modelos digitales IFC reales de CYPE, Archicad o Revit. Desconexión entre el modelo geométrico y la explosión real de rubros.
- **Solución Propuesta:** Instalar `web-ifc` o visor OpenBIM ligero desacoplado en Web Workers para procesamiento geométrico de elementos IFC (`IfcWall`, `IfcBeam`, `IfcColumn`, `IfcSlab`).

---

### Hallazgo 8: "Cerebro Vectorial" de Inteligencia Artificial Sin Base Vectorial Ni Embeddings
- **Área:** Inteligencia Artificial & Gobierno de Precios.
- **Estado:** CONFIRMADA.
- **Severidad:** **P2 — Medio**.
- **Archivo:** `src/lib/services/vectorKnowledgeService.ts` (L56-103).
- **Evidencia:** La "Base de conocimiento semántica adaptativa" es un objeto `new Map()` con 3 ítems fijos (`cemento_holcim_fuerte_50kg`, `acero_adelca_corrugado_12mm`, `hormigon_premezclado_210`). No se utiliza `pgvector`, ni llamadas a modelos de embeddings (OpenAI `text-embedding-3-small`, Google Gemini embeddings).
- **Impacto:** Si se sube una factura con un insumo nuevo (ej. "Tubo PVC Novafort 250mm"), el sistema no puede hacer cruce semántico inteligente para actualizar recetas de APU.
- **Solución Propuesta:** Habilitar la extensión `vector` en Supabase/PostgreSQL e implementar un pipeline de emparejamiento semántico con similitud de coseno contra el catálogo oficial de rubros e insumos de la construcción ecuatoriana.

---

### Hallazgo 9: Generación de Asientos Contables y Devoluciones Aislada en Memoria
- **Área:** Contabilidad y Finanzas.
- **Estado:** CONFIRMADA.
- **Severidad:** **P1 — Alto**.
- **Archivo:** `src/lib/services/threeWayMatchService.ts` (L308-373, L420-445).
- **Evidencia:** `buildAccountingJournal` produce un asiento balanceado impecable bajo las cuentas `1.1.04.01`, `1.1.06.01`, `2.1.01.01`, `2.1.03.01`, `2.1.04.01`. Sin embargo, `ContabilidadRepository.registrarAsiento` o las tablas `asientos_contables` y `asiento_detalles` no son invocadas desde la UI; el resultado vive en el estado de React y desaparece al recargar la página.
- **Impacto:** Discrepancia total entre lo que el contador ve en la pantalla de conciliación y el libro diario oficial en base de datos.
- **Solución Propuesta:** Invocar el endpoint Server Action transaccional que persista el asiento contable dentro de una transacción PostgreSQL única al momento de aceptar el Three-Way Match.

---

### Hallazgo 10: RLS Permisivo en PostgreSQL que Anula el Aislamiento de Proyectos
- **Área:** Base de Datos & Políticas RLS.
- **Estado:** CONFIRMADA.
- **Severidad:** **P0 — Crítico**.
- **Archivo:** `supabase/migration_rls_fix.sql` (L43-44).
- **Evidencia:**
  ```sql
  -- PROYECTOS: Lectura pública para la página de proyectos (todos pueden ver proyectos)
  CREATE POLICY "proyectos_select_public" ON proyectos
    FOR SELECT USING (true);
  ```
- **Impacto:** En PostgreSQL, cuando coexisten dos políticas de `SELECT`, se combinan con el operador booleano `OR`. Al existir una política con `USING (true)`, cualquier consulta anónima o autenticada tiene acceso completo a leer cualquier fila de la tabla `proyectos`, dejando sin efecto la política restrictiva `proyectos_select_own`.
- **Solución Propuesta:** Agregar la columna `es_publico BOOLEAN NOT NULL DEFAULT FALSE` en `proyectos`, y modificar la política pública a: `CREATE POLICY "proyectos_select_public" ON proyectos FOR SELECT USING (es_publico = true);`.

---

## 6. Informes Específicos por Área de Negocio

### 6.1. Ingeniería de Costos y Módulo APU
- **Cumplimiento Matemático:** Verificado y conforme en `src/lib/calculadoras/presupuestos.ts`. La función `calcularFormulaPolinomicaINEC` restringe estrictamente el coeficiente de varios $p_x \le 0.200$ y realiza el ajuste en milésimas sobre la mano de obra para que $\sum p_i = 1.0000$.
- **Evaluador Aritmético:** La función `safeEvaluateArithmetic` reemplazó cualquier uso peligroso de `eval()` por un analizador léxico de expresiones matemáticas (`+`, `-`, `*`, `/`, paréntesis), previniendo Remote Code Execution (RCE).
- **Brecha Encontrada:** La asignación de mano de obra en `saraApu.ts` utiliza factores heurísticos estáticos por metro cuadrado en lugar de consultar los rendimientos reales de campo registrados en las bitácoras de obra.

### 6.2. Gestión Integral de Obras y Fiscalización
- **Ciclo de Vida:** El modelo contempla los estados `en_diseno`, `en_construccion`, `paralizado` y `finalizado`.
- **Brecha de Datos:** Si la tabla `proyectos` se encuentra vacía o el cliente no tiene obras asignadas, `MisProyectosSection.tsx` carga 6 obras de prueba fijas (`El Chiquito`, `Torre Sara`, etc.), impidiendo mostrar estados vacíos reales para nuevos usuarios.

### 6.3. Bodega, Kardex y Trazabilidad Inversa
- **Modelado Teórico:** Las fórmulas de Lote Económico de Pedido ($EOQ = \sqrt{2DS/H}$) y Punto de Reorden ($ROP = \bar{d} \cdot L + SS$) están programadas con precisión en `kardexMultibodegaService.ts`.
- **Brecha Operativa:** El componente `BodegaKardexSection.tsx` (4,321 líneas de código) opera de forma totalmente aislada de la tabla `kardex_movimientos` de Supabase. Cualquier recepción de cemento o despacho a obra solo muta el estado local del navegador.

### 6.4. Nómina y Tareo Laboral (Sector Construcción Ecuador)
- **Marco Legal:** Calibrado con el Acuerdo Ministerial MDT-2025-195 ($SBU = \$482.00$ para 2026), tabla sectorial CICS para maestros, albañiles y fierreros, horas extraordinarias al $50\%$ y $100\%$, aporte personal del $9.45\%$ y patronal del $12.15\%$.
- **Brecha Operativa:** El tareo diario no cuenta con validación de geolocalización satelital al momento del registro, ni firma electrónica del residente de obra que selle la planilla antes de su cálculo contable.

### 6.5. Logística de Carga Pesada y Fletes (MTOP)
- **Cumplimiento:** La integración con `saraFletesSyncService.ts` respeta las tipologías vehiculares oficiales del Ecuador (camiones $2DB$, volquetas $14\,\text{m}^3$ de $27\,\text{T}$, plataformas $3S2$ de $48\,\text{T}$).
- **Cubicación:** La cubicación de desalojo de excavación aplica un factor de esponjamiento de $1.25$, calculando con precisión la masa vehicular requerida.

---

## 7. Benchmarking Empresarial (SARA vs Procore / Autodesk / Aconex)

| Capacidad Funcional | SARA-CONSTRUCTORA (Actual) | Procore / Autodesk ACC | Brecha Técnica a Cerrar |
|---|---|---|---|
| **Normativa Ecuatoriana (NEC/SRI/IESS)** | **Sobresaliente (Integrada)** | Nula (Requiere ERP externo) | Ventaja competitiva nativa en Ecuador. |
| **Persistencia Transaccional** | **Deficiente (En memoria / Local)** | Empresarial (PostgreSQL/Oracle) | Conectar repositorios con Supabase bajo ACID. |
| **Visor BIM & CDE** | **Simulada (CSS 3D / Mock)** | Avanzada (Forge / OpenBIM IFC4) | Integrar motor WebGL real (`web-ifc`). |
| **Three-Way Match** | **Avanzada (Lógica pura lista)** | Estándar en módulo financiero | Persistir asientos y vincular con retención SRI. |
| **Aislamiento Multi-Tenant** | **Vulnerable (IDOR en Portal)** | Certificación SOC2 / ISO 27001 | Restringir RLS y aislar por organización/cliente. |
| **Movilidad en Obra (PWA)** | **Parcial (Service Worker activo)** | App Nativa iOS/Android | Garantizar sincronización IndexedDB offline real. |

---

## 8. Backlog Priorizado y Plan de Implementación por Fases

### Fase 1: Blindaje Inmediato de Seguridad y RLS (Prioridad P0 — Próximas 48h)
1. **P0-1:** Eliminar la política RLS permisiva `proyectos_select_public` en Supabase y crear política estricta `proyectos_select_own` basada en `auth.uid() = cliente_id` y `es_publico = true`.
2. **P0-2:** Modificar `src/app/(public)/portal/dashboard/page.tsx` para forzar el filtro `.eq('cliente_id', user.id)` en todas las consultas de proyectos y documentos.
3. **P0-3:** Eliminar la simulación de firma XAdES-BES en `sriXmlService.ts` o catalogarla explícitamente en UI como "Verificación de estructura XML" hasta integrar biblioteca PKI criptográfica.

### Fase 2: Conexión Real de Datos y Eliminación de Mocks (Prioridad P1 — Semana 1)
1. **P1-1:** Conectar `BodegaKardexSection.tsx` con `KardexRepository` para que los ingresos por OC y despachos impacten las tablas `kardex_multibodega` y `kardex_movimientos`.
2. **P1-2:** Reemplazar las descargas simuladas con `alert()` en `MisProyectosSection.tsx` por generación de URLs firmadas de Supabase Storage.
3. **P1-3:** Persistir automáticamente los asientos contables generados por el Three-Way Match en `asientos_contables`.

### Fase 3: Corrección de UX y Puntos de Bloqueo (Prioridad P2 — Semana 2)
1. **P2-1:** Resolver el bug de hidratación en `ProjectsMap.tsx` instanciando `L.Icon` dentro de `useEffect` para eliminar el bloqueo "Cargando mapa...".
2. **P2-2:** Añadir memoria de sesión en `ModuloIntroSplash.tsx` para no forzar la espera de 2 segundos en usuarios recurrentes.
3. **P2-3:** Reemplazar los diálogos nativos `alert()` y `confirm()` por modales accesibles Tailwind/Radix UI.

### Fase 4: Evolución Tecnológica (Prioridad P3 — Mes 2)
1. **P3-1:** Implementar visor BIM IFC real mediante `web-ifc` en lugar de cubos CSS 3D.
2. **P3-2:** Activar `pgvector` en Supabase para el cruce semántico real de insumos de construcción ante variaciones de precios del SRI.

---

## 9. Recomendación Final del Arquitecto

1. **Qué corregir inmediatamente:**
   - La brecha de seguridad IDOR en el portal de clientes y la política RLS permisiva en Supabase.
   - El bug de hidratación de Leaflet que congela el mapa.
   - La persistencia de Kardex y Asientos Contables desde el frontend hacia PostgreSQL.

2. **Qué construir después:**
   - Carga y procesamiento real de modelos IFC OpenBIM en Web Workers.
   - Sincronización offline robusta en PWA con cola de mutaciones IndexedDB para personal en obra sin cobertura.

3. **Qué NO conviene construir todavía:**
   - No implementar microservicios ni colas externas complejas (Kafka/RabbitMQ); el stack actual con Next.js App Router, Server Actions y `SaraEventBus` sobre PostgreSQL es óptimo, mantenible y suficiente para el volumen operativo actual del holding.
