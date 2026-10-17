---
name: sara-sri-tax-escrow-governance
description: >-
  Gobernanza tributaria integral ante el SRI del Ecuador (retenciones en la fuente, liquidaciones, IVA)
  y administración de cuentas de custodia financiera (Escrow) liberadas exclusivamente contra actas técnicas de fiscalización.
---

# sara-sri-tax-escrow-governance

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-sri-tax-escrow-governance`
- **Unidad de Negocio:** SARA Finanzas, Pagos & SRI
- **Objetivo Estratégico:**
  Automatizar el cumplimiento tributario riguroso de GRUPO SARA ante el Servicio de Rentas Internas (SRI) del Ecuador y administrar la arquitectura de custodia financiera (*Escrow Accounts*). Aplica los porcentajes de retención en la fuente de Impuesto a la Renta (IR) e Impuesto al Valor Agregado (IVA) según la naturaleza del bien o servicio en la construcción, emite los comprobantes electrónicos en formato XML firmados con certificado X.509, y custodia los fondos de anticipos y planillas, autorizando los desembolsos exclusivamente tras la certificación técnica favorable emitida por `sara-contractor-progress-billing`.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley de Régimen Tributario Interno (LRTI) y su Reglamento de Aplicación:**
   - Tabla de Retenciones en la Fuente del Impuesto a la Renta del SRI vigente:
     - **Código 312:** Transferencia de bienes muebles de naturaleza corporal (Materiales de construcción): Retención del $1.75\%$ (o $2.75\%$ según calidad societaria).
     - **Código 344:** Contratos de construcción de obra material inmueble, urbanización y lotización: Retención del $1.75\%$.
     - **Código 303:** Honorarios profesionales y consultoría técnica: Retención del $10\%$.
     - **Código 304:** Servicios donde predomina el intelecto no relacionados con el título: $8\%$.
     - **Código 309:** Servicios donde predomina la mano de obra: $2.75\%$.
     - **Código 311:** Arrendamiento de maquinaria y bienes muebles: $8\%$.
   - Retención de IVA:
     - Bienes: $30\%$ del IVA facturado entre contribuyentes ordinarios y especiales.
     - Servicios / Construcción de Obra: $70\%$ o $100\%$ del IVA facturado.
2. **Esquema de Facturación Electrónica del SRI (Ficha Técnica Comprobantes Electrónicos v2.21):**
   - Emisión de Retenciones Electrónicas en formato XML con firma digital X.509, algoritmo RSA-SHA256 y clave de acceso de 49 dígitos.
3. **Código de Comercio y Ley de Mercado de Valores (Fideicomisos y Cuentas Escrow):**
   - Blindaje de fondos de inversión contra embargos de terceros y cláusulas de liberación condicionada por hito técnico.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Recepción de Facturas y Determinación de Retenciones
1. Procesar la factura electrónica (XML o JSON) emitida por el subcontratista, proveedor de materiales o transportista.
2. Determinar la condición tributaria del emisor: RIMPE Negocio Popular, RIMPE Emprendedor, Régimen General, o Contribuyente Especial.
3. Asignar los códigos de retención correspondientes:
   - Para compra de cemento, acero, áridos: Código SRI 312 ($1.75\%$) + Retención IVA $30\%$ (si aplica).
   - Para mano de obra subcontratada / encofrado: Código SRI 344 ($1.75\%$) o 309 ($2.75\%$) + Retención IVA $70\%$ o $100\%$.
   - Para arriendo de retroexcavadora / volqueta: Código SRI 311 ($8\%$) + Retención IVA $70\%$.
4. Generar el comprobante de retención electrónico, firmarlo digitalmente y enviarlo al Web Service del SRI para su autorización.

### Paso 2: Gobernanza de la Cuenta Escrow del Proyecto
1. Toda aportación de capital de inversionistas, anticipos de clientes o fondos de entidades públicas ingresa a la cuenta escrow segregada del proyecto (`escrow_balance`).
2. Los fondos quedan inmovilizados con seguro fiduciario.
3. Al recibir una solicitud de pago de planilla de obra:
   - Consultar el estado en `sara-contractor-progress-billing`.
   - Verificar que la planilla cuente con el estado `APROBADA_POR_FISCALIZACION` y que exista el folio de bitácora correspondiente con GPS válido.
   - Si no existe certificación técnica o el avance físico está en disputa, bloquear de inmediato la liberación de fondos.

### Paso 3: Ejecución de la Dispersión y Conciliación Bancaria
1. Al cumplirse todos los requisitos técnicos y tributarios:
   - Calcular el monto neto a transferir al contratista/proveedor (Monto Factura Menos Retenciones de Ley).
   - Generar la orden de transferencia electrónica hacia la pasarela bancaria o API de pagos.
   - Sincronizar el saldo contable en la tabla `metricas_sri` y emitir el recibo de liquidación para el cliente y el beneficiario.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Dashboard Financiero y Tributario Ejecutivo:**
   - Métricas de flujo de caja, IVA acumulado en compras vs ventas y retenciones por pagar en tarjetas con tipografía display (`--font-display` `text-3xl font-bold tracking-tight`).
   - Gráfico de barras apiladas con Recharts mostrando el histórico mensual de retenciones categorizadas por código del SRI.
2. **Tarjeta de Cuenta Escrow Blindada:**
   - Visualización con insignia de seguridad (Candado dorado o esmeralda, estado `FONDO CUSTODIADO Y ASEGURADO`).
   - Botón de "Liberar Fondos por Hito de Fiscalización" bloqueado en gris con tooltip explicativo si la fiscalización no ha firmado digitalmente.
3. **Ergonomía:**
   - Botón de descarga de XML y RIDE (PDF) de retención en un solo toque con altura mínima táctil de 44px.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `retenciones_sri`: Registro de comprobantes autorizados, clave de acceso y montos retenidos.
  - `cuentas_escrow`: Cuentas segregadas por proyecto, saldo bloqueado, saldo liberado.
  - `pagos_transacciones`: Historial de transferencias bancarias y pasarelas (Kushki / Stripe).
  - `src/app/dashboard/metricas-sri`: Interfaz de usuario de reportes tributarios.
- **Eventos del Bus:**
  - **Consume:** `PLANILLA_OBRA_APROBADA`, `FACTURA_COMPRA_REGISTRADA`.
  - **Emite:** `RETENCION_SRI_EMITIDA`, `FONDOS_ESCROW_LIBERADOS`, `PAGO_SUBCONTRATISTA_DISPERSADO`.
- **SharedMemory Key:** `finance:project:<proyectoId>:escrow_state`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Retención Tributaria y Liberación Escrow
```json
{
  "transaccionId": "tx-escrow-2026-904",
  "proyectoId": "sara-proj-2026-042",
  "planillaVinculadaId": "pln-obra-042-no03",
  "proveedor": {
    "razonSocial": "HORMIGONES DEL VALLE S.A.",
    "ruc": "1792048592001",
    "calificacionSRI": "CONTRIBUYENTE_ESPECIAL"
  },
  "liquidacionTributaria": {
    "subtotalFacturaUSD": 37973.0,
    "ivaFacturadoUSD": 5695.95,
    "retencionRenta": {
      "codigoSRI": "312",
      "porcentaje": 1.75,
      "valorRetenidoUSD": 664.53
    },
    "retencionIVA": {
      "porcentaje": 30.0,
      "valorRetenidoUSD": 1708.79
    },
    "totalRetenidoUSD": 2373.32,
    "valorNetoAPagarUSD": 41295.63,
    "claveAccesoSRI": "1610202607179204859200120010010000045211234567819"
  },
  "cuentaEscrow": {
    "fideicomisoId": "fid-sara-austro",
    "saldoPrevioUSD": 128450.0,
    "montoLiberadoUSD": 41295.63,
    "saldoRestanteUSD": 87154.37,
    "autorizadoPorFiscalizacion": true
  },
  "estado": "PAGO_DISPERSADO_EXITOSAMENTE"
}
```

### 6.2 Comprobante RIDE Oficial del SRI y Certificado Escrow (PDF)
- Formato RIDE oficial regulado por la resolución NAC del SRI con código de barras bidimensional.
- Certificado fiduciario de liberación de fondos contra acta de recepción de obra.
