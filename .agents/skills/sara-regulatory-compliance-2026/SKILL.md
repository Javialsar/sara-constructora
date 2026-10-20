---
name: sara-regulatory-compliance-2026
description: >-
  Cumplimiento normativo ecuatoriano e internacional 2025-2026 para los 8 módulos de GRUPO SARA (SERCOP/INEC, NEC-15/ISO 19650, MTOP, IESS SBU $482/Decreto 255, SRI Retenciones/IVA 5%/Módulo 11, UAFE, BIESS 2.99%/IVS y USALI).
  Úsese siempre que se programen o auditen motores matemáticos, contables, tributarios, laborales o logísticos del ecosistema.
---

# sara-regulatory-compliance-2026

## 1. Objetivo de la Skill
Garantizar que todos los cálculos de ingeniería, presupuestos, impuestos, nómina, logística pesada, valuación inmobiliaria y hospitalidad de **GRUPO SARA** cumplan al **100%** con las leyes vigentes en el Ecuador (2025–2026) y los estándares técnicos internacionales.

---

## 2. Matriz Oficial de Parámetros Legales y Técnicos (2025–2026)

### 2.1 `SARA-CONSTRUCTORA` & BIM (NEC-15 + ISO 19650)
- **Zonificación Sísmica NEC-SE-DS:** Incluir siempre el factor de aceleración sísmica $Z$ por zona (Zona I $0.15g$ a Zona VI $\ge 0.50g$; ej. Cuenca $0.25g$, Quito $0.40g$, Guayaquil $0.40g$, Esmeraldas/Manabí $0.50g$), tipo de suelo ($S_A\text{--}S_F$) y coeficiente de importancia $I$.
- **ISO 19650-1/2:** Todo contenedor BIM/IFC debe registrar estado CDE (`WIP`, `SHARED`, `PUBLISHED`, `ARCHIVED`), esquema (`IFC2X3`, `IFC4`, `IFC4X3`), nivel `LOD` (`LOD_300` a `LOD_400`) y descuento geométrico de intersecciones en nudos estructurales.

### 2.2 `SARA-APU` & Contratación Pública (SERCOP + INEC IPCO)
- **Fórmula Polinómica de Reajuste (Art. 267 RGLOSNCP):**
  $$P_r = P_0 \left( p_1 \frac{B_1}{B_0} + p_2 \frac{C_1}{C_0} + \dots + p_x \frac{X_1}{X_0} \right)$$
  - Validar siempre que la suma de coeficientes sea exactamente $\sum p_i + p_x = 1.000$ (3 decimales), máximo 10 monomios principales, y el término de componentes no principales cumpla $p_x \le 0.200$.
- **Desagregación Tecnológica (Obras) y VAE (Bienes/Servicios):** No asumir el $100\%$ de los insumos como nacionales por defecto; clasificar el origen (`NACIONAL`, `IMPORTADO`) según código CPC y calcular el porcentaje real de participación nacional.

### 2.3 `SARA-MARKETPLACE` & Kardex (NIC 2 + IVA Construcción 5%)
- **IVA Reducido al 5% en Materiales de Construcción (Resolución SRI NAC-DGERCGC24-00000013):** Aplicar tarifa del **5% de IVA** (código SRI `5`) a varilla de acero corrugado, cemento, hormigón premezclado, áridos (arena, ripio, pétreos), bloques, ladrillos y morteros. Aplicar **15% de IVA** (código SRI `4`) a acabados, PVC, material eléctrico y herramientas.
- **Valoración NIC 2:** Kardex por Costo Promedio Ponderado (CPP), Lote Económico $EOQ = \sqrt{2DS/H}$, Punto de Reorden $ROP$ y tolerancias de merma CAMICON/NEC.

