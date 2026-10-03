import os
import re

f = 'src/app/dashboard/marca/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# Quitar importaciones erróneas de dynamic leaflet
c = re.sub(r'// Componente de Mapa importado dinámicamente.*?function LocationMarker.*?return position === null \? null : <Marker position=\{position\} icon=\{DefaultIcon\} />\n}', 
'''// Importamos el componente mapa entero dinámicamente para evitar SSR
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false })''', c, flags=re.DOTALL)

# Cambiar el render del mapa
c = re.sub(r'<MapContainer.*?/MapContainer>', '<MapComponent position={position} setPosition={setPosition} />', c, flags=re.DOTALL)

with open(f, 'w', encoding='utf-8') as file: file.write(c)
