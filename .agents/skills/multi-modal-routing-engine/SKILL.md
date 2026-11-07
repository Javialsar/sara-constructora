---
name: multi-modal-routing-engine
description: Especialista en geo-localización concurrente (Google Maps Distance Matrix, Mapbox Navigation SDK, OpenStreetMap OSRM) para calcular rutas óptimas y eficientes según el tipo de transporte en SARA-FLETES.
---

# multi-modal-routing-engine: Motor de Enrutamiento Multimodal SARA

Este skill permite a los agentes de SARA-FLETES calcular rutas óptimas, distancias efectivas y tiempos estimados de viaje para las 4 verticales de transporte en las 24 provincias del Ecuador:
1. **Viajes Cortos (Pasajeros):** Prioriza arterias rápidas, calzadas pavimentadas y zonas de ascenso seguro en autos y minivans; permite maniobras ágiles y callejones seguros para motocicletas urbanas.
2. **Mandaditos (Delivery Express):** Enrutamiento hiperlocal en cuadrículas urbanas para motocicletas y bicicletas con cálculo de atajos peatonales/vehiculares permitidos, reduciendo tiempos muertos de entrega en horas pico.
3. **Fletes y Logística Pesada:** Enrutamiento bajo normativa MTOP (Tabla Nacional de Pesos y Dimensiones), considerando sinuosidad vial interandina ($F_s = 1.25$ a $1.35$), pendientes pronunciadas ($> 8\%$), pesaje en balanzas MTOP, peajes interprovinciales y restricciones de gálibo/tonelaje en puentes urbanos.
4. **Renta de Vehículos:** Cálculo de corredores de entrega/devolución de unidades (depósitos, obras civiles, canteras) y monitoreo de geocercas permitidas.

## 1. Concurrencia y Fallback de Proveedores de Cartografía

El motor opera con una arquitectura de failover resiliente:
- **Nivel Primario:** Matriz de Distancia y Tráfico en Tiempo Real (Google Maps Distance Matrix API / Mapbox Navigation SDK).
- **Nivel Secundario:** Enrutamiento de Código Abierto OSRM (OpenStreetMap Ecuador) calibrado con velocidades medias cantonales.
- **Nivel Terrestre SARA:** Catálogo de hitos estratégicos nacionales (`HITOS_NACIONALES_ECUADOR`) y centroides cantonales con cálculo de Haversine ajustado por factor de topografía ecuatoriana.

## 2. Invariantes de Física y Restricciones por Modalidad

$$\text{Distancia Efectiva} = d_{\text{geodésica}} \times F_{\text{topografía}} \times F_{\text{sinuosidad}}$$

- **Motos (Delivery & Pasajeros):** $F_{\text{sinuosidad}} = 1.10$, velocidad media urbana $28\,\text{km/h}$, penalización por semáforo $0.8\,\text{min/km}$.
- **Autos / Sedanes:** $F_{\text{sinuosidad}} = 1.18$, velocidad media urbana $22\,\text{km/h}$, interurbana $70\,\text{km/h}$.
- **Camionetas & Furgones (1T - 3.5T):** $F_{\text{sinuosidad}} = 1.25$, velocidad media urbana $18\,\text{km/h}$, interurbana $60\,\text{km/h}$.
- **Volquetas & Camiones Pesados (5T - 14T):** $F_{\text{sinuosidad}} = 1.30$, velocidad media en cuestas $25\,\text{km/h}$, interurbana $48\,\text{km/h}$, obligatorio pesaje en balanzas MTOP.
- **Tráilers / Mulas (3S3 51T PBV):** $F_{\text{sinuosidad}} = 1.35$, velocidad media $40\,\text{km/h}$, restricción horaria en centros urbanos (solo horario nocturno $21\text{h}00 - 05\text{h}00$).
