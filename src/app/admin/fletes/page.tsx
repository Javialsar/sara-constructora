
'use client';
import React, { useState } from 'react';
import { Truck, ShieldCheck, XCircle, Search, FileText, CheckCircle, Wallet, Eye, FileCheck, X, Download, Edit, Trash2, Ban, MapPin, Phone } from 'lucide-react';

interface Document {
  type: string;
  status: 'Subido' | 'Verificado';
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  plan: 'VIP' | 'Estandar' | 'Basico';
  status: 'pending' | 'approved' | 'blocked';
  walletBalance: number;
  province: string;
  city: string;
  address: string;
  documents: Document[];
}

export default function AdminFletes() {
  const [drivers, setDrivers] = useState<Driver[]>([
    { 
      id: '1', name: 'Carlos Mendoza', phone: '0991234567', vehicle: 'Volqueta Hino 12m3', plate: 'PBA-1234', plan: 'Estandar', status: 'pending', 
      walletBalance: 0, province: 'Pichincha', city: 'Quito', address: 'Av. Simón Bolívar',
      documents: [
        { type: 'Cédula de Identidad', status: 'Subido' }, 
        { type: 'Licencia de Conducir (Tipo C/E)', status: 'Subido' }, 
        { type: 'Matrícula del Vehículo', status: 'Subido' }
      ] 
    },
    { 
      id: '2', name: 'Luis Toapanta', phone: '0987654321', vehicle: 'Camión Chevrolet 5 Ton', plate: 'GCA-9876', plan: 'Basico', status: 'approved',
      walletBalance: 45.50, province: 'Guayas', city: 'Guayaquil', address: 'Vía a la Costa',
      documents: [
        { type: 'Cédula de Identidad', status: 'Verificado' }, 
        { type: 'Licencia de Conducir (Tipo C/E)', status: 'Verificado' }, 
        { type: 'Matrícula del Vehículo', status: 'Verificado' }
      ]
    },
    { 
      id: '3', name: 'Marco Vinicio', phone: '0971122334', vehicle: 'Camioneta Doble Cabina', plate: 'LBB-4321', plan: 'VIP', status: 'pending',
      walletBalance: 20.00, province: 'Azuay', city: 'Cuenca', address: 'Av. Las Américas',
      documents: [
        { type: 'Cédula de Identidad', status: 'Verificado' }, 
        { type: 'Licencia de Conducir (Tipo C/E)', status: 'Subido' }, 
        { type: 'Matrícula del Vehículo', status: 'Subido' }
      ]
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{type: string, url: string} | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchPlaca, setSearchPlaca] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('');
  const [filterCiudad, setFilterCiudad] = useState('');
  const [filterDireccion, setFilterDireccion] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (id: string, newStatus: 'pending' | 'approved' | 'blocked') => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setSelectedDriver(null);
    showToast("Estado actualizado correctamente");
  };

  const handleDelete = (id: string) => {
    if(confirm('¿Está seguro de eliminar este registro?')) {
       setDrivers(drivers.filter(d => d.id !== id));
       showToast("Registro eliminado");
    }
  };

  const handleEdit = (id: string) => {
    showToast("Función de edición en desarrollo");
  };

  const handleVerifyDocument = (driverId: string, docType: string) => {
    const updatedDrivers = drivers.map((d): Driver => {
      if (d.id === driverId) {
        return {
          ...d,
          documents: d.documents.map(doc => doc.type === docType ? { ...doc, status: 'Verificado' as const } : doc)
        };
      }
      return d;
    });
    setDrivers(updatedDrivers);
    if (selectedDriver && selectedDriver.id === driverId) {
      setSelectedDriver(updatedDrivers.find(d => d.id === driverId) || null);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchPlaca = d.plate.toLowerCase().includes(searchPlaca.toLowerCase()) || d.name.toLowerCase().includes(searchPlaca.toLowerCase());
    const matchProv = d.province.toLowerCase().includes(filterProvincia.toLowerCase());
    const matchCity = d.city.toLowerCase().includes(filterCiudad.toLowerCase());
    const matchDir = d.address.toLowerCase().includes(filterDireccion.toLowerCase());
    return matchPlaca && matchProv && matchCity && matchDir;
  });

  return (
    <div className="p-8 font-sans text-slate-800 max-w-7xl mx-auto relative h-screen overflow-y-auto">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Administración: SARA Fletes</h1>
          <p className="text-slate-500">Auditoría de transportistas, validación de documentos y gestión de billeteras prepago (Recargas).</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => showToast('Descargando Excel...')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-slate-800">
             <Download className="w-4 h-4 mr-2"/> Excel
           </button>
           <button onClick={() => showToast('Descargando PDF...')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-red-700">
             <Download className="w-4 h-4 mr-2"/> PDF
           </button>
        </div>
      </header>

      {/* FILTROS AVANZADOS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Buscar Placa / Nombre</label>
          <div className="relative mt-1">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input type="text" value={searchPlaca} onChange={e => setSearchPlaca(e.target.value)} placeholder="Ej. PBA-1234" className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Provincia</label>
          <input type="text" value={filterProvincia} onChange={e => setFilterProvincia(e.target.value)} placeholder="Ej. Pichincha" className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Ciudad</label>
          <input type="text" value={filterCiudad} onChange={e => setFilterCiudad(e.target.value)} placeholder="Ej. Quito" className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
          <input type="text" value={filterDireccion} onChange={e => setFilterDireccion(e.target.value)} placeholder="Ej. Av. Simón Bolívar" className="w-full mt-1 px-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-slate-600"/> Red de Transportistas Activos y Pendientes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-200 uppercase tracking-wider">
                <th className="p-4 font-bold">Conductor / Detalles</th>
                <th className="p-4 font-bold">Vehículo / Placa</th>
                <th className="p-4 font-bold">Ubicación</th>
                <th className="p-4 font-bold">Comisión</th>
                <th className="p-4 font-bold">Billetera</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{driver.name}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-1"><Phone className="w-3 h-3 mr-1"/> {driver.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-600 font-medium text-sm">{driver.vehicle}</p>
                    <p className="font-mono bg-white inline-block px-1.5 py-0.5 rounded border border-slate-200 text-xs mt-1 shadow-sm font-bold text-slate-700">{driver.plate}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold text-slate-700"><MapPin className="w-3 h-3 inline mr-1 text-slate-400"/>{driver.city}, {driver.province}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[150px] truncate" title={driver.address}>{driver.address}</p>
                  </td>
                  <td className="p-4">
                    <span className={"px-3 py-1 rounded-full text-xs font-bold " + (
                      driver.plan === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      driver.plan === 'Estandar' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    )}>
                      {driver.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={"font-mono font-bold text-lg " + (driver.walletBalance < 10 ? 'text-red-500' : 'text-emerald-600')}>
                      {'$' + driver.walletBalance.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={"px-2 py-1 text-xs font-bold rounded " + (
                      driver.status === 'approved' ? 'text-emerald-700 bg-emerald-100' : 
                      driver.status === 'blocked' ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'
                    )}>
                      {driver.status === 'approved' ? 'Operando' : driver.status === 'blocked' ? 'Bloqueado' : 'Revisión'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button onClick={() => setSelectedDriver(driver)} className="text-amber-600 hover:bg-amber-50 px-2 py-1.5 rounded border border-amber-200 text-xs font-bold transition-colors inline-flex items-center" title="Validar Expediente">
                      <Eye className="w-4 h-4 mr-1" /> {driver.status === 'pending' ? 'Validar' : 'Expediente'}
                    </button>
                    <button onClick={() => handleEdit(driver.id)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded border border-blue-200 transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    {driver.status === 'blocked' ? (
                      <button onClick={() => handleAction(driver.id, 'approved')} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded border border-emerald-200 transition-colors" title="Activar">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleAction(driver.id, 'blocked')} className="text-orange-600 hover:bg-orange-50 p-1.5 rounded border border-orange-200 transition-colors" title="Bloquear">
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded border border-red-200 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REVISIÓN Y ALTA */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold flex items-center">
                <Truck className="w-6 h-6 text-amber-500 mr-2" />
                Auditoría y Validación Documental
              </h2>
              <button onClick={() => setSelectedDriver(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100 items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 mr-4 overflow-hidden shadow-sm">
                    <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Driver" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{selectedDriver.name}</h3>
                    <p className="text-slate-600 font-medium">{selectedDriver.vehicle} - Placa: <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{selectedDriver.plate}</span></p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center"><Phone className="w-3 h-3 mr-1"/> {selectedDriver.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Estado de la cuenta</p>
                  <span className={"px-3 py-1 text-sm font-bold rounded-full " + (
                      selectedDriver.status === 'approved' ? 'text-emerald-700 bg-emerald-100' : 
                      selectedDriver.status === 'blocked' ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100'
                  )}>
                    {selectedDriver.status === 'approved' ? 'Aprobado y Activo' : selectedDriver.status === 'blocked' ? 'Bloqueado' : 'Pendiente de Validación'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                    <FileText className="w-5 h-5 text-amber-500 mr-2" />
                    Documentos SARA Fletes
                  </h4>
                  <ul className="space-y-3">
                    {selectedDriver.documents.map((doc, idx) => (
                      <li key={idx} className="flex flex-col text-sm border border-slate-200 p-3 rounded-xl bg-white shadow-sm gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700">{doc.type}</span>
                          <span className={"text-xs font-bold px-2 py-1 rounded " + (doc.status === 'Verificado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                            {doc.status}
                          </span>
                        </div>
                        <div className="flex gap-2 justify-end mt-1">
                          <button 
                            onClick={() => setPreviewDoc({type: doc.type, url: 'https://images.unsplash.com/photo-1620857329598-6e5458ce04eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'})} 
                            className="text-blue-600 hover:underline text-xs font-bold flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-1"/> Ver Imagen
                          </button>
                          {doc.status === 'Subido' && (
                            <button 
                              onClick={() => handleVerifyDocument(selectedDriver.id, doc.type)} 
                              className="text-emerald-600 hover:underline text-xs font-bold flex items-center ml-2"
                            >
                              <FileCheck className="w-3 h-3 mr-1"/> Validar Correcto
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {selectedDriver.documents.every(d => d.status === 'Verificado') && selectedDriver.status === 'pending' && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-bold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> Todos los documentos verificados. Listo para aprobar.
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                    <Wallet className="w-5 h-5 text-emerald-500 mr-2" />
                    Billetera y Plan (Recargas)
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-inner">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Modelo de Comisión SARA</p>
                    <p className="text-xl font-black text-slate-800 mb-4">{selectedDriver.plan}</p>
                    
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Saldo Disponible (Prepago)</p>
                    <p className={"text-3xl font-black " + (selectedDriver.walletBalance < 10 ? 'text-red-500' : 'text-emerald-600')}>
                      {'$' + selectedDriver.walletBalance.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 leading-tight">SARA descontará su comisión de esta billetera virtual en cada viaje concretado de forma automática.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setSelectedDriver(null)} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                Cerrar Expediente
              </button>
              
              {selectedDriver.status === 'pending' ? (
                <button 
                  onClick={() => handleAction(selectedDriver.id, 'approved')}
                  disabled={!selectedDriver.documents.every(d => d.status === 'Verificado')}
                  className={"px-6 py-2 rounded-lg font-bold flex items-center shadow-md transition-colors " + (
                    selectedDriver.documents.every(d => d.status === 'Verificado')
                      ? 'bg-amber-500 text-slate-900 hover:bg-amber-600 shadow-amber-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  )}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprobar y Dar Alta
                </button>
              ) : selectedDriver.status === 'approved' ? (
                <button 
                  onClick={() => handleAction(selectedDriver.id, 'blocked')}
                  className="px-6 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 flex items-center shadow-md shadow-orange-500/20"
                >
                  <Ban className="w-5 h-5 mr-2" />
                  Bloquear Vehículo
                </button>
              ) : (
                <button 
                  onClick={() => handleAction(selectedDriver.id, 'approved')}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center shadow-md shadow-emerald-500/20"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Reactivar Vehículo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PREVISUALIZACIÓN DE IMAGEN */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
          <button onClick={() => setPreviewDoc(null)} className="absolute top-4 right-4 text-white hover:text-slate-300 bg-slate-800 rounded-full p-2">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl w-full">
            <h3 className="text-white text-xl font-bold mb-4 text-center">{previewDoc.type}</h3>
            <img src={previewDoc.url} alt="Documento" className="w-full h-auto max-h-[80vh] object-contain rounded-lg border border-slate-700 shadow-2xl" />
            <div className="mt-4 text-center">
              <button onClick={() => setPreviewDoc(null)} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700">Cerrar Visor</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[100]">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="font-bold">{toastMessage}</p>
        </div>
      )}

    </div>
  );
}
