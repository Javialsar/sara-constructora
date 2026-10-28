---
name: sara-automated-three-way-match-audit
description: >-
  Conciliación tripartita automatizada (Three-Way Match) de órdenes de compra, actas de obra y facturas electrónicas SRI.
  Valida tolerancias máximas (<= 1.0%), audita comprobantes con firma XAdES-BES / Módulo 11 y custodia desembolsos Escrow.
---

# sara-automated-three-way-match-audit

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-automated-three-way-match-audit`
- **Unidad de Negocio:** SARA Pagos (Fideicomiso Escrow, Conciliación Financiera y Control Antifraude)
- **Repositorio / Estándar GitHub de Referencia:**
  - `zavora-ai/skill-procurement` (`three-way-matching`, `invoice-reconciliation-engine`).
  - Frameworks agénticos de Cuentas por Pagar Autónomas (*Autonomous Accounts Payable AP*).
  - Ficha Técnica de Comprobantes Electrónicos del Servicio de Rentas Internas (SRI v2.21 - Firma XAdES-BES, SHA-256 y Algoritmo Módulo 11).
  - Ley de Prevención, Detección y Erradicación del Delito de Lavado de Activos y Financiamiento de Delitos (UAFE).
- **Objetivo Estratégico:**
  Ejecutar el control de legalidad y cuadre financiero inviolable antes de autorizar cualquier dispersión de fondos desde las cuentas de fideicomiso *Escrow* de GRUPO SARA. Valida el cruce exacto entre la Orden de Compra/Contrato ($PO$), el Acta de Entrega-Recepción en Bodega o Planilla de Fiscalización ($GRN$), y la Factura Electrónica autorizada por el SRI ($INV$), verificando cantidades, precios unitarios, retenciones en la fuente y límites de tolerancia matemática ($\le 1.0\%$), bloqueando pagos duplicados o fraudulentos.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley de Régimen Tributario Interno (LRTI) y Reglamento de Comprobantes de Venta:**
   - Validez jurídica exclusiva de facturas electrónicas con clave de acceso de 49 dígitos y dígito verificador Módulo 11.
   - Retenciones en la fuente obligatorias:
     - Código SRI 344: Contratos de Construcción de Obra Material Inmueble (2.00% Impuesto a la Renta).
     - Código SRI 312: Transferencia de Bienes Muebles de Naturaleza Corporal (1.75% Impuesto a la Renta).
     - Retención de IVA: 30% en bienes y 70% o 100% en servicios y fiscalizaciones.
2. **Normativa de Contratación de Obras (Fondo de Garantía de Buena Ejecución):**
   - Retención cautelar obligatoria del 5% del valor de cada planilla o factura hasta la suscripción del Acta de Entrega-Recepción Definitiva de la obra (Art. 76 LOSNCP).
3. **Resoluciones UAFE para el Sector Construcción e Inmobiliario:**
   - Monitoreo de operaciones que involucren pagos en efectivo iguales o superiores a $\$10,000\,\text{USD}$ (Reporte de Operaciones Múltiples en Efectivo - RESU).
   - Verificación de beneficiarios finales y cruce contra listas de control internacionales (OFAC, ONU, PEPs).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Ingesta y Desglose de los Tres Documentos Transaccionales
1. Recibir la solicitud de liquidación de pago e identificar los 3 componentes vinculados por el `correlationId`:
   - **Documento 1 - Orden de Compra / Subcontrato ($PO$):** Rubro, cantidades pactadas ($Q_{PO}$), precios unitarios acordados ($P_{PO}$) y condiciones de pago.
   - **Documento 2 - Acta de Recepción / Fiscalización ($GRN$):** Cantidades físicas efectivamente recibidas en bodega o aprobadas en obra ($Q_{GRN}$), firmada digitalmente por el fiscalizador técnico.
   - **Documento 3 - Factura Electrónica SRI ($INV$):** Cantidades facturadas ($Q_{INV}$), precios unitarios facturados ($P_{INV}$), subtotal, IVA y clave de acceso de 49 dígitos.

### Paso 2: Validación Criptográfica y Tributaria de la Factura SRI
1. Validar la estructura de la clave de acceso de 49 dígitos mediante el algoritmo **Módulo 11**:
   $$\sum_{k=1}^{48} d_k \times w_k \pmod{11}$$
2. Verificar el estado del comprobante ante los web services del SRI (ambiente Producción: estado `AUTORIZADO`).
3. Comprobar que el RUC del emisor esté activo y habilitado para emitir facturas en la base del catastro tributario.
4. Confirmar que la clave de acceso no haya sido pagada o registrada previamente en el sistema (detección de doble cobro).

### Paso 3: Ejecución de la Matriz Three-Way Match y Tolerancias
1. **Verificación de Cantidad (Quantity Match):**
   $$\Delta Q = \frac{|Q_{INV} - Q_{GRN}|}{Q_{GRN}} \times 100\%$$
   - Regla Estricta: Si $Q_{INV} > Q_{GRN}$, no se admite pago sobre excedentes no avalados por fiscalización ($\Delta Q = 0.00\%$).
2. **Verificación de Precio Unitario (Price Match):**
   $$\Delta P = \frac{|P_{INV} - P_{PO}|}{P_{PO}} \times 100\%$$
   - Tolerancia Máxima: $\Delta P \le 1.00\%$ (para absorber redondeos centesimales en fletes o combustible). Si $\Delta P > 1.00\%$, suspender trámite.
3. **Cálculo de la Retención en la Fuente e IVA:**
   $$\text{Retención IR} = \text{Subtotal Aprobado} \times \tau_{\text{IR}}, \quad \tau_{\text{IR}} \in \{0.0175, 0.02, 0.08, 0.10\}$$
   $$\text{Retención IVA} = \text{Monto IVA} \times \tau_{\text{R\_IVA}}, \quad \tau_{\text{R\_IVA}} \in \{0.30, 0.70, 1.00\}$$
   $$\text{Fondo de Garantía de Obra} = \text{Subtotal Aprobado} \times 0.05$$

### Paso 4: Decisión Automatizada de Dispersión Escrow
1. Si todas las validaciones son conformes ($\Delta Q = 0$, $\Delta P \le 1.0\%$, Factura SRI Autorizada):
   - Calcular el valor neto líquido a transferir al proveedor o contratista:
     $$\text{Monto Líquido} = \text{Total Factura} - (\text{Retención IR} + \text{Retención IVA} + \text{Fondo Garantía})$$
   - Emitir la instrucción de dispersión electrónica desde la cuenta de custodia *Escrow*.
   - Generar el Comprobante de Retención Electrónico XML y despacharlo al SRI y al proveedor.
2. Si existe discrepancia:
   - Bloquear la transacción y enviar reporte de inconsistencias al buzón del proveedor y al fiscalizador de obra.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Cero Pagos No Justificados:** 100% de los desembolsos cuentan con respaldo de acta de fiscalización firmada.
2. **Detección de Facturas Apócrifas o Duplicadas:** Eficacia del $100\%$ mediante verificación Módulo 11 y hash único de clave de acceso SRI.
3. **Puntualidad en Retenciones:** Emisión y transmisión de comprobantes de retención al SRI en $< 72\,\text{horas}$ de recibida la factura.
