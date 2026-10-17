---
name: sara-evolutionary-yield-tuner
description: >-
  Motor de aprendizaje evolutivo e inteligencia adaptativa para calibración continua de rendimientos y costos de construcción.
  Extrae varianzas entre cómputos teóricos de APU y datos reales de campo en SARA Fiscaliza, refinando el generador de recetas.
---

# sara-evolutionary-yield-tuner

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-evolutionary-yield-tuner`
- **Unidad de Negocio:** SARA Brain / Motor de Aprendizaje Evolutivo
- **Objetivo Estratégico:**
  Cerrar la brecha histórica entre los rendimientos teóricos de gabinete y los rendimientos reales de obra civil en el Ecuador. Extrae, normaliza y compara sistemáticamente las horas-hombre y horas-máquina reales registradas en campo por `SARA Fiscaliza` contra las recetas teóricas de `SARA APU`. Cuando una varianza se consolida estadísticamente a lo largo de múltiples proyectos en una misma provincia o altitud, calibra automáticamente la base de conocimiento evolutivo (`EvolutionaryKnowledge`), optimizando las recetas presupuestarias futuras para ganar licitaciones con márgenes reales garantizados.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Estándares de Ingeniería de Costos AACE International (Práctica Recomendada 18R-97):**
   - Calibración de bases de datos de costos de construcción mediante series temporales y retroalimentación empírica de obras terminadas.
   - Intervalos de confianza y desviación estándar en estimaciones de costos Clase 1 a Clase 5.
2. **Normas de Aseguramiento de la Calidad ISO 9001:2015 (Cláusula 10 - Mejora Continua):**
   - Acciones correctivas y preventivas sistemáticas fundamentadas en datos verificables.
3. **Metodologías de Aprendizaje Estadístico y Filtros de Kalman:**
   - Suavizado exponencial para evitar sobrerreacciones a anomalías temporales o proyectos atípicos individuales.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Extracción de Varianzas al Cierre de Hito o Proyecto
1. Al recibir el evento `PLANILLA_FINAL_CERRADA` o `OBRA_RECEPCION_PROVISIONAL`:
2. Cruzar por cada rubro presupuestado:
   - Rendimiento Teórico de Cuadrilla en APU ($R_{\text{teor}}$ en $\text{horas-hombre}/\text{unidad}$).
   - Horas-Hombre Reales Incurridas en Bitácora ($H_{\text{real}}$) dividido para la Cantidad Real Ejecutada ($Q_{\text{real}}$):
     $$R_{\text{real}} = \frac{H_{\text{real}}}{Q_{\text{real}}}$$
3. Calcular la varianza porcentual de rendimiento ($\Delta R$):
   $$\Delta R = \left( \frac{R_{\text{real}} - R_{\text{teor}}}{R_{\text{teor}}} \right) \times 100$$

### Paso 2: Validación de Significancia Estadística y Filtrado de Anomalías
1. Descartar jornadas con incidentes climáticos extraordinarios reportados por `sara-field-inspection-geolog` (lluvias torrenciales o paros).
2. Consultar el repositorio de muestras históricas en `evolutionary_knowledge` para el rubro, tipología constructiva y provincia correspondiente.
3. Regla de Disparo Evolutivo:
   - Número mínimo de muestras homogéneas: $N \ge 3$ proyectos independientes.
   - Nivel de confianza estadística: Test de hipótesis $t$-Student con $p$-valor $< 0.05$ (Nivel de confianza $> 95\%$).
   - Desviación de tendencia sostenida: $|\Delta R_{\text{promedio}}| \ge 5.0\%$.

### Paso 3: Aplicación del Algoritmo de Calibración Bayesiana
1. Calcular el nuevo valor de rendimiento de cuadrilla recomendado ($R_{\text{nuevo}}$) mediante actualización bayesiana / media móvil ponderada:
   $$R_{\text{nuevo}} = (1 - \alpha) \cdot R_{\text{anterior}} + \alpha \cdot R_{\text{real\_observado}}$$
   *(Donde el factor de aprendizaje $\alpha \in [0.15, 0.25]$ según el tamaño de la muestra)*.
2. Actualizar el registro en la tabla `evolutionary_knowledge` con el nuevo valor y fecha de evolución.
3. Insertar una traza auditada en `evolution_logs` justificando el cambio técnico:
   - Proyecto origen, métrica modificada, varianza detectada y rationale matemático.

### Paso 4: Retroalimentación al Generador de Recetas APU
1. Notificar a `src/lib/apuRecipeGenerator.ts` para que toda nueva formulación presupuestaria en dicha provincia adopte automáticamente el rendimiento calibrado.
2. Disparar el evento `CICLO_APRENDIZAJE_FINALIZADO`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Dashboard de Aprendizaje Evolutivo y Métricas de Inteligencia:**
   - Gráfico de dispersión interactivo (*Scatter Plot*) que muestra los rendimientos de proyectos reales frente a la curva teórica anterior y la nueva curva optimizada.
   - Tarjetas de evolución con insignia de confianza algorítmica (`Nivel de Confianza: 98.4% (p < 0.01)`).
2. **Historial de Mutaciones de Recetas (Evolution Changelog):**
   - Lista cronológica estilizada con diseño editorial: Antes vs Después con tipografía monoespaciada, etiqueta de varianza en verde esmeralda o violeta tecnológico y motivo del ajuste.
3. **Ergonomía:**
   - Botón táctil para "Aceptar Calibración Masiva" con modal de confirmación claro y seguro.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `evolutionary_knowledge`: Almacén maestro de rendimientos aprendidos, conteo de muestras y confianza.
  - `evolution_logs`: Bitácora inmutable de variaciones y justificaciones analíticas.
  - `src/lib/agents/learning-engine.ts`: Motor de aprendizaje evolutivo en TypeScript.
  - `src/lib/apuRecipeGenerator.ts`: Inyección de rendimientos adaptados en recetas nuevas.
- **Eventos del Bus:**
  - **Consume:** `PLANILLA_FINAL_CERRADA`, `BITACORA_OBRA_CONSOLIDADA`.
  - **Emite:** `RENDIMIENTO_EVOLUCIONADO`, `CICLO_APRENDIZAJE_FINALIZADO`.
- **SharedMemory Key:** `learning:yields:<domain>:<entityKey>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Evolución de Rendimiento
```json
{
  "evolucionId": "evo-yd-2026-088",
  "dominio": "apu_yields",
  "rubroCodigo": "EST-015",
  "descripcion": "Hormigón en columnas f'c=280 kg/cm2",
  "contextoGeografico": {
    "provincia": "Azuay",
    "altitudPromedioMsnm": 2550
  },
  "datosAprendizaje": {
    "muestrasAnalizadas": 4,
    "rendimientoAnteriorHorasPorM3": 8.50,
    "rendimientoObservadoPromedio": 7.35,
    "varianzaDetectadaPorcentaje": -13.53,
    "factorAprendizajeAlfa": 0.20,
    "nuevoRendimientoCalibrado": 8.27,
    "nivelConfianzaEstadistica": 0.962
  },
  "justificacionTecnica": "Optimización observada por adopción sistemática de vibradores de alta frecuencia y grúas pluma en obras de Azuay",
  "fechaEvolucion": "2026-10-16T15:29:00Z"
}
```

### 6.2 Reporte Ejecutivo de Evolución Tecnológica (PDF)
- Informe de benchmarking para la Presidencia y Gerencia de Operaciones de GRUPO SARA.
- Curvas comparativas de productividad y reducción de costos directos acumulados.
- Firma del Chief Technology Officer & Skills Architect de GRUPO SARA.
