---
name: sara-heavy-freight-routing
description: >-
  Planificación, cubicación y ruteo logístico de transporte de carga pesada (volquetas 14m³, plataformas 30T, mulas, camas bajas)
  evaluando pesos por eje MTOP, peajes interprovinciales del Ecuador y costos de ciclo de acarreo.
---

# sara-heavy-freight-routing

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-heavy-freight-routing`
- **Unidad de Negocio:** SARA Fletes Pesados & Logística Interprovincial
- **Objetivo Estratégico:**
  Planificar y despachar las operaciones de transporte pesado de insumos de construcción (áridos pétreos, clínker, cemento en saco, varillas de acero corrugado de 12 metros, estructuras metálicas y maquinaria pesada). Determina el tipo y número óptimo de vehículos requeridos, traza la ruta vial más eficiente considerando peajes, pendientes de montaña y restricciones de carga del MTOP en Ecuador, y calcula el costo logístico por viaje y tonelada-kilómetro ($USD/ton \cdot km$).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Reglamento de Pesos y Dimensiones del Ministerio de Transporte y Obras Públicas (MTOP):**
   - Tabla de pesos brutos vehiculares máximos permitidos (PBV) por configuración de ejes:
     - Volqueta 2 ejes (4x2): PBV máximo $16\,\text{toneladas}$.
     - Volqueta 3 ejes (6x4 o Doble Troque): PBV máximo $27\,\text{toneladas}$ (capacidad neta aprox. $14\,\text{m}^3$ de ripio/arena).
     - Tractocamión 3S2 o 3S3 (Mula plataforma): PBV máximo $44 \text{ a } 48\,\text{toneladas}$ (carga útil $28 \text{ a } 32\,\text{toneladas}$).
     - Longitud máxima para transporte de varillas y vigas sin escolta: $18.50\,\text{metros}$.
2. **Ley Orgánica de Transporte Terrestre, Tránsito y Seguridad Vial (LOTTTSV):**
   - Salvoconductos obligatorios del MTOP para cargas especiales indivisibles y maquinaria pesada en camas bajas.
3. **Red Vial Estatal y Tarifario de Peajes del Ecuador:**
   - Peajes en corredores Panamericana Norte/Sur, Vía a la Costa, Alóag-Santo Domingo.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Cubicación y Dimensionamiento de Flota
1. Recibir del evento `APU_CONSOLIDADO` o requerimiento de obra el volumen ($m^3$) o tonelaje ($ton$) del material a movilizar:
   - Áridos (arena, grava, lastre): Densidad promedio $\rho \approx 1.55 \text{ a } 1.70\,\text{ton/m}^3$.
   - Cemento: Sacos de $50\,\text{kg}$ (paletizados a 30 o 40 sacos por pallet).
   - Varilla corrugada: Atados de $12\,\text{metros}$ de longitud.
2. Calcular el número entero de viajes ($N_v$):
   $$N_v = \left\lceil \frac{\text{Carga Total Requerida}}{\text{Capacidad Útil por Vehículo}} \right\rceil$$
3. Asignar la tipología idónea: Volqueta 3 ejes para áridos; Plataforma de 3 ejes para acero; Camión furgón para acabados.

### Paso 2: Ruteo Espacial y Estimación de Tiempos de Ciclo
1. Obtener coordenadas de origen (cantera/planta) y destino (frente de obra).
2. Trazar la ruta en la red vial del Ecuador (mediante integración Leaflet / OSRM / Google Maps API):
   - Computar distancia total de ida ($D_{\text{ida}}$ en km).
   - Identificar puestos de peaje en la ruta y tarifas por categoría de eje.
3. Calcular el Tiempo de Ciclo de Transporte ($T_{\text{ciclo}}$):
   $$T_{\text{ciclo}} = T_{\text{carga}} + \frac{D_{\text{ida}}}{V_{\text{cargado}}} + T_{\text{descarga}} + \frac{D_{\text{retorno}}}{V_{\text{vacio}}} + T_{\text{espera}}$$
   *(Donde $V_{\text{cargado}} \approx 45\,\text{km/h}$ en sierra / $65\,\text{km/h}$ en costa; $T_{\text{carga}} \approx 15-20\,\text{min}$)*.

### Paso 3: Liquidación del Costo de Transporte
1. Aplicar la estructura analítica de flete:
   $$\text{Costo Flete Viaje } (USD) = (D_{\text{total}} \times C_{\text{combust/km}}) + \text{Peajes} + C_{\text{chofer}} + \text{Depreciación Vehicular} + \text{Margen}$$
2. O aplicar la tarifa referencial del MTOP por distancia:
   $$\text{Tarifa Ton-Km} = \text{Carga}_{\text{ton}} \times D_{\text{km}} \times \text{Factor}_{\text{rango dist}}$$
3. Notificar a la red de choferes certificados de `SARA Fletes` con la orden de despacho geolocalizada.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Mapa Logístico Interactivo de Alto Impacto:**
   - Mapa a pantalla completa o tarjeta panorámica con Leaflet, estilizado en tonos oscuros o gris neutro moderno (CartoDB Positron / Voyager).
   - Traza de la ruta en línea continua verde esmeralda con glow sutil, marcadores de origen (cantera) y destino (obra) con iconos vectoriales limpios.
2. **Panel de Telemetría y Estado de Flota:**
   - Despliegue de los camiones en tránsito con avatar de vehículo, chofer asignado, ETA en minutos y botón táctil de llamada.
3. **Ergonomía Móvil para Transportistas:**
   - Hoja de ruta para el chofer con tipografía grande y legible, botón táctil de "Confirmar Llegada / Descarga" de al menos `52px` de altura para uso fácil con guantes de trabajo.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `fletes_solicitudes`: Órdenes de movilización, origen, destino, tipo de carga, estado.
  - `fletes_vehiculos`: Registro de camiones, configuración de ejes, PBV, SOAT, revisión técnica vehicular.
  - `fletes_conductores`: Choferes profesionales con licencia tipo E, calificaciones de puntualidad.
  - `src/components/sara/DriverFreightMap.tsx`: Componente de mapa en vivo.
- **Eventos del Bus:**
  - **Consume:** `SUMINISTROS_ASIGNADOS`, `DESPACHO_SOLICITADO`.
  - **Emite:** `LOGISTICA_PROCESADA`, `VIAJE_INICIADO`, `CARGA_ENTREGADA_EN_OBRA`.
- **SharedMemory Key:** `freight:orders:<ordenId>:tracking`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Despacho Logístico
```json
{
  "ordenFleteId": "flt-desp-2026-881",
  "proyectoDestinoId": "sara-proj-2026-042",
  "origen": { "nombre": "Cantera Pifo", "lat": -0.2241, "lng": -78.3392 },
  "destino": { "nombre": "Obra Torre Alborada", "lat": -0.1782, "lng": -78.4721 },
  "material": "Ripio triturado 3/4",
  "volumenTotalM3": 280.0,
  "tonelajeTotal": 448.0,
  "estrategiaTransporte": {
    "tipoVehiculo": "VOLQUETA_3_EJES_14M3",
    "capacidadPorViajeM3": 14.0,
    "viajesTotalesRequeridos": 20,
    "distanciaUnidireccionalKm": 34.5,
    "tiempoCicloEstimadoMinutos": 105,
    "costoPorViajeUSD": 65.0,
    "costoTotalLogisticaUSD": 1300.0
  },
  "cumplimientoNormativa": {
    "pesoBrutoVehicularPermitidoTon": 27.0,
    "pesoBrutoProyectadoTon": 25.8,
    "estadoCumplimientoMTOP": "APROBADO_SIN_SOBREPESO"
  }
}
```

### 6.2 Guía de Remisión Oficial y Salvoconducto (PDF)
- Formato oficial del SRI con número de autorización electrónica de 49 dígitos.
- Detalle de la mercancía, placa del vehículo, cédula del conductor y sello de tiempo de salida de báscula.
