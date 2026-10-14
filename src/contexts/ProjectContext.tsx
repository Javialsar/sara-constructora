"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export interface ProjectItem {
  id: string
  nombre: string
  ubicacion?: string
  provincia?: string
  descripcion?: string
  estado?: string
  cliente_id?: string | null
  cliente_nombre?: string
  created_at?: string
}

interface ProjectContextType {
  projects: ProjectItem[]
  activeProject: ProjectItem | null
  isGlobalMode: boolean
  isLoading: boolean
  isCreateModalOpen: boolean
  setActiveProject: (project: ProjectItem | null) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  createProject: (data: { nombre: string; ubicacion?: string; provincia?: string; descripcion?: string }) => Promise<ProjectItem | null>
  refreshProjects: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

const STORAGE_KEY = "sara_active_project_id"

export function ProjectProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [activeProject, setActiveProjectState] = useState<ProjectItem | null>(null)
  const [isGlobalMode, setIsGlobalMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  const refreshProjects = async () => {
    setIsLoading(true)
    try {
      // 1. Consultar proyectos registrados
      const { data: dbProjects } = await supabase
        .from('proyectos')
        .select('id, nombre, ubicacion, descripcion, estado, cliente_id, created_at, clientes(id, nombre, apellido)')
        .order('created_at', { ascending: false })

      // 2. Consultar nombres de proyectos en presupuestos_reales para garantizar retrocompatibilidad total
      const { data: dbPresupuestos } = await supabase
        .from('presupuestos_reales')
        .select('nombre_proyecto, cliente_id, created_at')

      const projectMap = new Map<string, ProjectItem>()

      // Añadir de la tabla proyectos
      if (dbProjects) {
        dbProjects.forEach((p: any) => {
          const cli = Array.isArray(p.clientes) ? p.clientes[0] : p.clientes
          projectMap.set(p.nombre.trim().toLowerCase(), {
            id: p.id,
            nombre: p.nombre,
            ubicacion: p.ubicacion || "Ecuador",
            provincia: p.ubicacion?.split('-')[0]?.trim() || "Pichincha",
            descripcion: p.descripcion || "",
            estado: p.estado || "en_ejecucion",
            cliente_id: p.cliente_id,
            cliente_nombre: cli ? `${cli.nombre} ${cli.apellido}` : undefined,
            created_at: p.created_at
          })
        })
      }

      // Consolidar proyectos derivados de presupuestos
      if (dbPresupuestos) {
        dbPresupuestos.forEach((pr: any) => {
          if (pr.nombre_proyecto) {
            const key = pr.nombre_proyecto.trim().toLowerCase()
            if (!projectMap.has(key)) {
              projectMap.set(key, {
                id: `pres-${Math.random().toString(36).substring(2, 8)}`,
                nombre: pr.nombre_proyecto,
                ubicacion: "Ecuador",
                provincia: "Pichincha",
                estado: "en_ejecucion",
                cliente_id: pr.cliente_id,
                created_at: pr.created_at
              })
            }
          }
        })
      }

      const list = Array.from(projectMap.values())
      setProjects(list)

      // 3. Restaurar proyecto guardado en localStorage o seleccionar el primero
      if (typeof window !== "undefined") {
        const savedId = localStorage.getItem(STORAGE_KEY)
        if (savedId === "GLOBAL") {
          setIsGlobalMode(true)
          setActiveProjectState(null)
        } else if (savedId) {
          const found = list.find(p => p.id === savedId || p.nombre === savedId)
          if (found) {
            setActiveProjectState(found)
            setIsGlobalMode(false)
          } else if (list.length > 0) {
            setActiveProjectState(list[0])
            setIsGlobalMode(false)
            localStorage.setItem(STORAGE_KEY, list[0].id)
          }
        } else if (list.length > 0) {
          setActiveProjectState(list[0])
          setIsGlobalMode(false)
          localStorage.setItem(STORAGE_KEY, list[0].id)
        }
      }
    } catch (err) {
      console.error("Error al cargar proyectos del usuario:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshProjects()
  }, [])

  const setActiveProject = (project: ProjectItem | null) => {
    if (!project) {
      setIsGlobalMode(true)
      setActiveProjectState(null)
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "GLOBAL")
      }
    } else {
      setIsGlobalMode(false)
      setActiveProjectState(project)
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, project.id)
      }
    }
  }

  const createProject = async (data: { nombre: string; ubicacion?: string; provincia?: string; descripcion?: string }): Promise<ProjectItem | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const nuevoId = `proj-${Date.now()}`
      
      const payload = {
        id: nuevoId,
        nombre: data.nombre.trim(),
        ubicacion: data.ubicacion || data.provincia || "Ecuador",
        descripcion: data.descripcion || `Obra registrada desde Suite SARA-APU (${data.provincia || "Ecuador"})`,
        estado: "en_ejecucion",
        ...(user?.id ? { user_id: user.id } : {})
      }

      const { data: creado, error } = await supabase
        .from('proyectos')
        .insert([payload])
        .select()
        .single()

      if (error) {
        console.error("Error al insertar proyecto:", error)
        alert("Error al registrar proyecto: " + error.message)
        return null
      }

      const nuevoItem: ProjectItem = {
        id: creado ? creado.id : nuevoId,
        nombre: payload.nombre,
        ubicacion: payload.ubicacion,
        provincia: data.provincia || "Pichincha",
        descripcion: payload.descripcion,
        estado: payload.estado,
        created_at: new Date().toISOString()
      }

      setProjects(prev => [nuevoItem, ...prev])
      setActiveProject(nuevoItem)
      setIsCreateModalOpen(false)
      return nuevoItem
    } catch (err: any) {
      alert("Error inesperado al crear proyecto: " + err.message)
      return null
    }
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        isGlobalMode,
        isLoading,
        isCreateModalOpen,
        setActiveProject,
        openCreateModal: () => setIsCreateModalOpen(true),
        closeCreateModal: () => setIsCreateModalOpen(false),
        createProject,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject debe usarse dentro de un ProjectProvider")
  }
  return context
}
