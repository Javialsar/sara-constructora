'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Building2, 
  Key, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  HardHat, 
  Lock, 
  Unlock, 
  Sparkles,
  AlertTriangle,
  X,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  Trash2,
  Activity
} from 'lucide-react';
import { 
  ConstructoraEquipoService, 
  MiembroEquipoConstructora, 
  RolEquipoConstructora, 
  ROLES_CONFIG 
} from '@/lib/services/constructoraEquipoService';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';

export function EquipoAccesosSection({ user, planInfo }: { user: any; planInfo?: any }) {
  const [miembros, setMiembros] = useState<MiembroEquipoConstructora[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'tecnicos' | 'gestion' | 'clientes'>('todos');
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [showPasswordIds, setShowPasswordIds] = useState<Record<string, boolean>>({});

  // Formulario nuevo usuario
  const [formNuevo, setFormNuevo] = useState<{
    nombreCompleto: string;
    email: string;
    cedulaORuc: string;
    telefono: string;
    rol: RolEquipoConstructora;
    proyectoAsignado: string;
    claveProvisional: string;
  }>({
    nombreCompleto: '',
    email: '',
    cedulaORuc: '',
    telefono: '',
    rol: 'ingeniero_residente',
    proyectoAsignado: 'Torre SARA Loja (Pisos 1-8)',
    claveProvisional: 'Sara.2026*'
  });

  const recargarMiembros = () => {
    setMiembros(ConstructoraEquipoService.getMiembros());
  };

  useEffect(() => {
    recargarMiembros();
    const handleChanged = () => recargarMiembros();
    window.addEventListener('constructora_equipo_changed', handleChanged);
    return () => window.removeEventListener('constructora_equipo_changed', handleChanged);
  }, []);

  // Proyectos disponibles en la empresa
  const proyectosDisponibles = [
    'Torre SARA Loja (Pisos 1-8)',
    'Residencial Cariamanga Plaza',
    'Edificio Residencial El Mirador',
    'Conjunto Habitacional Las Acacias',
    'Todos los Proyectos (Multiobra)',
    'Administración Central / Matriz'
  ];

  // Filtrado de miembros
  const miembrosFiltrados = miembros.filter(m => {
    const matchSearch = 
      m.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cedulaORuc.includes(searchTerm) ||
      (m.proyectoAsignado && m.proyectoAsignado.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    if (filtroCategoria === 'tecnicos') {
      return ['ingeniero_residente', 'arquitecto_bim', 'tecnico_apoyo_obra'].includes(m.rol);
    }
    if (filtroCategoria === 'gestion') {
      return ['representante_legal', 'contador_constructora', 'bodeguero_constructora'].includes(m.rol);
    }
    if (filtroCategoria === 'clientes') {
      return m.rol === 'cliente_constructora';
    }

    return true;
  });

  const handleCopiarCredenciales = (m: MiembroEquipoConstructora) => {
    const texto = `=== CREDENCIALES DE ACCESO - SARA CONSTRUCTORA ===\nEmpresa: ${m.empresaRuc || 'Constructora Verificada'}\nUsuario: ${m.email}\nContraseña Provisional: ${m.claveProvisional || 'Sara.2026*'}\nRol Asignado: ${m.rolEtiqueta}\nProyecto: ${m.proyectoAsignado || 'General'}\nEnlace de Acceso: https://sara-constructora.vercel.app/constructora/auth`;
    navigator.clipboard.writeText(texto);
    setCopiadoId(m.id);
    setTimeout(() => setCopiadoId(null), 3000);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevo.nombreCompleto.trim() || !formNuevo.email.trim() || !formNuevo.cedulaORuc.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    ConstructoraEquipoService.crearMiembro({
      nombreCompleto: formNuevo.nombreCompleto.trim(),
      email: formNuevo.email.trim(),
      cedulaORuc: formNuevo.cedulaORuc.trim(),
      telefono: formNuevo.telefono.trim(),
      rol: formNuevo.rol,
      rolEtiqueta: ROLES_CONFIG[formNuevo.rol].etiqueta,
      proyectoAsignado: formNuevo.proyectoAsignado,
      claveProvisional: formNuevo.claveProvisional || `Sara.${Math.random().toString(36).substring(2, 6)}2026*`,
      estado: 'ACTIVO',
      ultimoAcceso: 'Pendiente primer inicio'
    });

    setModalNuevoUsuario(false);
    setFormNuevo({
      nombreCompleto: '',
      email: '',
      cedulaORuc: '',
      telefono: '',
      rol: 'ingeniero_residente',
      proyectoAsignado: 'Torre SARA Loja (Pisos 1-8)',
      claveProvisional: `Sara.${Math.random().toString(36).substring(2, 6)}2026*`
    });
    alert('¡Usuario registrado exitosamente en la constructora! Puede copiar sus credenciales para remitirlas al colaborador o cliente.');
  };

  const handleCambiarEstado = (id: string, actual: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO') => {
    const nuevo = actual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    ConstructoraEquipoService.cambiarEstado(id, nuevo);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Está seguro de revocar el acceso a "${nombre}"? Esta acción deshabilitará su inicio de sesión.`)) {
      ConstructoraEquipoService.eliminarMiembro(id);
    }
  };

  // Exportaciones oficiales
  const handleExportarExcel = () => {
    const datos = miembros.map(m => ({
      'ID Usuario': m.id,
      'Nombre Completo': m.nombreCompleto,
      'Correo Corporativo': m.email,
      'Cédula / RUC': m.cedulaORuc,
      'Teléfono': m.telefono,
      'Rol Operativo': m.rolEtiqueta,
      'Proyecto Asignado': m.proyectoAsignado || 'N/A',
      'Contraseña Provisional': m.claveProvisional || '',
      'Estado': m.estado,
      'Fecha Registro': m.fechaRegistro,
      'Último Acceso': m.ultimoAcceso || 'Sin registro'
    }));

    exportarAExcel(datos, 'Nomina_Equipo_Accesos_Constructora', 'Equipo Constructora', 'obras');
  };

  const handleExportarPdf = () => {
    const encabezados = ['ID', 'Nombre Completo', 'Email', 'Rol', 'Proyecto Asignado', 'Estado', 'Último Acceso'];
    const filas = miembros.map(m => [
      m.id,
      m.nombreCompleto,
      m.email,
      m.rolEtiqueta.substring(0, 24),
      (m.proyectoAsignado || 'General').substring(0, 22),
      m.estado,
      m.ultimoAcceso || 'Pendiente'
    ]);

    exportarAPDF(
      'NÓMINA OFICIAL DE EQUIPO & ACCESOS DE LA CONSTRUCTORA',
      encabezados,
      filas,
      'Nomina_Equipo_Accesos_Constructora',
      'Registro oficial de usuarios autorizados, roles delegados y clientes fiscalizadores • Módulo de Gobernanza SARA',
      'obras',
      [
        { etiqueta: 'Total Usuarios', valor: `${miembros.length} Registrados`, color: 'default' },
        { etiqueta: 'Equipo Técnico', valor: `${miembros.filter(m => ['ingeniero_residente', 'arquitecto_bim', 'tecnico_apoyo_obra'].includes(m.rol)).length} Profesionales`, color: 'default' },
        { etiqueta: 'Clientes de Obra', valor: `${miembros.filter(m => m.rol === 'cliente_constructora').length} Fiscalizadores`, color: 'success' },
        { etiqueta: 'Estado Empresa', valor: 'VERIFICADA POR GRUPO SARA', color: 'success' }
      ]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header con Resumen de Suscripción & Gobernanza */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 -skew-x-12 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <ShieldCheck size={14} />
              <span>Gobernanza RBAC Multi-Tenant • Representante Legal Titular</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Equipo & Accesos de la Constructora
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Registra y delega credenciales seguras para tus ingenieros, arquitectos, contadores, bodegueros y clientes de obra. Solo el cliente podrá ver el avance de su proyecto.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setModalNuevoUsuario(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>+ Registrar Usuario / Cliente</span>
            </button>

            <button
              onClick={handleExportarExcel}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Descargar nómina de usuarios en Excel"
            >
              <FileSpreadsheet size={15} />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportarPdf}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Descargar nómina oficial en PDF con firmas"
            >
              <FileText size={15} className="text-amber-400" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs de Capacidad del Plan Contratado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-6 font-mono text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">Usuarios Registrados:</span>
            <span className="text-lg font-bold text-white tabular-nums flex items-center gap-2">
              <span>{miembros.length} Miembros</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-sans">
                Plan Activo
              </span>
            </span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">Equipo Técnico & Obra:</span>
            <span className="text-lg font-bold text-blue-400 tabular-nums">
              {miembros.filter(m => ['ingeniero_residente', 'arquitecto_bim', 'tecnico_apoyo_obra'].includes(m.rol)).length} Profesionales
            </span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">Contabilidad & Bodega:</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {miembros.filter(m => ['contador_constructora', 'bodeguero_constructora'].includes(m.rol)).length} Operadores
            </span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-sans">Clientes de Obra (Avances):</span>
            <span className="text-lg font-bold text-teal-400 tabular-nums flex items-center gap-1.5">
              <span>{miembros.filter(m => m.rol === 'cliente_constructora').length} Clientes</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros & Búsqueda */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setFiltroCategoria('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroCategoria === 'todos'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos ({miembros.length})
          </button>

          <button
            onClick={() => setFiltroCategoria('tecnicos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroCategoria === 'tecnicos'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏗️ Equipo de Obra ({miembros.filter(m => ['ingeniero_residente', 'arquitecto_bim', 'tecnico_apoyo_obra'].includes(m.rol)).length})
          </button>

          <button
            onClick={() => setFiltroCategoria('gestion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroCategoria === 'gestion'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💼 Finanzas & Bodega ({miembros.filter(m => ['representante_legal', 'contador_constructora', 'bodeguero_constructora'].includes(m.rol)).length})
          </button>

          <button
            onClick={() => setFiltroCategoria('clientes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filtroCategoria === 'clientes'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏢 Clientes de Obra ({miembros.filter(m => m.rol === 'cliente_constructora').length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email, cédula..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* 3. Tabla de Miembros y Credenciales */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cuentas Registradas en la Constructora
            </h3>
            <p className="text-xs text-slate-400">
              Usuarios autorizados bajo la suscripción corporativa del Representante Legal.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {miembrosFiltrados.length} Registros Activos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                <th className="py-3 px-4 font-bold">Usuario / Colaborador</th>
                <th className="py-3 px-3 font-bold">Identificación / Contacto</th>
                <th className="py-3 px-3 font-bold">Rol Operativo & Permisos</th>
                <th className="py-3 px-3 font-bold">Proyecto Asignado</th>
                <th className="py-3 px-3 font-bold">Clave Provisional</th>
                <th className="py-3 px-3 font-bold text-center">Estado</th>
                <th className="py-3 px-3 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
              {miembrosFiltrados.map((m) => {
                const conf = ROLES_CONFIG[m.rol] || ROLES_CONFIG.tecnico_apoyo_obra;
                const isPasswordVisible = showPasswordIds[m.id];
                const isCopied = copiadoId === m.id;
                const isCliente = m.rol === 'cliente_constructora';

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* Nombre y Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{conf.icon}</span>
                        <span>{m.nombreCompleto}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {m.email}
                      </span>
                    </td>

                    {/* Cédula y Teléfono */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <div>CI/RUC: {m.cedulaORuc}</div>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        Tel: {m.telefono || 'Sin teléfono'}
                      </span>
                    </td>

                    {/* Rol y Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${conf.badge}`}>
                        {m.rolEtiqueta}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1" title={conf.descripcionAcceso}>
                        {isCliente ? '🔒 Solo Avance de Obra (Costos Ocultos)' : conf.descripcionAcceso}
                      </span>
                    </td>

                    {/* Proyecto Asignado */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1">
                        <Building2 size={13} className="text-amber-500 shrink-0" />
                        <span className="truncate max-w-[170px]" title={m.proyectoAsignado}>
                          {m.proyectoAsignado || 'General'}
                        </span>
                      </div>
                    </td>

                    {/* Contraseña Provisional */}
                    <td className="py-3.5 px-3 font-mono text-xs">
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 max-w-[170px]">
                        <span className="truncate">
                          {isPasswordVisible ? (m.claveProvisional || 'Sara.2026*') : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(m.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0 cursor-pointer"
                          title={isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                        >
                          {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(m.id, m.estado)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                          m.estado === 'ACTIVO'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 hover:bg-rose-200'
                        }`}
                        title="Click para alternar estado"
                      >
                        {m.estado === 'ACTIVO' ? '🟢 Activo' : '🔴 Inactivo'}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopiarCredenciales(m)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700'
                          }`}
                          title="Copiar invitación con credenciales para enviar al usuario"
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          <span className="text-[10px] hidden sm:inline">{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEliminar(m.id, m.nombreCompleto)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Revocar acceso"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 font-sans">
          <span>
            🛡️ Los accesos son gestionados por el <strong>Representante Legal</strong>. El cliente solo visualiza el avance físico de su obra sin costo de adquisición.
          </span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {miembros.length} Cuentas Habilitadas
          </span>
        </div>
      </div>

      {/* 4. MODAL: REGISTRAR NUEVO MIEMBRO O CLIENTE */}
      {modalNuevoUsuario && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            
            <button
              onClick={() => setModalNuevoUsuario(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Registrar Colaborador o Cliente
                </h3>
                <p className="text-xs text-slate-400">
                  Crea una cuenta oficial para acceder a tu entorno de constructora.
                </p>
              </div>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs font-sans">
              
              {/* Rol */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Rol y Permisos en la Constructora:
                </label>
                <select
                  value={formNuevo.rol}
                  onChange={(e) => setFormNuevo({ ...formNuevo, rol: e.target.value as RolEquipoConstructora })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ingeniero_residente">🏗️ Ingeniero Residente (Obras, Cuadrillas, Vales)</option>
                  <option value="arquitecto_bim">📐 Arquitecto BIM (Visor 3D IFC, Planos)</option>
                  <option value="contador_constructora">💼 Contador(a) Tributario (3-Way Match SRI, Facturas)</option>
                  <option value="bodeguero_constructora">📦 Bodeguero de Obra (Kardex, Recepciones, Despachos)</option>
                  <option value="tecnico_apoyo_obra">🛠️ Técnico de Apoyo (Tareo Campo, Topografía)</option>
                  <option value="cliente_constructora">🏢 Cliente de Obra (SOLO Supervisión de Avance)</option>
                </select>

                {formNuevo.rol === 'cliente_constructora' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 text-[11px] text-teal-800 dark:text-teal-300">
                    🔒 <strong>Segregación Activa:</strong> Esta cuenta tendrá acceso <strong>exclusivo</strong> al módulo de <em>"Mi Avance de Obra"</em>. No tendrá acceso a Kardex, compras, nóminas ni contabilidad.
                  </div>
                )}
              </div>

              {/* Nombre Completo */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  required
                  value={formNuevo.nombreCompleto}
                  onChange={(e) => setFormNuevo({ ...formNuevo, nombreCompleto: e.target.value })}
                  placeholder="Ej: Ing. Marco Antonio Paredes o Dr. Carlos Vélez"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Email & Cédula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Correo Corporativo / Acceso:
                  </label>
                  <input
                    type="email"
                    required
                    value={formNuevo.email}
                    onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                    placeholder="usuario@empresa.ec"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cédula o RUC:
                  </label>
                  <input
                    type="text"
                    required
                    value={formNuevo.cedulaORuc}
                    onChange={(e) => setFormNuevo({ ...formNuevo, cedulaORuc: e.target.value })}
                    placeholder="1103849182"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Teléfono & Proyecto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Teléfono Móvil:
                  </label>
                  <input
                    type="tel"
                    value={formNuevo.telefono}
                    onChange={(e) => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
                    placeholder="099 123 4567"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Proyecto Asignado:
                  </label>
                  <select
                    value={formNuevo.proyectoAsignado}
                    onChange={(e) => setFormNuevo({ ...formNuevo, proyectoAsignado: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    {proyectosDisponibles.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contraseña Provisional */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contraseña Provisional (Entregar al usuario):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formNuevo.claveProvisional}
                    onChange={(e) => setFormNuevo({ ...formNuevo, claveProvisional: e.target.value })}
                    className="w-full px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    El usuario podrá ingresar con este email y contraseña en <span className="font-mono">/constructora/auth</span>.
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNuevoUsuario(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={15} />
                  <span>Guardar y Habilitar Acceso</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
