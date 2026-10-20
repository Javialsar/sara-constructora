import { SriFacturaParsed } from './sriXmlService';

/**
 * SERVICIO THREE-WAY MATCH & GENERADOR DE RETENCIONES TRIBUTARIAS SRI
 * Realiza la conciliación tridimensional: Factura SRI vs Orden de Compra vs Ingreso de Bodega.
 * Tolerancia matemática estricta: <= 1.0%
 */

export interface PurchaseOrderItem {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  numeroOrden: string;
  proveedorId: string;
  proyectoId?: string;
  bodegaDestinoId: string;
  subtotal: number;
  iva: number;
  total: number;
  items: PurchaseOrderItem[];
}

export interface WarehouseReceiptItem {
  insumoId: string;
  codigo: string;
  cantidadRecibida: number;
  costoUnitarioPactado: number;
}

export interface WarehouseReceipt {
  movimientoId: string;
  bodegaId: string;
  items: WarehouseReceiptItem[];
  fechaRecepcion: string;
}

export interface DiscrepancyDetail {
  campo: 'PRECIO' | 'CANTIDAD' | 'SUBTOTAL';
  itemCodigo: string;
  valorFactura: number;
  valorEsperado: number;
  diferenciaAbsoluta: number;
  varianzaPorcentaje: number;
  toleranciaExcedida: boolean;
}

export interface SriRetentionProposal {
  codigoRetencionRenta: string;
  descripcionRenta: string;
  baseImponibleRenta: number;
  porcentajeRenta: number;
  valorRetenidoRenta: number;
  codigoRetencionIva: string;
  descripcionIva: string;
  baseImponibleIva: number;
  porcentajeIva: number;
  valorRetenidoIva: number;
  totalRetenido: number;
  valorNetoAPagar: number;
}

export interface AccountingEntryProposal {
  glosa: string;
  totalDebe: number;
  totalHaber: number;
  asientoCuadrado: boolean;
  detalles: Array<{
    codigoCuenta: string;
    nombreCuenta: string;
    debito: number;
    credito: number;
    centroCostoCodigo?: string;
  }>;
}

export interface ThreeWayMatchResult {
  status: 'MATCHED_SUCCESS' | 'DISCREPANCY_ALERT';
  toleranciaPermitidaPct: number;
  varianzaMaximaDetectadaPct: number;
  discrepancias: DiscrepancyDetail[];
  retencionPropuesta: SriRetentionProposal;
  asientoPropuesto: AccountingEntryProposal;
  resumenFinanciero: {
    subtotalFactura: number;
    ivaFactura: number;
    totalFactura: number;
    subtotalOrden: number;
    totalOrden: number;
  };
}

export class ThreeWayMatchService {
  private static readonly MAX_TOLERANCE_PCT = 1.0; // Máximo 1% de tolerancia legal y operativa

