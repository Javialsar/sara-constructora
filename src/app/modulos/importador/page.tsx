'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ImportadorPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus('processing');
    
    // Simulación de procesamiento en Backend del Gemelo Digital
    setTimeout(() => {
      setStatus('success');
    }, 2500);
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Módulo Importador (Gemelo Digital)</h1>
          <p className="text-slate-500 mt-2">
            Carga el cronograma de obra (Gantt/Project en CSV/Excel) o tu lista de inventario. 
            El Gemelo Digital analizará los datos para generar alertas predictivas de compras.
          </p>
        </header>

        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadCloud className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Arrastra y suelta tu archivo aquí</h3>
          <p className="text-slate-500 mb-6">Soporta .CSV, .XLSX (Microsoft Project, Excel)</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".csv, .xlsx"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Explorar Archivos
          </label>
        </div>

        {file && (
          <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-4" />
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            
            {status === 'idle' && (
              <button 
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Procesar Gemelo Digital
              </button>
            )}

            {status === 'processing' && (
              <div className="flex items-center text-amber-600 font-medium animate-pulse">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Analizando Cronograma...
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center text-emerald-600 font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                ¡Importación Exitosa y Predictiva Activada!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
