'use client';
import TalentMatching from '@/components/sara/TalentMatching';
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';

export default function TalentoPage() {
  return (
    <>
      <ModuloIntroSplash modulo="talento" />
      <TalentMatching />
    </>
  );
}
