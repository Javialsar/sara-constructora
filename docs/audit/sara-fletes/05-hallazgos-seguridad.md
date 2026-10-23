# INFORME DE AUDITORÍA GLOBAL & PROGRAMA DE INGENIERÍA SARA-FLETES V2
## 05. Hallazgos de Seguridad, AppSec y Vulnerabilidades Identificadas

**Documento:** 05 de 21  
**Alcance:** Registro detallado de vulnerabilidades, pruebas de concepto (PoC), vectores de ataque y recomendaciones de mitigación.  

---

### Registro Consolidado de Vulnerabilidades

#### [SEC-FLT-001] IDOR / BOLA en Débito y Consulta de Billetera por Placa Vehicular
- **Severidad:** Alta (P1) | **CVSS 3.1:** 7.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N)
- **Ubicación:** `src/app/actions/saraFletesWalletActions.ts` (líneas 100-155 y 298-340)
- **Evidencia Técnica:**
  ```typescript
  // Fragmento vulnerable en debitDriverCommissionAction
  const { data: conductor } = await supabase
    .from('fletes_conductores')
    .select('id, saldo_billetera, plan_id, fletes_planes(comision, nombre)')
    .or(`placa.eq.${request.plate},placa.eq.PBA-1234,placa.eq.LFA-9012`)
    .limit(1)
    .maybeSingle();
  ```
  La consulta busca exclusivamente por la placa enviada en el JSON del cliente (`request.plate`), sin verificar la sesión activa de Supabase (`auth.getUser()`) ni contrastar que `conductor.user_id === user.id`.
- **Impacto:** Cualquier usuario autenticado puede deducir saldo, consultar historial financiero o saldo disponible de cualquier transportista con solo conocer su placa (datos visibles en el mapa público).
- **Remediación:** Enlazar la verificación de sesión en la Server Action:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHORIZED');
  const { data: conductor } = await supabase
    .from('fletes_conductores')
    .select('*')
    .eq('user_id', user.id)
    .single();
  ```

---

#### [SEC-FLT-002] Manipulación de Tarifas Client-Side en Creación de Solicitudes
- **Severidad:** Alta (P1) | **CVSS 3.1:** 7.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N)
- **Ubicación:** `src/lib/fletes-data.ts` (función `createFletesSolicitud`, líneas 120-147)
- **Evidencia Técnica:**
  ```typescript
  export async function createFletesSolicitud(data: {
    origen: string; destino: string; tarifa: number; ...
  }) {
    const { data: sol, error } = await supabase
      .from('fletes_solicitudes')
      .insert({ origen: data.origen, destino: data.destino, tarifa: data.tarifa, status: 'pendiente' })
  ```
  El campo `tarifa` se inserta directamente en la base de datos sin recalcular la distancia ni cotejar con `SaraFreightPricingService.calcularTarifa()`.
- **Impacto:** Un usuario puede enviar una solicitud de flete interprovincial (Quito - Guayaquil) en tractocamión 3S3 por \$1.00 USD en lugar de los \$380.00 USD normativos.
- **Remediación:** Mover el cálculo de tarifa al servidor en una Server Action segura que valide las coordenadas de origen y destino, recalculando la tarifa base y permitiendo ofertas únicamente dentro del rango de negociación estricto ($[-15\%, +30\%]$).

---

#### [SEC-FLT-003] Exposición Innecesaria de Información Personal (PII) en Rastreo Público
- **Severidad:** Media (P2) | **CVSS 3.1:** 5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)
- **Ubicación:** `src/app/fletes/rastreo/[token]/page.tsx`
- **Evidencia Técnica:**
  La página de rastreo satelital despliega el número celular personal del conductor (`+593987654321`) con enlace de llamada directo y botón de WhatsApp público a cualquier persona que posea o adivine el token.
- **Impacto:** Incumplimiento del principio de minimización de datos de la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador. Riesgo de ingeniería social, extorsión a choferes en rutas despobladas o robo de carga.
- **Remediación:** Anonimizar el contacto telefónico mediante enmascaramiento de llamada o proxy telefónico, o requerir un código de acceso secundario (PIN de 4 dígitos) para revelar datos de contacto directo.

---

#### [SEC-FLT-004] Simulación de Pasarela de Pago sin Cumplimiento PCI-DSS
- **Severidad:** Crítica (P0) | **CVSS 3.1:** 8.6 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N)
- **Ubicación:** `src/components/fletes/SaraFreightPaymentGatewayModal.tsx`
- **Evidencia Técnica:**
  El modal solicita número de tarjeta de crédito (PAN), fecha de expiración y código CVV en inputs HTML estándar del navegador:
  ```typescript
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  // ...
  setIsProcessing(true);
  setTimeout(() => { setIsProcessing(false); onPaymentSuccess(...); }, 1500);
  ```
  Los datos de tarjeta no son tokenizados por una pasarela certificada PCI-DSS Nivel 1 (como Stripe Elements o Kushki Token). Si un usuario real introduce datos financieros válidos, estos residen en la memoria del navegador sin cifrado de hardware.
- **Impacto:** Violación flagrante de normas PCI-DSS y riesgo de fuga de datos de tarjetas de crédito.
- **Remediación:** En entornos de demostración, bloquear inputs reales o renderizar un iframe tokenizado oficial (Stripe Elements / Kushki Smartlink). Nunca recopilar campos CVV en state de React propio.

---

#### [SEC-FLT-005] Persistencia de Transacciones Financieras en LocalStorage
- **Severidad:** Alta (P1) | **CVSS 3.1:** 6.5 (AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N)
- **Ubicación:** `src/lib/fletes-data.ts` (función `debitConductorWallet`, líneas 248-255)
- **Evidencia Técnica:**
  ```typescript
  const storageKey = `sara_fletes_rt_wallet_${params.plate}`;
  const rawVal = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
  const prevBalance = rawVal !== null ? Number(rawVal) : 119.00;
  const nuevoSaldo = Math.max(0, +(prevBalance - params.amount).toFixed(2));
  localStorage.setItem(storageKey, nuevoSaldo.toString());
  ```
- **Impacto:** Un transportista puede abrir las herramientas de desarrollador (`F12`), modificar `sara_fletes_rt_wallet_PCX-4590` a \$9999.00 y continuar operando sin pagar comisiones a la plataforma.
- **Remediación:** Eliminar totalmente el uso de `localStorage` como fuente de verdad para saldos financieros. El saldo debe derivarse exclusivamente de la tabla `fletes_conductores` y el libro mayor inmutable `fletes_billetera_transacciones` en Supabase con RLS estricto.
