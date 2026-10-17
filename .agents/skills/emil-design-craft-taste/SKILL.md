---
name: emil-design-craft-taste
description: >-
  Estándares de diseño de élite, buen gusto (Taste) e ingeniería visual inspirados en Emil Kowalski
  (Linear, Vercel). Elimina el 'AI Slop' (diseños genéricos, tipografía aplastada, animaciones torpes y
  sombras toscas). Aplica micro-interacciones de 150-250ms, jerarquía tipográfica rigurosa, números tabulares,
  fondos sutiles sin bordes negros pesados y pulido de nivel producto SaaS Silicon Valley.
---

# Emil Kowalski Design Craft & Taste Engine

Esta skill codifica el **buen gusto visual (Taste)** y los principios de ingeniería de diseño de Emil Kowalski (Vercel, Linear, Sonner, Vaul). Su propósito es erradicar completamente el código y la interfaz genérica ("AI slop") en todo el software de GRUPO SARA.

---

## 1. El Diagnóstico del "AI Slop" y la Mala Tipografía

Las inteligencias artificiales y las plantillas baratas cometen siempre los mismos errores de diseño:
1. **Tipografía desbalanceada:** Aplicar fuentes display extravagantes a textos de datos o titulares de dashboard utilitarios, haciéndolos ver aplastados, caricaturescos o desalineados.
2. **Animaciones injustificadas:** Mover cosas porque "se ve animado", cuando en realidad ralentiza el flujo de trabajo del usuario.
3. **Bordes pesados y sombras opacas:** Usar `border-gray-300` y `shadow-md` negros que ensucian el lienzo en lugar de anillos semitransparentes y elevaciones tenues.
4. **Falta de números tabulares:** Tablas de precios, metrajes y cantidades cuyos dígitos bailan horizontalmente al cambiar o no se alinean a la derecha.

---

## 2. Tipografía: Reglas Estrictas de Buen Gusto (Taste)

### 2.1 La Separación Sagrada: Display vs. Enterprise UI
- **Landing Pages & Marketing (SARA Constructora, Inmobiliaria, Stays):**
  - Títulos de gran tamaño (`text-4xl` a `7xl`): Tipografía display con personalidad arquitectónica (*Plus Jakarta Sans* o *Syne* refinada).
  - Tracking cerrado en títulos grandes: `tracking-[-0.03em]`.
- **Dashboards, Software SaaS & Tablas Técnicas (APU, SERCOP, Fiscaliza, Insumos):**
  - **PROHIBIDO:** Usar tipografías display o condensadas experimentales en encabezados de tablas, listados o paneles de control densos.
  - **OBLIGATORIO:** Usar sans-serif neutra, geométrica y de máxima claridad como **Plus Jakarta Sans** o **Geist / Inter**.
  - Los encabezados de software técnico deben ser limpios: `text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100`.

### 2.2 Números Tabulares y Alineación
- Toda cifra numérica en tablas (precios, códigos, cantidades, fechas) **DEBE** usar la clase `tabular-nums` (`font-variant-numeric: tabular-nums`).
- Precios, subtotales y cantidades **SIEMPRE alineados a la derecha** (`text-right`), nunca al centro.

### 2.3 Jerarquía de Texto y Micro-Copys
- **Kicker / Overline:** `text-[11px] font-semibold tracking-wider uppercase text-slate-500`.
- **Título de Pantalla SaaS:** `text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50`.
- **Subtítulo descriptivo:** `text-sm text-slate-500 font-normal leading-normal`.
- **Badges / Tags:** `text-xs font-medium px-2.5 py-0.5 rounded-full border`.

---

## 3. Principios de Movimiento y Animación (Emil Motion Rules)

### 3.1 Las Reglas de Oro de Animación de Emil Kowalski
1. **Nunca animes lo que el usuario ve 100 veces al día:**
   - No animes botones de guardar, selects rutinarios o filas de tabla cada vez que paginan.
   - Anima **únicamente** transiciones de contexto (abrir un drawer, un modal, un toast de confirmación o un acordeón).
2. **Curvas Prohibidas:**
   - **PROHIBIDO:** `ease-in` para elementos que entran a pantalla (se siente pesado, lento y torpe).
   - **OBLIGATORIO:** `ease-out` o curvas cúbicas snappies: `cubic-bezier(0.16, 1, 0.3, 1)`.
3. **Escalas Prohibidas:**
   - **PROHIBIDO:** Elementos que nacen desde `scale(0)`.
   - **OBLIGATORIO:** Entradas sutiles desde `scale(0.96)` u `opacity: 0` a `scale(1)` con `opacity: 1`.
4. **Duraciones Tight & Snappy:**
   - Micro-interacciones: `100ms - 150ms`.
   - Modales y drawers: `200ms - 250ms`.
   - **PROHIBIDO:** Animaciones de UI que duren más de 300ms.

---

## 4. Elevación, Sombras y Bordes (Craftsmanship)

### 4.1 La Técnica del Borde Invisible (Subtle Rings)
- En lugar de bordes sólidos grises:
  - Modo claro: `ring-1 ring-black/[0.06] shadow-sm` o `border border-slate-900/[0.08]`.
  - Modo oscuro: `ring-1 ring-white/[0.1] shadow-none`.
- Fondos de tarjetas limpias: `bg-white dark:bg-slate-900 rounded-xl`.

### 4.2 Botones de Alto Nivel
- No usar botones con gradientes fluorescentes o sombras negras pesadas.
- Botón primario:
  ```tsx
  className="h-9 px-4 rounded-lg bg-slate-900 text-white font-medium text-xs tracking-wide shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 inline-flex items-center gap-2"
  ```
- Botón secundario / outline:
  ```tsx
  className="h-9 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs tracking-wide shadow-xs active:scale-[0.98] transition-all duration-150 inline-flex items-center gap-2"
  ```

---

## 5. Ergonomía Móvil y PWA (Mobile-Native Realities)

1. **Sin Sticky Hover en Móvil:**  
   En dispositivos táctiles los efectos `@media (hover: hover)` no deben dejar botones pegados en estado hover tras tocarlos.
2. **Inputs Táctiles de 16px Mínimo:**  
   `text-base sm:text-sm` en todos los inputs para evitar que Safari en iPhone haga zoom involuntario.
3. **Drawer / Bottom Sheet en Móvil (Patrón Vaul):**  
   Modales en desktop se convierten en hojas deslizantes desde abajo (*Bottom Sheets*) en pantallas pequeñas (`< 640px`).

---

## 6. Checklist de Validación Emil Kowalski / Taste

- [ ] ¿Los encabezados de software técnico (SaaS) son legibles y limpios sin tipografías comprimidas o raras?
- [ ] ¿Todos los precios, cantidades y montos tienen la clase `tabular-nums` y alineación a la derecha?
- [ ] ¿Las animaciones duran menos de 250ms y usan `ease-out` / spring sin retrasar al usuario?
- [ ] ¿Los bordes son suaves (`ring-black/[0.06]`) en lugar de líneas toscas?
- [ ] ¿Los botones tienen feedback táctil (`active:scale-[0.98]`) y altura táctil adecuada?
