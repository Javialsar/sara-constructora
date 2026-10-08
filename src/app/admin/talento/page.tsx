'use client';
import React, { useState } from 'react';
import { ShieldCheck, XCircle, Crown, Search, FileText, CheckCircle, Receipt, MapPin, Eye } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  plan: 'VIP' | 'Estandar' | 'Basico';
  status: 'pending' | 'approved';
  paymentId: string;
  documents: { type: string, status: string }[];
  rating?: number;
}

export default function AdminTalento() {
  const [candidates, setCandidates] = useState<Candidate[]>([
    { 
      id: '1', name: 'Ing. Ana Gómez', role: 'Ingeniera Civil', plan: 'VIP', status: 'pending', 
      paymentId: 'TXN-994827-STRIPE', 
      documents: [{ type: 'Cédula de Identidad', status: 'Verificado' }, { type: 'CV Académico', status: 'Subido' }, { type: 'Título SENESCYT', status: 'Subido' }] 
    },
    { 
      id: '2', name: 'Mstr. Juan Pérez', role: 'Maestro Mayor de Obra', plan: 'Basico', status: 'approved',
      paymentId: 'TXN-112349-KUSHKI',
      documents: [{ type: 'Cédula de Identidad', status: 'Verificado' }, { type: 'Certificado SECAP', status: 'Subido' }]
    },
    { 
      id: '3', name: 'Arq. Luis Silva', role: 'Arquitecto', plan: 'Estandar', status: 'pending',
      paymentId: 'TXN-558291-STRIPE',
      documents: [{ type: 'Cédula de Identidad', status: 'Subido' }, { type: 'Portafolio de Obras', status: 'Subido' }]
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleAction = (id: string, newStatus: 'pending' | 'approved') => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setSelectedCandidate(null);
  };

  return (
    <div className="p-8 font-sans text-slate-800 max-w-6xl mx-auto relative h-screen overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administración: SARA Talento</h1>
        <p className="text-slate-500">Revisa documentos, verifica pagos y da de alta a profesionales en la red SARA.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold">Solicitudes de Ingreso a la Red</h2>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Buscar profesional..." className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Profesional</th>
              <th className="p-4 font-medium">Especialidad</th>
              <th className="p-4 font-medium">Plan (Comisión)</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acción Requerida</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold">{candidate.name}</td>
                <td className="p-4 text-slate-600">{candidate.role}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max ${
                    candidate.plan === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    candidate.plan === 'Estandar' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {candidate.plan === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                    {candidate.plan} 
                    <span className="font-normal opacity-70 ml-1">
                      ({candidate.plan === 'VIP' ? '50%' : candidate.plan === 'Estandar' ? '20%' : '10%'})
                    </span>
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    candidate.status === 'approved' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                    {candidate.status === 'approved' ? 'Alta (Visible)' : 'Pendiente Revisión'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => setSelectedCandidate(candidate)} 
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded border border-blue-200 text-sm font-medium transition-colors inline-flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {candidate.status === 'pending' ? 'Revisar para Alta' : 'Ver Expediente'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REVISIÓN Y ALTA */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur">
              <h2 className="text-xl font-bold flex items-center">
                <ShieldCheck className="w-6 h-6 text-blue-600 mr-2" />
                Auditoría y Alta de Profesional
              </h2>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Info General */}
              <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 mr-4">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedCandidate.name}</h3>
                  <p className="text-slate-600 font-medium">{selectedCandidate.role}</p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center"><MapPin className="w-4 h-4 mr-1" /> Validando Ubicación GPS</p>
                </div>
                
                {/* Asignador de Estrellas Admin */}
                <div className="ml-auto flex flex-col items-end justify-center border-l border-slate-200 pl-6">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-1">Calificación Inicial (SARA Score)</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => {
                          setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, rating: star } : c));
                          setSelectedCandidate({ ...selectedCandidate, rating: star });
                        }}
                        className={`transition-colors ${
                          (selectedCandidate.rating || 0) >= star 
                            ? 'text-amber-400 hover:text-amber-500' 
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                      >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Estrellas de Confianza</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Documentos */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b pb-2">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    Documentos de Respaldo
                  </h4>
                  <ul className="space-y-3">
                    {selectedCandidate.documents.map((doc, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border border-slate-200 p-2 rounded-lg bg-white shadow-sm">
                        <span className="font-medium text-slate-700">{doc.type}</span>
                        <a href="#" className="text-blue-600 hover:underline text-xs font-bold">Ver PDF</a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pagos */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b pb-2">
                    <Receipt className="w-5 h-5 text-emerald-500 mr-2" />
                    Validación de Pago
                  </h4>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-xs text-emerald-800 uppercase font-bold mb-1">Plan Contratado</p>
                    <p className="text-lg font-black text-emerald-900 mb-3">{selectedCandidate.plan} ({selectedCandidate.plan === 'VIP' ? '50%' : selectedCandidate.plan === 'Estandar' ? '20%' : '10%'} com.)</p>
                    
                    <p className="text-xs text-emerald-800 uppercase font-bold mb-1">ID Transacción (Kushki/Stripe)</p>
                    <code className="text-xs bg-white px-2 py-1 rounded text-emerald-700 font-mono font-bold block mb-2">{selectedCandidate.paymentId}</code>
                    
                    <div className="flex items-center text-emerald-700 text-sm font-bold mt-3">
                      <CheckCircle className="w-4 h-4 mr-1" /> Pago Confirmado en Banco
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100"
              >
                Cerrar
              </button>
              
              {selectedCandidate.status === 'pending' ? (
                <button 
                  onClick={() => handleAction(selectedCandidate.id, 'approved')}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center shadow-md shadow-blue-500/20"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprobar y Dar de Alta
                </button>
              ) : (
                <button 
                  onClick={() => handleAction(selectedCandidate.id, 'pending')}
                  className="px-6 py-2 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 flex items-center shadow-md shadow-amber-500/20"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Revocar Alta
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
