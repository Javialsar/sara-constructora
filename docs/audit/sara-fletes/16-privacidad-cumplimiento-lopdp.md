# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 16. Privacidad, Protección de Datos y Cumplimiento LOPDP Ecuador

**Documento:** 16 de 21  
**Alcance:** Ley Orgánica de Protección de Datos Personales (LOPDP), geolocalización, derechos ARCO y privacidad telemática.  

---

### 1. Marco Jurídico Aplicable en la República del Ecuador

1. **Ley Orgánica de Protección de Datos Personales (Registro Oficial Quinto Suplemento N° 459):**
   - **Principio de Minimización (Art. 10.3):** Los datos personales deben ser pertinentes y limitados a lo estrictamente necesario para la prestación del servicio de transporte.
   - **Principio de Seguridad (Art. 10.8):** Adopción de medidas técnicas y organizativas para evitar pérdida, acceso no autorizado o alteración de datos de ubicación geográfica y números telefónicos.
   - **Consentimiento del Transportista (Art. 7 y 8):** Autorización expresa para la recolección continua de telemetría GPS y difusión de placas/identidad comercial en el radar de clientes.
2. **Ley Orgánica de Transporte Terrestre, Tránsito y Seguridad Vial (LOTTTSV):**
   - Cumplimiento de registros de conductor profesional (Licencias Tipo C, D, E).
   - Verificación de antecedentes de tránsito y matriculación vehicular vigente.
3. **Resoluciones del SRI sobre Guías de Remisión Electrónicas:**
   - Obligatoriedad de portar clave de acceso de 49 dígitos para el transporte de mercaderías en vías estatales.

---

### 2. Hallazgos y Brechas de Privacidad en SARA-FLETES

1. **Exposición del Celular Personal en Rastreo Satelital Público:**
   - La vista pública `/fletes/rastreo/[token]` expone el número de teléfono del transportista en texto plano, accesible para cualquier tercero que abra el enlace compartido.
   - *Riesgo LOPDP:* Vulneración al deber de confidencialidad y exposición a acoso o extorsión.
   - *Mitigación:* Implementar un botón de llamada proxy o permitir la visualización del teléfono únicamente si el destinatario ingresa el código PIN de la entrega.
2. **Historial de Telemetría GPS sin Política de Retención Definida:**
   - La tabla `fletes_viajes_tracking` almacena latitudes y longitudes continuas cada 3 segundos.
   - *Riesgo LOPDP:* Conservación indefinida de datos de localización personal sin aviso de privacidad que especifique el plazo de retención.
   - *Mitigación:* Establecer política de purga automática: retener datos telemáticos segundo a segundo durante 30 días posteriores al cierre del flete; luego anonimizar y conservar únicamente la distancia total recorrida y el acta ePOD para fines fiscales.
3. **Mecanismo de Ejercicio de Derechos ARCO:**
   - La plataforma no cuenta actualmente con un formulario o endpoint visible para que los conductores soliciten la rectificación, eliminación o portabilidad de sus datos personales.
   - *Acción:* Incluir en el portal de perfil (`/modulos/fletes/mi-perfil`) una sección de "Privacidad y Datos Personales" con opción de descarga de datos y solicitud de baja.
