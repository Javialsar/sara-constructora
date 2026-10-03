import os

f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Make sure Activity and Bell are imported
if 'Activity' not in c:
    c = c.replace('from "lucide-react"', ', Activity, Bell } from "lucide-react"')
    c = c.replace('} from "lucide-react"', ' from "lucide-react"')

new_group = """      {
        title: "PANEL PRINCIPAL",
        items: [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/ecosistema", label: "Salud Ecosistema", icon: Activity },
        ]
      },"""

c = c.replace("""      {
        title: "PANEL PRINCIPAL",
        items: [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        ]
      },""", new_group)

# Add Bell icon to header
bell_icon = """          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-brand-dark transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>"""

c = c.replace('<div className="flex items-center gap-4">', bell_icon)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
