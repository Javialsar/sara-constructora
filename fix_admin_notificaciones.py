import os

f = 'src/app/admin/layout.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Make sure Send icon is imported from lucide-react
if 'Send' not in c:
    c = c.replace('from "lucide-react"', ', Send } from "lucide-react"')

# Add to the PORTAL WEB group
target_group = """      {
        title: "PORTAL WEB",
        items: [
          { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
          { href: "/admin/faq", label: "Preguntas FAQ", icon: HelpCircle },
          { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote },
        ]
      },"""

new_group = """      {
        title: "PORTAL WEB",
        items: [
          { href: "/admin/centro-notificaciones", label: "Difusión Global", icon: Send },
          { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
          { href: "/admin/faq", label: "Preguntas FAQ", icon: HelpCircle },
          { href: "/admin/testimonios", label: "Testimonios", icon: MessageSquareQuote },
        ]
      },"""

c = c.replace(target_group, new_group)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
