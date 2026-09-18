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
    
    const colors = [
      { p: '#3b82f6', s: '#2563eb' }, // Blue
      { p: '#10b981', s: '#059669' }, // Emerald
      { p: '#f59e0b', s: '#d97706' }, // Amber
      { p: '#ef4444', s: '#dc2626' }, // Red
      { p: '#8b5cf6', s: '#7c3aed' }, // Purple
      { p: '#ec4899', s: '#db2777' }, // Pink
      { p: '#14b8a6', s: '#0d9488' }, // Teal
      { p: '#f97316', s: '#ea580c' }, // Orange
    ];
    
    return presupuestoRubros.map((pr: any, idx: number) => {
      const startDate = pr.fecha_inicio ? new Date(pr.fecha_inicio + 'T00:00:00') : new Date()
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + (parseInt(pr.duracion_dias) || 1))
      
      const deps = pr.predecesores ? [pr.predecesores] : [];

      return {
        id: pr.id,
        type: "task",
        name: idx + 1 + ". " + pr.nombre_rubro,
        start: startDate,
        end: endDate,
        progress: 100, // Show full progress for now since they are just scheduled
        isDisabled: false,
        dependencies: deps,
        styles: { progressColor: colors[idx % colors.length].p, progressSelectedColor: colors[idx % colors.length].s }
      }
    })
  }, [presupuestoRubros])

  if (!isOpen) return null;

  const handleTaskChange = (task: Task) => {
    const startDate = task.start;
    const endDate = task.end;
    
    const startIso = startDate.toISOString().split('T')[0]
    const duracion = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Auto-desplazamiento de tareas dependientes (Cascada)
    // Buscamos si la tarea se movi respecto a su valor original
    const originalTask = presupuestoRubros.find((p: any) => p.id === task.id);
    let shiftDays = 0;
    
    if (originalTask && originalTask.fecha_inicio) {
      const originalStart = new Date(originalTask.fecha_inicio + 'T00:00:00');
      shiftDays = Math.round((startDate.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Actualizamos la tarea actual
    updateTaskSchedule(task.id, {
      fecha_inicio: startIso,
      duracion_dias: duracion
    }, null)

    // Si se desplaz en el tiempo, buscar a los hijos y desplazarlos
    if (shiftDays !== 0) {
      // Funcin recursiva para mover hijos
      const shiftChildren = (parentId: string, currentShift: number) => {
        const children = presupuestoRubros.filter((p: any) => p.predecesores === parentId);
        
        children.forEach((child: any) => {
          if (child.fecha_inicio) {
            const childStart = new Date(child.fecha_inicio + 'T00:00:00');
            childStart.setDate(childStart.getDate() + currentShift);
            
            updateTaskSchedule(child.id, {
              fecha_inicio: childStart.toISOString().split('T')[0]
            }, null);

            // Llamada recursiva para los hijos de los hijos
            shiftChildren(child.id, currentShift);
          }
        });
      };
      
      shiftChildren(task.id, shiftDays);
    }
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
            Arrastra las barras para cambiar la fecha de inicio. Si una tarea tiene dependencias, al moverla se empujarán automáticamente las siguientes.
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