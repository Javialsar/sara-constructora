import type { Metadata } from 'next';
import { FletesSmartWorkspace } from '@/components/fletes/FletesSmartWorkspace';

export const metadata: Metadata = {
  title: 'SARA-FLETES v2.0 | Logística MTOP, Copiloto IA, e-POD y Pagos Ecuador',
  description:
    'Solicita viajes, mandaditos, fletes MTOP con Copiloto IA de cubicaje por foto, renta con garantía Kushki, intérprete simultáneo y acta digital e-POD.',
};

export default function FletesPage() {
  return <FletesSmartWorkspace />;
}
