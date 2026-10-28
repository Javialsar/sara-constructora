---
name: sara-marketplace-procurement-kardex
description: >-
  Gestión integral de abastecimiento B2B, homologación de proveedores, cálculo de Landed Cost y control Kardex NIC 2.
  Optimiza compras de materiales de construcción, evalúa riesgo de proveedores (OTIF) y previene roturas de inventario.
---

# sara-marketplace-procurement-kardex

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-marketplace-procurement-kardex`
- **Unidad de Negocio:** SARA Marketplace (Abastecimiento Mayorista B2B, Seller Hub y Control de Inventarios)
- **Repositorio / Estándar GitHub de Referencia:**
  - `zavora-ai/skill-procurement` (Framework agéntico de compras B2B, RFQ leveling, tracking de proveedores y automatización ERP).
  - `sourcesquid-ops/procurement-skills` (Vendor scorecards, trade compliance y freight cost allocation).
  - Norma Internacional de Contabilidad NIC 2 (Inventarios: Costo Promedio Ponderado / FIFO y Costos Atribuibles de Adquisición).
  - Resolución SRI NAC-DGERCGC24-00000013 (Tarifa 5% IVA en materiales de construcción calificados vs 15% tarifa general).
- **Objetivo Estratégico:**
  Automatizar el ciclo de abastecimiento de insumos pesados y acabados para obras civiles de GRUPO SARA. Calcula el *Landed Cost* integral en pie de obra (incluyendo flete por sinuosidad vial, peajes interprovinciales, seguro de carga y mermas técnicas), evalúa el desempeño de proveedores mediante la métrica OTIF (*On-Time In-Full*), y mantiene el control patrimonial de inventario multi-bodega bajo el método de Promedio Ponderado Móvil (PMP), activando alertas tempranas de reorden ($ROP$).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Norma Internacional de Contabilidad NIC 2 (Inventarios):**
   - Valuación de inventarios al menor entre el costo histórico de adquisición y el Valor Neto Realizable ($VNR$).
   - Inclusión obligatoria de aranceles, fletes no recuperables, manipuleo y otros costos atribuibles directos.
2. **Gobernanza Tributaria SRI Ecuador (Ley de Eficiencia Económica):**
   - Tarifa reducida de IVA al 5% para materiales de construcción listados (cemento, varilla de acero corrugado, hormigón premezclado, ladrillo, adoquín, arena y ripio).
   - Verificación de validez de comprobantes y estado activo de RUC mediante Módulo 11.
3. **Estándar de Calidad ISO 9001:2015 (Cláusula 8.4 - Control de Procesos y Servicios Suministrados Externamente):**
   - Homologación técnica continua, evaluación de reclamos por defectos de materiales y cumplimiento de certificaciones INEN.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Cálculo del Landed Cost Unitario en Pie de Obra
1. Recibir la solicitud de suministro desde `SARA-CONSTRUCTORA` o `SARA-APU`.
2. Para cada proveedor candidato $j$ ubicado a una distancia geográfica $D_j$ de la obra:
   - Extraer el precio ex-fábrica del material ($P_{\text{base}}$).
   - Aplicar la tarifa correspondiente de IVA ($\tau_{\text{IVA}} = 0.05$ para materiales calificados SRI; $0.15$ para equipos y ferretería general).
   - Calcular el flete terrestre considerando el factor de sinuosidad vial ecuatoriano ($F_s = 1.35$ en rutas de cordillera):
     $$F_{\text{log}} = D_j \times F_s \times \text{Tarifa}_{\text{ton-km}} \times W_i + \text{Peajes}$$
   - Sumar los costos de manipuleo/descarga en obra ($C_{\text{descarga}}$) y la merma técnica admitida ($\mu_i$):
     $$\text{Landed Cost Unitario } (LC_i) = P_{\text{base}} \times (1 + \mu_i) + \frac{F_{\text{log}}}{Q_i} + \frac{C_{\text{descarga}}}{Q_i}$$
3. Seleccionar la oferta con el menor *Landed Cost* que cumpla la ventana temporal de entrega requerida.

### Paso 2: Matriz Dinámica de Homologación de Proveedores (Vendor Scorecard)
1. Calcular el índice de cumplimiento integral OTIF (*On-Time In-Full*) del proveedor en las últimas $N$ entregas:
   $$\text{OTIF} = \left( \frac{\text{Órdenes Entregadas a Tiempo y en Cantidad Completa}}{\text{Total Órdenes Despachadas}} \right) \times 100\%$$
2. Evaluar el Score de Calidad Técnica ($Q_{\text{score}}$) basado en ensayos de laboratorio INEN (rotura de probetas de hormigón, límite de fluencia del acero corrugado $f_y \ge 420\,\text{MPa}$):
   $$Q_{\text{score}} = 100 - (\% \text{ Rechazos en Laboratorio} \times 5)$$
3. Calcular el Índice de Confiabilidad del Proveedor ($ICP$):
   $$ICP = 0.40 \cdot \text{OTIF} + 0.35 \cdot Q_{\text{score}} + 0.15 \cdot \text{Competitividad Precio} + 0.10 \cdot \text{Salud Tributaria SRI}$$
   - Si $ICP < 75.0$: Inhabilitar temporalmente al proveedor para licitaciones críticas de obra.

### Paso 3: Control Kardex Multi-Bodega bajo NIC 2 (Promedio Ponderado Móvil)
1. Al recibir un despacho en bodega de obra validado por fiscalización:
   - Actualizar el saldo físico:
     $$Q_{\text{nuevo}} = Q_{\text{anterior}} + Q_{\text{ingreso}}$$
   - Calcular el nuevo Costo Promedio Ponderado ($CPP$):
     $$CPP_{\text{nuevo}} = \frac{(Q_{\text{anterior}} \times CPP_{\text{anterior}}) + (Q_{\text{ingreso}} \times LC_{\text{unitario}})}{Q_{\text{nuevo}}}$$
2. Cada egreso o entrega a cuadrilla se valora al $CPP_{\text{actual}}$ vigente en ese instante, imputando el gasto directamente al rubro APU del proyecto.

### Paso 4: Monitoreo de Stock de Seguridad y Punto de Reorden (ROP)
1. Monitorear diariamente el consumo de obra ($\bar{d}$) y el tiempo de respuesta del proveedor ($\bar{L}$ en días).
2. Calcular el Stock de Seguridad ($SS$) para mitigar variabilidad climática o bloqueos viales:
   $$SS = Z_{0.99} \times \sqrt{\bar{L} \cdot \sigma_d^2 + \bar{d}^2 \cdot \sigma_L^2}$$
3. Determinar el Punto de Reorden ($ROP$):
   $$ROP = (\bar{d} \times \bar{L}) + SS$$
4. Si el stock disponible en bodega $\le ROP$:
   - Emitir orden de compra sugerida por el Lote Económico de Pedido ($EOQ$):
     $$EOQ = \sqrt{\frac{2 \cdot D_{\text{anual}} \cdot C_{\text{pedido}}}{C_{\text{mantenimiento}}}}$$

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Cero Roturas de Stock Crítico:** Disponibilidad $\ge 99.5\%$ en materiales esenciales (cemento, acero, áridos) en ruta crítica.
2. **Exactitud Kardex:** Conciliación contable física vs sistema con discrepancia $\le 0.10\%$.
3. **Ahorro en Landed Cost:** Reducción mínima del $8\%$ en costo total de suministro comparado con compras dispersas no geolocalizadas.
