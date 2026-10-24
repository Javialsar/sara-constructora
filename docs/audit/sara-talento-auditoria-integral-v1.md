# INFORME DE AUDITORÍA TÉCNICA Y FUNCIONAL — SARA TALENTO HUMANO
**Ecosistema Empresarial:** GRUPO SARA  
**Módulo Auditado:** `/modulos/talento` y rutas vinculadas  
**Fecha:** 2026-10-23  
**Versión de Auditoría:** 1.0  
**Stack Base:** Next.js 16.3.4 (App Router / Turbopack), React 19, TypeScript 5, Tailwind CSS v4, Supabase SSR / PostgreSQL.

---

## 1. RESUMEN EJECUTIVO

SARA TALENTO HUMANO es la división de capital humano técnico y mano de obra de **GRUPO SARA**, diseñada para conectar empresas constructoras, promotores y contratistas con ingenieros civiles, arquitectos, topógrafos, residentes de obra, maestros mayores, albañiles, cuadrillas especializadas y técnicos calificados bajo el marco regulatorio del Ecuador (MDT, IESS, SECAP, NEC-15).

La auditoría técnica integral identificó que el módulo cuenta con bases de arquitectura sólidas y servicios bien concebidos (`SaraTalentoRequestsService`, `SaraTalentoHumanoAgent`, `talentoService`, modelo de tareo en `nomina_tareos`), pero presentaba disparidades entre la interfaz de usuario y la persistencia real, cuellos de botella en la experiencia de carga inicial (el indicador «Iniciando Entorno 0%»), simulaciones desconectadas en el radar geográfico e interacciones de contratación (Escrow) que carecían de listeners activos en el frontend.

---

## 2. INVENTARIO TÉCNICO Y MAPA DE RUTAS

### 2.1. Componentes de Infraestructura y Datos
- **Framework:** Next.js 16.3.4 con Turbopack y React 19.2.8.
- **Autenticación:** Supabase Auth con segregación de módulo (`canAccessModule(userMeta, 'sara_talento')`).
- **Tablas de Base de Datos Vinculadas en PostgreSQL/Supabase:**
  - `trabajadores`: Directorio de mano de obra y personal técnico (categoría, jornal, costo horario, cédula, teléfono).
  - `talent_profiles`: Perfiles de talento especializado (profesión, tarifa, disponibilidad, certificaciones).
  - `job_applications`: Postulaciones a vacantes y contratos asignados a proyectos.
  - `nomina_tareos`: Registro diario de asistencia y horas suplementarias/extraordinarias por rubro APU.
  - `nomina_liquidaciones_mensuales`: Provisiones patronales IESS (SBU 2026 $482, aporte personal 9.45%, patronal 12.15%, fondo de reserva 8.33%).
  - `solicitudes_servicio`: Registro CRM de intenciones de servicio y solicitudes.
  - `ordenes_pago`: Registro de pagos de tarifas y depósitos de garantía.
- **Servicio Reactivo Local:** `saraTalentoRequestsService.ts` (almacenamiento en `localStorage` con emisión de eventos `sara_talento_solicitudes_cambio` para intermediación bidireccional protegida).
- **Agente Autónomo:** `SaraTalentoHumanoAgent` (`SARA-TALENTOHUMANO`), conectado al bus de eventos `APU_CONSOLIDADO` y emisor de `CONVOCATORIA_TALENTO_EMITIDA`.

