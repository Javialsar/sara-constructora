import re

with open('src/app/admin/presupuestos_reales/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add showFormulas state
if "const [showFormulas, setShowFormulas]" not in code:
    code = re.sub(
        r"(const \[indForm, setIndForm\] = useState[^\n]+)",
        r"\1\n  const [showFormulas, setShowFormulas] = useState(false)",
        code
    )

# Fix the toggle to use the state
code = code.replace(
    '<input type="checkbox" defaultChecked className="rounded text-brand-sage focus:ring-brand-sage"/> Visualizar frmulas',
    '<input type="checkbox" checked={showFormulas} onChange={e => setShowFormulas(e.target.checked)} className="rounded text-brand-sage focus:ring-brand-sage"/> Visualizar fórmulas'
)

# 1. Hide the formula elements
pattern1 = r'(<div className="w-24 text-center font-mono text-gray-400">.*?</div>\s*<div className="flex-1[^>]*>.*?</div>)'

code = re.sub(
    pattern1,
    r'{showFormulas && (\n                        <>\n                          \1\n                        </>\n                      )}',
    code
)

# 2. Add flex-1 to the result columns when showFormulas is false
# Find all `<div className="w-24 text-right pr-4 font-mono">` 
# and replace with `<div className={`text-right pr-4 font-mono ${showFormulas ? 'w-24' : 'flex-1'}`}>`
code = code.replace(
    '<div className="w-24 text-right pr-4 font-mono">',
    '<div className={`text-right pr-4 font-mono ${showFormulas ? "w-24" : "flex-1"}`}>'
)

with open('src/app/admin/presupuestos_reales/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Presupuestos reales patched successfully!")
