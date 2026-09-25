import re

with open("src/app/admin/cotizador/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("await supabase.from('parametros_globales').update(params).eq('id', 1)", 
              "await supabase.from('parametros_globales').update(params as any).eq('id', 1)")

with open("src/app/admin/cotizador/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
