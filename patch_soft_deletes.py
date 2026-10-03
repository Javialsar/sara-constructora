import os
import re

directories = ['src/app/dashboard', 'src/app/admin']
tables_to_patch = ['clientes', 'proveedores', 'trabajadores', 'proyectos', 'presupuestos_reales']

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    for table in tables_to_patch:
        # Replace .delete() with .update({ deleted_at: new Date().toISOString() })
        pattern_delete = rf"\.from\(['\"]{table}['\"]\)\.delete\(\)"
        replacement_delete = f".from('{table}').update({{ deleted_at: new Date().toISOString() }})"
        content = re.sub(pattern_delete, replacement_delete, content)
        
        # Replace .select(...) with .select(...).is('deleted_at', null)
        # We only want to append .is('deleted_at', null) to .select() on these specific tables.
        # This regex looks for .from('table').select(...) and appends .is('deleted_at', null)
        # It's tricky because select might have nested newlines. We will use a simpler approach:
        # Just replace `.from('table').select(` with `.from('table').select(` and then find where select ends?
        # Actually, if we just chain it immediately before .select():
        # .from('table').select(...) -> .from('table').is('deleted_at', null).select(...)
        # Wait, PostgREST allows filtering before or after select. But Supabase JS prefers after select? No, anywhere in the chain.
        # But wait, `.from('table').select('*')` -> `.from('table').select('*').is('deleted_at', null)`
        
        # Let's find `.from('table').select("something")`
        # Regex: \.from\(['"]table['"]\)\.select\((.*?)\)
        # Wait, the select arg can contain parens.
        # Instead, just add `.is('deleted_at', null)` right after `.from('table')`? No, Supabase requires select() first usually? No, `from` returns a query builder, you can do `from('t').is('x', null).select()`. Wait, no, `select()` must be called to return the SelectQueryBuilder.
        pass
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                patch_file(os.path.join(root, file))