  /**
   * Ejecuta la validación Three-Way Match y genera la liquidación contable/tributaria
   */
  public static executeMatch(
    factura: SriFacturaParsed,
    orden: PurchaseOrder,
    recepcion?: WarehouseReceipt,
    tipoBienServicio: 'MATERIALES_CONSTRUCCION' | 'CONTRATO_OBRA_CIVIL' | 'HONORARIOS_TECNICOS' = 'MATERIALES_CONSTRUCCION'
  ): ThreeWayMatchResult {
    const discrepancias: DiscrepancyDetail[] = [];
    let varianzaMaxima = 0;

    // 1. Comparación a nivel de totales
    const deltaSubtotal = Math.abs(factura.subtotalSinImpuestos - orden.subtotal);
    const varSubtotalPct = orden.subtotal > 0 ? +( (deltaSubtotal / orden.subtotal) * 100 ).toFixed(2) : 0;
    if (varSubtotalPct > varianzaMaxima) varianzaMaxima = varSubtotalPct;

    if (varSubtotalPct > this.MAX_TOLERANCE_PCT) {
      discrepancias.push({
        campo: 'SUBTOTAL',
        itemCodigo: 'GLOBAL',
        valorFactura: factura.subtotalSinImpuestos,
        valorEsperado: orden.subtotal,
        diferenciaAbsoluta: +deltaSubtotal.toFixed(4),
        varianzaPorcentaje: varSubtotalPct,
        toleranciaExcedida: true,
      });
    }

    // 2. Comparación línea por línea (Factura vs Orden)
    for (const itemFactura of factura.detalles) {
      const itemOrden = orden.items.find(
        i => i.codigo.toLowerCase() === itemFactura.codigoPrincipal.toLowerCase() ||
             i.descripcion.toLowerCase().includes(itemFactura.descripcion.toLowerCase()) ||
             itemFactura.descripcion.toLowerCase().includes(i.descripcion.toLowerCase())
      );

      if (itemOrden) {
        // Varianza de Precio Unitario
        const deltaPrecio = Math.abs(itemFactura.precioUnitario - itemOrden.precioUnitario);
        const varPrecioPct = itemOrden.precioUnitario > 0
          ? +( (deltaPrecio / itemOrden.precioUnitario) * 100 ).toFixed(2)
          : 0;

        if (varPrecioPct > varianzaMaxima) varianzaMaxima = varPrecioPct;

        if (varPrecioPct > this.MAX_TOLERANCE_PCT) {
          discrepancias.push({
            campo: 'PRECIO',
            itemCodigo: itemFactura.codigoPrincipal,
            valorFactura: itemFactura.precioUnitario,
            valorEsperado: itemOrden.precioUnitario,
            diferenciaAbsoluta: +deltaPrecio.toFixed(4),
            varianzaPorcentaje: varPrecioPct,
            toleranciaExcedida: true,
          });
        }

        // Varianza de Cantidad
        const deltaCant = Math.abs(itemFactura.cantidad - itemOrden.cantidad);
        const varCantPct = itemOrden.cantidad > 0
          ? +( (deltaCant / itemOrden.cantidad) * 100 ).toFixed(2)
          : 0;

        if (varCantPct > varianzaMaxima) varianzaMaxima = varCantPct;

        if (varCantPct > this.MAX_TOLERANCE_PCT) {
          discrepancias.push({
            campo: 'CANTIDAD',
            itemCodigo: itemFactura.codigoPrincipal,
            valorFactura: itemFactura.cantidad,
            valorEsperado: itemOrden.cantidad,
            diferenciaAbsoluta: +deltaCant.toFixed(4),
            varianzaPorcentaje: varCantPct,
            toleranciaExcedida: true,
          });
        }
      }
    }

    // 3. Comparación con Recepción Física de Bodega (si está provista)
    if (recepcion && recepcion.items.length > 0) {
      for (const itemRecibido of recepcion.items) {
        const itemFactura = factura.detalles.find(
          d => d.codigoPrincipal.toLowerCase() === itemRecibido.codigo.toLowerCase()
        );

        if (itemFactura) {
          const deltaRecepcion = Math.abs(itemFactura.cantidad - itemRecibido.cantidadRecibida);
          const varRecepcionPct = itemRecibido.cantidadRecibida > 0
            ? +( (deltaRecepcion / itemRecibido.cantidadRecibida) * 100 ).toFixed(2)
            : 0;

          if (varRecepcionPct > this.MAX_TOLERANCE_PCT) {
            discrepancias.push({
              campo: 'CANTIDAD',
              itemCodigo: `BODEGA-${itemRecibido.codigo}`,
              valorFactura: itemFactura.cantidad,
              valorEsperado: itemRecibido.cantidadRecibida,
              diferenciaAbsoluta: +deltaRecepcion.toFixed(4),
              varianzaPorcentaje: varRecepcionPct,
              toleranciaExcedida: true,
            });
          }
        }
      }
    }

    const status: ThreeWayMatchResult['status'] =
      discrepancias.length === 0 ? 'MATCHED_SUCCESS' : 'DISCREPANCY_ALERT';

    // 4. Calcular Propuesta de Retención del SRI (LRTI Ecuador)
    const retencionPropuesta = this.calculateSriWithholding(factura, tipoBienServicio);

    // 5. Construir Asiento Contable Automático
    const asientoPropuesto = this.buildAccountingJournal(factura, retencionPropuesta, orden.numeroOrden);

    return {
      status,
      toleranciaPermitidaPct: this.MAX_TOLERANCE_PCT,
      varianzaMaximaDetectadaPct: varianzaMaxima,
      discrepancias,
      retencionPropuesta,
      asientoPropuesto,
      resumenFinanciero: {
        subtotalFactura: factura.subtotalSinImpuestos,
        ivaFactura: factura.ivaTotal,
        totalFactura: factura.importeTotal,
        subtotalOrden: orden.subtotal,
        totalOrden: orden.total,
      },
    };
  }

