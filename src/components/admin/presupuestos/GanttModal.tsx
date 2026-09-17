import React, { useState, useMemo } from "react"
import { Calendar, X, AlertCircle } from "lucide-react"
import { Gantt, Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"

export default function GanttModal({
  isOpen,
  onClose,
  presupuestoRubros,
  updateTaskSchedule
}: any) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)

  const tasks: Task[] = useMemo(() => {
    if (!presupuestoRubros || presupuestoRubros.length === 0) return []
    
    return presupuestoRubros.map((pr: any, idx: number) => {
      const startDate = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00') : new Date()
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + (parseInt(pr.duracion_dias) || 1))
      
      return {
        id: pr.id,
        type: "task",
        name: idx + 1 + ". " + pr.nombre_rubro,
        start: startDate,
        end: endDate,
        progress: 100, // Show full progress for now since they are just scheduled
        isDisabled: false,
        styles: { progressColor: '#8b5cf6', progressSelectedColor: '#7c3aed' }
      }
    })
  }, [presupuestoRubros])

  if (!isOpen) return null;

  const handleTaskChange = (task: Task) => {
    const startDate = task.start;
    const endDate = task.end;
    
    const startIso = startDate.toISOString().split('T')[0]
    const duracion = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Batch update
    updateTaskSchedule(task.id, {
      fecha_inicio: startIso,
      duracion_dias: duracion
    }, null)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Calendar className="text-purple-600" /> Cronograma de Trabajo (Gantt Interactivo)
            </h2>
            <div className="flex bg-gray-200 rounded p-1 text-sm">
              <button className={"px-3 py-1 rounded " + (viewMode === ViewMode.Day ? 'bg-white shadow' : 'hover:bg-gray-300')} onClick={() => setViewMode(ViewMode.Day)}>Días</button>
              <button className={"px-3 py-1 rounded " + (viewMode === ViewMode.Week ? 'bg-white shadow' : 'hover:bg-gray-300')} onClick={() => setViewMode(ViewMode.Week)}>Semanas</button>
              <button className={"px-3 py-1 rounded " + (viewMode === ViewMode.Month ? 'bg-white shadow' : 'hover:bg-gray-300')} onClick={() => setViewMode(ViewMode.Month)}>Meses</button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col">
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <AlertCircle size={16}/> 
            Arrastra las barras para cambiar la fecha de inicio. Arrastra los bordes de la barra para aumentar o reducir la duración en días.
          </p>

          <div className="border border-gray-200 rounded-lg bg-white flex-1 overflow-auto p-2">
            {tasks.length > 0 ? (
              <Gantt
                tasks={tasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                onProgressChange={() => {}}
                onDoubleClick={() => {}}
                listCellWidth="280px"
                columnWidth={viewMode === ViewMode.Day ? 60 : 150}
                locale="es"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Agrega rubros al presupuesto para visualizar el cronograma.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}