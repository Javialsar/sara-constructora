const fs = require('fs');

let c = fs.readFileSync('src/app/admin/apus/rubros/page.tsx', 'utf-8');

const regex = /const \[newRubroData, setNewRubroData\] = useState<any>\(\{[\s\S]*?\}\)/;

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

c = c.replace(regex, newFormHooks);
c = c.replace(/setNewRubroData\(\{[\s\S]*?\}\);/g, 'resetNewForm();');

fs.writeFileSync('src/app/admin/apus/rubros/page.tsx', c);
