/**
 * SARA Holding Multi-Module Guard & Routing Service
 * Control de acceso estricto y segregación por portal de negocio
 */

export type SaraModule = 
  | 'sara_apu'
  | 'sara_inmobiliaria'
  | 'sara_stays'
  | 'sara_constructora'
  | 'sara_fletes'
  | 'sara_talento'
  | 'sara_facturacion'
  | 'sara_pagos'
  | 'sara_master'

export interface ModuleDefinition {
  id: SaraModule
  name: string
  shortName: string
  description?: string
  loginUrl: string
  portalUrl: string
  allowedRoles: string[]
  color: string
}

export const SARA_MODULES: Record<SaraModule, ModuleDefinition> = {
  sara_apu: {
    id: 'sara_apu',
    name: 'SARA APU - Ingeniería de Costos & Presupuestos',
    shortName: 'SARA APU',
    description: 'Presupuestos de obra, bases APU, SERCOP y análisis de precios.',
    loginUrl: '/login',
    portalUrl: '/dashboard',
    allowedRoles: ['profesional', 'tecnico', 'admin', 'superadmin'],
    color: 'blue'
  },
  sara_inmobiliaria: {
    id: 'sara_inmobiliaria',
    name: 'SARA Inmobiliaria - Bienes Raíces & Plusvalía',
    shortName: 'Inmobiliaria',
    description: 'Catálogo de propiedades, ventas en planos y gestión de brokers.',
    loginUrl: '/inmobiliaria/auth',
    portalUrl: '/inmobiliaria/mi-portal',
    allowedRoles: ['propietario_inmobiliaria', 'comprador_inmobiliaria', 'broker', 'admin', 'superadmin'],
    color: 'purple'
  },
  sara_stays: {
    id: 'sara_stays',
    name: 'SARA Stays - Suites & Alojamientos Turísticos',
    shortName: 'SARA Stays',
    description: 'Alojamientos boutique, reservas y estancias corporativas.',
    loginUrl: '/stays/auth',
    portalUrl: '/stays/mis-reservas',
    allowedRoles: ['huesped', 'anfitrion', 'admin', 'superadmin'],
    color: 'rose'
  },
  sara_constructora: {
    id: 'sara_constructora',
    name: 'SARA Constructora - Portal de Clientes de Obra',
    shortName: 'Constructora',
    description: 'Avance de obra en tiempo real, planos y fiscalización para clientes.',
    loginUrl: '/constructora/auth',
    portalUrl: '/constructora/suite',
    allowedRoles: [
      'cliente_constructora', 
      'profesional_constructora', 
      'ingeniero_residente', 
      'arquitecto_bim', 
      'contratista_general',
      'contador_constructora',
      'bodeguero_constructora',
      'tecnico_apoyo_obra',
      'admin', 
      'superadmin', 
      'tecnico'
    ],
    color: 'emerald'
  },
  sara_fletes: {
    id: 'sara_fletes',
    name: 'SARA Fletes - Logística, Carga & Renta Vehicular',
    shortName: 'SARA Fletes',
    description: 'Bolsa de carga, viajes pesados, backhaul y renta temporal de vehículos para todo el público.',
    loginUrl: '/modulos/fletes/auth',
    portalUrl: '/modulos/fletes/mi-perfil',
    allowedRoles: [
      'transportista', 
      'cliente_fletes', 
      'usuario_fletes', 
      'chofer', 
      'propietario_vehiculo', 
      'cliente_constructora',
      'profesional_constructora',
      'propietario_inmobiliaria',
      'comprador_inmobiliaria',
      'huesped',
      'anfitrion',
      'cuadrilla',
      'trabajador',
      'profesional',
      'cliente_general',
      'publico',
      'admin', 
      'superadmin'
    ],
    color: 'amber'
  },
  sara_talento: {
    id: 'sara_talento',
    name: 'SARA Talento Humano - Cuadrillas & Personal de Obra',
    shortName: 'Talento Humano',
    description: 'Contratación de cuadrillas, maestros mayores y técnicos de obra.',
    loginUrl: '/modulos/talento/auth',
    portalUrl: '/modulos/talento/mi-perfil',
    allowedRoles: ['cuadrilla', 'trabajador', 'obrero', 'admin', 'superadmin'],
    color: 'teal'
  },
  sara_facturacion: {
    id: 'sara_facturacion',
    name: 'SARA Firma y Facturación Electrónica SRI',
    shortName: 'Facturación SRI',
    description: 'Emisión electrónica SRI, comprobantes RIDE/XML, retenciones y certificados de firma digital .p12.',
    loginUrl: '/modulos/facturacion/auth',
    portalUrl: '/modulos/facturacion',
    allowedRoles: [
      'emisor_facturacion', 
      'contador', 
      'profesional', 
      'empresa', 
      'cliente_constructora', 
      'transportista', 
      'admin', 
      'superadmin', 
      'tecnico'
    ],
    color: 'amber'
  },
  sara_pagos: {
    id: 'sara_pagos',
    name: 'SARA Pagos - Fideicomiso Escrow, SRI & Tesorería',
    shortName: 'SARA Pagos',
    description: 'Bóveda de custodia fiduciaria Escrow, liquidación de hitos, Factoring y control tributario SRI/UAFE.',
    loginUrl: '/modulos/financiero/auth',
    portalUrl: '/modulos/financiero',
    allowedRoles: [
      'financiero',
      'tesorero',
      'contador',
      'contador_constructora',
      'inversionista',
      'empresa',
      'cliente_constructora',
      'profesional',
      'admin',
      'superadmin',
      'tecnico'
    ],
    color: 'teal'
  },
  sara_master: {
    id: 'sara_master',
    name: 'GRUPO SARA - Acceso Corporativo Maestro',
    shortName: 'Master Admin',
    description: 'Administración central del holding y acceso universal.',
    loginUrl: '/login',
    portalUrl: '/admin',
    allowedRoles: ['admin', 'superadmin'],
    color: 'slate'
  }
}

