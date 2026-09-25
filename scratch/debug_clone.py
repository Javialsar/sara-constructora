import re

with open("src/app/admin/presupuestos_reales/page.tsx", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    'alert("Ocurrió un error al clonar el presupuesto. Revisa la consola.");',
    'alert("Error clonando: " + (error?.message || JSON.stringify(error) || "Desconocido"));'
)
c = c.replace(
    '} catch (error) {',
    '} catch (error: any) {'
)
with open("src/app/admin/presupuestos_reales/page.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("SUCCESS")
