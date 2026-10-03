import os
import re

f = 'src/app/dashboard/marca/page.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

# 1. Add geocoding state and useEffect
geocoding_logic = """
  const [isSearchingMap, setIsSearchingMap] = useState(false)

  // Geocoding effect
  useEffect(() => {
    if (!formData.direccion || formData.direccion.length < 4) return;
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingMap(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.direccion)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        }
      } catch (err) {
        console.error("Geocoding error", err)
      } finally {
        setIsSearchingMap(false)
      }
    }, 1500) // 1.5 second debounce

    return () => clearTimeout(delayDebounceFn)
  }, [formData.direccion])
"""

if 'isSearchingMap' not in c:
    # Insert right before useEffect for initialization
    c = c.replace('  useEffect(() => {', geocoding_logic + '\n  useEffect(() => {', 1)

# 2. Add visual feedback on the map header
if 'setIsSearchingMap' in geocoding_logic:
    c = c.replace('<h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">',
                  '<h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">')
    
    c = c.replace('<Map size={20} className="text-indigo-500"/> Geolocalización de Oficinas\n            </h2>',
                  '<Map size={20} className="text-indigo-500"/> Geolocalización de Oficinas {isSearchingMap && <span className="text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">Buscando...</span>}\n            </h2>')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
