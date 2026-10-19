// ============================================================================
// SERVICIO DE CONFIGURACIÓN DE LA EMPRESA CONSTRUCTORA
// Identidad Corporativa, Logotipo Oficial, Dirección, Staff Técnico y Membretes
// Configuración de Firmas por Tipo de Informe (Obras, Bodega, Compras, Contabilidad)
// ============================================================================

export interface EmpresaIdentidad {
  razon_social: string;
  nombre_comercial: string;
  ruc: string;
  gerente: string;
  provincia: string;
  canton: string;
  ciudad: string;
  calle_principal: string;
  calle_secundaria: string;
  telefono: string;
  email: string;
  sitio_web: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  latitud: number;
  longitud: number;
}

export interface ProfesionalStaff {
  id: string;
  nombre: string;
  cargo: string;
  senescyt: string;
  telefono: string;
  email: string;
}

export interface ModuloFirmaConfig {
  titulo_bloque: string;
  firma1_titulo: string;
  firma1_nombre: string;
  firma1_cargo: string;
  firma1_documento: string; // SENESCYT, CI o Licencia
  firma2_habilitada: boolean;
  firma2_titulo: string;
  firma2_nombre: string;
  firma2_cargo: string;
  firma2_documento: string;
}

export interface ReportesConfig {
  incluir_logo: boolean;
  incluir_razon_social: boolean;
  incluir_ruc: boolean;
  incluir_direccion: boolean;
  incluir_telefono: boolean;
  incluir_email: boolean;
  incluir_qr: boolean;
  tecnico_firmante_id?: string;
  segunda_firma_habilitada: boolean;
  segunda_firma_cargo: string;
  segunda_firma_nombre: string;
  // Configuración de firmas especializada por tipo de informe
  firmasPorModulo: {
    obras: ModuloFirmaConfig;
    bodega: ModuloFirmaConfig;
    compras: ModuloFirmaConfig;
    contabilidad: ModuloFirmaConfig;
    talento?: ModuloFirmaConfig;
  };
}

export interface EmpresaConfigCompleta {
  empresa: EmpresaIdentidad;
  logo: string | null;
  staffTecnico: ProfesionalStaff[];
  reportesConfig: ReportesConfig;
}

const STORAGE_KEY_EMPRESA = 'sara_empresa_identidad';
const STORAGE_KEY_LOGO = 'my_company_logo';
const STORAGE_KEY_STAFF = 'sara_empresa_staff';
const STORAGE_KEY_REPORTES = 'sara_reportes_config';
const STORAGE_KEY_PROFILE_COMPAT = 'my_company_profile';

const DEFAULT_EMPRESA: EmpresaIdentidad = {
  razon_social: 'LIDER ARQUITECTURA & CONSTRUCCIÓN CÍA. LTDA.',
  nombre_comercial: 'SARA CONSTRUCTORA & ASOCIADOS',
  ruc: '1191728394001',
  gerente: 'Ing. David Sarango Malacatus',
  provincia: 'Loja',
  canton: 'Loja',
  ciudad: 'Loja',
  calle_principal: 'Av. Universitaria y 10 de Agosto',
  calle_secundaria: 'Edificio Corporativo SARA, Piso 4, Of. 402',
  telefono: '+593 99 481 2938',
  email: 'gerencia@saraconstructora.com',
  sitio_web: 'https://sara-constructora.vercel.app',
  facebook: 'https://facebook.com/saraconstructora',
  instagram: '@saraconstructora.ec',
  linkedin: 'linkedin.com/company/saraconstructora',
  latitud: -3.99313,
  longitud: -79.20422
};

const DEFAULT_STAFF: ProfesionalStaff[] = [
  {
    id: 'staff-1',
    nombre: 'Ing. David Sarango Malacatus',
    cargo: 'Director General & Ing. Civil Estructural',
    senescyt: '1005-2016-189423',
    telefono: '+593 99 481 2938',
    email: 'gerencia@saraconstructora.com'
  },
  {
    id: 'staff-2',
    nombre: 'Arq. Dalton Mejía Orozco',
    cargo: 'Director de Planificación Arquitectónica & Modelador BIM',
    senescyt: '1012-2019-456781',
    telefono: '+593 98 721 0039',
    email: 'arquitectura@saraconstructora.com'
  },
  {
    id: 'staff-3',
    nombre: 'Ing. Elena Valdivieso',
    cargo: 'Ingeniera Residente & Fiscalizadora de Obras',
    senescyt: '1008-2020-741258',
    telefono: '+593 98 765 4321',
    email: 'residencia@saraconstructora.com'
  }
];

