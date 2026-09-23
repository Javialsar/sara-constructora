import re

with open('src/app/admin/apus/rubros/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove strict height limits from the main wrapper, allow natural scrolling
content = content.replace('className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 bg-gray-50/50 overflow-hidden"', 'className="flex flex-col min-h-screen p-4 md:p-6 bg-gray-50/50"')
content = content.replace('className="flex flex-col flex-1 gap-4 overflow-hidden min-h-0"', 'className="flex flex-col flex-1 gap-6"')

# 2. Fix the upper panels to have exactly enough height for 10 rows without internal scroll on the table
# We change it to a fixed height of approx 520px so 10 rows fit perfectly.
content = content.replace('className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden min-h-[400px]"', 'className="flex flex-col md:flex-row gap-4 h-[550px] shrink-0"')

# Make the right panel's table container not overflow so it shows all 10 items
content = content.replace('className="flex-1 overflow-auto"', 'className="flex-1 overflow-hidden flex flex-col justify-between"')
content = content.replace('className="w-full text-sm text-left divide-y divide-gray-200"', 'className="w-full text-sm text-left divide-y divide-gray-200 h-full"')

# 3. Fix the bottom panel: Remove height restriction and overflow hidden so it renders full height
content = content.replace('className="h-[40%] md:h-[35%] bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage flex flex-col overflow-hidden shrink-0"', 'className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage flex flex-col shrink-0"')

# Remove overflow from the APU table container
content = content.replace('className="flex flex-col h-full overflow-hidden"', 'className="flex flex-col h-full"')
content = content.replace('className="flex-1 overflow-auto custom-scrollbar"', 'className="flex-1"')

with open('src/app/admin/apus/rubros/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Scroll patched successfully")
