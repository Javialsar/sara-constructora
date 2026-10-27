import { NextRequest, NextResponse } from 'next/server';
import { SriEmissionService, FacturaEmisionInput } from '@/lib/services/sriEmissionService';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const emisor = body.emisor;
    const comprador = body.comprador;
    const items = body.items;

    if (!emisor || !emisor.ruc || emisor.ruc.length !== 13) {
      return NextResponse.json(
        { success: false, error: 'El RUC del emisor es inválido o no tiene 13 dígitos.' },
        { status: 400 }
      );
    }

    if (!comprador || !comprador.identificacion || !comprador.razonSocial) {
      return NextResponse.json(
        { success: false, error: 'Los datos del comprador (identificación y razón social) son requeridos.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe incluir al menos un ítem o servicio en la factura.' },
        { status: 400 }
      );
    }

    const payload: FacturaEmisionInput = {
      emisor: {
        ruc: emisor.ruc.trim(),
        razonSocial: emisor.razonSocial.trim(),
        nombreComercial: emisor.nombreComercial?.trim() || emisor.razonSocial.trim(),
        dirMatriz: emisor.dirMatriz || emisor.direccion || 'Ecuador',
        dirEstablecimiento: emisor.dirEstablecimiento || emisor.dirMatriz || 'Ecuador',
        establecimiento: emisor.establecimiento || '001',
        puntoEmision: emisor.puntoEmision || '001',
        obligadoContabilidad: emisor.obligadoContabilidad || 'NO',
        regimen: emisor.regimen || 'Régimen RIMPE - Negocio Emprendedor',
        ambiente: emisor.ambiente === '1' ? '1' : '2' // 2: Producción por defecto
      },
      comprador: {
        tipoIdentificacion: comprador.tipoIdentificacion || (comprador.identificacion.length === 13 ? '04' : '05'),
        identificacion: comprador.identificacion.trim(),
        razonSocial: comprador.razonSocial.trim(),
        direccion: comprador.direccion?.trim() || 'Ecuador',
        email: comprador.email?.trim() || 'facturacion@gruposara.com',
        telefono: comprador.telefono?.trim() || '0999999999'
      },
      secuencial: body.secuencial || String(Math.floor(100000000 + Math.random() * 900000000)).substring(0, 9),
      fechaEmision: body.fechaEmision ? new Date(body.fechaEmision) : new Date(),
      items: items.map(item => ({
        codigo: item.codigo || 'ITM-01',
        descripcion: item.descripcion || 'Servicio / Bien',
        cantidad: Number(item.cantidad) || 1,
        precioUnitario: Number(item.precioUnitario) || 0,
        descuento: Number(item.descuento) || 0,
        ivaTarifa: item.ivaTarifa === 5 ? 5 : item.ivaTarifa === 0 ? 0 : 15
      })),
      formaPago: body.formaPago || '20'
    };

    // Procesamiento inmediato en línea (Cumplimiento Art. 314 Código Tributario)
    const emisionResult = await SriEmissionService.procesarEmisionInmediata(payload);

    // Intentar persistir en Supabase si la tabla existe
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from('comprobantes_electronicos_sri').insert({
        clave_acceso: emisionResult.claveAcceso,
        numero_comprobante: emisionResult.numeroComprobante,
        ruc_emisor: payload.emisor.ruc,
        razon_social_emisor: payload.emisor.razonSocial,
        identificacion_comprador: payload.comprador.identificacion,
        razon_social_comprador: payload.comprador.razonSocial,
        fecha_emision: new Date().toISOString(),
        total: emisionResult.totalFactura,
        estado: emisionResult.estado,
        ambiente: emisionResult.ambiente,
        xml_autorizado: emisionResult.xmlAutorizado
      });
    } catch (dbErr) {
      // Si la tabla no está creada aún, no detiene la respuesta
      console.warn('Aviso persistencia Supabase comprobante:', dbErr);
    }

    return NextResponse.json({
      success: true,
      mensaje: '¡Factura procesada y AUTORIZADA inmediatamente por el SRI!',
      comprobante: emisionResult
    });
  } catch (error: any) {
    console.error('Error al emitir factura SRI:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en la transmisión inmediata al SRI.' },
      { status: 500 }
    );
  }
}
