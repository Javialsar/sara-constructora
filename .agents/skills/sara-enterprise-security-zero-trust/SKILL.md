---
name: sara-enterprise-security-zero-trust
description: >-
  Seguridad Zero-Trust, endurecimiento de Server Actions, API Routes, pasarelas de pago y validaciones criptográficas SRI/UAFE para GRUPO SARA.
  Úsese siempre que se creen o auditen endpoints, acciones de servidor, control de roles (RBAC), sesiones o integraciones financieras.
---

# sara-enterprise-security-zero-trust

## 1. Objetivo de la Skill
Blindar las 8 unidades de negocio de **GRUPO SARA** bajo arquitectura **Zero-Trust**, eliminando vulnerabilidades de escalación de privilegios (`user_metadata` spoofing), ejecución no autenticada de Server Actions con `service_role`, condiciones de carrera (*TOCTOU*) en Kardex/Escrow, falsificación de firmas XAdES-BES del SRI y manipulación de precios en pasarelas de pago.

---

## 2. Reglas Obligatorias de Seguridad e Ingeniería Defensiva

### 2.1 Prohibición de Autorización Basada en `user_metadata`
- En Supabase Auth, `user.user_metadata` es modificable desde el navegador por el propio usuario autenticado (`supabase.auth.updateUser`).
- **Regla estricta:** Todo control de acceso RBAC en [`src/proxy.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/proxy.ts), [`src/lib/auth/moduleGuards.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/auth/moduleGuards.ts) y [`src/lib/auth/professionalAuthGuard.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/auth/professionalAuthGuard.ts) debe validar privilegios desde `user.app_metadata` (solo modificable con `service_role` en backend) o consultando una tabla de roles protegida por RLS en servidor.

### 2.2 Guardián Obligatorio en Server Actions (`"use server"`) y API Routes
- Ninguna función en archivos `"use server"` ([`src/app/admin/accesos/actions.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/app/admin/accesos/actions.ts), [`src/app/actions/papelera.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/app/actions/papelera.ts), etc.) ni ruta en `src/app/api/**` puede instanciar `createAdminClient()` (`SUPABASE_SERVICE_ROLE_KEY`) sin antes verificar criptográficamente la sesión del llamador con `supabase.auth.getUser()` y comprobar su rol y pertenencia al recurso (`tenant_id` / `proyecto_id` / `propietario`).
- **Prohibido** hacer bypass de autenticación solo por la presencia de un header `Authorization` no vacío.
- **Prohibido** dejar secretos dummy de fallback en producción (`whsec_dummy`, `sk_test_dummy`, `sara_bim_dev_2026`).

### 2.3 Transaccionalidad Atómica (Anti-TOCTOU) en Kardex, Avances y Escrow
- Toda transferencia de inventario en [`KardexRepository.transferirStock`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/repositories/saraAdvancedRepositories.ts#L46) o liberación de hitos en Escrow debe ejecutarse mediante transacciones atómicas en PostgreSQL con bloqueo de fila (`SELECT ... FOR UPDATE`), impidiendo saldos negativos o doble gasto (*double-spend*).
- Las actualizaciones de avance físico-financiero ([`src/app/api/fiscaliza/reporte-diario/route.ts`](file:///d:/SaS_Proyectos/sara-constructora/src/app/api/fiscaliza/reporte-diario/route.ts)) deben ser **idempotentes**, recalculando el acumulado por agregación (`SUM`) y nunca sumando ciegamente sobre el valor previo en cada `POST`.

### 2.4 Validación Tributaria SRI (Módulo 11 + XAdES-BES) y UAFE
- En [`SriXmlService`](file:///d:/SaS_Proyectos/sara-constructora/src/lib/services/sriXmlService.ts), además del bloqueo anti-XXE (`<!DOCTYPE>`, `<!ENTITY>`), se debe eliminar cualquier comentario XML antes de extraer tags, verificar matemáticamente el dígito verificador **Módulo 11** (dígito 49 de la `claveAcceso`) y validar la firma electrónica XAdES-BES antes de mutar precios en `VectorKnowledgeService`.
- Toda transacción o constitución de fideicomiso Escrow $\ge \$10,000.00\,\text{USD}$ debe activar automáticamente el protocolo de debida diligencia y bandera de reporte **RESU ante la UAFE**.
