'use client';
import React, { useState } from 'react';
import { MapPin, Star, Award, Search, UserPlus, Navigation } from 'lucide-react';

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
}

export default function TalentMatching() {
  const [searchRole, setSearchRole] = useState('');
  
  // Simulador de Coordenadas de la Obra del Constructor (Ej. Quito, Carolina)
  const constructorLocation = "Quito (Sector La Carolina)";

  const [talents, setTalents] = useState<Talent[]>([
    {
      id: '1', name: 'Ing. Ana Gómez', role: 'Ingeniera Civil', hourlyRate: 35,
      certifications: ['Gestión de Proyectos PMP', 'AutoCAD Civil 3D'],
      distanceKm: 2.5, rating: 4.9, experienceYears: 12, locationName: 'Quito, Iñaquito'
    },
    {
      id: '2', name: 'Ing. Luis Fernando Silva', role: 'Ingeniero Civil', hourlyRate: 28,
      certifications: ['Cálculo Estructural ETABS'],
      distanceKm: 8.1, rating: 4.6, experienceYears: 5, locationName: 'Quito, Cumbayá'
    },
    {
      id: '3', name: 'Mstr. Juan Pérez', role: 'Maestro Mayor de Obra', hourlyRate: 15,
      certifications: ['Trabajo en Alturas', 'Lectura de Planos'],
      distanceKm: 1.2, rating: 5.0, experienceYears: 20, locationName: 'Quito, La Magdalena'
    },
    {
      id: '4', name: 'Arq. Ricardo Sánchez', role: 'Arquitecto', hourlyRate: 30,
      certifications: ['Revit BIM', 'Diseño Interior'],
      distanceKm: 15.0, rating: 4.2, experienceYears: 8, locationName: 'Quito, Mitad del Mundo'
    }
  ]);

  // LÓGICA DE MATCHING Y RANKING:
  // 1. Filtrar por búsqueda
  // 2. Ordenar por: (A) Rating/Calificación descendente, (B) Experiencia, (C) Distancia
  const filteredAndSortedTalents = talents
    .filter(t => t.role.toLowerCase().includes(searchRole.toLowerCase()) || t.name.toLowerCase().includes(searchRole.toLowerCase()))
    .sort((a, b) => {
      // Prioridad 1: Valoración de la comunidad (Rating)
      if (b.rating !== a.rating) return b.rating - a.rating;
      // Prioridad 2: Años de Experiencia
      if (b.experienceYears !== a.experienceYears) return b.experienceYears - a.experienceYears;
      // Prioridad 3: Cercanía geográfica
      return a.distanceKm - b.distanceKm;
    });

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">SARA Talento - Radar Geográfico</h1>
            <p className="text-slate-500 mt-2 flex items-center">
              <Navigation className="w-4 h-4 mr-2 text-blue-500" /> 
              Ubicación de tu obra: <strong className="ml-1 text-slate-700">{constructorLocation}</strong>
            </p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
            <UserPlus className="w-5 h-5 mr-2" />
            Registro de Profesionales
          </button>
        </header>

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

        {/* Grid de Candidatos (Rankeados por Algoritmo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTalents.map((talent) => (
            <div key={talent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{talent.name}</h3>
                    <p className="text-blue-600 font-semibold text-sm">{talent.role}</p>
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
                      <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-100">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800">${talent.hourlyRate} <span className="text-sm font-normal text-slate-500">/ hora</span></span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Solicitar Contratación
                </button>
              </div>
            </div>
          ))}

          {filteredAndSortedTalents.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No se encontraron profesionales cercanos para el rol especificado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
