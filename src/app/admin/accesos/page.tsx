"use client"
import { useState, useMemo, useEffect } from "react"
import { 
  Search, Shield, ShieldAlert, ShieldCheck, Key, Trash2, Power, PowerOff, UserCheck, UserX, Mail, Phone, Hash, Calendar, Edit, ChevronDown, CheckCircle, Lock, Unlock, RefreshCw
} from "lucide-react"

type UserStatus = 'activo' | 'inactivo' | 'bloqueado'
type UserRole = 'Administrador' | 'Técnico' | 'Cliente'

type UsuarioAcceso = {
  id: string
  fecha_creacion: string
  hora_creacion: string
  nombres: string
  apellidos: string
  cedula: string
  telefono: string
  email: string
  rol: UserRole
  estado: UserStatus
}

// Datos de prueba (Mocks)
const generateMockUsers = (): UsuarioAcceso[] => {
  return [
    { id: "USR-001", fecha_creacion: "2026-01-15", hora_creacion: "08:30", nombres: "Juan Carlos", apellidos: "Pérez Gomez", cedula: "0912345678", telefono: "0991234567", email: "juan.perez@example.com", rol: "Administrador", estado: "activo" },
    { id: "USR-002", fecha_creacion: "2026-02-20", hora_creacion: "14:15", nombres: "Ana María", apellidos: "Silva Castro", cedula: "1712345678", telefono: "0987654321", email: "ana.silva@example.com", rol: "Técnico", estado: "activo" },
    { id: "USR-003", fecha_creacion: "2026-03-05", hora_creacion: "09:45", nombres: "Luis Fernando", apellidos: "Torres Ruiz", cedula: "0101234567", telefono: "0971122334", email: "luis.torres@example.com", rol: "Técnico", estado: "inactivo" },
    { id: "USR-004", fecha_creacion: "2026-04-10", hora_creacion: "11:20", nombres: "María Fernanda", apellidos: "López Vega", cedula: "0301234567", telefono: "0963344556", email: "mflopez@empresa.com", rol: "Cliente", estado: "bloqueado" },
    { id: "USR-005", fecha_creacion: "2026-05-22", hora_creacion: "16:50", nombres: "Roberto", apellidos: "Sánchez M.", cedula: "0923456789", telefono: "0999888777", email: "roberto.s@example.com", rol: "Cliente", estado: "activo" },
  ]
}

