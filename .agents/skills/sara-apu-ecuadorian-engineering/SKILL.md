---
name: sara-apu-ecuadorian-engineering
description: >-
  Motor analítico de ingeniería de costos y análisis de precios unitarios (APU)
  calibrado para las 24 provincias del Ecuador. Integra tablas salariales sectoriales CICS/IESS,
  factores bioclimáticos de rendimiento (Sierra, Costa, Amazonía) y generación de anexos SERCOP oficiales.
---

# sara-apu-ecuadorian-engineering

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-apu-ecuadorian-engineering`
- **Unidad de Negocio:** SARA APU & Presupuestos Reales
- **Objetivo Estratégico:**
  Generar, auditar y calibrar los Análisis de Precios Unitarios (APU) de cada rubro de obra con rigor de ingeniería de costos, desglosando con precisión los cuatro (4) componentes elementales: **Equipos**, **Mano de Obra**, **Materiales** y **Transporte**. Ajusta automáticamente los rendimientos de cuadrilla en función de la localización geográfica/altitud y garantiza el estricto cumplimiento de los formatos oficiales exigidos por el SERCOP en el Ecuador.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ley Orgánica del Sistema Nacional de Contratación Pública (LOSNCP):**
   - Modelos de pliegos obligatorios de obras y servicios del SERCOP (Formulario 1.3: Tabla de Cantidades y Precios Unitarios).
   - Prohibición de precios predatorios o distorsión de costos directos vs indirectos.
2. **Tabla Sectorial de la Construcción (CICS) - Ministerio del Trabajo del Ecuador:**
   - Categorías ocupacionales: Peón, Albañil / Fierrero / Encofrador, Maestro Mayor de Obra, Operador de Equipo Pesado.
   - Cálculo del Factor de Salario Real ($FSR$), que incorpora decimotercero, decimocuarto, fondos de reserva, aporte patronal al IESS (12.15%), ropa de trabajo y vacaciones:
     $$FSR = \frac{\text{Costo Anual Total Real}}{\text{Días Efectivamente Laborados} \times 8\,\text{horas}}$$
     *(En Ecuador, el factor multiplicador oscila habitualmente entre $1.40$ y $1.48$ sobre el salario básico unificado sectorial)*.
3. **Cámaras de la Construcción de Quito y Guayaquil:**
   - Rendimientos base de referencia para rubros estándar de edificación y vialidad.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Estructuración Canónica del Rubro APU
Al recibir una solicitud de creación o edición de rubro:
1. Validar la unidad de medida estándar SERCOP (`m3`, `m2`, `m`, `kg`, `u`, `gbl`, `pto`).
2. Desglosar las cuatro subtablas de costos directos:
   - **A. Equipos y Herramientas:** Máquinas principales con su costo horario y rendimiento ($h/\text{unidad}$), más el porcentaje legal de Herramienta Menor (habitualmente 3% a 5% del costo de mano de obra).
   - **B. Mano de Obra:** Cuadrilla tipo asignada con categoría salarial IESS, costo horario real ($USD/h$) y rendimiento de cuadrilla ($h/\text{unidad}$).
   - **C. Materiales:** Lista de insumos puestos en obra, unidad comercial, cantidad unitaria con factor de desperdicio técnico (ej. hormigones 5%, acero corrugado 8%, pintura 10%) y precio unitario sin IVA.
   - **D. Transporte:** Fletes de materiales áridos o industriales desde cantera/bodega hasta el pie de obra ($USD/m^3 \cdot km$ o $USD/ton \cdot km$).

### Paso 2: Factor de Ajuste Bioclimático y Geográfico ($F_{geo}$)
1. Identificar la provincia y cantón del proyecto:
   - **Sierra Alta (> 2.800 msnm):** Aplicar factor $F_{geo} = 0.90$ al rendimiento de mano de obra y combustión de motores atmosféricos (10% de menor avance por rarefacción de oxígeno y bajas temperaturas).
   - **Costa Húmeda / Calor Extremo (> 32°C):** Aplicar factor $F_{geo} = 0.95$ con ajuste en jornadas vespertinas por fatiga térmica e hidratación obligatoria.
   - **Amazonía / Alta Pluviosidad:** Aplicar factor $F_{geo} = 0.85$ debido a interrupciones por precipitaciones torrenciales y suelos arcillosos saturados.
2. Rendimiento efectivo ajustado:
   $$R_{\text{efectivo}} = R_{\text{base}} \times F_{geo}$$

### Paso 3: Consolidación del Costo Directo y Aplicación de Indirectos
1. Computar:
   $$\text{Costo Directo } (CD) = \sum \text{Equipos} + \sum \text{Mano de Obra} + \sum \text{Materiales} + \sum \text{Transporte}$$
2. Aplicar el porcentaje de Indirectos y Utilidad ($%Ind$) determinado por la skill `sara-indirects-polynomial-formula`:
   $$\text{Precio Unitario Final } (PU) = CD \times \left(1 + \frac{\%Ind}{100}\right)$$
3. Redondear el precio unitario a dos cifras decimales según estándar bancario y SERCOP.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Jerarquía Tipográfica Editorial en Tablas APU:**
   - Encabezado de rubro en `--font-display` (`Plus Jakarta Sans`), con código de especificación en tag de alto contraste (`font-mono text-xs bg-slate-900 text-emerald-400 px-2 py-1 rounded`).
   - Tablas de insumos con números tabulares (`font-mono tabular-nums`), alineación derecha estricta para cantidades y precios, evitando desajustes visuales.
2. **Slide-Over Interactivo de Edición Profunda:**
   - Panel lateral desplegable con fondo `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl` con borde izquierdo sutil `border-l border-slate-900/10 dark:border-white/10`.
   - Modificación instantánea de insumos con cálculo reactivo sin recargar la pantalla.
3. **Ergonomía Táctil en Tablet y Móvil:**
   - Botón de agregar insumo con área de contacto `min-h-[44px] min-w-[44px]`.
   - Inputs numéricos con teclado virtual adecuado (`inputmode="decimal"`).

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `presupuesto_rubros`: Almacén de rubros vinculados a cada proyecto.
  - `insumos_materiales`, `insumos_mano_obra`, `insumos_equipo`: Catálogo maestro unificado.
  - `src/lib/apuRecipeGenerator.ts`: Invocación del motor algorítmico de recetas paramétricas.
- **Eventos del Bus:**
  - **Consume:** `PROYECTO_CREADO`, `CÓMPUTOS_TAKEOFF_CALCULADOS`.
  - **Emite:** `APU_CONSOLIDADO`, `PRESUPUESTO_FINALIZADO`.
- **SharedMemory Key:** `apu:project:<proyectoId>:rubro:<rubroId>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON del Rubro APU
```json
{
  "rubroCodigo": "EST-022",
  "descripcion": "Hormigón simple f'c=210 kg/cm2 en vigas y columnas (incluye encofrado)",
  "unidad": "m3",
  "cantidad": 45.5,
  "costoDirecto": {
    "equipos": 12.45,
    "manoObra": 34.80,
    "materiales": 68.30,
    "transporte": 3.20,
    "subtotalDirecto": 118.75
  },
  "porcentajeIndirectos": 22.0,
  "valorIndirectos": 26.13,
  "precioUnitario": 144.88,
  "precioTotal": 6592.04,
  "normaAplicable": "NEC-SE-HM / SERCOP",
  "ajusteGeografico": {
    "provincia": "Pichincha",
    "factorRendimiento": 0.90
  }
}
```

### 6.2 Reporte Oficial en PDF (Formato SERCOP)
- Encabezado con logotipo vectorizado institucional de GRUPO SARA.
- Formulario estándar 1.3 con desglose de cuadrilla y rendimientos por jornada de 8 horas.
- Nota de responsabilidad técnica y firma del Ingeniero Calculista de Costos de GRUPO SARA.
