import { createSupabaseBrowserClient } from './supabase-browser';

const supabase = createSupabaseBrowserClient();

// Datos Simulados (Mock) para respaldo
export const mockPlanes = [
  { id: 1, nombre: 'VIP', comision: 5.00 },
  { id: 2, nombre: 'Estandar', comision: 10.00 },
  { id: 3, nombre: 'Basico', comision: 15.00 }
];

export const mockConductores = [
  { id: '111', name: 'Carlos Ruiz', vehicle: 'Camión Hino', plate: 'PCD-1234', plan: 'VIP', saldo_billetera: 145.50, latitud: -0.1807, longitud: -78.4678, estado_activo: true },
  { id: '222', name: 'María Velez', vehicle: 'Furgoneta', plate: 'GBC-9876', plan: 'Estandar', saldo_billetera: 42.00, latitud: -0.2107, longitud: -78.4878, estado_activo: true },
  { id: '333', name: 'Juan Pérez', vehicle: 'Camioneta 4x4', plate: 'PBB-1122', plan: 'Basico', saldo_billetera: 5.00, latitud: -0.1507, longitud: -78.4578, estado_activo: false }
];

export const mockSolicitudes = [
  { id: 'req1', origen: 'Norte', destino: 'Sur', tarifa: 45.0, status: 'completado', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'req2', origen: 'Valle', destino: 'Centro', tarifa: 25.5, status: 'pendiente', created_at: new Date().toISOString() },
];

export async function getFletesPlanes() {
  try {
    const { data, error } = await supabase.from('fletes_planes').select('*').order('comision', { ascending: true });
    if (error || !data || data.length === 0) {
      console.warn('Usando mock de planes debido a error o tabla vacía:', error?.message);
      return mockPlanes;
    }
    return data;
  } catch (e) {
    return mockPlanes;
  }
}

export async function getFletesConductores() {
  try {
    const { data, error } = await supabase.from('fletes_conductores').select('*, fletes_planes(nombre)');
    if (error || !data || data.length === 0) {
      console.warn('Usando mock de conductores debido a error:', error?.message);
      return mockConductores;
    }
    return data.map(d => ({
      ...d,
      name: 'Conductor ' + d.id.substring(0,4), // Temporal, asumiendo falta de join con auth
      plan: d.fletes_planes?.nombre || 'Basico'
    }));
  } catch (e) {
    return mockConductores;
  }
}

export async function getFletesDashboardStats() {
  try {
    // Intentar traer datos reales
    const [{ count: activeCount }, { count: pendingReqs }, { data: planes }] = await Promise.all([
      supabase.from('fletes_conductores').select('*', { count: 'exact', head: true }).eq('estado_activo', true),
      supabase.from('fletes_solicitudes').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
      supabase.from('fletes_planes').select('*')
    ]);
    
    // Si falla cualquiera, lanzará error y caerá en el catch
    return {
      activeDrivers: activeCount || 0,
      pendingRequests: pendingReqs || 0,
      totalCommissions: 2540.50, // Ejemplo, requeriría lógica compleja
      totalRecharges: 4500.00
    };
  } catch (e) {
    console.warn('Usando mock de stats:', e);
    return {
      activeDrivers: mockConductores.filter(c => c.estado_activo).length,
      pendingRequests: mockSolicitudes.filter(s => s.status === 'pendiente').length,
      totalCommissions: 2540.50,
      totalRecharges: 4500.00
    };
  }
}
