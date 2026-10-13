import os
import json
import re
from supabase import create_client

# parse data.json
with open('data.json', 'rb') as f:
    content = f.read().decode('utf-16', errors='ignore')

# The content is a big JSON array dumped by console.log(JSON.stringify(..., null, 2))
# But since JSON.parse failed, maybe it's not valid JSON at the end?
# Let's extract reasonably formatted blocks.

matches = re.finditer(r'"razon_social":\s*"([^"]+)",[\s\S]*?"logo_url":\s*"([^"]+)"', content)
logo_map = {}
for m in matches:
    name = m.group(1).strip().lower()
    url = m.group(2).strip()
    if url and url != 'null':
        logo_map[name] = url

print(f"Recovered {len(logo_map)} logos from backup.")

if not logo_map:
    print("No logos found.")
    exit(0)

# Apply to DB
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

res = supabase.table('proveedores').select('id, razon_social').is_('user_id', 'null').execute()
count = 0
for row in res.data:
    name = row['razon_social'].strip().lower()
    if name in logo_map:
        print(f"Restoring logo for {name}")
        supabase.table('proveedores').update({'logo_url': logo_map[name]}).eq('id', row['id']).execute()
        count += 1

print(f"Successfully restored {count} logos to the database.")
