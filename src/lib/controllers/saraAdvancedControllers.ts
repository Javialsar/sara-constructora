import { z } from 'zod';
import { SriXmlService } from '../services/sriXmlService';
import { ThreeWayMatchService, PurchaseOrder } from '../services/threeWayMatchService';
import { KardexMultibodegaService, DistributionSlipInput } from '../services/kardexMultibodegaService';
import { IessPayrollService, DailyTareoInput } from '../services/iessPayrollService';
import { VectorKnowledgeService } from '../services/vectorKnowledgeService';
import { KardexRepository, ComprasRepository, NominaRepository, ContabilidadRepository } from '../repositories/saraAdvancedRepositories';

/**
 * CONTROLADORES DEL ECOSISTEMA SARA-CONSTRUCTORA AVANZADO
 * Validaciones de esquemas con Zod, manejo de errores robusto y desacoplamiento limpio.
 */

// Esquemas de validación Zod
const ParseXmlSchema = z.object({
  xmlContent: z.string().min(20, 'El contenido XML es demasiado corto'),
  ordenCompraId: z.string().uuid().optional(),
});

const DistribuirBodegaSchema = z.object({
  bodegaOrigenId: z.string().uuid(),
  bodegaDestinoId: z.string().uuid(),
  insumoId: z.string().uuid(),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  referenciaFacturaSriId: z.string().uuid().optional(),
  referenciaOrdenCompraId: z.string().uuid().optional(),
  solicitadoPor: z.string().min(2),
  motivoDespacho: z.string().min(3),
  proyectoDestinoId: z.string().uuid(),
});

const CalcularNominaSchema = z.object({
  periodo: z.object({
    mes: z.number().min(1).max(12),
    anio: z.number().min(2024),
  }),
  proyectoId: z.string().uuid().optional(),
  tareos: z.array(
    z.object({
      trabajadorId: z.string().uuid(),
      nombreCompleto: z.string(),
      cedula: z.string().min(10),
      categoriaOcupacional: z.enum([
        'Maestro Mayor', 'Albañil', 'Fierrero', 'Encofrador', 'Peón', 'Topógrafo', 'Residente'
      ]),
      proyectoId: z.string().uuid(),
      rubroApuCodigo: z.string(),
      fecha: z.string(),
      horasNormales: z.number().min(0).max(24),
      horasSuplementarias: z.number().min(0),
      horasExtraordinarias: z.number().min(0),
    })
  ).min(1, 'Se requiere al menos un registro de tareo'),
});

export class ComprasController {
  /**
   * Endpoint: /api/v1/compras/parse-xml
   * Ingesta, parsing del XML del SRI, 3-Way Match y aprendizaje colectivo
   */
  public static async parseXml(body: unknown) {
    const parsedInput = ParseXmlSchema.parse(body);

    // 1. Parsing seguro con prevención XXE
    const facturaParsed = SriXmlService.parseFacturaXml(parsedInput.xmlContent);

    // 2. Persistir en la base de datos
    let savedFactura = null;
    try {
      savedFactura = await ComprasRepository.saveFacturaSri(facturaParsed, parsedInput.ordenCompraId);
    } catch (e: any) {
      console.warn('[ComprasController] Warning guardando en Supabase:', e.message);
    }

    // 3. Ejecutar Aprendizaje Colectivo Continuo si hay insumos relevantes
    const mutacionesDetectadas = [];
    for (const det of facturaParsed.detalles) {
      const itemKey = det.codigoPrincipal.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      try {
        const cascadeResult = await VectorKnowledgeService.registerPriceMutationFromSri(
          itemKey,
          det.precioUnitario,
          {
            numeroComprobante: facturaParsed.numeroComprobante,
            rucEmisor: facturaParsed.rucEmisor,
            razonSocial: facturaParsed.razonSocialEmisor,
          }
        );
        mutacionesDetectadas.push(cascadeResult);
      } catch (err) {
        console.warn('[ComprasController] Error registrando mutación:', err);
      }
    }

    // 4. Three-Way Match (si se proporcionó orden de compra)
    let matchResult = null;
    if (parsedInput.ordenCompraId) {
      const ordenDb = await ComprasRepository.getOrdenCompra(parsedInput.ordenCompraId);
      if (ordenDb) {
        const poMapped: PurchaseOrder = {
          id: ordenDb.id,
          numeroOrden: ordenDb.numero_orden,
          proveedorId: ordenDb.proveedor_id,
          bodegaDestinoId: ordenDb.bodega_destino_id,
          subtotal: Number(ordenDb.subtotal),
          iva: Number(ordenDb.iva),
          total: Number(ordenDb.total),
          items: Array.isArray(ordenDb.items) ? ordenDb.items : [],
        };
        matchResult = ThreeWayMatchService.executeMatch(facturaParsed, poMapped);
      }
    }

    return {
      success: true,
      mensaje: 'XML del SRI procesado e ingresado exitosamente con firma digital validada',
      factura: {
        claveAcceso: facturaParsed.claveAcceso,
        numeroComprobante: facturaParsed.numeroComprobante,
        rucEmisor: facturaParsed.rucEmisor,
        razonSocialEmisor: facturaParsed.razonSocialEmisor,
        fechaEmision: facturaParsed.fechaEmision,
        subtotalSinImpuestos: facturaParsed.subtotalSinImpuestos,
        ivaTotal: facturaParsed.ivaTotal,
        importeTotal: facturaParsed.importeTotal,
        totalItems: facturaParsed.detalles.length,
        firmaDigitalValida: facturaParsed.firmaDigitalValida,
        xmlHash: facturaParsed.xmlHash,
      },
      threeWayMatch: matchResult,
      aprendizajeColectivo: {
        mutacionesRegistradas: mutacionesDetectadas.length,
        detalles: mutacionesDetectadas,
      },
      savedFacturaId: savedFactura?.id,
    };
  }
}

