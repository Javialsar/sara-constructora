---
name: vercel-deployment-orchestrator
description: >-
  Especialista en ciclo de vida CI/CD, control de versiones Git y despliegue automatizado en Vercel para SARA Constructora.
  Ejecuta pre-vuelos estáticos (tsc, lint, build), empaquetado atómico de commits semánticos y despliegues productivos con verificación de dominios y variables de entorno.
---

# vercel-deployment-orchestrator

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `vercel-deployment-orchestrator`
- **Dominio:** DevOps, CI/CD, Git Ops & Cloud Edge Deployment (Vercel)
- **Misión:** 
  Garantizar un pipeline infalible de integración y despliegue continuo (CI/CD) para el ecosistema de GRUPO SARA. Asegura que ningún commit sea aplicado sin verificación estática previa y que el despliegue a producción en Vercel se realice con trazabilidad, cero downtime y validación de endpoints y dominios canónicos.

---

## 2. Flujo Operativo Paso a Paso

### Paso 1: Pre-Flight Check de Integridad Estática
Antes de modificar Git o invocar el motor de Vercel, ejecutar obligatoriamente:
1. Verificación de tipos TypeScript:
   ```powershell
   npx tsc --noEmit
   ```
2. Build local de verificación (detección temprana de fugas Server/Client, variables o imports rotos):
   ```powershell
   npm run build
   ```
> [!IMPORTANT]
> Si cualquiera de estas dos etapas falla (código de salida $\ne 0$), el proceso **debe abortarse de inmediato** y reportar el error exacto antes de contaminar el árbol de Git o romper el pipeline en la nube.

---

### Paso 2: Versionado y Commit Semántico (Conventional Commits)
1. Inspeccionar cambios pendientes:
   ```powershell
   git status
   ```
2. Agregar únicamente archivos correspondientes a la funcionalidad o hotfix:
   ```powershell
   git add .
   ```
3. Formular el mensaje siguiendo el estándar de **Conventional Commits**:
   - `feat(modulo): descripción clara y profesional`
   - `fix(modulo): corrección de bug`
   - `perf(modulo): mejora de rendimiento`
   - `refactor(modulo): refactorización interna`
   - `docs(modulo): actualización documental`

---

### Paso 3: Despliegue Automatizado en Vercel
1. Verificar estado de autenticación de Vercel CLI:
   ```powershell
   vercel whoami
   ```
2. Si el proyecto ya cuenta con enlace (`.vercel/project.json`):
   - **Despliegue a Producción:**
     ```powershell
     vercel deploy --prod
     ```
   - **Despliegue a Preview (Staging/Branch):**
     ```powershell
     vercel deploy
     ```
3. Monitorear el stream de logs hasta obtener la URL definitiva de inspección (`Inspect: ...`) y la URL de producción (`https://...vercel.app` o dominio corporativo configurado).

---

### Paso 4: Smoke Test Post-Despliegue
1. Realizar una petición HTTP superficial a la URL de producción o a las rutas críticas recién modificadas:
   - `/`
   - `/constructora`
   - `/constructora/suite`
   - `/api/v1/compras/parse-xml` (Health check)
2. Validar que no existan códigos 500 (Internal Server Error) o 404 inesperados.

---

## 3. Matriz de Errores Comunes y Mitigación

| Error en Vercel | Causa Raíz | Mitigación Inmediata |
| :--- | :--- | :--- |
| **Missing Environment Variables** | Variables como `NEXT_PUBLIC_SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` no sincronizadas en el dashboard de Vercel. | Inyectar vía `vercel env add` o documentar las keys requeridas en `.env.example`. |
| **Turbopack / SSR Dynamic Usage** | Uso de `cookies()` o `headers()` en rutas estáticas sin dynamic rendering. | Reemplazar clientes cliente/servidor por `@/lib/supabase/admin` o declarar `export const dynamic = 'force-dynamic'`. |
| **Lockfile Out of Sync** | `package-lock.json` no coincide con `package.json`. | Ejecutar `npm install` localmente y commitear el lockfile actualizado. |
