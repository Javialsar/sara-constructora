import { SaraFletesReflectiveMemory } from './saraFletesReflectiveMemory';

export interface FairFareResult {
  modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
  vehicleType: string;
  tarifaSugeridaUSD: number;
  tarifaMinimaUSD: number;
  rangoNegociacion: {
    minimoUSD: number;
    maximoUSD: number;
  };
  desglose: {
    banderazoUSD: number;
    costoDistanciaUSD: number;
    costoTiempoUSD?: number;
    costoPesoUSD?: number;
    recargoUrgenciaUSD?: number;
    recargoDesgastePendienteUSD?: number;
    peajesMTOPUSD?: number;
    ahorroBackhaulUSD?: number;
    depositoGarantiaEscrowUSD?: number;
  };
  margenConductorPct: number;
  explicacionIA: string;
}

export class SaraFletesSmartBidding {
  static readonly AGENT_ID = '@Agent-SmartBidding';

  /**
   * CÁLCULO DE TARIFA TRANSPARENTE "WIN-WIN FAIR FARE"
   */
  static calculateFare(params: {
    modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
    vehicleType: string;
    distanciaKm: number;
    duracionMinutos: number;
    pesoTon?: number;
    volumenM3?: number;
    material?: string;
    esUrgente?: boolean;
    rentaHorasODias?: 'HORAS' | 'DIAS';
    duracionRentaValor?: number;
    conChofer?: boolean;
    horaActual?: string;
  }): FairFareResult {
    const recall = SaraFletesReflectiveMemory.recallContextual({
      modalidad: params.modalidad,
      vehicleType: params.vehicleType,
      material: params.material,
      hora: params.horaActual
    });

    let tarifaFinal = 0;
    let tarifaMin = 1.25;
    let banderazo = 0;
    let costoDistancia = 0;
    let costoTiempo = 0;
    let costoPeso = 0;
    let recargoUrgencia = 0;
    let recargoPendiente = 0;
    let peajes = 0;
    let ahorroBackhaul = 0;
    let depositoGarantia = 0;
    let explicacion = '';

    // =========================================================================
    // 1. VIAJES CORTOS / PASAJEROS
    // =========================================================================
    if (params.modalidad === 'VIAJE') {
      let costoKm = 0.50;
      let costoMin = 0.10;

      if (params.vehicleType.includes('MOTO')) {
        banderazo = 0.75;
        costoKm = 0.35;
        costoMin = 0.05;
        tarifaMin = 1.25;
      } else if (params.vehicleType.includes('PREMIUM') || params.vehicleType.includes('EJECUTIVO')) {
        banderazo = 1.50;
        costoKm = 0.65;
        costoMin = 0.12;
        tarifaMin = 2.50;
      } else if (params.vehicleType.includes('MINIVAN')) {
        banderazo = 2.20;
        costoKm = 0.85;
        costoMin = 0.15;
        tarifaMin = 3.50;
      } else {
        // SEDAN estándar
        banderazo = 1.00;
        costoKm = 0.50;
        costoMin = 0.10;
        tarifaMin = 1.75;
      }

      costoDistancia = +(params.distanciaKm * costoKm).toFixed(2);
      costoTiempo = +(params.duracionMinutos * costoMin).toFixed(2);
      const subtotal = banderazo + costoDistancia + costoTiempo;
      tarifaFinal = Math.max(tarifaMin, +(subtotal * recall.multiplicadorCosto).toFixed(2));
      explicacion = `Tarifa urbana: Banderazo $${banderazo} + $${costoDistancia} (${params.distanciaKm} km) + $${costoTiempo} (${params.duracionMinutos} min). Conductor recibe el 88% del importe.`;
    }

    // =========================================================================
    // 2. MANDADITOS / DELIVERY EXPRESS
    // =========================================================================
    else if (params.modalidad === 'MANDADITO') {
      let costoKm = 0.40;
      if (params.vehicleType.includes('MOTO')) {
        banderazo = 0.80;
        costoKm = 0.40;
        tarifaMin = 1.25;
      } else if (params.vehicleType.includes('CARGO') || params.vehicleType.includes('VAN')) {
        banderazo = 2.00;
        costoKm = 0.75;
        tarifaMin = 3.50;
      } else {
        // Auto delivery
        banderazo = 1.20;
        costoKm = 0.55;
        tarifaMin = 2.00;
      }

      costoDistancia = +(params.distanciaKm * costoKm).toFixed(2);
      recargoUrgencia = params.esUrgente ? 0.50 : 0.00;
      const subtotal = banderazo + costoDistancia + recargoUrgencia;
      tarifaFinal = Math.max(tarifaMin, +(subtotal * recall.multiplicadorCosto).toFixed(2));
      explicacion = `Delivery express: Banderazo $${banderazo} + $${costoDistancia} (${params.distanciaKm} km)${params.esUrgente ? ' + $0.50 urgencia prioritaria' : ''}. Repartidor recibe el 90%.`;
    }

    // =========================================================================
    // 3. FLETES Y LOGÍSTICA PESADA
    // =========================================================================
    else if (params.modalidad === 'FLETE') {
      const peso = params.pesoTon || 1.0;
      if (params.vehicleType.includes('PICKUP')) {
        banderazo = 1.50;
        tarifaMin = 2.00;
        costoDistancia = +(params.distanciaKm * 0.50).toFixed(2);
        costoPeso = +(peso * 0.30).toFixed(2);
      } else if (params.vehicleType.includes('VOLQUETA')) {
        banderazo = 15.00;
        tarifaMin = 18.00;
        costoDistancia = +(params.distanciaKm * 1.20).toFixed(2);
        costoPeso = +(peso * 0.15).toFixed(2);
        // Descuento Backhaul en volquetas con retorno de cantera (-28%)
        ahorroBackhaul = +( (banderazo + costoDistancia + costoPeso) * 0.28 ).toFixed(2);
      } else if (params.vehicleType.includes('TRACTO') || params.vehicleType.includes('3S3')) {
        banderazo = 45.00;
        tarifaMin = 50.00;
        costoDistancia = +(params.distanciaKm * 2.20).toFixed(2);
        costoPeso = +(peso * 0.10).toFixed(2);
        peajes = params.distanciaKm > 40 ? Math.floor(params.distanciaKm / 60) * 3.00 : 0;
      } else {
        // Camión 5T
        banderazo = 2.20;
        tarifaMin = 3.00;
        costoDistancia = +(params.distanciaKm * 0.70).toFixed(2);
        costoPeso = +(peso * 0.20).toFixed(2);
      }

      // Recargo reflectivo por desgaste en pendientes (ej. bloques pesados)
      if (recall.multiplicadorCosto > 1.0) {
        recargoPendiente = +((banderazo + costoDistancia + costoPeso) * (recall.multiplicadorCosto - 1.0)).toFixed(2);
      }

      const subtotal = banderazo + costoDistancia + costoPeso + peajes + recargoPendiente - ahorroBackhaul;
      tarifaFinal = Math.max(tarifaMin, +subtotal.toFixed(2));
      explicacion = `Flete MTOP: Banderazo $${banderazo} + Carga $${costoPeso} (${peso} Ton) + Ruta $${costoDistancia}${ahorroBackhaul > 0 ? ` - Ahorro Backhaul cantera -$${ahorroBackhaul}` : ''}${recargoPendiente > 0 ? ` + Desgaste pendiente $${recargoPendiente}` : ''}.`;
    }

    // =========================================================================
    // 4. RENTA DE VEHÍCULOS (POR HORAS O DÍAS)
    // =========================================================================
    else {
      const tipo = params.rentaHorasODias || 'HORAS';
      const duracion = params.duracionRentaValor || (tipo === 'HORAS' ? 4 : 1);
      const conChofer = params.conChofer ?? true;

      let tarifaHora = 12.00;
      let tarifaDia = 65.00;
      depositoGarantia = 250.00;

      if (params.vehicleType.includes('VOLQUETA')) {
        tarifaHora = 35.00;
        tarifaDia = 220.00;
        depositoGarantia = 500.00;
      } else if (params.vehicleType.includes('RETRO') || params.vehicleType.includes('MAQUINARIA')) {
        tarifaHora = 45.00;
        tarifaDia = 280.00;
        depositoGarantia = 800.00;
      } else if (params.vehicleType.includes('FURGON')) {
        tarifaHora = 18.00;
        tarifaDia = 95.00;
        depositoGarantia = 350.00;
      }

      if (tipo === 'HORAS') {
        const costoChofer = conChofer ? duracion * 6.00 : 0;
        tarifaFinal = +( (duracion * tarifaHora) + costoChofer + 5.00 ).toFixed(2);
        tarifaMin = tarifaHora;
        explicacion = `Renta por ${duracion} horas: Tarifa base $${(duracion * tarifaHora).toFixed(2)}${conChofer ? ` + Operador calificado $${costoChofer}` : ''} + Seguro $5. Depósito garantía en Escrow: $${depositoGarantia}.`;
      } else {
        // DÍAS con descuento por volumen
        let factorDesc = 1.0;
        if (duracion >= 30) factorDesc = 0.70;
        else if (duracion >= 7) factorDesc = 0.80;
        else if (duracion >= 3) factorDesc = 0.90;

        const costoChofer = conChofer ? duracion * 40.00 : 0;
        tarifaFinal = +( (duracion * tarifaDia * factorDesc) + costoChofer ).toFixed(2);
        tarifaMin = tarifaDia;
        explicacion = `Renta por ${duracion} días: $${tarifaDia}/día con ${(100 - factorDesc * 100).toFixed(0)}% desc.${conChofer ? ` + Chofer $${costoChofer}` : ''}. Depósito garantía en Escrow: $${depositoGarantia}.`;
      }
    }

    const minNegociacion = Math.max(tarifaMin, +(tarifaFinal * 0.85).toFixed(2));
    const maxNegociacion = +(tarifaFinal * 1.25).toFixed(2);

    return {
      modalidad: params.modalidad,
      vehicleType: params.vehicleType,
      tarifaSugeridaUSD: tarifaFinal,
      tarifaMinimaUSD: tarifaMin,
      rangoNegociacion: {
        minimoUSD: minNegociacion,
        maximoUSD: maxNegociacion
      },
      desglose: {
        banderazoUSD: banderazo,
        costoDistanciaUSD: costoDistancia,
        costoTiempoUSD: costoTiempo,
        costoPesoUSD: costoPeso,
        recargoUrgenciaUSD: recargoUrgencia,
        recargoDesgastePendienteUSD: recargoPendiente,
        peajesMTOPUSD: peajes,
        ahorroBackhaulUSD: ahorroBackhaul,
        depositoGarantiaEscrowUSD: depositoGarantia
      },
      margenConductorPct: params.modalidad === 'MANDADITO' ? 90 : params.modalidad === 'VIAJE' ? 88 : 85,
      explicacionIA: explicacion
    };
  }
}
