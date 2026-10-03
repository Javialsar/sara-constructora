import os
import re

f = 'src/app/dashboard/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

if 'import Chatbot' not in c:
    c = c.replace('import ThemeToggle', 'import Chatbot from "@/components/ui/Chatbot"\nimport ThemeToggle')
    
    # inject at the end before closing main div
    c = re.sub(r'(</main>\s*</div>\s*\)\s*\})', r'  <Chatbot />\n      \1', c)
    
    with open(f, 'w', encoding='utf-8') as file: file.write(c)
    print("Injected Chatbot in dashboard")
