import os

f = 'src/app/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

c = c.replace('import type { Metadata } from "next";', 'import type { Metadata, Viewport } from "next";')

viewport_str = """
export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};
"""

if 'export const viewport' not in c:
    c = c.replace('export const metadata: Metadata = {', viewport_str + '\nexport const metadata: Metadata = {')

# Remove the old manifest.json reference
c = c.replace('    manifest: "/manifest.json",\n', '')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
