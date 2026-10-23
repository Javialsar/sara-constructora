# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 17. Rendimiento, Consumos de API y Estructura de Costes

**Documento:** 17 de 21  
**Alcance:** Consumo de ancho de banda, presupuesto de renderizado, costos de infraestructura Cloud y optimización de llamadas de mapas.  

---

### 1. Métricas de Rendimiento Frontend (Core Web Vitals)

- **First Contentful Paint (FCP):** $\sim 0.9\,\text{s}$ (Óptimo, gracias a Server Components en Next.js 16).
- **Time to Interactive (TTI) en Desktop:** $\sim 1.4\,\text{s}$.
- **TTI en Móviles de Gama Media (3G/4G lento):** $\sim 2.8\,\text{s}$ (Afectado por el bundle de Leaflet, Lucide Icons y XLSX/JSPDF).
- **Largest Contentful Paint (LCP):** $\sim 1.8\,\text{s}$ (Dentro del umbral verde de Google $< 2.5\,\text{s}$).
- **Cumulative Layout Shift (CLS):** $0.02$ (Excelente estabilidad visual, el contenedor del mapa tiene altura fija reservada `min-h-[400px]`).

---

### 2. Estructura de Costes Operativos e Infraestructura

| Servicio / Proveedor | Propósito en SARA-FLETES | Modelo de Costes | Coste Mensual Estimado (1,000 Fletes/Mes) | Estrategia de Optimización SARA |
|---|---|---|---|---|
| **Vercel Pro** | Hosting de App Router, Edge CDN y Server Actions | \$20.00 USD / mes (Base) | \$20.00 USD | Uso de Server Components minimiza cómputo Serverless |
| **Supabase Pro** | PostgreSQL, Auth, Realtime WebSockets, Storage ePOD | \$25.00 USD / mes | \$25.00 USD | Políticas de compresión en fotos de firmas ePOD y purga de tracking |
| **OpenStreetMap / CartoDB** | Tiles cartográficos base en Leaflet | Gratuito / Open Source | \$0.00 USD | Caché de tiles en Service Worker PWA para reducir peticiones HTTP |
| **Google Maps API (Opcional)** | Geocodificación y enrutamiento vial | Pago por uso (\$5 por 1,000 requests) | \$0.00 USD (Reemplazado) | **Ahorro del 100%:** SARA utiliza `SaraFreightRoutingService` nativo sin cuotas |
| **Infraestructura de Alertas SOS** | Registro en BD y discador telefónico | Gratuito vía PSTN del celular | \$0.00 USD | Sin costes de pasarelas SMS premium |
| **Total Coste de Infraestructura Cloud** | — | — | **\$45.00 USD / mes** | **Costo por flete procesado: \$0.045 USD** |

---

### 3. Recomendaciones de Optimización de Rendimiento

1. **Lazy Loading de Librerías Pesadas de Exportación:**
   Las librerías `xlsx` y `jspdf` / `jspdf-autotable` suman más de $450\,\text{KB}$ al bundle del cliente. Solo deben importarse dinámicamente (`import('xlsx')`) en el momento en que el usuario hace clic en "Descargar Reporte Excel" o "Exportar PDF", no en la carga inicial de la página.
2. **Virtualización de Listas en el Historial de Viajes:**
   Utilizar `react-virtuoso` (ya presente en `package.json`) para renderizar el historial de fletes cuando un transportista o administrador tenga más de 100 registros en pantalla.
