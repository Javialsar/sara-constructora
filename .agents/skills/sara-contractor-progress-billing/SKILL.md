---
name: sara-contractor-progress-billing
description: >-
  Cuantificación y generación de planillas de avance de obra periódicas (quincenales o mensuales).
  Cruza cómputos reales de fiscalización con el presupuesto contractual, amortiza el anticipo proporcionalmente
  y clasifica excedentes como contratos complementarios o diferencias de cantidades (Art. 85 LOSNCP).
---

# sara-contractor-progress-billing

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-contractor-progress-billing`
- **Unidad de Negocio:** SARA Fiscaliza & Finanzas de Obra
- **Objetivo Estratégico:**
  Generar, certificar y liquidar las Planillas Periódicas de Avance de Obra (quincenales o mensuales) para contratistas principales y subcontratistas. Cruza las mediciones acumuladas aprobadas por fiscalización de campo contra el presupuesto contractual, calcula la amortización proporcional del anticipo entregado, clasifica rubros excedentes bajo la normativa de diferencias de cantidades o contratos complementarios de la LOSNCP, y genera el expediente formal de pago en PDF para su trámite ante la entidad contratante o cuenta de custodia Escrow.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP):**
   - **Art. 85:** Diferencias en cantidades de obra (incremento o decremento involuntario hasta el $25\%$ del valor del contrato principal).
   - **Art. 87:** Contratos complementarios de obra (rubros nuevos indispensables hasta el $35\%$ del valor del contrato principal).
   - **Art. 125 del RGLOSNCP:** Trámite de planillas de avance de obra y plazos fatales para aprobación de fiscalización y pago (máximo 15 días posteriores a la presentación).
2. **Normas de Control Interno de la Contraloría General del Estado (Norma 408-17 - Pago de Planillas):**
   - Exigencia de memorias de cálculo, planos de detalle acotados (*As-Built* parciales), ensayos de laboratorio de probetas y bitácora del período.
3. **Regulaciones del Banco Central del Ecuador y Retenciones SRI:**
   - Retención obligatoria del fondo de garantía (habitualmente 5% del valor de cada planilla si no se sustituyó por póliza).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Acumulación de Avances de Campo y Cuadre de Cantidades
1. Consolidar los volúmenes ejecutados en el período reportados por `sara-field-inspection-geolog` para cada rubro del presupuesto.
2. Calcular para cada partida:
   - Cantidad en Planilla Anterior ($Q_{\text{ant}}$).
   - Cantidad en la Presente Planilla ($Q_{\text{act}}$).
   - Cantidad Acumulada a la Fecha ($Q_{\text{acum}} = Q_{\text{ant}} + Q_{\text{act}}$).
   - Cantidad Contractual Original ($Q_{\text{cont}}$).
   - Porcentaje de Avance del Rubro: $\%Av = (Q_{\text{acum}} / Q_{\text{cont}}) \times 100$.

### Paso 2: Detección y Clasificación Legal de Excedentes
1. Si para un rubro $Q_{\text{acum}} > Q_{\text{cont}}$:
   - Fraccionar el excedente: $\Delta Q = Q_{\text{acum}} - Q_{\text{cont}}$.
   - Facturar la cantidad contractual hasta el $100\%$ en la planilla ordinaria.
   - Clasificar $\Delta Q$ en la sección "Diferencia de Cantidades de Obra" (Art. 85 LOSNCP), verificando que la suma total acumulada de diferencias no supere el $25\%$ del monto del contrato.
   - Si se trata de un rubro no previsto originalmente en el contrato, clasificarlo como "Orden de Trabajo / Rubro Nuevo" para contrato complementario (Art. 87 LOSNCP).

### Paso 3: Amortización Proporcional del Anticipo y Deducciones
1. Obtener el porcentaje de anticipo contractual ($%Ant$, ej. $30\%$ o $40\%$).
2. Computar el monto bruto de la planilla presente:
   $$M_{\text{bruto}} = \sum (Q_{\text{act}} \times PU_{\text{contractual}})$$
3. Calcular la amortización del anticipo:
   $$\text{Amortización Anticipo} = M_{\text{bruto}} \times \left( \frac{\%Ant}{100} \right)$$
4. Calcular el fondo de garantía retenido (si aplica póliza o retención del 5%):
   $$\text{Fondo Garantía} = M_{\text{bruto}} \times 0.05$$
5. Computar el Monto Líquido a Pagar al Contratista:
   $$M_{\text{líquido}} = M_{\text{bruto}} - \text{Amortización Anticipo} - \text{Fondo Garantía} - \text{Multas Contractuales}$$

### Paso 4: Generación y Despacho del Expediente
1. Generar el expediente completo de la Planilla en PDF oficial con numeración correlativa (`Planilla No. 01`, `Planilla No. 02`).
2. Disparar el evento `PLANILLA_OBRA_APROBADA` hacia la skill `sara-sri-tax-escrow-governance` para la emisión de la factura electrónica y liberación de fondos de la cuenta de custodia.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Cuadro de Planilla Tipo Hoja de Control Financiero de Élite:**
   - Tabla estilizada con números tabulares alineados a la derecha (`font-mono tabular-nums`).
   - Columnas claras: Rubro, Descripción, Unidad, Cant. Contractual, Cant. Anterior, Cant. Actual, Cant. Acumulada, Saldo por Ejecutar, Precio Unitario, Monto Parcial.
   - Totales generales destacados con tipografía display (`text-2xl font-bold font-display text-emerald-900 dark:text-emerald-100`).
2. **Resumen Financiero en Tarjeta Flotante:**
   - Desglose visual tipo recibo bancario con chips de color para Bruto, Amortización (-), Garantía (-) y Líquido a Cobrar (=).
3. **Ergonomía:**
   - Botón de aprobación y firma electrónica táctil grande de al menos `48px` de altura (`h-12`).

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `planillas_obra`: Registro maestro de planillas, montos brutos, amortizaciones y estados de aprobación.
  - `planillas_detalle`: Cantidades ejecutadas por rubro en cada periodo.
  - `contratos_obra`: Monto contractual, saldo de anticipo por devengar y garantías vigentes.
- **Eventos del Bus:**
  - **Consume:** `BITACORAS_PERIODO_CONSOLIDADAS`.
  - **Emite:** `PLANILLA_OBRA_APROBADA`, `ANTICIPO_TOTALMENTE_DEVENGADO`.
- **SharedMemory Key:** `fiscaliza:project:<proyectoId>:progress_billing:p<numeroPlanilla>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Planilla de Avance de Obra
```json
{
  "planillaId": "pln-obra-042-no03",
  "proyectoId": "sara-proj-2026-042",
  "numeroPlanilla": 3,
  "periodo": {
    "desde": "2026-09-16",
    "hasta": "2026-10-15"
  },
  "contratista": "CONSTRUCTORA SARA S.A.S.",
  "resumenEconomico": {
    "montoContratoOriginalUSD": 450000.0,
    "anticipoInicialUSD": 135000.0,
    "porcentajeAnticipo": 30.0,
    "montoBrutoPlanillaActualUSD": 58420.0,
    "amortizacionAnticipoActualUSD": 17526.0,
    "saldoAnticipoPorAmortizarUSD": 64280.0,
    "retencionFondoGarantiaUSD": 2921.0,
    "multasRetencionesPenalesUSD": 0.0,
    "montoLiquidoAPagarUSD": 37973.0
  },
  "avanceFisicoAcumuladoPorcentaje": 48.65,
  "avanceFinancieroAcumuladoPorcentaje": 46.80,
  "diferenciasDeCantidadesDetectadas": [
    {
      "rubroCodigo": "CIV-001",
      "descripcion": "Excavación manual en zanjas",
      "cantidadContractual": 120.0,
      "cantidadEjecutadaAcumulada": 132.5,
      "excesoCantidad": 12.5,
      "montoExcesoUSD": 187.50,
      "justificacionTecnica": "Falla geológica menor encontrada en cimientos de bloque B"
    }
  ],
  "estado": "APROBADA_POR_FISCALIZACION"
}
```

### 6.2 Expediente Oficial de Planilla de Avance (PDF)
- Carátula institucional firmada por Director de Fiscalización y Contratista.
- Cuadro general de cantidades y precios unitarios oficiales.
- Anexo de memorias técnicas de cálculo y resumen fotográfico de los rubros planillados.
