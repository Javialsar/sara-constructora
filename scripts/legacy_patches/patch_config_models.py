import os
import re

def patch_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {filepath}")

patch_file('src/lib/services/logosService.ts', [
    (
        "export interface LogosEmpresa {\n  constructora: string\n  inmobiliaria: string\n  stays: string\n}",
        "export interface LogosEmpresa {\n  constructora: string\n  inmobiliaria: string\n  stays: string\n  apu: string\n}"
    ),
    (
        "export const DEFAULT_LOGOS_EMPRESA: LogosEmpresa = {\n  constructora: \"/logo-hero.png\",\n  inmobiliaria: \"/sara-inmobiliaria.png\",\n  stays: \"/sara-stays.png\",\n}",
        "export const DEFAULT_LOGOS_EMPRESA: LogosEmpresa = {\n  constructora: \"/logo-hero.png\",\n  inmobiliaria: \"/sara-inmobiliaria.png\",\n  stays: \"/sara-stays.png\",\n  apu: \"/logo-hero.png\",\n}"
    ),
    (
        "stays: json.logos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n          }",
        "stays: json.logos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n            apu: json.logos.apu || DEFAULT_LOGOS_EMPRESA.apu,\n          }"
    ),
    (
        "stays: dbLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n      }",
        "stays: dbLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n        apu: dbLogos.apu || DEFAULT_LOGOS_EMPRESA.apu,\n      }"
    )
])

patch_file('src/app/api/configuracion/logos/route.ts', [
    (
        "stays: dbLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n      }",
        "stays: dbLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n        apu: dbLogos.apu || DEFAULT_LOGOS_EMPRESA.apu,\n      }"
    ),
    (
        "stays: body.stays?.trim() || currentLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n    }",
        "stays: body.stays?.trim() || currentLogos.stays || DEFAULT_LOGOS_EMPRESA.stays,\n      apu: body.apu?.trim() || currentLogos.apu || DEFAULT_LOGOS_EMPRESA.apu,\n    }"
    )
])

patch_file('src/lib/services/datosBancariosService.ts', [
    (
        "correoComprobantes?: string\n  activa?: boolean\n}",
        "correoComprobantes?: string\n  activa?: boolean\n  qrUrl?: string\n}"
    )
])