/**
 * Roles que tienen acceso universal a todos los módulos
 */
export const UNIVERSAL_ACCESS_ROLES = ['admin', 'superadmin', 'tecnico']

/**
 * Extrae y normaliza los metadatos del usuario priorizando `app_metadata` sobre `user_metadata`
 */
function resolveMetadata(input: any): any {
  if (!input) return {}
  if (input.app_metadata || input.user_metadata) {
    const appMeta = input.app_metadata || {}
    const userMeta = input.user_metadata || {}
    return { ...userMeta, ...appMeta }
  }
  return input
}

/**
 * Determina el módulo principal al que pertenece un usuario
 */
export function getUserModule(rawMetadata: any): SaraModule {
  if (!rawMetadata) return 'sara_apu'
  const metadata = resolveMetadata(rawMetadata)

  // Si es admin o tecnico, pertenece al ecosistema global
  const role = metadata.role || (metadata.es_admin ? 'admin' : '')
  if (UNIVERSAL_ACCESS_ROLES.includes(role)) {
    return 'sara_master'
  }

  // Si tiene modulo_origen explícito
  if (metadata.modulo_origen && metadata.modulo_origen in SARA_MODULES) {
    return metadata.modulo_origen as SaraModule
  }

  // Deducir por rol
  if (
    role === 'cliente_constructora' || 
    role === 'profesional_constructora' || 
    role === 'ingeniero_residente' || 
    role === 'arquitecto_bim' || 
    role === 'contratista_general' ||
    role === 'contador_constructora' ||
    role === 'bodeguero_constructora' ||
    role === 'tecnico_apoyo_obra'
  ) return 'sara_constructora'
  if (role === 'propietario_inmobiliaria' || role === 'comprador_inmobiliaria' || role === 'broker') return 'sara_inmobiliaria'
  if (role === 'huesped' || role === 'anfitrion') return 'sara_stays'
  if (
    role === 'transportista' || 
    role === 'cliente_fletes' || 
    role === 'usuario_fletes' || 
    role === 'chofer' || 
    role === 'propietario_vehiculo'
  ) return 'sara_fletes'
  if (role === 'cuadrilla' || role === 'trabajador' || role === 'obrero') return 'sara_talento'
  if (role === 'emisor_facturacion') return 'sara_facturacion'
  if (role === 'financiero' || role === 'tesorero' || role === 'inversionista') return 'sara_pagos'

  return 'sara_apu'
}

/**
 * Verifica si un usuario tiene autorización para ingresar a un módulo específico
 */
export function canAccessModule(rawMetadata: any, targetModule: SaraModule): boolean {
  if (!rawMetadata) return false
  const metadata = resolveMetadata(rawMetadata)

  const role = metadata.role || (metadata.es_admin ? 'admin' : '')

  // 1. Roles universales siempre tienen acceso a cualquier módulo
  if (UNIVERSAL_ACCESS_ROLES.includes(role)) {
    return true
  }

  // 2. Si el módulo target es sara_master, solo administradores
  if (targetModule === 'sara_master') {
    return role === 'admin' || role === 'superadmin'
  }

  // 3. SARA FLETES: SERVICIO PÚBLICO UNIVERSAL (Uber, inDrive, DiDi de Ecuador)
  // Cualquier usuario autenticado (cliente particular, empresa, profesional o conductor)
  // tiene autorización de uso y acceso a SARA Fletes sin restricciones entre módulos.
  if (targetModule === 'sara_fletes') {
    return true
  }

  // 4. SARA FACTURACIÓN SRI & SARA PAGOS: SERVICIOS FINANCIEROS Y TRIBUTARIOS TRANSVERSALES
  if (targetModule === 'sara_facturacion' || targetModule === 'sara_pagos') {
    return true
  }

  // 4. Revisar array explícito de módulos autorizados si existe
  if (Array.isArray(metadata.modulos_autorizados) && metadata.modulos_autorizados.length > 0) {
    return metadata.modulos_autorizados.includes(targetModule)
  }

  // 5. Comparar estrictamente contra módulo de origen
  const originModule = getUserModule(metadata)
  if (originModule === targetModule) {
    return true
  }

  // 5. Comparar rol contra allowedRoles del módulo target SOLO si no tiene modulo_origen discrepante
  const targetDef = SARA_MODULES[targetModule]
  if (targetDef && targetDef.allowedRoles.includes(role)) {
    // Si tiene modulo_origen explícito y no coincide con el target, denegar acceso
    if (metadata.modulo_origen && metadata.modulo_origen !== targetModule) {
      return false
    }
    return true
  }

  return false
}

/**
 * Retorna la URL del portal al que debe ser redirigido el usuario según su módulo
 */
export function getUserPortalUrl(metadata: any): string {
  const mod = getUserModule(metadata)
  if (mod === 'sara_master') return '/admin'
  return SARA_MODULES[mod]?.portalUrl || '/dashboard'
}
