---
name: sara-bid-leveling-tender-optimizer
description: >-
  Nivelación automatizada de ofertas de subcontratistas y licitaciones públicas (SERCOP / LOSNCP).
  Detecta desviaciones de precios unitarios, bajas temerarias, sobrecostos y optimiza el margen AIU y VAE.
---

# sara-bid-leveling-tender-optimizer

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-bid-leveling-tender-optimizer`
- **Unidad de Negocio:** SARA APU (Ingeniería de Costos, Presupuestos y Licitaciones)
- **Repositorio / Estándar GitHub de Referencia:**
  - `buildrtech/skills` (Skills: `bid-leveling`, `rfp-intake`, `proposal-builder`).
  - `constructelligence-lab/construction-agent-skills` (`tender-comparisons`, `rate-calculator`).
  - `dgcruzing/construction-office-skills` (`tender-comparisons-and-normalization`).
  - Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP - Art. 54 y 55: Ofertas no conformes y descalificación).
- **Objetivo Estratégico:**
  Normalizar, comparar y nivelar matricialmente múltiples propuestas económicas de subcontratistas y proveedores frente al presupuesto referencial de GRUPO SARA o pliegos de licitación del SERCOP. Identifica dispersiones estadísticas, omisiones de alcance (*scope gaps*), precios unitarios distorsionados, ofertas con presunción de temeridad (bajas temerarias $< 80\%$ del referencial oficial) y optimiza la estrategia de utilidad AIU y porcentaje de Valor Agregado Ecuatoriano (VAE).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP):**
   - Causales de rechazo de ofertas técnicas/económicas por errores sustanciales no convalidables.
   - Evaluación económica bajo el criterio de costo-beneficio y mejor costo en obras.
2. **Resoluciones del SERCOP para Obras y Consultoría:**
   - Reglas de convalidación de errores de foliación, sumatoria o discrepancias entre letras y números.
   - Umbral mínimo obligatorio de Valor Agregado Ecuatoriano (VAE) por código CPC (*Clasificador Central de Productos*).
3. **Estándar AACE International (Recommended Practice 56R-08):**
   - Análisis de licitaciones y evaluación de riesgos en precios unitarios desbalanceados (*unbalanced bidding* frontal o compensado).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Ingesta y Normalización de Propuestas (Bid Tabulation)
1. Cargar el presupuesto referencial institucional con la estructura de rubros, unidades de medida ($m^3, m^2, kg, ton, u$) y cantidades de obra aprobadas.
2. Extraer de forma estandarizada las cotizaciones de los $K$ proponentes ($k \in \{1, \dots, K\}$).
3. Normalizar unidades y descripciones técnicas para garantizar comparabilidad uno a uno (manzana con manzana).
4. Si un proponente omitió un rubro o dividió el alcance en partidas no estándar, imputar el costo estimado de mercado para nivelación (*plug number*):
   $$\text{Precio Nivelado}_{i, k} = \begin{cases} P_{i, k}, & \text{si cotizó rubro } i \\ \bar{P}_{i, \text{referencial}}, & \text{si proponente omitió rubro } i \end{cases}$$

### Paso 2: Análisis Estadístico de Dispersión y Detección de Desbalances
1. Para cada rubro $i$, calcular el precio promedio de mercado ($\mu_i$) y su desviación estándar ($\sigma_i$):
   $$\mu_i = \frac{1}{K} \sum_{k=1}^K P_{i, k}, \quad \sigma_i = \sqrt{\frac{1}{K-1} \sum_{k=1}^K (P_{i, k} - \mu_i)^2}$$
2. Calcular el Z-Score por rubro y proponente:
   $$Z_{i, k} = \frac{P_{i, k} - \mu_i}{\sigma_i}$$
   - Si $|Z_{i, k}| > 2.0$: Marcar como anomalía crítica por posible error de cotización, especificación errada o estrategia desleal.
3. Evaluar el Ratio de Variación respecto al Presupuesto Referencial ($R_{i, k}$):
   $$R_{i, k} = \frac{P_{i, k}}{P_{i, \text{referencial}}}$$
   - Si $R_{i, k} < 0.80$: **Alerta de Baja Temeraria** (riesgo de abandono de obra o incumplimiento en calidad).
   - Si $R_{i, k} > 1.25$: **Alerta de Sobrecosto / Sobreprecio** que amerita renegociación.

### Paso 3: Auditoría de Estrategias Desbalanceadas (Front-Loaded Bids)
1. Detectar si un subcontratista infló los precios de los rubros iniciales (excavación, desalojo, cimientos) y redujo los rubros finales (acabados, pintura):
   $$\Delta_{\text{front}} = \frac{\sum_{i \in \text{Fase 1}} (P_{i, k} - P_{i, \text{ref}}) \times Q_i}{\text{Monto Total Oferta}_k}$$
   - Si $\Delta_{\text{front}} > 10\%$: Notificar riesgo de desbalance financiero temprano.

### Paso 4: Optimización de Ponderación Multicriterio y Adjudicación
1. Calcular el Score Final de la Oferta ($S_k$) combinando factores técnicos, económicos y de cumplimiento:
   $$S_k = w_1 \cdot \left( \frac{P_{\min}}{\text{Monto Total Nivelado}_k} \times 100 \right) + w_2 \cdot \text{Score Experiencia}_k + w_3 \cdot \text{Score Plazo}_k + w_4 \cdot \text{Score VAE}_k$$
   *(Donde $w_1 = 0.50, w_2 = 0.20, w_3 = 0.15, w_4 = 0.15$)*.
2. Emitir la Matriz Comparativa Ejecutiva y la Recomendación de Adjudicación fundamentada.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Cobertura de Nivelación:** $100\%$ de los rubros del pliego deben estar cotejados y normalizados.
2. **Identificación de Brechas:** Ningún rubro con variación $> 20\%$ debe quedar sin justificación analítica.
3. **Respaldo de Adjudicación:** Generar informe descargable en PDF/Markdown con el ranking ordenado y el ahorro proyectado frente al presupuesto base.
