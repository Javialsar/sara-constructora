import React, { useEffect, useState } from 'react';
import { getLogosEmpresa } from '@/lib/services/logosService';

interface ModuleHeaderProps {
  moduleKey: 'constructora' | 'inmobiliaria' | 'stays' | 'apu' | 'compras' | 'fletes' | 'talento' | 'fintech';
  title: string;
  subtitle: string;
  description: string;
  rightContent?: React.ReactNode;
}

export default function ModuleHeader({ moduleKey, title, subtitle, description, rightContent }: ModuleHeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/logo-grupo-sara.png");

  useEffect(() => {
    getLogosEmpresa().then(logos => {
      setLogoUrl(logos[moduleKey]);
    });
  }, [moduleKey]);

  return (
    <div className="bg-slate-900 text-white py-12 px-6 border-b-4 border-brand-sage">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1">
          {logoUrl ? (
            <img src={logoUrl} alt={title} className="h-16 md:h-20 mb-4 object-contain drop-shadow-md" />
          ) : (
            <h1 className="text-3xl md:text-4xl font-black mb-3">{title}</h1>
          )}
          <p className="text-brand-sage text-lg font-medium">{subtitle}</p>
          <p className="text-gray-400 max-w-xl mt-2 text-sm leading-relaxed">{description}</p>
        </div>
        
        {rightContent && (
          <div className="w-full md:w-auto">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
