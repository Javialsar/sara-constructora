import React from 'react';
import LandingMaster from '@/components/landing/LandingMaster';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from '@/lib/services/logosService';

// Revalidar en segundo plano cada 60s (ISR) para entrega instantánea desde Edge CDN sin retraso de streaming
export const revalidate = 60;

async function getSsrLogosEmpresa(): Promise<LogosEmpresa> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
    if (!supabaseUrl || !supabaseKey) return DEFAULT_LOGOS_EMPRESA;

    // Timeout de seguridad estricto de 2.5s para no bloquear nunca el SSR
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        fetch: (url, init) => fetch(url, { ...init, signal: controller.signal })
      }
    });

    const [{ data: paramData }, { data: configData }] = await Promise.all([
      supabase.from('parametros_globales').select('indirectos_default').eq('id', 1).maybeSingle(),
      supabase.from('configuracion_empresa').select('logo_url').limit(1).maybeSingle()
    ]);

    clearTimeout(timeoutId);

    const dbLogos = paramData?.indirectos_default?.logos_servicios || {};
    const sanitize = (url: string | undefined | null, fallback: string) => {
      if (!url || typeof url !== 'string' || url.trim() === '' || url === 'null') return fallback;
      return url.trim();
    };

    return {
      grupo_sara: sanitize(dbLogos.grupo_sara || configData?.logo_url, DEFAULT_LOGOS_EMPRESA.grupo_sara),
      constructora: sanitize(dbLogos.constructora, DEFAULT_LOGOS_EMPRESA.constructora),
      inmobiliaria: sanitize(dbLogos.inmobiliaria, DEFAULT_LOGOS_EMPRESA.inmobiliaria),
      stays: sanitize(dbLogos.stays, DEFAULT_LOGOS_EMPRESA.stays),
      apu: sanitize(dbLogos.apu, DEFAULT_LOGOS_EMPRESA.apu),
      compras: sanitize(dbLogos.compras, DEFAULT_LOGOS_EMPRESA.compras),
      fletes: sanitize(dbLogos.fletes, DEFAULT_LOGOS_EMPRESA.fletes),
      talento: sanitize(dbLogos.talento, DEFAULT_LOGOS_EMPRESA.talento),
      fintech: sanitize(dbLogos.fintech, DEFAULT_LOGOS_EMPRESA.fintech),
      facturacion: sanitize(dbLogos.facturacion, DEFAULT_LOGOS_EMPRESA.facturacion || '/images/sara-facturacion.png'),
      firma: sanitize(dbLogos.firma, DEFAULT_LOGOS_EMPRESA.firma || '/images/sara-firma.png')
    };
  } catch {
    return DEFAULT_LOGOS_EMPRESA;
  }
}

export default async function HomePage() {
  const initialLogos = await getSsrLogosEmpresa();

  return (
    <main className="w-full min-h-screen bg-slate-950">
      <LandingMaster initialLogos={initialLogos} />
    </main>
  );
}
