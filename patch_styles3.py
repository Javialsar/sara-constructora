import codecs

path = 'src/app/admin/presupuestos_reales/page.tsx'
c = codecs.open(path, 'r', 'utf-8').read()

c = c.replace('<div className="bg-white rounded-xl shadow-sm border mb-6">', 
              '<div className="bg-white rounded-xl shadow-md border-gray-200 border-t-4 border-t-brand-sage mb-6">')

c = c.replace('<thead className="bg-white text-gray-500 font-bold uppercase text-xs border-b">', 
              '<thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b">')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(c)

print("Replaced in presupuestos")
