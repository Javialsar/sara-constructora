const fs = require('fs');
let c = fs.readFileSync('src/app/admin/apus/insumos/page.tsx', 'utf-8');

if (!c.includes('useQuery')) {
  c = c.replace('import { useState, useEffect } from "react"', 
    'import { useState, useEffect } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";\nimport * as z from "zod";');
}

const schemaStr = `
const insumoSchema = z.object({
  codigo: z.string(),
  nombre: z.string().min(3, "Requerido"),
  descripcion: z.string().optional(),
  unidad: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  precio_sin_iva: z.number().min(0, "No negativo"),
  proveedor_id: z.string().nullable().optional(),
  proveedores_ids: z.array(z.string()).optional(),
  subfamilia_id: z.string().nullable().optional(),
  categoria: z.string().optional()
});
type InsumoFormValues = z.infer<typeof insumoSchema>;
`;

if (!c.includes('const insumoSchema')) {
  c = c.replace('export default function InsumosPage() {', schemaStr + '\nexport default function InsumosPage() {');
}

c = c.replace('export default function InsumosPage() {\n  const supabase = createClient()', 'export default function InsumosPage() {\n  const supabase = createClient()\n  const queryClient = useQueryClient();');

// State replacements
const manualState = 'const [insumos, setInsumos] = useState<Insumo[]>([])\n  const [familias, setFamilias] = useState<Familia[]>([])\n  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([])\n  const [proveedores, setProveedores] = useState<Proveedor[]>([])\n  const [insumoProvMap, setInsumoProvMap] = useState<Record<string, string[]>>({})\n  const [loading, setLoading] = useState(true)';

const rqHooks = `  const { data: insumos = [], isLoading: loading } = useQuery({
    queryKey: ['insumos'],
    queryFn: async () => {
      const data = await fetchAll('insumos', 'nombre');
      return data || [];
    }
  });
  
  const [familias, setFamilias] = useState<Familia[]>([])
  const [subfamilias, setSubfamilias] = useState<Subfamilia[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [insumoProvMap, setInsumoProvMap] = useState<Record<string, string[]>>({})`;
  
c = c.replace(manualState, rqHooks);

// Clean fetchData
const oldFetchData = /const fetchData = async \(\) => \{[\s\S]*?finally \{\n\s*setLoading\(false\)\n\s*\}\n\s*\}/;
const newFetchData = `const fetchData = async () => {
      try {
        const [dFamilias, dSubfamilias, dProv, dIP] = await Promise.all([
          fetchAll('familias', 'nombre').then(data => data.filter((f: any) => f.grupo_sugerido !== 'rubro')),
          fetchAll('subfamilias', 'nombre'),
          supabase.from('proveedores').select('id, razon_social').order('razon_social', { ascending: true }).limit(10000).then(res => res.data || []),
          fetchAll('insumo_proveedores')
        ])
        
        if (dFamilias) {
          setFamilias(dFamilias)
          setExpandedFamilias(new Set(dFamilias.map((f: Familia) => f.id)))
        }
        if (dSubfamilias) setSubfamilias(dSubfamilias)
        if (dProv) setProveedores(dProv)
        if (dIP) {
          const map: Record<string, string[]> = {}
          dIP.forEach((ip: any) => {
            if (!map[ip.insumo_id]) map[ip.insumo_id] = []
            map[ip.insumo_id].push(ip.proveedor_id)
          })
          setInsumoProvMap(map)
        }
      } catch (e) {
        console.error(e)
      }
    }`;
c = c.replace(oldFetchData, newFetchData);


// Add react-hook-form Mutation for modal
// We replace the current form states
const oldFormState = /const \[isModalOpen, setIsModalOpen\] = useState\(false\)\n\s*const \[editingId, setEditingId\] = useState<string \| null>\(null\)\n\s*const \[saving, setSaving\] = useState\(false\)\n\s*const \[formData, setFormData\] = useState<any>\(\{.*?\}\)/s;