  /**
   * Determina códigos y montos de retención bajo la normativa del SRI
   */
  private static calculateSriWithholding(
    factura: SriFacturaParsed,
    tipoBienServicio: 'MATERIALES_CONSTRUCCION' | 'CONTRATO_OBRA_CIVIL' | 'HONORARIOS_TECNICOS'
  ): SriRetentionProposal {
    let codigoRenta = '312';
    let descRenta = 'Transferencia de bienes muebles de naturaleza corporal (Materiales)';
    let pctRenta = 1.75;
    let pctIva = 30.0;
    let descIva = 'Retención 30% IVA Bienes Muebles';

    if (tipoBienServicio === 'CONTRATO_OBRA_CIVIL') {
      codigoRenta = '344';
      descRenta = 'Contratos de construcción de obra material inmueble (Art. 28 LRTI)';
      pctRenta = 2.00;
      pctIva = 30.0;
      descIva = 'Retención 30% IVA Contratos de Construcción';
    } else if (tipoBienServicio === 'HONORARIOS_TECNICOS') {
      codigoRenta = '303';
      descRenta = 'Honorarios profesionales y consultoría técnica';
      pctRenta = 10.0;
      pctIva = 100.0;
      descIva = 'Retención 100% IVA Honorarios Profesionales';
    }

    // Reglas especiales según régimen tributario del emisor (SRI Ecuador)
    if (factura.tipoEmisor === 'CONTRIBUYENTE_ESPECIAL' || factura.tipoEmisor === 'GRAN_CONTRIBUYENTE') {
      pctIva = 0.0;
      descIva = 'Exento de retención de IVA (Emisor Calificado Especial/Gran Contribuyente)';
    } else if (factura.tipoEmisor === 'RIMPE_EMPRENDEDOR') {
      codigoRenta = '343';
      descRenta = 'Actividades empresariales sujetas a Régimen RIMPE Emprendedor';
      pctRenta = 1.00;
      pctIva = 0.0;
      descIva = 'Retención 0% IVA Régimen RIMPE Emprendedor';
    } else if (factura.tipoEmisor === 'RIMPE_POPULAR') {
      codigoRenta = '332';
      descRenta = 'Negocio Popular RIMPE (Retención 0% IR e IVA)';
      pctRenta = 0.0;
      pctIva = 0.0;
      descIva = 'Retención 0% IVA Negocio Popular RIMPE';
    }

    const baseImponibleRenta = factura.subtotalSinImpuestos;
    const valorRetenidoRenta = +(baseImponibleRenta * (pctRenta / 100)).toFixed(4);

    const baseImponibleIva = factura.ivaTotal;
    const valorRetenidoIva = +(baseImponibleIva * (pctIva / 100)).toFixed(4);

    const totalRetenido = +(valorRetenidoRenta + valorRetenidoIva).toFixed(4);
    const valorNetoAPagar = +(factura.importeTotal - totalRetenido).toFixed(4);

    return {
      codigoRetencionRenta: codigoRenta,
      descripcionRenta: descRenta,
      baseImponibleRenta,
      porcentajeRenta: pctRenta,
      valorRetenidoRenta,
      codigoRetencionIva: pctIva > 0 ? (pctIva === 30 ? '1' : pctIva === 70 ? '2' : '3') : '0',
      descripcionIva: descIva,
      baseImponibleIva,
      porcentajeIva: pctIva,
      valorRetenidoIva,
      totalRetenido,
      valorNetoAPagar,
    };
  }

