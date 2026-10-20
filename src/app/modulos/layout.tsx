import React from 'react';
import ModuleTopBar from '@/components/layout/ModuleTopBar';

export default function ModulosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <ModuleTopBar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
