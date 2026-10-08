'use client';
import React, { useState } from 'react';
import { Truck, ShieldCheck, XCircle, Search, FileText, CheckCircle, Wallet, Eye } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  plan: 'VIP' | 'Estandar' | 'Basico';
  status: 'pending' | 'approved';
  walletBalance: number;
  documents: { type: string, status: string }[];
}

export default function AdminFletes() {
  const [drivers, setDrivers] = useState<Driver[]>([
    { 
      id: '1', name: 'Carlos Mendoza', vehicle: 'Volqueta Hino 8 Ton', plate: 'PBA-1234', plan: 'VIP', status: 'pending', 
      walletBalance: 0,
      documents: [{ type: 'Licencia Tipo E', status: 'Subido' }, { type: 'Matrícula Vehicular', status: 'Subido' }, { type: 'Foto del Conductor', status: 'Subido' }] 
    },
    { 
      id: '2', name: 'Luis Toapanta', vehicle: 'Camión Chevrolet 5 Ton', plate: 'GCA-9876', plan: 'Basico', status: 'approved',
      walletBalance: 45.50,
      documents: [{ type: 'Licencia Tipo E', status: 'Verificado' }, { type: 'Matrícula Vehicular', status: 'Verificado' }, { type: 'Foto del Conductor', status: 'Verificado' }]
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const handleAction = (id: string, newStatus: 'pending' | 'approved') => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setSelectedDriver(null);
  };

  return (
    <div className="p-8 font-sans text-slate-800 max-w-6xl mx-auto relative h-screen overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administración: SARA Fletes</h1>
        <p className="text-slate-500">Auditoría de transportistas, documentos de vehículos y gestión de billeteras prepago (Recargas).</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold">Red de Transportistas</h2>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Buscar placa o conductor..." className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Conductor / Placa</th>
              <th className="p-4 font-medium">Vehículo</th>
              <th className="p-4 font-medium">Plan (Comisión)</th>
              <th className="p-4 font-medium">Billetera</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acción Requerida</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{driver.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{driver.plate}</p>
                </td>
                <td className="p-4 text-slate-600">{driver.vehicle}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    driver.plan === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    driver.plan === 'Estandar' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {driver.plan} ({driver.plan === 'VIP' ? '25%' : driver.plan === 'Estandar' ? '15%' : '7%'})
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-mono font-bold ${driver.walletBalance < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                    ${driver.walletBalance.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    driver.status === 'approved' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                    {driver.status === 'approved' ? 'Alta (Operando)' : 'En Revisión'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => setSelectedDriver(driver)} 
                    className="text-amber-600 hover:bg-amber-50 px-3 py-1 rounded border border-amber-200 text-sm font-bold transition-colors inline-flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Expediente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REVISIÓN Y ALTA */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur">
              <h2 className="text-xl font-bold flex items-center">
                <Truck className="w-6 h-6 text-amber-500 mr-2" />
                Auditoría Vehicular
              </h2>
              <button onClick={() => setSelectedDriver(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100 items-center">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 mr-4 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Driver" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedDriver.name}</h3>
                  <p className="text-slate-600 font-medium">{selectedDriver.vehicle} - Placa: <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{selectedDriver.plate}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b pb-2">
                    <FileText className="w-5 h-5 text-amber-500 mr-2" />
                    Documentos
                  </h4>
                  <ul className="space-y-3">
                    {selectedDriver.documents.map((doc, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border border-slate-200 p-2 rounded-lg bg-white shadow-sm">
                        <span className="font-medium text-slate-700">{doc.type}</span>
                        <a href="#" className="text-blue-600 hover:underline text-xs font-bold">Revisar</a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b pb-2">
                    <Wallet className="w-5 h-5 text-emerald-500 mr-2" />
                    Billetera y Plan (Recargas)
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Modelo de Comisión SARA</p>
                    <p className="text-lg font-black text-slate-800 mb-3">{selectedDriver.plan} ({selectedDriver.plan === 'VIP' ? '25%' : selectedDriver.plan === 'Estandar' ? '15%' : '7%'})</p>
                    
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Saldo Disponible (Prepago)</p>
                    <p className={`text-2xl font-black ${selectedDriver.walletBalance < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                      ${selectedDriver.walletBalance.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">SARA descontará su comisión de esta billetera virtual en cada viaje concretado.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setSelectedDriver(null)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100">
                Cerrar
              </button>
              
              {selectedDriver.status === 'pending' ? (
                <button 
                  onClick={() => handleAction(selectedDriver.id, 'approved')}
                  className="px-6 py-2 rounded-lg bg-amber-500 text-slate-900 font-bold hover:bg-amber-600 flex items-center shadow-md shadow-amber-500/20"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprobar Vehículo
                </button>
              ) : (
                <button 
                  onClick={() => handleAction(selectedDriver.id, 'pending')}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 flex items-center shadow-md shadow-red-500/20"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Suspender Vehículo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
