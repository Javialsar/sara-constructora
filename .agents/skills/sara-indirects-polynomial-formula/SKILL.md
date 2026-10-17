---
name: sara-indirects-polynomial-formula
description: >-
  Modelado analítico de costos indirectos de obra y formulación matemática de la Fórmula Polinómica
  de reajuste de precios bajo el estándar del SERCOP y los índices de precios de la construcción del INEC.
---

# sara-indirects-polynomial-formula

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-indirects-polynomial-formula`
- **Unidad de Negocio:** SARA APU & SERCOP Licitaciones
- **Objetivo Estratégico:**
  Estructurar el desglose analítico justificado de costos indirectos de proyectos de construcción pública y privada (campamentos, personal técnico de dirección, ensayos de control de calidad, pólizas de seguro bancarias y utilidad empresarial) y formular con rigor algebraico la **Fórmula Polinómica de Reajuste de Precios** exigida por la LOSNCP, vinculando cada monomio con los índices de precios al consumidor y de la construcción publicados mensualmente por el INEC en Ecuador.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP) - Arts. 126 al 140 del RGLOSNCP:**
   - Obligatoriedad de la fórmula polinómica en contratos de obra pública a precios unitarios de plazo superior a 90 días.
   - Regla de cierre: La suma de los coeficientes de incidencia de los componentes de la fórmula debe ser exactamente igual a la unidad con cinco cifras decimales:
     $$\sum_{j=1}^{n} a_j = 1.00000$$
2. **Instituto Nacional de Estadística y Censos (INEC):**
   - Tablas del Índice de Precios de la Construcción (IPCO) con series históricas para Mano de Obra, Acero, Cemento, Equipo Mecánico Nacional e Importado, Áridos y Materiales Misceláneos.
3. **Contraloría General del Estado del Ecuador:**
   - Normas de control interno para la justificación técnica de gastos administrativos centrales vs gastos indirectos asignables directamente al sitio de obra.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Desglose Analítico de Costos Indirectos
1. Configurar las cinco (5) categorías esenciales de costos indirectos:
   - **1. Dirección Técnica y Administrativa de Obra:** Superintendente, Residente, Topógrafo, Especialista SST, Bodeguero y Planillero.
   - **2. Instalaciones Provisionales y Logística:** Campamento modular, bodegas, cerramiento provisional, acometidas provisionales de agua y energía, servicios higiénicos portátiles.
   - **3. Pólizas y Garantías Contractuales:** Póliza de Buen Uso de Anticipo, Garantía de Fiel Cumplimiento (5% del monto contractual), Seguro de Responsabilidad Civil contra Daños a Terceros y Todo Riesgo Contratista (CAR).
   - **4. Ensayos y Control de Calidad:** Rotura de probetas de hormigón a 7, 14 y 28 días, densidades de campo (Cono de arena / Densímetro nuclear), pruebas de estanqueidad hidrostática.
   - **5. Imprevistos y Utilidad Empresarial:** Porcentaje de imprevistos técnicos (1.5% - 3%) y utilidad bruta proyectada (8% - 15%).
2. Calcular el porcentaje consolidado de indirectos:
   $$\%Ind = \frac{\sum \text{Costos Indirectos en USD}}{\text{Costo Directo Total en USD}} \times 100$$

### Paso 2: Generación de la Fórmula Polinómica SERCOP
1. Analizar el presupuesto total consolidado y agrupar los insumos en familias afines del INEC.
2. Formular la ecuación canónica:
   $$P_r = P_o \times \left( p_1 \frac{B_1}{B_0} + p_2 \frac{C_1}{C_0} + p_3 \frac{D_1}{D_0} + p_4 \frac{E_1}{E_0} + \dots + p_x \frac{X_1}{X_0} \right)$$
   *(Donde $p_1$ representa mano de obra, $p_2$ materiales mayores como acero o cemento, $p_3$ equipo, y $p_x$ el componente no reajustable o anticipo amortizado)*.
3. Verificar que cada coeficiente $p_i \ge 0.05000$ (salvo autorización técnica de pliego) y que:
   $$\sum p_i = 1.00000 \pm 0.00001$$
4. Asignar los códigos oficiales del INEC a cada subíndice ($B, C, D, E$).

### Paso 3: Generación de la Cuadrilla Tipo
1. Extraer todas las categorías laborales del presupuesto y calcular su ponderación relativa respecto a la masa salarial directa total.
2. Formular el sub-monomio de Mano de Obra ($B_1/B_0$) como suma ponderada de los salarios de la cuadrilla tipo.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Tipografía y Matemáticas Editoriales:**
   - Despliegue de la fórmula polinómica formateada en bloques matemáticos elegantes tipo LaTeX con `--font-display` y espaciado generoso.
   - Tarjetas de categorías de indirectos con bordes sutiles y barras de progreso proporcionales a su incidencia sobre el costo total.
2. **Modal Interactivo de Desglose:**
   - Implementado en `IndirectosAnaliticoModal.tsx` con fondo desenfocado `backdrop-blur-xl`.
   - Edición en tiempo real con indicador dinámico de cierre:
     - Si $\sum Coef = 1.00000$: Insignia en verde esmeralda `text-emerald-500 bg-emerald-500/10 border-emerald-500/30`.
     - Si $\sum Coef \ne 1.00000$: Insignia en rojo alerta con diferencial exacto en cinco decimales.
3. **Ergonomía:**
   - Botón de guardado y exportación anclado en la parte inferior con altura mínima táctil de 44px (`h-12`).

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `presupuestos_indirectos`: Almacenamiento paramétrico de cada partida de indirectos.
  - `formulas_polinomicas`: Tabla maestra de monomios, coeficientes y códigos INEC asociados al proyecto.
- **Eventos del Bus:**
  - **Consume:** `APU_CONSOLIDADO`.
  - **Emite:** `INDIRECTOS_APROBADOS`, `FORMULA_POLINOMICA_GENERADA`.
- **SharedMemory Key:** `apu:project:<proyectoId>:polynomial_formula`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de la Fórmula Polinómica
```json
{
  "proyectoId": "sara-proj-2026-042",
  "costoDirectoTotal": 450230.12,
  "costoIndirectoTotal": 99050.62,
  "porcentajeIndirectos": 22.0,
  "formulaPolinomica": {
    "expresionTexto": "Pr = Po * (0.32500*B1/Bo + 0.28400*C1/Co + 0.19100*D1/Do + 0.20000*X1/Xo)",
    "coeficientes": [
      { "simbolo": "B", "nombre": "Mano de Obra", "codigoINEC": "MO-01", "coeficiente": 0.32500 },
      { "simbolo": "C", "nombre": "Acero en Barras", "codigoINEC": "AC-04", "coeficiente": 0.28400 },
      { "simbolo": "D", "nombre": "Equipo de Construcción", "codigoINEC": "EQ-02", "coeficiente": 0.19100 },
      { "simbolo": "X", "nombre": "Anticipo / No Reajustable", "codigoINEC": "NR-00", "coeficiente": 0.20000 }
    ],
    "sumaCoeficientes": 1.00000,
    "esValida": true
  }
}
```

### 6.2 Reporte Oficial en PDF
- Formulario Oficial de Fórmula Polinómica y Cuadrilla Tipo exigido por el SERCOP.
- Tabla comparativa de rubros de indirectos con justificación técnica de dotación de personal.
- Validación de sumatoria unitaria $1.00000$ certificada con sello digital de GRUPO SARA.