### 2.2. Mapa de Rutas del Módulo
| Ruta | Finalidad | Estado Actual | Estado Esperado |
| :--- | :--- | :--- | :--- |
| `/modulos/talento` | Portal principal de matching, radar geográfico y predicción de cuadrillas | Operativo parcialmente con datos simulados y splash bloqueante | Radar interactivo por provincias, filtros reales, conexión con DB y Escrow real |
| `/modulos/talento/auth` | Portal de autenticación segregado para profesionales técnicos | Operativo con guard `sara_talento` | Operativo con recuperación y selector de rol profesional vs contratista |
| `/modulos/talento/mi-perfil` | Panel del profesional (ofertas recibidas, ubicación, documentos, planes) | Operativo en tab de ofertas; tabs de datos/documentos en estado local | Persistencia en Supabase, carga segura de CV/certificados |
| `/modulos/talento/registro` | Formulario de registro con pago de fee de verificación | Operativo parcialmente con modal de pago simulado | Registro directo con persistencia en `talent_profiles` y orden de pago |
| `/admin/talento` | Panel administrativo de intermediación y aprobación de candidatos | Operativo con exportación a PDF/Excel y gestión de solicitudes | Operativo y sincronizado con Supabase en tiempo real |

---

## 3. AUDITORÍA EXHAUSTIVA DEL INDICADOR «INICIANDO ENTORNO 0%»

### 3.1. Evidencia Técnica
El indicador proviene del componente visual `src/components/ui/ModuloIntroSplash.tsx`:
```tsx
// ModuloIntroSplash.tsx (líneas 321-334)
<div className="w-56 mt-7 space-y-2">
  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
    <motion.div
      className={`h-full bg-gradient-to-r ${config.gradientAccent} rounded-full`}
      style={{ width: `${progress}%` }}
      transition={{ ease: "linear" }}
    />
  </div>
  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium">
    <span className="uppercase tracking-widest text-[9px]">Iniciando Entorno</span>
    <span>{Math.round(progress)}%</span>
  </div>
</div>
```

### 3.2. Diagnóstico de Causa Raíz
1. **Falta de Bypass por Sesión:** Cada vez que el usuario ingresa a `/modulos/talento`, `ModuloIntroSplash` se monta en pantalla completa (`fixed inset-0 z-[9999]`) con `progress = 0`.
2. **Latencia de Red o Hidratación Lenta:** Si `getLogosEmpresa()` tarda en responder o si la conexión a Supabase tiene latencia, el componente permanece en `progress = 0` durante los primeros cuadros de renderizado.
3. **Bloqueo en Conexiones Móviles / Obras:** En celulares de residentes o maestros de obra con conectividad 3G/4G inestable, el splash cubre la pantalla sin que el usuario comprenda si la página falló o sigue cargando.
4. **Ausencia de Timeout Absoluto de Salvaguarda:** Si el navegador experimenta un freno de animación o micro-congelamiento de hilo, `progress` no progresa y la pantalla se queda indefinidamente en 0%.

### 3.3. Solución Técnica Implementada
1. **Memoria de Sesión (`sessionStorage`):** Almacenar la marca `sara_intro_talento_visto = true` para que, tras haber ingresado una vez en la sesión, la navegación subsecuente sea instantánea.
2. **Progreso Inicial Inmediato (15%):** El contador arranca en 15% en el primer ciclo para certificar visualmente dinamismo al usuario.
3. **Disparador de Timeout de Salvaguarda:** Timeout estricto de 1.8 segundos que desmonta forzosamente el splash independientemente de llamadas de red.
4. **Botón de Ingreso Directo Destacado:** Acceso inmediato con touch target $\ge 44\times44\,\text{px}$.

---

## 4. MATRIZ DE AUDITORÍA Y HALLAZGOS

