import re

with open("src/app/admin/apus/rubros/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# Replace the manual rubros state with useQuery
old_state = """  const supabase = createClient()
  
  const [rubros, setRubros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)"""

new_state = """  const supabase = createClient()
  
  const { data: rubros = [], isLoading: loading } = useQuery({
    queryKey: ['rubros'],
    queryFn: async () => {
      const { data } = await supabase.from('rubros').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  });"""

c = c.replace(old_state, new_state)

with open("src/app/admin/apus/rubros/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
