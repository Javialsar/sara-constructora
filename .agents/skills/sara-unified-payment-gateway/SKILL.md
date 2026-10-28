---
name: sara-unified-payment-gateway
description: >-
  Estándar unificado de pasarela de pago digital, conciliación bancaria y custodia Escrow
  para todos los módulos del ecosistema GRUPO SARA (Fletes, Stays, Marketplace, Talento,
  Inmobiliaria, Constructora, APU y Pagos), con soporte para Transferencias, QRs,
  Tarjetas de Débito/Crédito, PayPal y Billetera interna bajo normativa SRI y PCI-DSS.
---

# sara-unified-payment-gateway

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-unified-payment-gateway`
- **Unidad de Negocio:** SARA-PAGOS, Finanzas & Orquestación Transversal GRUPO SARA
- **Objetivo Estratégico:**
  Homogeneizar y gobernar la experiencia completa de pago digital en todo el holding empresarial **GRUPO SARA**. Elimina la fragmentación de formularios y modales dispares, implementando un único componente universal (`<SaraUnifiedPaymentGatewayModal />`) con el mismo diseño Fintech Dark (acento neón esmeralda `#00E599` sobre fondo `slate-950/slate-900`), soporte omnicanal para el mercado ecuatoriano e internacional, conciliación automática con comprobantes electrónicos del SRI y custodia financiera (*Escrow* multi-hitos) respaldada en Supabase/PostgreSQL.

---

## 2. Evaluación de Diseño y Ergonomía (Referencia Imagen 1)

El diseño de referencia observado en la pasarela de SARA-Fletes (**Imagen 1**) establece el estándar corporativo definitivo por las siguientes razones:

1. **Jerarquía Visual Inmediata:**
   - **Encabezado Seguro:** Icono de escudo verificado en verde neón (`emerald-400`), título contundente ("Pasarela de Pago Digital") y subtítulo contextual de seguridad garantizada.
   - **Ficha Resumen del Beneficiario:** Contenedor oscuro contrastado que identifica con precisión a quién se transfiere el dinero (Transportista, Proveedor Mayorista, Anfitrión Stays, Cuadrilla o Fideicomiso SARA) junto al importe total en tipografía monoespaciada tabular (`text-emerald-400 font-black text-xl`).
   - **Segmented Control de Métodos:** Pestañas compactas y táctiles con iconos universales.
   - **Banner de Entorno & Cumplimiento:** Caja ámbar para entornos demo/sandbox y recordatorio de encriptación TLS 256-Bit con PCI-DSS.
   - **Call-to-Action Destacado:** Botón prominente de ancho completo en verde esmeralda con reflejo luminoso y texto explícito del monto a debitar ("CONFIRMAR Y APLICAR PAGO ($X.XX USD)").
   - **Pie Legal SRI:** Mención explícita a la normativa ecuatoriana (Resolución SRI NAC-DGERCGC24-00000013).