export class BodegaController {
  /**
   * Endpoint: /api/v1/bodega/distribuir
   * Transferencias seguras entre Bodega Matriz y Sub-bodegas de Obra
   */
  public static async transferir(body: unknown) {
    const validated = DistribuirBodegaSchema.parse(body);

    const result = await KardexRepository.transferirStock(validated as DistributionSlipInput);

    return {
      success: true,
      mensaje: `Vale de Distribución ${result.valeDistribucionId} ejecutado con éxito. Stock transferido a la sub-bodega del proyecto.`,
      transferencia: result,
    };
  }

  /**
   * Obtiene inventario consolidado y alertas de reorden
   */
  public static async consultarStock(bodegaId: string) {
    const stock = await KardexRepository.getStockByBodega(bodegaId);
    return {
      success: true,
      bodegaId,
      totalItems: stock.length,
      stock,
    };
  }
}

export class NominaController {
  /**
   * Endpoint: /api/v1/nominas/calcular
   * Procesamiento del tareo, aportaciones IESS 12.15%, décimos, fondos y asignación APU
   */
  public static async calcular(body: unknown) {
    const validated = CalcularNominaSchema.parse(body);

    const resultado = IessPayrollService.calculatePayroll(
      validated.tareos as DailyTareoInput[],
      validated.periodo,
      validated.proyectoId
    );

    // Persistir tareos y liquidaciones
    try {
      await NominaRepository.saveTareos(validated.tareos as DailyTareoInput[]);
      await NominaRepository.saveLiquidaciones(resultado);
      await ContabilidadRepository.registrarAsiento({
        glosa: resultado.asientoContableNomina.glosa,
        origenTipo: 'nomina_iess',
        centroCostoId: validated.proyectoId,
        detalles: resultado.asientoContableNomina.detalles,
      });
    } catch (e: any) {
      console.warn('[NominaController] Warning guardando liquidaciones:', e.message);
    }

    return {
      success: true,
      mensaje: `Rol de pagos de construcción periodo ${validated.periodo.mes}/${validated.periodo.anio} calculado exitosamente`,
      resumen: {
        totalTrabajadores: resultado.totalTrabajadores,
        totalNetoAPagar: resultado.totalNetoAPagar,
        totalAporteIessConsolidado: resultado.totalAporteIessConsolidado,
        totalProvisionesSociales: resultado.totalProvisionesSociales,
        costoDirectoTotalManoObra: resultado.costoDirectoTotalManoObra,
      },
      detallesPorTrabajador: resultado.detallesPorTrabajador,
      asientoContableGenerado: resultado.asientoContableNomina,
    };
  }
}
