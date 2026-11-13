---
name: freight-matching-engine
description: Regula la lógica de subasta inversa (oferta del cliente vs. contraoferta del transportista en radar), validación estricta de peso vs. capacidad del vehículo (capacidad_vehiculo >= peso_carga) y bloqueo de conductores con "Saldo OK" insuficiente para comisiones en SARA-FLETES.
---

# Freight Matching Engine — SARA-FLETES

Motor de emparejamiento, subasta inversa y reglas de validación de carga para el ecosistema logístico de **GRUPO SARA**.

## 1. Validación de Capacidad y Reglas de Carga

Todo requerimiento de flete debe validar estrictamente antes de habilitar o destacar vehículos:
- `capacidad_vehiculo_ton >= peso_carga_ton`
- **Incompatibilidades Físicas / Seguridad de Obra:**
  - **Arena / Ripio / Escombros (Áridos a granel):** Requiere volquete con tolva basculante (`VOLQUETA_14M3`). Bloquear o alertar severamente si se selecciona furgón cerrado o camioneta convencional para volúmenes mayores a 1 m³.
  - **Varillas de Acero (6m - 12m):** Requiere plataforma abierta o camión mediano/tráiler (`CAMION_10T` o `TRAILER_30T`). Bloquear camionetas pickup (`PICKUP_1T`) por riesgo de voladizo peligroso en vías MTOP.
  - **Cemento en Sacos (50kg c/u) / Cerámica:** Factor de cálculo automático: $N_{\text{sacos}} \times 0.05\,\text{Ton} = \text{Peso Total}$. Bloquear vehículos cuya capacidad sea rebasada por el peso calculado.

## 2. Subasta Inversa Unificada (InDrive-style)
- **Tarifa Sugerida:** Calculada mediante costos operativos base MTOP + combustible + peajes.
- **Oferta del Cliente:** El cliente ajusta libremente con controles `[-] / [+]` sobre la tarifa sugerida.
- **Recepción de Contraofertas:** Los transportistas en radar envían sus propuestas, etiquetadas visualmente como **"Contraofertas recibidas"** con el delta $(\pm \$X.XX)$ respecto a la oferta del cliente.

## 3. Gobernanza de Saldo del Transportista (Fintech Wallet)
- Los transportistas solo pueden postular o emitir contraofertas si su estado en la billetera virtual SARA es `Saldo OK` (saldo prepago o cupo de crédito mayor a la comisión de plataforma retenida).
