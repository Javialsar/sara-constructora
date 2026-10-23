# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 18. Catálogo y Especificación de Skills Agénticas SARA-FLETES

**Documento:** 18 de 21  
**Alcance:** Catálogo formal de skills de ingeniería, ruteo, tarificación y ciberseguridad para la red de agentes de GRUPO SARA.  

---

### 1. Mapa de Skills de SARA-FLETES en el Repositorio

El ecosistema agéntico de GRUPO SARA en `.agents/skills` cuenta con las siguientes habilidades operativas especializadas en transporte pesado y logística de construcción:

| Skill | Directorio en Repositorio | Propósito Operativo |
|---|---|---|
| `sara-heavy-freight-routing` | `.agents/skills/sara-heavy-freight-routing/` | Cubicación de cargas pesadas de obra, asignación de configuración MTOP (3S3 / V3A), ruteo vial andino y peajes. |
| `sara-backhaul-optimization` | `.agents/skills/sara-backhaul-optimization/` | Sincronización de viajes de retorno en vacío: cruce de volquetas de desalojo de obra con aprovisionamiento de áridos en canteras (ahorro del 28%). |
| `sara-fleet-vehicle-taxonomy` | `.agents/skills/sara-fleet-vehicle-taxonomy/` | Catálogo multimodal de las 6 categorías vehiculares con capacidades netas, PBV legal y tarifas de renta por horas/días. |
| `sara-freight-dynamic-pricing` | `.agents/skills/sara-freight-dynamic-pricing/` | Motor econométrico de tarifas urbanas, interurbanas con sinuosidad vial de cordillera y renta temporal. |
| `sara-freight-indrive-negotiation` | `.agents/skills/sara-freight-indrive-negotiation/` | Mecanismo de subasta y negociación bidireccional P2P con límites de viabilidad financiera (piso mínimo y techo +30%). |
| `sara-fleet-geo-dispatch` | `.agents/skills/sara-fleet-geo-dispatch/` | Geocodificación nacional de puertos, canteras, cementeras y terminales terrestres sin dependencia de APIs externas. |
| `sara-freight-fintech-wallet` | `.agents/skills/sara-freight-fintech-wallet/` | Gestión Zero-Trust de billetera prepago de transportistas con bloqueo transaccional FOR UPDATE e idempotencia. |

---

### 2. Estándar de Construcción y Gobernanza de Skills

Cada skill agéntica de SARA-FLETES cumple con las siguientes directrices:
1. **Frontmatter YAML Canónico:** Nombre único, descripción concisa y disparador de activación.
2. **Marco Normativo Explícito:** Citas a decretos ejecutivos ecuatorianos (MTOP, SRI, LOTTTSV, Acuerdo MDT-2025-195 para SBU \$482 en 2026).
3. **Invariantes Matemáticas y Fórmulas:** Densidades de materiales ($\rho_{\text{arena}} \approx 1.55\,\text{t/m}^3$), PBV por configuración de ejes y ecuaciones de costo por tonelada-kilómetro.
4. **Validación con Pruebas Unitarias:** Toda modificación a una skill debe estar respaldada por casos de prueba reproducibles en `tests/`.
5. **Principio de Mínimo Privilegio:** Ninguna skill puede modificar permisos de seguridad ni alterar la política de RLS de la base de datos sin aprobación del Agente A (Director de Arquitectura) y revisión humana.
