import os

f = 'src/app/admin/ecosistema/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

target = """  useEffect(() => {
    loadEcosystemHealth()
  }, [])"""

new_effect = """  useEffect(() => {
    loadEcosystemHealth()

    const supabase = createClient()
    
    // Suscripción global a todas las tablas clave para mantener los números en vivo sin recargar
    const channel = supabase.channel('ecosistema_global_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proyectos' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cotizaciones' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios_sistema' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presupuestos_reales' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inmuebles' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'airbnb_alojamientos' }, () => loadEcosystemHealth())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'airbnb_reservas' }, () => loadEcosystemHealth())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])"""

c = c.replace(target, new_effect)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
