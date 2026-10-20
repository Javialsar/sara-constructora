import { createSupabaseBrowserClient } from '../supabase-browser';

const supabase = createSupabaseBrowserClient();

export interface TalentDB {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  certifications: string[];
  distanceKm: number;
  rating: number;
  experienceYears: number;
  locationName: string;
  plan: 'VIP' | 'Estandar' | 'Basico';
  status: 'pending' | 'approved';
  paymentId?: string;
  documents?: { type: string; status: string }[];
}

export const TALENTO_SEMILLA: TalentDB[] = [
  {
    id: 'tal-1',
    name: 'Ing. Ana Gómez',
    role: 'Ingeniera Civil',
    hourlyRate: 35,
    certifications: ['Gestión de Proyectos PMP', 'AutoCAD Civil 3D'],
    distanceKm: 2.5,
    rating: 4.9,
    experienceYears: 12,
    locationName: 'Quito, Iñaquito',
    plan: 'VIP',
    status: 'approved',
    paymentId: 'TXN-994827-STRIPE',
    documents: [
      { type: 'Cédula de Identidad', status: 'Verificado' },
      { type: 'CV Académico', status: 'Verificado' },
      { type: 'Título SENESCYT', status: 'Verificado' }
    ]
  },
  {
    id: 'tal-2',
    name: 'Arq. Ricardo Sánchez',
    role: 'Arquitecto',
    hourlyRate: 30,
    certifications: ['Revit BIM', 'Diseño Interior'],
    distanceKm: 15.0,
    rating: 4.8,
    experienceYears: 8,
    locationName: 'Quito, Mitad del Mundo',
    plan: 'VIP',
    status: 'approved',
    paymentId: 'TXN-558291-STRIPE',
    documents: [
      { type: 'Cédula de Identidad', status: 'Verificado' },
      { type: 'Portafolio de Obras', status: 'Verificado' }
    ]
  },
  {
    id: 'tal-3',
    name: 'Ing. Luis Fernando Silva',
    role: 'Ingeniero Civil',
    hourlyRate: 28,
    certifications: ['Cálculo Estructural ETABS'],
    distanceKm: 8.1,
    rating: 4.6,
    experienceYears: 5,
    locationName: 'Quito, Cumbayá',
    plan: 'Estandar',
    status: 'pending',
    paymentId: 'TXN-332918-KUSHKI',
    documents: [
      { type: 'Cédula de Identidad', status: 'Verificado' },
      { type: 'Certificado SECAP', status: 'Subido' }
    ]
  },
  {
    id: 'tal-4',
    name: 'Mstr. Juan Pérez',
    role: 'Maestro Mayor de Obra',
    hourlyRate: 15,
    certifications: ['Trabajo en Alturas', 'Lectura de Planos'],
    distanceKm: 1.2,
    rating: 5.0,
    experienceYears: 20,
    locationName: 'Quito, La Magdalena',
    plan: 'Basico',
    status: 'approved',
    paymentId: 'TXN-112349-KUSHKI',
    documents: [
      { type: 'Cédula de Identidad', status: 'Verificado' },
      { type: 'Certificado SECAP', status: 'Verificado' }
    ]
  }
];

export async function getTalentsFromDB(): Promise<TalentDB[]> {
  try {
    const { data: dbProfiles, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Si hay perfiles en la base de datos, unificarlos
    if (!error && dbProfiles && dbProfiles.length > 0) {
      const mapped = dbProfiles.map((p: any, idx: number) => ({
        id: p.id,
        name: p.nombre || p.full_name || p.specialty || p.profession || 'Especialista Certificado SARA',
        role: p.profession || p.specialty || 'Especialista Técnico',
        hourlyRate: Number(p.hourly_rate) || 25,
        certifications: Array.isArray(p.certifications) ? p.certifications : ['Certificado Verificado SARA'],
        distanceKm: 3.5 + (idx * 2),
        rating: 4.9,
        experienceYears: Number(p.experience_years) || 5,
        locationName: 'Quito, Pichincha',
        plan: (idx === 0 ? 'VIP' : idx === 1 ? 'Estandar' : 'Basico') as 'VIP' | 'Estandar' | 'Basico',
        status: p.availability ? 'approved' as const : 'pending' as const,
        documents: [
          { type: 'Cédula de Identidad', status: 'Verificado' },
          { type: 'Certificación Profesional', status: 'Verificado' }
        ]
      }));

      return [...TALENTO_SEMILLA, ...mapped];
    }

    return TALENTO_SEMILLA;
  } catch (err) {
    console.warn('Error cargando talentos de Supabase:', err);
    return TALENTO_SEMILLA;
  }
}

export async function registerTalentInDB(data: {
  nombre: string;
  rol: string;
  experiencia: number;
  ubicacion: string;
  plan: 'Basico' | 'Estandar' | 'VIP';
  transactionId: string;
  feeAmount: number;
}): Promise<boolean> {
  try {
    // 1. Insertar perfil en Supabase 'talent_profiles'
    const { data: newProfile, error: profileErr } = await supabase
      .from('talent_profiles')
      .insert({
        profession: data.rol,
        experience_years: data.experiencia,
        hourly_rate: data.plan === 'VIP' ? 35 : data.plan === 'Estandar' ? 28 : 20,
        availability: true,
        certifications: [`Plan ${data.plan}`, 'Verificado SARA Talento']
      })
      .select()
      .single();

    if (profileErr) {
      console.warn('Aviso insertando en talent_profiles:', profileErr.message);
    }

    // 2. Registrar solicitud en 'solicitudes_servicio'
    await supabase.from('solicitudes_servicio').insert({
      nombre: data.nombre,
      email: 'postulante@talento.sara',
      telefono: '0990000000',
      tipo_servicio: 'talento',
      mensaje: `[Plan ${data.plan}] Especialidad: ${data.rol}. Experiencia: ${data.experiencia} años. Ubicación: ${data.ubicacion}. TX: ${data.transactionId}`,
      estado: 'nueva'
    });

    // 3. Registrar transacción de pago en 'ordenes_pago'
    await supabase.from('ordenes_pago').insert({
      modulo: 'constructora',
      referencia_id: data.transactionId,
      concepto: `Inscripción SARA Talento: Plan ${data.plan} - ${data.nombre}`,
      monto: data.feeAmount,
      moneda: 'USD',
      estado: 'completada'
    });

    return true;
  } catch (err) {
    console.error('Error registrando talento en Supabase:', err);
    return false;
  }
}

export async function createJobEscrowApplication(talentId: string, role: string, hourlyRate: number): Promise<string> {
  try {
    const totalAmount = hourlyRate * 40; // 40 horas base escrow
    const projectName = "Residencias Quito Sur";

    // 1. Insertar postulación / contratación en Supabase 'job_applications'
    const { data: appData } = await supabase
      .from('job_applications')
      .insert({
        project_name: projectName,
        status: 'pending',
        proposed_rate: hourlyRate
      })
      .select()
      .single();

    // 2. Registrar solicitud de servicio CRM
    await supabase.from('solicitudes_servicio').insert({
      nombre: `Contratación Escrow: ${role}`,
      email: 'contratista@constructor.ec',
      telefono: '0990000000',
      tipo_servicio: 'talento_escrow',
      mensaje: `Contratación del profesional ${role}. Tarifa: $${hourlyRate}/h. Fondo Escrow estimado: $${totalAmount} USD.`,
      estado: 'nueva'
    });

    return appData?.id || `APP-${Date.now().toString().slice(-6)}`;
  } catch (err) {
    console.error('Error creando job escrow application:', err);
    return `APP-${Date.now().toString().slice(-6)}`;
  }
}
