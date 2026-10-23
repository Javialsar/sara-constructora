# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 13. Geolocalización, Ruteo Vial y Restricciones de Carga Pesada MTOP

**Documento:** 13 de 21  
**Alcance:** Precisión geodésica, cobertura de las 24 provincias, estaciones de pesaje, factores de sinuosidad y cálculo de peajes.  

---

### 1. Cobertura Geográfica y Geocodificación Estratégica

El archivo `src/lib/services/saraFreightRoutingService.ts` (1,964 líneas) contiene un mapa geoespacial con soporte para:
- 24 Provincias del Ecuador y más de 60 cantones.
- 7 Puertos marítimos y fluviales estratégicos (Contecon Guayaquil, DP World Posorja, Puerto Bolívar, Manta, Esmeraldas, Puerto Fluvial El Coca).
- 24 Terminales terrestres interprovinciales principales (Quitumbe, Carcelén, Guayaquil, Cuenca, Ambato, Santo Domingo, Cariamanga, etc.).
- 10 Aeropuertos nacionales con zonas de carga (Tababela Quito, Guayaquil, Cuenca, Catamayo, Latacunga Carga Pesada).
- Centros de abasto y mercados mayoristas (Ambato, San Bartolo Quito, Montebello Guayaquil, El Arenal Cuenca).
- Plantas cementeras y canteras de áridos (Holcim San Eduardo, Holcim Latacunga, UNACEM Otavalo, Cantera Bella María Loja, Cantera Mitad del Mundo Pichincha).

---

### 2. Algoritmo de Distancia Geodésica Haversine

Para evitar el consumo desmedido de cuotas de APIs externas de pago (Google Maps Routes o Mapbox Directions) en cotizaciones previas, SARA-FLETES utiliza la formulación esférica de Haversine calibrada con el radio medio terrestre ecuatorial ($R = 6,371.0\,\text{km}$):

$$\Delta\phi = (\text{lat}_2 - \text{lat}_1) \cdot \frac{\pi}{180}, \quad \Delta\lambda = (\text{lng}_2 - \text{lng}_1) \cdot \frac{\pi}{180}$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad D = R \cdot c$$

*Factor de Corrección por Topografía Andina:*
Dado que la distancia geodésica euclidiana ignora el relieve montañoso del Ecuador (curvas de cordillera, ascensos y descensos), el motor aplica un **Factor de Sinuosidad Vial de $1.25$ a $1.35$** en fletes interurbanos, aproximando con alta exactitud la distancia odómetrica real por carretera.

---

### 3. Red Nacional de Estaciones de Pesaje MTOP (Básculas)

El servicio `SaraMtopBalanzasService.ts` incorpora la georreferenciación oficial de balanzas fijas estatales del MTOP en los principales corredores logísticos:
1. **Machachi (Pichincha - E35):** Control de carga pesada que ingresa/sale de Quito por la Panamericana Sur.
2. **Guayllabamba (Pichincha - E35):** Control de flujo hacia el norte (Ibarra / Tulcán).
3. **Jambelí / Lasso (Cotopaxi - E35):** Zona de alto tránsito de cementeras e industrias metalmecánicas.
4. **Alóag (Pichincha - E20):** Bajada hacia Santo Domingo y la Costa ecuatoriana.
5. **Yaguachi / Virgen de Fátima (Guayas - E25/E40):** Acceso a Guayaquil y Puerto Marítimo Contecon.

*Función de Control Preventivo:*
El sistema evalúa el trayecto planificado y advierte al transportista si su ruta pasa por una balanza obligatoria cuando su carga supera el $92\%$ del PBV máximo legal, evitando retenciones y multas de hasta 2 SBU (\$964 USD).
