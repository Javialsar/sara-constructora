/**
 * SERVICIO DE NÓMINA, TAREO Y OBLIGACIONES IESS - SECTOR CONSTRUCCIÓN ECUADOR
 * Calibrado bajo el Código de Trabajo del Ecuador, Ley de Seguridad Social y Tablas Sectoriales CICS/IESS.
 */

export interface DailyTareoInput {
  trabajadorId: string;
  nombreCompleto: string;
  cedula: string;
  categoriaOcupacional: 'Maestro Mayor' | 'Albañil' | 'Fierrero' | 'Encofrador' | 'Peón' | 'Topógrafo' | 'Residente';
  proyectoId: string;
  rubroApuCodigo: string;
  fecha: string; // YYYY-MM-DD
  horasNormales: number; // Max 8h ordinarias
  horasSuplementarias: number; // Recargo 50%
  horasExtraordinarias: number; // Recargo 100%
  validadoResidente?: boolean;
}

export interface PayrollWorkerCalculation {
  trabajadorId: string;
  nombreCompleto: string;
  cedula: string;
  categoriaOcupacional: string;
  diasLaborados: number;
  totalHorasNormales: number;
  totalHorasSuplementarias: number;
  totalHorasExtraordinarias: number;
  tarifaHoraBase: number;
  ingresoHorasNormales: number;
  ingresoHorasSuplementarias: number;
  ingresoHorasExtraordinarias: number;
  totalIngresosGravados: number; // Materia gravada IESS
  // Deducciones
  aportePersonalIess: number; // 9.45%
  netoARecibir: number; // Lo que se transfiere al trabajador
  // Cargas Patronales & Provisiones Sociales
  aportePatronalIess: number; // 12.15% (11.15% IESS + 0.5% SECAP + 0.5% IECE)
  decimoTerceroProvision: number; // 1/12
  decimoCuartoProvision: number; // SBU / 12
  fondoReservaProvision: number; // 8.33%
  vacacionesProvision: number; // 1/24
  totalCargasPatronales: number;
  costoEmpresaTotal: number; // Costo real cargado al APU
  costoHoraEfectivaApu: number; // Costo por hora para el rubro
  rubroApuCodigo: string;
}

export interface PayrollBatchResult {
  periodo: { mes: number; anio: number };
  proyectoId?: string;
  totalTrabajadores: number;
  totalNetoAPagar: number;
  totalAporteIessConsolidado: number; // Personal + Patronal
  totalProvisionesSociales: number;
  costoDirectoTotalManoObra: number;
  detallesPorTrabajador: PayrollWorkerCalculation[];
  asientoContableNomina: {
    glosa: string;
    totalDebe: number;
    totalHaber: number;
    asientoCuadrado: boolean;
    detalles: Array<{
      codigoCuenta: string;
      nombreCuenta: string;
      debito: number;
      credito: number;
      centroCostoId?: string;
    }>;
  };
}

export class IessPayrollService {
  // Salario Básico Unificado Ecuador (Acuerdo Ministerial MDT-2025-195 vigente 2026: $482.00; 2025: $470.00)
  public static readonly SBU_2026 = 482.0;
  public static readonly SBU_2025 = 470.0;

  // Tarifas horarias mínimas sectoriales de construcción CICS (Comisión Sectorial de la Construcción)
  public static readonly TABLA_SECTORIAL_CONSTRUCCION: Record<string, { salarioMinimoMes: number; tarifaHora: number }> = {
    'Maestro Mayor': { salarioMinimoMes: 620.0, tarifaHora: 3.88 },
    'Fierrero': { salarioMinimoMes: 545.0, tarifaHora: 3.41 },
    'Albañil': { salarioMinimoMes: 535.0, tarifaHora: 3.34 },
    'Encofrador': { salarioMinimoMes: 535.0, tarifaHora: 3.34 },
    'Topógrafo': { salarioMinimoMes: 680.0, tarifaHora: 4.25 },
    'Peón': { salarioMinimoMes: 482.0, tarifaHora: 3.01 },
    'Residente': { salarioMinimoMes: 1200.0, tarifaHora: 7.50 },
  };

