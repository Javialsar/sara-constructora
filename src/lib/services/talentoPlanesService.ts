/**
 * SERVICIO DE PLANES DE COLOCACIÓN LABORAL DE TALENTO HUMANO (SUCCESS-FEE MODEL)
 * Modelo de negocio: $0 costo inicial. El aspirante cancela el porcentaje pactado 
 * (25% VIP, 15% Profesional, 10% Básico) exclusivamente sobre su primer mes de trabajo.
 */

export interface TalentoPlan {
  id: string; // 'vip' | 'profesional' | 'basico' | custom
  nombre: string;
  slug: string;
  porcentajePrimerMes: number; // 25, 15, 10
  costoInicial: number; // Siempre 0 en el modelo de éxito
  tagline: string;
  prioridadMultiplicador: number; // 5.0, 2.5, 1.0
  badgeColor: string; // Tailwind class
  textColor: string;
  borderColor: string;
  ringColor: string;
  destacado: boolean;
  activo: boolean;
  beneficios: string[];
  candidatosInscritos: number;
  colocacionesExitosas: number;
  ordenVisual: number;
}

export const PLANES_TALENTO_DEFAULT: TalentoPlan[] = [
  {
    id: 'vip',
    nombre: 'Plan VIP Obra & Fábrica',
    slug: 'vip',
    porcentajePrimerMes: 25,
    costoInicial: 0,
    tagline: 'Máxima prioridad algorítmica y postulación proactiva 24/7 por Cuadrilla IA',
    prioridadMultiplicador: 5.0,
    badgeColor: 'bg-amber-500 text-slate-950 font-black',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    ringColor: 'ring-amber-500',
    destacado: true,
    activo: true,
    candidatosInscritos: 42,
    colocacionesExitosas: 18,
    ordenVisual: 1,
    beneficios: [
      'Posicionamiento Top #1 en Radar Geográfico GPS y Bolsa de Trabajo',
      'Insignia Dorada Oficial 👑 CANDIDATO VIP verificada ante contratistas',
      'Matching proactivo 24/7: Postulación automática a licitaciones SERCOP y obras civiles',
      'Auditoría técnica y optimización de CV/Portafolio por especialistas SARA',
      'Alertas inmediatas vía WhatsApp y llamada bot ante vacantes en su radio de acción',
      'Presentación directa con Gerentes de Obra y Directores Técnicos'
    ]
  },
  {
    id: 'profesional',
    nombre: 'Plan Profesional Pro',
    slug: 'profesional',
    porcentajePrimerMes: 15,
    costoInicial: 0,
    tagline: 'Alta visibilidad en el radar y matching semanal a proyectos de construcción',
    prioridadMultiplicador: 2.5,
    badgeColor: 'bg-blue-600 text-white font-bold',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    ringColor: 'ring-blue-500',
    destacado: false,
    activo: true,
    candidatosInscritos: 128,
    colocacionesExitosas: 34,
    ordenVisual: 2,
    beneficios: [
      'Posicionamiento destacado en primera página del Radar Geográfico',
      'Insignia Azul Oficial ★ PROFESIONAL DESTACADO en perfil público',
      'Matching asistido: Postulación automática a hasta 5 vacantes semanales',
      'Notificaciones prioritarias en la App y correo electrónico',
      'Validación de certificaciones SECAP y títulos SENESCYT en expediente',
      'Soporte técnico en postulaciones a consorcios y constructoras'
    ]
  },
  {
    id: 'basico',
    nombre: 'Plan Básico Estándar',
    slug: 'basico',
    porcentajePrimerMes: 10,
    costoInicial: 0,
    tagline: 'Ingreso gratuito a la red general con postulación manual a vacantes abiertas',
    prioridadMultiplicador: 1.0,
    badgeColor: 'bg-slate-700 text-slate-200 font-medium',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-700',
    ringColor: 'ring-slate-500',
    destacado: false,
    activo: true,
    candidatosInscritos: 310,
    colocacionesExitosas: 22,
    ordenVisual: 3,
    beneficios: [
      'Visibilidad estándar en el directorio de mano de obra y especialistas',
      'Insignia BÁSICO con perfil público auditable',
      'Postulaciones manuales ilimitadas a vacantes abiertas en la plataforma',
      'Almacenamiento de cédula, hoja de vida y certificados en bóveda digital',
      'Acceso a bolsa de empleo general para obras públicas y privadas'
    ]
  }
];

