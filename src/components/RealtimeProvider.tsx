'use client';
import { useSaraRealtime } from '@/hooks/useSaraRealtime';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Inicializa la sincronización global de Supabase
  useSaraRealtime();
  
  return <>{children}</>;
}