  // Factores porcentuales legales
  private static readonly PCT_APORTE_PERSONAL_IESS = 0.0945; // 9.45%
  private static readonly PCT_APORTE_PATRONAL_CONSTRUCCION = 0.1215; // 11.15% IESS + 0.5% SECAP + 0.5% IECE = 12.15%
  private static readonly PCT_FONDO_RESERVA = 0.0833; // 8.33%
  private static readonly PCT_DECIMO_TERCERO = 1 / 12; // 8.333%
  private static readonly PCT_VACACIONES = 1 / 24; // 4.166%

  /**
   * Procesa un lote de tareos y calcula la nómina consolidada con cargas patronales y APU
   */
  public static calculatePayroll(
    tareos: DailyTareoInput[],
    periodo: { mes: number; anio: number },
    proyectoId?: string
  ): PayrollBatchResult {
    // Agrupar tareos por trabajador
    const agrupado: Map<string, {
      info: DailyTareoInput;
      dias: Set<string>;
      horasNormales: number;
      horasSuplementarias: number;
      horasExtraordinarias: number;
    }> = new Map();

    for (const t of tareos) {
      if (!agrupado.has(t.trabajadorId)) {
        agrupado.set(t.trabajadorId, {
          info: t,
          dias: new Set([t.fecha]),
          horasNormales: t.horasNormales,
          horasSuplementarias: t.horasSuplementarias,
          horasExtraordinarias: t.horasExtraordinarias,
        });
      } else {
        const item = agrupado.get(t.trabajadorId)!;
        item.dias.add(t.fecha);
        item.horasNormales += t.horasNormales;
        item.horasSuplementarias += t.horasSuplementarias;
        item.horasExtraordinarias += t.horasExtraordinarias;
      }
    }

    const detallesPorTrabajador: PayrollWorkerCalculation[] = [];
    let acumNetoAPagar = 0;
    let acumPersonalIess = 0;
    let acumPatronalIess = 0;
    let acumProvisiones = 0;
    let acumCostoDirecto = 0;

    const sbuVigente = periodo.anio === 2025 ? this.SBU_2025 : this.SBU_2026;

    agrupado.forEach((val, trabajadorId) => {
      const cat = val.info.categoriaOcupacional;
      const tarifa = this.TABLA_SECTORIAL_CONSTRUCCION[cat]?.tarifaHora || 3.01;

      // 1. Ingresos
      const ingNormal = +(val.horasNormales * tarifa).toFixed(2);
      const ingSupl = +(val.horasSuplementarias * (tarifa * 1.5)).toFixed(2); // Recargo 50%
      const ingExtra = +(val.horasExtraordinarias * (tarifa * 2.0)).toFixed(2); // Recargo 100%
      const totalIngresos = +(ingNormal + ingSupl + ingExtra).toFixed(2);

      // 2. Deducción de Aporte Personal IESS (9.45%)
      const aportePersonal = +(totalIngresos * this.PCT_APORTE_PERSONAL_IESS).toFixed(2);
      const netoPagar = +(totalIngresos - aportePersonal).toFixed(2);

      // 3. Aporte Patronal Sectorial (12.15%)
      const aportePatronal = +(totalIngresos * this.PCT_APORTE_PATRONAL_CONSTRUCCION).toFixed(2);

      // 4. Beneficios y Provisiones Sociales
      const decimoTercero = +(totalIngresos * this.PCT_DECIMO_TERCERO).toFixed(2);
      const factorHorasOrdinariasMes = val.horasNormales > 0
        ? Math.min(val.horasNormales, 160) / 160
        : (val.dias.size * 8) / 240;
      const decimoCuarto = +((sbuVigente / 12) * factorHorasOrdinariasMes).toFixed(2);
      const fondoReserva = +(totalIngresos * this.PCT_FONDO_RESERVA).toFixed(2);
      const vacaciones = +(totalIngresos * this.PCT_VACACIONES).toFixed(2);

      const totalCargas = +(aportePatronal + decimoTercero + decimoCuarto + fondoReserva + vacaciones).toFixed(2);
      const costoEmpresa = +(totalIngresos + aportePatronal + decimoTercero + decimoCuarto + fondoReserva + vacaciones).toFixed(2);

      const totalHorasLaboradas = val.horasNormales + val.horasSuplementarias + val.horasExtraordinarias;
      const costoHoraEfectiva = totalHorasLaboradas > 0 ? +(costoEmpresa / totalHorasLaboradas).toFixed(4) : tarifa;

      detallesPorTrabajador.push({
        trabajadorId,
        nombreCompleto: val.info.nombreCompleto,
        cedula: val.info.cedula,
        categoriaOcupacional: cat,
        diasLaborados: val.dias.size,
        totalHorasNormales: val.horasNormales,
        totalHorasSuplementarias: val.horasSuplementarias,
        totalHorasExtraordinarias: val.horasExtraordinarias,
        tarifaHoraBase: tarifa,
        ingresoHorasNormales: ingNormal,
        ingresoHorasSuplementarias: ingSupl,
        ingresoHorasExtraordinarias: ingExtra,
        totalIngresosGravados: totalIngresos,
        aportePersonalIess: aportePersonal,
        netoARecibir: netoPagar,
        aportePatronalIess: aportePatronal,
        decimoTerceroProvision: decimoTercero,
        decimoCuartoProvision: decimoCuarto,
        fondoReservaProvision: fondoReserva,
        vacacionesProvision: vacaciones,
        totalCargasPatronales: totalCargas,
        costoEmpresaTotal: costoEmpresa,
        costoHoraEfectivaApu: costoHoraEfectiva,
        rubroApuCodigo: val.info.rubroApuCodigo,
      });

      acumNetoAPagar += netoPagar;
      acumPersonalIess += aportePersonal;
      acumPatronalIess += aportePatronal;
      acumProvisiones += (decimoTercero + decimoCuarto + fondoReserva + vacaciones);
      acumCostoDirecto += costoEmpresa;
    });

    const totalAporteIessConsolidado = +(acumPersonalIess + acumPatronalIess).toFixed(2);

    // 5. Asiento Contable Automático de Nómina
    const glosa = `Rol de pagos y provisiones laborales construcción periodo ${periodo.mes}/${periodo.anio} - ${detallesPorTrabajador.length} operarios`;
    const totalDebe = +acumCostoDirecto.toFixed(2);
    const totalHaber = +(acumNetoAPagar + totalAporteIessConsolidado + acumProvisiones).toFixed(2);

    const asientoContableNomina = {
      glosa,
      totalDebe,
      totalHaber,
      asientoCuadrado: Math.abs(totalDebe - totalHaber) < 0.05,
      detalles: [
        {
          codigoCuenta: '1.1.05.02',
          nombreCuenta: 'Obras en Curso - Mano de Obra Directa (Costo Empresa)',
          debito: totalDebe,
          credito: 0,
          centroCostoId: proyectoId,
        },
        {
          codigoCuenta: '2.1.01.02',
          nombreCuenta: 'Sueldos y Jornales por Pagar (Neto Cuadrilla)',
          debito: 0,
          credito: +acumNetoAPagar.toFixed(2),
        },
        {
          codigoCuenta: '2.1.05.01',
          nombreCuenta: 'Obligaciones Patronales y Personales IESS por Pagar',
          debito: 0,
          credito: totalAporteIessConsolidado,
        },
        {
          codigoCuenta: '2.1.05.02',
          nombreCuenta: 'Provisiones Laborales por Pagar (13vo, 14vo, Fondos, Vacaciones)',
          debito: 0,
          credito: +acumProvisiones.toFixed(2),
        },
      ],
    };

    return {
      periodo,
      proyectoId,
      totalTrabajadores: detallesPorTrabajador.length,
      totalNetoAPagar: +acumNetoAPagar.toFixed(2),
      totalAporteIessConsolidado,
      totalProvisionesSociales: +acumProvisiones.toFixed(2),
      costoDirectoTotalManoObra: +acumCostoDirecto.toFixed(2),
      detallesPorTrabajador,
      asientoContableNomina,
    };
  }
}