  /**
   * Genera el asiento contable por partida doble
   */
  private static buildAccountingJournal(
    factura: SriFacturaParsed,
    retencion: SriRetentionProposal,
    numeroOrden: string
  ): AccountingEntryProposal {
    const glosa = `Compra s/factura SRI ${factura.numeroComprobante} (${factura.razonSocialEmisor}) vinculada a OC ${numeroOrden}`;
    
    // Debe:
    // 1.1.04.01 - Inventario Bodega Matriz (Activo)
    // 1.1.06.01 - Crédito Tributario IVA Compras
    const debitoInventario = factura.subtotalSinImpuestos;
    const debitoIva = factura.ivaTotal;
    const totalDebe = +(debitoInventario + debitoIva).toFixed(4);

    // Haber:
    // 2.1.01.01 - Cuentas por Pagar Proveedores Comerciales (Neto)
    // 2.1.03.01 - Retención en la Fuente IR por Pagar
    // 2.1.04.01 - Retención en la Fuente IVA por Pagar
    const creditoProveedoresNeto = retencion.valorNetoAPagar;
    const creditoRetRenta = retencion.valorRetenidoRenta;
    const creditoRetIva = retencion.valorRetenidoIva;
    const totalHaber = +(creditoProveedoresNeto + creditoRetRenta + creditoRetIva).toFixed(4);

    const detalles = [
      {
        codigoCuenta: '1.1.04.01',
        nombreCuenta: 'Inventario Materiales Bodega Matriz',
        debito: debitoInventario,
        credito: 0,
      },
      {
        codigoCuenta: '1.1.06.01',
        nombreCuenta: 'Crédito Tributario IVA Compras',
        debito: debitoIva,
        credito: 0,
      },
      {
        codigoCuenta: '2.1.01.01',
        nombreCuenta: `Proveedores por Pagar (${factura.razonSocialEmisor})`,
        debito: 0,
        credito: creditoProveedoresNeto,
      },
      {
        codigoCuenta: '2.1.03.01',
        nombreCuenta: `Retención IR Fuente ${retencion.codigoRetencionRenta} (${retencion.porcentajeRenta}%)`,
        debito: 0,
        credito: creditoRetRenta,
      },
      {
        codigoCuenta: '2.1.04.01',
        nombreCuenta: `Retención IVA Fuente (${retencion.porcentajeIva}%)`,
        debito: 0,
        credito: creditoRetIva,
      },
    ];

    const asientoCuadrado = Math.abs(totalDebe - totalHaber) < 0.001;

    return {
      glosa,
      totalDebe,
      totalHaber,
      asientoCuadrado,
      detalles,
    };
  }

  // =========================================================================
  // GESTIÓN DE ÓRDENES DE DEVOLUCIÓN & DISCREPANCIAS DE BODEGA PARA CONTABILIDAD
  // =========================================================================
  private static mockDevolucionesMemoria: OrdenDevolucionContable[] = [
    {
      id: 'DEV-001',
      numeroDevolucion: 'DEV-PROV-2026-004',
      numeroOCReferencia: 'OC-2026-068',
      numeroFacturaSRI: '001-002-000849301',
      proveedor: 'HOLCIM ECUADOR S.A.',
      rucProveedor: '0990004589001',
      guiaRemision: 'GR-001-09845',
      fecha: '2026-10-12',
      hora: '10:45',
      responsableBodega: 'Ing. David Sarango (Jefe de Bodega)',
      transportista: 'Transportes Pesados del Austro Cía. Ltda. (Chofer: Wilson Loaiza)',
      placaVehiculo: 'LBA-8842',
      items: [
        {
          insumoCodigo: 'INS-CEM-001',
          insumoNombre: 'Cemento Holcim Fuerte 50kg',
          unidad: 'Saco',
          cantidadPedida: 800,
          cantidadIngresada: 740,
          cantidadFaltante: 20,
          cantidadDefectuosa: 40,
          motivo: '40 sacos con endurecimiento/fraguado previo por humedad en plataforma de camión + 20 sacos faltantes en fardo.',
          costoUnitario: 7.45,
          subtotalDescuento: 447.00,
        }
      ],
      totalDescuentoUSD: 447.00,
      totalSubtotalAceptadoUSD: 5513.00,
      estado: 'DESCUENTO_APLICADO_FACTURA',
      accionContable: {
        fechaAplicacion: '2026-10-13 14:30',
        facturaOriginalMonto: 5960.00,
        descuentoAplicado: 447.00,
        facturaAjustadaMonto: 5513.00,
        observacionContador: 'Descuento ejecutado contra Factura SRI 001-002-000849301 según Acta de Devolución DEV-PROV-2026-004. Se retuvo el pago de $447.00 no ingresados.',
        asientoDescuentoGenerado: true
      }
    }
  ];

