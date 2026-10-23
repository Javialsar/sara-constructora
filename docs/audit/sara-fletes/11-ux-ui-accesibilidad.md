# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 11. Auditoría UX/UI, Ergonomía Móvil y Accesibilidad

**Documento:** 11 de 21  
**Alcance:** Experiencia de usuario en teléfonos móviles, diseño responsive, ergonomía de choferes en cabina, contraste y accesibilidad WCAG 2.1 AA.  

---

### 1. Ergonomía Móvil para Conductores en Cabina

El perfil del transportista opera habitualmente con el teléfono montado sobre el tablero del vehículo, sujeto a vibraciones, luz solar directa y uso con una sola mano.

#### Puntos Fuertes Observados:
- **Botón SOS Flotante de Alta Visibilidad:**
  El componente `SaraFloatingSosButton` tiene un tamaño generoso ($60\times60\,\text{px}$, touch target $> 48\times48\,\text{px}$) y requiere pulsación prolongada de 2.5 segundos con confirmación háptica y visual, eliminando falsos disparos por baches o toques accidentales.
- **Selector de Categorías con Íconos Claros:**
  Tarjetas vehiculares con tipología identificable (🛻 Camioneta, 🚐 Furgón, 🚚 Camión, 🚜 Volqueta, 🚛 Mediano, 🏗️ Mula) y capacidades en formato grande y legible.
- **Modo Oscuro Predeterminado (`bg-slate-950`):**
  Reduce la fatiga visual nocturna en carretera y ahorra batería en pantallas OLED de teléfonos de gama media comúnmente utilizados por transportistas.

#### Deficiencias Ergonómicas y Fricciones UX:
1. **Densidad Excesiva de Controles en Pantallas Pequeñas (< 380px):**
   En teléfonos compactos, el panel lateral colapsable de `/modulos/fletes` compite agresivamente por el espacio vertical con el mapa Leaflet, dificultando la visualización simultánea de la ruta y los detalles de carga.
2. **Formularios con Demasiados Campos Obligatorios para Fletes Inmediatos:**
   El flujo de pedido solicita material, peso, origen, destino, tipo de vehículo y confirmación en un solo bloque. Se recomienda adoptar un flujo paso a paso tipo "Bottom Sheet" (como Uber o inDrive) que pregunte primero "¿A dónde vas?" y sugiera el vehículo en función del material.
3. **Ausencia de Feedback Háptico (`navigator.vibrate`):**
   Al recibir una nueva solicitud en el radar del transportista, el teléfono no vibra, dependiendo únicamente de la pantalla encendida o alertas sonoras.

---

### 2. Evaluación de Accesibilidad (WCAG 2.1 AA)

- **Contraste de Color:**
  - Los textos secundarios en `text-slate-400` y `text-neutral-500` sobre fondos `bg-slate-950` ofrecen un ratio de contraste de $4.8:1$, cumpliendo el mínimo de $4.5:1$ de WCAG AA para texto normal.
  - El botón de SOS con gradiente rojo (`from-red-500 to-rose-700`) sobre blanco/negro tiene un ratio $> 7:1$, cumpliendo WCAG AAA.
- **Navegación por Teclado y Foco Visible:**
  - Los modales (`SaraEpodModal`, `SaraFreightPaymentGatewayModal`) carecen de trampa de foco (*Focus Trap*). Si un usuario navega con `Tab`, el foco puede salirse del modal e interactuar con el mapa de fondo.
  - *Remediación:* Implementar `aria-modal="true"` y atrapar el foco dentro del diálogo activo.
- **Etiquetas Accesibles (`aria-label`):**
  - La mayoría de botones de íconos en el mapa (zoom, centrar GPS, colapsar panel) carecen de `aria-label`, lo que dificulta la navegación con lectores de pantalla (TalkBack / VoiceOver).
