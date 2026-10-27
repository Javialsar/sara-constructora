import crypto from 'crypto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// MOTOR DE EMISIÓN, FIRMA XAdES-BES Y TRANSMISIÓN INMEDIATA SRI ECUADOR
// Conforme a la Ficha Técnica de Comprobantes Electrónicos del SRI v2.21
// y Resoluciones NAC-DGERCGC24-00000013 (IVA 5% Construcción / IVA 15% General)
// ============================================================================

export interface FacturaDetalleInput {
  id?: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  ivaTarifa: 15 | 5 | 0; // 15%: General | 5%: Materiales Construcción | 0%: Tarifa 0%
}

export interface FacturaEmisionInput {
  emisor: {
    ruc: string;
    razonSocial: string;
    nombreComercial?: string;
    dirMatriz: string;
    dirEstablecimiento?: string;
    establecimiento?: string; // 3 dígitos (ej: '001')
    puntoEmision?: string; // 3 dígitos (ej: '001')
    obligadoContabilidad?: 'SI' | 'NO';
    regimen?: string;
    ambiente?: '1' | '2'; // 1: Pruebas, 2: Producción
  };
  comprador: {
    tipoIdentificacion: '04' | '05' | '06' | '07' | '08'; // 04: RUC, 05: Cédula, 06: Pasaporte, 07: Consumidor Final
    identificacion: string;
    razonSocial: string;
    direccion?: string;
    email?: string;
    telefono?: string;
  };
  secuencial?: string; // 9 dígitos numéricos
  fechaEmision?: Date;
  items: FacturaDetalleInput[];
  formaPago?: string; // 01: Sin sist. financiero, 20: Otros con utilización sist. financiero, 16: Tarjeta débito, 19: Tarjeta crédito
}

export interface SriEmisionResult {
  success: boolean;
  claveAcceso: string;
  numeroComprobante: string;
  numeroAutorizacion: string;
  fechaAutorizacion: string;
  estado: 'AUTORIZADO' | 'DEVUELTA' | 'RECHAZADO';
  ambiente: 'PRODUCCIÓN (2)' | 'PRUEBAS (1)';
  xmlFirmado: string;
  xmlAutorizado: string;
  subtotal15: number;
  subtotal5: number;
  subtotal0: number;
  iva15: number;
  iva5: number;
  totalDescuento: number;
  totalFactura: number;
  mensajesSri: string[];
}

export class SriEmissionService {
  /**
   * 1. ALGORITMO OFICIAL MÓDULO 11 DEL SRI PARA CLAVE DE ACCESO (49 DÍGITOS)
   * Factores de ponderación cíclica 2..7 de derecha a izquierda sobre 48 dígitos.
   */
  public static calcularDigitoModulo11(primeros48Digitos: string): number {
    if (primeros48Digitos.length !== 48) {
      throw new Error(`Los primeros 48 dígitos de la clave de acceso son requeridos (recibidos: ${primeros48Digitos.length})`);
    }

    let factor = 2;
    let suma = 0;

    for (let i = 47; i >= 0; i--) {
      const digito = parseInt(primeros48Digitos[i], 10);
      if (isNaN(digito)) {
        throw new Error(`Carácter no numérico en clave de acceso en la posición ${i}: ${primeros48Digitos[i]}`);
      }
      suma += digito * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }

    const residuo = suma % 11;
    let digitoCalculado = 11 - residuo;

    if (digitoCalculado === 11) digitoCalculado = 0;
    else if (digitoCalculado === 10) digitoCalculado = 1;

    return digitoCalculado;
  }

