import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const generateDocSchema = z.object({
  tipo_documento: z.enum([
    'contrato_obra_civil',
    'promesa_compraventa_inmueble',
    'pliego_especificaciones_sercop',
    'acta_entrega_recepcion_definitiva'
  ]),
  proyecto_id: z.string().uuid().optional().nullable(),
  presupuesto_id: z.string().uuid().optional().nullable(),
  cliente_nombre: z.string().min(3),
  cliente_cedula_ruc: z.string().min(10),
  monto_total: z.number().positive(),
  plazo_dias: z.number().int().positive().default(90),
  ubicacion_inmueble: z.string().min(5),
  linderos_medidas: z.string().optional().default("Norte: 10m con lote 5; Sur: 10m con calle principal; Este: 21m con lote 7; Oeste: 21m con lote 3. Área total: 210 m2.")
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validation = generateDocSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Parámetros inválidos", details: validation.error.flatten() }, { status: 400 })
    }

    const d = validation.data
    const fechaHoy = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })

    let titulo = ""
    let contenidoMarkdown = ""

    if (d.tipo_documento === 'contrato_obra_civil') {
      titulo = `CONTRATO DE CONSTRUCCIÓN DE OBRA CIVIL A PRECIOS UNITARIOS - ${d.cliente_nombre.toUpperCase()}`
      contenidoMarkdown = `# CONTRATO PRIVADO DE CONSTRUCCIÓN DE OBRA CIVIL A PRECIOS UNITARIOS

En la ciudad de Cuenca / Loja, República del Ecuador, al día **${fechaHoy}**, comparecen libre y voluntariamente:

1. **POR UNA PARTE:** El **GRUPO SARA (iaSoft Constructora S.A.S.)**, con RUC institucional habilitado, representada por su Gerente General, en adelante denominada **LA CONTRATISTA**.
2. **POR OTRA PARTE:** El/La Sr./Sra. **${d.cliente_nombre}**, portador(a) de la Cédula/RUC N° **${d.cliente_cedula_ruc}**, domiciliado(a) en **${d.ubicacion_inmueble}**, en adelante denominado(a) **EL CONTRATANTE**.

Las partes convienen celebrar el presente contrato al tenor de las siguientes cláusulas:

### CLÁUSULA PRIMERA: OBJETO DEL CONTRATO
LA CONTRATISTA se obliga para con EL CONTRATANTE a ejecutar a todo costo y bajo la modalidad de Precios Unitarios las obras civiles de edificación, cimentación y acabados según el presupuesto maestro emitido en la plataforma **SARA-APU**.

### CLÁUSULA SEGUNDA: PRECIO Y FORMA DE PAGO
El monto total acordado para la ejecución de la obra civil es de **USD $${d.monto_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}** (Dólares de los Estados Unidos de América) sin incluir IVA.
Los pagos se liquidarán mediante el sistema de **Custodia Escrow de SARA-PAGOS** contra presentación de planillas quincenales validadas en el libro de obra digital de **SARA-FISCALIZA**.

### CLÁUSULA TERCERA: PLAZO DE EJECUCIÓN
El plazo improrrogable para la culminación total y entrega de la obra es de **${d.plazo_dias} días calendario**, contados a partir de la acreditación del anticipo.

### CLÁUSULA CUARTA: CUMPLIMIENTO DE NORMAS TÉCNICAS
LA CONTRATISTA garantiza que todos los materiales y procedimientos estructurales se apegarán a la **Norma Ecuatoriana de la Construcción (NEC-SE-DS)** y ensayos de resistencia de hormigón $f'_c \ge 210 \text{ kg/cm}^2$.

---
**Firmas de Responsabilidad:**

_______________________________                      _______________________________
**GRUPO SARA (iaSoft)**                              **EL CONTRATANTE**
RUC: Oferente Habilitado                             CI/RUC: ${d.cliente_cedula_ruc}
`
    } else if (d.tipo_documento === 'promesa_compraventa_inmueble') {
      titulo = `PROMESA DE COMPRAVENTA DE BIEN INMUEBLE - ${d.cliente_nombre.toUpperCase()}`
      contenidoMarkdown = `# CONTRATO DE PROMESA DE COMPRAVENTA DE LOTE Y RESIDENCIA

Concurren al otorgamiento de la presente Promesa de Compraventa: **GRUPO SARA INMOBILIARIA**, como Promitente Vendedora, y **${d.cliente_nombre}**, CI N° **${d.cliente_cedula_ruc}**, como Promitente Comprador(a).

### PRIMERA: ANTECEDENTES Y LINDEROS
La Promitente Vendedora es legítima propietaria del bien inmueble ubicado en **${d.ubicacion_inmueble}**.
* **Linderos y Cabida:** ${d.linderos_medidas}.
* **Situación Jurídica:** Libre de todo gravamen, hipoteca, embargo o limitación de dominio.

### SEGUNDA: PRECIO PACTADO
El precio de venta convenido es de **USD $${d.monto_total.toLocaleString('en-US', { minimumFractionDigits: 2 })}**, que se cancelará mediante financiamiento hipotecario bancario / BIESS.

---
`
    } else {
      titulo = `ESPECIFICACIONES TÉCNICAS DE OBRA PÚBLICA (SERCOP)`
      contenidoMarkdown = `# PLIEGO DE ESPECIFICACIONES TÉCNICAS SERCOP
* **Objeto:** Construcción de Infraestructura Civil
* **Monto Referencial:** USD $${d.monto_total.toFixed(2)}
* **Plazo Contractual:** ${d.plazo_dias} días
* **Cumplimiento VAE:** Conforme a la matriz oficial de Desagregación Tecnológica de SARA-APU.
`
    }

    // Guardar en la base de datos
    const { data: docCreated, error } = await supabase.from('sara_docs_generados').insert([{
      user_id: user.id,
      proyecto_id: d.proyecto_id || null,
      presupuesto_id: d.presupuesto_id || null,
      titulo,
      variables_inyectadas: d,
      documento_markdown: contenidoMarkdown,
      estado_firma: 'borrador'
    }]).select().single()

    if (error) {
      return NextResponse.json({ error: "Error al registrar documento", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      documento: docCreated,
      markdown: contenidoMarkdown
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Error en SARA-DOCS", message: err.message }, { status: 500 })
  }
}
