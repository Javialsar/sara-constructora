import os
import re

f = 'src/app/layout.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

target_meta = """export const metadata: Metadata = {
  title: "SARA Constructora | Arquitectura e Ingeniería",
  description: "Diseñamos ideas. Construimos futuro. Especialistas en proyectos de ingeniería civil y diseño arquitectónico.",
  keywords: "SARA Constructora, Constructora Cariamanga, Constructora en Cariamanga, Constructora Loja, Arquitectura Cariamanga, Arquitectos Cariamanga, Ingeniería Civil Cariamanga, Ingeniería Civil Loja",
};"""

replacement_meta = """export const metadata: Metadata = {
  title: "SARA Constructora | Arquitectura e Ingeniería",
  description: "Diseñamos ideas. Construimos futuro. Especialistas en proyectos de ingeniería civil y diseño arquitectónico.",
  keywords: "SARA Constructora, Constructora Cariamanga, Constructora en Cariamanga, Constructora Loja, Arquitectura Cariamanga, Arquitectos Cariamanga, Ingeniería Civil Cariamanga, Ingeniería Civil Loja",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SARA",
  },
};"""

if 'manifest: "/manifest.json"' not in c:
    # Need a more robust replace for metadata in case characters changed
    c = re.sub(r'export const metadata: Metadata = \{.*?\};', replacement_meta, c, flags=re.DOTALL)

with open(f, 'w', encoding='utf-8') as file: file.write(c)
