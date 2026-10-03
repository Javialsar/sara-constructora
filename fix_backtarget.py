import os

f = 'src/app/(public)/stays/auth/page.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

old_code = """  const backTarget = returnContext.stayId && returnContext.action === "reservar"
    ? `/stays?stayId=${returnContext.stayId}&action=reservar`
    : returnContext.redirect || "/stays" """

# Let's just use regex because whitespace
import re
c = re.sub(r'const backTarget = returnContext\.stayId .*?: returnContext\.redirect \|\| "/stays"', 'const backTarget = returnContext.stayId && returnContext.action === "reservar"\n    ? `/stays?stayId=${returnContext.stayId}&action=reservar`\n    : "/stays"', c, flags=re.DOTALL)


with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
