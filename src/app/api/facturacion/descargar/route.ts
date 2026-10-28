import { NextRequest, NextResponse } from 'next/server';
import { SriEmissionService } from '@/lib/services/sriEmissionService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const claveAcceso = searchParams.get('claveAcceso') || '';
    const tipo = searchParams.get('tipo') || 'xml'; // 'xml' | 'pdf'
    const numero = searchParams.get('numero') || '001-001-000000142';
    const cliente = searchParams.get('cliente') || 'Consumidor Final';
    const identificacionCliente = searchParams.get('identificacion') || '0104567890';
    const emailCliente = searchParams.get('email') || 'cliente@sara.ec';
    const concepto = searchParams.get('concepto') || '';
    const ruc = searchParams.get('ruc') || '1792984512001';
    const razonSocial = searchParams.get('razonSocial') || 'GRUPO SARA INVERSIONES S.A.S.';
    const total = parseFloat(searchParams.get('total') || '100');
    const tarifaIvaParam = searchParams.get('tarifaIva');
    const subtotalParam = searchParams.get('subtotal');
    const ivaParam = searchParams.get('iva');

    const hasCustomBreakdown = Boolean(concepto || subtotalParam || ivaParam || tarifaIvaParam);
    const tarifaIva: 15 | 5 | 0 = tarifaIvaParam === '5' ? 5 : tarifaIvaParam === '0' ? 0 : 15;
    const calcSubtotal = subtotalParam
      ? parseFloat(subtotalParam)
      : +(total / (1 + tarifaIva / 100)).toFixed(2);
    const calcIva = ivaParam
      ? parseFloat(ivaParam)
      : +(total - calcSubtotal).toFixed(2);

    if (tipo === 'pdf') {
      const itemsPdf = hasCustomBreakdown
        ? [
            {
              codigo: 'SARA-001',
              descripcion: concepto || 'Suscripción / Servicio Ecosistema GRUPO SARA',
              cantidad: 1,
              precioUnitario: calcSubtotal,
              descuento: 0,
              ivaTarifa: tarifaIva
            }
          ]
        : [
            {
              codigo: 'SRV-001',
              descripcion: 'Servicios de Fiscalización Técnica de Estructura de Hormigón',
              cantidad: 1,
              precioUnitario: +(total * 0.7).toFixed(2),
              descuento: 0,
              ivaTarifa: 15 as const
            },
            {
              codigo: 'MAT-002',
              descripcion: 'Suministro de Varilla y Materiales (Tarifa 5% Ley Construcción)',
              cantidad: 1,
              precioUnitario: +(total * 0.3).toFixed(2),
              descuento: 0,
              ivaTarifa: 5 as const
            }
          ];

      const doc = SriEmissionService.generarRidePdfBlob({
        claveAcceso: claveAcceso || '2610202601179298451200120010010000001421234567812',
        numeroComprobante: numero,
        fechaAutorizacion: new Date().toISOString(),
        ambiente: 'PRODUCCIÓN (2)',
        emisor: {
          ruc: ruc,
          razonSocial: razonSocial,
          nombreComercial: razonSocial,
          dirMatriz: 'Av. Amazonas y Naciones Unidas, Quito - Ecuador',
          obligadoContabilidad: 'SI',
          regimen: 'Régimen General / Agente de Retención SRI'
        },
        comprador: {
          razonSocial: cliente,
          identificacion: identificacionCliente,
          direccion: 'Ecuador',
          email: emailCliente
        },
        items: itemsPdf,
        subtotal15: hasCustomBreakdown ? (tarifaIva === 15 ? calcSubtotal : 0) : +(total * 0.7).toFixed(2),
        subtotal5: hasCustomBreakdown ? (tarifaIva === 5 ? calcSubtotal : 0) : +(total * 0.3).toFixed(2),
        subtotal0: hasCustomBreakdown ? (tarifaIva === 0 ? calcSubtotal : 0) : 0,
        iva15: hasCustomBreakdown ? (tarifaIva === 15 ? calcIva : 0) : +((total * 0.7) * 0.15).toFixed(2),
        iva5: hasCustomBreakdown ? (tarifaIva === 5 ? calcIva : 0) : +((total * 0.3) * 0.05).toFixed(2),
        totalFactura: hasCustomBreakdown ? +total.toFixed(2) : +(total + ((total * 0.7) * 0.15) + ((total * 0.3) * 0.05)).toFixed(2)
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="RIDE_${numero.replace(/-/g, '_')}.pdf"`
        }
      });
    }

    // GENERAR XML AUTORIZADO POR DEFECTO
    const sec9d = numero.split('-')[2] || '000000142';
    const tipoIdComprador = identificacionCliente === '9999999999999'
      ? '07'
      : identificacionCliente.length === 13
        ? '04'
        : '05';
    const { xml } = SriEmissionService.generarXmlFacturaV21({
      emisor: {
        ruc,
        razonSocial,
        dirMatriz: 'Av. Amazonas y Naciones Unidas, Quito - Ecuador',
        establecimiento: '001',
        puntoEmision: '001',
        ambiente: '2'
      },
      comprador: {
        tipoIdentificacion: tipoIdComprador,
        identificacion: identificacionCliente,
        razonSocial: cliente,
        email: emailCliente
      },
      items: [
        {
          codigo: 'SARA-001',
          descripcion: concepto || 'Servicios Profesionales y Suscripción Ecosistema GRUPO SARA',
          cantidad: 1,
          precioUnitario: hasCustomBreakdown ? calcSubtotal : total,
          descuento: 0,
          ivaTarifa: tarifaIva
        }
      ]
    }, claveAcceso || '2610202601179298451200120010010000001421234567812', sec9d);

    const firmado = SriEmissionService.firmarXmlXadesBes(xml, claveAcceso || '2610202601111111111100120010010000001421234567812', ruc);
    const autorizado = SriEmissionService.generarXmlAutorizadoSRI(firmado, claveAcceso || '2610202601111111111100120010010000001421234567812', '2', new Date().toISOString());

    return new NextResponse(autorizado, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="SRI_${numero.replace(/-/g, '_')}_${claveAcceso}.xml"`
      }
    });
  } catch (error: any) {
    console.error('Error al descargar comprobante SRI:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al generar descarga.' },
      { status: 500 }
    );
  }
}
