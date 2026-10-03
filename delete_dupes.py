import os
import json
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

res = supabase.table("proveedores").select("*").is_("user_id", "null").execute()
data = res.data

seen = set()
duplicates = []

for row in data:
    name = row["razon_social"].strip().lower()
    if name in seen:
        duplicates.append(row["id"])
    else:
        seen.add(name)

print(f"Found {len(duplicates)} duplicates in global catalog.")

if duplicates:
    for dupe_id in duplicates:
        supabase.table("proveedores").delete().eq("id", dupe_id).execute()
    print("Duplicates deleted.")