export const STORAGE_KEY_PLANES_TALENTO = 'sara_planes_talento_config';

export class TalentoPlanesService {
  /**
   * Obtiene la lista de planes guardados o por defecto
   */
  static getPlanes(): TalentoPlan[] {
    if (typeof window === 'undefined') return PLANES_TALENTO_DEFAULT;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PLANES_TALENTO);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo planes de talento locales:', e);
    }
    return PLANES_TALENTO_DEFAULT;
  }

  /**
   * Guarda la lista completa de planes en almacenamiento local y emite evento reactivo
   */
  static savePlanes(planes: TalentoPlan[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PLANES_TALENTO, JSON.stringify(planes));
      window.dispatchEvent(new CustomEvent('sara_talento_planes_change', { detail: planes }));
    } catch (e) {
      console.error('Error guardando planes de talento:', e);
    }
  }

  /**
   * Obtiene un plan por su ID o slug
   */
  static getPlanById(id: string): TalentoPlan | undefined {
    const planes = this.getPlanes();
    return planes.find(p => p.id === id || p.slug === id);
  }

  /**
   * Crea un nuevo plan
   */
  static createPlan(nuevoPlan: Omit<TalentoPlan, 'id' | 'candidatosInscritos' | 'colocacionesExitosas'>): TalentoPlan {
    const planes = this.getPlanes();
    const id = `plan-${Date.now()}`;
    const planCompleto: TalentoPlan = {
      ...nuevoPlan,
      id,
      costoInicial: 0,
      candidatosInscritos: 0,
      colocacionesExitosas: 0,
      ordenVisual: planes.length + 1
    };
    planes.push(planCompleto);
    this.savePlanes(planes);
    return planCompleto;
  }

  /**
   * Actualiza un plan existente
   */
  static updatePlan(id: string, updates: Partial<TalentoPlan>): TalentoPlan | null {
    const planes = this.getPlanes();
    const index = planes.findIndex(p => p.id === id);
    if (index === -1) return null;

    planes[index] = { ...planes[index], ...updates };
    this.savePlanes(planes);
    return planes[index];
  }

  /**
   * Elimina o desactiva un plan
   */
  static deletePlan(id: string): boolean {
    const planes = this.getPlanes();
    const filtrados = planes.filter(p => p.id !== id);
    if (filtrados.length === planes.length) return false;
    this.savePlanes(filtrados);
    return true;
  }

  /**
   * Restablece los 3 planes oficiales por defecto
   */
  static resetToDefault(): TalentoPlan[] {
    this.savePlanes(PLANES_TALENTO_DEFAULT);
    return PLANES_TALENTO_DEFAULT;
  }

  /**
   * Calcula la comisión que corresponde a SARA sobre el primer mes
   */
  static calcularComisionPrimerMes(salarioMensual: number, planId: string): {
    salarioMensual: number;
    porcentaje: number;
    comisionSara: number;
    netoProfesional: number;
  } {
    const plan = this.getPlanById(planId) || PLANES_TALENTO_DEFAULT[2]; // Default Básico 10%
    const porcentaje = plan.porcentajePrimerMes;
    const comisionSara = +(salarioMensual * (porcentaje / 100)).toFixed(2);
    const netoProfesional = +(salarioMensual - comisionSara).toFixed(2);

    return {
      salarioMensual,
      porcentaje,
      comisionSara,
      netoProfesional
    };
  }
}
