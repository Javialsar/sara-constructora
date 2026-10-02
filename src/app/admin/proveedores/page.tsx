"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Edit, Trash2, Building2, Loader2, X, Briefcase, BookOpen, Upload } from "lucide-react";

const supabase = createClient();

// 1. Zod Schema para validación estricta
const proveedorSchema = z.object({
  razon_social: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  ruc: z.string().optional(),
  dias_credito: z.number().min(0, "No puede ser negativo"),
  contacto_vendedor: z.string().optional(),
  telefono: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Correo inválido")]).optional(),
  sitio_web: z.union([z.literal(""), z.string().url("URL inválida")]).optional(),
  logo_url: z.string().optional(),
});

type ProveedorFormValues = z.infer<typeof proveedorSchema>;

export default function ProveedoresPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 2. Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      razon_social: "",
      ruc: "",
      dias_credito: 0,
      contacto_vendedor: "",
      telefono: "",
      email: "",
      sitio_web: "",
      logo_url: "",
    },
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  // 3. React Query: Fetching
  const { data: proveedores = [], isLoading } = useQuery({
    queryKey: ["proveedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .order("razon_social", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 4. React Query: Mutations (Create/Update)
  const saveMutation = useMutation({
    mutationFn: async (values: ProveedorFormValues) => {
      // Validar duplicados (Regla estricta del cliente)
      const query = supabase.from("proveedores").select("id").ilike("razon_social", values.razon_social);
      if (editingId) query.neq("id", editingId);
      const { data: existing } = await query;
      
      if (existing && existing.length > 0) {
        throw new Error("Ya existe un proveedor con este nombre exacto.");
      }

      if (editingId) {
        const { error } = await supabase.from("proveedores").update(values).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("proveedores").insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proveedores"] });
      closeModal();
    },
    onError: (err: Error) => {
      setError("razon_social", { type: "manual", message: err.message });
    }
  });

  // 5. React Query: Mutations (Delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("proveedores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proveedores"] });
    }
  });

  const filteredProveedores = proveedores.filter((p) =>
    p.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ruc && p.ruc.includes(searchTerm)) ||
    (p.contacto_vendedor && p.contacto_vendedor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('sara-assets')
        .upload(`proveedores/${fileName}`, file, { cacheControl: '3600', upsert: false });
      
      if (error) throw error;
      
      const { data } = supabase.storage.from('sara-assets').getPublicUrl(`proveedores/${fileName}`);
      setValue('logo_url', data.publicUrl);
    } catch (err: any) {
      alert("Error subiendo logotipo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    reset({
      razon_social: "", ruc: "", dias_credito: 0, contacto_vendedor: "", telefono: "", email: "", sitio_web: "", logo_url: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (prov: any) => {
    setEditingId(prov.id);
    reset({
      razon_social: prov.razon_social,
      ruc: prov.ruc || "",
      dias_credito: prov.dias_credito || 0,
      contacto_vendedor: prov.contacto_vendedor || "",
      telefono: prov.telefono || "",
      email: prov.email || "",
      sitio_web: prov.sitio_web || "",
      logo_url: prov.logo_url || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro que desea eliminar este proveedor?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = (data: ProveedorFormValues) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="p-6 md:p-10 w-full min-h-screen bg-gray-50/50">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Building2 className="text-brand-sage" size={32} />
            Directorio de Proveedores
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Gestione proveedores, días de crédito y contactos asociados a los insumos.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-brand-sage text-white font-semibold py-2.5 px-6 rounded-xl hover:shadow-md hover:bg-brand-dark transition-all flex items-center gap-2 h-fit"
        >
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/80">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por empresa, RUC o contacto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-sage/20 focus:border-brand-sage outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center text-gray-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : filteredProveedores.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-lg font-medium">No se encontraron proveedores</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-[11px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-24">Logo</th>
                  <th className="px-6 py-4">Razón Social</th>
                  <th className="px-6 py-4">RUC / NIT</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Teléfono / Correo</th>
                  <th className="px-6 py-4 text-center">Crédito</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProveedores.map((prov) => (
                  <tr key={prov.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      {prov.logo_url ? (
                        <div className="h-12 w-24 flex items-center justify-start">
                          <Image src={prov.logo_url} alt="Logo" width={96} height={48} className="h-10 w-auto max-w-[100px] object-contain mix-blend-multiply" unoptimized={true} />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <Building2 size={20} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{prov.razon_social}</div>
                      {prov.sitio_web && (
                        <a href={prov.sitio_web} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          {prov.sitio_web.replace('https://', '')}
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{prov.ruc || "-"}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{prov.contacto_vendedor || "-"}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{prov.telefono || "-"}</div>
                      <div className="text-[11px] text-slate-400">{prov.email}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prov.dias_credito > 0 ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/20' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'}`}>
                        {prov.dias_credito > 0 ? `${prov.dias_credito} días` : 'Contado'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => window.location.href=`/admin/proveedores/${prov.id}`} className="p-2 text-slate-400 hover:text-brand-sage hover:bg-brand-sage/10 rounded-lg transition-all" title="Ver Catálogo">
                          <BookOpen size={16} />
                        </button>
                        <button onClick={() => handleEdit(prov)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(prov.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                <Briefcase className="text-brand-sage" size={20} />
                {editingId ? "Editar Proveedor" : "Registrar Proveedor"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="col-span-2 flex items-center gap-4 mb-2">
                  <div className="h-16 w-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm p-1 shrink-0">
                    {watch("logo_url") ? (
                      <Image src={watch("logo_url")!} alt="Logo" width={96} height={64} className="h-12 w-auto max-w-[100px] object-contain mix-blend-multiply" unoptimized />
                    ) : (
                      <Building2 size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logotipo de la Empresa</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingLogo} />
                      <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                        {uploadingLogo ? <Loader2 size={14} className="animate-spin text-brand-sage" /> : <Upload size={14} className="text-slate-500" />}
                        {uploadingLogo ? "Subiendo..." : "Subir Logotipo"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Razón Social <span className="text-red-500">*</span></label>
                  <input 
                    {...register("razon_social")}
                    placeholder="Ej. Materiales El Constructor"
                    className={`w-full border ${errors.razon_social ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-brand-sage'} rounded-xl px-4 py-2.5 focus:ring-2 outline-none transition-all shadow-sm`}
                  />
                  {errors.razon_social && <p className="text-red-500 text-xs mt-1 font-medium">{errors.razon_social.message as string}</p>}
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">RUC / NIT</label>
                  <input 
                    {...register("ruc")}
                    placeholder="0999999999001"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-sage outline-none transition-all shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Días de Crédito (0 = Contado)</label>
                  <input 
                    type="number"
                    {...register("dias_credito", { valueAsNumber: true })}
                    className={`w-full border ${errors.dias_credito ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-brand-sage'} rounded-xl px-4 py-2.5 focus:ring-2 outline-none transition-all shadow-sm`}
                  />
                  {errors.dias_credito && <p className="text-red-500 text-xs mt-1 font-medium">{errors.dias_credito.message as string}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contacto Comercial</label>
                  <input 
                    {...register("contacto_vendedor")}
                    placeholder="Nombre del vendedor"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-sage outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input 
                    {...register("telefono")}
                    placeholder="099 999 9999"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-sage outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input 
                    {...register("email")}
                    placeholder="ventas@empresa.com"
                    className={`w-full border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-brand-sage'} rounded-xl px-4 py-2.5 focus:ring-2 outline-none transition-all shadow-sm`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message as string}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dirección Web (Opcional)</label>
                  <input 
                    {...register("sitio_web")}
                    placeholder="https://www.empresa.com"
                    className={`w-full border ${errors.sitio_web ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-brand-sage'} rounded-xl px-4 py-2.5 focus:ring-2 outline-none transition-all shadow-sm`}
                  />
                  {errors.sitio_web && <p className="text-red-500 text-xs mt-1 font-medium">{errors.sitio_web.message as string}</p>}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || saveMutation.isPending}
                  className="px-5 py-2.5 bg-brand-sage text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {(isSubmitting || saveMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  {(isSubmitting || saveMutation.isPending) ? "Guardando..." : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
