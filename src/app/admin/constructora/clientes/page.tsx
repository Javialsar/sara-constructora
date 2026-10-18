'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Building2, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  FileSpreadsheet, 
  FileText, 
  X,
  CreditCard,
  HardHat,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  ConstructoraAdminService, 
  ClienteSuscritoConstructora, 
  PlanConstructora 
} from '@/lib/services/constructoraAdminService';
import { ConstructoraSubscriptionService } from '@/lib/services/constructoraSubscriptionService';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';

export default function AdminConstructoraClientesPage() {
  const [clientes, setClientes] = useState<ClienteSuscritoConstructora[]>([]);
  const [planes, setPlanes] = useState<PlanConstructora[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [selectedPlan, setSelectedPlan] = useState<string>('TODOS');

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalDetalle, setModalDetalle] = useState<ClienteSuscritoConstructora | null>(null);
  const [editingCliente, setEditingCliente] = useState<ClienteSuscritoConstructora | null>(null);

  // Formulario State
  const [formData, setFormData] = useState<Partial<ClienteSuscritoConstructora>>({
    razonSocialOProfesional: '',
    tipoPerfil: 'Ingeniero Civil',
    rucOCedula: '',
    email: '',
    telefono: '',
    ciudad: 'Loja',
    planId: 'PLAN-CONST-02',
    planNombre: 'Plan Constructora Pro / PyME',
    cicloFacturacion: 'MENSUAL',
    montoCobrado: 79.00,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'ACTIVO',
    proyectosEnUso: 1,
    usuariosEnUso: 2,
    notasAdmin: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setClientes(ConstructoraAdminService.getClientes());
    setPlanes(ConstructoraAdminService.getPlanes());
  };

  // KPIs
  const totalClientes = clientes.length;
  const activos = clientes.filter(c => c.estado === 'ACTIVO').length;
  const pendientes = clientes.filter(c => c.estado === 'PENDIENTE_PAGO').length;
  const mrrEstimado = clientes
    .filter(c => c.estado === 'ACTIVO')
    .reduce((acc, c) => acc + (c.cicloFacturacion === 'ANUAL' ? c.montoCobrado / 12 : c.montoCobrado), 0);

  // Filtrado
  const clientesFiltrados = clientes.filter(c => {
    const matchSearch = 
      c.razonSocialOProfesional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rucOCedula.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ciudad.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = selectedEstado === 'TODOS' || c.estado === selectedEstado;
    const matchPlan = selectedPlan === 'TODOS' || c.planId === selectedPlan;

    return matchSearch && matchEstado && matchPlan;
  });

  // Handlers
  const handleAbrirNuevo = () => {
    setEditingCliente(null);
    setFormData({
      razonSocialOProfesional: '',
      tipoPerfil: 'Ingeniero Civil',
      rucOCedula: '',
      email: '',
      telefono: '',
      ciudad: 'Loja',
      planId: planes[1]?.id || 'PLAN-CONST-02',
      planNombre: planes[1]?.nombre || 'Plan Constructora Pro / PyME',
      cicloFacturacion: 'MENSUAL',
      montoCobrado: planes[1]?.precioMensual || 79.00,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'ACTIVO',
      proyectosEnUso: 1,
      usuariosEnUso: 1,
      notasAdmin: '',
    });
    setModalFormOpen(true);
  };

  const handleEditar = (cli: ClienteSuscritoConstructora) => {
    setEditingCliente(cli);
    setFormData({ ...cli });
    setModalFormOpen(true);
  };

  const handleGuardarForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razonSocialOProfesional || !formData.email || !formData.rucOCedula) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const planSeleccionado = planes.find(p => p.id === formData.planId);

    const clienteGuardar: ClienteSuscritoConstructora = {
      id: editingCliente?.id || `CLI-CONST-${Date.now().toString().slice(-4)}`,
      razonSocialOProfesional: formData.razonSocialOProfesional!,
      tipoPerfil: formData.tipoPerfil as any,
      rucOCedula: formData.rucOCedula!,
      email: formData.email!,
      telefono: formData.telefono || 'Sin teléfono',
      ciudad: formData.ciudad || 'Ecuador',
      planId: formData.planId || 'PLAN-CONST-02',
      planNombre: planSeleccionado ? planSeleccionado.nombre : (formData.planNombre || 'Plan Pro'),
      cicloFacturacion: formData.cicloFacturacion as any,
      montoCobrado: Number(formData.montoCobrado) || (planSeleccionado ? planSeleccionado.precioMensual : 79),
      fechaInicio: formData.fechaInicio!,
      fechaVencimiento: formData.fechaVencimiento!,
      estado: formData.estado as any,
      proyectosEnUso: Number(formData.proyectosEnUso) || 1,
      usuariosEnUso: Number(formData.usuariosEnUso) || 1,
      notasAdmin: formData.notasAdmin || '',
    };

    ConstructoraAdminService.saveCliente(clienteGuardar);
    cargarDatos();
    setModalFormOpen(false);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el registro de suscripción de "${nombre}"?`)) {
      ConstructoraAdminService.deleteCliente(id);
      cargarDatos();
    }
  };

  const handleActivarPorAdmin = (id: string, nombre: string) => {
    if (confirm(`¿Aprobar y activar suscripción oficial para "${nombre}"?\nEl periodo inicia hoy y tendrá acceso completo e inmediato a todos los módulos de la constructora.`)) {
      ConstructoraSubscriptionService.activarPlanPorAdmin(id);
      cargarDatos();
    }
  };

  const handleCambiarEstadoRapido = (id: string, nuevoEstado: any) => {
    ConstructoraSubscriptionService.cambiarEstadoPorAdmin(id, nuevoEstado);
    cargarDatos();
  };

  // Exportar Excel
  const handleExportExcel = () => {
    const data = clientesFiltrados.map(c => ({
      'ID Suscripción': c.id,
      'Cliente / Razón Social': c.razonSocialOProfesional,
      'Perfil Profesional': c.tipoPerfil,
      'RUC / Cédula': c.rucOCedula,
      'Correo Electrónico': c.email,
      'Teléfono': c.telefono,
      'Ciudad': c.ciudad,
      'Plan Contratado': c.planNombre,
      'Ciclo Facturación': c.cicloFacturacion,
      'Monto Cobrado ($)': `$${c.montoCobrado.toFixed(2)}`,
      'Fecha Inicio': c.fechaInicio,
      'Fecha Vencimiento': c.fechaVencimiento,
      'Estado': c.estado,
      'Obras en Uso': c.proyectosEnUso,
      'Usuarios': c.usuariosEnUso,
      'Notas': c.notasAdmin || ''
    }));
    exportarAExcel(data, 'Clientes_Suscritos_SARA_Constructora', 'Clientes Constructora');
  };

  // Exportar PDF
  const handleExportPDF = () => {
    const headers = ['ID', 'Cliente', 'RUC/CI', 'Plan', 'Ciclo', 'Monto', 'Vencimiento', 'Estado'];
    const rows = clientesFiltrados.map(c => [
      c.id,
      c.razonSocialOProfesional,
      c.rucOCedula,
      c.planNombre,
      c.cicloFacturacion,
      `$${c.montoCobrado.toFixed(2)}`,
      c.fechaVencimiento,
      c.estado
    ]);

    exportarAPDF(
      'REPORTE OFICIAL: CLIENTES SUSCRITOS A SARA-CONSTRUCTORA',
      headers,
      rows,
      'Reporte_Clientes_Suscritos_Constructora',
      `Total Clientes: ${clientesFiltrados.length} • MRR Activo: $${mrrEstimado.toFixed(2)} USD • Fecha: ${new Date().toLocaleDateString('es-EC')}`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-600">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              ADMINISTRADOR • GESTIÓN CONSTRUCTORA
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <UserCheck className="text-emerald-600" size={26} />
            <span>Clientes Suscritos a SARA-CONSTRUCTORA</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Control integral de empresas constructoras, ingenieros y contratistas con suscripciones activas al ecosistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Exportar listado a Excel"
          >
            <FileSpreadsheet size={15} />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-xs hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Exportar reporte formal en PDF"
          >
            <FileText size={15} />
            <span>PDF</span>
          </button>
          <button 
            onClick={handleAbrirNuevo}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Registrar Cliente</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Clientes</span>
            <Users size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{totalClientes}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Empresas & Profesionales</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Suscripciones Activas</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{activos}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Acceso pleno al ecosistema</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">MRR Recurrente</span>
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            ${mrrEstimado.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ingreso mensualizado USD</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Por Cobrar / Pendientes</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">{pendientes}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Requieren validación o pago</span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, RUC, correo o ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Estado:</span>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="PENDIENTE_PAGO">Pendientes de Pago</option>
              <option value="SUSPENDIDO">Suspendidos</option>
              <option value="VENCIDO">Vencidos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Plan:</span>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="TODOS">Todos los Planes</option>
              {planes.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal de Clientes Suscritos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-semibold">Cliente / Razón Social</th>
                <th className="py-3 px-4 font-semibold">Perfil Profesional</th>
                <th className="py-3 px-4 font-semibold">Plan Contratado</th>
                <th className="py-3 px-3 font-semibold text-right">Facturación</th>
                <th className="py-3 px-3 font-semibold text-center">Uso de Obras</th>
                <th className="py-3 px-3 font-semibold">Vencimiento</th>
                <th className="py-3 px-3 font-semibold text-center">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron clientes suscritos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cli) => {
                  const estadoBadge = {
                    ACTIVO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
                    PENDIENTE_PAGO: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
                    SUSPENDIDO: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
                    VENCIDO: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300',
                  }[cli.estado];

                  return (
                    <tr key={cli.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {cli.razonSocialOProfesional}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>RUC/CI: {cli.rucOCedula}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {cli.ciudad}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <HardHat size={12} className="text-amber-500" />
                          {cli.tipoPerfil}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <CreditCard size={13} className="text-emerald-500" />
                          <span>{cli.planNombre}</span>
                        </div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          Ciclo: {cli.cicloFacturacion}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        ${cli.montoCobrado.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-normal block font-sans">
                          {cli.cicloFacturacion === 'ANUAL' ? '/año' : '/mes'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {cli.proyectosEnUso} Obras
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {cli.usuariosEnUso} usuarios
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        <div>{cli.fechaVencimiento}</div>
                        <span className="text-[10px] text-slate-400">Desde: {cli.fechaInicio}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${estadoBadge}`}>
                          {cli.estado}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {cli.estado !== 'ACTIVO' ? (
                          <button
                            onClick={() => handleActivarPorAdmin(cli.id, cli.razonSocialOProfesional)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm cursor-pointer transition-all"
                            title="Aprobar pago y activar mes/año de servicio a partir de HOY"
                          >
                            <ShieldCheck size={12} />
                            <span>Aprobar & Activar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarEstadoRapido(cli.id, 'VENCIDO')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-[10px] cursor-pointer transition-all"
                            title="Marcar como VENCIDO (para probar bloqueo de acceso)"
                          >
                            <Clock size={11} />
                            <span>Vencer</span>
                          </button>
                        )}
                        <button
                          onClick={() => setModalDetalle(cli)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                          title="Ver Expediente de Suscripción"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEditar(cli)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                          title="Editar Datos & Plan"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleEliminar(cli.id, cli.razonSocialOProfesional)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-pointer"
                          title="Eliminar Registro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: FORMULARIO REGISTRAR / EDITAR CLIENTE SUSCRITO               */}
      {/* ==================================================================== */}
      {modalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingCliente ? 'Editar Cliente Suscrito' : 'Registrar Nuevo Cliente en SARA-CONSTRUCTORA'}
                  </h3>
                  <p className="text-xs text-slate-400">Asignación de plan SaaS, vigencia y control de accesos técnicos.</p>
                </div>
              </div>
              <button 
                onClick={() => setModalFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Cliente / Razón Social: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.razonSocialOProfesional}
                    onChange={(e) => setFormData(prev => ({ ...prev, razonSocialOProfesional: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                    placeholder="Ej: Constructora San Antonio Cía. Ltda."
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    RUC o Cédula: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rucOCedula}
                    onChange={(e) => setFormData(prev => ({ ...prev, rucOCedula: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                    placeholder="1103849182001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Tipo de Perfil:
                  </label>
                  <select
                    value={formData.tipoPerfil}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, tipoPerfil: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Ingeniero Civil">Ingeniero Civil</option>
                    <option value="Arquitecto">Arquitecto</option>
                    <option value="Constructora / Contratista">Constructora / Contratista</option>
                    <option value="Técnico de Apoyo">Técnico de Apoyo</option>
                    <option value="Empresa Inmobiliaria">Empresa Inmobiliaria</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Correo Electrónico: *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="gerencia@constructora.ec"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Teléfono / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="099 123 4567"
                  />
                </div>
              </div>

              {/* Selección del Plan SaaS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="sm:col-span-2">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Plan de SARA-CONSTRUCTORA:
                  </label>
                  <select
                    value={formData.planId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const plan = planes.find(p => p.id === pId);
                      setFormData(prev => ({
                        ...prev,
                        planId: pId,
                        planNombre: plan?.nombre || '',
                        montoCobrado: prev.cicloFacturacion === 'ANUAL' ? (plan?.precioAnual || 0) : (plan?.precioMensual || 0)
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    {planes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (${p.precioMensual}/mes o ${p.precioAnual}/año)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Ciclo de Facturación:
                  </label>
                  <select
                    value={formData.cicloFacturacion}
                    onChange={(e: any) => {
                      const ciclo = e.target.value;
                      const plan = planes.find(p => p.id === formData.planId);
                      setFormData(prev => ({
                        ...prev,
                        cicloFacturacion: ciclo,
                        montoCobrado: ciclo === 'ANUAL' ? (plan?.precioAnual || 0) : (plan?.precioMensual || 0)
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="MENSUAL">Mensual</option>
                    <option value="ANUAL">Anual (Ahorro)</option>
                  </select>
                </div>
              </div>

              {/* Vigencia y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Fecha de Inicio:
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Fecha de Vencimiento:
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaVencimiento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Estado de la Suscripción:
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e: any) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVO">ACTIVO (Acceso Concedido)</option>
                    <option value="PENDIENTE_PAGO">PENDIENTE DE PAGO</option>
                    <option value="SUSPENDIDO">SUSPENDIDO</option>
                    <option value="VENCIDO">VENCIDO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                  Notas Administrativas & Registro de Pagos:
                </label>
                <textarea
                  rows={2}
                  value={formData.notasAdmin}
                  onChange={(e) => setFormData(prev => ({ ...prev, notasAdmin: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Detalles de facturas emitidas, número de comprobante, observaciones..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {editingCliente ? 'Guardar Cambios' : 'Registrar Suscripción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: DETALLE / EXPEDIENTE DE CLIENTE SUSCRITO                     */}
      {/* ==================================================================== */}
      {modalDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                  EXPEDIENTE DE SUSCRIPCIÓN SAAS
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {modalDetalle.razonSocialOProfesional}
                </h3>
              </div>
              <button 
                onClick={() => setModalDetalle(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">RUC / Cédula:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{modalDetalle.rucOCedula}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Perfil Profesional:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{modalDetalle.tipoPerfil}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Correo Electrónico:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{modalDetalle.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px]">Teléfono / WhatsApp:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{modalDetalle.telefono}</span>
              </div>
            </div>

            {/* Tarjeta del Plan */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  Plan Activo Contratado
                </span>
                <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                  {modalDetalle.planNombre}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Ciclo: <strong>{modalDetalle.cicloFacturacion}</strong> • Vence: <strong>{modalDetalle.fechaVencimiento}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${modalDetalle.montoCobrado.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-600 block">USD</span>
              </div>
            </div>

            {/* Obras y Usuarios en Consumo */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Obras Simultáneas Activas</span>
                <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                  {modalDetalle.proyectosEnUso}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Usuarios / Cuadrillas Activas</span>
                <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                  {modalDetalle.usuariosEnUso}
                </span>
              </div>
            </div>

            {modalDetalle.notasAdmin && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong className="block text-[10px] uppercase text-slate-400 font-mono mb-0.5">Notas del Administrador:</strong>
                {modalDetalle.notasAdmin}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {modalDetalle.estado === 'ACTIVO' ? (
                  <button
                    onClick={() => {
                      handleCambiarEstadoRapido(modalDetalle.id, 'SUSPENDIDO');
                      setModalDetalle(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold text-xs border border-rose-300 hover:bg-rose-100 cursor-pointer"
                  >
                    Suspender Acceso
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivarPorAdmin(modalDetalle.id, modalDetalle.razonSocialOProfesional);
                      setModalDetalle(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} />
                    <span>Aprobar & Activar (Inicia Hoy)</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setModalDetalle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
