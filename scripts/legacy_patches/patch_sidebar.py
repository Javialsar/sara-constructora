import os

filepath = 'src/app/admin/layout.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure DollarSign is imported
if 'DollarSign' not in content:
    content = content.replace('CreditCard,', 'CreditCard, DollarSign,')

# Wait, the word might have funny encoding: "Planes de Suscripción" or "Planes de Suscripcin"
# I will just match "/admin/apus/planes"
import re
content = re.sub(
    r'(\{\s*href:\s*"/admin/apus/planes".*?\},?)',
    r'\1\n        { href: "/admin/pagos", label: "Aprobación de Pagos", icon: DollarSign },',
    content
)

# the technical user shouldn't see it maybe?
content = re.sub(
    r'(i\.href !== \'/admin/apus/rubros\' &&)',
    r'\1\n                    i.href !== \'/admin/pagos\' &&',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Sidebar updated")
