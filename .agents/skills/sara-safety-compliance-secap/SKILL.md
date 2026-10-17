---
name: sara-safety-compliance-secap
description: >-
  Auditoría y control de Seguridad y Salud en el Trabajo (SST), cumplimiento del Reglamento del Seguro General
  de Riesgos del Trabajo del IESS (Resolución CD 513) y acreditación de competencias laborales SECAP en obras de construcción.
---

# sara-safety-compliance-secap

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-safety-compliance-secap`
- **Unidad de Negocio:** SARA Talento Humano & Seguridad Industrial
- **Objetivo Estratégico:**
  Garantizar el cumplimiento estricto de las leyes de seguridad laboral, salud ocupacional y prevención de accidentes en todas las obras activas de GRUPO SARA. Audita las certificaciones de competencias laborales emitidas por el SECAP o institutos reconocidos, controla el registro y entrega obligatoria de Equipos de Protección Personal (EPP), verifica la vigencia del Seguro General de Riesgos del Trabajo del IESS y bloquea el ingreso a obra de operarios no autorizados, blindando al holding frente a responsabilidades solidarias, multas y glosas patronales.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Resolución CD 513 del IESS (Reglamento del Seguro General de Riesgos del Trabajo):**
   - Responsabilidad patronal por accidentes de trabajo o enfermedades profesionales por negligencia en medidas preventivas.
   - Obligatoriedad de afiliación previa y reporte inmediato de siniestros dentro de las 24 horas.
2. **Decreto Ejecutivo 2393 (Reglamento de Seguridad y Salud de los Trabajadores y Mejoramiento del Medio Ambiente de Trabajo):**
   - Normativa técnica para andamios tubulares, excavaciones profundas, trabajos en altura ($> 1.80\,\text{m}$), instalaciones eléctricas provisionales y protección auditiva y respiratoria.
3. **Acuerdos Ministeriales del Ministerio del Trabajo (MDT):**
   - Registro del Plan de Prevención de Riesgos Laborales en la plataforma SUT.
   - Constitución de Comités Paritarios de Seguridad e Higiene del Trabajo en centros con más de 15 trabajadores.
4. **Sistema Nacional de Cualificaciones Profesionales (SECAP / SETEC):**
   - Certificaciones por competencias laborales en Albañilería, Encofrado, Fierrería, Soldadura y Operación de Maquinaria.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Validación Previa al Ingreso de Personal
Antes de permitir el ingreso de cualquier trabajador al recinto de la obra:
1. Validar la vigencia del Certificado de Afiliación al IESS mediante el número de cédula de identidad ecuatoriana.
2. Verificar que no existan glosas pendientes por mora patronal asociadas al trabajador.
3. Consultar las certificaciones laborales registradas:
   - Carnet o certificado SECAP / SETEC en prevención de riesgos de la construcción.
   - Para operadores de maquinaria pesada: Licencia profesional tipo G con vigencia actualizada.
   - Para soldadores: Certificado de calificación de procedimiento (WPS/PQR).

### Paso 2: Protocolo de Entrega de EPP y Registro Biométrico
1. Registrar la dotación completa de Equipo de Protección Personal inicial obligatorio:
   - Casco dieléctrico de alta resistencia Clase E con barboquejo de 3 puntos.
   - Calzado de seguridad con puntera de acero y suela antideslizante con plantilla antipenetración.
   - Chaleco de alta visibilidad con bandas reflectivas normadas (ANSI/ISEA 107).
   - Gafas de policarbonato con protección UV y filtro anti-empañante.
   - Guantes de nitrilo, cuero de descarne o dieléctricos según el rubro.
2. Para actividades en altura ($> 1.80\,\text{m}$): Arnés de cuerpo entero de 4 argollas con línea de vida con absorbedor de impacto e inspección de fecha de vencimiento.
3. Capturar la firma digital o huella dactilar del trabajador en el acta digital de entrega y compromiso de uso.

### Paso 3: Inducción de Seguridad y Permisos de Trabajo de Alto Riesgo (PTAR)
1. Generar la constancia de inducción de seguridad inicial de 30 minutos (riesgo de caídas, atrapamiento en zanjas, contacto eléctrico).
2. Para tareas críticas diarias (excavaciones $\ge 1.50\,\text{m}$, trabajos en caliente con soplete/soldadura, espacios confinados):
   - Exigir al supervisor el diligenciamiento del Permiso de Trabajo de Alto Riesgo (PTAR) con verificación de entibados y extintores vigentes en sitio.
3. Si un operario no cuenta con IESS activo o se detecta sin EPP en la bitácora fotográfica de `SARA Fiscaliza`, revocar inmediatamente el pase de ingreso (*Gate Pass*) y emitir una no conformidad técnica.

---

## 4. Reglas Anti-Plantilla y Estándares de Diseño UI/UX

1. **Dashboard de Seguridad Industrial Visual (Zero Accidents Dashboard):**
   - Contador destacado de "Días sin Accidentes con Tiempo Perdido" en tipografía display grande (`text-5xl font-black text-emerald-600 dark:text-emerald-400 font-display`).
   - Medidor de porcentaje de cumplimiento de EPP e IESS en tiempo real.
2. **Pase Digital de Ingreso (Safety Gate Pass):**
   - Ficha con fotografía del trabajador, código QR de verificación rápida en portería de obra y semáforo de estado:
     - Verde: Habilitado con IESS y EPP completo.
     - Rojo: Inhabilitado / IESS inactivo / Certificado vencido.
3. **Ergonomía:**
   - Escaneo de QR ágil y botones táctiles de autorización de ingreso de al menos `48px` de altura.

---

## 5. Integración con el Ecosistema GRUPO SARA

- **Módulos y Tablas Supabase:**
  - `seguridad_inspecciones`: Reportes diarios de seguridad, incidentes y condiciones inseguras.
  - `seguridad_epp_entregas`: Registro digital de dotación y fechas de recambio de equipos.
  - `seguridad_permisos_trabajo`: Permisos de alto riesgo (PTAR) firmados.
- **Eventos del Bus:**
  - **Consume:** `CONVOCATORIA_TALENTO_EMITIDA`, `TRABAJADOR_POSTULADO`.
  - **Emite:** `SEGURIDAD_TRABAJADOR_HABILITADO`, `ALERTA_CONDICION_INSEGURA`.
- **SharedMemory Key:** `safety:compliance:project:<proyectoId>:worker:<trabajadorId>`

---

## 6. Salidas Esperadas

### 6.1 Estructura JSON de Verificación de Seguridad y Salud
```json
{
  "inspeccionSeguridadId": "sst-chk-2026-302",
  "proyectoId": "sara-proj-2026-042",
  "trabajadorId": "trab-502",
  "nombre": "José Manuel Chimbo",
  "oficio": "Maestro Mayor de Obra",
  "estadoIESS": {
    "afiliacionActiva": true,
    "avisoEntradaFecha": "2026-10-14",
    "sinMoraPatronal": true
  },
  "certificaciones": [
    {
      "institucion": "SECAP",
      "competencia": "Prevención de Riesgos Laborales en Construcción",
      "vigenteHasta": "2027-08-30"
    }
  ],
  "dotacionEPP": {
    "cascoDieléctrico": true,
    "botasPuntaAcero": true,
    "chalecoReflectivo": true,
    "gafasProteccion": true,
    "arnesVerificado": true,
    "actaFirmadaDigitalmente": true
  },
  "permisoTrabajoAltoRiesgo": {
    "aplica": true,
    "tipo": "TRABAJO_EN_ALTURA_LOSA_P4",
    "aprobadoPorSupervisor": true
  },
  "estadoIngreso": "HABILITADO_ACCESO_AUTORIZADO",
  "timestamp": "2026-10-16T15:26:40Z"
}
```

### 6.2 Acta Oficial de Inducción y Entrega de EPP (PDF)
- Membrete institucional con sellos de conformidad de normas de seguridad industrial del Ecuador.
- Cuadro descriptivo de equipos entregados con números de serie y marcas de certificación ANSI / INEN.
- Firma y huella del trabajador más firma del Técnico de Seguridad y Salud Ocupacional.
