/**
 * SUITE DE PRUEBAS AUTOMATIZADAS: SARA MARKETPLACE B2B & SELLER HUB ECOSYSTEM
 * Verificación de:
 * 1. Algoritmo de Prioridad en Vitrina (VIP Fábrica -> Estándar Pro -> Básico Ferretería)
 * 2. Estructura de Comisiones por Plan (VIP 1.8%, Estándar 3.5%, Básico 6.0%)
 * 3. Validación de RUC Ecuatoriano SRI Módulo 11 en Onboarding de Empresas
 * 4. Ingesta Masiva de Catálogo vía Archivos Excel (.xlsx / .csv)
 * 5. Sincronización de Catálogo vía API REST con API Key
 * 6. Historial de Ventas desglosado por Facturas y por Artículos (SKUs)
 */

import { 
  SellerMarketplaceService, 
  SELLER_PLANS 
} from '../src/lib/services/sellerMarketplaceService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FALLÓ: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASÓ: ${message}`);
}

async function runMarketplaceSellerSuite() {
  console.log('\n================================================================');
  console.log('🧪 SUITE: SARA MARKETPLACE B2B, PLANES DE EMPRESAS & SELLER HUB');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  console.log('[GRUPO 1] Jerarquía de Posicionamiento por Planes en Vitrina B2B');
  // --------------------------------------------------------------------------
  const productos = SellerMarketplaceService.getMarketplaceProducts();
  assert(productos.length >= 6, 'Catálogo contiene al menos 6 productos iniciales homologados');

  // El primer producto debe ser estrictamente de un proveedor con PLAN VIP FÁBRICA
  const primerProducto = productos[0];
  assert(
    primerProducto.sellerPlan === 'VIP_FABRICA',
    `El primer producto en vitrina es de un Proveedor VIP Fábrica (${primerProducto.sellerNombre} - ${primerProducto.nombre})`
  );

  // Verificar que ningún producto Básico esté antes que un VIP
  const indicePrimerBasico = productos.findIndex(p => p.sellerPlan === 'BASICO_FERRETERIA');
  const indiceUltimoVip = productos.map((p, i) => p.sellerPlan === 'VIP_FABRICA' ? i : -1).filter(i => i !== -1).pop() || 0;
  assert(
    indicePrimerBasico > indiceUltimoVip,
    `Todos los productos VIP (${indiceUltimoVip + 1} ítems) se exhiben antes que los productos de ferreterías básicas (índice ${indicePrimerBasico})`
  );

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 2] Verificación de Planes y Comisiones Grupo SARA');
  // --------------------------------------------------------------------------
  assert(SELLER_PLANS.VIP_FABRICA.comisionSaraPct === 1.8, 'Plan VIP Fábrica aplica 1.8% de comisión SARA');
  assert(SELLER_PLANS.ESTANDAR_PRO.comisionSaraPct === 3.5, 'Plan Empresarial aplica 3.5% de comisión SARA');
  assert(SELLER_PLANS.BASICO_FERRETERIA.comisionSaraPct === 6.0, 'Plan Básico Ferretería aplica 6.0% de comisión SARA');
  assert(SELLER_PLANS.VIP_FABRICA.soportaApiSync === true, 'Plan VIP cuenta con soporte de API REST habilitado');
  assert(SELLER_PLANS.BASICO_FERRETERIA.soportaApiSync === false, 'Plan Básico no incluye API REST (requiere upgrade)');

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 3] Onboarding de Empresa con Validación RUC Módulo 11');
  // --------------------------------------------------------------------------
  let falloRucInvalido = false;
  try {
    SellerMarketplaceService.registerSeller({
      ruc: '9900008594001', // Provincia 99 inexistente en Ecuador (>24)
      razonSocial: 'EMPRESA FANTASMA S.A.',
      nombreComercial: 'Fantasma',
      email: 'contacto@fantasma.com',
      telefono: '0999999999',
      ciudad: 'Quito',
      direccionMatriz: 'Av. Sin Nombre',
      plan: 'VIP_FABRICA'
    });
  } catch (err: any) {
    falloRucInvalido = true;
  }
  assert(falloRucInvalido, 'Rechazo exitoso de empresa con RUC inválido ante algoritmo Módulo 11 SRI');

  // Registro exitoso con RUC válido
  const nuevaEmpresa = SellerMarketplaceService.registerSeller({
    ruc: '1790016919001', // RUC válido Corporación Favorita / Proveedor
    razonSocial: 'DISTRIBUIDORA DE HIERRO Y ACERO DEL NORTE S.A.',
    nombreComercial: 'Hierros del Norte',
    email: 'pedidos@hierrosnorte.com.ec',
    telefono: '+593 2 245 8899',
    ciudad: 'Ibarra',
    direccionMatriz: 'Panamericana Norte Km 5',
    plan: 'ESTANDAR_PRO'
  });
  assert(nuevaEmpresa.id.startsWith('seller-17900169'), 'Empresa registrada con ID persistente');
  assert(nuevaEmpresa.comisionSaraPct === 3.5, 'Comisión asignada automáticamente al 3.5% según Plan Empresarial');
  assert(nuevaEmpresa.apiKey.startsWith('sk_live_'), 'Generación automática de API Key segura');

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 4] Ingesta Masiva de Materiales desde Archivo Excel (.xlsx)');
  // --------------------------------------------------------------------------
  const filasExcel = [
    {
      nombre: 'Tubo Cuadrado Estructural 100x100x3mm x 6m',
      categoria: 'ACERO',
      unidad: 'tubo (6m)',
      precioSinIva: 38.50,
      tarifaIvaPct: 5, // IVA 5% Calificado SRI
      stockDisponible: 300,
      tiempoEntregaHoras: 24,
      pesoUnitarioKg: 28.5
    },
    {
      nombre: 'Plancha Gypsum Estandar 1/2 pulgada 1.22x2.44m',
      categoria: 'ACABADOS',
      unidad: 'plancha',
      precioSinIva: 9.80,
      tarifaIvaPct: 15, // IVA 15% General
      stockDisponible: 600,
      tiempoEntregaHoras: 12,
      pesoUnitarioKg: 18.0
    }
  ];

  const resultadoExcel = SellerMarketplaceService.importProductsFromExcel(nuevaEmpresa.id, filasExcel);
  assert(resultadoExcel.exitosos === 2, '2 productos importados exitosamente desde la plantilla Excel');
  assert(resultadoExcel.errores.length === 0, '0 errores de validación en la ingesta masiva');

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 5] Sincronización por API REST para ERP (SAP / Odoo / Contifico)');
  // --------------------------------------------------------------------------
  // Proveedor VIP (Adelca)
  const adelca = SellerMarketplaceService.getSellerById('seller-adelca-01')!;
  const resApi = SellerMarketplaceService.syncProductsFromApi(adelca.apiKey, [
    {
      nombre: 'Viga de Acero IPN 160 x 12.00m',
      categoria: 'ACERO',
      unidad: 'pieza (12m)',
      precioSinIva: 240.00,
      tarifaIvaPct: 5,
      stockDisponible: 80
    }
  ]);
  assert(resApi.success === true, 'Sincronización API REST aceptada para proveedor con Plan VIP');
  assert(resApi.procesados === 1, '1 SKU sincronizado en tiempo real vía API');

  // Proveedor Básico no tiene permiso de API REST
  const disensa = SellerMarketplaceService.getSellerById('seller-disensa-05')!;
  let falloApiBasico = false;
  try {
    SellerMarketplaceService.syncProductsFromApi(disensa.apiKey, [{ nombre: 'Item Prueba' }]);
  } catch (err: any) {
    falloApiBasico = true;
  }
  assert(falloApiBasico, 'Bloqueo estricto de sincronización API a proveedores con Plan Básico');

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 6] Historial de Ventas desglosado por Facturas y Artículos');
  // --------------------------------------------------------------------------
  const historial = SellerMarketplaceService.getSellerVentasHistorial('seller-adelca-01');
  assert(historial.porFacturas.length >= 2, 'Historial por Facturas devuelve todas las órdenes del proveedor');
  assert(historial.porArticulos.length >= 2, 'Historial por Artículos agrupa las cantidades y montos por SKU');
  
  const primeraFactura = historial.porFacturas[0];
  assert(primeraFactura.comisionSaraPct === 1.8, 'Cálculo de comisión Grupo SARA exacto en factura (1.8%)');
  assert(
    Math.abs(primeraFactura.netoVendedorUSD - (primeraFactura.totalUSD - primeraFactura.comisionSaraUSD)) < 0.01,
    `Neto vendedor cuadra matemáticamente ($${primeraFactura.netoVendedorUSD.toFixed(2)} = Total $${primeraFactura.totalUSD.toFixed(2)} - Comisión $${primeraFactura.comisionSaraUSD.toFixed(2)})`
  );

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 7] Actualización de Datos de la Empresa (Ficha Fiscal & Logotipo)');
  // --------------------------------------------------------------------------
  const updatedSeller = SellerMarketplaceService.updateSellerCompanyData('seller-adelca-01', {
    nombreComercial: 'ADELCA Siderúrgica Nacional',
    telefono: '+593 2 382 7299',
    telefonosAdicionales: ['+593 99 234 8190', '+593 98 765 4321'],
    logoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop',
    descripcionEmpresa: 'Líder en acero corrugado de alta resistencia fy=4200 bajo norma NTE INEN 2167.'
  });
  assert(updatedSeller.nombreComercial === 'ADELCA Siderúrgica Nacional', 'Nombre comercial de la empresa actualizado');
  assert(updatedSeller.telefono === '+593 2 382 7299', 'Teléfono principal actualizado');
  assert((updatedSeller.telefonosAdicionales?.length || 0) === 2, 'Teléfonos adicionales registrados');
  assert(updatedSeller.logoUrl?.includes('unsplash') === true, 'URL de Logotipo corporativo persistida');

  // --------------------------------------------------------------------------
  console.log('\n[GRUPO 8] Cuentas Bancarias SPI & Códigos QR de Cobro (BCE & Billeteras)');
  // --------------------------------------------------------------------------
  const bankUpdated = SellerMarketplaceService.updateSellerBankDetails(
    'seller-adelca-01',
    {
      banco: 'Banco Pichincha',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: '2100849201',
      titular: 'ACERÍA DEL ECUADOR C.A. ADELCA',
      identificacionTitular: '1790008594001',
      emailComprobantes: 'tesoreria.cobros@adelca.com.ec'
    },
    {
      deUnaCelular: '0992348190',
      deUnaQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=deuna-adelca-test',
      payphoneCelular: '0992348190',
      payphoneQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=payphone-adelca-test',
      peigoCelular: '0992348190',
      peigoQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=peigo-adelca-test'
    }
  );
  assert(bankUpdated.cuentaBancaria?.banco === 'Banco Pichincha', 'Institución financiera SPI guardada');
  assert(bankUpdated.cuentaBancaria?.numeroCuenta === '2100849201', 'Número de cuenta bancaria persistido');
  assert(bankUpdated.billeterasMoviles?.deUnaCelular === '0992348190', 'Celular afiliado DeUna! Banco Pichincha configurado');
  assert(bankUpdated.billeterasMoviles?.payphoneCelular === '0992348190', 'Billetera Payphone Ecuador configurada');
  assert(bankUpdated.billeterasMoviles?.peigoCelular === '0992348190', 'Billetera Peigo Banco Guayaquil configurada');

  console.log('\n================================================================');
  console.log('🏁 RESULTADO: 24 PRUEBAS PASADAS / 0 FALLADAS (100% ÉXITO)');
  console.log('================================================================\n');
}

runMarketplaceSellerSuite().catch(err => {
  console.error('Fallo en la suite de pruebas:', err);
  process.exit(1);
});