const DEFAULT_REPORTES: ReportesConfig = {
  incluir_logo: true,
  incluir_razon_social: true,
  incluir_ruc: true,
  incluir_direccion: true,
  incluir_telefono: true,
  incluir_email: true,
  incluir_qr: true,
  tecnico_firmante_id: 'staff-1',
  segunda_firma_habilitada: true,
  segunda_firma_cargo: 'Representante Legal / Gerente General',
  segunda_firma_nombre: 'Ing. David Sarango Malacatus',
  firmasPorModulo: {
    obras: {
      titulo_bloque: 'Firmas para Informes de Avance, Fiscalización & Cronogramas',
      firma1_titulo: 'ELABORADO POR (RESIDENTE / DIRECTOR DE OBRA)',
      firma1_nombre: 'Ing. David Sarango Malacatus',
      firma1_cargo: 'Director General & Ing. Civil Estructural',
      firma1_documento: 'REG. SENESCYT: 1005-2016-189423',
      firma2_habilitada: true,
      firma2_titulo: 'APROBADO POR (FISCALIZACIÓN / GERENCIA)',
      firma2_nombre: 'Ing. Elena Valdivieso',
      firma2_cargo: 'Fiscalizadora General de Obra',
      firma2_documento: 'REG. SENESCYT: 1008-2020-741258'
    },
    bodega: {
      titulo_bloque: 'Firmas para Vales de Kardex, Actas de Entrega & Devoluciones',
      firma1_titulo: 'DESPACHADO / EMITIDO POR (BODEGUERO GENERAL)',
      firma1_nombre: 'Sr. Wilson Guamán Tapia',
      firma1_cargo: 'Jefe de Bodega Central & Kardex',
      firma1_documento: 'C.I. 1104829104',
      firma2_habilitada: true,
      firma2_titulo: 'RECIBIDO CONFORME EN OBRA (MAESTRO / RESIDENTE)',
      firma2_nombre: 'Segundo Manuel Guamán',
      firma2_cargo: 'Maestro Mayor de Obra',
      firma2_documento: 'C.I. 1103849582'
    },
    compras: {
      titulo_bloque: 'Firmas para Órdenes de Compra & Cuadros Comparativos',
      firma1_titulo: 'ELABORADO POR (JEFE DE COMPRAS & PROCURA)',
      firma1_nombre: 'Lic. Martha Elizabeth Córdova',
      firma1_cargo: 'Coordinadora de Adquisiciones & Suministros',
      firma1_documento: 'C.I. 1103984120',
      firma2_habilitada: true,
      firma2_titulo: 'AUTORIZADO POR (DIRECCIÓN FINANCIERA)',
      firma2_nombre: 'Ing. David Sarango Malacatus',
      firma2_cargo: 'Gerente General / Representante Legal',
      firma2_documento: 'RUC: 1191728394001'
    },
    contabilidad: {
      titulo_bloque: 'Firmas para Conciliación 3-Way Match SRI, Retenciones & Nómina IESS',
      firma1_titulo: 'LIQUIDADO POR (CONTADOR GENERAL)',
      firma1_nombre: 'C.P.A. Dalton Mejía Orozco',
      firma1_cargo: 'Contador Tributario Colegiado',
      firma1_documento: 'REG. CONTADOR: RNA-098214',
      firma2_habilitada: true,
      firma2_titulo: 'REVISADO Y APROBADO POR (GERENCIA FINANCIERA)',
      firma2_nombre: 'Ing. David Sarango Malacatus',
      firma2_cargo: 'Representante Legal',
      firma2_documento: 'C.I. 1102978630'
    },
    talento: {
      titulo_bloque: 'Firmas para Requerimientos de Personal, Contratos Laborales & SARA Talento',
      firma1_titulo: 'EMITIDO POR (DIRECTOR DE TALENTO HUMANO / RESIDENCIA)',
      firma1_nombre: 'Ing. David Sarango Malacatus',
      firma1_cargo: 'Director General & Contratante',
      firma1_documento: 'RUC: 1191728394001',
      firma2_habilitada: true,
      firma2_titulo: 'AUDITADO POR (COORDINACIÓN SARA TALENTO & SECAP)',
      firma2_nombre: 'Ing. Elena Valdivieso',
      firma2_cargo: 'Supervisora de Calificación Técnica & IESS',
      firma2_documento: 'REG. SENESCYT: 1008-2020-741258'
    }
  }
};

