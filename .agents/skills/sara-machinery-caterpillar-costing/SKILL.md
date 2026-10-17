---
name: sara-machinery-caterpillar-costing
description: >-
  Cálculo analítico del costo horario de posesión y operación de maquinaria pesada
  (retroexcavadoras, motoniveladoras, rodillos, cargadoras, tractores, volquetas)
  bajo el estándar Caterpillar Performance Handbook y la metodología oficial MOP/MTOP del Ecuador.
---

# sara-machinery-caterpillar-costing

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-machinery-caterpillar-costing`
- **Unidad de Negocio:** SARA Constructora / Parque de Maquinaria Amarilla
- **Objetivo Estratégico:**
  Computar de forma rigurosa y matemáticamente auditable el costo horario neto (USD/hora) de posesión y de operación de cada unidad del parque de maquinaria de GRUPO SARA, integrando factores de combustible diésel subsidiado/liberalizado en Ecuador, depreciación financiera, costo de neumáticos o tren de rodaje, mantenimiento preventivo programado y remuneración del operador certificado. Alimenta directamente el componente "Equipo" de los análisis de precios unitarios (APU).

---

## 2. Marco Normativo y Estándares Aplicables

1. **Caterpillar Performance Handbook (Edición 49+):**
   - Factores de consumo de combustible según factor de carga del motor (Bajo, Medio, Alto).
   - Vida útil de componentes de desgaste, neumáticos y elementos de corte (*Ground Engaging Tools - GET*).
2. **Metodología MOP-001-F / MTOP del Ecuador:**
   - Fórmula oficial de costo horario para licitaciones públicas de obras viales y civiles en el SERCOP.
   - Tasas de interés de capital aplicables (Tasa Activa Referencial del Banco Central del Ecuador - BCE).
3. **Regulaciones del Ministerio de Energía y Minas / EP Petroecuador:**
   - Precios vigentes por galón de Diésel automotriz / Diésel 2 y Diésel Premium en terminal y estación de servicio.
4. **Tabla de Salarios Mínimos Sectoriales del Ministerio de Trabajo:**
   - Categorías: Operador de Maquinaria Pesada I, II y Chofer Profesional Tipo E, con factor de beneficios sociales de ley en Ecuador.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Extracción de Parámetros Técnicos y Financieros
1. Obtener la ficha técnica de la máquina desde `maquinaria`:
   - Valor de Adquisición Inicial ($Va$ en USD).
   - Potencia nominal al volante ($HP$).
   - Vida útil económica estimada en años ($N$) y horas anuales de trabajo ($H_a$, típicamente 1.500 a 2.000 h/año).
   - Valor de Rescate o Reventa ($Vr$, habitualmente 10% a 20% del $Va$).
   - Vida útil del tren de rodaje o juego de neumáticos ($H_{neu}$).
   - Costo del juego de neumáticos o tren de rodaje ($V_{neu}$).

### Paso 2: Cálculo del Costo Horario Fijo de Posesión ($C_p$)
1. **Depreciación Neta Horaria ($D_h$):**
   $$D_h = \frac{(Va - V_{neu}) - Vr}{N \times H_a}$$
2. **Interés del Capital Invertido ($I_h$):**
   $$I_h = \frac{Va \times i \times (N + 1)}{2 \times N \times H_a}$$
   *(Donde $i$ es la tasa de interés anual bancaria activa del BCE)*.
3. **Seguros y Custodia / Bodegaje ($S_h$):**
   $$S_h = \frac{Va \times (s + g) \times (N + 1)}{2 \times N \times H_a}$$
   *(Donde $s$ es la prima de seguro, ej. 2.5%, y $g$ es costo de parqueo/garantía, ej. 1.0%)*.
4. **Costo Total de Posesión:** $C_p = D_h + I_h + S_h$.

### Paso 3: Cálculo del Costo Horario Variable de Operación ($C_o$)
1. **Consumo de Combustible Diésel ($C_{comb}$):**
   $$q = HP \times f_c \times c_e$$
   *(Donde $f_c$ es el factor de carga [0.30 liviano, 0.50 mediano, 0.70 severo] y $c_e \approx 0.040\,\text{galones}/(HP \cdot h)$)*.
   $$C_{comb} = q \times P_{\text{galón diésel}}$$
2. **Lubricantes, Filtros y Grasas ($C_{lub}$):**
   $$C_{lub} = (0.20 \text{ a } 0.35) \times C_{comb}$$
3. **Neumáticos o Tren de Rodaje ($C_{rod}$):**
   $$C_{rod} = \frac{V_{neu}}{H_{neu}}$$
4. **Reparaciones y Mantenimiento Mayor ($C_{rep}$):**
   $$C_{rep} = k_{rep} \times D_h \quad (k_{rep} \in [0.60, 0.90] \text{ según agresividad del terreno})$$
5. **Costo de Operador Calificado ($C_{ope}$):**
   $$C_{ope} = \frac{\text{Salario Mensual Nominal} \times \text{Factor de Beneficios Sociales (1.435)}}{160\,\text{horas/mes}}$$
6. **Costo Total de Operación:** $C_o = C_{comb} + C_{lub} + C_{rod} + C_{rep} + C_{ope}$.

### Paso 4: Consolidación e Inyección en Base de Datos
1. Calcular el Costo Horario Total: $C_h = C_p + C_o$.
2. Comparar el $C_h$ obtenido con los tarifarios de referencia de la Cámara de la Construcción y del MTOP.
3. Si el precio del combustible sufre un ajuste oficial, disparar un recálculo por lotes de toda la flota e inyectar el nuevo valor en la tabla `insumos_equipo` de `SARA APU`.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Jerarquía Tipográfica y Métrica:**
   - La cifra principal ($USD/hora$) debe desplegarse como un número titánico (`text-4xl md:text-5xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 font-display`).
   - El desglose Posesión vs Operación debe utilizar un gráfico de barra segmentada con proporciones relativas y micro-detalles en `--font-sans` (`text-xs text-slate-500 font-medium`).
2. **Ergonomía Móvil para Jefes de Taller:**
   - Selector táctil de máquinas con tarjetas de ficha técnica en scroll vertical, altura de botón de calibración `min-h-[48px]`.
   - Sliders de ajuste de factor de carga con respuesta háptica y zonas táctiles de al menos `44x44px`.
3. **Acabado y Paleta Visual:**
   - Fondo de tarjeta con gradiente sutil y borde `border-slate-200/80 dark:border-slate-800`.
   - Iconografía de maquinaria en acento ocre/amarillo industrial (`text-amber-500 bg-amber-500/10 p-2.5 rounded-xl`).

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Tablas Supabase Involucradas:**
  - `maquinaria`: Catálogo de flota, odómetro, horómetro, estado de mantenimiento.
  - `maquinaria_costos_horarios`: Registro histórico de costos de posesión y operación calculados.
  - `insumos_apu`: Actualización automática de la columna `costo_unitario` donde `tipo = 'EQUIPO'`.
- **Eventos del Bus:**
  - **Consume:** `PRECIO_COMBUSTIBLE_ACTUALIZADO`, `MANTENIMIENTO_MAQUINARIA_REGISTRADO`.
  - **Emite:** `COSTO_HORARIO_EQUIPO_CALCULADO`, `ALERTA_SOBRECONSUMO_COMBUSTIBLE`.
- **SharedMemory Key:** `machinery:hourly_rate:<maquinaId>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON del Costo Horario de Maquinaria
```json
{
  "equipoId": "CAT-320D-01",
  "descripcion": "Excavadora Oruga Caterpillar 320D 148 HP",
  "parametrosEntrada": {
    "valorAdquisicionUSD": 165000.0,
    "potenciaHP": 148,
    "factorCarga": "MEDIO",
    "precioGalonDiesel": 1.75,
    "horasAnuales": 1800,
    "vidaUtilAnios": 6
  },
  "costoPosesionHorarioUSD": {
    "depreciacion": 12.73,
    "interesCapital": 4.12,
    "segurosYGaraje": 1.84,
    "subtotalPosesion": 18.69
  },
  "costoOperacionHorarioUSD": {
    "combustible": 5.18,
    "lubricantesFiltros": 1.55,
    "trenRodajeGET": 3.80,
    "mantenimientoReparaciones": 8.91,
    "operadorCertificado": 5.85,
    "subtotalOperacion": 25.29
  },
  "costoHorarioTotalUSD": 43.98,
  "fechaCalculo": "2026-10-16T15:22:00Z"
}
```

### 6.2 Reporte Oficial de Análisis de Costo Horario (PDF)
- Membrete institucional oficial GRUPO SARA.
- Hoja de cálculo analítica detallando las fórmulas Caterpillar / MTOP.
- Tabla de insumos de lubricantes y repuestos homologados por fabricante.
- Código de verificación criptográfica sha256 y firma del Ingeniero Mecánico / Jefe de Equipos.
