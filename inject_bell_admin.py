import os

f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Make sure GlobalNotificationsBell is imported
if 'GlobalNotificationsBell' not in c:
    c = c.replace('import { createClient } from "@/lib/supabase/client"', 'import { createClient } from "@/lib/supabase/client"\nimport GlobalNotificationsBell from "@/components/GlobalNotificationsBell"')

# Replace the fake bell with the real one
fake_bell = """            <button className="relative p-2 text-gray-500 hover:text-brand-dark transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>"""

real_bell = """            <GlobalNotificationsBell destinatarioTipo="admin" />"""

c = c.replace(fake_bell, real_bell)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
