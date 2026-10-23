---
name: sara-freight-fintech-wallet
description: >-
  Gobernanza de billetera prepago de transportistas pesados, recargas inmediatas (Deuna, Kushki, Payphone),
  débitos transaccionales atómicos con bloqueo FOR UPDATE en PostgreSQL, doble partida contable,
  retenciones SRI (Códigos 344 y 312) y custodia Escrow para fletes industriales de alto valor.
---

# sara-freight-fintech-wallet

## 1. Nombre y Objetivo Estratégico

- **Identificador Único:** `sara-freight-fintech-wallet`
- **Unidad de Negocio:** SARA-FLETES · División FinTech, Pasarelas y Billetera Prepago
- **Objetivo Estratégico:**
  Administrar el ciclo de vida financiero de los transportistas y contratistas en la plataforma SARA-FLETES. Garantiza la integridad de saldos mediante doble partida contable en base de datos protegida con aislamiento transaccional pesimista (`FOR UPDATE`), eliminando cualquier dependencia de almacenamiento en cliente (`localStorage`). Automatiza las recargas prepago mediante botones de pago locales ecuatorianos (Deuna Banco Pichincha, Kushki, Payphone), calcula y aplica las retenciones tributarias en la fuente del SRI del Ecuador (Códigos 344 de Obra Civil y 312 de Materiales), y custodia fondos en Fideicomiso *Escrow* para fletes industriales de gran volumen ($\ge \$10,000\,\text{USD}$ con reporte UAFE RESU).

---

## 2. Marco Normativo y Estándares Financieros

1. **Ley de Régimen Tributario Interno (LRTI) y Resoluciones SRI:**
   - **Código 344 (Servicios de Obra Civil y Transporte Privado de Carga):** Retención del $2.00\%$ de Impuesto a la Renta (IR).
   - **Código 312 (Venta de Materiales de Construcción en Flete Combinado):** Retención del $1.75\%$ de IR.
   - **Tarifa de IVA en Transporte de Carga:** Tarifa $0\%$ de IVA para el servicio de flete (Art. 56 LRTI).
   - **Comisión de Intermediación de Software SARA:** Tarifa $15\%$ de IVA sobre la comisión tecnológica.
   - **Ficha Técnica SRI Comprobantes Electrónicos v2.21:** Clave de acceso de 49 dígitos con algoritmo Módulo 11 ponderado (factores 2 al 7).
2. **Normativa de Prevención de Lavado de Activos (UAFE):**
   - **Umbral RESU ($\ge \$10,000\,\text{USD}$):** Reporte obligatorio mensual de transacciones individuales o acumuladas que igualen o superen el umbral.
   - Debida Diligencia Reforzada (EDD) y cotejo de listas restrictivas (OFAC, ONU, PEPs).
3. **Estándares PCI-DSS y Seguridad Bancaria Zero-Trust:**
   - Cero persistencia de números de tarjeta de crédito en bases de datos de GRUPO SARA (tokenización delegada en Kushki.js / Payphone).
   - Mutaciones financieras restringidas a Server Actions con `idempotency_key` (UUID v4) y transacciones atómicas `ACID` en PostgreSQL.

---

## 3. Arquitectura Transaccional y Modelo de Datos

### 3.1. Modelo Contable de Doble Partida

Toda mutación de saldo genera un registro inmutable en `fletes_billetera_transacciones`:

$$\text{NuevoSaldo} = \text{SaldoAnterior} + \Delta_{\text{Monto}}$$

Donde:
* $\Delta_{\text{Monto}} > 0$ en recargas prepago o reembolsos por cancelación imputable al cliente.
* $\Delta_{\text{Monto}} < 0$ en cobro de comisiones de plataforma ($10\%$ Básico, $20\%$ Estándar, $30\%$ VIP) al aceptar o iniciar la carrera.

### 3.2. Función SQL con Bloqueo Pesimista (`FOR UPDATE`)

