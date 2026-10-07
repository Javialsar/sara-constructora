import React from 'react';

// Mock data for freights
const MOCK_FREIGHTS = [
  { id: 'F-001', origin: 'Fábrica Bogotá', destination: 'Obra Norte', cost: 450000, status: 'En Tránsito' },
  { id: 'F-002', origin: 'Cantera Medellín', destination: 'Obra Sur', cost: 1200000, status: 'Entregado' },
  { id: 'F-003', origin: 'Proveedor Acero', destination: 'Centro Logístico', cost: 350000, status: 'Pendiente' },
];

export default function LogisticsPanel() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Tránsito': return 'bg-yellow-100 text-yellow-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Panel de Logística y Fletes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">ID Flete</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Origen</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Destino</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Costo Estimado</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_FREIGHTS.map((freight, index) => (
              <tr key={freight.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{freight.id}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{freight.origin}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{freight.destination}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  ${freight.cost.toLocaleString('es-CO')}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(freight.status)}`}>
                    {freight.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
