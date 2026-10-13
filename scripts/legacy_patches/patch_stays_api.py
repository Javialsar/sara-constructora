import re

with open('src/app/api/airbnb/reserva/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add comprobanteUrl to destructured body
content = content.replace(
    'peticionesEspeciales\n    } = body',
    'peticionesEspeciales,\n      comprobanteUrl\n    } = body'
)

# 2. Add comprobante_url to reservaDetalle
content = content.replace(
    'peticiones_especiales: peticionesEspeciales || "",',
    'peticiones_especiales: peticionesEspeciales || "",\n      comprobante_url: comprobanteUrl || null,'
)

with open('src/app/api/airbnb/reserva/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied to API route.")
