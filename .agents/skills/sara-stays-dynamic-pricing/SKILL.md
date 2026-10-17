---
name: sara-stays-dynamic-pricing
description: >-
  Algoritmo de tarificación dinámica y revenue management para alojamientos boutique de renta corta turística.
  Ajusta tarifas (ADR) según feriados del Ecuador, estacionalidad, ocupación de mercado y descuentos de última hora para maximizar RevPAR.
---

# sara-stays-dynamic-pricing

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-stays-dynamic-pricing`
- **Unidad de Negocio:** SARA Stays (Hospitalidad Boutique & Renta Turística)
- **Objetivo Estratégico:**
  Maximizar los ingresos por habitación disponible (RevPAR) y el margen neto de ocupación de las propiedades turísticas operadas por `SARA Stays`. Ajusta de forma continua y automatizada la tarifa diaria promedio ($ADR$) en función de la estacionalidad, el calendario oficial de feriados nacionales del Ecuador, la antelación de reserva (*booking window*), la oferta de la competencia y la demanda histórica, aplicando reglas de estancia mínima y promociones de última hora para evitar noches vacías.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley de Turismo del Ecuador y Decretos Ejecutivos de Feriados Nacionales:**
   - Calendario oficial obligatorio de puentes vacacionales (Carnaval, Semana Santa, 1 de Mayo, 24 de Mayo, 10 de Agosto, 9 de Octubre, 2 y 3 de Noviembre, Navidad y Año Nuevo).
   - Reducción temporal de la tarifa del IVA del 15% al 8% durante feriados turísticos decretados por el Gobierno Nacional.
2. **Estándares de Revenue Management Hotelero (Uniform System of Accounts for the Lodging Industry - USALI):**
   - Fórmulas de cálculo de Occupancy Rate ($OCC$), Average Daily Rate ($ADR$) y Revenue Per Available Room ($RevPAR$).
3. **Regulaciones del Servicio de Rentas Internas (SRI):**
   - Retención y facturación electrónica a huéspedes nacionales y extranjeros.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Mapeo de Fechas y Detección de Temporadas
1. Clasificar cada fecha del año en una de cuatro (4) categorías de demanda:
   - **Ultra Alta:** Feriados nacionales largos (Carnaval, Fin de Año, Fiestas de Cuenca/Quito).
   - **Alta:** Fines de semana estándar (Viernes y Sábado) en destinos de descanso o temporada de vacaciones escolares (Sierra: Julio-Agosto; Costa: Febrero-Marzo).
   - **Media:** Días laborables en alojamientos urbanos ejecutivos (Lunes a Jueves).
   - **Baja:** Días entre semana en destinos exclusivamente vacacionales.

### Paso 2: Cálculo Algorítmico de la Tarifa Diaria ($ADR$)
1. Obtener la Tarifa Base ($T_{\text{base}}$) de la propiedad en `alojamientos`.
2. Computar el Multiplicador de Demanda ($M_d$):
   $$M_d = F_{\text{feriado}} \times F_{\text{ocupacion}} \times F_{\text{antelacion}}$$
   Donde:
   - $F_{\text{feriado}} \in [1.25, 1.60]$ durante puentes turísticos oficiales.
   - $F_{\text{ocupacion}}$: Si la ocupación del holding en la plaza supera el $80\%$, aplicar $1.15$; si está por debajo del $40\%$, aplicar $0.90$.
   - $F_{\text{antelacion}}$: Reservas con más de 60 días de anticipación mantienen tarifa plena o incentivo por compra temprana ($0.95$).
3. Tarifa Optimizada:
   $$\text{Tarifa Diaria Final } (USD) = \text{round}(T_{\text{base}} \times M_d, 2)$$

### Paso 3: Restricciones de Estancia Mínima (Minimum Length of Stay - MLOS)
1. Durante feriados nacionales de 3 o 4 días, fijar obligatoriamente una estancia mínima de 2 a 3 noches (`min_nights = 2` o `3`), bloqueando reservas de una sola noche que generen noches huérfanas imposibles de colocar.

### Paso 4: Activación de Ofertas de Última Hora (*Last-Minute Flash Deals*)
1. Si faltan menos de 48 horas para una fecha y la propiedad permanece desocupada:
   - Aplicar un descuento automático (*Flash Deal*) del 15% al 25% sobre la tarifa base, asegurando que cubra el costo marginal de limpieza y servicios.
   - Disparar el evento de actualización de precios para sincronizar con Airbnb, Booking y el portal público de `SARA Stays`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Calendario de Tarifas con Visualización de Calor (Heatmap Calendar):**
   - Selector interactivo mensual donde cada día muestra su precio con un matiz de color tenue indicando el nivel de demanda (Verde suave para ofertas, ocre para temporada media, púrpura/índigo para feriados de alto ticket).
   - Tipografía `--font-display` para el precio diario en negrita y `--font-sans` para la fecha y estado de ocupación.
2. **Tarjeta de Reserva Móvil Flotante:**
   - Barra de resumen de precio y botón de "Reservar Ahora" anclada en la parte inferior (`fixed bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md`), con altura de botón `min-h-[48px]`.
   - Desglose transparente del valor por noche, tarifa de limpieza y desglose del IVA diferenciado (15% u 8% en feriados).
3. **Micro-Interacciones:**
   - Animación fluida de actualización de tarifas al alternar entre fechas.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `alojamientos_tarifas`: Matriz de precios por día, factores de temporada y restricciones de noches.
  - `feriados_ecuador`: Calendario oficial de días de descanso nacional y decretos de IVA turístico.
  - `reservas_stays`: Registro de transacciones y cálculo del RevPAR real alcanzado.
- **Eventos del Bus:**
  - **Consume:** `CALENDARIO_FERIADOS_ACTUALIZADO`, `OCUPACION_PLAZA_CAMBIADA`.
  - **Emite:** `TARIFAS_STAYS_ACTUALIZADAS`, `OFERTA_LAST_MINUTE_PUBLICADA`.
- **SharedMemory Key:** `stays:pricing:<alojamientoId>:rate_matrix`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Tarifación Dinámica
```json
{
  "alojamientoId": "stay-penthouse-cumbaya",
  "tarifaBaseReferencialUSD": 85.0,
  "fechaAnalizada": "2026-11-02",
  "tipoFecha": "FERIADO_NACIONAL_DIFUNTOS",
  "factoresAplicados": {
    "factorFeriado": 1.45,
    "factorOcupacionHolding": 1.10,
    "factorAntelacion": 1.00,
    "multiplicadorConsolidado": 1.595
  },
  "tarifaSugeridaNocheUSD": 135.58,
  "ivaAplicablePorcentaje": 8.0,
  "restricciones": {
    "estanciaMinimaNoches": 3,
    "checkInPermitido": true,
    "checkOutPermitido": true
  },
  "revParProyectadoUSD": 122.02,
  "timestampCalculo": "2026-10-16T15:25:20Z"
}
```

### 6.2 Reporte de Revenue Management Mensual (PDF)
- Gráfico de barras de Ocupación vs ADR vs RevPAR acumulado del mes.
- Comparativa frente a hoteles y alojamientos competidores de la zona.
- Proyección de caja por rentas cortas transferible al holding GRUPO SARA.