const formMutation = `
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register: registerNew, handleSubmit: handleNewSubmit, reset: resetNewForm, setValue: setNewValue, watch: watchNew, formState: { errors: newErrors, isSubmitting: isNewSubmitting } } = useForm<InsumoFormValues>({
    resolver: zodResolver(insumoSchema),
    defaultValues: { codigo: "", nombre: "", descripcion: "", unidad: "u", tipo: "material", precio_sin_iva: 0, proveedor_id: "", proveedores_ids: [], subfamilia_id: "", categoria: "" }
  });

  const formData = watchNew(); // For legacy compat with effect
  const setFormData = (updater: any) => {
     if(typeof updater === 'function') {
        const prev = watchNew();
        const next = updater(prev);
        Object.keys(next).forEach(k => setNewValue(k as any, next[k]));
     } else {
        Object.keys(updater).forEach(k => setNewValue(k as any, updater[k]));
     }
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
        const { proveedores_ids, ...restForm } = payload;
        const normalizedName = restForm.nombre.trim().toLowerCase();
        const existing = insumos.find(i => i.nombre.toLowerCase().trim() === normalizedName && i.id !== editingId);
        
        if (existing) {
          throw new Error("Ya existe un insumo con este nombre.");
        }

        const dbPayload = {
            ...restForm,
            proveedor_id: restForm.proveedor_id === "" ? null : restForm.proveedor_id,
            subfamilia_id: restForm.subfamilia_id === "" ? null : restForm.subfamilia_id,
            fecha_actualizacion: new Date().toISOString()
        };

        if (editingId) {
          const { error } = await supabase.from('insumos').update(dbPayload).eq('id', editingId)
          if (error) throw error;
          await supabase.from('insumo_proveedores').delete().eq('insumo_id', editingId)
          if (proveedores_ids && proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map((pid: string) => ({ insumo_id: editingId, proveedor_id: pid })))
        } else {
          const { data: newInsumo, error } = await supabase.from('insumos').insert([dbPayload]).select().single()
          if (error) throw error;
          if (proveedores_ids && proveedores_ids.length > 0) await supabase.from('insumo_proveedores').insert(proveedores_ids.map((pid: string) => ({ insumo_id: newInsumo.id, proveedor_id: pid })))
        }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      setIsModalOpen(false);
      setEditingId(null);
      resetNewForm();
    },
    onError: (err: any) => {
      alert(err.message || "Error al guardar el insumo.");
    }
  });

  const submitNewInsumo = (data: InsumoFormValues) => {
    createMutation.mutate(data);
  };
`;
c = c.replace(oldFormState, formMutation);

// Remove handleSubmit block
const oldHandleSubmit = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?console\.error\(error\) \}\n\s*\}\n\s*\}/;
c = c.replace(oldHandleSubmit, '');


// Replace form JSX
const formRegex = /<form onSubmit=\{handleSubmit\} className="p-6 space-y-4">[\s\S]*?<\/form>/;
const newForm = `<form onSubmit={handleNewSubmit(submitNewInsumo)} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo / Subgrupo</label>
                      <select {...registerNew("subfamilia_id")} onChange={e => {
                          const newSubId = e.target.value;
                          let newTipo = watchNew("tipo");
                          if (newSubId) {
                             const currentSub = subfamilias.find(s => s.id === newSubId);
                             const currentFam = familias.find(f => f.id === currentSub?.familia_id);
                             if (currentFam && currentFam.grupo_sugerido) {
                                newTipo = currentFam.grupo_sugerido;
                             }
                          }
                          setNewValue("subfamilia_id", newSubId);
                          setNewValue("tipo", newTipo);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage">
                        <option value="">— Sin subgrupo —</option>
                        {familias.map(fam => (
                          <optgroup key={fam.id} label={fam.nombre}>
                            {subfamilias.filter(s => s.familia_id === fam.id).map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código Generado</label>
                      <input type="text" {...registerNew("codigo")} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre del Insumo</label>
                    <input type="text" {...registerNew("nombre")} required className={\`w-full border rounded-lg px-3 py-2 text-sm outline-none \${newErrors.nombre ? 'border-red-500' : 'border-gray-300'}\`} placeholder="Ej: Cemento Portland 50kg..." />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label>
                      <input type="text" {...registerNew("unidad")} required className={\`w-full border rounded-lg px-3 py-2 text-sm outline-none \${newErrors.unidad ? 'border-red-500' : 'border-gray-300'}\`} placeholder="m, m2, m3, kg, u" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Precio Sin IVA</label>
                      <input type="number" step="0.01" min="0" {...registerNew("precio_sin_iva", { valueAsNumber: true })} required className={\`w-full border rounded-lg px-3 py-2 text-sm outline-none \${newErrors.precio_sin_iva ? 'border-red-500' : 'border-gray-300'}\`} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo</label>
                      <select {...registerNew("tipo")} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage bg-gray-50" disabled>
                        <option value="material">Materiales</option>
                        <option value="equipo">Equipos</option>
                        <option value="mano de obra">Mano de Obra</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                    <button type="submit" disabled={isNewSubmitting || createMutation.isPending} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors disabled:opacity-50">
                      {createMutation.isPending ? 'Guardando...' : (editingId ? 'Actualizar Insumo' : 'Registrar Insumo')}
                    </button>
                  </div>
                </form>`;

c = c.replace(formRegex, newForm);

// Invalidate on delete
c = c.replace(/await supabase\.from\('insumos'\)\.delete\(\)\.eq\('id', id\)\n\s*fetchData\(\)/g, "await supabase.from('insumos').delete().eq('id', id)\n      queryClient.invalidateQueries({ queryKey: ['insumos'] })");

fs.writeFileSync('src/app/admin/apus/insumos/page.tsx', c);
