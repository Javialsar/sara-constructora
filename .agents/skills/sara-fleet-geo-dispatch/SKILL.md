---
name: sara-fleet-geo-dispatch
description: Motor de zonificación geoespacial, geocodificación, cálculo de radio de búsqueda y enrutamiento vial más corto para SARA-FLETES.
---

# sara-fleet-geo-dispatch: Despacho Geoespacial y Ruteo Vial

## 1. Detección de Posición GPS y Centrado de Mapa

El sistema detecta la coordenada del dispositivo en tiempo real:
- Dispositivo móvil / navegador: `navigator.geolocation.getCurrentPosition`.
- Si el GPS está desactivado o denegado, centra por defecto en la capital provincial del usuario o la ciudad de la obra (ej. Loja, Cariamanga, Cuenca, Quito, Guayaquil).

## 2. Geocodificación y Reverse Geocoding

Convierte direcciones de texto (ej. *"MAtecons Chile, Cariamanga"*, *"El Dorado, Cariamanga"*) a coordenadas `(lat, lon)` mediante:
1. Servicio abierto de geocodificación OpenStreetMap Nominatim:
   `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ec&q={query}`
2. Fallback con base de datos de referencias locales de cantones ecuatorianos y ferreterías/obras conocidas.

## 3. Ruteo Vial de Mínima Distancia (OSRM Routing Engine)

Para trazar la ruta real sobre la malla vial y no una línea recta ficticia:
- Endpoint:
  `https://router.project-osrm.org/route/v1/driving/{lon_origen},{lat_origen};{lon_destino},{lat_destino}?overview=full&geometries=geojson`
- Extrae:
  - `distance`: Metros reales por carretera (convertido a Km dividiendo para 1000).
  - `duration`: Segundos estimados de trayecto (convertido a Minutos).
  - `geometry`: Coordenadas GeoJSON de la polilínea que se pinta en el mapa Leaflet.

## 4. Matching por Radio de Cercanía

Filtra los transportistas disponibles en función de la distancia al punto de origen:
- Radio 1: $0$ a $5\,\text{km}$ (Prioridad Inmediata - Despacho Express en cantón/ciudad).
- Radio 2: $5$ a $20\,\text{km}$ (Periferia y cantones vecinos).
- Radio 3: $> 20\,\text{km}$ (Larga distancia / fletes interprovinciales).