```sql
CREATE OR REPLACE FUNCTION public.fn_debitar_comision_conductor_seguro(
    p_user_id UUID,
    p_flete_id UUID,
    p_tarifa_flete NUMERIC(10, 2),
    p_idempotency_key VARCHAR(64)
)
RETURNS JSON AS $$
DECLARE
    v_conductor RECORD;
    v_comision_pct NUMERIC(5, 2);
    v_monto_debito NUMERIC(10, 2);
    v_nuevo_saldo NUMERIC(10, 2);
BEGIN
    -- 1. Bloqueo exclusivo del registro del conductor (Race Condition Prevention)
    SELECT c.id, c.saldo_billetera, COALESCE(p.comision, 10.00) AS comision_pct
    INTO v_conductor
    FROM public.fletes_conductores c
    LEFT JOIN public.fletes_planes p ON c.plan_id = p.id
    WHERE c.user_id = p_user_id
    FOR UPDATE OF c;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'CONDUCTOR_NO_ENCONTRADO';
    END IF;

    -- 2. Cálculo estricto de comisión
    v_comision_pct := v_conductor.comision_pct;
    v_monto_debito := ROUND((p_tarifa_flete * (v_comision_pct / 100.00)), 2);

    -- 3. Invariante de saldo mínimo
    IF v_conductor.saldo_billetera < v_monto_debito THEN
        RAISE EXCEPTION 'SALDO_INSUFICIENTE: Saldo actual ($%), Comisión requerida ($%)',
            v_conductor.saldo_billetera, v_monto_debito;
    END IF;

    v_nuevo_saldo := ROUND((v_conductor.saldo_billetera - v_monto_debito), 2);

    -- 4. Actualización atómica de saldo
    UPDATE public.fletes_conductores
    SET saldo_billetera = v_nuevo_saldo,
        updated_at = NOW()
    WHERE id = v_conductor.id;

    -- 5. Asiento contable inmutable
    INSERT INTO public.fletes_billetera_transacciones (
        conductor_id,
        flete_id,
        tipo_transaccion,
        monto,
        saldo_anterior,
        nuevo_saldo,
        idempotency_key,
        created_at
    ) VALUES (
        v_conductor.id,
        p_flete_id,
        'DEBITO_COMISION',
        v_monto_debito,
        v_conductor.saldo_billetera,
        v_nuevo_saldo,
        p_idempotency_key,
        NOW()
    );

    RETURN json_build_object(
        'success', TRUE,
        'monto_debitado', v_monto_debito,
        'nuevo_saldo', v_nuevo_saldo
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Instrucciones Operativas para los Agentes

### Paso 1: Verificación de Saldo Previo a Notificación en Radar
1. Antes de emitir una solicitud de flete al conductor, el motor de despacho (`dispatchEngine`) debe consultar `fletes_conductores.saldo_billetera`.
2. Si `saldo_billetera < 1.00 USD`, la unidad queda en estado `SALDO_INSUFICIENTE` y no recibe alertas sonoras ni visuales en cabina hasta efectuar una recarga.

### Paso 2: Ejecución de Débito de Comisión al Validar PIN de Inicio
1. Al momento en que el conductor digita y valida el PIN de 4 dígitos proporcionado por el cliente, se invoca la Server Action `debitDriverCommissionAction`.
2. Se envía un `idempotencyKey` único derivado del `fleteId` (`fleteId + "_debit"`).
3. Si el débito es exitoso, se transiciona el viaje a `in_transit` y se emite `FLETE_INICIADO` hacia el cliente.

### Paso 3: Liquidación en Fletes de Alto Valor (Escrow Fiduciario)
1. Para fletes mayores a $\$100\,\text{USD}$ o contratos de acarreo de áridos por volumen, los fondos del cliente se retienen en la cuenta de custodia *Escrow*.
2. La liberación hacia el transportista requiere:
   - Coordenadas GPS del camión dentro de la geocerca de descarga ($r \le 50\,\text{m}$).
   - Firma y registro de cédula del receptor en el acta digital e-POD.
   - Generación de comprobante de retención SRI del $2.00\%$ con clave de acceso válida.
