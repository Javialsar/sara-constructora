---
name: sara-realestate-market-absorption
description: >-
  Modelo econométrico de tasación inmobiliaria, análisis de plusvalía y predicción de velocidad de absorción comercial
  para proyectos residenciales y comerciales. Modela costos de suelo, TIR, VAN y curvas de flujo de caja inmobiliario.
---

# sara-realestate-market-absorption

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-realestate-market-absorption`
- **Unidad de Negocio:** SARA Inmobiliaria & Desarrollo Urbano
- **Objetivo Estratégico:**
  Evaluar la viabilidad financiera y comercial de proyectos inmobiliarios nuevos promovidos por GRUPO SARA o evaluados para inversión de terceros. Calcula la incidencia del costo del suelo, el precio óptimo de venta por metro cuadrado ($USD/m^2$) por tipología (suites, departamentos de 2 y 3 dormitorios, locales comerciales), y simula la tasa de absorción mensual en escenarios conservadores, moderados y dinámicos para proyectar la Tasa Interna de Retorno (TIR) y el Valor Actual Neto (VAN).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley de Desarrollo Urbano y Ordenamiento Territorial (LOOT) del Ecuador:**
   - Planes de Uso y Gestión del Suelo (PUGS) de los Gobiernos Autónomos Descentralizados (GADs municipales).
   - Coeficientes de Ocupación del Suelo (COS) y Coeficientes de Edificabilidad del Suelo (CUS).
   - Afectaciones viales, retiros reglamentarios y áreas comunales obligatorias.
2. **Normas Internacionales de Valoración (IVS) / Colegio de Valuadores del Ecuador:**
   - Método de Comparación de Mercado (Muestreo de testigos homogéneos corregidos por frente, fondo, topografía y plusvalía).
   - Método Residual Dinámico para valoración de suelo con vocación inmobiliaria.
3. **Regulaciones del Banco del Instituto Ecuatoriano de Seguridad Social (BIESS) y Superintendencia de Bancos:**
   - Rangos de vivienda de interés público (VIP / VIS con tasa subsidiada del 4.99%) vs crédito hipotecario tradicional.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Muestreo de Mercado y Valuación del Suelo
1. Levantar el precio de mercado por $m^2$ de terrenos comparables en el radio de influencia (1 a 3 km).
2. Determinar la capacidad edificable neta del lote aplicando el CUS municipal:
   $$\text{Área Vendible Máxima } (A_{\text{vend}}) = \text{Área Lote} \times CUS \times \eta_{\text{eficiencia}}$$
   *(Donde $\eta_{\text{eficiencia}} \approx 0.78 \text{ a } 0.85$ descontando circulaciones comunes y ductos)*.
3. Calcular la incidencia del suelo sobre el metro cuadrado vendible:
   $$I_{\text{suelo}} = \frac{\text{Costo Total del Terreno}}{A_{\text{vend}}}$$

### Paso 2: Estructuración del Presupuesto de Inversión y Precios de Venta
1. Consolidar los costos del desarrollo:
   - Costo Directo de Obra ($CD_{\text{m2}}$ en $USD/m^2$ vendible, provisto por `sara-apu-ecuadorian-engineering`).
   - Costos Indirectos de Proyecto (Estudios técnicos, licencias municipales, supervisión): $10\% - 15\%$ del CD.
   - Costos Comerciales y Marketing (Comisiones de brokers, publicidad, sala de ventas): $4\% - 6\%$ de las ventas brutas.
   - Gastos Financieros y Administración fiduciaria (Fideicomiso Inmobiliario): $3\% - 5\%$.
2. Formular la matriz de precios de venta sugeridos ($PV_{\text{m2}}$) por tipología:
   $$PV_{\text{m2}} = \frac{CD_{\text{m2}} + I_{\text{suelo}} + \text{Indirectos}}{1 - (\text{Margen Bruto Target} + \text{Costos Comerciales})}$$

### Paso 3: Simulación Econométrica de Absorción y Flujo de Caja
1. Simular tres (3) escenarios de absorción mensual de unidades:
   - **Escenario Conservador:** Absorción del $3\% - 4\%$ del inventario total mensual.
   - **Escenario Moderado:** Absorción del $5\% - 7\%$ mensual.
   - **Escenario Agresivo:** Absorción $\ge 8\%$ mensual impulsado por alianzas crediticias BIESS.
2. Construir la curva de ingresos temporales cruzándola con la curva S de egresos de obra.
3. Computar los indicadores financieros clave:
   $$\text{VAN} = \sum_{t=0}^{N} \frac{F_t}{(1 + r)^t} \quad \text{con tasa de descuento } r = 10\% - 12\%$$
   $$\text{TIR} : \text{Tasa donde } \text{VAN}(\text{TIR}) = 0$$

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Dashboard Financiero de Alta Densidad Informativa:**
   - Cifras de TIR y VAN destacadas con `--font-display` en `text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white`.
   - Gráfico interactivo de absorción acumulada vs punto de equilibrio (*Break-even point*) con áreas sombreadas suaves.
2. **Tabla de Tipologías Inmobiliarias:**
   - Desglose con tarjetas elegantes: Icono de dormitorios, metros útiles, terraza, precio por metro y cuota simulada de entrada en 24 o 36 meses.
3. **Ergonomía Móvil:**
   - Filtros de simulación de escenarios mediante botones segmentados (Segmented Control) con altura mínima táctil de 44px.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `proyectos_inmobiliarios`: Datos generales, CUS/COS, tipologías, precios base.
  - `inmuebles`: Inventario de unidades individuales con estado (Disponible, Reservado, Vendido).
  - `estudios_absorcion`: Registro de simulaciones y métricas financieras proyectadas.
- **Eventos del Bus:**
  - **Consume:** `APU_CONSOLIDADO`, `INMUEBLE_REGISTRADO`.
  - **Emite:** `ANALISIS_INMOBILIARIO_COMPLETO`, `PRECIOS_LISTA_ACTUALIZADOS`.
- **SharedMemory Key:** `realestate:project:<proyectoId>:absorption_model`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Absorción Inmobiliaria
```json
{
  "proyectoInmobiliarioId": "inmob-torres-san-patricio",
  "areaVendibleTotalM2": 4500.0,
  "totalUnidades": 54,
  "inversionTotalUSD": 4120000.0,
  "ventasTotalesProyectadasUSD": 5490000.0,
  "margenBrutoPorcentaje": 24.95,
  "indicadoresFinancieros": {
    "vanUSD": 412850.0,
    "tirPorcentaje": 21.40,
    "periodoRecuperacionMeses": 18
  },
  "escenariosAbsorcion": {
    "moderado": {
      "velocidadMensualUnidades": 3.5,
      "mesesHastaPuntoEquilibrio": 11,
      "tiempoLiquidacionTotalMeses": 16
    }
  },
  "preciosPorTipologia": [
    {
      "tipologia": "Suite Ejecutiva",
      "areaPromedioM2": 48.0,
      "precioM2": 1280.0,
      "precioVentaFinal": 61440.0,
      "unidadesTotales": 18
    },
    {
      "tipologia": "Departamento 3 Dormitorios",
      "areaPromedioM2": 95.0,
      "precioM2": 1220.0,
      "precioVentaFinal": 115900.0,
      "unidadesTotales": 20
    }
  ]
}
```

### 6.2 Reporte de Factibilidad Inmobiliaria (PDF)
- Resumen ejecutivo con ficha catastral y normativa urbana del GAD cantonal.
- Análisis de sensibilidad y curvas de flujo de caja acumulado.
- Firma del Director de Desarrollo Inmobiliario de GRUPO SARA.
