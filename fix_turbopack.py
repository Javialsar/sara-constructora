import os

f = 'next.config.ts'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

c = c.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  turbopack: {},\n')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
