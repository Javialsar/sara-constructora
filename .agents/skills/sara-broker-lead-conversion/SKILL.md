---
name: sara-broker-lead-conversion
description: >-
  Automatización del embudo comercial de corretaje inmobiliario, calificación crediticia de prospectos (BIESS/Banca),
  distribución inteligente de leads a la red de brokers certificados de GRUPO SARA y bloqueo transaccional de reservas.
---

# sara-broker-lead-conversion

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-broker-lead-conversion`
- **Unidad de Negocio:** SARA Inmobiliaria (Red de Brokers & Comercialización)
- **Objetivo Estratégico:**
  Convertir prospectos generados a través del portal público inmobiliario de GRUPO SARA en compradores calificados en tiempo récord ($< 5\,\text{minutos}$). Califica el perfil crediticio y capacidad de pago de entrada del lead, asigna el prospecto al broker inmobiliario certificado con mayor especialización y tasa de cierre en la zona geográfica, y gestiona el flujo transaccional de reserva y promesa de compraventa con bloqueo atómico del inmueble para evitar ventas duplicadas.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Notarial y Código Civil del Ecuador:**
   - Formalidades legales de las Promesas de Compraventa de Inmuebles.
   - Régimen de arras confirmatorias y cláusulas penales por desistimiento injustificado.
2. **Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador:**
   - Consentimiento expreso e informado para el tratamiento de información patrimonial y crediticia.
   - Almacenamiento seguro y cifrado de comprobantes de ingresos y roles de pago.
3. **Regulaciones del Buró de Crédito y UAFE (Unidad de Análisis Financiero y Económico):**
   - Formulario de Conozca a su Cliente (KYC) y declaración de licitud de fondos en transacciones inmobiliarias que superen los umbrales legales ($USD\,10.000$).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Ingestión, Desduplicación y Scoring de Prospectos
1. Recibir el lead emitido por el portal web o formulario de contacto (`/inmobiliaria` o campañas publicitarias).
2. Verificar duplicidad en la base de datos contra número de cédula o correo electrónico.
3. Evaluar el **Score de Calificación Crediticia (0 a 100)**:
   - Capacidad de Pago de Entrada: Disponibilidad inmediata de al menos el 10% al 20% del valor total.
   - Mecanismo de Financiamiento: BIESS (afiliado activo con fondos de cesantía), Banca Privada precalificada, o Compra de Contado.
   - Relación Ingreso / Cuota: La cuota proyectada no debe superar el 35% de los ingresos netos familiares demostrables.

### Paso 2: Asignación Algorítmica al Broker Certificado
1. Filtrar brokers activos en la provincia y cantón donde se ubica el proyecto inmobiliario.
2. Calcular el score del broker basado en:
   - Tasa histórica de conversión en los últimos 90 días.
   - Tiempo promedio de primer contacto telefónico o por WhatsApp.
   - Carga actual de prospectos en seguimiento activo.
3. Asignar el lead y despachar una notificación enriquecida inmediata vía webhook y WhatsApp Business con el perfil del comprador y la ficha técnica PDF del departamento/casa de interés.

### Paso 3: Generación de Proforma y Plan de Pagos
1. Generar la proforma comercial formal con membrete institucional de GRUPO SARA:
   - Valor de Reserva (ej. $USD\,500$ a $USD\,2.000$).
   - Porcentaje de Entrada pactado (ej. 20% o 30%) fraccionado en cuotas mensuales durante la fase de construcción.
   - Saldo final (70% u 80%) contra entrega y liquidación del crédito hipotecario.
2. Adjuntar la tabla de amortización simulada con tasas de interés vigentes del sistema bancario ecuatoriano.

### Paso 4: Transacción de Reserva y Bloqueo Atómico
1. Al recibir la confirmación de pago del valor de reserva a través de la pasarela de pagos integrada (`SARA Pagos / Kushki`), actualizar de forma atómica en Supabase:
   - Cambiar estado del inmueble de `DISPONIBLE` a `RESERVADO`.
   - Establecer un plazo de exclusividad de 15 días laborables para la formalización del contrato de promesa de compraventa.
   - Si vence el plazo sin firma ni prórroga autorizada, revertir el estado a `DISPONIBLE`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Pipeline de Ventas Estilo Kanban Prémium:**
   - Columnas visuales claras: *Nuevo Prospecto*, *Contactado*, *En Demostración*, *Precalificado Crédito*, *Reserva Pagada*, *Promesa Firmada*.
   - Tarjetas de prospecto con diseño editorial, bordes tenues `border-slate-200/80 dark:border-slate-800`, sin iconos estridentes.
2. **Acciones Rápidas Táctiles en Móvil:**
   - Botón directo para iniciar chat de WhatsApp con plantilla oficial de bienvenida en un solo tap (`min-h-[44px]`).
   - Botón de llamada telefónica directa con registro del evento de interacción en el historial del lead.
3. **Proforma Financiera Interactiva:**
   - Calculadora de cuotas deslizante que actualiza en tiempo real el monto mensual a pagar al mover el slider de meses de entrada.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `solicitudes_inmobiliaria`: Registro de leads y formularios de contacto.
  - `inmuebles`: Catálogo de inventario y estado transaccional.
  - `planes_inmobiliaria`: Membresías de brokers independientes.
  - `src/lib/services/solicitudesInmobiliariaService.ts`: Lógica de persistencia.
- **Eventos del Bus:**
  - **Consume:** `LEAD_INMOBILIARIO_CAPTADO`, `PAGO_RESERVA_CONFIRMADO`.
  - **Emite:** `LEAD_ASIGNADO_BROKER`, `INMUEBLE_BLOQUEADO_POR_RESERVA`.
- **SharedMemory Key:** `realestate:leads:<leadId>:broker_dispatch`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Asignación y Proforma de Reserva
```json
{
  "leadId": "lead-inmob-9921",
  "inmuebleId": "inm-san-patricio-d402",
  "scoreProspecto": 88.0,
  "perfilFinanciero": {
    "tipoFinanciamiento": "BIESS_HIPOTECARIO",
    "capacidadEntradaUSD": 18000.0,
    "ingresoFamiliarUSD": 3200.0,
    "cuotaSugeridaMaximaUSD": 1120.0
  },
  "brokerAsignado": {
    "brokerId": "brk-014",
    "nombre": "Arq. Mateo Villacís",
    "telefono": "+593998765432",
    "tasaConversionHistorica": 0.34
  },
  "propuestaPago": {
    "precioTotalInmueble": 89500.0,
    "montoReserva": 1000.0,
    "cuotaEntradaTotal": 17900.0,
    "mesesPlazoEntrada": 18,
    "cuotaMensualEntrada": 938.89,
    "saldoContraEntregaCredito": 71600.0
  },
  "estadoReserva": "BLOQUEO_TEMPORAL_ACTIVO",
  "validezReservaHasta": "2026-10-31T23:59:59Z"
}
```

### 6.2 Proforma Oficial de Venta Inmobiliaria (PDF)
- Ficha comercial del departamento con plano arquitectónico acotado y renders.
- Desglose financiero con tabla de cuotas y datos bancarios oficiales del fideicomiso inmobiliario de GRUPO SARA.
- Instrucciones formales para la visita técnica guiada a la sala de ventas o departamento modelo.
