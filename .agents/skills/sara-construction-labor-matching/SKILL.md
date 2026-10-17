---
name: sara-construction-labor-matching
description: >-
  Reclutamiento ágil, evaluación y matching de cuadrillas operativas y personal técnico de obra
  (albañiles, fierreros, encofradores, maestros mayores, residentes). Filtra por proximidad geográfica (<15 km)
  para minimizar viáticos y evalúa historial de desempeño en el holding.
---

# sara-construction-labor-matching

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-construction-labor-matching`
- **Unidad de Negocio:** SARA Talento Humano & Cuadrillas de Obra
- **Objetivo Estratégico:**
  Conectar de forma ágil las necesidades de horas-hombre y cuadrillas especializadas surgidas de los presupuestos y cronogramas de obra con la bolsa de trabajadores calificados de `SARA Talento`. Prioriza obreros y técnicos con residencia comprobada en un radio cercano al frente de obra ($\le 15\,\text{km}$) para suprimir costos de viáticos y transporte, filtrando por categoría salarial CICS, experiencia validada en proyectos previos y despachando convocatorias automáticas con confirmación inmediata.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Código del Trabajo del Ecuador:**
   - Contratos de trabajo por obra o servicio determinado dentro del giro del negocio (Art. 16.1).
   - Jornada ordinaria máxima de 40 horas semanales y régimen de horas suplementarias y extraordinarias (recargos del 50% y 100%).
   - Obligación de afiliación al IESS desde el primer día de labores (aviso de entrada en las primeras 24 horas).
2. **Tabla de Salarios Mínimos Sectoriales del Ministerio del Trabajo (Comisión Sectorial de Construcción):**
   - Categorías laborales tipificadas y salarios mínimos legales vigentes en el Ecuador.
3. **Ley de Fomento Productivo y Empleo Local:**
   - En licitaciones públicas SERCOP, cumplimiento obligatorio de cuotas de mano de obra no calificada local (habitualmente $\ge 60\%$ de personal de la zona de influencia del proyecto).

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Extracción de Requerimientos de Personal desde el Presupuesto
1. Recibir del evento `APU_CONSOLIDADO` o del cronograma maestro la matriz de horas-hombre requeridas por especialidad:
   - Peones / Ayudantes.
   - Albañiles de primera y segunda.
   - Fierreros y dobladores de armadura.
   - Carpinteros encofradores.
   - Soldadores calificados 6G / SMAW.
   - Maestros Mayores de Obra.
2. Determinar la fecha de inicio del frente y la dotación semanal óptima para evitar tiempos muertos.

### Paso 2: Filtrado Geográfico y Scoring de Postulantes
1. Consultar la tabla de `trabajadores` y postulantes registrados en `SARA Talento`.
2. Calcular la distancia geodésica (fórmula de Haversine) entre la residencia del obrero y las coordenadas de la obra:
   $$D = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)} \right)$$
   - Filtrar candidatos prioritarios con $D \le 15\,\text{km}$.
3. Computar el **Score del Candidato (0 a 100)**:
   - Historial de desempeño en obras previas de GRUPO SARA (asistencia, puntualidad, calidad técnica): Peso 40%.
   - Proximidad geográfica: Peso 30% ($100$ pts si $D \le 5\,\text{km}$; $70$ pts si $D \le 15\,\text{km}$).
   - Certificaciones SECAP o carnets de prevención de riesgos: Peso 20%.
   - Documentación en regla (cédula ecuatoriana, récord policial limpio, IESS habilitado): Peso 10%.

### Paso 3: Convocatoria Automatizada y Confirmación
1. Seleccionar la terna o nómina requerida.
2. Despachar mensaje transaccional interactivo por WhatsApp a los candidatos seleccionados detallando:
   - Nombre de la obra y dirección exacta.
   - Jornada laboral y salario semanal a percibir (conforme a ley).
   - Botones interactivos de respuesta: `ACEPTAR_PUESTO` o `RECHAZAR`.
3. Al recibir la confirmación positiva, emitir el pre-contrato laboral y notificar a la skill `sara-safety-compliance-secap` para la entrega de EPP y registro del aviso de entrada al IESS.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Tablero de Dotación de Personal (Crew Management):**
   - Tarjetas de obreros con tipografía visual cuidada, fotografía, tag de oficio (`ALBAÑIL`, `FIERRERO`) y medidor de satisfacción de obra previa con estrellas o badges discretos.
   - Indicador de distancia en tiempo real: `A 4.2 km de la obra (12 min en bus)`.
2. **Selector Rápido de Cuadrillas:**
   - Función de arrastrar y soltar (drag & drop) o checklist táctil para armar cuadrillas completas (ej. Cuadrilla de Encofrado: 1 Maestro + 3 Oficiales + 2 Ayudantes) con un solo toque.
3. **Ergonomía Móvil para Capataces y Residentes:**
   - Botón de asistencia rápida con switches táctiles grandes de al menos `44px` de alto por cada operario para el pase de lista matutino.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `trabajadores`: Catálogo de mano de obra, oficios, calificaciones históricas, IESS.
  - `obra_cuadrillas`: Conformación de equipos de trabajo asignados a frentes específicos.
  - `talento_postulaciones`: Convocatorias y respuestas de candidatos.
  - `src/lib/services/talentoService.ts`: Lógica de negocio de matching.
- **Eventos del Bus:**
  - **Consume:** `APU_CONSOLIDADO`, `CRONOGRAMA_OPTIMIZADO`.
  - **Emite:** `CONVOCATORIA_TALENTO_EMITIDA`, `CUADRILLA_OBRA_COMPLETA`.
- **SharedMemory Key:** `talent:project:<proyectoId>:crew_assignment`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Asignación de Mano de Obra
```json
{
  "cuadrillaId": "cdr-est-042-01",
  "proyectoId": "sara-proj-2026-042",
  "fase": "Estructura de Hormigón Armado",
  "totalTrabajadoresAsignados": 8,
  "costoManoObraSemanalUSD": 1420.50,
  "miembros": [
    {
      "trabajadorId": "trab-502",
      "nombre": "José Manuel Chimbo",
      "categoriaCICS": "MAESTRO_MAYOR",
      "distanciaObraKm": 3.8,
      "scoreHistorico": 96.0,
      "salarioSemanalUSD": 235.0,
      "estadoConfirmacion": "CONFIRMADO_WHATSAPP"
    },
    {
      "trabajadorId": "trab-718",
      "nombre": "Luis Alberto Caiza",
      "categoriaCICS": "ALBAÑIL_FIERRERO",
      "distanciaObraKm": 6.1,
      "scoreHistorico": 91.5,
      "salarioSemanalUSD": 182.0,
      "estadoConfirmacion": "CONFIRMADO_WHATSAPP"
    }
  ],
  "cumplimientoManoObraLocalPorcentaje": 87.5
}
```

### 6.2 Nómina Oficial y Rol de Pagos Semanal (PDF)
- Cuadro oficial con detalle de horas ordinarias, suplementarias, fondos de reserva y descuentos IESS (9.45% aporte personal).
- Hoja de firmas para recibo de pago conforme a las auditorías del Ministerio de Trabajo.
