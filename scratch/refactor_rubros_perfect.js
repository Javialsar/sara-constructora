const fs = require('fs');

let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// 1. Imports
if (!c.includes('useQuery')) {
  c = c.replace('import { useState, useEffect } from "react"', 
    'import { useState, useEffect } from "react";\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";\nimport * as z from "zod";');
}

// 2. Schema
const schemaStr = `
const rubroSchema = z.object({
  codigo: z.string().min(2, "Requerido"),
  nombre: z.string().min(3, "Requerido"),
  unidad: z.string().min(1, "Requerido"),
  herramienta_menor_pct: z.number().min(0, "No negativo"),
  subfamilia_id: z.string().optional(),
  familia_id_temp: z.string().optional()
});
type RubroFormValues = z.infer<typeof rubroSchema>;
`;
if (!c.includes('const rubroSchema')) {
  c = c.replace('export default function RubrosPage() {', schemaStr + '\nexport default function RubrosPage() {');
}

// 3. queryClient (inside RubrosPage)
if(!c.includes('const queryClient = useQueryClient();')) {
    c = c.replace('export default function RubrosPage() {\n  const [vista', 'export default function RubrosPage() {\n  const queryClient = useQueryClient();\n  const [vista');
}


// 4. State replacements
const manualState = 'const [rubros, setRubros] = useState<any[]>([])\n  const [loading, setLoading] = useState(true)';
const rqHooks = `
  const { data: rubros = [], isLoading: loading } = useQuery({
    queryKey: ['rubros'],
    queryFn: async () => {
      const data = await fetchAll('rubros');
      return data ? data.sort((a: any,b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];
    }
  });
`;
c = c.replace(manualState, rqHooks);


// 5. fetchRubros rewrite
const oldFetchRubros = /const fetchRubros = async \(\) => \{[\s\S]*?setLoading\(false\)\s*\}/;
const newFetchRubros = `const fetchRubros = async () => {
    const [dFam, dSub, dFamIns] = await Promise.all([
      fetchAll('familias', {col:'grupo_sugerido', val:'rubro'}), fetchAll('subfamilias'), fetchAll('familias')
    ])
    if (dFamIns) setFamiliasInsumo(dFamIns.filter((f:any) => f.grupo_sugerido !== 'rubro').sort((a:any,b:any) => a.nombre.localeCompare(b.nombre)))
    if (dFam) { 
      dFam.sort((a:any,b:any)=>a.nombre.localeCompare(b.nombre)); 
      setFamilias(dFam); 
      setExpandedFamilias(new Set(dFam.map((f:any)=>f.id))) 
    }
    if (dSub) setSubfamilias(dSub.sort((a:any,b:any)=>a.nombre.localeCompare(b.nombre)))
  }`;
c = c.replace(oldFetchRubros, newFetchRubros);


// 6. Form setup & Mutation
const oldNewRubroData = /const \[newRubroData, setNewRubroData\] = useState<any>\(\{[\s\S]*?\}\)/;
const formMutation = `
  const createMutation = useMutation({
    mutationFn: async (values: RubroFormValues) => {
      const payload = { ...values, subfamilia_id: values.subfamilia_id || null }; 
      delete (payload as any).familia_id_temp;
      const { data, error } = await supabase.from('rubros').insert([payload]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rubros'] });
      setIsNewModalOpen(false);
      openEditor(data);
      resetNewForm();
    },
    onError: () => {
      alert("Error al crear el rubro. Revisa que el código no esté duplicado.");
    }
  });

  const { register: registerNew, handleSubmit: handleNewSubmit, reset: resetNewForm, formState: { errors: newErrors, isSubmitting: isNewSubmitting }, setValue: setNewValue, watch: watchNew } = useForm<RubroFormValues>({
    resolver: zodResolver(rubroSchema),
    defaultValues: { codigo: '', nombre: '', unidad: 'm3', herramienta_menor_pct: 5.0, subfamilia_id: '', familia_id_temp: '' }
  });

  const submitNewRubro = (data: RubroFormValues) => {
    createMutation.mutate(data);
  };
`;
c = c.replace(oldNewRubroData, formMutation);


