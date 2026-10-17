---
name: sara-bim-ifc-parser
description: >-
  Procesamiento y extracción de cantidades geométricas 3D desde modelos BIM (formatos IFC 2x3, IFC4, glTF).
  Clasifica elementos estructurales (columnas, vigas, losas, zapatas), descuenta intersecciones de nudos
  y coteja volúmenes y tonelajes de acero contra el presupuesto APU.
---

# sara-bim-ifc-parser

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-bim-ifc-parser`
- **Unidad de Negocio:** SARA BIM & Take-Off (Modelado 3D & Coordinación)
- **Objetivo Estratégico:**
  Analizar archivos de modelos de información de la construcción (BIM) en estándar abierto IFC (`Industry Foundation Classes` IFC 2x3 e IFC4) y mallas optimizadas glTF. Extrae de forma volumétrica neta los elementos de hormigón armado, áreas de encofrado y estimación de cuantías de acero estructural, evitando la sobreestimación por superposición en nudos columna-viga, y cruzando los cómputos 3D contra los rubros de presupuesto en `SARA APU` para detectar inconsistencias previas a la licitación o compra de materiales.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Estándar Abierto buildingSMART (ISO 16739-1:2018):**
   - Estructura jerárquica espacial: `IfcProject` $\rightarrow$ `IfcSite` $\rightarrow$ `IfcBuilding` $\rightarrow$ `IfcBuildingStorey` $\rightarrow$ `IfcProduct`.
   - Propiedades estándar *BaseQuantities*: `NetVolume`, `GrossVolume`, `NetSideArea`, `Length`, `CrossSectionArea`.
2. **Norma Ecuatoriana de la Construcción (NEC-SE-HM - Hormigón Armado):**
   - Criterios de cuantía geométrica mínima y máxima de acero de refuerzo en elementos sismo-resistentes ($\rho_{min} = 0.01$, $\rho_{max} = 0.025$ en columnas).
3. **Estándar BIM del Ecuador (Guía Nacional BIM):**
   - Niveles de Desarrollo de Información (LOD 200 a LOD 400) para cómputos métricos y fabricación.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Parseo Jerárquico del Archivo IFC
1. Recibir y decodificar el archivo IFC o su representación indexada glTF/JSON.
2. Identificar y agrupar las entidades estructurales principales:
   - Columnas: `IfcColumn`
   - Vigas de amarre y principales: `IfcBeam`
   - Losas macizas y alivianadas: `IfcSlab`
   - Zapatas y losas de cimentación: `IfcFooting`
   - Muros de contención y corte (shear walls): `IfcWall` / `IfcWallStandardCase`
3. Agrupar las entidades por nivel de entrepiso (`IfcBuildingStorey`).

### Paso 2: Extracción Geométrica Neta y Descuento de Intersecciones
1. Extraer los sólidos tridimensionales mediante sus operaciones booleanas CSG (*Constructive Solid Geometry*) o representaciones B-Rep (*Boundary Representation*).
2. Aplicar la regla de prioridad volumétrica para evitar duplicación de hormigón en nudos:
   - **Prioridad 1 (Columnas):** Se computan completas desde nivel de losa inferior hasta cara inferior de viga superior (o completas a través del nudo según convención estructural).
   - **Prioridad 2 (Vigas):** Se mide su longitud neta entre caras de columnas (descontando el ancho de los pilares).
   - **Prioridad 3 (Losas):** Se descuenta el área y volumen interceptado por vigas y columnas descolgadas.
3. Extraer el área neta de contacto perimetral para cómputo de **Encofrados** ($m^2$).

### Paso 3: Estimación Paramétrica de Acero y Cotejo con Presupuesto
1. Si el modelo IFC contiene armaduras modeladas (`IfcReinforcingBar`):
   - Extraer longitud, diámetro nominal ($\phi 8, \phi 10, \phi 12, \phi 16, \phi 20, \phi 25$) y calcular peso en kilogramos:
     $$\text{Peso } (\text{kg}) = \frac{\pi \times (\phi_{\text{mm}})^2}{4} \times \frac{7850\,\text{kg/m}^3}{10^6} \times L_{\text{metros}}$$
2. Si el modelo es LOD 300 (geometría sin barras detalladas):
   - Aplicar cuantías paramétricas estándar NEC según tipo de elemento (ej. Columnas: $120\,\text{kg/m}^3$, Vigas: $100\,\text{kg/m}^3$, Losas: $60\,\text{kg/m}^3$).
3. Comparar el volumen total ($m^3$) y acero ($kg$) contra las cantidades registradas en el presupuesto del proyecto:
   $$\text{Varianza } (\%) = \frac{\text{Cantidad BIM} - \text{Cantidad Presupuesto}}{\text{Cantidad Presupuesto}} \times 100$$
4. Si $|\text{Varianza}| > 3.0\%$, alertar al calculista para revisión de planos o ajuste del APU.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Visor BIM 3D Interactivo y Minimalista:**
   - Visualizador basado en WebGL / Three.js con sombreado arquitectónico limpio (AO / Ambient Occlusion suave).
   - Filtro de visibilidad por capas y pisos con chips táctiles semitransparentes flotantes.
   - Aislamiento de elementos (*Ghost Mode*) al hacer click: los elementos seleccionados se iluminan en verde esmeralda mientras el resto del modelo adopta opacidad al 15%.
2. **Inspección de Propiedades (Inspector Panel):**
   - Tarjeta flotante con jerarquía tipográfica rigurosa: Propiedad y Valor tabulados con tipografía monoespaciada para dimensiones numéricas.
3. **Ergonomía:**
   - Soporte táctil en tablets para rotación orbital (1 dedo) y paneo/zoom (2 dedos).

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `bim_modelos`: Almacén de archivos IFC, metadatos, autor y fecha de carga.
  - `bim_elementos_extraidos`: Entidades clasificadas con sus volúmenes y superficies calculadas.
  - `presupuesto_rubros`: Contraste y sincronización de cantidades.
- **Eventos del Bus:**
  - **Consume:** `MODELO_BIM_CARGADO`.
  - **Emite:** `BIM_CANTIDADES_EXTRAIDAS`, `ALERTA_DISCREPANCIA_BIM_APU`.
- **SharedMemory Key:** `bim:project:<proyectoId>:model:<modeloId>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Extracción BIM
```json
{
  "modeloId": "bim-mod-torre-alborada",
  "proyectoId": "sara-proj-2026-042",
  "versionIfc": "IFC4",
  "totalElementosComputados": 342,
  "resumenVolumetrico": {
    "hormigonTotalM3": 892.40,
    "aceroRefuerzoTotalKg": 94500.0,
    "encofradoTotalM2": 3410.20
  },
  "desglosePorEntidad": [
    {
      "categoria": "IfcColumn",
      "cantidadElementos": 48,
      "volumenNetoM3": 184.20,
      "areaEncofradoM2": 960.0,
      "cuantiaAceroEstimadaKg": 23946.0
    },
    {
      "categoria": "IfcBeam",
      "cantidadElementos": 112,
      "volumenNetoM3": 245.80,
      "areaEncofradoM2": 1150.0,
      "cuantiaAceroEstimadaKg": 24580.0
    },
    {
      "categoria": "IfcSlab",
      "cantidadElementos": 6,
      "volumenNetoM3": 462.40,
      "areaEncofradoM2": 1300.20,
      "cuantiaAceroEstimadaKg": 45974.0
    }
  ],
  "discrepanciasConApu": [
    {
      "rubroCodigo": "EST-015",
      "descripcion": "Hormigón en columnas f'c=280",
      "cantidadApuM3": 172.0,
      "cantidadBimM3": 184.20,
      "varianzaPorcentaje": 7.09,
      "alerta": "CANTIDAD_APU_DEFICITARIA"
    }
  ]
}
```

### 6.2 Reporte de Auditoría BIM vs Presupuesto (PDF)
- Render 3D axonométrico del proyecto con corte perspectivo.
- Tabla comparativa de cantidades IFC vs Presupuesto Contractual.
- Veredicto de coherencia geométrica y firma del Coordinador BIM de GRUPO SARA.
