---
name: sara-fleet-vehicle-taxonomy
description: Catálogo y clasificación normativa de flota vehicular para transporte de carga y renta temporal (por horas/días, con o sin chofer) en GRUPO SARA (tipo Uber, inDrive, DiDi y Turo).
---

# sara-fleet-vehicle-taxonomy: Flota Multimodal y Renta Temporal

## 1. Clasificación Homologada de Flota

| Categoría | Código | Capacidad Carga | Capacidad Volumen | Renta por Hora (USD) | Renta por Día (USD) | Modalidades Permitidas | Requisitos de Renta Libre |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Camioneta Pickup** | `PICKUP_1T` | 1.2 Ton | 2.5 m³ | $12.00 / h | $65.00 / día | Flete / Renta con o sin chofer | Licencia B/C vigente, garantía $300 |
| **Furgón Urbano** | `FURGON_3T` | 3.5 Ton | 14.0 m³ | $18.00 / h | $95.00 / día | Flete / Renta con chofer | Licencia C, depósito de garantía |
| **Camión Liviano** | `CAMION_5T` | 5.0 Ton | 18.0 m³ | $25.00 / h | $140.00 / día | Flete / Renta con chofer preferente | Licencia C/D, revisión técnica |
| **Volqueta de Obra** | `VOLQUETA_V3A` | 14.0 Ton | 14.0 m³ | $35.00 / h | $220.00 / día | Flete / Renta por hora en obra | Solo con operador certificado |
| **Camión Mediano** | `CAMION_10T` | 10.0 Ton | 25.0 m³ | $32.00 / h | $190.00 / día | Flete / Renta con chofer | Licencia E, permiso MTOP |
| **Mula Plataforma** | `TRACTO_3S3` | 32.0 Ton (51T PBV) | 35.0 m³ | $55.00 / h | $380.00 / día | Flete interprovincial / Alquiler mensual | Chofer profesional MTOP |

## 2. Invariantes Operativas

1. **Renta Temporal Sin Chofer:** Limitada exclusivamente a categorías ligeras (`PICKUP_1T`) con validación biométrica, licencia de conducir vigente y bloqueo de garantía en tarjeta/billetera.
2. **Renta Temporal Con Chofer/Operador:** Obligatoria para volquetas (`VOLQUETA_V3A`), camiones de más de 5 Ton y tráileres (`TRACTO_3S3`).
3. **Control Telemático:** Todo vehículo en renta temporal cuenta con seguimiento GPS y geocercas activas.
