# Standard de Calidad, Arquitectura y Cero Regresiones — GRUPO SARA
# Impulsado por ECC (Everything Claude Code Agent Harness)

> [!IMPORTANT]
> Este archivo de gobernanza técnica aplica para todos los proyectos del GRUPO SARA:
> SARA Constructora, SARA Fletes, SARA Stays, SARA Inmobiliaria, BIM/Takeoff, SERCOP y la suite Zaas (Conductor, Cliente, Tracking y Backend).

---

## 1. Frontend & Fullstack: Next.js 14/15/16 App Router
*(Delegado: `nextjs-app-router-patterns`, `react-patterns`, `frontend-security-coder`)*

1. **Límites Estrictos de Componentes:**
   - Todo componente interactivo que use `useState`, `useEffect`, o eventos de ratón/teclado DEBE llevar `'use client'` al inicio del archivo.
   - Las lecturas pesadas a base de datos deben realizarse en Server Components o Server Actions protegidos.
2. **Seguridad Frontend & Sanitización:**
   - Toda entrada de usuario (nombres de proyectos, actas, observaciones de fletes, descripciones de avances) debe ser sanitizada contra XSS.
   - Prohibido el uso de `dangerouslySetInnerHTML` sin previa desinfección mediante DOMPurify o escape explícito.
3. **Manejo de Estados de Carga e Hidratación:**
   - Prevenir desajustes de hidratación (`hydration mismatch`) verificando el montaje del cliente (`mounted`) antes de renderizar valores dependientes del reloj (`Date.now()`, `toLocaleTimeString()`) o de `localStorage`.

---

## 2. Base de Datos: Supabase / PostgreSQL & Offline-First Dual
*(Delegado: `postgres-patterns`, `database-migrations-sql-migrations`, `accidental-data-loss-prevention`)*

1. **Cero Pérdida de Datos (Arquitectura Dual):**
   - Toda transacción operativa (ingreso al Kardex, calificación de chofer, subida de avance de obra, liquidación contable) debe persistirse de inmediato en Supabase (PostgreSQL) y respaldarse en la capa local para garantizar funcionamiento Offline-First.
2. **Seguridad Estricta en Sentencias SQL:**
   - Prohibido ejecutar sentencias `UPDATE` o `DELETE` sin cláusula `WHERE` explícita y validación de clave primaria o `tenant_id`.
   - Todas las tablas deben contar con políticas RLS (`Row Level Security`) habilitadas para aislar datos entre empresas y clientes del SaaS.
3. **Integridad Referencial y Trazabilidad:**
   - Cada movimiento en Kardex debe tener vinculado su número de orden de compra o vale de despacho.
   - Cada calificación de flete debe registrar el conductor, vehículo, puntaje y fecha/hora exacta.

---

## 3. Logística & Fletes: Sincronización SARA Constructora ↔ SARA Fletes / Zaas
*(Delegado: `sara-heavy-freight-routing`, `sara-backhaul-optimization`, `api-design`)*

1. **Liquidación Inmediata de Fletes:**
   - La autorización de pago emitida por el bodeguero (`APROBADO_PAGO_INMEDIATO`, `RETENCION_PARCIAL`, `BLOQUEADO`) debe notificar tanto a Contabilidad como al estado del viaje en la plataforma de conductores.
2. **Optimización de Retorno (Backhaul):**
   - Siempre que se despache un volquete o plataforma desde obra hacia cantera o bodega central, coordinar flete de retorno para reducir costos logísticos.

---

## 4. Flujo de Entrega: Verificación Continua & Commits
*(Delegado: `verification-loop`, `tdd-workflow`, `code-reviewer`)*

1. Antes de cualquier despliegue a producción en Vercel:
   - Ejecutar verificación de tipos TypeScript: `npx tsc --noEmit`.
   - Ejecutar compilación de producción: `npm run build`.
   - Garantizar que la tasa de persistencia del Agente Auditor sea del 100%.