  public static getDevoluciones(): OrdenDevolucionContable[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sara_ordenes_devolucion_contabilidad');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error al leer devoluciones de localStorage:', e);
      }
    }
    return this.mockDevolucionesMemoria;
  }

  public static registrarDevolucion(dev: OrdenDevolucionContable): void {
    const list = this.getDevoluciones();
    const updated = [dev, ...list.filter(d => d.id !== dev.id)];
    this.mockDevolucionesMemoria = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sara_ordenes_devolucion_contabilidad', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al guardar devolución en localStorage:', e);
      }
    }
  }

  public static aplicarDescuentoContable(
    devId: string, 
    observacionContador: string,
    facturaOriginalMonto: number
  ): OrdenDevolucionContable | null {
    const list = this.getDevoluciones();
    const dev = list.find(d => d.id === devId);
    if (!dev) return null;

    dev.estado = 'DESCUENTO_APLICADO_FACTURA';
    dev.accionContable = {
      fechaAplicacion: new Date().toLocaleString('es-EC'),
      facturaOriginalMonto: facturaOriginalMonto,
      descuentoAplicado: dev.totalDescuentoUSD,
      facturaAjustadaMonto: Math.max(0, facturaOriginalMonto - dev.totalDescuentoUSD),
      observacionContador: observacionContador || `Descuento de $${dev.totalDescuentoUSD.toFixed(2)} aplicado formalmente a la factura del proveedor por mercadería no ingresada.`,
      asientoDescuentoGenerado: true
    };

    this.mockDevolucionesMemoria = list;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sara_ordenes_devolucion_contabilidad', JSON.stringify(list));
      } catch (e) {
        console.error('Error actualizando devolución en localStorage:', e);
      }
    }
    return dev;
  }

  public static notificarProveedor(devId: string): OrdenDevolucionContable | null {
    const list = this.getDevoluciones();
    const dev = list.find(d => d.id === devId);
    if (!dev) return null;

    dev.estado = 'NOTIFICADO_PROVEEDOR';
    this.mockDevolucionesMemoria = list;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sara_ordenes_devolucion_contabilidad', JSON.stringify(list));
      } catch (e) {
        console.error('Error actualizando devolución en localStorage:', e);
      }
    }
    return dev;
  }
}

export interface ItemDevolucionContable {
  insumoCodigo: string;
  insumoNombre: string;
  unidad: string;
  cantidadPedida: number;
  cantidadIngresada: number;
  cantidadFaltante: number;
  cantidadDefectuosa: number;
  motivo: string;
  costoUnitario: number;
  subtotalDescuento: number;
}

export interface OrdenDevolucionContable {
  id: string;
  numeroDevolucion: string;
  numeroOCReferencia: string;
  numeroFacturaSRI?: string;
  proveedor: string;
  rucProveedor: string;
  guiaRemision: string;
  fecha: string;
  hora: string;
  responsableBodega: string;
  transportista: string;
  placaVehiculo: string;
  items: ItemDevolucionContable[];
  totalDescuentoUSD: number;
  totalSubtotalAceptadoUSD: number;
  estado: 'PENDIENTE_NOTIFICACION' | 'NOTIFICADO_PROVEEDOR' | 'DESCUENTO_APLICADO_FACTURA';
  accionContable?: {
    fechaAplicacion: string;
    facturaOriginalMonto: number;
    descuentoAplicado: number;
    facturaAjustadaMonto: number;
    observacionContador: string;
    asientoDescuentoGenerado: boolean;
  };
}
