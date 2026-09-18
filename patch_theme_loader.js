const fs = require('fs');
const path = 'src/app/admin/layout.tsx';
let code = fs.readFileSync(path, 'utf8');

// Inject useEffect for theme
if (!code.includes("localStorage.getItem('sara_theme')")) {
  code = code.replace(
    /const \[userRole, setUserRole\] = useState\("Administrador"\)/,
    `const [userRole, setUserRole] = useState("Administrador")
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('sara_theme')
    if(savedTheme) {
      document.documentElement.classList.add(savedTheme)
    }
  }, [])`
  );
  fs.writeFileSync(path, code);
  console.log("Added theme loading to AdminLayout!");
}
