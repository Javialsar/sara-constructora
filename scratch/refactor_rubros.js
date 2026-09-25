const fs = require('fs');

let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

// Inject Query Client
if (!c.includes('const queryClient = useQueryClient()')) {
  c = c.replace('const supabase = createClient()', 'const supabase = createClient()\n  const queryClient = useQueryClient();');
}

// React Query hooks for fetching
const rqHooks = `
  const { data: qRubros = [], isLoading: loading } = useQuery({
    queryKey: ['rubros'],
    queryFn: async () => {
      const data = await fetchAll('rubros');
      return data ? data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];
    }
  });

  const rubros = qRubros; // alias to match existing code
`;

c = c.replace('const [rubros, setRubros] = useState<any[]>([])', '');
c = c.replace('const [loading, setLoading] = useState(true)', rqHooks);

// Mutation for Nuevo Rubro
const newFormHooks = `
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

c = c.replace(`  const [newRubroData, setNewRubroData] = useState<any>({
    codigo: '', nombre: '', categoria: '', unidad: 'm3', herramienta_menor_pct: 5.0
  })`, newFormHooks);

// Replace form JSX
const oldFormRegex = /<form onSubmit=\{handleCreateRubro\} className="p-5 space-y-4">[\s\S]*?<\/form>/;

const newForm = `<form onSubmit={handleNewSubmit(submitNewRubro)} className="p-5 space-y-4">
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

c = c.replace(oldFormRegex, newForm);

// Also remove manual fetchRubros invocation
c = c.replace(`if (currentRubro && currentRubro.id === id) { setCurrentRubro(null); setRubroInsumos([]); setIsEditorOpen(false); }
    fetchRubros()`, `if (currentRubro && currentRubro.id === id) { setCurrentRubro(null); setRubroInsumos([]); setIsEditorOpen(false); }
    queryClient.invalidateQueries({ queryKey: ['rubros'] })`);

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
