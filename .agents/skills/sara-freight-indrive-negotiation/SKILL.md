---
name: sara-freight-indrive-negotiation
description: Motor de negociación bidireccional y subasta P2P tipo inDrive entre solicitantes y transportistas con bandas de viabilidad financiera.
---

# sara-freight-indrive-negotiation: Negociación P2P y Contraofertas

## 1. Flujo de Negociación

```
[Constructor/Cliente propone tarifa] 
       │
       ▼
[IA evalúa viabilidad frente al costo mínimo operativo]
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
[Tarifa Viable]             [Tarifa Demasiado Baja]
Alerta a choferes           IA sugiere ajuste mínimo
       │
       ▼
[Choferes cercanos reciben solicitud]
   ├── Opción 1: Aceptar tarifa ofrecida de inmediato.
   ├── Opción 2: Enviar contraoferta (+10%, +20% o valor personalizado).
       │
       ▼
[Cliente visualiza choferes postulantes]
   - Nombre, Calificación (estrellas), Vehículo, Tiempo estimado de llegada
   - Precio ofrecido por cada chofer
       │
       ▼
[Cliente Acepta] ───> Se genera PIN seguro de obra y reserva en Escrow
```

## 2. Guardarraíles de Precios
- **Piso Financiero:** No se permiten ofertas inferiores al 70% de la tarifa recomendada por IA (evita competencia destructiva que no cubra combustible ni depreciación).
- **Techo Justo:** Se alerta si una contraoferta supera el 160% de la tarifa de mercado.
