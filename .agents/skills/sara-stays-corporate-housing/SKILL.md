---
name: sara-stays-corporate-housing
description: >-
  Gestión y optimización logística del alojamiento corporativo para cuadrillas de obra, directores de proyecto
  e ingenieros residentes en propiedades de SARA Stays. Asigna códigos PIN de cerraduras electrónicas,
  controla depósitos de garantía e imputa costos directamente a los gastos indirectos del proyecto.
---

# sara-stays-corporate-housing

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-stays-corporate-housing`
- **Unidad de Negocio:** SARA Stays (Alojamiento Corporativo & Campamentos de Obra)
- **Objetivo Estratégico:**
  Asegurar una solución habitacional inmediata, digna y de bajo costo para el personal técnico y obrero desplazado a frentes de obra interprovinciales o remotos. Coordina la asignación de plazas disponibles en la red de suites y casas operativas de `SARA Stays`, automatiza el check-in autónomo mediante cerraduras inteligentes con códigos PIN temporales, audita el inventario físico y traslada contablemente los costos de estancia al centro de costos de gastos indirectos de la obra correspondiente.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Código del Trabajo del Ecuador - Art. 42 (Obligaciones del Empleador):**
   - Obligación patronal de proveer alojamiento higiénico y adecuado a trabajadores que presten servicios en lugares distantes a más de dos kilómetros de su residencia habitual.
2. **Reglamento de Seguridad y Salud de los Trabajadores (Decreto Ejecutivo 2393):**
   - Condiciones sanitarias mínimas en campamentos de obra y viviendas temporales (ventilación, agua potable, separación por géneros, prevención de riesgos biológicos y vectores en zonas tropicales).
3. **Reglamento de Alojamientos Turísticos y No Hoteleros del Ministerio de Turismo del Ecuador:**
   - Registro de huéspedes y emisión de facturación conforme a las directrices del SRI.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Recepción de Necesidad de Alojamiento de Obra
1. Capturar el evento `CONVOCATORIA_TALENTO_EMITIDA` o solicitud de movilización de personal foráneo desde `sara-construction-labor-matching`.
2. Extraer parámetros:
   - Número de ingenieros consultores (requieren suites individuales de alta conectividad).
   - Número de operarios / cuadrillas técnicas (requieren casas compartidas o módulos de campamento).
   - Coordenadas geográficas del frente de obra y duración estimada de la estancia (semanas o meses).

### Paso 2: Búsqueda y Bloqueo de Disponibilidad
1. Consultar el inventario de propiedades en `alojamientos` dentro de un radio $\le 20\,\text{km}$ de la obra.
2. Priorizar inmuebles propios de GRUPO SARA para maximizar el margen interno; si no hay plazas libres, consultar propiedades de anfitriones asociados en el marketplace con tarifa convenio corporativa.
3. Bloquear las fechas en el calendario central (`stays_calendario`) para evitar reservas turísticas simultáneas.

### Paso 3: Generación de Credenciales de Acceso y Kit de Bienvenida
1. Generar automáticamente un código PIN seguro de 6 dígitos en la cerradura electrónica IoT asociada a la propiedad (integración API Tuya / TTLock).
2. Configurar la ventana de validez del PIN: desde las 12:00 del día de llegada hasta las 11:00 del día de fin de asignación.
3. Despachar al teléfono del ingeniero residente y de los trabajadores una tarjeta digital con:
   - Enlace de ubicación en Google Maps / Waze.
   - Código PIN de ingreso.
   - Contraseña de Wi-Fi de alta velocidad para envío de bitácoras de fiscalización.
   - Normas de convivencia y uso de áreas comunes.

### Paso 4: Imputación Contable a Costos Indirectos de Obra
1. Liquidar la tarifa diaria con descuento corporativo del holding (ej. $USD\,18$ - $USD\,35$ / noche según tipología).
2. Generar el comprobante interno de transferencia entre unidades de negocio:
   - Débito: `presupuestos_indirectos` (Partida "Instalaciones Provisionales y Hospedaje Técnico" de la obra).
   - Crédito: `ingresos_stays_corporativo`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Panel de Gestión de Ocupación Estilo Cuadrícula de Operaciones:**
   - Visualización matricial de camas y habitaciones por proyecto civil, con estados codificados en colores armónicos (`Ocupada`, `Limpieza`, `Disponible`).
   - Tipografía `--font-display` para el nombre del alojamiento y `--font-sans` para los datos de los ocupantes.
2. **Tarjeta Móvil de Check-In del Huésped:**
   - Diseño limpio y contrastado, legible bajo sol brillante de obra.
   - El código PIN debe mostrarse con tipografía monoespaciada gigante (`text-3xl tracking-widest font-bold`), con botón táctil de "Copiar PIN" de al menos `44px` de altura.
3. **Ergonomía:**
   - Botón de extensión de estancia con un solo toque y confirmación sin recarga de página.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `alojamientos`: Propiedades, capacidad, tipo de camas, amenidades y cerraduras IoT vinculadas.
  - `reservas_stays`: Contratos de reserva, huéspedes asignados, estado de check-in/out.
  - `presupuestos_indirectos`: Imputación del centro de costo del proyecto.
  - `src/lib/services/staysPoliciesService.ts`: Reglas de depósito y penalidades.
- **Eventos del Bus:**
  - **Consume:** `CONVOCATORIA_TALENTO_EMITIDA`, `EXTENSIÓN_OBRA_SOLICITADA`.
  - **Emite:** `ALOJAMIENTOS_LOGISTICOS_RESERVADOS`, `CHECKIN_CORPORATIVO_REALIZADO`.
- **SharedMemory Key:** `stays:corporate:<reservaId>:status`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Asignación de Hospedaje Corporativo
```json
{
  "reservaCorporativaId": "stay-corp-2026-118",
  "proyectoObraId": "sara-proj-2026-042",
  "alojamientoId": "stay-villa-austro-cuenca",
  "periodo": {
    "fechaCheckIn": "2026-10-20T12:00:00Z",
    "fechaCheckOut": "2026-11-20T11:00:00Z",
    "nochesTotales": 31
  },
  "personalHospedado": [
    { "nombre": "Ing. Carlos Andrade", "rol": "Superintendente", "habitacion": "Suite Master 101" },
    { "nombre": "Top. Luis Guano", "rol": "Topógrafo", "habitacion": "Habitación Doble 102A" },
    { "nombre": "Mtro. Pedro Gualli", "rol": "Maestro Mayor", "habitacion": "Habitación Doble 102B" }
  ],
  "controlAccesoIoT": {
    "cerraduraId": "ttlock-door-austro-01",
    "codigoPinTemporal": "829104",
    "vigencia": "ACTIVO"
  },
  "costeoIndirectoUSD": {
    "tarifaNocheCorporativa": 32.0,
    "montoTotalFacturado": 992.0,
    "centroCostoImputado": "INDIRECTOS_OBRA_042"
  }
}
```

### 6.2 Orden Interna de Hospedaje y Protocolo de Salida (PDF)
- Hoja de servicio firmada por el Director de SARA Stays.
- Inventario fotográfico inicial de la propiedad para verificación de buen uso.
- Constancia de imputación presupuestaria al proyecto de construcción.
