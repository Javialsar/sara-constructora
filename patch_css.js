const fs = require('fs');
const path = 'src/app/globals.css';
let css = fs.readFileSync(path, 'utf8');

const newThemes = `

/* Temas Dinámicos */
:root.theme-ocean {
  --color-sara-dark: #1e293b;
  --color-sara-sage: #3b82f6;
  --color-sara-black: #0f172a;
}

:root.theme-gold {
  --color-sara-dark: #171717;
  --color-sara-sage: #d4af37;
  --color-sara-black: #000000;
}

:root.theme-apucons {
  --color-sara-dark: #333333;
  --color-sara-sage: #ffcc00;
  --color-sara-black: #000000;
}
`;

if (!css.includes("/* Temas Dinámicos */")) {
  css += newThemes;
  fs.writeFileSync(path, css);
  console.log("Themes added to globals.css");
}
