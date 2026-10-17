---
name: sara-cashflow-liquidity-stress
description: >-
  Pruebas de estrés financiero continuo, modelado de flujo de caja y proyección del Ratio de Cobertura
  de Flujo de Operación (CFCR) a 30, 60 y 90 días para prevenir insolvencia y cuellos de botella de liquidez en obras civiles.
---

# sara-cashflow-liquidity-stress

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-cashflow-liquidity-stress`
- **Unidad de Negocio:** SARA Finanzas & Dirección Financiera del Holding
- **Objetivo Estratégico:**
  Monitorear, proyectar y someter a pruebas de estrés continuas la posición de liquidez y tesorería de GRUPO SARA en todos sus proyectos de construcción en marcha. Modela el desfase temporal inherente al sector (cobro de planillas públicas a 30, 60 o 90 días frente a compromisos ineludibles semanales de nómina obrera, compras de hormigón/acero y arriendo de maquinaria), calculando el Ratio de Cobertura de Flujo de Operación (CFCR) y emitiendo planes de contingencia antes de que ocurra un déficit de caja.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Normas Internacionales de Información Financiera (NIIF / IFRS 15 - Ingresos de Contratos con Clientes):**
   - Reconocimiento de ingresos por método de avance de obra (inspección de cantidades ejecutadas).
   - Medición de activos por contrato (costos incurridos no planillados) y pasivos de contrato (anticipos no devengados).
2. **Estándares del Comité de Supervisión Bancaria de Basilea (LCR - Coeficiente de Cobertura de Liquidez):**
   - Pruebas de estrés bajo escenarios de retención o retraso severo de pagos estatales (demoras de 60 a 120 días habituales en SERCOP/Ministerio de Finanzas).
3. **Código Monetario y Financiero del Ecuador:**
   - Límites y tasas máximas de descuento para operaciones de Factoring o descuento de facturas comerciales y planillas de obras públicas.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Mapeo de Entradas y Salidas de Tesorería Programadas
1. Recorrer los proyectos en ejecución y consolidar los flujos de los próximos 90 días:
   - **Ingresos Programados ($I_t$):** Planillas de obra en trámite de pago por entidades públicas o clientes privados, aportes de capital programados, cobro de cuotas de entrada inmobiliaria.
   - **Egresos Ineludibles ($E_t$):**
     - Nómina de personal obrero y aportes IESS (frecuencia semanal y quincenal, prioridad crítica).
     - Proveedores de materiales estratégicos a 15 y 30 días (cemento, acero, hormigón preparado).
     - Arriendo de maquinaria y combustible diésel semanal.
     - Pago mensual de impuestos SRI y retenciones.
     - Cuotas de amortización de créditos bancarios o leasing de maquinaria.

### Paso 2: Cálculo del Ratio de Cobertura de Flujo de Operación (CFCR)
Para cada ventana temporal ($T = 30, 60, 90\,\text{días}$):
$$\text{CFCR}_T = \frac{\text{Saldo Disponible en Caja/Bancos} + \sum_{t=1}^{T} I_t}{\sum_{t=1}^{T} E_t}$$
Evaluar la condición de salud financiera:
- **$\text{CFCR} \ge 1.25$:** Salud Óptima (Superávit de liquidez).
- **$1.05 \le \text{CFCR} < 1.25$:** Alerta Preventiva (Holgura estrecha).
- **$\text{CFCR} < 1.05$:** Estrés Financiero Crítico (Riesgo inminente de incumplimiento de pagos).

### Paso 3: Simulación de Escenarios de Estrés (Stress Testing)
1. **Escenario 1 (Retraso SERCOP):** Demora de 45 días adicionales en el cobro de la planilla principal del Estado ecuatoriano.
2. **Escenario 2 (Volatilidad de Insumos):** Incremento del $12\%$ en el precio internacional del acero o fletes de áridos.
3. **Escenario 3 (Sobrecosto por Clima):** Incremento de 15 días en la duración de la fase estructural con sobrecosto de maquinaria ociosa.
4. Identificar el día exacto de corte donde el saldo de tesorería se vuelve negativo (si ocurre).

### Paso 4: Generación de Medidas de Mitigación Inmediatas
Si se detecta un déficit proyectado:
1. Recomendar la cesión de derechos de crédito de la planilla aprobada mediante operación de **Factoring bancario** con tasa de descuento estimada ($7\% - 10\%$ anual).
2. Proponer la renegociación de plazos a 45 días con proveedores del marketplace de GRUPO SARA.
3. Priorizar la ejecución de rubros constructivos con mayor margen neto y menor intensidad de capital circulante en los siguientes 15 días.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Gráfico de Cascada y Curva de Tesorería:**
   - Gráfico de área interactivo con Recharts que ilustra el saldo diario de liquidez proyectado durante los 90 días.
   - Línea roja horizontal punteada indicando el umbral de reserva mínima de seguridad ($USD\,25.000$).
   - Días con saldo por debajo de la reserva mínima resaltados con sombreado de alerta en rojo pálido translúcido.
2. **Tarjetas de Ratio de Cobertura:**
   - 3 tarjetas para 30, 60 y 90 días con tipografía display (`font-bold font-display text-3xl`) y semáforo de color dinámico.
3. **Ergonomía Móvil:**
   - Botón de "Simular Factoring" interactivo con slider táctil para evaluar el impacto inmediato en la caja sin recargar.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `flujo_caja_proyecciones`: Registros diarios y semanales de saldos proyectados vs reales.
  - `tesoreria_obligaciones`: Cuentas por cobrar y cuentas por pagar con vencimiento.
  - `metricas_sri`: Saldos contables consolidados.
- **Eventos del Bus:**
  - **Consume:** `PLANILLA_OBRA_APROBADA`, `FACTURA_COMPRA_REGISTRADA`.
  - **Emite:** `ESTRES_LIQUIDEZ_DETECTADO`, `PLAN_MITIGACION_FACTORING_SUGERIDO`.
- **SharedMemory Key:** `finance:treasury:liquidity_stress:horizon_90d`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Prueba de Estrés de Liquidez
```json
{
  "analisisId": "stress-test-2026-w42",
  "fechaAnalisis": "2026-10-16",
  "saldoCajaBancosActualUSD": 78450.0,
  "reservaSeguridadMinimaUSD": 25000.0,
  "ratiosCobertura": {
    "cfcr30Dias": 1.34,
    "cfcr60Dias": 1.08,
    "cfcr90Dias": 0.94,
    "diagnostico90Dias": "DEFICIT_PROYECTADO_EN_DIA_68"
  },
  "escenarioEstres": {
    "nombre": "Retraso pago Ministerio de Obras Públicas (+45 días)",
    "deficitMaximoProyectadoUSD": -18420.0,
    "fechaPuntoCritico": "2026-12-23"
  },
  "planMitigacionRecomendado": [
    {
      "accion": "FACTORING_PLANILLA_03",
      "montoCedidoUSD": 37973.0,
      "tasaDescuentoAnual": 8.5,
      "liquidezInmediataLiberadaUSD": 35200.0,
      "nuevoCfcr90Dias": 1.18,
      "resultado": "DEFICIT_ELIMINADO"
    }
  ]
}
```

### 6.2 Reporte Ejecutivo de Posición de Tesorería (PDF)
- Informe confidencial para el Directorio de GRUPO SARA con gráfico de liquidez a 90 días.
- Matriz de vencimientos por cobrar y por pagar.
- Dictamen y firmas del Gerente Financiero y Auditor Interno.
