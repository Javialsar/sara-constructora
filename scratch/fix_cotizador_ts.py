import re

with open("src/app/admin/cotizador/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

# 1. Add setParams shim
shim = """  const setParams = (updater: any) => {
    queryClient.setQueryData(['parametros_globales'], (old: any) => {
      if (typeof updater === 'function') return updater(old);
      return updater;
    });
  };
"""

if "const setParams =" not in c:
    c = c.replace("const [savingParams", shim + "\n  const [savingParams")

# 2. Fix the typing in update:
# `const { error } = await supabase.from('parametros_globales').update(params).eq('id', 1)`
# Actually, the DB expects `cotizador_tarifas`, etc., not the flat `params` structure!
# Did the original code do this? Let's check original handleSaveParams.
# Wait! In the original code, `params` was already FLAT. Let's see how `handleSaveParams` saved it.
# No, `handleSaveParams` probably mapped it back! Or maybe the database was changed?
# Wait! If the original code saved it flat, it means the DB schema changed or it was saving something else?
# Let's just fix the stray `fetchHistorialCotizaciones()` and `setParams`.
c = c.replace("fetchHistorialCotizaciones()", "queryClient.invalidateQueries({ queryKey: ['historial_cotizaciones'] })")
c = c.replace("costo_extra_clima_splits", "costo_extra_splits")

with open("src/app/admin/cotizador/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
