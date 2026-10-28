---
name: sara-realestate-dcf-underwriting
description: >-
  Modelado financiero de suscripción inmobiliaria mediante Flujo de Caja Descontado (DCF), VAN, TIR y cascada de utilidades.
  Evalúa viabilidad de proyectos residenciales/comerciales, sensibilidad a tasas hipotecarias (BIESS) y riesgo EMBI.
---

# sara-realestate-dcf-underwriting

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-realestate-dcf-underwriting`
- **Unidad de Negocio:** SARA Inmobiliaria (Desarrollo Inmobiliario, Estructuración Financiera y Tasación)
- **Repositorio / Estándar GitHub de Referencia:**
  - `brightdata/real-estate-ai-agent` (Herramientas agénticas de extracción masiva de comparables inmobiliarios y geointeligencia de suelo).
  - Estándar Institucional de Modelación Financiera Inmobiliaria (Argus Enterprise / REFM - Real Estate Financial Modeling).
  - Normas Internacionales de Valuación (IVS 2025 - IVS 105 Income Approach / DCF).
  - Políticas de Crédito Hipotecario de la Superintendencia de Bancos del Ecuador y Banco del Instituto Ecuatoriano de Seguridad Social (BIESS).
- **Objetivo Estratégico:**
  Modelar, proyectar y auditar la viabilidad económica y financiera de desarrollos inmobiliarios (edificios residenciales, lotizaciones, condominios comerciales) promovidos o evaluados por GRUPO SARA. Estructura el Flujo de Caja Descontado mensual y anual ($DCF$), calcula el Valor Actual Neto ($VAN$), Tasa Interna de Retorno ($TIR$), *Equity Multiple* ($EM$), cascada de distribución de utilidades entre socios e inversionistas (*Waterfalls* con *Hurdle Rates*), y efectúa pruebas de estrés ante variaciones en la velocidad de ventas y tasas de interés de hipotecas para compradores finales.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Normas Internacionales de Valuación IVS 2025 (Enfoque de Ingresos - DCF):**
   - Proyección explícita de ingresos brutos potenciales, pérdidas por desocupación, gastos operativos e inversiones de capital (*CapEx*).
   - Determinación técnica de la tasa de descuento ($WACC$) integrando la prima por riesgo país ecuatoriano ($EMBI$).
2. **Regulaciones del Mercado Inmobiliario y Financiero del Ecuador:**
   - Segmentación de Vivienda de Interés Social (VIS) y Vivienda de Interés Público (VIP) con tasa preferencial del 4.99% a 25 años (fideicomisos de garantía hipotecaria).
   - Tasas de crédito hipotecario de la banca comercial ordinaria (9.50% a 11.50%).
3. **Ley de Plusvalía y Ordenanzas Municipales de Uso y Gestión de Suelo (PUGS):**
   - Concesión Onerosa de Derechos de Construcción (altura y densidad edificable adicional).
   - Retenciones municipales por contribución especial de mejoras e impuesto a la utilidad en transferencia de predios urbanos.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Configuración de Parámetros del Proyecto y Calendario de Flujos
1. Recibir desde `SARA-CONSTRUCTORA` y `SARA-APU` el presupuesto total de obra (*Hard Costs* de construcción), cronograma de desembolsos y costos indirectos (*Soft Costs*: permisos, arquitectura, ingeniería, comercialización, fiscalización).
2. Incorporar el costo de adquisición del terreno (*Land Acquisition Cost*).
3. Establecer la matriz de unidades comercializables (departamentos, suites, locales comerciales, parqueaderos, bodegas) con su área útil vendible ($m^2$) y precio de lista unitario ($P_{\text{lista}}$).
4. Configurar el ritmo proyectado de preventas y ventas (curva de absorción mensual).

### Paso 2: Estructuración del Flujo de Caja Descontado (DCF)
1. Para cada mes $t \in \{1, \dots, T\}$ proyectar:
   - **Ingresos por Cobranza de Ventas:** Cuotas de entrada diferidas durante la construcción (20% a 30% del valor del inmueble) + desembolsos contra entrega de créditos hipotecarios (70% a 80%).
   - **Egresos de Capital:** Desembolsos de obra según curva S de avance físico + honorarios profesionales + comisiones comerciales de corretaje (3.0% a 5.0%).
   - **Flujo Neto Operativo de la Promoción ($FNE_t$):**
     $$FNE_t = \text{Cobranzas Mensuales}_t - (\text{Hard Costs}_t + \text{Soft Costs}_t + \text{Servicio Deuda Puente}_t)$$

### Paso 3: Determinación de la Tasa de Descuento (WACC) Ecuatoriana
1. Calcular el Costo de Oportunidad del Capital Propio ($K_e$) mediante el modelo CAPM ajustado por riesgo soberano:
   $$K_e = R_f + \beta_{\text{inmob}} \cdot (R_m - R_f) + \text{Riesgo País (EMBI)}$$
   *(Donde $R_f \approx 4.25\%$, $\beta \approx 1.15$, $(R_m - R_f) \approx 5.50\%$, $EMBI_{\text{Ecuador}} \approx 8.50\% \implies K_e \approx 19.0\%$)*.
2. Determinar el Costo Ponderado de Capital ($WACC$):
   $$WACC = \left( \frac{E}{V} \cdot K_e \right) + \left( \frac{D}{V} \cdot K_d \cdot (1 - T_{\text{renta}}) \right)$$

### Paso 4: Indicadores de Rentabilidad y Distribución de Utilidades (Waterfalls)
1. Calcular el Valor Actual Neto ($VAN$) y la Tasa Interna de Retorno ($TIR$):
   $$VAN = \sum_{t=0}^T \frac{FNE_t}{(1 + WACC/12)^t}, \quad TIR \implies \sum_{t=0}^T \frac{FNE_t}{(1 + TIR/12)^t} = 0$$
2. Calcular el Múltiplo sobre el Capital Invertido (*Equity Multiple* - $EM$):
   $$EM = \frac{\sum \text{Flujos Positivos Recibidos por el Capital}}{\sum \text{Aportes de Capital Invertidos}}$$
3. Si el proyecto involucra inversionistas externos, estructurar la cascada de utilidades (*Promote Waterfall*):
   - **Nivel 1 (Retorno Preferente):** 100% de los flujos al inversionista hasta alcanzar un *Hurdle Rate* del $12\%$ anual.
   - **Nivel 2 (Promote Ordinario):** 80% Inversionista / 20% GRUPO SARA (Sponsor) hasta un *Hurdle Rate* del $18\%$.
   - **Nivel 3 (Super-Promote):** 60% Inversionista / 40% GRUPO SARA para rendimientos superiores al $18\%$.

### Paso 5: Pruebas de Sensibilidad y Estrés
1. Simular caídas del $10\%$ y $20\%$ en la velocidad de absorción mensual.
2. Evaluar el impacto de un alza de 200 bps en las tasas hipotecarias que restringa la precalificación de compradores en banca privada.
3. Emitir el dictamen de viabilidad: **APROBADO** (si $VAN > 0$ y $TIR \ge WACC + 300\,\text{bps}$) o **RECHAZADO/REESTRUCTURAR**.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Rigor Financiero:** Modelación a nivel mensual con separación explícita de flujos apalancados (*levered*) y no apalancados (*unlevered*).
2. **Cobertura de Sensibilidad:** Matriz bidimensional de sensibilidad (Precio de Venta vs Plazo de Obra) generada en $< 2.000\,\text{ms}$.
3. **Calibración Macro:** Tasa de descuento actualizada permanentemente con el índice EMBI oficial de Ecuador.