// 7. Remove handleCreateRubro
const handleCreateRegex = /const handleCreateRubro = async \(e: React\.FormEvent\) => \{[\s\S]*?else \{ alert\("Error al crear el rubro\. Revisa que el cdigo no estǸ duplicado\."\) \}\s*\}/;
c = c.replace(handleCreateRegex, '');
// Fallback for special chars
const handleCreateRegex2 = /const handleCreateRubro = async \(e: React\.FormEvent\) => \{[\s\S]*?\}\n\s*const handleDeleteRubro/;
c = c.replace(handleCreateRegex2, 'const handleDeleteRubro');


// 8. Replace form JSX
const formJsxRegex = /<form onSubmit=\{handleCreateRubro\} className="p-5 space-y-4">[\s\S]*?<\/form>/;
const newFormJsx = `<form onSubmit={handleNewSubmit(submitNewRubro)} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Grupo</label>
                  <select required {...registerNew("familia_id_temp")} onChange={e => {
                    const famId = e.target.value;
                    let targetSubId = '';
                    if (famId) {
                      const subs = subfamilias.filter((sf:any) => sf.familia_id === famId);
                      if (subs.length > 0) targetSubId = subs[0].id;
                    }
                    setNewValue('familia_id_temp', famId);
                    setNewValue('subfamilia_id', targetSubId);
                  }} className={\`w-full border rounded-lg px-3 py-2 outline-none \${newErrors.familia_id_temp ? 'border-red-500' : 'border-gray-300'}\`}>
                    <option value="" disabled>-- Seleccione Grupo --</option>
                    {familias.filter((f:any) => f.grupo_sugerido === 'rubro').map((f:any) => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Subgrupo (Opcional)</label>
                  <select {...registerNew("subfamilia_id")} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none">
                    <option value="">-- Sin Subgrupo --</option>
                    {subfamilias.filter((sf:any) => sf.familia_id === watchNew('familia_id_temp')).map((sf:any) => (
                      <option key={sf.id} value={sf.id}>{sf.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Código</label>
                    <input type="text" {...registerNew("codigo")} className={\`w-full border rounded-lg px-3 py-2 outline-none \${newErrors.codigo ? 'border-red-500' : 'border-gray-300'}\`} placeholder="EJ: MAM-2005" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Herr. Menor (%)</label>
                    <input type="number" step="0.1" {...registerNew("herramienta_menor_pct", { valueAsNumber: true })} className={\`w-full border rounded-lg px-3 py-2 outline-none \${newErrors.herramienta_menor_pct ? 'border-red-500' : 'border-gray-300'}\`} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Descripción / Nombre</label>
                  <textarea {...registerNew("nombre")} rows={2} className={\`w-full border rounded-lg px-3 py-2 outline-none \${newErrors.nombre ? 'border-red-500' : 'border-gray-300'}\`} placeholder="Pared de bloque vibrado e=10cm..." required></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unidad</label>
                  <input type="text" {...registerNew("unidad")} className={\`w-full border rounded-lg px-3 py-2 outline-none \${newErrors.unidad ? 'border-red-500' : 'border-gray-300'}\`} placeholder="m3, m2, ml, glb" required />
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button type="submit" disabled={isNewSubmitting || createMutation.isPending} className="px-4 py-2 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage transition-colors">
                    {createMutation.isPending ? 'Creando...' : 'Crear Rubro'}
                  </button>
                </div>
              </form>`;
c = c.replace(formJsxRegex, newFormJsx);


// 9. Fix setNewRubroData calls
c = c.replace(/setNewRubroData\(\{[\s\S]*?\}\);/g, 'resetNewForm();');

// 10. Fix invalidate on delete
c = c.replace(/if \(currentRubro && currentRubro\.id === id\) \{ setCurrentRubro\(null\); setRubroInsumos\(\[\]\); setIsEditorOpen\(false\); \}\s*fetchRubros\(\)/g, 
  "if (currentRubro && currentRubro.id === id) { setCurrentRubro(null); setRubroInsumos([]); setIsEditorOpen(false); }\n      queryClient.invalidateQueries({ queryKey: ['rubros'] });");

// 11. Remove setRubros where used directly (filter operations, etc.)
c = c.replace(/setRubros\(/g, '// setRubros(');


fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
