export interface Cliente {
  id: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  usuario: string
  password_hash?: string
  estado: 'pendiente' | 'activo' | 'inactivo'
  imagen_url?: string
  auth_id?: string
  created_at: string
}

export interface Proyecto {
  id: string
  nombre: string
  ubicacion: string
  estado: 'en_diseno' | 'en_construccion' | 'finalizado'
  avance: number
  cliente_id?: string
  fecha_inicio?: string
  descripcion?: string
  imagen_url?: string
  latitud?: number
  longitud?: number
  created_at: string
}

export interface Avance {
  id: string
  proyecto_id: string
  tipo: 'foto' | 'video' | 'documento' | 'hito'
  titulo: string
  descripcion?: string
  url?: string
  fecha: string
}

export interface SolicitudServicio {
  id: string
  nombre: string
  email: string
  telefono: string
  tipo_servicio: string
  mensaje?: string
  estado: 'nueva' | 'en_revision' | 'aprobada' | 'rechazada'
  created_at: string
}

export interface Cotizacion {
  id: string
  nombre: string
  email: string
  telefono: string
  tipo_proyecto: string
  descripcion?: string
  presupuesto_estimado?: string
  estado: 'pendiente' | 'cotizada' | 'aprobada' | 'rechazada'
  created_at: string
}

export interface Testimonio {
  id: string
  cliente_id: string
  proyecto_id?: string
  comentario: string
  calificacion: number
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at: string
  // Joined fields
  clientes?: { nombre: string; apellido: string }
  proyectos?: { nombre: string }
}
