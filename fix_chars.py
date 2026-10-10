import os

files = [
    'src/components/admin/fletes/AnalyticsDashboard.tsx',
    'src/components/admin/fletes/GlobalMap.tsx',
    'src/components/admin/fletes/PlanManager.tsx'
]

replacements = {
    'PǸrez': 'Pérez',
    'Gmez': 'Gómez',
    'Sǭb': 'Sáb',
    'MiǸ': 'Mié',
    'sltimos': 'Últimos',
    'Das': 'Días',
    'Analtico': 'Analítico',
    'mǸtricas': 'métricas',
    'Estǭndar': 'Estándar',
    'Bǭsico': 'Básico',
    'Configuracin': 'Configuración'
}

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        for k, v in replacements.items():
            content = content.replace(k, v)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