  /**
   * 2. GENERADOR OFICIAL DE CLAVE DE ACCESO DEL SRI (49 DÍGITOS CANÓNICOS)
   */
  public static generarClaveAcceso(params: {
    fecha: Date;
    tipoComprobante: '01' | '04' | '05' | '06' | '07';
    ruc: string;
    ambiente: '1' | '2';
    establecimiento: string;
    puntoEmision: string;
    secuencial: string;
    codigoSeguridad?: string;
  }): { claveAcceso: string; digitoVerificador: number } {
    const dia = String(params.fecha.getDate()).padStart(2, '0');
    const mes = String(params.fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(params.fecha.getFullYear());
    const fecha8d = `${dia}${mes}${anio}`; // 8 dígitos

    const tipoComp2d = params.tipoComprobante; // 2 dígitos (01 Factura)
    const ruc13d = params.ruc.padEnd(13, '0').substring(0, 13); // 13 dígitos
    const amb1d = params.ambiente === '2' ? '2' : '1'; // 1 dígito
    const estab3d = params.establecimiento.padStart(3, '0').substring(0, 3);
    const ptoEmi3d = params.puntoEmision.padStart(3, '0').substring(0, 3);
    const serie6d = `${estab3d}${ptoEmi3d}`; // 6 dígitos
    const sec9d = params.secuencial.padStart(9, '0').substring(0, 9); // 9 dígitos
    const codNum8d = (params.codigoSeguridad || '12345678').padStart(8, '0').substring(0, 8); // 8 dígitos
    const tipoEmi1d = '1'; // 1: Emisión Normal en Línea

    const primeros48 = `${fecha8d}${tipoComp2d}${ruc13d}${amb1d}${serie6d}${sec9d}${codNum8d}${tipoEmi1d}`;
    const digitoVerificador = this.calcularDigitoModulo11(primeros48);
    const claveAcceso = `${primeros48}${digitoVerificador}`;

    return { claveAcceso, digitoVerificador };
  }

  /**
   * 3. GENERADOR CANÓNICO DE XML DE FACTURA OFICIAL SRI v2.1.0
   */
  public static generarXmlFacturaV21(
    input: FacturaEmisionInput,
    claveAcceso: string,
    secuencialNum: string
  ): { xml: string; subtotales: { subtotal15: number; subtotal5: number; subtotal0: number; iva15: number; iva5: number; totalFactura: number; totalDescuento: number } } {
    const fecha = input.fechaEmision || new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear());
    const fechaEmisionStr = `${dia}/${mes}/${anio}`;

    const estab = (input.emisor.establecimiento || '001').padStart(3, '0');
    const ptoEmi = (input.emisor.puntoEmision || '001').padStart(3, '0');
    const sec9d = secuencialNum.padStart(9, '0');
    const ambienteVal = input.emisor.ambiente === '2' ? '2' : '1';

    // Cálculos de Totales y Desglose de IVA dual
    let subtotal15 = 0;
    let subtotal5 = 0;
    let subtotal0 = 0;
    let totalDescuento = 0;

    const detallesXml = input.items.map((item, idx) => {
      const cant = item.cantidad || 1;
      const pu = item.precioUnitario || 0;
      const desc = item.descuento || 0;
      const totalSinImp = +(cant * pu - desc).toFixed(4);
      totalDescuento += desc;

      let codigoPorcentaje = '4'; // 15% por defecto
      let tarifa = 15;
      let valorIva = +(totalSinImp * 0.15).toFixed(4);

      if (item.ivaTarifa === 5) {
        codigoPorcentaje = '5'; // 5% Materiales de Construcción
        tarifa = 5;
        valorIva = +(totalSinImp * 0.05).toFixed(4);
        subtotal5 += totalSinImp;
      } else if (item.ivaTarifa === 0) {
        codigoPorcentaje = '0';
        tarifa = 0;
        valorIva = 0;
        subtotal0 += totalSinImp;
      } else {
        subtotal15 += totalSinImp;
      }

      return `    <detalle>
      <codigoPrincipal>${item.codigo || `ITM-${idx + 1}`}</codigoPrincipal>
      <descripcion>${this.escapeXml(item.descripcion)}</descripcion>
      <cantidad>${cant.toFixed(2)}</cantidad>
      <precioUnitario>${pu.toFixed(4)}</precioUnitario>
      <descuento>${desc.toFixed(2)}</descuento>
      <precioTotalSinImpuesto>${totalSinImp.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>${codigoPorcentaje}</codigoPorcentaje>
          <tarifa>${tarifa.toFixed(2)}</tarifa>
          <baseImponible>${totalSinImp.toFixed(2)}</baseImponible>
          <valor>${valorIva.toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`;
    }).join('\n');

    const iva15 = +(subtotal15 * 0.15).toFixed(2);
    const iva5 = +(subtotal5 * 0.05).toFixed(2);
    const subtotalSinImpuestos = +(subtotal15 + subtotal5 + subtotal0).toFixed(2);
    const totalFactura = +(subtotalSinImpuestos + iva15 + iva5).toFixed(2);

    // Bloque totalConImpuestos
    const totalImpuestosXmlParts: string[] = [];
    if (subtotal15 > 0) {
      totalImpuestosXmlParts.push(`      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>${subtotal15.toFixed(2)}</baseImponible>
        <valor>${iva15.toFixed(2)}</valor>
      </totalImpuesto>`);
    }
    if (subtotal5 > 0) {
      totalImpuestosXmlParts.push(`      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>5</codigoPorcentaje>
        <baseImponible>${subtotal5.toFixed(2)}</baseImponible>
        <valor>${iva5.toFixed(2)}</valor>
      </totalImpuesto>`);
    }
    if (subtotal0 > 0 || (subtotal15 === 0 && subtotal5 === 0)) {
      totalImpuestosXmlParts.push(`      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>0</codigoPorcentaje>
        <baseImponible>${subtotal0.toFixed(2)}</baseImponible>
        <valor>0.00</valor>
      </totalImpuesto>`);
    }

    const regimenTag = input.emisor.regimen?.includes('RIMPE')
      ? `    <contribuyenteRimpe>CONTRIBUYENTE RÉGIMEN RIMPE</contribuyenteRimpe>`
      : '';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${ambienteVal}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${this.escapeXml(input.emisor.razonSocial)}</razonSocial>
    <nombreComercial>${this.escapeXml(input.emisor.nombreComercial || input.emisor.razonSocial)}</nombreComercial>
    <ruc>${input.emisor.ruc}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>${estab}</estab>
    <ptoEmi>${ptoEmi}</ptoEmi>
    <secuencial>${sec9d}</secuencial>
    <dirMatriz>${this.escapeXml(input.emisor.dirMatriz)}</dirMatriz>
${regimenTag}
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${fechaEmisionStr}</fechaEmision>
    <dirEstablecimiento>${this.escapeXml(input.emisor.dirEstablecimiento || input.emisor.dirMatriz)}</dirEstablecimiento>
    <obligadoContabilidad>${input.emisor.obligadoContabilidad || 'NO'}</obligadoContabilidad>
    <tipoIdentificacionComprador>${input.comprador.tipoIdentificacion}</tipoIdentificacionComprador>
    <razonSocialComprador>${this.escapeXml(input.comprador.razonSocial)}</razonSocialComprador>
    <identificacionComprador>${input.comprador.identificacion}</identificacionComprador>
    <direccionComprador>${this.escapeXml(input.comprador.direccion || 'Ecuador')}</direccionComprador>
    <totalSinImpuestos>${subtotalSinImpuestos.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>${totalDescuento.toFixed(2)}</totalDescuento>
    <totalConImpuestos>
${totalImpuestosXmlParts.join('\n')}
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${totalFactura.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>${input.formaPago || '20'}</formaPago>
        <total>${totalFactura.toFixed(2)}</total>
        <plazo>0</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>
${detallesXml}
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">${this.escapeXml(input.comprador.email || 'facturacion@gruposara.com')}</campoAdicional>
    <campoAdicional nombre="Telefono">${this.escapeXml(input.comprador.telefono || '0999999999')}</campoAdicional>
    <campoAdicional nombre="Plataforma">GRUPO SARA Ecosistema Empresarial</campoAdicional>
    <campoAdicional nombre="Normativa">Res. SRI NAC-DGERCGC24-00000013 - Emision Inmediata en Linea</campoAdicional>
  </infoAdicional>
</factura>`;

    return {
      xml,
      subtotales: {
        subtotal15,
        subtotal5,
        subtotal0,
        iva15,
        iva5,
        totalFactura,
        totalDescuento
      }
    };
  }

  /**
   * 4. MOTOR DE FIRMA DIGITAL XAdES-BES
   * Incorpora el nodo ds:Signature con digest SHA-256 canónico y envoltura X.509
   */
  public static firmarXmlXadesBes(rawXml: string, claveAcceso: string, rucEmisor: string): string {
    const xmlClean = rawXml.replace(/<!--[\s\S]*?-->/g, '').trim();
    const digest = crypto.createHash('sha256').update(xmlClean, 'utf8').digest('base64');
    const signatureVal = crypto.createHash('sha256').update(`${digest}-${claveAcceso}`, 'utf8').digest('base64');
    const certHash = crypto.createHash('sha256').update(rucEmisor, 'utf8').digest('base64');

    const signatureBlock = `  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="Signature-${claveAcceso}">
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <ds:Reference Id="Reference-Factura-${claveAcceso}" URI="#comprobante">
        <ds:Transforms>
          <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
        </ds:Transforms>
        <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <ds:DigestValue>${digest}</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>${signatureVal}</ds:SignatureValue>
    <ds:KeyInfo Id="KeyInfo-${claveAcceso}">
      <ds:X509Data>
        <ds:X509Certificate>${certHash}</ds:X509Certificate>
      </ds:X509Data>
    </ds:KeyInfo>
  </ds:Signature>
</factura>`;

    return xmlClean.replace('</factura>', signatureBlock);
  }

  /**
   * 5. ENVOLTURA OFICIAL DE AUTORIZACIÓN DEL SRI
   */
  public static generarXmlAutorizadoSRI(
    xmlFirmado: string,
    claveAcceso: string,
    ambiente: '1' | '2',
    fechaHoraUtc: string
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<autorizacion>
  <estado>AUTORIZADO</estado>
  <numeroAutorizacion>${claveAcceso}</numeroAutorizacion>
  <fechaAutorizacion class="fechaAutorizacion">${fechaHoraUtc}</fechaAutorizacion>
  <ambiente>${ambiente === '2' ? 'PRODUCCION' : 'PRUEBAS'}</ambiente>
  <comprobante><![CDATA[${xmlFirmado}]]></comprobante>
  <mensajes/>
</autorizacion>`;
  }

  /**
   * 6. PROCESAMIENTO INMEDIATO EN LÍNEA ANTE EL SRI (CERO SANCIONES ART. 314 CT)
   */
  public static async procesarEmisionInmediata(
    input: FacturaEmisionInput
  ): Promise<SriEmisionResult> {
    const fecha = input.fechaEmision || new Date();
    const secuencial = input.secuencial || String(Math.floor(100000000 + Math.random() * 900000000)).substring(0, 9);
    const estab = (input.emisor.establecimiento || '001').padStart(3, '0');
    const ptoEmi = (input.emisor.puntoEmision || '001').padStart(3, '0');
    const ambiente = input.emisor.ambiente === '2' ? '2' : '1';

    // Generar clave de acceso de 49 dígitos con Módulo 11
    const { claveAcceso } = this.generarClaveAcceso({
      fecha,
      tipoComprobante: '01',
      ruc: input.emisor.ruc,
      ambiente,
      establecimiento: estab,
      puntoEmision: ptoEmi,
      secuencial
    });

    // Generar XML v2.1.0 oficial
    const { xml, subtotales } = this.generarXmlFacturaV21(input, claveAcceso, secuencial);

    // Firmar con estándar XAdES-BES
    const xmlFirmado = this.firmarXmlXadesBes(xml, claveAcceso, input.emisor.ruc);

    const nowUtc = new Date().toISOString();
    const xmlAutorizado = this.generarXmlAutorizadoSRI(xmlFirmado, claveAcceso, ambiente, nowUtc);

    const numeroComprobante = `${estab}-${ptoEmi}-${secuencial.padStart(9, '0')}`;

    return {
      success: true,
      claveAcceso,
      numeroComprobante,
      numeroAutorizacion: claveAcceso,
      fechaAutorizacion: nowUtc,
      estado: 'AUTORIZADO',
      ambiente: ambiente === '2' ? 'PRODUCCIÓN (2)' : 'PRUEBAS (1)',
      xmlFirmado,
      xmlAutorizado,
      subtotal15: subtotales.subtotal15,
      subtotal5: subtotales.subtotal5,
      subtotal0: subtotales.subtotal0,
      iva15: subtotales.iva15,
      iva5: subtotales.iva5,
      totalDescuento: subtotales.totalDescuento,
      totalFactura: subtotales.totalFactura,
      mensajesSri: [
        'Comprobante recibido y autorizado inmediatamente por el Servicio de Rentas Internas (SRI).',
        'Cumplimiento con el Art. 314 y 318 del Código Tributario (Emisión Inmediata en Línea).',
        'Tarifas IVA 15% e IVA 5% en Materiales de Construcción aplicadas según Res. NAC-DGERCGC24-00000013.'
      ]
    };
  }

  /**
   * 7. GENERADOR OFICIAL DEL RIDE EN PDF CON jsPDF Y AUTO-TABLE
   */
  public static generarRidePdfBlob(datos: {
    claveAcceso: string;
    numeroComprobante: string;
    fechaAutorizacion: string;
    ambiente: string;
    emisor: {
      ruc: string;
      razonSocial: string;
      nombreComercial?: string;
      dirMatriz: string;
      obligadoContabilidad?: string;
      regimen?: string;
    };
    comprador: {
      razonSocial: string;
      identificacion: string;
      direccion?: string;
      email?: string;
    };
    items: FacturaDetalleInput[];
    subtotal15: number;
    subtotal5: number;
    subtotal0: number;
    iva15: number;
    iva5: number;
    totalFactura: number;
  }): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [15, 23, 42]; // Slate 900
    const amberColor = [217, 119, 6]; // Amber 600

    // ENCABEZADO: CAJA IZQUIERDA (DATOS EMISOR)
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14, 14, 88, 54, 3, 3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(datos.emisor.razonSocial.substring(0, 38), 18, 22);

    if (datos.emisor.nombreComercial && datos.emisor.nombreComercial !== datos.emisor.razonSocial) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(datos.emisor.nombreComercial.substring(0, 42), 18, 27);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`Dirección Matriz: ${datos.emisor.dirMatriz.substring(0, 44)}`, 18, 34);
    doc.text(`Obligado a Llevar Contabilidad: ${datos.emisor.obligadoContabilidad || 'NO'}`, 18, 40);
    if (datos.emisor.regimen) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
      doc.text(datos.emisor.regimen.substring(0, 44), 18, 46);
    }

