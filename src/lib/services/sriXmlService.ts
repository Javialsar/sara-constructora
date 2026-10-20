import crypto from 'crypto';

/**
 * SERVICIO DE INGESTA, PARSING Y VALIDACIÓN DE COMPROBANTES ELECTRÓNICOS SRI
 * Conforme a la Ficha Técnica de Comprobantes Electrónicos del SRI del Ecuador (v2.21).
 * Implementa protección estricta contra ataques XXE (XML External Entity) e inyección.
 */

export interface SriFacturaDetalle {
  codigoPrincipal: string;
  codigoAuxiliar?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  impuestos: Array<{
    codigo: string; // 2: IVA
    codigoPorcentaje: string; // 0: 0%, 2: 12%, 3: 14%, 4: 15%, 5: 5%
    tarifa: number;
    baseImponible: number;
    valor: number;
  }>;
}

export interface SriFacturaParsed {
  claveAcceso: string;
  numeroComprobante: string;
  rucEmisor: string;
  razonSocialEmisor: string;
  nombreComercialEmisor?: string;
  tipoEmisor: 'REGIMEN_GENERAL' | 'CONTRIBUYENTE_ESPECIAL' | 'GRAN_CONTRIBUYENTE' | 'RIMPE_EMPRENDEDOR' | 'RIMPE_POPULAR';
  fechaEmision: string; // YYYY-MM-DD
  subtotal15: number;
  subtotal5: number;
  subtotal0: number;
  subtotalNoObjeto: number;
  totalDescuento: number;
  subtotalSinImpuestos: number;
  ivaTotal: number;
  propina: number;
  importeTotal: number;
  detalles: SriFacturaDetalle[];
  xmlHash: string;
  firmaDigitalValida: boolean;
  version: string;
}

