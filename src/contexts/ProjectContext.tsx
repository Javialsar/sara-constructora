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
  currentCliente: any | null
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
  const [currentCliente, setCurrentCliente] = useState<any | null>(null)
  const [isGlobalMode, setIsGlobalMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  // 1. Obtener y vincular el cliente autenticado (Arquitecto, Ingeniero Civil, Constructora)
  const resolveCurrentCliente = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Buscar si ya está vinculado por user_id o por email
      let { data: cli } = await supabase
        .from('clientes')
        .select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle()

      // Si existe por email pero no tenía user_id, vincularlo permanentemente
      if (cli && !cli.user_id) {
        await supabase.from('clientes').update({ user_id: user.id }).eq('id', cli.id)
        cli.user_id = user.id
      }

      // Si no existe, crear el perfil de cliente para este usuario
      if (!cli) {
        const { data: nuevoCli } = await supabase.from('clientes').insert([{
          nombre: user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "Profesional",
          apellido: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "Constructora",
          email: user.email,
          user_id: user.id,
          es_admin: false
        }]).select().maybeSingle()
        if (nuevoCli) cli = nuevoCli
      }

      setCurrentCliente(cli)
      return cli
    } catch (err) {
      console.warn("Fallo al resolver cliente APU:", err)
      return null
    }
  }

  const refreshProjects = async () => {
    setIsLoading(true)
    try {
      const cli = await resolveCurrentCliente()

      // 1. Consultar proyectos registrados
      let query = supabase
        .from('proyectos')
        .select('id, nombre, ubicacion, descripcion, estado, cliente_id, created_at, clientes(id, nombre, apellido)')
        .order('created_at', { ascending: false })

      // Si no es admin general, filtrar únicamente los proyectos del cliente suscriptor
      if (cli && !cli.es_admin) {
        query = query.eq('cliente_id', cli.id)
      }

      const { data: dbProjects } = await query

      // 2. Consultar nombres de proyectos en presupuestos_reales
      let presQuery = supabase
        .from('presupuestos_reales')
        .select('nombre_proyecto, cliente_id, created_at')

      if (cli && !cli.es_admin) {
        presQuery = presQuery.eq('cliente_id', cli.id)
      }

      const { data: dbPresupuestos } = await presQuery

      const projectMap = new Map<string, ProjectItem>()

      // Añadir de la tabla proyectos
      if (dbProjects) {
        dbProjects.forEach((p: any) => {
          const cliRel = Array.isArray(p.clientes) ? p.clientes[0] : p.clientes
          projectMap.set(p.nombre.trim().toLowerCase(), {
            id: p.id,
            nombre: p.nombre,
            ubicacion: p.ubicacion || "Ecuador",
            provincia: p.ubicacion?.split('•')?.[1]?.trim() || p.ubicacion?.split('-')?.[0]?.trim() || "Pichincha",
            descripcion: p.descripcion || "",
            estado: p.estado || "en_ejecucion",
            cliente_id: p.cliente_id,
            cliente_nombre: cliRel ? `${cliRel.nombre} ${cliRel.apellido}` : undefined,
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

  // ⚡ Sincronización en tiempo real con Supabase Realtime
  useEffect(() => {
    refreshProjects()

    const channel = supabase
      .channel('sara-proyectos-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, () => {
        refreshProjects()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presupuestos_reales' }, () => {
        refreshProjects()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
      const ubicacionStr = data.provincia 
        ? (data.ubicacion ? `${data.ubicacion} • ${data.provincia}` : data.provincia)
        : (data.ubicacion || "Ecuador")

      const payload = {
        nombre: data.nombre.trim(),
        ubicacion: ubicacionStr,
        descripcion: data.descripcion || `Obra registrada desde Suite SARA-APU (${data.provincia || "Ecuador"})`,
        estado: "en_construccion",
        cliente_id: currentCliente?.id || null
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
        id: creado.id,
        nombre: creado.nombre || payload.nombre,
        ubicacion: creado.ubicacion || payload.ubicacion,
        provincia: data.provincia || "Loja",
        descripcion: creado.descripcion || payload.descripcion,
        estado: creado.estado || payload.estado,
        cliente_id: payload.cliente_id,
        created_at: creado.created_at || new Date().toISOString()
      }

      setProjects(prev => [nuevoItem, ...prev.filter(p => p.id !== nuevoItem.id)])
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
        currentCliente,
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
