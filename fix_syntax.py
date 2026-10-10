with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
"""                </div>
              </div>

            {/* TAB: HISTORIAL */}""",
"""                </div>
              </div>
            )}

            {/* TAB: HISTORIAL */}""")

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
