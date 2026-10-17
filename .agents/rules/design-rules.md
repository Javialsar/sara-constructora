# Reglas de Calidad Visual, Tipografía y Ergonomía Móvil

Siempre que diseñes, modifiques o maquetes vistas en el proyecto, aplica obligatoriamente los siguientes estándares visuales y de interacción:

1. **Jerarquía Tipográfica Editorial:**
   - Nunca utilices una sola fuente para todo de forma plana.
   - Aplica `--font-display` (Syne / Plus Jakarta Sans) para titulares, cifras clave y elementos de impacto (`h1`, `h2`, `hero`, `kpis`).
   - Aplica `--font-sans` (Montserrat / Inter) para cuerpo de texto, formularios, tablas y datos técnicos.
   - Aplica `tracking-tight` (-0.025em o -0.03em) en títulos grandes y `leading-relaxed` en párrafos descriptivos.

2. **Espaciado y Respiración de Espacio:**
   - Evita agrupar secciones con espaciados pobres (`py-6`, `py-8`). Utiliza `py-16 md:py-28 lg:py-32` en secciones principales de landing y presentación.
   - Mantén consistencia en el sistema de 8pt (`gap-2`, `gap-4`, `gap-6`, `gap-8`, `gap-12`).

3. **Ergonomía Móvil y PWA:**
   - Todo botón, enlace o elemento interactivo debe tener un área táctil mínima de 44x44px (`min-h-[44px]`).
   - En campos de texto e inputs, el tamaño de fuente en móvil debe ser `text-base` (mínimo 16px) para evitar el zoom forzado de Safari iOS.
   - Respeta siempre las zonas seguras (`pb-safe`, `pt-safe`).
   - Prioriza controles en la zona inferior de la pantalla (Thumb Zone) en dispositivos móviles.

4. **Tratamiento Visual Antigenericidad:**
   - Emplea bordes con opacidades sutiles (`border-black/5 dark:border-white/10`).
   - Emplea sombras tintadas con el color de acento o de fondo en lugar de sombras genéricas grises.
   - Micro-interacciones suaves: transiciones de 200-300ms y `active:scale-[0.98]` en pulsación táctil.
