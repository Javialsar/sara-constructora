"use client";
import React, { useState } from "react";
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, ArrowRight, Cuboid } from "lucide-react";
import Papa from "papaparse";

export default function BimImporterModal({ onClose, onImport }: { onClose: () => void, onImport: (data: any[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          setParsedData(results.data as any[]);
          setStep(2);
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cuboid size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Importador BIM Inteligente</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Revit / AutoCAD / Excel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl mb-4">
                <UploadCloud size={40} className="text-blue-500" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Sube tu Cuantificación de Materiales</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Exporta la tabla de "Material Takeoff" desde Revit o AutoCAD a formato CSV e impórtala aquí. SARA-APU generará los rubros automáticamente.
              </p>
              
              <label className="mt-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 dark:border-blue-800/50 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group">
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                <FileSpreadsheet size={32} className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">Haz clic para buscar tu archivo</span>
                <span className="text-sm text-slate-400 mt-1">Solo formato .CSV soportado actualmente</span>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl text-green-700 dark:text-green-400">
                <CheckCircle2 size={24} className="shrink-0" />
                <div>
                  <p className="font-bold">¡Archivo procesado con éxito!</p>
                  <p className="text-sm opacity-90">Se encontraron {parsedData.length} registros cuantificados en "{file?.name}".</p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50">
                <h5 className="font-bold text-slate-900 dark:text-white mb-4">Vista Previa de Extracción:</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Material / Elemento</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3 rounded-r-lg">Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, i) => {
                        // Intentar adivinar columnas comunes de Revit
                        const material = row['Material'] || row['Name'] || row['Nombre'] || Object.values(row)[0];
                        const cantidad = row['Volume'] || row['Area'] || row['Count'] || row['Cantidad'] || Object.values(row)[1];
                        const unidad = row['Unit'] || row['Unidad'] || 'u';
                        return (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{material as string}</td>
                            <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">{cantidad as string}</td>
                            <td className="px-4 py-3 text-slate-500">{unidad as string}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <p className="text-center text-xs text-slate-400 mt-4 italic">+ {parsedData.length - 5} registros más...</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => onImport(parsedData)}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                Vincular con Mis Rubros y Generar Presupuesto <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
