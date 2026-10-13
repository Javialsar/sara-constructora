'use client';
import DashboardFinanciero from '@/components/sara/DashboardFinanciero';
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';

export default function FinancieroPage() {
  return (
    <>
      <ModuloIntroSplash modulo="fintech" />
      <DashboardFinanciero />
    </>
  );
}
