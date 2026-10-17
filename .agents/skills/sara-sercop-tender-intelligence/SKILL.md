---
name: sara-sercop-tender-intelligence
description: >-
  Inteligencia y monitoreo estratégico de licitaciones públicas en el portal SERCOP del Ecuador
  (Menor Cuantía, Cotización, Licitación de Obras, Consultoría). Evalúa pliegos, calcula el Score de
  Idoneidad de GRUPO SARA y genera hojas de ruta de plazos perentorios y preguntas técnicas.
---

# sara-sercop-tender-intelligence

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-sercop-tender-intelligence`
- **Unidad de Negocio:** SARA SERCOP & Radar de Licitaciones
- **Objetivo Estratégico:**
  Monitorear de forma autónoma el Sistema Oficial de Contratación Pública del Ecuador (portal SOCE / SERCOP), parsear pliegos y especificaciones técnicas en formato PDF, evaluar la capacidad técnica, patrimonial, de maquinaria y de personal clave de GRUPO SARA frente a los requerimientos de la entidad contratante, y emitir un dictamen cuantitativo de elegibilidad y probabilidad de adjudicación (*Score de Idoneidad*).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP):**
   - Procedimientos de régimen común: Licitación de Obras, Cotización de Obras, Menor Cuantía de Obras, Contratación Integral por Precio Fijo.
   - **Art. 24:** Garantías contractuales admisibles (Bancarias y Pólizas de Seguro Incondicionales, Irrevocables y de Cobro Inmediato).
   - **Art. 62 - 63:** Inhabilidades generales y especiales para contratar con el Estado ecuatoriano.
2. **Codificación de Resoluciones del SERCOP (Resolución RE-SERCOP-2016-0000072 y reformas):**
   - Reglas de convalidación de errores de forma vs errores insubsanables de fondo.
   - Criterios de evaluación técnica: Cumple / No Cumple y puntajes adicionales (Experiencia general y específica, equipo mínimo, personal técnico asignado, metodología de trabajo).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Ingesta y Clasificación de Procesos Licitatorios
1. Capturar los procesos publicados en el radar (`src/app/dashboard/sercop/radar`) o mediante ingestión de pliegos PDF (`/api/tenders/analizar-pliego`).
2. Extraer datos estructurales:
   - Código del Proceso (ej: `MCO-GADMQ-004-2026`).
   - Entidad Contratante, Provincia, Cantón y Tipo de Procedimiento.
   - Presupuesto Referencial sin IVA y porcentaje de Anticipo legal (máximo 50% en obras).
   - Cronograma fatal del proceso: Fecha límite de preguntas, respuestas, entrega de propuestas y convalidación.

### Paso 2: Análisis Multi-Criterio y Cálculo del Score de Idoneidad
Evaluar cinco (5) pilares ponderados (Escala 0 a 100 puntos):
1. **Experiencia Técnica del Holding (Peso 30%):**
   - Comparar los montos de obras similares ejecutadas por GRUPO SARA en los últimos 5 a 10 años frente al monto mínimo requerido en los pliegos (regla habitual: 2 a 3 contratos que sumen al menos el 50% al 100% del presupuesto referencial).
2. **Disponibilidad de Equipo y Maquinaria Mínima (Peso 25%):**
   - Cotejar el inventario activo de `sara-machinery-caterpillar-costing` con los equipos exigidos en pliegos (propios o con compromiso de arriendo notariado).
3. **Personal Técnico y Profesionales Clave (Peso 20%):**
   - Verificar títulos registrados en SENESCYT y certificados de experiencia de Superintendente de Obra y Residente Técnico en la base de `SARA Talento`.
4. **Capacidad Financiera y Patrimonio Técnico (Peso 15%):**
   - Índices financieros obligatorios del SERCOP: Solvencia ($\ge 1.0$), Endeudamiento ($< 0.80$), Patrimonio Neto mínimo.
5. **Ubicación Geográfica y Logística (Peso 10%):**
   - Proximidad a centros operativos o canteras del holding para ventajas competitivas en costos de transporte.

### Paso 3: Emisión del Dictamen y Hoja de Ruta
1. **Score $\ge 85$:** Clasificación `ALTA RECOMENDACIÓN`. Iniciar armado de oferta técnica y económica.
2. **Score 70 - 84:** Clasificación `RECOMENDACIÓN MODERADA`. Identificar brechas (ej. requerir arriendo de una máquina específica o consorcio).
3. **Score $< 70$:** Clasificación `DESCARTAR`. Generar informe de inviabilidad técnica o legal.
4. Generar el cronograma crítico de alertas con recordatorios a 24 horas y 4 horas antes del cierre del término de preguntas y entrega de ofertas.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Panel Radar de Alto Impacto:**
   - Visualización de procesos en tarjetas con acentos cromáticos dinámicos según el Score de Idoneidad.
   - Tipografía `--font-display` para el monto en dólares y el código del proceso en `--font-mono`.
2. **Timeline Crítico Interactivo:**
   - Línea de tiempo visual horizontal con etapas del SERCOP, con badges de estado y tiempo restante con cuenta regresiva.
3. **Ergonomía Móvil:**
   - Botón de descarga de pliegos y activación de postulación con altura táctil generosa `min-h-[48px]`.
   - Modales de análisis de pliegos en móvil convertidos en Bottom Sheets interactivos.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `licitaciones_sercop`: Base de procesos detectados, pliegos, fechas fatales.
  - `licitaciones_evaluaciones`: Puntuaciones de idoneidad, desglose de cumplimiento.
  - `experiencia_holding`: Catálogo de actas de entrega-recepción definitivas para acreditación de experiencia.
- **Eventos del Bus:**
  - **Consume:** `LICITACION_DETECTADA`.
  - **Emite:** `LICITACION_CALIFICADA`, `ALERTAR_TERMINO_PREGUNTAS`.
- **SharedMemory Key:** `sercop:tenders:<codigoProceso>:assessment`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Evaluación de Licitación
```json
{
  "codigoProceso": "MCO-MOP-AZUAY-018-2026",
  "entidadContratante": "Ministerio de Transporte y Obras Públicas",
  "presupuestoReferencialUSD": 890450.0,
  "anticipoPorcentaje": 40.0,
  "plazoDias": 150,
  "scoreIdoneidad": 92.5,
  "veredicto": "ALTA_RECOMENDACION",
  "analisisCriterios": {
    "experienciaTecnica": { "score": 30, "max": 30, "cumple": true },
    "maquinariaMinima": { "score": 25, "max": 25, "cumple": true, "detalles": "Flota propia disponible" },
    "personalTecnico": { "score": 18, "max": 20, "cumple": true, "detalles": "Residente requiere acreditar 1 año más en obras viales" },
    "patrimonioFinanciero": { "score": 15, "max": 15, "cumple": true },
    "ventajaLogistica": { "score": 4.5, "max": 10, "cumple": true, "detalles": "Distancia a cantera: 28 km" }
  },
  "fechasClave": {
    "limitePreguntas": "2026-10-22T17:00:00Z",
    "entregaPropuesta": "2026-10-28T15:00:00Z"
  }
}
```

### 6.2 Reporte Ejecutivo de Postulación (PDF)
- Ficha resumen del proceso SERCOP con código QR directo al portal SOCE.
- Matriz de verificación "Cumple / No Cumple" y preguntas técnicas sugeridas para la etapa de aclaraciones.
- Visto bueno legal y directivo de participación.
