---
name: mtop-gps-telemetry
description: Define el manejo de telemetría vial, rastreo GPS satelital y mitigación de latencia o pérdida de señal en zonas rurales y carreteras interprovinciales del Ecuador para SARA-FLETES.
---

# MTOP GPS Telemetry — SARA-FLETES

Módulo de telemetría y geolocalización satelital para el transporte de carga bajo estándares del Ministerio de Transporte y Obras Públicas (MTOP) del Ecuador.

## 1. Mitigación de Pérdida de Cobertura y Latencia
- En carreteras interprovinciales o zonas de canteras sin cobertura celular óptima, la interfaz no debe bloquearse bajo el estado "Cargando Red Satelital y Vial SARA...".
- **Estrategia Fallback / Optimista:**
  - Caché de última posición conocida (*Dead Reckoning*).
  - Indicador de modo offline / satelital asíncrono en la barra superior o mapa.
  - Sincronización en búfer local (IndexedDB) para eventos telemáticos.

## 2. Puntos de Control y Peajes MTOP
- Detección automática de cruces de peajes interprovinciales (e.g., San Roque, Machachi, Alóag, Chongón, Yambo).
- Registro inviolable de marcas de tiempo UTC y coordenadas GPS para auditoría de fletes.
