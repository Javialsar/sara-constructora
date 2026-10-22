// ============================================================================
// SERVICIO DE GUÍAS DE REMISIÓN ELECTRÓNICAS SRI (ECUADOR)
// Conforme a la Ficha Técnica de Comprobantes Electrónicos del SRI v2.21
// Comprobante Tipo 06: Guía de Remisión para Traslado de Bienes y Materiales
// ============================================================================

export interface GuiaRemisionSriData {
  claveAcceso: string;
  numeroGuia: string; // 001-002-000000123
  rucEmisor: string;
  razonSocialEmisor: string;
  rucTransportista: string;
  nombreTransportista: string;
  placaVehiculo: string;
  fechaInicioTraslado: string; // YYYY-MM-DD
  fechaFinTraslado: string; // YYYY-MM-DD
  puntoPartida: string;
  puntoLlegada: string;
  motivoTraslado: string;
  descripcionMercaderia: string;
  cantidadTotal: number;
  unidadMedida: string;
  autorizadaSri: boolean;
  timestampAutorizacion?: string;
  hashIntegridad: string;
}

export class SaraGuiaRemisionService {
  /**
   * Valida una clave de acceso de 49 dígitos utilizando el algoritmo de Módulo 11 oficial del SRI
   */
  static validarClaveAcceso(clave: string): { valida: boolean; error?: string } {
    const limpia = (clave || '').trim().replace(/\s+/g, '');
    if (!limpia) {
      return { valida: false, error: 'La clave de acceso es requerida.' };
    }
    if (!/^\d{49}$/.test(limpia)) {
      return { valida: false, error: 'La clave de acceso del SRI debe contener exactamente 49 dígitos numéricos.' };
    }

    // Tipo de comprobante en posiciones 8 y 9 (06 para Guía de Remisión, 01 Factura)
    const tipoComprobante = limpia.substring(8, 10);
    if (tipoComprobante !== '06' && tipoComprobante !== '01') {
      // Advertencia informativa, pero se permite validar
    }

    // Algoritmo oficial Módulo 11 con pesos 2..7
    const digitoVerificadorRecibido = parseInt(limpia[48], 10);
    let factor = 2;
    let suma = 0;

    for (let i = 47; i >= 0; i--) {
      suma += parseInt(limpia[i], 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const residuo = suma % 11;
    let digitoCalculado = 11 - residuo;
    if (digitoCalculado === 11) digitoCalculado = 0;
    else if (digitoCalculado === 10) digitoCalculado = 1;

    if (digitoCalculado !== digitoVerificadorRecibido) {
      return {
        valida: false,
        error: `Dígito verificador inválido (Calculado: ${digitoCalculado}, Recibido: ${digitoVerificadorRecibido}). Verifique el comprobante SRI.`
      };
    }

    return { valida: true };
  }

  /**
   * Genera una clave de acceso simulada 100% válida ante el algoritmo Módulo 11 del SRI
   * para propósitos de prueba y demostración operativa en obra
   */
  static generarClaveAccesoPrueba(rucTransportista: string = '1104589234001', serie: string = '001001'): string {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear());
    const fechaStr = `${dia}${mes}${anio}`; // 8 dígitos

    const tipoComprobante = '06'; // 06 = Guía de Remisión
    const ruc = (rucTransportista || '1104589234001').padEnd(13, '0').substring(0, 13);
    const tipoAmbiente = '1'; // 1 = Pruebas, 2 = Producción
    const establecimientoPunto = (serie || '001001').padEnd(6, '0').substring(0, 6);
    const secuencial = String(Math.floor(100000000 + Math.random() * 900000000)).substring(0, 9);
    const codigoNumerico = '12345678'; // 8 dígitos
    const tipoEmision = '1'; // 1 = Emisión Normal

    // Primeros 48 dígitos
    const base48 = `${fechaStr}${tipoComprobante}${ruc}${tipoAmbiente}${establecimientoPunto}${secuencial}${codigoNumerico}${tipoEmision}`;

    // Calcular dígito 49 con Módulo 11
    let factor = 2;
    let suma = 0;
    for (let i = 47; i >= 0; i--) {
      suma += parseInt(base48[i], 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }
    const residuo = suma % 11;
    let digitoCalculado = 11 - residuo;
    if (digitoCalculado === 11) digitoCalculado = 0;
    else if (digitoCalculado === 10) digitoCalculado = 1;

    return `${base48}${digitoCalculado}`;
  }

  /**
   * Decodifica los metadatos esenciales contenidos en una clave de acceso de 49 dígitos
   */
  static parsearClaveAcceso(clave: string) {
    if (!clave || clave.length < 49) return null;
    const dia = clave.substring(0, 2);
    const mes = clave.substring(2, 4);
    const anio = clave.substring(4, 8);
    const tipoComp = clave.substring(8, 10);
    const ruc = clave.substring(10, 23);
    const ambiente = clave.substring(23, 24) === '2' ? 'PRODUCCIÓN' : 'PRUEBAS';
    const estab = clave.substring(24, 27);
    const ptoEmi = clave.substring(27, 30);
    const secuencial = clave.substring(30, 39);

    return {
      fechaEmision: `${anio}-${mes}-${dia}`,
      tipoComprobante: tipoComp === '06' ? 'GUÍA DE REMISIÓN' : tipoComp === '01' ? 'FACTURA' : 'OTRO',
      rucEmisor: ruc,
      ambiente,
      numeroComprobante: `${estab}-${ptoEmi}-${secuencial}`
    };
  }
}