export default function AccesosPage() {
  const [users, setUsers] = useState<UsuarioAcceso[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Modal para cambio de clave
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsuarioAcceso | null>(null)
  const [newPassword, setNewPassword] = useState("")

  // Toast / Mensajes
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  useEffect(() => {
    setUsers(generateMockUsers())
  }, [])

  const showNotification = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ message: msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleStatusChange = (id: string, newStatus: UserStatus) => {
    if (!confirm(`¿Estás seguro de marcar a este usuario como ${newStatus}?`)) return
    setUsers(users.map(u => u.id === id ? { ...u, estado: newStatus } : u))
    showNotification(`Estado del usuario actualizado a ${newStatus}.`)
  }

  const handleDelete = (id: string, nombre: string) => {
    if (!confirm(`ADVERTENCIA: ¿Eliminar permanentemente al usuario ${nombre}? Esta acción no se puede deshacer.`)) return
    setUsers(users.filter(u => u.id !== id))
    showNotification(`Usuario ${nombre} eliminado exitosamente.`)
  }

  const openKeyModal = (user: UsuarioAcceso) => {
    setSelectedUser(user)
    setNewPassword("")
    setIsKeyModalOpen(true)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setIsKeyModalOpen(false)
    showNotification(`Clave actualizada exitosamente para ${selectedUser?.nombres}.`)
  }

  const handleRegeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    setNewPassword(pass)
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.cedula.includes(searchTerm) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchRole = roleFilter ? u.rol === roleFilter : true
      const matchStatus = statusFilter ? u.estado === statusFilter : true

      return matchSearch && matchRole && matchStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 p-4 md:p-6 overflow-hidden relative">
      
      {/* Notificación Flotante */}
      {notification && (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
          {notification.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark flex items-center gap-2">
            <ShieldCheck className="text-brand-sage" size={28} /> Control de Accesos y Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra la nómina completa de usuarios, sus roles, credenciales y estados del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Buscar cédula, nombre, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:border-brand-sage" />
          </div>
        </div>
      </div>

      {/* PANEL PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden min-h-0">
        
        {/* Filtros Rapidos */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4 shrink-0 items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-gray-500 uppercase text-xs">Rol:</span>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border-gray-200 rounded-md text-sm outline-none bg-white px-2 py-1">
              <option value="">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Técnico">Técnico</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm border-l border-gray-200 pl-4">
            <span className="font-bold text-gray-500 uppercase text-xs">Estado:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border-gray-200 rounded-md text-sm outline-none bg-white px-2 py-1">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
          <div className="ml-auto text-xs font-bold text-gray-400">
            Mostrando {filteredUsers.length} registros
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-white sticky top-0 z-10 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Fecha / Hora</th>
                <th className="px-4 py-3 font-semibold">Usuario (Nombres y Apellidos)</th>
                <th className="px-4 py-3 font-semibold">Contacto (Email / Telf)</th>
                <th className="px-4 py-3 font-semibold text-center">Clave</th>
                <th className="px-4 py-3 font-semibold text-center">Rol / Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones y Permisos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Shield size={40} className="mx-auto mb-3 opacity-20" />
                    No se encontraron usuarios con esos filtros.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap align-top pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-gray-700 font-medium"><Calendar size={13} className="text-gray-400" /> {user.fecha_creacion}</span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock size={13} className="text-gray-400" /> {user.hora_creacion}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 text-[13px] uppercase">{user.apellidos}, {user.nombres}</span>
                        <span className="flex items-center gap-1.5 text-xs text-brand-sage font-mono font-bold"><Hash size={12}/> CI: {user.cedula}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top pt-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5 text-xs text-blue-600"><Mail size={12} /> {user.email}</span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-600"><Phone size={12} /> {user.telefono}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center align-top pt-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-lg font-black tracking-widest leading-none" title="Contraseña ofuscada por seguridad">••••••••</span>
                        <button onClick={() => openKeyModal(user)} className="text-[10px] uppercase font-bold text-brand-sage hover:text-brand-dark flex items-center gap-1 transition-colors">
                          <Key size={10} /> Cambiar Clave
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center align-top pt-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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
                      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[200px] mx-auto">
                        
                        {user.estado !== 'activo' && (
                          <button onClick={() => handleStatusChange(user.id, 'activo')} className="flex items-center gap-1 px-2 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded border border-emerald-200 transition-colors text-[10px] font-bold uppercase" title="Activar Acceso">
                            <Power size={12} /> Activar
                          </button>
                        )}

                        {user.estado === 'activo' && (
                          <button onClick={() => handleStatusChange(user.id, 'inactivo')} className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-500 hover:text-white rounded border border-gray-200 transition-colors text-[10px] font-bold uppercase" title="Desactivar Temporalmente">
                            <PowerOff size={12} /> Desactivar
                          </button>
                        )}

                        {user.estado !== 'bloqueado' && (
                          <button onClick={() => handleStatusChange(user.id, 'bloqueado')} className="flex items-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded border border-red-200 transition-colors text-[10px] font-bold uppercase" title="Bloquear Acceso (Por Seguridad)">
                            <Lock size={12} /> Bloquear
                          </button>
                        )}

                        <button onClick={() => handleDelete(user.id, user.nombres)} className="flex items-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded border border-red-200 transition-colors text-[10px] font-bold uppercase" title="Eliminar Registro">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CAMBIAR / REGENERAR CLAVE */}
      {isKeyModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Key size={18} /> Gestionar Clave</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-5 flex flex-col gap-4">
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 items-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black shrink-0">
                  {selectedUser.nombres.charAt(0)}{selectedUser.apellidos.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800 leading-tight">{selectedUser.nombres} {selectedUser.apellidos}</div>
                  <div className="text-xs text-gray-500">{selectedUser.email}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nueva Clave</label>
                <div className="flex gap-2">
                  <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Escribe o regenera..." className="flex-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-brand-sage font-mono text-sm" required minLength={6} />
                  <button type="button" onClick={handleRegeneratePassword} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300 transition-colors" title="Generar Clave Segura">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Usa el botón derecho para autogenerar una clave fuerte y segura.</p>
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsKeyModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold bg-brand-sage text-white hover:bg-brand-dark rounded transition-colors">Guardar y Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
