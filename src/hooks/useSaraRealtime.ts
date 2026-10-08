'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function useSaraRealtime(tables: string[] = ['freight_dispatches', 'talent_profiles', 'orders', 'escrow_transactions']) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Suscripción maestra para todos los módulos (SARA Global Sync)
    const channels = tables.map(table => {
      return supabase.channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, payload => {
          console.log(`[SARA RealTime Sync] Cambio detectado en ${table}:`, payload);
          // Forzar la recarga de la ruta actual para reflejar los datos frescos
          router.refresh();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[SARA RealTime Sync] Sincronizado a tabla: ${table}`);
          }
        });
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [router, supabase, tables]);

  return { isSynced: true };
}