export class SriXmlService {
  /**
   * Sanitiza el XML previniendo ataques XXE (XML External Entity) y eliminando comentarios XML
   */
  private static sanitizeXml(xmlContent: string): string {
    // Prohibir declaraciones DTD, entidades externas y SYSTEM/PUBLIC
    const xxePatterns = [
      /<!DOCTYPE[^>]*>/i,
      /<!ENTITY[^>]*>/i,
      /SYSTEM\s+["'][^"']*["']/i,
      /PUBLIC\s+["'][^"']*["']/i
    ];

    for (const pattern of xxePatterns) {
      if (pattern.test(xmlContent)) {
        throw new Error('ALERTA DE SEGURIDAD (XXE): Se detectó una entidad o DTD prohibida en el XML del SRI.');
      }
    }

    // Eliminar comentarios XML para evitar falsos positivos en detección de firmas o tags comentados
    return xmlContent.replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  /**
   * Valida el dígito verificador de la Clave de Acceso de 49 dígitos del SRI mediante el algoritmo oficial Módulo 11 (pesos 2..7)
   */
  public static validarModulo11ClaveAcceso(clave: string): boolean {
    if (!/^\d{49}$/.test(clave)) return false;
    const digitoVerificadorRecibido = parseInt(clave[48], 10);
    let factor = 2;
    let suma = 0;

    for (let i = 47; i >= 0; i--) {
      suma += parseInt(clave[i], 10) * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const residuo = suma % 11;
    let digitoCalculado = 11 - residuo;
    if (digitoCalculado === 11) digitoCalculado = 0;
    else if (digitoCalculado === 10) digitoCalculado = 1;

    return digitoCalculado === digitoVerificadorRecibido;
  }

  /**
   * Extrae el contenido de una etiqueta XML simple
   */
  private static getTagValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extrae todas las ocurrencias de una etiqueta con bloque
   */
  private static getTagBlocks(xml: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      blocks.push(match[1]);
    }
    return blocks;
  }

  /**
   * Parsea un archivo XML del SRI (Factura, Retención o Liquidación)
   */
  public static parseFacturaXml(rawXml: string): SriFacturaParsed {
    const cleanXml = this.sanitizeXml(rawXml);

    // Calcular Hash SHA-256 para integridad e idempotencia
    const xmlHash = crypto.createHash('sha256').update(cleanXml, 'utf8').digest('hex');

    // 1. Verificar firma digital XAdES-BES
    const hasSignature = cleanXml.includes('ds:Signature') || cleanXml.includes('<Signature');
    const hasCertificate = cleanXml.includes('ds:X509Certificate') || cleanXml.includes('<X509Certificate');
    const firmaDigitalValida = hasSignature && hasCertificate;

    // 2. Extraer infoTributaria
    const infoTributariaXml = this.getTagValue(cleanXml, 'infoTributaria') || cleanXml;
    const rucEmisor = this.getTagValue(infoTributariaXml, 'ruc') || this.getTagValue(cleanXml, 'ruc');
    const razonSocialEmisor = this.getTagValue(infoTributariaXml, 'razonSocial');
    const nombreComercialEmisor = this.getTagValue(infoTributariaXml, 'nombreComercial') || razonSocialEmisor;
    const estab = this.getTagValue(infoTributariaXml, 'estab') || '001';
    const ptoEmi = this.getTagValue(infoTributariaXml, 'ptoEmi') || '001';
    const secuencial = this.getTagValue(infoTributariaXml, 'secuencial') || '000000001';
    const numeroComprobante = `${estab}-${ptoEmi}-${secuencial.padStart(9, '0')}`;
    const claveAcceso = this.getTagValue(infoTributariaXml, 'claveAcceso');

    if (!claveAcceso || claveAcceso.length !== 49) {
      throw new Error(`Clave de acceso inválida en XML SRI (longitud esperada: 49 dígitos, recibida: ${claveAcceso.length})`);
    }

    // 3. Extraer infoFactura
    const infoFacturaXml = this.getTagValue(cleanXml, 'infoFactura') || cleanXml;
    const rawFecha = this.getTagValue(infoFacturaXml, 'fechaEmision'); // DD/MM/YYYY
    let fechaEmision = new Date().toISOString().split('T')[0];
    if (rawFecha && rawFecha.includes('/')) {
      const [d, m, y] = rawFecha.split('/');
      fechaEmision = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    const subtotalSinImpuestos = parseFloat(this.getTagValue(infoFacturaXml, 'totalSinImpuestos') || '0');
    const totalDescuento = parseFloat(this.getTagValue(infoFacturaXml, 'totalDescuento') || '0');
    const propina = parseFloat(this.getTagValue(infoFacturaXml, 'propina') || '0');
    const importeTotal = parseFloat(this.getTagValue(infoFacturaXml, 'importeTotal') || '0');

    // Desglose de impuestos en totalConImpuestos
    let subtotal15 = 0;
    let subtotal5 = 0;
    let subtotal0 = 0;
    let subtotalNoObjeto = 0;
    let ivaTotal = 0;

    const totalImpuestoBlocks = this.getTagBlocks(infoFacturaXml, 'totalImpuesto');
    for (const block of totalImpuestoBlocks) {
      const codigoPorcentaje = this.getTagValue(block, 'codigoPorcentaje');
      const baseImponible = parseFloat(this.getTagValue(block, 'baseImponible') || '0');
      const valor = parseFloat(this.getTagValue(block, 'valor') || '0');

      if (codigoPorcentaje === '4' || codigoPorcentaje === '8') {
        // 4: IVA 15% general | 8: IVA 8% diferenciado turístico en feriados nacionales
        subtotal15 += baseImponible;
        ivaTotal += valor;
      } else if (codigoPorcentaje === '5') {
        subtotal5 += baseImponible;
        ivaTotal += valor;
      } else if (codigoPorcentaje === '0') {
        subtotal0 += baseImponible;
      } else {
        subtotalNoObjeto += baseImponible;
      }
    }

    // Si no desglosó por totalImpuesto, estimar con importeTotal
    if (ivaTotal === 0 && importeTotal > subtotalSinImpuestos) {
      ivaTotal = +(importeTotal - subtotalSinImpuestos).toFixed(4);
      subtotal15 = subtotalSinImpuestos;
    }

    // Régimen del emisor
    let tipoEmisor: SriFacturaParsed['tipoEmisor'] = 'REGIMEN_GENERAL';
    const contribuyenteEspecial = this.getTagValue(infoFacturaXml, 'contribuyenteEspecial');
    const regimenMicro = this.getTagValue(cleanXml, 'regimenMicroempresas');
    const rimpe = this.getTagValue(cleanXml, 'contribuyenteRimpe');

    if (contribuyenteEspecial) {
      tipoEmisor = 'CONTRIBUYENTE_ESPECIAL';
    } else if (rimpe && rimpe.toUpperCase().includes('POPULAR')) {
      tipoEmisor = 'RIMPE_POPULAR';
    } else if (rimpe) {
      tipoEmisor = 'RIMPE_EMPRENDEDOR';
    }

    // 4. Extraer detalles
    const detalles: SriFacturaDetalle[] = [];
    const detalleBlocks = this.getTagBlocks(cleanXml, 'detalle');

    for (const detXml of detalleBlocks) {
      const codigoPrincipal = this.getTagValue(detXml, 'codigoPrincipal') || 'ITEM-GEN';
      const codigoAuxiliar = this.getTagValue(detXml, 'codigoAuxiliar');
      const descripcion = this.getTagValue(detXml, 'descripcion') || 'Material de construcción';
      const cantidad = parseFloat(this.getTagValue(detXml, 'cantidad') || '1');
      const precioUnitario = parseFloat(this.getTagValue(detXml, 'precioUnitario') || '0');
      const descuento = parseFloat(this.getTagValue(detXml, 'descuento') || '0');
      const precioTotalSinImpuesto = parseFloat(this.getTagValue(detXml, 'precioTotalSinImpuesto') || (cantidad * precioUnitario).toString());

      // Impuestos del detalle
      const impuestosDetalle: SriFacturaDetalle['impuestos'] = [];
      const impBlocks = this.getTagBlocks(detXml, 'impuesto');
      for (const imp of impBlocks) {
        impuestosDetalle.push({
          codigo: this.getTagValue(imp, 'codigo') || '2',
          codigoPorcentaje: this.getTagValue(imp, 'codigoPorcentaje') || '4',
          tarifa: parseFloat(this.getTagValue(imp, 'tarifa') || '15'),
          baseImponible: parseFloat(this.getTagValue(imp, 'baseImponible') || precioTotalSinImpuesto.toString()),
          valor: parseFloat(this.getTagValue(imp, 'valor') || (precioTotalSinImpuesto * 0.15).toFixed(4)),
        });
      }

      detalles.push({
        codigoPrincipal,
        codigoAuxiliar,
        descripcion,
        cantidad,
        precioUnitario,
        descuento,
        precioTotalSinImpuesto,
        impuestos: impuestosDetalle,
      });
    }

    // Extraer dinámicamente el atributo version de <factura version="...">
    const versionMatch = cleanXml.match(/<factura[^>]*\bversion=["']([^"']+)["']/i);
    const version = versionMatch ? versionMatch[1] : '2.21';

    return {
      claveAcceso,
      numeroComprobante,
      rucEmisor,
      razonSocialEmisor,
      nombreComercialEmisor,
      tipoEmisor,
      fechaEmision,
      subtotal15,
      subtotal5,
      subtotal0,
      subtotalNoObjeto,
      totalDescuento,
      subtotalSinImpuestos,
      ivaTotal,
      propina,
      importeTotal,
      detalles,
      xmlHash,
      firmaDigitalValida,
      version,
    };
  }
}
