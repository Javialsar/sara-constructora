import { NextRequest, NextResponse } from 'next/server';
import { SaraFinancieroService } from '@/lib/services/saraFinancieroService';
import { authenticateProfessionalRequest } from '@/lib/auth/professionalAuthGuard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'summary';
    const proyectoId = searchParams.get('proyecto_id') || undefined;
    const cuentaId = searchParams.get('cuenta_id') || undefined;
    const dias = Number(searchParams.get('dias')) || 30;
    const escenario = (searchParams.get('escenario') as 'base' | 'conservador' | 'optimista') || 'base';

    switch (action) {
      case 'summary': {
        const data = await SaraFinancieroService.getResumenEjecutivo(proyectoId);
        return NextResponse.json({ success: true, data });
      }
      case 'cuentas': {
        const data = await SaraFinancieroService.getCuentasTesoreria();
        return NextResponse.json({ success: true, data });
      }
      case 'movimientos': {
        const data = await SaraFinancieroService.getMovimientosTesoreria(cuentaId);
        return NextResponse.json({ success: true, data });
      }
      case 'cxc': {
        const data = await SaraFinancieroService.getCuentasPorCobrar({ proyectoId });
        return NextResponse.json({ success: true, data });
      }
      case 'cxp': {
        const data = await SaraFinancieroService.getCuentasPorPagar({ proyectoId });
        return NextResponse.json({ success: true, data });
      }
      case 'proyectos': {
        const data = await SaraFinancieroService.getFinanzasPorProyecto(proyectoId);
        return NextResponse.json({ success: true, data });
      }
      case 'flujo-caja': {
        const data = await SaraFinancieroService.getFlujoCajaPrevision(dias as any, escenario);
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json({ error: `Acción desconocida: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error en GET /api/financiero:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificación de Seguridad Zero-Trust: Autenticación Obligatoria para Mutaciones Financieras
    const auth = await authenticateProfessionalRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'No autorizado: Se requiere sesión activa para operaciones financieras.' },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'transferir': {
        const { origenId, destinoId, monto, concepto, referencia } = body;
        const res = await SaraFinancieroService.transferirEntreCuentas(
          origenId,
          destinoId,
          Number(monto),
          concepto || `Transferencia autorizada por ${auth.user.email}`,
          referencia || `TRF-${Date.now()}`
        );
        return NextResponse.json(res);
      }

      case 'crear_cxc': {
        const nuevaCxc = await SaraFinancieroService.crearCuentaPorCobrar({
          clienteId: body.clienteId || 'cli-general',
          clienteNombre: body.clienteNombre,
          proyectoId: body.proyectoId,
          proyectoNombre: body.proyectoNombre,
          concepto: body.concepto,
          numeroDocumento: body.numeroDocumento,
          tipoDocumento: body.tipoDocumento || 'factura_venta',
          fechaEmision: body.fechaEmision || new Date().toISOString().split('T')[0],
          fechaVencimiento: body.fechaVencimiento,
          montoTotal: Number(body.montoTotal)
        });
        return NextResponse.json({ success: true, data: nuevaCxc });
      }

      case 'abono_cxc': {
        const { cuentaCobrarId, montoAbono, cuentaTesoreriaId, metodo, referencia } = body;
        const res = await SaraFinancieroService.registrarAbonoCliente(
          cuentaCobrarId,
          Number(montoAbono),
          cuentaTesoreriaId,
          metodo || 'transferencia',
          referencia || `REC-${Date.now()}`
        );
        return NextResponse.json({ success: true, data: res });
      }

      case 'crear_cxp': {
        const nuevaCxp = await SaraFinancieroService.crearCuentaPorPagar({
          proveedorId: body.proveedorId || 'prov-general',
          proveedorNombre: body.proveedorNombre,
          proveedorRuc: body.proveedorRuc || '0990000000001',
          proyectoId: body.proyectoId,
          proyectoNombre: body.proyectoNombre,
          ordenCompraId: body.ordenCompraId,
          numeroFactura: body.numeroFactura,
          descripcion: body.descripcion,
          fechaEmision: body.fechaEmision || new Date().toISOString().split('T')[0],
          fechaVencimiento: body.fechaVencimiento,
          subtotal: Number(body.subtotal),
          aplicaIva15: body.aplicaIva15 !== false,
          tipoGasto: body.tipoGasto || 'materiales'
        });
        return NextResponse.json({ success: true, data: nuevaCxp });
      }

      case 'pago_cxp': {
        const { cuentaPagarId, montoPago, cuentaTesoreriaId, metodo, referencia } = body;
        const res = await SaraFinancieroService.registrarPagoProveedor(
          cuentaPagarId,
          Number(montoPago),
          cuentaTesoreriaId,
          metodo || 'transferencia',
          referencia || `EGR-${Date.now()}`
        );
        return NextResponse.json({ success: true, data: res });
      }

      case 'conciliar': {
        const { cuentaId, extracto } = body;
        const res = await SaraFinancieroService.conciliarExtractoBancario(
          cuentaId,
          extracto || []
        );
        return NextResponse.json({ success: true, data: res });
      }

      default:
        return NextResponse.json({ error: `Acción POST no soportada: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error en POST /api/financiero:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authenticateProfessionalRequest(request);
  if (!auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'No autorizado' },
      { status: auth.status || 401 }
    );
  }
  return NextResponse.json(
    { success: false, error: 'Método PUT no implementado en API Financiero.' },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateProfessionalRequest(request);
  if (!auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'No autorizado' },
      { status: auth.status || 401 }
    );
  }
  return NextResponse.json(
    { success: false, error: 'Método DELETE no permitido en registros de tesorería y contabilidad auditados.' },
    { status: 405 }
  );
}