### 2.4 `SARA-FLETES` & Carga Pesada (Tabla Nacional MTOP)
- **Límites de Peso Bruto Vehicular (PBV) MTOP:**
  - `2DB` (Camión 2 ejes): máx. **18 T PBV**.
  - `V3A` / `3A` (Volqueta 3 ejes $14\,\text{m}^3$): máx. **27 T PBV**.
  - `3S2` (Mula 5 ejes): máx. **48 T PBV**.
  - `3S3` (Mula 6 ejes): **48 T + 3 T tolerancia = 51 T PBV máx.**
- Calcular siempre tanto la carga de abastecimiento (`suministros`) como el desalojo de tierras, emparejando viajes de retorno (*Backhaul*) con canteras cercanas y verificando Certificado de Operación Regular/Especial (`COR`/`COE`).

### 2.5 `SARA-TALENTOHUMANO` & Nómina (MDT + IESS + Decreto 255 SST)
- **Salario Básico Unificado (SBU):**
  - Periodo `2025`: **$470.00 USD** (*Acuerdo Ministerial MDT-2024-300*).
  - Periodo `2026`: **$482.00 USD** (*Acuerdo Ministerial MDT-2025-195*).
- **Aportes IESS Construcción:** Personal **9.45%**, Patronal **12.15%** ($11.15\%\text{ IESS} + 0.5\%\text{ SECAP} + 0.5\%\text{ IECE}$), Fondo de Reserva **8.33%**, XIII Sueldo ($1/12$), XIV Sueldo ($\text{SBU}/12$ proporcional a horas ordinarias laboradas) y Vacaciones ($1/24$).
- **Seguridad y Salud en el Trabajo (SST):** Cumplimiento del **Decreto Ejecutivo 255** (Reglamento SST vigente), **Resolución C.D. 513 IESS** y acreditación de competencias **SECAP**.

### 2.6 `SARA-PAGOS`, SRI & UAFE
- **Retenciones en la Fuente SRI vigentes:**
  - Contratos de Construcción de Obra Material Inmueble (Cód. SRI `344` / `3440`, Art. 28 LRTI): **2.00% IR** y **30.0% de Retención de IVA** (entre sociedades/agentes de retención).
  - Compra de Materiales / Bienes Muebles (Cód. SRI `312`): **1.75% IR** y **30.0% de Retención de IVA** (o **1.00% IR** si el proveedor es `RIMPE_EMPRENDEDOR`, **0%** si es `RIMPE_POPULAR` con nota de venta).
- **Ficha Técnica SRI:** Validar longitud de 49 dígitos y **dígito verificador Módulo 11** en toda `claveAcceso`.
- **Prevención Lavado de Activos (UAFE):** Activar control KYC/PEP y reporte **RESU** obligatorio en operaciones individuales o acumuladas $\ge \$10,000.00\,\text{USD}$.

### 2.7 `SARA-INMOBILIARIA` (BIESS 2026 + Normas IVS)
- **Segmentos Hipotecarios Ecuador 2026:**
  - **BIESS Vivienda Premier / Credicasa:** Tasa **2.99% anual** (primera vivienda nueva hasta $\approx \$50,000\text{--}\$55,000$).
  - **VIS ($\le 178\,\text{SBU} = \$85,796$) y VIP ($\le 228.42\,\text{SBU} = \$110,098$):** Tasa **4.99% anual**.
  - **Hipotecario Comercial / BIESS Estándar:** Tasa **8.49% anual**.
- **Valuación IVS 2025:** Calcular siempre **VAN (Valor Actual Neto)** y **TIR (Tasa Interna de Retorno)** descontando los flujos en los meses de absorción comercial.

### 2.8 `SARA-ALOJAMIENTO` / Stays (USALI + IVA Turístico 8%)
- **Métricas USALI 12th Ed.:** Calcular explícitamente **ADR**, **Occupancy Rate (%)**, **RevPAR** ($\text{ADR} \times \text{Occupancy}$) y **ALOS** (estancia media con tarifa corporativa para campamentos técnicos).
- **IVA Turístico Ecuador:** Aplicar **15% de IVA** en días ordinarios y **8% de IVA** (código SRI `8`) en feriados nacionales decretados para alojamientos con Registro MINTUR y LUAF vigente.
