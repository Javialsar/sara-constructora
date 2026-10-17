---
name: sara-construction-governance
description: >-
  Gobernanza integral de proyectos de obra civil, infraestructura y edificación para GRUPO SARA.
  Orquesta cronogramas maestros (PERT/CPM), compatibilidad de especificaciones técnicas NEC/MOP,
  trazabilidad de ruta crítica y mitigación proactiva de desvíos contractuales y temporales.
---

# sara-construction-governance

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-construction-governance`
- **Unidad de Negocio:** SARA Constructora Core (Infraestructura, Vivienda y Obras Civiles)
- **Objetivo Estratégico:**
  Gobernar la planificación, ejecución y control maestro de proyectos de construcción mediante algoritmos de ruta crítica (CPM), análisis probabilístico de tiempos (PERT), asignación balanceada de recursos y fiscalización preventiva de plazos contractuales. Asegura la entrega dentro de los estándares de calidad de la Norma Ecuatoriana de la Construcción (NEC), previniendo multas por mora y sobrecostos por tiempos ociosos de maquinaria o cuadrillas.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Norma Ecuatoriana de la Construcción (NEC-SE, NEC-HS, NEC-GC):**
   - Regulación técnica estructural, sísmica, geotécnica y de habitabilidad vigente en el Ecuador.
   - Especificaciones obligatorias de resistencia de hormigones ($f'c \ge 210\,\text{kg/cm}^2$), recubrimientos mínimos de acero y control de fisuración.
2. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP) & RGLOSNCP:**
   - **Art. 70:** Plazos y prórrogas justificadas por fuerza mayor, caso fortuito o suspensiones ordenadas por la entidad fiscalizadora.
   - **Art. 71:** Cláusulas de multas diarias por retardo en la ejecución de la obra (habitualmente el $1 \times 1000$ diario sobre el saldo del contrato).
   - **Art. 85 - 89:** Régimen de contratos complementarios, diferencias en cantidades de obra y órdenes de trabajo de rubros nuevos.
3. **Especificaciones Generales para la Construcción de Caminos y Puentes (MOP-001-F):**
   - Tolerancias geométricas en movimientos de tierras, rasantes, sub-bases granulares, bases estabilizadas y carpetas asfálticas.
4. **PMBOK 7ma Edición / ISO 21500:**
   - Gestión del alcance, valor ganado (EVM: Earned Value Management), índice de desempeño del cronograma (SPI) e índice de desempeño del costo (CPI).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

Al invocarse o al interceptar el evento `PROYECTO_CREADO`:

### Paso 1: Inicialización de la Estructura de Desglose del Trabajo (EDT/WBS)
1. Extraer los metadatos del proyecto (`proyectoId`, `areaM2`, `niveles`, `sistemaConstructivo`, `provincia`, `fechaInicioPrevista`, `plazoDias`).
2. Descomponer el proyecto en seis (6) fases obligatorias:
   - **Fase 1:** Trabajos Preliminares, Replanteo y Movimiento de Tierras.
   - **Fase 2:** Cimentaciones y Estructura Portante (Hormigón Armado / Acero Estructural).
   - **Fase 3:** Mamposterías, Cubiertas e Impermeabilización.
   - **Fase 4:** Instalaciones Técnicas (Hidrosanitarias, Eléctricas, Climatización, Redes Contra Incendio).
   - **Fase 5:** Enlucidos, Revestimientos y Acabados Arquitectónicos.
   - **Fase 6:** Obra Exterior, Limpieza Final y Pruebas Hidrostáticas/Eléctricas.

### Paso 2: Análisis de Precedencias y Ruta Crítica (CPM)
1. Mapear cada hito y rubro con sus dependencias ($FS$: Fin-Comienzo, $SS$: Comienzo-Comienzo con desfasaje).
2. Calcular las fechas tempranas ($ES, EF$) y fechas tardías ($LS, LF$) para cada actividad:
   $$\text{Holgura Total } (HT_i) = LS_i - ES_i = LF_i - EF_i$$
3. Identificar la Ruta Crítica: conjunto de actividades donde $HT_i = 0$.
4. Si el plazo total resultante supera el plazo contractual pactado ($T_{\text{calc}} > T_{\text{contractual}}$), reasignar recursos automáticamente o aplicar técnicas de compresión (*fast-tracking* / *crashing*) en actividades críticas.

### Paso 3: Integración Continua con Fiscalización de Campo
1. Escuchar reportes diarios de `sara-field-inspection-geolog` vía API o Event Bus.
2. Si un rubro perteneciente a la Ruta Crítica registra una paralización no programada $\ge 48\,\text{horas}$:
   - Calcular el impacto directo sobre la fecha de recepción provisional de obra.
   - Clasificar la causa: Imputable al Contratista (alerta de riesgo de multa) vs Causa Externa/Climática debidamente acreditada con lluvia en bitácora (preparación de solicitud formal de prórroga de plazo).
3. Generar un **Memo Ejecutivo de Alerta de Desvío** y publicarlo en `sara_agent_events`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Jerarquía Tipográfica Editorial:**
   - Títulos de fase y KPIs de gobernanza con `--font-display` (`Syne` o `Plus Jakarta Sans`) en `font-bold tracking-tight`.
   - Cronograma detallado, fechas, códigos de rubro y métricas en `--font-sans` (`Inter` o `Montserrat`) con `font-medium text-slate-700 dark:text-slate-300`.
   - Kicker/Overline superior: `text-xs uppercase tracking-widest font-semibold text-emerald-600 dark:text-emerald-400`.
2. **Ergonomía Móvil y PWA:**
   - Controles de filtrado de fase en móvil con botones táctiles mínimos de `h-11 min-w-[44px]`.
   - Gráfico de Gantt móvil con scroll horizontal fluido y fijación adhesiva de la columna izquierda de hitos (`sticky left-0 bg-white/95 backdrop-blur-md`).
3. **Elevación y Acabado Visual:**
   - Evitar bordes negros toscos o sombras grises genéricas. Usar `border border-slate-900/5 dark:border-white/10` y sombras de acento `shadow-[0_12px_36px_-6px_rgba(16,185,129,0.08)]`.
   - Badges de estado con fondo tintado semitransparente:
     - En Plazo: `bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20`.
     - En Riesgo: `bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20`.
     - Crítico / Retrasado: `bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20`.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Tablas Supabase Involucradas:**
  - `proyectos`: Lectura y actualización de estado, fechas estimadas y reales.
  - `cronograma_fases`: Hitos, precedencias, holguras y criticidad.
  - `sara_agent_events`: Despacho y recepción de eventos de orquestación.
  - `shared_memory_entries`: Almacenamiento bajo namespace `governance:schedule`.
- **Eventos del Bus:**
  - **Consume:** `PROYECTO_CREADO`, `BITACORA_REGISTRADA`, `APU_CONSOLIDADO`.
  - **Emite:** `CRONOGRAMA_OPTIMIZADO`, `ALERTA_DESVIO_PLAZO`, `SOLICITUD_PRORROGA_GENERADA`.
- **SharedMemory Key:** `governance:project:<proyectoId>:cpm_state`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Estado de Gobernanza
```json
{
  "proyectoId": "sara-proj-2026-042",
  "plazoContractualDias": 180,
  "plazoCalculadoDias": 174,
  "holguraTotalProyecto": 6,
  "indiceDesempenoCronogramaSPI": 0.98,
  "rutaCritica": [
    {
      "faseId": "fase-1-preliminares",
      "rubroCodigo": "CIV-001",
      "descripcion": "Excavación en suelo común con excavadora",
      "duracionDias": 12,
      "esCritica": true,
      "holgura": 0,
      "estado": "EN_TIEMPO"
    },
    {
      "faseId": "fase-2-estructura",
      "rubroCodigo": "EST-015",
      "descripcion": "Hormigón premezclado f'c=280 kg/cm2 en columnas",
      "duracionDias": 24,
      "esCritica": true,
      "holgura": 0,
      "estado": "PENDIENTE"
    }
  ],
  "alertas": []
}
```

### 6.2 Fórmulas Matemáticas de Control de Valor Ganado
$$\text{SPI} = \frac{EV}{PV} = \frac{\text{Valor Ganado}}{\text{Valor Planificado}}$$
$$\text{Variación del Cronograma } (SV) = EV - PV$$
$$\text{Fecha de Fin Estimada } (EAC_t) = \frac{\text{Plazo Contractual}}{\text{SPI}}$$

### 6.3 Estructura del Reporte Oficial PDF
- Encabezado institucional con membrete oficial vectorizado (`membreteBase64.ts`).
- Ficha técnica contractual: Entidad, Contratista, Monto de Obra, Fecha de Inicio, Plazo.
- Tabla autotable con diagrama de barras Gantt estilizado, ruta crítica resaltada en rojo carmín y holguras operativas.
- Firmas técnicas: Director de Proyecto SARA, Ingeniero Residente y Asesor Legal de Obra.
