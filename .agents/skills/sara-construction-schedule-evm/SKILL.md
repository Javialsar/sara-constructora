---
name: sara-construction-schedule-evm
description: >-
  Auditoría y control de avance físico-financiero mediante Método del Valor Ganado (EVM) y desvíos de cronograma 4D BIM.
  Calcula SPI, CPI, EAC, VAC, holgura de ruta crítica y detecta desvíos contractuales y reclamos por variaciones (EOT).
---

# sara-construction-schedule-evm

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-construction-schedule-evm`
- **Unidad de Negocio:** SARA Constructora (Dirección Técnica, Fiscalización y Control de Proyectos)
- **Repositorio / Estándar GitHub de Referencia:**
  - `datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction` (Skills: `earned-value-management-agent`, `bim-4d-schedule-variance`).
  - `constructelligence-lab/construction-agent-skills` (`schedule-variance-analyzer`).
  - Estándares PMI PMBOK® 7ma Edición (Práctica Estándar para EVM) e ISO 21508:2018 (Earned Value Management in Project and Programme Management).
- **Objetivo Estratégico:**
  Supervisar, auditar y pronosticar el rendimiento físico y presupuestario en tiempo real de proyectos civiles de GRUPO SARA. Cruza el modelo volumétrico BIM (IFC4) con la programación de obra (Gantt CPM / Primavera P6 / MS Project) y el Libro de Obra digital, calculando índices de desempeño ($SPI, CPI, EAC, VAC$), identificando desvíos en la ruta crítica y alertando sobre solicitudes de prórrogas de plazo (*Extension of Time - EOT*) o reclamos de sobrecostos contractuales.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Normativa de Contratación Pública del Ecuador (LOSNCP y RGLOSNCP):**
   - Artículos sobre prórrogas de plazo, contratos complementarios, multas por mora diaria ($1 \times 1000$ a $5 \times 1000$ del saldo del contrato por día de retraso no justificado) y recepción provisional de obras.
2. **Estándar Internacional ISO 21508:2018 y PMI Practice Standard for EVM:**
   - Métricas fundamentales: Valor Planificado ($PV$), Valor Ganado ($EV$), Costo Real ($AC$).
   - Índices de Variación y Desempeño: $SV, CV, SPI, CPI, TCPI$.
3. **buildingSMART BIM 4D (ISO 19650-2:2018):**
   - Vinculación de GUIDs de elementos IFC con identificadores de tareas WBS (*Work Breakdown Structure*) para fiscalización visual 4D del avance físico real vs programado.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Ingesta de Datos del Proyecto y Línea Base
1. Extraer la línea base de cronograma ($WBS$, tareas, dependencias predecesoras/sucesoras, duraciones y costos asignados por rubro APU).
2. Obtener la fecha de corte de evaluación ($T_{\text{corte}}$) y calcular el Valor Planificado acumulado ($PV$):
   $$PV = \sum_{i \in \text{Rubros}} \text{Presupuesto Base}_i \times \%\,\text{Planificado al corte}_i$$
3. Extraer desde el Libro de Obra digital y actas de fiscalización (`sara-field-inspection-geolog`) el avance físico real ejecutado por rubro y calcular el Valor Ganado ($EV$):
   $$EV = \sum_{i \in \text{Rubros}} \text{Presupuesto Base}_i \times \%\,\text{Avance Físico Aprobado}_i$$
4. Extraer desde `SARA-PAGOS` y `SARA-MARKETPLACE` el Costo Real incurrido y facturado ($AC$):
   $$AC = \sum \text{Egresos Reales Imputados al Proyecto al corte}$$

### Paso 2: Cálculo de Variaciones e Índices de Rendimiento
1. Calcular la Variación del Cronograma ($SV$) y la Variación del Costo ($CV$):
   $$SV = EV - PV, \quad CV = EV - AC$$
2. Determinar los índices de rendimiento temporal ($SPI$) y de costo ($CPI$):
   $$SPI = \frac{EV}{PV}, \quad CPI = \frac{EV}{AC}$$
   - Si $SPI < 1.00$: El proyecto experimenta retraso respecto al plan.
   - Si $CPI < 1.00$: El proyecto presenta sobrecosto respecto al presupuesto.
3. Evaluar el Índice de Rendimiento del Trabajo por Completar ($TCPI$):
   $$TCPI_{\text{BAC}} = \frac{BAC - EV}{BAC - AC}$$
   *(Donde $BAC$ es el Presupuesto Total al Completar / Budget at Completion)*.

### Paso 3: Pronóstico Final de Costo y Tiempo al Completar (Forecast)
1. Calcular la Estimación al Completar ($EAC$):
   - Escenario Típico (el rendimiento actual $CPI$ continuará):
     $$EAC = \frac{BAC}{CPI}$$
   - Escenario Combinado (impacto simultáneo de plazo y costo):
     $$EAC_{\text{combinado}} = AC + \frac{BAC - EV}{CPI \times SPI}$$
2. Calcular la Variación al Completar ($VAC$):
   $$VAC = BAC - EAC$$
   - Si $VAC < 0$: Proyección de déficit presupuestario que exige medidas de ingeniería de valor o contrato complementario.
3. Calcular la Duración Estimada al Finalizar ($EAC_t$):
   $$EAC_t = \frac{\text{Duración Planificada}}{SPI}$$

### Paso 4: Análisis de Ruta Crítica y Mitigación de Multas
1. Comparar la holgura total (*Total Float*) de las actividades en la ruta crítica ($CPM$).
2. Si el retraso impacta la ruta crítica ($SV_{\text{crítica}} < 0$):
   - Cuantificar el riesgo de multa según la LOSNCP:
     $$\text{Multa Diaria Estimada} = M \times \text{Saldo Contractual}, \quad M \in [0.001, 0.005]$$
   - Generar plan de recuperación mediante *Fast-Tracking* (paralelización de tareas) o *Crashing* (incorporación de cuadrillas adicionales coordinadas con `SARA-TALENTOHUMANO`).

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Precisión de Conciliación:** La suma ponderada del avance físico no debe diferir en más de $\pm 0.50\%$ de los reportes del fiscalizador en campo.
2. **Tiempo de Generación:** El informe completo de EVM debe emitirse en $< 2.500\,\text{ms}$.
3. **Trazabilidad:** Cada cálculo debe vincular el `correlationId` del proyecto y el ID de versión de la línea base aprobada.
