import React, { useState } from 'react';

// Mock data for talent
const MOCK_TALENT = [
  { id: 1, name: 'Juan Pérez', role: 'Albañil', certifications: ['Trabajo en Alturas', 'Mampostería'], hourlyRate: 15 },
  { id: 2, name: 'Ana Gómez', role: 'Ingeniera Civil', certifications: ['Gestión de Proyectos', 'AutoCAD'], hourlyRate: 35 },
  { id: 3, name: 'Carlos Ruiz', role: 'Electricista', certifications: ['Certificación RETIE'], hourlyRate: 20 },
];

export default function TalentMatching() {
  const [searchTerm, setSearchTerm] = useState('');
  const [talents, setTalents] = useState(MOCK_TALENT);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = MOCK_TALENT.filter(t => 
      t.name.toLowerCase().includes(term.toLowerCase()) || 
      t.role.toLowerCase().includes(term.toLowerCase())
    );
    setTalents(filtered);
  };

  const handleHireRequest = (talentName: string) => {
    alert(`Solicitud de contratación enviada a ${talentName}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Búsqueda de Talento</h2>
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Buscar por nombre o rol (ej. Albañil, Ingeniero)..." 
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {talents.map(talent => (
          <div key={talent.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800">{talent.name}</h3>
            <p className="text-gray-600 font-medium mb-2">{talent.role}</p>
            <div className="mb-3">
              <span className="text-sm text-gray-500 block mb-1">Certificaciones:</span>
              <div className="flex flex-wrap gap-1">
                {talent.certifications.map((cert, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-4">${talent.hourlyRate} / hr</p>
            <button 
              onClick={() => handleHireRequest(talent.name)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Solicitar Contratación
            </button>
          </div>
        ))}
        {talents.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No se encontraron perfiles que coincidan con la búsqueda.</p>
        )}
      </div>
    </div>
  );
}
