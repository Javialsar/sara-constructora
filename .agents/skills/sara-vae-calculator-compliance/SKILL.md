---
name: sara-vae-calculator-compliance
description: >-
  Cálculo, auditoría y certificación del Valor Agregado Ecuatoriano (VAE) de ofertas de obra
  y servicios técnicos bajo la metodología oficial del SERCOP y el Clasificador Central de Productos (CPC).
---

# sara-vae-calculator-compliance

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-vae-calculator-compliance`
- **Unidad de Negocio:** SARA SERCOP & APU Presupuestos
- **Objetivo Estratégico:**
  Calcular con precisión matemática el porcentaje de Valor Agregado Ecuatoriano (VAE) de la oferta técnica y económica de GRUPO SARA, desglosando la procedencia nacional vs extranjera de cada insumo según su código CPC oficial. Audita el cumplimiento estricto del umbral mínimo de VAE fijado en los pliegos contractuales para evitar la descalificación automática de la propuesta en el portal del SERCOP, formulando sustituciones inteligentes de materiales importados cuando sea necesario.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Resolución SERCOP RE-SERCOP-2016-0000072 (Capítulo V - Valor Agregado Ecuatoriano):**
   - Metodología oficial para la desagregación de componentes de origen nacional en contratos de obras y consultoría.
   - Umbrales mínimos de VAE por tipo de obra civil (vial, edificación, saneamiento, obras portuarias).
   - Consecuencia jurídica de no alcanzar el umbral mínimo de VAE: Rechazo y descalificación de la oferta en la fase de convalidación o calificación técnica.
2. **Clasificador Central de Productos (CPC Versión 2.0 adaptado por el SERCOP):**
   - Catálogo de códigos CPC a 9 dígitos para cada rubro e insumo de la construcción en el Ecuador.
3. **Registro Oficial y Normas MIPRO (Ministerio de Producción, Comercio Exterior, Inversiones y Pesca):**
   - Certificados de producción nacional para acero nacional (Andec, Adelca, Novacero), cemento nacional (Holcim, UNACEM, Chimborazo) y derivados plásticos (Plásticos del Litoral, Rival).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Mapeo de Insumos y Códigos CPC
1. Recorrer la lista total de insumos del presupuesto consolidado (`insumos_apu` vinculados al proyecto).
2. Asignar o verificar el código CPC a cada insumo:
   - Materiales nacionales fabricados en Ecuador con insumos locales: Código CPC nacional, factor local $100\%$.
   - Materiales importados o con componentes extranjeros predominantes (ej. motores, bombas importadas, perfilería especial): Factor local $0\%$ o mixto certificado.
   - Mano de obra: $100\%$ origen ecuatoriano (personal con afiliación al IESS).
   - Equipos: Depreciación y repuestos nacionales vs componentes de amortización de maquinaria importada.

### Paso 2: Cálculo Matemático del VAE de la Oferta
Aplicar la fórmula canónica del SERCOP para contratos de obra:
$$\text{VAE}_{\text{oferta}} = \frac{\sum (\text{Costo Mano de Obra Local} + \text{Materiales Nacionales} + \text{Equipos/Servicios Nacionales})}{\text{Costo Directo Total}} \times 100$$
Donde:
- $\text{Mano de Obra Local}$: Sumatoria de salarios reales de obreros y técnicos ecuatorianos.
- $\text{Materiales Nacionales}$: Sumatoria de cantidades de insumos con certificado de origen nacional multiplicado por su precio unitario.
- $\text{Equipos/Servicios Nacionales}$: Servicios de mantenimiento local, transporte local y combustible nacional.

### Paso 3: Verificación contra Umbral de Pliego y Recomendación de Sustituciones
1. Comparar $\text{VAE}_{\text{oferta}}$ vs $\text{VAE}_{\text{mínimo pliego}}$ (ej. umbral exigido: $40.00\%$):
   - Si $\text{VAE}_{\text{oferta}} \ge \text{VAE}_{\text{mínimo pliego}}$: Estado `CUMPLE VAE`. Proceder a emisión de declaración.
   - Si $\text{VAE}_{\text{oferta}} < \text{VAE}_{\text{mínimo pliego}}$: Estado `RIESGO DESCALIFICACIÓN`.
2. En caso de déficit:
   - Identificar insumos importados con mayor peso económico en el presupuesto.
   - Proponer alternativas equivalentes de industria nacional homologadas (ej. reemplazar tubería importada por tubería PVC Rival con sello INEN; utilizar perfiles laminados Novacero en lugar de importados de Brasil).
   - Recalcular de inmediato el nuevo VAE proyectado hasta superar el umbral con un margen de seguridad de al menos $+3.00\%$.

### Paso 4: Generación del Formulario 1.4 de Declaración de VAE
1. Estructurar el Formulario Oficial SERCOP con desglose por rubro y código CPC.
2. Formatear la declaración juramentada de veracidad de la información para firma electrónica del Representante Legal o Procurador Común.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Dashboard VAE con Dial de Precisión:**
   - Visualización del porcentaje VAE mediante un medidor radial o barra progresiva con gradiente de color (Rojo si está por debajo del umbral, Ámbar si está al borde, Esmeralda si cumple cómodamente).
   - Tipografía `--font-display` con tamaño `text-4xl font-extrabold`.
2. **Tabla de Desglose de Insumos con Filtro de Origen:**
   - Selector rápido: `Todos | Nacionales | Importados | Críticos`.
   - Badges de origen con micro-tags distintivos: `[ECUADOR - 100%]` con bandera o acento verde, `[IMPORTADO]` con tono neutro.
3. **Ergonomía:**
   - Botón de sustitución de insumos táctil con altura `min-h-[44px]`.
   - Modales de selección de alternativas de proveedores nacionales con scroll fluido y búsqueda instantánea.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `licitaciones_vae`: Historial de cálculos, umbrales y resultados por proceso.
  - `insumos_cpc`: Diccionario de códigos CPC, origen certificado y fabricantes nacionales registrados.
  - `presupuestos_reales`: Vinculación con los rubros presupuestarios.
- **Eventos del Bus:**
  - **Consume:** `APU_CONSOLIDADO`, `PLIEGO_SERCOP_ANALIZADO`.
  - **Emite:** `VAE_CALCULADO`, `ALERTA_INCUMPLIMIENTO_VAE`.
- **SharedMemory Key:** `sercop:project:<proyectoId>:vae_calculation`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Certificación VAE
```json
{
  "proyectoId": "sara-proj-2026-042",
  "codigoProcesoSERCOP": "MCO-EPMMOP-012-2026",
  "umbralMinimoPliego": 42.50,
  "vaeVersusTotal": 48.72,
  "resultado": "CUMPLE_PLIEGO",
  "margenSeguridad": 6.22,
  "desgloseComponentes": {
    "manoObra": { "montoUSD": 145200.0, "porcentajeVae": 100.0 },
    "materialesNacionales": { "montoUSD": 210400.0, "porcentajeVae": 85.4 },
    "materialesImportados": { "montoUSD": 35800.0, "porcentajeVae": 0.0 },
    "equiposYTransporte": { "montoUSD": 78900.0, "porcentajeVae": 64.2 }
  },
  "insumosSustituidos": [
    {
      "original": "Pintura elastomérica importada",
      "sustituto": "Pintura elastomérica nacional Cóndor/Unidas con sello INEN",
      "incrementoVae": 1.45
    }
  ]
}
```

### 6.2 Reporte Oficial en PDF (Formulario SERCOP 1.4)
- Formato oficial de Declaración de Valor Agregado Ecuatoriano de Obras.
- Matriz completa de códigos CPC, descripciones y porcentajes de desagregación nacional.
- Sello de tiempo y espacio para firma electrónica digital en formato PKCS#7 / PAdES.