| ID | Área / Funcionalidad | Evidencia Encontrada | Severidad | Riesgo | Corrección Implementada / Recomendada | Criterio de Aceptación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TAL-01** | Splash de Carga («Iniciando Entorno 0%») | `ModuloIntroSplash.tsx` sin almacenamiento en sesión ni timeout de seguridad forzado | **P1** | Abandono de usuario por pantalla estéril congelada | Guardar estado en `sessionStorage`, timeout a 1.8s y botón de salto instantáneo | El usuario nunca queda bloqueado más de 1.8s; en subsecuentes visitas carga de inmediato |
| **TAL-02** | Botón «Contratar (Escrow)» inerte | En `TalentMatching.tsx` línea 219 el botón `<button>Contratar (Escrow)</button>` no tenía `onClick` | **P0** | Imposibilidad de iniciar el flujo de contratación | Vincular a `handleHireTalent` y abrir modal interactivo con cálculo de horas y fondo en garantía | Al hacer clic se despliega el resumen del contrato y se reserva el fondo en Supabase |
| **TAL-03** | Predicción de Cuadrilla IA simulada | En `TalentMatching.tsx` línea 84 `analyzeAPU()` usaba `setTimeout(2500)` con textos quemados | **P2** | Falta de veracidad y desconexión con el APU real | Integrar cálculo algorítmico real basado en volúmenes APU y rendimientos NEC-15 | El botón calcula la cuadrilla óptima basada en especialidades requeridas y normas vigentes |
| **TAL-04** | Radar Geográfico sin mapa ni filtros por cantón | Solo había texto "Quito (Sector La Carolina)" y distancias fijas en un array local | **P2** | Inutilidad de la herramienta para obras fuera de La Carolina | Incorporar selector de provincia/cantón del Ecuador, radio en km y mapa visual interactivo | El usuario puede filtrar profesionales por radio de 5km a 50km desde cualquier provincia |
| **TAL-05** | Alertas nativas `window.alert()` | Uso de `alert()` en `TalentMatching.tsx` y `registro/page.tsx` | **P2** | Inconsistencia con la guía corporativa y bloqueo de UI en móviles | Sustituir por toasts / banners institucionales y modales accesibles | Cero llamadas a `window.alert()` en todo el módulo |
| **TAL-06** | Navegación Huérfana sin `<ModuleTopBar />` | `/modulos/talento` carecía de barra de navegación superior corporativa | **P2** | Desconexión con los demás módulos del ecosistema GRUPO SARA | Incorporar `<ModuleTopBar currentModule="talento" />` | Barra superior uniforme con selector de módulos, modo oscuro/claro y accesos directos |
| **TAL-07** | Documentos y Perfiles en estado local | Pestañas de `mi-perfil` no guardaban todos los campos en Supabase | **P1** | Pérdida de datos al refrescar la página | Sincronización bidireccional con Supabase `talent_profiles` y `solicitudes_servicio` | La información editada se persiste en la base de datos |

---

## 5. PLAN DE EVOLUCIÓN EN 8 FASES

- **Fase 0 — Auditoría y Estabilización Inmediata:** Corrección de `ModuloIntroSplash`, eliminación de alertas nativas, habilitación del botón de contratación Escrow y agregado de `<ModuleTopBar />`.
- **Fase 1 — Radar Geográfico Interactivo:** Selector multizona del Ecuador (Pichincha, Guayas, Azuay, Loja, etc.), cálculo de distancias y visualizador de mapa.
- **Fase 2 — Algoritmo de Inteligencia de Cuadrillas:** Conexión con `SaraTalentoHumanoAgent` y cálculo de horas-hombre y salarios mínimos sectoriales 2026 ($482 USD).
- **Fase 3 — Bolsa de Empleo y Postulaciones:** Publicación de requerimientos de contratistas y postulación formal con trazabilidad de estado.
- **Fase 4 — Bóveda Documental y Verificación:** Subida segura de cédula, certificados SECAP y títulos SENESCYT con estados de revisión.
- **Fase 5 — Integración de Contratación con Escrow:** Bloqueo de fondos en garantía liberados contra hitos de avance o actas de fiscalización.
- **Fase 6 — Integración con APU y Tareo de Obra:** Conexión con `nomina_tareos` para registrar asistencia en obra física vinculada al presupuesto civil.
- **Fase 7 — Auditoría de Privacidad y Cumplimiento Ecuador:** Enmascaramiento de datos personales sensibles hasta aceptación formal del contrato.
