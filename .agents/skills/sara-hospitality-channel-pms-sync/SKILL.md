---
name: sara-hospitality-channel-pms-sync
description: >-
  Sincronización bidireccional de inventario de alojamiento corporativo y turístico (OTA Channel Manager & PMS).
  Previene sobreventa (overbooking) con bloqueos transaccionales, genera códigos PIN de cerraduras IoT y calcula USALI.
---

# sara-hospitality-channel-pms-sync

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-hospitality-channel-pms-sync`
- **Unidad de Negocio:** SARA Alojamiento (Campamentos de Obra, Corporate Housing y Renta Temporal)
- **Repositorio / Estándar GitHub de Referencia:**
  - `revpy` (Algoritmos de optimización de ingresos hoteleros, elasticidad de demanda y gestión de disponibilidad).
  - OpenTravel Alliance (OTA XML/JSON Specifications para distribución de tarifas y disponibilidad en tiempo real).
  - Estándar USALI 11ª/12ª Edición (Uniform System of Accounts for the Lodging Industry).
  - Protocolos de cerraduras inteligentes IoT (TTLock Open API / Tuya Smart Life Zigbee/WiFi).
- **Objetivo Estratégico:**
  Gestionar la doble operación de las propiedades habitacionales de GRUPO SARA: reserva garantizada y sin fricción de campamentos técnicos para ingenieros y cuadrillas de obra foráneas, y comercialización dinámica de la capacidad ociosa remanente en canales turísticos y corporativos (Airbnb, Booking.com, VRBO, venta directa). Sincroniza calendarios y tarifas en tiempo real mediante un Channel Manager con bloqueos transaccionales `FOR UPDATE` que eliminan el *overbooking*, automatiza la emisión de accesos con PIN temporales para cerraduras electrónicas y contabiliza ingresos/costos bajo la norma USALI.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Estándar Financiero Hotelero USALI:**
   - Clasificación estandarizada de ingresos por departamentos operativos (Habitaciones, Alimentos y Bebidas, Otros Operativos).
   - Cálculo estandarizado de métricas clave: Tarifa Promedio Diaria ($ADR$), Ingreso por Habitación Disponible ($RevPAR$), Beneficio Operativo Bruto por Habitación ($GOPPAR$).
2. **Normativa de Alojamiento Turístico y Campamentos del Ecuador:**
   - Reglamento General a la Ley de Turismo del Ecuador (Registro Turístico y Licencia Única Anual de Funcionamiento - LUAF).
   - Aplicación de tarifa de IVA al 15% ordinario y tarifa reducida al 8% durante los feriados nacionales decretados por la Presidencia.
   - Requisitos higiénico-sanitarios y de habitabilidad de campamentos de obra (Decreto Ejecutivo 2393 - Art. 45).
3. **Seguridad de Datos y Privacidad (PCI-DSS e ISO/IEC 27001):**
   - Encriptación de datos de tarjetas y pasaportes de huéspedes.
   - Expiración automática de credenciales y PINs de acceso tras el check-out.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Gestión de Prioridad y Bloqueo Transaccional de Disponibilidad
1. Cuando `SARA-TALENTOHUMANO` solicita cupos para personal técnico de obra (`requiereAlojamientoTecnico = true`):
   - Ejecutar una transacción en base de datos con bloqueo de fila (`SELECT ... FOR UPDATE`) en `sara_housing_units`.
   - Asignar la unidad habitacional con prioridad operativa absoluta: las necesidades de obra civil prevalecen sobre el inventario turístico.
   - Bloquear inmediatamente las fechas en los calendarios iCal y APIs de canales externos (Airbnb/Booking) para impedir la sobreventa:
     $$\text{Overbooking Risk} = 0.00\%$$
2. Imputar el costo operativo de la estadía a la partida de costos indirectos del proyecto civil correspondiente:
   $$\text{Costo Transferencia Interna} = N_{\text{noches}} \times C_{\text{mantenimiento diario}}$$

### Paso 2: Tarificación Dinámica y Revenue Management para Plazas Comerciales
1. Para las unidades no reservadas por cuadrillas de obra:
   - Calcular la tasa de ocupación proyectada a 30 días ($\text{Ocupación}_{30d}$).
   - Ajustar el precio diario mediante el multiplicador dinámico:
     $$P_{\text{noche}}(t) = P_{\text{rack}} \times (1 + \alpha \cdot \text{Ocupación}_{30d} + \beta \cdot \mathbb{I}_{\text{feriado}} - \gamma \cdot \text{Descuento Last-Minute})$$
     - Durante feriados nacionales oficiales de Ecuador: Aplicar $\tau_{\text{IVA}} = 0.08$ y ajustar tarifa rack.
     - En días ordinarios: Aplicar $\tau_{\text{IVA}} = 0.15$.
2. Despachar las actualizaciones de tarifas y restricciones de estancia mínima (*Minimum Length of Stay - MLOS*) hacia los canales conectados.

### Paso 3: Aprovisionamiento Autónomo de Accesos IoT (Smart Locks)
1. 24 horas antes del check-in confirmado (huésped turístico o ingeniero de obra):
   - Comunicar con el gateway IoT de la cerradura inteligente de la unidad.
   - Generar un PIN de acceso numérico temporal aleatorio de 6 dígitos ($PIN_{\text{secure}}$).
   - Configurar la validez temporal del PIN: activo desde las 14:00 del día de llegada hasta las 11:00 del día de salida.
   - Despachar el PIN y las instrucciones de llegada vía WhatsApp/SMS/Email cifrado.
2. Al momento del check-out, invalidar el PIN remotamente y registrar el evento en el log de auditoría.

### Paso 4: Consolidación Contable y Métricas USALI
1. Cerrar la jornada hotelera diaria y calcular los KPIs de desempeño:
   $$ADR = \frac{\sum \text{Ingresos por Alojamiento Vendido}}{\sum \text{Unidades Ocupadas}}$$
   $$RevPAR = ADR \times \left( \frac{\sum \text{Unidades Ocupadas}}{\sum \text{Total Unidades en Portafolio}} \right)$$
   $$GOPPAR = \frac{\text{GOP Total de la División Alojamiento}}{\sum \text{Total Unidades en Portafolio}}$$
2. Emitir el reporte de rentabilidad comparando la contribución marginal de los campamentos de obra vs la renta turística abierta.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Cero Overbooking:** Tasa del $0\%$ de duplicidad en reservas gracias a locks atómicos transaccionales.
2. **Latencia de Sincronización:** Actualización de inventario en canales OTA en $< 5.000\,\text{ms}$ tras un cambio de estado.
3. **Confiabilidad IoT:** Éxito en generación y transmisión de PINs de acceso $\ge 99.8\%$.
