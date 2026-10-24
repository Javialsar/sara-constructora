'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComprasRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/modulos/compras');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Cargando SARA Marketplace...</span>
      </div>
    </div>
  );
}