export class EmpresaConfigService {
  static getEmpresa(): EmpresaIdentidad {
    if (typeof window === 'undefined') return DEFAULT_EMPRESA;
    try {
      const data = localStorage.getItem(STORAGE_KEY_EMPRESA);
      if (data) {
        return { ...DEFAULT_EMPRESA, ...JSON.parse(data) };
      }
      const oldProfile = localStorage.getItem(STORAGE_KEY_PROFILE_COMPAT);
      if (oldProfile) {
        try {
          const parsed = JSON.parse(oldProfile);
          if (parsed.formData) {
            return {
              ...DEFAULT_EMPRESA,
              razon_social: parsed.formData.razon_social || DEFAULT_EMPRESA.razon_social,
              nombre_comercial: parsed.formData.nombre_comercial || DEFAULT_EMPRESA.nombre_comercial,
              ruc: parsed.formData.ruc || DEFAULT_EMPRESA.ruc,
              gerente: parsed.formData.representante || DEFAULT_EMPRESA.gerente,
              telefono: parsed.formData.telefono || DEFAULT_EMPRESA.telefono,
              email: parsed.formData.email || DEFAULT_EMPRESA.email,
              sitio_web: parsed.formData.website || DEFAULT_EMPRESA.sitio_web,
              calle_principal: parsed.formData.direccion || DEFAULT_EMPRESA.calle_principal,
              latitud: parsed.position?.[0] || DEFAULT_EMPRESA.latitud,
              longitud: parsed.position?.[1] || DEFAULT_EMPRESA.longitud,
            };
          }
        } catch {}
      }
      return DEFAULT_EMPRESA;
    } catch {
      return DEFAULT_EMPRESA;
    }
  }

  static getLogo(): string | null {
    if (typeof window === 'undefined') return '/logo-grupo-sara.png';
    try {
      return localStorage.getItem(STORAGE_KEY_LOGO) || '/logo-grupo-sara.png';
    } catch {
      return '/logo-grupo-sara.png';
    }
  }

  static getStaff(): ProfesionalStaff[] {
    if (typeof window === 'undefined') return DEFAULT_STAFF;
    try {
      const data = localStorage.getItem(STORAGE_KEY_STAFF);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  }

  static getReportesConfig(): ReportesConfig {
    if (typeof window === 'undefined') return DEFAULT_REPORTES;
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTES);
      if (data) {
        const parsed = JSON.parse(data);
        return { 
          ...DEFAULT_REPORTES, 
          ...parsed,
          firmasPorModulo: {
            ...DEFAULT_REPORTES.firmasPorModulo,
            ...(parsed.firmasPorModulo || {})
          }
        };
      }
      return DEFAULT_REPORTES;
    } catch {
      return DEFAULT_REPORTES;
    }
  }

  static getConfigCompleta(): EmpresaConfigCompleta {
    return {
      empresa: this.getEmpresa(),
      logo: this.getLogo(),
      staffTecnico: this.getStaff(),
      reportesConfig: this.getReportesConfig()
    };
  }

  static saveConfig(
    empresa: EmpresaIdentidad, 
    logo: string | null, 
    staff: ProfesionalStaff[], 
    reportes: ReportesConfig
  ): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_EMPRESA, JSON.stringify(empresa));
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
      localStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(reportes));
      if (logo) {
        localStorage.setItem(STORAGE_KEY_LOGO, logo);
      }

      localStorage.setItem(STORAGE_KEY_PROFILE_COMPAT, JSON.stringify({
        formData: {
          nombre_comercial: empresa.nombre_comercial,
          razon_social: empresa.razon_social,
          ruc: empresa.ruc,
          representante: empresa.gerente,
          telefono: empresa.telefono,
          email: empresa.email,
          website: empresa.sitio_web,
          direccion: `${empresa.calle_principal}, ${empresa.calle_secundaria} - ${empresa.ciudad}, ${empresa.provincia}`
        },
        position: [empresa.latitud, empresa.longitud]
      }));

      window.dispatchEvent(new CustomEvent('empresa_parametros_updated', {
        detail: { empresa, logo, staff, reportes }
      }));
    } catch (err) {
      console.error('Error guardando configuración de la empresa:', err);
    }
  }
}
