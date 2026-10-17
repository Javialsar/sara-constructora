"use client"
import { useState, useMemo, useEffect } from "react"
import { 
  Search, Shield, ShieldAlert, ShieldCheck, Key, Trash2, Power, PowerOff, UserCheck, UserX, Mail, Phone, Hash, Calendar, Edit, ChevronDown, CheckCircle, Lock, Unlock, RefreshCw, Clock, Download, FileSpreadsheet, Plus, Loader2, Sparkles, UserPlus, X, Radio, Layers, ExternalLink, Settings2
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { membreteBase64 } from "@/lib/membreteBase64"
import { createClient } from "@/lib/supabase/client"
import { SaraModule, SARA_MODULES } from "@/lib/auth/moduleGuards"
import { 
  updateUserStatusAction, 
  deleteUserAction, 
  changeUserPasswordAction, 
  createUserAccessAction,
  getAuthUsersAction,
  updateUserModulesAction
} from "./actions"

type UserStatus = 'activo' | 'inactivo' | 'bloqueado'
type UserRole = 'Administrador' | 'Técnico' | 'Cliente'

type UsuarioAcceso = {
  id: string
  table: 'clientes' | 'trabajadores' | 'auth_users'
  fecha_creacion: string
  hora_creacion: string
  nombres: string
  apellidos: string
  cedula: string
  telefono: string
  email: string
  rol: UserRole
  estado: UserStatus
  modulo_origen?: SaraModule | 'sara_master' | null
  modulos_autorizados?: SaraModule[]
}

const MODULE_TABS: { id: string; label: string; icon: string; filterKey: string }[] = [
  { id: 'all', label: 'Todos', icon: '🏢', filterKey: '' },
  { id: 'sara_apu', label: 'SARA APU', icon: '📊', filterKey: 'sara_apu' },
  { id: 'sara_constructora', label: 'Constructora', icon: '🏗️', filterKey: 'sara_constructora' },
  { id: 'sara_inmobiliaria', label: 'Inmobiliaria', icon: '🏠', filterKey: 'sara_inmobiliaria' },
  { id: 'sara_stays', label: 'Stays', icon: '🛏️', filterKey: 'sara_stays' },
  { id: 'sara_fletes', label: 'Fletes', icon: '🚚', filterKey: 'sara_fletes' },
  { id: 'sara_talento', label: 'Talento', icon: '👷', filterKey: 'sara_talento' },
  { id: 'sara_master', label: 'Global / Admin', icon: '👑', filterKey: 'sara_master' },
]

const MODULE_CONFIG: Record<string, { label: string; badgeClass: string; icon: string }> = {
  sara_apu: { label: 'SARA APU', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📊' },
  sara_constructora: { label: 'Constructora', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🏗️' },
  sara_inmobiliaria: { label: 'Inmobiliaria', badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: '🏠' },
  sara_stays: { label: 'Stays', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200', icon: '🛏️' },
  sara_fletes: { label: 'Fletes', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🚚' },
  sara_talento: { label: 'Talento', badgeClass: 'bg-violet-100 text-violet-700 border-violet-200', icon: '👷' },
  sara_master: { label: 'Holding Global', badgeClass: 'bg-purple-100 text-purple-700 border-purple-200', icon: '👑' },
}

export default function AccesosPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UsuarioAcceso[]>([])
  const [loading, setLoading] = useState(true)
  const [isRealtimeActive, setIsRealtimeActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedModuleTab, setSelectedModuleTab] = useState<string>("all")

  // Modal para cambio de clave
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioAcceso | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Modal para gestionar modulos de usuario
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)
  const [moduleModalUser, setModuleModalUser] = useState<UsuarioAcceso | null>(null)
  const [userSelectedModules, setUserSelectedModules] = useState<SaraModule[]>([])
  const [isSavingModules, setIsSavingModules] = useState(false)

  // Modal para crear nuevo usuario / acceso
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cedula: "",
    password: "",
    rol: "Cliente" as UserRole,
    modulo_origen: "sara_apu" as SaraModule
  })

  // Toast / Mensajes
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const showNotification = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ message: msg, type })
    setTimeout(() => setNotification(null), 3500)
  }

  // Carga de usuarios reales combinando Clientes, Trabajadores y Supabase Auth
  const fetchRealUsers = async () => {
    try {
      setLoading(true)
      const [{ data: clientsData, error: errClients }, { data: trabData, error: errTrab }, authRes] = await Promise.all([
        supabase.from('clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('trabajadores').select('*').order('created_at', { ascending: false }),
        getAuthUsersAction()
      ])

      if (errClients) console.error("Error cargando clientes:", errClients)
      if (errTrab) console.error("Error cargando trabajadores:", errTrab)

      const authMap = new Map<string, any>()
      if (authRes.success && authRes.users) {
        authRes.users.forEach(u => authMap.set(u.id, u))
      }

      const combined: UsuarioAcceso[] = []
      const processedUserIds = new Set<string>()

      // 1. Clientes registrados
      if (clientsData && clientsData.length > 0) {
        clientsData.forEach((c: any) => {
          processedUserIds.add(c.id)
          const d = new Date(c.created_at || Date.now())
          const fecha = d.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' })
          const hora = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })

          let normalizedEstado: UserStatus = 'activo'
          if (c.estado === 'inactivo') normalizedEstado = 'inactivo'
          else if (c.estado === 'bloqueado') normalizedEstado = 'bloqueado'

          const authInfo = authMap.get(c.id)
          const modOrigen: SaraModule | 'sara_master' = c.es_admin 
            ? 'sara_master' 
            : (authInfo?.modulo_origen || 'sara_constructora')

          combined.push({
            id: c.id,
            table: 'clientes',
            fecha_creacion: fecha,
            hora_creacion: hora,
            nombres: c.nombre || 'Sin nombre',
            apellidos: c.apellido || '',
            cedula: c.cedula || c.telefono || `ID-${c.id.substring(0, 8).toUpperCase()}`,
            telefono: c.telefono || 'Sin teléfono',
            email: c.email || 'Sin correo',
            rol: c.es_admin ? 'Administrador' : 'Cliente',
            estado: normalizedEstado,
            modulo_origen: modOrigen,
            modulos_autorizados: authInfo?.modulos_autorizados || [modOrigen as SaraModule]
          })
        })
      }

      // 2. Trabajadores y Técnicos
      if (trabData && trabData.length > 0) {
        trabData.forEach((t: any) => {
          const d = new Date(t.created_at || Date.now())
          const fecha = d.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' })
          const hora = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })

          const parts = (t.nombre_completo || '').trim().split(' ')
          const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ') || t.nombre_completo || 'Técnico'
          const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ') || ''

          combined.push({
            id: t.id,
            table: 'trabajadores',
            fecha_creacion: fecha,
            hora_creacion: hora,
            nombres,
            apellidos,
            cedula: t.cedula || 'N/A',
            telefono: t.telefono || 'Sin teléfono',
            email: t.email || `${(t.nombre_completo || 'tecnico').toLowerCase().replace(/\s+/g, '.')}@saraconstructora.com`,
            rol: 'Técnico',
            estado: t.estado ? 'activo' : 'inactivo',
            modulo_origen: 'sara_master',
            modulos_autorizados: ['sara_apu', 'sara_constructora', 'sara_inmobiliaria', 'sara_stays', 'sara_fletes', 'sara_talento']
          })
        })
      }

      // 3. Usuarios de Auth que se registraron por otros portales (APU, Inmobiliaria, Stays, Fletes, Talento)
      if (authRes.success && authRes.users) {
        authRes.users.forEach(u => {
          if (!processedUserIds.has(u.id)) {
            const d = new Date(u.created_at || Date.now())
            const fecha = d.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' })
            const hora = d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })

            const parts = (u.full_name || '').split(' ')
            const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ') || u.full_name || 'Usuario'
            const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ') || ''

            const isAdm = u.role === 'admin' || u.role === 'superadmin'
            const isTec = u.role === 'tecnico'

            const modOrigen = isAdm ? 'sara_master' : (u.modulo_origen || 'sara_apu')

            combined.push({
              id: u.id,
              table: 'auth_users',
              fecha_creacion: fecha,
              hora_creacion: hora,
              nombres,
              apellidos,
              cedula: `ID-${u.id.substring(0, 8).toUpperCase()}`,
              telefono: u.phone || 'Sin teléfono',
              email: u.email,
              rol: isAdm ? 'Administrador' : (isTec ? 'Técnico' : 'Cliente'),
              estado: 'activo',
              modulo_origen: modOrigen,
              modulos_autorizados: u.modulos_autorizados || [modOrigen as SaraModule]
            })
          }
        })
      }

      setUsers(combined)
    } catch (err: any) {
      console.error("Error al sincronizar usuarios:", err)
      showNotification("Error al cargar nómina de usuarios: " + (err.message || ""), "error")
    } finally {
      setLoading(false)
    }
  }

  // Sincronización en TIEMPO REAL con Supabase Channels
  useEffect(() => {
    fetchRealUsers()

    const channel = supabase
      .channel('accesos-live-db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => fetchRealUsers()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trabajadores' },
        () => fetchRealUsers()
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Cambiar Estado
  const handleStatusChange = async (user: UsuarioAcceso, newStatus: UserStatus) => {
    if (user.table === 'auth_users') {
      showNotification(`El usuario de auth ${user.nombres} ya está activo en su portal de origen.`)
      return
    }

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, estado: newStatus } : u))
    
    const res = await updateUserStatusAction(user.id, user.table, newStatus)
    if (res.success) {
      showNotification(`Estado de ${user.nombres} actualizado a ${newStatus} en base de datos.`)
    } else {
      showNotification(`Error: ${res.error}`, 'error')
      fetchRealUsers()
    }
  }

  // Eliminar usuario
  const handleDelete = async (user: UsuarioAcceso) => {
    const nombreCompleto = `${user.nombres} ${user.apellidos}`.trim()
    if (!confirm(`ADVERTENCIA: ¿Eliminar permanentemente a "${nombreCompleto}" del sistema? Esta acción no se puede deshacer.`)) return

    setUsers(prev => prev.filter(u => u.id !== user.id))

    if (user.table === 'clientes' || user.table === 'trabajadores') {
      const res = await deleteUserAction(user.id, user.table)
      if (res.success) {
        showNotification(`Usuario ${nombreCompleto} eliminado exitosamente.`)
      } else {
        showNotification(`Error al eliminar: ${res.error}`, 'error')
        fetchRealUsers()
      }
    } else {
      showNotification(`Usuario eliminado del panel.`)
    }
  }

  // Abrir modal de clave
  const openKeyModal = (user: UsuarioAcceso) => {
    setSelectedUser(user)
    setNewPassword("")
    setIsKeyModalOpen(true)
  }

  // Guardar nueva clave
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsUpdatingPassword(true)
    const res = await changeUserPasswordAction(selectedUser.id, newPassword)
    setIsUpdatingPassword(false)

    if (res.success) {
      setIsKeyModalOpen(false)
      showNotification(`Contraseña actualizada exitosamente en Supabase Auth para ${selectedUser.nombres}.`)
    } else {
      showNotification(`Error: ${res.error}`, 'error')
    }
  }

  // Abrir modal de modulos
  const openModuleModal = (user: UsuarioAcceso) => {
    setModuleModalUser(user)
    setUserSelectedModules(user.modulos_autorizados || [user.modulo_origen as SaraModule || 'sara_apu'])
    setIsModuleModalOpen(true)
  }

  // Guardar modulos autorizados
  const handleSaveModules = async () => {
    if (!moduleModalUser) return
    setIsSavingModules(true)

    const res = await updateUserModulesAction(moduleModalUser.id, userSelectedModules)
    setIsSavingModules(false)

    if (res.success) {
      setIsModuleModalOpen(false)
      showNotification(`Módulos de ${moduleModalUser.nombres} actualizados exitosamente.`)
      fetchRealUsers()
    } else {
      showNotification(`Error al actualizar módulos: ${res.error}`, 'error')
    }
  }

  // Generador de clave segura
  const handleRegeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"
    let pass = ""
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    setNewPassword(pass)
  }

  // Crear nuevo usuario
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)

    const res = await createUserAccessAction(newUserForm)
    setIsCreatingUser(false)

    if (res.success) {
      setIsCreateModalOpen(false)
      setNewUserForm({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        cedula: "",
        password: "",
        rol: "Cliente",
        modulo_origen: "sara_apu"
      })
      showNotification("Usuario y credenciales creados exitosamente en Supabase Auth.")
      fetchRealUsers()
    } else {
      showNotification(res.error || "Error al crear usuario", "error")
    }
  }

  // Conteo de usuarios por modulo
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length }
    MODULE_TABS.forEach(tab => {
      if (tab.id !== 'all') {
        counts[tab.id] = users.filter(u => {
          if (tab.id === 'sara_master') {
            return u.rol === 'Administrador' || u.rol === 'Técnico' || u.modulo_origen === 'sara_master'
          }
          return u.modulo_origen === tab.id || u.modulos_autorizados?.includes(tab.id as SaraModule)
        }).length
      }
    })
    return counts
  }, [users])

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.cedula.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.telefono.includes(searchTerm)
      
      const matchRole = roleFilter ? u.rol === roleFilter : true
      const matchStatus = statusFilter ? u.estado === statusFilter : true

      let matchModule = true
      if (selectedModuleTab !== 'all') {
        if (selectedModuleTab === 'sara_master') {
          matchModule = u.rol === 'Administrador' || u.rol === 'Técnico' || u.modulo_origen === 'sara_master'
        } else {
          matchModule = u.modulo_origen === selectedModuleTab || Boolean(u.modulos_autorizados?.includes(selectedModuleTab as SaraModule))
        }
      }

      return matchSearch && matchRole && matchStatus && matchModule
    })
  }, [users, searchTerm, roleFilter, statusFilter, selectedModuleTab])

  // Exportar Excel
  const exportToExcel = () => {
    const headerRows = [
      ["SARA CONSTRUCTORA S.A. - HOLDING EMPRESARIAL"],
      ["SISTEMA INTEGRADO DE SEGREGACIÓN Y CONTROL DE ACCESOS"],
      ["REPORTE: NÓMINA GENERAL DE CLIENTES Y PROFESIONALES POR MÓDULO"],
      [`Fecha de Emisión: ${new Date().toLocaleString()}`],
      [`Total Registros: ${filteredUsers.length}`],
      [],
      ["Nº", "FECHA REGISTRO", "CÉDULA / ID", "NOMBRES", "APELLIDOS", "EMAIL", "TELÉFONO", "MÓDULO ORIGEN", "ROL", "ESTADO"]
    ];

    const dataRows = filteredUsers.map((u, idx) => [
      idx + 1,
      `${u.fecha_creacion} ${u.hora_creacion}`,
      u.cedula,
      u.nombres,
      u.apellidos,
      u.email,
      u.telefono,
      MODULE_CONFIG[u.modulo_origen || 'sara_apu']?.label || u.modulo_origen || 'SARA APU',
      u.rol,
      u.estado.toUpperCase()
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headerRows, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accesos");
    XLSX.writeFile(workbook, `Nomina_Usuarios_Modulos_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // Exportar PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    if (membreteBase64) {
      try {
        doc.addImage(membreteBase64, 'PNG', 0, 0, pageWidth, 28);
      } catch (e) {
        console.error("No se pudo cargar el membrete:", e);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("SEGREGACIÓN DE ACCESOS Y CLIENTES POR MÓDULO", 14, 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Nómina oficial del Holding Grupo SARA • Emisión: ${new Date().toLocaleString()}`, 14, 40);

    const tableData = filteredUsers.map((u, idx) => [
      idx + 1,
      `${u.fecha_creacion}\n${u.hora_creacion}`,
      `${u.apellidos}, ${u.nombres}\nCI/ID: ${u.cedula}`,
      `${u.email}\nTelf: ${u.telefono}`,
      MODULE_CONFIG[u.modulo_origen || 'sara_apu']?.label || 'SARA APU',
      u.rol,
      u.estado.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 46,
      head: [['#', 'Registro', 'Cliente / Profesional', 'Contacto', 'Módulo', 'Rol', 'Estado']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Nomina_Usuarios_Modulos_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] p-4 sm:p-6 overflow-hidden max-w-7xl mx-auto w-full">
      
      {/* NOTIFICACION FLOTANTE */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl border flex items-center gap-3 transition-all animate-in slide-in-from-bottom-5 ${
          notification.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {notification.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-brand-sage" size={28} /> Control de Accesos y Segregación de Módulos
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tiempo Real Activo</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            Organiza y administra a los clientes por portal. Cada usuario solo puede ingresar a su módulo asignado a menos que le otorgues permisos multi-módulo.
          </p>
        </div>

        {/* ACCIONES SUPERIORES */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchRealUsers}
            title="Sincronizar ahora con la base de datos"
            className="p-2 bg-white border border-gray-200 hover:border-brand-sage text-gray-600 hover:text-brand-sage rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-brand-sage" : ""} />
          </button>
          <button 
            onClick={exportToExcel} 
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors" 
            title="Exportar a Excel"
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button 
            onClick={exportToPDF} 
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors" 
            title="Exportar a PDF"
          >
            <Download size={16} /> PDF
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-brand-dark hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            <UserPlus size={16} className="text-brand-sage" /> Nuevo Usuario
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por cédula, nombre, email..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-64 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:border-brand-sage" 
            />
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE SEGREGACIÓN POR MÓDULOS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {MODULE_TABS.map(tab => {
          const isActive = selectedModuleTab === tab.id
          const count = moduleCounts[tab.id] || 0
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedModuleTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* PANEL PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden min-h-0">
        
        {/* Filtros Rapidos */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/80 flex flex-wrap gap-4 shrink-0 items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-gray-500 uppercase text-xs">Rol:</span>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border-gray-200 rounded-md text-xs font-semibold outline-none bg-white px-2.5 py-1">
              <option value="">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Técnico">Técnico</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm border-l border-gray-200 pl-4">
            <span className="font-bold text-gray-500 uppercase text-xs">Estado:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border-gray-200 rounded-md text-xs font-semibold outline-none bg-white px-2.5 py-1">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-500">
            <span>Mostrando <strong className="text-slate-800">{filteredUsers.length}</strong> de {users.length} usuarios</span>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="flex-1 overflow-auto relative">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-white sticky top-0 z-10 border-b border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <tr className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3">Usuario / Identificación</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3 text-center">Módulo Asignado</th>
                <th className="px-4 py-3 text-center">Credenciales</th>
                <th className="px-4 py-3 text-center">Rol & Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-brand-sage" size={24} />
                      <span className="text-xs font-bold uppercase tracking-widest">Sincronizando nómina con Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldAlert className="text-gray-300" size={32} />
                      <span className="text-sm font-medium">No se encontraron usuarios en este módulo o con los filtros seleccionados.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const modConf = MODULE_CONFIG[user.modulo_origen || 'sara_apu'] || {
                    label: user.modulo_origen || 'SARA APU',
                    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: '📊'
                  }
                  const extraModulesCount = (user.modulos_autorizados?.length || 0) > 1 
                    ? (user.modulos_autorizados?.length || 0) - 1 
                    : 0

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 align-top pt-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-800"><Calendar size={13} className="text-gray-400" /> {user.fecha_creacion}</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock size={13} className="text-gray-400" /> {user.hora_creacion}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top pt-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-900 text-[13px] uppercase">{user.apellidos ? `${user.apellidos}, ${user.nombres}` : user.nombres}</span>
                          <span className="flex items-center gap-1.5 text-xs text-brand-sage font-mono font-bold"><Hash size={12}/> CI/ID: {user.cedula}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top pt-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-1.5 text-xs text-blue-600"><Mail size={12} /> {user.email}</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-600"><Phone size={12} /> {user.telefono}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center align-top pt-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${modConf.badgeClass}`}>
                            <span>{modConf.icon}</span>
                            <span>{modConf.label}</span>
                          </span>

                          {extraModulesCount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              +{extraModulesCount} módulo{extraModulesCount > 1 ? 's' : ''} adicional{extraModulesCount > 1 ? 'es' : ''}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => openModuleModal(user)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
                            title="Gestionar permisos de módulos"
                          >
                            <Settings2 size={11} /> Módulos
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center align-top pt-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-base font-black tracking-widest leading-none select-none" title="Contraseña encriptada en Supabase Auth">••••••••</span>
                          <button 
                            onClick={() => openKeyModal(user)} 
                            className="p-1.5 text-brand-sage hover:text-white hover:bg-brand-sage rounded-md border border-brand-sage/30 transition-all"
                            title="Cambiar o regenerar clave"
                          >
                            <Key size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center align-top pt-4">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user.rol === 'Administrador' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            user.rol === 'Técnico' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-orange-100 text-orange-700 border border-orange-200'
                          }`}>
                            {user.rol}
                          </span>
                          <span className={`flex items-center gap-1 text-[11px] font-black uppercase ${
                            user.estado === 'activo' ? 'text-emerald-500' :
                            user.estado === 'bloqueado' ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            {user.estado === 'activo' ? <UserCheck size={12}/> : user.estado === 'bloqueado' ? <Lock size={12}/> : <UserX size={12}/>}
                            {user.estado}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top pt-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {user.estado !== 'activo' && (
                            <button 
                              onClick={() => handleStatusChange(user, 'activo')} 
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg border border-emerald-200 transition-colors shadow-sm" 
                              title="Activar acceso en tiempo real"
                            >
                              <Power size={14} />
                            </button>
                          )}

                          {user.estado === 'activo' && (
                            <button 
                              onClick={() => handleStatusChange(user, 'inactivo')} 
                              className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg border border-amber-200 transition-colors shadow-sm" 
                              title="Desactivar temporalmente"
                            >
                              <PowerOff size={14} />
                            </button>
                          )}

                          {user.estado !== 'bloqueado' && (
                            <button 
                              onClick={() => handleStatusChange(user, 'bloqueado')} 
                              className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg border border-orange-200 transition-colors shadow-sm" 
                              title="Bloquear acceso por seguridad"
                            >
                              <Lock size={14} />
                            </button>
                          )}

                          <button 
                            onClick={() => handleDelete(user)} 
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition-colors shadow-sm" 
                            title="Eliminar usuario permanentemente"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL GESTIONAR MÓDULOS AUTORIZADOS */}
      {isModuleModalOpen && moduleModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Layers size={20} className="text-brand-sage" /> Módulos Autorizados
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Controla qué portales puede acceder este cliente</p>
              </div>
              <button onClick={() => !isSavingModules && setIsModuleModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-sm font-bold text-slate-800">{moduleModalUser.nombres} {moduleModalUser.apellidos}</p>
                <p className="text-xs text-slate-500">{moduleModalUser.email}</p>
                <p className="text-xs text-brand-dark mt-1">
                  <strong>Módulo de Registro Original:</strong> {MODULE_CONFIG[moduleModalUser.modulo_origen || 'sara_apu']?.label || 'SARA APU'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
                  Portales con Permiso de Acceso:
                </label>
                <div className="space-y-2">
                  {(Object.keys(SARA_MODULES) as SaraModule[]).map((modKey) => {
                    const mod = SARA_MODULES[modKey]
                    const isChecked = userSelectedModules.includes(modKey)
                    return (
                      <label
                        key={modKey}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-blue-50/60 border-blue-300 text-slate-900' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserSelectedModules([...userSelectedModules, modKey])
                              } else {
                                setUserSelectedModules(userSelectedModules.filter(m => m !== modKey))
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-xs font-bold block">{mod.name}</span>
                            <span className="text-[11px] text-slate-400">{mod.description}</span>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingModules}
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSavingModules || userSelectedModules.length === 0}
                  onClick={handleSaveModules}
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingModules ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR / REGENERAR CLAVE */}
      {isKeyModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Key size={18} className="text-brand-sage" /> Gestionar Clave</h3>
              <button onClick={() => !isUpdatingPassword && setIsKeyModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-5 flex flex-col gap-4">
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 items-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black shrink-0">
                  {selectedUser.nombres.charAt(0)}{selectedUser.apellidos?.charAt(0) || ''}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800 leading-tight">{selectedUser.nombres} {selectedUser.apellidos}</div>
                  <div className="text-xs text-gray-500">{selectedUser.email}</div>
                  <div className="text-[11px] font-bold text-blue-700 mt-0.5">{selectedUser.rol}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nueva Contraseña (Auth)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Mínimo 6 caracteres..." 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand-sage font-mono text-sm" 
                    required 
                    minLength={6} 
                  />
                  <button 
                    type="button" 
                    onClick={handleRegeneratePassword} 
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg border border-gray-300 transition-colors" 
                    title="Autogenerar Clave Segura"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Se sincronizará en tiempo real con el servidor de autenticación Supabase.</p>
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  disabled={isUpdatingPassword} 
                  onClick={() => setIsKeyModalOpen(false)} 
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdatingPassword || newPassword.length < 6} 
                  className="px-5 py-2 text-xs font-bold bg-brand-sage text-white hover:bg-brand-dark rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdatingPassword ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Guardar y Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO USUARIO / ACCESO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <UserPlus size={20} className="text-brand-sage" /> Registrar Nuevo Usuario
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Crea un acceso asignado directamente al portal correspondiente</p>
              </div>
              <button onClick={() => !isCreatingUser && setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-6 space-y-4">
              {/* Rol */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Rol en el Sistema *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cliente', 'Técnico', 'Administrador'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, rol: r })}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                        newUserForm.rol === r
                          ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Módulo Asignado */}
              {newUserForm.rol === 'Cliente' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Módulo / Portal Asignado *</label>
                  <select
                    value={newUserForm.modulo_origen}
                    onChange={(e) => setNewUserForm({ ...newUserForm, modulo_origen: e.target.value as SaraModule })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-brand-sage bg-white"
                  >
                    <option value="sara_apu">📊 SARA APU (Presupuestos & SERCOP)</option>
                    <option value="sara_constructora">🏗️ SARA Constructora (Portal Clientes)</option>
                    <option value="sara_inmobiliaria">🏠 SARA Inmobiliaria (Ventas & Propiedades)</option>
                    <option value="sara_stays">🛏️ SARA Stays (Alojamientos Turísticos)</option>
                    <option value="sara_fletes">🚚 SARA Fletes (Transporte Pesado)</option>
                    <option value="sara_talento">👷 SARA Talento (Cuadrillas & Empleo)</option>
                  </select>
                </div>
              )}

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.nombre}
                    onChange={e => setNewUserForm({ ...newUserForm, nombre: e.target.value })}
                    placeholder="Ej. Carlos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.apellido}
                    onChange={e => setNewUserForm({ ...newUserForm, apellido: e.target.value })}
                    placeholder="Ej. Gómez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-sage"
                  />
                </div>
              </div>

              {/* Correo y Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="usuario@saraconstructora.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newUserForm.telefono}
                    onChange={e => setNewUserForm({ ...newUserForm, telefono: e.target.value })}
                    placeholder="0991234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-sage"
                  />
                </div>
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cédula / Identificación</label>
                <input
                  type="text"
                  value={newUserForm.cedula}
                  onChange={e => setNewUserForm({ ...newUserForm, cedula: e.target.value })}
                  placeholder="Ej. 1102345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-sage font-mono"
                />
              </div>

              {/* Contraseña Inicial */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Contraseña Inicial *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"
                      let pass = ""
                      for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
                      setNewUserForm({ ...newUserForm, password: pass })
                    }}
                    className="text-[11px] font-bold text-brand-sage hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={11} /> Autogenerar
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-sage font-mono"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isCreatingUser}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> Crear y Asignar Módulo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
