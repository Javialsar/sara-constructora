import React from 'react';
import LandingMaster from '@/components/landing/LandingMaster';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AIRBNB_DATA } from '@/components/stays/AirbnbData';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let realProjects: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
      const { data: proyectos } = await supabase
        .from('proyectos')
        .select('id, nombre, estado, ubicacion, imagen_url')
        .order('id', { ascending: false })
        .limit(6);

      if (proyectos && proyectos.length > 0) {
        realProjects = proyectos;
      }
    }
  } catch (error) {
    console.error('Error fetching live proyectos:', error);
  }

  // Fallback con los proyectos oficiales en Supabase si la consulta externa tiene latencia
  if (!realProjects || realProjects.length === 0) {
    realProjects = [
      { id: '1', nombre: 'Ciclope', estado: 'en_diseno', ubicacion: 'Arenillas, El Oro' },
      { id: '2', nombre: 'Urbanización Mangis', estado: 'en_diseno', ubicacion: 'Quito / Turubamba, Pichincha' },
      { id: '3', nombre: 'Torre Kary', estado: 'en_diseno', ubicacion: 'Vilcabamba, Loja' },
      { id: '4', nombre: 'DUNA-DALTA', estado: 'en_diseno', ubicacion: 'Cuenca / Paucarbamba, Azuay' },
      { id: '5', nombre: 'Rincón Campestre JV', estado: 'en_diseno', ubicacion: 'Cariamanga / San Sebastián, Loja' }
    ];
  }

  return (
    <main className="w-full min-h-screen bg-slate-950">
      <LandingMaster 
        realProjects={realProjects} 
        realStays={AIRBNB_DATA} 
      />
    </main>
  );
}
