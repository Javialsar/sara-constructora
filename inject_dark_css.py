import os

f = 'src/app/globals.css'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

dark_css = """
/* MODO OSCURO GLOBAL (Inversión de colores de Tailwind) */
html.dark {
  --background: #020617; /* Slate 950 */
  --foreground: #f8fafc; /* Slate 50 */
  
  --color-sara-white: #0f172a; /* Slate 900 */
  --color-sara-light: #1e293b; /* Slate 800 */
  --color-sara-black: #f8fafc; /* Slate 50 */

  /* Override Tailwind Colors for Dark Mode */
  --color-white: #0f172a;
  --color-black: #ffffff;
  
  /* Invert Grays (Slate) */
  --color-gray-50: #1e293b;
  --color-gray-100: #334155;
  --color-gray-200: #475569;
  --color-gray-300: #64748b;
  --color-gray-400: #94a3b8;
  --color-gray-500: #cbd5e1;
  --color-gray-600: #e2e8f0;
  --color-gray-700: #f1f5f9;
  --color-gray-800: #f8fafc;
  --color-gray-900: #ffffff;

  /* Invert borders */
  --color-gray-200: #334155;
  
  /* Background grid override */
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px) !important;
}
"""

if "html.dark {" not in c:
    c += dark_css
    with open(f, 'w', encoding='utf-8') as file:
        file.write(c)
