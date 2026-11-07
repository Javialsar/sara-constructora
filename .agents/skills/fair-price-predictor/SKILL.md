---
name: fair-price-predictor
description: Algoritmo de predicción de tarifa transparente y precio justo ("Win-Win Fair Fare") adaptado a cada una de las 4 modalidades (Viajes, Mandaditos, Fletes y Renta) en Ecuador.
---

# fair-price-predictor: Algoritmo de Precio Justo "Win-Win Fair Fare"

El modelo de fijación de precios de SARA-FLETES busca el equilibrio óptimo entre la asequibilidad para el cliente final y la rentabilidad digna y sostenible para el conductor, fletero o repartidor ecuatoriano.

## 1. Fórmulas de Cálculo por Vertical

### A. 🚕 Viajes Cortos / Pasajeros (Urbanos & Periféricos)
$$\text{Tarifa Viaje} = \max\Big(\text{Tarifa Mínima}, \text{Banderazo} + (d \times C_{\text{km}}) + (t \times C_{\text{min}}) \times F_{\text{demanda}}\Big)$$
- **Moto Pasajero:** Banderazo \$0.75 | \$0.35/km | \$0.05/min | Mínimo \$1.25 USD.
- **Auto Sedán Económico:** Banderazo \$1.00 | \$0.50/km | \$0.10/min | Mínimo \$1.75 USD.
- **Auto Ejecutivo / Confort:** Banderazo \$1.50 | \$0.65/km | \$0.12/min | Mínimo \$2.50 USD.
- **Minivan Grupal (6-8 pax):** Banderazo \$2.20 | \$0.85/km | \$0.15/min | Mínimo \$3.50 USD.

### B. 📦 Mandaditos / Delivery Express (Documentos, Paquetes, Compras)
$$\text{Tarifa Mandadito} = \max\Big(\text{Tarifa Plana Base}, \text{Banderazo} + (d \times C_{\text{km}}) + S_{\text{urgencia}} + S_{\text{volumen}}\Big)$$
- **Moto Express (hasta 15kg):** Banderazo \$0.80 | \$0.40/km | Mínimo \$1.25 USD.
- **Auto Delivery / Frágil (hasta 60kg):** Banderazo \$1.20 | \$0.55/km | Mínimo \$2.00 USD.
- **Cargo Van Delivery (hasta 300kg):** Banderazo \$2.00 | \$0.75/km | Mínimo \$3.50 USD.
- Suplemento por urgencia extrema ($< 30\,\text{min}$): +\$0.50 USD.

### C. 🚛 Fletes y Logística Pesada (Materiales, Mudanzas, Áridos)
$$\text{Tarifa Flete} = \text{Banderazo} + (d \times F_{\text{sinuosidad}} \times C_{\text{km}}) + (w \times C_{\text{ton\_km}} \times d) + \text{Peajes MTOP} - \text{Ahorro Backhaul}$$
- **Camioneta Pickup (1.2T):** Mínimo \$2.00 USD.
- **Furgón 3.5T:** Mínimo \$2.50 USD.
- **Camión 5T:** Mínimo \$3.00 USD.
- **Volqueta 14m³ (V3A 27T PBV):** Mínimo \$18.00 USD | Ciclo Backhaul con cantera reduce hasta $28\%$.
- **Tráiler Mula (3S3 51T PBV):** Mínimo \$50.00 USD.

### D. 🔑 Renta de Vehículos (Por Horas o Días)
$$\text{Tarifa Renta Horas} = (t \times \text{Tarifa Hora}) + (\text{Con Chofer ? } t \times \$6.00 : 0) + \text{Seguro}$$
$$\text{Tarifa Renta Días} = (d \times \text{Tarifa Día} \times F_{\text{descuento}}) + (\text{Con Chofer ? } d \times \$40.00 : 0)$$
- Factor de descuento por días: 3-6 días ($10\%$), 7-29 días ($20\%$), $\ge 30$ días ($30\%$).
- Depósito de garantía en custodia Escrow reembolsable tras inspección.
