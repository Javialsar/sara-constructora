---
name: sara-takeoff-geometric-estimator
description: >-
  Motor trigonométrico de cubicación y cómputo métrico 2D sobre planos PDF y raster.
  Calcula áreas poligonales (Shoelace), longitudes lineales, mampostería con deducción paramétrica de vanos
  y conteo de puntos, inyectando cantidades directamente a las partidas del presupuesto APU.
---

# sara-takeoff-geometric-estimator

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-takeoff-geometric-estimator`
- **Unidad de Negocio:** SARA BIM & Take-Off (Cómputos Métricos)
- **Objetivo Estratégico:**
  Digitalizar y automatizar la extracción de cantidades de obra directamente desde planos arquitectónicos y estructurales en PDF o imagen de alta resolución. Provee algoritmos de calibración de escala milimétrica, cálculo de áreas cerradas complejas mediante la fórmula de Gauss (Shoelace), cubicación de mampostería y enlucidos con deducción automática de áreas de vanos (puertas y ventanas), longitudes de tubería y conteo de instalaciones técnicas, enlazando cada medición geométrica a su rubro respectivo en `SARA APU`.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Normas Técnicas Ecuatorianas INEN de Dibujo Arquitectónico y Modular:**
   - Convenciones de acotamiento, tolerancias dimensionales y representación en planta y corte.
2. **Estándares de Medición y Cómputo Métrico de Obras (Standard Method of Measurement - NRM/POMI):**
   - Reglas de deducción de vanos:
     - Vanos menores a $0.50\,\text{m}^2$: No se descuentan en enlucidos y pintura por concepto de filos y mochetas.
     - Vanos mayores a $0.50\,\text{m}^2$: Deducción neta de superficie de mampostería con adición de mocheta perimetral si aplica.
3. **Pliegos Tipo de Obras del SERCOP:**
   - Unidades contractuales estándar de cobro: $m^2$ para superficies horizontales/verticales, $m$ para bordillos y tuberías, $u$ para artefactos y puntos, $m^3$ para excavaciones y hormigones.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Calibración Geométrica del Plano
1. Exigir dos puntos de calibración $P_1(x_1, y_1)$ y $P_2(x_2, y_2)$ en píxeles sobre una cota acotada conocida del plano.
2. Ingresar la distancia real en metros ($D_{\text{real}}$).
3. Calcular la escala espacial:
   $$D_{\text{px}} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
   $$\text{Factor Escala } (S_f) = \frac{D_{\text{real}}}{D_{\text{px}}} \quad [\text{metros/píxel}]$$

### Paso 2: Ejecución de Mediciones Especializadas
1. **Modo Área Poligonal (Losas, Pisos, Cubiertas):**
   - Recibir el conjunto ordenado de vértices poligonales $\{(x_i, y_i)\}_{i=0}^{n-1}$.
   - Aplicar el algoritmo de Gauss (Shoelace Formula):
     $$\text{Área}_{\text{px}} = \frac{1}{2} \left| \sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) \right| \quad (\text{con } x_n = x_0, y_n = y_0)$$
     $$\text{Área Real } (m^2) = \text{Área}_{\text{px}} \times (S_f)^2$$
2. **Modo Muros y Paredes con Deducción de Vanos:**
   - Medir la longitud acumulada del eje de pared ($L_{\text{muro}}$ en metros).
   - Recibir la altura libre de entrepiso ($H_{\text{libre}}$ en metros).
   - Identificar los vanos de puertas ($A_p = \sum a_i \cdot h_i$) y ventanas ($A_v = \sum a_j \cdot h_j$).
   - Calcular el área neta:
     $$\text{Área Bruta} = L_{\text{muro}} \times H_{\text{libre}}$$
     $$\text{Área Neta } (m^2) = \text{Área Bruta} - \sum_{\text{vano} \ge 0.50} A_{\text{vano}}$$
3. **Modo Longitud Lineal (Tuberías, Bordillos, Cerramientos):**
   - Sumar los segmentos euclidianos de polilínea escalados por $S_f$.
4. **Modo Conteo Puntual (Tomas, Luminarias, Válvulas):**
   - Contabilizar los marcadores georreferenciados en el canvas.

### Paso 3: Vinculación e Inyección en el APU
1. Seleccionar el `proyectoId` y el `rubroId` destino.
2. Actualizar el valor `cantidad_obra` del rubro con la cantidad total calculada.
3. Guardar el objeto geométrico (coordenadas, escala, capa y color) en `takeoff_mediciones` para permitir auditorías visuales futuras.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Canvas de Dibujo y Visualización Prémium:**
   - Fondo de canvas con micro-retícula sutil (`grid-pattern` neutro), zoom suave de rueda de ratón y soporte de gestos táctiles *pinch-to-zoom* en tablets iPad/Android.
   - Polígonos renderizados con relleno translúcido tintado según el rubro (ej. Hormigón: azul cobalto `rgba(59,130,246,0.25)`, Mampostería: ámbar arcilla `rgba(245,158,11,0.25)`) y bordes nítidos de 2px con snapping visual a vértices existentes.
2. **Slide-Over Flotante de Cómputos:**
   - Panel lateral derecho retráctil con glassmorphism (`backdrop-blur-md bg-white/90 dark:bg-slate-900/90`).
   - Listado de mediciones agrupadas por tipo, con botón de eliminación y botón de "Inyectar a APU" de altura táctil mínima de 44px.
3. **Ergonomía Móvil y PWA:**
   - Barra de herramientas inferior (Thumb Zone) con iconos de selección: Puntero, Calibrar, Área, Muro, Línea, Conteo.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `takeoff_planos`: Almacén de archivos PDF/imágenes, metadatos y factores de escala calibrados.
  - `takeoff_mediciones`: Polígonos vectoriales, polilíneas, capas y cantidades calculadas.
  - `presupuesto_rubros`: Recepción del valor numérico final en la columna `cantidad_obra`.
  - `src/lib/takeoff/geometry.ts`: Biblioteca trigonométrica subyacente.
- **Eventos del Bus:**
  - **Consume:** `PLANO_SUBIDO`, `RUBRO_SELECCIONADO_PARA_TAKEOFF`.
  - **Emite:** `CÓMPUTOS_TAKEOFF_CALCULADOS`, `CANTIDAD_APU_ACTUALIZADA`.
- **SharedMemory Key:** `takeoff:project:<proyectoId>:plan:<planoId>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Medición Take-Off
```json
{
  "medicionId": "tk-geom-089",
  "planoId": "plano-arq-piso1",
  "proyectoId": "sara-proj-2026-042",
  "tipoMedicion": "MUROS_CON_VANOS",
  "rubroDestinoId": "rubro-mam-03",
  "escalaMetrosPorPixel": 0.01245,
  "parametrosGeometria": {
    "longitudLinealTotalMetros": 64.80,
    "alturaEntrePisoMetros": 2.70,
    "areaBrutaM2": 174.96,
    "vanosDeducidos": [
      { "tipo": "PUERTA_P1", "ancho": 0.90, "alto": 2.10, "areaM2": 1.89, "cantidad": 4, "areaTotalM2": 7.56 },
      { "tipo": "VENTANA_V1", "ancho": 1.50, "alto": 1.20, "areaM2": 1.80, "cantidad": 6, "areaTotalM2": 10.80 }
    ],
    "areaVanosTotalM2": 18.36,
    "areaNetaM2": 156.60
  },
  "cantidadInyectadaAPU": 156.60,
  "unidad": "m2",
  "timestamp": "2026-10-16T15:23:45Z"
}
```

### 6.2 Reporte de Cómputos Métricos y Memorias (PDF)
- Plano con la huella gráfica coloreada de las mediciones realizadas.
- Cuadro de cantidades analítico con desglose de dimensiones, vanos deducidos y subtotales.
- Aprobación del Ingeniero Proyectista y vinculación con la planilla de avance de obra.
