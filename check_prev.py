import re
code = open('prev_page.tsx', 'r', encoding='utf-8').read()

# I want to find the whole explosion code.
idx = code.find("activeTab === 'reportes'")
print(code[idx:idx+1500])
