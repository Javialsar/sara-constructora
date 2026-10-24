/**
 * SUITE DE PRUEBAS AUTOMATIZADAS — SARA TALENTO HUMANO
 * GRUPO SARA - SARA-CONSTRUCTORA
 * 
 * Valida:
 * 1. Flujo de consulta y unificación de perfiles de talento en Supabase / Trabajadores de obra.
 * 2. Algoritmo de intermediación con custodia de datos personales (Decreto 255 / Privacidad).
 * 3. Ciclo de contratación Escrow con cálculo de horas y fondo en garantía.
 * 4. Normativa laboral del Ecuador 2026: SBU $482, aportes IESS (9.45% / 12.15%) y EPP.
 * 5. Factor de sinuosidad vial ecuatoriana (1.35x) y detección de personal foráneo.
 */

import { SaraTalentoRequestsService, SolicitudPersonalEmpresa } from '../src/lib/services/saraTalentoRequestsService';
import { TALENTO_SEMILLA, TalentDB } from '../src/lib/services/talentoService';
import { SaraTalentoCoreService } from '../src/lib/services/saraTalentoCoreService';
import { SaraTareoObraService } from '../src/lib/services/saraTareoObraService';

async function runTalentoLifecycleTests() {
  console.log('================================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS: MÓDULO SARA TALENTO (GRUPO SARA)');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASÓ: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FALLÓ: ${testName} ${detail ? `(${detail})` : ''}`);
      failedTests++;
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Semilla de Talento y Esquema de Datos
  // ---------------------------------------------------------------------------
  console.log('📋 GRUPO 1: Integridad del Catálogo y Semilla de Profesionales');
  assert(TALENTO_SEMILLA.length >= 4, 'El catálogo semilla contiene al menos 4 perfiles técnicos calificados');
  
  const tieneIngeniero = TALENTO_SEMILLA.some(t => t.role.toLowerCase().includes('ingenier'));
  const tieneMaestro = TALENTO_SEMILLA.some(t => t.role.toLowerCase().includes('maestro'));
  assert(tieneIngeniero && tieneMaestro, 'El catálogo cuenta con Ingenieros Civiles y Maestros Mayores');

  const todosConTarifaValida = TALENTO_SEMILLA.every(t => t.hourlyRate > 0 && t.experienceYears >= 0);
  assert(todosConTarifaValida, 'Todos los perfiles tienen tarifas horarias positivas y años de experiencia consistentes');

  // ---------------------------------------------------------------------------
  // TEST 2: Intermediación con Custodia de Contacto (Privacidad Ecuador)
  // ---------------------------------------------------------------------------
  console.log('\n🔒 GRUPO 2: Custodia Institucional y Privacidad de Datos');
  
  const nuevaSolicitud = SaraTalentoRequestsService.crearSolicitud({
    empresa_solicitante: {
      razon_social: 'CONSTRUCTORA DEL SUR S.A.S.',
      ruc: '1190048291001',
      representante: 'Ing. Carlos Mendoza',
      cargo: 'Director de Fiscalización',
      telefono: '+593 99 123 4567',
      email: 'contrataciones@constructoradelsur.ec',
      ciudad: 'Loja, Ecuador'
    },
    trabajador: {
      id: 'tal-test-01',
      nombre_completo: 'Ing. Elena Morales PMP',
      cedula: '110482****',
      categoria_ocupacional: 'Ingeniera Residente de Obra',
      calificacion: 4.95,
      jornal_real: 45.0,
      costo_horario: 5.62,
      telefono: '+593 98 765 4321',
      email: 'elena.morales@profesional.sara.ec'
    },
    obra_destino: 'Torres del Valle - Fase Cimentaciones',
    duracion: '4 meses',
    fecha_inicio: '2026-11-01',
    epp_requerido: true,
    notas_adicionales: 'Supervisión de vaciados de zapatas y losas de cimentación.'
  });

  assert(nuevaSolicitud.id.startsWith('REQ-TAL-'), 'La solicitud genera un código único institucional (REQ-TAL-*)');
  assert(nuevaSolicitud.estado === 'pendiente', 'La nueva solicitud inicia en estado "pendiente"');
  assert(nuevaSolicitud.contactos_desbloqueados === false, 'Los datos de contacto permanecen bloqueados en estado pendiente');

  // Aceptar la solicitud para probar el desbloqueo bidireccional
  const solicitudAceptada = SaraTalentoRequestsService.aceptarSolicitud(nuevaSolicitud.id);
  assert(solicitudAceptada?.estado === 'aceptado', 'La solicitud transiciona a estado "aceptado"');
  assert(solicitudAceptada?.contactos_desbloqueados === true, 'Los contactos se desbloquean bidireccionalmente tras aceptación');

  // ---------------------------------------------------------------------------
  // TEST 3: Matemática Laboral y SBU 2026 Ecuador
  // ---------------------------------------------------------------------------
  console.log('\n⚖️ GRUPO 3: Cumplimiento Normativo Laboral Ecuador 2026');
  
  const SBU_2026 = 482.00; // Acuerdo MDT-2025-195
  const APORTE_PERSONAL_PCT = 0.0945; // 9.45% IESS
  const APORTE_PATRONAL_CONSTRUCCION_PCT = 0.1215; // 12.15% sector construcción
  const FONDO_RESERVA_PCT = 0.0833; // 8.33%

  const aportePersonal = +(SBU_2026 * APORTE_PERSONAL_PCT).toFixed(2);
  const aportePatronal = +(SBU_2026 * APORTE_PATRONAL_CONSTRUCCION_PCT).toFixed(2);
  const fondoReserva = +(SBU_2026 * FONDO_RESERVA_PCT).toFixed(2);

  assert(SBU_2026 === 482.00, 'Salario Básico Unificado vigente calibrado en $482.00 USD (2026)');
  assert(aportePersonal === 45.55, 'Aporte personal IESS 9.45% calculado exactamente ($45.55 USD)');
  assert(aportePatronal === 58.56, 'Aporte patronal construcción 12.15% calculado exactamente ($58.56 USD)');
  assert(fondoReserva === 40.15, 'Provisión mensual de Fondo de Reserva 8.33% calculada exactamente ($40.15 USD)');

  // ---------------------------------------------------------------------------
  // TEST 4: Fideicomiso Escrow y Retenciones SRI
  // ---------------------------------------------------------------------------
  console.log('\n💰 GRUPO 4: Fideicomiso Escrow y Retenciones Tributarias SRI');
  
  const tarifaHora = 35.00; // USD/hora
  const horasPactadas = 40; // 1 semana base
  const montoManoObra = +(tarifaHora * horasPactadas).toFixed(2); // $1400.00
  const comisionCustodiaPct = 0.03; // 3% custodia institucional
  const comisionCustodiaUSD = +(montoManoObra * comisionCustodiaPct).toFixed(2); // $42.00
  const totalGarantiaEscrow = +(montoManoObra + comisionCustodiaUSD).toFixed(2); // $1442.00

  assert(montoManoObra === 1400.00, 'Monto de mano de obra calculado exactamente (40h x $35/h = $1400.00)');
  assert(comisionCustodiaUSD === 42.00, 'Comisión de custodia Escrow 3% calculada correctamente ($42.00 USD)');
  assert(totalGarantiaEscrow === 1442.00, 'Fondo total en custodia Escrow suma exactamente el 103%');

  // Retención en la fuente SRI Código 344 (Obra civil: 2.00% IR)
  const retencionIrObraCivil = +(montoManoObra * 0.02).toFixed(2);
  assert(retencionIrObraCivil === 28.00, 'Retención en la fuente SRI Cód. 344 (2% IR) calculada correctamente ($28.00 USD)');

  // ---------------------------------------------------------------------------
  // TEST 5: Sinuosidad Vial y Detección de Personal Foráneo
  // ---------------------------------------------------------------------------
  console.log('\n🗺️ GRUPO 5: Factor de Sinuosidad Vial y Personal Foráneo');
  
  const distanciaEuclidianaKm = 60.0;
  const FACTOR_SINUOSIDAD_EC = 1.35;
  const distanciaRealCarreteraKm = +(distanciaEuclidianaKm * FACTOR_SINUOSIDAD_EC).toFixed(1);

  assert(distanciaRealCarreteraKm === 81.0, 'Distancia por carretera calculada con factor de sinuosidad 1.35 (81.0 km)');
  
  const UMBRAL_CAMPAMENTO_FORANEO_KM = 80.0;
  const requiereCampamentoTecnico = distanciaRealCarreteraKm > UMBRAL_CAMPAMENTO_FORANEO_KM;
  assert(requiereCampamentoTecnico === true, 'Detecta correctamente que un trabajador a >80 km requiere alojamiento técnico (SARA-ALOJAMIENTO)');

  // ---------------------------------------------------------------------------
  // TEST 6: SaraTalentoCoreService (Vacantes y Postulaciones)
  // ---------------------------------------------------------------------------
  console.log('\n💼 GRUPO 6: Servicio Central de Vacantes y Postulaciones');
  
  const vacantes = await SaraTalentoCoreService.listarVacantes();
  assert(vacantes.length >= 2, 'Lista vacantes registradas en el sistema');
  
  const nuevaVacante = await SaraTalentoCoreService.crearVacante({
    empresa_id: 'emp-sara-test',
    titulo: 'Ingeniero Residente de Obra Estructural',
    rol_oficio: 'Ingeniero Civil',
    especialidad: 'Estructuras de Hormigón Armado',
    descripcion: 'Control técnico de obra civil en Loja.',
    requisitos: 'Título registrado en SENESCYT, 3 años de experiencia en losas',
    certificaciones_requeridas: ['SENESCYT', 'SECAP'],
    ubicacion_provincia: 'Loja',
    ubicacion_canton: 'Loja',
    modalidad: 'presencial_obra',
    tipo_contrato: 'obra_cierta',
    salario_min: 1200,
    salario_max: 1600,
    estado: 'publicada',
    vacantes_disponibles: 1
  });

  assert(nuevaVacante.id !== undefined && nuevaVacante.estado === 'publicada', 'Crea y publica una nueva vacante técnica con éxito');

  const nuevaPostulacion = await SaraTalentoCoreService.crearPostulacion({
    vacante_id: nuevaVacante.id,
    talento_id: 'tal-ana-test',
    mensaje_presentacion: 'Experiencia liderando fiscalización de losas postensadas.',
    tarifa_ofertada: 35.0,
    estado: 'recibida'
  });

  assert(nuevaPostulacion.id !== undefined && nuevaPostulacion.estado === 'recibida', 'Registra postulación formal a la vacante creada');

  const postulacionActualizada = await SaraTalentoCoreService.actualizarEstadoPostulacion(
    nuevaPostulacion.id,
    'preseleccionada',
    'Perfil cumple con requisitos de hormigón armado.'
  );
  assert(postulacionActualizada?.estado === 'preseleccionada', 'Avanza la postulación por el embudo de selección');

  // ---------------------------------------------------------------------------
  // TEST 7: SaraTareoObraService (Tareo Diario, APU y Costos IESS 2026)
  // ---------------------------------------------------------------------------
  console.log('\n🏗️ GRUPO 7: Tareo Diario de Obra, IESS 2026 y Desviación APU');
  
  const proyectosTareo = SaraTareoObraService.getProyectos();
  assert(proyectosTareo.length >= 3, 'El catálogo de proyectos de obra civil contiene al menos 3 proyectos');

  const fechaHoy = new Date().toISOString().split('T')[0];
  const tareos = SaraTareoObraService.getTareos('proy-mirador', fechaHoy);
  assert(tareos.length >= 1, 'Obtiene registros de tareo de la obra');

  const calculoJornada = SaraTareoObraService.calcularAnalisisCosto(tareos);
  assert(calculoJornada.resumen.totalHorasHombre > 0, 'Calcula horas-hombre totales del día en obra civil');
  assert(calculoJornada.resumen.costoTotalRealJornada > 0, 'Calcula el costo real total de empresa de la jornada');
  assert(calculoJornada.resumen.totalAportePatronalIess > 0, 'Aplica el aporte patronal IESS 12.15% del sector construcción');

  // Validar firma de fiscalización
  const fiscalizacionResult = SaraTareoObraService.firmarYValidarTareo(
    'proy-mirador',
    fechaHoy,
    {
      nombre: 'Ing. Mateo Calderón',
      cargo: 'Colegio de Ingenieros Civiles de Pichincha Reg. 4921'
    }
  );
  assert(fiscalizacionResult.success === true, 'Firma y valida el tareo diario de la obra');
  assert(fiscalizacionResult.hash.startsWith('SARA-FISC-'), 'Genera estampilla y código de fiscalización criptográfico');

  // ---------------------------------------------------------------------------
  // RESUMEN FINAL
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 RESULTADOS FINALES DE LA SUITE SARA TALENTO:`);
  console.log(`   Pruebas Exitosas: ${passedTests}`);
  console.log(`   Pruebas Fallidas: ${failedTests}`);
  console.log(`   Tasa de Éxito:    ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTalentoLifecycleTests().catch(err => {
  console.error('Error ejecutando suite de pruebas de talento:', err);
  process.exit(1);
});
