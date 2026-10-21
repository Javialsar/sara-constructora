---
name: sara-freight-dynamic-pricing
description: Motor econométrico de tarificación de transporte de carga y renta temporal de vehículos. Calcula precios por viaje (distancia/peso/peajes) y por tiempo (horas/días con o sin chofer tipo Uber Rent).
---

# sara-freight-dynamic-pricing: Motor de Precios de Fletes y Renta Temporal

## 1. Régimen de Flete por Viaje (Carga Directa)

### A. Flete Local Urbano ($\le 5\,\text{km}$)
$$\text{Tarifa Local} = \max\Big(\text{Tarifa Mínima}, \text{Banderazo} + (d \times C_{\text{km}}) + (w \times C_{\text{ton}}) \times F_{\text{material}}\Big)$$
* Camioneta Pickup (1.2T): Mínimo \$2.00, Banderazo \$1.50, \$0.50/km, \$0.30/ton.
* Camión 5T: Mínimo \$3.00, Banderazo \$2.20, \$0.70/km, \$0.25/ton.

### B. Flete Interurbano / Interprovincial ($> 5\,\text{km}$)
$$\text{Tarifa Interurbana} = \text{Banderazo} + (d \times 1.25 \times C_{\text{km\_inter}}) + (w \times C_{\text{ton\_km}} \times d) + \text{Peajes MTOP}$$

---

## 2. Régimen de Renta Temporal de Vehículos (Por Horas y Días)

Para contratos de alquiler temporal para mudanzas, faenas de obra o distribución comercial:

### A. Renta por Horas ($t \le 8\,\text{horas}$)
$$\text{Costo Renta Horas} = (t \times \text{Tarifa Hora}) + (\text{Con Chofer ? } t \times \$6.00 : 0) + \text{Seguro Diario}$$

### B. Renta por Días ($d \ge 1\,\text{día}$)
$$\text{Costo Renta Días} = (d \times \text{Tarifa Día} \times F_{\text{duración}}) + (\text{Con Chofer ? } d \times \$40.00 : 0)$$

* **Factor de Descuento por Duración ($F_{\text{duración}}$):**
  * 1 a 2 días: $1.00$ (Tarifa normal).
  * 3 a 6 días: $0.90$ ($10\%$ de descuento semanal).
  * 7 a 29 días: $0.80$ ($20\%$ de descuento quincenal/mensual).
  * $\ge 30$ días: $0.70$ ($30\%$ de descuento corporativo).

### C. Depósito de Garantía Retenido en Custodia Escrow (`SARA-PAGOS`)
* Camioneta: \$250.00 USD (reembolsado automáticamente tras verificación de odómetro y combustible).
* Furgón / Camión: \$450.00 USD.