2. **Propuesta de Elevación y Perfeccionamiento Universal:**
   Para aplicar este mismo diseño en los 8 módulos sin alterar su esencia visual, la pasarela unificada añade:
   - **Selector de Canales Expandido a 5 Pestañas:**
     `[ 💳 Tarjeta ] [ 📱 Códigos QR ] [ 🏦 Transferencia ] [ 🅿️ PayPal ] [ 🛡️ Escrow / Billetera ]`
   - **Auto-Detección de Franquicia de Tarjeta:** Reconocimiento dinámico de Visa, Mastercard, American Express, Diners Club y Discover mediante validación de BIN y algoritmo de Luhn con badge visual en el input.
   - **Soporte de Crédito Corriente y Diferido:** Selector de financiamiento a 3, 6 o 12 meses con cálculo de cuota mensual para compras inmobiliarias, materiales o suscripciones anuales.
   - **QRs Oficiales del Ecuador con Monto Precargado:**
     - **DeUna! (Banco Pichincha):** Deeplink y QR con monto exacto y referencia.
     - **PayPhone QR:** Acreditación instantánea con tarjeta o saldo Payphone.
     - **Banco Guayaquil / Peigo:** Transferencia inmediata interbancaria.
   - **Transferencia con Copia en 1 Clic y Drag & Drop de Comprobante:**
     - Datos bancarios oficiales desplegados con botón de copiado rápido (RUC, cuenta, tipo, titular).
     - Zona de carga para voucher en JPG, PNG o PDF con previsualización y cálculo de hash SHA-256 para prevenir comprobantes duplicados.
   - **Desglose Contable Transparente (IVA Incluido — Cálculo Inverso SRI):**
     - En todos los planes de suscripción SaaS y tarifas cerradas del ecosistema, el **valor publicado ya incluye IVA** ($\text{Precio Final} = \text{Total a Pagar}$).
     - La pasarela calcula y exhibe automáticamente el desglose inverso antes de pagar:
       $$\text{Base Imponible (Subtotal)} = \text{round}\left(\frac{\text{Total}}{1 + r_{\text{IVA}}}, 2\right), \quad \text{Monto IVA} = \text{Total} - \text{Base Imponible}$$
       donde $r_{\text{IVA}} \in \{0.15 \text{ (General/SaaS)}, 0.05 \text{ (Materiales Construcción Res. NAC-DGERCGC24-00000013)}, 0.08 \text{ (Turismo Feriados)}, 0.00 \text{ (Exento/Transporte)}\}$.
   - **Emisión Automática e Inmediata de Factura Electrónica SRI Post-Pago:**
     - Al confirmarse el pago (`handleConfirmPayment`), la pasarela invoca automáticamente el motor [`SriEmissionService`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/services/sriEmissionService.ts) vía [`POST /api/facturacion/emitir`](file:///d:/SaS_Proyectos/sara-constructora/src/app/api/facturacion/emitir/route.ts) con el código de forma de pago oficial del SRI (`20` Otros con utilización del sistema financiero para Transferencia/QR, `19` Tarjeta de Crédito, `16` Tarjeta de Débito).
     - Genera la **Clave de Acceso de 49 dígitos (Módulo 11)**, firma el comprobante con **XAdES-BES Enveloped** y presenta una vista de confirmación ejecutiva dentro del mismo modal con descarga directa de **RIDE PDF** y **XML Autorizado** vía [`GET /api/facturacion/descargar`](file:///d:/SaS_Proyectos/sara-constructora/src/app/api/facturacion/descargar/route.ts).

---

## 3. Mapa de Módulos del Ecosistema GRUPO SARA

| Módulo | Pantalla / Flujo de Usuario | Concepto de Pago | Beneficiario Mostrado | Métodos Habilitados | Tratamiento Tributario SRI |
|---|---|---|---|---|---|
| **SARA-FLETES** | `/modulos/fletes` (Liquidación de viaje) | Pago directo por viaje / Desalojo / Retorno Backhaul | Conductor / Transportista asignado (Placa, Vehículo) | Tarjeta, DeUna QR, PayPhone, Transferencia | Retención 1% transporte pesado, IVA exento o 15% |
| **SARA-FLETES** | `/modulos/fletes/mi-perfil` | Recarga de Billetera Digital del Transportista | SARA Wallet Holding | Tarjeta, QRs, Transferencia | Saldo a favor, sin retención previa |
| **SARA-STAYS** | `/stays` y `/stays/mis-reservas` | Reserva de Alojamiento Corporativo / Turístico | Anfitrión del Inmueble / SARA Stays | Tarjeta, PayPal, QRs, Transferencia | IVA 15% ordinario u 8% feriados nacionales (LUAF) |
| **SARA-MARKETPLACE** | `/modulos/compras` | Pago de Orden de Compra B2B de Materiales | Proveedor Mayorista (Adelca, Holcim, Novacero) | Transferencia, Tarjeta Corporativa, Escrow | IVA 5% materiales construcción, Retención IR 1.75% (312) |
| **SARA-TALENTOHUMANO** | `/modulos/talento/mi-perfil` & `/registro` | Membresía Pro / Cuota de Validación SECAP | SARA Talento Humano | Tarjeta, QRs, Transferencia | Factura por servicios tecnológicos IVA 15% |
| **SARA-TALENTOHUMANO** | `/modulos/talento/asistencia` | Pago de Quincena / Nómina a Cuadrillas | Maestro Mayor / Trabajador calificado | Transferencia Bancaria, Billetera SARA | Aporte Personal 9.45%, Aporte Patronal 12.15% |
| **SARA-INMOBILIARIA** | `/inmobiliaria/mi-portal` | Pago de Plan de Publicación / Corretaje | SARA Inmobiliaria | Transferencia, QRs, Tarjeta | Factura comercial comisión corretaje IVA 15% |
| **SARA-INMOBILIARIA** | `/inmobiliaria` (Ficha Inmueble) | Separación / Reserva de Lote o Preventa | Fideicomiso Inmobiliario de Obra | Transferencia, Tarjeta, Cheque certificado | Custodia en cuenta Escrow de preventa |
| **SARA-CONSTRUCTORA** | `/portal/dashboard` & `/constructora` | Anticipo de Obra / Planilla de Avance Físico | Consorcio GRUPO SARA Constructora | Transferencia Empresarial, Escrow Hitos | Retención Obra Civil 1.75% IR (344), Retención IVA 30%/70% |
| **SARA-APU** | `/dashboard/planes` | Suscripción SaaS APU (Básico, Pro, Empresa) | SARA Software & Cost Engineering | Tarjeta (Stripe/Kushki), PayPal, Transferencia | SaaS Digital IVA 15% |
| **SARA-PAGOS** | `/admin/pagos` | Conciliación y Aprobación de Comprobantes | Conciliador Contable SARA | Aprobación / Rechazo manual de vouchers | Generación automática de asientos contables |

---

## 4. Especificación del Componente Universal (`SaraUnifiedPaymentGatewayModal.tsx`)

### 4.1. Contrato de Props TypeScript
```typescript
export type SaraModuloPago = 
  | 'FLETES' 
  | 'STAYS' 
  | 'MARKETPLACE' 
  | 'TALENTO' 
  | 'INMOBILIARIA' 
  | 'CONSTRUCTORA' 
  | 'APU' 
  | 'PAGOS';

export type MetodoPagoUniversal = 
  | 'tarjeta' 
  | 'qr_deuna' 
  | 'qr_payphone' 
  | 'qr_guayaquil' 
  | 'transferencia' 
  | 'paypal' 
  | 'billetera_escrow';

export interface DesgloseImpuestosSRI {
  ivaIncluido?: boolean; // Por defecto true para planes SaaS y tarifas publicadas
  subtotalUSD: number; // Base Imponible: round(totalPagarUSD / (1 + tarifaIvaPct/100), 2)
  tarifaIvaPct: 0 | 5 | 8 | 15;
  montoIvaUSD: number; // totalPagarUSD - subtotalUSD (garantiza cuadre exacto al centavo)
  retencionRentaCodigo?: '312' | '344' | '303' | '304' | '309' | '311' | 'RIMPE';
  retencionRentaMontoUSD?: number;
  retencionIvaMontoUSD?: number;
  totalPagarUSD: number;
}

export interface DatosFacturacionAdquirente {
  tipoIdentificacion: '04' | '05' | '06' | '07'; // 04: RUC, 05: Cédula, 06: Pasaporte, 07: Consumidor Final
  identificacion: string;
  razonSocial: string;
  email: string;
  direccion?: string;
  telefono?: string;
}

export interface FacturaElectronicaEmitidaSRI {
  claveAcceso: string; // 49 dígitos Módulo 11
  numeroComprobante: string; // Ej: 001-001-000000142
  fechaAutorizacion: string;
  estadoSri: 'AUTORIZADO' | 'EN_PROCESO_OFFLINE';
  subtotalSinImpuestos: number;
  tarifaIvaPct: 0 | 5 | 8 | 15;
  montoIva: number;
  totalFacturado: number;
  formaPagoSriCodigo: '01' | '16' | '19' | '20';
  ridePdfUrl: string;
  xmlAutorizadoUrl: string;
}

export interface BeneficiarioPagoContexto {
  tipo: 'transportista' | 'proveedor' | 'anfitrion' | 'trabajador' | 'inmobiliaria' | 'sara_holding';
  nombreCompleto: string;
  identificacion: string; // RUC o Cédula
  subtitulo?: string; // Ej: "Camioneta Pickup 1.2T · SARA · PBA-1234" o "Proveedor Mayorista Cemento"
  bancoNombre?: string;
  tipoCuenta?: 'Ahorros' | 'Corriente';
  numeroCuenta?: string;
  telefonoContacto?: string;
  email?: string;
  qrDeunaUrl?: string;
  qrPayphoneUrl?: string;
  qrBancoGuayaquilUrl?: string;
}

export interface SaraUnifiedPaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  modulo: SaraModuloPago;
  referenciaOperacionId: string; // Ej: "FLT-2026-089" o "OC-2026-104" o "RES-STAYS-4820"
  conceptoPrincipal: string; // Ej: "Pago Directo al Transportista"
  beneficiario: BeneficiarioPagoContexto;
  desglose: DesgloseImpuestosSRI;
  compradorDefault?: Partial<DatosFacturacionAdquirente>;
  emitirFacturaAutomatica?: boolean; // true por defecto
  metodosHabilitados?: MetodoPagoUniversal[]; // Si se omite, habilita los estándar del módulo
  permitirDiferido?: boolean;
  onPagoCompletado: (resultado: {
    transaccionId: string;
    metodo: MetodoPagoUniversal;
    metodoNombre: string;
    referenciaComprobante: string;
    montoTotalUSD: number;
    desgloseImpuestos: DesgloseImpuestosSRI;
    facturaElectronica?: FacturaElectronicaEmitidaSRI;
    voucherUrl?: string;
    estado: 'APROBADO' | 'PENDIENTE_CONCILIACION';
  }) => void;
}
```

---

## 5. Arquitectura de Datos y Persistencia Transaccional (Supabase)

Toda transacción emitida a través de la pasarela unificada debe persistir de manera atómica en el motor PostgreSQL de Supabase:

1. **Tabla Maestra `ordenes_pago`:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.ordenes_pago (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     modulo VARCHAR(32) NOT NULL, -- 'FLETES', 'STAYS', 'MARKETPLACE', etc.
     referencia_id VARCHAR(64) NOT NULL, -- Código de flete, OC, reserva
     concepto TEXT NOT NULL,
     monto NUMERIC(12,2) NOT NULL,
     subtotal NUMERIC(12,2) NOT NULL,
     iva NUMERIC(12,2) NOT NULL,
     tarifa_iva_pct NUMERIC(4,2) DEFAULT 15.00,
     retencion_fuente NUMERIC(12,2) DEFAULT 0.00,
     moneda VARCHAR(3) DEFAULT 'USD',
     estado VARCHAR(32) DEFAULT 'pendiente', -- 'pendiente', 'completada', 'en_revision', 'fallida'
     user_id UUID REFERENCES auth.users(id),
     metadata JSONB DEFAULT '{}'::jsonb,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Tabla de Ejecución `transacciones`:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.transacciones (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     orden_id UUID NOT NULL REFERENCES public.ordenes_pago(id) ON DELETE CASCADE,
     metodo_pago VARCHAR(32) NOT NULL, -- 'tarjeta', 'deuna_qr', 'transferencia', 'paypal', 'escrow'
     monto_pagado NUMERIC(12,2) NOT NULL,
     comprobante_url TEXT,
     numero_referencia_bancaria VARCHAR(64),
     hash_comprobante VARCHAR(64), -- SHA-256 para prevenir duplicados
     estado_aprobacion VARCHAR(32) DEFAULT 'pendiente', -- 'aprobada', 'pendiente', 'rechazada'
     auditoria_seguridad JSONB DEFAULT '{"tls": "TLS_1_3", "pci_dss": "SAQ-A"}'::jsonb,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Propagación en el Bus de Agentes (`sara_agent_events`):**
   Al aprobarse o recibirse el pago, la pasarela publica el evento `PAGO_PROCESADO_ECOSISTEMA` con el payload de conciliación contable hacia `SARA-PAGOS` y `SARA-CONSTRUCTORA`.

---

## 6. Procedimiento Operativo para Agentes de Negocio (Flujo Payment-to-Invoice SRI)

Cuando cualquier agente del holding requiera cobrar planes de suscripción, reservas o compras:
1. **Paso 1 (Cálculo Inverso con IVA Incluido):**
   - Si el plan o servicio tiene un precio comercial final $P_{\text{total}}$ (por ejemplo, $\$79.00\text{ USD}$ en Constructora Pro/PyME) con IVA incluido ($15\%$):
     $$\text{Base Imponible} = \text{round}\left(\frac{79.00}{1.15}, 2\right) = \$68.70\text{ USD}$$
     $$\text{IVA (15\%)} = 79.00 - 68.70 = \$10.30\text{ USD}$$
   - Para materiales de construcción calificados bajo Res. NAC-DGERCGC24-00000013 ($5\%$ IVA incluido):
     $$\text{Base Imponible} = \text{round}\left(\frac{P_{\text{total}}}{1.05}, 2\right), \quad \text{IVA (5\%)} = P_{\text{total}} - \text{Base Imponible}$$
2. **Paso 2 (Datos Tributarios del Adquirente):**
   - Permitir que el usuario confirme o edite en una sección compacta dentro de la pasarela sus datos para la factura electrónica (RUC 13 dígitos con validación Módulo 11, Cédula 10 dígitos, Razón Social y Correo electrónico), precargados desde su sesión activa.
3. **Paso 3 (Confirmación de Pago + Emisión Automática SRI):**
   - Al ejecutar `CONFIRMAR Y APLICAR PAGO`, la pasarela procesa el cobro y en el mismo flujo invoca a [`POST /api/facturacion/emitir`](file:///d:/SaS_Proyectos/sara-constructora/src/app/api/facturacion/emitir/route.ts) pasando el desglose exacto (`precioUnitario = Base Imponible`, `ivaTarifa = 15 | 5 | 0`) y el código de Forma de Pago de la Tabla 24 del SRI (`19` Tarjeta de Crédito, `16` Tarjeta de Débito, `20` Otros con utilización del sistema financiero para DeUna QR / Transferencia).
4. **Paso 4 (Entrega Inmediata de RIDE PDF y XML XAdES-BES):**
   - El modal transiciona a una vista de **Comprobante Electrónico Autorizado SRI**, mostrando el número de factura (`001-001-XXXXXXXXX`), la Clave de Acceso de 49 dígitos verificada por Módulo 11, el desglose tributario (Subtotal sin impuestos + IVA + Total Pagado) y dos botones de acción directa: **Descargar RIDE (PDF)** y **Descargar XML Firmado**, antes de cerrar o continuar al módulo activado.

---

## 7. Criterios de Calidad y Cero Regresiones

- **Cero `window.alert()` ni `window.confirm()`:** Utilizar exclusivamente toasts y modales integrados en Tailwind con `role="dialog"` y accesibilidad WCAG 2.1 AA.
- **Protección Zero-Trust:** No enviar números de tarjeta de crédito completos ni códigos CVV a los logs ni almacenarlos en base de datos.
- **Soporte Offline-First:** Si el usuario en obra pierde cobertura de red, el comprobante cargado debe guardarse en caché cifrada de IndexedDB y sincronizarse al recuperar conexión.
