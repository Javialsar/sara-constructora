import { NextRequest, NextResponse } from 'next/server';
import { SriEmissionService } from '@/lib/services/sriEmissionService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const claveAcceso = searchParams.get('claveAcceso') || '';
    const tipo = searchParams.get('tipo') || 'xml'; // 'xml' | 'pdf'
    const numero = searchParams.get('numero') || '001-001-000000142';
    const cliente = searchParams.get('cliente') || 'Consumidor Final';
    const ruc = searchParams.get('ruc') || '1111111111001';
    const razonSocial = searchParams.get('razonSocial') || 'RODRIGO ISRAEL BETANCOURT SRANGO';
    const total = parseFloat(searchParams.get('total') || '100');

    if (tipo === 'pdf') {
      const doc = SriEmissionService.generarRidePdfBlob({
        claveAcceso: claveAcceso || '2610202601111111111100120010010000001421234567812',
        numeroComprobante: numero,
        fechaAutorizacion: new Date().toISOString(),
        ambiente: 'PRODUCCIÓN (2)',
        emisor: {
          ruc: ruc,
          razonSocial: razonSocial,
          nombreComercial: razonSocial,
          dirMatriz: 'Av. Amazonas y Naciones Unidas, Quito',
          obligadoContabilidad: 'NO',
          regimen: 'Régimen RIMPE - Negocio Emprendedor'
        },
        comprador: {
          razonSocial: cliente,
          identificacion: '0104567890',
          direccion: 'Quito, Pichincha, Ecuador',
          email: 'cliente@sara.ec'
        },
        items: [
          {
            codigo: 'SRV-001',
            descripcion: 'Servicios de Fiscalización Técnica de Estructura de Hormigón',
            cantidad: 1,
            precioUnitario: +(total * 0.7).toFixed(2),
            descuento: 0,
            ivaTarifa: 15
          },
          {
            codigo: 'MAT-002',
            descripcion: 'Suministro de Varilla y Materiales (Tarifa 5% Ley Construcción)',
            cantidad: 1,
            precioUnitario: +(total * 0.3).toFixed(2),
            descuento: 0,
            ivaTarifa: 5
          }
        ],
        subtotal15: +(total * 0.7).toFixed(2),
        subtotal5: +(total * 0.3).toFixed(2),
        subtotal0: 0,
        iva15: +((total * 0.7) * 0.15).toFixed(2),
        iva5: +((total * 0.3) * 0.05).toFixed(2),
        totalFactura: +(total + ((total * 0.7) * 0.15) + ((total * 0.3) * 0.05)).toFixed(2)
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
    const { xml } = SriEmissionService.generarXmlFacturaV21({
      emisor: {
        ruc,
        razonSocial,
        dirMatriz: 'Av. Amazonas y Naciones Unidas, Quito',
        establecimiento: '001',
        puntoEmision: '001',
        ambiente: '2'
      },
      comprador: {
        tipoIdentificacion: '05',
        identificacion: '0104567890',
        razonSocial: cliente
      },
      items: [
        {
          codigo: 'SRV-001',
          descripcion: 'Servicios Profesionales de Construcción y Fiscalización',
          cantidad: 1,
          precioUnitario: total,
          descuento: 0,
          ivaTarifa: 15
        }
      ]
    }, claveAcceso || '2610202601111111111100120010010000001421234567812', sec9d);

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
