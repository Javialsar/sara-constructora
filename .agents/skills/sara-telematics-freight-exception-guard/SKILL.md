---
name: sara-telematics-freight-exception-guard
description: >-
  Monitoreo telemático GPS en tiempo real de flotas pesadas, control de geocercas y gestión de excepciones logísticas.
  Detecta desviaciones de ruta MTOP, paradas no autorizadas, excesos de peso en báscula y recalcula el ETA dinámico.
---

# sara-telematics-freight-exception-guard

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-telematics-freight-exception-guard`
- **Unidad de Negocio:** SARA Fletes (Logística de Carga Pesada, Ruteo MTOP y Flota Conectada)
- **Repositorio / Estándar GitHub de Referencia:**
  - `affaan-m/ECC` (`logistics-exception-management`, `carrier-relationship-management`).
  - Protocolos Telemáticos SAE J1939 y streaming de coordenadas GPS NMEA-0183.
  - Tabla Nacional de Pesos y Dimensiones del Ministerio de Transporte y Obras Públicas (MTOP - Acuerdo Ministerial 018-2022).
- **Objetivo Estratégico:**
  Monitorear activamente las unidades de transporte pesado (volquetas de 14m³, plataformas 3S2/3S3 y camas bajas) asignadas a misiones logísticas de GRUPO SARA. Rastrea el cumplimiento de geocercas en canteras, botaderos y frentes de obra, detecta desvíos de ruta respecto al trazado óptimo vial MTOP, alerta sobre detenciones prolongadas no autorizadas, verifica la integridad de precintos electrónicos de carga y recalcula el tiempo estimado de llegada ($ETA$) ante contingencias climáticas o viales.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Reglamento de Pesos y Dimensiones MTOP del Ecuador:**
   - Control estricto de Peso Bruto Vehicular (PBV) máximo para evitar retenciones en estaciones de pesaje oficiales (ej. Alóag, Tambillo, Yaguachi).
   - Sanciones por exceso de carga por eje y horarios restringidos de circulación de carga pesada en zonas urbanas.
2. **Ley Orgánica de Transporte Terrestre, Tránsito y Seguridad Vial (LORTTSV):**
   - Límites máximos de velocidad para transporte de carga pesada (70 km/h en carreteras abiertas, 40 km/h en pasos laterales y 30 km/h en zonas urbanas).
   - Tiempos de descanso obligatorio para choferes en viajes interprovinciales de larga distancia.
3. **Estándar de Seguridad en Cadena de Suministro BASC (Business Alliance for Secure Commerce):**
   - Protocolos anti-desvío, monitoreo de paradas de alto riesgo y custodia satelital de mercancías de alto valor (acero, combustible, cables de cobre).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Establecimiento de Geocercas y Corredor Vial Autorizado
1. Para cada viaje de flete despachado:
   - Definir la geocerca de origen ($G_{\text{origen}}$: cantera o bodega de proveedor), la geocerca de destino ($G_{\text{destino}}$: obra civil o botadero de escombros) y el polígono del corredor vial permitido con un margen de tolerancia perimetral $\delta_{\text{buffer}} = 150\,\text{metros}$.
2. Ingestar el flujo telemático de la unidad (latitud, longitud, velocidad $V(t)$, odómetro, rumbo y estado de ignición).
3. Confirmar automáticamente el hito de carga al salir de $G_{\text{origen}}$ y el hito de descarga al ingresar en $G_{\text{destino}}$.

### Paso 2: Detección y Clasificación de Excepciones en Tránsito
1. **Desviación de Corredor Vial:**
   - Si la distancia euclidiana/geodésica de la unidad al corredor autorizado supera $\delta_{\text{buffer}}$ por más de 3 minutos consecutivos:
     $$\Delta_{\text{ruta}} > \delta_{\text{buffer}} \implies \text{ALERTA NIVEL 2: Desvío de Ruta No Planificado}$$
2. **Parada No Autorizada en Zona Crítica:**
   - Si $V(t) = 0$ fuera de estaciones de peaje, gasolineras autorizadas o geocercas operativas por $t > 15\,\text{minutos}$:
     $$\text{ALERTA NIVEL 3: Parada No Autorizada en Tránsito}$$
3. **Exceso de Velocidad en Descenso de Montaña:**
   - Si en tramos con pendiente $\ge 5\%$ (ej. descenso de la cordillera andina) la velocidad supera los $60\,\text{km/h}$:
     $$\text{ALERTA CRÍTICA: Riesgo Inminente de Falla de Frenos por Sobrecalentamiento}$$
4. **Alerta de Báscula MTOP:**
   - Cruzar los datos del ticket de pesaje digital con el límite legal del vehículo:
     $$\Delta W = PBV_{\text{real}} - PBV_{\max}^{\text{MTOP}}$$
     - Si $\Delta W > 0$: Bloquear la salida de cantera para redistribución de material antes de multas oficiales.

### Paso 3: Recálculo Dinámico de ETA y Ventana de Entrega en Obra
1. Monitorear la velocidad media efectiva en tiempo real ($\bar{V}_{\text{real}}$) y eventos de congestión reportados por la Red Vial Estatal.
2. Calcular el $ETA$ actualizado:
   $$ETA(t) = t + \frac{D_{\text{remanente}}}{\bar{V}_{\text{real}}} + \sum \text{Tiempos Espera en Peajes}$$
3. Si el nuevo $ETA$ colisiona con el horario de recepción o fundición de hormigón en obra:
   - Notificar a `SARA-CONSTRUCTORA` para reprogramar la cuadrilla de vaciado o reasignar camiones de relevo.

### Paso 4: Cierre del Viaje y Registro en Bitácora de Desempeño
1. Al completarse la descarga y salir de $G_{\text{destino}}$:
   - Calcular el Índice de Cumplimiento Logístico del Viaje ($ICL$):
     $$ICL = 100 - (10 \times N_{\text{desvíos}} + 15 \times N_{\text{paradas}} + 20 \times N_{\text{excesos\_vel}})$$
   - Actualizar el historial del transportista y autorizar la liberación del flete en `SARA-PAGOS`.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Tiempo de Detección de Excepciones:** Generación de alerta en $< 60\,\text{segundos}$ tras configurarse la anomalía.
2. **Cero Retenciones en Básculas:** Tasa del $0\%$ de multas por sobrepeso en controles del MTOP.
3. **Precisión de ETA:** Margen de error en tiempo estimado de arribo $\le 10\,\text{minutos}$ en trayectos de hasta 150 km.
