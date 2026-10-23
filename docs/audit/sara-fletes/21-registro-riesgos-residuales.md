# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 21. Registro de Riesgos Residuales y Plan de Contención

**Documento:** 21 de 21  
**Alcance:** Riesgos operativos, legales y de infraestructura que persisten tras la auditoría y requieren decisiones de gobernanza.  

---

### 1. Tabla de Riesgos Residuales

| ID Riesgo | Descripción del Riesgo Residual | Severidad | Probabilidad | Estrategia de Contención Aprobada | Responsable |
|---|---|---|---|---|---|
| **RSK-01** | **Discrepancia entre BroadcastChannel local y dispositivos móviles reales:** Si un transportista usa Android y el despachador usa iPhone, la subasta inDrive no sincroniza sin Supabase Realtime activo. | Alta | Alta | **Contención Inmediata:** Desplegar canales WebSocket de Supabase en Fase 7. Advertir en la UI si el canal remoto está desconectado. | Agente G (DevOps) |
| **RSK-02** | **Falsa expectativa sobre el Botón SOS:** Un usuario en situación de peligro puede creer que la policía se desplaza de forma autónoma al presionar SOS, cuando solo activa una llamada telefónica y un log en base de datos. | Alta | Media | **Contención Inmediata:** Modificar el texto del modal: *"Alerta registrada en Central SARA. Conectando llamada telefónica al ECU-911..."*. | Agente K (Seguridad Operativa) |
| **RSK-03** | **Ingreso inadvertido de datos de tarjeta en demo:** Un usuario final puede tipear su tarjeta de crédito real en el modal de demostración. | Crítica | Baja | **Contención Inmediata:** Colocar marca de agua visible *"MODO DEMOSTRACIÓN - NO INGRESE TARJETAS REALES"* o deshabilitar inputs de tarjeta sustituyéndolos por un botón de "Simular Pago de Prueba". | Agente F (Finanzas) |
| **RSK-04** | **Falta de pesaje físico previo al despacho:** El cálculo de PBV se basa en el peso teórico del material declarado por el cliente. Si la cantera carga áridos húmedos con mayor densidad, el camión puede violar el PBV en carretera. | Media | Alta | **Contención Inmediata:** Incluir en el checklist del transportista la recomendación de pesar en báscula pública antes de ingresar a corredores con balanza MTOP. | Agente H (Logística) |
| **RSK-05** | **Responsabilidad por fallas mecánicas en Renta Sin Chofer:** Si un cliente alquila una camioneta sin chofer y sufre un percance mecánico o accidente vial. | Alta | Media | **Contención Inmediata:** Redactar contrato de comodato/alquiler con firma electrónica previa, inspección visual de odómetro y retención de depósito de garantía (\$250 - \$800 USD). | Agente M (Gobernanza) |

---

### 2. Criterios de Calidad para Liberación a Producción (Release Gate)

Para que cualquier versión de SARA-FLETES sea autorizada a desplegarse en producción comercial:
1. **Zero Secretos Expuestos:** Comprobación estricta de que `.env.local` y credenciales de Supabase service_role no viajen en bundles del cliente.
2. **Cero Inputs de Tarjeta No Tokenizados:** Prohibición absoluta de campos HTML para PAN/CVV en frontend propio.
3. **Persistencia Real en Supabase:** Validación de que ninguna transacción de saldo o flete quede confinada a `localStorage`.
4. **100% de Pruebas Unitarias Aprobadas:** Ejecución limpia de `tests/run-sara-fletes-audit-suite.ts` en el pipeline de CI/CD.
5. **Aprobación de la Dirección de Arquitectura:** Firma y revisión de la hoja de ruta por el Director de Tecnología de GRUPO SARA.
