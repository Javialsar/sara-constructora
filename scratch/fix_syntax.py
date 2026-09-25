import re

with open("src/app/admin/cotizador/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

c = re.sub(
    r"\s*=\s*await supabase\.from\('clientes'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\)\s*if \(data\) setClientes\(data\)\s*\}",
    "",
    c
)

with open("src/app/admin/cotizador/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
