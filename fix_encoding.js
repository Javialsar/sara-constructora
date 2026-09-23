const fs = require('fs');
const path = require('path');

function fixEncoding(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const replacements = {
        'AutomÃ¡tico': 'Automático',
        'ConfiguraciÃ³n': 'Configuración',
        'consultorÃa': 'consultoría',
        'proyecciÃ³n': 'proyección',
        'paramÃ©trica': 'paramétrica',
        'DiseÃ±o': 'Diseño',
        'AÃ±adir': 'Añadir',
        'MÃ¡s': 'Más',
        'EstÃ¡ndar': 'Estándar',
        'Ãº': 'ú',
        'Ã³': 'ó',
        'Ã©': 'é',
        'Ã¡': 'á',
        'Ã­': 'í',
        'Ã±': 'ñ',
        'Ã ': 'Á',
        'Ã“': 'Ó',
        'Ã‰': 'É',
        'Ã ': 'Í',
        'Ãš': 'Ú'
    };

    let modified = false;
    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed encoding in:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            fixEncoding(fullPath);
        }
    }
}

walkDir('src/app');
