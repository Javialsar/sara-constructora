import re

with open('src/app/admin/cotizador/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I injected:
#                      <span className="text-brand-dark">${(resultados?.desgloseObra?.extras || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
#                    </div>
#                  </div>
#                </div>
#
# I need to change the 3 closing divs to just 2.

code = code.replace(
"""<span className="text-brand-dark">${(resultados?.desgloseObra?.extras || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>""",
"""<span className="text-brand-dark">${(resultados?.desgloseObra?.extras || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>"""
)

with open('src/app/admin/cotizador/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
