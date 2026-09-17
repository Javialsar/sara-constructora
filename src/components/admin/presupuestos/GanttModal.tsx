import React from "react"
import { Calendar, X } from "lucide-react"

export default function GanttModal({
  isOpen,
  onClose,
  presupuestoRubros,
  updateTaskSchedule
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Calendar className="text-purple-600" /> Cronograma de Trabajo (Gantt)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col">
          <p className="text-sm text-gray-500 mb-4">
            El sistema ha calculado automáticamente los días sugeridos basándose en el total de horas-hombre requeridas por cada rubro (asumiendo jornadas estándar de 3 peones). Puedes modificar la fecha de inicio o los días haciendo clic en ellos.
          </p>

          <div className="border border-gray-200 rounded-lg overflow-x-auto bg-gray-50 flex-1 relative">
            <table className="w-full border-collapse text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b border-r border-gray-400 p-2 text-left sticky left-0 bg-gray-100 w-64 z-20">Rubro / Tarea</th>
                  <th className="border-b border-r border-gray-400 p-2 text-center w-36 bg-gray-100 z-20">Inicio</th>
                  <th className="border-b border-r border-gray-400 p-2 text-center w-24 bg-gray-100 z-20">Días</th>
                  <th className="border-b border-gray-400 p-2 text-left min-w-[1000px]">Diagrama Gantt Visual</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {presupuestoRubros.map((pr, idx) => {
                  const minDateStr = presupuestoRubros.map(p => p.fecha_inicio).filter(Boolean).sort()[0];
                  const minDate = minDateStr ? new Date(minDateStr + 'T00:00:00') : new Date();
                  const prDate = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00') : new Date();

                  const offsetDays = Math.floor((prDate - minDate) / (1000 * 60 * 60 * 24));
                  const widthDays = pr.duracion_dias || 1;

                  return (
                    <tr key={pr.id} className="border-b border-gray-200 hover:bg-purple-50/20">
                      <td className="border-r border-gray-300 p-2 sticky left-0 bg-white font-medium text-xs text-gray-700 truncate max-w-[250px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" title={pr.nombre_rubro}>
                        {idx + 1}. {pr.nombre_rubro}
                      </td>
                      <td className="border-r border-gray-300 p-2 text-center">
                        <input
                          type="date"
                          value={pr.fecha_inicio || ''}
                          onChange={(e) => updateTaskSchedule(pr.id, 'fecha_inicio', e.target.value)}
                          className="w-full bg-transparent outline-none text-xs text-center font-mono cursor-pointer hover:bg-gray-100 rounded"
                        />
                      </td>
                      <td className="border-r border-gray-300 p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={pr.duracion_dias || 1}
                          onChange={(e) => updateTaskSchedule(pr.id, 'duracion_dias', parseInt(e.target.value) || 1)}
                          className="w-16 bg-transparent outline-none text-xs text-center font-bold hover:bg-gray-100 rounded"
                        />
                      </td>
                      <td className="p-2 relative min-w-[1000px]">
                        <div className="absolute top-0 bottom-0 left-0 right-0 flex pointer-events-none opacity-20">
                          {Array.from({ length: 60 }).map((_, i) => (
                            <div key={i} className="w-8 border-r border-gray-200 h-full flex-shrink-0"></div>
                          ))}
                        </div>

                        <div className="relative h-6 mt-1 rounded-full bg-purple-500 shadow-sm flex items-center px-2 text-[10px] text-white font-bold transition-all z-0"
                          style={{
                            marginLeft: \`\${Math.max(0, offsetDays * 32)}px\`,
                            width: \`\${widthDays * 32}px\`,
                            minWidth: '32px'
                          }}>
                          {widthDays} d
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