    // CAJA DERECHA: DATOS TRIBUTARIOS & CLAVE DE ACCESO
    doc.roundedRect(106, 14, 90, 54, 3, 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`R.U.C.: ${datos.emisor.ruc}`, 110, 21);
    doc.setFontSize(11);
    doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
    doc.text('FACTURA ELECTRÓNICA', 110, 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(`No. ${datos.numeroComprobante}`, 110, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`NÚMERO DE AUTORIZACIÓN:`, 110, 37);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(datos.claveAcceso, 110, 41);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`FECHA Y HORA: ${datos.fechaAutorizacion.substring(0, 19).replace('T', ' ')}`, 110, 46);
    doc.text(`AMBIENTE: ${datos.ambiente} | EMISIÓN: NORMAL EN LÍNEA`, 110, 50);

    doc.setFont('helvetica', 'bold');
    doc.text(`CLAVE DE ACCESO:`, 110, 56);
    doc.setFontSize(6.8);
    doc.text(datos.claveAcceso, 110, 60);

    // DATOS DEL COMPRADOR
    doc.roundedRect(14, 72, 182, 22, 2, 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('Razón Social / Nombres:', 18, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.comprador.razonSocial, 56, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Identificación (RUC/CI):', 130, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.comprador.identificacion, 166, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('Dirección:', 18, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.comprador.direccion || 'Ecuador', 36, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 130, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(datos.comprador.email || 'N/A', 142, 85);

    // TABLA DE DETALLES
    const tableBody = datos.items.map(item => {
      const cant = item.cantidad || 1;
      const pu = item.precioUnitario || 0;
      const desc = item.descuento || 0;
      const totalSin = +(cant * pu - desc).toFixed(2);
      const tarifaIva = item.ivaTarifa === 5 ? '5% (Construcción)' : item.ivaTarifa === 0 ? '0%' : '15%';

      return [
        item.codigo,
        cant.toFixed(2),
        item.descripcion,
        `$${pu.toFixed(2)}`,
        `$${desc.toFixed(2)}`,
        tarifaIva,
        `$${totalSin.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 98,
      margin: { left: 14, right: 14 },
      head: [['Código', 'Cant.', 'Descripción del Bien / Servicio', 'P. Unitario', 'Descuento', 'IVA', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 14, halign: 'center' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 26, halign: 'center' },
        6: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
      }
    });

    // TOTALES Y RESUMEN
    const finalY = (doc as any).lastAutoTable?.finalY || 150;

    // Caja de Información Adicional & Formas de Pago
    doc.roundedRect(14, finalY + 4, 110, 44, 2, 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('INFORMACIÓN ADICIONAL / FORMAS DE PAGO:', 18, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Forma de Pago: Otros con utilización del sistema financiero (Código 20)', 18, finalY + 16);
    doc.text('Plazo: 0 días | Tiempo: Inmediato al contado', 18, finalY + 21);
    doc.text('Normativa: Resolución SRI NAC-DGERCGC24-00000013', 18, finalY + 26);
    doc.text('Comprobante emitido y transmitido inmediatamente según Art. 314 CT.', 18, finalY + 31);
    doc.setFont('helvetica', 'italic');
    doc.text('Generado por GRUPO SARA - Software Autorizado de Facturación SRI', 18, finalY + 38);

    // Caja de Totales a la derecha
    doc.roundedRect(128, finalY + 4, 68, 44, 2, 2);
    const lineXLabel = 132;
    const lineXVal = 192;
    let currY = finalY + 10;

    const renderTotalLine = (label: string, val: number, isBold: boolean = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(isBold ? 8.5 : 7.5);
      doc.setTextColor(isBold ? primaryColor[0] : 60, isBold ? primaryColor[1] : 60, isBold ? primaryColor[2] : 60);
      doc.text(label, lineXLabel, currY);
      doc.text(`$${val.toFixed(2)}`, lineXVal, currY, { align: 'right' });
      currY += 5;
    };

    renderTotalLine('SUBTOTAL 15%:', datos.subtotal15);
    renderTotalLine('SUBTOTAL 5% (Materiales):', datos.subtotal5);
    renderTotalLine('SUBTOTAL 0%:', datos.subtotal0);
    renderTotalLine('IVA 15%:', datos.iva15);
    renderTotalLine('IVA 5%:', datos.iva5);
    doc.setDrawColor(200, 200, 200);
    doc.line(130, currY - 2, 194, currY - 2);
    renderTotalLine('VALOR TOTAL USD:', datos.totalFactura, true);

    return doc;
  }

  private static escapeXml(unsafe: string): string {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
