import codecs

path = 'src/app/admin/apus/rubros/page.tsx'
c = codecs.open(path, 'r', 'utf-8').read()

c = c.replace('<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">', 
              '<div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 border-t-4 border-t-brand-sage">')

c = c.replace('<thead className="bg-white">', '<thead className="bg-slate-50 text-slate-700">')
c = c.replace('<thead>', '<thead className="bg-slate-50 text-slate-700">')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(c)

print("Replaced in rubros")
