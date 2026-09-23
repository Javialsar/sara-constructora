import os
import re

for root, dirs, files in os.walk('src/app/admin'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                c = f.read()

            # Fix Card Containers
            c = re.sub(r'bg-white p-6 rounded-xl shadow-sm border border-gray-100', 
                       r'bg-white p-6 rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage', c)
            c = re.sub(r'bg-white p-4 rounded-xl shadow-sm border border-gray-100', 
                       r'bg-white p-4 rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage', c)
            
            c = re.sub(r'bg-white rounded-xl shadow-sm border mb-6', 
                       r'bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage mb-6', c)
            
            c = re.sub(r'bg-white rounded-xl shadow-sm border border-gray-100',
                       r'bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage', c)

            # Fix thead
            c = re.sub(r'<thead className="bg-white([^"]*)">', r'<thead className="bg-slate-100 text-slate-700 border-b border-gray-200">', c)
            c = re.sub(r'<thead className="bg-gray-50([^"]*)">', r'<thead className="bg-slate-100 text-slate-700 border-b border-gray-200">', c)
            c = re.sub(r'<thead className="bg-gray-100([^"]*)">', r'<thead className="bg-slate-100 text-slate-700 border-b border-gray-200">', c)
            
            # Ensure tables have clean borders
            c = re.sub(r'<table className="([^"]*)">', lambda m: '<table className="' + m.group(1).replace('divide-y', '') + ' divide-y divide-gray-200">', c)

            # Zebra striping for table rows that just have hover:bg-gray-50
            c = re.sub(r'<tr className="hover:bg-gray-50">', r'<tr className="hover:bg-brand-sage/5 even:bg-slate-50 border-b border-gray-100 transition-colors">', c)
            c = re.sub(r'<tr className="hover:bg-gray-50 cursor-pointer">', r'<tr className="hover:bg-brand-sage/10 even:bg-slate-50 cursor-pointer border-b border-gray-100 transition-colors">', c)

            with open(path, 'w', encoding='utf-8') as f:
                f.write(c)

print("Applied table styling to all admin modules")
