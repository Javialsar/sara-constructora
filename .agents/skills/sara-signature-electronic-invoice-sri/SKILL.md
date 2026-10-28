---
name: sara-signature-electronic-invoice-sri
description: >-
  Motor autónomo de firma digital XAdES-BES y emisión de comprobantes electrónicos offline del SRI Ecuador (v2.21).
  Gestiona certificados PKCS#12 (.p12), genera claves de acceso Módulo 11, transmite vía SOAP y produce RIDE PDF.
---

# sara-signature-electronic-invoice-sri

## 1. Nombre y Objetivo de la Skill

- **Identificador Único:** `sara-signature-electronic-invoice-sri`
- **Unidad de Negocio:** SARA Facturación y Firma Electrónica SRI (Módulo Transversal de Cumplimiento Tributario y Fe Pública)
- **Repositorio / Estándar GitHub de Referencia:**
  - `esteban-dcp/ecuador-tax` (SDK modular TypeScript para construcción de esquemas XML del SRI, clave de acceso Módulo 11 y SOAP MTOM).
  - `AngeloBarzolaVillamar/open-api-facturacion-sri` (Arquitectura NestJS multi-tenant, motor de firma XAdES-BES Enveloped, colas BullMQ para contingencia offline del SRI y RIDE PDF).
  - `rolansor/firmador_sri_ec` & `nelsonmarro/go_ec_sri_invoice_signer` (Validación de certificados PKCS#12 `.p12` de entidades de certificación acreditadas de Ecuador: Security Data, Banco Central del Ecuador, UANATACA, ANFAC, Consejo de la Judicatura; Canonicalización XML-C14N y digest SHA-256 sin dependencia de Java).
  - Ficha Técnica de Comprobantes Electrónicos Esquema Offline del SRI v2.21.
  - Ley de Comercio Electrónico, Firmas y Mensajes de Datos del Ecuador (Decreto Ley 2002-67).
- **Objetivo Estratégico:**
  Gestionar el ciclo completo de emisión, validación estructural, firmado criptográfico XAdES-BES Enveloped, transmisión a los Web Services SOAP del SRI y generación del RIDE (PDF) para todos los documentos tributarios de GRUPO SARA y sus usuarios (constructores, subcontratistas, proveedores del marketplace, transportistas pesados y huéspedes corporativos). Garantiza el $100\%$ de validez jurídica de comprobantes, aplica tarifas de IVA diferenciadas (5% materiales de construcción vs 15% general) y desacopla la contingencia tributaria ante caídas de los servidores gubernamentales.

---

## 2. Marco Normativo y Estándares Aplicables

1. **Ficha Técnica de Comprobantes Electrónicos SRI (v2.21 - Esquema Offline):**
   - Tipos de comprobantes soportados: Factura (`01`), Liquidación de Compra de Bienes/Servicios (`03`), Nota de Crédito (`04`), Nota de Débito (`05`), Guía de Remisión (`06`), Comprobante de Retención (`07`).
   - Algoritmo ponderado de clave de acceso de 49 dígitos (Módulo 11).
   - Ambientes: Pruebas (`1`) y Producción (`2`).
   - Tipos de emisión: Normal (`1`).
2. **Estándar Criptográfico ETSI TS 101 903 / W3C XML Signature Syntax and Processing (RFC 3275):**
   - Formato de Firma: **XAdES-BES** (*XML Advanced Electronic Signatures - Basic Electronic Signature*).
   - Tipo de Firma: *Enveloped Signature* (`ds:Signature` como nodo hijo de la raíz del comprobante).
   - Algoritmo de Canonicalización: Canonical XML 1.0 sin comentarios (`http://www.w3.org/TR/2001/REC-xml-c14n-20010315`).
   - Algoritmo de Digest: SHA-256 o SHA-1 (`http://www.w3.org/2001/04/xmlenc#sha256`).
   - Algoritmo de Firma: RSA con SHA-256 o SHA-1 (`http://www.w3.org/2001/04/xmldsig-more#rsa-sha256`).
   - Certificado Digital: Contenedor **PKCS#12** (`.p12` / `.pfx`) emitido por Entidad de Certificación de Información (ECI) autorizada por la ARCOTEL.
3. **Resolución SRI NAC-DGERCGC24-00000013 (Ley de Eficiencia Económica y Generación de Empleo):**
   - Tarifa reducida de IVA al 5% para la transferencia local de materiales de construcción calificados (cemento, acero, áridos, adoquín, ladrillos, hormigón).
   - Tarifa ordinaria de IVA al 15% para el resto de bienes y servicios.
4. **Protección Ciberseguridad OWASP Top 10 (A05 - XML External Entities XXE):**
   - Sanitización rigurosa de entradas XML prohibiendo declaraciones DTD, entidades externas (`<!ENTITY`), llamadas `SYSTEM` o `PUBLIC`.

---

## 3. Instrucciones Operativas Paso a Paso para el Agente

### Paso 1: Generación y Validación de la Clave de Acceso de 49 Dígitos
1. Concatenar los 48 dígitos iniciales del comprobante según el orden canónico del SRI:
   $$\text{Cadena}_{48} = \underbrace{d_1 \dots d_8}_{\text{Fecha ddmmyyyy}} + \underbrace{d_9 d_{10}}_{\text{Tipo Comp (01-07)}} + \underbrace{d_{11} \dots d_{23}}_{\text{RUC Emisor (13 dígitos)}} + \underbrace{d_{24}}_{\text{Ambiente (1 o 2)}} + \underbrace{d_{25} \dots d_{27}}_{\text{Establecimiento (001)}} + \underbrace{d_{28} \dots d_{30}}_{\text{Pto Emisión (001)}} + \underbrace{d_{31} \dots d_{39}}_{\text{Secuencial (9 dígitos)}} + \underbrace{d_{40} \dots d_{47}}_{\text{Código Numérico (8 dígitos)}} + \underbrace{d_{48}}_{\text{Tipo Emisión (1)}}$$
2. Calcular el dígito verificador ($d_{49}$) mediante el algoritmo **Módulo 11 con ponderación cíclica 2 a 7**:
   $$S = \sum_{k=1}^{48} d_{49-k} \times w_k, \quad \text{donde } w_k = (k-1 \pmod 6) + 2$$
   $$R = 11 - (S \pmod{11})$$
   $$d_{49} = \begin{cases} 0, & \text{si } R = 11 \\ 1, & \text{si } R = 10 \\ R, & \text{en cualquier otro caso } (2 \le R \le 9) \end{cases}$$
3. La clave de acceso final es:
   $$\text{ClaveAcceso}_{49} = \text{Cadena}_{48} + d_{49}$$

### Paso 2: Construcción del XML v2.21 con Segregación Tributaria
1. Estructurar el nodo `<infoTributaria>` con los datos del emisor, RUC, clave de acceso, dirección matriz y régimen tributario (RIMPE Emprendedor, RIMPE Negocio Popular, Régimen General o Agente de Retención Resolución Nro...).
2. Construir el nodo `<infoFactura>`:
   - Total sin impuestos, total descuentos, propina y total a pagar.
   - Desglose de impuestos por código y tarifa:
     - Código Impuesto: `2` (IVA).
     - Código Porcentaje `5`: Tarifa 5% (Materiales Construcción Res. NAC-DGERCGC24-00000013).
     - Código Porcentaje `4`: Tarifa 15% (General).
     - Código Porcentaje `0`: Tarifa 0%.
3. Estructurar los ítems en `<detalles>` con precio unitario, cantidad, descuento, y su correspondiente nodo hijo `<impuestos>`.
4. Sanitizar la cadena XML eliminando entidades DTD externas y caracteres de control que invaliden la estructura XML.

### Paso 3: Firma Electrónica Criptográfica XAdES-BES Enveloped (.p12)
1. Cargar el almacén de claves PKCS#12 (`.p12` / `.pfx`) y descifrar la clave privada RSA usando la contraseña provista.
2. Validar que la fecha actual esté dentro del periodo de vigencia del certificado X.509 (`notBefore` $\le T_{\text{actual}} \le$ `notAfter`) y que el RUC/Cédula coincida con el emisor.
3. Generar la estructura canónica XAdES-BES:
   - Crear el nodo `<ds:SignedProperties>` conteniendo la fecha de firma UTC, el hash del certificado emisor (`CertDigest` SHA-1 o SHA-256) y el emisor (`IssuerSerial`).
   - Canonicalizar el documento completo mediante C14N y calcular su `DigestValue` ($D_{\text{doc}}$):
     $$D_{\text{doc}} = \text{Base64}(\text{SHA-256}(\text{C14N}(\text{XML\_Document})))$$
   - Canonicalizar `<ds:SignedProperties>` y calcular su `DigestValue` ($D_{\text{prop}}$):
     $$D_{\text{prop}} = \text{Base64}(\text{SHA-256}(\text{C14N}(\text{SignedProperties})))$$
   - Crear el nodo `<ds:SignedInfo>` con las dos referencias (`URI=""` para el documento y `URI="#SignedPropertiesId"` para las propiedades).
   - Canonicalizar `<ds:SignedInfo>` y firmar con la clave privada RSA:
     $$\text{SignatureValue} = \text{Base64}\left(\text{Sign}_{\text{RSA-SHA256}}\left(\text{C14N}(\text{ds:SignedInfo}), \text{ClavePrivada}\right)\right)$$
4. Incrustar el bloque `<ds:Signature>` completo al final del elemento raíz del XML.

### Paso 4: Transmisión SOAP al SRI y Gestión de Contingencia Offline
1. **Recepción SOAP (`recepcionComprobantesOffline`):**
   - Empaquetar el XML firmado en Base64 dentro del sobre SOAP:
     ```xml
     <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.ec/ws/recepcion">
       <soapenv:Body>
         <ec:validarComprobante>
           <xml>[XML_FIRMADO_BASE64]</xml>
         </ec:validarComprobante>
       </soapenv:Body>
     </soapenv:Envelope>
     ```
   - Si respuesta es `RECIBIDA`: Avanzar a consulta de autorización.
   - Si respuesta es `DEVUELTA`: Parsear el código de error (ej. `ERROR 43: Clave de acceso en procesamiento`, `ERROR 70: Clave no registrada`).
2. **Autorización SOAP (`autorizacionComprobantesOffline`):**
   - Consultar el estado final mediante la clave de acceso de 49 dígitos.
   - Si estado es `AUTORIZADO`: Extraer el número de autorización, fecha/hora oficial y el XML autorizado con el sello del SRI.
   - Si el SRI no responde en $< 5.000\,\text{ms}$ (caída de web services o lentitud gubernamental):
     - Encolar el comprobante en la cola de contingencia `sara_sri_pending_queue`.
     - Activar la política de reintento exponencial:
       $$T_{\text{reintento}} = 10 \times 2^{\text{intento}} + \text{jitter} \quad (\text{segundos})$$
     - Entregar al cliente el estado `EN PROCESO / EMITIDO OFFLINE`, legalmente amparado bajo la ficha técnica del SRI.

### Paso 5: Generación del RIDE (PDF) con Código de Barras Code128
1. Construir el documento PDF vectorial mediante `jsPDF` y `jspdf-autotable`.
2. Incluir el logotipo institucional de GRUPO SARA, datos de la matriz y sucursal, régimen tributario (RIMPE, etc.), desglose de subtotales (15%, 5%, 0%), IVA y total a pagar.
3. Renderizar el código de barras **Code128** de alta densidad conteniendo exactamente la clave de acceso de 49 dígitos.
4. Despachar el RIDE PDF y el XML firmado por correo electrónico al adquirente y sincronizar con `SARA-PAGOS` y `SARA-MARKETPLACE`.

---

## 4. Criterios de Éxito y Métricas de Validación

1. **Validez Estructural del 100%:** Cero rechazos en el SRI por errores de canonicalización C14N o cálculo de Módulo 11.
2. **Tiempo de Firma Digital:** Firma criptográfica del XML ejecutada en $< 350\,\text{ms}$ por comprobante.
3. **Resiliencia de Contingencia:** Cero pérdida de comprobantes ante caídas de los servidores SOAP del SRI gracias a la cola asíncrona de reintentos.
4. **Cumplimiento Tributario:** Aplicación rigurosa del IVA al 5% en materiales de construcción según la Resolución NAC-DGERCGC24-00000013.
