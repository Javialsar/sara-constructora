---
name: sara-enterprise-uiux-uniformity
description: >-
  Sistema de Diseño Super-Empresarial, uniformidad de navegación inter-módulos, arquitectura de temas sin colisiones y ergonomía PWA para GRUPO SARA.
  Úsese siempre que se creen, auditen o estandaricen páginas públicas, portales de los 8 módulos, dashboards o paneles administrativos.
---

# sara-enterprise-uiux-uniformity

## 1. Objetivo de la Skill
Garantizar que las 8 unidades de negocio de **GRUPO SARA** (`Constructora`, `APU`, `Marketplace/Compras`, `Fletes`, `Talento Humano`, `Inmobiliaria`, `Alojamiento/Stays` y `Pagos/Escrow`) proyecten una estética **Super-Empresarial, Moderna, Uniforme e Intuitiva**, eliminando fragmentación de cabeceras, colisiones de modo oscuro, alertas nativas y barreras de ergonomía móvil.

---

## 2. Estándares de Uniformidad y Arquitectura Visual

### 2.1 Navegación Unificada Inter-Módulos (`<ModuleTopBar />` & App Launcher)
- Ningún portal de módulo (`/modulos/compras`, `/modulos/talento`, `/modulos/financiero`, `/modulos/fletes`, `/apu`, `/inmobiliaria`, `/stays`, `/constructora`) puede quedar huérfano sin barra de navegación superior ni atrapar al usuario sin retorno al Holding.
- Todas las vistas de módulo deben incluir una barra superior uniforme (`bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.08]`) con:
  1. Retorno directo `← Grupo SARA` (`/`).
  2. Identificador visual del módulo activo con su badge cromático.
  3. **Selector Rápido del Ecosistema (App Launcher de los 8 Módulos)** para saltar en 1 clic entre unidades de negocio.
- Evitar dobles cabeceras superpuestas (registrar toda ruta con header propio en `isStandaloneModule` dentro de [`PublicLayoutChrome.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/components/layout/PublicLayoutChrome.tsx)).

### 2.2 Sistema de Temas Limpio (Sin Inversión Destructiva de Blancos)
- **Prohibido** redefinir `--color-white` a colores oscuros (`#0f172a`) en `html.dark` dentro de [`globals.css`](file:///d:/SaS_Proyectos/sara-constructora/src/app/globals.css), ya que destruye el contraste de los componentes oscuros nativos (`bg-slate-950 text-white`).
- Utilizar tokens semánticos (`--surface-primary`, `--surface-elevated`, `--text-primary`, `--border-subtle`) y clases `dark:` explícitas.
- Sincronizar el tema exclusivamente a través de [`ThemeProvider.tsx`](file:///d:/SaS_Proyectos/sara-constructora/src/components/ThemeProvider.tsx) (`useSaraTheme()`), evitando scripts duplicados en layouts secundarios.

### 2.3 Tipografía Ejecutiva y Precisión Numérica
- **Titulares, Héroes y KPIs Macro:** `font-display tracking-tight font-bold` (`Plus Jakarta Sans` / `Syne`).
- **Cuerpo Técnico, Formularios y Tablas:** `font-sans` (`Montserrat` / `Inter`).
- **Precios, Tarifas, Coordenadas, Porcentajes y Códigos APU/SRI:** Obligatoriamente `font-mono tabular-nums` para alineación vertical milimétrica en tablas financieras y presupuestos.

### 2.4 Ergonomía Móvil PWA ($44\times44\,\text{px}$) y Cero `window.alert()`
- Todo botón, control de cantidad (`+`/`-`), filtro, pestaña o marcador de mapa debe cumplir un área táctil mínima de **$44\times44\,\text{px}$** (`min-h-[44px] min-w-[44px]`).
- En vistas con mapas operativos (`/modulos/fletes`, `/inmobiliaria`, `/stays`), los paneles de control en móvil deben comportarse como *Bottom Sheets* deslizables (`max-h-[55vh] rounded-t-3xl`) y nunca tapar el $100\%$ del mapa.
- Todos los paneles administrativos (`/admin/**`, `/dashboard/**`) deben contar con *Mobile Drawer* colapsable en pantallas $< 768\,\text{px}$.
- **Prohibido** el uso de `window.alert()` o `window.confirm()` nativos; emplear siempre notificaciones *Toast* corporativas o modales de confirmación con diseño del sistema.
