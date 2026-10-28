---
name: sara-construction-crew-productivity-matrix
description: >-
  Matriz de productividad de cuadrillas civiles, control de horas-hombre efectivas y auditoría de seguridad SST.
  Compara rendimientos teóricos de APU vs avances reales de campo y calcula indicadores de accidentabilidad IESS CD 513.
---

# sara-construction-crew-productivity-matrix

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-construction-crew-productivity-matrix`
- **Unidad de Negocio:** SARA Talento Humano (Gestión de Cuadrillas, Productividad en Obra y Seguridad Ocupacional)
- **Repositorio / Estándar GitHub de Referencia:**
  - `datadrivenconstruction/DDC_Skills_for_AI_Agents_in_Construction` (Skills: `daily-crew-tracker`, `labor-productivity-audit`, `subcontractor-safety-log`).
  - `buildrtech/skills` (`crew-scheduler`, `workforce-planner`).
  - Código del Trabajo del Ecuador (Jornadas ordinarias, horas extraordinarias y suplementarias - Art. 55).
  - Reglamento del Seguro General de Riesgos del Trabajo del IESS (Resolución C.D. 513) y Decreto Ejecutivo 2393.
- **Objetivo Estratégico:**
  Monitorear, medir y optimizar el rendimiento por hora-hombre ($H-H$) de las cuadrillas civiles en los distintos frentes de obra (estructuras, mampostería, instalaciones, acabados). Coteja la productividad real observada en campo contra las tablas de rendimiento base de `SARA-APU`, identifica cuadrillas rezagadas mediante curvas de aprendizaje, liquida las horas efectivamente trabajadas y audita el cumplimiento de normativas de Seguridad y Salud en el Trabajo (SST) para mitigar riesgos patronales ante el IESS.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Resolución C.D. 513 del IESS (Seguro General de Riesgos del Trabajo):**
   - Obligación de mantener registros estadísticos de accidentes y enfermedades profesionales.
   - Cálculo estandarizado de los Índices de Frecuencia ($I_F$), Gravedad ($I_S$) y Tasa de Riesgo ($I_A$).
2. **Código del Trabajo del Ecuador y Tablas Sectoriales MDT:**
   - Jornada laboral máxima de 40 horas semanales (8 horas diarias).
   - Recargo del 50% para horas suplementarias (hasta las 24h00 en días hábiles) y del 100% para horas extraordinarias (fines de semana, feriados o entre 24h00 y 06h00).
   - Salario Básico Unificado vigente ($482 en 2026, Acuerdo MDT-2025-195) y categorías ocupacionales de la construcción.
3. **Estándares de Rendimiento Laboral AACE International (RP 25R-03):**
   - Factores de afectación por hacinamiento de cuadrillas, fatiga por sobretiempo continuado y condiciones climáticas severas.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Registro Diario de Asistencia y Asignación de Cuadrillas
1. Ingestar el parte diario de obra y registros biométricos del personal (maestros mayores, albañiles, fierreros, encofradores, peones, electricistas).
2. Clasificar el personal en cuadrillas funcionales asignadas a rubros específicos del presupuesto:
   - Cuadrilla de Encofrado: 1 Maestro + 2 Oficiales + 2 Peones.
   - Cuadrilla de Armado de Acero: 1 Fierrero Maestro + 2 Oficiales + 1 Peón.
   - Cuadrilla de Hormigonado: 1 Maestro + 4 Peones + 1 Operador de Vibrador.
3. Totalizar las Horas-Hombre Trabajadas ($HHT$) en el periodo, discriminando horas normales ($H_{\text{norm}}$), suplementarias ($H_{\text{supl}}$) y extraordinarias ($H_{\text{extra}}$).

### Paso 2: Cálculo del Factor de Productividad de Cuadrilla (Labor Productivity Factor)
1. Extraer de `SARA-CONSTRUCTORA` el volumen o cantidad de obra ejecutada en el día ($Q_{\text{ejecutada}}$ en $m^3, m^2, kg$).
2. Extraer de `SARA-APU` el rendimiento teórico estándar asignado al rubro ($R_{\text{teórico}}$ en $H\text{-}H / \text{unidad}$).
3. Calcular las Horas-Hombre Ganadas (*Earned Man-Hours* - $EMH$):
   $$EMH = Q_{\text{ejecutada}} \times R_{\text{teórico}}$$
4. Determinar el Factor de Rendimiento Laboral ($FRL$):
   $$FRL = \frac{EMH}{HHT_{\text{reales}}}$$
   - Si $FRL > 1.05$: Alto desempeño (rendimiento superior al previsto; evaluar bonificación).
   - Si $0.90 \le FRL \le 1.05$: Rendimiento normal dentro de la tolerancia de diseño.
   - Si $FRL < 0.90$: Baja productividad (investigar interferencias, falta de materiales o problemas de supervisión).

### Paso 3: Análisis de Pérdida de Eficiencia por Horas Extras y Fatiga
1. Si una cuadrilla supera las 50 horas de trabajo semanales de forma consecutiva, aplicar la curva de degradación de eficiencia AACE:
   $$F_{\text{fatiga}} = 1.00 - 0.04 \times \max(0, \text{Semanas con Sobretiempo} - 1)$$
2. Recomendar a la dirección técnica rotación de cuadrillas o ingreso de personal fresco para evitar incrementos en la tasa de accidentes.

### Paso 4: Monitoreo Estadístico de SST (IESS Resolución C.D. 513)
1. Registrar cualquier incidente, casi-accidente (*near miss*) o accidente laboral con o sin baja médica.
2. Calcular mensualmente los índices de siniestralidad acumulados de la obra:
   $$I_F = \frac{N_{\text{accidentes con tiempo perdido}} \times 200,000}{\sum HHT}$$
   $$I_S = \frac{N_{\text{días perdidos por incapacidad}} \times 200,000}{\sum HHT}$$
   $$I_A = \frac{I_F \times I_S}{1,000}$$
3. Si $I_F > 0$ o se detecta incumplimiento en el uso de EPP (arneses en trabajos en altura $> 1.80\,\text{m}$, cascos dieléctricos, calzado con puntera de acero):
   - Generar acta de no conformidad SST inmediata y paralizar el frente inseguro hasta subsanación.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Exactitud en Liquidación de Horas:** Cuadre al $100\%$ de horas extras según registros biométricos y legislación laboral.
2. **Visibilidad de Cuellos de Botella:** Detección de frentes con $FRL < 0.90$ en las primeras 24 horas del desvío.
3. **Cero Accidentes Fatales:** Mantenimiento de $I_F < 5.0$ e índice de severidad controlado bajo estándares internacionales OHSAS/ISO 45001.
