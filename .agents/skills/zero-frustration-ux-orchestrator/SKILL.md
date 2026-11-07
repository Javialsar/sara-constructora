---
name: zero-frustration-ux-orchestrator
description: Orquestador de experiencia de usuario táctil, ultra-rápida y sin fricción (1 a 2 toques, confirmación en <2.5 segundos, autocompletado GPS) para la super-app SARA-FLETES.
---

# zero-frustration-ux-orchestrator: UX Táctil Cero Frustraciones en SARA-FLETES

Este skill define las reglas de interfaz humana, accesibilidad y tiempos de respuesta para garantizar que la plataforma unificada de movilidad y logística multimodal supere drásticamente a Uber, InDrive, DiDi y Rappi en fluidez y simplicidad.

## 1. Principios Mandatarios de Diseño (Zero-Frustration Invariants)

1. **Auto-Completado GPS Inmediato ($< 1.0\,\text{s}$):**
   - Al cargar la aplicación o activar el módulo, la geolocalización satelital detecta las coordenadas del usuario y fija automáticamente el punto de origen en "Mi Ubicación Actual (GPS)".
   - Cero necesidad de escribir manualmente la dirección si el usuario se encuentra en el punto de recogida.

2. **Top-Bar de 4 Pestañas Instantáneas (1 solo toque):**
   - Selector superior siempre visible y accesible con el pulgar:
     `[ 🚕 Viajes ] | [ 📦 Mandaditos ] | [ 🚛 Fletes ] | [ 🔑 Renta ]`
   - La transición entre pestañas es inmediata (estado reactivo local en memoria, sin recargas de página ni parpadeos).

3. **Confirmación en Menos de 2.5 Segundos:**
   - La interfaz muestra los vehículos sugeridos con su tarifa estimada, tiempo de llegada del conductor más cercano y botón de confirmación directo.
   - En solo 2 toques: (1) Seleccionar destino o paquete, (2) Confirmar solicitud.

4. **Prevención de Errores y Claridad Visual:**
   - Cero jerga técnica o formularios engorrosos en la vista inicial.
   - Si faltan datos (ej. destino no ingresado), la interfaz guía intuitivamente al usuario con un resaltado sutil y amigable.
   - Integración nativa de pines arrastrables en el mapa interactivo para ajuste visual milimétrico de recogida y entrega.
