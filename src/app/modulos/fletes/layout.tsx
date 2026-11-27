import type { Metadata, Viewport } from 'next';
import { manifestPath, PWA_APPS } from '@/lib/pwa/apps';

export const viewport: Viewport = {
  themeColor: '#FDBE3B',
};

export const metadata: Metadata = {
  title: 'Gobee | Movilidad Urbana, Envíos y Carga · Grupo Sara',
  description: 'Gobee · Un servicio de Grupo Sara. Pide Gobee Go, Gobee XL, Gobee Express o Gobee Cargo en segundos.',
  manifest: manifestPath('fletes'),
  appleWebApp: {
    capable: true,
    title: 'Gobee',
    statusBarStyle: 'default',
  },
};

export default function FletesClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
