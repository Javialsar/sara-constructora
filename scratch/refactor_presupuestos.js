const fs = require('fs');

let c = fs.readFileSync('src/app/admin/presupuestos_reales/page.tsx', 'utf-8');

// Add imports
if (!c.includes('import { useQuery, useMutation, useQueryClient }')) {
  c = c.replace('import React, { useState, useEffect } from "react"', 
    'import React, { useState, useEffect } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";\nimport * as z from "zod";');
}

// Add Schema
const schemaStr = `
const presupuestoSchema = z.object({
  nombre_proyecto: z.string().min(2, "Seleccione un proyecto"),
  porcentaje_admin: z.number().min(0, "Mínimo 0"),
  porcentaje_imprevistos: z.number().min(0, "Mínimo 0"),
  porcentaje_utilidad: z.number().min(0, "Mínimo 0"),
  estado: z.string().default('Borrador')
});
type PresupuestoFormValues = z.infer<typeof presupuestoSchema>;
`;
if (!c.includes('const presupuestoSchema')) {
  c = c.replace('export default function PresupuestosRealesPage() {', schemaStr + '\nexport default function PresupuestosRealesPage() {');
}

// Inject useQueryClient
c = c.replace('const supabase = createClient()', 'const supabase = createClient()\n  const queryClient = useQueryClient();');

// Replace fetch logic with React Query hooks
const manualFetchProyectos = `  const fetchProyectosCRM = async () => {
    const { data } = await supabase.from('proyectos').select('id, nombre, cliente:clientes(nombre, apellido)').order('created_at', { ascending: false })
    if (data) setProyectosCRM(data)
  }`;

const rqHooks = `
  const { data: presupuestos = [] } = useQuery({
    queryKey: ['presupuestos'],
    queryFn: async () => {
      const { data } = await supabase.from('presupuestos_reales').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: proyectosCRM = [] } = useQuery({
    queryKey: ['proyectosCRM'],
    queryFn: async () => {
      const { data } = await supabase.from('proyectos').select('id, nombre, cliente:clientes(nombre, apellido)').order('created_at', { ascending: false });
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (values: PresupuestoFormValues) => {
      const { data, error } = await supabase.from('presupuestos_reales').insert([values]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      setIsNewModalOpen(false);
      openEditor(data);
      resetNewForm();
    }
  });

  const { register: registerNew, handleSubmit: handleNewSubmit, reset: resetNewForm, formState: { errors: newErrors, isSubmitting: isNewSubmitting } } = useForm<PresupuestoFormValues>({
    resolver: zodResolver(presupuestoSchema),
    defaultValues: { nombre_proyecto: '', porcentaje_admin: 10.0, porcentaje_imprevistos: 5.0, porcentaje_utilidad: 10.0, estado: 'Borrador' }
  });

  const submitNewPresupuesto = (data: PresupuestoFormValues) => {
    createMutation.mutate(data);
  };
`;

// Remove manual states and replace with hooks
c = c.replace('const [presupuestos, setPresupuestos] = useState([])', '');
c = c.replace('const [proyectosCRM, setProyectosCRM] = useState([])', '');
c = c.replace(manualFetchProyectos, '');
c = c.replace(`  const fetchPresupuestos = async () => {
    const { data } = await supabase.from('presupuestos_reales').select('*').order('created_at', { ascending: false })
    if (data) setPresupuestos(data)
  }`, '');

// Inject hook right before generate functions or at top
c = c.replace('const [searchPresupuesto, setSearchPresupuesto] = useState("")', 'const [searchPresupuesto, setSearchPresupuesto] = useState("")\n' + rqHooks);

// Clean up useEffect
c = c.replace(`  useEffect(() => {
    fetchPresupuestos()
    fetchProyectosCRM()
  }, [])`, `  useEffect(() => {
    // queries handled by react-query
  }, [])`);

// Update the handleDeletePresupuesto to use invalidate
c = c.replace(`  const handleDeletePresupuesto = async (id, e) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este presupuesto?")) return
    await supabase.from('presupuestos_reales').delete().eq('id', id)
    fetchPresupuestos()
  }`, `  const handleDeletePresupuesto = async (id: any, e: any) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este presupuesto?")) return
    await supabase.from('presupuestos_reales').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
  }`);

// Finally replace the JSX Form
const oldFormRegex = /<form onSubmit=\{handleCreatePresupuesto\} className="p-6 space-y-4">[\s\S]*?<\/form>/;
const newForm = `<form onSubmit={handleNewSubmit(submitNewPresupuesto)} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Proyecto</label>
                  <select {...registerNew("nombre_proyecto")} className={\`w-full border rounded p-2 \${newErrors.nombre_proyecto ? 'border-red-500' : ''}\`}>
                    <option value="" disabled>-- Seleccione --</option>
                    {proyectosCRM.map((p: any) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                  {newErrors.nombre_proyecto && <p className="text-red-500 text-xs">{newErrors.nombre_proyecto.message}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold">ADMIN (%)</label>
                    <input type="number" step="0.01" {...registerNew("porcentaje_admin", { valueAsNumber: true })} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold">IMPREV (%)</label>
                    <input type="number" step="0.01" {...registerNew("porcentaje_imprevistos", { valueAsNumber: true })} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold">UTILIDAD (%)</label>
                    <input type="number" step="0.01" {...registerNew("porcentaje_utilidad", { valueAsNumber: true })} className="w-full border rounded p-2" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-5 py-2 font-bold text-gray-500">Cancelar</button>
                  <button type="submit" disabled={isNewSubmitting || createMutation.isPending} className="px-5 py-2 font-bold bg-brand-dark text-white rounded">
                    {createMutation.isPending ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>`;

c = c.replace(oldFormRegex, newForm);

fs.writeFileSync('src/app/admin/presupuestos_reales/page.tsx', c);
