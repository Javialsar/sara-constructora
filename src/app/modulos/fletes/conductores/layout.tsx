import type { Metadata, Viewport } from 'next';
import { manifestPath } from '@/lib/pwa/apps';

export const viewport: Viewport = {
  themeColor: '#0F172A',
};

export const metadata: Metadata = {
  title: 'Gobee Conductor | Radar en Vivo, Billetera y e-POD · Grupo Sara',
  description: 'Gobee · Un servicio de Grupo Sara. Cabina profesional de conductores con radar PostGIS, Backhaul y billetera.',
  manifest: manifestPath('fletes-conductor'),
  appleWebApp: {
    capable: true,
    title: 'Gobee Conductor',
    statusBarStyle: 'black-translucent',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function FletesDriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
