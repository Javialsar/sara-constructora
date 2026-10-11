import React from 'react';
import LandingMaster from '@/components/landing/LandingMaster';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-slate-950">
      <LandingMaster />
    </main>
  );
}
