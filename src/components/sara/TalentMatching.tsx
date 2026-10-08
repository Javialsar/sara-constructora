'use client';
import React, { useState } from 'react';
import { MapPin, Star, Award, Search, UserPlus, Navigation, Crown } from 'lucide-react';
import Link from 'next/link';

interface Talent {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  certifications: string[];
  distanceKm: number;
  rating: number;
  experienceYears: number;
  locationName: string;
  plan: 'VIP' | 'Estandar' | 'Basico';
}

export default function TalentMatching() {
  const [searchRole, setSearchRole] = useState('');
  
  const constructorLocation = "Quito (Sector La Carolina)";

  const [talents, setTalents] = useState<Talent[]>([
    {
      id: '1', name: 'Ing. Ana Gómez', role: 'Ingeniera Civil', hourlyRate: 35,
      certifications: ['Gestión de Proyectos PMP', 'AutoCAD Civil 3D'],
      distanceKm: 2.5, rating: 4.9, experienceYears: 12, locationName: 'Quito, Iñaquito', plan: 'VIP'
    },
    {
      id: '2', name: 'Arq. Ricardo Sánchez', role: 'Arquitecto', hourlyRate: 30,
      certifications: ['Revit BIM', 'Diseño Interior'],
      distanceKm: 15.0, rating: 4.8, experienceYears: 8, locationName: 'Quito, Mitad del Mundo', plan: 'VIP'
    },
    {
      id: '3', name: 'Ing. Luis Fernando Silva', role: 'Ingeniero Civil', hourlyRate: 28,
      certifications: ['Cálculo Estructural ETABS'],
      distanceKm: 8.1, rating: 4.6, experienceYears: 5, locationName: 'Quito, Cumbayá', plan: 'Estandar'
    },
    {
      id: '4', name: 'Mstr. Juan Pérez', role: 'Maestro Mayor de Obra', hourlyRate: 15,
      certifications: ['Trabajo en Alturas', 'Lectura de Planos'],
      distanceKm: 1.2, rating: 5.0, experienceYears: 20, locationName: 'Quito, La Magdalena', plan: 'Basico'
    }
  ]);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);

  const planWeight = { 'VIP': 3, 'Estandar': 2, 'Basico': 1 };

  // LÓGICA DE MATCHING Y RANKING:
  const filteredAndSortedTalents = talents
    .filter(t => {
      // Si estamos en modo IA, filtramos por los roles recomendados
      if (showAiRecommendations) {
        return t.role.includes("Maestro") || t.role.includes("Arquitecto") || t.role.includes("Albañil");
      }
      return t.role.toLowerCase().includes(searchRole.toLowerCase()) || t.name.toLowerCase().includes(searchRole.toLowerCase());
    })
    .sort((a, b) => {
      if (planWeight[b.plan] !== planWeight[a.plan]) return planWeight[b.plan] - planWeight[a.plan];
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.experienceYears !== a.experienceYears) return b.experienceYears - a.experienceYears;
      return a.distanceKm - b.distanceKm;
    });

  const analyzeAPU = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setShowAiRecommendations(true);
    }, 2500);
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto pt-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">SARA Talento - Radar Geográfico</h1>
            <p className="text-slate-500 mt-2 flex items-center">
              <Navigation className="w-4 h-4 mr-2 text-blue-500" /> 
              Ubicación de tu obra: <strong className="ml-1 text-slate-700">{constructorLocation}</strong>
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={analyzeAPU}
              disabled={isAiProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center transition-colors shadow-sm disabled:opacity-50"
            >
              {isAiProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Crown className="w-5 h-5 mr-2" />
              )}
              {isAiProcessing ? "Analizando tu APU..." : "Predecir Cuadrilla con IA"}
            </button>
            <Link href="/modulos/talento/auth">
              <button className="bg-brand-sage hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                <UserPlus className="w-5 h-5 mr-2" />
                Registro Profesionales
              </button>
            </Link>
          </div>
        </header>

        {showAiRecommendations && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8 animate-in fade-in zoom-in duration-500">
            <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center">
              <Crown className="w-6 h-6 mr-2 text-indigo-600" />
              Gemelo Digital: Proyección de Mano de Obra
            </h3>
            <p className="text-indigo-800/80 mb-4 text-sm">
              SARA analizó tu último presupuesto importado (<strong>Presupuesto Residencia Cumbayá</strong>). 
              Basado en los volúmenes de obra (<em>320m3 de Hormigón y 1200m2 de Mampostería</em>), necesitarás conformar la siguiente cuadrilla para terminar en el tiempo óptimo:
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 font-bold text-slate-700 text-sm">
                1x Residente de Obra / Arquitecto
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 font-bold text-slate-700 text-sm">
                1x Maestro Mayor
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 font-bold text-slate-700 text-sm">
                5x Albañiles / Peones
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Filtrando los mejores perfiles disponibles a menos de 10km de tu obra...
            </p>
          </div>
        )}

        {/* Buscador */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex items-center">
          <Search className="w-6 h-6 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="¿Qué especialista buscas? (Ej. Ingeniero Civil, Topógrafo, Albañil)"
            className="w-full outline-none text-lg text-slate-700"
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
          />
        </div>

        {/* Grid de Candidatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTalents.map((talent) => (
            <div key={talent.id} className={`bg-white rounded-2xl border ${talent.plan === 'VIP' ? 'border-amber-400 shadow-amber-100' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative`}>
              
              {/* Badge VIP */}
              {talent.plan === 'VIP' && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center">
                  <Crown className="w-3 h-3 mr-1" /> Profesional Destacado
                </div>
              )}

              <div className="p-6 flex-grow mt-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{talent.name}</h3>
                    <p className="text-brand-sage font-black text-sm">{talent.role}</p>
                  </div>
                  <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                    <span className="font-bold text-amber-700">{talent.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-slate-600 text-sm">
                    <Award className="w-4 h-4 mr-2 text-purple-500" />
                    <strong>{talent.experienceYears} años</strong> de experiencia comprobada
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    {talent.locationName}
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg mt-2 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Distancia a la obra:</span>
                    <strong className={talent.distanceKm < 5 ? "text-emerald-600" : "text-amber-600"}>
                      A {talent.distanceKm} km
                    </strong>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Certificaciones Verificadas</p>
                  <div className="flex flex-wrap gap-2">
                    {talent.certifications.map((cert, idx) => (
                      <span key={idx} className="bg-brand-sage/10 text-brand-sage font-bold text-xs px-2 py-1 rounded-md border border-brand-sage/20">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">${talent.hourlyRate} <span className="text-sm font-normal text-slate-500">/ hora</span></span>
                <button className="bg-brand-dark hover:bg-brand-sage text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Contratar (Escrow)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
