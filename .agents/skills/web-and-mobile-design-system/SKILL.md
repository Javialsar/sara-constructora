---
name: web-and-mobile-design-system
description: >-
  Directrices avanzadas de diseño de interfaz de usuario (UI), experiencia de usuario (UX),
  jerarquía tipográfica editorial, escalas de espaciado profesional y ergonomía móvil nativa.
  Activar al diseñar componentes web, maquetar layouts responsive, definir fuentes,
  ajustar espaciados o eliminar la estética genérica de plantilla básica.
---

# Sistema de Diseño Web & Móvil de Alto Impacto (Anti-Plantilla)

Esta guía define las reglas de diseño visual y de interacción para construir experiencias digitales elegantes, distintivas y con calibre de estudio de arquitectura / agencia de diseño digital de primer nivel.

---

## 1. Reglas de Tipografía: Carácter y Jerarquía Editorial

El sello de una plantilla genérica es usar una sola fuente en peso regular para todo. Un diseño de autor requiere:

### 1.1 Combinación Tipográfica Dual (Display + UI)
- **Títulos / Display / Hero (Carácter & Porte):**
  - Ejemplos recomendados para arquitectura, construcción e ingeniería:
    - *Syne*, *Plus Jakarta Sans*, *Cabinet Grotesk*, *Space Grotesk* o serifas modernas como *Cinzel* / *Playfair* para acentos de lujo.
  - Tracking ajustado: en títulos grandes (display/h1/h2), usar `tracking-tight` o `letter-spacing: -0.03em`.
  - Contraste de pesos: Títulos con peso `font-black` (800-900) o `font-medium` ultra-limpio con alto contraste de tamaño.
- **Cuerpo / Interfaz / Tablas (Legibilidad Absoluta):**
  - Fuentes de alta legibilidad en pantallas: *Inter*, *Geist*, *Plus Jakarta Sans*.
  - Leading adecuado: `leading-relaxed` (1.6 - 1.75) para párrafos largos, evitando bloques de texto apretados.
  - Tracking neutro o ligero: `tracking-normal` o `tracking-wide` en texto pequeño (`text-xs` o badges en mayúsculas).

### 1.2 Escala Tipográfica Fluida (Fluid Typography)
Usar funciones `clamp()` o escalas proporcionales armónicas (Major Third 1.25 o Perfect Fourth 1.333):
- **Hero Title:** `clamp(2.5rem, 5vw + 1rem, 5rem)`
- **H1 / Sección:** `text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight`
- **H2 / Subtítulos:** `text-2xl md:text-3xl font-bold tracking-tight`
- **Subheaders / Kicker / Overlines:** `text-xs uppercase tracking-widest font-semibold text-emerald-600`
- **Body:** `text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal`
- **Meta / Captions:** `text-xs text-slate-400 font-medium`

---

## 2. Ritmo y Espaciado: El Arte del Espacio Negativo

Las plantillas estándar amontonan bloques en `py-8` o `py-12`. El diseño prémium se define por su generosidad espacial.

### 2.1 Macro-Espaciado (Estructura de Secciones)
- Las secciones principales deben respirar con amplitud:
  - Móvil: `py-16` o `py-20` (64px - 80px)
  - Escritorio: `py-24` a `py-36` (96px - 144px)
- Márgenes de contenedor:
  - Móvil: `px-4` o `px-6`
  - Escritorio: `px-8` a `px-12` con `max-w-7xl` o `max-w-screen-2xl` centrado.

### 2.2 Micro-Espaciado (Componentes y Tarjetas)
- **Sistema de 8pt:** Todos los paddings y gaps deben derivar de múltiplos de 4 u 8:
  - Espacio íntimo (icono + texto): `gap-2` (8px)
  - Espacio de grupo (título + párrafo): `space-y-3` o `gap-3` (12px)
  - Padding de tarjetas: `p-6` en móvil, `p-8` o `p-10` en escritorio.
  - Espacio entre tarjetas de grid: `gap-6` a `gap-10`.

---

## 3. Ergonomía Móvil (Mobile-First Experience)

Una web moderna no es un escritorio reducido; es una interfaz táctil ergonómica.

### 3.1 Zonas Táctiles y Dimensiones Físicas
- **Botones y elementos interactivos:**
  - Altura mínima táctil: `h-11` o `h-12` (44px - 48px). Nunca botones con menos de 44px de área de pulsación.
  - Separación entre botones táctiles contiguos: mínimo `gap-3` (12px) para evitar toques accidentales.
- **Inputs táctiles:**
  - Tamaño de fuente mínimo de `16px` (`text-base`) en inputs para evitar que iOS Safari haga zoom automático molesto.
  - Padding interno amplio: `py-3 px-4`.

### 3.2 Safe Areas y Navegación Pulgar-Friendly (Thumb Zone)
- Siempre respetar las muescas e indicadores de inicio de iOS/Android:
  - `pb-safe` y `pt-safe` con `env(safe-area-inset-bottom)` y `env(safe-area-inset-top)`.
- En pantallas móviles, las acciones principales (llamadas a la acción, filtros, navegación secundaria) funcionan mejor en barras inferiores ancladas (`bottom-0 sticky / fixed z-40`) dentro del alcance natural del pulgar.
- Reemplazar modales emergentes centrados de escritorio por **Bottom Sheets** (hojas deslizantes desde abajo) en pantallas móviles (`< 640px`).

---

## 4. Elevación, Profundidad y Micro-Detalles Visuales

Evitar sombras y bordes planos que delatan plantillas baratas:

### 4.1 Bordes Sutiles & Vidrio (Glassmorphism Inteligente)
- Bordes finos de alto contraste selectivo:
  - Modo claro: `border border-slate-900/5` o `border-emerald-950/10`
  - Modo oscuro: `border border-white/10`
- Fondos con desenfoque suave para elementos superpuestos (headers, badges, cards):
  - `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`

### 4.2 Sombras Tintadas (Non-Gray Shadows)
- En lugar del gris genérico `shadow-md`, proyectar una sombra suave que absorba el tono del fondo o de la marca:
  - `shadow-[0_12px_36px_-6px_rgba(7,19,13,0.08)]` o `shadow-[0_20px_50px_rgba(60,122,82,0.12)]`
  - Genera sensación de flotación arquitectónica y volumen real.

### 4.3 Micro-Interacciones y Transiciones
- Botones y tarjetas con transiciones fluidas: `transition-all duration-300 ease-out`.
- Efectos de elevación al interactuar: `hover:-translate-y-1 hover:shadow-xl`.
- Interacción táctil en móvil: feedback con `active:scale-[0.98] active:opacity-90`.

---

## 5. Checklist de Verificación al Crear o Modificar Componentes

1. [ ] ¿La tipografía tiene dos roles diferenciados (Display con personalidad vs Body ultra legible)?
2. [ ] ¿Los títulos grandes tienen `tracking-tight` y los párrafos tienen `leading-relaxed`?
3. [ ] ¿Las secciones tienen al menos `py-20` en móvil y `py-24+` en escritorio para no verse asfixiadas?
4. [ ] ¿Los botones y enlaces interactivos tienen al menos 44px de altura táctil en móvil?
5. [ ] ¿Los inputs de formularios tienen tamaño de texto de 16px para evitar auto-zoom en iOS?
6. [ ] ¿Las sombras y bordes tienen tintes sutiles y no negros/grises opacos de plantilla genérica?
7. [ ] ¿Se consideran las safe areas de dispositivos móviles (`pb-safe`)?
